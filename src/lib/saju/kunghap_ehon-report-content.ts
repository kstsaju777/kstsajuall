// =====================================================
// 이혼궁합 결과지 — 장별 풀이 프롬프트 & 구조
// =====================================================
// 두 사람(본인 + 상대방) 사주를 함께 풀이하는 이혼궁합 전용 파일.

import { SYSTEM } from "./report-prompts";

// ── 장별 필수 섹션 키 ──
export const EHON_KUNGHAP_CHAPTER_SECTIONS: Record<number, string[]> = {
  1:  ["myWonguk", "myNature", "myDivorcePattern"],
  2:  ["partnerWonguk", "partnerNature", "partnerDivorcePattern"],
  3:  ["hapList", "chungList", "overallScore"],
  4:  ["divorceScore", "divorceReason", "conflictStyle"],
  5:  ["timingItems", "timingAdvice"],
  6:  ["propertyFlow", "childCustody"],
  7:  ["myFuture", "partnerFuture", "shiningPath"],
  8:  ["reconcileScore", "reconcileReason", "reconcileTips"],
  9:  ["newBeginning", "finalAdvice"],
  10: ["letter"],
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
    if ("paragraphs" in v) {
      const paras = v.paragraphs as unknown[];
      if (!Array.isArray(paras) || paras.length === 0) return false;
      // divorceScore는 4단락 이상 필요
      if (k === "divorceScore") return paras.length >= 4;
      return true;
    }
    if ("items"     in v) return Array.isArray(v.items)     && (v.items     as unknown[]).length > 0;
    if ("keywords"  in v) return Array.isArray(v.keywords)  && (v.keywords  as unknown[]).length > 0;
    if ("tips"      in v) return Array.isArray(v.tips)      && (v.tips      as unknown[]).length > 0;
    if ("score"     in v) return typeof v.score === "number";
    if ("label"     in v) return typeof v.label === "string" && (v.label as string).length > 0;
    if ("desc"      in v) return typeof v.desc  === "string" && (v.desc  as string).length > 0;
    if ("intro"     in v) return typeof v.intro === "string" && (v.intro as string).length > 0;
    if ("callout"       in v) return typeof v.callout       === "string" && (v.callout       as string).length > 0;
    if ("mySuitability" in v) return typeof v.mySuitability === "string" && (v.mySuitability as string).length > 0;
    if ("myFlow"        in v) return typeof v.myFlow        === "string" && (v.myFlow        as string).length > 0;
    if ("myDesc"        in v) return typeof v.myDesc        === "string" && (v.myDesc        as string).length > 0;
    if ("myLabel"       in v) return typeof v.myLabel       === "string" && (v.myLabel       as string).length > 0;
    return false;
  });
}

// ── 장별 주제 ──
const CH_THEME: Record<number, string> = {
  1:  "[제1장 나의원국] 나의 사주 원국 — 이혼·갈등 관점에서 본 나의 기질과 결혼 패턴",
  2:  "[제2장 상대원국] 상대의 사주 원국 — 상대의 기질과 결혼·갈등 패턴",
  3:  "[제3장 합충] 두 사주의 합·충 — 결혼 생활에서 어떤 기운이 충돌하는가",
  4:  "[제4장 이혼가능성·갈등·원인] 이 결혼은 왜 흔들리는가 — 이혼 가능성 점수(0~100), 두 사람의 갈등 방식과 트리거, 이혼 주요 원인과 홍연의 최종 판단",
  5:  "[제5장 이혼시기] 이혼하기 좋은 시기는 언제인가 — 이혼 시기와 이후 삶의 방향",
  6:  "[제6장 재산·자녀] 이혼 후 재산과 자녀 — 재산 흐름과 자녀 양육 관점에서 본 사주",
  7:  "[제7장 이혼후인생] 두 사람의 이혼 후 인생 — 이혼이 두 사람 각자의 사주에서 열어주는 새로운 운명의 흐름",
  8:  "[제8장 화해가능성] 화해·재결합 가능성 — 이혼 후 다시 합칠 수 있는가",
  9:  "[제9장 새출발] 새로운 출발 — 이 인연을 마무리한 뒤 두 사람 각자의 미래",
  10: "[마무리] 홍연의 서신 — 두 사람의 이혼 인연에 대한 홍연의 따뜻하고 솔직한 편지",
};

