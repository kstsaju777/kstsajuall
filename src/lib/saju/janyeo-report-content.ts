// =====================================================
// 자녀사주 결과지 — 장별 풀이 프롬프트 & 구조
// =====================================================

import { SYSTEM } from "./report-prompts";

// ── 장별 필수 섹션 키 ──
export const JANYEO_CHAPTER_SECTIONS: Record<number, string[]> = {
  1: ["personality"],
  2: ["studyStyle"],
  3: ["talent"],
  4: ["career"],
  5: ["health"],
  6: ["parentingFlow"],
  7: ["friendship"],
  8: ["letter"],
};

// ── 장 완성 여부 확인 ──
export function isJanyeoChapterReady(
  content: Record<string, unknown> | null | undefined,
  chapter: number
): boolean {
  if (!content) return false;
  const keys = JANYEO_CHAPTER_SECTIONS[chapter] ?? [];
  return keys.every((k) => {
    const val = content[k];
    if (!val || typeof val !== "object") return false;
    const v = val as Record<string, unknown>;
    if ("sinDesc" in v) return typeof v.sinDesc === "string" && (v.sinDesc as string).length > 0 && "traitDesc" in v && typeof v.traitDesc === "string" && (v.traitDesc as string).length > 0;
    if ("styleCards" in v) return Array.isArray(v.styleCards) && (v.styleCards as unknown[]).length > 0 && Array.isArray(v.paragraphs) && (v.paragraphs as unknown[]).length > 0;
    if ("paragraphs" in v) return Array.isArray(v.paragraphs) && (v.paragraphs as unknown[]).length > 0;
    if ("friendPattern" in v) return Array.isArray(v.friendPattern) && (v.friendPattern as unknown[]).length > 0 && "socialTips" in v && Array.isArray(v.socialTips) && (v.socialTips as unknown[]).length > 0;
    if ("types" in v) return Array.isArray(v.types) && (v.types as unknown[]).length > 0;
    if ("growthPhases" in v) return Array.isArray(v.growthPhases) && (v.growthPhases as unknown[]).length >= 5;
    if ("items" in v) return Array.isArray(v.items) && (v.items as unknown[]).length > 0;
    if ("weakPoints" in v) return Array.isArray(v.weakPoints) && (v.weakPoints as unknown[]).length > 0 && Array.isArray(v.paragraphs) && (v.paragraphs as unknown[]).length > 0;
    if ("tips" in v) return Array.isArray(v.tips) && (v.tips as unknown[]).length > 0;
    if ("fields" in v) return Array.isArray(v.fields) && (v.fields as unknown[]).length > 0 && "talentTips" in v && Array.isArray(v.talentTips) && (v.talentTips as unknown[]).length > 0;
    if ("careerStrength" in v) return Array.isArray(v.careerStrength) && (v.careerStrength as unknown[]).length > 0 && "careerAdvice" in v && typeof v.careerAdvice === "string" && (v.careerAdvice as string).length > 0;
    if ("element" in v) return typeof v.element === "string" && (v.element as string).length > 0;
    return false;
  });
}

// ── 장별 주제 ──
const JANYEO_CH_THEME: Record<number, string> = {
  1: "[제1장 기질] 어떤 기질과 성격으로 태어났나 — 일간 오행, 신강·신약, 타고난 성격과 행동 패턴",
  2: "[제2장 학업] 아이의 학업운과 공부 스타일 — 학습 방식, 집중력, 잘 맞는 공부 환경, 학업운 흐름",
  3: "[제3장 재능] 아이의 타고난 재능과 적성 — 오행·십성으로 보는 강점, 잘하는 분야, 키워야 할 능력",
  4: "[제4장 진로] 아이의 진로와 직업운 — 어울리는 직업군, 성인이 되어 잘 맞는 일의 방향",
  5: "[제5장 건강] 아이의 건강에서 주의할 부분 — 기질적으로 취약한 신체, 건강 관리 포인트",
  6: "[제6장 양육] 아이를 키울 때 조심해야 할 시기 — 성장 단계별 주의 시기, 부모가 신경 써야 할 포인트",
  7: "[제7장 친구] 아이의 인간관계와 친구운 — 또래 관계 패턴, 잘 맞는 친구 유형, 관계에서의 특징",
  8: "[마무리] 홍연의 서신 — 아이의 사주 풀이를 마치며 부모에게 전하는 따뜻한 손편지",
};

