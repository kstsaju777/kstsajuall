// =====================================================
// 건강사주 결과지 — 장별 풀이 프롬프트 & 구조
// =====================================================

import { SYSTEM } from "./report-prompts";

// ── 장별 필수 섹션 키 ──
export const HEALTH_CHAPTER_SECTIONS: Record<number, string[]> = {
  1: ["constitution"],
  2: ["weakParts"],
  3: ["diseases"],
  4: ["lifestyle"],
  5: ["healthFlow"],
  6: ["remedy"],
  7: ["letter"],
};

// ── 장 완성 여부 확인 ──
export function isHealthChapterReady(
  content: Record<string, unknown> | null | undefined,
  chapter: number
): boolean {
  if (!content) return false;
  const keys = HEALTH_CHAPTER_SECTIONS[chapter] ?? [];
  return keys.every((k) => {
    const val = content[k];
    if (!val || typeof val !== "object") return false;
    const v = val as Record<string, unknown>;
    if ("paragraphs" in v) return Array.isArray(v.paragraphs) && (v.paragraphs as unknown[]).length > 0;
    if ("tips" in v) return Array.isArray(v.tips) && (v.tips as unknown[]).length > 0;
    if ("items" in v) return Array.isArray(v.items) && (v.items as unknown[]).length > 0;
    if ("parts" in v) return Array.isArray(v.parts) && (v.parts as unknown[]).length > 0;
    if ("symptoms" in v) return Array.isArray(v.symptoms) && (v.symptoms as unknown[]).length > 0;
    if ("periods" in v) return Array.isArray(v.periods) && (v.periods as unknown[]).length > 0;
    if ("remedies" in v) return Array.isArray(v.remedies) && (v.remedies as unknown[]).length > 0;
    return false;
  });
}

// ── 장별 주제 ──
const HEALTH_CH_THEME: Record<number, string> = {
  1: "[제1장 체질] 나는 어떤 체질로 태어났나 — 일간 오행, 신강·신약, 타고난 체질과 에너지 특성",
  2: "[제2장 약점] 내 사주에 약한 부위는 어디인가 — 오행 취약점으로 보는 신체 취약 부위와 장기",
  3: "[제3장 질병] 내가 특히 조심해야 할 질병과 증상 — 사주 오행 불균형에서 비롯되는 질환 경향",
  4: "[제4장 식습관] 나에게 맞는 식습관과 생활 방식 — 용신 오행 기반 맞는 음식·운동·수면·환경",
  5: "[제5장 흐름] 내 건강 흐름과 조심해야 할 시기 — 대운·세운 흐름으로 보는 건강 고비 시기",
  6: "[제6장 개운법] 내 건강을 살릴 개운법 — 부족한 오행을 채우는 생활·환경·마음 개운법",
  7: "[마무리] 홍연의 서신 — 건강사주 풀이를 마치며 전하는 따뜻한 손편지",
};

