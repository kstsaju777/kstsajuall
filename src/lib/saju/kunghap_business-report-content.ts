// =====================================================
// 비즈니스궁합 결과지 — 장별 콘텐츠 타입 / 프롬프트 빌더
// =====================================================

import { SYSTEM } from "./report-prompts";
import { parseContentJson } from "./report-content";
export { parseContentJson };
export { SYSTEM };

export const BUSINESS_KUNGHAP_CHAPTER_SECTIONS: Record<number, string[]> = {
  1:  ["myWonguk", "myNature", "myYongsin", "myBusinessStyle"],
  2:  ["partnerWonguk", "partnerNature", "partnerYongsin", "partnerBusinessStyle"],
  3:  ["hapList", "chungList", "overallScore"],
  4:  ["compatScore", "compatReason", "strengths", "weaknesses", "balanceTip"],
  5:  ["bizStyle", "roleBalance", "workLife"],
  6:  ["myStyle", "partnerStyle", "styleGap"],
  7:  ["strengths", "shadows", "balance"],
  8:  ["conflictPattern", "crisisPoints", "overcomeTips", "recoveryGuide"],
  9:  ["wealthFlow", "homeLife", "wealthTips"],
  10: ["bizFutureFlow", "bizFutureTips"],
  11: ["letter"],
};

export function isBusinessKunghapChapterReady(
  content: Record<string, unknown> | null | undefined,
  chapter: number,
): boolean {
  if (!content) return false;
  const keys = BUSINESS_KUNGHAP_CHAPTER_SECTIONS[chapter];
  if (!keys || keys.length === 0) return true;
  return keys.every((k) => {
    const v = content[k];
    if (v == null) return false;
    if (typeof v === "object") {
      const obj = v as Record<string, unknown>;
      if (Array.isArray(obj.paragraphs)) return obj.paragraphs.length > 0;
      if (Array.isArray(obj.items)) return obj.items.length > 0;
      if (Array.isArray(obj.tips)) return obj.tips.length > 0;
      if (Array.isArray(obj.keywords)) return obj.keywords.length > 0;
      if (typeof obj.score === "number") return true;
      if (typeof obj.label === "string") return obj.label.length > 0;
      if (typeof obj.desc === "string") return obj.desc.length > 0;
      if (typeof obj.intro === "string") return obj.intro.length > 0;
    }
    return false;
  });
}

