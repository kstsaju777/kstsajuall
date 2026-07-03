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
  4:  ["mySipseong", "myView", "myExpectation", "myWarning"],
  5:  ["partnerSipseong", "partnerView", "partnerExpectation", "partnerWarning"],
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
- singang: "신강" 또는 "신약" (신강·신약 판단 결과)
- dominantEl: 가장 강한 오행 한 글자 (예: "목", "화", "토", "금", "수")
- paragraphs 3개: ①일간 오행이 인생 전반에 새긴 기운과 타고난 에너지의 결 — 이 사람의 근본 성질과 삶을 대하는 방식을 깊고 풍부하게(6~8문장, 260자+) ②오행 균형 상태와 강한 기운·부족한 기운이 성격과 관계 방식에 어떻게 드러나는지(6~8문장, 260자+) ③신강·신약 판단 근거와 연애에서 고스란히 드러나는 본바탕 — 감정 처리 방식, 의존성, 자기 표현 방식까지(6~8문장, 260자+). 홍연 말투(~이오/~하오/~겠소) 사용.

[myNature 섹션 — 나의 기질]
- keywords: 본인을 대표하는 기질 키워드 4~5개 (예: "추진력", "감수성", "독립심", "직관력").
- strengthDesc: 이 기질의 강점을 3~5문장으로 풍부하게 서술. 어떤 상황에서 빛나는지, 연애에서 어떤 매력으로 작용하는지 구체적으로.
- shadowDesc: 이 기질의 그림자(주의점)를 3~5문장으로. 어떤 상황에서 어려움이 생기는지, 상대방 입장에서 어떻게 느껴질 수 있는지까지.

[myLovePattern 섹션 — 나의 연애 패턴]
- intro: 연애할 때 나타나는 핵심 패턴 한 줄 (매력적이고 인상적인 문장으로).
- patternType: 연애 유형명 (예: "리드형 연애인", "감성 수호자형", "자유로운 영혼형", "헌신적 동반자형").
- patternIcon: 유형에 맞는 이모지 1개.
- paragraphs 3개: ①감정 표현 방식과 사랑의 스타일 — 이 사람이 연애에서 보여주는 행동 패턴을 구체적으로(6~8문장, 250자+) ②연애에서 반복되는 패턴과 상대에게 기대하는 것(6~8문장, 250자+) ③연애에서 주의해야 할 점과 이 패턴을 인식했을 때 달라지는 것(5~7문장, 220자+). 홍연 말투 사용.`,

  2: `[partnerWonguk 섹션 — 상대 원국]
- intro: 상대의 일간 오행을 중심으로 "~한 사주로" 형식 한 문장 요약.
- callout: 상대의 신강·신약, 오행 균형 핵심 한 문장.
- singang: "신강" 또는 "신약" (상대의 신강·신약 판단 결과)
- dominantEl: 상대의 가장 강한 오행 한 글자 (예: "목", "화", "토", "금", "수")
- paragraphs 3개: ①상대의 일간 오행이 삶 전반에 새긴 기운과 타고난 에너지의 결 — 이 사람의 근본 성질과 삶을 대하는 방식을 깊고 풍부하게(6~8문장, 260자+) ②상대의 오행 균형 상태와 강한 기운·부족한 기운이 성격과 관계 방식에 어떻게 드러나는지(6~8문장, 260자+) ③상대의 신강·신약 판단 근거와 연애에서 고스란히 드러나는 본바탕 — 감정 처리 방식, 의존성, 자기 표현 방식까지(6~8문장, 260자+). 홍연 말투(~이오/~하오/~겠소) 사용.

[partnerNature 섹션 — 상대 기질]
- keywords: 상대를 대표하는 기질 키워드 4~5개.
- strengthDesc: 상대 기질의 강점을 3~5문장으로 풍부하게 서술. 어떤 상황에서 빛나는지, 연애에서 어떤 매력으로 작용하는지 구체적으로.
- shadowDesc: 상대 기질의 그림자(주의점)를 3~5문장으로. 어떤 상황에서 어려움이 생기는지, 내가 느낄 수 있는 어려움까지.

