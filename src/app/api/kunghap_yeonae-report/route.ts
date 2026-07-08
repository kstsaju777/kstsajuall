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
import { buildYeonaeKunghapChapterPrompt, isYeonaeKunghapChapterReady, YEONAE_KUNGHAP_CHAPTER_SECTIONS } from "@/lib/saju/kunghap_yeonae-report-content";
import { generateInterpretation, generateSajuImage } from "@/lib/saju/llm";
import { parseDate, parseTimeVal, parseCalendar } from "@/lib/saju/local-manseryeok";
import { sipseongOfStem, sipseongOfBranch } from "@/lib/saju/sipseong-calc";
import { serverEnv } from "@/lib/env";
import { sendOrderSms, sendOrderEmail, sendAlimtalk } from "@/lib/order-notifications";
import { WAIT_FOR_IMAGE } from "@/lib/alimtalk-config";

export const maxDuration = 300;

// 합충 점수 계산 (ch10 프롬프트 주입용)
const HANJA_KOR: Record<string,string> = {
  "甲":"갑","乙":"을","丙":"병","丁":"정","戊":"무","己":"기","庚":"경","辛":"신","壬":"임","癸":"계",
  "子":"자","丑":"축","寅":"인","卯":"묘","辰":"진","巳":"사","午":"오","未":"미","申":"신","酉":"유","戌":"술","亥":"해",
};
const toK = (h: string) => HANJA_KOR[h] ?? h;
const GAN_HAP_S: [string,string][] = [["갑","기"],["을","경"],["병","신"],["정","임"],["무","계"]];
const GAN_CHUNG_S: [string,string][] = [["갑","경"],["을","신"],["병","임"],["정","계"],["무","임"],["갑","무"],["경","병"],["기","을"],["계","기"]];
const YUK_HAP_S: [string,string][] = [["자","축"],["인","해"],["묘","술"],["진","유"],["사","신"],["오","미"]];
const SAM_HAP_S: string[][] = [["인","오","술"],["신","자","진"],["해","묘","미"],["사","유","축"]];
const JI_CHUNG_S: [string,string][] = [["자","오"],["축","미"],["인","신"],["묘","유"],["진","술"],["사","해"]];
const HYEONG_S: string[][] = [["인","사","신"],["축","술","미"],["진","진"],["오","오"],["유","유"],["해","해"],["자","묘"]];
const PA_S: [string,string][] = [["자","유"],["오","묘"],["인","해"],["사","신"],["축","진"],["술","미"]];
const HAE_S: [string,string][] = [["자","미"],["축","오"],["인","사"],["묘","진"],["신","해"],["유","술"]];
const WONJIN_S: [string,string][] = [["자","미"],["축","오"],["인","유"],["묘","신"],["진","해"],["사","술"]];
const REL_SCORE_S: Record<string,number> = { "삼합":12,"천간합":8,"육합":7,"천간충":-8,"원진":-7,"충":-6,"형":-5,"해":-4,"파":-3 };
function calcHapChungScore(myView: { pillars: Array<{gan:string;ji:string}> }, ptView: { pillars: Array<{gan:string;ji:string}> }): number {
  const mg = myView.pillars.map(p => toK(p.gan));
  const mj = myView.pillars.map(p => toK(p.ji));
  const pg = ptView.pillars.map(p => toK(p.gan));
  const pj = ptView.pillars.map(p => toK(p.ji));
  let raw = 70;
  const added = new Set<string>();
  const add = (kind: string, key: string) => { if (!added.has(key)) { added.add(key); raw += REL_SCORE_S[kind] ?? 0; } };
  for (const [a,b] of GAN_HAP_S) { if ((mg.includes(a)&&pg.includes(b))||(mg.includes(b)&&pg.includes(a))) add("천간합",`천간합${a}${b}`); }
  for (const [a,b] of GAN_CHUNG_S) { if ((mg.includes(a)&&pg.includes(b))||(mg.includes(b)&&pg.includes(a))) add("천간충",`천간충${a}${b}`); }
  for (const [a,b] of YUK_HAP_S) { if ((mj.includes(a)&&pj.includes(b))||(mj.includes(b)&&pj.includes(a))) add("육합",`육합${a}${b}`); }
  for (const arr of SAM_HAP_S) { const mf=arr.filter(c=>mj.includes(c)),pf=arr.filter(c=>pj.includes(c)); if([...new Set([...mf,...pf])].length>=2&&mf.length>=1&&pf.length>=1) add("삼합",`삼합${arr.join("")}`); }
  for (const [a,b] of JI_CHUNG_S) { if ((mj.includes(a)&&pj.includes(b))||(mj.includes(b)&&pj.includes(a))) add("충",`충${a}${b}`); }
  for (const arr of HYEONG_S) { const mf=arr.filter(c=>mj.includes(c)),pf=arr.filter(c=>pj.includes(c)); if([...new Set([...mf,...pf])].length>=2&&mf.length>=1&&pf.length>=1) add("형",`형${arr.join("")}`); }
  for (const [a,b] of PA_S) { if ((mj.includes(a)&&pj.includes(b))||(mj.includes(b)&&pj.includes(a))) add("파",`파${a}${b}`); }
  for (const [a,b] of HAE_S) { if ((mj.includes(a)&&pj.includes(b))||(mj.includes(b)&&pj.includes(a))) add("해",`해${a}${b}`); }
  for (const [a,b] of WONJIN_S) { if ((mj.includes(a)&&pj.includes(b))||(mj.includes(b)&&pj.includes(a))) add("원진",`원진${a}${b}`); }
  return Math.min(100, Math.max(0, raw));
}

