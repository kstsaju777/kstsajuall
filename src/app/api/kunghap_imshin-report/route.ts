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
import { buildImshinKunghapChapterPrompt, isImshinKunghapChapterReady, IMSHIN_KUNGHAP_CHAPTER_SECTIONS } from "@/lib/saju/kunghap_imshin-report-content";
import { generateInterpretation, generateSajuImage } from "@/lib/saju/llm";
import { parseDate, parseTimeVal, parseCalendar } from "@/lib/saju/local-manseryeok";
import { serverEnv } from "@/lib/env";
import { sendOrderSms, sendOrderEmail, sendAlimtalk } from "@/lib/order-notifications";
import { WAIT_FOR_IMAGE } from "@/lib/alimtalk-config";
import { fixNamesInValue } from "@/lib/saju/fix-names";
import { sipseongOfStem, sipseongOfBranch } from "@/lib/saju/sipseong-calc";

export const maxDuration = 300;

const PRODUCT_SLUG = "kunghap_imshin";
const PRODUCT_NAME = "임신궁합";
const PRODUCT_PRICE = 29900;
const REPORT_PATH = "saju/kunghap_imshin/report-preview";

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
  concern: z.string().optional().default(""),
});
const chapterSchema = z.object({ id: z.string().min(1), chapter: z.number().int().min(1).max(30), force: z.boolean().optional().default(false) });