[partnerLovePattern 섹션 — 상대 연애 패턴]
- intro: 상대가 연애할 때 나타나는 핵심 패턴 한 줄 (매력적이고 인상적인 문장으로).
- patternType: 상대의 연애 유형명 (예: "리드형 연애인", "감성 수호자형", "자유로운 영혼형", "헌신적 동반자형").
- patternIcon: 유형에 맞는 이모지 1개.
- paragraphs 3개: ①상대의 감정 표현 방식과 사랑의 스타일 — 상대가 연애에서 보여주는 행동 패턴을 구체적으로(6~8문장, 250자+) ②상대가 연애에서 반복하는 패턴과 파트너에게 기대하는 것(6~8문장, 250자+) ③상대 연애에서 주의해야 할 점과 내가 이 패턴을 알았을 때 관계에서 달라지는 것(5~7문장, 220자+). 홍연 말투 사용.`,

  3: `[chemistryScore 섹션 — 케미 점수]
- score: 0~100 사이 정수. 두 사람 사주의 오행 상생·상극, 합충, 일간 관계를 종합하여 산출.
- label: 점수에 맞는 한 줄 라벨 (예: "불꽃 같은 케미", "깊이 공명하는 인연", "안정적인 조화", "성장이 필요한 인연").
- desc: 이 점수가 나온 사주적 근거를 4~5문장으로. 어떤 오행·십성의 만남이 이 점수를 만들었는지, 두 사람 기운의 상호작용을 구체적으로 설명. 홍연 말투.

[attractionReason 섹션 — 끌림의 이유]
- intro: 두 사람이 서로에게 끌리는 사주적 핵심 이유 한 줄.
- callout: 끌림을 만드는 가장 핵심적인 오행·십성 관계 한 문장.
- attractionKeywords: 이 끌림을 상징하는 키워드 3~4개 배열. 이모지+텍스트 형식 (예: "🔥불꽃 케미", "🌊깊은 공명", "💫운명적 끌림", "🌹달콤한 자석").
- paragraphs 4개: ①두 사람 사주 오행·십성에서 끌림을 만드는 구조적 이유 — 어떤 기운이 어떻게 맞물려 끌어당기는지 구체적으로(5~7문장, 220자+) ②첫 만남에서 서로 느끼는 분위기와 매력 — 상대를 처음 봤을 때 어떤 감각이 작동하는지(5~7문장, 220자+) ③상대의 어떤 면이 나를 특히 끌어당기는가 — 오행·십성으로 보이는 매력 포인트 상세(5~7문장, 220자+) ④이 끌림이 지속되는 조건과 주의해야 할 점 — 끌림이 관계로 이어지려면(4~6문장, 180자+). 홍연 말투.

[firstImpression 섹션 — 첫인상]
- mine: 내가 상대에게서 받는 첫인상 핵심 한 줄 (강렬하고 인상적으로).
- mineEmotion: 내가 상대를 처음 봤을 때 느끼는 감정 이모지 1개 (예: 😍 💫 🌹 🔥 💎 🌙).
- mineDesc: 내가 상대를 처음 만났을 때 느끼는 감정, 분위기, 눈길이 머무는 곳을 3~5문장으로 생생하게. 내 사주 기준으로 상대가 어떻게 감지되는지. 홍연 말투.
- partner: 상대가 나에게서 받는 첫인상 핵심 한 줄 (강렬하고 인상적으로).
- partnerEmotion: 상대가 나를 처음 봤을 때 느끼는 감정 이모지 1개.
- partnerDesc: 상대가 나를 처음 만났을 때 느끼는 감정, 분위기, 눈길이 머무는 곳을 3~5문장으로 생생하게. 상대 사주 기준으로 내가 어떻게 감지되는지. 홍연 말투.`,

  4: `[mySipseong 섹션 — 내 일간 기준 상대방 십성]
