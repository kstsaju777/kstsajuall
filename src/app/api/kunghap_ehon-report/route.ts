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
import { buildMyeongsikView, applyLocalSinsal } from "@/lib/saju/myeongsik-view";
import { calcCrossRelations } from "@/lib/saju/kunghap-cross-relations";
import { parseContentJson, buildSajuImagePrompt } from "@/lib/saju/report-content";
import { buildEhonKunghapChapterPrompt, isEhonKunghapChapterReady, EHON_KUNGHAP_CHAPTER_SECTIONS } from "@/lib/saju/kunghap_ehon-report-content";
import { sipseongOfStem, sipseongOfBranch } from "@/lib/saju/sipseong-calc";
import { generateInterpretation, generateSajuImage } from "@/lib/saju/llm";
import { parseDate, parseTimeVal, parseCalendar } from "@/lib/saju/local-manseryeok";
import { serverEnv } from "@/lib/env";
import { sendOrderSms, sendOrderEmail, sendAlimtalk } from "@/lib/order-notifications";
import { WAIT_FOR_IMAGE } from "@/lib/alimtalk-config";

export const maxDuration = 300;

const PRODUCT_SLUG = "kunghap_ehon";
const PRODUCT_NAME = "이혼궁합";
const PRODUCT_PRICE = 29900;
const REPORT_PATH = "saju/kunghap_ehon/report-preview";

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

// ── 이혼 시기 에너지 점수 계산 ──
const STEMS_60E  = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const BRANCHES_60E = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const GAN_KOR_60E: Record<string,string> = {甲:"갑",乙:"을",丙:"병",丁:"정",戊:"무",己:"기",庚:"경",辛:"신",壬:"임",癸:"계"};
const JI_KOR_60E:  Record<string,string> = {子:"자",丑:"축",寅:"인",卯:"묘",辰:"진",巳:"사",午:"오",未:"미",申:"신",酉:"유",戌:"술",亥:"해"};

function seunGanJiE(year: number) {
  const gan = STEMS_60E[((year - 4) % 10 + 10) % 10];
  const ji  = BRANCHES_60E[((year - 4) % 12 + 12) % 12];
  return { gan, ji };
}

type DaeunItemE = { label: string; gz: string; active: boolean; yearStart: number };

// 이혼 관점 십성 가중치 — 결혼과 반전
// 유리: 비겁(독립심), 상관·식신(기존관계파괴·새출발), 편관(결단·분리)
// 불리: 재성(재물묶임·집착), 정관(현상유지), 인성(의존·순응)
function sipseongDivorceWeight(sip: string, gender: "male" | "female"): number {
  if (gender === "male") {
    if (sip === "비견" || sip === "겁재") return 15;  // 독립심 강화
    if (sip === "상관") return 12;                    // 기존 관계 파괴·새 출발
    if (sip === "식신") return 6;
    if (sip === "편관") return 10;                    // 결단·분리
    if (sip === "정관") return -8;                    // 현상유지
    if (sip === "정재") return -15;                   // 재물·배우자 성에 집착
    if (sip === "편재") return -8;
    if (sip === "정인") return -8;                    // 의존·순응
    if (sip === "편인") return -5;
  } else {
    if (sip === "비견" || sip === "겁재") return 15;
    if (sip === "상관") return 12;
    if (sip === "식신") return 6;
    if (sip === "편관") return -8;                    // 여성: 편관은 배우자星 → 집착
    if (sip === "정관") return -15;                   // 여성: 정관은 배우자星 → 현상유지
    if (sip === "정재") return 8;
    if (sip === "편재") return 5;
    if (sip === "정인") return -8;
    if (sip === "편인") return -5;
  }
  return 0;
}

