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

const GLOBAL_GRAMMAR_RULES = `\n\n⚠️ [전역 문법 규칙 — 모든 출력에 반드시 준수]\n· 모든 문장은 예외 없이 홍연 말투(~이오/~하오/~했소/~겠소/~오)로 끝나야 하오. '-습니다', '-입니다', '-해요', '-합니다', '-됩니다' 같은 현대 존댓말체는 리포트의 어느 섹션(조언·서신·요약·부제 등 포함)에서도 절대 쓰면 안 되오. 문단이 길어지거나 여러 개여도 마지막 문장까지 반드시 홍연 말투를 유지하오.\n· 문장을 끝맺는 어미(~이오/~하오/~했소/~겠소 등) 뒤에는 반드시 마침표를 찍고 띄어쓴 다음 새 문장을 시작하오. 마침표 없이 어미 두 개를 그대로 이어붙이는 것("~되겠소이오", "~하였소하오" 등) 절대 금지 — 반드시 온전한 문장으로 끊어서 쓰오.\n· 권고·조언 문장에서 동사 현재형 수식절은 반드시 '-는 것이' 형태 사용. '-은 것이'(완료형 수식)를 미래·현재 권고에 쓰는 것 절대 금지. (예: '다듬는 것이 좋겠소' ○ / '다듬은 것이 좋겠소' ✗)\n· 한자 표기 절대 금지. 한글 단어나 용어 뒤에 괄호로 한자를 병기하는 것은 어떤 형태든 전부 금지이오 — 단어 전체의 한자(예: '창직(創職)' ✗), 사주 용어의 한자(예: '신강(身強)' ✗, '편인격(偏印格)' ✗, '병(病)' ✗), 오행·십성 한 글자의 한자(예: '재성(土)' ✗, '화생토(化生土)' ✗, '금(金)' ✗)와 그 밖의 모든 한자 병기(예: '본기(本氣)' ✗, '편인격(偏印格)' ✗)까지 모두 예외 없이 금지이오. 한자는 단 한 글자도 리포트에 등장해서는 안 되며, 한글 단어만 쓰거나 더 쉬운 표현으로 풀어 쓰오 (예: '신강(身強)' ✗ → '신강' ○, '재성(土)이 화생토(化生土)의 통관이 필요' ✗ → '재성인 토 기운이 중간에서 이어주는 역할이 필요' ○).\n· 일반 독자가 바로 이해하기 어려운 전문 용어·한자어는 피하고, 반드시 쉬운 일상 표현으로 풀어 쓰오 (예: '창직' 대신 '새로운 직업을 만드는 일', '스스로 일자리를 개척하는 것' 등). '거하다'(예: '대운에 거하고 있는')처럼 예스럽고 낯선 한자어도 쓰지 말고 '지나고 있는', '머물러 있는' 같은 쉬운 말로 풀어 쓰오.\n· 사주 전문 용어(십성명·격국명·신살명·오행 생극 용어 등)는 한 문단에 최대 1~2개까지만 사용하고, 용어를 쓸 때는 그 즉시 같은 문장 안에서 쉬운 말로 뜻을 풀어주오 (예: '정관이 있어' 대신 '책임감과 원칙을 상징하는 정관 기운이 있어'). 용어 자체를 나열하기보다, 그 용어가 뜻하는 성향·기운·영향을 설명하는 데 집중하오. 이 규칙은 예외 없이 모든 섹션(원국·격국·용신·오행·건강·재물 등 어느 주제든)에 똑같이 적용되오. 한 문단 안에 '신강·비견·겁재·정인·편인격·상관·식상·관성·재성·화생토·통관' 처럼 용어를 줄줄이 나열하는 것은 절대 금지이오 — 이렇게 쓰면 일반 독자는 무슨 말인지 전혀 이해하지 못하오. 대신 정말 필요한 용어 한둘만 골라 쓰고, 나머지는 전부 '그 기운이 강해서', '서로 부딪히는 기운이라', '그 사이를 이어주는 기운이 필요해서'처럼 순우리말 설명으로 완전히 풀어 쓰오. 독자가 사주를 전혀 모르는 사람이라고 가정하고, 옆에서 다정하게 설명해주듯 쉽고 자연스럽게 읽히도록 작성하오.\n· '채널링', '포텐셜', '밸런스', '멘탈', '루틴', '컨디션', '이슈', '트렌드', '리스크', '시그널', '터닝포인트'처럼 영어에서 온 외래어·외국어를 쓰지 마오 — 홍연은 예스러운 한국 말투를 쓰는 인물이라 이런 현대 외래어를 쓰면 크게 이질감이 드오. 반드시 순우리말이나 한자어로 풀어 쓰오 (예: '채널링' ✗ → '이끌어냄', '집중해 발휘함' ○, '밸런스' ✗ → '균형' ○, '컨디션' ✗ → '몸과 마음의 상태' ○, '터닝포인트' ✗ → '전환점' ○).\n· '~는가 하면' 연결어미를 '~는이 하면'처럼 잘못된 형태로 쓰지 마오. (예: '버겁게 하는가 하면' ○ / '버겁게 하는이 하면' ✗). 이 외에도 동사 어간에 '-는이', '-은이', '-인이' 같은 존재하지 않는 어미를 붙이지 말고, 표준 문법 어미('-는가', '-은가', '-는지', '-을지', '-인지' 등)만 사용하오. (예: '견뎌내셨을 것인이' ✗ / '견뎌내셨을 것인지' ○)\n· '천간(간)'과 '주(柱)'를 절대 혼동하지 마오. 년간·월간·일간·시간은 각각 년주·월주·일주·시주의 천간 절반일 뿐이고, 년주·월주·일주·시주는 반드시 천간+지지를 합친 글자(예: 임진일주, 갑자년주, 기사월주)이오. '임수일주', '기토월주'처럼 천간 하나(오행 포함)에 곧바로 '~주'를 붙이는 표현은 절대 금지이오 — '~주'를 말할 때는 반드시 천간+지지 두 글자를 합친 정확한 이름을 쓰고, 천간 하나만 말할 때는 '월간이 기토인' 처럼 '~간'으로 표현하오.\n· 신청자(또는 풀이 대상)를 지칭할 때 '당신', '그대' 같은 막연한 대명사는 절대 쓰지 마오. 반드시 이름 뒤에 이 상품에서 지정된 호칭(대개 '~님', 자녀·유아·반려동물 관련 상품은 '~군/~양' 등)을 붙여 부르거나, 주어를 생략하오.\n· 같은 십성이 명식 안에 여러 자리에서 나올 때, 그 글자들을 전부 같은 글자인 것처럼 뭉뚱그려 말하지 마오. 지지의 글자는 반드시 그 지지 고유의 이름(예: 사화·오화)으로 부르고, 그 지지가 속한 천간의 오행 이름(예: 병화)을 지지에 갖다 붙이면 안 되오 — 천간과 지지는 오행이 같아 같은 십성으로 계산되더라도 엄연히 서로 다른 글자이오. 여러 자리를 언급할 때는 반드시 프롬프트에 주입된 [기둥별 십성 확인표]에서 각 자리(천간/지지)의 실제 글자를 하나하나 확인해서 정확히 구분해 쓰오. (예: 상관이 2개인데 하나는 천간의 병화, 하나는 지지의 사화라면 '상관(병화) 2개'라고 뭉뚱그리지 말고 '천간의 병화와 지지의 사화, 두 곳에서 상관이 나타난다'처럼 각각 구분해서 쓰오.)\n· 사주 용어는 반드시 정확한 표준 명칭만 쓰고, 존재하지 않는 글자로 변형하거나 오타를 내지 마오 (예: '비겁'을 '비겝'이라 쓰면 절대 안 되오 — '비겁'은 비견·겁재를 묶어 부르는 정확한 표준 용어이오). 십성명(비견·겁재·비겁·식신·상관·식상·편재·정재·재성·편관·정관·관성·편인·정인·인성)·격국명·신살명은 한 글자도 틀리지 않게 정확히 쓰오.\n· 십성의 생극 방향을 절대 헷갈리지 마오 — 재성과 관성은 '극하는' 방향이 정반대이오. 재성(편재·정재)은 '일간이 극하는'(내가 다스리는) 오행이고, 관성(편관·정관)은 '일간을 극하는'(나를 다스리는) 오행이오. (예: 을목 일간에게 축토·술토는 재성이니 '일간이 극하는 재성'이 맞고, '일간을 극하는 재성'이라 쓰면 절대 안 되오 — 그건 관성의 방향이오.) 마찬가지로 식상(식신·상관)은 '일간이 생하는' 오행, 인성(편인·정인)은 '일간을 생하는' 오행으로 방향이 반대이니 혼동하지 마오.\n· 같은 짝을 이루는 두 십성(비견·겁재 / 식신·상관 / 편재·정재 / 편관·정관 / 편인·정인)을 구분할 때, 오행이 같다고 곧바로 아무 이름이나 붙이지 마오. 반드시 일간과 음양(양/음)까지 같은지 다른지 확인해서 정확한 이름을 쓰오 — 음양까지 같으면 비견·식신·편재·편관·편인이고, 오행은 같지만 음양이 다르면 겁재·상관·정재·정관·정인이오. 특정 기둥(년주·월주·일주·시주)의 십성을 언급할 때는 이 판단을 직접 하지 말고, 반드시 프롬프트에 주입된 [기둥별 십성 확인표]에 적힌 값을 그대로 가져다 쓰오. (예: 시주 천간이 일간과 같은 오행이라 해서 무조건 '비견'이라 쓰면 안 되오 — 확인표에 '겁재'로 나와 있다면 반드시 '겁재'라고 써야 하오.)\n· 대운·세운·년주·월주·일주·시주 등의 간지(예: '경진', '을사')를 언급할 때는 반드시 프롬프트에 주입된 정확한 간지 표기를 토씨 하나 틀리지 않게 그대로 복사해서 쓰오. 절대 기억이나 추측으로 다른 간지를 지어내지 말고, 입춘·경칩·청명·곡우 등 24절기 이름과 간지를 혼동하지 마오 (예: '경진대운'을 '경칩대운'이라고 쓰면 절대 안 되오 — 경칩은 절기 이름이지 간지가 아니오).\n· '세운'(매년 바뀌는 간지)과 '대운'(10년 단위 흐름)을 절대 혼동하지 마오. 특정 연도(예: 2027년)를 가리킬 때는 반드시 "○○년" 또는 "○○년 정미년"처럼 세운으로만 부르고, 그 해의 간지에 곧바로 "대운"을 붙여 "정미대운"이라고 부르면 절대 안 되오. "대운"이라는 말은 실제로 주입된 대운 전환 데이터에 명시된 기간에만 사용하오.\n· '~도다', '~로다', '~구나', '~노라' 같은 고풍스러운 감탄형 어미는 절대 쓰지 마오 — 홍연 말투가 아니오. 반드시 '~이오/~하오/~했소/~겠소/~오' 중 하나로만 문장을 끝맺으오. (예: '만들어냈도다' ✗ / '만들어냈소' ○, '대단하도다' ✗ / '대단하오' ○)\n· 조사를 '이(가)', '은(는)', '을(를)', '과(와)'처럼 괄호로 두 가지 다 병기하는 표기는 절대 금지이오. 앞 글자의 받침 유무를 직접 판단해서 반드시 하나만 골라 쓰오. (예: '토'이(가) ✗ / '토'가 ○, '금'을(를) ✗ / '금'을 ○, '이름은(는)' ✗ / 받침 있으면 '~은', 없으면 '~는' 중 하나만 ○)`;

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
