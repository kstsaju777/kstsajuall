// =====================================================
// 결혼궁합 결과지 생성 + 저장 API (장별 온디맨드)
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
import { buildGyeolhonKunghapChapterPrompt, isGyeolhonKunghapChapterReady, GYEOLHON_KUNGHAP_CHAPTER_SECTIONS } from "@/lib/saju/kunghap_gyeolhon-report-content";
import { sipseongOfStem, sipseongOfBranch } from "@/lib/saju/sipseong-calc";
import { generateInterpretation, generateSajuImage } from "@/lib/saju/llm";
import { parseDate, parseTimeVal, parseCalendar } from "@/lib/saju/local-manseryeok";
import { serverEnv } from "@/lib/env";
import { sendOrderSms, sendOrderEmail, sendAlimtalk } from "@/lib/order-notifications";
import { WAIT_FOR_IMAGE } from "@/lib/alimtalk-config";

export const maxDuration = 300;

const PRODUCT_SLUG = "kunghap_gyeolhon";
const PRODUCT_NAME = "결혼궁합";
const PRODUCT_PRICE = 29900;
const REPORT_PATH = "saju/kunghap_gyeolhon/report-preview";

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
  concerns: z.array(z.string()).optional().default([]),
});
const chapterSchema = z.object({ id: z.string().min(1), chapter: z.number().int().min(1).max(30), force: z.boolean().optional().default(false) });

// ── 대운·세운 계산 헬퍼 ──
const STEMS_60  = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const BRANCHES_60 = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const GAN_KOR_60: Record<string,string> = {甲:"갑",乙:"을",丙:"병",丁:"정",戊:"무",己:"기",庚:"경",辛:"신",壬:"임",癸:"계"};
const JI_KOR_60:  Record<string,string> = {子:"자",丑:"축",寅:"인",卯:"묘",辰:"진",巳:"사",午:"오",未:"미",申:"신",酉:"유",戌:"술",亥:"해"};

function seunGanJiG(year: number) {
  const gan = STEMS_60[((year - 4) % 10 + 10) % 10];
  const ji  = BRANCHES_60[((year - 4) % 12 + 12) % 12];
  return { gan, ji };
}

type DaeunItemG = { label: string; gz: string; active: boolean; yearStart: number };

function buildFullDaeunTableG(daeunList: DaeunItemG[], myIlgan: string, personLabel: string, refYear: number): string {
  if (!daeunList.length || !myIlgan) return "";
  const rows = daeunList.map(d => {
    const gz = d.gz ?? "";
    const gan = gz[0] ?? "";
    const ji  = gz[1] ?? "";
    const ganKor = GAN_KOR_60[gan] ?? gan;
    const jiKor  = JI_KOR_60 [ji]  ?? ji;
    const ganSip = gan ? sipseongOfStem(myIlgan, gan)   : "-";
    const jiSip  = ji  ? sipseongOfBranch(myIlgan, ji)  : "-";
    const active = d.yearStart <= refYear && (d.yearStart + 10) > refYear;
    const pos = (() => {
      const offset = refYear - d.yearStart;
      if (offset < 0) return "미래";
      if (offset < 3)  return "초반";
      if (offset < 7)  return "중반";
      return "후반";
    })();
    const marker = active ? `★현재(${pos})` : (d.yearStart > refYear ? `(${d.yearStart}년~)` : "(과거)");
    return `  ${d.label ?? ""} ${ganKor}${jiKor}(${gz}) 대운: 천간→${ganSip} / 지지→${jiSip} ${marker}`;
  });
  return `[${personLabel} 대운 전체 십성 — 서버 계산 확정값]\n${rows.join("\n")}`;
}

