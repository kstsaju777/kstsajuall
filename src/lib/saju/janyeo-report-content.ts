// =====================================================
// 자녀사주 결과지 — 장별 풀이 프롬프트 & 구조
// =====================================================

import { SYSTEM } from "./report-prompts";

// ── 장별 필수 섹션 키 ──
export const JANYEO_CHAPTER_SECTIONS: Record<number, string[]> = {
  1: ["personality"],
  2: ["studyStyle"],
  3: ["talent"],
  4: ["career"],
  5: ["health"],
  6: ["parentingFlow"],
  7: ["friendship"],
  8: ["letter"],
};

// ── 장 완성 여부 확인 ──
export function isJanyeoChapterReady(
  content: Record<string, unknown> | null | undefined,
  chapter: number
): boolean {
  if (!content) return false;
  const keys = JANYEO_CHAPTER_SECTIONS[chapter] ?? [];
  return keys.every((k) => {
    const val = content[k];
    if (!val || typeof val !== "object") return false;
    const v = val as Record<string, unknown>;
    if ("paragraphs" in v) return Array.isArray(v.paragraphs) && (v.paragraphs as unknown[]).length > 0;
    if ("types" in v) return Array.isArray(v.types) && (v.types as unknown[]).length > 0;
    if ("items" in v) return Array.isArray(v.items) && (v.items as unknown[]).length > 0;
    if ("tips" in v) return Array.isArray(v.tips) && (v.tips as unknown[]).length > 0;
    if ("fields" in v) return Array.isArray(v.fields) && (v.fields as unknown[]).length > 0;
    if ("element" in v) return typeof v.element === "string" && (v.element as string).length > 0;
    return false;
  });
}

// ── 장별 주제 ──
const JANYEO_CH_THEME: Record<number, string> = {
  1: "[제1장 기질] 어떤 기질과 성격으로 태어났나 — 일간 오행, 신강·신약, 타고난 성격과 행동 패턴",
  2: "[제2장 학업] 아이의 학업운과 공부 스타일 — 학습 방식, 집중력, 잘 맞는 공부 환경, 학업운 흐름",
  3: "[제3장 재능] 아이의 타고난 재능과 적성 — 오행·십성으로 보는 강점, 잘하는 분야, 키워야 할 능력",
  4: "[제4장 진로] 아이의 진로와 직업운 — 어울리는 직업군, 성인이 되어 잘 맞는 일의 방향",
  5: "[제5장 건강] 아이의 건강에서 주의할 부분 — 기질적으로 취약한 신체, 건강 관리 포인트",
  6: "[제6장 양육] 아이를 키울 때 조심해야 할 시기 — 성장 단계별 주의 시기, 부모가 신경 써야 할 포인트",
  7: "[제7장 친구] 아이의 인간관계와 친구운 — 또래 관계 패턴, 잘 맞는 친구 유형, 관계에서의 특징",
  8: "[마무리] 홍연의 서신 — 아이의 사주 풀이를 마치며 부모에게 전하는 따뜻한 손편지",
};

// ── 장별 추가 지시 ──
const JANYEO_CH_GUIDE: Record<number, string> = {
  1: `[personality 섹션 — 기질과 성격]
- intro: "~한 사주로, 한 줄 요약" 형식. 아이의 타고난 기운을 한 줄로. (1문장)
- callout: 일간 오행과 신강·신약을 핵심 한 문장으로.
- paragraphs 3개: ①일간 오행과 타고난 기운의 특징 ②아이의 성격과 행동 패턴 ③강점과 함께 부모가 이해해야 할 기질. 각 단락 3~4문장.`,

  2: `[studyStyle 섹션 — 학업 스타일]
- intro: 이 아이의 공부 스타일 핵심 한 줄. (1문장)
- callout: 학업운과 관련된 사주 핵심 한 문장.
- paragraphs 2개: ①잘 맞는 학습 방식과 환경 ②집중력과 학업운 흐름, 부모의 지원 방향. 각 단락 3~4문장.
- studyTips: 실천 가능한 공부 팁 3~4개 (한 줄씩, 구체적으로).`,

  3: `[talent 섹션 — 재능 분야]
- intro: 이 아이가 타고난 재능의 핵심 방향 한 줄. (1문장)
- callout: 재능과 연결된 십성·오행 핵심 한 문장.
- paragraphs 2개: ①오행·십성으로 본 강점과 잘하는 분야 ②키워주면 빛나는 능력과 계발 방법. 각 단락 3~4문장.
- fields: 재능 분야 3~4개. 각 field: icon(이모지), name(분야명), desc(한 줄 설명).`,

  4: `[career 섹션 — 진로와 직업]
- intro: 이 아이에게 어울리는 일의 방향 한 줄. (1문장)
- callout: 직업운 관련 사주 핵심 한 문장.
- paragraphs 2개: ①어울리는 직업군과 그 이유 ②성인이 되어 빛날 환경과 일의 특성. 각 단락 3~4문장.
- jobTypes: 어울리는 직업 유형 2~3개. 각 jobType: icon(이모지), category(대분류), jobs(직업 예시 3개).`,

  5: `[health 섹션 — 건강 주의]
- intro: 이 아이의 건강에서 가장 주의할 포인트 한 줄. (1문장)
- callout: 건강과 관련된 오행 취약점 핵심 한 문장.
- paragraphs 2개: ①기질적으로 취약한 신체 부위와 이유 ②건강하게 키우기 위한 생활 습관. 각 단락 3~4문장.
- healthTips: 건강 관리 실천법 3~4개 (한 줄씩, 구체적으로).`,

  6: `[parentingFlow 섹션 — 양육 시기별 흐름]
- intro: 이 아이를 키울 때 가장 중요한 포인트 한 줄. (1문장)
- callout: 양육에서 부모가 가장 집중해야 할 시기나 방향 한 문장.
- paragraphs 2개: ①부모와 아이의 관계 특징, 잘 맞는 교육 방식 ②아이를 키울 때 주의할 점과 부모의 역할. 각 단락 3~4문장.
- growthItems: 성장 단계별 주의사항 4~5개. 각 item: label(시기, 예: "유아기 0~7세"), tone("good" 또는 "warn"), text(그 시기 핵심 포인트 한 줄).`,

  7: `[friendship 섹션 — 친구와 인간관계]
- intro: 이 아이의 인간관계 특징 핵심 한 줄. (1문장)
- callout: 친구 관계와 연결된 십성·오행 핵심 한 문장.
- paragraphs 2개: ①또래 관계 패턴과 친구를 사귀는 방식 ②잘 맞는 친구 유형과 관계에서의 강점·주의점. 각 단락 3~4문장.
- friendTypes: 궁합 친구 유형 2~3개. 각 type: label("잘 맞는" 또는 "주의할"), icon(이모지), desc(특징 한 줄).`,

  8: `[letter 섹션 — 홍연의 서신]
자녀사주 풀이를 마치며 홍연이 부모에게 쓰는 따뜻한 손편지.
- 이 아이의 빛나는 점, 키워주어야 할 것, 부모에 대한 따뜻한 응원으로 갈무리.
- paragraphs: 3~4개 단락. 각 단락 3~4문장.
- 바로 본론으로 시작하여 따뜻한 마무리로 끝내시오.`,
};