// ── 장별 추가 지시 ──
const JANYEO_CH_GUIDE: Record<number, string> = {
  1: `[personality 섹션 — 기질과 성격]
이 아이의 사주 명식을 바탕으로 아래 항목을 모두 채우시오. 홍연 화자(~이오/~하오/~겠소). 아이 이름 호칭 사용.

- intro: "~한 사주로, 한 줄 요약" 형식. 아이의 타고난 기운을 한 줄로. (1문장)
- sinDesc: 신강·신약 판단과 아이의 기운 그릇. 3~4문장. (신강신약 게이지 아래 표시됨)
- ohaengDesc: 오행 균형의 특징과 성격·기질에 미치는 영향. 3~4문장. (오행 도넛 아래 표시됨)
- ilganDesc: 일간 오행과 타고난 기질이 성격에 미치는 의미. 3~4문장. (일간 카드 아래 표시됨)
- keywords: 이 아이의 성격을 압축하는 키워드 3개. 각 2~4글자. (예: ["활발한 기운", "깊은 감수성", "고집스런 뚝심"])
- cards: 기질 설명 카드 3개. 각 card:
  - icon: 성격에 맞는 이모지 1개
  - title: 짧은 소제목 (예: "타고난 강점", "감정 표현 방식", "부모가 알아야 할 점")
  - desc: 해당 기질 설명 3~4문장. 구체적인 십성·오행 근거 포함.
- traits: 성향 점수 4개. 각 항목 { label, score(0~100 정수) }
  반드시 이 4개: "활동성" "감수성" "집중력" "사교성"
  사주 명식에 근거해 점수 산출.
- traitDesc: 위 4가지 성향 점수를 종합하여 이 아이의 기질 전체를 3~4문장으로 풀이. 높은 점수와 낮은 점수 모두 언급하여 균형 잡힌 시각 제공. 홍연 말투 엄수.

【말투 엄수】 모든 서술 문장은 홍연 말투(~이오/~하오/~겠소/~했소)로. "~ㅂ니다" "~어요" 금지.`,

  2: `[studyStyle 섹션 — 학업 스타일]
이 아이의 학업운과 공부 스타일을 아래 항목에 따라 채우시오. 홍연 말투(~이오/~하오/~겠소) 엄수.

- intro: 이 아이의 공부 스타일 핵심 한 줄. (1문장)
- callout: 학업운과 관련된 사주 핵심 한 문장.
- paragraphs 2개: ①잘 맞는 학습 방식·환경과 그 이유(오행·십성 근거 포함) ②집중력과 학업운 흐름, 부모의 지원 방향. 각 단락 4~5문장, 홍연 말투.
- styleCards: 이 아이의 학습 특성 카드 3개. 각 card:
  - icon: 어울리는 이모지 1개
  - title: 특성 제목 (예: "혼자 파고드는 스타일", "눈으로 배우는 시각형", "몸으로 익히는 체험형")
  - desc: 사주 근거를 담아 2~3문장으로 구체적 설명. 홍연 말투.
- studyTips: 실천 가능한 공부 팁 4개 (한 줄씩, 구체적으로). 홍연 말투.

【말투 엄수】 모든 서술 문장은 홍연 말투(~이오/~하오/~겠소/~했소)로. "~ㅂ니다" "~어요" 금지.`,

  3: `[talent 섹션 — 재능 분야]
이 아이의 타고난 재능과 적성을 아래 항목에 따라 채우시오. 홍연 말투(~이오/~하오/~겠소) 엄수.

- intro: 이 아이의 타고난 재능 방향 핵심 한 줄. (1문장)
- callout: 재능과 연결된 십성·오행 핵심 한 문장.
- paragraphs 2개: ①오행·십성으로 본 강점과 잘하는 분야(사주 근거 포함) ②부모가 키워주면 빛날 능력과 계발 방향. 각 단락 4~5문장, 홍연 말투.
- fields: 재능 분야 3~4개. 각 field:
  - icon: 분야에 어울리는 이모지 1개
  - name: 재능 분야명 (예: "음악·리듬감", "수학적 사고", "언어·표현력")
  - desc: 이 분야에서 왜 두각을 나타내는지 사주 근거를 담아 2~3문장으로 설명. 홍연 말투.
- talentTips: 재능을 키우는 실천법 3~4개 (한 줄씩, 부모가 바로 실행할 수 있는 구체적 방법). 홍연 말투.

【말투 엄수】 모든 서술 문장은 홍연 말투(~이오/~하오/~겠소/~했소)로. "~ㅂ니다" "~어요" 금지.`,

  4: `[career 섹션 — 진로와 직업]
이 아이의 진로와 직업운을 아래 항목에 따라 채우시오. 홍연 말투(~이오/~하오/~겠소) 엄수.

- intro: 이 아이에게 어울리는 일의 방향 핵심 한 줄. (1문장)
- callout: 직업운과 관련된 사주 핵심 한 문장.
- paragraphs 2개: ①오행·십성으로 본 이 아이의 직업적 기질과 강점(사주 근거 포함) ②성인이 되어 가장 빛날 환경과 일의 특성. 각 단락 4~5문장, 홍연 말투.
- careerStrength: 이 아이의 직업적 강점 3개. 각 항목:
  - icon: 어울리는 이모지 1개
  - label: 강점 이름 (2~4글자, 예: "리더십", "창의력", "꼼꼼함")
  - desc: 사주 근거를 담아 1~2문장으로 설명. 홍연 말투.
- jobTypes: 어울리는 직업 유형 2~3개. 각 jobType:
  - icon: 이모지
  - category: 직업 대분류 (예: "예술·창작", "이공계·기술")
  - desc: 이 직업군이 왜 잘 맞는지 사주 근거(오행·십성)를 들어 4~5문장으로 구체적으로 설명. 이 아이의 어떤 기질이 이 분야에서 빛나는지, 어떤 환경에서 역량이 극대화되는지 포함. 홍연 말투.
- careerAdvice: 부모가 이 아이의 진로를 위해 해줄 수 있는 것들. 4~5문장, 구체적이고 따뜻하게. 어떤 경험을 쌓아줘야 하는지, 어떤 환경을 만들어줘야 하는지 포함. 홍연 말투.

【말투 엄수】 모든 서술 문장은 홍연 말투(~이오/~하오/~겠소/~했소)로. "~ㅂ니다" "~어요" 금지.`,

  5: `[health 섹션 — 건강 주의]
이 아이의 건강과 주의할 부분을 아래 항목에 따라 채우시오. 홍연 말투(~이오/~하오/~겠소) 엄수.

- intro: 이 아이의 건강에서 가장 주의할 포인트 핵심 한 줄. (1문장)
- callout: 건강과 관련된 오행 취약점 핵심 한 문장.
- paragraphs 2개: ①기질적으로 취약한 신체 계통과 그 이유(오행·십성 근거 포함, 4~5문장) ②건강하게 키우기 위한 생활 습관과 부모의 역할(4~5문장). 홍연 말투.
- weakPoints: 취약한 신체 부위 또는 건강 계통 2~3개. 각 항목:
  - icon: 해당 신체 부위에 어울리는 이모지
  - part: 부위/계통명 (예: "호흡기", "소화계", "신경계")
  - desc: 왜 이 부위가 취약한지 오행 근거와 함께 2~3문장, 부모가 주의할 점 포함. 홍연 말투.
- healthTips: 건강 관리 실천법 4개. 각 항목은 2~3문장으로, 왜 이 방법이 이 아이에게 필요한지 사주 근거를 담아 구체적으로 설명. 부모가 바로 실행할 수 있는 내용으로. 홍연 말투.

【말투 엄수】 모든 서술 문장은 홍연 말투(~이오/~하오/~겠소/~했소)로. "~ㅂ니다" "~어요" 금지.`,

  6: `[parentingFlow 섹션 — 양육 시기별 흐름]
이 아이의 성장 시기별 양육 흐름을 아래 항목에 따라 채우시오. 홍연 말투(~이오/~하오/~겠소) 엄수.

- intro: 이 아이를 키울 때 전체적으로 가장 중요한 포인트 핵심 한 줄. (1문장)
- callout: 양육에서 부모가 가장 집중해야 할 시기나 방향 핵심 한 문장.
- paragraphs 2개: ①이 아이의 기질과 부모의 관계 특징, 잘 맞는 교육 방식(오행·십성 근거, 4~5문장) ②전반적인 양육 방향과 부모의 역할(4~5문장). 홍연 말투.
- growthPhases: 성장 시기 5개. 반드시 아래 순서대로. 각 phase:
  - label: 시기명 (반드시: "유아기" / "초등 저학년" / "초등 고학년" / "중학교" / "고등학교")
  - age: 나이대 (반드시: "0~7세" / "8~10세" / "11~13세" / "14~16세" / "17~19세")
  - score: 이 시기의 양육 주의도 0~100 정수. 사주 대운·세운 흐름에 근거해 산출. 주의가 많이 필요할수록 높은 값.
  - tone: "good"(순탄한 시기) / "caution"(보통) / "warn"(특히 주의 필요)
  - title: 이 시기의 핵심 키워드 (4~8글자, 예: "자유로운 탐색기", "예민함이 깨어나는 때")
  - desc: 이 시기의 특징과 부모가 해줄 일 2~3문장. 홍연 말투.
- parentingTips: 전반적인 양육 팁 3개. 각 항목 2~3문장, 구체적이고 따뜻하게. 홍연 말투.

【말투 엄수】 모든 서술 문장은 홍연 말투(~이오/~하오/~겠소/~했소)로. "~ㅂ니다" "~어요" 금지.`,

  7: `[friendship 섹션 — 친구와 인간관계]
이 아이의 친구운과 인간관계를 아래 항목에 따라 채우시오. 홍연 말투(~이오/~하오/~겠소) 엄수.

- intro: 이 아이의 인간관계 특징 핵심 한 줄. (1문장)
- callout: 친구 관계와 연결된 십성·오행 핵심 한 문장.
- paragraphs 2개: ①이 아이가 또래 관계를 맺는 방식, 친구를 사귀는 패턴(오행·십성 근거 포함, 4~5문장) ②친구 관계에서의 강점과 주의점, 부모가 도울 수 있는 방향(4~5문장). 홍연 말투.
- friendPattern: 이 아이의 인간관계 특성 2개. 각 pattern:
  - icon: 이모지
  - title: 특성 제목 (예: "깊게 사귀는 스타일", "많은 친구보다 한 명의 단짝")
  - desc: 사주 근거를 담아 2~3문장 설명. 홍연 말투.
- friendTypes: 친구 궁합 유형 3~4개. 각 type:
  - kind: "good"(잘 맞는) 또는 "warn"(주의할)
  - icon: 이모지
  - label: 유형 제목 (예: "따뜻하고 공감 잘하는 친구", "경쟁심 강한 친구")
  - desc: 이 유형과의 관계 특징, 왜 잘 맞거나 주의해야 하는지 2~3문장. 홍연 말투.
- socialTips: 사회성을 키우는 방법 3개. 각 항목 2~3문장, 부모가 실천할 수 있는 구체적 방법. 홍연 말투.

【말투 엄수】 모든 서술 문장은 홍연 말투(~이오/~하오/~겠소/~했소)로. "~ㅂ니다" "~어요" 금지.`,

  8: `[letter 섹션 — 홍연의 서신]
자녀사주 풀이를 마치며 홍연이 부모에게 쓰는 따뜻한 손편지.

- paragraphs: 4개 단락. 각 단락 9~12문장, 300자 이상.
  ①이 아이가 타고난 빛나는 기질과 사주에서 드러나는 특별한 면을 구체적으로.
  ②이 아이를 키우며 부모가 힘들 수 있는 부분과 그 이면의 아름다운 가능성.
  ③이 아이에게 가장 필요한 것, 부모가 해줄 수 있는 가장 중요한 역할.
  ④이 아이의 미래를 향한 따뜻한 응원과 부모에게 전하는 홍연의 진심 어린 마무리.
- 바로 본론으로 시작하여 따뜻한 마무리로 끝내시오.
- 호칭: 아이를 가리킬 때 반드시 이름+"군"(남아) 또는 이름+"양"(여아), 또는 "이 아이"로만 표현. "그", "그녀", "그대", "당신" 절대 금지.

【말투 엄수】 모든 문장 홍연 말투(~이오/~하오/~겠소/~했소). "~ㅂ니다" "~어요" 절대 금지.`,
};