// 한 장 생성 (JSON 모드 + 출력 검증 + 재시도). 실패 시 throw.
async function genChapterContent(chapter: number, input: {
  name: string; gender: "male" | "female"; manseryeokText: string;
  partnerName: string; partnerGender: "male" | "female"; partnerManseryeokText: string;
  birthYear?: number;
  ilgan?: string;
  partnerIlgan?: string;
  yongsinEl?: string;
  heusinEl?: string;
  gisinEl?: string;
  partnerYongsinEl?: string;
  partnerHeusinEl?: string;
  partnerGisinEl?: string;
}) {
  const myLabel = input.name.length  > 1 ? input.name.slice(1)        : input.name;
  const ptLabel = input.partnerName.length > 1 ? input.partnerName.slice(1) : input.partnerName;

  const { system, user } = buildImshinKunghapChapterPrompt(chapter, input);
  let meta = { provider: "", model: "" };
  for (let i = 0; i < 3; i++) {
    try {
      const llm = await generateInterpretation({ system, user, json: true });
      meta = { provider: llm.provider, model: llm.model };
      let rawObj: Record<string, unknown>;
      try {
        rawObj = parseContentJson(llm.text);
      } catch (parseErr) {
        console.error(`[kunghap_imshin] ${chapter}장 JSON파싱실패 (시도${i+1}):`, parseErr instanceof Error ? parseErr.message : String(parseErr), '\nRAW:', llm.text.slice(0, 300));
        if (chapter === 12) {
          const paras = llm.text.trim().split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
          rawObj = { letter: { paragraphs: paras.length > 0 ? paras : [llm.text.trim()] } };
        } else { continue; }
      }
      const obj = fixNamesInValue(rawObj, myLabel, ptLabel, "님") as typeof rawObj;
      if (isImshinKunghapChapterReady(obj, chapter)) return { obj, ...meta };
      console.error(`[kunghap_imshin] ${chapter}장 ready 실패 (시도${i+1}):`, JSON.stringify(rawObj).slice(0, 500));
    } catch (e) {
      console.error(`[kunghap_imshin] ${chapter}장 예외 (시도${i+1}):`, e);
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

// ── 고민 조언 단독 생성 ──
async function generateConcernAdvice(id: string) {
  const service = createServiceClient();
  const { data, error } = await service.from("saju_results").select("myeongsik, interpretation_md, order_id").eq("id", id).maybeSingle();
  if (error || !data) return NextResponse.json({ error: "결과를 찾을 수 없습니다." }, { status: 404 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stored = data.myeongsik as any;
  let concern: string = stored?.["{고민}"] ?? stored?.concern ?? "";
  if (!concern && data.order_id) {
    const { data: si } = await service.from("saju_inputs").select("concerns").eq("order_id", data.order_id).maybeSingle();
    const arr = (si?.concerns as string[] | null) ?? [];
    concern = arr[0] ?? "";
  }
  if (!concern) return NextResponse.json({ concernAdvice: { paragraphs: [] } });

  const manseryeokText: string = stored?.manseryeokText ?? stored?.["{명식표1}"] ?? "";
  const partnerManseryeokText: string = stored?.partnerManseryeokText ?? stored?.["{명식표2}"] ?? "";
  const name: string = stored?.name ?? stored?.["{이름1}"] ?? "";
  const partnerName: string = stored?.partnerName ?? stored?.["{이름2}"] ?? "";
  const name1 = name.length > 1 ? name.slice(1) : name;
  const partnerName1 = partnerName.length > 1 ? partnerName.slice(1) : partnerName;

  const ilganFull: string = stored?.view?.ilgan ?? "";
  const partnerIlganFull: string = stored?.partnerView?.ilgan ?? "";
  const ilgan = ilganFull.charAt(0) || "";
  const partnerIlgan = partnerIlganFull.charAt(0) || "";

  const STEMS_60    = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
  const BRANCHES_60 = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
  const GAN_KOR: Record<string,string> = {"甲":"갑","乙":"을","丙":"병","丁":"정","戊":"무","己":"기","庚":"경","辛":"신","壬":"임","癸":"계"};
  const JI_KOR:  Record<string,string> = {"子":"자","丑":"축","寅":"인","卯":"묘","辰":"진","巳":"사","午":"오","未":"미","申":"신","酉":"유","戌":"술","亥":"해"};

  let daeunNote = "";
  const daeunList: { label: string; gz: string; active?: boolean }[] = stored?.view?.daeun ?? [];
  if (daeunList.length > 0) {
    const currentYear = new Date().getFullYear();
    const birthDateStr: string = stored?.birth?.date ?? "";
    const birthYearNum = birthDateStr ? Number(birthDateStr.split(".")[0]) : currentYear;
    const currentAge = currentYear - birthYearNum;
    let cur = daeunList.find(d => d.active);
    if (!cur) { const sorted = [...daeunList].sort((a,b)=>Number(a.label)-Number(b.label)); for(let i=sorted.length-1;i>=0;i--){if(currentAge>=Number(sorted[i].label)){cur=sorted[i];break;}} }
    if (cur) {
      const idx = daeunList.findIndex(d=>d.gz===cur!.gz&&d.label===cur!.label);
      const startAge=Number(cur.label); const endAge=daeunList[idx+1]?Number(daeunList[idx+1].label)-1:startAge+9;
      const startYear=birthYearNum+startAge; const endYear=birthYearNum+endAge; const yearsIn=currentYear-startYear;
      daeunNote=`[${name1}님 현재 대운 고정값 — 반드시 이 값만 사용, 독자적 재산출 절대 금지]\n현재 대운: ${cur.gz} (${startAge}세~${endAge}세, ${startYear}년~${endYear}년)\n현재 나이: ${currentAge}세 (${currentYear}년 기준) — 이 대운 시작 후 ${yearsIn}년차`;
    }
  }
  let partnerDaeunNote = "";
  const partnerDaeunList: { label: string; gz: string; active?: boolean }[] = stored?.partnerView?.daeun ?? [];
  if (partnerDaeunList.length > 0) {
    const currentYear = new Date().getFullYear();
    const pBirthDateStr: string = stored?.partnerBirth?.date ?? "";
    const pBirthYearNum = pBirthDateStr ? Number(pBirthDateStr.split(".")[0]) : currentYear;
    const pCurrentAge = currentYear - pBirthYearNum;
    let pCur = partnerDaeunList.find(d=>d.active);
    if (!pCur) { const sorted=[...partnerDaeunList].sort((a,b)=>Number(a.label)-Number(b.label)); for(let i=sorted.length-1;i>=0;i--){if(pCurrentAge>=Number(sorted[i].label)){pCur=sorted[i];break;}} }
    if (pCur) {
      const idx=partnerDaeunList.findIndex(d=>d.gz===pCur!.gz&&d.label===pCur!.label);
      const startAge=Number(pCur.label); const endAge=partnerDaeunList[idx+1]?Number(partnerDaeunList[idx+1].label)-1:startAge+9;
      const startYear=pBirthYearNum+startAge; const endYear=pBirthYearNum+endAge; const yearsIn=currentYear-startYear;
      partnerDaeunNote=`[${partnerName1}님 현재 대운 고정값 — 반드시 이 값만 사용, 독자적 재산출 절대 금지]\n현재 대운: ${pCur.gz} (${startAge}세~${endAge}세, ${startYear}년~${endYear}년)\n현재 나이: ${pCurrentAge}세 (${currentYear}년 기준) — 이 대운 시작 후 ${yearsIn}년차`;
    }
  }
  const currentYear = new Date().getFullYear();
  const seunGan = STEMS_60[((currentYear-4)%10+10)%10];
  const seunJi  = BRANCHES_60[((currentYear-4)%12+12)%12];
  const seunGanKor = GAN_KOR[seunGan]??seunGan; const seunJiKor=JI_KOR[seunJi]??seunJi;
  let seunLine = `[현재 세운 고정값 — 반드시 이 값만 사용]\n${currentYear}년 세운: ${seunGan}${seunJi}(${seunGanKor}${seunJiKor}년)`;
  if (ilgan && partnerIlgan) {
    const myGanSip=sipseongOfStem(ilgan,seunGan); const myJiSip=sipseongOfBranch(ilgan,seunJi);
    const ptGanSip=sipseongOfStem(partnerIlgan,seunGan); const ptJiSip=sipseongOfBranch(partnerIlgan,seunJi);
    seunLine+=`\n${name1}님: 천간→${myGanSip} / 지지→${myJiSip}\n${partnerName1}님: 천간→${ptGanSip} / 지지→${ptJiSip}`;
  }
  const daeunSeunBlock = [daeunNote, partnerDaeunNote, seunLine].filter(Boolean).join("\n\n");

  let prevChapterContext = "";
  try {
    const prev = JSON.parse(data.interpretation_md || "{}") as Record<string, unknown>;
    const lines: string[] = [];
    const os = prev.overallScore as { score?: number; label?: string } | undefined;
    if (os?.score !== undefined) lines.push(`궁합 점수: ${os.score}점 (${os.label ?? ""})`);
    const tf = prev.timingFlow as { bestPeriod?: string; desc?: string } | undefined;
    if (tf?.bestPeriod) lines.push(`임신 최적 시기: ${tf.bestPeriod}${tf.desc ? " — " + tf.desc.slice(0, 80) + "…" : ""}`);
    const bm = prev.bestMonths as string[] | undefined;
    if (Array.isArray(bm) && bm.length > 0) lines.push(`좋은 달: ${bm.join(", ")}`);
    if (lines.length > 0) prevChapterContext = `\n\n[이 궁합 리포트에서 이미 분석된 핵심 결과 — 반드시 이 내용과 일치하는 조언을 작성할 것]\n${lines.join("\n")}`;
  } catch { /* 무시 */ }
  prevChapterContext += `\n\n[현재 날짜 기준 — 반드시 참고]\n현재는 ${currentYear}년이오. 위 분석에서 언급된 시기 중 ${currentYear}년 이전의 날짜(예: 2024년, 2025년 등)는 이미 지난 시기이오. 과거 시기를 앞으로의 권유로 제시하지 말고, ${currentYear}년 이후를 기준으로 실질적인 조언을 작성하오.`;

  const system = `당신은 홍연당의 사주 풀이 AI이오. 두 사람의 임신궁합 고민에 대한 명리학적 조언을 JSON으로만 답하오. 절대 JSON 외 텍스트를 출력하지 마오.`;
  const user = `다음은 두 사람의 임신궁합 만세력이오.\n\n[${name1}님 만세력]\n${manseryeokText}\n\n[${partnerName1}님 만세력]\n${partnerManseryeokText}${daeunSeunBlock ? "\n\n" + daeunSeunBlock : ""}${prevChapterContext}\n\n[고민에 대한 명리학적 조언 작성]\n고민: "${concern}"\n\n위 리포트 분석 결과(임신 궁합 점수·임신 최적 시기·좋은 달·대운·세운)를 종합하여, 고민에 직접 답하는 현실적이고 맞춤화된 조언을 작성하오. 리포트의 구체적 수치·시기를 반드시 언급하오.\n\n아래 JSON 형식으로만 답하오:\n{\n  "concernAdvice": {\n    "paragraphs": [\n      "이 고민을 두 사람의 명식(일간·오행·십성·합충) 구조와 연결한 풀이 — 이 고민이 생긴 사주적 이유와 리포트에서 도출된 임신 궁합 점수를 언급하오 (4~5문장, 200자 이상)",\n      "현재(${currentYear}년) 시점 기준으로 두 사람의 대운·세운 흐름이 이 고민에 어떤 영향을 주는지 분석하오. 리포트에서 도출된 임신 최적 시기나 좋은 달이 이미 지난 경우 현재 이후 관점으로 자연스럽게 전환하여 실질적 조언을 작성하오 (4~5문장, 200자 이상)",\n      "이 고민을 풀어가기 위한 조언과 마음가짐을, 리포트에서 분석된 내용을 근거로 구체적으로 작성하오 (3~4문장, 150자 이상)"\n    ]\n  }\n}\n\n홍연 말투(~이오/~하오/~겠소).`;

  for (let i = 0; i < 3; i++) {
    try {
      const llm = await generateInterpretation({ system, user, json: true });
      const obj = parseContentJson(llm.text) as { concernAdvice?: { paragraphs?: string[] } };
      const paras = obj?.concernAdvice?.paragraphs;
      if (Array.isArray(paras) && paras.length > 0) {
        const fixed = fixNamesInValue({ concernAdvice: obj.concernAdvice }, name1, partnerName1, "님") as { concernAdvice: { paragraphs: string[] } };
        obj.concernAdvice = fixed.concernAdvice;
        let existing: Record<string, unknown> = {};
        try { existing = JSON.parse(data.interpretation_md || "{}") || {}; } catch { existing = {}; }
        await service.from("saju_results").update({ interpretation_md: JSON.stringify({ ...existing, concernAdvice: obj.concernAdvice }) }).eq("id", id);
        return NextResponse.json({ concernAdvice: obj.concernAdvice });
      }
    } catch { /* 재시도 */ }
  }
  return NextResponse.json({ concernAdvice: { paragraphs: [] } });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (body && typeof body.id === "string" && body.concernOnly === true) {
    return generateConcernAdvice(body.id);
  }
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
  const totalChapters = Object.keys(IMSHIN_KUNGHAP_CHAPTER_SECTIONS).map(Number);
  const allDone = totalChapters.every(n => isImshinKunghapChapterReady(merged, n));
  const storedMyeongsik = data?.myeongsik as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const imageReady = !!storedMyeongsik?.sajuImageUrl && !!storedMyeongsik?.partnerSajuImageUrl;
  const needsImage = WAIT_FOR_IMAGE.has(PRODUCT_SLUG);
  if (!skipAlimtalk && allDone && (!needsImage || imageReady) && data?.order_id) {
    const { data: si } = await service.from("saju_inputs").select("phone, name").eq("order_id", data.order_id).maybeSingle();
    if (si?.phone) {
      const reportUrl = `https://www.hongyeondang.com/saju/kunghap_imshin/report-preview?id=${id}`;
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
  const { name, date, time, calendar, gender, email, partnerName, partnerDate, partnerTime, partnerCalendar, partnerGender, concern } = parsed.data;

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
      calendar: cal === "solar" ? "solar" : "lunar", concerns: concern ? [concern] : [],
    });

    const storedMyeongsik = { view, name, birth, manseryeokText: myManseryeokText, partnerManseryeokText, gender: g, partnerView, partnerName, partnerBirth, partnerGender: pg, "{고민}": concern ?? "" };

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

  if (!force && isImshinKunghapChapterReady(content, chapter)) {
    const sections: Record<string, unknown> = {};
    for (const k of IMSHIN_KUNGHAP_CHAPTER_SECTIONS[chapter] ?? []) sections[k] = content[k];
    return NextResponse.json({ sections });
  }

  let manseryeokText: string | undefined = stored?.manseryeokText;
  if (!manseryeokText) {
    if (!isSajuApiConfigured()) return NextResponse.json({ error: "사주 API가 설정되지 않았습니다." }, { status: 503 });
    manseryeokText = (await loadManseryeokFromInputs(service, id)) ?? undefined;
  }
  if (!manseryeokText) return NextResponse.json({ error: "명식 정보를 찾을 수 없습니다." }, { status: 500 });

  // 저장된 용신/희신/기신 읽기 (이후 장에 주입)
  const yongsinEl: string | undefined = (stored?.yongsinEl as string | undefined) || undefined;
  const heusinEl: string | undefined = (stored?.heusinEl as string | undefined) || undefined;
  const gisinEl: string | undefined = (stored?.gisinEl as string | undefined) || undefined;
  const partnerYongsinEl: string | undefined = (stored?.partnerYongsinEl as string | undefined) || undefined;
  const partnerHeusinEl: string | undefined = (stored?.partnerHeusinEl as string | undefined) || undefined;
  const partnerGisinEl: string | undefined = (stored?.partnerGisinEl as string | undefined) || undefined;

  try {
    const birthDateStr: string = stored?.birth?.date ?? "";
    const birthYear = birthDateStr ? Number(birthDateStr.split(".")[0]) : undefined;
    const ilgan: string | undefined = (stored?.view?.ilgan as string | undefined)?.split(" ")[0];
    const partnerIlgan: string | undefined = (stored?.partnerView?.ilgan as string | undefined)?.split(" ")[0];
    const { obj } = await genChapterContent(chapter, {
      name: stored?.name ?? "",
      gender: stored?.gender === "female" ? "female" : "male",
      manseryeokText,
      partnerName: stored?.partnerName ?? "",
      partnerGender: stored?.partnerGender === "female" ? "female" : "male",
      partnerManseryeokText: stored?.partnerManseryeokText ?? manseryeokText,
      birthYear: birthYear || undefined,
      ilgan,
      partnerIlgan,
      yongsinEl,
      heusinEl,
      gisinEl,
      partnerYongsinEl,
      partnerHeusinEl,
      partnerGisinEl,
    });

    // 용신 오행 추출 헬퍼
    const OHAENG = ["금", "목", "화", "토", "수"] as const;
    function makeResolvers(ilganEl: string) {
      const GEN: Record<string, string> = { 목: "화", 화: "토", 토: "금", 금: "수", 수: "목" };
      const CTL: Record<string, string> = { 목: "토", 화: "금", 토: "수", 금: "목", 수: "화" };
      const CLASHED_BY: Record<string, string> = { 목: "금", 화: "수", 토: "목", 금: "화", 수: "토" };
      const GENERATED_BY: Record<string, string> = { 목: "수", 화: "목", 토: "화", 금: "토", 수: "금" };
      function sipToEl(sip: string): string {
        if (["비견", "겁재"].some(s => sip.includes(s))) return ilganEl;
        if (["식신", "상관"].some(s => sip.includes(s))) return GEN[ilganEl] ?? "";
        if (["편재", "정재", "재성"].some(s => sip.includes(s))) return CTL[ilganEl] ?? "";
        if (["편관", "정관", "관성"].some(s => sip.includes(s))) return CLASHED_BY[ilganEl] ?? "";
        if (["편인", "정인", "인성"].some(s => sip.includes(s))) return GENERATED_BY[ilganEl] ?? "";
        return "";
      }
      function resolveEl(fieldVal: unknown, keyword: string, allText: string): string {
        const v = String(fieldVal ?? "").trim();
        if ((OHAENG as readonly string[]).includes(v)) return v;
        const sipMatch = allText.match(new RegExp(`${keyword}[가-힣]?\\s*[''""]?([가-힣]{2,3})[''""]?`));
        if (sipMatch) { const el = sipToEl(sipMatch[1]); if (el) return el; if ((OHAENG as readonly string[]).includes(sipMatch[1])) return sipMatch[1]; }
        const elMatch = allText.match(new RegExp(`${keyword}[가-힣]?\\s*(?:오행인\\s*)?(금|목|화|토|수)`));
        if (elMatch) return elMatch[1];
        return "";
      }
      return resolveEl;
    }

    // ch1: myYongsin 저장
    if (chapter === 1) {
      const my = (obj as Record<string, unknown>).myYongsin as Record<string, unknown> | undefined;
      if (my) {
        const myPillars = (stored?.view?.pillars ?? []) as Array<{ pos: string; ganEl: string }>;
        const myIlganEl = myPillars.find(p => p.pos === "일주")?.ganEl ?? "";
        const resolveEl = makeResolvers(myIlganEl);
        const allText = [my.intro, my.desc, my.yongsinReason, my.heusinReason, my.gisinReason].filter(Boolean).join(" ");
        my.yongsinEl = resolveEl(my.yongsinEl, "용신", allText);
        my.heusinEl  = resolveEl(my.heusinEl,  "희신", allText);
        my.gisinEl   = resolveEl(my.gisinEl,   "기신", allText);
        if (my.yongsinEl) {
          await service.from("saju_results").update({ myeongsik: { ...stored, yongsinEl: my.yongsinEl, heusinEl: my.heusinEl ?? "", gisinEl: my.gisinEl ?? "" } as never }).eq("id", id);
        }
      }
    }

    // ch2: partnerYongsin 저장
    if (chapter === 2) {
      const pt = (obj as Record<string, unknown>).partnerYongsin as Record<string, unknown> | undefined;
      if (pt) {
        const ptPillars = (stored?.partnerView?.pillars ?? []) as Array<{ pos: string; ganEl: string }>;
        const ptIlganEl = ptPillars.find(p => p.pos === "일주")?.ganEl ?? "";
        const resolveEl = makeResolvers(ptIlganEl);
        const allText = [pt.intro, pt.desc, pt.yongsinReason, pt.heusinReason, pt.gisinReason].filter(Boolean).join(" ");
        pt.yongsinEl = resolveEl(pt.yongsinEl, "용신", allText);
        pt.heusinEl  = resolveEl(pt.heusinEl,  "희신", allText);
        pt.gisinEl   = resolveEl(pt.gisinEl,   "기신", allText);
        if (pt.yongsinEl) {
          await service.from("saju_results").update({ myeongsik: { ...stored, partnerYongsinEl: pt.yongsinEl, partnerHeusinEl: pt.heusinEl ?? "", partnerGisinEl: pt.gisinEl ?? "" } as never }).eq("id", id);
        }
      }
    }

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
    concern: stored?.["{고민}"] || stored?.concern || "",
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
      const totalChapters = Object.keys(IMSHIN_KUNGHAP_CHAPTER_SECTIONS).map(Number);
      const allDone = totalChapters.every(n => isImshinKunghapChapterReady(content, n));
      if (allDone) {
        const { data: si } = await service.from("saju_inputs").select("phone, name").eq("order_id", resultRow.order_id).maybeSingle();
        if (si?.phone) {
          const reportUrl = `https://www.hongyeondang.com/saju/kunghap_imshin/report-preview?id=${id}`;
          await sendAlimtalk({ customerPhone: si.phone, customerName: si.name ?? "고객", productName: PRODUCT_NAME, resultUrl: reportUrl });
        }
      }
    }

    return NextResponse.json({ sajuImageUrl, partnerSajuImageUrl });
  } catch (e) {
    return NextResponse.json({ error: "이미지 생성 실패", detail: String(e) }, { status: 500 });
  }
}






