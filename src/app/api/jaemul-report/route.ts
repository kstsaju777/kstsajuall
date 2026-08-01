// =====================================================
// 재물운사주 결과지 생성 + 저장 API (장별 온디맨드)
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
import { parseContentJson, buildSajuImagePrompt } from "@/lib/saju/report-content";
import { buildJaemulChapterPrompt, isJaemulChapterReady, JAEMUL_CHAPTER_SECTIONS } from "@/lib/saju/jaemul-report-content";
import { generateInterpretation, generateSajuImage } from "@/lib/saju/llm";
import { parseDate, parseTimeVal, parseCalendar } from "@/lib/saju/local-manseryeok";
import { serverEnv } from "@/lib/env";
import { sendOrderSms, sendOrderEmail, sendAlimtalk } from "@/lib/order-notifications";
import { WAIT_FOR_IMAGE } from "@/lib/alimtalk-config";
import { fixNamesInValue } from "@/lib/saju/fix-names";

export const maxDuration = 300;

const PRODUCT_SLUG = "saju_jaemul";
const PRODUCT_NAME = "재물사주";
const PRODUCT_PRICE = 19900;
const REPORT_PATH = "saju/saju_jaemul/report-preview";

const createSchema = z.object({
  name: z.string().optional().default(""),
  date: z.string().min(1),
  time: z.string().optional().default(""),
  calendar: z.string().optional().default("양력"),
  gender: z.string().optional().default(""),
  email: z.string().optional().default(""),
  concern: z.string().optional().default(""),
});
const chapterSchema = z.object({ id: z.string().min(1), chapter: z.number().int().min(1).max(30), force: z.boolean().optional().default(false) });

// 한 장 생성 (JSON 모드 + 출력 검증 + 재시도). 실패 시 throw.
async function genChapterContent(chapter: number, input: { name: string; gender: "male" | "female"; manseryeokText: string; pillars?: { pos: string; gan: string; ganEl: string; ji: string; jiEl: string; sipTop: string; sipBot: string; sinsal?: string }[]; birthYear?: number; seun?: { label: string; gz: string; active?: boolean }[]; ilganChar?: string; concern?: string }) {
  const { system, user } = buildJaemulChapterPrompt(chapter, input);
  let meta = { provider: "", model: "" };
  // 7장: letter만 있는 최선 결과를 보관 (concernAdvice 재시도 실패 시 fallback으로 반환)
  let ch7LetterFallback: { obj: Record<string, unknown>; provider: string; model: string } | null = null;
  for (let i = 0; i < 3; i++) {
    try {
      const llm = await generateInterpretation({ system, user, json: true });
      meta = { provider: llm.provider, model: llm.model };
      let obj: Record<string, unknown>;
      try {
        obj = parseContentJson(llm.text);
      } catch (parseErr) {
        console.error(`[saju_jaemul] ${chapter}장 JSON파싱실패 (시도${i+1}):`, parseErr instanceof Error ? parseErr.message : String(parseErr), '\nRAW:', llm.text.slice(0, 300));
        if (chapter === 7) {
          const paras = llm.text.trim().split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
          obj = { letter: { paragraphs: paras.length > 0 ? paras : [llm.text.trim()] } };
        } else {
          continue;
        }
      }
      // 7장: concern 있는데 concernAdvice 비어있으면 재시도 (letter는 보관)
      if (chapter === 7 && input.concern?.trim()) {
        const ca = (obj.concernAdvice as { paragraphs?: string[] } | undefined);
        if (!ca || !ca.paragraphs || ca.paragraphs.length === 0) {
          const letterOk = ((obj.letter as { paragraphs?: string[] } | undefined)?.paragraphs?.length ?? 0) > 0;
          if (letterOk && !ch7LetterFallback) ch7LetterFallback = { obj, ...meta };
          console.error(`[saju_jaemul] 7장 concernAdvice 누락 (시도${i+1}), 재시도`);
          continue;
        }
      }
      if (isJaemulChapterReady(obj, chapter)) return { obj, ...meta };
      console.error(`[saju_jaemul] ${chapter}장 isJaemulChapterReady 실패 (시도${i+1}):`, JSON.stringify(obj).slice(0, 500));
    } catch (e) {
      console.error(`[saju_jaemul] ${chapter}장 예외 (시도${i+1}):`, e);
    }
  }
  // 7장: concernAdvice 재시도 3번 모두 실패해도 letter라도 반환
  if (chapter === 7 && ch7LetterFallback) {
    console.error(`[saju_jaemul] 7장 concernAdvice 생성 실패, letter 단독 반환`);
    return ch7LetterFallback;
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
    return saveContent(body.id, body.content as Record<string, unknown>, !!body.force);
  }
  if (body && typeof body.id === "string" && body.concernOnly === true) {
    return generateConcernAdvice(body.id);
  }
  if (body && typeof body.id === "string" && typeof body.chapter === "number") {
    return generateChapter(body); // 그 장 생성해서 반환만(저장은 클라가 합본 1회)
  }
  return createReport(body);
}

