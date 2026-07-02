// =====================================================
// 임신궁합 결과지 — 장별 콘텐츠 타입 / 프롬프트 빌더
// =====================================================

import { SYSTEM } from "./report-prompts";
import { parseContentJson } from "./report-content";
export { parseContentJson };
export { SYSTEM };

export const IMSHIN_KUNGHAP_CHAPTER_SECTIONS: Record<number, string[]> = {
  1:  ["myWonguk", "myNature", "myParentStyle"],
  2:  ["partnerWonguk", "partnerNature", "partnerParentStyle"],
  3:  ["pregnancyScore", "pregnancyReason"],
  4:  ["childEnergy", "childDesc", "parenthoodTips"],
  5:  ["timingFlow", "bestMonths", "timingAdvice"],
  6:  ["hapList", "chungList", "overallScore"],
  7:  ["healthMine", "healthPartner", "healthTips"],
  8:  ["emotionalBond", "supportStyle", "coupleTips"],
  9:  ["challengeItems", "challengeReason", "overcomeTips"],
  10: ["goodTimeFlow", "goodTimeItems", "cycleAdvice"],
  11: ["futureFlow", "parentVision", "finalMessage"],
  12: ["letter"],
};

export function isImshinKunghapChapterReady(
  content: Record<string, unknown> | null | undefined,
  chapter: number,
): boolean {
  if (!content) return false;
  const keys = IMSHIN_KUNGHAP_CHAPTER_SECTIONS[chapter];
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

export function buildImshinKunghapChapterPrompt(
  chapter: number,
  input: {
    name: string;
    gender: "male" | "female";
    manseryeokText: string;
    partnerName: string;
    partnerGender: "male" | "female";
    partnerManseryeokText: string;
    birthYear?: number;
  },
): { system: string; user: string } {
  const genderLabel = input.gender === "male" ? "남성" : "여성";
  const partnerGenderLabel = input.partnerGender === "male" ? "남성" : "여성";
  const intro = `본인 정보:\n이름: ${input.name}（${genderLabel}）\n${input.manseryeokText}\n\n배우자 정보:\n이름: ${input.partnerName}（${partnerGenderLabel}）\n${input.partnerManseryeokText}`;

  const schemas: Record<number, string> = {
    1: `{"myWonguk":{"intro":"","callout":"","paragraphs":[]},"myNature":{"keywords":[],"desc":""},"myParentStyle":{"intro":"","callout":"","paragraphs":[]}}`,
    2: `{"partnerWonguk":{"intro":"","callout":"","paragraphs":[]},"partnerNature":{"keywords":[],"desc":""},"partnerParentStyle":{"intro":"","callout":"","paragraphs":[]}}`,
    3: `{"pregnancyScore":{"score":72,"label":"","paragraphs":[]},"pregnancyReason":{"intro":"","callout":"","paragraphs":[]}}`,
    4: `{"childEnergy":{"keywords":[],"desc":""},"childDesc":{"intro":"","callout":"","paragraphs":[]},"parenthoodTips":{"tips":[]}}`,
    5: `{"timingFlow":{"items":[{"label":"","desc":"","highlight":false}]},"bestMonths":{"items":[{"title":"","desc":""}]},"timingAdvice":{"desc":""}}`,
    6: `{"hapList":{"items":[{"type":"","desc":"","strength":""}]},"chungList":{"items":[]},"overallScore":{"score":68,"label":"","desc":""}}`,
    7: `{"healthMine":{"items":[{"title":"","desc":""}]},"healthPartner":{"items":[{"title":"","desc":""}]},"healthTips":{"tips":[]}}`,
    8: `{"emotionalBond":{"intro":"","callout":"","paragraphs":[]},"supportStyle":{"desc":""},"coupleTips":{"tips":[]}}`,
    9: `{"challengeItems":{"items":[{"title":"","desc":""}]},"challengeReason":{"intro":"","callout":"","paragraphs":[]},"overcomeTips":{"tips":[]}}`,
    10: `{"goodTimeFlow":{"items":[{"label":"","desc":"","highlight":false}]},"goodTimeItems":{"items":[{"title":"","desc":""}]},"cycleAdvice":{"desc":""}}`,
    11: `{"futureFlow":{"items":[{"label":"","icon":"👶","desc":""}]},"parentVision":{"paragraphs":[]},"finalMessage":{"desc":""}}`,
    12: `{"letter":{"paragraphs":[]}}`,
  };

  const questions: Record<number, string> = {
    1: `${input.name}님의 사주 원국과 부모로서의 성향을 풀어주시오. myWonguk: 원국 요약, myNature: 기질(키워드3개+설명), myParentStyle: 부모 성향`,
    2: `${input.partnerName}님의 사주 원국과 부모로서의 성향을 풀어주시오. partnerWonguk: 원국 요약, partnerNature: 기질(키워드3개+설명), partnerParentStyle: 부모 성향`,
    3: `두 사람의 임신·출산 궁합 점수(0-100)와 근거를 풀어주시오. pregnancyScore: 점수+라벨+설명단락, pregnancyReason: 근거 상세`,
    4: `두 사람 사이에 태어날 자녀의 기운과 특성, 양육 팁을 풀어주시오. childEnergy: 자녀 기운(키워드3개+설명), childDesc: 자녀 특성 상세, parenthoodTips: 양육 조언(3-4개)`,
    5: `임신·출산에 가장 좋은 시기를 풀어주시오. timingFlow: 시기 흐름(3-5개), bestMonths: 좋은 달(2-3개), timingAdvice: 한 줄 조언`,
    6: `두 사주의 합·충 관계를 분석하시오. hapList: 합(0개 이상), chungList: 충(없으면 빈배열), overallScore: 종합점수(0-100)`,
    7: `임신·출산 시기의 두 사람 건강 주의사항을 풀어주시오. healthMine: 본인 건강 주의(2-3개), healthPartner: 파트너 건강 주의(2-3개), healthTips: 건강 관리 조언(3-4개)`,
    8: `임신·출산 과정에서의 감정적 유대와 지지 방법을 풀어주시오. emotionalBond: 감정 유대 분석, supportStyle: 지지 방식 설명, coupleTips: 부부 관계 조언(3-4개)`,
    9: `임신·출산 과정에서 겪을 수 있는 어려움과 극복 방법을 풀어주시오. challengeItems: 어려움(2-3개), challengeReason: 원인 분석, overcomeTips: 극복 조언(3-4개)`,
    10: `두 사람에게 찾아올 임신·출산의 좋은 시기를 풀어주시오. goodTimeFlow: 좋은 시기 흐름(3-5개), goodTimeItems: 이유(2-3개), cycleAdvice: 한 줄 조언`,
    11: `두 사람의 부모로서의 미래와 비전을 풀어주시오. futureFlow: 미래 단계(3-5개), parentVision: 부모로서의 비전(2-3단락), finalMessage: 마지막 한 줄`,
    12: `${input.name}님과 ${input.partnerName}님에게 홍연의 따뜻한 편지를 써주시오(3-5단락, ~이오/~하오 말투)`,
  };

  const user = `${intro}\n\n임신궁합 결과지 제${chapter}장을 작성하시오.\n\n${questions[chapter]}\n\n반드시 아래 JSON 형식으로만 응답하시오:\n${schemas[chapter]}`;
  return { system: SYSTEM, user };
}
