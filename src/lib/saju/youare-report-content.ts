// =====================================================
// 유아사주 결과지 — 장별 풀이 프롬프트 & 구조
// =====================================================

import { SYSTEM } from "./report-prompts";

// ── 장별 필수 섹션 키 ──
export const YOUARE_CHAPTER_SECTIONS: Record<number, string[]> = {
  1: ["wonguk", "ohaeng", "chonyeongi", "cheongneongi", "jungnyeongi", "nonyeongi", "ability", "sipseong", "unseong", "sinsalReading", "pyori"],
  2: ["health"],
  3: ["parenting"],
  4: ["talent"],
  5: ["parentingFlow"],
  6: ["remedy"],
  7: ["letter"],
};

// ── 장 완성 여부 확인 ──
export function isYouareChapterReady(
  content: Record<string, unknown> | null | undefined,
  chapter: number
): boolean {
  if (!content) return false;
  const keys = YOUARE_CHAPTER_SECTIONS[chapter] ?? [];
  return keys.every((k) => {
    const val = content[k];
    if (!val || typeof val !== "object") return false;
    const v = val as Record<string, unknown>;
    if ("traits" in v) return Array.isArray(v.traits) && (v.traits as unknown[]).length > 0 && "cards" in v && Array.isArray(v.cards) && (v.cards as unknown[]).length > 0;
    if ("weakPoints" in v) return Array.isArray(v.weakPoints) && (v.weakPoints as unknown[]).length > 0 && ("healthTipCards" in v || "healthTips" in v) && Array.isArray(v.healthTipCards ?? v.healthTips) && ((v.healthTipCards ?? v.healthTips) as unknown[]).length > 0;
    if ("parentingStyles" in v) return Array.isArray(v.parentingStyles) && (v.parentingStyles as unknown[]).length > 0 && "parentingTips" in v && Array.isArray(v.parentingTips) && (v.parentingTips as unknown[]).length > 0;
    if ("paragraphs" in v) return Array.isArray(v.paragraphs) && (v.paragraphs as unknown[]).length > 0;
    if ("tips" in v) return Array.isArray(v.tips) && (v.tips as unknown[]).length > 0;
    if ("talentFields" in v) return Array.isArray(v.talentFields) && (v.talentFields as unknown[]).length > 0 && "talentTips" in v && Array.isArray(v.talentTips) && (v.talentTips as unknown[]).length > 0;
    if ("fields" in v) return Array.isArray(v.fields) && (v.fields as unknown[]).length > 0;
    if ("items" in v) return Array.isArray(v.items) && (v.items as unknown[]).length > 0;
    if ("remedyCats" in v) return Array.isArray(v.remedyCats) && (v.remedyCats as unknown[]).length > 0 && "remedies" in v && Array.isArray(v.remedies) && (v.remedies as unknown[]).length > 0;
    if ("namingAdvice" in v && !("weakPoints" in v)) return Array.isArray(v.namingAdvice) && (v.namingAdvice as unknown[]).length > 0 && "colors" in v && Array.isArray(v.colors) && (v.colors as unknown[]).length > 0;
    if ("colors" in v) return Array.isArray(v.colors) && (v.colors as unknown[]).length > 0;
    if ("elements" in v) return Array.isArray(v.elements) && (v.elements as unknown[]).length > 0;
    if ("growthPhases" in v) return Array.isArray(v.growthPhases) && (v.growthPhases as unknown[]).length > 0;
    if ("cautionPeriods" in v) return Array.isArray(v.cautionPeriods) && (v.cautionPeriods as unknown[]).length > 0 && "cautionTips" in v && Array.isArray(v.cautionTips) && (v.cautionTips as unknown[]).length > 0;
    if ("periods" in v) return Array.isArray(v.periods) && (v.periods as unknown[]).length > 0;
    if ("element" in v) return typeof v.element === "string" && (v.element as string).length > 0;
    return false;
  });
}

// ── 장별 주제 ──
const YOUARE_CH_THEME: Record<number, string> = {
  1: "[제1장 환경] 타고난 본바탕 — 원국 종합, 오행 균형, 십성 역할, 십이운성, 겉과 속",
  2: "[제2장 건강] 아이의 건강과 주의할 부분 — 오행 취약점, 주의 신체 부위, 건강 관리 지침",
  3: "[제3장 양육] 잘 맞는 양육 환경과 방식 — 아이 기질에 맞는 교육·환경·부모의 역할",
  4: "[제4장 재능] 성장하면서 두드러질 재능 — 십성·오행으로 보는 타고난 강점과 계발 방향",
  5: "[제5장 양육] 아이를 키울 때 조심해야 할 시기 — 성장 단계별 주의 시기, 부모가 신경 써야 할 포인트",
  6: "[제6장 개운법] 이 아이의 기운을 살릴 개운법 — 부족한 오행을 채우는 생활·환경·음식·활동 개운법",
  7: "[마무리] 홍연의 서신 — 유아사주 풀이를 마치며 부모에게 전하는 따뜻한 손편지",
};