// ── 장별 JSON 스키마 ──
const JANYEO_CH_SCHEMA: Record<number, string> = {
  1: `{
  "personality": {
    "intro": "~한 사주로, 한 줄 요약 (1문장)",
    "sinDesc": "신강신약 판단과 아이의 기운 그릇 3~4문장",
    "ohaengDesc": "오행 균형과 성격·기질 관계 3~4문장",
    "ilganDesc": "일간 오행과 타고난 기질 3~4문장",
    "keywords": ["키워드1", "키워드2", "키워드3"],
    "cards": [
      { "icon": "🌟", "title": "타고난 강점", "desc": "3~4문장" },
      { "icon": "💬", "title": "감정 표현 방식", "desc": "3~4문장" },
      { "icon": "⚡", "title": "부모가 알아야 할 점", "desc": "3~4문장" }
    ],
    "traits": [
      { "label": "활동성", "score": 70 },
      { "label": "감수성", "score": 85 },
      { "label": "집중력", "score": 60 },
      { "label": "사교성", "score": 75 }
    ],
    "traitDesc": "성향 점수를 종합한 3~4문장 풀이"
  }
}`,
  2: `{
  "studyStyle": {
    "intro": "공부 스타일 핵심 한 줄 (1문장)",
    "callout": "학업운 사주 핵심 한 문장",
    "paragraphs": ["단락1 (4~5문장)", "단락2 (4~5문장)"],
    "styleCards": [
      { "icon": "🎯", "title": "학습 특성 제목1", "desc": "2~3문장 설명" },
      { "icon": "📖", "title": "학습 특성 제목2", "desc": "2~3문장 설명" },
      { "icon": "⏰", "title": "학습 특성 제목3", "desc": "2~3문장 설명" }
    ],
    "studyTips": ["팁1 (한 줄)", "팁2 (한 줄)", "팁3 (한 줄)", "팁4 (한 줄)"]
  }
}`,
  3: `{
  "talent": {
    "intro": "재능 방향 핵심 한 줄 (1문장)",
    "callout": "재능 십성·오행 핵심 한 문장",
    "paragraphs": ["단락1 (4~5문장)", "단락2 (4~5문장)"],
    "fields": [
      { "icon": "🎨", "name": "재능 분야명1", "desc": "2~3문장 사주 근거 설명" },
      { "icon": "🎵", "name": "재능 분야명2", "desc": "2~3문장 사주 근거 설명" },
      { "icon": "📐", "name": "재능 분야명3", "desc": "2~3문장 사주 근거 설명" }
    ],
    "talentTips": ["재능 키우는 방법1", "재능 키우는 방법2", "재능 키우는 방법3"]
  }
}`,
  4: `{
  "career": {
    "intro": "진로 방향 핵심 한 줄 (1문장)",
    "callout": "직업운 사주 핵심 한 문장",
    "paragraphs": ["단락1 (4~5문장)", "단락2 (4~5문장)"],
    "careerStrength": [
      { "icon": "💡", "label": "강점명1", "desc": "1~2문장 설명" },
      { "icon": "🎯", "label": "강점명2", "desc": "1~2문장 설명" },
      { "icon": "🌟", "label": "강점명3", "desc": "1~2문장 설명" }
    ],
    "jobTypes": [
      { "icon": "💼", "category": "직업 대분류1", "desc": "이 직업군이 잘 맞는 이유 4~5문장 (사주 근거 포함)", "jobs": ["직업1", "직업2", "직업3"] },
      { "icon": "🎨", "category": "직업 대분류2", "desc": "이 직업군이 잘 맞는 이유 4~5문장 (사주 근거 포함)", "jobs": ["직업1", "직업2", "직업3"] }
    ],
    "careerAdvice": "부모에게 드리는 진로 조언 4~5문장"
  }
}`,
  5: `{
  "health": {
    "intro": "건강 주의 핵심 한 줄 (1문장)",
    "callout": "취약 오행·신체 핵심 한 문장",
    "paragraphs": ["단락1 (4~5문장)", "단락2 (4~5문장)"],
    "weakPoints": [
      { "icon": "🫁", "part": "취약 부위/계통1", "desc": "2~3문장 (오행 근거 + 주의점)" },
      { "icon": "🫀", "part": "취약 부위/계통2", "desc": "2~3문장 (오행 근거 + 주의점)" }
    ],
    "healthTips": ["팁1 (2~3문장)", "팁2 (2~3문장)", "팁3 (2~3문장)", "팁4 (2~3문장)"]
  }
}`,
  6: `{
  "parentingFlow": {
    "intro": "양육 핵심 포인트 한 줄 (1문장)",
    "callout": "부모가 집중해야 할 방향 한 문장",
    "paragraphs": ["단락1 (4~5문장)", "단락2 (4~5문장)"],
    "growthPhases": [
      { "label": "유아기", "age": "0~7세", "score": 60, "tone": "caution", "title": "이 시기 키워드", "desc": "2~3문장 설명" },
      { "label": "초등 저학년", "age": "8~10세", "score": 40, "tone": "good", "title": "이 시기 키워드", "desc": "2~3문장 설명" },
      { "label": "초등 고학년", "age": "11~13세", "score": 70, "tone": "warn", "title": "이 시기 키워드", "desc": "2~3문장 설명" },
      { "label": "중학교", "age": "14~16세", "score": 50, "tone": "caution", "title": "이 시기 키워드", "desc": "2~3문장 설명" },
      { "label": "고등학교", "age": "17~19세", "score": 35, "tone": "good", "title": "이 시기 키워드", "desc": "2~3문장 설명" }
    ],
    "parentingTips": ["팁1 (2~3문장)", "팁2 (2~3문장)", "팁3 (2~3문장)"]
  }
}`,
  7: `{
  "friendship": {
    "intro": "인간관계 특징 핵심 한 줄 (1문장)",
    "callout": "친구 관계 십성·오행 핵심 한 문장",
    "paragraphs": ["단락1 (4~5문장)", "단락2 (4~5문장)"],
    "friendPattern": [
      { "icon": "🤝", "title": "인간관계 특성 제목1", "desc": "2~3문장 설명" },
      { "icon": "💬", "title": "인간관계 특성 제목2", "desc": "2~3문장 설명" }
    ],
    "friendTypes": [
      { "kind": "good", "icon": "💫", "label": "잘 맞는 친구 유형1", "desc": "2~3문장" },
      { "kind": "good", "icon": "🌱", "label": "잘 맞는 친구 유형2", "desc": "2~3문장" },
      { "kind": "warn", "icon": "⚡", "label": "주의할 친구 유형", "desc": "2~3문장" }
    ],
    "socialTips": ["사회성 팁1 (2~3문장)", "사회성 팁2 (2~3문장)", "사회성 팁3 (2~3문장)"]
  }
}`,
  8: `{
  "letter": {
    "paragraphs": ["단락1 (3~4문장)", "단락2 (3~4문장)", "단락3 (3~4문장)", "단락4 (3~4문장, 마무리)"]
  }
}`,
};

