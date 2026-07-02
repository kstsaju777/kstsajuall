// =====================================================
// 반려궁합 결과지 — 장별 콘텐츠 타입 / 프롬프트 빌더
// =====================================================

import { SYSTEM } from "./report-prompts";
import { parseContentJson } from "./report-content";
export { parseContentJson };
export { SYSTEM };

// 장별 필수 필드 목록
export const BANRYEO_KUNGHAP_CHAPTER_SECTIONS: Record<number, string[]> = {
  1:  ["myWonguk", "myNature", "myPetStyle"],
  2:  ["petWonguk", "petNature", "petPersonality"],
  3:  ["bondScore", "bondReason"],
  4:  ["myView", "petViewDesc"],
  5:  ["petTemper", "petHabits", "petCareNeeds"],
  6:  ["hapList", "chungList", "overallScore"],
  7:  ["lifePattern", "dailyRhythm", "livingTips"],
  8:  ["healthRisk", "healthCycle", "careTips"],
  9:  ["crisisScore", "crisisReason", "crisisTips"],
  10: ["goodTimeFlow", "goodTimeItems", "timingAdvice"],
  11: ["futureFlow", "farewell", "finalMessage"],
  12: ["letter"],
};

// 장별 필드 유효성 검사
export function isBanryeoKunghapChapterReady(
  content: Record<string, unknown> | null | undefined,
  chapter: number,
): boolean {
  if (!content) return false;
  const keys = BANRYEO_KUNGHAP_CHAPTER_SECTIONS[chapter];
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
      if (typeof obj.mine === "object") return true;
    }
    return false;
  });
}

