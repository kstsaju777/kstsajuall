// =====================================================
// 비즈니스궁합 결과지 — 장별 콘텐츠 타입 / 프롬프트 빌더
// =====================================================

import { SYSTEM } from "./report-prompts";
import { parseContentJson } from "./report-content";
export { parseContentJson };
export { SYSTEM };

export const BUSINESS_KUNGHAP_CHAPTER_SECTIONS: Record<number, string[]> = {
  1:  ["myWonguk", "myNature", "myBusinessStyle"],
  2:  ["partnerWonguk", "partnerNature", "partnerBusinessStyle"],
  3:  ["compatScore", "compatReason"],
  4:  ["strengthList", "weaknessList", "balanceDesc"],
  5:  ["rolesDesc", "roleConflict", "roleTips"],
  6:  ["hapList", "chungList", "overallScore"],
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
  },
): { system: string; user: string } {
  const genderLabel = input.gender === "male" ? "남성" : "여성";
  const partnerGenderLabel = input.partnerGender === "male" ? "남성" : "여성";
  const intro = `본인 정보:\n이름: ${input.name}（${genderLabel}）\n${input.manseryeokText}\n\n파트너 정보:\n이름: ${input.partnerName}（${partnerGenderLabel}）\n${input.partnerManseryeokText}`;

  const schemas: Record<number, string> = {
    1: `{"myWonguk":{"intro":"","callout":"","paragraphs":[]},"myNature":{"keywords":[],"desc":""},"myBusinessStyle":{"intro":"","callout":"","paragraphs":[]}}`,
    2: `{"partnerWonguk":{"intro":"","callout":"","paragraphs":[]},"partnerNature":{"keywords":[],"desc":""},"partnerBusinessStyle":{"intro":"","callout":"","paragraphs":[]}}`,
    3: `{"compatScore":{"score":72,"label":"","paragraphs":[]},"compatReason":{"intro":"","callout":"","paragraphs":[]}}`,
    4: `{"strengthList":{"items":[{"title":"","desc":""}]},"weaknessList":{"items":[{"title":"","desc":""}]},"balanceDesc":{"desc":""}}`,
    5: `{"rolesDesc":{"intro":"","callout":"","paragraphs":[]},"roleConflict":{"items":[{"title":"","desc":""}]},"roleTips":{"tips":[]}}`,
    6: `{"hapList":{"items":[{"type":"","desc":"","strength":""}]},"chungList":{"items":[]},"overallScore":{"score":68,"label":"","desc":""}}`,
    7: `{"moneyFlow":{"intro":"","callout":"","paragraphs":[]},"profitCycle":{"items":[{"label":"","desc":"","highlight":false}]},"financeTips":{"tips":[]}}`,
    8: `{"conflictStyle":{"intro":"","callout":"","paragraphs":[]},"triggerPoints":{"items":[{"title":"","desc":""}]},"resolveTips":{"tips":[]}}`,
    9: `{"crisisScore":{"score":35,"label":"","paragraphs":[]},"crisisReason":{"intro":"","callout":"","paragraphs":[]},"crisisTips":{"tips":[]}}`,
    10: `{"goodTimeFlow":{"items":[{"label":"","desc":"","highlight":false}]},"goodTimeItems":{"items":[{"title":"","desc":""}]},"timingAdvice":{"desc":""}}`,
    11: `{"futureFlow":{"items":[{"label":"","icon":"💼","desc":""}]},"businessVision":{"paragraphs":[]},"finalAdvice":{"desc":""}}`,
    12: `{"letter":{"paragraphs":[]}}`,
  };

  const questions: Record<number, string> = {
    1: `${input.name}님의 사주 원국과 비즈니스 스타일을 풀어주시오. myWonguk: 원국 요약, myNature: 기질(키워드3개+설명), myBusinessStyle: 비즈니스 성향`,
    2: `${input.partnerName}님의 사주 원국과 비즈니스 스타일을 풀어주시오. partnerWonguk: 원국 요약, partnerNature: 기질(키워드3개+설명), partnerBusinessStyle: 비즈니스 성향`,
    3: `두 사람의 비즈니스 궁합 점수(0-100)와 근거를 풀어주시오. compatScore: 점수+라벨+설명단락, compatReason: 근거 상세`,
    4: `두 사람이 협력할 때의 강점과 약점, 균형 방법을 풀어주시오. strengthList: 강점(3개), weaknessList: 약점(3개), balanceDesc: 균형 조언`,
    5: `두 사람의 역할 분담과 역할 충돌 가능성을 풀어주시오. rolesDesc: 역할 분담 방향, roleConflict: 충돌 요소(2-3개), roleTips: 조언(3-4개)`,
    6: `두 사주의 합·충 관계를 분석하시오. hapList: 합(0개 이상), chungList: 충(0개 이상, 없으면 빈배열), overallScore: 종합점수(0-100)`,
    7: `두 사람의 공동 재물 흐름과 수익 사이클을 풀어주시오. moneyFlow: 재물 흐름, profitCycle: 수익 좋은 시기(3-5개), financeTips: 재정 조언(3-4개)`,
    8: `두 사람이 갈등할 때의 패턴과 해결 방법을 풀어주시오. conflictStyle: 갈등 패턴, triggerPoints: 갈등 트리거(2-3개), resolveTips: 해결 조언(3-4개)`,
    9: `두 사람의 비즈니스 위기 가능성과 대처 방법을 풀어주시오. crisisScore: 위기 점수(0-100)+설명, crisisReason: 위기 원인, crisisTips: 대처 조언(3-4개)`,
    10: `두 사람에게 찾아올 비즈니스 호기(好機)를 풀어주시오. goodTimeFlow: 좋은 시기 흐름(3-5개), goodTimeItems: 이유(2-3개), timingAdvice: 한 줄 조언`,
    11: `두 사람의 비즈니스 미래 흐름과 비전을 풀어주시오. futureFlow: 미래 단계(3-5개), businessVision: 비전(2-3단락), finalAdvice: 마지막 한 줄`,
    12: `${input.name}님과 ${input.partnerName}님에게 홍연의 따뜻한 편지를 써주시오(3-5단락, ~이오/~하오 말투)`,
  };

  const user = `${intro}\n\n비즈니스궁합 결과지 제${chapter}장을 작성하시오.\n\n${questions[chapter]}\n\n반드시 아래 JSON 형식으로만 응답하시오:\n${schemas[chapter]}`;
  return { system: SYSTEM, user };
}
