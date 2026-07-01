// =====================================================
// 정통사주 결과지 생성 + 저장 API (장별 온디맨드)
// =====================================================
// POST {name,date,time,calendar,gender,email}  → 명식 + 1장 풀이 생성·저장 → {resultId, view, content, ...}
// POST {id, chapter}                            → 그 장만 생성·병합 → {content}
// GET  ?id=<resultId>                           → 저장된 {view, content, name, birth}
//   장을 열 때 그 장만 생성하므로 한 호출이 짧아 Vercel 타임아웃에 안전.

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import {
  isSajuApiConfigured,
  fetchSajuAnalysis,
  formatSajuToManseryeok,
  type BirthInfo,
} from "@/lib/saju/saju-api";
import { buildMyeongsikView, applyLocalSinsal } from "@/lib/saju/myeongsik-view";
import { buildChapterPrompt, parseContentJson, isChapterReady, CHAPTER_SECTIONS, buildSajuImagePrompt, buildCompatDescPrompt, type DescRankData } from "@/lib/saju/report-content";
import { generateInterpretation, generateSajuImage } from "@/lib/saju/llm";
import { parseDate, parseTimeVal, parseCalendar } from "@/lib/saju/local-manseryeok";
import { serverEnv } from "@/lib/env";
import { sendOrderSms, sendOrderEmail } from "@/lib/order-notifications";

export const maxDuration = 300;

const PRODUCT_SLUG = "saju_health";
const PRODUCT_NAME = "건강운사주";
const PRODUCT_PRICE = 24900;
const REPORT_PATH = "saju/saju_health/report-preview";

const createSchema = z.object({
  name: z.string().optional().default(""),
  date: z.string().min(1),
  time: z.string().optional().default(""),
  calendar: z.string().optional().default("양력"),
  gender: z.string().optional().default(""),
  email: z.string().optional().default(""),
});
const chapterSchema = z.object({ id: z.string().min(1), chapter: z.number().int().min(1).max(30), force: z.boolean().optional().default(false) });