- sipseong: 내 일간을 기준으로 상대방 일간 천간이 어떤 십성인지 (예: "정관", "편재", "식신"). 사주 명식에서 직접 계산하여 정확히 기재.
- desc: 이 십성이 내 연애에서 어떤 의미를 갖는지, 상대가 내게 어떤 존재감으로 다가오는지 3~5문장으로. 이 십성을 가진 상대를 만나면 내 감정이 어떻게 반응하는지, 어떤 끌림이나 갈등이 생기는지 구체적으로. 홍연 말투.

[myView 섹션 — 내가 보는 상대]
- intro: 내 사주 기준 상대의 이미지 핵심 한 줄.
- callout: 상대가 내 사주에서 어떤 오행·십성 기운으로 작용하는지 핵심 한 문장.
- paragraphs 4개: ①내 일간 오행 기준으로 상대가 어떻게 감지되는지 — 내 눈에 비친 상대의 전체 이미지와 분위기(5~7문장, 220자+) ②상대가 내 감정에 주는 영향 — 함께 있을 때 내 기운이 어떻게 달라지는지, 어떤 감정을 자주 느끼는지(5~7문장, 220자+) ③내 일간 기준 상대와의 관계 역학 — 내가 주도하는지 이끌리는지, 서로 어떤 역할을 하게 되는지(5~7문장, 220자+) ④이 시각이 만드는 행동 패턴 — 내가 이 사람에게 무의식적으로 어떻게 행동하게 되는지, 어떤 점을 조심해야 하는지(4~6문장, 180자+). 홍연 말투.

[myExpectation 섹션 — 나의 기대]
- items 3~4개: 내가 이 사람에게 무의식적으로 기대하는 것.
  각 item: label(기대 제목, 5자 이내), icon(이모지 1개), desc(한 줄 핵심 설명), detailDesc(이 기대가 생기는 사주적 이유와 기대가 충족/미충족될 때 어떤 감정이 드는지 2~3문장).

[myWarning 섹션 — 나의 주의점]
- desc: 내가 이 관계에서 반드시 알아야 할 핵심 주의 메시지 3~4문장. 내 사주의 어떤 기운 때문에 이 패턴이 반복되는지 설명. 홍연 말투.
- warningItems 2~3개: 구체적인 주의 상황과 처방.
  각 item: trigger(주의가 필요한 구체적 상황), action(이 상황에서 이렇게 하면 좋겠소 — 처방 한 줄).`,

  5: `[partnerSipseong 섹션 — 상대 일간 기준 나의 십성]
- sipseong: 상대 일간을 기준으로 내 일간 천간이 어떤 십성인지. 사주 명식에서 직접 계산하여 정확히 기재.
- desc: 이 십성이 상대의 연애에서 어떤 의미를 갖는지, 내가 상대에게 어떤 존재감으로 다가가는지 3~5문장. 홍연 말투.

[partnerView 섹션 — 상대가 보는 나]
- intro: 상대 사주 기준으로 내가 어떻게 보이는지 핵심 한 줄.
- callout: 내가 상대 사주에서 어떤 오행·십성 기운으로 작용하는지 핵심 한 문장.
- paragraphs 4개: ①상대 일간 기준 내가 어떻게 감지되는지 — 상대 눈에 비친 나의 이미지(5~7문장, 220자+) ②내가 상대의 감정에 주는 영향(5~7문장, 220자+) ③상대 시각에서 본 관계 역학(5~7문장, 220자+) ④이 시각이 만드는 상대의 행동 패턴(4~6문장, 180자+). 홍연 말투.

[partnerExpectation 섹션 — 상대의 기대]
- items 3~4개: 상대가 나에게 무의식적으로 기대하는 것.
  각 item: label(기대 제목, 5자 이내), icon(이모지 1개), desc(한 줄 핵심 설명), detailDesc(사주적 이유와 감정 2~3문장).

[partnerWarning 섹션 — 상대의 주의점]
- desc: 상대가 이 관계에서 주의해야 할 핵심 메시지 3~4문장. 홍연 말투.
- warningItems 2~3개: { trigger: "주의 상황", action: "처방 한 줄" }.`,

  6: `[hapList 섹션 — 합 목록]