function buildSeunTableG(myIlgan: string, ptIlgan: string, myLabel: string, ptLabel: string, startYear: number, endYear: number): string {
  if (!myIlgan || !ptIlgan) return "";
  const rows: string[] = [];
  for (let y = startYear; y <= endYear; y++) {
    const { gan, ji } = seunGanJiG(y);
    const ganKor = GAN_KOR_60[gan] ?? gan;
    const jiKor  = JI_KOR_60 [ji]  ?? ji;
    const myGanSip = sipseongOfStem(myIlgan, gan);
    const myJiSip  = sipseongOfBranch(myIlgan, ji);
    const ptGanSip = sipseongOfStem(ptIlgan, gan);
    const ptJiSip  = sipseongOfBranch(ptIlgan, ji);
    rows.push(`  ${y}년 ${ganKor}${jiKor}(${gan}${ji}): ${myLabel} 천간→${myGanSip}/지지→${myJiSip} | ${ptLabel} 천간→${ptGanSip}/지지→${ptJiSip}`);
  }
  return `[${startYear}~${endYear}년 세운 십성 — 서버 계산 확정값. 임의 변경 절대 금지]\n${rows.join("\n")}`;
}

// 한 장 생성 (JSON 모드 + 출력 검증 + 3회 재시도). 실패 시 throw.
async function genChapterContent(chapter: number, input: {
  name: string; gender: "male" | "female"; manseryeokText: string;
  partnerName: string; concern?: string; partnerGender: "male" | "female"; partnerManseryeokText: string;
  birthYear?: number;
  ilgan?: string;
  partnerIlgan?: string;
  ilganFull?: string;
  partnerIlganFull?: string;
  ohaengSummary?: string;
  partnerOhaengSummary?: string;
  mySipseong?: string;
  partnerSipseong?: string;
  myPillars?: Array<{ pos?: string; gan?: string; ji?: string }>;
  partnerPillars?: Array<{ pos?: string; gan?: string; ji?: string }>;
  daeunSeunContext?: string;
}) {
  const { system, user } = buildGyeolhonKunghapChapterPrompt(chapter, input);
  let meta = { provider: "", model: "" };
  for (let i = 0; i < 3; i++) {
    try {
      const llm = await generateInterpretation({ system, user, json: true });
      meta = { provider: llm.provider, model: llm.model };
      let obj: Record<string, unknown>;
      try {
        obj = parseContentJson(llm.text);
      } catch (parseErr) {
        console.error(`[kunghap_gyeolhon] ${chapter}장 JSON파싱실패 (시도${i+1}):`, parseErr instanceof Error ? parseErr.message : String(parseErr), '\nRAW:', llm.text.slice(0, 300));
        if (chapter === 12) {
          const paras = llm.text.trim().split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
          obj = { letter: { paragraphs: paras.length > 0 ? paras : [llm.text.trim()] } };
        } else {
          continue;
        }
      }
      if (isGyeolhonKunghapChapterReady(obj, chapter)) return { obj, ...meta };
      console.error(`[kunghap_gyeolhon] ${chapter}장 isChapterReady 실패 (시도${i+1}):`, JSON.stringify(obj).slice(0, 500));
    } catch (e) {
      console.error(`[kunghap_gyeolhon] ${chapter}장 예외 (시도${i+1}):`, e);
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

// 상대방 만세력 미저장 시 stored.partnerBirth / partnerGender 로 재호출
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadPartnerManseryeokFromStored(stored: any): Promise<string | null> {
  const pb = stored?.partnerBirth;
  if (!pb?.date) return null;
  const [y, m, d] = String(pb.date).split(".");
  const hasTime = pb.time && pb.time !== "시간 모름";
  const [hh, mm] = hasTime ? String(pb.time).split(":") : ["", ""];
  const calendarType = (pb.calendar === "양력" ? "양력" : pb.calendar === "윤달" ? "윤달" : "음력") as BirthInfo["calendarType"];
  const gender: "male" | "female" = stored?.partnerGender === "female" ? "female" : "male";
  const birthInfo: BirthInfo = {
    birthYear: y,
    birthMonth: String(Number(m)),
    birthDay: String(Number(d)),
    ...(hasTime ? { birthHour: String(Number(hh)), birthMinute: String(Number(mm)) } : {}),
    calendarType,
    gender,
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
  const totalChapters = Object.keys(GYEOLHON_KUNGHAP_CHAPTER_SECTIONS).map(Number);
  const allDone = totalChapters.every(n => isGyeolhonKunghapChapterReady(merged, n));
  const storedMyeongsik = data?.myeongsik as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const imageReady = !!storedMyeongsik?.sajuImageUrl;
  const needsImage = WAIT_FOR_IMAGE.has(PRODUCT_SLUG);
  if (!skipAlimtalk && allDone && (!needsImage || imageReady) && data?.order_id) {
    const { data: si } = await service.from("saju_inputs").select("phone, name").eq("order_id", data.order_id).maybeSingle();
    if (si?.phone) {
      const reportUrl = `https://www.hongyeondang.com/saju/kunghap_gyeolhon/report-preview?id=${id}`;
      sendAlimtalk({ customerPhone: si.phone, customerName: si.name ?? "고객", resultUrl: reportUrl });
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
  const { name, date, time, calendar, gender, email, partnerName, partnerDate, partnerTime, partnerCalendar, partnerGender, concerns } = parsed.data;

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
    const manseryeokText = myManseryeokText;

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
      calendar: cal === "solar" ? "solar" : "lunar", concerns,
    });

    const storedMyeongsik = { view, "{이름1}": name, birth, "{명식표1}": manseryeokText, "{명식표2}": partnerManseryeokText, "{고민}": concerns[0] ?? "", gender: g, partnerView, "{이름2}": partnerName, partnerBirth, partnerGender: pg };

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

  if (!force && isGyeolhonKunghapChapterReady(content, chapter)) {
    const sections: Record<string, unknown> = {};
    for (const k of GYEOLHON_KUNGHAP_CHAPTER_SECTIONS[chapter] ?? []) sections[k] = content[k];
    return NextResponse.json({ sections });
  }

  if (!isSajuApiConfigured()) return NextResponse.json({ error: "사주 API가 설정되지 않았습니다." }, { status: 503 });

  let manseryeokText: string | undefined = stored?.["{명식표1}"] || stored?.manseryeokText;
  if (!manseryeokText) {
    manseryeokText = (await loadManseryeokFromInputs(service, id)) ?? undefined;
  }
  if (!manseryeokText) return NextResponse.json({ error: "명식 정보를 찾을 수 없습니다." }, { status: 500 });

  let partnerManseryeokText: string | undefined = stored?.["{명식표2}"] || stored?.partnerManseryeokText || undefined;
  if (!partnerManseryeokText) {
    partnerManseryeokText = (await loadPartnerManseryeokFromStored(stored)) ?? undefined;
  }
  if (!partnerManseryeokText) return NextResponse.json({ error: "상대방 명식 정보를 찾을 수 없습니다." }, { status: 500 });

  try {
    const birthDateStr: string = stored?.birth?.date ?? "";
    const birthYear = birthDateStr ? Number(birthDateStr.split(".")[0]) : undefined;

    // 일간 추출
    const ilgan: string | undefined = stored?.view?.ilgan ?? undefined;
    const partnerIlgan: string | undefined = stored?.partnerView?.ilgan ?? undefined;
    const ilganFull: string | undefined = (() => {
      const p = (stored?.view?.pillars ?? []).find((x: { pos?: string }) => x.pos === "일주");
      return p ? `${p.gan ?? ""}${p.ji ?? ""}` : undefined;
    })();
    const partnerIlganFull: string | undefined = (() => {
      const p = (stored?.partnerView?.pillars ?? []).find((x: { pos?: string }) => x.pos === "일주");
      return p ? `${p.gan ?? ""}${p.ji ?? ""}` : undefined;
    })();

    // 오행 요약
    const ohaengSummary: string | undefined = (() => {
      const dist = stored?.view?.ohaengDist as Record<string,number> | undefined;
      if (!dist) return undefined;
      return Object.entries(dist).map(([k,v]) => `${k}:${v}`).join(" ");
    })();
    const partnerOhaengSummary: string | undefined = (() => {
      const dist = stored?.partnerView?.ohaengDist as Record<string,number> | undefined;
      if (!dist) return undefined;
      return Object.entries(dist).map(([k,v]) => `${k}:${v}`).join(" ");
    })();

    // 십성 요약 (내 일간 기준 상대방 기둥 십성)
    const mySipseong: string | undefined = (() => {
      if (!ilgan || !stored?.partnerView?.pillars) return undefined;
      const pillars = stored.partnerView.pillars as Array<{ pos?: string; gan?: string; ji?: string }>;
      return pillars.map(p => {
        const gs = p.gan ? sipseongOfStem(ilgan, p.gan) : "-";
        const js = p.ji  ? sipseongOfBranch(ilgan, p.ji) : "-";
        return `${p.pos ?? ""}(${p.gan ?? ""}${p.ji ?? ""}: 천간→${gs}/지지→${js})`;
      }).join(", ");
    })();
    const partnerSipseong: string | undefined = (() => {
      if (!partnerIlgan || !stored?.view?.pillars) return undefined;
      const pillars = stored.view.pillars as Array<{ pos?: string; gan?: string; ji?: string }>;
      return pillars.map(p => {
        const gs = p.gan ? sipseongOfStem(partnerIlgan, p.gan) : "-";
        const js = p.ji  ? sipseongOfBranch(partnerIlgan, p.ji) : "-";
        return `${p.pos ?? ""}(${p.gan ?? ""}${p.ji ?? ""}: 천간→${gs}/지지→${js})`;
      }).join(", ");
    })();

    // 대운·세운 컨텍스트 (9장·10장에만)
    const myFirstName = (stored?.["{이름1}"] || stored?.name || "").slice(1) || (stored?.["{이름1}"] || stored?.name || "");
    const ptFirstName = (stored?.["{이름2}"] || stored?.partnerName || "").slice(1) || (stored?.["{이름2}"] || stored?.partnerName || "");
    const REF_YEAR = 2026;
    let daeunSeunContext: string | undefined;
    if ((chapter === 9 || chapter === 10) && ilgan && partnerIlgan) {
      const myDaeunTable = buildFullDaeunTableG(stored?.view?.daeun ?? [], ilgan, `${myFirstName}님`, REF_YEAR);
      const ptDaeunTable = buildFullDaeunTableG(stored?.partnerView?.daeun ?? [], partnerIlgan, `${ptFirstName}님`, REF_YEAR);
      const seunTable    = buildSeunTableG(ilgan, partnerIlgan, `${myFirstName}님`, `${ptFirstName}님`, REF_YEAR, REF_YEAR + 8);
      const parts = [myDaeunTable, ptDaeunTable, seunTable].filter(Boolean);
      if (parts.length) {
        daeunSeunContext = `\n⚠️ [대운·세운 서버 계산 확정값 — 반드시 이 값만 사용. 임의 추론·재계산 절대 금지]\n${parts.join("\n\n")}\n위 확정값을 근거로 시기별 기운을 서술하시오.`;
      }
    }

    const { obj } = await genChapterContent(chapter, {
      name: stored?.["{이름1}"] || stored?.name || "",
      gender: stored?.gender === "female" ? "female" : "male",
      manseryeokText,
      partnerName: stored?.["{이름2}"] || stored?.partnerName || "",
      concern: stored?.["{고민}"] || "",
      partnerGender: stored?.partnerGender === "female" ? "female" : "male",
      partnerManseryeokText,
      birthYear: birthYear || undefined,
      ilgan,
      partnerIlgan,
      ilganFull,
      partnerIlganFull,
      ohaengSummary,
      partnerOhaengSummary,
      mySipseong,
      partnerSipseong,
      myPillars: stored?.view?.pillars ?? [],
      partnerPillars: stored?.partnerView?.pillars ?? [],
      daeunSeunContext,
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
    name: stored?.["{이름1}"] || stored?.name || "",
    birth: stored?.birth ?? null,
    gender: stored?.gender ?? "",
    sajuImageUrl: stored?.sajuImageUrl ?? null,
    content,
    partnerView: stored?.partnerView ?? null,
    partnerName: stored?.["{이름2}"] || stored?.partnerName || "",
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
