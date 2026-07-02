// =====================================================
// 연애궁합 결과지 — 장별 풀이 프롬프트 & 구조
// =====================================================
// 두 사람(본인 + 상대방) 사주를 함께 풀이하는 궁합 전용 파일.
// 홍연 화자 SYSTEM은 report-prompts.ts에서 공유.

import { SYSTEM } from "./report-prompts";

// ── 장별 필수 섹션 키 ──
export const YEONAE_KUNGHAP_CHAPTER_SECTIONS: Record<number, string[]> = {
  1:  ["myWonguk", "myNature", "myLovePattern"],
  2:  ["partnerWonguk", "partnerNature", "partnerLovePattern"],
  3:  ["attractionReason", "firstImpression", "chemistryScore"],
  4:  ["myView", "myExpectation", "myWarning"],
  5:  ["partnerView", "partnerExpectation", "partnerWarning"],
  6:  ["hapList", "chungList", "overallScore"],
  7:  ["myStyle", "partnerStyle", "styleGap"],
  8:  ["strengths", "shadows", "balance"],
  9:  ["crisisPoints", "overcomeTips", "crisisFlow"],
  10: ["marriagePossibility", "marriageConditions", "marriageTiming"],
  11: ["goodPeriods", "cautionPeriods", "yearlyFlow"],
  12: ["letter"],
};

// ── 장 완성 여부 확인 ──
export function isYeonaeKunghapChapterReady(
  content: Record<string, unknown> | null | undefined,
  chapter: number
): boolean {
  if (!content) return false;
  const keys = YEONAE_KUNGHAP_CHAPTER_SECTIONS[chapter] ?? [];
  return keys.every((k) => {
    const val = content[k];
    if (!val || typeof val !== "object") return false;
    const v = val as Record<string, unknown>;
    if ("paragraphs" in v) return Array.isArray(v.paragraphs) && (v.paragraphs as unknown[]).length > 0;
    if ("items"     in v) return Array.isArray(v.items)     && (v.items     as unknown[]).length > 0;
    if ("types"     in v) return Array.isArray(v.types)     && (v.types     as unknown[]).length > 0;
    if ("periods"   in v) return Array.isArray(v.periods)   && (v.periods   as unknown[]).length > 0;
    if ("keywords"  in v) return Array.isArray(v.keywords)  && (v.keywords  as unknown[]).length > 0;
    if ("tips"      in v) return Array.isArray(v.tips)      && (v.tips      as unknown[]).length > 0;
    if ("score"     in v) return typeof v.score === "number";
    if ("label"     in v) return typeof v.label === "string" && (v.label as string).length > 0;
    if ("desc"      in v) return typeof v.desc  === "string" && (v.desc  as string).length > 0;
    if ("mine"      in v) return typeof v.mine  === "string" && (v.mine  as string).length > 0;
    return false;
  });
}