// 한 장 생성 (JSON 모드 + 출력 검증 + 1회 재시도). 실패 시 throw.
async function genChapterContent(chapter: number, input: { name: string; gender: "male" | "female"; manseryeokText: string; pillars?: { pos: string; gan: string; ganEl: string; ji: string; jiEl: string; sipTop: string; sipBot: string; sinsal?: string }[]; birthYear?: number }) {
  const { system, user, compatTags, ch6RankData, ch6Pillars } = buildChapterPrompt(chapter, input);
  let meta = { provider: "", model: "" };
  for (let i = 0; i < 3; i++) {
    try {
      const llm = await generateInterpretation({ system, user, json: true });
      meta = { provider: llm.provider, model: llm.model };
      let obj: Record<string, unknown>;
      try {
        obj = parseContentJson(llm.text);
      } catch (parseErr) {
        console.error(`[saju_health] ${chapter}장 JSON파싱실패 (시도${i+1}):`, parseErr instanceof Error ? parseErr.message : String(parseErr), '\nRAW:', llm.text.slice(0, 300));
        // 16장(편지): JSON 파싱 실패시 텍스트를 paragraphs로 fallback
        if (chapter === 14) {
          const paras = llm.text.trim().split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
          obj = { letter: { paragraphs: paras.length > 0 ? paras : [llm.text.trim()] } };
        } else {
          continue;
        }
      }
      // 6장: 서버 계산된 tags + pillars를 LLM 결과에 덮어씌우기
      if (Array.isArray((obj as Record<string,unknown>).compatibleJuju)) {
        const cj = (obj as Record<string,unknown>).compatibleJuju as Record<string,unknown>[];
        if (compatTags) compatTags.forEach((tags, idx) => { if (cj[idx]) cj[idx].tags = tags; });
        if (ch6Pillars) ch6Pillars.forEach((p, idx) => { if (cj[idx]) cj[idx].pillars = p; });
      }
      // 6장: desc를 각 순위별 별도 호출로 생성 (정확도 보장)
      if (chapter === 6 && ch6RankData && ch6RankData.length > 0 && Array.isArray((obj as Record<string,unknown>).compatibleJuju)) {
        const cj = (obj as Record<string,unknown>).compatibleJuju as Record<string,unknown>[];
        const personLabel = input.gender === "male" ? "이 여자는" : "이 남자는";
        const honor = input.name;
        await Promise.all(ch6RankData.map(async (rankData: DescRankData, idx: number) => {
          if (!cj[idx]) return;
          const { system: ds, user: du } = buildCompatDescPrompt(idx, honor, personLabel, rankData, system);
          for (let r = 0; r < 2; r++) {
            try {
              const descLlm = await generateInterpretation({ system: ds, user: du, json: false });
              cj[idx].desc = descLlm.text.trim();
              break;
            } catch { /* 재시도 */ }
          }
        }));
      }
      // 2장: yongsinEl/heusinEl/gisinEl — 십성→오행 변환 포함
      if (chapter === 2) {
        const y = (obj as Record<string, unknown>).yongsin as Record<string, unknown> | undefined;
        if (y) {
          const OHAENG = ["금","목","화","토","수"] as const;
          // 일간 오행 추출
          const ilganEl = (input.pillars?.find(p => p.pos === "일주")?.ganEl) ?? "";
          // 십성→오행 변환 테이블 (일간 오행 기준)
          const GEN: Record<string,string> = { 목:"화",화:"토",토:"금",금:"수",수:"목" };
          const CTL: Record<string,string> = { 목:"토",화:"금",토:"수",금:"목",수:"화" };
          const CLASHED_BY: Record<string,string> = { 목:"금",화:"수",토:"목",금:"화",수:"토" }; // 나를 극하는
          const GENERATED_BY: Record<string,string> = { 목:"수",화:"목",토:"화",금:"토",수:"금" }; // 나를 생하는
          function sipToEl(sip: string): string {
            if (["비견","겁재"].some(s => sip.includes(s))) return ilganEl;
            if (["식신","상관"].some(s => sip.includes(s))) return GEN[ilganEl] ?? "";
            if (["편재","정재","재성"].some(s => sip.includes(s))) return CTL[ilganEl] ?? "";
            if (["편관","정관","관성"].some(s => sip.includes(s))) return CLASHED_BY[ilganEl] ?? "";
            if (["편인","정인","인성"].some(s => sip.includes(s))) return GENERATED_BY[ilganEl] ?? "";
            return "";
          }
          function resolveEl(fieldVal: unknown, keyword: string, allText: string): string {
            const v = String(fieldVal ?? "").trim();
            if ((OHAENG as readonly string[]).includes(v)) return v; // 이미 오행이면 그대로
            // 텍스트에서 십성 키워드 + 오행 순으로 탐색
            const sipMatch = allText.match(new RegExp(`${keyword}[가-힣]?\\s*[''""]?([가-힣]{2,3})[''""]?`));
            if (sipMatch) { const el = sipToEl(sipMatch[1]); if (el) return el; const direct = sipMatch[1]; if ((OHAENG as readonly string[]).includes(direct)) return direct; }
            // 오행 직접 언급
            const elMatch = allText.match(new RegExp(`${keyword}[가-힣]?\\s*(?:오행인\\s*)?(금|목|화|토|수)`));
            if (elMatch) return elMatch[1];
            return "";
          }
          const allText = [y.callout, y.intro, ...((y.paragraphs as string[]) ?? [])].filter(Boolean).join(" ");
          y.yongsinEl = resolveEl(y.yongsinEl, "용신", allText);
          y.heusinEl  = resolveEl(y.heusinEl,  "희신", allText);
          y.gisinEl   = resolveEl(y.gisinEl,   "기신", allText);
        }
      }
      if (isChapterReady(obj, chapter)) return { obj, ...meta };
      console.error(`[saju_health] ${chapter}장 isChapterReady 실패 (시도${i+1}):`, JSON.stringify(obj).slice(0, 500));
    } catch (e) {
      console.error(`[saju_health] ${chapter}장 예외 (시도${i+1}):`, e);
    }
  }
  throw new Error(`${chapter}장 생성 실패(LLM 응답 불량)`);
}

