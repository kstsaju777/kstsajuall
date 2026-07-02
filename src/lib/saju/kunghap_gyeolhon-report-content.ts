// =====================================================
// 결혼궁합 결과지 — 장별 풀이 프롬프트 & 구조
// =====================================================
// 두 사람(본인 + 상대방) 사주를 함께 풀이하는 결혼궁합 전용 파일.

import { SYSTEM } from "./report-prompts";

// ── 장별 필수 섹션 키 ──
export const GYEOLHON_KUNGHAP_CHAPTER_SECTIONS: Record<number, string[]> = {
  1:  ["myWonguk", "myNature", "myMarriagePattern"],
  2:  ["partnerWonguk", "partnerNature", "partnerMarriagePattern"],
  3:  ["marriageScore", "marriageReason"],
  4:  ["coupleStyle", "roleBalance", "dailyLife"],
  5:  ["strengths", "weaknesses", "balanceTip"],
  6:  ["hapList", "chungList", "overallScore"],
  7:  ["wealthFlow", "homeLife", "wealthTips"],
  8:  ["childCompatibility", "childTiming", "childStyle"],
  9:  ["crisisPoints", "overcomeTips", "crisisFlow"],
  10: ["bestTiming", "timingItems", "timingAdvice"],
  11: ["futureFlow", "longTermOutlook", "finalAdvice"],
  12: ["letter"],
};

// ── 장 완성 여부 확인 ──
export function isGyeolhonKunghapChapterReady(
  content: Record<string, unknown> | null | undefined,
  chapter: number
): boolean {
  if (!content) return false;
  const keys = GYEOLHON_KUNGHAP_CHAPTER_SECTIONS[chapter] ?? [];
  return keys.every((k) => {
    const val = content[k];
    if (!val || typeof val !== "object") return false;
    const v = val as Record<string, unknown>;
    if ("paragraphs" in v) return Array.isArray(v.paragraphs) && (v.paragraphs as unknown[]).length > 0;
    if ("items"     in v) return Array.isArray(v.items)     && (v.items     as unknown[]).length > 0;
    if ("keywords"  in v) return Array.isArray(v.keywords)  && (v.keywords  as unknown[]).length > 0;
    if ("tips"      in v) return Array.isArray(v.tips)      && (v.tips      as unknown[]).length > 0;
    if ("score"     in v) return typeof v.score === "number";
    if ("label"     in v) return typeof v.label === "string" && (v.label as string).length > 0;
    if ("desc"      in v) return typeof v.desc  === "string" && (v.desc  as string).length > 0;
    if ("intro"     in v) return typeof v.intro === "string" && (v.intro as string).length > 0;
    return false;
  });
}

// ── 장별 주제 ──
const CH_THEME: Record<number, string> = {
  1:  "[제1장 나의원국] 나의 사주 원국 — 나는 어떤 사람인가. 일간 오행, 오행 균형, 타고난 기질, 결혼 패턴",
  2:  "[제2장 상대원국] 상대의 사주 원국 — 그/그녀는 어떤 사람인가. 상대의 일간 오행, 기질, 결혼 패턴",
  3:  "[제3장 결혼가능성] 두 사람, 결혼할 수 있는 인연인가 — 사주로 본 결혼 가능성 점수(0~100)와 그 근거",
  4:  "[제4장 부부상] 결혼하면 어떤 부부가 될까 — 두 사람이 부부가 되었을 때의 모습, 역할 균형, 일상생활",
  5:  "[제5장 장단점] 이 결혼의 장점과 단점 — 결혼했을 때의 강점과 약점, 균형 잡는 법",
  6:  "[제6장 합충] 궁합의 핵심: 합과 충 — 두 사람 사주의 합·충 목록, 강도, 종합 궁합 점수(0~100)",
  7:  "[제7장 재물·가정] 결혼 후 재물운과 가정운 — 결혼 후 재물과 가정의 흐름",
  8:  "[제8장 자녀운] 자녀운 — 아이가 들어오는 인연인가. 자녀 궁합 점수(0~100), 자녀 시기, 자녀 특성",
  9:  "[제9장 위기극복] 이 결혼의 위기와 극복 — 결혼 생활에서 올 수 있는 위기 요소, 극복법, 시기별 흐름",
  10: "[제10장 시기] 결혼하기 좋은 시기는 언제인가 — 결혼 최적 시기와 조건",
  11: "[제11장 미래] 두 사람의 미래는 어디로 흐르는가 — 장기적인 관계 흐름과 노년의 모습",
  12: "[마무리] 홍연의 서신 — 두 사람의 결혼 인연에 대한 따뜻한 손편지",
};