// ── 장별 추가 지시 ──
const CH_GUIDE: Record<number, string> = {
  1: `★ 필수 규칙 — 위반 시 전면 재작성:
1. 명식표에서 일간(일주 천간)을 직접 읽어 확인하오. 풀이 전체에서 이 일간 글자를 최소 2회 이상 직접 인용하오. (예: "을목(乙木) 일간", "을목의 기운" 등)
2. 십성 데이터에서 본인의 주요 십성을 확인하오. 풀이에 반드시 해당 십성명을 직접 인용하오. (예: "편관이 강한 사주", "정인이 뚜렷한 명식" 등)
3. 신강·신약 판단 결과를 그대로 인용하오. (예: "신강 사주", "신약 사주")
4. 명식에 없는 오행·십성·천간 언급 금지. 일반론 작성 금지.

[myWonguk 섹션 — 나의 원국]
- intro: 명식에서 읽은 실제 일간 글자(예: 을목, 병화 등)를 그대로 써서 "~한 사주로" 형식 한 문장 요약. 결혼 생활과 연결.
- callout: 신강·신약 판단 결과와 오행 균형이 결혼 관계에서 어떻게 드러나는지 핵심 한 문장. 실제 판단 결과를 인용.
- paragraphs 3개 (각 단락 반드시 6~8문장, 단락당 최소 150자 이상):
  ①일간 오행과 타고난 기운 — 실제 일간 글자와 오행을 직접 인용하여 본성과 에너지 방향을 깊이 있게 서술. 이 기운이 삶 전반과 배우자와의 관계에서 어떻게 발현되는지, 장점과 그림자 양면을 구체적으로. 6~8문장.
  ②오행 분포와 성격 특징 — 명식의 실제 강한 오행과 약한 오행을 구체적으로 인용. 이 불균형이 성격·대인관계·부부 갈등에 어떻게 드러나는지 생생하게 서술. 6~8문장.
  ③신강·신약과 결혼·이혼의 본바탕 — 실제 신강·신약 판단 결과를 인용. 이 기질이 배우자 관계에서 어떤 방식으로 나타나는지, 이혼 위기 상황에서 어떤 심리적 경향을 보이는지 구체적이고 풍부하게. 6~8문장.

[myNature 섹션 — 나의 기질]
- keywords: 명식의 실제 십성·일간에서 도출한 기질 키워드 3~4개 (갈등·관계 맥락 반영).
- strengthDesc: 이 기질의 긍정적인 면 — 배우자와의 관계에서 빛나는 강점. 3~4문장.
- shadowDesc: 갈등 상황에서 드러나는 그림자 — 이혼 위기를 부를 수 있는 성향. 구체적인 상황과 함께 서술. 3~4문장.

[myDivorcePattern 섹션 — 나의 이혼·갈등 패턴]
- patternType: 갈등·이혼에서 반복되는 나의 행동 패턴 유형 이름 (예: "감정 폭발형", "회피 단절형", "집착 통제형", "자기희생형"). 5자 이내.
- patternIcon: 패턴을 상징하는 이모지 1개.
- intro: 결혼·이혼에서 반복되는 나의 핵심 패턴 한 줄 (따옴표 없이). 실제 일간·십성에서 도출.
- paragraphs 3개 (홍연 말투):
  ①배우자와의 관계에서 나타나는 나의 감정 방식과 갈등 성향 — 어떤 상황에서 갈등이 폭발하는지, 배우자를 어떻게 대하는지 구체적 상황으로 서술. 실제 일간·십성·합충 근거 포함. 6~8문장, 250자 이상.
  ②결혼 생활에서 반복되는 나의 패턴과 배우자에게 주는 영향 — 이 패턴이 부부 사이에 어떤 균열을 만드는지, 상대는 어떻게 느끼는지 깊이 있게. 6~8문장, 250자 이상.
  ③이혼으로 이어질 수 있는 나의 사주적 특징과 주의점 — 이 패턴이 왜 이혼 위기를 만드는지, 인식하면 어떻게 달라질 수 있는지. 5~7문장, 220자 이상.`,

  2: `⚠️ 이 장은 [상대방 정보]의 명식을 분석하는 장이오. [상대방 정보]의 일간·오행·십성을 읽어 작성하오. [의뢰인 정보]의 명식은 참고하지 마오.
⚠️ 이 장에서 상대방을 지칭할 때는 반드시 __PT__ 토큰만 사용하오. __MY__는 의뢰인을 지칭할 때만 쓰오.

[partnerWonguk 섹션 — 상대 원국]
- intro: [상대방 정보] 명식에서 읽은 실제 일간 글자(예: 을목, 병화, 정화 등)를 그대로 써서 "~한 사주로" 형식 한 문장 요약. 이혼궁합 맥락이므로 결혼 생활과 연결.
- callout: 신강·신약, 오행 균형이 결혼 관계에서 어떻게 드러나는지 핵심 한 문장.
- paragraphs 3개:
  ①상대의 일간 오행과 타고난 기운 — 상대의 일간이 지닌 본성과 에너지 방향. 배우자와의 관계에서 이 기운이 어떻게 발현되는지 포함. 4~5문장.
  ②상대의 오행 분포와 성격 특징 — 강한 오행과 약한 오행이 상대의 성격과 대인관계에 미치는 영향. 부부 갈등과 연결. 4~5문장.
  ③상대의 신강·신약과 결혼·이혼의 본바탕 — 신강·신약 판단 결과가 배우자 관계에서 어떤 방식으로 나타나는지, 이혼 과정에서 어떤 심리적 경향을 보이는지. 4~5문장.

[partnerNature 섹션 — 상대 기질]
- keywords: 상대를 대표하는 기질 키워드 3~4개 (갈등·관계 맥락 반영).
- strengthDesc: 상대 기질의 긍정적인 면 — 배우자와의 관계에서 빛나는 강점 1~2문장.
- shadowDesc: 갈등 상황에서 상대에게 드러나는 그림자 — 이혼 위기를 부를 수 있는 성향 1~2문장.

[partnerDivorcePattern 섹션 — 상대 이혼·갈등 패턴]
- patternType: 갈등·이혼에서 반복되는 상대의 행동 패턴 유형 이름 (예: "감정 폭발형", "회피 단절형", "집착 통제형", "자기희생형"). 5자 이내.
- patternIcon: 패턴을 상징하는 이모지 1개.
- intro: 결혼·이혼에서 반복되는 상대의 핵심 패턴 한 줄 (따옴표 없이).
- callout: 이 패턴이 이혼으로 이어질 수 있는 가장 결정적인 사주적 특징 한 문장.
- paragraphs 2개:
  ①배우자와의 관계에서 나타나는 상대의 갈등 성향 — 어떤 상황에서 갈등이 폭발하는지, 배우자를 어떻게 대하는지 구체적으로. 4~5문장.
  ②이혼으로 이어질 수 있는 상대의 사주적 특징과 주의점 — 이 패턴이 왜 이혼 위기를 만드는지, 상대가 어떻게 하면 달라질 수 있는지. 4~5문장.`,

  4: `[divorceScore 섹션 — 이혼 가능성 점수]
- score: 0~100 사이 정수. 높을수록 이혼 가능성 높음. 70 이상은 "이혼 고위험", 45~69는 "갈등 위험 구간", 44 이하는 "관계 유지 가능".
- label: 점수에 맞는 한 줄 라벨. (예: "이혼으로 흐를 가능성이 높은 인연", "노력하면 유지할 수 있는 인연", "화해가 더 자연스러운 인연")
- paragraphs 4개: 각 단락 최소 7~9문장, 280자 이상.
  ①이 점수가 나온 사주적 근거 — 두 사람의 사주에서 합(合)의 수와 충(衝)·형(刑)·해(害) 등 긴장 관계의 수를 명시하고(제3장 합충 분석 결과와 반드시 일치시키오), 이 비율이 두 사람의 결혼 구조에 어떤 의미인지 풀이하시오. 개수 외의 구체적인 관계명을 임의로 지어내는 것 절대 금지. 점수 수치(숫자)는 언급하지 마시오.
  ②두 사람이 이 결혼을 지속하기 어려운 사주적 이유 — 충이 강한 인연은 서로에게 변화와 각성을 요구하는 인연임을 설명. 이 만남이 왜 '안정'보다 '갈등'으로 흐르기 쉬운지 깊이 서술. 인연 자체를 단정하지 말되, 구조적 어려움을 솔직하게 전달.
  ③이 결혼이 지금 흔들리는 큰 그림 — 갈등이 반복되는 구조를 먼저 솔직하게 인정. 그러나 이 구조를 인식하고 있는 것과 모르는 것의 차이를 언급. 이혼이 최선인 경우와 유지가 최선인 경우 각각의 현실을 균형 있게 서술.
  ④이 점수가 의미하는 것 / 두 사람에게 남은 선택지 — 지금 당장 가장 크게 작용하는 사주 요소, 이 상황에서 두 사람이 선택할 수 있는 방향, 어떤 조건이 갖춰지면 관계가 달라질 수 있는지를 구체적으로 제시.

⚠️ [서술 tone 규칙 — 반드시 준수]
생성한 score에 맞게 전체 풀이의 어조를 일치시키시오.
- 85점 이상: 매우 단호하고 냉철한 어조. 이 결혼 구조가 이혼으로 흐를 가능성이 매우 높음을 분명히 전달. 희망적 표현 최소화.
- 70~84점: 솔직하고 진지한 어조. 이혼 가능성이 높은 구조임을 명확히 하되, 인식과 선택에 따라 달라질 수 있음도 언급.
- 55~69점: 균형 잡힌 어조. 갈등 구조가 실재함을 인정하되 유지 가능성도 균형 있게 전달. 현실을 직시하게 하는 방향.
- 40~54점: 신중하고 부드러운 어조. 갈등은 있으나 이혼이 불가피하지 않음을 전달. 두 사람의 노력 여부가 결정적임을 강조.
- 39점 이하: 희망적이고 따뜻한 어조. 사주 구조상 이 결혼은 유지될 가능성이 더 높음을 전달. 현재 위기는 특정 시기의 영향일 수 있음을 언급.
⚠️ 생성한 score에 맞지 않는 어조로 서술하는 것 절대 금지.

[divorceReason 섹션 — 두 사람이 이혼하는 이유]
- intro: 두 사람의 이혼 인연을 사주 전체로 관통하는 핵심 한 줄.
- callout: 이혼 가능성을 가장 크게 좌우하는 사주 요소 한 문장. 구체적인 오행·합충 언급.
- items: 이혼 이유 4~5개. 표면적 원인부터 숨겨진 원인까지 층위를 달리하며 제시.
  각 item:
  - title: 이유 제목. 사주 용어(오행·천간·지지) 없이 누구나 바로 이해할 수 있는 일상 언어로. (예: "감정 표현 방식의 충돌", "통제와 자유의 싸움", "돈을 대하는 태도 차이", "신뢰가 무너지는 구조"). 12자 이내.
  - icon: 이모지 하나.
  - effect: 이 이유가 두 사람의 관계·삶에 미치는 핵심 영향 한 문장. 구체적이고 직관적으로.
  - desc: 이 이유가 두 사람 관계에서 어떻게 발현되는지 최소 5~7문장, 200자 이상. 어떤 오행·합충이 원인인지, 그것이 두 사람 사이에서 어떤 구체적인 상황·감정·반복 패턴으로 나타나는지 생생하게 서술. 이 원인이 쌓여 어떤 결말로 이어지는지도 포함.
  - type: "main"(핵심 원인) | "hidden"(숨겨진 원인)
- paragraphs 2개: 각 5~7문장, 200자 이상.
  ①이 원인들이 쌓여온 사주적 흐름 — 언제부터, 어떤 기운이 쌓였는지, 이것이 왜 이혼으로 이어지는지.
  ②원인을 안 지금, 두 사람이 할 수 있는 선택 — 이혼을 선택하든 유지를 선택하든 이 원인을 인식하는 것이 왜 중요한지.

[conflictStyle 섹션 — 두 사람의 갈등 방식]
- myStyle: 나의 갈등 방식.
  - type: 나의 갈등 스타일 유형명 (예: "감정 폭발형", "냉담 회피형", "집착 추궁형"). 7자 이내.
  - icon: 이모지 하나.
  - desc: 이 스타일이 부부 관계에서 어떻게 드러나는지 5~6문장, 180자 이상. 어떤 사주 기운에서 비롯되는지, 갈등 상황에서 구체적으로 어떤 말·행동·반응이 나오는지, 상대방에게 어떤 영향을 주는지까지 서술.
- partnerStyle: 상대의 갈등 방식.
  - type: 상대의 갈등 스타일 유형명. 7자 이내.
  - icon: 이모지 하나.
  - desc: 상대의 스타일이 부부 관계에서 어떻게 드러나는지 5~6문장, 180자 이상. 어떤 사주 기운에서 비롯되는지, 갈등 상황에서 구체적으로 어떤 말·행동·반응이 나오는지, 나에게 어떤 영향을 주는지까지 서술.
- intro: 두 사람의 갈등 방식이 어떻게 충돌하는지 핵심 한 줄.
- callout: 두 사람의 갈등을 가장 크게 키우는 사주 요소 한 문장.
- triggerItems: 두 사람 사이에서 반복적으로 갈등을 유발하는 트리거 3~4개.
  각 item:
  - title: 트리거 제목. 사주 용어 없이 누구나 이해할 수 있는 일상 언어로. (예: "돈을 대하는 태도 차이", "감정 표현 방식의 충돌", "가족의 간섭과 경계"). 14자 이내.
  - icon: 이모지 하나.
  - desc: 이 트리거가 사주에서 어디서 오는지, 실제 갈등 상황에서 어떻게 폭발하는지 최소 5~7문장, 200자 이상. 어떤 오행·합충이 원인인지, 두 사람이 이 상황에서 어떤 말과 행동을 하는지, 왜 반복되는지까지 구체적으로 서술. 뻔한 충고 금지.
  - intensity: "높음" | "보통" | "낮음"
- paragraphs 2개: 각 최소 7~9문장, 280자 이상. 뻔한 충고("이해하고 존중하라", "노력해야 한다")는 절대 금지. 구체적인 오행·합충 원인을 반드시 언급.
  ①두 사람의 갈등 스타일 차이가 실제 부부 생활에서 어떻게 충돌하는지 — 어떤 상황에서 갈등이 터지는지, 나는 어떻게 반응하고 상대는 어떻게 반응하는지, 왜 같은 싸움이 반복되는지, 이 패턴이 쌓이면 어떤 결과로 이어지는지. 두 사람의 사주 기운(오행·천간·합충)을 구체적으로 인용하여 원인을 풀어낼 것.
  ②이 갈등 구조가 사주에서 어디서 비롯되는지 — 표면의 싸움 뒤에 숨겨진 진짜 심리적·사주적 원인, 두 사람이 서로에게 반복적으로 상처를 주는 구조가 왜 형성되었는지, 이 구조를 이해하면 두 사람 사이에서 무엇이 달라질 수 있는지를 구체적으로 서술.`,

  3: `[hapList 섹션 — 합(合) 목록]
두 사람 사주에서 발견되는 합(合) 2~4개.
- intro: 이 장에서 합을 살피는 이유 한 문장 — 이혼 맥락에서 합이 갖는 의미(왜 헤어지기 어려운가).
- items: 각 합에 대해:
    · type: 합의 종류 (예: 甲己합, 자축합 등)
    · desc: 이 합이 두 사람 관계에 미치는 영향 3~4문장 — 이혼 과정에서 어떻게 발현되는지 구체적으로.
    · strength: "강함" | "보통" | "약함"
    · meaning: 이혼 맥락 태그 5자 이내 (예: "집착의 끈", "미련 유발", "감정 묶임", "재결합 유혹")
- paragraphs: 2개. 각 4~5문장.
    ①이 합들이 합쳐져 두 사람 사이에 형성하는 기운의 장(場) — 함께 있을 때와 떠나려 할 때 어떤 작용을 하는지.
    ②합의 기운이 이혼 결정을 미루게 만드는 구체적 상황과 홍연의 조언.

[chungList 섹션 — 충(沖) 목록]
두 사람 사주에서 발견되는 충(沖) 0~3개. 없으면 빈 배열.
- intro: 충을 살피는 이유 한 문장 — 충이 이혼 위기에서 갖는 의미(왜 함께 있기 힘든가).
- items: 각 충에 대해:
    · type: 충의 종류 (예: 자오충, 갑경충 등)
    · desc: 이 충이 두 사람 관계에서 발현되는 양상 3~4문장 — 어떤 상황에서 폭발하는지, 이혼 과정에서 어떤 갈등을 만드는지.
    · strength: "강함" | "보통" | "약함"
    · impact: 이혼 과정 영향 태그 6자 이내 (예: "감정 폭발", "분리 촉진", "재산 갈등", "자녀 문제")
- paragraphs: 2개. 각 4~5문장.
    ①이 충들이 두 사람 사이에 만드는 단절의 기운 — 이혼을 앞당기는 사주적 흐름.
    ②충의 기운을 알고 이혼 과정을 어떻게 다뤄야 하는지 홍연의 당부.

[overallScore 섹션 — 합충 종합 이혼 위험도]
- score: 0~100 사이 정수. 높을수록 이혼 위험도 높음.
- label: 점수에 맞는 한 줄 라벨 (예: "합보다 충이 압도적이오", "합충이 팽팽하오").
- callout: 합충 전체를 관통하는 핵심 한 문장.
- paragraphs: 2개. 각 4~5문장.
    ①합과 충이 동시에 존재할 때 두 사람 관계가 만들어내는 복잡한 역학 — 헤어지기도 어렵고 함께 있기도 힘든 구조.
    ②이 합충의 구도를 알고 이혼 결정을 내릴 때 참고해야 할 사주의 메시지.`,

  6: `[propertyFlow 섹션 — 재산 흐름]
이혼 후 두 사람의 사주 재산 기질과 흐름을 비교하고 분할 시 주의점을 제시.
⚠️ 프롬프트 상단 "[연도별 재물운 점수]" 블록의 score·tone을 반드시 참고하여 서술하오. 점수가 높은 시기(best/good)는 재물운이 강한 때, 낮은 시기(caution)는 조심할 때임. 점수 자체를 그대로 언급하지 말고, 흐름으로 자연스럽게 녹여서 서술하오.
- myFlow: 내 사주 재산 기질 키워드 5자 이내 (예: "확장형", "분산형", "축적형", "불안정형")
- myDesc: 내 사주 재물운 흐름을 반영한 3~4문장. 재물운이 강한 시기와 약한 시기를 구체적 연도로 언급하고, 이혼 후 재산을 어떻게 운용해야 유리한지 서술하오.
- partnerFlow: 상대방 사주 재산 기질 키워드 5자 이내
- partnerDesc: 상대방 사주 재물운 흐름을 반영한 3~4문장. 동일하게 구체적 연도 언급 포함.
- paragraphs: 3개. 각 4~5문장. 반드시 홍연 말투(~하오, ~이오, ~하시오)로 작성.
  ①두 사람의 재물운 흐름이 어떻게 다른지 — 같은 시기에 한쪽은 올라가고 한쪽은 내려가는 구간이 있는지, 그 차이가 이혼 협의·재산 분할에서 어느 쪽이 더 불리해지기 쉬운지.
  ②재물운이 낮은 시기에는 중요한 재산 결정을 피해야 하는 이유 — 판단력이 흐려지고 손해 보는 조건을 수락하기 쉬운 사주 기운의 흐름, 그리고 그 시기를 현명하게 버티는 방법.
  ③이혼 후 두 사람이 각자의 재물운 흐름에 맞춰 새 출발을 잘 하려면 어떤 시기에 어떤 결정을 내려야 하는지 홍연의 마지막 당부 — 감정이 아닌 사주의 흐름에 따른 결정의 중요성.

[childCustody 섹션 — 자녀 양육]
이혼 후 자녀 양육에서 두 사람의 사주 적성을 비교하고 자녀를 위한 당부를 제시.
⚠️ 자녀운은 반드시 시주(時柱) 천간·지지를 기준으로 분석하오. 시주의 십성이 자녀성(식상星 — 식신·상관)과 어떻게 연결되는지, 일간과의 관계에서 자녀와의 인연이 두텁거나 얕은지를 구체적으로 서술하오. 막연한 성향 묘사 금지 — 반드시 시주 간지와 십성 근거를 포함하오.
⚠️ 간지(천간·지지)를 언급할 때는 반드시 오행을 병기하오. 예: "신" → "신금", "임" → "임수", "자" → "자수", "인" → "인목". 한자 병기 금지. 오행 없이 간지만 단독으로 쓰는 것 금지.
⚠️ mySuitability·partnerSuitability 첫 문장 규칙:
  - 시주 데이터가 있는 경우: 반드시 "XXX님의 시주는 [천간][지지]으로, [천간십성]과 [지지십성]의 기운이오." 형식으로 시작하오. 예: "홍길동님의 시주는 갑신으로, 겁재와 정관의 기운이오." 시주 간지 자체는 천간+지지만 붙여 쓰오(오행 없이). 단, 이후 본문에서 천간·지지를 개별 언급할 때는 반드시 오행을 병기하오(갑목, 신금 등).
  - 시주 데이터가 없는 경우(시간모름): "XXX님의 시주를 알 수 없으나, 사주를 전반적으로 보면," 으로 시작하고, 나머지 사주 원국(년주·월주·일주)을 기반으로 자녀와의 인연과 양육 기질을 풀이하오.
- myLabel: 내 시주 기반 자녀 양육 특성 키워드 5자 이내 (예: "정서형", "규율형", "자유형", "헌신형")
- mySuitability: 7~9문장. ①첫 문장(위 규칙 준수) ②시주 천간 십성이 자녀성(식상)과 어떻게 연결되는지 ③시주 지지 십성이 자녀와의 관계에서 어떤 기운으로 작용하는지 ④자녀와의 정서적 유대가 두텁거나 얕은 이유를 구체적으로 ⑤이혼 후 자녀와의 갈등이 생길 수 있는 상황과 이유 ⑥자녀 양육에서 이 사람만의 강점 ⑦반드시 유의해야 할 점과 실천 당부. 각 문장은 20자 이상. 홍연 말투.
- partnerLabel: 상대방 시주 기반 자녀 양육 특성 키워드 5자 이내
- partnerSuitability: 7~9문장. 동일 구조 — 첫 문장 형식 동일하게 적용.

`,

  7: `[myFuture 섹션 — 이혼 후 나의 운명 흐름]
이혼 후 내 사주 흐름을 희망과 경계를 균형 있게 담아 솔직하게 풀이. 좋은 말만 나열하지 마오. 조심해야 할 기운도 반드시 짚어야 진짜 도움이 되오.
- keyword: 이혼 후 내 인생을 한 마디로 표현하는 키워드 5자 이내 (예: "홀로 서는 힘", "새 봄의 기운", "해방의 시작")
- desc: 10~13문장. 각 문장 20자 이상. 홍연 말투.
  ①이혼이 내 사주의 어떤 묶인 기운을 풀어주는지 — 원국 십성·오행 근거 포함
  ②이혼 후 비로소 열리는 새로운 가능성 (일·관계·자아 중 사주에서 실제로 강한 영역)
  ③연도별 인생 에너지 흐름 점수를 참고하여, 앞으로 몇 년간 에너지가 강한 시기와 약한 시기를 구체적으로 언급 — 재물·돈 언급 절대 금지, 인생 전반의 활력·추진력·기회로 표현
  ④이 시기에 조심해야 할 사주 기운이나 반복될 수 있는 패턴 — 경계의 말
  ⑤이혼 후 관계(새 인연·자녀·직업)에서 주의할 구체적인 상황
  ⑥이 시기를 어떻게 살아야 사주의 좋은 기운을 살리고 나쁜 기운을 피할 수 있는지 — 실용적 당부
  ⑦홍연의 마지막 말 — 솔직하되 따뜻하게.
⚠️ 대운 언급 금지. 연도별 흐름은 반드시 프롬프트 상단 "[연도별 인생 에너지 흐름 점수]" 확정값만 사용하오.

[partnerFuture 섹션 — 이혼 후 상대방의 운명 흐름]
상대방 사주에서 이혼 후 어떤 흐름이 펼쳐지는지를 동일한 구조로 풀이. 희망과 경계 균형 유지.
- keyword: 상대방의 이혼 후 인생 키워드 5자 이내
- desc: 10~13문장. 동일 구조 적용.

[shiningPath 섹션 — 각자가 빛나는 방향]
두 사람이 이혼 후 각자의 원국 십성·오행을 근거로 가장 잘 살 수 있는 삶의 방향을 2~3개 테마로 제시.
⚠️ 일반론 금지. 반드시 프롬프트 상단 "[원국 십성 확정값]"을 내부 참고 자료로 읽고 풀이에 반영하오. 단, 십성 이름(비견·겁재·식신 등)을 풀이 문장에 직접 쓰지 마오 — 그 십성이 실생활에서 어떻게 드러나는지를 자연스러운 삶의 언어로 표현하오. 예: "비견" → "독립심이 강하고 혼자 힘으로 성과를 만들어내는 기질", "식신" → "자신을 표현하고 창조하는 것에서 에너지를 얻는 성향". 막연한 격려("긍정적으로 나아가라", "노력하라") 금지.
- items: 각 item:
    · theme: 방향 테마 제목 5~8자 (예: "직업·성취", "관계·사랑", "내면·자아")
    · myPath: 이 테마에서 내가 나아가야 할 방향 3~4문장. 원국 십성을 내부 근거로 삼되 문장에는 쓰지 말고, 그 기운이 이 테마에서 어떤 강점과 주의점으로 나타나는지, 어떻게 살아야 잘 될지를 삶의 언어로 서술. 홍연 말투.
    · partnerPath: 이 테마에서 상대방이 나아가야 할 방향 3~4문장. 동일 구조.
- closing: 홍연의 마지막 한 마디 — 이혼이 끝이 아니라 새로운 운명의 시작임을 담은 한 문장.`,

  8: `[reconcileScore 섹션 — 재결합 가능성 점수 게이지]
0~100 사이 정수. 높을수록 재결합·화해 가능성이 높음.
- score: 0~100 사이 정수.
  · 0~30: 각자의 길이 맞는 인연
  · 31~60: 조건이 맞으면 화해 가능
  · 61~100: 재결합의 기운이 있는 인연
- label: 점수에 맞는 한 줄 라벨 (예: "각자의 길이 더 자연스러운 흐름이오", "조건이 충족되면 재결합도 가능하오").
- basis: 이 점수가 나온 사주적 핵심 근거 한 문장. 구체적이고 날카롭게.
- paragraphs: 2개. 각 4~5문장.
    ①두 사람 사주에서 화해·재결합 가능성을 높이는 기운과 그 한계 — 어느 부분이 변하면 달라질 수 있는지.
    ②화해를 선택하든 각자의 길을 가든, 이 점수가 말하는 사주적 메시지.

[reconcileReason 섹션 — 화해 가능 요소 vs 장벽]
화해를 가능하게 하는 사주 요소와 막는 요소를 대비하여 제시.
⚠️ 반드시 프롬프트 상단 "[합충 분류 확정값]" 블록의 관계를 근거로 작성하오. 확정값에 없는 관계를 임의로 만드는 것은 금지.
- enablers: 화해 가능 기운 확정값 목록에서 반드시 3개 항목 작성. 각 항목:
    · title: 해당 합충 관계를 8~12자 제목으로 (예: "천간합이 잇는 인연의 실", "육합의 생활 리듬 공명")
    · desc: 확정값의 meaning을 바탕으로 두 사람 관계에서 실제로 어떻게 작용하는지 4~5문장, 150자 이상. 구체적인 합충 이름 포함. 이 기운이 화해·재결합 과정에서 어떤 긍정적 흐름을 만드는지, 어떻게 활용할 수 있는지까지 서술.
  ※ 화해 가능 기운이 3개 미만이면: 부족한 수만큼 두 사람 원국의 오행 상생·용신 관계에서 추가 작성.
- barriers: 화해 장벽 기운 확정값 목록에서 반드시 3개 항목 작성. 각 항목:
    · title: 해당 합충 관계를 8~12자 제목으로 (예: "충이 만드는 방향의 충돌", "형의 반복 마찰")
    · desc: 확정값의 meaning을 바탕으로 두 사람 관계에서 어떻게 발현되는지 4~5문장, 150자 이상. 이 기운이 해소되지 않으면 어떻게 되는지, 화해를 어렵게 만드는 구체적 상황까지 서술.
  ※ 화해 장벽 기운이 3개 미만이면: 부족한 수만큼 두 사람 원국의 오행 상극·기신 관계에서 추가 작성.
- verdict: 이 두 사람의 화해 가능성에 대한 홍연의 최종 종합 판단 한 문장. 솔직하고 단호하게.
- callout: 화해를 원한다면 가장 먼저 해야 할 것 또는 각자의 길을 선택할 때의 핵심 당부 한 문장.
- paragraphs: 2개. 각 5~6문장. 위 enablers·barriers에서 서술한 내용을 총정리하는 단락이오.
    ①위에서 짚은 화해 가능 기운과 장벽 기운이 실제로 어떻게 맞부딪히는지 — 두 힘이 충돌할 때 관계가 어떤 방향으로 흐르는지, 화해가 가능하려면 어떤 조건이 필요한지 종합적으로 정리하오. 위 항목들을 다시 언급하되 새로운 시각으로 엮어내오.
    ②어떤 선택을 하든 두 사람이 기억해야 할 홍연의 당부 — 화해를 택하든 각자의 길을 가든, 이 합충 구조가 두 사람에게 주는 사주적 메시지로 마무리하오.

[reconcileTips 섹션 — 화해/각자의 길 조언]
점수에 맞는 방향으로 3개 조언. 점수 구간에 따라 type을 선택하오.
- items: 각 조언에 대해:
    · type: "화해"(61+) | "조건부화해"(31~60) | "각자의길"(0~30) — 점수 구간에 맞게 일관되게.
    · title: 조언 제목 8~14자. 사주 기운을 반영한 구체적 제목. 홍연 말투로 끝내오 (예: "충돌의 기운을 다스리오", "각자의 길을 두려워 마오", "이 기운을 잊지 마오"). "~하라", "~말라", "~마시오" 등 부자연스러운 표현 금지.
    · tip: 반드시 홍연 말투(~이오/~하오/~겠소/~했소)로 작성. 4~5문장, 180자 이상. 반드시 두 사람의 사주 합충·오행 기운을 근거로 서술하오. 일반론·자기계발식 표현 금지. 이 두 사람의 사주에서 나오는 구체적 상황과 실천 방향을 담으오.`,

  5: `[timingItems 섹션 — 연도별 이혼 에너지]
⚠️ score·tone·label은 프롬프트 상단 "[연도별 이혼 에너지 점수 — 서버 계산 확정값]" 블록의 값을 그대로 사용. 절대 변경·재계산 금지.
- intro: 연도별 흐름 전체를 한 단락으로 서술 (150자+).
- items: 확정값 블록의 연도 전부(10개)를 빠짐없이 항목으로 생성. 누락 금지. 각 item:
    · label: 확정값 블록의 label 그대로
    · score: 확정값 블록의 score 그대로 (변경 금지)
    · tone: 확정값 블록의 tone 그대로 (변경 금지)
    · heading: tone에 맞는 이혼 에너지 성격 한 마디 (예: "이혼 진행에 최적", "신중히 검토", "대기 권고")
    · desc: 반드시 6~7문장, 300자 이상.
      - 십성 이름은 직접 쓰지 마시오. 확정값 블록의 십성을 내부 참고 자료로만 사용하오.
      - 이 연도가 두 사람에게 왜 이혼하기 좋은(또는 나쁜) 시기인지를, 두 사람의 사주와 이 해의 사주 에너지를 근거로 자연스럽게 서술하오.
      - 나와 상대방 각각의 상황을 구체적으로 언급하오. (예: "{이름}님은 이 시기에 ~한 흐름이 오고, {상대이름}님은 ~한 기운이 강해지오.")
      - 각 연도마다 내용이 달라야 하오. 반복되는 문장 구조·표현 금지.
      - 이 시기에 실제로 해야 할 행동 또는 주의할 점으로 마무리 (홍연 말투).

[timingAdvice 섹션 — 이혼 준비 조언]
⚠️ 일반론 금지. 반드시 두 사람의 명식(일간·십성·오행·합충)에서 도출된 구체적 조언만 작성.
- callout: 이혼 준비 전체를 아우르는 핵심 메시지 한 문장.
- tips 4~5개: 이 두 사람의 사주 구조에서 나오는 실질적 조언. 각 item:
    · title: 조언 제목 (10자 이내)
    · desc: 5~6문장 (250자+). ①사주 근거 → ②실제 이혼 과정에서 어떻게 발현되는지 → ③구체적으로 무엇을 해야/하지 말아야 하는지 → ④실천했을 때와 하지 않았을 때의 차이 → ⑤홍연 말투로 마무리.
- paragraphs 3개 이상 (각 180자+):
  ①이혼 준비 과정에서 두 사람의 사주 구조가 만들 수 있는 현실적 긴장.
  ②그 긴장을 어떻게 풀어나가야 하는지 — 사주 근거와 함께 구체적 방향 제시.
  ③이혼이라는 과정을 넘을 때 각자가 가장 중요하게 붙들어야 할 한 가지.`,

  9: `[newBeginning 섹션 — 새 인연의 사주]
이 인연을 마무리한 뒤 두 사람 각자에게 찾아올 새 인연을 사주·대운·세운 흐름으로 조명하는 핵심 섹션.
차트에서 서버가 계산한 2026~2035 인연운 흐름이 이미 제공되므로, 풀이는 그 흐름을 사주적 근거로 뒷받침하오.

[나의 새 인연]
- myTiming: 새 인연이 본격적으로 열리는 시기 키워드 2~4단어. 사주 대운·세운 기반. (예: "2027년 가을", "이혼 후 18개월", "경인년 이후")
- myLoveKey: 나의 새 인연 성격을 가장 잘 표현하는 키워드 2~3단어. (예: "우연한 재회", "늦게 피는 꽃", "조용한 만남")
- myLove: 의뢰인의 새 인연 전반 흐름 6~8문장. 인연운이 언제 열리는지, 어떤 기운의 해에 인연이 강해지는지, 이 인연이 어떤 성격인지. 사주 일간·대운 기반으로 구체적이고 사실적으로. 홍연 말투(~이오/~하오/~겠소) 유지.
- myPersonType: 어떤 사람이 오는가 5~6문장. 의뢰인 일간 오행과 합이 잘 맞는 성향의 사람, 그 사람의 기질·특징·의뢰인과의 궁합. 사주 기반으로 구체적으로.
- myMeetHow: 어떤 방식으로 만나는가 3~4문장. 우연한 만남인지, 소개인지, 일이나 취미를 통해서인지 — 사주 식신·상관·관성 흐름 근거로.

[상대방의 새 인연]
- ptTiming: 상대방의 새 인연 시기 키워드 2~4단어.
- ptLoveKey: 상대방의 새 인연 키워드 2~3단어.
- partnerLove: 상대방의 새 인연 전반 흐름 6~8문장. 동일 구조.
- ptPersonType: 상대방에게 어떤 사람이 오는가 5~6문장.
- ptMeetHow: 상대방의 만남 방식 3~4문장.

[비교 풀이]
- paragraphs: 2개. 각 5~6문장. 홍연 말투 유지.
    ①두 사람의 인연운 흐름 비교 — 누가 먼저 새 인연을 만나는지, 각자의 인연운 절정 시기가 어떻게 다른지, 그 차이가 갖는 사주적 의미.
    ②이 이별이 두 사람에게 어떤 새 인연의 문을 여는지 — 상처가 아닌 새로운 시작으로 바라보는 홍연의 시선. 따뜻하고 서정적으로 마무리.

[finalAdvice 섹션 — 홍연의 마지막 조언]
이혼궁합 풀이를 마치며 홍연이 두 사람 각자에게 건네는 개별 메시지와 마지막 결어.
- myAdvice: 나에게 건네는 홍연의 마지막 말 6~8문장 — 앞으로의 길에서 가장 중요한 것들을 구체적이고 따뜻하게.
  홍연 말투(~이오/~하오/~겠소) 유지. 따뜻하되 구체적으로.
- partnerAdvice: 상대방에게 건네는 홍연의 마지막 말 6~8문장. 동일 말투.
- closing: 두 사람 모두에게 건네는 홍연의 마지막 결어 2~3문장.
  이 인연을 마무리하며 각자의 새 출발을 응원하는 문장. 서정적이고 품격 있게.
- paragraphs: 2개. 각 4~5문장.
    ①이 이혼궁합 풀이를 통해 두 사람이 무엇을 얻어가길 바라는지 — 홍연의 바람.
    ②사주는 운명이 아님을 상기시키며, 각자의 선택이 삶을 만든다는 마지막 당부.`,

  10: `[letter 섹션 — 홍연의 서신]
이혼궁합 풀이를 마치며 홍연이 두 사람에게 쓰는 따뜻하고 솔직한 편지.
- paragraphs: 6~7개 단락. 각 단락 반드시 8~12문장. 단락 하나에 최소 200자 이상.
- 단락 구성 흐름 (순서대로):
  ①이 인연을 처음 만났을 때로 거슬러 올라가며 — 두 사람이 왜 이어졌는지, 사주가 어떤 기운으로 이 만남을 불러왔는지 회고. 따뜻하고 서정적으로.
  ②이 관계에서 두 사람이 서로에게 준 것과 받은 것 — 갈등 속에서도 배운 것, 이 인연이 각자에게 남긴 흔적. 솔직하고 깊이 있게.
  ③이혼이라는 선택에 이른 경위 — 사주가 이 이별을 어떻게 가리키고 있는지, 그것이 실패가 아니라 흐름임을 설명. 위로와 납득을 함께.
  ④두 사람 각자에게 남기는 홍연의 당부 — 앞으로의 길에서 무엇을 놓치지 말아야 하는지. 구체적이고 사주 기반으로.
  ⑤새로운 출발을 응원하는 문장 — 이 이별이 끝이 아니라 각자의 새 장(章)이 시작됨을 알리며. 희망적이고 힘 있게.
  ⑥이 인연을 지켜본 홍연의 마음 — 두 사람 모두에 대한 연민과 애정, 그리고 마지막 인사. 서정적이고 품격 있게.
  (필요 시 ⑦추가 단락 — 사주 밖의 이야기, 이 인연이 우주적 흐름 속에서 갖는 의미 등 자유롭게.)
- 두 사람을 "그대"와 "그대의 반려였던 이"로 지칭. 이혼을 "이별"이나 "마무리"로 표현해도 무방.
- 홍연 말투(~이오/~하오/~겠소/~오) 유지. 문어체와 서정체를 오가며 편지 형식으로.
- 각 단락 사이 자연스러운 연결. 전체가 하나의 긴 편지처럼 읽혀야 함.`,
};

