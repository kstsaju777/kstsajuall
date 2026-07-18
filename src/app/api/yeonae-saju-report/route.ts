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
import { YEONAE_SAJU_CHAPTER_SECTIONS, isYeonaeSajuChapterReady } from "@/lib/saju/yeonae-saju-report-content";
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
  const gLabel = gender === "여성" ? "여성" : gender === "남성" ? "남성" : gender;
  return `[${name}·${gLabel}]\n${lines.join("\n")}`;
}

// ─── 챕터 프롬프트 빌드 ──────────────────────────────────────────────────────
function buildChildChapterPrompt(chapter: number, input: {
  name: string; gender: string; sajuText: string; concern: string;
}): { system: string; user: string } {
  const { name, gender, sajuText, concern } = input;
  const gLabel = gender === "여성" ? "여성" : gender === "남성" ? "남성" : gender;

  const system = `당신은 홍연(洪緣)이라는 이름의 조선 시대 역학 전문가입니다.
사주팔자를 바탕으로 의뢰인의 연애운과 인연의 흐름을 깊이 있고 솔직하게 풀어주세요.
따뜻하면서도 현실적인 조언을 담아, 읽는 사람이 자신의 사랑을 이해하고 더 나은 선택을 할 수 있도록 도와주세요.
각 섹션은 반드시 JSON 형식으로 반환하세요.
JSON 구조: { "sectionKey": { "title": "...", "paragraphs": ["...", "...", "..."] } }
각 섹션당 3~5개의 문단(paragraphs)으로 구성하세요. 각 문단은 50~150자.`;

  const context = `[의뢰인 정보]
이름: ${name} (${gLabel})
${sajuText}

[고민]: ${concern || "없음"}`;

  const chapterPrompts: Record<number, { user: string; keys: string[] }> = {
    1: {
      keys: ["myGist", "loveStyle", "attractionType"],
      user: `제1장: 나의 타고난 기질과 연애 성향

다음 세 섹션을 분석해주세요:
1. "myGist": ${name}의 일간과 사주 구성으로 본 타고난 성격과 기질 — 연애에서 어떤 사람인지
2. "loveStyle": 연애에서 나타나는 행동 패턴, 감정 표현 방식, 사랑에 빠질 때의 특징
3. "attractionType": 나도 모르게 끌리는 이성의 유형과 그 이유 (오행·일간 기준)`,
    },
    2: {
      keys: ["loveTiming", "luckyPeriod", "warningPeriod"],
      user: `제2장: 연애운과 인연의 흐름

다음 세 섹션을 분석해주세요:
1. "loveTiming": 인연이 찾아오는 시기 — 대운·세운 기준으로 구체적 시기 포함
2. "luckyPeriod": 연애운이 가장 강한 시기와 그 기회를 놓치지 않는 방법
3. "warningPeriod": 연애에서 조심해야 할 시기와 그 이유`,
    },
    3: {
      keys: ["idealPartner", "meetingChance", "lovePattern"],
      user: `제3장: 이상적인 이성 유형과 만남의 기회

다음 세 섹션을 분석해주세요:
1. "idealPartner": 사주 기준으로 ${name}과 잘 맞는 이성의 성격·특징·오행
2. "meetingChance": 인연을 만날 가능성이 높은 장소, 상황, 계기
3. "lovePattern": 과거 연애에서 반복되어온 패턴과 그 원인`,
    },
    4: {
      keys: ["conflictStyle", "emotionPattern", "growthInLove"],
      user: `제4장: 연애 패턴과 감정 스타일

다음 세 섹션을 분석해주세요:
1. "conflictStyle": 연애에서 갈등이 생길 때 ${name}이 보이는 반응과 해결 방식
2. "emotionPattern": 감정을 표현하는 방식 — 차갑게 보일 수 있는 부분과 따뜻한 면
3. "growthInLove": 연애를 통해 성장하는 방식과 이상적인 관계의 모습`,
    },
    5: {
      keys: ["obstacles", "badLoveHabits", "correctApproach"],
      user: `제5장: 연애를 방해하는 요인과 해결책

다음 세 섹션을 분석해주세요:
1. "obstacles": 사주에서 보이는 연애를 가로막는 요소들 (형·충·공망 등 포함)
2. "badLoveHabits": 스스로도 모르는 연애에서의 나쁜 습관과 패턴
3. "correctApproach": 이를 극복하고 좋은 인연을 맞이하기 위한 구체적인 접근법`,
    },
    6: {
      keys: ["letter"],
      user: `마무리: 홍연의 편지

"letter" 섹션: 홍연이 ${name}에게 직접 쓰는 따뜻한 편지 형식으로.
사주를 통해 발견한 이 사람의 사랑의 가능성과, 앞으로의 인연에 대한 응원 메시지를 담아주세요.
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
  const { data: product } = await service.from("products").select("id").eq("slug", "saju_yeonae").maybeSingle();
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

  if (!force && isYeonaeSajuChapterReady(content, chapter)) {
    const sections: Record<string, unknown> = {};
    for (const k of YEONAE_SAJU_CHAPTER_SECTIONS[chapter] ?? []) sections[k] = content[k];
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