// ── 장별 추가 지시 ──
const HEALTH_CH_GUIDE: Record<number, string> = {
  1: `[constitution 섹션 — 체질]
- intro: 한 줄 체질 요약. 일간 오행과 신강·신약을 담아 (1문장)
- callout: 이 사람의 에너지 특성과 체질 핵심 한 문장.
- paragraphs 3개: ①일간 오행과 신강·신약으로 본 체질 ②타고난 에너지 패턴과 몸의 특성 ③이 체질이 주는 강점과 주의 포인트. 각 3~4문장.`,

  2: `[weakParts 섹션 — 약한 신체 부위]
- intro: 이 사람이 가장 주의해야 할 신체 부위 핵심 한 줄. (1문장)
- callout: 오행 취약점과 연결된 신체 핵심 한 문장.
- paragraphs 2개: ①오행 취약점으로 본 약한 장기·부위와 이유 ②신체 신호로 알아차리는 법. 각 3~4문장.
- parts: 취약 부위 3~4개. 각 part: icon(이모지), name(부위명), ohaeng(연관 오행), desc(한 줄 설명).`,

  3: `[diseases 섹션 — 질병과 증상]
- intro: 이 사람이 특히 조심해야 할 질환 방향 핵심 한 줄. (1문장)
- callout: 오행 불균형에서 비롯되는 주요 질환 경향 한 문장.
- paragraphs 2개: ①사주 오행으로 보는 질환 경향과 이유 ②초기 신호와 예방 방향. 각 3~4문장.
- symptoms: 주의 증상·질환 3~4개. 각 symptom: name(질환/증상명), level("주의" 또는 "관찰"), desc(한 줄 설명).`,

  4: `[lifestyle 섹션 — 식습관과 생활]
- intro: 이 사람에게 맞는 생활 방향 핵심 한 줄. (1문장)
- callout: 용신 오행과 생활 습관의 연결 핵심 한 문장.
- paragraphs 2개: ①이 체질에 맞는 음식과 식습관 ②맞는 운동·수면·환경 방향. 각 3~4문장.
- tips: 실천 가능한 생활 팁 4~5개 (한 줄씩, 구체적으로 — 어떤 음식, 어떤 운동, 몇 시간 수면 등).`,

  5: `[healthFlow 섹션 — 건강 흐름과 시기]
- intro: 이 사람의 건강 흐름에서 가장 주의해야 할 시기 핵심 한 줄. (1문장)
- callout: 대운·세운 흐름과 건강의 연관 핵심 한 문장.
- paragraphs 2개: ①대운 흐름으로 보는 건강 고비 원리 ②고비 시기에 할 수 있는 대비. 각 3~4문장.
- periods: 건강 주의 시기 3~4개. 각 period: label(시기 표현, 예: "40대 초반"), tone("warn" 또는 "good"), text(그 시기 건강 핵심 포인트 한 줄).`,

  6: `[remedy 섹션 — 개운법]
- intro: 이 사람의 건강 개운법 방향 핵심 한 줄. (1문장)
- callout: 부족한 오행과 개운의 방향 핵심 한 문장.
- paragraphs 2개: ①오행 보완 원리와 이 사람에게 맞는 이유 ②마음·환경·생활에서의 개운 방향. 각 3~4문장.
- remedies: 개운법 4~5개. 각 remedy: icon(이모지), title(개운법 이름), desc(한 줄 설명).`,

  7: `[letter 섹션 — 홍연의 서신]
건강사주 풀이를 마치며 홍연이 전하는 따뜻한 손편지.
- 이 사람의 몸이 보내는 신호에 귀 기울이길 바라는 마음, 건강하게 살아가길 바라는 응원.
- paragraphs: 3~4개 단락. 각 단락 3~4문장.
- 바로 본론으로 시작하여 따뜻한 마무리로 끝내시오.`,
};

