// =====================================================
// 이혼궁합 결과지 — 장별 풀이 프롬프트 & 구조
// =====================================================
// 두 사람(본인 + 상대방) 사주를 함께 풀이하는 이혼궁합 전용 파일.

import { SYSTEM } from "./report-prompts";

// ── 장별 필수 섹션 키 ──
export const EHON_KUNGHAP_CHAPTER_SECTIONS: Record<number, string[]> = {
  1:  ["myWonguk", "myNature", "myDivorcePattern"],
  2:  ["partnerWonguk", "partnerNature", "partnerDivorcePattern"],
  3:  ["divorceScore", "divorceReason"],
  4:  ["conflictStyle", "triggerPoints", "avoidanceTip"],
  5:  ["mainCauses", "deeperIssues", "rootCause"],
  6:  ["hapList", "chungList", "overallScore"],
  7:  ["propertyFlow", "childCustody", "settlementTips"],
  8:  ["emotionalWounds", "healingPath", "recoveryStyle"],
  9:  ["reconcileScore", "reconcileReason", "reconcileTips"],
  10: ["postDivorceFlow", "timingItems", "timingAdvice"],
  11: ["futureFlow", "newBeginning", "finalAdvice"],
  12: ["letter"],
};

// ── 장 완성 여부 확인 ──
export function isEhonKunghapChapterReady(
  content: Record<string, unknown> | null | undefined,
  chapter: number
): boolean {
  if (!content) return false;
  const keys = EHON_KUNGHAP_CHAPTER_SECTIONS[chapter] ?? [];
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
  1:  "[제1장 나의원국] 나의 사주 원국 — 이혼·갈등 관점에서 본 나의 기질과 결혼 패턴",
  2:  "[제2장 상대원국] 상대의 사주 원국 — 상대의 기질과 결혼·갈등 패턴",
  3:  "[제3장 이혼가능성] 두 사람, 이혼으로 흐를 수 있는 인연인가 — 이혼 가능성 점수(0~100)와 그 사주적 근거",
  4:  "[제4장 갈등패턴] 두 사람의 갈등 방식 — 어떻게 다투고, 어디서 막히는가",
  5:  "[제5장 이혼원인] 이혼의 주요 원인 — 표면적 갈등과 사주 깊은 곳에 숨은 근본 원인",
  6:  "[제6장 합충] 두 사주의 합·충 — 결혼 생활에서 어떤 기운이 충돌하는가",
  7:  "[제7장 재산·자녀] 이혼 후 재산과 자녀 — 재산 흐름과 자녀 양육 관점에서 본 사주",
  8:  "[제8장 정서회복] 정서적 상처와 회복 — 이혼이 두 사람에게 남기는 상처와 회복의 길",
  9:  "[제9장 화해가능성] 화해·재결합 가능성 — 이혼 후 다시 합칠 수 있는가",
  10: "[제10장 이혼후흐름] 이혼 후의 삶의 흐름 — 이혼 시기와 이후 삶의 방향",
  11: "[제11장 새출발] 새로운 출발 — 이 인연을 마무리한 뒤 두 사람 각자의 미래",
  12: "[마무리] 홍연의 서신 — 두 사람의 이혼 인연에 대한 홍연의 따뜻하고 솔직한 편지",
};