// 한국어 조사 자동 교정
function hasBatchim(ch: string): boolean {
  const code = ch.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return false;
  return code % 28 !== 0;
}
function fixJosa(text: string): string {
  if (!text) return text;
  return text
    .replace(/([가-힣])(은|는)/g, (_, w, j) => w + (hasBatchim(w) ? "은" : "는"))
    .replace(/([가-힣])(이|가)(?=[ .,·\n'"」』\)]|$)/g, (_, w) => w + (hasBatchim(w) ? "이" : "가"))
    .replace(/([가-힣])(을|를)/g, (_, w) => w + (hasBatchim(w) ? "을" : "를"))
    .replace(/([가-힣])(과|와)/g, (_, w) => w + (hasBatchim(w) ? "과" : "와"))
    .replace(/([가-힣])(으로|로)(?!서)/g, (_, w) => {
      const code = w.charCodeAt(0) - 0xAC00;
      const batchim = code % 28;
      return w + (batchim === 0 || batchim === 8 ? "로" : "으로"); // 받침없거나 ㄹ → 로
    });
}
function fixJosaDeep(obj: unknown): unknown {
  if (typeof obj === "string") return fixJosa(obj);
  if (Array.isArray(obj)) return obj.map(fixJosaDeep);
  if (obj && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) result[k] = fixJosaDeep(v);
    return result;
  }
  return obj;
}

// 오행 사전 계산 유틸
const GAN_EL: Record<string, string> = { 甲:"목",乙:"목",丙:"화",丁:"화",戊:"토",己:"토",庚:"금",辛:"금",壬:"수",癸:"수" };
const JI_EL: Record<string, string>  = { 寅:"목",卯:"목",巳:"화",午:"화",辰:"토",戌:"토",丑:"토",未:"토",申:"금",酉:"금",亥:"수",子:"수" };

function computeOhaengSummary(pillars: Array<{ gan?: string; ji?: string }> | undefined): { summary: string; ilgan: string } {
  if (!pillars || pillars.length === 0) return { summary: "", ilgan: "" };
  const counts: Record<string, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  for (const p of pillars) {
    if (p.gan && GAN_EL[p.gan]) counts[GAN_EL[p.gan]]++;
    if (p.ji  && JI_EL[p.ji])   counts[JI_EL[p.ji]]++;
  }
  const summary = ["목","화","토","금","수"].map(e => `${e} ${counts[e]}개`).join(", ");
  // pillars ORDER: 시주(0)·일주(1)·월주(2)·년주(3) — 일주는 index 1
  const ilgan = pillars[1]?.gan ?? "";
  return { summary, ilgan };
}

const PRODUCT_SLUG = "kunghap_yeonae";
const PRODUCT_NAME = "연애궁합";
const PRODUCT_PRICE = 29900;
const REPORT_PATH = "saju/kunghap_yeonae/report-preview";

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

// 한 장 생성 (JSON 모드 + 출력 검증 + 3회 재시도). 실패 시 throw.
async function genChapterContent(chapter: number, input: {
  name: string; gender: "male" | "female"; manseryeokText: string;
  partnerName: string; partnerGender: "male" | "female"; partnerManseryeokText: string;
  birthYear?: number;
  ohaengSummary?: string; partnerOhaengSummary?: string;
  ilgan?: string; partnerIlgan?: string;
  mySipseong?: string; partnerSipseong?: string;
  hapChungScore?: number;
  bestTimingPeriod?: string;
  worstTimingPeriod?: string;
  worstTimingText?: string;
  timingContext?: string;
  prevChapterSummary?: string;
  ilganFull?: string;
  partnerIlganFull?: string;
}) {
  const { system, user } = buildYeonaeKunghapChapterPrompt(chapter, input);
  let meta = { provider: "", model: "" };
  for (let i = 0; i < 3; i++) {
    try {
      const llm = await generateInterpretation({ system, user, json: true });
      meta = { provider: llm.provider, model: llm.model };
      let obj: Record<string, unknown>;
      try {
        obj = parseContentJson(llm.text);
      } catch (parseErr) {
        console.error(`[kunghap_yeonae] ${chapter}장 JSON파싱실패 (시도${i+1}):`, parseErr instanceof Error ? parseErr.message : String(parseErr), '\nRAW:', llm.text.slice(0, 300));
        if (chapter === 12) {
          const paras = llm.text.trim().split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
          obj = { letter: { paragraphs: paras.length > 0 ? paras : [llm.text.trim()] } };
        } else {
          continue;
        }
      }
      if (isYeonaeKunghapChapterReady(obj, chapter)) {
        obj = fixJosaDeep(obj) as Record<string, unknown>;
        const SIPSEONG_ALL = ["비견","겁재","식신","상관","편재","정재","편관","정관","편인","정인"];
        function fixSipseongInText(text: string, correct: string): string {
          for (const s of SIPSEONG_ALL) {
            if (s !== correct) text = text.replace(new RegExp(s, "g"), correct);
          }
          return text;
        }
        // 4장: mySipseong sipseong + desc 강제 교정
        if (chapter === 4 && input.mySipseong && obj.mySipseong && typeof obj.mySipseong === "object") {
          const ms = obj.mySipseong as Record<string, unknown>;
          ms.sipseong = input.mySipseong;
          if (typeof ms.desc === "string") ms.desc = fixSipseongInText(ms.desc, input.mySipseong);
        }
        // 5장: partnerSipseong sipseong + desc 강제 교정
        if (chapter === 5 && input.partnerSipseong && obj.partnerSipseong && typeof obj.partnerSipseong === "object") {
          const ps = obj.partnerSipseong as Record<string, unknown>;
          ps.sipseong = input.partnerSipseong;
          if (typeof ps.desc === "string") ps.desc = fixSipseongInText(ps.desc, input.partnerSipseong);
        }
        return { obj, ...meta };
      }
      console.error(`[kunghap_yeonae] ${chapter}장 isChapterReady 실패 (시도${i+1}):`, JSON.stringify(obj).slice(0, 500));
    } catch (e) {
      console.error(`[kunghap_yeonae] ${chapter}장 예외 (시도${i+1}):`, e);
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
    return generateChapter(body);
  }
  return createReport(body);
}

// 병합 저장 (클라가 전 장 합본을 한 번에 저장 → 동시 쓰기 레이스 없음)
async function saveContent(id: string, content: Record<string, unknown>) {
  const service = createServiceClient();
  const { data } = await service.from("saju_results").select("interpretation_md, order_id, myeongsik").eq("id", id).maybeSingle();
  let existing: Record<string, unknown> = {};
  try { existing = JSON.parse(data?.interpretation_md || "{}") || {}; } catch { existing = {}; }
  const merged = { ...existing, ...content };
  await service.from("saju_results").update({ interpretation_md: JSON.stringify(merged) }).eq("id", id);

  const totalChapters = Object.keys(YEONAE_KUNGHAP_CHAPTER_SECTIONS).map(Number);
  const allDone = totalChapters.every(n => isYeonaeKunghapChapterReady(merged, n));
  const storedMyeongsik = data?.myeongsik as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const imageReady = !!storedMyeongsik?.sajuImageUrl;
  const needsImage = WAIT_FOR_IMAGE.has(PRODUCT_SLUG);
  if (allDone && (!needsImage || imageReady) && data?.order_id) {
    const { data: si } = await service.from("saju_inputs").select("phone, name").eq("order_id", data.order_id).maybeSingle();
    if (si?.phone) {
      const reportUrl = `https://www.hongyeondang.com/${REPORT_PATH}?id=${id}`;
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
      calendar: cal === "solar" ? "solar" : "lunar", concerns: [],
    });

    const storedMyeongsik = { view, name, birth, manseryeokText, partnerManseryeokText, gender: g, partnerView, partnerName, partnerBirth, partnerGender: pg };

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

  if (!force && isYeonaeKunghapChapterReady(content, chapter)) {
    const sections: Record<string, unknown> = {};
    for (const k of YEONAE_KUNGHAP_CHAPTER_SECTIONS[chapter] ?? []) sections[k] = content[k];
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

    const { summary: ohaengSummary } = computeOhaengSummary(stored?.view?.pillars);
    const { summary: partnerOhaengSummary } = computeOhaengSummary(stored?.partnerView?.pillars);

    // 일간: API가 이미 계산한 view.ilgan 에서 직접 추출 (재계산 금지)
    // view.ilgan 형식: "庚 (경금)" → 첫 글자가 한자 일간
    const ilganFull: string = stored?.view?.ilgan ?? "";
    const partnerIlganFull: string = stored?.partnerView?.ilgan ?? "";
    const ilgan = ilganFull.charAt(0) || "";          // "庚"
    const partnerIlgan = partnerIlganFull.charAt(0) || ""; // "丙"

    // 십성 서버 계산 (LLM 오류 방지)
    const mySipseong = ilgan && partnerIlgan ? sipseongOfStem(ilgan, partnerIlgan) : undefined;
    const partnerSipseong = ilgan && partnerIlgan ? sipseongOfStem(partnerIlgan, ilgan) : undefined;

    // 합충 점수 서버 계산 (ch10 프롬프트에 주입용)
    let hapChungScore: number | undefined;
    let bestTimingPeriod: string | undefined;
    let worstTimingPeriod: string | undefined;
    let worstTimingText: string | undefined;
    let timingContext: string | undefined;
    if (chapter === 10 && stored?.view && stored?.partnerView) {
      hapChungScore = calcHapChungScore(stored.view, stored.partnerView);
      // ch9 crisisFlow에서 가장 좋은 시기 추출 → ch10 프롬프트에 주입
      type FlowItem = { label: string; tone: string; score?: number };
      const ch9Flow = (content?.crisisFlow as { items?: FlowItem[] } | undefined)?.items ?? [];
      const toneScore = (t: string, s?: number) => s !== undefined ? Math.min(100, Math.max(5, s)) : t === "good" ? 80 : t === "caution" ? 55 : 30;
      const bestItem = ch9Flow.reduce<FlowItem | null>((best, cur) =>
        !best || toneScore(cur.tone, cur.score) > toneScore(best.tone, best.score) ? cur : best
      , null);
      const worstItem = ch9Flow.reduce<FlowItem | null>((worst, cur) =>
        !worst || toneScore(cur.tone, cur.score) < toneScore(worst.tone, worst.score) ? cur : worst
      , null);
      if (bestItem?.label) bestTimingPeriod = bestItem.label;
      if (worstItem?.label) worstTimingPeriod = worstItem.label;
      if (worstItem) worstTimingText = (worstItem as FlowItem & { text?: string }).text ?? undefined;

      // 타겟 연도 대운·세운·십성 서버 계산 → LLM에 확정값으로 주입
      const targetYear = bestTimingPeriod
        ? Number(bestTimingPeriod.replace(/[^0-9]/g, "").slice(0, 4))
        : 0;
      if (targetYear >= 1900) {
        // 세운 간지 계산 (육십갑자)
        const STEMS_60   = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
        const BRANCHES_60 = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
        const GAN_KOR_60: Record<string,string> = {"甲":"갑","乙":"을","丙":"병","丁":"정","戊":"무","己":"기","庚":"경","辛":"신","壬":"임","癸":"계"};
        const JI_KOR_60: Record<string,string>  = {"子":"자","丑":"축","寅":"인","卯":"묘","辰":"진","巳":"사","午":"오","未":"미","申":"신","酉":"유","戌":"술","亥":"해"};
        const seunGan = STEMS_60[((targetYear - 4) % 10 + 10) % 10];
        const seunJi  = BRANCHES_60[((targetYear - 4) % 12 + 12) % 12];
        const seunGanKor = GAN_KOR_60[seunGan] ?? seunGan;
        const seunJiKor  = JI_KOR_60[seunJi]  ?? seunJi;

        // 대운 조회 함수
        type DaeunItem = { label: string; gz: string; active: boolean; yearStart: number };
        function findDaeun(daeunList: DaeunItem[], myIlgan: string): string {
          if (!daeunList?.length || !myIlgan) return "";
          // yearStart 기준으로 정렬
          const sorted = [...daeunList].sort((a, b) => a.yearStart - b.yearStart);
          let found: DaeunItem | null = null;
          for (let i = 0; i < sorted.length; i++) {
            const cur = sorted[i];
            const next = sorted[i + 1];
            const end = next ? next.yearStart - 1 : cur.yearStart + 9;
            if (targetYear >= cur.yearStart && targetYear <= end) {
              found = cur;
              break;
            }
          }
          if (!found) return "";
          const gz = found.gz; // e.g. "壬申"
          const dGan = gz[0]; const dJi = gz[1];
          const dGanKor = GAN_KOR_60[dGan] ?? dGan;
          const dJiKor  = JI_KOR_60[dJi]  ?? dJi;
          const dGanSip = sipseongOfStem(myIlgan, dGan);
          const dJiSip  = sipseongOfBranch(myIlgan, dJi);
          const seunGanSip = sipseongOfStem(myIlgan, seunGan);
          const seunJiSip  = sipseongOfBranch(myIlgan, seunJi);
          // 대운 내 위치
          const daeunStart = found.yearStart;
          const offset = targetYear - daeunStart;
          const position = offset <= 2 ? "대운 초반" : offset <= 6 ? "대운 중반" : "대운 후반";
          return `대운: ${gz}(${dGanKor}${dJiKor}) [시작: ${daeunStart}년, ${targetYear}년은 ${position}]
  대운 천간 ${gz[0]}(${dGanKor}) 십성: ${dGanSip || "—"}
  대운 지지 ${gz[1]}(${dJiKor}) 십성: ${dJiSip || "—"}
  ${targetYear}년 세운: ${seunGan}${seunJi}(${seunGanKor}${seunJiKor})년
  세운 천간 ${seunGan}(${seunGanKor}) 십성: ${seunGanSip || "—"}
  세운 지지 ${seunJi}(${seunJiKor}) 십성: ${seunJiSip || "—"}`;
        }

        const myDaeunInfo      = findDaeun(stored.view?.daeun ?? [], ilgan);
        const partnerDaeunInfo = findDaeun(stored.partnerView?.daeun ?? [], partnerIlgan);

        if (myDaeunInfo || partnerDaeunInfo) {
          timingContext = `\n⚠️ [${targetYear}년 사주 흐름 — 서버 계산 확정값. 반드시 이 값 그대로 사용. 임의 변경·재계산 절대 금지]\n본인 일간: ${ilgan}\n${myDaeunInfo}\n\n상대방 일간: ${partnerIlgan}\n${partnerDaeunInfo}\n위 대운·세운·십성을 근거로 desc를 작성하시오.`;
        }
      }
    }

    // ch11: 이전 장에서 실제 작성된 텍스트 추출 → 서신이 전체 분석과 맥락 일치하도록
    let prevChapterSummary: string | undefined;
    if (chapter === 11) {
      const c = content as Record<string, unknown>;
      const blocks: string[] = [];

      const firstPara = (paras: unknown) =>
        Array.isArray(paras) && typeof paras[0] === "string" ? paras[0] : undefined;

      // ch1 본인 원국
      const myW = c.myWonguk as Record<string,unknown> | undefined;
      if (myW?.intro) blocks.push(`[제1장 — 본인 원국] ${myW.intro}${myW.callout ? ` / ${myW.callout}` : ""}`);
      const myWp = firstPara(myW?.paragraphs);
      if (myWp) blocks.push(`  → ${myWp}`);

      // ch2 상대 원국
      const ptW = c.partnerWonguk as Record<string,unknown> | undefined;
      if (ptW?.intro) blocks.push(`[제2장 — 상대 원국] ${ptW.intro}${ptW.callout ? ` / ${ptW.callout}` : ""}`);
      const ptWp = firstPara(ptW?.paragraphs);
      if (ptWp) blocks.push(`  → ${ptWp}`);

      // ch3 끌림
      const attr = c.attractionReason as Record<string,unknown> | undefined;
      if (attr?.intro) blocks.push(`[제3장 — 끌림] ${attr.intro}${attr.callout ? ` / ${attr.callout}` : ""}`);
      const attrP = firstPara(attr?.paragraphs);
      if (attrP) blocks.push(`  → ${attrP}`);

      // ch8 빛/그림자
      const str = c.strengths as Record<string,unknown> | undefined;
      if (str?.summary) blocks.push(`[제8장 — 이 관계의 빛] ${str.summary}`);
      const shad = c.shadows as Record<string,unknown> | undefined;
      if (shad?.summary) blocks.push(`[제8장 — 이 관계의 그림자] ${shad.summary}`);

      // ch9 위기·극복
      const crisis = c.crisisPoints as { summary?: string; items?: Array<{title:string; desc?:string}> } | undefined;
      if (crisis?.summary) blocks.push(`[제9장 — 위기 요약] ${crisis.summary}`);
      else if (crisis?.items?.length) blocks.push(`[제9장 — 주요 위기] ${crisis.items.slice(0,3).map(i => i.title).join(" / ")}`);
      const overcome = c.overcomeTips as { summary?: string } | undefined;
      if (overcome?.summary) blocks.push(`[제9장 — 극복 핵심] ${overcome.summary}`);

      // ch10 결혼 가능성 핵심 문장
      const mp = c.marriagePossibility as Record<string,unknown> | undefined;
      if (mp?.label) blocks.push(`[제10장 — 결혼 가능성] ${mp.label}`);
      const mpParas = mp?.paragraphs;
      const mpFirst = firstPara(mpParas);
      if (mpFirst) blocks.push(`  → ${mpFirst}`);

      if (blocks.length) {
        prevChapterSummary = `\n⚠️ [1~10장 분석 내용 요약 — 이 서신은 아래 내용의 총정리이오. 반드시 같은 맥락으로 작성하고, 아래 내용과 모순되는 서술 절대 금지]\n${blocks.join("\n")}`;
      }
    }

    const { obj } = await genChapterContent(chapter, {
      name: stored?.name ?? "",
      gender: stored?.gender === "female" ? "female" : "male",
      manseryeokText,
      partnerName: stored?.partnerName ?? "",
      partnerGender: stored?.partnerGender === "female" ? "female" : "male",
      partnerManseryeokText: stored?.partnerManseryeokText ?? "",
      birthYear: birthYear || undefined,
      ohaengSummary,
      partnerOhaengSummary,
      ilgan,
      partnerIlgan,
      mySipseong,
      partnerSipseong,
      hapChungScore,
      bestTimingPeriod,
      worstTimingPeriod,
      worstTimingText,
      timingContext,
      prevChapterSummary,
      ilganFull,
      partnerIlganFull,
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