items 2~4개: 두 사람 사주에서 발견되는 합(合). 실제 명식에서 존재하는 합만 기재.
각 item:
- type: 합의 구체적 종류 (예: "갑기합", "을경합", "자축합", "인오술삼합", "해묘미삼합"). 가능한 한 정확한 천간합·지지합·삼합 이름으로.
- hapEl: 합화(合化) 결과 오행 (예: "토", "금", "화"). 합하여 어떤 오행이 되는지. 삼합의 경우 해당 국(局)의 오행.
- desc: 이 합이 두 사람 관계에서 어떤 의미인지 3~5문장. 두 사람이 이 자리에서 어떻게 통하는지, 어떤 감정·상황이 자연스럽게 생기는지 구체적으로. 홍연 말투.
- strength: "강함" | "보통" | "약함" (해당 합이 두 사주에서 차지하는 비중과 활성화 정도).
- effect: 이 합이 연애 상황에서 구체적으로 어떤 장면·감정을 만드는지 한 줄 (예: "함께 있으면 시간 가는 줄 모르고 자연스럽게 스며드오").

[chungList 섹션 — 충 목록]
items 0~3개: 두 사람 사주에서 발견되는 충(沖). 실제 명식에서 없으면 빈 배열 [].
각 item:
- type: 충의 구체적 종류 (예: "자오충", "묘유충", "인신충", "사해충").
- desc: 이 충이 두 사람 관계에서 어떤 의미인지 3~5문장. 어떤 상황에서 갈등이 생기는지, 그러나 동시에 어떤 에너지를 주는지 균형 있게. 홍연 말투.
- strength: "강함" | "보통" | "약함".
- effect: 이 충이 연애 상황에서 어떤 장면·감정을 만드는지 한 줄.
- overcome: 이 충을 다스리는 실질적 방법 한 줄 (홍연 말투).

[overallScore 섹션 — 종합 궁합 점수]
- score: 0~100 사이 정수. 합의 개수·강도와 충의 개수·강도를 종합하여 산출.
- label: 점수에 맞는 한 줄 라벨 (예: "천생연분", "빛나는 인연", "노력이 필요한 인연", "갈등이 많은 인연").
- hapSummary: 이 두 사람의 합(合) 전체를 한 줄로 요약 (예: "세 곳의 합이 두 사람을 자연스럽게 묶어주고 있소").
- chungSummary: 이 두 사람의 충(沖) 전체를 한 줄로 요약. 없으면 충 없음을 긍정적으로 (예: "충이 없어 직접적인 마찰이 적은 편이오").
- desc: 합·충을 종합한 궁합 분석을 4~5문장으로. 합과 충의 비율, 전체 관계 에너지, 이 점수가 나온 사주적 근거, 관계의 전체적인 방향성. 홍연 말투.`,

  7: `[myStyle 섹션 — 나의 연애 스타일]
- label: 나의 연애 스타일 유형명 (예: "주도적 리더형", "섬세한 배려형", "자유로운 모험가형", "헌신적 동반자형", "감성 탐구형"). 사주 일간 오행과 십성에서 도출.
- icon: 유형에 어울리는 이모지 1개 (예: 🔥 💧 🌿 ⚡ 🌙 🌹 💎).
- keywords: 이 스타일을 대표하는 키워드 4~5개.
- styleDesc: 이 스타일로 연애할 때 어떤 모습이 나타나는지 3~5문장. 연애에서 자주 하는 행동, 감정 표현 방식, 상대에게 주는 인상을 구체적으로. 홍연 말투.
- strengthStyle: 이 스타일이 연애에서 빛나는 순간과 강점 2~3문장. 어떤 상황에서 상대방에게 매력적으로 작용하는지.
- shadowStyle: 이 스타일로 인해 생길 수 있는 갈등·약점 2~3문장. 어떤 상황에서 문제가 되는지, 상대방이 느낄 수 있는 불편함.

[partnerStyle 섹션 — 상대 연애 스타일]
myStyle과 동일 구조. 상대방의 일간 오행·십성 기준.
- label, icon, keywords, styleDesc, strengthStyle, shadowStyle 동일하게 작성.