// ── 장별 JSON 스키마 ──
const CH_SCHEMA: Record<number, string> = {
  1: `{
  "myWonguk": {
    "intro": "일간 오행 중심 한 문장 요약",
    "callout": "신강·신약과 결혼 관계 핵심 한 문장",
    "paragraphs": ["단락1 — 일간 오행과 기운 (4~5문장)", "단락2 — 오행 분포와 성격 (4~5문장)", "단락3 — 신강·신약과 이혼 본바탕 (4~5문장)"]
  },
  "myNature": {
    "keywords": ["기질키워드1", "기질키워드2", "기질키워드3"],
    "strengthDesc": "이 기질의 긍정적 면 3~4문장",
    "shadowDesc": "갈등 상황에서 드러나는 그림자 3~4문장"
  },
  "myDivorcePattern": {
    "patternType": "패턴유형명(5자이내)",
    "patternIcon": "⚡",
    "intro": "핵심 갈등 패턴 한 줄",
    "callout": "이혼으로 이어지는 결정적 사주 특징 한 문장",
    "paragraphs": ["단락1 — 감정 방식과 갈등 성향 (6~8문장 250자+)", "단락2 — 반복 패턴과 배우자에게 주는 영향 (6~8문장 250자+)", "단락3 — 이혼 위험 요소와 주의점 (5~7문장 220자+)"]
  }
}`,
  2: `{
  "partnerWonguk": {
    "intro": "상대 일간 오행 중심 한 문장 요약",
    "callout": "상대 신강·신약과 결혼 관계 핵심 한 문장",
    "paragraphs": ["단락1 — 상대 일간 오행과 기운 (4~5문장)", "단락2 — 상대 오행 분포와 성격 (4~5문장)", "단락3 — 상대 신강·신약과 이혼 본바탕 (4~5문장)"]
  },
  "partnerNature": {
    "keywords": ["기질키워드1", "기질키워드2", "기질키워드3"],
    "strengthDesc": "상대 기질의 긍정적 면 1~2문장",
    "shadowDesc": "갈등 상황에서 상대에게 드러나는 그림자 1~2문장"
  },
  "partnerDivorcePattern": {
    "patternType": "패턴유형명(5자이내)",
    "patternIcon": "⚡",
    "intro": "상대의 핵심 갈등 패턴 한 줄",
    "callout": "이혼으로 이어지는 상대의 결정적 사주 특징 한 문장",
    "paragraphs": ["단락1 — 상대의 갈등 성향 (4~5문장)", "단락2 — 상대의 이혼 위험 요소와 주의점 (4~5문장)"]
  }
}`,
  4: `{
  "divorceScore": {
    "score": 72,
    "label": "이혼으로 흐를 가능성이 있는 인연",
    "paragraphs": ["단락1 — 이 점수가 나온 사주적 근거 (합충 수 명시, 7~9문장, 280자+)", "단락2 — 이혼으로 흐르기 쉬운 사주적 이유 (7~9문장, 280자+)", "단락3 — 이 결혼이 지금 흔들리는 큰 그림 (7~9문장, 280자+)", "단락4 — 두 사람에게 남은 선택지 (7~9문장, 280자+)"]
  },
  "divorceReason": {
    "intro": "두 사람의 이혼 인연을 관통하는 핵심 한 줄",
    "callout": "이혼 가능성 최대 요인 한 문장 (구체적 오행·합충 언급)",
    "items": [
      { "title": "이유 제목(10자이내)", "icon": "⚡", "effect": "이 원인이 두 사람 관계에 미치는 핵심 영향 한 문장", "desc": "사주 기운과 관계 영향 3~4문장", "type": "main" },
      { "title": "이유 제목(10자이내)", "icon": "🌀", "effect": "이 원인이 두 사람 관계에 미치는 핵심 영향 한 문장", "desc": "사주 기운과 관계 영향 3~4문장", "type": "main" },
      { "title": "이유 제목(10자이내)", "icon": "🔥", "effect": "이 원인이 두 사람 관계에 미치는 핵심 영향 한 문장", "desc": "사주 기운과 관계 영향 3~4문장", "type": "hidden" },
      { "title": "이유 제목(10자이내)", "icon": "💧", "effect": "이 원인이 두 사람 관계에 미치는 핵심 영향 한 문장", "desc": "사주 기운과 관계 영향 3~4문장", "type": "hidden" }
    ],
    "paragraphs": ["단락1 — 이 원인들이 쌓여온 사주적 흐름 (5~7문장, 200자+)", "단락2 — 원인을 안 지금 두 사람이 할 수 있는 선택 (5~7문장, 200자+)"]
  },
  "conflictStyle": {
    "myStyle":      { "type": "갈등 스타일 유형명(7자이내)", "icon": "😤", "desc": "이 스타일이 부부 관계에서 드러나는 방식 2~3문장" },
    "partnerStyle": { "type": "갈등 스타일 유형명(7자이내)", "icon": "🧊", "desc": "상대 스타일이 부부 관계에서 드러나는 방식 2~3문장" },
    "intro":    "두 갈등 방식이 충돌하는 핵심 한 줄",
    "callout":  "갈등을 가장 크게 키우는 사주 요소 한 문장",
    "triggerItems": [
      { "title": "트리거 제목(10자이내)", "icon": "💢", "desc": "사주 원인과 충돌 방식 3~4문장", "intensity": "높음" },
      { "title": "트리거 제목(10자이내)", "icon": "⚠️", "desc": "사주 원인과 충돌 방식 3~4문장", "intensity": "보통" },
      { "title": "트리거 제목(10자이내)", "icon": "🔔", "desc": "사주 원인과 충돌 방식 3~4문장", "intensity": "낮음" }
    ],
    "paragraphs": ["단락1 — 갈등 스타일 충돌과 트리거가 만드는 장면 (5~7문장, 200자+)", "단락2 — 이 갈등 구조의 사주적 뿌리와 숨겨진 진짜 원인 (5~7문장, 200자+)"]
  }
}`,
  3: `{
  "hapList": {
    "intro": "합을 살피는 이유 한 문장",
    "items": [
      { "type": "합의 종류", "desc": "영향 3~4문장", "strength": "강함", "meaning": "집착의 끈" }
    ],
    "paragraphs": ["단락1 4~5문장", "단락2 4~5문장"]
  },
  "chungList": {
    "intro": "충을 살피는 이유 한 문장",
    "items": [
      { "type": "충의 종류", "desc": "영향 3~4문장", "strength": "보통", "impact": "감정 폭발" }
    ],
    "paragraphs": ["단락1 4~5문장", "단락2 4~5문장"]
  },
  "overallScore": {
    "score": 65,
    "label": "합충이 팽팽하오",
    "callout": "핵심 한 문장",
    "paragraphs": ["단락1 4~5문장", "단락2 4~5문장"]
  }
}`,
  6: `{
  "propertyFlow": {
    "myFlow": "재산 기질 키워드",
    "myDesc": "내 사주 재산 흐름 2~3문장",
    "partnerFlow": "상대 재산 기질 키워드",
    "partnerDesc": "상대 사주 재산 흐름 2~3문장",
    "caution": "재산 분할 시 주의 한 문장",
    "paragraphs": ["단락1 4~5문장", "단락2 4~5문장"]
  },
  "childCustody": {
    "myLabel": "양육 적성 키워드",
    "mySuitability": "내 시주 기반 양육 적성 7~9문장",
    "partnerLabel": "상대 양육 적성 키워드",
    "partnerSuitability": "상대 시주 기반 양육 적성 7~9문장",
    "childAdvice": ""
  }
}`,
  7: `{
  "myFuture": {
    "keyword": "내 인생 키워드",
    "desc": "이혼 후 내 사주 운명 흐름 10~13문장 (희망·경계·당부 균형)"
  },
  "partnerFuture": {
    "keyword": "상대 인생 키워드",
    "desc": "이혼 후 상대 사주 운명 흐름 10~13문장 (희망·경계·당부 균형)"
  },
  "shiningPath": {
    "items": [
      { "theme": "직업·성취", "myPath": "내 방향 2~3문장", "partnerPath": "상대 방향 2~3문장" },
      { "theme": "관계·사랑", "myPath": "내 방향 2~3문장", "partnerPath": "상대 방향 2~3문장" },
      { "theme": "내면·자아", "myPath": "내 방향 2~3문장", "partnerPath": "상대 방향 2~3문장" }
    ],
    "closing": "홍연의 마지막 한 마디"
  }
}`,
  8: `{
  "reconcileScore": {
    "score": 35,
    "label": "각자의 길이 더 자연스러운 흐름이오",
    "basis": "점수 근거 한 문장",
    "paragraphs": ["단락1 4~5문장", "단락2 4~5문장"]
  },
  "reconcileReason": {
    "enablers": [
      { "title": "요소 제목", "desc": "왜 화해를 가능하게 하는지 2~3문장" },
      { "title": "요소 제목", "desc": "왜 화해를 가능하게 하는지 2~3문장" },
      { "title": "요소 제목", "desc": "왜 화해를 가능하게 하는지 2~3문장" }
    ],
    "barriers": [
      { "title": "요소 제목", "desc": "왜 화해를 막는지 2~3문장" },
      { "title": "요소 제목", "desc": "왜 화해를 막는지 2~3문장" },
      { "title": "요소 제목", "desc": "왜 화해를 막는지 2~3문장" }
    ],
    "verdict": "홍연의 최종 판단 한 문장",
    "callout": "핵심 당부 한 문장",
    "paragraphs": ["단락1 5~6문장", "단락2 5~6문장"]
  },
  "reconcileTips": {
    "items": [
      { "type": "각자의길", "title": "조언 제목 8~14자", "tip": "홍연 말투 4~5문장 180자+" },
      { "type": "각자의길", "title": "조언 제목 8~14자", "tip": "홍연 말투 4~5문장 180자+" },
      { "type": "각자의길", "title": "조언 제목 8~14자", "tip": "홍연 말투 4~5문장 180자+" }
    ]
  }
}`,
  5: `{
  "timingItems": {
    "intro": "연도별 이혼 에너지 흐름 개요 (150자+)",
    "items": [
      { "label": "2026년 丙午年", "score": 70, "tone": "good",   "heading": "이 시기의 성격", "desc": "사주 흐름 5~6문장 300자+" },
      { "label": "2027년 丁未年", "score": 90, "tone": "best",   "heading": "이 시기의 성격", "desc": "사주 흐름 5~6문장 300자+" },
      { "label": "2028년 戊申年", "score": 35, "tone": "caution","heading": "이 시기의 성격", "desc": "사주 흐름 5~6문장 300자+" },
      { "label": "2029년 己酉年", "score": 55, "tone": "normal", "heading": "이 시기의 성격", "desc": "사주 흐름 5~6문장 300자+" },
      { "label": "2030년 庚戌年", "score": 60, "tone": "normal", "heading": "이 시기의 성격", "desc": "사주 흐름 5~6문장 300자+" },
      { "label": "2031년 辛亥年", "score": 75, "tone": "good",   "heading": "이 시기의 성격", "desc": "사주 흐름 5~6문장 300자+" },
      { "label": "2032년 壬子年", "score": 50, "tone": "normal", "heading": "이 시기의 성격", "desc": "사주 흐름 5~6문장 300자+" },
      { "label": "2033년 癸丑年", "score": 40, "tone": "caution","heading": "이 시기의 성격", "desc": "사주 흐름 5~6문장 300자+" },
      { "label": "2034년 甲寅年", "score": 65, "tone": "good",   "heading": "이 시기의 성격", "desc": "사주 흐름 5~6문장 300자+" },
      { "label": "2035년 乙卯年", "score": 55, "tone": "normal", "heading": "이 시기의 성격", "desc": "사주 흐름 5~6문장 300자+" }
    ]
  },
  "timingAdvice": {
    "callout": "이혼 준비 핵심 메시지 한 문장",
    "tips": [
      { "title": "시기 선택", "desc": "조언 5~6문장 250자+" },
      { "title": "법적 준비", "desc": "조언 5~6문장 250자+" },
      { "title": "감정 정리", "desc": "조언 5~6문장 250자+" },
      { "title": "자녀·가족", "desc": "조언 5~6문장 250자+" }
    ],
    "paragraphs": ["단락1(이혼 준비 긴장, 180자+)", "단락2(풀어나가는 방향, 180자+)", "단락3(가장 중요한 한 가지, 180자+)"]
  }
}`,
  9: `{
  "newBeginning": {
    "myTiming": "2027년 가을",
    "myLoveKey": "조용한 재출발",
    "myLove": "나의 새 인연 흐름 4~5문장 — 인연운이 열리는 시기, 어떤 기운의 해에 강해지는지, 인연의 성격",
    "myPersonType": "어떤 사람이 오는가 3~4문장 — 사주 기반 성향·기질·나와의 궁합",
    "myMeetHow": "어떤 방식으로 만나는가 2~3문장",
    "ptTiming": "2028년 초",
    "ptLoveKey": "늦게 피는 꽃",
    "partnerLove": "상대방의 새 인연 흐름 4~5문장",
    "ptPersonType": "상대방에게 어떤 사람이 오는가 3~4문장",
    "ptMeetHow": "상대방의 만남 방식 2~3문장",
    "paragraphs": ["두 사람 인연운 흐름 비교 5~6문장", "이별이 새 인연의 문을 여는 의미 5~6문장"]
  },
  "finalAdvice": {
    "myAdvice": "나에게 건네는 홍연의 마지막 말 3~4문장",
    "partnerAdvice": "상대방에게 건네는 홍연의 마지막 말 3~4문장",
    "closing": "두 사람 모두에게 건네는 마지막 결어 2~3문장",
    "paragraphs": ["단락1 4~5문장", "단락2 4~5문장"]
  }
}`,
  10: `{
  "letter": { "paragraphs": ["단락1(8~12문장, 200자+)", "단락2(8~12문장)", "단락3(8~12문장)", "단락4(8~12문장)", "단락5(8~12문장)", "단락6(8~12문장)"] }
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
    ch3Summary?: Record<string, unknown>;
    timingScores?: Array<{ year: number; score: number; tone: string; label: string; myGanSip?: string; myJiSip?: string; ptGanSip?: string; ptJiSip?: string; myDaeunGanSip?: string; myDaeunJiSip?: string; ptDaeunGanSip?: string; ptDaeunJiSip?: string }>;
    wealthScores?: { my: Array<{ year: number; score: number; tone: string; label: string }>; pt: Array<{ year: number; score: number; tone: string; label: string }> };
    mySiju?: { gan: string; ganEl: string; ji: string; jiEl: string; sipTop: string; sipBot: string };
    partnerSiju?: { gan: string; ganEl: string; ji: string; jiEl: string; sipTop: string; sipBot: string };
    myProfile7?: { pillars: Array<{ pos: string; gan: string; ganEl: string; sipTop: string; ji: string; jiEl: string; sipBot: string }>; currentDaeun: { label: string; gz: string; sipTop: string; sipBot: string; yearStart: number } | null };
    partnerProfile7?: { pillars: Array<{ pos: string; gan: string; ganEl: string; sipTop: string; ji: string; jiEl: string; sipBot: string }>; currentDaeun: { label: string; gz: string; sipTop: string; sipBot: string; yearStart: number } | null };
    reconcileScore?: number;
    reconcileEnablers?: Array<{ kind: string; label: string; meaning: string }>;
    reconcileBarriers?: Array<{ kind: string; label: string; meaning: string }>;
  }
): { system: string; user: string } {
  const myLabel = input.name ? (input.name.length > 1 ? input.name.slice(1) : input.name) : "의뢰인";
  const partnerLabel = input.partnerName ? (input.partnerName.length > 1 ? input.partnerName.slice(1) : input.partnerName) : "상대방";
  const myGenderLabel = input.gender === "female" ? "여자" : "남자";
  const partnerGenderLabel = input.partnerGender === "female" ? "여자" : "남자";

  const ch3Block = chapter >= 4 && input.ch3Summary
    ? `\n\n[서버 확정 합충 계산 결과 — 이 수치를 그대로 사용하오. 임의로 변경하거나 재계산하는 것 절대 금지]
합(合) 총 ${input.ch3Summary.hapCount}개: ${(input.ch3Summary.hapList as string[]).join(", ") || "없음"}
긴장 관계(충·형·파·해 등) 총 ${input.ch3Summary.tensionCount}개: ${(input.ch3Summary.tensionList as string[]).join(", ") || "없음"}`
    : "";

  const formatPillar = (p: { pos: string; gan: string; ganEl: string; sipTop: string; ji: string; jiEl: string; sipBot: string }) =>
    `${p.pos}: ${p.gan}(${p.ganEl}) 천간십성=${p.sipTop} / ${p.ji}(${p.jiEl}) 지지십성=${p.sipBot}`;

  const profile7Block = chapter === 7 && (input.myProfile7 || input.partnerProfile7)
    ? `\n\n[원국 십성 확정값 — 절대 변경·재계산 금지. 이 데이터를 그대로 풀이에 활용하오]
나(${myLabel}) 원국:
${input.myProfile7?.pillars.map(formatPillar).join("\n") ?? "데이터 없음"}

상대방(${partnerLabel}) 원국:
${input.partnerProfile7?.pillars.map(formatPillar).join("\n") ?? "데이터 없음"}`
    : "";

  const flow7Block = chapter === 7 && input.wealthScores
    ? `\n\n[연도별 인생 에너지 흐름 점수 — 서버 계산 확정값. 절대 변경·재계산 금지]
⚠️ 이 점수는 재물운이 아니라 이혼 후 인생 전반의 에너지 강약을 나타내오. 재물·돈·십성 언급 금지. 점수가 높은 해는 활력·추진력·새로운 기회가 강한 시기, 낮은 해는 에너지가 약하고 조심해야 할 시기로 활용하오.
나(${myLabel}) 흐름:\n` +
      input.wealthScores.my.map(t => `  ${t.label}: score=${t.score}, tone="${t.tone}"`).join("\n") +
    `\n상대방(${partnerLabel}) 흐름:\n` +
      input.wealthScores.pt.map(t => `  ${t.label}: score=${t.score}, tone="${t.tone}"`).join("\n")
    : "";

  const sijuBlock = chapter === 6 && (input.mySiju || input.partnerSiju)
    ? `\n\n[시주(時柱) 확정값 — 서버 원본 데이터. 절대 변경·재계산 금지]
나(${myLabel}) 시주: ${input.mySiju ? `${input.mySiju.gan}${input.mySiju.ji} / 천간: ${input.mySiju.gan}(${input.mySiju.ganEl}) 십성=${input.mySiju.sipTop} / 지지: ${input.mySiju.ji}(${input.mySiju.jiEl}) 십성=${input.mySiju.sipBot}` : "데이터 없음"}
상대방(${partnerLabel}) 시주: ${input.partnerSiju ? `${input.partnerSiju.gan}${input.partnerSiju.ji} / 천간: ${input.partnerSiju.gan}(${input.partnerSiju.ganEl}) 십성=${input.partnerSiju.sipTop} / 지지: ${input.partnerSiju.ji}(${input.partnerSiju.jiEl}) 십성=${input.partnerSiju.sipBot}` : "데이터 없음"}`
    : "";

  const wealthBlock = chapter === 6 && input.wealthScores
    ? `\n\n[연도별 재물운 점수 — 서버 계산 확정값. score·tone·label 절대 변경·재계산 금지]
나(${input.name || "의뢰인"}) 재물운:\n` +
      input.wealthScores.my.map(t => `  ${t.label}: score=${t.score}, tone="${t.tone}"`).join("\n") +
    `\n상대방(${input.partnerName || "상대방"}) 재물운:\n` +
      input.wealthScores.pt.map(t => `  ${t.label}: score=${t.score}, tone="${t.tone}"`).join("\n")
    : "";

  const timingBlock = chapter === 5 && input.timingScores?.length
    ? `\n\n[연도별 이혼 에너지 점수 및 십성 — 서버 계산 확정값. score·tone·label·십성 절대 변경·재계산 금지]\n` +
      input.timingScores.map(t => {
        const sipLine = (t.myGanSip || t.myJiSip || t.ptGanSip || t.ptJiSip)
          ? ` | 나(세운): 천간→${t.myGanSip||"-"}/지지→${t.myJiSip||"-"}, 상대(세운): 천간→${t.ptGanSip||"-"}/지지→${t.ptJiSip||"-"}` +
            ((t.myDaeunGanSip || t.myDaeunJiSip) ? ` | 나(대운): 천간→${t.myDaeunGanSip||"-"}/지지→${t.myDaeunJiSip||"-"}` : "") +
            ((t.ptDaeunGanSip || t.ptDaeunJiSip) ? ` | 상대(대운): 천간→${t.ptDaeunGanSip||"-"}/지지→${t.ptDaeunJiSip||"-"}` : "")
          : "";
        return `  ${t.label}: score=${t.score}, tone="${t.tone}"${sipLine}`;
      }).join("\n")
    : "";

  const reconcileScoreBlock = chapter === 8 && input.reconcileScore !== undefined
    ? `\n\n[재결합·화해 가능성 점수 — 서버 계산 확정값. 절대 변경·재계산 금지]
reconcileScore.score 값은 반드시 ${input.reconcileScore} 으로 출력하오. 임의로 변경하는 것은 절대 금지.`
    : "";

  const reconcileRelBlock = chapter === 8 && (input.reconcileEnablers !== undefined || input.reconcileBarriers !== undefined)
    ? `\n\n[합충 분류 확정값 — 서버 계산. reconcileReason 작성 시 반드시 이 관계들을 enablers/barriers 근거로 활용하오]
⚠️ enablers는 아래 "화해 가능 기운"에서, barriers는 "화해 장벽 기운"에서 각각 3개씩 선택하여 작성하오. 아래 목록에 없는 관계를 임의로 만들어내는 것은 금지.

[화해 가능 기운 — enablers 근거]
${input.reconcileEnablers && input.reconcileEnablers.length > 0
  ? input.reconcileEnablers.map(r => `· ${r.label}(${r.kind}): ${r.meaning}`).join("\n")
  : "· 두 사람 사이에 합(合) 관계 없음. enablers는 사주 원국의 오행 상생·용신 관계를 근거로 작성하오."}

[화해 장벽 기운 — barriers 근거]
${input.reconcileBarriers && input.reconcileBarriers.length > 0
  ? input.reconcileBarriers.map(r => `· ${r.label}(${r.kind}): ${r.meaning}`).join("\n")
  : "· 두 사람 사이에 충·형·파·해 관계 없음. barriers는 사주 원국의 오행 상극·기신 관계를 근거로 작성하오."}`
    : "";

  const honorificBlock = `\n\n[호칭 토큰 규칙 — 반드시 준수]
풀이 본문에서 이름을 쓸 때 아래 토큰만 사용하오. 절대 실제 이름을 직접 쓰지 마오.
  의뢰인 → __MY__ 사용
  상대방 → __PT__ 사용

토큰 뒤 조사는 반드시 아래 중 하나만 사용하오 (님 받침 ㅁ 기준):
  __MY__은  __MY__이  __MY__을  __MY__과  __MY__에게  __MY__으로  __MY__의  __MY__이라
  __PT__은  __PT__이  __PT__을  __PT__과  __PT__에게  __PT__으로  __PT__의  __PT__이라

예시: "__MY__은 이혼 후 새로운 인연을 만날 것이오. __PT__과의 관계는..."
⚠️ 계절 단어("봄" "여름" "가을" "겨울")는 절대 변형 금지.
⚠️ 한국어 합성어의 글자를 절대 변형하지 마오. 조사 규칙(와/과, 이/가)을 단어 내부에 적용하면 절대 안 되오. 예: "효과적"을 "효와적"으로, "결과"를 "결와"로 쓰지 마오. 단어 자체의 철자는 그대로 유지하오.`;

  const contextBlock = `
[의뢰인 정보]
이름: ${myLabel} (${myGenderLabel})
${input.manseryeokText}

[상대방 정보]
이름: ${partnerLabel} (${partnerGenderLabel})
${input.partnerManseryeokText}${honorificBlock}${ch3Block}${profile7Block}${flow7Block}${sijuBlock}${wealthBlock}${timingBlock}${reconcileScoreBlock}${reconcileRelBlock}
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
- 의뢰인을 "${myLabel}님"으로, 상대방을 "${partnerLabel}님"으로 지칭하오. 이름 뒤에 반드시 "님"을 붙이오.
- 풀이 본문에서 "나의" "나는" "나에게" 같은 1인칭 표현 대신 반드시 "${myLabel}님의" "${myLabel}님은" "${myLabel}님에게"로 쓰오.
- 긴 본문 필드(myLove·myPersonType·myMeetHow·partnerLove·ptPersonType·ptMeetHow·paragraphs)는 문단 구분이 필요한 지점마다 \\n\\n을 삽입하오.
- 이혼·갈등 주제이므로 솔직하되 따뜻하게 작성하오.
`.trim();

  return { system: SYSTEM, user };
}

