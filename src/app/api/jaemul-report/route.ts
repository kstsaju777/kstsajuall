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
import { JAEMUL_CHAPTER_SECTIONS, isJaemulChapterReady } from "@/lib/saju/jaemul-report-content";

export const maxDuration = 60;

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
  const gLabel = gender === "여성" || gender === "female" ? "여성" : "남성";
  return `[${name}·${gLabel}]\n${lines.join("\n")}`;
}

// ─── 챕터 프롬프트 빌드 ──────────────────────────────────────────────────────
function buildChildChapterPrompt(chapter: number, input: {
  name: string; gender: string; sajuText: string; concern: string;
}): { system: string; user: string } {
  const { name, sajuText, concern } = input;

  const system = `당신은 홍연(洪緣)이라는 이름의 조선 시대 역학 전문가입니다.
의뢰인의 사주팔자를 바탕으로 타고난 재물 기운, 돈의 흐름, 재물운이 열리는 시기를 깊이 있고 구체적으로 풀어주세요.
실질적인 재물 조언을 담아주세요.
각 섹션은 반드시 JSON 형식으로 반환하세요.
JSON 구조: { "sectionKey": { "title": "...", "paragraphs": ["...", "...", "..."] } }
각 섹션당 3~5개의 문단(paragraphs)으로 구성하세요. 각 문단은 60~180자.`;

  const context = `[의뢰인 정보]
이름: ${name}
${sajuText}

[고민]: ${concern || "없음"}`;

  const chapterPrompts: Record<number, { user: string; keys: string[] }> = {
    1: {
      keys: ["myGist", "moneyStyle", "wealthPotential"],
      user: `제1장: 나의 타고난 기질과 재물관

다음 세 섹션을 분석해주세요:
1. "myGist": title은 "타고난 기질과 재물 성향" — ${name}의 일간과 사주 구성으로 본 타고난 성격 및 재물에 대한 기본 태도
2. "moneyStyle": title은 "나만의 돈 버는 방식" — 사주에서 드러나는 재물 획득 방식(직장형/사업형/투자형 등 오행 기준으로 구체적으로)
3. "wealthPotential": title은 "재물 그릇의 크기" — 재성의 강약, 관성·식상과의 관계로 본 재물 그릇과 부의 잠재력`,
    },
    2: {
      keys: ["wealthTiming", "luckyPeriod", "warningPeriod"],
      user: `제2장: 재물운과 돈의 흐름

다음 세 섹션을 분석해주세요:
1. "wealthTiming": title은 "재물운이 열리는 시기" — 대운·세운 기준으로 재물이 크게 들어오는 시기(구체적 연도 포함)
2. "luckyPeriod": title은 "돈이 가장 잘 모이는 시기" — 재물운이 가장 강한 대운 구간과 그 시기를 살리는 방법
3. "warningPeriod": title은 "조심해야 할 시기" — 재물 손실 위험이 높은 시기와 미리 대비하는 방법`,
    },
    3: {
      keys: ["incomeSource", "investStyle", "riskPattern"],
      user: `제3장: 돈이 들어오는 방식과 투자 스타일

다음 세 섹션을 분석해주세요:
1. "incomeSource": title은 "나에게 맞는 수입원" — 사주상 어떤 방식의 수입이 잘 맞는지(월급/사업/부업/투자 등 구체적으로)
2. "investStyle": title은 "나의 투자 스타일" — 부동산·주식·사업 중 사주가 끌리는 방향과 그 이유
3. "riskPattern": title은 "반복되는 재물 손실 패턴" — 사주에서 보이는 돈을 잃는 패턴과 고치는 방법`,
    },
    4: {
      keys: ["careerWealth", "businessFit", "partnershipWealth"],
      user: `제4장: 직업운과 사업 적성

다음 세 섹션을 분석해주세요:
1. "careerWealth": title은 "직업운과 재물" — 사주 기준 재물을 가장 잘 모을 수 있는 직업군(3~5가지 구체적으로)
2. "businessFit": title은 "사업 적성과 적합 업종" — 사업을 한다면 어떤 업종이 맞는지, 사주상 사업가 기질이 있는지
3. "partnershipWealth": title은 "동업·협력의 재물운" — 동업 또는 파트너십이 재물운에 도움이 되는지, 주의할 점은 무엇인지`,
    },
    5: {
      keys: ["obstacles", "badMoneyHabits", "correctApproach"],
      user: `제5장: 재물을 방해하는 것들

다음 세 섹션을 분석해주세요:
1. "obstacles": title은 "재물을 막는 사주적 장애" — 사주 구조상 재물 흐름을 방해하는 요소(충·형·파·해 등)와 해결 방향
2. "badMoneyHabits": title은"고쳐야 할 돈 습관" — 재물 손실로 이어지는 사주적 성향과 행동 패턴
3. "correctApproach": title은 "재물운을 높이는 방법" — 이 사주에게 맞는 재물운 개선 방법과 실생활 조언`,
    },
    6: {
      keys: ["letter"],
      user: `마무리: 홍연의 편지

"letter" 섹션: title은 "홍연으로부터" — 홍연이 ${name}님에게 직접 쓰는 편지 형식으로.
사주를 통해 발견한 재물적 강점, 앞으로의 재물운 흐름, 그리고 진심 어린 응원을 담아주세요.
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
  const { data: product } = await service.from("products").select("id").eq("slug", "saju_jaemul").maybeSingle();
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

  if (!force && isJaemulChapterReady(content, chapter)) {
    const sections: Record<string, unknown> = {};
    for (const k of JAEMUL_CHAPTER_SECTIONS[chapter] ?? []) sections[k] = content[k];
    return NextResponse.json({ sections });
  }

  try {
    const sections = await genChapterContent(chapter, {
      name:     stored.name ?? "",
      gender:   stored.gender ?? "",
      sajuText: stored.sajuText ?? "",
      concern:  stored.concern ?? "",
    });
    return NextResponse.json({ sections });
  } catch (err) {
    return NextResponse.json({ error: "챕터 생성 실패", detail: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
