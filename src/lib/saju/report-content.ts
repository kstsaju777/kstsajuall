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
  hardSeason: ReportSection;                 // 힘들 수밖에 없던 시기
  cause: ReportSection & { flow: ReportFlowItem[] }; // 사주 속 원인 + 운흐름 타임라인
  pattern: ReportSection & { summary: ReportSummaryItem[] }; // 반복된 패턴 + 요약
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

export function buildReportContentPrompt(input: ReportPromptInput): { system: string; user: string } {
  const honor = input.name?.trim() ? `${input.name}님` : "이분";
  const user = `[대상] ${honor} (${input.gender === "male" ? "남성" : "여성"})

[사주 명식]
${input.manseryeokText}

위 명식을 근거로, '${honor}이 지나온 시간'에 대한 결과지 콘텐츠를 작성하세요.
아래 JSON 스키마를 정확히 채워 **유효한 JSON 만** 출력하세요 (다른 텍스트 금지):

{
  "hardSeason": {            // 유독 힘들었던 시기
    "intro": "도입 1~2문장",
    "callout": "특정 대운/시기를 짚는 핵심 문장 (사주 용어 포함)",
    "paragraphs": ["문단", "문단", "문단"]
  },
  "cause": {                 // 왜 힘들었는지 사주적 원인
    "intro": "도입 1~2문장",
    "callout": "월지/일간 등 원국 구조로 원인을 짚는 문장 (사주 용어 포함)",
    "paragraphs": ["문단", "문단", "문단"],
    "flow": [                // 지난 시간의 운 흐름 (대운 기준 4~5개, 과거→현재)
      { "label": "20대 중반", "tone": "warn", "text": "그 시기 운의 작용 한 줄" },
      { "label": "현재", "tone": "good", "text": "한 줄" }
    ]
  },
  "pattern": {               // 반복되어 온 삶의 패턴
    "intro": "도입 1~2문장",
    "callout": "반복 패턴 핵심 문장",
    "paragraphs": ["문단", "문단"],
    "summary": [             // 지난 흐름 요약 3개
      { "title": "핵심 키워드", "desc": "한 줄 설명" }
    ]
  }
}`;
  return { system: SYSTEM, user };
}

// LLM 응답 텍스트 → ReportContent (코드펜스 제거 후 파싱)
export function parseReportContent(text: string): ReportContent {
  let t = text.trim();
  // ```json ... ``` 펜스 제거
  t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  // 첫 { 부터 마지막 } 까지만
  const s = t.indexOf("{");
  const e = t.lastIndexOf("}");
  if (s >= 0 && e > s) t = t.slice(s, e + 1);
  return JSON.parse(t) as ReportContent;
}
