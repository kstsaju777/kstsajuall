// =====================================================
// 정통사주 결과지 생성 + 저장 API
// =====================================================
// POST {name,date,time,calendar,gender,email}
//   → 운세위키 명식 + LLM 구조화 풀이 생성
//   → order + saju_inputs + saju_results 저장 (기존 주문 구조 재사용)
//   → { resultId, view, content } 반환
// GET ?id=<resultId>
//   → 저장된 { view, content, name } 반환 (재방문/이메일 링크용, 재생성 없음)

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
import { buildChapterPrompt, parseContentJson } from "@/lib/saju/report-content";
import { generateInterpretation } from "@/lib/saju/llm";
import { parseDate, parseTimeVal, parseCalendar } from "@/lib/saju/local-manseryeok";

// 명식 + LLM 생성이 길어(~40초) Vercel 기본 10초 제한에 걸리므로 최대 실행시간 연장
export const maxDuration = 60;

const PRODUCT_SLUG = "premium-saju"; // 정통사주 결과지를 묶을 상품 (주문 FK용)

const bodySchema = z.object({
  name: z.string().optional().default(""),
  date: z.string().min(1),
  time: z.string().optional().default(""),
  calendar: z.string().optional().default("양력"),
  gender: z.string().optional().default(""),
  email: z.string().optional().default(""),
});

export async function POST(request: NextRequest) {
  if (!isSajuApiConfigured()) {
    return NextResponse.json({ error: "사주 API가 설정되지 않았습니다." }, { status: 503 });
  }
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  const { name, date, time, calendar, gender, email } = parsed.data;

  const ymd = parseDate(date);
  if (!ymd) return NextResponse.json({ error: "생년월일 형식 오류" }, { status: 400 });
  const cal = parseCalendar(calendar);
  const timeVal = parseTimeVal(time);
  const hasTime = timeVal !== "unknown";
  const [hh, mm] = hasTime ? timeVal.split(":") : ["", ""];
  const g: "male" | "female" = gender === "여자" || gender === "female" ? "female" : "male";
  const pad = (n: number | string) => String(n).padStart(2, "0");

  const birthInfo: BirthInfo = {
    birthYear: String(ymd.year),
    birthMonth: String(ymd.month),
    birthDay: String(ymd.day),
    ...(hasTime ? { birthHour: String(Number(hh)), birthMinute: String(Number(mm)) } : {}),
    calendarType: cal === "solar" ? "양력" : "음력",
    gender: g,
    isLeapMonth: cal === "leap",
  };

  try {
    // 1) 명식 + 풀이 생성
    const analysis = await fetchSajuAnalysis(birthInfo, [], { source: "confirm" });
    const view = buildMyeongsikView(analysis);
    const manseryeokText = formatSajuToManseryeok(analysis, birthInfo);
    // 장별로 나눠 병렬 생성 (한 호출이 작아 빠르고, 타임아웃에 안전)
    const promptInput = { name, gender: g, manseryeokText };
    const [c1, c2, c3] = await Promise.all([
      generateInterpretation(buildChapterPrompt(1, promptInput)),
      generateInterpretation(buildChapterPrompt(2, promptInput)),
      generateInterpretation(buildChapterPrompt(3, promptInput)),
    ]);
    const content = {
      ...parseContentJson(c1.text),
      ...parseContentJson(c2.text),
      ...parseContentJson(c3.text),
    };
    const llm = c1; // provider/model 기록용
    const birth = {
      date: `${ymd.year}.${pad(ymd.month)}.${pad(ymd.day)}`,
      calendar: cal === "solar" ? "양력" : cal === "leap" ? "윤달" : "음력",
      time: hasTime ? `${pad(hh)}:${pad(mm)}` : "시간 모름",
      gender: g,
    };

    // 2) DB 저장 (order → saju_inputs → saju_results)
    const service = createServiceClient();
    const { data: product } = await service.from("products").select("id").eq("slug", PRODUCT_SLUG).maybeSingle();
    if (!product) return NextResponse.json({ error: "상품을 찾을 수 없습니다." }, { status: 500 });

    const orderCode = `jt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const { data: order, error: orderErr } = await service
      .from("orders")
      .insert({
        order_id: orderCode,
        product_id: product.id,
        guest_email: email || "guest@hongyeondang.com",
        amount: 0,
        status: "paid",
        paid_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (orderErr || !order) {
      return NextResponse.json({ error: "주문 생성 실패", detail: orderErr?.message }, { status: 500 });
    }

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
        myeongsik: { view, name, birth } as never, // 명식 뷰 + 이름 + 생년월일 저장
        interpretation_md: JSON.stringify(content), // 구조화 풀이 JSON
        llm_provider: llm.provider,
        llm_model: llm.model,
      })
      .select("id")
      .single();
    if (resultErr || !result) {
      return NextResponse.json({ error: "결과 저장 실패", detail: resultErr?.message }, { status: 500 });
    }

    return NextResponse.json({ resultId: result.id, view, content, name, birth });
  } catch (err) {
    return NextResponse.json(
      { error: "결과지 생성 실패", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

// 저장된 결과 조회 (재생성 없음)
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id 누락" }, { status: 400 });

  const service = createServiceClient();
  const { data, error } = await service
    .from("saju_results")
    .select("myeongsik, interpretation_md")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return NextResponse.json({ error: "결과를 찾을 수 없습니다." }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stored = data.myeongsik as any;
  let content;
  try {
    content = JSON.parse(data.interpretation_md);
  } catch {
    content = null;
  }
  return NextResponse.json({ view: stored?.view ?? stored, name: stored?.name ?? "", birth: stored?.birth ?? null, content });
}