function getActiveDaeunSipsE(daeunList: DaeunItemE[], ilgan: string, year: number): { ganSip: string; jiSip: string } {
  const active = daeunList.find(d => d.yearStart <= year && year < d.yearStart + 10);
  if (!active) return { ganSip: "", jiSip: "" };
  const gz = active.gz ?? "";
  return {
    ganSip: gz[0] ? sipseongOfStem(ilgan, gz[0])   : "",
    jiSip:  gz[1] ? sipseongOfBranch(ilgan, gz[1]) : "",
  };
}

function calcSeunDivorceScores(
  myIlgan: string, ptIlgan: string,
  myGender: "male" | "female", ptGender: "male" | "female",
  myDaeun: DaeunItemE[], ptDaeun: DaeunItemE[],
  startYear: number, endYear: number
): Array<{ year: number; score: number; tone: string; label: string; myGanSip: string; myJiSip: string; ptGanSip: string; ptJiSip: string; myDaeunGanSip: string; myDaeunJiSip: string; ptDaeunGanSip: string; ptDaeunJiSip: string }> {
  const results = [];
  for (let y = startYear; y <= endYear; y++) {
    const { gan, ji } = seunGanJiE(y);
    const myGanSip = sipseongOfStem(myIlgan, gan);
    const myJiSip  = sipseongOfBranch(myIlgan, ji);
    const ptGanSip = sipseongOfStem(ptIlgan, gan);
    const ptJiSip  = sipseongOfBranch(ptIlgan, ji);

    let myScore = 50
      + sipseongDivorceWeight(myGanSip, myGender)
      + sipseongDivorceWeight(myJiSip,  myGender);
    let ptScore = 50
      + sipseongDivorceWeight(ptGanSip, ptGender)
      + sipseongDivorceWeight(ptJiSip,  ptGender);

    const myDs = getActiveDaeunSipsE(myDaeun, myIlgan, y);
    const ptDs = getActiveDaeunSipsE(ptDaeun, ptIlgan, y);
    myScore += Math.sign(sipseongDivorceWeight(myDs.ganSip, myGender)) * 5
             + Math.sign(sipseongDivorceWeight(myDs.jiSip,  myGender)) * 3;
    ptScore += Math.sign(sipseongDivorceWeight(ptDs.ganSip, ptGender)) * 5
             + Math.sign(sipseongDivorceWeight(ptDs.jiSip,  ptGender)) * 3;

    myScore = Math.min(100, Math.max(0, myScore));
    ptScore = Math.min(100, Math.max(0, ptScore));

    let combined = (myScore + ptScore) / 2;
    if (myScore >= 65 && ptScore >= 65) combined += 8;
    if (myScore <= 45 || ptScore <= 45) combined -= 5;

    const score = Math.min(100, Math.max(5, Math.round(combined)));
    const tone  = score >= 80 ? "best" : score >= 65 ? "good" : score >= 50 ? "normal" : "caution";
    const ganKor = GAN_KOR_60E[gan] ?? gan;
    const jiKor  = JI_KOR_60E[ji]  ?? ji;
    results.push({
      year: y, score, tone, label: `${y}년 ${ganKor}${jiKor}년`,
      myGanSip, myJiSip, ptGanSip, ptJiSip,
      myDaeunGanSip: myDs.ganSip, myDaeunJiSip: myDs.jiSip,
      ptDaeunGanSip: ptDs.ganSip, ptDaeunJiSip: ptDs.jiSip,
    });
  }
  return results;
}

const REF_YEAR_E = 2026;