// concernAdvice만 단독 생성 (letter와 분리 → JSON 짧아서 절대 안 잘림)
async function generateConcernAdvice(id: string) {
  const service = createServiceClient();
  const { data, error } = await service.from("saju_results").select("myeongsik, interpretation_md, order_id").eq("id", id).maybeSingle();
  if (error || !data) return NextResponse.json({ error: "결과를 찾을 수 없습니다." }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stored = data.myeongsik as any;
  let concern: string = stored?.concern ?? "";
  if (!concern && data.order_id) {
    const { data: si } = await service.from("saju_inputs").select("concerns").eq("order_id", data.order_id).maybeSingle();
    concern = (si?.concerns as string[] | null)?.[0] ?? "";
  }
  if (!concern) return NextResponse.json({ concernAdvice: { paragraphs: [] } });

  let manseryeokText: string | undefined = stored?.manseryeokText;
  if (!manseryeokText) manseryeokText = (await loadManseryeokFromInputs(service, id)) ?? undefined;
  if (!manseryeokText) return NextResponse.json({ error: "명식 정보 없음" }, { status: 500 });

  const name: string = stored?.name ?? "";
  const name1 = name.length > 1 ? name.slice(1) : name;
  const gender: "male" | "female" = stored?.gender === "female" ? "female" : "male";

  // 현재 대운 코드 계산 (종합사주와 동일 — AI 오판 방지)
  let daeunNote = "";
  const daeunList: { label: string; gz: string; active?: boolean }[] = stored?.view?.daeun ?? [];
  if (daeunList.length > 0) {
    const currentYear = new Date().getFullYear();
    const birthDateStr: string = stored?.birth?.date ?? "";
    const birthYearNum = birthDateStr ? Number(birthDateStr.split(".")[0]) : currentYear;
    const currentAge = currentYear - birthYearNum;
    let currentDaeun = daeunList.find(d => d.active);
    if (!currentDaeun) {
      const sorted = [...daeunList].sort((a, b) => Number(a.label) - Number(b.label));
      for (let i = sorted.length - 1; i >= 0; i--) {
        if (currentAge >= Number(sorted[i].label)) { currentDaeun = sorted[i]; break; }
      }
    }
    if (currentDaeun) {
      const idx = daeunList.findIndex(d => d.gz === currentDaeun!.gz && d.label === currentDaeun!.label);
      const startAge = Number(currentDaeun.label);
      const endAge = daeunList[idx + 1] ? Number(daeunList[idx + 1].label) - 1 : startAge + 9;
      const startYear = birthYearNum + startAge;
      const endYear = birthYearNum + endAge;
      const yearsIn = currentYear - startYear;
      daeunNote = `[현재 대운 고정값 — 반드시 이 값만 사용, 독자적 재산출 절대 금지]\n현재 대운: ${currentDaeun.gz} (${startAge}세~${endAge}세, ${startYear}년~${endYear}년)\n현재 나이: ${currentAge}세 (${currentYear}년 기준) — 이 대운 시작 후 ${yearsIn}년차`;
    }
  }

  // 현재 세운 계산
  let seunNote = "";
  const seunList: { label: string; gz: string; active?: boolean }[] = stored?.view?.seun ?? [];
  if (seunList.length > 0) {
    const currentYear = new Date().getFullYear();
    const currentSeun = seunList.find(s => Number(s.label) === currentYear) ?? seunList.find(s => s.active);
    if (currentSeun) seunNote = `[현재 세운 고정값 — 반드시 이 값만 사용]\n현재 세운: ${currentSeun.gz} (${currentYear}년)`;
  }

  const daeunSeunBlock = [daeunNote, seunNote].filter(Boolean).join("\n\n");

  // 이전 장 생성 결과에서 핵심 정보 추출
  let prevChapterContext = "";
  try {
    const prev = JSON.parse(data.interpretation_md || "{}") as Record<string, unknown>;
    const lines: string[] = [];
    const wealthPeak = prev.wealthPeak as { period?: string; desc?: string } | undefined;
    if (wealthPeak?.period) lines.push(`재물 최적 시기: ${wealthPeak.period}${wealthPeak.desc ? " — " + wealthPeak.desc.slice(0, 60) + "…" : ""}`);
    const moneyTrap = prev.moneyTrap as { desc?: string; period?: string } | undefined;
    if (moneyTrap?.period) lines.push(`재물 주의 시기: ${moneyTrap.period}`);
    else if (moneyTrap?.desc) lines.push(`재물 함정: ${moneyTrap.desc.slice(0, 80)}…`);
    const wealthSummary = prev.wealthSummary as { desc?: string } | undefined;
    if (wealthSummary?.desc) lines.push(`재물 총평: ${wealthSummary.desc.slice(0, 80)}…`);
    const jobFit = prev.jobFit as { desc?: string; jobs?: string[] } | undefined;
    if (Array.isArray(jobFit?.jobs) && jobFit.jobs.length > 0) lines.push(`적합 직업·분야: ${jobFit.jobs.join(", ")}`);
    else if (jobFit?.desc) lines.push(`직업 적성: ${jobFit.desc.slice(0, 80)}…`);
    if (lines.length > 0) prevChapterContext = `\n\n[이 리포트에서 이미 분석된 핵심 결과 — 반드시 이 내용과 일치하는 조언을 작성할 것]\n${lines.join("\n")}`;
  } catch { /* 무시 */ }

  const system = `당신은 명리학 전문가 홍연이오. 홍연 말투(~이오/~하오/~겠소)로 작성하오.`;
  const user = `다음은 ${name}님의 재물사주 만세력이오.\n\n${manseryeokText}${daeunSeunBlock ? "\n\n" + daeunSeunBlock : ""}${prevChapterContext}\n\n[고민에 대한 명리학적 조언 작성]\n고민: "${concern}"\n\n반드시 위 '이미 분석된 핵심 결과'의 내용(재물 최적 시기·직업 적성 등)과 모순되지 않는 조언을 작성하오.\n\n아래 JSON 형식으로만 답하오:\n{\n  "concernAdvice": {\n    "paragraphs": [\n      "${name1}님의 고민을 명식(일간·오행·십성)과 연결한 풀이 — 이 고민이 왜 생겼는지 명식 구조로 설명 (4~5문장, 200자 이상)",\n      "위에 제공된 현재 대운·세운 고정값과 이미 분석된 재물흐름·최적시기를 기준으로 분석 — 구체적 시기를 리포트 내용과 일치하게 언급 (4~5문장, 200자 이상)",\n      "이 고민을 풀어가기 위해 지금 당장 실천할 수 있는 조언과 마음가짐 (3~4문장, 150자 이상)"\n    ]\n  }\n}\n\n고민의 주제(재물·인연·직업 등)에 상관없이 반드시 작성하오. 홍연 말투(~이오/~하오/~겠소).`;

  for (let i = 0; i < 3; i++) {
    try {
      const llm = await generateInterpretation({ system, user, json: true });
      const obj = parseContentJson(llm.text) as { concernAdvice?: { paragraphs?: string[] } };
      const paras = obj?.concernAdvice?.paragraphs;
      if (Array.isArray(paras) && paras.length > 0) {
        // DB에 저장 (force=true → 알림톡 X)
        await service.from("saju_results").select("interpretation_md").eq("id", id).maybeSingle().then(async ({ data: cur }) => {
          let existing: Record<string, unknown> = {};
          try { existing = JSON.parse(cur?.interpretation_md || "{}") || {}; } catch { existing = {}; }
          await service.from("saju_results").update({ interpretation_md: JSON.stringify({ ...existing, concernAdvice: obj.concernAdvice }) }).eq("id", id);
        });
        return NextResponse.json({ concernAdvice: obj.concernAdvice });
      }
    } catch { /* 재시도 */ }
  }
  return NextResponse.json({ concernAdvice: { paragraphs: [] } });
}

// 병합 저장 (클라가 전 장 합본을 한 번에 저장 → 동시 쓰기 레이스 없음)
async function saveContent(id: string, content: Record<string, unknown>, skipAlimtalk = false) {
  const service = createServiceClient();
  const { data } = await service.from("saju_results").select("interpretation_md, order_id, myeongsik").eq("id", id).maybeSingle();
  let existing: Record<string, unknown> = {};
  try { existing = JSON.parse(data?.interpretation_md || "{}") || {}; } catch { existing = {}; }
  const merged = { ...existing, ...content };
  await service.from("saju_results").update({ interpretation_md: JSON.stringify(merged) }).eq("id", id);
  const totalChapters = Object.keys(JAEMUL_CHAPTER_SECTIONS).map(Number);
  const allDone = totalChapters.every(n => isJaemulChapterReady(merged, n));
  const storedMyeongsik = data?.myeongsik as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const imageReady = !!storedMyeongsik?.sajuImageUrl;
  const needsImage = WAIT_FOR_IMAGE.has(PRODUCT_SLUG);
  if (!skipAlimtalk && allDone && (!needsImage || imageReady) && data?.order_id) {
    const { data: si } = await service.from("saju_inputs").select("phone, name").eq("order_id", data.order_id).maybeSingle();
    if (si?.phone) {
      const reportUrl = `https://www.hongyeondang.com/saju/saju_jaemul/report-preview?id=${id}`;
      await sendAlimtalk({ customerPhone: si.phone, customerName: si.name ?? "고객", productName: PRODUCT_NAME, resultUrl: reportUrl });
    }
  }
  return NextResponse.json({ ok: true });
}

// ── 초기 생성: 명식 생성 + resultId 반환 (장 생성은 클라이언트가 병렬로) ──
async function createReport(body: unknown) {
  if (!isSajuApiConfigured()) {
    return NextResponse.json({ error: "사주 API가 설정되지 않았습니다." }, { status: 503 });
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  const { name, date, time, calendar, gender, email, concern } = parsed.data;

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
          .insert({ order_id: order.id, myeongsik: { view, name, birth, manseryeokText, gender: g, concern: concern || "" } as never, interpretation_md: JSON.stringify({}), llm_provider: llm.provider, llm_model: llm.model })
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
              console.error(`[saju_jaemul] 이미지 생성 실패 (시도${attempt + 1}):`, e);
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

  // myeongsik에 gender/concern이 없으면 saju_inputs에서 fallback
  let siConcern: string | undefined;
  if (data.order_id && stored) {
    const { data: si } = await service.from("saju_inputs").select("gender, concerns").eq("order_id", data.order_id).maybeSingle();
    if (si?.gender && !stored?.gender) stored.gender = (si.gender as string) === "female" || (si.gender as string) === "여자" || (si.gender as string) === "여성" || (si.gender as string) === "여아" ? "female" : "male";
    // saju_inputs.concerns[0] 를 concern fallback으로 사용
    siConcern = (si?.concerns as string[] | null)?.[0] || undefined;
  }
  const effectiveConcern: string = stored?.concern || siConcern || "";

  let content: Record<string, unknown> = {};
  try { content = JSON.parse(data.interpretation_md) || {}; } catch { content = {}; }

  if (!force && isJaemulChapterReady(content, chapter)) {
    // 7장: concern 있는데 concernAdvice가 비어있으면 강제 재생성
    const ca = (content.concernAdvice as { paragraphs?: string[] } | undefined);
    const caEmpty = !ca || !ca.paragraphs || ca.paragraphs.length === 0;
    if (chapter === 7 && effectiveConcern && caEmpty) {
      // 재생성 허용 (fall through)
    } else {
      // 이미 저장돼 있으면 그 장 섹션만 반환
      const sections: Record<string, unknown> = {};
      for (const k of JAEMUL_CHAPTER_SECTIONS[chapter] ?? []) sections[k] = content[k];
      return NextResponse.json({ sections });
    }
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
      seun: stored?.view?.seun ?? [],
      ilganChar: (stored?.view?.ilgan as string | undefined)?.[0] || undefined,
      concern: effectiveConcern || undefined,
    });
    const myLabel = (stored?.name ?? "").length > 1 ? (stored?.name ?? "").slice(1) : (stored?.name ?? "");
    const sections = fixNamesInValue(obj, myLabel, null, "님") as typeof obj;
    return NextResponse.json({ sections });
  } catch (err) {
    return NextResponse.json({ error: "장 생성 실패", detail: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

// ── 저장된 결과 조회 ──
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id 누락" }, { status: 400 });

  const service = createServiceClient();
  const { data, error } = await service.from("saju_results").select("myeongsik, interpretation_md, order_id").eq("id", id).maybeSingle();
  if (error || !data) return NextResponse.json({ error: "결과를 찾을 수 없습니다." }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stored = data.myeongsik as any;
  let content;
  try { content = JSON.parse(data.interpretation_md); } catch { content = null; }

  // concern: myeongsik.concern 우선, 없으면 saju_inputs.concerns[0] fallback
  let concern: string = stored?.concern ?? "";
  if (!concern && data.order_id) {
    const { data: si } = await service.from("saju_inputs").select("concerns").eq("order_id", data.order_id).maybeSingle();
    concern = (si?.concerns as string[] | null)?.[0] ?? "";
  }

  return NextResponse.json({ view: stored?.view ?? stored, name: stored?.name ?? "", birth: stored?.birth ?? null, gender: stored?.gender ?? "", sajuImageUrl: stored?.sajuImageUrl ?? null, concern, content });
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
