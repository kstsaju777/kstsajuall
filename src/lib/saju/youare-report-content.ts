// =====================================================
// 유아사주 결과지 — 장별 풀이 프롬프트 & 구조
// =====================================================

import { SYSTEM } from "./report-prompts";

// ── 장별 필수 섹션 키 ──
export const YOUARE_CHAPTER_SECTIONS: Record<number, string[]> = {
  1: ["personality"],
  2: ["health"],
  3: ["parenting"],
  4: ["ohaengBalance"],
  5: ["namingGuide"],
  6: ["talent"],
  7: ["cautionPeriod"],
  8: ["letter"],
};

// ── 장 완성 여부 확인 ──
export function isYouareChapterReady(
  content: Record<string, unknown> | null | undefined,
  chapter: number
): boolean {
  if (!content) return false;
  const keys = YOUARE_CHAPTER_SECTIONS[chapter] ?? [];
  return keys.every((k) => {
    const val = content[k];
    if (!val || typeof val !== "object") return false;
    const v = val as Record<string, unknown>;
    if ("paragraphs" in v) return Array.isArray(v.paragraphs) && (v.paragraphs as unknown[]).length > 0;
    if ("tips" in v) return Array.isArray(v.tips) && (v.tips as unknown[]).length > 0;
    if ("fields" in v) return Array.isArray(v.fields) && (v.fields as unknown[]).length > 0;
    if ("items" in v) return Array.isArray(v.items) && (v.items as unknown[]).length > 0;
    if ("colors" in v) return Array.isArray(v.colors) && (v.colors as unknown[]).length > 0;
    if ("elements" in v) return Array.isArray(v.elements) && (v.elements as unknown[]).length > 0;
    if ("periods" in v) return Array.isArray(v.periods) && (v.periods as unknown[]).length > 0;
    if ("namingAdvice" in v) return Array.isArray(v.namingAdvice) && (v.namingAdvice as unknown[]).length > 0;
    if ("element" in v) return typeof v.element === "string" && (v.element as string).length > 0;
    return false;
  });
}

// ── 장별 주제 ──
const YOUARE_CH_THEME: Record<number, string> = {
  1: "[제1장 기질] 이 아이는 어떤 기질로 태어났나 — 일간 오행, 신강·신약, 타고난 성격과 행동 패턴",
  2: "[제2장 건강] 아이의 건강과 주의할 부분 — 오행 취약점, 주의 신체 부위, 건강 관리 지침",
  3: "[제3장 양육] 잘 맞는 양육 환경과 방식 — 아이 기질에 맞는 교육·환경·부모의 역할",
  4: "[제4장 오행] 타고난 기운과 오행 균형 — 사주 오행 분포, 강한 기운·부족한 기운, 균형 조언",
  5: "[제5장 이름·색·방향] 아이에게 맞는 이름·색·방향 — 용신 오행 기반 이름 조건, 길한 색깔, 길한 방향",
  6: "[제6장 재능] 성장하면서 두드러질 재능 — 십성·오행으로 보는 타고난 강점과 계발 방향",
  7: "[제7장 시기] 부모가 조심해야 할 시기 — 대운·세운 흐름에서 주의할 성장 구간과 부모의 대처법",
  8: "[마무리] 홍연의 서신 — 유아사주 풀이를 마치며 부모에게 전하는 따뜻한 손편지",
};