// ── 장별 JSON 스키마 ──
const JANYEO_CH_SCHEMA: Record<number, string> = {
  1: `{
  "personality": {
    "intro": "~한 사주로, 한 줄 요약 (1문장)",
    "callout": "일간 오행·신강신약 핵심 한 문장",
    "paragraphs": ["단락1 (3~4문장)", "단락2 (3~4문장)", "단락3 (3~4문장)"]
  }
}`,
  2: `{
  "studyStyle": {
    "intro": "공부 스타일 핵심 한 줄 (1문장)",
    "callout": "학업운 사주 핵심 한 문장",
    "paragraphs": ["단락1 (3~4문장)", "단락2 (3~4문장)"],
    "studyTips": ["팁1 (한 줄)", "팁2 (한 줄)", "팁3 (한 줄)"]
  }
}`,
  3: `{
  "talent": {
    "intro": "재능 방향 핵심 한 줄 (1문장)",
    "callout": "재능 십성·오행 핵심 한 문장",
    "paragraphs": ["단락1 (3~4문장)", "단락2 (3~4문장)"],
    "fields": [
      { "icon": "🎨", "name": "분야명", "desc": "한 줄 설명" },
      { "icon": "🎵", "name": "분야명", "desc": "한 줄 설명" }
    ]
  }
}`,
  4: `{
  "career": {
    "intro": "진로 방향 핵심 한 줄 (1문장)",
    "callout": "직업운 사주 핵심 한 문장",
    "paragraphs": ["단락1 (3~4문장)", "단락2 (3~4문장)"],
    "jobTypes": [
      { "icon": "💼", "category": "직업 대분류", "jobs": ["직업1", "직업2", "직업3"] },
      { "icon": "🎯", "category": "직업 대분류", "jobs": ["직업1", "직업2", "직업3"] }
    ]
  }
}`,
  5: `{
  "health": {
    "intro": "건강 주의 핵심 한 줄 (1문장)",
    "callout": "취약 오행·신체 핵심 한 문장",
    "paragraphs": ["단락1 (3~4문장)", "단락2 (3~4문장)"],
    "healthTips": ["팁1 (한 줄)", "팁2 (한 줄)", "팁3 (한 줄)"]
  }
}`,
  6: `{
  "parentingFlow": {
    "intro": "양육 핵심 포인트 한 줄 (1문장)",
    "callout": "부모가 집중해야 할 방향 한 문장",
    "paragraphs": ["단락1 (3~4문장)", "단락2 (3~4문장)"],
    "growthItems": [
      { "label": "유아기 0~7세", "tone": "good", "text": "이 시기 핵심 포인트 한 줄" },
      { "label": "아동기 8~13세", "tone": "warn", "text": "이 시기 핵심 포인트 한 줄" },
      { "label": "청소년기 14~19세", "tone": "good", "text": "이 시기 핵심 포인트 한 줄" }
    ]
  }
}`,
  7: `{
  "friendship": {
    "intro": "인간관계 특징 핵심 한 줄 (1문장)",
    "callout": "친구 관계 십성·오행 핵심 한 문장",
    "paragraphs": ["단락1 (3~4문장)", "단락2 (3~4문장)"],
    "friendTypes": [
      { "label": "잘 맞는", "icon": "💫", "desc": "특징 한 줄" },
      { "label": "주의할", "icon": "⚡", "desc": "특징 한 줄" }
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
export function buildJanyeoChapterPrompt(
  chapter: number,
  input: {
    name: string;
    gender: "male" | "female";
    manseryeokText: string;
    pillars?: { pos: string; gan: string; ganEl: string; ji: string; jiEl: string; sipTop: string; sipBot: string; sinsal?: string }[];
    birthYear?: number;
  }
): { system: string; user: string } {
  const theme = JANYEO_CH_THEME[chapter] ?? `[제${chapter}장]`;
  const guide = JANYEO_CH_GUIDE[chapter] ?? "";
  const schema = JANYEO_CH_SCHEMA[chapter] ?? "{}";
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
풀이 대상은 부모가 의뢰한 자녀(아이)임을 염두에 두고, 부모가 읽는 시점에서 따뜻하고 실용적으로 서술하시오.

${schema}`;

  return { system: SYSTEM, user };
}