// ── 장별 추가 지시 ──
const YOUARE_CH_GUIDE: Record<number, string> = {
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
작성 전 반드시 아래 순서대로 명식을 확인하시오.
① 천간 4자 + 지지 4자 = 총 8글자 중 목·화·토·금·수 각각 몇 개인지 직접 세시오.
② 개수가 많은 오행(2개 이상) = 강한 기운, 0~1개 = 약한 기운으로 분류하시오.
③ 이 분류를 바탕으로 아래 항목을 작성하시오.
【절대 금지】 같은 오행을 한 풀이 안에서 "강하다"고도 "부족하다"고도 쓰는 것은 모순이오. 반드시 실제 개수에 따라 일관되게 서술하시오.

- intro: 어떤 오행이 강하고(많고) 어떤 오행이 약한지(적은지) 실제 개수 기반으로 한 문장 요약
- callout: 가장 많은 오행이 {이름1}님의 삶에 미치는 핵심 영향 한 문장
- paragraphs 3개: ①강한 오행(개수 많은 것)의 성향과 삶의 패턴 ②약한 오행(개수 적은 것)이 일상에 미치는 영향 ③오행 균형을 위한 현실적 조언

[파트2: 네 기둥이 품은 인생의 흐름]
chonyeongi, cheongneongi, jungnyeongi, nonyeongi 섹션을 작성하세요.
각 기둥의 천간 십성 → 지지 십성을 명식 확인표에서 그대로 가져와 사용하세요. 임의로 바꾸거나 없는 십성을 추가하는 것은 절대 금지입니다.

[chonyeongi] — 초년기 (년주 기반, 0~20세)
년주 천간·지지 십성을 확인해 아래 내용을 빠짐없이 풀이하세요.
- 년주 천간 십성: 조부모·조상과의 인연, 집안 분위기가 아이에게 미치는 기운
- 년주 지지 십성: 아이가 유년기에 만나는 환경의 성질, 태어난 가정의 기운
- 이 기운이 아이의 초년기 기질·성향에 어떤 영향을 주는지 (경쟁적인지, 자유로운지, 안정적인지 등)
- 이 시기 좋은 면(강점·기회)과 좋지 않은 면(주의점·마찰) 모두 서술
- 부모가 이 시기 아이에게 어떤 환경과 지지를 주면 좋은지 조언 한 줄 포함
첫 문장은 반드시 "초년기에는"으로 시작하세요.
【중요】 초년기는 아이가 현재 살아가고 있는 시기이오. 반드시 현재형(~이오 / ~하오 / ~겠소)으로 작성하고, "형성되었소" "영향을 주었소" 같은 과거형 표현은 절대 쓰지 마시오.
500자 내외로 작성하세요.

[cheongneongi] — 청년기 (월주 기반, 20~40세)
월주 천간·지지 십성을 확인해 아래 내용을 빠짐없이 풀이하세요.
- 월주 천간 십성: 부모와의 인연, 아이가 성장하며 부모에게 영향받는 방식
- 월주 지지 십성: 청년기 사회생활 성향, 직장인 기질인지 사업·독립 기질인지 명확히 언급
- 이 시기 아이의 강점과 주의해야 할 갈등 패턴 모두 서술
- 부모가 청년기를 준비시켜줄 때 도움이 될 인사이트 한 줄 포함
좋은 면과 좋지 않은 면을 모두 담고, 500자 내외로 작성하세요.

[jungnyeongi] — 중년기 (일주 기반, 40~60세)
일주 천간(일간)과 지지 십성을 확인해 아래 내용을 풀이하세요.
- 일간의 본질적 기질, 중년기에 꽃피는 분야
- 일지 십성 기반 배우자·인간관계 패턴, 결혼생활 기운
- 이 시기 전성기가 되는 조건과 주의해야 할 점
좋은 면과 좋지 않은 면을 모두 담고, 400자 내외로 작성하세요.

[nonyeongi] — 말년기 (시주 기반, 60세 이후)
시주 천간·지지 십성을 확인해 아래 내용을 풀이하세요.
- 자녀와의 인연, 노후 재물·건강의 기운
- 인생의 결실과 이 시기 삶의 방향
좋은 면과 좋지 않은 면을 모두 담고, 350자 내외로 작성하세요.

[파트3: 그대의 타고난 능력치]
ability 섹션을 작성하세요.
명식에 포함된 타고난 능력치 점수를 참고하되, 점수 수치는 절대 언급하지 마세요.
80점 이상은 강점으로, 60점 미만은 솔직하게 보완이 필요한 부분으로 서술하세요.
가장 높은 능력치 2~3개와 가장 낮은 능력치 1~2개를 구체적으로 언급하세요.
단순 나열이 아니라 이 조합이 실제 삶에서 어떻게 드러나는지 입체적으로 풀이하세요.
paragraphs 3개로 나누어 작성하세요. 전체 530자 내외(공백 포함).
①단락(210~220자): 가장 높은 능력치 2~3개가 이 아이의 삶에서 어떻게 드러나는지 구체적으로 풀이. 단순 나열 말고 조합의 시너지를 입체적으로.
②단락(230~250자): 상대적으로 낮은 능력치 1~2개를 솔직하게 짚고, 부모가 어떻게 도와줄 수 있는지 실용적 조언 포함.
③단락(65~75자): 강점을 바탕으로 이 아이가 어떻게 꽃필지 따뜻하게 마무리.

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

  2: `[health 섹션 — 건강 주의]
이 아이의 건강과 주의할 부분을 아래 항목에 따라 채우시오. 홍연 말투(~이오/~하오/~겠소) 엄수.

- intro: 이 아이의 건강에서 가장 먼저 살펴야 할 신체 계통을 핵심 한 문장으로. 오행 취약점과 연결된 구체적 신체 부위(예: "신장과 방광, 소화기")를 반드시 명시. 1문장.
- paragraphs 2개:
  ①[기질적 취약 신체와 오행 근거] 이 아이의 명식 오행 구성에서 강한 오행과 약한 오행을 먼저 짚고, 그 불균형이 어떤 신체 계통에 어떻게 영향을 주는지 설명. 오행 간 상극 관계(예: 목이 강하면 토를 억눌러 소화계 약화)를 명확히 서술. 반드시 정확히 5문장, 180~220자. 작성 후 글자를 직접 세어 180자 미만이면 문장을 보완, 220자 초과면 줄임.
  ②[생활 습관과 부모 역할] 오행 취약점을 보완하는 구체적 생활 방법(숙면, 식단, 수분 보충 등)과 부모가 실천할 수 있는 역할을 서술. 감정 기복이 신체에 미치는 영향도 포함. 반드시 정확히 5문장, 180~220자. 작성 후 글자를 직접 세어 180자 미만이면 문장을 보완, 220자 초과면 줄임.
- weakPoints: 취약한 신체 부위 또는 건강 계통 2~3개. 각 항목:
  - icon: 해당 신체 부위에 어울리는 이모지
  - part: 부위/계통명 (예: "소화계", "신장·방광", "호흡기")
  - desc: 왜 이 부위가 취약한지 오행 상극 근거와 함께 2~3문장, 부모가 주의할 점 포함. 홍연 말투.
- healthTipCards: 건강 관리 실천법 4개. 각 항목:
  - icon: 해당 팁에 어울리는 이모지
  - title: 팁 핵심 제목 (5~10글자)
  - desc: 왜 이 방법이 이 아이에게 필요한지 사주 근거를 담아 2~3문장. 부모가 바로 실행할 수 있는 내용. 홍연 말투.

【말투 엄수】 모든 서술 문장은 홍연 말투(~이오/~하오/~겠소/~했소)로. "~ㅂ니다" "~어요" 금지.`,

  3: `[parenting 섹션 — 양육 환경과 방식]
- keywords: 이 아이의 사주 기질을 바탕으로 핵심 양육 방향 키워드 4개. 각 3~5자. 예: "자율적 환경", "감성 자극", "창의적 놀이", "안정된 루틴". 사주에서 도출된 실제 특성을 반영할 것.
- paragraphs 2개:
  ①이 아이의 기질과 사주 특성이 양육 환경에 미치는 영향. 어떤 분위기, 어떤 방식이 이 아이의 잠재력을 꽃피우는지. 각 5~7문장, 200자 이상.
  ②위에서 제시한 양육 환경 유형들이 이 아이에게 왜 맞는지, 이 아이의 기질과 타고난 성향을 근거로 풀이. 환경이 갖춰졌을 때 어떻게 달라지는지까지 자연스럽게 연결. 2개 단락(단락 사이 줄바꿈), 각 단락 4문장 이상, 합계 400자 이상.
- parentingStyles: 이 아이에게 잘 맞는 양육 환경 유형 4개. 각 항목: icon(이모지), name(환경 유형명, 3~5자), desc(왜 이 아이에게 맞는지 2문장).
- parentingTips: 부모를 위한 실천 지침 4~5개. 한 줄이 아니라 각 팁마다 2~3문장 분량으로 구체적이고 실천 가능하게.
- parentingAdvice: 부모에게 전하는 홍연의 한 마디. 따뜻하고 격려하는 어조로 3~4문장.
【말투 엄수】 홍연 말투(~이오/~하오/~겠소/~했소). "~ㅂ니다" "~어요" 절대 금지.`,

  4: `[talent 섹션 — 재능 분야]
이 아이의 타고난 재능과 적성을 아래 항목에 따라 채우시오. 홍연 말투(~이오/~하오/~겠소) 엄수.

- intro: 이 아이의 타고난 재능 방향 핵심 한 줄. (1문장, 25자 내외)
  【필수】 "이 아이는 ~을 타고났소." 형식으로 끝맺을 것.
- paragraphs 2개:
  ①오행·십성으로 본 강점과 잘하는 분야(사주 근거 포함). 반드시 아래 4가지를 모두 담을 것:
    - 주된 십성(예: 상관·식신·편인 등)이 이 아이의 재능에 어떻게 작용하는지
    - 감수성·표현력·창의력·논리력 중 두드러지는 특성과 그 이유
    - 어떤 환경·상황에서 재능이 가장 잘 발현되는지
    - 재능의 강점 이면에 있는 주의점 한 가지
    5~6문장, 200자 내외. 홍연 말투.
  ②부모가 이 아이의 재능을 키워줄 때 알아야 할 핵심 인사이트. 반드시 아래 3가지를 담을 것:
    - 이 아이에게 맞는 계발 방식(자유 탐색형인지, 체계적 훈련형인지 등)
    - 부모가 강요하거나 틀 안에 가두었을 때 어떤 부작용이 생기는지
    - 재능이 가장 크게 자라는 조건 한 가지
    5~6문장, 200자 내외. 홍연 말투.
- fields: 재능 분야 3~4개. 각 field:
  - icon: 분야에 어울리는 이모지 1개
  - name: 재능 분야명 (예: "음악·리듬감", "수학적 사고", "언어·표현력")
  - subFields: 이 분야 안에서 특히 잘 맞는 세부 활동·영역 2~4개. 짧은 명사로
  - desc: 이 분야에서 두각을 나타내는 이유를 사주 근거와 함께. 4문장, 150자 내외. 홍연 말투.
- talentTipCards: 재능을 키우는 실천 카드 4개. 각 card:
  - icon: 어울리는 이모지 1개
  - title: 실천 제목
  - desc: 이 아이의 사주(십성·오행) 근거를 바탕으로 풍부하게 서술. 4문장, 150자 내외. 홍연 말투.

【말투 엄수】 모든 서술 문장은 홍연 말투(~이오/~하오/~겠소/~했소)로. "~ㅂ니다" "~어요" 금지.`,

  5: `[parentingFlow 섹션 — 양육 시기별 흐름]
이 아이의 성장 시기별 양육 흐름을 아래 항목에 따라 채우시오. 홍연 말투(~이오/~하오/~겠소) 엄수.

- intro: 이 아이를 키울 때 전체적으로 가장 중요한 포인트 핵심 한 줄. (1문장)
- callout: 양육에서 부모가 가장 집중해야 할 시기나 방향 핵심 한 문장.
- paragraphs 2개: ①이 아이의 기질과 부모의 관계 특징, 잘 맞는 교육 방식(오행·십성 근거, 4~5문장) ②전반적인 양육 방향과 부모의 역할(4~5문장). 홍연 말투.
- growthPhases: 2025~2034년을 5개 구간으로 균등 분할. 각 phase:
  - yearStart: 구간 시작 연도 (2025 / 2027 / 2029 / 2031 / 2033)
  - yearEnd: 구간 종료 연도 (2026 / 2028 / 2030 / 2032 / 2034)
  - score: 이 2년 구간의 양육 주의도 0~100 정수. 해당 구간 각 세운의 천간·지지를 이 아이 일간 기준으로 십성을 계산하고, 관성·상관·겁재처럼 주의가 필요한 십성일수록 높은 값(관성=80↑, 상관=58, 겁재=55 기준). 순한 십성(인성·식신)은 낮은 값.
  - tone: "good"(순탄, score 40 미만) / "caution"(보통, 40~65) / "warn"(주의, 65 초과)
  - title: 이 구간의 핵심 키워드 (4~8글자, 해당 구간 십성 기운 반영)
  - desc: 반드시 다음 5문장 구조로 작성. 총 150~200자. 한자 사용 금지, 간지명은 한국어 독음으로(을사년·병오년·정미년 등).
    ①"[yearStart]년 [간지독음]년과 [yearEnd]년 [간지독음]년은 ~" 으로 시작하여 이 구간 세운의 오행·십성 기운 요약.
    ②이 아이 일간 기준 해당 십성이 구체적으로 어떤 성향·감정 변화를 일으키는지(이 아이에게 맞게 서술).
    ③이 시기 부모가 저지르기 쉬운 실수 또는 주의할 행동 패턴.
    ④부모가 실천할 수 있는 구체적 양육 방법 1가지.
    ⑤이 시기를 잘 보내면 이후 흐름에 어떻게 연결되는지 한 문장.
- parentingTipCards: 전반적인 양육 팁 3개. 각 항목:
  - icon: 팁에 어울리는 이모지
  - title: 팁 핵심 제목 (5~10글자)
  - desc: 이 아이 사주 근거를 담아 부모가 바로 실천할 수 있는 구체적 조언 2~3문장. 홍연 말투.

【말투 엄수】 모든 서술 문장은 홍연 말투(~이오/~하오/~겠소/~했소)로. "~ㅂ니다" "~어요" 금지.`,

  6: `[remedy 섹션 — 개운법]
이 아이의 사주에서 부족하거나 과한 오행을 파악하고, 부모가 일상에서 실천할 수 있는 개운법을 아래 항목에 따라 채우시오. 홍연 말투(~이오/~하오/~겠소) 엄수.

- yongsinEl: 용신 오행 1글자 (예: "화", "목", "수", "금", "토")
- heusinEl: 희신 오행 1글자
- gisinEl: 기신 오행 1글자
- yongsinReason: 용신 오행이 왜 이 아이에게 필요한지 1~2문장.
- heusinReason: 희신 오행이 왜 보조 역할을 하는지 1~2문장.
- gisinReason: 기신 오행이 왜 이 아이에게 부담이 되는지 1~2문장.
- intro: 이 아이에게 가장 필요한 오행 보완 방향 핵심 한 줄로 시작하여, 오행 구성에서 부족하거나 과한 기운이 무엇인지, 그것이 아이의 기질·성장·건강에 어떤 영향을 미치는지 부모가 납득할 수 있도록 이어서 서술. 전체 6~8문장, 250자 이상. 하나의 긴 단락으로 작성.
- paragraphs 1개:
  ①(intro에서 이어받아) 개운법을 꾸준히 실천했을 때 이 아이에게 어떤 변화가 생기는지, 부모가 마음에 새겨야 할 자세. 격려와 따뜻함으로 마무리. (4~5문장, 150자 이상)
  ②개운법을 꾸준히 실천했을 때 이 아이에게 어떤 변화가 생기는지, 부모가 마음에 새겨야 할 자세. 격려와 따뜻함으로 마무리. (4~5문장, 150자 이상)
- remedies: 개운법 4~5개. 반드시 위에서 정한 yongsinEl·heusinEl 오행을 보강하는 방향으로 구성하고, gisinEl 오행은 피하거나 줄이는 방향으로 연결하여 서술. 용신·희신에서 이미 설명한 오행 이유를 자연스럽게 이어받아 각 카드를 작성. 각 remedy:
  - icon: 이모지
  - category: "생활습관" / "환경·공간" / "음식·식재료" / "색상·소품" / "놀이·활동" 중 하나
  - title: 개운법 이름 (4~8자)
  - desc: 이 개운법이 yongsinEl 또는 heusinEl 오행을 어떻게 보강하는지 근거를 명시하고, 부모가 구체적으로 어떻게 실천하는지 서술. (3~4문장, 120자 이상). 홍연 말투.
- remedyCats: 3개. 분야별 실천 항목 묶음. 각:
  - icon: 이모지
  - category: "생활" 또는 "환경" 또는 "활동"
  - items: 부모가 바로 실천할 수 있는 구체적 항목 3~4개 (각 한 줄, 매우 구체적으로 — 예: "매일 아침 야외 햇빛 15분 쬐기", "아이 방에 초록 식물 1개 두기"). 반드시 용신·희신 오행 보강 방향으로 작성.
- remedyAdvice: 홍연이 이 아이의 성장을 응원하며 전하는 당부. 따뜻하고 진지하게. 4~5문장 150자 이상.

【말투 엄수】 모든 서술 문장은 홍연 말투(~이오/~하오/~겠소/~했소)로. "~ㅂ니다" "~어요" 금지.`,

  7: `[letter 섹션 — 홍연의 서신]
유아사주 풀이를 마치며 홍연이 부모에게 쓰는 따뜻한 손편지. 리포트 전체 내용을 아우르는 깊고 풍성한 서신이오.
- 바로 본론으로 시작하시오. "부모님께" 같은 수신인 문구 없이 첫 문장부터 핵심을 쓰시오.
- paragraphs: 5~6개 단락. 각 단락 반드시 7~9문장, 300자 이상. (짧은 단락 절대 금지)
- 단락 구성:
  ①이 아이가 타고난 기질과 빛 — 사주에서 읽은 이 아이의 본질적 강점과 아름다움을 구체적이고 따뜻하게 풀어내시오.
  ②아이와 함께하는 부모의 역할 — 이 아이의 성장을 도울 부모의 자세, 아이를 바라보는 시선에 대한 깊은 통찰을 담으시오.
  ③성장의 굴곡에서 — 힘든 시기가 오더라도 그것이 성장의 일부임을 부모가 기억해야 할 것들을 따뜻하게 일러주시오.
  ④이 아이가 세상에 줄 것 — 이 아이가 성장하면서 세상과 어떻게 만날지, 어떤 빛을 발할지 홍연의 시선으로 그려주시오.
  ⑤부모에게 전하는 마지막 당부 — 아이를 믿는 것, 함께 걷는 것에 대한 홍연의 진심 어린 격려로 마무리하시오.
- 홍연 말투(~이오/~하오/~겠소/~했소)를 일관되게 유지하시오. "~ㅂ니다" "~어요" 절대 금지.
- 감동적이고 문학적인 어조로, 부모가 눈물을 글썽이며 읽을 수 있을 만큼 깊고 따뜻하게 쓰시오.`,
};