[styleGap 섹션 — 스타일 차이와 조율]
- compatRating: 두 스타일의 전체 상성 ("매우 잘 맞음" | "잘 맞음" | "보통" | "노력 필요").
- compatIcon: 상성을 나타내는 이모지 1개 (예: 💞 🌟 🤝 ⚡).
- paragraphs 4개: ①두 스타일의 핵심 차이 — 어디서 근본적으로 다른지(5~7문장, 220자+) ②이 차이로 인해 마찰이 생기는 구체적 상황 — 어떤 장면에서 갈등이 생기는지(5~7문장, 220자+) ③이 차이가 오히려 시너지가 될 때 — 서로 보완하고 성장하는 방식(5~7문장, 220자+) ④두 스타일이 조화를 이루는 핵심 방법 — 실질적 관계 조율법(4~6문장, 180자+). 홍연 말투.
- tips 4~5개: 두 스타일이 구체적으로 조화를 이루는 방법. 각 팁은 "~할 때 ~하면 좋겠소" 형식으로, 실생활 상황에 적용할 수 있게. 홍연 말투.
- synergy: 두 스타일이 최고로 잘 맞을 때 어떤 관계 그림이 펼쳐지는지 한 줄 (인상적이고 기대감을 주는 문장으로).`,

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
  "myWonguk": { "intro": "한 문장", "callout": "핵심 한 문장", "singang": "신강", "dominantEl": "목", "paragraphs": ["단락1(6~8문장 260자+)", "단락2(6~8문장 260자+)", "단락3(6~8문장 260자+)"] },
  "myNature": { "keywords": ["키워드1", "키워드2", "키워드3", "키워드4"], "strengthDesc": "강점 3~5문장", "shadowDesc": "그림자 3~5문장" },
  "myLovePattern": { "intro": "연애 패턴 핵심 한 줄", "patternType": "유형명", "patternIcon": "🌊", "paragraphs": ["단락1(6~8문장 250자+)", "단락2(6~8문장 250자+)", "단락3(5~7문장 220자+)"] }
}`,
  2: `{
  "partnerWonguk": { "intro": "한 문장", "callout": "핵심 한 문장", "singang": "신강", "dominantEl": "화", "paragraphs": ["단락1(6~8문장 260자+)", "단락2(6~8문장 260자+)", "단락3(6~8문장 260자+)"] },
  "partnerNature": { "keywords": ["키워드1", "키워드2", "키워드3", "키워드4"], "strengthDesc": "강점 3~5문장", "shadowDesc": "그림자 3~5문장" },
  "partnerLovePattern": { "intro": "연애 패턴 핵심 한 줄", "patternType": "유형명", "patternIcon": "🔥", "paragraphs": ["단락1(6~8문장 250자+)", "단락2(6~8문장 250자+)", "단락3(5~7문장 220자+)"] }
}`,
  3: `{
  "chemistryScore": { "score": 85, "label": "불꽃 같은 케미", "desc": "점수 근거와 오행·십성 상호작용 4~5문장" },
  "attractionReason": { "intro": "끌림 핵심 한 줄", "callout": "핵심 오행·십성 관계 한 문장", "attractionKeywords": ["🔥불꽃 케미", "🌊깊은 공명", "💫운명적 끌림"], "paragraphs": ["단락1 오행구조(5~7문장 220자+)", "단락2 분위기·매력(5~7문장 220자+)", "단락3 끌림 포인트(5~7문장 220자+)", "단락4 지속 조건(4~6문장 180자+)"] },
  "firstImpression": { "mine": "내가 상대에게 받는 첫인상 핵심 한 줄", "mineEmotion": "😍", "mineDesc": "내 시각으로 본 상대 첫인상 3~5문장", "partner": "상대가 나에게 받는 첫인상 핵심 한 줄", "partnerEmotion": "🌹", "partnerDesc": "상대 시각으로 본 나의 첫인상 3~5문장" }
}`,
  4: `{
  "mySipseong": { "sipseong": "정관", "desc": "이 십성의 연애 의미 3~5문장" },
  "myView": { "intro": "핵심 한 줄", "callout": "오행·십성 기운 핵심 한 문장", "paragraphs": ["단락1 이미지(5~7문장 220자+)", "단락2 감정 영향(5~7문장 220자+)", "단락3 관계 역학(5~7문장 220자+)", "단락4 행동 패턴(4~6문장 180자+)"] },
  "myExpectation": { "items": [{ "label": "기대 제목", "icon": "💫", "desc": "핵심 한 줄", "detailDesc": "사주적 이유와 감정 2~3문장" }, { "label": "기대 제목2", "icon": "🌱", "desc": "핵심 한 줄", "detailDesc": "2~3문장" }, { "label": "기대 제목3", "icon": "🔥", "desc": "핵심 한 줄", "detailDesc": "2~3문장" }] },
  "myWarning": { "desc": "핵심 주의 메시지 3~4문장", "warningItems": [{ "trigger": "주의 필요 상황", "action": "처방 한 줄" }, { "trigger": "주의 필요 상황2", "action": "처방2 한 줄" }] }
}`,
  5: `{
  "partnerSipseong": { "sipseong": "정재", "desc": "상대 기준 이 십성의 연애 의미 3~5문장" },
  "partnerView": { "intro": "핵심 한 줄", "callout": "오행·십성 기운 핵심 한 문장", "paragraphs": ["단락1(5~7문장 220자+)", "단락2(5~7문장 220자+)", "단락3(5~7문장 220자+)", "단락4(4~6문장 180자+)"] },
  "partnerExpectation": { "items": [{ "label": "기대 제목", "icon": "💫", "desc": "핵심 한 줄", "detailDesc": "2~3문장" }, { "label": "기대 제목2", "icon": "🌱", "desc": "핵심 한 줄", "detailDesc": "2~3문장" }] },
  "partnerWarning": { "desc": "핵심 주의 메시지 3~4문장", "warningItems": [{ "trigger": "주의 필요 상황", "action": "처방 한 줄" }, { "trigger": "주의 필요 상황2", "action": "처방2 한 줄" }] }
}`,
  6: `{
  "hapList": { "items": [{ "type": "갑기합", "hapEl": "토", "desc": "관계 영향 3~5문장", "strength": "강함", "effect": "연애 장면 한 줄" }, { "type": "자축합", "hapEl": "토", "desc": "관계 영향 3~5문장", "strength": "보통", "effect": "연애 장면 한 줄" }] },
  "chungList": { "items": [{ "type": "자오충", "desc": "관계 영향 3~5문장", "strength": "보통", "effect": "연애 장면 한 줄", "overcome": "충 다스리는 방법 한 줄" }] },
  "overallScore": { "score": 78, "label": "빛나는 인연", "hapSummary": "합 전체 요약 한 줄", "chungSummary": "충 전체 요약 한 줄", "desc": "합·충 종합 분석 4~5문장" }
}`,
  7: `{
  "myStyle": { "label": "주도적 리더형", "icon": "🔥", "keywords": ["키워드1", "키워드2", "키워드3", "키워드4"], "styleDesc": "스타일 설명 3~5문장", "strengthStyle": "강점 2~3문장", "shadowStyle": "약점 2~3문장" },
  "partnerStyle": { "label": "섬세한 배려형", "icon": "🌸", "keywords": ["키워드1", "키워드2", "키워드3", "키워드4"], "styleDesc": "스타일 설명 3~5문장", "strengthStyle": "강점 2~3문장", "shadowStyle": "약점 2~3문장" },
  "styleGap": { "compatRating": "잘 맞음", "compatIcon": "💞", "paragraphs": ["단락1 핵심 차이(220자+)", "단락2 마찰 상황(220자+)", "단락3 시너지(220자+)", "단락4 조화법(180자+)"], "tips": ["조율 팁1", "조율 팁2", "조율 팁3", "조율 팁4"], "synergy": "두 스타일 시너지 한 줄" }
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
