// =====================================================
// 연애궁합 결과지 — 장별 풀이 프롬프트 & 구조
// =====================================================
// 두 사람(본인 + 상대방) 사주를 함께 풀이하는 궁합 전용 파일.
// 홍연 화자 SYSTEM은 report-prompts.ts에서 공유.

import { SYSTEM } from "./report-prompts";
import { sipseongOfStem, sipseongOfBranch } from "./sipseong-calc";

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
  11: ["letter"],
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
  11: "[마무리] 홍연의 서신 — 두 사람의 인연에 대한 따뜻한 손편지로 결과지를 맺는 글",
};

// ── 장별 추가 지시 ──
const CH_GUIDE: Record<number, string> = {
  1: `[myWonguk 섹션 — 나의 원국]
⚠️ 반드시 위 【본인】 만세력 텍스트에서 다음 항목을 직접 읽어 풀이에 반영하시오:
  - 일간(日干): 사주팔자는 년주·월주·일주·시주 순서로 나열되오. 반드시 세 번째 기둥(일주)의 천간이 일간이오. 년주·월주·시주의 천간과 혼동하지 마시오.
  - 오행 분포: 8글자(천간 4자 + 지지 4자) 전체에서 각 글자의 오행을 아래 기준으로 변환한 뒤, 목·화·토·금·수 각각의 정확한 개수를 세시오.
    천간: 甲乙=목, 丙丁=화, 戊己=토, 庚辛=금, 壬癸=수
    지지: 寅卯=목, 巳午=화, 辰戌丑未=토, 申酉=금, 亥子=수
    반드시 8글자를 하나씩 확인하여 집계하시오. 틀린 개수를 풀이에 쓰는 것은 절대 금지.
  - 신강·신약: 일간을 생조하는 글자(비겁+인성)가 4개 이상이면 신강, 그 미만이면 신약으로 판단하시오.
  - 이 구체적 데이터를 근거로 intro·callout·singang·dominantEl·paragraphs를 작성하시오. 데이터와 다른 해석 금지.

- intro: 위에서 읽은 일간 오행을 명시하며 "~한 사주로" 형식 한 문장 요약.
- callout: 실제 오행 분포와 신강·신약 판단 근거를 담은 핵심 한 문장.
- singang: "신강" 또는 "신약" (만세력 데이터 기반 판단)
- dominantEl: 8글자에서 가장 많은 오행 한 글자 (예: "목", "화", "토", "금", "수")
- paragraphs 3개: ①위에서 확인한 일간 오행(반드시 실제 일간 글자 언급)이 인생 전반에 새긴 기운과 타고난 에너지의 결 — 이 사람의 근본 성질과 삶을 대하는 방식을 깊고 풍부하게(6~8문장, 260자+) ②실제 오행 분포 숫자를 근거로 강한 기운·부족한 기운이 성격과 관계 방식에 어떻게 드러나는지(6~8문장, 260자+) ③신강·신약 판단 근거(비겁·인성 개수 등 실제 데이터)와 연애에서 고스란히 드러나는 본바탕 — 감정 처리 방식, 의존성, 자기 표현 방식까지(6~8문장, 260자+). 홍연 말투(~이오/~하오/~겠소) 사용.

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
⚠️ 반드시 위 【상대방】 만세력 텍스트에서 다음 항목을 직접 읽어 풀이에 반영하시오:
  - 일간(日干): 사주팔자는 년주·월주·일주·시주 순서로 나열되오. 반드시 세 번째 기둥(일주)의 천간이 일간이오. 년주·월주·시주의 천간과 혼동하지 마시오.
  - 오행 분포: 상대방 8글자(천간 4자 + 지지 4자) 전체에서 각 글자의 오행을 아래 기준으로 변환한 뒤, 목·화·토·금·수 각각의 정확한 개수를 세시오.
    천간: 甲乙=목, 丙丁=화, 戊己=토, 庚辛=금, 壬癸=수
    지지: 寅卯=목, 巳午=화, 辰戌丑未=토, 申酉=금, 亥子=수
    반드시 8글자를 하나씩 확인하여 집계하시오. 틀린 개수를 풀이에 쓰는 것은 절대 금지.
  - 신강·신약: 상대방의 일간을 생조하는 글자(비겁+인성) 수로 판단하시오.
  - 이 구체적 데이터를 근거로 작성하시오. 데이터와 다른 해석 금지.

- intro: 위에서 읽은 상대의 일간 오행을 명시하며 "~한 사주로" 형식 한 문장 요약.
- callout: 상대의 실제 오행 분포와 신강·신약 판단 근거를 담은 핵심 한 문장.
- singang: "신강" 또는 "신약" (만세력 데이터 기반 판단)
- dominantEl: 상대 8글자에서 가장 많은 오행 한 글자 (예: "목", "화", "토", "금", "수")
- paragraphs 3개: ①위에서 확인한 상대의 일간 오행(반드시 실제 일간 글자 언급)이 삶 전반에 새긴 기운과 타고난 에너지의 결 — 이 사람의 근본 성질과 삶을 대하는 방식을 깊고 풍부하게(6~8문장, 260자+) ②상대의 실제 오행 분포 숫자를 근거로 강한 기운·부족한 기운이 성격과 관계 방식에 어떻게 드러나는지(6~8문장, 260자+) ③상대의 신강·신약 판단 근거(비겁·인성 개수 등 실제 데이터)와 연애에서 고스란히 드러나는 본바탕 — 감정 처리 방식, 의존성, 자기 표현 방식까지(6~8문장, 260자+). 홍연 말투(~이오/~하오/~겠소) 사용.

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
- desc: 이 점수가 나온 사주적 근거를 12~15문장(500자 이상)으로 풍부하게. 어떤 오행·십성의 만남이 이 점수를 만들었는지, 두 사람 기운의 상호작용을 구체적으로 설명. 두 사람을 반드시 이름+님(성씨 제외 이름+님)으로 직접 지칭하여 서술. 홍연 말투.

[attractionReason 섹션 — 끌림의 이유]
- intro: 두 사람이 서로에게 끌리는 사주적 핵심 이유 한 줄.
- callout: 끌림을 만드는 가장 핵심적인 오행·십성 관계 한 문장.
- attractionKeywords: 이 끌림을 상징하는 키워드 3~4개 배열. 이모지+텍스트 형식 (예: "🔥불꽃 케미", "🌊깊은 공명", "💫운명적 끌림", "🌹달콤한 자석").
- paragraphs 4개: ①두 사람 사주 오행·십성에서 끌림을 만드는 구조적 이유 — 어떤 기운이 어떻게 맞물려 끌어당기는지 구체적으로(10~13문장, 450자+) ②첫 만남에서 서로 느끼는 분위기와 매력 — 상대를 처음 봤을 때 어떤 감각이 작동하는지(10~13문장, 450자+) ③상대의 어떤 면이 나를 특히 끌어당기는가 — 오행·십성으로 보이는 매력 포인트 상세(10~13문장, 450자+) ④이 끌림이 지속되는 조건과 주의해야 할 점 — 끌림이 관계로 이어지려면(8~10문장, 350자+). 두 사람을 이름+님으로 직접 지칭. 홍연 말투.

[firstImpression 섹션 — 첫인상]
- mine: 내가 상대에게서 받는 첫인상 핵심 한 줄 (강렬하고 인상적으로).
- mineEmotion: 내가 상대를 처음 봤을 때 느끼는 감정 이모지 1개 (예: 😍 💫 🌹 🔥 💎 🌙).
- mineDesc: 선우님이 공주님을 처음 보았을 때 어떤 인상을 받았을지를 40~50문장(1800자 이상)으로 풍부하게 서술. 반드시 제3자 시점으로, 홍연이 두 사람을 바라보며 이야기하듯 서술하시오. 예) "선우님은 공주님을 처음 보았을 때 ~한 기운을 느꼈을 것이오." 절대 금지: "나는", "나에게", "내 마음", "그녀는 나를" 등 1인칭·소설식 서술. 반드시 이름+님으로 직접 지칭. 홍연 말투.
- partner: 상대가 나에게서 받는 첫인상 핵심 한 줄 (강렬하고 인상적으로).
- partnerEmotion: 상대가 나를 처음 봤을 때 느끼는 감정 이모지 1개.
- partnerDesc: 공주님이 선우님을 처음 보았을 때 어떤 인상을 받았을지를 40~50문장(1800자 이상)으로 풍부하게 서술. 반드시 제3자 시점으로, 홍연이 두 사람을 바라보며 이야기하듯 서술하시오. 예) "공주님은 선우님을 처음 보았을 때 ~한 에너지를 감지했을 것이오." 절대 금지: "나는", "나에게", "내 마음", "그가 나를" 등 1인칭·소설식 서술. 반드시 이름+님으로 직접 지칭. 홍연 말투.`,

  4: `[mySipseong 섹션 — 내 일간 기준 상대방 십성]
⚠️ 위 [본인 사주 데이터] 블록에 "내 일간 기준 상대방 십성(서버 계산 확정값)"이 명시되어 있소. 그 값을 sipseong 필드에 그대로 쓰시오. 절대 임의로 계산하거나 바꾸지 마시오.

- sipseong: 서버 계산 확정값 그대로 (위 데이터 블록에 명시된 값).
- desc: 아래 흐름으로 8~10문장, 400자 이상 작성. ⛔ 400자 미만 절대 금지.
  ①오행 관계로 이 십성이 나온 이유 설명 (예: "을목 일간이 무토를 극하는 관계이므로 정재이오")
  ②이 십성이 연애에서 갖는 본질적 의미 — 내가 상대를 어떻게 대하게 되는지
  ③상대가 내게 주는 감정·기운 — 함께할 때 내 안에서 어떤 안도감·긴장감·끌림이 생기는지
  ④이 관계의 구조 — 누가 이끌고 누가 따르는지, 어떤 역할을 자연스럽게 맡게 되는지
  ⑤장기적으로 이 관계가 어떻게 발전하는지, 오래될수록 무엇을 깨닫게 되는지
  홍연 말투. 예시 문체: "을목 일간이 무토를 극하는 관계이므로 정재이오. 정재란 내가 이끌고 다스리는 대상으로, 안정과 신뢰를 바탕으로 한 관계를 뜻하오. ~~님은 선우님에게 흔들리지 않는 땅과 같은 존재이오. 화려하거나 자극적이지 않아도 늘 그 자리에서 묵묵히 기다리는 기운이 있소. 선우님은 이 분과 함께할 때 자신이 주도권을 쥐고 있다는 안도감을 느끼게 되오."

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
- lightSummary: 이 관계의 빛 전체를 한 줄로 압축 요약. 두 사람이 만났을 때 가장 빛나는 것이 무엇인지 핵심 한 문장.
- items 3~4개: 이 관계의 구체적 강점.
  각 item:
  - title: 강점 제목 (5자 이내, 인상적으로).
  - icon: 이 강점을 상징하는 이모지 1개 (예: 💞 🌟 🔥 🌈 🛡️ 🌿).
  - desc: 두 사람이 이 강점을 관계에서 어떻게 경험하는지 3~5문장으로. 사주 용어(천간합·지지충·일간·오행 등)는 절대 사용하지 말고, 두 사람이 실제로 느끼고 경험하는 감정·상황·행동 중심으로 서술. 홍연 말투.
  - effect: 이 강점이 실제 연애 장면에서 어떻게 나타나는지 한 줄 (예: "다투고 나서도 금세 풀리오. 서로를 향한 온기가 식지 않소.").

[shadows 섹션 — 그림자(갈등)]
- shadowSummary: 이 관계의 그림자 전체를 한 줄로 압축 요약. 가장 주의해야 할 것 핵심 한 문장.
- items 2~3개: 이 관계의 구체적 갈등 요소.
  각 item:
  - title: 갈등 제목 (5자 이내).
  - icon: 이 갈등을 상징하는 이모지 1개 (예: 🌑 ⚡ 🌪️ 🔒 😶).
  - desc: 두 사람이 이 갈등을 관계에서 어떻게 경험하는지, 어떤 상황에서 불거지는지 3~5문장으로. 사주 용어(천간합·지지충·일간·오행 등)는 절대 사용하지 말고, 실제로 느끼는 감정·상황·행동 중심으로 서술. 홍연 말투.
  - trigger: 이 갈등이 주로 터지는 구체적 상황 한 줄 (예: "상대가 말 없이 혼자 결정할 때 감정이 어긋나기 시작하오").
  - overcome: 이 갈등을 다스리는 가장 실질적인 방법 한 줄 (홍연 말투).

[balance 섹션 — 균형 잡는 법]
- lightRatio: 이 관계에서 빛이 차지하는 비율 (0~100 정수). 강점 개수·강도와 갈등 강도를 종합하여 산출. 일반적으로 60~80 사이.
- paragraphs 4개: ①이 관계에서 빛과 그림자의 전체 균형 — 어떤 에너지가 더 강한지(5~7문장, 220자+) ②빛을 키우는 방법 — 두 사람이 강점을 더 살리려면(5~7문장, 220자+) ③그림자를 다루는 방법 — 갈등이 생겼을 때 어떻게 대처하면 좋은지(5~7문장, 220자+) ④이 관계가 더 단단해지는 조건 — 무엇이 갖춰지면 두 사람이 오래 함께할 수 있는지(4~6문장, 180자+). 홍연 말투.
- tips 3~5개: 이 관계의 균형을 지키는 구체적 실천 팁. 각 팁은 실생활에서 바로 적용할 수 있는 방법으로. 홍연 말투.`,

  9: `[crisisPoints 섹션 — 위기 요소]
crisisSummary: 이 관계에서 위기가 어떤 성질을 띠는지 전체를 한 문장으로 요약. 홍연 말투.
items: 이 관계에서 반복적으로 찾아올 수 있는 위기 요소 2~3개.
각 item:
- title: 위기 제목 (5자 이내).
- icon: 이 위기를 상징하는 이모지 1개 (예: 🌪️ 🔥 🌊 ❄️ 💔 🌑 ⚡ 🌀).
- desc: 이 위기가 두 사람의 사주·오행에서 어떻게 만들어지는지, 어떤 기운이 충돌해서 생기는지 3~5문장(220자 이상). 단순 '싸움'이 아닌 사주 근거를 충실히 설명하시오. 홍연 말투.
- when: 이 위기가 주로 찾아오는 시기나 상황 한 줄 (예: "관계가 1~2년을 넘어 익숙해질 무렵에 오기 쉽소").
- signal: 위기가 다가오고 있다는 징조 한 줄 (예: "대화가 줄고 서로 말을 아끼기 시작하면 조심하시오").

[overcomeTips 섹션 — 극복법]
items: 위기를 극복하는 구체적인 방법 3~4개.
각 item:
- title: 극복법 제목 (인상적이고 실용적으로, 10자 이내).
- icon: 이모지 1개 (예: 🌱 🤝 💬 🧘 🌿 🌤️ 🔑 ✨).
- desc: 이 극복법이 왜 이 관계에 효과적인지, 어떻게 적용하면 되는지 3~4문장(180자 이상). 홍연 말투.
- steps: 구체적인 실천 단계 2~3개 (각 한 문장씩, 홍연 말투 "~하시오" 형식).

[crisisFlow 섹션 — 시기별 관계 흐름]
⚠️ 프롬프트 하단 "[대운·세운 서버 계산 확정값]" 블록을 반드시 참조하여 각 시기의 두 사람 대운·세운 십성을 그대로 인용하시오. 임의 추론 절대 금지.
overviewDesc: 두 사람 관계의 전체적인 위기-극복 흐름을 2~3문장으로 요약. 어떤 시기가 고비이고 어떤 시기가 봄날인지 큰 그림으로. 홍연 말투.
items: 5~6개 시기별 흐름. 반드시 현재(2026년) 기준 향후 6~8년을 커버하오.
각 item:
- label: 시기 (예: "2026년 하반기", "2027~2028년", "2029년"). 짧을수록 좋소 (10자 이내).
- tone: "good"(좋은 시기) | "warn"(위기 시기) | "caution"(주의 시기).
- score: 0~100 사이 정수. 이 시기 관계 기운 점수. good=75~95, caution=45~65, warn=15~40 범위에서 설정. 꺾은선 그래프에 직접 표시되오.
- text: 그 시기 관계 기운 설명 2~3문장. "[대운·세운 서버 계산 확정값]"에서 해당 연도의 두 사람 대운·세운 십성을 확인하여 반드시 인용하고, 그 십성이 관계에 어떻게 작용하는지 설명하시오. 단순 '좋다/나쁘다' 금지. 홍연 말투.
- tip: 그 시기에 특별히 해야 할 것 또는 조심해야 할 것 한 줄. 홍연 말투.`,

  10: `[marriagePossibility 섹션 — 결혼 가능성]
⚠️ 합충 관계 분석 결과 점수: {{HAP_CHUNG_SCORE}}. 최종 결혼 궁합 지수는 이 합충 점수(70%)와 당신의 사주 판단(30%)을 합산해 결정되오.
풀이의 전체 tone은 반드시 아래 구간 기준을 따르시오:
- 85점 이상: 매우 긍정적. 결혼을 강하게 권장하는 tone.
- 70~84점: 긍정적. 결혼 가능성이 높다는 tone.
- 60~69점: 중립적 긍정. 노력하면 가능하다는 tone.
- 50~59점: 신중한 tone. 결혼을 서두르지 말 것을 권하며, 넘어야 할 것이 있음을 명확히 서술.
- 40~49점: 현실적으로 어렵다는 tone. 연애는 가능하나 결혼은 많은 준비가 필요함을 강조.
- 39점 이하: 부정적. 결혼보다 서로를 더 깊이 이해하는 시간이 필요하다는 tone.
현재 합충 점수 {{HAP_CHUNG_SCORE}}에 맞는 tone을 풀이 전체에 일관되게 유지하시오.
- score: 반드시 {{MARRIAGE_SCORE}}을 그대로 입력하시오 (서버 확정값 — 절대 변경 금지).
- label: 반드시 "{{MARRIAGE_LABEL}}"을 그대로 입력하시오 (서버 확정값 — 절대 변경 금지).
- basis: 이 점수가 나온 사주 근거 한 문장.
⚠️ paragraphs의 전체 기조·결론·방향성은 반드시 label "{{MARRIAGE_LABEL}}"의 tone을 정확히 따라야 하오. label이 신중하거나 현실적이거나 부정적인 뉘앙스라면 paragraphs도 그 tone을 유지하여 결론지어야 하오. label과 다른 방향(더 긍정적이거나 더 부정적)으로 결론짓는 것 절대 금지.
- paragraphs 4개: ①두 사람의 합과 충 관계, 일간·십성·오행의 조합이 결혼 가능성에 어떻게 영향을 미쳤는지 구체적으로 설명(5~7문장 220자+). 풀이에 구체적인 점수 숫자는 절대 언급하지 마시오. ②이 관계에서 결혼 가능성이 생기는 근거와 결혼으로 이어지기 위해 두 사람이 갖춰야 할 내면의 준비(5~7문장 220자+) ③결혼 후 두 사람의 삶이 어떻게 펼쳐질지 — 가정의 색깔과 에너지(5~7문장 220자+) ④이 인연에 거는 희망과 당부 메시지(4~6문장 180자+). 홍연 말투로 쓰되, "홍연은", "홍연이" 등 홍연을 3인칭으로 지칭하는 표현은 절대 사용하지 마시오.

[marriageConditions 섹션 — 결혼의 조건]
items: 결혼으로 이어지기 위해 두 사람이 갖춰야 할 조건 2~3개.
각 item:
- title: 조건 제목 (간결하고 인상적으로, 10자 이내).
- icon: 이 조건을 상징하는 이모지 1개 (예: 💍 🏠 🤝 ⏰ 💬 🌱 🧘 🔑).
- desc: 왜 이 조건이 이 두 사람에게 중요한지, 사주에서 어떤 기운이 이 조건을 요구하는지 3~4문장(180자 이상). 홍연 말투.
- possibility: 이 조건이 충족될 가능성 한 줄 (예: "두 사람이 의지를 모은다면 충분히 갖출 수 있소", "시간이 필요하지만 이루어질 가능성이 있소").

[marriageTiming 섹션 — 결혼 시기]
⚠️ 결혼하기 가장 좋은 시기는 사주 흐름 분석 결과 {{BEST_TIMING_PERIOD}}로 판단되었소. bestPeriod는 반드시 이 값을 그대로 사용하시오.
- bestPeriod: 반드시 "{{BEST_TIMING_PERIOD}}"로 입력하시오 (확정값 — 절대 다른 시기 입력 금지).
- desc: 왜 {{BEST_TIMING_PERIOD}}가 결혼하기 좋은 시기인지를 아래 순서로 서술하시오. 최소 15~18문장, 900자 이상. 각 항목을 충분히 풀어 쓰고, 짧게 요약하거나 끊지 마시오. 홍연 말투.
  ① 프롬프트 하단의 "[서버 계산 확정값]" 블록에서 본인과 상대방의 대운 간지·십성, 세운 간지·십성, 대운 내 위치(초반/중반/후반)를 확인하여 그대로 인용하시오. 이 값은 절대 변경하거나 재계산하지 마시오.
  ② "대운 초반"이 아닌 경우 "접어든다/접어들며/맞이하며/진입하며" 등 대운 시작을 암시하는 표현은 절대 사용 금지. 대신 "○○ 대운 중반에 해당하는 해이오" / "○○ 대운 후반으로 접어드는 시점이오" 처럼 위치를 정확히 서술하시오.
  ③ 각자의 대운 천간·지지 십성이 무엇을 의미하는지(재성·관성·인성 등 각 십성의 작용), 그리고 두 사람 모두에게 결혼 기운이 형성되는 이유를 십성 관점에서 설명하시오.
  ④ 세운에 대해 반드시 아래를 모두 서술하시오:
     - {{BEST_TIMING_PERIOD}} 해당 연도가 어떤 간지(예: 경술년)인지 명시하시오.
     - 본인의 세운 천간 십성이 무엇인지(확정값 그대로), 그 십성이 결혼·인연·정착 기운과 어떤 관련이 있는지 설명하시오.
     - 상대방의 세운 천간 십성이 무엇인지(확정값 그대로), 그 십성이 결혼·인연·정착 기운과 어떤 관련이 있는지 설명하시오.
     - 두 사람 모두의 세운 십성을 종합하여 왜 이 해가 결혼하기 좋은 해인지 결론지어 서술하시오.
  ⑤ 두 사람의 대운·세운 흐름이 서로 어떻게 맞물려 결혼 에너지를 만드는지 연결하여 설명하시오.
  ⑥ 이 시기의 기운이 두 사람에게 어떤 구체적 변화를 가져올지 감성적으로 마무리하시오.
- advice: 이 시기를 앞두고 두 사람이 마음과 현실 양면에서 어떻게 준비해야 하는지 — 3~4문장(150자 이상). 홍연 말투.
- cautionPeriod: 반드시 "{{WORST_TIMING_PERIOD}}"로 입력하시오 (확정값 — 절대 다른 시기 입력 금지).
- cautionDesc: {{WORST_TIMING_PERIOD}}가 왜 결혼을 서두르면 안 되는 위험한 시기인지 서술하시오. 이 시기의 특성: {{WORST_TIMING_TEXT}} — 이 내용을 바탕으로 사주적 근거(대운·세운·십성·합충)를 추가하여 4~5문장(200자 이상)으로 풀어 쓰시오. 홍연 말투.`,

  11: `[letter 섹션 — 홍연의 서신]
모든 풀이를 마친 홍연이 두 사람에게 보내는 손편지이오.

⚠️ 이 서신의 성격 — 반드시 지킬 것:
- 이것은 분석이 아니라 편지이오. 오행·십성·합충을 처음 소개하거나 다시 설명하는 것 절대 금지. 앞 장에서 이미 모든 분석은 끝났소.
- 홍연이 이 두 사람의 사주를 오래 들여다보며 느낀 감정과 애정, 앞길에 대한 진심 어린 당부를 담으시오.
- 이전 장에서 밝혀진 내용(끌림, 강점, 위기, 결혼 가능성)을 재설명하지 말고, 그 내용이 두 사람의 삶에 가져올 의미와 감동을 편지 말투로 전하시오.
- 두 사람을 이름으로 직접 부르시오. "그대"·"그대의 인연" 표현은 금지.

작성 규칙:
- paragraphs: 5개 단락. 각 단락 9~12문장, 최소 500자 이상.
- 홍연 말투(~이오/~하오/~겠소) 유지.
- 각 단락 방향:
  ① 홍연이 처음 이 인연을 마주했을 때의 인상과 감상(感想). 두 사람이 어떤 사람인지를 분석이 아닌 따뜻한 시선으로 소개하시오.
  ② 이 관계가 가진 특별함과 가능성. 함께일 때 빛나는 순간들을 구체적이고 감성적으로 그려주시오.
  ③ 두 사람이 함께 걸어갈 길에서 만날 어려움에 대한 당부. 겁주는 것이 아니라, 알고 있기에 더 단단히 준비하길 바라는 마음으로.
  ④ 앞으로의 시간에 대한 조언. 좋은 시기에 어떻게 움직이고, 힘든 시기에 어떻게 서로를 붙잡아야 하는지.
  ⑤ 홍연의 마지막 인사. 이 인연이 오래도록 빛나기를 바라는 진심 어린 축원. 두 사람 각각에게 한 마디씩 건네며 마무리하시오.`,
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
  "mySipseong": { "sipseong": "서버에서 제공한 확정 십성명 그대로", "desc": "이 십성의 연애 의미 3~5문장" },
  "myView": { "intro": "핵심 한 줄", "callout": "오행·십성 기운 핵심 한 문장", "paragraphs": ["단락1 이미지(5~7문장 220자+)", "단락2 감정 영향(5~7문장 220자+)", "단락3 관계 역학(5~7문장 220자+)", "단락4 행동 패턴(4~6문장 180자+)"] },
  "myExpectation": { "items": [{ "label": "기대 제목", "icon": "💫", "desc": "핵심 한 줄", "detailDesc": "사주적 이유와 감정 2~3문장" }, { "label": "기대 제목2", "icon": "🌱", "desc": "핵심 한 줄", "detailDesc": "2~3문장" }, { "label": "기대 제목3", "icon": "🔥", "desc": "핵심 한 줄", "detailDesc": "2~3문장" }] },
  "myWarning": { "desc": "핵심 주의 메시지 3~4문장", "warningItems": [{ "trigger": "주의 필요 상황", "action": "처방 한 줄" }, { "trigger": "주의 필요 상황2", "action": "처방2 한 줄" }] }
}`,
  5: `{
  "partnerSipseong": { "sipseong": "서버에서 제공한 확정 십성명 그대로", "desc": "상대 기준 이 십성의 연애 의미 3~5문장" },
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
  "strengths": { "lightSummary": "빛 전체 요약 한 줄", "items": [{ "title": "강점 제목", "icon": "💞", "desc": "강점 설명 3~5문장", "effect": "연애 장면 한 줄" }, { "title": "강점2", "icon": "🌟", "desc": "3~5문장", "effect": "장면 한 줄" }, { "title": "강점3", "icon": "🌿", "desc": "3~5문장", "effect": "장면 한 줄" }] },
  "shadows": { "shadowSummary": "그림자 전체 요약 한 줄", "items": [{ "title": "갈등 제목", "icon": "🌑", "desc": "갈등 설명 3~5문장", "trigger": "발생 상황 한 줄", "overcome": "극복법 한 줄" }, { "title": "갈등2", "icon": "⚡", "desc": "3~5문장", "trigger": "발생 상황", "overcome": "극복법" }] },
  "balance": { "lightRatio": 65, "paragraphs": ["단락1 전체 균형(220자+)", "단락2 빛 키우기(220자+)", "단락3 그림자 다루기(220자+)", "단락4 단단해지는 조건(180자+)"], "tips": ["실천 팁1", "실천 팁2", "실천 팁3", "실천 팁4"] }
}`,
  9: `{
  "crisisPoints": {
    "crisisSummary": "두 사람의 위기 성질 전체 요약 한 문장",
    "items": [
      { "title": "위기 제목", "icon": "🌪️", "desc": "사주 근거 포함 3~5문장(220자+)", "when": "찾아오는 때 한 줄", "signal": "위기 신호 한 줄" },
      { "title": "위기 제목2", "icon": "❄️", "desc": "3~5문장(220자+)", "when": "찾아오는 때", "signal": "위기 신호" }
    ]
  },
  "overcomeTips": {
    "items": [
      { "title": "극복법 제목", "icon": "🌱", "desc": "3~4문장(180자+)", "steps": ["단계1 한 문장", "단계2 한 문장", "단계3 한 문장"] },
      { "title": "극복법 제목2", "icon": "🤝", "desc": "3~4문장(180자+)", "steps": ["단계1", "단계2"] },
      { "title": "극복법 제목3", "icon": "💬", "desc": "3~4문장(180자+)", "steps": ["단계1", "단계2"] }
    ]
  },
  "crisisFlow": {
    "overviewDesc": "전체 위기-극복 흐름 요약 2~3문장",
    "items": [
      { "label": "2026년 하반기", "tone": "caution", "score": 58, "text": "기운 설명 2~3문장", "tip": "이 시기 조언 한 줄" },
      { "label": "2027~2028년", "tone": "warn", "score": 32, "text": "기운 설명 2~3문장", "tip": "조언" },
      { "label": "2029년", "tone": "good", "score": 80, "text": "기운 설명 2~3문장", "tip": "조언" },
      { "label": "2030년", "tone": "good", "score": 88, "text": "기운 설명 2~3문장", "tip": "조언" },
      { "label": "2031~2032년", "tone": "caution", "score": 55, "text": "기운 설명 2~3문장", "tip": "조언" }
    ]
  }
}`,
  10: `{
  "marriagePossibility": {
    "score": 72,
    "label": "결혼으로 이어질 강한 인연",
    "basis": "사주 근거 한 문장",
    "paragraphs": ["단락1 결혼 기운 근거(220자+)", "단락2 내면 준비(220자+)", "단락3 결혼 후 삶의 색깔(220자+)", "단락4 홍연의 당부(180자+)"]
  },
  "marriageConditions": {
    "items": [
      { "title": "조건 제목", "icon": "💍", "desc": "사주 근거 포함 3~4문장(180자+)", "possibility": "충족 가능성 한 줄" },
      { "title": "조건 제목2", "icon": "🤝", "desc": "3~4문장(180자+)", "possibility": "충족 가능성" },
      { "title": "조건 제목3", "icon": "⏰", "desc": "3~4문장(180자+)", "possibility": "충족 가능성" }
    ]
  },
  "marriageTiming": {
    "bestPeriod": "2027~2028년",
    "desc": "이 시기가 좋은 이유 3~5문장(200자+)",
    "advice": "이 시기를 앞두고 해야 할 것 한 줄",
    "cautionPeriod": "2026년",
    "cautionDesc": "그 시기가 위험한 이유 2~3문장"
  }
}`,
  11: `{
  "letter": {
    "paragraphs": [
      "①인연의 사주적 배경 — 오행의 만남과 운명적 기운 서술(9~12문장, 500자 이상)",
      "②두 사람이 함께 빛나는 것들 — 케미·강점·서로에게 주는 것(9~12문장, 500자 이상)",
      "③함께 넘어야 할 것들 — 위기·갈등·차이, 그러나 그것이 관계를 깊게 만드는 이유(9~12문장, 500자 이상)",
      "④앞으로 나아갈 방향 — 좋은 시기를 살리고 어려운 시기를 버티는 법(9~12문장, 500자 이상)",
      "⑤홍연의 마지막 축원 — 두 사람 각각에게 건네는 진심 어린 마무리(9~12문장, 500자 이상)"
    ]
  }
}`,
};

// ── 기둥별 십성 확인표 빌더 ──
type PillarItem = { pos?: string; gan?: string; ji?: string };
const GAN_KOR_P: Record<string,string> = {甲:"갑",乙:"을",丙:"병",丁:"정",戊:"무",己:"기",庚:"경",辛:"신",壬:"임",癸:"계"};
const JI_KOR_P: Record<string,string>  = {子:"자",丑:"축",寅:"인",卯:"묘",辰:"진",巳:"사",午:"오",未:"미",申:"신",酉:"유",戌:"술",亥:"해"};
const POS_LABEL: Record<string,string> = {년주:"년주(조상·초년)",월주:"월주(부모·청년)",일주:"일주(본인·배우자)",시주:"시주(자녀·말년)"};
function buildKunghapPillarTable(ilgan: string, pillars: PillarItem[], personLabel: string): string {
  if (!ilgan || !pillars.length) return "";
  const ORDER = ["년주","월주","일주","시주"];
  const byPos: Record<string,PillarItem> = {};
  for (const p of pillars) if (p.pos) byPos[p.pos] = p;
  const rows = ORDER.map(pos => {
    const p = byPos[pos]; if (!p) return null;
    const ganKor = p.gan ? GAN_KOR_P[p.gan] ?? p.gan : "—";
    const jiKor  = p.ji  ? JI_KOR_P[p.ji]   ?? p.ji  : "—";
    const ganSip = p.gan && p.gan !== ilgan ? sipseongOfStem(ilgan, p.gan) : "비견(일간)";
    const jiSip  = p.ji  ? sipseongOfBranch(ilgan, p.ji) : "—";
    return `  ${(POS_LABEL[pos]??pos).padEnd(14)}| 천간: ${ganKor}(${p.gan??""}) → ${ganSip} | 지지: ${jiKor}(${p.ji??""}) → ${jiSip}`;
  }).filter(Boolean);
  if (!rows.length) return "";
  return `[${personLabel} 기둥별 십성 확인표 — 반드시 이 값만 사용, 임의 추론 절대 금지]\n${rows.join("\n")}\n⚠️ 위 표에 없는 십성을 임의로 언급하는 것은 절대 금지하오.`;
}

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
    ohaengSummary?: string;
    partnerOhaengSummary?: string;
    ilgan?: string;
    partnerIlgan?: string;
    mySipseong?: string;
    partnerSipseong?: string;
    hapChungScore?: number;
    bestTimingPeriod?: string;
    worstTimingPeriod?: string;
    worstTimingText?: string;
    timingContext?: string;
    prevChapterSummary?: string;
    ilganFull?: string;
    partnerIlganFull?: string;
    myPillars?: PillarItem[];
    partnerPillars?: PillarItem[];
    daeunSeunContext?: string;
    marriageScore?: number;
    marriageLabel?: string;
  }
): { system: string; user: string } {
  const { name, gender, manseryeokText, partnerName, partnerGender, partnerManseryeokText, ohaengSummary, partnerOhaengSummary, ilgan, partnerIlgan, mySipseong, partnerSipseong, hapChungScore, bestTimingPeriod, worstTimingPeriod, worstTimingText, timingContext, prevChapterSummary, ilganFull, partnerIlganFull, myPillars, partnerPillars, daeunSeunContext, marriageScore, marriageLabel } = input;
  const firstName = name.slice(1) || name;
  const partnerFirstName = partnerName.slice(1) || partnerName;
  const honorificBlock = `\n\n[호칭 — 아래 형태만 그대로 사용, 절대 변형 금지]
