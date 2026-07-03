// =====================================================
// 재물사주 결과지 — 장별 풀이 프롬프트 & 구조
// =====================================================
// 정통사주(report-content.ts)와 독립적으로 관리합니다.
// 홍연 화자 SYSTEM은 report-prompts.ts에서 공유.

import { SYSTEM } from "./report-prompts";

// ── 장별 필수 섹션 키 ──
export const JAEMUL_CHAPTER_SECTIONS: Record<number, string[]> = {
  1: ["wonguk", "geokguk", "jaeseong"],
  2: ["wealthStyle"],
  3: ["wealthPresence", "jobFit", "investStyle", "splitType"],
  4: ["careerWealth", "wealthPeak"],
  5: ["moneyTrap", "warningFlow"],
  6: ["wealthCare", "wealthSummary"],
  7: ["letter"],
};

// ── 장 완성 여부 확인 ──
export function isJaemulChapterReady(
  content: Record<string, unknown> | null | undefined,
  chapter: number
): boolean {
  if (!content) return false;
  const keys = JAEMUL_CHAPTER_SECTIONS[chapter] ?? [];
  return keys.every((k) => {
    const val = content[k];
    if (!val || typeof val !== "object") return false;
    const v = val as Record<string, unknown>;
    if ("paragraphs" in v) return Array.isArray(v.paragraphs) && (v.paragraphs as unknown[]).length > 0;
    if ("clusters" in v) return Array.isArray(v.clusters) && (v.clusters as unknown[]).length > 0;
    if ("types" in v) return Array.isArray(v.types) && (v.types as unknown[]).length > 0;
    if ("items" in v) return Array.isArray(v.items) && (v.items as unknown[]).length > 0;
    if ("tips" in v) return Array.isArray(v.tips) && (v.tips as unknown[]).length > 0;
    if ("leftLabel" in v) return typeof v.left === "number" && typeof v.right === "number";
    if ("name" in v) return typeof v.name === "string" && (v.name as string).length > 0;
    if ("when" in v) return typeof v.title === "string" && (v.title as string).length > 0;
    if ("element" in v) return typeof v.element === "string" && (v.element as string).length > 0;
    return false;
  });
}

// ── 장별 주제 ──
const JAEMUL_CH_THEME: Record<number, string> = {
  1: "[제1장 그릇] 나는 어떤 그릇으로 태어났나 — 일간 오행, 오행 균형, 신강·신약, 타고난 본바탕",
  2: "[제2장 재물기질] 내 재물 기질 — 돈을 대하는 나의 방식, 재물에 대한 태도, 소비·저축·집착 패턴",
  3: "[제3장 재물] 내 사주에 재물이 보이는가 — 재성의 유무·강약, 어울리는 직군, 투자 스타일, 직장인형 vs 사업가형",
  4: "[제4장 천직] 돈이 되는 일과 나의 천직 — 재물이 따르는 일, 적성과 직업, 돈 버는 황금기",
  5: "[제5장 대운] 내 재물 대운 — 언제 벌고 언제 조심할까, 돈의 함정, 시기별 재물 흐름",
  6: "[제6장 개운법] 내 재물운을 바꾸는 개운법 — 부족한 오행 보강, 재물 개운 핵심 조언, 종합 정리",
  7: "[마무리] 홍연의 서신 — 재물에 관한 따뜻한 손편지로 결과지를 맺는 글",
};