// ── 장별 추가 지시 ──
const YOUARE_CH_GUIDE: Record<number, string> = {
  1: `[personality 섹션 — 기질과 성격]
- intro: "~한 사주로, 한 줄 요약" 형식. 아이의 타고난 기운을 한 줄로. (1문장)
- callout: 일간 오행과 신강·신약 핵심 한 문장.
- paragraphs 3개: ①일간 오행과 타고난 기운의 특징 ②아이의 성격과 행동 패턴 ③부모가 이해해야 할 기질. 각 단락 3~4문장.`,

  2: `[health 섹션 — 건강]
- intro: 이 아이의 건강에서 가장 주의할 포인트 한 줄. (1문장)
- callout: 건강과 관련된 오행 취약점 핵심 한 문장.
- paragraphs 2개: ①기질적으로 취약한 신체 부위와 이유 ②건강하게 키우기 위한 생활 습관과 음식. 각 단락 3~4문장.
- tips: 건강 관리 실천법 3~4개 (한 줄씩, 구체적이고 실천 가능하게).`,

  3: `[parenting 섹션 — 양육 환경과 방식]
- intro: 이 아이에게 가장 잘 맞는 양육 방향 한 줄. (1문장)
- callout: 양육에서 부모가 가장 중요하게 기억해야 할 한 문장.
- paragraphs 2개: ①아이의 기질에 맞는 환경과 교육 방식 ②부모의 역할과 관계 방향. 각 단락 3~4문장.
- parentingTips: 실천 가능한 양육 팁 3~4개 (한 줄씩).`,

  4: `[ohaengBalance 섹션 — 오행 균형]
- intro: 이 아이 사주의 오행 기운 핵심 한 줄. (1문장)
- callout: 가장 강한 기운과 가장 부족한 기운 핵심 한 문장.
- paragraphs 2개: ①오행 분포와 그 의미 ②부족한 기운을 보완하는 생활 방법. 각 단락 3~4문장.
- elements: 오행별 상태 5개. 각 element: name("목"/"화"/"토"/"금"/"수"), level("strong"/"normal"/"weak"), desc(한 줄 의미).`,

  5: `[namingGuide 섹션 — 이름·색·방향]
- intro: 이 아이에게 어울리는 이름의 방향 핵심 한 줄. (1문장)
- callout: 용신 오행과 그 이름에서의 의미 한 문장.
- namingAdvice: 이름 짓기 조언 2~3개 (한 줄씩, 구체적으로 — 어떤 한자 뜻, 어떤 소리가 좋은지).
- colors: 길한 색깔 3개. 각 color: name(색 이름), hex(헥스코드), reason(한 줄 이유).
- directions: 길한 방향 2개. 각 direction: name(방위), reason(한 줄 이유).`,

  6: `[talent 섹션 — 재능]
- intro: 이 아이가 타고난 재능의 방향 핵심 한 줄. (1문장)
- callout: 재능과 연결된 십성·오행 핵심 한 문장.
- paragraphs 2개: ①오행·십성으로 본 강점 분야 ②어떻게 계발해줄지 부모의 역할. 각 단락 3~4문장.
- fields: 재능 분야 3~4개. 각 field: icon(이모지), name(분야명), desc(한 줄 설명).`,

  7: `[cautionPeriod 섹션 — 주의 시기]
- intro: 부모가 가장 집중해서 살펴야 할 시기 핵심 한 줄. (1문장)
- callout: 주의 시기의 공통 특징 한 문장.
- paragraphs 2개: ①왜 그 시기에 주의가 필요한지 대운·세운 원리 설명 ②주의 시기에 부모가 할 수 있는 것. 각 단락 3~4문장.
- periods: 주의 시기 3~4개. 각 period: label(시기, 예: "만 3~5세"), tone("warn" 또는 "good"), text(그 시기 핵심 포인트 한 줄).`,

  8: `[letter 섹션 — 홍연의 서신]
유아사주 풀이를 마치며 홍연이 부모에게 쓰는 따뜻한 손편지.
- 이 아이의 빛나는 점, 부모에 대한 당부, 따뜻한 응원으로 갈무리.
- paragraphs: 3~4개 단락. 각 단락 3~4문장.
- 바로 본론으로 시작하여 따뜻한 마무리로 끝내시오.`,
};

