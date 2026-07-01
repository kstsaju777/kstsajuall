// 연애궁합 결과지 생성 + 저장 API
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { generateInterpretation } from "@/lib/saju/llm";
import { calcSaju, ohaengMap } from "@/lib/saju/local-manseryeok";
import type { LocalSajuResult } from "@/lib/saju/local-manseryeok";
import { serverEnv } from "@/lib/env";
import { BUSINESS_CHAPTER_SECTIONS, isBusinessChapterReady } from "@/lib/saju/business-report-content";

export const maxDuration = 300;

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
  const genderLabel = gender === "여자" || gender === "female" ? "여성" : "남성";
  return `[${name}·${genderLabel}]\n${lines.join("\n")}`;
}

function buildYeonaeChapterPrompt(chapter: number, input: {
  name: string; gender: string; mySajuText: string;
  partnerName: string; partnerGender: string; partnerSajuText: string;
  concern: string;
}): { system: string; user: string } {
  const { name, gender, mySajuText, partnerName, partnerGender, partnerSajuText, concern } = input;
  const gLabel  = gender === "여자" || gender === "female" ? "여자" : "남자";
  const pgLabel = partnerGender === "여자" || partnerGender === "female" ? "여자" : "남자";

  const system = `당신은 홍연(洪緣)이라는 이름의 조선 시대 역학(易學) 전문가입니다.
사주팔자를 바탕으로 두 사람의 연애 궁합과 관계의 흐름을 깊이 풀어주세요.
문체는 따뜻하고 감성적이며, 구체적이고 통찰력 있게 서술하세요.
각 섹션은 반드시 JSON 형식으로 반환하세요.
JSON 구조: { "sectionKey": { "title": "...", "paragraphs": ["...", "...", "..."] } }
각 섹션당 3~5개의 문단(paragraphs)으로 구성하세요. 각 문단은 50~150자.`;

  const context = `[의뢰인 정보]
${mySajuText}

[상대방 정보]
${partnerSajuText}

[의뢰인 고민]: ${concern || "없음"}`;

  const chapterPrompts: Record<number, { user: string; keys: string[] }> = {
    1: {
      keys: ["myGist", "partnerGist", "attractionReason"],
      user: `제1장: 두 사람의 타고난 기질과 끌리는 이유

다음 세 섹션을 분석해주세요:
1. "myGist": ${name}(${gLabel})의 일간과 사주 구성으로 본 타고난 기질·성향·연애 스타일
2. "partnerGist": ${partnerName}(${pgLabel})의 일간과 사주 구성으로 본 타고난 기질·성향·연애 스타일
3. "attractionReason": 두 사람이 서로에게 끌리는 사주적 이유와 인연의 깊이`,
    },
    2: {
      keys: ["compatScore", "conflictPattern", "emotionDiff"],
      user: `제2장: 두 사람의 궁합 분석

다음 세 섹션을 분석해주세요:
1. "compatScore": 두 사람의 사주 궁합 점수와 근거 (오행 조화, 일간 관계, 형충파해 등 구체적으로)
2. "conflictPattern": 두 사람 사이에서 반복될 수 있는 갈등 패턴과 그 이면의 심리
3. "emotionDiff": 두 사람의 감정 표현 방식의 차이와 이것이 관계에 미치는 영향`,
    },
    3: {
      keys: ["partnerView", "partnerFeelings", "approachTiming"],
      user: `제3장: 상대방의 마음 — 지금 나를 어떻게 생각하는가

다음 세 섹션을 분석해주세요:
1. "partnerView": ${partnerName}의 사주 기준으로 ${name}이 어떤 의미인지, 현재 ${name}을 어떻게 바라보는지
2. "partnerFeelings": ${partnerName}의 현재 감정 상태와 연애에 대한 내면의 욕구
3. "approachTiming": 지금 고백하거나 다가가면 어떤 반응이 예상되는지, 어떤 방식과 타이밍이 효과적인지`,
    },
    4: {
      keys: ["lovePeriod", "luckyPeriod", "warningPeriod"],
      user: `제4장: 연애 시기와 운의 흐름

다음 세 섹션을 분석해주세요:
1. "lovePeriod": 두 사람의 대운·세운 흐름으로 본 연애가 깊어지는 시기 (구체적 연도·월 포함)
2. "luckyPeriod": 두 사람의 관계에 가장 좋은 운이 오는 시기와 그 기회를 살리는 방법
3. "warningPeriod": 관계가 흔들릴 수 있는 위험한 시기와 주의해야 할 것들`,
    },
    5: {
      keys: ["obstacles", "badActions", "correctApproach"],
      user: `제5장: 관계를 방해하는 요인과 올바른 접근법

다음 세 섹션을 분석해주세요:
1. "obstacles": ${name}의 사주에서 연애를 방해하는 신살·오행·대운 요인
2. "badActions": 좋은 관계를 원한다면 반드시 피해야 할 행동과 말투 (구체적으로)
3. "correctApproach": 두 사람의 관계를 더 깊게 만드는 올바른 접근법과 자기 변화 방향`,
    },
    6: {
      keys: ["letter"],
      user: `마무리: 홍연의 편지

"letter" 섹션: 홍연이 ${name}에게 직접 쓰는 따뜻한 편지 형식으로.
사랑을 찾고 있는 ${name}에게 진심 어린 응원과 지혜를 전해주세요.
두 사람의 사주를 통해 본 인연의 의미와 앞으로의 방향을 담아주세요.
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

async function genChapterContent(chapter: number, input: Parameters<typeof buildYeonaeChapterPrompt>[1]) {
  const { system, user } = buildYeonaeChapterPrompt(chapter, input);
  for (let i = 0; i < 2; i++) {
    try {
      const llm = await generateInterpretation({ system, user, json: true });
      const obj = JSON.parse(llm.text.replace(/```json\n?|```/g, "").trim());
      if (obj && typeof obj === "object") return obj as Record<string, unknown>;
    } catch { /* retry */ }
  }
  throw new Error(`${chapter}장 생성 실패`);
}

const createSchema = z.object({
  name:           z.string().optional().default(""),
  date:           z.string().min(1),
  time:           z.string().optional().default(""),
  calendar:       z.string().optional().default("양력"),
  gender:         z.string().optional().default(""),
  email:          z.string().optional().default(""),
  concern:        z.string().optional().default(""),
  partnerName:    z.string().optional().default(""),
  partnerDate:    z.string().min(1),
  partnerTime:    z.string().optional().default(""),
  partnerCalendar: z.string().optional().default("양력"),
  partnerGender:  z.string().optional().default(""),
});

const chapterSchema = z.object({
  id:      z.string().min(1),
  chapter: z.number().int().min(1).max(6),
  force:   z.boolean().optional().default(false),
});

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

async function saveContent(id: string, content: Record<string, unknown>) {
  const service = createServiceClient();
  const { data } = await service.from("saju_results").select("interpretation_md").eq("id", id).maybeSingle();
  let existing: Record<string, unknown> = {};
  try { existing = JSON.parse(data?.interpretation_md || "{}") || {}; } catch { existing = {}; }
  const merged = { ...existing, ...content };
  await service.from("saju_results").update({ interpretation_md: JSON.stringify(merged) }).eq("id", id);
  return NextResponse.json({ ok: true });
}

async function createReport(body: unknown) {
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  const { name, date, time, calendar, gender, email, concern, partnerName, partnerDate, partnerTime, partnerCalendar, partnerGender } = parsed.data;

  const saju        = calcSaju(date, time, calendar);
  const partnerSaju = calcSaju(partnerDate, partnerTime, partnerCalendar);
  if (!saju)        return NextResponse.json({ error: "생년월일 형식 오류 (나)" }, { status: 400 });
  if (!partnerSaju) return NextResponse.json({ error: "생년월일 형식 오류 (상대방)" }, { status: 400 });

  const mySajuText      = sajuToText(saju, name || "나", gender);
  const partnerSajuText = sajuToText(partnerSaju, partnerName || "상대방", partnerGender);

  const env = serverEnv();
  const llm = { provider: env.LLM_PROVIDER, model: env.LLM_MODEL };
  const service = createServiceClient();

  const orderCode = `yn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const { data: product } = await service.from("products").select("id").eq("slug", "kunghap_business").maybeSingle();
  const { data: fallback } = product ? { data: null } : await service.from("products").select("id").limit(1).maybeSingle();
  const productId = product?.id ?? fallback?.id ?? null;

  const { data: order, error: orderErr } = await service
    .from("orders")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert({ order_id: orderCode, product_id: productId as any, guest_email: email || "guest@hongyeondang.com", amount: 0, status: "paid", paid_at: new Date().toISOString() })
    .select("id").single();
  if (orderErr || !order) return NextResponse.json({ error: "주문 생성 실패", detail: orderErr?.message }, { status: 500 });

  const stored = {
    name, gender, mySajuText, saju,
    partnerName, partnerGender, partnerSajuText, partnerSaju,
    concern,
    birth: { date, calendar, time, gender },
    partnerBirth: { date: partnerDate, calendar: partnerCalendar, time: partnerTime, gender: partnerGender },
  };

  const { data: result, error: resultErr } = await service
    .from("saju_results")
    .insert({ order_id: order.id, myeongsik: stored as never, interpretation_md: "{}", llm_provider: llm.provider, llm_model: llm.model })
    .select("id").single();
  if (resultErr || !result) return NextResponse.json({ error: "결과 저장 실패", detail: resultErr?.message }, { status: 500 });

  return NextResponse.json({ resultId: result.id, saju, partnerSaju, name, partnerName, content: {} });
}

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

  if (!force && isBusinessChapterReady(content, chapter)) {
    const sections: Record<string, unknown> = {};
    for (const k of BUSINESS_CHAPTER_SECTIONS[chapter] ?? []) sections[k] = content[k];
    return NextResponse.json({ sections });
  }

  try {
    const sections = await genChapterContent(chapter, {
      name: stored.name ?? "", gender: stored.gender ?? "", mySajuText: stored.mySajuText ?? "",
      partnerName: stored.partnerName ?? "", partnerGender: stored.partnerGender ?? "", partnerSajuText: stored.partnerSajuText ?? "",
      concern: stored.concern ?? "",
    });
    return NextResponse.json({ sections });
  } catch (err) {
    return NextResponse.json({ error: "챕터 생성 실패", detail: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
