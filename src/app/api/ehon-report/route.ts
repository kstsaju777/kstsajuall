// 이혼사주 결과지 생성 + 저장 API
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { generateInterpretation } from "@/lib/saju/llm";
import { calcSaju, ohaengMap } from "@/lib/saju/local-manseryeok";
import type { LocalSajuResult } from "@/lib/saju/local-manseryeok";
import { serverEnv } from "@/lib/env";
import { EHON_CHAPTER_SECTIONS, isEhonChapterReady } from "@/lib/saju/ehon-report-content";

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
  const genderLabel = gender === "여자" || gender === "여성" || gender === "female" ? "여성" : "남성";
  return `[${name}·${genderLabel}]\n${lines.join("\n")}`;
}

function buildEhonChapterPrompt(chapter: number, input: {
  name: string; gender: string; mySajuText: string;
  partnerName: string; partnerGender: string; partnerSajuText: string;
  concern: string;
}): { system: string; user: string } {
  const { name, gender, mySajuText, partnerName, partnerGender, partnerSajuText, concern } = input;
  const gLabel  = gender === "여자" || gender === "여성" || gender === "female" ? "여자" : "남자";
  const pgLabel = partnerGender === "여자" || partnerGender === "여성" || partnerGender === "female" ? "여자" : "남자";

  const system = `당신은 홍연(洪緣)이라는 이름의 조선 시대 역학(易學) 전문가입니다.
사주팔자를 바탕으로 두 사람의 결혼 인연과 이혼 문제를 깊이 풀어주세요.
문체는 따뜻하고 진지하며, 구체적이고 통찰력 있게 서술하세요.
각 섹션은 반드시 JSON 형식으로 반환하세요.
JSON 구조: { "sectionKey": { "title": "...", "paragraphs": ["...", "...", "..."] } }
각 섹션당 3~5개의 문단(paragraphs)으로 구성하세요. 각 문단은 50~150자.`;

  const context = `[의뢰인 정보]
${mySajuText}

[배우자 정보]
${partnerSajuText}

[의뢰인 고민]: ${concern || "없음"}`;

  const chapterPrompts: Record<number, { user: string; keys: string[] }> = {
    1: {
      keys: ["myGist", "partnerGist", "marriageIneon"],
      user: `제1장: 두 사람의 타고난 기질과 결혼 인연

다음 세 섹션을 분석해주세요:
1. "myGist": ${name}(${gLabel})의 일간과 사주 구성으로 본 타고난 기질·성향·결혼관
2. "partnerGist": ${partnerName}(${pgLabel})의 일간과 사주 구성으로 본 타고난 기질·성향·결혼관
3. "marriageIneon": 두 사람이 결혼하게 된 사주적 인연과 이 결혼이 갖는 의미`,
    },
    2: {
      keys: ["compatScore", "conflictRoot", "emotionGap"],
      user: `제2장: 부부 궁합과 갈등의 뿌리

다음 세 섹션을 분석해주세요:
1. "compatScore": 두 사람의 사주 궁합 점수와 근거 (오행 조화, 일간 관계, 형충파해 등 구체적으로)
2. "conflictRoot": 지금의 갈등이 왜 반복되는지 사주적 뿌리와 심리적 원인
3. "emotionGap": 두 사람의 감정 표현 방식의 차이가 어떻게 갈등을 심화시키는지`,
    },
    3: {
      keys: ["partnerMind", "partnerFeelings", "reconcilePossibility"],
      user: `제3장: 배우자의 속마음

다음 세 섹션을 분석해주세요:
1. "partnerMind": ${partnerName}의 사주 기준으로 현재 이 결혼과 ${name}에 대해 어떻게 느끼는지
2. "partnerFeelings": ${partnerName}의 현재 감정 상태와 이혼에 대한 내면의 생각
3. "reconcilePossibility": 사주로 본 화해 또는 관계 회복의 가능성과 조건`,
    },
    4: {
      keys: ["divorceTimingAnalysis", "warningPeriod", "luckyPeriod"],
      user: `제4장: 이혼 시기와 운의 흐름

다음 세 섹션을 분석해주세요:
1. "divorceTimingAnalysis": 두 사람의 대운·세운 흐름으로 본 지금이 이혼하기에 맞는 시기인지 분석 (구체적 연도 포함)
2. "warningPeriod": 앞으로 관계가 더 악화될 수 있는 위험한 시기와 주의사항
3. "luckyPeriod": 결정을 내리기에 가장 좋은 시기와 그 이유`,
    },
    5: {
      keys: ["afterDivorceLife", "newIneon", "selfRecovery"],
      user: `제5장: 이혼 후 삶과 새로운 인연

다음 세 섹션을 분석해주세요:
1. "afterDivorceLife": ${name}의 사주로 본 이혼 후 삶의 흐름과 운의 변화
2. "newIneon": 재혼 또는 새로운 인연이 올 시기와 어떤 인연이 올 가능성이 있는지
3. "selfRecovery": 이혼 후 ${name}이 정서적·경제적으로 회복하고 성장하는 방향`,
    },
    6: {
      keys: ["letter"],
      user: `마무리: 홍연의 편지

"letter" 섹션: 홍연이 ${name}에게 직접 쓰는 따뜻한 편지 형식으로.
힘든 결혼 위기를 겪고 있는 ${name}에게 진심 어린 위로와 지혜를 전해주세요.
두 사람의 사주를 통해 본 인연의 의미와 앞으로 나아갈 방향을 담아주세요.
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

async function genChapterContent(chapter: number, input: Parameters<typeof buildEhonChapterPrompt>[1]) {
  const { system, user } = buildEhonChapterPrompt(chapter, input);
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
  name:            z.string().optional().default(""),
  date:            z.string().min(1),
  time:            z.string().optional().default(""),
  calendar:        z.string().optional().default("양력"),
  gender:          z.string().optional().default(""),
  email:           z.string().optional().default(""),
  concern:         z.string().optional().default(""),
  partnerName:     z.string().optional().default(""),
  partnerDate:     z.string().min(1),
  partnerTime:     z.string().optional().default(""),
  partnerCalendar: z.string().optional().default("양력"),
  partnerGender:   z.string().optional().default(""),
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
  if (!partnerSaju) return NextResponse.json({ error: "생년월일 형식 오류 (배우자)" }, { status: 400 });

  const mySajuText      = sajuToText(saju, name || "나", gender);
  const partnerSajuText = sajuToText(partnerSaju, partnerName || "배우자", partnerGender);

  const env = serverEnv();
  const llm = { provider: env.LLM_PROVIDER, model: env.LLM_MODEL };
  const service = createServiceClient();

  const orderCode = `eh-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const { data: product } = await service.from("products").select("id").eq("slug", "ehon-saju").maybeSingle();
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

  if (!force && isEhonChapterReady(content, chapter)) {
    const sections: Record<string, unknown> = {};
    for (const k of EHON_CHAPTER_SECTIONS[chapter] ?? []) sections[k] = content[k];
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
