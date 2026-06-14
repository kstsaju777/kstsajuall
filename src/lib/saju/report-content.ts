// =====================================================
// 문학형 결과지 구조화 콘텐츠 (Chapter 1)
// =====================================================
// LLM이 명식(만세력 텍스트) 기반으로 아래 JSON 구조를 채운다.
// report-preview 의 문학형 섹션이 이 데이터로 렌더된다(결제자별 실제 풀이).
//
// 차트 수치/대운 간지는 실제 명식 데이터에서 오고, LLM은 "문장(prose)"과
// 각 시기의 작용 설명만 생성한다.

export type ReportSection = {
  intro: string;        // 도입 문단
  callout: string;      // 강조 박스 (핵심 사주 용어 1~2개 포함)
  paragraphs: string[]; // 본문 문단 2~4개
};

export type ReportFlowItem = {
  label: string;        // 시기 (예: "20대 중반")
  tone: "warn" | "good";
  text: string;         // 그 시기의 운 작용 설명 (한 줄)
};

export type ReportSummaryItem = { title: string; desc: string };

export type ReportContent = {
  // ── 1장: 지나온 시간과 선택들 ──
  hardSeason: ReportSection;                 // 힘들 수밖에 없던 시기
  cause: ReportSection & { flow: ReportFlowItem[] }; // 사주 속 원인 + 운흐름 타임라인
  pattern: ReportSection & { summary: ReportSummaryItem[] }; // 반복된 패턴 + 요약
  // ── 2장: 나는 어떤 사람일까 (타고난 본바탕) ──
  wonguk: ReportSection;    // 사주 원국 한눈에 보기
  ohaeng: ReportSection;    // 오행 균형
  sipseong: ReportSection;  // 십성으로 보는 타고난 역할
  unseong: ReportSection;   // 십이운성으로 보는 기운의 세기
  pyori: ReportSection;     // 밖에서 보는 나와 실제의 나
  // ── 3장: 나는 왜 이런 사람인 걸까 (사주 속 필연구조) ──
  strength: ReportSection;  // 신강·신약
  gyeokguk: ReportSection;  // 격국
  yongsin: ReportSection;   // 용신
  hapchung: ReportSection;  // 합·충
  essence: ReportSection;   // 그래서, 내가 진짜 원하는 것
};

const SYSTEM = `당신은 30년 경력의 따뜻한 사주 명리학 상담가입니다.
주어진 사주 명식을 근거로, 한 사람의 '지나온 삶'을 문학적이면서도 공감 가는 톤으로 풀어냅니다.

원칙:
- 반드시 명식(천간지지/십성/대운/신살 등)에 근거해 해석합니다. 막연한 일반론 금지.
- 단정적 운명론은 피하고 가능성·경향으로 표현하며, 부정적 내용도 따뜻한 위로/방향으로 마무리합니다.
- 한국어 존댓말. 상담가가 내담자에게 말하듯 친근하게.
- callout 에는 핵심 사주 용어(예: 계유 대운, 자수 편인, 묘신원진 등)를 자연스럽게 1~2개 넣습니다.
- 반드시 아래 JSON 스키마에 정확히 맞는 "유효한 JSON 만" 출력합니다. 코드펜스/설명 금지.`;

export type ReportPromptInput = {
  name: string;
  gender: "male" | "female";
  manseryeokText: string; // formatSajuToManseryeok 결과 (16종 풀 명식)
};

// 장별 주제 + JSON 스키마 (병렬 생성용)
const CH_THEME: Record<number, string> = {
  1: "'지나온 시간' — 과거의 흐름, 유독 힘들었던 시기, 반복되어 온 패턴",
  2: "'타고난 본바탕' — 원국 종합, 오행 균형, 십성 역할, 십이운성, 겉과 속",
  3: "'왜 이런 사람인가(사주 속 필연구조)' — 신강/신약, 격국, 용신, 합·충, 핵심 갈망",
};

