// =====================================================
// 연애사주 결과지 — 장별 풀이 프롬프트 & 구조
// =====================================================
// 정통사주(report-content.ts)와 독립적으로 관리합니다.
// 홍연 화자 SYSTEM은 report-prompts.ts에서 공유.

import { SYSTEM } from "./report-prompts";

// ── 장별 필수 섹션 키 ──
export const YEONAE_SAJU_CHAPTER_SECTIONS: Record<number, string[]> = {
  1: ["wonguk"],
  2: ["loveStyle"],
  3: ["idealType", "compatTypes"],
  4: ["loveTiming", "loveFlow"],
  5: ["partnerProfile"],
  6: ["meetingWay", "meetingFlow"],
  7: ["loveCare", "loveSummary"],
  8: ["letter"],
};

// ── 장 완성 여부 확인 ──
export function isYeonaeSajuChapterReady(
  content: Record<string, unknown> | null | undefined,
  chapter: number
): boolean {
  if (!content) return false;
  const keys = YEONAE_SAJU_CHAPTER_SECTIONS[chapter] ?? [];
  return keys.every((k) => {
    const val = content[k];
    if (!val || typeof val !== "object") return false;
    const v = val as Record<string, unknown>;
    if ("paragraphs" in v) return Array.isArray(v.paragraphs) && (v.paragraphs as unknown[]).length > 0;
    if ("types" in v) return Array.isArray(v.types) && (v.types as unknown[]).length > 0;
    if ("items" in v) return Array.isArray(v.items) && (v.items as unknown[]).length > 0;
    if ("tips" in v) return Array.isArray(v.tips) && (v.tips as unknown[]).length > 0;
    if ("element" in v) return typeof v.element === "string" && (v.element as string).length > 0;
    return false;
  });
}

// ── 장별 주제 ──
const YEONAE_CH_THEME: Record<number, string> = {
  1: "[제1장 그릇] 나는 어떤 그릇으로 태어났나 — 일간 오행, 오행 균형, 신강·신약, 타고난 본바탕",
  2: "[제2장 연애기질] 나의 연애 기질 — 나는 어떻게 사랑하는가, 감정 표현 방식, 연애 패턴",
  3: "[제3장 이상형] 나는 어떤 사람에게 끌리고 잘 맞는가 — 이상형, 궁합 좋은 유형, 피해야 할 유형",
  4: "[제4장 인연시기] 내 인연은 언제 나타나는가 — 대운·세운으로 본 인연 시기, 연애운 흐름",
  5: "[제5장 그사람] 그 사람은 어떤 사람일까 — 사주로 보는 나의 배우자상, 인연이 될 사람의 특징",
  6: "[제6장 만남] 어디서 어떻게 만나게 될까 — 만남의 방식과 장소, 인연이 이어지는 흐름",
  7: "[제7장 개운법] 내 연애운을 바꾸는 개운법 — 부족한 오행 보강, 연애 개운 핵심 조언, 종합 정리",
  8: "[마무리] 홍연의 서신 — 연애에 관한 따뜻한 손편지로 결과지를 맺는 글",
};