의뢰인을 부를 때 반드시 아래 중 하나를 그대로 복사해 사용하오:
  "${firstName}님은"  "${firstName}님이"  "${firstName}님을"  "${firstName}님과"  "${firstName}님에게"  "${firstName}님으로"  "${firstName}님의"  "${firstName}님"

상대방을 부를 때 반드시 아래 중 하나를 그대로 복사해 사용하오:
  "${partnerFirstName}님은"  "${partnerFirstName}님이"  "${partnerFirstName}님을"  "${partnerFirstName}님과"  "${partnerFirstName}님에게"  "${partnerFirstName}님으로"  "${partnerFirstName}님의"  "${partnerFirstName}님"

⚠️ 이름을 직접 조합하거나 추론하지 마오. 반드시 위 형태 중 하나를 그대로 쓰오.
⚠️ 계절 단어("봄" "여름" "가을" "겨울")는 고유 단어이오. 절대 변형 금지.`;
  const myGenderLabel = gender === "female" ? "여성" : "남성";
  const partnerGenderLabel = partnerGender === "female" ? "여성" : "남성";

  // 일간 한글 + 오행 + 관계 문장 생성
  const _GAN_KOR: Record<string, string> = { 甲:"갑",乙:"을",丙:"병",丁:"정",戊:"무",己:"기",庚:"경",辛:"신",壬:"임",癸:"계" };
  const _GAN_EL: Record<string, string>  = { 甲:"목",乙:"목",丙:"화",丁:"화",戊:"토",己:"토",庚:"금",辛:"금",壬:"수",癸:"수" };
  const _CTL: Record<string, string> = { 목:"토",토:"수",수:"화",화:"금",금:"목" };
  const _GEN: Record<string, string> = { 목:"화",화:"토",토:"금",금:"수",수:"목" };
  function sipseongRelSentence(from?: string, to?: string, ss?: string): string {
    if (!from || !to || !ss) return "";
    const fk = _GAN_KOR[from] ?? from; const fe = _GAN_EL[from] ?? "";
    const tk = _GAN_KOR[to] ?? to;   const te = _GAN_EL[to] ?? "";
    let rel = "";
    if (fe === te) rel = `${fk}${fe}과 ${tk}${te}은 같은 오행이므로`;
    else if (_CTL[fe] === te) rel = `${fk}${fe}이 ${tk}${te}을 극하는 관계이므로`;
    else if (_GEN[fe] === te) rel = `${fk}${fe}이 ${tk}${te}을 생하는 관계이므로`;
    else if (_CTL[te] === fe) rel = `${tk}${te}이 ${fk}${fe}을 극하는 관계이므로`;
    else if (_GEN[te] === fe) rel = `${tk}${te}이 ${fk}${fe}을 생하는 관계이므로`;
    return rel ? `${rel} ${ss}이오.` : "";
  }
  const mySipseongFirstSentence = sipseongRelSentence(ilgan, partnerIlgan, mySipseong);
  const partnerSipseongFirstSentence = sipseongRelSentence(partnerIlgan, ilgan, partnerSipseong);

  // 두 일간 오행 관계 서버 계산 → LLM이 생극 관계를 틀리게 쓰는 것 방지
  function ilganRelBlock(fromHanja: string, toHanja: string, fromName: string, toName: string): string {
    const fe = _GAN_EL[fromHanja] ?? ""; const te = _GAN_EL[toHanja] ?? "";
    const fk = _GAN_KOR[fromHanja] ?? fromHanja; const tk = _GAN_KOR[toHanja] ?? toHanja;
    if (!fe || !te) return "";
    let rel = ""; let wrongRel = "";
    if (fe === te) { rel = `같은 오행(${fe})으로 비화 관계`; wrongRel = "생·극 관계라고 쓰는 것"; }
    else if (_CTL[fe] === te) { rel = `${fk}${fe}이 ${tk}${te}을 극하는 관계 (${fe}극${te})`; wrongRel = `"${fk}${fe}이 ${tk}${te}을 생한다"`; }
    else if (_GEN[fe] === te) { rel = `${fk}${fe}이 ${tk}${te}을 생하는 관계 (${fe}생${te})`; wrongRel = `"${fk}${fe}이 ${tk}${te}을 극한다"`; }
    else if (_CTL[te] === fe) { rel = `${tk}${te}이 ${fk}${fe}을 극하는 관계 (${te}극${fe})`; wrongRel = `"${fk}${fe}이 ${tk}${te}을 극한다"`; }
    else if (_GEN[te] === fe) { rel = `${tk}${te}이 ${fk}${fe}을 생하는 관계 (${te}생${fe})`; wrongRel = `"${fk}${fe}이 ${tk}${te}을 생한다"`; }
    if (!rel) return "";
    return `⛔ ${fromName}(${fk}${fe})과 ${toName}(${tk}${te})의 오행 관계 확정값: ${rel}\n   이 관계를 ${wrongRel}고 쓰는 것 절대 금지.`;
  }
  const ilganRelLine = ilgan && partnerIlgan
    ? ilganRelBlock(ilgan, partnerIlgan, `${firstName}님`, `${partnerFirstName}님`)
    : "";

  const theme = CH_THEME[chapter] ?? "";
  const guideRaw = CH_GUIDE[chapter] ?? "";
  const guide = guideRaw
    .replace(/\{\{HAP_CHUNG_SCORE\}\}/g, hapChungScore !== undefined ? `${hapChungScore}점` : "이 점수")
    .replace(/\{\{HAP_CHUNG_SCORE_NUM\}\}/g, hapChungScore !== undefined ? `${hapChungScore}` : "0")
    .replace(/\{\{MARRIAGE_SCORE\}\}/g, marriageScore !== undefined ? `${marriageScore}` : hapChungScore !== undefined ? `${hapChungScore}` : "0")
    .replace(/\{\{MARRIAGE_LABEL\}\}/g, marriageLabel ?? "결혼을 권하는 인연이오")
    .replace(/\{\{BEST_TIMING_PERIOD\}\}/g, bestTimingPeriod ?? "2027~2028년")
    .replace(/\{\{WORST_TIMING_PERIOD\}\}/g, worstTimingPeriod ?? "2026년")
    .replace(/\{\{WORST_TIMING_TEXT\}\}/g, worstTimingText ?? "두 사람 사이에 갈등과 충돌이 생길 수 있는 시기");
  const schema = CH_SCHEMA[chapter] ?? "{}";

  const myPillarTable = ilgan && myPillars?.length ? buildKunghapPillarTable(ilgan, myPillars, `${firstName}님`) : "";
  const partnerPillarTable = partnerIlgan && partnerPillars?.length ? buildKunghapPillarTable(partnerIlgan, partnerPillars, `${partnerFirstName}님`) : "";

  const myDataBlock = [
    ilgan ? `⛔ 일간(日干) 확정값: ${ilganFull || ilgan} — 풀이에서 이 일간을 다른 글자로 쓰는 것 절대 금지. 예) "${ilganFull || ilgan}의 기운" "○○님은 ${ilganFull || ilgan}을 일간으로" 처럼만 쓰시오.` : "",
    ohaengSummary ? `오행 분포(서버 사전계산): ${ohaengSummary}` : "",
    myPillarTable,
    mySipseong ? `내 일간 기준 상대방 십성(서버 계산 확정값): ${mySipseong} ← 절대 바꾸지 마시오.` : "",
    mySipseongFirstSentence ? `mySipseong.desc 첫 문장 반드시 이렇게 시작: "${mySipseongFirstSentence}"` : "",
  ].filter(Boolean).join("\n");

  const partnerDataBlock = [
    partnerIlgan ? `⛔ 일간(日干) 확정값: ${partnerIlganFull || partnerIlgan} — 풀이에서 이 일간을 다른 글자로 쓰는 것 절대 금지. 예) "${partnerIlganFull || partnerIlgan}의 기운" "○○님은 ${partnerIlganFull || partnerIlgan}을 일간으로" 처럼만 쓰시오.` : "",
    partnerOhaengSummary ? `오행 분포(서버 사전계산): ${partnerOhaengSummary}` : "",
    partnerPillarTable,
    partnerSipseong ? `상대 일간 기준 나의 십성(서버 계산 확정값): ${partnerSipseong} ← 절대 바꾸지 마시오.` : "",
    partnerSipseongFirstSentence ? `partnerSipseong.desc 첫 문장 반드시 이렇게 시작: "${partnerSipseongFirstSentence}"` : "",
  ].filter(Boolean).join("\n");

  const user = `⚠️ 글쓰기 필수 규칙 (모든 텍스트에 적용):