const CH_SCHEMA: Record<number, string> = {
  1: `{
  "hardSeason": { "intro": "유독 힘들었던 시기 도입 1~2문장", "callout": "특정 대운/시기를 짚는 핵심 문장(사주 용어 포함)", "paragraphs": ["문단","문단","문단"] },
  "cause": { "intro": "왜 힘들었는지 도입", "callout": "월지/일간 등 원국 구조로 원인을 짚는 문장", "paragraphs": ["문단","문단","문단"],
    "flow": [ {"label":"20대 중반","tone":"warn","text":"그 시기 운 작용 한 줄"}, {"label":"현재","tone":"good","text":"한 줄"} ] },
  "pattern": { "intro": "반복 패턴 도입", "callout": "반복 패턴 핵심 문장", "paragraphs": ["문단","문단"],
    "summary": [ {"title":"핵심 키워드","desc":"한 줄 설명"} ] }
}`,
  2: `{
  "wonguk": { "intro": "일주의 강점/생명력 도입", "callout": "일간의 본질을 짚는 문장", "paragraphs": ["각 기둥(월/년/시) 해석","원국 전체 조화","문단"] },
  "ohaeng": { "intro": "어떤 기운이 강한지 도입", "callout": "가장 강한 오행과 의미", "paragraphs": ["성격에 주는 영향","약한 오행 보완점","조언"] },
  "sipseong": { "intro": "십성으로 본 사회적 역할 도입", "callout": "가장 활성화된 십성과 의미", "paragraphs": ["그 십성의 강점","어떤 일에서 빛나는지","문단"] },
  "unseong": { "intro": "십이운성 도입", "callout": "일주 등 핵심 운성과 기운", "paragraphs": ["기운의 특징","주의점/조언"] },
  "pyori": { "intro": "겉과 속이 다를 수 있다는 도입", "callout": "겉모습 vs 속마음 핵심 대비", "paragraphs": ["밖에서 보는 모습","실제 내면의 모습"] }
}`,
  3: `{
  "strength": { "intro": "본질적 힘의 강도(신강/신약) 도입", "callout": "통근/득령 등으로 힘의 강도를 짚는 문장(사주 용어 포함)", "paragraphs": ["신강(또는 신약)의 특징","장점","안으로 뭉칠 때의 주의점/조언"] },
  "gyeokguk": { "intro": "사회적 그릇(격국) 도입", "callout": "월지 중심 격국명과 특징", "paragraphs": ["그 격국이 원하는 자리","제대로 발현될 때 모습","채워지지 않을 때 주의점"] },
  "yongsin": { "intro": "가장 필요한 기운(용신) 도입", "callout": "용신 오행과 그 의미", "paragraphs": ["용신이 주는 역할","희신 보완","일상 실천 조언"] },
  "hapchung": { "intro": "끌어당기고 뒤흔드는 합·충 도입", "callout": "주요 원진/합/충과 작용(사주 용어 포함)", "paragraphs": ["부정적 작용과 경계점","긍정적 작용(육합 등)","중심을 잡는 법"] },
  "essence": { "intro": "사주 종합 도입", "callout": "진짜 원하는 단 하나의 본질(따옴표로 인용)", "paragraphs": ["왜 그것을 갈망하는지","채워질 때의 모습","격려 마무리"] }
}`,
};

// 한 장(chapter)의 콘텐츠만 생성하는 프롬프트 (장별 병렬 호출용)
export function buildChapterPrompt(chapter: number, input: ReportPromptInput): { system: string; user: string } {
  const honor = input.name?.trim() ? `${input.name}님` : "이분";
  const user = `[대상] ${honor} (${input.gender === "male" ? "남성" : "여성"})

[사주 명식]
${input.manseryeokText}

위 명식을 근거로, ${honor}의 ${CH_THEME[chapter] ?? ""} 에 대한 결과지 콘텐츠를 작성하세요.
아래 JSON 스키마를 정확히 채워 **유효한 JSON 만** 출력하세요 (주석/코드펜스/설명 금지, 주석(//)은 빼고 값만 채우기):

${CH_SCHEMA[chapter] ?? "{}"}`;
  return { system: SYSTEM, user };
}

// LLM 응답 텍스트 → JSON 오브젝트 (코드펜스 제거 후 파싱)
export function parseContentJson(text: string): Record<string, unknown> {
  let t = text.trim();
  t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const s = t.indexOf("{");
  const e = t.lastIndexOf("}");
  if (s >= 0 && e > s) t = t.slice(s, e + 1);
  return JSON.parse(t) as Record<string, unknown>;
}
