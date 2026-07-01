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

export const maxDuration = 60;

const PRODUCT_SLUG = "kunghap_ehon";

const createSchema = z.object({
  name: z.string().optional().default(""),
  date: z.string().min(1),
  time: z.string().optional().default(""),
  calendar: z.string().optional().default("양력"),
  gender: z.string().optional().default(""),
  email: z.string().optional().default(""),
  partnerName: z.string().optional().default(""),
  partnerDate: z.string().min(1),
  partnerTime: z.string().optional().default(""),
  partnerCalendar: z.string().optional().default("양력"),
  partnerGender: z.string().optional().default(""),
});
const chapterSchema = z.object({ id: z.string().min(1), chapter: z.number().int().min(1).max(30), force: z.boolean().optional().default(false) });

// 한 장 생성 (JSON 모드 + 출력 검증 + 1회 재시도). 실패 시 throw.
async function genChapterContent(chapter: number, input: { name: string; gender: "male" | "female"; manseryeokText: string; pillars?: { pos: string; gan: string; ganEl: string; ji: string; jiEl: string; sipTop: string; sipBot: string; sinsal?: string }[]; birthYear?: number }) {
  const { system, user, compatTags, ch6RankData } = buildChapterPrompt(chapter, input);
  let meta = { provider: "", model: "" };
  for (let i = 0; i < 2; i++) {
    try {
      const llm = await generateInterpretation({ system, user, json: true });
      meta = { provider: llm.provider, model: llm.model };
      const obj = parseContentJson(llm.text);
      // 6장: 서버 계산된 tags를 LLM 결과에 덮어씌우기
      if (compatTags && Array.isArray((obj as Record<string,unknown>).compatibleJuju)) {
        const cj = (obj as Record<string,unknown>).compatibleJuju as Record<string,unknown>[];
        compatTags.forEach((tags, idx) => { if (cj[idx]) cj[idx].tags = tags; });
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
      // 2장 후처리: yongsinEl/heusinEl/gisinEl 빠진 경우 텍스트에서 추출
      if (chapter === 2) {
        const y = (obj as Record<string, unknown>).yongsin as Record<string, unknown> | undefined;
        if (y) {
          const OHAENG = ["금", "목", "화", "토", "수"] as const;
          const allText = [y.callout, y.intro, ...((y.paragraphs as string[]) ?? [])].filter(Boolean).join(" ");
          if (!y.yongsinEl) {
            const m = allText.match(/용신[은이가]?\s*(?:오행인\s*)?(금|목|화|토|수)/);
            if (m) y.yongsinEl = m[1];
          }
          if (!y.heusinEl) {
            const m = allText.match(/희신[은이가]?\s*(?:오행인\s*)?(금|목|화|토|수)/);
            if (m) y.heusinEl = m[1];
          }
          if (!y.gisinEl) {
            const m = allText.match(/기신[은이가]?\s*(?:오행인\s*)?(금|목|화|토|수)/);
            if (m) y.gisinEl = m[1];
          }
          // 그래도 없으면 callout에서 첫 번째 오행 순서대로 추출
          if (!y.yongsinEl || !y.heusinEl || !y.gisinEl) {
            const found: string[] = [];
            for (const ch of allText) { if (OHAENG.includes(ch as typeof OHAENG[number]) && !found.includes(ch)) found.push(ch); if (found.length === 3) break; }
            if (!y.yongsinEl && found[0]) y.yongsinEl = found[0];
            if (!y.heusinEl  && found[1]) y.heusinEl  = found[1];
            if (!y.gisinEl   && found[2]) y.gisinEl   = found[2];
          }
        }
      }
      if (isChapterReady(obj, chapter)) return { obj, ...meta };
    } catch {
      /* 재시도 */
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
    gender: si.gender === "female" ? "female" : "male",
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

// ── 초기 생성: 명식 + 1장 풀이 ──
async function createReport(body: unknown) {
  if (!isSajuApiConfigured()) {
    return NextResponse.json({ error: "사주 API가 설정되지 않았습니다." }, { status: 503 });
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  const { name, date, time, calendar, gender, email, partnerName, partnerDate, partnerTime, partnerCalendar, partnerGender } = parsed.data;

  const pad = (n: number | string) => String(n).padStart(2, "0");

  // 나
  const ymd = parseDate(date);
  if (!ymd) return NextResponse.json({ error: "생년월일 형식 오류" }, { status: 400 });
  const cal = parseCalendar(calendar);
  const timeVal = parseTimeVal(time);
  const hasTime = timeVal !== "unknown";
  const [hh, mm] = hasTime ? timeVal.split(":") : ["", ""];
  const g: "male" | "female" = gender === "여자" || gender === "female" ? "female" : "male";

  const birthInfo: BirthInfo = {
    birthYear: String(ymd.year),
    birthMonth: String(ymd.month),
    birthDay: String(ymd.day),
    ...(hasTime ? { birthHour: String(Number(hh)), birthMinute: String(Number(mm)) } : {}),
    calendarType: cal === "solar" ? "양력" : "음력",
    gender: g,
    isLeapMonth: cal === "leap",
  };

  // 상대방
  const pymd = parseDate(partnerDate);
  if (!pymd) return NextResponse.json({ error: "상대방 생년월일 형식 오류" }, { status: 400 });
  const pcal = parseCalendar(partnerCalendar);
  const ptimeVal = parseTimeVal(partnerTime);
  const phasTime = ptimeVal !== "unknown";
  const [phh, pmm] = phasTime ? ptimeVal.split(":") : ["", ""];
  const pg: "male" | "female" = partnerGender === "여자" || partnerGender === "female" ? "female" : "male";

  const partnerBirthInfo: BirthInfo = {
    birthYear: String(pymd.year),
    birthMonth: String(pymd.month),
    birthDay: String(pymd.day),
    ...(phasTime ? { birthHour: String(Number(phh)), birthMinute: String(Number(pmm)) } : {}),
    calendarType: pcal === "solar" ? "양력" : "음력",
    gender: pg,
    isLeapMonth: pcal === "leap",
  };

  try {
    // 두 사람 만세력 병렬 호출
    const [analysis, partnerAnalysis] = await Promise.all([
      fetchSajuAnalysis(birthInfo, [], { source: "confirm" }),
      fetchSajuAnalysis(partnerBirthInfo, [], { source: "confirm" }),
    ]);
    const view = buildMyeongsikView(analysis);
    const partnerView = buildMyeongsikView(partnerAnalysis);
    const myManseryeokText = formatSajuToManseryeok(analysis, birthInfo);
    const partnerManseryeokText = formatSajuToManseryeok(partnerAnalysis, partnerBirthInfo);
    const manseryeokText = `[${name || "나"}의 사주]\n${myManseryeokText}\n\n[${partnerName || "상대방"}의 사주]\n${partnerManseryeokText}`;

    const env = serverEnv();
    const llm = { provider: env.LLM_PROVIDER, model: env.LLM_MODEL };

    const birth = {
      date: `${ymd.year}.${pad(ymd.month)}.${pad(ymd.day)}`,
      calendar: cal === "solar" ? "양력" : cal === "leap" ? "윤달" : "음력",
      time: hasTime ? `${pad(hh)}:${pad(mm)}` : "시간 모름",
      gender: g,
    };
    const partnerBirth = {
      date: `${pymd.year}.${pad(pymd.month)}.${pad(pymd.day)}`,
      calendar: pcal === "solar" ? "양력" : pcal === "leap" ? "윤달" : "음력",
      time: phasTime ? `${pad(phh)}:${pad(pmm)}` : "시간 모름",
      gender: pg,
    };

    const service = createServiceClient();

    // 두 사람 원국 이미지 병렬 생성 → Supabase Storage 영구 저장
    let sajuImageUrl: string | null = null;
    let partnerSajuImageUrl: string | null = null;
    try {
      const [imgBuffer, partnerImgBuffer] = await Promise.all([
        generateSajuImage(buildSajuImagePrompt(view.pillars ?? []), process.env.OPENAI_API_KEY!),
        generateSajuImage(buildSajuImagePrompt(partnerView.pillars ?? []), process.env.OPENAI_API_KEY!),
      ]);
      const ts = Date.now();
      const rand1 = Math.random().toString(36).slice(2, 8);
      const rand2 = Math.random().toString(36).slice(2, 8);
      const [up1, up2] = await Promise.all([
        service.storage.from("saju-images").upload(`wonguk/${ts}-${rand1}.png`, imgBuffer, { contentType: "image/png", upsert: false }),
        service.storage.from("saju-images").upload(`wonguk/${ts}-${rand2}.png`, partnerImgBuffer, { contentType: "image/png", upsert: false }),
      ]);
      if (!up1.error) sajuImageUrl = service.storage.from("saju-images").getPublicUrl(`wonguk/${ts}-${rand1}.png`).data.publicUrl;
      if (!up2.error) partnerSajuImageUrl = service.storage.from("saju-images").getPublicUrl(`wonguk/${ts}-${rand2}.png`).data.publicUrl;
    } catch (e) {
      console.error("[이미지생성] 실패:", e);
    }
    // 16장 전부 병렬 생성
    const chapterInput = { name: name || "", gender: g, manseryeokText, pillars: view.pillars, birthYear: ymd.year };
    const chapterResults = await Promise.allSettled(
      Array.from({ length: 16 }, (_, i) => genChapterContent(i + 1, chapterInput))
    );
    const content: Record<string, unknown> = {};
    for (let i = 0; i < 16; i++) {
      const r = chapterResults[i];
      if (r.status === "fulfilled") Object.assign(content, r.value.obj);
    }

    const { data: product } = await service.from("products").select("id").eq("slug", PRODUCT_SLUG).maybeSingle();
    if (!product) return NextResponse.json({ error: "상품을 찾을 수 없습니다." }, { status: 500 });

    const orderCode = `jt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const { data: order, error: orderErr } = await service
      .from("orders")
      .insert({ order_id: orderCode, product_id: product.id, guest_email: email || "guest@hongyeondang.com", amount: 0, status: "paid", paid_at: new Date().toISOString() })
      .select("id")
      .single();
    if (orderErr || !order) return NextResponse.json({ error: "주문 생성 실패", detail: orderErr?.message }, { status: 500 });

    await service.from("saju_inputs").insert({
      order_id: order.id,
      name: name || null,
      birth_date: `${ymd.year}-${pad(ymd.month)}-${pad(ymd.day)}`,
      birth_time: hasTime ? `${pad(hh)}:${pad(mm)}` : null,
      time_unknown: !hasTime,
      gender: g,
      calendar: cal === "solar" ? "solar" : "lunar",
      concerns: [],
    });

    const { data: result, error: resultErr } = await service
      .from("saju_results")
      .insert({
        order_id: order.id,
        // manseryeokText/gender 도 저장 → 이후 장 생성에 재사용(운세위키 재호출 불필요)
        myeongsik: { view, name, birth, manseryeokText, gender: g, sajuImageUrl, partnerView, partnerName, partnerBirth, partnerGender: pg, partnerSajuImageUrl } as never,
        interpretation_md: JSON.stringify(content),
        llm_provider: llm.provider,
        llm_model: llm.model,
      })
      .select("id")
      .single();
    if (resultErr || !result) return NextResponse.json({ error: "결과 저장 실패", detail: resultErr?.message }, { status: 500 });

    return NextResponse.json({ resultId: result.id, view, content, name, birth, sajuImageUrl, partnerView, partnerName, partnerBirth, partnerGender: pg, partnerSajuImageUrl });
  } catch (err) {
    return NextResponse.json({ error: "결과지 생성 실패", detail: err instanceof Error ? err.message : String(err) }, { status: 500 });
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
    if (si?.gender) stored.gender = (si.gender as string) === "female" || (si.gender as string) === "여자" ? "female" : "male";
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
  return NextResponse.json({ view: stored?.view ?? stored, name: stored?.name ?? "", birth: stored?.birth ?? null, gender: stored?.gender ?? "", sajuImageUrl: stored?.sajuImageUrl ?? null, content, partnerView: stored?.partnerView ?? null, partnerName: stored?.partnerName ?? "", partnerBirth: stored?.partnerBirth ?? null, partnerGender: stored?.partnerGender ?? "", partnerSajuImageUrl: stored?.partnerSajuImageUrl ?? null });
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
