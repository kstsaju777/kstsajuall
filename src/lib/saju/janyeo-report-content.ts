// =====================================================
// 자녀사주 결과지 — 장별 풀이 프롬프트 & 구조
// =====================================================

import { SYSTEM } from "./report-prompts";

// ── 장별 필수 섹션 키 ──
export const JANYEO_CHAPTER_SECTIONS: Record<number, string[]> = {
  1: ["wonguk", "ohaeng", "chonyeongi", "cheongneongi", "jungnyeongi", "nonyeongi", "ability", "sipseong", "unseong", "sinsalReading", "pyori"],
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
  1: "[제1장 환경] 타고난 본바탕 — 원국 종합, 오행 균형, 십성 역할, 십이운성, 겉과 속",
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
  1: `{명식표1}
위 명식을 가진 {이름1}님의 제1장 풀이를 아래 파트로 나누어 작성해주세요.

[파트1: 나란 사람의 본질과 성향]
wonguk, ohaeng 섹션을 작성하세요.

[wonguk] — {이름1}님의 타고난 기운
먼저 월주 지지(월지) 글자를 확인해 태어난 계절과 기후를 파악하세요.
  월지별 계절·기후: 子=한겨울 칼바람 / 亥=초겨울 냉기 / 丑=겨울 끝 습한 냉기 / 寅=이른 봄 온기 / 卯=봄 한창 생동감 / 辰=봄 끝 습한 기운 / 巳=초여름 더위 / 午=한여름 뜨거운 열기 / 未=여름 끝 건조한 더위 / 申=초가을 서늘한 기운 / 酉=가을 한창 청량함 / 戌=가을 끝 건조한 기운
그 계절·기후와 일간 오행을 연결해 자연 이미지로 {이름1}님을 묘사하세요.
  일간 오행 이미지: 갑목·을목→푸른 나무 / 병화·정화→불꽃·빛 / 무토·기토→대지·흙 / 경금·신금→금빛·서릿발 / 임수·계수→깊은 물·물결
  예) 월지=子, 일간=甲 → "차가운 한겨울 냉기 속에서 홀로 꼿꼿하게 서 있는 푸른 나무와 같은 기운을 타고났소."
- intro: "[계절·기후] 속에서 태어난 {이름1}님은 [자연물 이미지]와 같은 기운을 타고났소." 형식으로 시작, 이어서 2~3문장 추가
- callout: 천간(겉모습)과 지지(내면)의 핵심 대비 한 문장
- paragraphs 2개: ①신강·신약 판단 + 지배적 십성의 장점과 그림자 + 용신·기신 언급 (4~5문장) ②천간 십성 기반 겉모습 vs 지지 십성 기반 내면의 온도 차이와 대인관계 패턴 (4~5문장)

[ohaeng] — {이름1}님의 오행 분포
명식에 있는 오행 분포를 확인해 강한 기운과 약한 기운을 풀이하세요.
- intro: 어떤 오행이 강하고 약한지 한 문장 요약
- callout: 가장 강한 오행이 {이름1}님의 삶에 미치는 핵심 영향 한 문장
- paragraphs 3개: ①강한 오행의 성향과 삶의 패턴 ②약한 오행이 일상에 미치는 영향 ③오행 균형을 위한 현실적 조언

[파트2: 네 기둥이 품은 인생의 흐름]
chonyeongi, cheongneongi, jungnyeongi, nonyeongi 섹션을 작성하세요.
각 기둥의 천간 십성 → 지지 십성을 명식 확인표에서 그대로 가져와 사용하세요. 임의로 바꾸거나 없는 십성을 추가하는 것은 절대 금지입니다.

[chonyeongi] — 초년기 (년주 기반, 0~20세)
년주 천간·지지 십성을 확인해 조부모·조상과의 인연, 태어난 가정환경, 초년기 경험을 풀이하세요.
첫 문장은 반드시 "초년기에는"으로 시작하세요.
좋은 면과 좋지 않은 면을 모두 담고, 300자 내외로 작성하세요.

[cheongneongi] — 청년기 (월주 기반, 20~40세)
월주 천간·지지 십성을 확인해 부모와의 인연, 사회생활·직업적 성향, 청년기 방향을 풀이하세요.
월주는 사회에서의 나의 모습이므로, 직장인 기질인지 사업·독립 기질인지 명확히 언급하세요.
좋은 면과 좋지 않은 면을 모두 담고, 300자 내외로 작성하세요.

[jungnyeongi] — 중년기 (일주 기반, 40~60세)
일주 천간(일간)과 지지 십성을 확인해 나 자신의 본질, 배우자와의 관계·결혼생활, 중년기 전성기를 풀이하세요.
좋은 면과 좋지 않은 면을 모두 담고, 300자 내외로 작성하세요.

[nonyeongi] — 말년기 (시주 기반, 60세 이후)
시주 천간·지지 십성을 확인해 자녀와의 인연, 노후 재물·건강, 인생의 결실을 풀이하세요.
좋은 면과 좋지 않은 면을 모두 담고, 300자 내외로 작성하세요.

[파트3: 그대의 타고난 능력치]
ability 섹션을 작성하세요.
명식에 포함된 타고난 능력치 점수를 참고하되, 점수 수치는 절대 언급하지 마세요.
80점 이상은 강점으로, 60점 미만은 솔직하게 보완이 필요한 부분으로 서술하세요.
가장 높은 능력치 2~3개와 가장 낮은 능력치 1~2개를 구체적으로 언급하세요.
단순 나열이 아니라 이 조합이 실제 삶에서 어떻게 드러나는지 입체적으로 풀이하세요.
500자 내외로 paragraphs[0] 하나에 담아 작성하세요.

[파트4: 그대에게 숨겨진 기운들]
sipseong, unseong, sinsalReading, pyori 섹션을 작성하세요.

[sipseong] — 십성으로 보는 타고난 역할
명식에서 가장 많이 등장하는 십성을 중심으로 {이름1}님의 사회적 역할과 삶의 패턴을 풀이하세요.
- intro: "{이름1}님의 명식에는 [십성명]의 기운이 강하게 자리 잡고 있소." 형식으로 시작
- callout: 그 십성이 {이름1}님의 삶에서 가장 크게 드러나는 방식 한 문장
- paragraphs 3개: ①주된 십성의 성향과 삶의 패턴 ②보조 십성과의 상호작용 ③십성이 없거나 과할 때의 영향

[unseong] — 십이운성
- intro: 일지(일주 지지)의 운성부터 언급하며 시작
- callout: 이 운성이 나타내는 {이름1}님의 삶의 리듬 핵심 한 문장
- paragraphs 3개: ①일지 운성의 기운과 삶의 리듬 ②다른 기둥 운성들과의 조합이 만드는 전체 흐름 ③이 운성 조합을 어떻게 활용할지 조언

[sinsalReading] — 신살 풀이
명식에 실제 기재된 신살만 언급하세요. 없는 신살을 지어내는 것은 절대 금지입니다.
귀인살이 있다면 어떤 형태의 귀인이 어느 시기에 오는지 구체적으로 서술하세요.
역마·도화·화개 등 살의 기운은 부정적 면만 나열하지 말고 개성과 추진력이 되는 면도 함께 서술하세요.
560자 내외로 paragraphs 3개에 나눠 작성하세요.

[pyori] — 겉과 속
천간(겉모습)과 지지(내면)의 차이를 풀이하세요.
- intro: "겉으로는 [천간 십성 인상], 속으로는 [일지 십성 본성]인 사주이오." 형식으로 시작
- callout: 이 괴리가 만드는 핵심 삶의 패턴 한 문장
- paragraphs 3개: ①겉으로 보이는 인상(천간) ②실제 내면(일지·지지) ③이 간극을 조화롭게 사는 법

<공통 주의사항>
- 한자·영어 표현 금지
- 이름은 각 파트에서 최대 1회만 사용
- 이름에는 성씨를 빼고, 이름 뒤에는 '님'을 붙일 것
- 좋은 말만 나열하지 말고 팩트를 적을 것
- 숫자는 아라비안 숫자로 표기
- 홍연 말투(~이오/~하오/~겠소/~했소)`,

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
  "wonguk": {
    "intro": "【필수 규칙】월지 글자를 확인해 계절·기후 파악 후 '[계절·기후] 속에서 태어난 [이름]님은 [자연물 이미지]와 같은 기운을 타고났소.' 형식으로 시작, 이어서 2~3문장 추가",
    "callout": "천간(겉모습)과 지지(내면)의 핵심 대비 한 문장. 홍연 말투.",
    "paragraphs": [
      "신강/신약 판단 → 지배적 십성 장점과 그림자 → 용신·기신 언급. 홍연 말투 4~5문장.",
      "천간 십성 기반 겉모습 vs 지지 십성 기반 내면의 온도 차이와 대인관계 패턴. 홍연 말투 4~5문장."
    ]
  },
  "ohaeng": { "intro": "어떤 기운이 강한지 도입", "callout": "가장 강한 오행과 의미", "paragraphs": ["강한 오행 성향과 삶의 패턴", "약한 오행 영향", "오행 균형 조언"] },
  "chonyeongi": { "paragraphs": ["초년기에는 으로 시작. 년주 천간·지지 십성 기반 조부모·가정환경·초년기 경험. 300자 내외. 좋은 면+좋지 않은 면 모두. 홍연 말투."] },
  "cheongneongi": { "paragraphs": ["청년기 풀이. 월주 천간·지지 십성 기반. 직장인/사업 기질 언급. 300자 내외. 홍연 말투."] },
  "jungnyeongi": { "paragraphs": ["중년기 풀이. 일주 천간(일간)·지지 십성 기반. 배우자·결혼생활·중년 전성기. 300자 내외. 홍연 말투."] },
  "nonyeongi": { "paragraphs": ["말년기 풀이. 시주 천간·지지 십성 기반. 자녀·노후 재물·건강·결실. 300자 내외. 홍연 말투."] },
  "ability": { "paragraphs": ["타고난 능력치 풀이. 점수 수치 언급 금지. 80점 이상=강점, 60점 미만=보완 필요. 가장 높은 2~3개·낮은 1~2개 구체 언급. 500자 내외. 홍연 말투."] },
  "sipseong": { "intro": "[이름]님의 명식에는 [십성명]의 기운이 강하게 자리 잡고 있소. 형식으로 시작", "callout": "그 십성이 삶에서 드러나는 방식 한 문장", "paragraphs": ["주된 십성 성향과 삶의 패턴", "보조 십성과의 상호작용", "십성이 없거나 과할 때의 영향"] },
  "unseong": { "intro": "일지 운성부터 언급하며 시작", "callout": "이 운성이 나타내는 삶의 리듬 핵심 한 문장", "paragraphs": ["일지 운성의 기운과 삶의 리듬", "다른 기둥 운성들과의 조합이 만드는 전체 흐름", "이 운성 조합 활용 조언"] },
  "sinsalReading": { "paragraphs": ["신살 풀이 1 — 귀인살 중심", "신살 풀이 2 — 살의 기운과 긍정적 면", "신살 풀이 3 — 통합 기운과 활용 조언. 전체 560자 내외."] },
  "pyori": { "intro": "겉으로는 [천간 십성 인상], 속으로는 [일지 십성 본성]인 사주이오. 형식으로 시작", "callout": "이 괴리가 만드는 핵심 삶의 패턴 한 문장", "paragraphs": ["겉으로 보이는 인상(천간)", "실제 내면(일지·지지)", "이 간극을 조화롭게 사는 법"] }
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