// 장별 프롬프트 빌더
export function buildBanryeoKunghapChapterPrompt(
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
  const petGenderLabel = input.partnerGender === "male" ? "수컷" : "암컷";
  const intro = `보호자 정보:\n이름: ${input.name}（${genderLabel}）\n${input.manseryeokText}\n\n반려동물 정보:\n이름: ${input.partnerName}（${petGenderLabel}）\n${input.partnerManseryeokText}`;

  const schemas: Record<number, string> = {
    1: `{
  "myWonguk": { "intro": "한 줄 요약", "callout": "핵심 한 문장", "paragraphs": ["단락1", "단락2"] },
  "myNature": { "keywords": ["키워드1", "키워드2", "키워드3"], "desc": "두 세 줄 풀이" },
  "myPetStyle": { "intro": "한 줄 요약", "callout": "핵심 한 문장", "paragraphs": ["단락1", "단락2"] }
}`,
    2: `{
  "petWonguk": { "intro": "한 줄 요약", "callout": "핵심 한 문장", "paragraphs": ["단락1", "단락2"] },
  "petNature": { "keywords": ["키워드1", "키워드2", "키워드3"], "desc": "두 세 줄 풀이" },
  "petPersonality": { "intro": "한 줄 요약", "callout": "핵심 한 문장", "paragraphs": ["단락1", "단락2"] }
}`,
    3: `{
  "bondScore": { "score": 72, "label": "깊은 인연이오", "paragraphs": ["단락1", "단락2"] },
  "bondReason": { "intro": "한 줄 요약", "callout": "핵심 한 문장", "paragraphs": ["단락1", "단락2"] }
}`,
    4: `{
  "myView": { "intro": "한 줄 요약", "callout": "핵심 한 문장", "paragraphs": ["단락1", "단락2"] },
  "petViewDesc": { "intro": "한 줄 요약", "callout": "핵심 한 문장", "paragraphs": ["단락1", "단락2"] }
}`,
    5: `{
  "petTemper": { "keywords": ["키워드1", "키워드2", "키워드3"], "desc": "두 세 줄 풀이" },
  "petHabits": { "items": [{ "title": "특성명", "desc": "설명" }] },
  "petCareNeeds": { "tips": ["팁1", "팁2", "팁3"] }
}`,
    6: `{
  "hapList": { "items": [{ "type": "합의 종류", "desc": "설명", "strength": "강도" }] },
  "chungList": { "items": [{ "type": "충의 종류", "desc": "설명", "strength": "강도" }] },
  "overallScore": { "score": 68, "label": "잘 맞는 인연이오", "desc": "한 줄 풀이" }
}`,
    7: `{
  "lifePattern": { "intro": "한 줄 요약", "callout": "핵심 한 문장", "paragraphs": ["단락1", "단락2"] },
  "dailyRhythm": { "items": [{ "title": "리듬 요소", "desc": "설명" }] },
  "livingTips": { "tips": ["팁1", "팁2", "팁3"] }
}`,
    8: `{
  "healthRisk": { "items": [{ "title": "위험 요소", "desc": "설명" }] },
  "healthCycle": { "intro": "한 줄 요약", "callout": "핵심 한 문장", "paragraphs": ["단락1", "단락2"] },
  "careTips": { "tips": ["팁1", "팁2", "팁3"] }
}`,
    9: `{
  "crisisScore": { "score": 40, "label": "이별 위험이 있는 시기가 있소", "paragraphs": ["단락1", "단락2"] },
  "crisisReason": { "intro": "한 줄 요약", "callout": "핵심 한 문장", "paragraphs": ["단락1", "단락2"] },
  "crisisTips": { "tips": ["팁1", "팁2", "팁3"] }
}`,
    10: `{
  "goodTimeFlow": { "items": [{ "label": "시기", "desc": "설명", "highlight": true }] },
  "goodTimeItems": { "items": [{ "title": "좋은 시기 이유", "desc": "설명" }] },
  "timingAdvice": { "desc": "한 줄 조언" }
}`,
    11: `{
  "futureFlow": { "items": [{ "label": "단계", "icon": "🐾", "desc": "설명" }] },
  "farewell": { "paragraphs": ["단락1", "단락2"] },
  "finalMessage": { "desc": "마지막 한 줄 메시지" }
}`,
    12: `{
  "letter": { "paragraphs": ["편지 단락1", "편지 단락2", "편지 단락3"] }
}`,
  };

  const questions: Record<number, string> = {
    1: `보호자 ${input.name}님의 사주 원국과 반려동물을 대하는 성향을 풀어주시오.
- myWonguk: 보호자의 전반적인 사주 원국 요약
- myNature: 보호자의 기질과 성격 (키워드 3개 + 설명)
- myPetStyle: 반려동물을 대하는 방식과 성향`,

    2: `반려동물 ${input.partnerName}의 사주 원국과 성격·기질을 풀어주시오.
- petWonguk: 반려동물의 사주 원국 요약 (동물의 사주로 접근)
- petNature: 반려동물의 기질 (키워드 3개 + 설명)
- petPersonality: 반려동물의 성격과 특성`,

    3: `두 사람(보호자 + 반려동물)의 인연 깊이와 연결성을 풀어주시오.
- bondScore: 인연 점수 (0-100)와 라벨, 설명 단락
- bondReason: 이 인연이 깊은/얕은 이유와 근거`,

    4: `보호자가 반려동물을 어떻게 바라보는지, 반려동물은 보호자를 어떻게 느끼는지 풀어주시오.
- myView: 보호자 눈에 반려동물이 어떤 존재로 느껴지는가
- petViewDesc: 반려동물이 보호자를 어떻게 느끼는가 (사주로 풀어서)`,

    5: `반려동물의 기질·습관·돌봄 필요를 상세히 풀어주시오.
- petTemper: 반려동물의 기질 (키워드 3개 + 설명)
- petHabits: 반려동물의 주요 습관과 특성 (3-4개 항목)
- petCareNeeds: 이 반려동물에게 필요한 돌봄 팁 (3-4개)`,

    6: `두 사주의 합·충 관계를 분석해주시오.
- hapList: 두 사주 사이의 합 (0개 이상, items 배열)
- chungList: 두 사주 사이의 충 (0개 이상, items 배열; 없으면 빈 배열)
- overallScore: 종합 궁합 점수 (0-100)와 라벨`,

    7: `두 사람(보호자 + 반려동물)의 일상 생활 패턴과 함께하는 삶을 풀어주시오.
- lifePattern: 두 사람의 생활 리듬 궁합
- dailyRhythm: 일상 생활의 주요 요소 (3-4개)
- livingTips: 함께하는 삶을 위한 조언 (3-4개)`,

    8: `반려동물의 건강 위험 요소와 돌봄 사이클을 풀어주시오.
- healthRisk: 사주로 본 건강 위험 요소 (2-3개)
- healthCycle: 건강이 좋은 시기와 주의할 시기
- careTips: 건강 관리를 위한 조언 (3-4개)`,

    9: `두 사람(보호자 + 반려동물)이 이별할 위험 시기와 위기를 풀어주시오.
- crisisScore: 이별/위기 가능성 점수 (0-100)와 설명
- crisisReason: 위기가 오는 이유와 배경
- crisisTips: 위기를 극복하기 위한 조언 (3-4개)`,

    10: `두 사람(보호자 + 반려동물)에게 찾아올 좋은 시기를 풀어주시오.
- goodTimeFlow: 앞으로 찾아올 좋은 시기 흐름 (3-5개)
- goodTimeItems: 좋은 시기의 구체적 이유 (2-3개)
- timingAdvice: 이 시기를 활용하는 한 줄 조언`,

    11: `두 사람(보호자 + 반려동물)의 미래 흐름과 마지막 메시지를 풀어주시오.
- futureFlow: 미래 흐름 단계 (3-5개 steps with 🐾 icon)
- farewell: 함께하는 미래에 대한 따뜻한 말 (2-3 단락)
- finalMessage: 마지막 한 줄 메시지`,

    12: `보호자 ${input.name}님과 반려동물 ${input.partnerName}에게 홍연의 따뜻한 편지를 써주시오.
- letter: 진심 어린 편지 (3-5 단락, 홍연 말투 ~이오/~하오/~했소)`,
  };

  const user = `${intro}

위 정보를 바탕으로 반려궁합 결과지 제${chapter}장을 작성하시오.

${questions[chapter]}

반드시 아래 JSON 형식으로만 응답하시오:
${schemas[chapter]}`;

  return { system: SYSTEM, user };
}