// 옛 결과(만세력 미저장)는 saju_inputs 로 birthInfo 복원 → 운세위키 재호출
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadManseryeokFromInputs(service: any, resultId: string): Promise<string | null> {
  const { data: r } = await service.from("saju_results").select("order_id").eq("id", resultId).maybeSingle();
  if (!r) return null;
  const { data: si } = await service.from("saju_inputs").select("*").eq("order_id", r.order_id).maybeSingle();
  if (!si?.birth_date) return null;
  const [y, m, d] = String(si.birth_date).split("-");
  const hasTime = !si.time_unknown && !!si.birth_time;
  const [hh, mm] = hasTime ? String(si.birth_time).split(":") : ["", ""];
  const birthInfo: BirthInfo = {
    birthYear: y,
    birthMonth: String(Number(m)),
    birthDay: String(Number(d)),
    ...(hasTime ? { birthHour: String(Number(hh)), birthMinute: String(Number(mm)) } : {}),
    calendarType: si.calendar === "lunar" ? "음력" : "양력",
    gender: si.gender === "female" || si.gender === "여성" || si.gender === "여자" || si.gender === "여아" ? "female" : "male",
  };
  const analysis = await fetchSajuAnalysis(birthInfo, [], { source: "confirm" });
  return formatSajuToManseryeok(analysis, birthInfo);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (body && typeof body.id === "string" && body.content && typeof body.content === "object") {
    return saveContent(body.id, body.content as Record<string, unknown>);
  }
  if (body && typeof body.id === "string" && typeof body.chapter === "number") {
    return generateChapter(body); // 그 장 생성해서 반환만(저장은 클라가 합본 1회)
  }
  return createReport(body);
}

// 병합 저장 (클라가 전 장 합본을 한 번에 저장 → 동시 쓰기 레이스 없음)
async function saveContent(id: string, content: Record<string, unknown>) {
  const service = createServiceClient();
  const { data } = await service.from("saju_results").select("interpretation_md").eq("id", id).maybeSingle();
  let existing: Record<string, unknown> = {};
  try { existing = JSON.parse(data?.interpretation_md || "{}") || {}; } catch { existing = {}; }
  const merged = { ...existing, ...content };
  await service.from("saju_results").update({ interpretation_md: JSON.stringify(merged) }).eq("id", id);
  return NextResponse.json({ ok: true });
}

