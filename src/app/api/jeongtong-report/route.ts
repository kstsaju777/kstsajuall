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
import { buildMyeongsikView } from "@/lib/saju/myeongsik-view";
import { buildChapterPrompt, parseContentJson, isChapterReady } from "@/lib/saju/report-content";
import { generateInterpretation } from "@/lib/saju/llm";
import { parseDate, parseTimeVal, parseCalendar } from "@/lib/saju/local-manseryeok";

export const maxDuration = 60;

const PRODUCT_SLUG = "premium-saju";

const createSchema = z.object({
  name: z.string().optional().default(""),
  date: z.string().min(1),
  time: z.string().optional().default(""),
  calendar: z.string().optional().default("양력"),
  gender: z.string().optional().default(""),
  email: z.string().optional().default(""),
});
const chapterSchema = z.object({ id: z.string().min(1), chapter: z.number().int().min(1).max(9) });

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (body && typeof body.id === "string" && typeof body.chapter === "number") {
    return generateChapter(body);
  }
  return createReport(body);
}

// ── 초기 생성: 명식 + 1장 풀이 ──
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
    const analysis = await fetchSajuAnalysis(birthInfo, [], { source: "confirm" });
    const view = buildMyeongsikView(analysis);
    const manseryeokText = formatSajuToManseryeok(analysis, birthInfo);

    // 1장만 생성 (나머지 장은 진입 시 온디맨드)
    const llm = await generateInterpretation(buildChapterPrompt(1, { name, gender: g, manseryeokText }));
    const content = parseContentJson(llm.text);

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
        myeongsik: { view, name, birth, manseryeokText, gender: g } as never,
        interpretation_md: JSON.stringify(content),
        llm_provider: llm.provider,
        llm_model: llm.model,
      })
      .select("id")
      .single();
    if (resultErr || !result) return NextResponse.json({ error: "결과 저장 실패", detail: resultErr?.message }, { status: 500 });

    return NextResponse.json({ resultId: result.id, view, content, name, birth });
  } catch (err) {
    return NextResponse.json({ error: "결과지 생성 실패", detail: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

// ── 특정 장 온디맨드 생성 ──
async function generateChapter(body: unknown) {
  const parsed = chapterSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  const { id, chapter } = parsed.data;

  const service = createServiceClient();
  const { data, error } = await service.from("saju_results").select("myeongsik, interpretation_md").eq("id", id).maybeSingle();
  if (error || !data) return NextResponse.json({ error: "결과를 찾을 수 없습니다." }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stored = data.myeongsik as any;
  let content: Record<string, unknown> = {};
  try { content = JSON.parse(data.interpretation_md) || {}; } catch { content = {}; }

  if (isChapterReady(content, chapter)) return NextResponse.json({ content }); // 이미 생성됨

  const manseryeokText: string | undefined = stored?.manseryeokText;
  if (!manseryeokText) return NextResponse.json({ content }); // 옛 결과(만세력 미저장) → 생성 불가, 기존 그대로

  try {
    const llm = await generateInterpretation(
      buildChapterPrompt(chapter, { name: stored?.name ?? "", gender: stored?.gender === "female" ? "female" : "male", manseryeokText }),
    );
    const merged = { ...content, ...parseContentJson(llm.text) };
    await service.from("saju_results").update({ interpretation_md: JSON.stringify(merged) }).eq("id", id);
    return NextResponse.json({ content: merged });
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
  return NextResponse.json({ view: stored?.view ?? stored, name: stored?.name ?? "", birth: stored?.birth ?? null, content });
}