// ── 장별 추가 지시 ──
const YEONAE_CH_GUIDE: Record<number, string> = {
  1: `[wonguk 섹션 — 타고난 그릇]
- intro: "~한 사주로, 한 문장 요약" 형식으로 시작. (1문장)
- callout: 일간 오행과 신강·신약 핵심을 한 문장으로.
- paragraphs 3개: ①일간 오행과 타고난 기운 ②오행 균형의 특징과 연애에 미치는 영향 ③신강·신약 판단과 사랑을 받아들이는 그릇의 크기. 각 단락 3~4문장.`,

  2: `[loveStyle 섹션 — 연애 기질]
- intro: 나는 어떻게 사랑하는 사람인지 핵심 한 줄로. (1문장)
- callout: 관성·재성·식상 중 강한 십성과 연애 기질의 연결고리 한 문장.
- paragraphs 3개: ①감정을 표현하는 방식과 사랑의 스타일 ②연애할 때 나타나는 패턴과 습관 ③사랑 앞에서 드러나는 강점과 주의할 점. 각 단락 3~4문장.`,

  3: `[idealType 섹션 — 이상형]
- intro: 내가 끌리는 사람의 핵심 특징 한 줄. (1문장)
- callout: 사주에서 드러나는 이상형의 핵심 오행·십성 한 문장.
- paragraphs 2개: ①끌리는 사람의 성격·분위기·특징 ②잘 맞는 사람과 피해야 할 유형. 각 단락 3~4문장.

[compatTypes 섹션 — 궁합 유형]
types: 2~3개 궁합 유형.
각 type: label("잘 맞는" 또는 "피해야 할"), icon(이모지 1개), desc(특징 한 줄), reason(사주적 이유 한 줄).`,

  4: `[loveTiming 섹션 — 인연 시기]
- intro: 인연이 오는 큰 흐름 한 줄 요약. (1문장)
- callout: 가장 중요한 인연 시기와 그 이유 핵심 한 문장.
- paragraphs 2개: ①대운으로 본 연애운의 큰 흐름과 인연이 오는 시기 ②지금 이 시기의 연애운과 앞으로의 방향. 각 단락 3~4문장.

[loveFlow 섹션 — 시기별 흐름]
items: 4~5개 시기별 흐름.
각 item: label(시기, 예: "현재~2026", "2027~2028"), tone("good" 또는 "warn"), text(그 시기 연애 기운 한 줄).
반드시 현재(2026년) 기준 향후 5~8년을 커버하오.`,

  5: `[partnerProfile 섹션 — 배우자상]
- intro: 내 인연이 될 사람의 핵심 특징 한 줄. (1문장)
- callout: 사주에서 드러나는 배우자성의 핵심 십성·오행 한 문장.
- paragraphs 3개: ①인연이 될 사람의 성격과 분위기 ②그 사람의 직업·생활방식·가치관 ③그 사람과 나의 관계에서 나타날 특징. 각 단락 3~4문장.`,

  6: `[meetingWay 섹션 — 만남 방식]
- intro: 인연을 만나는 방식의 핵심 한 줄. (1문장)
- callout: 사주에서 드러나는 만남의 특징 한 문장.
- paragraphs 2개: ①만남이 이루어지는 환경·장소·상황 ②인연이 자연스럽게 이어지는 방식과 조건. 각 단락 3~4문장.

[meetingFlow 섹션 — 만남 흐름]
items: 3~4개 만남 단계별 흐름.
각 item: label(단계 예: "첫 만남", "호감 발전", "고백과 시작"), tone("good" 또는 "warn"), text(그 단계의 특징 한 줄).`,

  7: `[loveCare 섹션 — 연애 개운법]
- element: 보강해야 할 오행 이름 (반드시 "금", "목", "화", "토", "수" 중 하나만 출력)
- tips: 연애 개운 실천법 4~5개 (각각 구체적인 한 줄씩. 색·방향·음식·행동·장소 등 다양하게).

[loveSummary 섹션 — 종합 정리]
- title: 이 결과지의 핵심 메시지 제목 (예: "그대의 인연은 반드시 오고 있소")
- items: 핵심 정리 3개. 각 item: title(짧은 제목), desc(설명 2~3문장).`,

  8: `[letter 섹션 — 홍연의 서신]
연애사주 풀이를 마치며 홍연이 독자에게 쓰는 따뜻한 손편지.
- paragraphs: 3~4개 단락. 각 단락 3~4문장.
- 이 사람의 연애 기운, 강점, 인연에 대한 따뜻한 응원으로 갈무리하되 희망적인 메시지로 맺으시오.
- 바로 본론으로 시작하여 따뜻한 마무리로 끝내시오.`,
};