// ── 장별 추가 지시 ──
const CH_GUIDE: Record<number, string> = {
  1: `[myWonguk 섹션 — 나의 원국]
- intro: 본인의 일간 오행을 중심으로 "~한 사주로" 형식 한 문장 요약.
- callout: 신강·신약, 오행 균형 핵심 한 문장.
- paragraphs 3개: ①일간 오행과 타고난 기운 ②오행 균형과 성격적 특징 ③신강·신약 판단과 결혼·이혼에서 드러나는 본바탕. 각 단락 3~4문장.

[myNature 섹션 — 나의 기질]
- keywords: 본인을 대표하는 기질 키워드 3~4개.
- desc: 키워드를 아우르는 기질 설명 2~3문장.

[myDivorcePattern 섹션 — 나의 이혼·갈등 패턴]
- intro: 결혼·이혼에서 반복되는 나의 핵심 패턴 한 줄.
- paragraphs 2개: ①배우자와의 관계에서 나타나는 나의 갈등 성향 ②이혼으로 이어질 수 있는 나의 사주적 특징과 주의점. 각 단락 3~4문장.`,

  2: `[partnerWonguk 섹션 — 상대 원국]
- intro: 상대의 일간 오행을 중심으로 한 문장 요약.
- callout: 상대의 신강·신약, 오행 균형 핵심 한 문장.
- paragraphs 3개: ①상대의 일간 오행과 기운 ②상대의 성격적 특징 ③상대의 결혼·갈등 패턴. 각 단락 3~4문장.

[partnerNature 섹션 — 상대 기질]
- keywords: 상대를 대표하는 기질 키워드 3~4개.
- desc: 상대 기질 설명 2~3문장.

[partnerDivorcePattern 섹션 — 상대 이혼·갈등 패턴]
- intro: 상대가 결혼·이혼에서 보이는 핵심 패턴 한 줄.
- paragraphs 2개: ①상대가 배우자와의 관계에서 보이는 갈등 성향 ②상대의 이혼 가능성을 높이는 사주적 특징. 각 단락 3~4문장.`,

  3: `[divorceScore 섹션 — 이혼 가능성 점수]
- score: 0~100 사이 정수 (두 사람의 이혼 가능성 점수. 높을수록 이혼 가능성 높음).
- label: 점수에 맞는 한 줄 라벨 (예: "이혼으로 흐를 가능성이 높은 인연", "노력하면 유지할 수 있는 인연", "이혼보다 화해가 더 자연스러운 인연").
- paragraphs 2개: ①두 사람 사주에서 이혼 가능성을 보여주는 구조적 근거 ②이혼을 막거나 촉진하는 핵심 요소. 각 단락 3~4문장.

[divorceReason 섹션 — 이혼 인연의 근거]
- intro: 두 사람이 이혼 인연인지 사주적 핵심 한 줄.
- callout: 이혼 가능성을 가장 크게 좌우하는 사주 요소 한 문장.
- paragraphs 2개: ①두 사람 사주에서 발견되는 이혼 인연의 사주적 증거 ②이혼을 피하거나 현명하게 마무리하기 위한 방향. 각 단락 3~4문장.`,

  4: `[conflictStyle 섹션 — 갈등 방식]
- intro: 두 사람이 갈등할 때 나타나는 전체적인 패턴 한 줄.
- callout: 두 사람의 갈등을 가장 크게 키우는 요소 한 문장.
- paragraphs 2개: ①두 사람의 사주로 본 갈등 스타일의 차이 ②갈등이 반복되는 이유와 패턴. 각 단락 3~4문장.

[triggerPoints 섹션 — 주요 갈등 트리거]
- items: 두 사람 사이의 주요 갈등 유발 포인트 2~3개.
각 item: title(갈등 주제), desc(그 갈등이 사주에서 어디서 오는지 설명 한 줄).

[avoidanceTip 섹션 — 갈등 완화 팁]
- paragraphs 2개: ①갈등을 줄이기 위해 두 사람이 각각 노력해야 할 것 ②만약 이혼을 피하고 싶다면 가장 먼저 바꿔야 할 것. 각 단락 3~4문장.`,

  5: `[mainCauses 섹션 — 이혼 주요 원인]
- items: 이혼의 주요 원인 2~3개.
각 item: title(원인 제목), desc(설명 2~3문장).

[deeperIssues 섹션 — 숨은 갈등]
- items: 표면 뒤에 숨겨진 갈등 요소 2개.
각 item: title(숨은 갈등 제목), desc(설명 2~3문장).

[rootCause 섹션 — 근본 원인]
- desc: 두 사람의 이혼 갈등의 사주적 근본 원인 2~3문장.`,

  6: `[hapList 섹션 — 합 목록]
items: 두 사람 사주에서 발견되는 합(合) 2~4개.
각 item: type(합의 종류), desc(이 합이 결혼 생활에 미치는 영향 한 줄), strength("강함" | "보통" | "약함").

[chungList 섹션 — 충 목록]
items: 두 사람 사주에서 발견되는 충(沖) 0~3개. 없으면 빈 배열.
각 item: type(충의 종류), desc(결혼·갈등 생활에 미치는 영향 한 줄), strength("강함" | "보통" | "약함").

[overallScore 섹션 — 종합 궁합 점수]
- score: 0~100 사이 정수.
- label: 점수에 맞는 한 줄 라벨.
- desc: 점수의 근거와 의미 2~3문장.`,

  7: `[propertyFlow 섹션 — 재산 흐름]
- intro: 이혼 후 재산 흐름의 핵심 한 줄.
- paragraphs 2개: ①두 사람 사주에서 보이는 재산과 이혼 후 재물 흐름 ②재산 분할 과정에서 주의해야 할 사주적 특징. 각 단락 3~4문장.

[childCustody 섹션 — 자녀 양육]
- intro: 자녀 양육에서의 핵심 한 줄.
- paragraphs 2개: ①이혼 후 자녀와의 관계에서 각자의 사주가 보여주는 것 ②자녀를 위해 두 사람이 지켜야 할 것. 각 단락 3~4문장.

[settlementTips 섹션 — 정리 조언]
- tips: 이혼 후 재산·자녀 문제를 현명하게 정리하는 실천 방법 3~4개 (각 한 줄).`,

  8: `[emotionalWounds 섹션 — 정서적 상처]
- items: 이혼이 두 사람에게 남길 주요 정서적 상처 2~3개.
각 item: title(상처 제목), desc(설명 2~3문장).

[healingPath 섹션 — 회복의 길]
- paragraphs 2개: ①이혼 후 각자가 회복할 수 있는 사주적 자원과 강점 ②회복을 위해 가장 필요한 것. 각 단락 3~4문장.

[recoveryStyle 섹션 — 회복 스타일]
- desc: 두 사람이 각각 이혼 후 회복하는 방식의 차이 2~3문장.`,

  9: `[reconcileScore 섹션 — 화해 가능성 점수]
- score: 0~100 사이 정수 (이혼 후 재결합·화해 가능성 점수).
- label: 점수에 맞는 한 줄 라벨.
- paragraphs 2개: ①두 사람 사주에서 화해·재결합 가능성을 보여주는 요소 ②화해가 가능하다면 어떤 조건이 필요한가. 각 단락 3~4문장.

[reconcileReason 섹션 — 화해 근거]
- intro: 화해 가능성의 사주적 핵심 한 줄.
- callout: 화해를 가능하게 하거나 막는 가장 큰 요소 한 문장.

[reconcileTips 섹션 — 화해 조언]
- tips: 화해·재결합을 원한다면 해야 할 것 3~4개 (각 한 줄). 화해 가능성이 낮다면 "각자의 길을 가는 것이 지혜로운 선택" 방향의 조언으로 대체.`,

  10: `[postDivorceFlow 섹션 — 이혼 후 흐름]
items: 4~5개 시기별 이혼 후 삶의 흐름.
각 item: label(시기, 예: "이혼 직후", "2027~2028"), tone("good" | "warn"), text(그 시기 삶의 흐름 한 줄).
반드시 현재(2026년) 기준 향후 5년을 커버하오.

[timingItems 섹션 — 시기별 체크리스트]
- items: 이혼 과정에서 주의해야 할 시기별 포인트 3~4개.
각 item: label(시기), desc(그 시기 중요한 포인트 한 줄).

[timingAdvice 섹션 — 시기 조언]
- desc: 이혼 시기와 진행 방식에 대한 가장 중요한 조언 2~3문장.`,

  11: `[futureFlow 섹션 — 미래 흐름]
items: 4~5개 시기별 미래 흐름 (두 사람 각각의 새 출발).
각 item: label(시기), tone("good" | "warn"), text(그 시기 새 출발의 흐름 한 줄).

[newBeginning 섹션 — 새로운 출발]
- paragraphs 2개: ①이혼 후 각자가 새롭게 출발하는 방향과 사주적 기운 ②새 인연·새 삶을 시작하기 좋은 조건. 각 단락 3~4문장.

[finalAdvice 섹션 — 마지막 조언]
- desc: 두 사람 각자에게 건네는 가장 중요한 조언 2~3문장.`,

  12: `[letter 섹션 — 홍연의 서신]
이혼궁합 풀이를 마치며 홍연이 두 사람에게 쓰는 따뜻하고 솔직한 편지.
- paragraphs: 4~5개 단락. 각 단락 3~4문장.
- 두 사람의 갈등과 이별의 아픔을 인정하되, 각자의 새로운 출발을 응원하는 메시지로 마무리.
- 두 사람을 "그대"와 "그대의 반려였던 이"로 지칭하며, 이 인연에서 배운 것과 앞으로의 희망을 담으시오.`,
};