// 재물운 가중치 — 재물십성(재성/편재/정재/식신/상관) 강도
const SIPSEONG_WEALTH: Record<string, number> = {
  편재: 90, 정재: 86, 재성: 88, 식신: 80, 상관: 78,
  정인: 68, 인성: 65, 편인: 62, 정관: 62, 관성: 60,
  편관: 58, 비견: 56, 비겁: 55, 겁재: 54,
};
const STEM_EL_W: Record<string,string>   = { 甲:"목",乙:"목",丙:"화",丁:"화",戊:"토",己:"토",庚:"금",辛:"금",壬:"수",癸:"수" };
const BRANCH_EL_W: Record<string,string> = { 子:"수",丑:"토",寅:"목",卯:"목",辰:"토",巳:"화",午:"화",未:"토",申:"금",酉:"금",戌:"토",亥:"수" };
const GEN_W: Record<string,string> = { 목:"화",화:"토",토:"금",금:"수",수:"목" };
const CTL_W: Record<string,string> = { 목:"토",화:"금",토:"수",금:"목",수:"화" };
function toSipseongW(ilEl: string, tEl: string): string {
  if (ilEl === tEl) return "비겁";
  if (GEN_W[ilEl] === tEl) return "식상";
  if (CTL_W[ilEl] === tEl) return "재성";
  if (CTL_W[tEl] === ilEl) return "관성";
  if (GEN_W[tEl] === ilEl) return "인성";
  return "비겁";
}
function calcWealthScores(
  ilgan: string,
  seunList: Array<{ label: string; gz: string }>,
  startYear: number, endYear: number
): Array<{ year: number; score: number; tone: string; label: string }> {
  const ilEl = STEM_EL_W[ilgan] ?? "목";
  const GANJIS = ["甲子","乙丑","丙寅","丁卯","戊辰","己巳","庚午","辛未","壬申","癸酉","甲戌","乙亥","丙子","丁丑","戊寅","己卯","庚辰","辛巳","壬午","癸未","甲申","乙酉","丙戌","丁亥","戊子","己丑","庚寅","辛卯","壬辰","癸巳","甲午","乙未","丙申","丁酉","戊戌","己亥","庚子","辛丑","壬寅","癸卯","甲辰","乙巳","丙午","丁未","戊申","己酉","庚戌","辛亥","壬子","癸丑","甲寅","乙卯","丙辰","丁巳","戊午","己未","庚申","辛酉","壬戌","癸亥"];
  const seunMap: Record<number,string> = {};
  seunList.forEach(s => { const y = Number(s.label); if (y >= startYear && y <= endYear) seunMap[y] = s.gz; });
  const baseIdx = GANJIS.indexOf("甲辰");
  const results = [];
  for (let y = startYear; y <= endYear; y++) {
    const gz = seunMap[y] ?? GANJIS[(baseIdx + (y - 2024)) % 60];
    const sEl = STEM_EL_W[gz[0]]; const bEl = BRANCH_EL_W[gz[1]];
    const sScore = sEl ? (SIPSEONG_WEALTH[toSipseongW(ilEl, sEl)] ?? 65) : 65;
    const bScore = bEl ? (SIPSEONG_WEALTH[toSipseongW(ilEl, bEl)] ?? 65) : 65;
    const score  = Math.min(95, Math.max(40, Math.round(sScore * 0.6 + bScore * 0.4)));
    const tone   = score >= 80 ? "best" : score >= 68 ? "good" : score >= 55 ? "normal" : "caution";
    const { gan, ji } = seunGanJiE(y);
    const ganKor = GAN_KOR_60E[gan] ?? gan;
    const jiKor  = JI_KOR_60E[ji]  ?? ji;
    results.push({ year: y, score, tone, label: `${y}년 ${ganKor}${jiKor}년` });
  }
  return results;
}