// ── 장별 추가 지시 ──
const CH_GUIDE: Record<number, string> = {
  1: `[myWonguk 섹션 — 나의 원국]
- intro: 본인의 일간 오행을 중심으로 "~한 사주로" 형식 한 문장 요약.
- callout: 신강·신약, 오행 균형 핵심 한 문장.
- paragraphs 3개: ①일간 오행과 타고난 기운 ②오행 균형과 성격적 특징 ③신강·신약 판단과 결혼·가정에서 드러나는 본바탕. 각 단락 3~4문장.

[myNature 섹션 — 나의 기질]
- keywords: 본인을 대표하는 기질 키워드 3~4개.
- desc: 키워드를 아우르는 기질 설명 2~3문장.

[myMarriagePattern 섹션 — 나의 결혼 패턴]
- intro: 결혼과 가정에서 나타나는 핵심 패턴 한 줄.
- paragraphs 2개: ①배우자와 가정에 대한 태도와 역할 스타일 ②결혼 생활에서 반복될 수 있는 패턴과 주의점. 각 단락 3~4문장.`,

  2: `[partnerWonguk 섹션 — 상대 원국]
- intro: 상대의 일간 오행을 중심으로 한 문장 요약.
- callout: 상대의 신강·신약, 오행 균형 핵심 한 문장.
- paragraphs 3개: ①상대의 일간 오행과 기운 ②상대의 성격적 특징 ③상대의 결혼·가정 패턴. 각 단락 3~4문장.

[partnerNature 섹션 — 상대 기질]
- keywords: 상대를 대표하는 기질 키워드 3~4개.
- desc: 상대 기질 설명 2~3문장.

[partnerMarriagePattern 섹션 — 상대 결혼 패턴]
- intro: 상대가 결혼·가정에서 보이는 핵심 패턴 한 줄.
- paragraphs 2개: ①상대의 배우자·가정 태도와 역할 스타일 ②상대가 결혼 생활에서 반복할 패턴과 주의점. 각 단락 3~4문장.`,

  3: `[marriageScore 섹션 — 결혼 가능성 점수]
- score: 0~100 사이 정수 (두 사람의 결혼 궁합 종합 점수).
- label: 점수에 맞는 한 줄 라벨 (예: "천생연분의 결혼 인연", "노력하면 좋은 결혼", "결혼보다 연애가 더 잘 맞는 인연").
- paragraphs 2개: ①두 사람 사주에서 결혼 가능성을 보여주는 구조적 근거 ②결혼했을 때 기대할 수 있는 큰 그림. 각 단락 3~4문장.

[marriageReason 섹션 — 결혼 인연의 근거]
- intro: 두 사람이 결혼 인연인지 사주적 핵심 한 줄.
- callout: 결혼 가능성을 높이거나 낮추는 핵심 요소 한 문장.
- paragraphs 2개: ①두 사람 사주에서 발견되는 결혼 인연의 증거 ②결혼을 더 단단하게 만들기 위한 방향. 각 단락 3~4문장.`,

  4: `[coupleStyle 섹션 — 부부 스타일]
- intro: 두 사람이 부부가 되었을 때의 전체적인 부부상 한 줄.
- callout: 이 부부의 핵심 특징 한 문장.
- paragraphs 2개: ①부부로서 두 사람이 형성하는 분위기와 관계 역학 ②일상에서 드러나는 부부 스타일의 특징. 각 단락 3~4문장.

[roleBalance 섹션 — 역할 균형]
- items: 이 부부의 역할 분담 2~3개.
각 item: label(역할 제목), desc(역할 분담 설명 한 줄).

[dailyLife 섹션 — 일상생활]
- paragraphs 2개: ①결혼 후 일상에서 두 사람이 어떻게 맞춰가는가 ②행복한 결혼 생활을 위한 핵심 습관. 각 단락 3~4문장.`,

  5: `[strengths 섹션 — 이 결혼의 장점]
- items: 결혼했을 때의 강점 2~3개.
각 item: title(장점 제목), desc(설명 2~3문장).

[weaknesses 섹션 — 이 결혼의 단점]
- items: 결혼했을 때의 약점 2~3개.
각 item: title(단점 제목), desc(설명 2~3문장).

[balanceTip 섹션 — 균형 잡는 법]
- paragraphs 2개: ①장단점의 균형을 잡는 핵심 ②이 결혼을 더 단단하게 만드는 구체적 방법. 각 단락 3~4문장.`,

  6: `[hapList 섹션 — 합 목록]
items: 두 사람 사주에서 발견되는 합(合) 2~4개.
각 item: type(합의 종류, 예: "천간합", "지지삼합"), desc(이 합이 결혼 생활에 미치는 영향 한 줄), strength("강함" | "보통" | "약함").

[chungList 섹션 — 충 목록]
items: 두 사람 사주에서 발견되는 충(沖) 0~3개. 없으면 빈 배열.
각 item: type(충의 종류), desc(결혼 생활에 미치는 영향 한 줄), strength("강함" | "보통" | "약함").

[overallScore 섹션 — 종합 궁합 점수]
- score: 0~100 사이 정수.
- label: 점수에 맞는 한 줄 라벨.
- desc: 점수의 근거와 의미 2~3문장.`,

  7: `[wealthFlow 섹션 — 재물운]
- intro: 결혼 후 두 사람의 재물 흐름 핵심 한 줄.
- paragraphs 2개: ①두 사람 사주에서 보이는 재물운의 구조 ②결혼 후 재물을 다루는 방식과 주의점. 각 단락 3~4문장.

[homeLife 섹션 — 가정운]
- intro: 결혼 후 가정의 분위기와 흐름 핵심 한 줄.
- paragraphs 2개: ①두 사람이 함께 이루는 가정의 특성 ②가정의 평화와 행복을 위한 핵심. 각 단락 3~4문장.

[wealthTips 섹션 — 재물·가정 조언]
- tips: 재물과 가정을 함께 잘 이끄는 실천 방법 3~4개 (각 한 줄).`,

  8: `[childCompatibility 섹션 — 자녀 궁합 점수]
- score: 0~100 사이 정수 (자녀 인연 점수).
- label: 점수에 맞는 한 줄 라벨 (예: "자녀 복이 풍성한 인연", "자녀와 인연이 보통인 부부", "자녀보다 부부 중심의 인연").
- desc: 점수의 근거와 의미 2~3문장.

[childTiming 섹션 — 자녀 시기]
- paragraphs 2개: ①자녀가 들어오기 좋은 시기와 그 사주적 근거 ②자녀 시기를 준비하는 방향. 각 단락 3~4문장.

[childStyle 섹션 — 자녀 특성]
- paragraphs 2개: ①이 부부에게 올 자녀의 특성과 기운 ②자녀와의 관계와 양육 스타일. 각 단락 3~4문장.`,

  9: `[crisisPoints 섹션 — 위기 요소]
items: 결혼 생활에서 올 수 있는 위기 요소 2~3개.
각 item: title(위기 제목), desc(설명 2문장), tone("warn").

[overcomeTips 섹션 — 극복법]
items: 위기 극복 방법 3~4개.
각 item: title(극복법 제목), desc(구체적 방법 한 줄).

[crisisFlow 섹션 — 시기별 흐름]
items: 4~5개 시기별 결혼 생활 흐름.
각 item: label(시기, 예: "결혼 초기", "2028~2030"), tone("good" | "warn"), text(그 시기 결혼 기운 한 줄).
반드시 현재(2026년) 기준 향후 5~8년을 커버하오.`,

  10: `[bestTiming 섹션 — 최적 결혼 시기]
- paragraphs 2개: ①두 사람 사주에서 결혼하기 가장 좋은 시기와 그 근거 ②그 시기를 준비하는 방향. 각 단락 3~4문장.

[timingItems 섹션 — 시기별 체크리스트]
- items: 결혼 시기별 포인트 3~4개.
각 item: label(시기, 예: "2026년 상반기"), desc(그 시기 결혼 포인트 한 줄).

[timingAdvice 섹션 — 시기 조언]
- desc: 결혼 시기를 결정할 때 가장 중요한 조언 2~3문장.`,

  11: `[futureFlow 섹션 — 미래 흐름]
items: 4~5개 시기별 미래 흐름.
각 item: label(시기, 예: "2026~2030", "2031~2035"), tone("good" | "warn"), text(그 시기 두 사람의 흐름 한 줄).

[longTermOutlook 섹션 — 장기 전망]
- paragraphs 2개: ①두 사람이 함께 늙어가는 모습과 노년의 관계 ②이 결혼이 시간이 지날수록 어떻게 성숙해지는가. 각 단락 3~4문장.

[finalAdvice 섹션 — 마지막 조언]
- desc: 두 사람에게 건네는 가장 중요한 조언 2~3문장.`,

  12: `[letter 섹션 — 홍연의 서신]
결혼궁합 풀이를 마치며 홍연이 두 사람에게 함께 쓰는 따뜻한 손편지.
- paragraphs: 4~5개 단락. 각 단락 3~4문장.
- 두 사람의 결혼 인연, 강점과 주의점, 미래를 향한 희망적인 메시지로 갈무리하시오.
- 두 사람을 각각 "그대"와 "그대의 반려"로 지칭하며 함께 만들어갈 가정을 향해 맺으시오.`,
};