export function buildBusinessKunghapChapterPrompt(
  chapter: number,
  input: {
    name: string;
    gender: "male" | "female";
    manseryeokText: string;
    partnerName: string;
    partnerGender: "male" | "female";
    partnerManseryeokText: string;
    birthYear?: number;
    ilgan?: string;
    partnerIlgan?: string;
  },
): { system: string; user: string } {
  const genderLabel = input.gender === "male" ? "남성" : "여성";
  const partnerGenderLabel = input.partnerGender === "male" ? "남성" : "여성";
  const myLabel = input.name.length > 1 ? input.name.slice(1) : input.name;
  const partnerLabel = input.partnerName.length > 1 ? input.partnerName.slice(1) : input.partnerName;
  const honorificBlock = `\n\n[호칭 토큰 규칙 — 반드시 준수]
풀이 본문에서 이름을 쓸 때 아래 토큰만 사용하오. 절대 실제 이름을 직접 쓰지 마오.
  의뢰인 → __MY__ 사용
  상대방 → __PT__ 사용

토큰 뒤 조사는 반드시 아래 중 하나만 사용하오 (님 받침 ㅁ 기준):
  __MY__은  __MY__이  __MY__을  __MY__과  __MY__에게  __MY__으로  __MY__의  __MY__이라
  __PT__은  __PT__이  __PT__을  __PT__과  __PT__에게  __PT__으로  __PT__의  __PT__이라

예시: "__MY__은 사업에서 재능을 발휘할 것이오. __PT__과의 비즈니스는..."
⚠️ 계절 단어("봄" "여름" "가을" "겨울")는 절대 변형 금지.
⚠️ 한국어 합성어의 글자를 절대 변형하지 마오. 조사 규칙(와/과, 이/가)을 단어 내부에 적용하면 절대 안 되오. 예: "효과적"을 "효와적"으로, "결과"를 "결와"로 쓰지 마오. 단어 자체의 철자는 그대로 유지하오.`;
  const myIlganNote = input.ilgan ? `\n⚑ 일간(일주 천간): ${input.ilgan}` : "";
  const ptIlganNote = input.partnerIlgan ? `\n⚑ 일간(일주 천간): ${input.partnerIlgan}` : "";
  const intro = `본인 정보:\n이름: ${input.name}（${genderLabel}）${myIlganNote}\n${input.manseryeokText}\n\n파트너 정보:\n이름: ${input.partnerName}（${partnerGenderLabel}）${ptIlganNote}\n${input.partnerManseryeokText}`;

  const schemas: Record<number, string> = {
    1: `{"myWonguk":{"intro":"","callout":"","singang":"","dominantEl":"","paragraphs":[]},"myNature":{"keywords":[],"strengthDesc":"","shadowDesc":""},"myYongsin":{"yongsinEl":"","heusinEl":"","gisinEl":"","yongsinReason":"","heusinReason":"","gisinReason":"","desc":""},"myBusinessStyle":{"intro":"","patternType":"","patternIcon":"💼","paragraphs":[]}}`,
    2: `{"partnerWonguk":{"intro":"","callout":"","singang":"","dominantEl":"","paragraphs":[]},"partnerNature":{"keywords":[],"strengthDesc":"","shadowDesc":""},"partnerYongsin":{"yongsinEl":"","heusinEl":"","gisinEl":"","yongsinReason":"","heusinReason":"","gisinReason":"","desc":""},"partnerBusinessStyle":{"intro":"","patternType":"","patternIcon":"💼","paragraphs":[]}}`,
    3: `{"hapList":{"items":[{"type":"","effect":"","desc":""}]},"chungList":{"items":[{"type":"","impact":"","desc":"","resolve":""}]},"overallScore":{"score":70,"label":"","desc":""}}`,
    4: `{"compatScore":{"score":72,"label":"","basis":"","paragraphs":[]},"compatReason":{"intro":"","callout":"","paragraphs":[]},"strengths":{"items":[{"title":"","effect":"","desc":""}]},"weaknesses":{"items":[{"title":"","overcome":"","desc":""}]},"balanceTip":{"callout":"","tips":[{"title":"","desc":""}]}}`,
    5: `{"bizStyle":{"coupleType":"","coupleIcon":"🤝","paragraphs":[]},"roleBalance":{"items":[{"role":"","icon":"💼","myRatio":50,"desc":""}]},"workLife":{"clips":[{"situation":"","myReaction":"","partnerReaction":""}]}}`,
    6: `{"myStyle":{"label":"","icon":"💼","keywords":[],"styleDesc":"","strengthStyle":"","shadowStyle":""},"partnerStyle":{"label":"","icon":"🗂️","keywords":[],"styleDesc":"","strengthStyle":"","shadowStyle":""},"styleGap":{"compatRating":"보통","compatIcon":"🤝","paragraphs":[],"tips":[]}}`,
    7: `{"strengths":{"items":[{"icon":"✨","title":"","desc":"","effect":""}],"lightSummary":""},"shadows":{"items":[{"icon":"🌙","title":"","desc":"","trigger":"","overcome":""}],"shadowSummary":""},"balance":{"lightRatio":60,"paragraphs":[],"tips":[]}}`,
    8: `{"conflictPattern":{"triggerType":"","triggerIcon":"⚡","callout":"","patterns":[{"title":"","icon":"💢","desc":""}],"reconcile":"","growthTip":""},"crisisPoints":{"items":[{"icon":"⚠️","title":"","desc":"","basis":"","signal":""}]},"overcomeTips":{"items":[{"icon":"💚","title":"","desc":"","tip":""}]},"recoveryGuide":{"callout":"","principles":[{"title":"","desc":""}],"paragraphs":[]}}`,
    9: `{"wealthFlow":{"flowGraph":{"points":[{"year":2025,"score":70,"note":""}]},"flowPeriods":[{"label":"","trend":"상승 중","title":"","text":""}],"wealthType":"","wealthIcon":"💰","callout":"","dominance":{"myRatio":50},"paragraphs":[]},"homeLife":{"partnerType":"","partnerIcon":"🤝","callout":"","keywords":[],"aspects":[{"label":"","icon":"","desc":""}],"paragraphs":[]},"wealthTips":{"tips":[{"icon":"💡","title":"","desc":""}]}}`,
    10: `{"bizFutureFlow":{"successGuess":{"successRatio":65,"basis":"","note":""},"paragraphs":[]},"bizFutureTips":{"tips":[{"icon":"💡","title":"","desc":""}]}}`,
    11: `{"letter":{"paragraphs":[]}}`,
  };

  const questions: Record<number, string> = {
    1: `아래는 __MY__님의 사주 명식 데이터를 바탕으로 네 개 섹션을 작성하는 지시사항이오.

⚠️ 반드시 위 【본인】 만세력 텍스트에서 다음 항목을 직접 읽어 풀이에 반영하시오:
  - 일간(日干): 사주팔자는 년주·월주·일주·시주 순서로 나열되오. 반드시 세 번째 기둥(일주)의 천간이 일간이오. 년주·월주·시주의 천간과 혼동하지 마시오.
  - 오행 분포: 8글자(천간 4자 + 지지 4자) 전체에서 각 글자의 오행을 아래 기준으로 변환한 뒤, 목·화·토·금·수 각각의 정확한 개수를 세시오.
    천간: 甲乙=목, 丙丁=화, 戊己=토, 庚辛=금, 壬癸=수
    지지: 寅卯=목, 巳午=화, 辰戌丑未=토, 申酉=금, 亥子=수
    반드시 8글자를 하나씩 확인하여 집계하시오. 틀린 개수를 풀이에 쓰는 것은 절대 금지.
  - 신강·신약: 일간을 생조하는 글자(비겁+인성)가 4개 이상이면 신강, 그 미만이면 신약으로 판단하시오.
  - 이 구체적 데이터를 근거로 intro·callout·singang·dominantEl·paragraphs를 작성하시오. 데이터와 다른 해석 금지.

━━━ [myWonguk] __MY__님의 원국 ━━━
__MY__님의 타고난 사주 기운을 깊이 풀이하시오.
- intro: 위에서 읽은 일간 오행을 명시하며 "~한 사주로" 형식 한 문장 요약.
- callout: 실제 오행 분포와 신강·신약 판단 근거를 담은 핵심 한 문장.
- singang: "신강" 또는 "신약" (만세력 데이터 기반 판단)
- dominantEl: 8글자에서 가장 많은 오행 한 글자 (예: "목", "화", "토", "금", "수")
- paragraphs 3개: ①위에서 확인한 일간 오행(반드시 실제 일간 글자 언급)이 인생 전반에 새긴 기운과 타고난 에너지의 결 — 이 사람의 근본 성질과 삶을 대하는 방식을 깊고 풍부하게(6~8문장, 260자+) ②실제 오행 분포 숫자를 근거로 강한 기운·부족한 기운이 성격과 비즈니스 방식에 어떻게 드러나는지(6~8문장, 260자+) ③신강·신약 판단 근거(비겁·인성 개수 등 실제 데이터)와 비즈니스·파트너 관계에서 고스란히 드러나는 본바탕 — 의사결정 방식, 협력 스타일, 자기 표현 방식까지(6~8문장, 260자+). 홍연 말투(~이오/~하오/~겠소) 사용.

━━━ [myNature] __MY__님의 기질 ━━━
- keywords: __MY__님을 대표하는 기질 키워드 4~5개 (예: "추진력", "분석력", "독립심", "직관력").
- strengthDesc: 이 기질의 강점을 5~7문장(200자+)으로 서술. 비즈니스에서 어떤 면모로 작용하는지 구체적으로.
- shadowDesc: 이 기질의 그림자를 5~7문장(200자+)으로. 파트너 입장에서 어떻게 느껴질 수 있는지까지.

━━━ [myYongsin] __MY__님의 용신/희신/기신 ━━━
⚠ 이 섹션은 __MY__님 본인의 사주에 대한 내용이오. 상대방 얘기를 섞지 마시오.
- yongsinEl: 격국·억부 원리에 따라 이 사주의 용신 오행 1개 (목/화/토/금/수 중 택1).
- heusinEl: 용신을 도와 운의 흐름을 부드럽게 하는 희신 오행 1개.
- gisinEl: 이 사주에서 꺼리는 기신 오행 1개.
- yongsinReason: 용신 오행이 이 사주에서 어떤 역할을 하는지 한 줄 (15자 이내, 비즈니스 관점).
- heusinReason: 희신 오행이 이 사주에서 어떤 역할을 하는지 한 줄 (15자 이내, 비즈니스 관점).
- gisinReason: 기신 오행이 이 사주에서 어떤 역할을 하는지 한 줄 (15자 이내, 비즈니스 관점).
- desc: 용신·희신·기신 오행이 비즈니스와 파트너 관계에 어떤 영향을 미치는지 2~3문장으로 종합 서술.

━━━ [myBusinessStyle] __MY__님의 비즈니스 패턴 ━━━
- intro: __MY__님의 비즈니스 스타일 핵심 한 줄 (인상적인 문장으로).
- patternType: 비즈니스 유형명 (예: "선도형 리더", "전략형 파트너", "안정형 실행자", "직관형 기획자").
- patternIcon: 유형에 맞는 이모지 1개.
- paragraphs 3개 (홍연 말투):
  ① 비즈니스에서의 의사결정 방식과 협력 스타일 — __MY__님이 파트너·팀 관계에서 보여주는 행동 패턴을 구체적으로 (6~8문장, 250자+).
  ② 비즈니스 관계에서 반복되는 패턴과 파트너에게 기대하는 것 (6~8문장, 250자+).
  ③ 비즈니스에서 주의해야 할 점과 이 패턴을 인식했을 때 달라지는 것 (5~7문장, 220자+).`,
    2: `아래는 파트너 정보 섹션 데이터를 바탕으로 네 개 섹션을 작성하는 지시사항이오.

⚠️ 반드시 위 【파트너】 만세력 텍스트에서 다음 항목을 직접 읽어 풀이에 반영하시오:
  - 일간(日干): 사주팔자는 년주·월주·일주·시주 순서로 나열되오. 반드시 세 번째 기둥(일주)의 천간이 일간이오. 파트너 정보 섹션의 "⚑ 일간(일주 천간):" 값과 대조하여 확인하시오.
  - 오행 분포: 파트너의 8글자(천간 4자 + 지지 4자) 전체에서 각 글자의 오행을 아래 기준으로 변환한 뒤, 목·화·토·금·수 각각의 정확한 개수를 세시오.
    천간: 甲乙=목, 丙丁=화, 戊己=토, 庚辛=금, 壬癸=수
    지지: 寅卯=목, 巳午=화, 辰戌丑未=토, 申酉=금, 亥子=수
    반드시 8글자를 하나씩 확인하여 집계하시오. 틀린 개수를 풀이에 쓰는 것은 절대 금지.
  - 신강·신약: 일간을 생조하는 글자(비겁+인성)가 4개 이상이면 신강, 그 미만이면 신약으로 판단하시오.
  - 이 구체적 데이터를 근거로 intro·callout·singang·dominantEl·paragraphs를 작성하시오. 데이터와 다른 해석 금지.

[partnerWonguk 섹션 — 상대 원국 풀이]
- intro: 위에서 읽은 파트너의 일간 오행을 명시하며 "~한 사주로" 형식 한 문장 요약.
- callout: 실제 오행 분포와 신강·신약 판단 근거를 담은 핵심 한 문장.
- singang: "신강" 또는 "신약" (만세력 데이터 기반 판단)
- dominantEl: 8글자에서 가장 많은 오행 한 글자 (예: "목", "화", "토", "금", "수")
- paragraphs 3개: ①위에서 확인한 파트너 일간 오행(반드시 실제 일간 글자 언급)이 인생 전반에 새긴 기운과 타고난 에너지의 결 — 이 사람의 근본 성질과 삶을 대하는 방식을 깊고 풍부하게(6~8문장, 260자+) ②실제 오행 분포 숫자를 근거로 강한 기운·부족한 기운이 성격과 비즈니스 방식에 어떻게 드러나는지(6~8문장, 260자+) ③신강·신약 판단 근거(비겁·인성 개수 등 실제 데이터)와 비즈니스·파트너 관계에서 고스란히 드러나는 본바탕 — 의사결정 방식, 협력 스타일, 자기 표현 방식까지(6~8문장, 260자+). 홍연 말투(~이오/~하오/~겠소) 사용.

[partnerNature 섹션 — 상대방의 기질]
- keywords: 상대를 대표하는 기질 키워드 4~5개.
- strengthDesc: 상대 기질의 빛(강점) — 비즈니스에서 어떤 강점으로 작용하는지 5~7문장(200자+).
- shadowDesc: 상대 기질의 그림자(주의점) — 비즈니스 파트너 입장에서 어떻게 느껴질 수 있는지 5~7문장(200자+).

[partnerYongsin 섹션 — 상대방의 용신/희신/기신]
⚠ 이 섹션은 상대방 본인의 사주에 대한 내용이오. __MY__님 얘기를 섞지 마시오.
- yongsinEl: 격국·억부 원리에 따라 이 사주의 용신 오행 1개 (목/화/토/금/수 중 택1).
- heusinEl: 용신을 도와 운의 흐름을 부드럽게 하는 희신 오행 1개.
- gisinEl: 이 사주에서 꺼리는 기신 오행 1개.
- yongsinReason: 용신 오행이 이 사주에서 어떤 역할을 하는지 한 줄 (15자 이내, 비즈니스 관점).
- heusinReason: 희신 오행이 이 사주에서 어떤 역할을 하는지 한 줄 (15자 이내, 비즈니스 관점).
- gisinReason: 기신 오행이 이 사주에서 어떤 역할을 하는지 한 줄 (15자 이내, 비즈니스 관점).
- desc: 용신·희신·기신 오행이 비즈니스와 파트너 관계에 어떤 영향을 미치는지 2~3문장으로 종합 서술.

[partnerBusinessStyle 섹션 — 상대방의 비즈니스 패턴]
- intro: 상대방의 비즈니스 스타일 핵심 한 줄 (인상적인 문장으로).
- patternType: 비즈니스 유형명 (예: "보호형 리더", "자유형 기획자", "감성형 조율자").
- patternIcon: 유형에 맞는 이모지 1개.
- paragraphs 3개 (홍연 말투):
  ① 비즈니스에서의 의사결정·협력 스타일, 파트너에게 기대하는 것 (5~7문장, 220자+).
  ② 비즈니스 관계에서 반복될 수 있는 패턴과 그것이 파트너에게 어떻게 보이는가 (5~7문장, 220자+).
  ③ 이 패턴을 가진 상대와 좋은 비즈니스 파트너가 되는 법 (5~7문장, 220자+).`,
    3: `[hapList 섹션 — 합 목록]
items 2~4개: 두 사람 사주에서 발견되는 합(合). 실제 명식에서 존재하는 합만 기재.
각 item:
- type: 합의 구체적 종류 (예: "갑기합", "을경합", "자축합", "인오술삼합"). 천간합·지지합·삼합 이름으로.
- effect: 이 합이 비즈니스 파트너십에서 구체적으로 어떤 장면·협력을 만드는지 한 줄 (예: "함께 일하면 자연스럽게 역할이 맞아떨어지오"). 홍연 말투.
- desc: 이 합이 두 사람 비즈니스 관계에서 어떤 의미인지 3~5문장. 어떤 업무 상황에서 두 사람의 기운이 통하는지, 어떤 협력·시너지가 자연스럽게 생기는지 구체적으로. 홍연 말투(~이오/~하오/~겠소).

[chungList 섹션 — 충 목록]
items 0~3개: 두 사람 사주에서 발견되는 충(沖). 실제 명식에서 없으면 빈 배열 [].
각 item:
- type: 충의 구체적 종류 (예: "자오충", "묘유충", "인신충", "사해충").
- impact: 이 충이 비즈니스 파트너십에서 어떤 장면·갈등을 만드는지 한 줄. 홍연 말투.
- desc: 이 충이 두 사람 비즈니스 관계에서 어떤 의미인지 3~5문장. 어떤 상황에서 갈등이 생기는지, 그러나 동시에 어떤 에너지와 자극이 되는지 균형 있게. 홍연 말투(~이오/~하오/~겠소).
- resolve: 이 충을 사업 파트너십에서 다스리는 실질적 방법 한 줄. 홍연 말투.

[overallScore 섹션 — 종합 점수]
- score: 0~100 사이 정수. 합의 개수·강도와 충의 개수·강도를 종합하여 산출.
- label: 점수에 맞는 한 줄 라벨 (예: "천생 파트너", "강한 시너지", "노력이 필요한 조합", "갈등이 많은 조합").
- desc: 합·충을 종합한 비즈니스 궁합 분석 4~5문장. 합과 충의 비율, 전체 관계 에너지, 이 점수가 나온 사주적 근거, 비즈니스 파트너십의 전체적인 방향성. 홍연 말투(~이오/~하오/~겠소).`,
    4: `[compatScore 섹션 — 비즈니스 궁합 점수]
- score: 0~100 사이 정수. 두 사람 사주의 오행 상생·상극, 합충, 일간 관계를 종합하여 산출.
- label: 점수에 맞는 한 줄 라벨 (예: "천생 비즈니스 파트너", "강한 시너지 조합", "노력이 필요한 인연", "도전적 파트너십").
- basis: 이 점수가 나온 사주적 핵심 근거 한 줄.
- paragraphs 4개: ①두 사람 사주 오행·십성에서 비즈니스 시너지를 만드는 구조적 이유 — 어떤 기운이 어떻게 맞물려 협력을 끌어내는지 구체적으로(8~10문장, 350자+) ②두 사람이 함께 일할 때 자연스럽게 생기는 역할 분담과 업무 분위기 — 실제 협업 장면을 그려가며(8~10문장, 350자+) ③이 비즈니스 인연에서 특히 주의해야 할 갈등 요소와 극복 방법(6~8문장, 280자+) ④이 비즈니스 인연이 빛나는 조건과 홍연의 당부(6~8문장, 260자+). 두 사람을 이름+님으로 직접 지칭. 홍연 말투(~이오/~하오/~겠소).

[compatReason 섹션 — 궁합의 근거]
- intro: 두 사람 비즈니스 궁합의 핵심 한 줄.
- callout: 오행·십성·합충 기반 핵심 근거 한 문장.
- paragraphs 2개: ①합충·오행 상생상극의 구체적 사주 근거(5~7문장, 220자+) ②비즈니스 관계 전체 방향성과 조언(4~6문장, 180자+). 홍연 말투.

[strengths 섹션 — 강점] items 3개, 각 item: title+effect(강점이 발휘되는 비즈니스 장면 한 줄)+desc(3~4문장, 홍연 말투)
[weaknesses 섹션 — 약점] items 3개, 각 item: title+overcome(극복 방향 한 줄)+desc(3~4문장, 홍연 말투)
[balanceTip 섹션] callout(핵심 조언 한 줄)+tips 3개(title+desc, 각 2~3문장, 홍연 말투)`,
    5: `두 사람이 함께 일하면 어떤 파트너가 될지 풀어주시오. bizStyle: 파트너십 유형명(coupleType)+아이콘(coupleIcon)+풀이단락(3개), roleBalance: 역할분담(4-5개, role+icon+myRatio(0-100)+desc), workLife: 협업 일상 관찰 클립(3개, situation+myReaction+partnerReaction)`,
    6: `두 사람의 비즈니스 스타일 차이를 풀어주시오. myStyle: 나의 비즈니스 스타일(label+icon+keywords 3-4개+styleDesc+strengthStyle[파트너십에서 빛나는 점]+shadowStyle[주의할 패턴]), partnerStyle: 상대방 비즈니스 스타일(동일 구조), styleGap: 스타일 궁합(compatRating[매우 잘 맞음/잘 맞음/보통/주의]+compatIcon+paragraphs 2-3개+tips 3-4개)`,
    7: `두 사람의 사업 파트너십에서 빛(강점)과 그림자(갈등)를 풀어주시오. strengths: 파트너십 강점 items(3개, icon+title+desc+effect[빛나는 장면])+lightSummary, shadows: 파트너십 그림자 items(3개, icon+title+desc+trigger[발생상황]+overcome[극복법])+shadowSummary, balance: 빛 비율(lightRatio 0-100)+풀이단락(2-3개)+균형 팁(3-4개)`,
    8: `두 사람의 사업 파트너십 갈등 패턴과 위기 요인, 극복 방법을 풀어주시오. conflictPattern: 갈등 유형(triggerType+triggerIcon+callout+patterns 2-3개+reconcile+growthTip), crisisPoints: 위기 요인(items 3개, icon+title+desc+basis+signal), overcomeTips: 극복 방법(items 3개, icon+title+desc+tip), recoveryGuide: 극복 원칙(callout+principles 3개+paragraphs 1-2개)`,
    9: `두 사람이 함께 사업할 때의 재물흐름과 파트너십 관계를 풀어주시오. wealthFlow: 향후 50년 재물흐름(flowGraph: 2025~2070 주요연도 점수+note, flowPeriods: 구간별 흐름 3-5개, wealthType+wealthIcon+callout, dominance: 재정주도권(myRatio 0-100), paragraphs 2-3개), homeLife: 파트너십 관계유형(partnerType+partnerIcon+callout+keywords 3-5개+aspects 3-4개+paragraphs), wealthTips: 재물운 실천 조언(tips 3-4개, icon+title+desc)`,
    10: `두 사람의 사업 흐름에서 성공 가능성과 실천 조언을 풀어주시오. bizFutureFlow: 성공 가능성 예측(successGuess: successRatio 0-100+basis+note, paragraphs 2-3개), bizFutureTips: 사업 흐름 조언(tips 3-4개, icon+title+desc)`,
    11: `__MY__과 __PT__에게 홍연의 따뜻한 편지를 써주시오(3-5단락, ~이오/~하오 말투)`,
  };

  const user = `${intro}${honorificBlock}\n\n비즈니스궁합 결과지 제${chapter}장을 작성하시오.\n\n${questions[chapter]}\n\n반드시 아래 JSON 형식으로만 응답하시오:\n${schemas[chapter]}`;
  return { system: SYSTEM, user };
}

