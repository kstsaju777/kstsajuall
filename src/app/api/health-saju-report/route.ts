// 자녀사주 결과지 생성 + 저장 API
// POST {name,date,time,calendar,gender,email,concern} → createReport
// POST {id, chapter}                                  → generateChapter
// POST {id, content}                                  → saveContent
// GET  ?id=<resultId>                                 → 조회

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { generateInterpretation } from "@/lib/saju/llm";
import { calcSaju, ohaengMap } from "@/lib/saju/local-manseryeok";
import type { LocalSajuResult } from "@/lib/saju/local-manseryeok";
import { serverEnv } from "@/lib/env";
import { HEALTH_CHAPTER_SECTIONS, isHealthChapterReady } from "@/lib/saju/health-saju-report-content";
import { fixNamesInValue } from "@/lib/saju/fix-names";

export const maxDuration = 300;

// ─── 사주 → 텍스트 ───────────────────────────────────────────────────────────
function sajuToText(saju: LocalSajuResult | null, name: string, gender: string): string {
  if (!saju) return `${name}의 생년월일 정보가 없습니다.`;
  const { year, month, day, time } = saju.pillars;
  const pillars = [
    { label: "년주", p: year }, { label: "월주", p: month },
    { label: "일주", p: day },  { label: "시주", p: time },
  ];
  const lines = pillars.map(({ label, p }) => {
    const ganEl = ohaengMap[p.stem]?.el ?? "";
    const jiEl  = ohaengMap[p.branch]?.el ?? "";
    return `${label}: ${p.stem}(${p.stemHg}·${ganEl}·${p.stemSs}) / ${p.branch}(${p.branchHg}·${jiEl}·${p.branchSs})`;
  });
  const gLabel = gender === "여아" || gender === "female" ? "여아" : "남아";
  return `[${name}·${gLabel}]\n${lines.join("\n")}`;
}

