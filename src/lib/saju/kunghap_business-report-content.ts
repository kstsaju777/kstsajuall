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
  5:  ["strengthList", "weaknessList", "balanceDesc"],
  6:  ["rolesDesc", "roleConflict", "roleTips"],
  7:  ["moneyFlow", "profitCycle", "financeTips"],
  8:  ["conflictStyle", "triggerPoints", "resolveTips"],
  9:  ["crisisScore", "crisisReason", "crisisTips"],
  10: ["goodTimeFlow", "goodTimeItems", "timingAdvice"],
  11: ["futureFlow", "businessVision", "finalAdvice"],
  12: ["letter"],
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
    5: `{"strengthList":{"items":[{"title":"","desc":""}]},"weaknessList":{"items":[{"title":"","desc":""}]},"balanceDesc":{"desc":""}}`,
    6: `{"rolesDesc":{"intro":"","callout":"","paragraphs":[]},"roleConflict":{"items":[{"title":"","desc":""}]},"roleTips":{"tips":[]}}`,
    7: `{"moneyFlow":{"intro":"","callout":"","paragraphs":[]},"profitCycle":{"items":[{"label":"","desc":"","highlight":false}]},"financeTips":{"tips":[]}}`,
    8: `{"conflictStyle":{"intro":"","callout":"","paragraphs":[]},"triggerPoints":{"items":[{"title":"","desc":""}]},"resolveTips":{"tips":[]}}`,
    9: `{"crisisScore":{"score":35,"label":"","paragraphs":[]},"crisisReason":{"intro":"","callout":"","paragraphs":[]},"crisisTips":{"tips":[]}}`,
    10: `{"goodTimeFlow":{"items":[{"label":"","desc":"","highlight":false}]},"goodTimeItems":{"items":[{"title":"","desc":""}]},"timingAdvice":{"desc":""}}`,
    11: `{"futureFlow":{"items":[{"label":"","icon":"💼","desc":""}]},"businessVision":{"paragraphs":[]},"finalAdvice":{"desc":""}}`,
    12: `{"letter":{"paragraphs":[]}}`,
  };

  const questions: Record<number, string> = {
    1: `아래는 __MY__님의 사주 명식 데이터를 바탕으로 네 개 섹션을 작성하는 지시사항이오.

⚠️ 데이터 사용 원칙:
- 명식 데이터에 포함된 서버 확정값(일간, 오행 분포)을 그대로 사용하시오.
- 직접 세거나 재계산하는 것은 절대 금지. 확정값과 다른 숫자를 쓰는 것은 절대 금지.
- 신강·신약: 일간을 생조하는 글자(비겁+인성)가 4개 이상이면 신강, 미만이면 신약.

━━━ [myWonguk] __MY__님의 원국 ━━━
__MY__님의 타고난 사주 기운을 깊이 풀이하시오.
- intro: __MY__님의 일간 오행을 명시하며 "~한 사주로" 형식 한 문장 요약.
- callout: 오행 분포 확정값과 신강·신약 판단 근거를 담은 핵심 한 문장.
- singang: "신강" 또는 "신약"
- dominantEl: 확정값에서 가장 많은 오행 한 글자 (목/화/토/금/수 중 하나)
- paragraphs 3개 (각 6~8문장, 260자+, 홍연 말투):
  ① __MY__님의 일간 오행(반드시 실제 글자 명시)이 인생에 새긴 기운 — 근본 성질과 삶을 대하는 방식을 깊고 풍부하게.
  ② 오행 분포 확정값 숫자를 근거로 강한 기운·부족한 기운이 성격과 비즈니스 방식에 드러나는 방식.
  ③ 신강·신약 판단 근거(비겁·인성 개수 등 확정 데이터)와 비즈니스·파트너 관계에서 드러나는 본바탕 — 의사결정 방식, 협력 스타일, 자기 표현 방식까지.

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
    2: `[partnerWonguk 섹션 — 상대 원국 풀이]
⚠️ 상대방 명식 데이터에 서버가 사전 계산한 확정값이 제공되오. 반드시 그 값을 그대로 사용하시오. 직접 세거나 재계산하는 것은 절대 금지.
  - 일간(日干): 데이터의 "상대방 일간(日干) 확정값"을 그대로 사용하시오.
  - 오행 분포: 데이터의 "상대방 오행 분포 확정값"의 숫자를 그대로 사용하시오.
  - 신강·신약: 일간을 생조하는 글자(비겁+인성)가 4개 이상이면 신강, 그 미만이면 신약.
- intro: 위에서 읽은 상대의 일간 오행을 명시하며 "~한 사주로" 형식 한 문장 요약.
- callout: 실제 오행 분포와 신강·신약 판단 근거를 담은 핵심 한 문장.
- singang: "신강" 또는 "신약"
- dominantEl: 8글자에서 가장 많은 오행 한 글자 (목/화/토/금/수 중 하나)
- paragraphs 3개: ①상대의 일간 오행(반드시 실제 글자 언급)이 인생 전반에 새긴 기운과 삶을 대하는 방식(6~8문장, 260자+) ②실제 오행 분포 숫자를 근거로 강한 기운·부족한 기운이 성격과 비즈니스 방식에 드러나는 것(6~8문장, 260자+) ③신강·신약 판단 근거와 비즈니스·파트너 관계에서 드러나는 본바탕(6~8문장, 260자+). 홍연 말투(~이오/~하오/~겠소) 사용.

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
    3: `두 사주의 합·충 관계를 분석하시오. hapList: 합(0개 이상, 각 items: type·effect·desc), chungList: 충(0개 이상, 없으면 빈배열, 각 items: type·impact·desc·resolve), overallScore: 종합점수(0-100)+label+desc`,
    4: `두 사람이 비즈니스 파트너로 함께 일할 수 있는 인연인지 풀어주시오. compatScore: 점수(0-100)+라벨+basis(한 줄 핵심)+설명단락, compatReason: 근거 상세(intro+callout+단락), strengths: 강점(3개, title+effect+desc), weaknesses: 약점(3개, title+overcome+desc), balanceTip: 균형 가이드(callout+tips 3개)`,
    5: `두 사람이 협력할 때의 강점과 약점, 균형 방법을 풀어주시오. strengthList: 강점(3개), weaknessList: 약점(3개), balanceDesc: 균형 조언`,
    6: `두 사람의 역할 분담과 역할 충돌 가능성을 풀어주시오. rolesDesc: 역할 분담 방향, roleConflict: 충돌 요소(2-3개), roleTips: 조언(3-4개)`,
    7: `두 사람의 공동 재물 흐름과 수익 사이클을 풀어주시오. moneyFlow: 재물 흐름, profitCycle: 수익 좋은 시기(3-5개), financeTips: 재정 조언(3-4개)`,
    8: `두 사람이 갈등할 때의 패턴과 해결 방법을 풀어주시오. conflictStyle: 갈등 패턴, triggerPoints: 갈등 트리거(2-3개), resolveTips: 해결 조언(3-4개)`,
    9: `두 사람의 비즈니스 위기 가능성과 대처 방법을 풀어주시오. crisisScore: 위기 점수(0-100)+설명, crisisReason: 위기 원인, crisisTips: 대처 조언(3-4개)`,
    10: `두 사람에게 찾아올 비즈니스 호기(好機)를 풀어주시오. goodTimeFlow: 좋은 시기 흐름(3-5개), goodTimeItems: 이유(2-3개), timingAdvice: 한 줄 조언`,
    11: `두 사람의 비즈니스 미래 흐름과 비전을 풀어주시오. futureFlow: 미래 단계(3-5개), businessVision: 비전(2-3단락), finalAdvice: 마지막 한 줄`,
    12: `__MY__과 __PT__에게 홍연의 따뜻한 편지를 써주시오(3-5단락, ~이오/~하오 말투)`,
  };

  const user = `${intro}${honorificBlock}\n\n비즈니스궁합 결과지 제${chapter}장을 작성하시오.\n\n${questions[chapter]}\n\n반드시 아래 JSON 형식으로만 응답하시오:\n${schemas[chapter]}`;
  return { system: SYSTEM, user };
}