1. 조사: 받침 있으면 은/이/을/으로, 받침 없으면 는/가/를/로. 예) 정재는(○) 정재은(✗), 공주님이(○) 공주님가(✗), 선우님을(○) 선우님를(✗)
2. 분량: 각 섹션에서 지정한 문장 수·글자 수를 반드시 채울 것. 짧게 요약하거나 끊는 것 절대 금지.
3. 말투: 홍연 말투(~이오/~하오/~했소/~겠소) 유지.
${ilganRelLine ? `\n${ilganRelLine}\n` : ""}

⚠️ 오행 상생·상극 원리 — 두 오행의 관계를 서술하기 전에 반드시 아래를 확인하시오:

[상생 — 자연 원리로 이해하시오]
목→화: 나무가 불을 키운다
화→토: 불이 타고 나면 재(흙)가 된다
토→금: 땅속에서 금속이 생긴다
금→수: 차가운 금속에 물이 맺힌다
수→목: 물이 나무를 키운다

[상극 — 자연 원리로 이해하시오]
목→토: 나무 뿌리가 흙을 파고든다 (목이 토를 극)
토→수: 흙(둑)이 물을 막는다 (토가 수를 극)
수→화: 물이 불을 끈다 (수가 화를 극)
화→금: 불이 금속을 녹인다 (화가 금을 극)
금→목: 도끼(금속)가 나무를 자른다 (금이 목을 극)