// ── 장별 주제 ──
const CH_THEME: Record<number, string> = {
  1:  "[제1장 나의원국] 나의 사주 원국 — 나는 어떤 사람인가. 일간 오행, 오행 균형, 타고난 기질, 연애 패턴",
  2:  "[제2장 상대원국] 상대의 사주 원국 — 그/그녀는 어떤 사람인가. 상대의 일간 오행, 기질, 연애 패턴",
  3:  "[제3장 끌림] 첫인상과 끌림의 비밀 — 두 사람은 왜 서로에게 끌리는가. 케미 점수(0~100)와 끌림의 근거",
  4:  "[제4장 내시각] 나는 이 사람을 어떻게 보는가 — 내 사주 기준으로 본 상대의 이미지, 기대, 주의점",
  5:  "[제5장 상대시각] 상대는 나를 어떻게 보는가 — 상대 사주 기준으로 본 나의 이미지, 기대, 주의점",
  6:  "[제6장 합충형] 궁합의 핵심: 합과 충 — 두 사람 사주의 합·충 목록, 강도, 종합 궁합 점수(0~100)",
  7:  "[제7장 스타일] 연애 스타일의 차이 — 두 사람이 사랑을 표현하고 받아들이는 방식의 차이와 조율법",
  8:  "[제8장 빛그림자] 이 관계의 빛과 그림자 — 이 인연의 강점(빛)과 갈등 요소(그림자), 균형 잡는 법",
  9:  "[제9장 위기극복] 위기와 극복 — 두 사람 사이에 올 수 있는 위기 요소, 극복법, 시기별 관계 흐름",
  10: "[제10장 결혼] 결혼으로 이어지는가 — 결혼 가능성 점수(0~100), 결혼의 조건, 결혼하기 좋은 시기",
  11: "[제11장 좋은시기] 두 사람이 함께하면 좋은 시기 — 함께 빛나는 시기와 조심할 시기, 연간 흐름",
  12: "[마무리] 홍연의 서신 — 두 사람의 인연에 대한 따뜻한 손편지로 결과지를 맺는 글",
};

