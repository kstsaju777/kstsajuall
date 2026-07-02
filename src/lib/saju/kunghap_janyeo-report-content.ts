// =====================================================
// 자녀궁합 결과지 — 장별 콘텐츠 타입 / 프롬프트 빌더
// =====================================================

import { SYSTEM } from "./report-prompts";
import { parseContentJson } from "./report-content";
export { parseContentJson };
export { SYSTEM };

export const JANYEO_KUNGHAP_CHAPTER_SECTIONS: Record<number, string[]> = {
  1:  ["myWonguk", "myNature", "myParentStyle"],
  2:  ["childWonguk", "childNature", "childPersonality"],
  3:  ["bondScore", "bondReason"],
  4:  ["myView", "childViewDesc"],
  5:  ["childTemper", "childHabits", "childNeeds"],
  6:  ["hapList", "chungList", "overallScore"],
  7:  ["lifePattern", "dailyRhythm", "livingTips"],
  8:  ["educationStyle", "learningTraits", "educationTips"],
  9:  ["crisisScore", "crisisReason", "crisisTips"],
  10: ["goodTimeFlow", "goodTimeItems", "timingAdvice"],
  11: ["futureFlow", "childVision", "finalMessage"],
  12: ["letter"],
};

export function isJanyeoKunghapChapterReady(
  content: Record<string, unknown> | null | undefined,
  chapter: number,
): boolean {
  if (!content) return false;
  const keys = JANYEO_KUNGHAP_CHAPTER_SECTIONS[chapter];
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

export function buildJanyeoKunghapChapterPrompt(
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
  const childGenderLabel = input.partnerGender === "male" ? "아들" : "딸";
  const intro = `부모 정보:\n이름: ${input.name}（${genderLabel}）\n${input.manseryeokText}\n\n자녀 정보:\n이름: ${input.partnerName}（${childGenderLabel}）\n${input.partnerManseryeokText}`;

  const schemas: Record<number, string> = {
    1: `{"myWonguk":{"intro":"","callout":"","paragraphs":[]},"myNature":{"keywords":[],"desc":""},"myParentStyle":{"intro":"","callout":"","paragraphs":[]}}`,
    2: `{"childWonguk":{"intro":"","callout":"","paragraphs":[]},"childNature":{"keywords":[],"desc":""},"childPersonality":{"intro":"","callout":"","paragraphs":[]}}`,
    3: `{"bondScore":{"score":78,"label":"","paragraphs":[]},"bondReason":{"intro":"","callout":"","paragraphs":[]}}`,
    4: `{"myView":{"intro":"","callout":"","paragraphs":[]},"childViewDesc":{"intro":"","callout":"","paragraphs":[]}}`,
    5: `{"childTemper":{"keywords":[],"desc":""},"childHabits":{"items":[{"title":"","desc":""}]},"childNeeds":{"tips":[]}}`,
    6: `{"hapList":{"items":[{"type":"","desc":"","strength":""}]},"chungList":{"items":[]},"overallScore":{"score":72,"label":"","desc":""}}`,
    7: `{"lifePattern":{"intro":"","callout":"","paragraphs":[]},"dailyRhythm":{"items":[{"title":"","desc":""}]},"livingTips":{"tips":[]}}`,
    8: `{"educationStyle":{"intro":"","callout":"","paragraphs":[]},"learningTraits":{"items":[{"title":"","desc":""}]},"educationTips":{"tips":[]}}`,
    9: `{"crisisScore":{"score":30,"label":"","paragraphs":[]},"crisisReason":{"intro":"","callout":"","paragraphs":[]},"crisisTips":{"tips":[]}}`,
    10: `{"goodTimeFlow":{"items":[{"label":"","desc":"","highlight":false}]},"goodTimeItems":{"items":[{"title":"","desc":""}]},"timingAdvice":{"desc":""}}`,
    11: `{"futureFlow":{"items":[{"label":"","icon":"🌱","desc":""}]},"childVision":{"paragraphs":[]},"finalMessage":{"desc":""}}`,
    12: `{"letter":{"paragraphs":[]}}`,
  };

  const questions: Record<number, string> = {
    1: `${input.name}님의 사주 원국과 부모로서의 성향을 풀어주시오. myWonguk: 원국 요약, myNature: 기질(키워드3개+설명), myParentStyle: 부모 성향`,
    2: `자녀 ${input.partnerName}의 사주 원국과 성격·기질을 풀어주시오. childWonguk: 원국 요약, childNature: 기질(키워드3개+설명), childPersonality: 성격 특성`,
    3: `부모와 자녀의 인연 점수(0-100)와 근거를 풀어주시오. bondScore: 점수+라벨+설명단락, bondReason: 근거 상세`,
    4: `부모가 자녀를 어떻게 바라보는지, 자녀는 부모를 어떻게 느끼는지 풀어주시오. myView: 부모의 시각, childViewDesc: 자녀의 느낌`,
    5: `자녀의 기질·습관·필요를 상세히 풀어주시오. childTemper: 기질(키워드3개+설명), childHabits: 주요 특성(3-4개), childNeeds: 돌봄 포인트(3-4개)`,
    6: `두 사주의 합·충 관계를 분석하시오. hapList: 합(0개 이상), chungList: 충(없으면 빈배열), overallScore: 종합점수(0-100)`,
    7: `부모와 자녀의 일상 생활 패턴과 함께하는 삶을 풀어주시오. lifePattern: 생활 리듬 궁합, dailyRhythm: 일상 요소(3-4개), livingTips: 생활 조언(3-4개)`,
    8: `자녀의 학습 스타일과 교육 방향을 풀어주시오. educationStyle: 학습 성향 분석, learningTraits: 학습 특성(2-3개), educationTips: 교육 조언(3-4개)`,
    9: `부모-자녀 관계의 위기 시기와 대처 방법을 풀어주시오. crisisScore: 위기 점수(0-100)+설명, crisisReason: 위기 원인, crisisTips: 대처 조언(3-4개)`,
    10: `부모-자녀가 함께 빛나는 시기를 풀어주시오. goodTimeFlow: 좋은 시기 흐름(3-5개), goodTimeItems: 이유(2-3개), timingAdvice: 한 줄 조언`,
    11: `자녀의 미래 흐름과 부모로서의 비전을 풀어주시오. futureFlow: 미래 단계(3-5개), childVision: 자녀의 미래(2-3단락), finalMessage: 마지막 한 줄`,
    12: `${input.name}님과 자녀 ${input.partnerName}에게 홍연의 따뜻한 편지를 써주시오(3-5단락, ~이오/~하오 말투)`,
  };

  const user = `${intro}\n\n자녀궁합 결과지 제${chapter}장을 작성하시오.\n\n${questions[chapter]}\n\n반드시 아래 JSON 형식으로만 응답하시오:\n${schemas[chapter]}`;
  return { system: SYSTEM, user };
}
