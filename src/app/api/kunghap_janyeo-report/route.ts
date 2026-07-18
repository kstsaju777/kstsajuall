// =====================================================
// 연애궁합 결과지 생성 + 저장 API (장별 온디맨드)
// =====================================================
// POST {name,date,time,calendar,gender,email,partnerName,...}  → 명식 + resultId 반환
// POST {id, chapter}                            → 그 장만 생성·반환
// GET  ?id=<resultId>                           → 저장된 {view, content, name, birth, ...}

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import {
  isSajuApiConfigured,
  fetchSajuAnalysis,
  formatSajuToManseryeok,
  type BirthInfo,
} from "@/lib/saju/saju-api";
import { buildMyeongsikView } from "@/lib/saju/myeongsik-view";
import { parseContentJson, buildSajuImagePrompt } from "@/lib/saju/report-content";
import { buildJanyeoKunghapChapterPrompt, isJanyeoKunghapChapterReady, JANYEO_KUNGHAP_CHAPTER_SECTIONS } from "@/lib/saju/kunghap_janyeo-report-content";
import { generateInterpretation, generateSajuImage } from "@/lib/saju/llm";
import { parseDate, parseTimeVal, parseCalendar } from "@/lib/saju/local-manseryeok";
import { serverEnv } from "@/lib/env";
import { fixNamesInValue } from "@/lib/saju/fix-names";
import { calcCrossRelations } from "@/lib/saju/kunghap-cross-relations";
import { sipseongOfStem } from "@/lib/saju/sipseong-calc";
import { sendOrderSms, sendOrderEmail, sendAlimtalk } from "@/lib/order-notifications";
import { WAIT_FOR_IMAGE } from "@/lib/alimtalk-config";

export const maxDuration = 300;

const PRODUCT_SLUG = "kunghap_janyeo";
const PRODUCT_NAME = "자녀궁합";
const PRODUCT_PRICE = 29900;
const REPORT_PATH = "saju/kunghap_janyeo/report-preview";

const createSchema = z.object({
  name: z.string().optional().default(""),
  date: z.string().min(1),
  time: z.string().optional().default(""),
  calendar: z.string().optional().default("양력"),
  gender: z.string().optional().default(""),
  email: z.string().optional().default(""),
  partnerName: z.string().optional().default(""),
  partnerDate: z.string().optional().default(""),
  partnerTime: z.string().optional().default(""),
  partnerCalendar: z.string().optional().default("양력"),
  partnerGender: z.string().optional().default(""),
});
const chapterSchema = z.object({ id: z.string().min(1), chapter: z.number().int().min(1).max(30), force: z.boolean().optional().default(false) });