// ─── 챕터 프롬프트 빌드 ──────────────────────────────────────────────────────
function buildChildChapterPrompt(chapter: number, input: {
  name: string; gender: string; sajuText: string; concern: string;
}): { system: string; user: string } {
  const { name, gender, sajuText, concern } = input;
  const gLabel = gender === "여아" || gender === "female" ? "여아" : "남아";

  const system = `당신은 홍연(洪緣)이라는 이름의 조선 시대 역학 전문가입니다.
아이의 사주팔자를 바탕으로 타고난 기질, 재능, 앞으로의 인생을 따뜻하고 구체적으로 풀어주세요.
부모가 아이를 더 잘 이해하고 도울 수 있도록 실질적인 조언을 담아주세요.
각 섹션은 반드시 JSON 형식으로 반환하세요.
JSON 구조: { "sectionKey": { "title": "...", "paragraphs": ["...", "...", "..."] } }
각 섹션당 3~5개의 문단(paragraphs)으로 구성하세요. 각 문단은 50~150자.`;

  const context = `[아이 정보]
이름: ${name} (${gLabel})
${sajuText}

[부모님 고민]: ${concern || "없음"}`;

  const chapterPrompts: Record<number, { user: string; keys: string[] }> = {
    1: {
      keys: ["nature", "temperament", "parentRelation"],
      user: `제1장: 아이의 타고난 기질과 성격

다음 세 섹션을 분석해주세요:
1. "nature": ${name}의 일간과 사주 구성으로 본 타고난 성격과 기질 (구체적인 오행 분석 포함)
2. "temperament": 아이가 좋아하는 것, 힘들어하는 것, 행동 패턴과 특징
3. "parentRelation": 이런 기질의 아이를 어떻게 대해야 좋은 관계를 맺을 수 있는지`,
    },
    2: {
      keys: ["talent", "hiddenStrength", "weaknesses"],
      user: `제2장: 숨겨진 재능과 잠재력

다음 세 섹션을 분석해주세요:
1. "talent": 사주에서 보이는 가장 강한 재능 분야와 그 이유 (오행·신살 기준)
2. "hiddenStrength": 겉으로 잘 드러나지 않는 숨겨진 잠재력과 능력
3. "weaknesses": 사주상 취약한 부분과 이를 보완하는 방법`,
    },
    3: {
      keys: ["studyStyle", "career", "environment"],
      user: `제3장: 공부 방식과 진로 방향

다음 세 섹션을 분석해주세요:
1. "studyStyle": ${name}에게 맞는 공부 방식과 학습 스타일 (암기형/창의형/실습형 등 구체적으로)
2. "career": 사주 기준으로 잘 맞는 직업군과 진로 방향 (3~5가지 구체적으로)
3. "environment": 아이가 가장 잘 성장할 수 있는 환경과 부모가 만들어줘야 할 것들`,
    },
    4: {
      keys: ["hardPeriod", "luckyPeriod", "yearFlow"],
      user: `제4장: 아이의 운의 흐름 — 힘든 시기와 좋은 시기

다음 세 섹션을 분석해주세요:
1. "hardPeriod": 아이에게 가장 힘든 시기 (대운·세운 기준으로 구체적 연도 포함)와 그 시기 대비법
2. "luckyPeriod": 아이에게 가장 좋은 운이 오는 시기와 그 기회를 살리는 방법
3. "yearFlow": 2026년 ${name}에게 오는 운의 흐름과 이 해의 핵심 메시지`,
    },
    5: {
      keys: ["health", "parentingTips", "warnings"],
      user: `제5장: 건강과 육아 주의사항

다음 세 섹션을 분석해주세요:
1. "health": 사주상 건강 취약 부위와 평소 주의해야 할 건강 관리법
2. "parentingTips": 이 아이에게 맞는 육아 방식 — 부모가 꼭 해줘야 할 것들
3. "warnings": 절대 하면 안 되는 육아 실수와 아이를 위축시키는 행동들`,
    },
    6: {
      keys: ["letter"],
      user: `마무리: 홍연의 편지

"letter" 섹션: 홍연이 ${name}의 부모님에게 직접 쓰는 따뜻한 편지 형식으로.
아이를 사랑하는 부모에게 사주를 통해 발견한 아이의 특별한 점과 앞으로의 응원 메시지를 담아주세요.
5~7개의 문단으로 깊이 있게 작성해주세요.`,
    },
  };

  const ch = chapterPrompts[chapter];
  if (!ch) return { system, user: "" };

  return {
    system,
    user: `${context}\n\n---\n${ch.user}\n\n위 섹션들을 JSON으로 반환하세요. 키: ${ch.keys.join(", ")}`,
  };
}

// ─── 한 챕터 생성 ────────────────────────────────────────────────────────────
async function genChapterContent(chapter: number, input: Parameters<typeof buildChildChapterPrompt>[1]) {
  const { system, user } = buildChildChapterPrompt(chapter, input);
  for (let i = 0; i < 2; i++) {
    try {
      const llm = await generateInterpretation({ system, user, json: true });
      const obj = JSON.parse(llm.text.replace(/```json\n?|```/g, "").trim());
      if (obj && typeof obj === "object") return obj as Record<string, unknown>;
    } catch { /* retry */ }
  }
  throw new Error(`${chapter}장 생성 실패`);
}

// ─── 스키마 ──────────────────────────────────────────────────────────────────
const createSchema = z.object({
  name:     z.string().optional().default(""),
  date:     z.string().min(1),
  time:     z.string().optional().default(""),
  calendar: z.string().optional().default("양력"),
  gender:   z.string().optional().default(""),
  email:    z.string().optional().default(""),
  concern:  z.string().optional().default(""),
});

const chapterSchema = z.object({
  id:      z.string().min(1),
  chapter: z.number().int().min(1).max(6),
  force:   z.boolean().optional().default(false),
});

// ─── POST ────────────────────────────────────────────────────────────────────
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