// ── 장별 JSON 스키마 ──
const CH_SCHEMA: Record<number, string> = {
  1: `{
  "myWonguk": { "intro": "한 문장", "callout": "핵심 한 문장", "paragraphs": ["단락1(3~4문장)", "단락2", "단락3"] },
  "myNature": { "keywords": ["키워드1", "키워드2", "키워드3"], "desc": "기질 설명 2~3문장" },
  "myDivorcePattern": { "intro": "이혼·갈등 패턴 핵심 한 줄", "paragraphs": ["단락1(3~4문장)", "단락2"] }
}`,
  2: `{
  "partnerWonguk": { "intro": "한 문장", "callout": "핵심 한 문장", "paragraphs": ["단락1(3~4문장)", "단락2", "단락3"] },
  "partnerNature": { "keywords": ["키워드1", "키워드2", "키워드3"], "desc": "기질 설명 2~3문장" },
  "partnerDivorcePattern": { "intro": "이혼·갈등 패턴 핵심 한 줄", "paragraphs": ["단락1(3~4문장)", "단락2"] }
}`,
  3: `{
  "divorceScore": { "score": 72, "label": "이혼으로 흐를 가능성이 있는 인연", "paragraphs": ["단락1(3~4문장)", "단락2"] },
  "divorceReason": { "intro": "한 줄", "callout": "핵심 한 문장", "paragraphs": ["단락1(3~4문장)", "단락2"] }
}`,
  4: `{
  "conflictStyle": { "intro": "한 줄", "callout": "핵심 한 문장", "paragraphs": ["단락1(3~4문장)", "단락2"] },
  "triggerPoints": { "items": [{ "title": "갈등 주제", "desc": "설명 한 줄" }] },
  "avoidanceTip": { "paragraphs": ["단락1(3~4문장)", "단락2"] }
}`,
  5: `{
  "mainCauses": { "items": [{ "title": "원인 제목", "desc": "설명 2~3문장" }] },
  "deeperIssues": { "items": [{ "title": "숨은 갈등 제목", "desc": "설명 2~3문장" }] },
  "rootCause": { "desc": "근본 원인 2~3문장" }
}`,
  6: `{
  "hapList": { "items": [{ "type": "천간합", "desc": "영향 한 줄", "strength": "강함" }] },
  "chungList": { "items": [{ "type": "자오충", "desc": "영향 한 줄", "strength": "보통" }] },
  "overallScore": { "score": 45, "label": "갈등이 많은 궁합", "desc": "근거 2~3문장" }
}`,
  7: `{
  "propertyFlow": { "intro": "한 줄", "paragraphs": ["단락1(3~4문장)", "단락2"] },
  "childCustody": { "intro": "한 줄", "paragraphs": ["단락1(3~4문장)", "단락2"] },
  "settlementTips": { "tips": ["조언1", "조언2", "조언3"] }
}`,
  8: `{
  "emotionalWounds": { "items": [{ "title": "상처 제목", "desc": "설명 2~3문장" }] },
  "healingPath": { "paragraphs": ["단락1(3~4문장)", "단락2"] },
  "recoveryStyle": { "desc": "회복 스타일 차이 2~3문장" }
}`,
  9: `{
  "reconcileScore": { "score": 35, "label": "재결합보다 각자의 길이 더 나은 인연", "paragraphs": ["단락1(3~4문장)", "단락2"] },
  "reconcileReason": { "intro": "한 줄", "callout": "핵심 한 문장" },
  "reconcileTips": { "tips": ["조언1", "조언2", "조언3"] }
}`,
  10: `{
  "postDivorceFlow": { "items": [{ "label": "이혼 직후", "tone": "warn", "text": "흐름 한 줄" }] },
  "timingItems": { "items": [{ "label": "2026년 하반기", "desc": "포인트 한 줄" }] },
  "timingAdvice": { "desc": "시기 조언 2~3문장" }
}`,
  11: `{
  "futureFlow": { "items": [{ "label": "2027~2028", "tone": "good", "text": "새 출발 흐름 한 줄" }] },
  "newBeginning": { "paragraphs": ["단락1(3~4문장)", "단락2"] },
  "finalAdvice": { "desc": "마지막 조언 2~3문장" }
}`,
  12: `{
  "letter": { "paragraphs": ["단락1(3~4문장)", "단락2", "단락3", "단락4"] }
}`,
};