// ── 초기 생성: 명식 생성 + resultId 반환 (장 생성은 클라이언트가 병렬로) ──
async function createReport(body: unknown) {
  if (!isSajuApiConfigured()) {
    return NextResponse.json({ error: "사주 API가 설정되지 않았습니다." }, { status: 503 });
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  const { name, date, time, calendar, gender, email } = parsed.data;

  const ymd = parseDate(date);
  if (!ymd) return NextResponse.json({ error: "생년월일 형식 오류" }, { status: 400 });
  const cal = parseCalendar(calendar);
  const timeVal = parseTimeVal(time);
  const hasTime = timeVal !== "unknown";
  const [hh, mm] = hasTime ? timeVal.split(":") : ["", ""];
  const g: "male" | "female" = gender === "여자" || gender === "여성" || gender === "여아" || gender === "female" ? "female" : "male";
  const pad = (n: number | string) => String(n).padStart(2, "0");

  try {
    const birthInfo: BirthInfo = {
      birthYear: String(ymd.year),
      birthMonth: String(ymd.month),
      birthDay: String(ymd.day),
      ...(hasTime ? { birthHour: String(Number(hh)), birthMinute: String(Number(mm)) } : {}),
      calendarType: cal === "solar" ? "양력" : "음력",
      gender: g,
      isLeapMonth: cal === "leap",
    };

    const analysis = await fetchSajuAnalysis(birthInfo, [], { source: "confirm" });
    const view = buildMyeongsikView(analysis);
    const manseryeokText = formatSajuToManseryeok(analysis, birthInfo);

    const env = serverEnv();
    const llm = { provider: env.LLM_PROVIDER, model: env.LLM_MODEL };

    const birth = {
      date: `${ymd.year}.${pad(ymd.month)}.${pad(ymd.day)}`,
      calendar: cal === "solar" ? "양력" : cal === "leap" ? "윤달" : "음력",
      time: hasTime ? `${pad(hh)}:${pad(mm)}` : "시간 모름",
      gender: g,
    };

    const service = createServiceClient();

    // 1단계: 주문 + 초기 결과 레코드 생성
    const { data: product } = await service.from("products").select("id").eq("slug", PRODUCT_SLUG).maybeSingle();
    if (!product) return NextResponse.json({ error: "상품을 찾을 수 없습니다." }, { status: 500 });

    const orderCode = `jt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const { data: order, error: orderErr } = await service
      .from("orders")
      .insert({ order_id: orderCode, product_id: product.id, guest_email: email || "guest@hongyeondang.com", amount: 0, status: "paid", paid_at: new Date().toISOString() })
      .select("id").single();
    if (orderErr || !order) return NextResponse.json({ error: "주문 생성 실패" }, { status: 500 });

        await service.from("saju_inputs").insert({
          order_id: order.id, name: name || null,
          birth_date: `${ymd.year}-${pad(ymd.month)}-${pad(ymd.day)}`,
          birth_time: hasTime ? `${pad(hh)}:${pad(mm)}` : null,
          time_unknown: !hasTime, gender: g,
          calendar: cal === "solar" ? "solar" : "lunar", concerns: [],
        });

        const { data: result, error: resultErr } = await service
          .from("saju_results")
          .insert({ order_id: order.id, myeongsik: { view, name, birth, manseryeokText, gender: g } as never, interpretation_md: JSON.stringify({}), llm_provider: llm.provider, llm_model: llm.model })
          .select("id").single();
        if (resultErr || !result) return NextResponse.json({ error: "결과 저장 실패" }, { status: 500 });

        // 2단계: SMS + 이메일 즉시 발송
        const reportUrl = `https://www.hongyeondang.com/${REPORT_PATH}?id=${result.id}`;
        sendOrderSms({ customerName: name || "고객", productName: PRODUCT_NAME, price: PRODUCT_PRICE });
        if (email) sendOrderEmail({ customerEmail: email, customerName: name || "고객", productName: PRODUCT_NAME, price: PRODUCT_PRICE, reportUrl });

        // 3단계: 이미지 백그라운드 시작 (클라이언트 병렬 장 생성 중에 동시 실행)
        const imagePrompt = buildSajuImagePrompt(view.pillars ?? []);
        (async () => {
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              const imgBuffer = await generateSajuImage(imagePrompt, process.env.OPENAI_API_KEY!);
              const imgPath = `wonguk/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
              const { error: uploadErr } = await service.storage.from("saju-images").upload(imgPath, imgBuffer, { contentType: "image/png", upsert: false });
              if (uploadErr) throw uploadErr;
              const sajuImageUrl = service.storage.from("saju-images").getPublicUrl(imgPath).data.publicUrl;
              await service.from("saju_results").update({ myeongsik: { view, name, birth, manseryeokText, gender: g, sajuImageUrl } as never }).eq("id", result.id);
              break;
            } catch (e) {
              console.error(`[saju_health] 이미지 생성 실패 (시도${attempt + 1}):`, e);
            }
          }
        })();

        return NextResponse.json({ resultId: result.id });
      } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
      }
}

// ── 특정 장 온디맨드 생성 ──
async function generateChapter(body: unknown) {
  const parsed = chapterSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  const { id, chapter, force } = parsed.data;

  const service = createServiceClient();
  const { data, error } = await service.from("saju_results").select("myeongsik, interpretation_md, order_id").eq("id", id).maybeSingle();
  if (error || !data) return NextResponse.json({ error: "결과를 찾을 수 없습니다." }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stored = data.myeongsik as any;

  // myeongsik에 gender가 없으면 saju_inputs에서 fallback
  if (!stored?.gender && data.order_id && stored) {
    const { data: si } = await service.from("saju_inputs").select("gender").eq("order_id", data.order_id).maybeSingle();
    if (si?.gender) stored.gender = (si.gender as string) === "female" || (si.gender as string) === "여자" || (si.gender as string) === "여성" || (si.gender as string) === "여아" ? "female" : "male";
  }

  let content: Record<string, unknown> = {};
  try { content = JSON.parse(data.interpretation_md) || {}; } catch { content = {}; }

  if (!force && isChapterReady(content, chapter)) {
    // 이미 저장돼 있으면 그 장 섹션만 반환
    const sections: Record<string, unknown> = {};
    for (const k of CHAPTER_SECTIONS[chapter] ?? []) sections[k] = content[k];
    return NextResponse.json({ sections });
  }

  let manseryeokText: string | undefined = stored?.manseryeokText;
  if (!manseryeokText) {
    if (!isSajuApiConfigured()) return NextResponse.json({ error: "사주 API가 설정되지 않았습니다." }, { status: 503 });
    manseryeokText = (await loadManseryeokFromInputs(service, id)) ?? undefined; // 옛 결과 복원
  }
  if (!manseryeokText) return NextResponse.json({ error: "명식 정보를 찾을 수 없습니다." }, { status: 500 });

  try {
    const birthDateStr: string = stored?.birth?.date ?? ""; // "yyyy.mm.dd"
    const birthYear = birthDateStr ? Number(birthDateStr.split(".")[0]) : undefined;
    const { obj } = await genChapterContent(chapter, {
      name: stored?.name ?? "",
      gender: stored?.gender === "female" ? "female" : "male",
      manseryeokText,
      pillars: applyLocalSinsal(stored?.view?.pillars ?? []),
      birthYear: birthYear || undefined,
    });

    return NextResponse.json({ sections: obj });
  } catch (err) {
    return NextResponse.json({ error: "장 생성 실패", detail: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

// ── 저장된 결과 조회 ──
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id 누락" }, { status: 400 });

  const service = createServiceClient();
  const { data, error } = await service.from("saju_results").select("myeongsik, interpretation_md").eq("id", id).maybeSingle();
  if (error || !data) return NextResponse.json({ error: "결과를 찾을 수 없습니다." }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stored = data.myeongsik as any;
  let content;
  try { content = JSON.parse(data.interpretation_md); } catch { content = null; }
  return NextResponse.json({ view: stored?.view ?? stored, name: stored?.name ?? "", birth: stored?.birth ?? null, gender: stored?.gender ?? "", sajuImageUrl: stored?.sajuImageUrl ?? null, content });
}

// ── 이미지 재생성 ──
export async function PATCH(request: NextRequest) {
  const { id } = await request.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "id 누락" }, { status: 400 });

  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "OpenAI 키 없음" }, { status: 503 });

  const service = createServiceClient();
  const { data, error } = await service.from("saju_results").select("myeongsik").eq("id", id).maybeSingle();
  if (error || !data) return NextResponse.json({ error: "결과를 찾을 수 없습니다." }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stored = data.myeongsik as any;
  const pillars = stored?.view?.pillars ?? [];

  try {
    const imagePrompt = buildSajuImagePrompt(pillars);
    const imgBuffer = await generateSajuImage(imagePrompt, process.env.OPENAI_API_KEY!);
    const imgPath = `wonguk/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
    const { error: uploadErr } = await service.storage.from("saju-images").upload(imgPath, imgBuffer, { contentType: "image/png", upsert: false });
    if (uploadErr) throw uploadErr;
    const { data: pubData } = service.storage.from("saju-images").getPublicUrl(imgPath);
    const sajuImageUrl = pubData.publicUrl;
    await service.from("saju_results").update({ myeongsik: { ...stored, sajuImageUrl } }).eq("id", id);
    return NextResponse.json({ sajuImageUrl });
  } catch (e) {
    return NextResponse.json({ error: "이미지 생성 실패", detail: String(e) }, { status: 500 });
  }
}