// ─── GET ─────────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id 필요" }, { status: 400 });
  const service = createServiceClient();
  const { data, error } = await service.from("saju_results").select("myeongsik, interpretation_md").eq("id", id).maybeSingle();
  if (error || !data) return NextResponse.json({ error: "결과를 찾을 수 없습니다." }, { status: 404 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stored = data.myeongsik as any;
  let content: Record<string, unknown> = {};
  try { content = JSON.parse(data.interpretation_md) || {}; } catch { content = {}; }
  return NextResponse.json({ ...stored, content });
}

// ─── 저장 ────────────────────────────────────────────────────────────────────
async function saveContent(id: string, content: Record<string, unknown>) {
  const service = createServiceClient();
  const { data } = await service.from("saju_results").select("interpretation_md").eq("id", id).maybeSingle();
  let existing: Record<string, unknown> = {};
  try { existing = JSON.parse(data?.interpretation_md || "{}") || {}; } catch { existing = {}; }
  const merged = { ...existing, ...content };
  await service.from("saju_results").update({ interpretation_md: JSON.stringify(merged) }).eq("id", id);
  return NextResponse.json({ ok: true });
}

// ─── 초기 생성 ───────────────────────────────────────────────────────────────
async function createReport(body: unknown) {
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  const { name, date, time, calendar, gender, email, concern } = parsed.data;

  const saju = calcSaju(date, time, calendar);
  if (!saju) return NextResponse.json({ error: "생년월일 형식 오류" }, { status: 400 });

  const sajuText = sajuToText(saju, name || "아이", gender);

  const env = serverEnv();
  const llm = { provider: env.LLM_PROVIDER, model: env.LLM_MODEL };

  const service = createServiceClient();

  const orderCode = `ch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const { data: product } = await service.from("products").select("id").eq("slug", "saju_health").maybeSingle();
  const { data: fallback } = product ? { data: null } : await service.from("products").select("id").limit(1).maybeSingle();
  const productId = product?.id ?? fallback?.id ?? null;

  const { data: order, error: orderErr } = await service
    .from("orders")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert({ order_id: orderCode, product_id: productId as any, guest_email: email || "guest@hongyeondang.com", amount: 0, status: "paid", paid_at: new Date().toISOString() })
    .select("id")
    .single();
  if (orderErr || !order) return NextResponse.json({ error: "주문 생성 실패", detail: orderErr?.message }, { status: 500 });

  const stored = {
    name, gender, sajuText, saju, concern,
    birth: { date, calendar, time, gender },
  };

  const { data: result, error: resultErr } = await service
    .from("saju_results")
    .insert({ order_id: order.id, myeongsik: stored as never, interpretation_md: "{}", llm_provider: llm.provider, llm_model: llm.model })
    .select("id")
    .single();
  if (resultErr || !result) return NextResponse.json({ error: "결과 저장 실패", detail: resultErr?.message }, { status: 500 });

  return NextResponse.json({ resultId: result.id, saju, name, content: {} });
}

// ─── 단일 챕터 생성 ──────────────────────────────────────────────────────────
async function generateChapter(body: unknown) {
  const parsed = chapterSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  const { id, chapter, force } = parsed.data;

  const service = createServiceClient();
  const { data, error } = await service.from("saju_results").select("myeongsik, interpretation_md").eq("id", id).maybeSingle();
  if (error || !data) return NextResponse.json({ error: "결과를 찾을 수 없습니다." }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stored = data.myeongsik as any;
  let content: Record<string, unknown> = {};
  try { content = JSON.parse(data.interpretation_md) || {}; } catch { content = {}; }

  if (!force && isHealthChapterReady(content, chapter)) {
    const sections: Record<string, unknown> = {};
    for (const k of HEALTH_CHAPTER_SECTIONS[chapter] ?? []) sections[k] = content[k];
    return NextResponse.json({ sections });
  }

  try {
    const rawSections = await genChapterContent(chapter, {
      name:     stored.name ?? "",
      gender:   stored.gender ?? "",
      sajuText: stored.sajuText ?? "",
      concern:  stored.concern ?? "",
    });
    const myLabel = (stored.name ?? "").length > 1 ? (stored.name ?? "").slice(1) : (stored.name ?? "");
    const sections = fixNamesInValue(rawSections, myLabel, null, "님") as typeof rawSections;
    return NextResponse.json({ sections });
  } catch (err) {
    return NextResponse.json({ error: "챕터 생성 실패", detail: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