// ── 장별 JSON 스키마 ──
const YOUARE_CH_SCHEMA: Record<number, string> = {
  1: `{
  "personality": {
    "intro": "타고난 기운 요약 한 줄 (1문장)",
    "callout": "일간 오행·신강신약 핵심 한 문장",
    "paragraphs": ["단락1 (3~4문장)", "단락2 (3~4문장)", "단락3 (3~4문장)"]
  }
}`,
  2: `{
  "health": {
    "intro": "건강 주의 핵심 한 줄 (1문장)",
    "callout": "취약 오행·신체 핵심 한 문장",
    "paragraphs": ["단락1 (3~4문장)", "단락2 (3~4문장)"],
    "tips": ["팁1 (한 줄)", "팁2 (한 줄)", "팁3 (한 줄)"]
  }
}`,
  3: `{
  "parenting": {
    "intro": "양육 방향 핵심 한 줄 (1문장)",
    "callout": "부모가 기억해야 할 핵심 한 문장",
    "paragraphs": ["단락1 (3~4문장)", "단락2 (3~4문장)"],
    "parentingTips": ["팁1 (한 줄)", "팁2 (한 줄)", "팁3 (한 줄)"]
  }
}`,
  4: `{
  "ohaengBalance": {
    "intro": "오행 기운 핵심 한 줄 (1문장)",
    "callout": "강한 기운·부족한 기운 핵심 한 문장",
    "paragraphs": ["단락1 (3~4문장)", "단락2 (3~4문장)"],
    "elements": [
      { "name": "목", "level": "strong", "desc": "이 오행의 의미 한 줄" },
      { "name": "화", "level": "normal", "desc": "이 오행의 의미 한 줄" },
      { "name": "토", "level": "weak",   "desc": "이 오행의 의미 한 줄" },
      { "name": "금", "level": "normal", "desc": "이 오행의 의미 한 줄" },
      { "name": "수", "level": "strong", "desc": "이 오행의 의미 한 줄" }
    ]
  }
}`,
  5: `{
  "namingGuide": {
    "intro": "이름 방향 핵심 한 줄 (1문장)",
    "callout": "용신 오행과 이름의 연결 한 문장",
    "namingAdvice": ["조언1 (한 줄)", "조언2 (한 줄)", "조언3 (한 줄)"],
    "colors": [
      { "name": "색 이름", "hex": "#RRGGBB", "reason": "한 줄 이유" },
      { "name": "색 이름", "hex": "#RRGGBB", "reason": "한 줄 이유" },
      { "name": "색 이름", "hex": "#RRGGBB", "reason": "한 줄 이유" }
    ],
    "directions": [
      { "name": "동쪽", "reason": "한 줄 이유" },
      { "name": "남쪽", "reason": "한 줄 이유" }
    ]
  }
}`,
  6: `{
  "talent": {
    "intro": "재능 방향 핵심 한 줄 (1문장)",
    "callout": "재능 십성·오행 핵심 한 문장",
    "paragraphs": ["단락1 (3~4문장)", "단락2 (3~4문장)"],
    "fields": [
      { "icon": "🎨", "name": "분야명", "desc": "한 줄 설명" },
      { "icon": "🎵", "name": "분야명", "desc": "한 줄 설명" },
      { "icon": "📚", "name": "분야명", "desc": "한 줄 설명" }
    ]
  }
}`,
  7: `{
  "cautionPeriod": {
    "intro": "주의 시기 핵심 한 줄 (1문장)",
    "callout": "주의 시기 공통 특징 한 문장",
    "paragraphs": ["단락1 (3~4문장)", "단락2 (3~4문장)"],
    "periods": [
      { "label": "만 3~5세", "tone": "warn", "text": "이 시기 핵심 포인트 한 줄" },
      { "label": "만 7~9세", "tone": "good", "text": "이 시기 핵심 포인트 한 줄" },
      { "label": "만 12~14세", "tone": "warn", "text": "이 시기 핵심 포인트 한 줄" }
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
export function buildYouareChapterPrompt(
  chapter: number,
  input: {
    name: string;
    gender: "male" | "female";
    manseryeokText: string;
    pillars?: { pos: string; gan: string; ganEl: string; ji: string; jiEl: string; sipTop: string; sipBot: string; sinsal?: string }[];
    birthYear?: number;
  }
): { system: string; user: string } {
  const theme = YOUARE_CH_THEME[chapter] ?? `[제${chapter}장]`;
  const guide = YOUARE_CH_GUIDE[chapter] ?? "";
  const schema = YOUARE_CH_SCHEMA[chapter] ?? "{}";
  const childLabel = input.name ? `${input.name} 아이` : "이 아이";
  const currentYear = new Date().getFullYear();

  const user = `아래는 ${childLabel}의 사주 명식입니다.

${input.manseryeokText}
${input.birthYear ? `\n출생연도: ${input.birthYear}년 / 현재연도: ${currentYear}년` : `\n현재연도: ${currentYear}년`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
이번 장의 주제: ${theme}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${guide ? `\n작성 지침:\n${guide}\n` : ""}
위 명식을 꼼꼼히 분석하여, 아래 JSON 스키마를 정확히 채워주시오.
반드시 유효한 JSON만 출력하시오. 코드펜스(\`\`\`)나 설명 문장은 절대 쓰지 마시오.
풀이 대상은 부모가 의뢰한 유아(아이)임을 염두에 두고, 부모가 읽는 시점에서 따뜻하고 실용적으로 서술하시오.

${schema}`;

  return { system: SYSTEM, user };
}