// ── 장별 JSON 스키마 ──
const HEALTH_CH_SCHEMA: Record<number, string> = {
  1: `{
  "constitution": {
    "intro": "체질 요약 한 줄 (1문장)",
    "callout": "에너지 특성·체질 핵심 한 문장",
    "paragraphs": ["단락1 (3~4문장)", "단락2 (3~4문장)", "단락3 (3~4문장)"]
  }
}`,
  2: `{
  "weakParts": {
    "intro": "취약 부위 핵심 한 줄 (1문장)",
    "callout": "오행 취약점·신체 핵심 한 문장",
    "paragraphs": ["단락1 (3~4문장)", "단락2 (3~4문장)"],
    "parts": [
      { "icon": "🫁", "name": "부위명", "ohaeng": "오행명", "desc": "한 줄 설명" },
      { "icon": "❤️", "name": "부위명", "ohaeng": "오행명", "desc": "한 줄 설명" },
      { "icon": "🦴", "name": "부위명", "ohaeng": "오행명", "desc": "한 줄 설명" }
    ]
  }
}`,
  3: `{
  "diseases": {
    "intro": "질환 방향 핵심 한 줄 (1문장)",
    "callout": "오행 불균형·질환 경향 핵심 한 문장",
    "paragraphs": ["단락1 (3~4문장)", "단락2 (3~4문장)"],
    "symptoms": [
      { "name": "질환/증상명", "level": "주의", "desc": "한 줄 설명" },
      { "name": "질환/증상명", "level": "관찰", "desc": "한 줄 설명" },
      { "name": "질환/증상명", "level": "주의", "desc": "한 줄 설명" }
    ]
  }
}`,
  4: `{
  "lifestyle": {
    "intro": "생활 방향 핵심 한 줄 (1문장)",
    "callout": "용신 오행·생활 연결 핵심 한 문장",
    "paragraphs": ["단락1 (3~4문장)", "단락2 (3~4문장)"],
    "tips": ["팁1 (한 줄, 구체적)", "팁2 (한 줄)", "팁3 (한 줄)", "팁4 (한 줄)"]
  }
}`,
  5: `{
  "healthFlow": {
    "intro": "건강 흐름 핵심 한 줄 (1문장)",
    "callout": "대운·세운과 건강 연관 핵심 한 문장",
    "paragraphs": ["단락1 (3~4문장)", "단락2 (3~4문장)"],
    "periods": [
      { "label": "40대 초반", "tone": "warn", "text": "이 시기 건강 핵심 포인트 한 줄" },
      { "label": "50대", "tone": "good", "text": "이 시기 건강 핵심 포인트 한 줄" },
      { "label": "60대", "tone": "warn", "text": "이 시기 건강 핵심 포인트 한 줄" }
    ]
  }
}`,
  6: `{
  "remedy": {
    "intro": "개운법 방향 핵심 한 줄 (1문장)",
    "callout": "부족 오행·개운 방향 핵심 한 문장",
    "paragraphs": ["단락1 (3~4문장)", "단락2 (3~4문장)"],
    "remedies": [
      { "icon": "🌿", "title": "개운법 이름", "desc": "한 줄 설명" },
      { "icon": "🎵", "title": "개운법 이름", "desc": "한 줄 설명" },
      { "icon": "🌅", "title": "개운법 이름", "desc": "한 줄 설명" },
      { "icon": "💧", "title": "개운법 이름", "desc": "한 줄 설명" }
    ]
  }
}`,
  7: `{
  "letter": {
    "paragraphs": ["단락1 (3~4문장)", "단락2 (3~4문장)", "단락3 (3~4문장)", "단락4 (3~4문장, 마무리)"]
  }
}`,
};

// ── 핵심 함수: 장별 프롬프트 빌더 ──
export function buildHealthChapterPrompt(
  chapter: number,
  input: {
    name: string;
    gender: "male" | "female";
    manseryeokText: string;
    pillars?: { pos: string; gan: string; ganEl: string; ji: string; jiEl: string; sipTop: string; sipBot: string; sinsal?: string }[];
    birthYear?: number;
  }
): { system: string; user: string } {
  const theme = HEALTH_CH_THEME[chapter] ?? `[제${chapter}장]`;
  const guide = HEALTH_CH_GUIDE[chapter] ?? "";
  const schema = HEALTH_CH_SCHEMA[chapter] ?? "{}";
  const honorific = input.name ? `${input.name} 님` : "그대";
  const currentYear = new Date().getFullYear();

  const user = `아래는 ${honorific}의 사주 명식입니다.

${input.manseryeokText}
${input.birthYear ? `\n출생연도: ${input.birthYear}년 / 현재연도: ${currentYear}년` : `\n현재연도: ${currentYear}년`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
이번 장의 주제: ${theme}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${guide ? `\n작성 지침:\n${guide}\n` : ""}
위 명식을 꼼꼼히 분석하여, 아래 JSON 스키마를 정확히 채워주시오.
반드시 유효한 JSON만 출력하시오. 코드펜스(\`\`\`)나 설명 문장은 절대 쓰지 마시오.
풀이 대상은 본인이 읽는 건강 결과지임을 염두에 두고, 따뜻하고 실용적으로 서술하시오.

${schema}`;

  return { system: SYSTEM, user };
}