// ── 장별 JSON 스키마 ──
const CH_SCHEMA: Record<number, string> = {
  1: `{
  "myWonguk": { "intro": "한 문장", "callout": "핵심 한 문장", "paragraphs": ["단락1(3~4문장)", "단락2", "단락3"] },
  "myNature": { "keywords": ["키워드1", "키워드2", "키워드3"], "desc": "기질 설명 2~3문장" },
  "myMarriagePattern": { "intro": "결혼 패턴 핵심 한 줄", "paragraphs": ["단락1(3~4문장)", "단락2"] }
}`,
  2: `{
  "partnerWonguk": { "intro": "한 문장", "callout": "핵심 한 문장", "paragraphs": ["단락1(3~4문장)", "단락2", "단락3"] },
  "partnerNature": { "keywords": ["키워드1", "키워드2", "키워드3"], "desc": "기질 설명 2~3문장" },
  "partnerMarriagePattern": { "intro": "결혼 패턴 핵심 한 줄", "paragraphs": ["단락1(3~4문장)", "단락2"] }
}`,
  3: `{
  "marriageScore": { "score": 82, "label": "천생연분의 결혼 인연", "paragraphs": ["단락1(3~4문장)", "단락2"] },
  "marriageReason": { "intro": "한 줄", "callout": "핵심 한 문장", "paragraphs": ["단락1(3~4문장)", "단락2"] }
}`,
  4: `{
  "coupleStyle": { "intro": "한 줄", "callout": "핵심 한 문장", "paragraphs": ["단락1(3~4문장)", "단락2"] },
  "roleBalance": { "items": [{ "label": "역할 제목", "desc": "설명 한 줄" }] },
  "dailyLife": { "paragraphs": ["단락1(3~4문장)", "단락2"] }
}`,
  5: `{
  "strengths": { "items": [{ "title": "장점 제목", "desc": "설명 2~3문장" }] },
  "weaknesses": { "items": [{ "title": "단점 제목", "desc": "설명 2~3문장" }] },
  "balanceTip": { "paragraphs": ["단락1(3~4문장)", "단락2"] }
}`,
  6: `{
  "hapList": { "items": [{ "type": "천간합", "desc": "영향 한 줄", "strength": "강함" }] },
  "chungList": { "items": [{ "type": "자오충", "desc": "영향 한 줄", "strength": "보통" }] },
  "overallScore": { "score": 78, "label": "좋은 결혼 궁합", "desc": "근거 2~3문장" }
}`,
  7: `{
  "wealthFlow": { "intro": "한 줄", "paragraphs": ["단락1(3~4문장)", "단락2"] },
  "homeLife": { "intro": "한 줄", "paragraphs": ["단락1(3~4문장)", "단락2"] },
  "wealthTips": { "tips": ["조언1", "조언2", "조언3"] }
}`,
  8: `{
  "childCompatibility": { "score": 75, "label": "자녀 복이 풍성한 인연", "desc": "근거 2~3문장" },
  "childTiming": { "paragraphs": ["단락1(3~4문장)", "단락2"] },
  "childStyle": { "paragraphs": ["단락1(3~4문장)", "단락2"] }
}`,
  9: `{
  "crisisPoints": { "items": [{ "title": "위기 제목", "desc": "설명 2문장", "tone": "warn" }] },
  "overcomeTips": { "items": [{ "title": "극복법 제목", "desc": "방법 한 줄" }] },
  "crisisFlow": { "items": [{ "label": "결혼 초기", "tone": "good", "text": "흐름 한 줄" }] }
}`,
  10: `{
  "bestTiming": { "paragraphs": ["단락1(3~4문장)", "단락2"] },
  "timingItems": { "items": [{ "label": "2026년 상반기", "desc": "포인트 한 줄" }] },
  "timingAdvice": { "desc": "조언 2~3문장" }
}`,
  11: `{
  "futureFlow": { "items": [{ "label": "2026~2030", "tone": "good", "text": "흐름 한 줄" }] },
  "longTermOutlook": { "paragraphs": ["단락1(3~4문장)", "단락2"] },
  "finalAdvice": { "desc": "조언 2~3문장" }
}`,
  12: `{
  "letter": { "paragraphs": ["단락1(3~4문장)", "단락2", "단락3", "단락4"] }
}`,
};