// ── 장별 프롬프트 생성 ──
export function buildEhonKunghapChapterPrompt(
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
  const myLabel = input.name || "의뢰인";
  const partnerLabel = input.partnerName || "상대방";
  const myGenderLabel = input.gender === "female" ? "여자" : "남자";
  const partnerGenderLabel = input.partnerGender === "female" ? "여자" : "남자";

  const contextBlock = `
[의뢰인 정보]
이름: ${myLabel} (${myGenderLabel})
${input.manseryeokText}

[상대방 정보]
이름: ${partnerLabel} (${partnerGenderLabel})
${input.partnerManseryeokText}
`.trim();

  const theme = CH_THEME[chapter] ?? `[제${chapter}장]`;
  const guide = CH_GUIDE[chapter] ?? "";
  const schema = CH_SCHEMA[chapter] ?? "{}";

  const user = `
아래 두 사람의 사주팔자를 바탕으로 이혼궁합 결과지 ${chapter}장을 작성하시오.

${contextBlock}

[이번 장 주제]
${theme}

[섹션별 작성 지침]
${guide}

[출력 형식 — 반드시 아래 JSON 구조 그대로]
${schema}

규칙:
- 반드시 유효한 JSON만 출력하오. 주석·마크다운 금지.
- 모든 풀이는 홍연 말투(~이오/~하오/~했소/~겠소)로 작성하오.
- 의뢰인을 "${myLabel}"으로, 상대방을 "${partnerLabel}"으로 지칭하오.
- 이혼·갈등 주제이므로 솔직하되 따뜻하게 작성하오.
`.trim();

  return { system: SYSTEM, user };
}