// ── 장별 추가 지시 ──
const CH_GUIDE: Record<number, string> = {
  1: `[myWonguk 섹션 — 나의 원국]
- intro: 본인의 일간 오행을 중심으로 "~한 사주로" 형식 한 문장 요약.
- callout: 신강·신약, 오행 균형 핵심 한 문장.
- paragraphs 3개: ①일간 오행과 타고난 기운 ②오행 균형과 성격적 특징 ③신강·신약 판단과 연애에서 드러나는 본바탕. 각 단락 3~4문장.

[myNature 섹션 — 나의 기질]
- keywords: 본인을 대표하는 기질 키워드 3~4개 (예: "추진력", "감수성", "독립심").
- desc: 키워드를 아우르는 기질 설명 2~3문장.

[myLovePattern 섹션 — 나의 연애 패턴]
- intro: 연애할 때 나타나는 핵심 패턴 한 줄.
- paragraphs 2개: ①감정 표현 방식과 사랑의 스타일 ②연애에서 반복되는 패턴과 주의점. 각 단락 3~4문장.`,

  2: `[partnerWonguk 섹션 — 상대 원국]
- intro: 상대의 일간 오행을 중심으로 "~한 사주로" 형식 한 문장 요약.
- callout: 상대의 신강·신약, 오행 균형 핵심 한 문장.
- paragraphs 3개: ①상대의 일간 오행과 타고난 기운 ②상대의 오행 균형과 성격적 특징 ③상대의 신강·신약과 연애에서 드러나는 본바탕. 각 단락 3~4문장.

[partnerNature 섹션 — 상대 기질]
- keywords: 상대를 대표하는 기질 키워드 3~4개.
- desc: 키워드를 아우르는 상대 기질 설명 2~3문장.

[partnerLovePattern 섹션 — 상대 연애 패턴]
- intro: 상대가 연애할 때 나타나는 핵심 패턴 한 줄.
- paragraphs 2개: ①상대의 감정 표현 방식과 사랑의 스타일 ②상대가 연애에서 반복하는 패턴과 주의점. 각 단락 3~4문장.`,

  3: `[attractionReason 섹션 — 끌림의 이유]
- intro: 두 사람이 서로에게 끌리는 사주적 이유 핵심 한 줄.
- callout: 끌림을 만드는 핵심 오행·십성 관계 한 문장.
- paragraphs 2개: ①두 사람 사주에서 끌림을 만드는 구조적 이유 ②첫인상에서 서로 느끼는 분위기와 매력. 각 단락 3~4문장.

[firstImpression 섹션 — 첫인상]
- mine: 내가 상대에게서 받는 첫인상 한 줄.
- partner: 상대가 나에게서 받는 첫인상 한 줄.

[chemistryScore 섹션 — 케미 점수]
- score: 0~100 사이 정수 (두 사람의 사주 케미 종합 점수).
- label: 점수에 맞는 한 줄 라벨 (예: "불꽃 같은 케미", "안정적인 조화", "성장이 필요한 인연").
- desc: 점수의 근거와 의미 2~3문장.`,

  4: `[myView 섹션 — 내가 보는 상대]
- intro: 내 사주 기준으로 상대가 어떻게 보이는지 핵심 한 줄.
- callout: 내 사주에서 상대가 어떤 십성·오행으로 작용하는지 한 문장.
- paragraphs 2개: ①내 눈에 비친 상대의 이미지와 매력 포인트 ②내가 상대에게 기대하는 것과 갈등이 생길 수 있는 지점. 각 단락 3~4문장.

[myExpectation 섹션 — 나의 기대]
items: 내가 상대에게 기대하는 것 2~3개.
각 item: label(기대 제목), desc(구체적 설명 한 줄).

[myWarning 섹션 — 나의 주의점]
- desc: 내가 이 관계에서 주의해야 할 점 2~3문장.`,

  5: `[partnerView 섹션 — 상대가 보는 나]
- intro: 상대 사주 기준으로 내가 어떻게 보이는지 핵심 한 줄.
- callout: 상대 사주에서 내가 어떤 십성·오행으로 작용하는지 한 문장.
- paragraphs 2개: ①상대 눈에 비친 나의 이미지와 매력 포인트 ②상대가 나에게 기대하는 것과 갈등이 생길 수 있는 지점. 각 단락 3~4문장.

[partnerExpectation 섹션 — 상대의 기대]
items: 상대가 나에게 기대하는 것 2~3개.
각 item: label(기대 제목), desc(구체적 설명 한 줄).

[partnerWarning 섹션 — 상대의 주의점]
- desc: 상대가 이 관계에서 주의해야 할 점 2~3문장.`,

  6: `[hapList 섹션 — 합 목록]
items: 두 사람 사주에서 발견되는 합(合) 2~4개.
각 item: type(합의 종류, 예: "천간합", "지지삼합"), desc(이 합이 두 사람 관계에 미치는 영향 한 줄), strength("강함" | "보통" | "약함").

[chungList 섹션 — 충 목록]
items: 두 사람 사주에서 발견되는 충(沖) 0~3개. 없으면 빈 배열.
각 item: type(충의 종류, 예: "자오충", "묘유충"), desc(이 충이 두 사람 관계에 미치는 영향 한 줄), strength("강함" | "보통" | "약함").

[overallScore 섹션 — 종합 궁합 점수]
- score: 0~100 사이 정수 (합·충 종합 궁합 점수).
- label: 점수에 맞는 한 줄 라벨 (예: "천생연분", "노력이 필요한 인연", "갈등이 많은 인연").
- desc: 점수의 근거와 의미 2~3문장.`,

  7: `[myStyle 섹션 — 나의 연애 스타일]
- label: 나의 연애 스타일 유형명 (예: "리드형", "배려형", "자유형").
- keywords: 스타일 키워드 3개.
- desc: 스타일 설명 2~3문장.

[partnerStyle 섹션 — 상대 연애 스타일]
- label: 상대의 연애 스타일 유형명.
- keywords: 스타일 키워드 3개.
- desc: 스타일 설명 2~3문장.

[styleGap 섹션 — 스타일 차이와 조율]
- desc: 두 사람 스타일 차이의 핵심 2~3문장.
- tips: 스타일 차이를 조율하는 방법 3~4개 (각 한 줄).`,

  8: `[strengths 섹션 — 빛(강점)]
items: 이 관계의 강점 2~3개.
각 item: title(강점 제목), desc(설명 2~3문장).

[shadows 섹션 — 그림자(갈등)]
items: 이 관계의 갈등 요소 2~3개.
각 item: title(갈등 제목), desc(설명 2~3문장).

[balance 섹션 — 균형 잡는 법]
- paragraphs 2개: ①빛과 그림자의 균형을 잡는 핵심 ②이 관계를 더 단단하게 만드는 구체적 방법. 각 단락 3~4문장.`,

  9: `[crisisPoints 섹션 — 위기 요소]
items: 이 관계에서 올 수 있는 위기 요소 2~3개.
각 item: title(위기 제목), desc(설명 2문장), tone("warn").

[overcomeTips 섹션 — 극복법]
items: 위기 극복 방법 3~4개.
각 item: title(극복법 제목), desc(구체적 방법 한 줄).

[crisisFlow 섹션 — 시기별 관계 흐름]
items: 4~5개 시기별 흐름.
각 item: label(시기, 예: "현재~2026", "2027~2028"), tone("good" | "warn"), text(그 시기 관계 기운 한 줄).
반드시 현재(2026년) 기준 향후 5~8년을 커버하오.`,

  10: `[marriagePossibility 섹션 — 결혼 가능성]
- score: 0~100 사이 정수 (결혼 가능성 점수).
- label: 점수에 맞는 한 줄 라벨 (예: "결혼으로 이어질 강한 인연", "조건이 맞으면 결혼 가능", "결혼보다 연애가 더 잘 맞는 인연").
- paragraphs 2개: ①두 사람 사주에서 결혼 가능성을 보여주는 근거 ②결혼으로 이어지기 위한 조건과 방향. 각 단락 3~4문장.

[marriageConditions 섹션 — 결혼의 조건]
items: 결혼으로 이어지기 위한 조건 2~3개.
각 item: title(조건 제목), desc(설명 한 줄).

[marriageTiming 섹션 — 결혼 시기]
- desc: 결혼하기 좋은 시기와 그 근거 2~3문장.`,

  11: `[goodPeriods 섹션 — 좋은 시기]
items: 두 사람이 함께하면 좋은 시기 3~4개.
각 item: label(시기, 예: "2026년 봄~여름", "2027년"), tone("good"), text(그 시기 특징 한 줄).

[cautionPeriods 섹션 — 조심할 시기]
items: 조심해야 할 시기 2~3개.
각 item: label(시기), tone("warn"), text(그 시기 주의점 한 줄).

[yearlyFlow 섹션 — 연간 흐름]
- desc: 두 사람 관계의 전체적인 연간 흐름 요약 2~3문장.`,

  12: `[letter 섹션 — 홍연의 서신]
연애궁합 풀이를 마치며 홍연이 두 사람에게 함께 쓰는 따뜻한 손편지.
- paragraphs: 4~5개 단락. 각 단락 3~4문장.
- 두 사람의 인연, 케미, 강점과 주의점을 아우르며 희망적인 메시지로 갈무리하시오.
- 두 사람을 각각 "그대"와 "그대의 인연"으로 지칭하며 함께 나아갈 방향으로 맺으시오.`,
};