// ── 장별 추가 지시 ──
const JAEMUL_CH_GUIDE: Record<number, string> = {
  1: `[wonguk 섹션 — 타고난 그릇 분석]
- intro: "~한 사주로, 한 문장 요약" 형식으로 시작. (1문장)
- callout: 일간 오행과 신강·신약 핵심을 한 문장으로.
- paragraphs 3개: ①일간 오행과 타고난 기운 ②오행 균형의 특징과 재물에 미치는 영향 ③신강·신약 판단과 돈을 다루는 그릇의 크기. 각 단락 3~4문장.

[geokguk 섹션 — 격국]
이 사람의 격국(格局)을 판단하여 아래 형식으로 출력하오.
- name: 격국 이름 (예: "편인격", "정관격", "식신격", "재격" 등). 반드시 월지 기준으로 판단.
- keyword: 이 격이 가진 핵심 특성 키워드 2~3개를 "·"로 구분 (예: "직관·창의·독립").
- desc: 이 격국이 재물과 어떻게 연결되는지 2~3문장으로 설명. 홍연 화자로.

[jaeseong 섹션 — 재물성(재성) 체크]
이 사람의 사주 원국에서 재물성(재성)의 상태를 항목별로 점검하오.
items: 반드시 4개 항목. 각 항목:
- label: 체크 항목명 (예: "재성 존재", "재성 힘", "식상→재 흐름", "관성 보호")
- exists: true(있음/좋음) 또는 false(없음/약함)
- desc: 해당 항목의 상태를 한 줄로 설명 (구체적인 천간·지지·십성 언급).`,

  2: `[wealthStyle 섹션 — 재물 기질]
- intro: 돈을 대하는 나만의 방식을 핵심 한 줄로. (1문장)
- callout: 재성·관성·식상 중 강한 십성과 재물 기질의 연결고리 한 문장.
- paragraphs 3개: ①돈을 버는 방식(적극적/소극적) ②소비·저축·투자 습관 패턴 ③재물에 대한 심리와 집착·여유의 균형. 각 단락 3~4문장.`,

  3: `[wealthPresence 섹션 — 재물 존재 여부]
- intro: 사주에 재물(재성)이 얼마나 드러나는지 한 줄 요약. (1문장)
- callout: 재성 강약, 합·충 영향 핵심 한 문장.
- paragraphs 2개: ①재성의 유무·강약과 그 의미 ②재물을 얻기 쉬운 조건과 조심할 조건. 각 단락 3~4문장.

[jobFit 섹션 — 어울리는 직군]
clusters: 2~3개 직군 그룹.
각 cluster: category(직군 대분류명), keywords(해당 직군 특성 키워드 2~3개), jobs(구체적인 직업 3~5개).
반드시 명식에 근거해 가장 잘 맞는 분야 위주로.

[investStyle 섹션 — 투자 스타일]
types: 2~3개 투자 유형.
각 type: category(투자 유형명), icon(관련 이모지 1개), score(적합도 0~100 정수), products(구체적 투자상품 2~3개), tip(이 사람에게 맞는 투자 팁 한 줄).

[splitType 섹션 — 직장인 vs 사업가]
leftLabel: "직장인형", left: (비율 정수 0~100),
rightLabel: "사업가형", right: (100-left 계산),
leftDesc: 직장인으로서의 강점 한 줄,
rightDesc: 사업가로서의 강점 한 줄.`,

  4: `[careerWealth 섹션 — 천직과 재물]
- intro: 이 사람에게 돈이 따르는 일의 핵심 방향 한 줄. (1문장)
- callout: 재물과 직업운의 결정적 연결 한 문장 (특정 십성·신살 포함).
- paragraphs 2개: ①재물이 따르는 일의 특징과 천직 ②직업 선택 시 주의할 점과 돈 버는 방향. 각 단락 3~4문장.

[wealthPeak 섹션 — 재물 황금기]
- title: "황금기"의 핵심 키워드 (예: "관성이 열리는 시기", "재성 대운의 절정")
- when: 황금기가 오는 시기 (예: "30대 후반~40대 초반", "갑진 대운 시작 무렵")
- todo: 이 황금기를 잡기 위해 지금 해야 할 일 한 줄.`,

  5: `[moneyTrap 섹션 — 돈의 함정]
- title: 이 사람이 빠질 수 있는 재물 함정 이름 (예: "욕심이 과해지는 순간", "충동 지출의 늪")
- desc: 함정의 본질 설명 2~3문장.
- items: 구체적인 함정 상황 3개 (각각 짧은 한 줄씩).

[warningFlow 섹션 — 시기별 재물 흐름]
items: 4~6개 시기별 흐름.
각 item: label(시기 예: "현재~2026", "2027~2029"), tone("warn" 또는 "good"), text(그 시기 재물 기운 한 줄 설명).
반드시 현재(2026년) 기준 향후 10년을 커버하오.`,

  6: `[wealthCare 섹션 — 재물 개운법]
- element: 보강해야 할 오행 이름 (반드시 "금", "목", "화", "토", "수" 중 하나만 출력)
- tips: 재물 개운 실천법 4~5개 (각각 구체적인 한 줄씩. 색·방향·음식·습관 등 다양하게).

[wealthSummary 섹션 — 종합 정리]
- title: 이 결과지의 핵심 메시지 제목 (예: "그대의 재물은 꾸준함 속에 있소")
- items: 핵심 정리 3개. 각 item: title(짧은 제목), desc(설명 2~3문장).`,

  7: `[letter 섹션 — 홍연의 서신]
재물사주 풀이를 마치며 홍연이 독자에게 쓰는 따뜻한 손편지.
- paragraphs: 3~4개 단락. 각 단락 3~4문장.
- 이 사람의 재물 기운, 강점, 주의할 점을 따뜻하게 갈무리하되 희망적인 메시지로 맺으시오.
- 바로 본론으로 시작하여 따뜻한 마무리로 끝내시오.`,
};

