// =====================================================
// LLM 프로바이더 스위치
// =====================================================
// LLM_PROVIDER 환경변수로 openai | anthropic | gemini 선택.
// 각 SDK는 lazy import 하여 미사용 패키지의 init 비용을 줄임.

import { serverEnv } from "@/lib/env";
import type Anthropic from "@anthropic-ai/sdk"; // 타입 전용 — 런타임 lazy import와 무관

export type LlmRequest = {
  system: string;
  user: string;
  json?: boolean; // true 면 JSON 형식 강제 (OpenAI json_object 모드)
  // 특정 상품만 전역 LLM_PROVIDER/LLM_MODEL과 다른 모델을 쓰고 싶을 때 지정 (예: 종합사주만 Claude로)
  provider?: "openai" | "anthropic" | "gemini";
  model?: string;
};

export type LlmResponse = {
  text: string;
  provider: string;
  model: string;
};

const GLOBAL_GRAMMAR_RULES = `\n\n⚠️ [전역 문법 규칙 — 모든 출력에 반드시 준수]\n· 권고·조언 문장에서 동사 현재형 수식절은 반드시 '-는 것이' 형태 사용. '-은 것이'(완료형 수식)를 미래·현재 권고에 쓰는 것 절대 금지. (예: '다듬는 것이 좋겠소' ○ / '다듬은 것이 좋겠소' ✗)\n· 한자 표기 절대 금지. 한글에 괄호로 한자를 병기하지 마오 (예: '창직(創職)' ✗, '창직' 또는 더 쉬운 표현 O).\n· 일반 독자가 바로 이해하기 어려운 전문 용어·한자어는 피하고, 반드시 쉬운 일상 표현으로 풀어 쓰오 (예: '창직' 대신 '새로운 직업을 만드는 일', '스스로 일자리를 개척하는 것' 등).\n· '~는가 하면' 연결어미를 '~는이 하면'처럼 잘못된 형태로 쓰지 마오. (예: '버겁게 하는가 하면' ○ / '버겁게 하는이 하면' ✗). 이 외에도 동사 어간에 '-는이', '-은이', '-인이' 같은 존재하지 않는 어미를 붙이지 말고, 표준 문법 어미('-는가', '-은가', '-는지', '-을지', '-인지' 등)만 사용하오. (예: '견뎌내셨을 것인이' ✗ / '견뎌내셨을 것인지' ○)\n· '일간'과 '일주'를 절대 혼동하지 마오. 일간(예: 임수·갑목 등 천간 한 글자+오행)은 일주의 절반일 뿐이고, 일주는 반드시 천간+지지를 합친 글자(예: 임진일주, 갑자일주)이오. '임수일주'처럼 일간에 곧바로 '일주'를 붙이는 표현은 절대 금지이오 — 일주를 말할 때는 반드시 천간+지지 두 글자를 합친 정확한 이름을 쓰오.`;

export async function generateInterpretation(req: LlmRequest): Promise<LlmResponse> {
  const env = serverEnv();
  const provider = req.provider ?? env.LLM_PROVIDER;
  const model = req.model ?? env.LLM_MODEL;
  const reqWithRules: LlmRequest = { ...req, system: req.system + GLOBAL_GRAMMAR_RULES };
  switch (provider) {
    case "openai":
      return callOpenAI(reqWithRules, model, env.OPENAI_API_KEY);
    case "anthropic":
      return callAnthropic(reqWithRules, model, env.ANTHROPIC_API_KEY);
    case "gemini":
      return callGemini(reqWithRules, model, env.GOOGLE_GENERATIVE_AI_API_KEY);
  }
}

async function callOpenAI(req: LlmRequest, model: string, key: string | undefined): Promise<LlmResponse> {
  if (!key) throw new Error("OPENAI_API_KEY is required when LLM_PROVIDER=openai");
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: key });
  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: req.system },
      { role: "user", content: req.user },
    ],
    temperature: 0.7,
    ...(req.json ? { response_format: { type: "json_object" as const } } : {}),
  });
  const text = completion.choices[0]?.message?.content ?? "";
  return { text, provider: "openai", model };
}

async function callAnthropic(req: LlmRequest, model: string, key: string | undefined): Promise<LlmResponse> {
  if (!key) throw new Error("ANTHROPIC_API_KEY is required when LLM_PROVIDER=anthropic");
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey: key });
  // thinking: 설치된 SDK(0.30.1) 타입 정의엔 없지만 API는 지원.
  // Sonnet/Opus 계열은 기본이 적응형 씽킹이라 콘텐츠 생성용으로는 꺼서 토큰 소진 문제 방지.
  // Haiku 등은 기본이 씽킹 off라 disabled를 보내면 오히려 거부될 수 있어 아예 생략.
  const supportsThinkingToggle = /sonnet|opus|fable|mythos/i.test(model);
  // 프롬프트 캐싱: system 프롬프트는 상품별로 고정 텍스트(GLOBAL_GRAMMAR_RULES 포함)라
  // 매 장(chapter)·매 신청자마다 동일하게 재전송됨 — cache_control로 캐싱해 반복 비용을 절감.
  // (5분 TTL 내 동일 system이면 캐시 히트 — 입력 토큰의 최대 90%까지 절감)
  const message = await client.messages.create({
    model,
    max_tokens: 16000,
    ...(supportsThinkingToggle ? { thinking: { type: "disabled" } } : {}),
    system: [{ type: "text", text: req.system, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: req.user }],
  } as unknown as Anthropic.MessageCreateParamsNonStreaming);
  if (process.env.NODE_ENV !== "production") {
    const u = message.usage as unknown as {
      cache_creation_input_tokens?: number;
      cache_read_input_tokens?: number;
      input_tokens: number;
      output_tokens: number;
    };
    console.log(
      `[claude usage] model=${model} input=${u.input_tokens} output=${u.output_tokens} cache_write=${u.cache_creation_input_tokens ?? 0} cache_read=${u.cache_read_input_tokens ?? 0}`
    );
  }
  const text = message.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("\n");
  return { text, provider: "anthropic", model };
}

async function callGemini(req: LlmRequest, model: string, key: string | undefined): Promise<LlmResponse> {
  if (!key) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is required when LLM_PROVIDER=gemini");
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const client = new GoogleGenerativeAI(key);
  const m = client.getGenerativeModel({ model, systemInstruction: req.system });
  const result = await m.generateContent(req.user);
  const text = result.response.text();
  return { text, provider: "gemini", model };
}

// gpt-image-1-mini로 사주 원국 이미지 생성 → Buffer 반환
export async function generateSajuImage(prompt: string, apiKey: string | undefined): Promise<Buffer> {
  if (!apiKey) throw new Error("OPENAI_API_KEY is required for image generation");
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey });
  const res = await client.images.generate({
    model: "gpt-image-1",
    prompt,
    n: 1,
    size: "1536x1024",
    quality: "medium",
  });
  const b64 = res.data?.[0]?.b64_json;
  if (!b64) throw new Error("이미지 데이터 없음");
  return Buffer.from(b64, "base64");
}