⛔ 위 원리에 맞지 않는 서술은 절대 금지:
- "목이 토를 생한다" → 목은 토를 극하오, 생하지 않소
- "토가 목을 생한다" → 수가 목을 생하오, 토가 아니오
- "을목이 무토를 생한다" → 목은 토를 극하오, 이는 완전히 틀린 서술이오
- "목과 토가 조화를 이룬다" → 목과 토는 극 관계이오. 조화라고 표현하면 안 되오

⚠️ 극(克) 관계를 긍정적으로 서술하는 올바른 방법:
극 관계는 "나쁜 궁합"이 아니오. 극하는 쪽이 상대를 이끌고 자극하는 긴장감 있는 관계이오.
올바른 예) "목이 토를 극하는 구조로, 선우님이 공주님을 이끌고 자극하는 역할을 하오. 이 긴장이 서로를 성장시키오."
잘못된 예) "목과 토가 서로를 보완하며 조화를 이루오" — 이는 사실과 다른 서술이오. 절대 금지.

━━━━━━━━━━━━━━━━━━━━━
아래 두 사람의 명식을 바탕으로 연애궁합 결과지 풀이를 JSON으로 출력하시오.

${honorificBlock}

【 본인 】
이름: ${firstName}님 (${myGenderLabel})
${myDataBlock ? `⚠️ 서버에서 사전계산된 데이터 (반드시 이 값을 그대로 사용하시오. 다른 값으로 바꾸거나 직접 계산하지 마시오):\n${myDataBlock}\n` : ""}${manseryeokText}

