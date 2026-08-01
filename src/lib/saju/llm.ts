// =====================================================
// LLM 프로바이더 스위치
// =====================================================
// LLM_PROVIDER 환경변수로 openai | anthropic | gemini 선택.
// 각 SDK는 lazy import 하여 미사용 패키지의 init 비용을 줄임.

import { serverEnv } from "@/lib/env";

export type LlmRequest = {
  system: string;
  user: string;
  json?: boolean; // true 면 JSON 형식 강제 (OpenAI json_object 모드)
};

export type LlmResponse = {
  text: string;
  provider: string;
  model: string;
};

const GLOBAL_GRAMMAR_RULES = `\n\n⚠️ [전역 문법 규칙 — 모든 출력에 반드시 준수]\n· 권고·조언 문장에서 동사 현재형 수식절은 반드시 '-는 것이' 형태 사용. '-은 것이'(완료형 수식)를 미래·현재 권고에 쓰는 것 절대 금지. (예: '다듬는 것이 좋겠소' ○ / '다듬은 것이 좋겠소' ✗)`;

export async function generateInterpretation(req: LlmRequest): Promise<LlmResponse> {
  const env = serverEnv();
  const reqWithRules: LlmRequest = { ...req, system: req.system + GLOBAL_GRAMMAR_RULES };
  switch (env.LLM_PROVIDER) {
    case "openai":
      return callOpenAI(reqWithRules, env.LLM_MODEL, env.OPENAI_API_KEY);
    case "anthropic":
      return callAnthropic(reqWithRules, env.LLM_MODEL, env.ANTHROPIC_API_KEY);
    case "gemini":
      return callGemini(reqWithRules, env.LLM_MODEL, env.GOOGLE_GENERATIVE_AI_API_KEY);
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
  const message = await client.messages.create({
    model,
    max_tokens: 2048,
    system: req.system,
    messages: [{ role: "user", content: req.user }],
  });
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