// ── 장별 JSON 스키마 ──
const JAEMUL_CH_SCHEMA: Record<number, string> = {
  1: `{
  "wonguk": {
    "intro": "~한 사주로, 한 줄 요약 (1문장)",
    "callout": "핵심 사주 용어 포함 강조 한 문장",
    "paragraphs": ["단락1 (3~4문장)", "단락2 (3~4문장)", "단락3 (3~4문장)"]
  },
  "geokguk": {
    "name": "격국명 (예: 편인격)",
    "keyword": "특성1·특성2·특성3",
    "desc": "이 격국과 재물의 연결 2~3문장"
  },
  "jaeseong": {
    "items": [
      { "label": "재성 존재", "exists": true, "desc": "구체적인 천간·지지 언급 한 줄" },
      { "label": "재성 힘", "exists": true, "desc": "재성 강약 상태 한 줄" },
      { "label": "식상→재 흐름", "exists": false, "desc": "식상 → 재성 연결 상태 한 줄" },
      { "label": "관성 보호", "exists": true, "desc": "관성의 재성 보호 여부 한 줄" }
    ]
  }
}`,
  2: `{
  "wealthStyle": {
    "intro": "재물 기질 핵심 한 줄 (1문장)",
    "callout": "십성과 재물 연결 핵심 한 문장",
    "paragraphs": ["단락1 (3~4문장)", "단락2 (3~4문장)", "단락3 (3~4문장)"]
  }
}`,
  3: `{
  "wealthPresence": {
    "intro": "재성 존재 여부 한 줄 요약 (1문장)",
    "callout": "재성 강약 핵심 한 문장",
    "paragraphs": ["단락1 (3~4문장)", "단락2 (3~4문장)"]
  },
  "jobFit": {
    "clusters": [
      { "category": "직군 대분류명", "keywords": ["특성1", "특성2"], "jobs": ["직업1", "직업2", "직업3"] }
    ]
  },
  "investStyle": {
    "types": [
      { "category": "투자 유형명", "icon": "이모지", "score": 85, "products": ["상품1", "상품2"], "tip": "이 사람에게 맞는 팁 한 줄" }
    ]
  },
  "splitType": {
    "leftLabel": "직장인형",
    "left": 40,
    "rightLabel": "사업가형",
    "right": 60,
    "leftDesc": "직장인으로서 강점 한 줄",
    "rightDesc": "사업가로서 강점 한 줄"
  }
}`,
  4: `{
  "careerWealth": {
    "intro": "천직·재물 방향 핵심 한 줄 (1문장)",
    "callout": "재물·직업운 연결 핵심 한 문장",
    "paragraphs": ["단락1 (3~4문장)", "단락2 (3~4문장)"]
  },
  "wealthPeak": {
    "title": "황금기 핵심 키워드",
    "when": "황금기 시기",
    "todo": "지금 해야 할 일 한 줄"
  }
}`,
  5: `{
  "moneyTrap": {
    "title": "돈의 함정 이름",
    "desc": "함정의 본질 설명 (2~3문장)",
    "items": ["함정 상황1 (한 줄)", "함정 상황2 (한 줄)", "함정 상황3 (한 줄)"]
  },
  "warningFlow": {
    "items": [
      { "label": "현재~2026", "tone": "good", "text": "이 시기 재물 기운 한 줄" },
      { "label": "2027~2028", "tone": "warn", "text": "이 시기 재물 기운 한 줄" }
    ]
  }
}`,
  6: `{
  "wealthCare": {
    "element": "금",
    "tips": ["개운 실천법1", "개운 실천법2", "개운 실천법3", "개운 실천법4"]
  },
  "wealthSummary": {
    "title": "핵심 메시지 제목",
    "items": [
      { "title": "정리 항목 제목1", "desc": "설명 (2~3문장)" },
      { "title": "정리 항목 제목2", "desc": "설명 (2~3문장)" },
      { "title": "정리 항목 제목3", "desc": "설명 (2~3문장)" }
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
export function buildJaemulChapterPrompt(
  chapter: number,
  input: {
    name: string;
    gender: "male" | "female";
    manseryeokText: string;
    pillars?: { pos: string; gan: string; ganEl: string; ji: string; jiEl: string; sipTop: string; sipBot: string; sinsal?: string }[];
    birthYear?: number;
  }
): { system: string; user: string } {
  const theme = JAEMUL_CH_THEME[chapter] ?? `[제${chapter}장]`;
  const guide = JAEMUL_CH_GUIDE[chapter] ?? "";
  const schema = JAEMUL_CH_SCHEMA[chapter] ?? "{}";
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