【 상대방 】
이름: ${partnerFirstName}님 (${partnerGenderLabel})
${partnerDataBlock ? `⚠️ 서버에서 사전계산된 데이터 (반드시 이 값을 그대로 사용하시오. 다른 값으로 바꾸거나 직접 계산하지 마시오):\n${partnerDataBlock}\n` : ""}${partnerManseryeokText}

━━━━━━━━━━━━━━━━━━━━━
▶ 이번 장 주제: ${theme}
━━━━━━━━━━━━━━━━━━━━━
${guide}${daeunSeunContext ? `\n\n${daeunSeunContext}` : ""}${timingContext ? `\n\n${timingContext}` : ""}${prevChapterSummary ? `\n\n${prevChapterSummary}` : ""}

출력 JSON 형식 (이 형식 그대로, 다른 키 추가 금지):
${schema}

주의:
- 반드시 위 JSON 형식만 출력하시오. 설명·인사말·마크다운 일절 불가.
- ⚠️ 위에 "서버에서 사전계산된 데이터"로 제공된 일간·오행 분포는 확정값이오. 이 값을 그대로 사용하시오. 절대 다른 값으로 바꾸거나 직접 재계산하지 마시오.
- ⚠️ 풀이는 반드시 위에 제공된 명식(천간지지·십성·합충·격국·대운 등)의 실제 값을 직접 인용하여 근거로 삼으시오. 예) "갑목 일간이므로", "정관이 월지에 있어", "일지 해수가 상대의 인목과 합을 이루어" 처럼 명식에서 읽은 구체적 글자·십성·합충을 반드시 언급하시오. 명식 데이터를 읽지 않고 일반적인 성격 묘사나 추측을 쓰는 것은 절대 금지.
- 모든 풀이는 두 사람의 실제 명식 데이터(일간·오행·십성·합충)에 근거하시오. 명식에 없는 내용, 추측, 일반론 금지.
- 풀이에서 오행 개수를 언급할 때는 반드시 사전계산된 수치를 그대로 쓰시오. 임의로 다른 숫자를 쓰는 것은 절대 금지.
- 홍연 말투(~이오/~하오/~했소/~겠소)를 유지하시오.
- 본인은 "${firstName}님", 상대방은 "${partnerFirstName}님"으로 직접 지칭하시오. 성씨(첫 글자)는 절대 포함하지 마시오.
- "이 사주를 가진 이는", "이 사람은", "이런 기운을 가진 이는", "그 분", "그분", "그 사람", "상대방은", "상대는" 등 우회적·간접적 표현은 절대 사용하지 마시오. 반드시 이름+님(예: "${firstName}님은", "${partnerFirstName}님은")으로 직접 지칭하시오.
- 풀이 텍스트는 각 섹션에서 지정한 분량을 반드시 채우시오. 짧게 끊거나 요약하지 마시오.`;

  return { system: SYSTEM, user };
}
