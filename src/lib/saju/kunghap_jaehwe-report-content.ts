// =====================================================
// 재회궁합 결과지 — 장별 콘텐츠 타입 / 프롬프트 빌더
// =====================================================

import { SYSTEM } from "./report-prompts";
import { parseContentJson } from "./report-content";
export { parseContentJson };
export { SYSTEM };

export const JAEHWE_KUNGHAP_CHAPTER_SECTIONS: Record<number, string[]> = {
  1:  ["myWonguk", "myNature", "myRelationStyle"],
  2:  ["partnerWonguk", "partnerNature", "partnerRelationStyle"],
  3:  ["reconnectScore", "reconnectReason"],
  4:  ["breakupCause", "breakupPattern", "healingDesc"],
  5:  ["changeDesc", "growthItems", "readyCheck"],
  6:  ["hapList", "chungList", "overallScore"],
  7:  ["emotionalFlow", "trustRebuild", "reconcileTips"],
  8:  ["obstacleItems", "obstacleReason", "overcomeTips"],
  9:  ["crisisScore", "crisisReason", "crisisTips"],
  10: ["goodTimeFlow", "goodTimeItems", "timingAdvice"],
  11: ["futureFlow", "reunionVision", "finalMessage"],
  12: ["letter"],
};

export function isJaehweKunghapChapterReady(
  content: Record<string, unknown> | null | undefined,
  chapter: number,
): boolean {
  if (!content) return false;
  const keys = JAEHWE_KUNGHAP_CHAPTER_SECTIONS[chapter];
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

export function buildJaehweKunghapChapterPrompt(
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
  const intro = `본인 정보:\n이름: ${input.name}（${genderLabel}）\n${input.manseryeokText}\n\n상대방 정보:\n이름: ${input.partnerName}（${partnerGenderLabel}）\n${input.partnerManseryeokText}`;

  const schemas: Record<number, string> = {
    1: `{"myWonguk":{"intro":"","callout":"","paragraphs":[]},"myNature":{"keywords":[],"desc":""},"myRelationStyle":{"intro":"","callout":"","paragraphs":[]}}`,
    2: `{"partnerWonguk":{"intro":"","callout":"","paragraphs":[]},"partnerNature":{"keywords":[],"desc":""},"partnerRelationStyle":{"intro":"","callout":"","paragraphs":[]}}`,
    3: `{"reconnectScore":{"score":65,"label":"","paragraphs":[]},"reconnectReason":{"intro":"","callout":"","paragraphs":[]}}`,
    4: `{"breakupCause":{"items":[{"title":"","desc":""}]},"breakupPattern":{"intro":"","callout":"","paragraphs":[]},"healingDesc":{"desc":""}}`,
    5: `{"changeDesc":{"intro":"","callout":"","paragraphs":[]},"growthItems":{"items":[{"title":"","desc":""}]},"readyCheck":{"desc":""}}`,
    6: `{"hapList":{"items":[{"type":"","desc":"","strength":""}]},"chungList":{"items":[]},"overallScore":{"score":68,"label":"","desc":""}}`,
    7: `{"emotionalFlow":{"intro":"","callout":"","paragraphs":[]},"trustRebuild":{"items":[{"title":"","desc":""}]},"reconcileTips":{"tips":[]}}`,
    8: `{"obstacleItems":{"items":[{"title":"","desc":""}]},"obstacleReason":{"intro":"","callout":"","paragraphs":[]},"overcomeTips":{"tips":[]}}`,
    9: `{"crisisScore":{"score":40,"label":"","paragraphs":[]},"crisisReason":{"intro":"","callout":"","paragraphs":[]},"crisisTips":{"tips":[]}}`,
    10: `{"goodTimeFlow":{"items":[{"label":"","desc":"","highlight":false}]},"goodTimeItems":{"items":[{"title":"","desc":""}]},"timingAdvice":{"desc":""}}`,
    11: `{"futureFlow":{"items":[{"label":"","icon":"💕","desc":""}]},"reunionVision":{"paragraphs":[]},"finalMessage":{"desc":""}}`,
    12: `{"letter":{"paragraphs":[]}}`,
  };

  const questions: Record<number, string> = {
    1: `${input.name}님의 사주 원국과 관계 스타일을 풀어주시오. myWonguk: 원국 요약, myNature: 기질(키워드3개+설명), myRelationStyle: 관계 방식`,
    2: `${input.partnerName}님의 사주 원국과 관계 스타일을 풀어주시오. partnerWonguk: 원국 요약, partnerNature: 기질(키워드3개+설명), partnerRelationStyle: 관계 방식`,
    3: `두 사람의 재회·재결합 가능성 점수(0-100)와 근거를 풀어주시오. reconnectScore: 점수+라벨+설명단락, reconnectReason: 근거 상세`,
    4: `두 사람이 헤어진 원인과 패턴, 치유 방향을 풀어주시오. breakupCause: 이별 원인(2-3개), breakupPattern: 이별 패턴 분석, healingDesc: 치유 방향`,
    5: `재회를 위해 두 사람이 얼마나 변화·성장했는지 풀어주시오. changeDesc: 변화 분석, growthItems: 성장 요소(2-3개), readyCheck: 재회 준비도 한 줄`,
    6: `두 사주의 합·충 관계를 분석하시오. hapList: 합(0개 이상), chungList: 충(없으면 빈배열), overallScore: 종합점수(0-100)`,
    7: `재회 후 감정 흐름과 신뢰 회복 방법을 풀어주시오. emotionalFlow: 감정 흐름 분석, trustRebuild: 신뢰 회복 요소(2-3개), reconcileTips: 재결합 조언(3-4개)`,
    8: `재회·재결합의 장애물과 극복 방법을 풀어주시오. obstacleItems: 장애물(2-3개), obstacleReason: 장애물 원인, overcomeTips: 극복 조언(3-4개)`,
    9: `재결합 후 다시 헤어질 위험과 대처 방법을 풀어주시오. crisisScore: 위기 점수(0-100)+설명, crisisReason: 위기 원인, crisisTips: 대처 조언(3-4개)`,
    10: `두 사람의 재회에 가장 좋은 시기를 풀어주시오. goodTimeFlow: 좋은 시기 흐름(3-5개), goodTimeItems: 이유(2-3개), timingAdvice: 한 줄 조언`,
    11: `재결합 후 두 사람의 미래 흐름과 비전을 풀어주시오. futureFlow: 미래 단계(3-5개), reunionVision: 재결합 후 미래(2-3단락), finalMessage: 마지막 한 줄`,
    12: `${input.name}님과 ${input.partnerName}님에게 홍연의 따뜻한 편지를 써주시오(3-5단락, ~이오/~하오 말투)`,
  };

  const user = `${intro}\n\n재회궁합 결과지 제${chapter}장을 작성하시오.\n\n${questions[chapter]}\n\n반드시 아래 JSON 형식으로만 응답하시오:\n${schemas[chapter]}`;
  return { system: SYSTEM, user };
}