// 한 장 생성 (JSON 모드 + 출력 검증 + 재시도). 실패 시 throw.
async function genChapterContent(chapter: number, input: {
  name: string; gender: "male" | "female"; manseryeokText: string;
  partnerName: string; partnerGender: "male" | "female"; partnerManseryeokText: string;
  birthYear?: number;
  ilgan?: string;
  partnerIlgan?: string;
  crossRels?: { kind: string; chars: string[]; label: string }[];
  hapChungBase?: number;
  mySipseong?: string;
  partnerSipseong?: string;
}) {
  const fullName   = input.name        ?? "";
  const ptFullName = input.partnerName ?? "";
  const myLabel    = fullName.length  > 1 ? fullName.slice(1)   : fullName;
  const ptLabel    = ptFullName.length > 1 ? ptFullName.slice(1) : ptFullName;
  const ptHonorific = input.partnerGender === "male" ? "군" : "양";
  const ptWithHonorific = `${ptLabel}${ptHonorific}`;


  const { system, user } = buildJanyeoKunghapChapterPrompt(chapter, input);
  let meta = { provider: "", model: "" };
  for (let i = 0; i < 3; i++) {
    try {
      const llm = await generateInterpretation({ system, user, json: true });
      meta = { provider: llm.provider, model: llm.model };
      let obj: Record<string, unknown>;
      try {
        obj = parseContentJson(llm.text);
      } catch (parseErr) {
        console.error(`[kunghap_janyeo] ${chapter}장 JSON파싱실패 (시도${i+1}):`, parseErr instanceof Error ? parseErr.message : String(parseErr), '\nRAW:', llm.text.slice(0, 300));
        if (chapter === 12) {
          const paras = llm.text.trim().split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
          obj = { letter: { paragraphs: paras.length > 0 ? paras : [llm.text.trim()] } };
        } else { continue; }
      }
      obj = fixNamesInValue(obj, myLabel, ptLabel, ptHonorific) as Record<string, unknown>;
      if (isJanyeoKunghapChapterReady(obj, chapter)) return { obj, ...meta };
      console.error(`[kunghap_janyeo] ${chapter}장 isChapterReady 실패 (시도${i+1}):`, JSON.stringify(obj).slice(0, 500));
    } catch (e) {
      console.error(`[kunghap_janyeo] ${chapter}장 예외 (시도${i+1}):`, e);
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
    return saveContent(body.id, body.content as Record<string, unknown>, !!body.force);
  }
  if (body && typeof body.id === "string" && typeof body.chapter === "number") {
    return generateChapter(body);
  }
  return createReport(body);
}

// 병합 저장 (클라가 전 장 합본을 한 번에 저장 → 동시 쓰기 레이스 없음)
async function saveContent(id: string, content: Record<string, unknown>, skipAlimtalk = false) {
  const service = createServiceClient();
  const { data } = await service.from("saju_results").select("interpretation_md, order_id, myeongsik").eq("id", id).maybeSingle();
  let existing: Record<string, unknown> = {};
  try { existing = JSON.parse(data?.interpretation_md || "{}") || {}; } catch { existing = {}; }
  const merged = { ...existing, ...content };
  await service.from("saju_results").update({ interpretation_md: JSON.stringify(merged) }).eq("id", id);
  const totalChapters = Object.keys(JANYEO_KUNGHAP_CHAPTER_SECTIONS).map(Number);
  const allDone = totalChapters.every(n => isJanyeoKunghapChapterReady(merged, n));
  const storedMyeongsik = data?.myeongsik as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const imageReady = !!storedMyeongsik?.sajuImageUrl && !!storedMyeongsik?.partnerSajuImageUrl;
  const needsImage = WAIT_FOR_IMAGE.has(PRODUCT_SLUG);
  if (!skipAlimtalk && allDone && (!needsImage || imageReady) && data?.order_id) {
    const { data: si } = await service.from("saju_inputs").select("phone, name").eq("order_id", data.order_id).maybeSingle();
    if (si?.phone) {
      const reportUrl = `https://www.hongyeondang.com/saju/kunghap_janyeo/report-preview?id=${id}`;
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
  const { name, date, time, calendar, gender, email, partnerName, partnerDate, partnerTime, partnerCalendar, partnerGender } = parsed.data;

  const pad = (n: number | string) => String(n).padStart(2, "0");

  // 나
  const ymd = parseDate(date);
  if (!ymd) return NextResponse.json({ error: "생년월일 형식 오류" }, { status: 400 });
  const cal = parseCalendar(calendar);
  const timeVal = parseTimeVal(time);
  const hasTime = timeVal !== "unknown";
  const [hh, mm] = hasTime ? timeVal.split(":") : ["", ""];
  const g: "male" | "female" = gender === "여자" || gender === "여성" || gender === "여아" || gender === "female" ? "female" : "male";

  // 상대방 (optional)
  const pymd = partnerDate ? parseDate(partnerDate) : null;
  const pcal = parseCalendar(partnerCalendar);
  const ptimeVal = parseTimeVal(partnerTime);
  const phasTime = ptimeVal !== "unknown";
  const [phh, pmm] = phasTime ? ptimeVal.split(":") : ["", ""];
  const pg: "male" | "female" = partnerGender === "여자" || partnerGender === "여성" || partnerGender === "여아" || partnerGender === "female" ? "female" : "male";

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
    let partnerView = null;
    let partnerManseryeokText = "";
    let partnerBirth = null;

    if (pymd) {
      const partnerBirthInfo: BirthInfo = {
        birthYear: String(pymd.year),
        birthMonth: String(pymd.month),
        birthDay: String(pymd.day),
        ...(phasTime ? { birthHour: String(Number(phh)), birthMinute: String(Number(pmm)) } : {}),
        calendarType: pcal === "solar" ? "양력" : "음력",
        gender: pg,
        isLeapMonth: pcal === "leap",
      };
      const partnerAnalysis = await fetchSajuAnalysis(partnerBirthInfo, [], { source: "confirm" });
      partnerView = buildMyeongsikView(partnerAnalysis);
      partnerManseryeokText = formatSajuToManseryeok(partnerAnalysis, partnerBirthInfo);
      partnerBirth = {
        date: `${pymd.year}.${pad(pymd.month)}.${pad(pymd.day)}`,
        calendar: pcal === "solar" ? "양력" : pcal === "leap" ? "윤달" : "음력",
        time: phasTime ? `${pad(phh)}:${pad(pmm)}` : "시간 모름",
        gender: pg,
      };
    }

    const view = buildMyeongsikView(analysis);
    const myManseryeokText = formatSajuToManseryeok(analysis, birthInfo);

    const env = serverEnv();
    const llm = { provider: env.LLM_PROVIDER, model: env.LLM_MODEL };

    const birth = {
      date: `${ymd.year}.${pad(ymd.month)}.${pad(ymd.day)}`,
      calendar: cal === "solar" ? "양력" : cal === "leap" ? "윤달" : "음력",
      time: hasTime ? `${pad(hh)}:${pad(mm)}` : "시간 모름",
      gender: g,
    };

    const service = createServiceClient();

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

    const storedMyeongsik = { view, name, birth, manseryeokText: myManseryeokText, partnerManseryeokText, gender: g, partnerView, partnerName, partnerBirth, partnerGender: pg };

    const { data: result, error: resultErr } = await service
      .from("saju_results")
      .insert({ order_id: order.id, myeongsik: storedMyeongsik as never, interpretation_md: JSON.stringify({}), llm_provider: llm.provider, llm_model: llm.model })
      .select("id").single();
    if (resultErr || !result) return NextResponse.json({ error: "결과 저장 실패" }, { status: 500 });

    // SMS + 이메일 즉시 발송
    const reportUrl = `https://www.hongyeondang.com/${REPORT_PATH}?id=${result.id}`;
    sendOrderSms({ customerName: name || "고객", productName: PRODUCT_NAME, price: PRODUCT_PRICE });
    if (email) sendOrderEmail({ customerEmail: email, customerName: name || "고객", productName: PRODUCT_NAME, price: PRODUCT_PRICE, reportUrl });

    // 이미지 두 사람 각각 백그라운드 생성 (fire-and-forget)
    (async () => {
      try {
        const buffers = await Promise.all([
          generateSajuImage(buildSajuImagePrompt(view.pillars ?? []), process.env.OPENAI_API_KEY!),
          ...(partnerView?.pillars ? [generateSajuImage(buildSajuImagePrompt(partnerView.pillars), process.env.OPENAI_API_KEY!)] : []),
        ]);
        const ts = Date.now();
        const r1 = Math.random().toString(36).slice(2,8);
        const up1 = await service.storage.from("saju-images").upload(`wonguk/${ts}-${r1}.png`, buffers[0], { contentType: "image/png", upsert: false });
        const sajuImageUrl = up1.error ? null : service.storage.from("saju-images").getPublicUrl(`wonguk/${ts}-${r1}.png`).data.publicUrl;
        let partnerSajuImageUrl = null;
        if (buffers[1]) {
          const r2 = Math.random().toString(36).slice(2,8);
          const up2 = await service.storage.from("saju-images").upload(`wonguk/${ts}-${r2}.png`, buffers[1], { contentType: "image/png", upsert: false });
          partnerSajuImageUrl = up2.error ? null : service.storage.from("saju-images").getPublicUrl(`wonguk/${ts}-${r2}.png`).data.publicUrl;
        }
        await service.from("saju_results").update({ myeongsik: { ...storedMyeongsik, sajuImageUrl, partnerSajuImageUrl } as never }).eq("id", result.id);
      } catch { /* 이미지 실패 무시 */ }
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

  if (!stored?.gender && data.order_id && stored) {
    const { data: si } = await service.from("saju_inputs").select("gender").eq("order_id", data.order_id).maybeSingle();
    if (si?.gender) stored.gender = (si.gender as string) === "female" || (si.gender as string) === "여자" || (si.gender as string) === "여성" || (si.gender as string) === "여아" ? "female" : "male";
  }

  let content: Record<string, unknown> = {};
  try { content = JSON.parse(data.interpretation_md) || {}; } catch { content = {}; }

  if (!force && isJanyeoKunghapChapterReady(content, chapter)) {
    const sections: Record<string, unknown> = {};
    for (const k of JANYEO_KUNGHAP_CHAPTER_SECTIONS[chapter] ?? []) sections[k] = content[k];
    return NextResponse.json({ sections });
  }

  let manseryeokText: string | undefined = stored?.manseryeokText;
  if (!manseryeokText) {
    if (!isSajuApiConfigured()) return NextResponse.json({ error: "사주 API가 설정되지 않았습니다." }, { status: 503 });
    manseryeokText = (await loadManseryeokFromInputs(service, id)) ?? undefined;
  }
  if (!manseryeokText) return NextResponse.json({ error: "명식 정보를 찾을 수 없습니다." }, { status: 500 });

  try {
    const birthDateStr: string = stored?.birth?.date ?? "";
    const birthYear = birthDateStr ? Number(birthDateStr.split(".")[0]) : undefined;
    const ilgan: string | undefined = (stored?.view?.ilgan as string | undefined)?.split(" ")[0];
    const partnerIlgan: string | undefined = (stored?.partnerView?.ilgan as string | undefined)?.split(" ")[0];
    const crossRels = (stored?.view && stored?.partnerView)
      ? calcCrossRelations(stored.view, stored.partnerView)
      : undefined;
    const REL_SCORE: Record<string, number> = {
      "삼합": 12, "천간합": 8, "육합": 7,
      "천간충": -8, "원진": -7, "충": -6, "형": -5, "해": -4, "파": -3,
    };
    const hapChungRaw = crossRels
      ? Math.min(100, Math.max(0, crossRels.reduce((acc, r) => acc + (REL_SCORE[r.kind] ?? 0), 70)))
      : undefined;
    const hapChungBase = hapChungRaw !== undefined
      ? Math.round(Math.min(100, 50 + hapChungRaw * 0.5))
      : undefined;
    const mySipseong = (ilgan && partnerIlgan) ? sipseongOfStem(ilgan, partnerIlgan) : undefined;
    const partnerSipseong = (partnerIlgan && ilgan) ? sipseongOfStem(partnerIlgan, ilgan) : undefined;
    const { obj } = await genChapterContent(chapter, {
      name: stored?.name ?? "",
      gender: stored?.gender === "female" ? "female" : "male",
      manseryeokText,
      partnerName: stored?.partnerName ?? "",
      partnerGender: stored?.partnerGender === "female" ? "female" : "male",
      partnerManseryeokText: stored?.partnerManseryeokText ?? "",
      birthYear: birthYear || undefined,
      ilgan,
      partnerIlgan,
      crossRels,
      hapChungBase,
      mySipseong,
      partnerSipseong,
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
  return NextResponse.json({
    view: stored?.view ?? stored,
    name: stored?.name ?? "",
    birth: stored?.birth ?? null,
    gender: stored?.gender ?? "",
    sajuImageUrl: stored?.sajuImageUrl ?? null,
    content,
    partnerView: stored?.partnerView ?? null,
    partnerName: stored?.partnerName ?? "",
    partnerBirth: stored?.partnerBirth ?? null,
    partnerGender: stored?.partnerGender ?? "",
    partnerSajuImageUrl: stored?.partnerSajuImageUrl ?? null,
  });
}

// ── 이미지 재생성 ──
export async function PATCH(request: NextRequest) {
  const { id } = await request.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "id 누락" }, { status: 400 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "OpenAI 키 없음" }, { status: 503 });
  const service = createServiceClient();
  const { data, error } = await service.from("saju_results").select("myeongsik").eq("id", id).maybeSingle();
  if (error || !data) return NextResponse.json({ error: "결과를 찾을 수 없습니다." }, { status: 404 });
  const stored = data.myeongsik as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const pillars = stored?.view?.pillars ?? [];
  const partnerPillars = stored?.partnerView?.pillars ?? [];
  try {
    const ts = Date.now();
    const [imgBuffer1, imgBuffer2] = await Promise.all([
      generateSajuImage(buildSajuImagePrompt(pillars), process.env.OPENAI_API_KEY!),
      generateSajuImage(buildSajuImagePrompt(partnerPillars), process.env.OPENAI_API_KEY!),
    ]);
    const r1 = Math.random().toString(36).slice(2, 8);
    const r2 = Math.random().toString(36).slice(2, 8);
    const up1 = await service.storage.from("saju-images").upload(`wonguk/${ts}-${r1}.png`, imgBuffer1, { contentType: "image/png", upsert: false });
    const up2 = await service.storage.from("saju-images").upload(`wonguk/${ts}-${r2}.png`, imgBuffer2, { contentType: "image/png", upsert: false });
    const sajuImageUrl = up1.error ? null : service.storage.from("saju-images").getPublicUrl(`wonguk/${ts}-${r1}.png`).data.publicUrl;
    const partnerSajuImageUrl = up2.error ? null : service.storage.from("saju-images").getPublicUrl(`wonguk/${ts}-${r2}.png`).data.publicUrl;
    await service.from("saju_results").update({ myeongsik: { ...stored, sajuImageUrl, partnerSajuImageUrl } }).eq("id", id);
    const { data: resultRow } = await service.from("saju_results").select("interpretation_md, order_id").eq("id", id).maybeSingle();
    if (resultRow?.order_id && sajuImageUrl && partnerSajuImageUrl) {
      let content: Record<string, unknown> = {};
      try { content = JSON.parse(resultRow.interpretation_md) || {}; } catch { content = {}; }
      const totalChapters = Object.keys(JANYEO_KUNGHAP_CHAPTER_SECTIONS).map(Number);
      // 재생성 시에는 알림톡 미발송
    }
    return NextResponse.json({ sajuImageUrl, partnerSajuImageUrl });
  } catch (e) {
    return NextResponse.json({ error: "이미지 생성 실패", detail: String(e) }, { status: 500 });
  }
}