// ── 장별 JSON 스키마 ──
const CH_SCHEMA: Record<number, string> = {
  1: `{
  "myWonguk": { "intro": "한 문장", "callout": "핵심 한 문장", "paragraphs": ["단락1(3~4문장)", "단락2", "단락3"] },
  "myNature": { "keywords": ["키워드1", "키워드2", "키워드3"], "desc": "기질 설명 2~3문장" },
  "myLovePattern": { "intro": "연애 패턴 핵심 한 줄", "paragraphs": ["단락1(3~4문장)", "단락2"] }
}`,
  2: `{
  "partnerWonguk": { "intro": "한 문장", "callout": "핵심 한 문장", "paragraphs": ["단락1(3~4문장)", "단락2", "단락3"] },
  "partnerNature": { "keywords": ["키워드1", "키워드2", "키워드3"], "desc": "기질 설명 2~3문장" },
  "partnerLovePattern": { "intro": "연애 패턴 핵심 한 줄", "paragraphs": ["단락1(3~4문장)", "단락2"] }
}`,
  3: `{
  "attractionReason": { "intro": "한 줄", "callout": "핵심 한 문장", "paragraphs": ["단락1(3~4문장)", "단락2"] },
  "firstImpression": { "mine": "내가 상대에게 받는 첫인상 한 줄", "partner": "상대가 나에게 받는 첫인상 한 줄" },
  "chemistryScore": { "score": 85, "label": "불꽃 같은 케미", "desc": "점수 근거 2~3문장" }
}`,
  4: `{
  "myView": { "intro": "한 줄", "callout": "핵심 한 문장", "paragraphs": ["단락1(3~4문장)", "단락2"] },
  "myExpectation": { "items": [{ "label": "기대 제목", "desc": "설명 한 줄" }] },
  "myWarning": { "desc": "주의점 2~3문장" }
}`,
  5: `{
  "partnerView": { "intro": "한 줄", "callout": "핵심 한 문장", "paragraphs": ["단락1(3~4문장)", "단락2"] },
  "partnerExpectation": { "items": [{ "label": "기대 제목", "desc": "설명 한 줄" }] },
  "partnerWarning": { "desc": "주의점 2~3문장" }
}`,
  6: `{
  "hapList": { "items": [{ "type": "천간합", "desc": "영향 한 줄", "strength": "강함" }] },
  "chungList": { "items": [{ "type": "자오충", "desc": "영향 한 줄", "strength": "보통" }] },
  "overallScore": { "score": 78, "label": "천생연분", "desc": "근거 2~3문장" }
}`,
  7: `{
  "myStyle": { "label": "리드형", "keywords": ["키워드1", "키워드2", "키워드3"], "desc": "설명 2~3문장" },
  "partnerStyle": { "label": "배려형", "keywords": ["키워드1", "키워드2", "키워드3"], "desc": "설명 2~3문장" },
  "styleGap": { "desc": "차이 설명 2~3문장", "tips": ["조율법1", "조율법2", "조율법3"] }
}`,
  8: `{
  "strengths": { "items": [{ "title": "강점 제목", "desc": "설명 2~3문장" }] },
  "shadows": { "items": [{ "title": "갈등 제목", "desc": "설명 2~3문장" }] },
  "balance": { "paragraphs": ["단락1(3~4문장)", "단락2"] }
}`,
  9: `{
  "crisisPoints": { "items": [{ "title": "위기 제목", "desc": "설명 2문장", "tone": "warn" }] },
  "overcomeTips": { "items": [{ "title": "극복법 제목", "desc": "방법 한 줄" }] },
  "crisisFlow": { "items": [{ "label": "현재~2026", "tone": "good", "text": "관계 기운 한 줄" }] }
}`,
  10: `{
  "marriagePossibility": { "score": 72, "label": "결혼으로 이어질 강한 인연", "paragraphs": ["단락1(3~4문장)", "단락2"] },
  "marriageConditions": { "items": [{ "title": "조건 제목", "desc": "설명 한 줄" }] },
  "marriageTiming": { "desc": "결혼 시기 2~3문장" }
}`,
  11: `{
  "goodPeriods": { "items": [{ "label": "2026년 봄~여름", "tone": "good", "text": "특징 한 줄" }] },
  "cautionPeriods": { "items": [{ "label": "2026년 겨울", "tone": "warn", "text": "주의점 한 줄" }] },
  "yearlyFlow": { "desc": "연간 흐름 요약 2~3문장" }
}`,
  12: `{
  "letter": { "paragraphs": ["단락1(3~4문장)", "단락2", "단락3", "단락4"] }
}`,
};

// ── 프롬프트 빌더 ──
export function buildYeonaeKunghapChapterPrompt(
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

  const user = `아래 두 사람의 명식을 바탕으로 연애궁합 결과지 풀이를 JSON으로 출력하시오.

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