// 한 장 생성 (JSON 모드 + 출력 검증 + 재시도). 실패 시 throw.
async function genChapterContent(chapter: number, input: {
  name: string; gender: "male" | "female"; manseryeokText: string;
  partnerName: string; partnerGender: "male" | "female"; partnerManseryeokText: string;
  birthYear?: number;
  ch3Summary?: Record<string, unknown>;
  timingScores?: Array<{ year: number; score: number; tone: string; label: string; myGanSip?: string; myJiSip?: string; ptGanSip?: string; ptJiSip?: string; myDaeunGanSip?: string; myDaeunJiSip?: string; ptDaeunGanSip?: string; ptDaeunJiSip?: string }>;
  wealthScores?: { my: Array<{ year: number; score: number; tone: string; label: string }>; pt: Array<{ year: number; score: number; tone: string; label: string }> };
  mySiju?: { gan: string; ganEl: string; ji: string; jiEl: string; sipTop: string; sipBot: string };
  partnerSiju?: { gan: string; ganEl: string; ji: string; jiEl: string; sipTop: string; sipBot: string };
  myProfile7?: { pillars: Array<{ pos: string; gan: string; ganEl: string; sipTop: string; ji: string; jiEl: string; sipBot: string }>; currentDaeun: { label: string; gz: string; sipTop: string; sipBot: string; yearStart: number } | null };
  partnerProfile7?: { pillars: Array<{ pos: string; gan: string; ganEl: string; sipTop: string; ji: string; jiEl: string; sipBot: string }>; currentDaeun: { label: string; gz: string; sipTop: string; sipBot: string; yearStart: number } | null };
  reconcileScore?: number;
  reconcileEnablers?: Array<{ kind: string; label: string; meaning: string }>;
  reconcileBarriers?: Array<{ kind: string; label: string; meaning: string }>;
}) {
  const { system, user } = buildEhonKunghapChapterPrompt(chapter, input);
  let meta = { provider: "", model: "" };
  for (let i = 0; i < 3; i++) {
    try {
      const llm = await generateInterpretation({ system, user, json: true });
      meta = { provider: llm.provider, model: llm.model };
      let obj: Record<string, unknown>;
      try {
        obj = parseContentJson(llm.text);
      } catch (parseErr) {
        console.error(`[kunghap_ehon] ${chapter}장 JSON파싱실패 (시도${i+1}):`, parseErr instanceof Error ? parseErr.message : String(parseErr), '\nRAW:', llm.text.slice(0, 300));
        if (chapter === 12) {
          const paras = llm.text.trim().split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
          obj = { letter: { paragraphs: paras.length > 0 ? paras : [llm.text.trim()] } };
        } else {
          continue;
        }
      }
      if (isEhonKunghapChapterReady(obj, chapter)) return { obj, ...meta };
      console.error(`[kunghap_ehon] ${chapter}장 isChapterReady 실패 (시도${i+1}):`, JSON.stringify(obj).slice(0, 500));
    } catch (e) {
      console.error(`[kunghap_ehon] ${chapter}장 예외 (시도${i+1}):`, e);
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
  const totalChapters = Object.keys(EHON_KUNGHAP_CHAPTER_SECTIONS).map(Number);
  const allDone = totalChapters.every(n => isEhonKunghapChapterReady(merged, n));
  const storedMyeongsik = data?.myeongsik as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const imageReady = !!storedMyeongsik?.sajuImageUrl && !!storedMyeongsik?.partnerSajuImageUrl;
  const needsImage = WAIT_FOR_IMAGE.has(PRODUCT_SLUG);
  if (!skipAlimtalk && allDone && (!needsImage || imageReady) && data?.order_id) {
    const { data: si } = await service.from("saju_inputs").select("phone, name").eq("order_id", data.order_id).maybeSingle();
    if (si?.phone) {
      const reportUrl = `https://www.hongyeondang.com/saju/kunghap_ehon/report-preview?id=${id}`;
      await sendAlimtalk({ customerPhone: si.phone, customerName: si.name ?? "고객", resultUrl: reportUrl });
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

  if (!force && isEhonKunghapChapterReady(content, chapter)) {
    const sections: Record<string, unknown> = {};
    for (const k of EHON_KUNGHAP_CHAPTER_SECTIONS[chapter] ?? []) sections[k] = content[k];
    return NextResponse.json({ sections });
  }

  const manseryeokText: string | undefined = stored?.manseryeokText;
  const partnerManseryeokText: string | undefined = stored?.partnerManseryeokText;
  if (!manseryeokText) return NextResponse.json({ error: "명식 정보를 찾을 수 없습니다." }, { status: 500 });

  try {
    const birthDateStr: string = stored?.birth?.date ?? "";
    const birthYear = birthDateStr ? Number(birthDateStr.split(".")[0]) : undefined;
    let ch3Summary: Record<string, unknown> | undefined;
    if (chapter >= 4 && stored?.view?.pillars && stored?.partnerView?.pillars) {
      const crossRels = calcCrossRelations(stored.view, stored.partnerView);
      const hapRels   = crossRels.filter(r => r.kind === "천간합" || r.kind === "육합" || r.kind === "삼합");
      const tensionRels = crossRels.filter(r => r.kind !== "천간합" && r.kind !== "육합" && r.kind !== "삼합");
      ch3Summary = {
        hapCount: hapRels.length,
        tensionCount: tensionRels.length,
        hapList: hapRels.map(r => `${r.label}(${r.kind})`),
        tensionList: tensionRels.map(r => `${r.label}(${r.kind})`),
      };
    }

    // ch6: 시주 확정값 추출
    type SijuData = { gan: string; ganEl: string; ji: string; jiEl: string; sipTop: string; sipBot: string };
    let mySiju: SijuData | undefined;
    let partnerSiju: SijuData | undefined;
    if (chapter === 6) {
      const myPillars = stored?.view?.pillars as Array<{ pos: string; gan: string; ganEl: string; ji: string; jiEl: string; sipTop: string; sipBot: string }> | undefined;
      const ptPillars = stored?.partnerView?.pillars as typeof myPillars;
      const mySijuP = myPillars?.find(p => p.pos === "시주");
      const ptSijuP = ptPillars?.find(p => p.pos === "시주");
      if (mySijuP) mySiju = { gan: mySijuP.gan, ganEl: mySijuP.ganEl, ji: mySijuP.ji, jiEl: mySijuP.jiEl, sipTop: mySijuP.sipTop, sipBot: mySijuP.sipBot };
      if (ptSijuP) partnerSiju = { gan: ptSijuP.gan, ganEl: ptSijuP.ganEl, ji: ptSijuP.ji, jiEl: ptSijuP.jiEl, sipTop: ptSijuP.sipTop, sipBot: ptSijuP.sipBot };
    }

    // ch6·ch7: 세운 흐름 점수 서버 계산
    let wealthScores: { my: Array<{ year: number; score: number; tone: string; label: string }>; pt: Array<{ year: number; score: number; tone: string; label: string }> } | undefined;
    if (chapter === 6 || chapter === 7) {
      const ilgan   = (stored?.view?.ilgan        as string | undefined)?.[0];
      const ptIlgan = (stored?.partnerView?.ilgan as string | undefined)?.[0];
      if (ilgan && ptIlgan) {
        wealthScores = {
          my: calcWealthScores(ilgan,   (stored?.view?.seun        ?? []) as Array<{ label: string; gz: string }>, REF_YEAR_E, REF_YEAR_E + 9),
          pt: calcWealthScores(ptIlgan, (stored?.partnerView?.seun ?? []) as Array<{ label: string; gz: string }>, REF_YEAR_E, REF_YEAR_E + 9),
        };
      }
    }

    // ch8: 재결합 가능성 점수 + 합충 분류 서버 계산
    let reconcileScore: number | undefined;
    type ReconcileRelItem = { kind: string; label: string; meaning: string };
    let reconcileEnablers: ReconcileRelItem[] | undefined;
    let reconcileBarriers: ReconcileRelItem[] | undefined;
    if (chapter === 8) {
      if (ch3Summary) {
        const ch3OverallScore = (content?.overallScore as Record<string, unknown> | undefined)?.score as number | undefined;
        if (ch3OverallScore !== undefined) {
          const hapCount     = (ch3Summary.hapCount     as number) ?? 0;
          const tensionCount = (ch3Summary.tensionCount as number) ?? 0;
          const base    = 100 - ch3OverallScore;
          const bonus   = hapCount * 5;
          const penalty = tensionCount * 3;
          reconcileScore = Math.min(95, Math.max(5, Math.round(base + bonus - penalty)));
        }
      }
      // 합충 유형별 분류 및 재결합 의미 주입
      if (stored?.view?.pillars && stored?.partnerView?.pillars) {
        const crossRels = calcCrossRelations(stored.view, stored.partnerView);
        const ENABLER_MEANING: Record<string, string> = {
          "천간합": "두 사람의 천간이 서로 합하여 끌어당기는 인력이 있소. 마음이 통하고 생각이 맞닿는 기운으로, 갈등 속에서도 서로를 이해하는 힘이 남아 있소.",
          "육합":   "지지가 합하여 생활 리듬과 감정 기반이 자연스럽게 맞닿는 기운이오. 함께 있을 때 편안함을 느끼게 하는 인연의 실이오.",
          "삼합":   "지지 삼합으로 두 사람이 같은 방향을 향하는 강한 연대감이 있소. 같은 목표를 품을 때 시너지가 발생하는 기운이오.",
        };
        const BARRIER_MEANING: Record<string, string> = {
          "천간충": "천간이 서로 충돌하여 생각과 의지가 정면으로 부딪히오. 대화할수록 의견이 엇갈리고 서로를 이해하기 어렵게 만드는 기운이오.",
          "충":     "지지가 충돌하여 생활 방식과 감정의 기반이 흔들리오. 함께할수록 불안과 갈등이 누적되기 쉬운 구조이오.",
          "형":     "지지가 형을 이루어 반복적인 마찰과 상처를 만드는 기운이오. 같은 갈등이 해소되지 않고 되풀이되는 패턴이 나타나오.",
          "파":     "지지가 파를 이루어 신뢰와 안정감이 조금씩 무너지는 기운이오. 작은 균열이 쌓여 관계의 기반을 약하게 만드오.",
          "해":     "지지가 해를 이루어 서로를 불편하게 하고 감정적 거리감을 만드는 기운이오. 함께 있을수록 답답함이 쌓이기 쉬운 구조이오.",
          "원진":   "서로 등을 돌리게 만드는 냉각의 기운이오. 가까울수록 서로의 단점이 크게 느껴지고 멀어지고 싶어지는 기운이오.",
        };
        const ENABLER_KINDS = new Set(["천간합", "육합", "삼합"]);
        reconcileEnablers = crossRels
          .filter(r => ENABLER_KINDS.has(r.kind))
          .map(r => ({ kind: r.kind, label: r.label, meaning: ENABLER_MEANING[r.kind] ?? "" }));
        reconcileBarriers = crossRels
          .filter(r => !ENABLER_KINDS.has(r.kind))
          .map(r => ({ kind: r.kind, label: r.label, meaning: BARRIER_MEANING[r.kind] ?? "" }));
      }
    }

    // ch7: 원국 전체 십성 + 현재 대운 확정값 추출
    type PillarData = { pos: string; gan: string; ganEl: string; sipTop: string; ji: string; jiEl: string; sipBot: string };
    type DaeunData  = { label: string; gz: string; sipTop: string; sipBot: string; active: boolean; yearStart: number };
    type Ch7ProfileData = { pillars: PillarData[]; currentDaeun: DaeunData | null };
    let myProfile7: Ch7ProfileData | undefined;
    let partnerProfile7: Ch7ProfileData | undefined;
    if (chapter === 7) {
      const extractProfile = (view: Record<string, unknown> | undefined): Ch7ProfileData => {
        const pillars = ((view?.pillars ?? []) as PillarData[]).map(p => ({
          pos: p.pos, gan: p.gan, ganEl: p.ganEl, sipTop: p.sipTop,
          ji: p.ji, jiEl: p.jiEl, sipBot: p.sipBot,
        }));
        const daeunList = (view?.daeun ?? []) as DaeunData[];
        const currentDaeun = daeunList.find(d => d.active) ?? null;
        return { pillars, currentDaeun };
      };
      myProfile7      = extractProfile(stored?.view      as Record<string, unknown> | undefined);
      partnerProfile7 = extractProfile(stored?.partnerView as Record<string, unknown> | undefined);
    }

    // ch5: 이혼 시기 에너지 점수 서버 계산
    let timingScores: Array<{ year: number; score: number; tone: string; label: string }> | undefined;
    if (chapter === 5) {
      const ilgan   = (stored?.view?.ilgan        as string | undefined)?.[0];
      const ptIlgan = (stored?.partnerView?.ilgan as string | undefined)?.[0];
      if (ilgan && ptIlgan) {
        timingScores = calcSeunDivorceScores(
          ilgan, ptIlgan,
          stored?.gender === "female" ? "female" : "male",
          stored?.partnerGender === "female" ? "female" : "male",
          (stored?.view?.daeun        ?? []) as DaeunItemE[],
          (stored?.partnerView?.daeun ?? []) as DaeunItemE[],
          REF_YEAR_E, REF_YEAR_E + 9
        );
      }
    }

    const fullName  = stored?.name        ?? "";
    const ptFullName = stored?.partnerName ?? "";
    const myLabel   = fullName.length  > 1 ? fullName.slice(1)   : fullName;
    const ptLabel   = ptFullName.length > 1 ? ptFullName.slice(1) : ptFullName;

    // 이름 토큰 교체 + AI가 토큰 무시하고 이름 직접 썼을 때 교정
    const fixNames = (s: string): string => {
      let r = s;
      // 1) 토큰 교체
      r = r.replace(/__MY__/g, `${myLabel}님`).replace(/__PT__/g, `${ptLabel}님`);
      // 2) AI가 이름 마지막 글자를 조사로 착각해 자른 경우 복원
      for (const label of [myLabel, ptLabel]) {
        if (label.length < 2) continue;
        const stem = label.slice(0, -1); // "채은" → "채"
        const esc = stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        r = r
          .replace(new RegExp(`${esc}는님`, "g"), `${label}님`)  // "채는님" → "채은님"
          .replace(new RegExp(`${esc}가님`, "g"), `${label}님`)  // "채가님" → "채은님"
          .replace(new RegExp(`${esc}는(?!님)`, "g"), `${label}님은`)
          .replace(new RegExp(`${esc}가(?!님)`, "g"), `${label}님이`)
          .replace(new RegExp(`${esc}를(?!님)`, "g"), `${label}님을`);
      }
      return r;
    };

    const fixKoreanWords = (val: unknown): unknown => {
      if (typeof val === "string") return fixNames(val
        .replace(/(?<![가-힣])가[를름]/g, "가을")
        .replace(/(?<![가-힣])여[를름]/g, "여름")
      // AI가 합성어 내 '과'를 조사규칙 혼용으로 '와'로 잘못 쓰는 경우 교정
      .replace(/효와/g, "효과")   // 효과적 → 효와적
      .replace(/교와/g, "교과"));
      if (Array.isArray(val)) return val.map(fixKoreanWords);
      if (val && typeof val === "object") return Object.fromEntries(Object.entries(val as Record<string, unknown>).map(([k, v]) => [k, fixKoreanWords(v)]));
      return val;
    };

    const { obj: rawObj } = await genChapterContent(chapter, {
      name: fullName,
      gender: stored?.gender === "female" ? "female" : "male",
      manseryeokText,
      partnerName: stored?.partnerName ?? "",
      partnerGender: stored?.partnerGender === "female" ? "female" : "male",
      partnerManseryeokText: partnerManseryeokText ?? "",
      birthYear: birthYear || undefined,
      ch3Summary,
      timingScores,
      wealthScores,
      mySiju,
      partnerSiju,
      myProfile7,
      partnerProfile7,
      reconcileScore,
      reconcileEnablers,
      reconcileBarriers,
    });

    const obj = fixKoreanWords(rawObj) as typeof rawObj;
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
    return NextResponse.json({ sajuImageUrl, partnerSajuImageUrl });
  } catch (e) {
    return NextResponse.json({ error: "이미지 생성 실패", detail: String(e) }, { status: 500 });
  }
}