// ── 장별 JSON 스키마 ──
const YOUARE_CH_SCHEMA: Record<number, string> = {
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
  "ability": { "paragraphs": ["①강한 능력치 2~3개 조합 시너지 풀이. 210~220자. 홍연 말투.", "②낮은 능력치 1~2개 솔직하게 짚기 + 부모 실용 조언 포함. 230~250자. 홍연 말투.", "③강점 기반 마무리 격려. 65~75자. 홍연 말투."] },
  "sipseong": { "intro": "[이름]님의 명식에는 [십성명]의 기운이 강하게 자리 잡고 있소. 형식으로 시작", "callout": "그 십성이 삶에서 드러나는 방식 한 문장", "paragraphs": ["주된 십성 성향과 삶의 패턴", "보조 십성과의 상호작용", "십성이 없거나 과할 때의 영향"] },
  "unseong": { "intro": "일지 운성부터 언급하며 시작", "callout": "이 운성이 나타내는 삶의 리듬 핵심 한 문장", "paragraphs": ["일지 운성의 기운과 삶의 리듬", "다른 기둥 운성들과의 조합이 만드는 전체 흐름", "이 운성 조합 활용 조언"] },
  "sinsalReading": { "paragraphs": ["신살 풀이 1 — 귀인살 중심", "신살 풀이 2 — 살의 기운과 긍정적 면", "신살 풀이 3 — 통합 기운과 활용 조언. 전체 560자 내외."] },
  "pyori": { "intro": "겉으로는 [천간 십성 인상], 속으로는 [일지 십성 본성]인 사주이오. 형식으로 시작", "callout": "이 괴리가 만드는 핵심 삶의 패턴 한 문장", "paragraphs": ["겉으로 보이는 인상(천간)", "실제 내면(일지·지지)", "이 간극을 조화롭게 사는 법"] }
}`,
  2: `{
  "health": {
    "intro": "건강 주의 핵심 한 줄 (1문장) — 구체적 신체 부위 명시",
    "paragraphs": [
      "【단락1 — 취약 신체와 오행 근거 / 반드시 정확히 5문장 / 180~220자】 아래 예시 문체·깊이·분량을 그대로 따르되, 이 아이의 실제 오행 구성(위 [오행 실제 개수] 참고)에 맞게 강한 오행·약한 오행을 바꿔 작성하시오. 예시: '이 아이의 명식에는 목(木)의 기운이 유독 강하게 자리잡고 있소. 목이 지나치게 왕성하면 토(土)를 억누르는 힘이 강해져 비장과 위장이 제 역할을 못하기 쉽소. 밥을 먹어도 소화가 더디거나 체하는 일이 잦고, 기운이 음식으로 잘 채워지지 않는 체질이오. 더불어 수(水)가 부족하니 신장과 방광의 수분 대사가 허약하여 피로 회복이 느리고 면역의 바닥이 얕소. 평소 과식을 피하고 수분을 꾸준히 보충하는 습관이 이 아이에게 무엇보다 중요하오.'",
      "【단락2 — 생활 습관·부모 역할 / 반드시 정확히 5문장 / 180~220자】 아래 예시 문체·깊이·분량을 그대로 따르되, 이 아이의 오행 취약점에 맞게 구체적 생활법을 조정하시오. 예시: '목이 강한 아이는 감정 기복이 올 때 신체 증상으로 먼저 나타나는 경향이 있소. 스트레스를 받거나 긴장하면 위경련·복통·두통으로 연결되기 쉬우니 정서 안정이 곧 건강 관리라는 점을 기억하시오. 잠을 충분히 자는 것만으로도 이 아이의 수(水)를 보충하는 효과가 있소. 인스턴트·자극적 음식보다는 따뜻한 국물 요리와 규칙적인 식사 시간이 토의 기운을 안정시켜 주오. 성장기에 이 두 가지 — 숙면과 규칙적인 식사 — 를 지켜주는 것이 이 아이에게 가장 좋은 건강 투자오.'"
    ],
    "weakPoints": [
      { "icon": "🫁", "part": "취약 부위/계통1", "desc": "2~3문장 (오행 상극 근거 + 부모 주의점). 홍연 말투." },
      { "icon": "🫀", "part": "취약 부위/계통2", "desc": "2~3문장 (오행 상극 근거 + 부모 주의점). 홍연 말투." }
    ],
    "healthTipCards": [
      { "icon": "💧", "title": "팁 제목 (5~10글자)", "desc": "2~3문장. 왜 이 방법이 이 아이에게 필요한지 사주 근거 포함. 부모가 바로 실행할 수 있는 내용. 홍연 말투." },
      { "icon": "🍲", "title": "팁 제목 (5~10글자)", "desc": "2~3문장. 홍연 말투." },
      { "icon": "😴", "title": "팁 제목 (5~10글자)", "desc": "2~3문장. 홍연 말투." },
      { "icon": "🧘", "title": "팁 제목 (5~10글자)", "desc": "2~3문장. 홍연 말투." }
    ]
  }
}`,
  3: `{
  "parenting": {
    "keywords": ["키워드1 (3~5자, 예: 자율적 환경)", "키워드2", "키워드3", "키워드4"],
    "paragraphs": [
      "단락1 — 이 아이 기질·성향 기반 양육 환경 풀이 (4문장 이상, 200자 이상)",
      "단락2 — 위 양육 환경 유형들이 이 아이에게 맞는 이유 + 환경 갖춰졌을 때 변화 (4문장 이상, 200자 이상)"
    ],
    "parentingStyles": [
      { "icon": "🌿", "name": "환경 유형명", "desc": "이 아이에게 맞는 이유 2문장" },
      { "icon": "📖", "name": "환경 유형명", "desc": "이 아이에게 맞는 이유 2문장" },
      { "icon": "🎨", "name": "환경 유형명", "desc": "이 아이에게 맞는 이유 2문장" },
      { "icon": "🤝", "name": "환경 유형명", "desc": "이 아이에게 맞는 이유 2문장" }
    ],
    "parentingTips": [
      "팁1 — 2~3문장 분량으로 구체적으로",
      "팁2 — 2~3문장 분량으로 구체적으로",
      "팁3 — 2~3문장 분량으로 구체적으로",
      "팁4 — 2~3문장 분량으로 구체적으로"
    ],
    "parentingAdvice": "부모에게 전하는 홍연의 한 마디 (3~4문장, 따뜻하고 격려하는 어조)"
  }
}`,
  4: `{
  "talent": {
    "intro": "이 아이는 ~을 타고났소. (1문장, 25자 내외)",
    "paragraphs": ["주된 십성 기반 강점·특성·발현 환경·주의점 포함. 5~6문장, 200자 내외. 홍연 말투.", "계발 방식·강요 시 부작용·최적 성장 조건 포함. 5~6문장, 200자 내외. 홍연 말투."],
    "fields": [
      { "icon": "🎨", "name": "재능 분야명1", "subFields": ["세부분야1", "세부분야2", "세부분야3"], "desc": "4문장 사주 근거 설명" },
      { "icon": "🎵", "name": "재능 분야명2", "subFields": ["세부분야1", "세부분야2"], "desc": "4문장 사주 근거 설명" },
      { "icon": "📐", "name": "재능 분야명3", "subFields": ["세부분야1", "세부분야2", "세부분야3"], "desc": "4문장 사주 근거 설명" }
    ],
    "talentTipCards": [
      { "icon": "🎨", "title": "실천 제목1", "desc": "4문장 설명" },
      { "icon": "📚", "title": "실천 제목2", "desc": "4문장 설명" },
      { "icon": "🌱", "title": "실천 제목3", "desc": "4문장 설명" },
      { "icon": "💬", "title": "실천 제목4", "desc": "4문장 설명" }
    ]
  }
}`,
  5: `{
  "parentingFlow": {
    "intro": "양육 핵심 포인트 한 줄 (1문장)",
    "callout": "부모가 집중해야 할 방향 한 문장",
    "paragraphs": ["단락1 (4~5문장)", "단락2 (4~5문장)"],
    "growthPhases": [
      { "yearStart": 2025, "yearEnd": 2026, "score": 60, "tone": "caution", "title": "이 구간 키워드", "desc": "해당 세운 간지를 언급하며 2~3문장" },
      { "yearStart": 2027, "yearEnd": 2028, "score": 40, "tone": "good", "title": "이 구간 키워드", "desc": "해당 세운 간지를 언급하며 2~3문장" },
      { "yearStart": 2029, "yearEnd": 2030, "score": 70, "tone": "warn", "title": "이 구간 키워드", "desc": "해당 세운 간지를 언급하며 2~3문장" },
      { "yearStart": 2031, "yearEnd": 2032, "score": 50, "tone": "caution", "title": "이 구간 키워드", "desc": "해당 세운 간지를 언급하며 2~3문장" },
      { "yearStart": 2033, "yearEnd": 2034, "score": 35, "tone": "good", "title": "이 구간 키워드", "desc": "해당 세운 간지를 언급하며 2~3문장" }
    ],
    "parentingTipCards": [
      { "icon": "🌱", "title": "팁 제목 (5~10글자)", "desc": "이 아이 사주 근거를 담아 부모가 바로 실천할 수 있는 양육 조언 2~3문장. 홍연 말투." },
      { "icon": "💬", "title": "팁 제목", "desc": "2~3문장" },
      { "icon": "🤝", "title": "팁 제목", "desc": "2~3문장" }
    ]
  }
}`,
  6: `{
  "remedy": {
    "yongsinEl": "화",
    "heusinEl": "목",
    "gisinEl": "금",
    "yongsinReason": "용신 오행이 이 아이에게 필요한 이유 1~2문장",
    "heusinReason": "희신 오행이 보조 역할을 하는 이유 1~2문장",
    "gisinReason": "기신 오행이 이 아이에게 부담이 되는 이유 1~2문장",
    "intro": "이 아이에게 필요한 오행 보완 방향 핵심 문장으로 시작하여 오행 부족·과잉 영향까지 이어 서술하는 긴 단락 (6~8문장, 250자 이상)",
    "paragraphs": ["단락1 — 개운 실천의 변화와 부모 자세 (4~5문장, 150자 이상)"],
    "remedies": [
      { "icon": "🌿", "category": "생활습관", "title": "개운법 이름 (4~8자)", "desc": "오행 근거 + 구체적 실천법 3~4문장" },
      { "icon": "🏠", "category": "환경·공간", "title": "개운법 이름", "desc": "3~4문장" },
      { "icon": "🥗", "category": "음식·식재료", "title": "개운법 이름", "desc": "3~4문장" },
      { "icon": "🎨", "category": "색상·소품", "title": "개운법 이름", "desc": "3~4문장" },
      { "icon": "🏃", "category": "놀이·활동", "title": "개운법 이름", "desc": "3~4문장" }
    ],
    "remedyCats": [
      { "icon": "🌱", "category": "생활", "items": ["구체적 실천 항목1", "구체적 실천 항목2", "구체적 실천 항목3"] },
      { "icon": "🏡", "category": "환경", "items": ["구체적 실천 항목1", "구체적 실천 항목2", "구체적 실천 항목3"] },
      { "icon": "🎯", "category": "활동", "items": ["구체적 실천 항목1", "구체적 실천 항목2", "구체적 실천 항목3"] }
    ],
    "remedyAdvice": "홍연의 따뜻한 응원과 당부 (4~5문장, 150자 이상)"
  }
}`,
  7: `{
  "letter": {
    "paragraphs": [
      "단락1 — 이 아이의 기질과 빛 (7~9문장, 300자 이상)",
      "단락2 — 부모의 역할과 시선 (7~9문장, 300자 이상)",
      "단락3 — 성장의 굴곡에서 (7~9문장, 300자 이상)",
      "단락4 — 이 아이가 세상에 줄 것 (7~9문장, 300자 이상)",
      "단락5 — 부모에게 전하는 마지막 당부 (7~9문장, 300자 이상)"
    ]
  }
}`,
};

// ── ch6 전용: 세운 기반 만 0~15세 성장 기운 계산 ──
function computeGrowthData(ilganChar: string, birthYear: number, seunData: { label: string; gz: string }[]): string {
  const SIPSEONG_SCORE: Record<string, number> = {
    인성:82, 정인:84, 편인:78,
    비겁:70, 비견:72, 겁재:64,
    식상:52, 식신:55, 상관:48,
    재성:33, 정재:36, 편재:30,
    관성:20, 정관:23, 편관:16,
  };
  const STEM_EL: Record<string,string> = { 甲:"목",乙:"목",丙:"화",丁:"화",戊:"토",己:"토",庚:"금",辛:"금",壬:"수",癸:"수" };
  const BRANCH_EL: Record<string,string> = { 子:"수",丑:"토",寅:"목",卯:"목",辰:"토",巳:"화",午:"화",未:"토",申:"금",酉:"금",戌:"토",亥:"수" };
  const GEN: Record<string,string> = { 목:"화",화:"토",토:"금",금:"수",수:"목" };
  const CTL: Record<string,string> = { 목:"토",화:"금",토:"수",금:"목",수:"화" };
  const GANJIS = ["甲子","乙丑","丙寅","丁卯","戊辰","己巳","庚午","辛未","壬申","癸酉","甲戌","乙亥","丙子","丁丑","戊寅","己卯","庚辰","辛巳","壬午","癸未","甲申","乙酉","丙戌","丁亥","戊子","己丑","庚寅","辛卯","壬辰","癸巳","甲午","乙未","丙申","丁酉","戊戌","己亥","庚子","辛丑","壬寅","癸卯","甲辰","乙巳","丙午","丁未","戊申","己酉","庚戌","辛亥","壬子","癸丑","甲寅","乙卯","丙辰","丁巳","戊午","己未","庚申","辛酉","壬戌","癸亥"];
  const BASE_IDX = GANJIS.indexOf("甲辰"); const BASE_YEAR = 2024;
  const seunMap: Record<number,string> = {};
  seunData.forEach(s => { const y = Number(s.label); if (y > 1900) seunMap[y] = s.gz; });
  function getGz(year: number): string {
    return seunMap[year] ?? GANJIS[(BASE_IDX + ((year - BASE_YEAR) % 60 + 60)) % 60];
  }
  function toSip(ilEl: string, tEl: string): string {
    if (ilEl === tEl) return "비겁";
    if (GEN[ilEl] === tEl) return "식상";
    if (CTL[ilEl] === tEl) return "재성";
    if (CTL[tEl] === ilEl) return "관성";
    if (GEN[tEl] === ilEl) return "인성";
    return "비겁";
  }
  const ilEl = STEM_EL[ilganChar] ?? "목";
  const AGES = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
  const raw = AGES.map(age => {
    const gz = getGz(birthYear + age);
    const sEl = STEM_EL[gz[0]]; const bEl = BRANCH_EL[gz[1]];
    const sS = sEl ? (SIPSEONG_SCORE[toSip(ilEl, sEl)] ?? 50) : 50;
    const bS = bEl ? (SIPSEONG_SCORE[toSip(ilEl, bEl)] ?? 50) : 50;
    return Math.round(sS * 0.6 + bS * 0.4);
  });
  const mid = (Math.max(...raw) + Math.min(...raw)) / 2;
  const amp = (Math.max(...raw) - Math.min(...raw)) / 2 || 1;
  const normalized = raw.map(v => (v - mid) / amp);

  const lines = AGES.map((age, i) => {
    const gz = getGz(birthYear + age);
    const sEl = STEM_EL[gz[0]]; const bEl = BRANCH_EL[gz[1]];
    const sipS = sEl ? toSip(ilEl, sEl) : "비겁";
    const sipB = bEl ? toSip(ilEl, bEl) : "비겁";
    const sign = normalized[i] >= 0 ? "+" : "−";
    return `만 ${age}세 (${birthYear + age}년 ${gz}): ${sign}${sign === "+" ? "순탄" : "주의"} / 천간십성:${sipS} 지지십성:${sipB}`;
  });

  // 연속 구간 요약
  const zones: string[] = [];
  let zStart = 0; let zSign = normalized[0] >= 0;
  for (let i = 1; i <= AGES.length; i++) {
    const curSign = i < AGES.length ? normalized[i] >= 0 : !zSign;
    if (curSign !== zSign || i === AGES.length) {
      const label = zSign ? "순탄" : "주의";
      zones.push(`만 ${AGES[zStart]}~${AGES[i-1]}세: ${label}`);
      zStart = i; zSign = curSign;
    }
  }

  return `[성장 기운 그래프 데이터 — 세운 × 일간(${ilganChar}) 십성 계산]\n${lines.join("\n")}\n\n[구간 요약]\n${zones.join(" / ")}`;
}

// ── 핵심 함수: 장별 프롬프트 빌더 ──
function calcAbilityScores(pillars: { sipTop: string; sipBot: string; ganEl: string; jiEl: string }[]): { label: string; value: number }[] {
  const sip: Record<string, number> = {};
  const el: Record<string, number> = {};
  for (const p of pillars) {
    for (const s of [p.sipTop, p.sipBot]) if (s) sip[s] = (sip[s] ?? 0) + 1;
    for (const e of [p.ganEl, p.jiEl]) if (e) el[e] = (el[e] ?? 0) + 1;
  }
  const g = (keys: string[]) => keys.reduce((a, k) => a + (sip[k] ?? 0), 0);
  const e = (keys: string[]) => keys.reduce((a, k) => a + (el[k] ?? 0), 0);
  const sc = (raw: number) => Math.min(98, Math.max(28, 42 + raw * 13));
  return [
    { label: "추진력", value: sc(g(["겁재","편관"]) + e(["목","금"]) * 0.5) },
    { label: "리더십", value: sc(g(["편관","정관","겁재"]) + e(["금"]) * 0.6) },
    { label: "창의력", value: sc(g(["상관","편인"]) + e(["화","수"]) * 0.5) },
    { label: "재물운", value: sc(g(["편재","정재"]) + e(["토"]) * 0.6) },
    { label: "지속력", value: sc(g(["식신","정재","정관"]) + e(["토","목"]) * 0.4) },
    { label: "사교력", value: sc(g(["비견","식신","상관"]) + e(["화"]) * 0.6) },
    { label: "감수성", value: sc(g(["정인","편인"]) + e(["수"]) * 0.6) },
    { label: "직관력", value: sc(g(["편인","상관"]) + e(["수","화"]) * 0.5) },
  ];
}

export function buildYouareChapterPrompt(
  chapter: number,
  input: {
    name: string;
    gender: "male" | "female";
    manseryeokText: string;
    pillars?: { pos: string; gan: string; ganEl: string; ji: string; jiEl: string; sipTop: string; sipBot: string; sinsal?: string }[];
    birthYear?: number;
    seun?: { label: string; gz: string }[];
    ilganChar?: string;
    yongsinEl?: string;
    heusinEl?: string;
    gisinEl?: string;
  }
): { system: string; user: string } {
  const theme = YOUARE_CH_THEME[chapter] ?? `[제${chapter}장]`;
  const schema = YOUARE_CH_SCHEMA[chapter] ?? "{}";
  const givenName = input.name.length > 1 ? input.name.slice(1) : input.name;
  const honorSuffix = input.gender === "female" ? "양" : "군";
  const honor = givenName ? `${givenName}${honorSuffix}` : "이 아이";
  const childLabel = honor;
  const rawGuide = YOUARE_CH_GUIDE[chapter] ?? "";
  const guide = rawGuide.replace(/\{이름1\}님/g, honor).replace(/이름 뒤에는 '님'을 붙일 것/, `이름 뒤에는 남자아이면 '군', 여자아이면 '양'을 붙일 것`);
  const currentYear = new Date().getFullYear();

  const graphData = "";

  // 전 장 공통: 오행 개수 + 십성 카운트 주입 (LLM 해석 오류 방지)
  let ohaengCountNote = "";
  if (input.pillars && input.pillars.length > 0) {
    const elCnt: Record<string, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
    const sipCnt: Record<string, number> = {};
    for (const p of input.pillars) {
      if (p.ganEl && elCnt[p.ganEl] !== undefined) elCnt[p.ganEl]++;
      if (p.jiEl  && elCnt[p.jiEl]  !== undefined) elCnt[p.jiEl]++;
      for (const s of [p.sipTop, p.sipBot]) if (s) sipCnt[s] = (sipCnt[s] ?? 0) + 1;
    }
    const elTotal = Object.values(elCnt).reduce((a, b) => a + b, 0) || 1;
    const elSorted = Object.entries(elCnt).sort((a, b) => b[1] - a[1]);
    const strong = elSorted.filter(([, v]) => v >= 2).map(([k, v]) => `${k}(${v}개, ${Math.round(v/elTotal*100)}%)`).join("·") || "없음";
    const weak   = elSorted.filter(([, v]) => v <= 1).map(([k, v]) => `${k}(${v}개, ${Math.round(v/elTotal*100)}%)`).join("·") || "없음";
    const sipLines = Object.entries(sipCnt).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}×${v}`).join(" / ");
    ohaengCountNote = `\n[사주 실제 구성 — 반드시 이 값 그대로 사용하시오. 다르게 서술하는 것은 절대 금지]\n오행: 강한 오행(2개 이상)=${strong} / 약한 오행(0~1개)=${weak}\n십성: ${sipLines || "없음"}\n`;
  }

  // ch1: 능력치 점수를 프롬프트에 주입 (차트와 풀이 일치)
  let abilityData = "";
  if (chapter === 1 && input.pillars && input.pillars.length > 0) {
    const scores = calcAbilityScores(input.pillars);
    const sorted = [...scores].sort((a, b) => b.value - a.value);
    abilityData = `\n[타고난 능력치 — 차트에 표시되는 실제 계산값]\n` +
      scores.map(s => `${s.label}: ${s.value}점`).join(" / ") + "\n" +
      `높은 순: ${sorted.map(s => `${s.label}(${s.value}점)`).join(" > ")}\n` +
      `(80점 이상=강점, 60점 미만=보완 필요. 풀이는 반드시 이 점수를 기준으로 작성하시오.)\n`;
  }

  // ch6: 이미 확정된 용신/희신/기신이 있으면 프롬프트에 고정 주입
  let yongsinNote = "";
  if (chapter === 6 && input.yongsinEl && input.heusinEl && input.gisinEl) {
    yongsinNote = `\n[확정 오행 — 반드시 아래 값을 그대로 사용하시오. 임의로 변경 금지]\n용신: ${input.yongsinEl} / 희신: ${input.heusinEl} / 기신: ${input.gisinEl}\n`;
  }

  const honorificBlock = `\n\n[호칭 — 아래 형태만 그대로 사용, 절대 변형 금지]
아이를 부를 때 반드시 아래 중 하나를 그대로 복사해 사용하오:
  "${honor}은"  "${honor}이"  "${honor}을"  "${honor}과"  "${honor}에게"  "${honor}으로"  "${honor}의"  "${honor}"

⚠️ 이름을 직접 조합하거나 추론하지 마오. 반드시 위 형태 중 하나를 그대로 쓰오.
⚠️ 계절 단어("봄" "여름" "가을" "겨울")는 고유 단어이오. 절대 변형 금지.`;

  const user = `아래는 ${childLabel}의 사주 명식입니다.

${input.manseryeokText}${honorificBlock}
${input.birthYear ? `\n출생연도: ${input.birthYear}년 / 현재연도: ${currentYear}년` : `\n현재연도: ${currentYear}년`}
${graphData}${ohaengCountNote}${abilityData}${yongsinNote}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
이번 장의 주제: ${theme}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${guide ? `\n작성 지침:\n${guide}\n` : ""}
위 명식을 꼼꼼히 분석하여, 아래 JSON 스키마를 정확히 채워주시오.
반드시 유효한 JSON만 출력하시오. 코드펜스(\`\`\`)나 설명 문장은 절대 쓰지 마시오.
풀이 대상은 부모가 의뢰한 유아(아이)임을 염두에 두고, 부모가 읽는 시점에서 따뜻하고 실용적으로 서술하시오.

${schema}`;

  return { system: SYSTEM, user };
}