// ── 프롬프트 빌더 ──
export function buildGyeolhonKunghapChapterPrompt(
  chapter: number,
  input: {
    name: string;
    gender: "male" | "female";
    manseryeokText: string;
    partnerName: string;
    partnerGender: "male" | "female";
    partnerManseryeokText: string;
    birthYear?: number;
  }
): { system: string; user: string } {
  const { name, gender, manseryeokText, partnerName, partnerGender, partnerManseryeokText } = input;
  const myGenderLabel = gender === "female" ? "여성" : "남성";
  const partnerGenderLabel = partnerGender === "female" ? "여성" : "남성";

  const theme = CH_THEME[chapter] ?? "";
  const guide = CH_GUIDE[chapter] ?? "";
  const schema = CH_SCHEMA[chapter] ?? "{}";

  const user = `아래 두 사람의 명식을 바탕으로 결혼궁합 결과지 풀이를 JSON으로 출력하시오.

【 본인 】
이름: ${name} (${myGenderLabel})
${manseryeokText}

【 상대방 】
이름: ${partnerName} (${partnerGenderLabel})
${partnerManseryeokText}

━━━━━━━━━━━━━━━━━━━━━
▶ 이번 장 주제: ${theme}
━━━━━━━━━━━━━━━━━━━━━
${guide}

출력 JSON 형식 (이 형식 그대로, 다른 키 추가 금지):
${schema}

주의:
- 반드시 위 JSON 형식만 출력하시오. 설명·인사말·마크다운 일절 불가.
- 두 사람의 명식에 근거한 풀이만 하시오. 일반론 금지.
- 홍연 말투(~이오/~하오/~했소/~겠소)를 유지하시오.
- 본인은 "${name}", 상대방은 "${partnerName}"으로 지칭하시오.`;

  return { system: SYSTEM, user };
}