// ── 장별 JSON 스키마 ──
const YEONAE_CH_SCHEMA: Record<number, string> = {
  1: `{
  "wonguk": {
    "intro": "~한 사주로, 한 줄 요약 (1문장)",
    "callout": "핵심 사주 용어 포함 강조 한 문장",
    "paragraphs": ["단락1 (3~4문장)", "단락2 (3~4문장)", "단락3 (3~4문장)"]
  }
}`,
  2: `{
  "loveStyle": {
    "intro": "연애 기질 핵심 한 줄 (1문장)",
    "callout": "십성과 연애 연결 핵심 한 문장",
    "paragraphs": ["단락1 (3~4문장)", "단락2 (3~4문장)", "단락3 (3~4문장)"]
  }
}`,
  3: `{
  "idealType": {
    "intro": "이상형 핵심 한 줄 (1문장)",
    "callout": "이상형 오행·십성 핵심 한 문장",
    "paragraphs": ["단락1 (3~4문장)", "단락2 (3~4문장)"]
  },
  "compatTypes": {
    "types": [
      { "label": "잘 맞는", "icon": "💫", "desc": "특징 한 줄", "reason": "사주적 이유 한 줄" },
      { "label": "피해야 할", "icon": "⚡", "desc": "특징 한 줄", "reason": "사주적 이유 한 줄" }
    ]
  }
}`,
  4: `{
  "loveTiming": {
    "intro": "인연 시기 한 줄 요약 (1문장)",
    "callout": "핵심 인연 시기 한 문장",
    "paragraphs": ["단락1 (3~4문장)", "단락2 (3~4문장)"]
  },
  "loveFlow": {
    "items": [
      { "label": "현재~2026", "tone": "good", "text": "이 시기 연애 기운 한 줄" },
      { "label": "2027~2028", "tone": "warn", "text": "이 시기 연애 기운 한 줄" }
    ]
  }
}`,
  5: `{
  "partnerProfile": {
    "intro": "배우자상 핵심 한 줄 (1문장)",
    "callout": "배우자성 십성·오행 핵심 한 문장",
    "paragraphs": ["단락1 (3~4문장)", "단락2 (3~4문장)", "단락3 (3~4문장)"]
  }
}`,
  6: `{
  "meetingWay": {
    "intro": "만남 방식 핵심 한 줄 (1문장)",
    "callout": "만남 특징 핵심 한 문장",
    "paragraphs": ["단락1 (3~4문장)", "단락2 (3~4문장)"]
  },
  "meetingFlow": {
    "items": [
      { "label": "첫 만남", "tone": "good", "text": "이 단계 특징 한 줄" },
      { "label": "호감 발전", "tone": "good", "text": "이 단계 특징 한 줄" },
      { "label": "고백과 시작", "tone": "good", "text": "이 단계 특징 한 줄" }
    ]
  }
}`,
  7: `{
  "loveCare": {
    "element": "목",
    "tips": ["개운 실천법1", "개운 실천법2", "개운 실천법3", "개운 실천법4"]
  },
  "loveSummary": {
    "title": "핵심 메시지 제목",
    "items": [
      { "title": "정리 항목 제목1", "desc": "설명 (2~3문장)" },
      { "title": "정리 항목 제목2", "desc": "설명 (2~3문장)" },
      { "title": "정리 항목 제목3", "desc": "설명 (2~3문장)" }
    ]
  }
}`,
  8: `{
  "letter": {
    "paragraphs": ["단락1 (3~4문장)", "단락2 (3~4문장)", "단락3 (3~4문장)", "단락4 (3~4문장, 마무리)"]
  }
}`,
};

// ── 핵심 함수: 장별 프롬프트 빌더 ──
export function buildYeonaeSajuChapterPrompt(
  chapter: number,
  input: {
    name: string;
    gender: "male" | "female";
    manseryeokText: string;
    pillars?: { pos: string; gan: string; ganEl: string; ji: string; jiEl: string; sipTop: string; sipBot: string; sinsal?: string }[];
    birthYear?: number;
  }
): { system: string; user: string } {
  const theme = YEONAE_CH_THEME[chapter] ?? `[제${chapter}장]`;
  const guide = YEONAE_CH_GUIDE[chapter] ?? "";
  const schema = YEONAE_CH_SCHEMA[chapter] ?? "{}";
  const honor = input.name
    ? input.gender === "male" ? `${input.name}군` : `${input.name}양`
    : "그대";
  const currentYear = new Date().getFullYear();

  const user = `아래는 ${honor}의 사주 명식입니다.

${input.manseryeokText}
${input.birthYear ? `\n출생연도: ${input.birthYear}년 / 현재연도: ${currentYear}년` : `\n현재연도: ${currentYear}년`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
이번 장의 주제: ${theme}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${guide ? `\n작성 지침:\n${guide}\n` : ""}
위 명식을 꼼꼼히 분석하여, 아래 JSON 스키마를 정확히 채워주시오.
반드시 유효한 JSON만 출력하시오. 코드펜스(\`\`\`)나 설명 문장은 절대 쓰지 마시오.

${schema}`;

  return { system: SYSTEM, user };
}