// ── 핵심 함수: 장별 프롬프트 빌더 ──
export function buildJanyeoChapterPrompt(
  chapter: number,
  input: {
    name: string;
    gender: "male" | "female";
    manseryeokText: string;
    pillars?: { pos: string; gan: string; ganEl: string; ji: string; jiEl: string; sipTop: string; sipBot: string; sinsal?: string }[];
    birthYear?: number;
  }
): { system: string; user: string } {
  const theme = JANYEO_CH_THEME[chapter] ?? `[제${chapter}장]`;
  const guide = JANYEO_CH_GUIDE[chapter] ?? "";
  const schema = JANYEO_CH_SCHEMA[chapter] ?? "{}";
  const honor = input.name
    ? input.gender === "female" ? `${input.name}양` : `${input.name}군`
    : "이 아이";
  const currentYear = new Date().getFullYear();

  const user = `아래는 ${honor}의 사주 명식입니다.

【호칭 규칙】 풀이 본문에서 이 아이를 지칭할 때는 반드시 "${honor}"라는 호칭을 사용하시오. "그", "그녀", "그대", "당신"은 절대 쓰지 마시오. 호칭이 반복되어 어색하면 "이 아이"로 대체하시오.

${input.manseryeokText}
${input.birthYear ? `\n출생연도: ${input.birthYear}년 / 현재연도: ${currentYear}년` : `\n현재연도: ${currentYear}년`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
이번 장의 주제: ${theme}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${guide ? `\n작성 지침:\n${guide}\n` : ""}
위 명식을 꼼꼼히 분석하여, 아래 JSON 스키마를 정확히 채워주시오.
반드시 유효한 JSON만 출력하시오. 코드펜스(\`\`\`)나 설명 문장은 절대 쓰지 마시오.
풀이 대상은 부모가 의뢰한 자녀(아이)임을 염두에 두고, 부모가 읽는 시점에서 따뜻하고 실용적으로 서술하시오.

${schema}`;

  return { system: SYSTEM, user };
}
