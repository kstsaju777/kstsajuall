// =====================================================
// 연애사주 결과지 — 장별 풀이 프롬프트 & 구조
// =====================================================
// 정통사주(report-content.ts)와 독립적으로 관리합니다.
// 홍연 화자 SYSTEM은 report-prompts.ts에서 공유.

import { SYSTEM } from "./report-prompts";

// ── 찰떡궁합 순위 데이터 타입 (buildCompatDescPrompt 호환) ──
interface DescRankDataLocal {
  iKr: string;
  ageRel: string;
  ageDesc: string;
  ilGanEl: string;
  styleHint: string;
  jobHint: string;
  reasons: string;
}

type CompatPillarObj = {
  nyeon: { gan: string; ji: string; ganEl: string; jiEl: string };
  wol:   { gan: string; ji: string; ganEl: string; jiEl: string };
  il:    { gan: string; ji: string; ganEl: string; jiEl: string };
  si:    { gan: string; ji: string; ganEl: string; jiEl: string };
  birthDate: string;
  siName: string;
  tags: string[];
};

// ── 장별 필수 섹션 키 ──
export const YEONAE_SAJU_CHAPTER_SECTIONS: Record<number, string[]> = {
  1: ["wonguk", "geokguk", "yeonaeseong"],
  2: ["loveStyle"],
  3: ["loveStyle", "loveFlow", "compatibleJuju"],
  4: ["loveTiming", "loveFlow", "lovePattern"],
  5: ["meetingWay", "meetingFlow"],
  6: ["loveCare", "loveAvoid", "loveSummary"],
  7: ["letter"],
};

// ── 장 완성 여부 확인 ──
export function isYeonaeSajuChapterReady(
  content: Record<string, unknown> | null | undefined,
  chapter: number
): boolean {
  if (!content) return false;
  const keys = YEONAE_SAJU_CHAPTER_SECTIONS[chapter] ?? [];
  return keys.every((k) => {
    const val = content[k];
    if (!val) return false;
    // compatibleJuju is a plain array
    if (Array.isArray(val)) return (val as unknown[]).length > 0;
    if (typeof val !== "object") return false;
    const v = val as Record<string, unknown>;
    if ("sinDesc" in v) return typeof v.sinDesc === "string" && (v.sinDesc as string).length > 0;
    if ("keyword" in v) return typeof v.keyword === "string" && (v.keyword as string).length > 0;
    if ("items" in v && "summary" in v) return Array.isArray(v.items) && (v.items as unknown[]).length > 0;
    if ("modes" in v) return Array.isArray(v.modes) && (v.modes as unknown[]).length > 0;
    if ("cards" in v) return Array.isArray(v.cards) && (v.cards as unknown[]).length > 0;
    if ("wellTypes" in v) return Array.isArray(v.wellTypes) && (v.wellTypes as unknown[]).length > 0;
    if ("leftLabel" in v) return typeof v.leftLabel === "string" && (v.leftLabel as string).length > 0;
    if ("partnerType" in v) return typeof v.partnerType === "string" && (v.partnerType as string).length > 0;
    if ("meetingType" in v) return typeof v.meetingType === "string" && (v.meetingType as string).length > 0;
    if ("starDesc" in v) return typeof v.starDesc === "string" && (v.starDesc as string).length > 0;
    if ("paragraphs" in v) return Array.isArray(v.paragraphs) && (v.paragraphs as unknown[]).length > 0;
    if ("types" in v) return Array.isArray(v.types) && (v.types as unknown[]).length > 0;
    if ("items" in v) return Array.isArray(v.items) && (v.items as unknown[]).length > 0;
    if ("tips" in v) return Array.isArray(v.tips) && (v.tips as unknown[]).length > 0;
    if ("element" in v) return typeof v.element === "string" && (v.element as string).length > 0;
    if ("intro" in v) return typeof v.intro === "string" && (v.intro as string).length > 0;
    if ("coreMessage" in v) return typeof v.coreMessage === "string" && (v.coreMessage as string).length > 0;
    if ("blocks" in v) return Array.isArray(v.blocks) && (v.blocks as unknown[]).length > 0;
    return false;
  });
}

// ── 장별 주제 ──
const YEONAE_CH_THEME: Record<number, string> = {
  1: "[제1장 그릇] 나는 어떤 그릇으로 태어났나 — 일간 오행, 오행 균형, 신강·신약, 타고난 본바탕",
  2: "[제2장 연애기질] 나의 연애 기질 — 나는 어떻게 사랑하는가, 감정 표현 방식, 연애 패턴",
  3: "[제3장 이상형] 나는 어떤 사람에게 끌리고 잘 맞는가 — 이상형, 궁합 좋은 유형, 피해야 할 유형",
  4: "[제4장 인연시기] 내 인연은 언제 나타나는가 — 대운·세운으로 본 인연 시기, 연애운 흐름",
  5: "[제5장 만남] 어디서 어떻게 만나게 될까 — 만남의 방식과 장소, 인연이 이어지는 흐름",
  6: "[제6장 개운법] 내 연애운을 바꾸는 개운법 — 부족한 오행 보강, 연애 개운 핵심 조언, 종합 정리",
  7: "[마무리] 홍연의 서신 — 연애에 관한 따뜻한 손편지로 결과지를 맺는 글",
};

// ── 장별 추가 지시 ──
const YEONAE_CH_GUIDE: Record<number, string> = {
  1: `[wonguk 섹션 — 타고난 그릇 분석]
- intro: "~한 사주로, 한 문장 요약" 형식으로 시작. (1문장)
- sinStrength: 신강·신약 풀이. 아래 구조로 출력.
  - intro: 【필수】위 [득령·득지·득시·득세 판정] 결과를 그대로 사용하여, 아래 [sinStrength.intro 첫 문장]을 글자 하나도 바꾸지 말고 그대로 복사하오. 이후 일간 오행과 지배적 십성으로 신강/신약의 성향을 자연 이미지로 서술하오.
  - paragraphs: 아래 3개 단락 배열.
    ① 신강/신약의 핵심 성향과 장점 — 지배적 십성(비겁·식상 등)과 연결하여 자연 이미지로 서술. 사랑을 받아들이는 그릇의 크기와 연애 방식에 어떻게 발현되는지 포함. (2~3문장)
    ② 그 기운이 과할 때 그림자·단점을 자연 비유로 솔직하게 묘사. (2문장)
    ③ 주의점과 조언. (1~2문장)
- ohaengDesc: 오행 균형 풀이. 아래 구조로 출력.
  - intro: 【필수】위 [오행 분포]에서 가장 높은 비율의 오행부터 순서대로 언급하며, 각 오행이 연애와 연결되는 의미(목=성장·포용, 화=표현·열정, 토=안정·헌신, 금=절제·결단, 수=직관·감수성)를 바탕으로 이 사람의 연애 흐름을 설명하오. 비율이 0%인 오행은 '이 기운이 부족하여 연애에서 ~한 면이 채워지지 않을 수 있소' 형식으로 언급하오.
  - paragraphs: ["강한 오행들이 연애에서 어떻게 드러나는지 2~3문장", "부족한 오행으로 인한 연애 빈자리와 보완 방향 1~2문장"]
- ilganDesc: 이 사람의 일간({일간한자} {일간명})을 자연물 하나에 빗대어 연애 기질을 풀이하오. 아래 구조를 반드시 따르오.
  ① 첫 문장: "{이름(성씨 제외)}님의 일간인 {일간명}은 [자연물 은유]이오." 로 시작. (예: 이름이 '김선우'이면 '선우님'으로 표기)
  ② 그 자연물의 고유한 움직임·성질을 구체적으로 전개하여 이 일간의 기질을 생생하게 묘사. (2문장 — 각 문장을 충분히 펼쳐 쓰오.)
  ③ 사랑이 이 기질과 어떻게 연결되는지 — 연애에서 감정이 흐르는 구조와 실제 패턴을 구체적 예시(표현 방식·집착 경향·관계 맺기 방식 등)와 함께 서술. (2문장)
  ④ "다만 {일간명}의 {특성}은 때로 {부정적 측면}으로 번지오." 형식으로 연애 약점 한 가지. (1문장)
  ⑤ 그 약점이 관계에 어떤 결과를 낳는지 짚고, 보완하는 구체적 행동 조언으로 마무리. (1문장)
  [제약] 어미는 "~이오" "~하오" "~소" "~오" 등 고어체. 전체 6~7문장, 300자 이상 충분히 서술. 짧게 끊지 말고 각 문장을 밀도 있게 전개하오. "뛰어나오" "중요하오" 같은 추상적 칭찬 금지 — 반드시 구체적 상황·행동·패턴으로 풀어쓰오. 자연물 은유는 아래 일간별 특성표에서 도출하오.
  [일간별 특성표 — 반드시 해당 일간의 자연물·기질·연애 패턴·약점을 풀이에 반영하오]
  甲(갑목): 자연물=곧게 뻗은 큰 나무. 기질=개척·리더십·직진하는 기상. 연애패턴=먼저 다가가 이끌고 싶어하며, 상대를 보호·지지하는 방식으로 사랑을 표현함. 약점=고집으로 상대의 감정을 무시하거나 일방적으로 밀어붙임.
  乙(을목): 자연물=담장을 타는 덩굴·화초. 기질=유연함·적응력·환경 활용. 연애패턴=상대에게 자연스럽게 스며들며 관계를 이어가고, 인연과 주변 분위기를 통해 사랑을 쌓아감. 약점=우유부단하여 마음을 전달해야 할 결정적 순간에 망설임.
  丙(병화): 자연물=태양. 기질=밝음·표현력·사람을 끌어모으는 에너지. 연애패턴=드러내고 표현하는 방식으로 감정을 전달하며, 주목받고 활동할수록 사랑도 활기를 띰. 약점=빠르게 타오르고 쉽게 식어 지속적인 관심과 노력이 부족해짐.
  丁(정화): 자연물=촛불·등불. 기질=섬세함·깊은 집중·관계를 밝히는 힘. 연애패턴=한 사람을 깊이 집중해서 아끼고, 신뢰를 쌓으며 꾸준히 관계를 밝혀감. 약점=소심함과 불안이 감정 표현을 가로막고 관계를 좁게 만듦.
  戊(무토): 자연물=산·대지. 기질=묵직한 안정감·포용력·뚝심. 연애패턴=든든하고 안정적인 사랑을 추구하며, 믿음과 책임감으로 관계를 지속함. 약점=변화에 둔하여 상대의 새로운 감정 흐름을 읽지 못하고 관계가 정체됨.
  己(기토): 자연물=논밭·평지. 기질=세심함·실용성·꾸준히 가꾸는 힘. 연애패턴=소소한 배려와 반복적인 노력으로 관계를 가꾸며, 세심한 돌봄에서 사랑을 표현함. 약점=욕심이 생길 때 상대를 과하게 통제하거나 집착하게 됨.
  庚(경금): 자연물=바위·쇠도끼. 기질=결단력·원칙·강한 추진력. 연애패턴=결단력 있게 감정을 표현하고, 한번 마음먹으면 강하게 밀고 나가는 방식으로 사랑함. 약점=유연성 부족으로 상대의 감정과 상황을 배려하지 못해 충돌이 생김.
  辛(신금): 자연물=보석·칼날. 기질=정제됨·예민한 심미안·고부가가치 추구. 연애패턴=높은 기준을 가지고 상대를 신중하게 선택하며, 깊고 정제된 방식으로 감정을 나눔. 약점=완벽주의로 상대의 작은 단점에도 예민하게 반응하여 관계가 피로해짐.
  壬(임수): 자연물=바다·큰 강. 기질=넓은 시야·정보력·유동적 지략. 연애패턴=다양한 사람과 자연스럽게 어울리며 감정을 넓고 깊게 품고, 여러 방식으로 사랑을 표현함. 약점=방향이 산만하여 한 사람에게 집중해야 할 때 감정이 분산됨.
  癸(계수): 자연물=샘물·이슬·빗물. 기질=깊은 직관·예리함·조용한 침투력. 연애패턴=직관으로 상대의 마음을 먼저 읽고, 은근하지만 깊이 스며드는 방식으로 사랑함. 약점=불안과 의심이 지나쳐 관계를 스스로 어렵게 만들거나 인연을 걷어냄.

[geokguk 섹션 — 격국]
이 사람의 격국(格局)을 월지 기준으로 판단하여 아래 형식으로 출력하오.
- name: 격국 이름 (예: "편인격", "정관격", "식신격", "재격" 등).
- keyword: 이 격이 가진 핵심 특성 키워드 2~3개를 "·"로 구분. 반드시 각 키워드는 2~3글자 단어로만 (예: "직관·창의·독립"). 긴 수식어(특수한, 신비로운 등) 절대 금지.
- intro: 【필수】'격국으로는 [격국명]에 해당하여 ~' 형식으로 시작하여, 이 격국이 연애와 연결되는 핵심 성향·특성 2가지를 자연스럽게 서술하오.
- callout: 이 격국에 어울리는 연애 방식·상대 유형·관계 스타일을 구체적으로 나열하는 한 문장.
- paragraphs: 아래 2개 단락 배열.
  ① 이 격국의 연애 기질과 강점을 체감 언어로 서술. (2~3문장)
  ② 이 격국이 과하거나 채워지지 않을 때 연애에서 나타나는 주의점. (1~2문장)

[yeonaeseong 섹션 — 연애성(관성·재성) 점검]
이 사람의 사주 원국에서 연애성의 상태를 항목별로 점검하오.
남성은 재성(財星)이, 여성은 관성(官星)이 배우자성(연애성).
items: 반드시 4개 항목. 각 항목:
- label: 체크 항목명 (예: "관성 존재", "관성 힘", "식상→관 흐름", "인성 보호") — 성별에 따라 관성/재성으로 조정
- exists: true(있음/좋음) 또는 false(없음/약함)
- desc: 해당 항목의 상태를 한 줄로 설명 (구체적인 천간·지지·십성 언급).
summary: 위 4가지 점검 결과를 종합한 연애성 풀이. 3~4문장. 이 사람의 연애 구조의 강점·약점·종합 방향을 홍연 화자로 풍부하게 서술.`,

  2: `[loveStyle 섹션 — 연애 기질]
- intro: 이 사람의 연애 기질을 대표하는 핵심 한 줄. (1문장, 홍연 화자)
- keywords: 연애 기질을 압축하는 키워드 3개. 각 2~4글자. (예: ["적극 표현형", "깊은 헌신형", "신중한 사랑"])
- modes: 3개 항목. 각 항목:
  - icon: 성격에 맞는 이모지 1개 (💕 감정표현, 🔄 연애패턴, ⚡ 강점·주의 등)
  - title: 짧은 소제목 (예: "감정을 표현하는 방식", "연애할 때 나타나는 패턴", "사랑 앞의 강점과 주의점")
  - desc: 해당 기질 설명 5~6문장. 구체적인 십성·오행 근거 포함. 각 문장 최소 25자 이상. 홍연 화자. 독자를 지칭할 때는 반드시 이름 뒤에 '님'을 붙이고 성씨는 제외하오 (예: 선우님, 지수님).
- traits: 4개 연애 성향 점수. 각 항목 { label, score(0~100 정수) }
  반드시 이 4개: "적극성" "헌신도" "감성" "독립성"
  사주 명식에 근거해 점수 산출.
- summaryParagraphs: 연애 기질 종합 풀이를 반드시 4개 단락 배열로 작성하오. 점수 숫자는 절대 언급하지 마오. 각 단락 2~3문장. 홍연 화자(~했소/~이오). 독자를 지칭할 때는 반드시 이름 뒤에 '님'을 붙이고 성씨는 제외하오 (예: 선우님, 지수님).
  [0] 이 사람의 연애 기질을 가장 잘 대표하는 특성을 짚고, 그 기질이 어디서 비롯되는지 사주 원국(일간·십성·오행)과 연결하여 서술.
  [1] 그 기질이 실제 연애에서 어떤 강점으로 발현되는지, 구체적인 상황을 떠올릴 수 있도록 체감 언어로 풍부하게 서술.
  [2] 감정 표현·헌신 방식에서 이 기질이 어떻게 나타나는지 서술하고, 이 기질의 맹점(지나친 집착·감정 억압·독립 고집 등)을 구체적으로 짚어줌.
  [3] 강점을 살리면서 맹점을 보완하는 연애 방향 조언. 이 사람만의 사랑 길을 제시하는 마무리 단락.`,

  3: `[loveStyle 섹션 작성 규칙]
① intro·callout은 반드시 빈 문자열("")로 두오.
② paragraphs는 반드시 1개 항목, 단락 구분 없이 하나의 흐름으로 작성하오.
   순서: 일주 연애 성향 → 어떤 이성에게 끌리는지(성격·분위기·조건) → 일지 배우자궁 + 합충형 경고.
③ 사주 용어를 쓸 때마다 반드시 괄호 안에 쉬운 설명을 붙이오. 예: "건록(자수성가와 독립을 상징하는 기운)".
   【일주 표기 규칙】 일주를 언급할 때는 반드시 주입된 일주 명칭(예: 을묘일주, 갑자일주)을 그대로 사용하오. "일간이 을목" 처럼 일간만 단독으로 먼저 얘기하지 마오. 반드시 "을묘일주(~의 기운)" 형식으로 일주 전체를 말하오.
   【합충형 절대 규칙】 주입된 [지지 합·충·형 실제 목록]에 있는 것만 언급하오. 목록에 없는 합·충·형을 임의로 만들어내면 절대 안 되오. 목록이 "없음"이면 해당 내용은 쓰지 마오.
④ 신강/신약 여부, 일지 십이운성, 합·충·형 유무를 실제 명식에서 확인하여 근거로 사용하오.
   【인연성 분석 금지】 재성·관성 위치 분석은 하지 마오. 구체적 기둥 위치(년주·월주 등)를 인연성과 연결하는 서술도 금지.
⑤ 【핵심 원칙】 어렵고 딱딱한 사주 설명이 아니라, 읽는 사람이 "맞아, 나 이런 사람이야" 하고 공감할 수 있는 쉬운 언어로 쓰오. 다음 세 가지를 자연스럽게 녹이오:
   - 이 사람의 연애관 (어떻게 사랑하는 사람인지)
   - 어떤 이성에게 끌리는지 (구체적 분위기·성격)
   - 연애에서 주의할 점 (실제 갈등 패턴과 조언)
⑥ 【말투 엄수】 홍연 말투(~이오/~하오/~겠소/~있소). "~ㅂ니다", "~어요" 단 한 문장도 금지.
⑦ 【글자수 엄수】 700~900자. 짧으면 탈락이오.

[loveFlow 섹션 작성 규칙]
① intro·callout·peakCallout은 반드시 빈 문자열("")로 두오.
② flow 배열은 반드시 빈 배열([])로 두오.
③ paragraphs는 1개 항목만. 위에 주입된 [2024~2033 세운별 연애운 점수표]를 반드시 참고하여 작성하오.
   - 2024~2033년 중 최소 5개 연도를 반드시 직접 언급하오. 점수 높은 해·낮은 해·전환점이 되는 해를 골고루 짚으오.
   - 점수 숫자는 언급 금지.
   - 연도 표기: '○○년 갑진년은' 형식. '가장' 최상급은 점수 1위 연도에만 사용.
   - 각 연도마다 그 시기에 어떻게 행동하면 좋은지, 어떤 점을 조심해야 하는지 짧게 조언을 담으오.
   - 【시제 규칙】 프롬프트에 주입된 '리포트 생성 기준일'을 확인하오.
     · 기준일 이전 연도 → 과거형 (~이었소, ~았소, ~했소)
     · 기준일이 속한 연도 → 현재형 (~이오, ~하오, ~있소)
     · 기준일 이후 연도 → 미래형 (~될 것이오, ~찾아오겠소, ~될 가능성이 높소)
   - 홍연 말투. '~ㅂ니다', '~어요' 절대 금지.
   - 500자 내외.`,

  4: `[loveTiming 섹션 — 인연 시기 방향]
- timingType: 이 명식의 인연 유형 이름. 2~5글자로 압축. (예: "늦봄 인연형", "불꽃 인연형", "차근차근형")
- timingKeywords: 인연 시기를 압축하는 키워드 3개. 각 2~4글자. (예: ["30대 절정", "느린 인연", "깊은 만남"])
- intro: 이 사람에게 인연이 오는 큰 흐름 핵심. 어떤 십성·오행이 인연 시기를 만드는지 포함. 3~4문장. 홍연 화자.
- cards: 인연 시기 3가지 관점 카드. 각 card:
  - icon: 관련 이모지 1개
  - title: 짧은 소제목 (예: "인연이 오는 시기", "인연의 특징", "맞이하는 자세")
  - desc: 해당 관점 설명 3~4문장. 구체적인 십성·오행·대운 근거 포함. 홍연 화자.
- summary: 인연 시기 종합 풀이 3~4문장. 언제 어떻게 인연을 맞이해야 하는지 방향 제시. 홍연 화자.

[loveFlow 섹션 — 시기별 인연 흐름]
items: 4~5개 시기별 흐름.
※ 현재는 2026년이오. 반드시 2026년부터 시작하며, 2024~2025년 등 지난 시기는 절대 언급하지 마시오.
각 item:
- label: 시기 (예: "2026", "2027~2028") — 2026년 이전 시기 금지
- trend: 반드시 아래 5개 중 하나만 선택 → "인연 상승" | "인연 절정" | "인연 하강" | "인연 저점" | "유지"
- title: 이 시기의 핵심 이름 (예: "설렘의 계절", "깊어지는 시기", "잠시 쉬어가기")
- text: 이 시기 연애 흐름과 인연의 기운 2~3문장. 어떤 세운이 작동하는지. 홍연 화자.
2026년부터 2033년까지 커버하오.

[lovePattern 섹션 — 인연 패턴 분석]
leftLabel: "일찍 오는 인연형", left: (비율 정수 0~100),
rightLabel: "늦게 피는 인연형", right: (100-left 계산),
leftDesc: 일찍 오는 인연형으로서 이 명식이 갖는 특징 3~4문장. 어떤 십성·오행이 빠른 인연을 가져오는지, 어떤 환경에서 인연이 일찍 열리는지. 홍연 화자.
rightDesc: 늦게 피는 인연형으로서 이 명식이 갖는 특징 3~4문장. 어떤 십성·오행이 인연을 늦추는지, 그 기다림이 어떤 깊이를 만드는지. 홍연 화자.
leftTips: 이른 인연을 여는 구체적 행동 2~3개 (각각 짧은 한 줄),
rightTips: 늦은 인연을 기다리며 준비할 것 2~3개 (각각 짧은 한 줄).`,

  5: `[meetingWay 섹션 — 만남 방식 분석]
- meetingType: 이 명식의 만남 유형 이름. 2~5글자로 압축. (예: "우연한 인연형", "소개 만남형", "일상 속 인연형")
- meetingKeywords: 만남 방식을 압축하는 키워드 3개. 각 2~4글자. (예: ["뜻밖의 만남", "자연스러운 흐름", "깊은 인연"])
- intro: 이 사람에게 인연이 찾아오는 방식의 핵심. 어떤 십성·오행이 만남의 방식을 만드는지 포함. 3~4문장. 홍연 화자.
- cards: 만남 3가지 관점 카드. 각 card:
  - icon: 관련 이모지 1개
  - title: 짧은 소제목 (예: "만남의 장소와 상황", "만남의 계기", "인연이 이어지는 방식")
  - desc: 해당 관점 설명 3~4문장. 구체적인 십성·오행 근거 포함. 홍연 화자.
- summary: 만남 방식 종합 풀이 2~3문장. 홍연 화자.

[meetingFlow 섹션 — 만남 단계별 흐름]
items: 3~4개 만남 단계.
각 item:
- label: 단계명 (예: "첫 만남", "호감 발전", "고백의 순간", "연애 시작")
- tone: "good" 또는 "warn"
- title: 이 단계의 핵심 특징 한 단어 (예: "설렘", "망설임", "결단")
- text: 이 단계에서 어떤 일이 일어나는지 2~3문장. 구체적 특징과 주의할 점 포함. 홍연 화자.`,

  6: `[loveCare 섹션 — 연애 개운법]
- element: 보강해야 할 오행 이름 (반드시 "금", "목", "화", "토", "수" 중 하나만 출력)
- elementDesc: 이 명식에서 왜 이 오행이 부족하고 보강하면 연애운에 어떤 변화가 오는지 2~3문장. 홍연 화자. 호칭 사용.
- tips: 연애 개운 실천법 5~6개. 각 tip:
  - icon: 관련 이모지 1개
  - category: 실천 분야 (예: "색상", "방향", "음식", "습관", "공간", "인간관계")
  - text: 구체적인 실천법 2~3문장. 무엇을 어떻게 해야 하는지, 왜 이 오행 보강이 연애운에 도움이 되는지 포함. 실제로 행동 가능한 내용. 홍연 화자. 호칭 사용.

[loveAvoid 섹션 — 연애를 막는 것들]
이 명식에서 과하거나 충극되어 연애 흐름을 방해하는 기운과, 그로 인해 피해야 할 행동·습관을 구체적으로 짚어주시오.
- intro: 이 명식에서 연애를 방해하는 기운의 특성 2~3문장. 어떤 오행·십성이 문제인지 근거 포함. 홍연 화자. 호칭 사용.
- blocks: 피해야 할 것 3개. 각 block:
  - icon: 관련 이모지 1개
  - title: 피해야 할 상황·행동 이름 (짧은 명사구, 예: "감정의 과잉 표현", "집착과 의심")
  - desc: 왜 이것이 이 명식에서 특히 연애에 해로운지 2~3문장. 어떤 십성·오행 충극 때문인지 구체적으로. 홍연 화자. 호칭 사용.

[loveSummary 섹션 — 종합 정리]
- coreMessage: 이 사람의 연애 인생 전체를 관통하는 핵심 메시지 한 문장. 홍연 말투(~이오/~하오/~겠소)로. 기억에 남을 만큼 인상적으로. (예: "그대의 인연은 기다림 끝에 반드시 오고 있소")
- items: 핵심 정리 3개. 각 item:
  - icon: 관련 이모지 1개
  - title: 짧은 소제목 (예: "타고난 매력", "조심할 점", "인연의 방향")
  - desc: 이 명식의 연애 핵심을 담은 풀이 2~3문장. 결과지 전체 내용을 압축·통합. 홍연 화자. 호칭 사용.
- closing: 따뜻하고 힘이 되는 마무리 격려 한 문장. 홍연 말투(~이오/~하오/~겠소)로. 호칭 사용.

【말투 엄수】 모든 서술 문장은 홍연 말투(~이오/~하오/~겠소/~했소)로만 쓰시오. "~ㅂ니다", "~습니다", "~어요", "~해요" 단 한 문장도 금지.`,

  7: `[letter 섹션 — 홍연의 서신]
연애사주 풀이를 마치며 홍연이 독자에게 쓰는 따뜻한 손편지.
- paragraphs: 3~4개 단락. 각 단락 최소 9~12문장, 각 단락 최소 300자 이상.
- 이 사람의 명식(일간·오행·십성)에 근거한 구체적인 연애 기운, 강점, 인연에 대한 따뜻한 응원으로 갈무리하되 희망적인 메시지로 맺으시오.
- 바로 본론으로 시작하여 따뜻한 마무리로 끝내시오.
- 각 단락은 앞 단락의 내용을 자연스럽게 이어받아 흐르듯 연결하시오.
【말투 엄수】 모든 문장은 홍연 말투(~이오/~하오/~겠소/~했소)로만 쓰시오. "~ㅂ니다", "~습니다", "~어요", "~해요" 단 한 문장도 금지.`,
};

// ── 장별 JSON 스키마 ──
const YEONAE_CH_SCHEMA: Record<number, string> = {
  1: `{
  "wonguk": {
    "intro": "~한 사주로, 한 줄 요약 (1문장)",
    "sinStrength": { "intro": "【필수】위 [sinStrength.intro 첫 문장]을 그대로 복사 후 일간·십성 기반 자연 이미지 서술", "paragraphs": ["신강/신약 핵심 성향·장점 (자연 이미지, 연애 그릇과 연결, 2~3문장)", "기운이 과할 때 그림자·단점 (자연 비유, 2문장)", "주의점과 조언 (1~2문장)"] },
    "ohaengDesc": { "intro": "목이 38%로 가장 높고, 화가 25%, 토와 금, 수가 각각 13%로 연애 흐름을 설명하겠소. 강한 목의 기운은 선우님의 연애에서 포용과 성장으로 나타나, 상대방을 품어주고 함께 발전하려는 성향이 도움이 되오. 화의 기운은 표현과 열정으로 이어져 감정을 솔직하게 전달하고 분위기를 밝히는 데 힘이 되고 있소. 연애의 흐름이 따뜻하고 활발하게 이어질 수 있는 구조를 가지고 있소. 다만 금과 수의 기운이 부족하여 절제와 직관의 면에서 아쉬움이 남을 수 있으니, 이 기운이 부족하여 연애에서 결단과 감수성의 면이 채워지지 않을 수 있소.", "paragraphs": ["강한 목과 화의 기운은 선우님의 연애에서 따뜻한 포용력과 솔직한 감정 표현으로 드러나오. 상대를 품어주고 함께 성장하려는 방향으로 관계를 이끌며, 분위기를 밝히는 데도 자연스러운 힘이 있소.", "반면 금과 수의 기운이 부족하여 결단력이 필요한 순간에 망설이거나, 감수성의 깊이가 아쉬울 수 있소. 상대의 미묘한 감정 변화를 놓치지 않으려는 의식적인 노력이 관계를 더 단단하게 만들어 줄 것이오."] },
    "ilganDesc": "선우님의 일간인 을목은 담장을 타는 덩굴과 같소. 이 덩굴은 환경에 유연하게 적응하며 주변의 도움을 받아 성장하는 성향을 가지고 있소. 사랑의 흐름은 주로 인연과 소개를 통해 이루어지며, 사람들과의 관계를 통해 감정을 쌓아가는 구조가 나타나고 있소. 한 번 마음이 닿으면 부드럽게 스며들듯 상대에게 깊이 들어가며, 배려와 공감으로 관계를 가꾸어 나가오. 다만 을목의 유연함은 때로 결단력이 부족해져, 감정을 전달해야 하는 결정적 순간에 망설이게 되는 상황으로 이어질 수 있소. 이러한 약점은 소중한 인연을 흘려보내는 결과를 초래할 수 있으니, 보다 솔직하게 감정을 표현하는 연습이 필요하오."
  },
  "geokguk": {
    "name": "격국명 (예: 편인격)",
    "keyword": "특성1·특성2·특성3",
    "intro": "【필수】'격국으로는 [격국명]에 해당하여 ~' 형식 시작, 연애 연결 핵심 성향 2가지 서술",
    "callout": "이 격국에 맞는 연애 방식·상대 유형·관계 스타일 한 문장",
    "paragraphs": ["격국의 연애 기질·강점 (2~3문장)", "과하거나 부족할 때 연애 주의점 (1~2문장)"]
  },
  "yeonaeseong": {
    "items": [
      { "label": "관성 존재", "exists": true, "desc": "한 줄 설명" },
      { "label": "관성 힘", "exists": true, "desc": "한 줄 설명" },
      { "label": "식상→관 흐름", "exists": false, "desc": "한 줄 설명" },
      { "label": "인성 보호", "exists": true, "desc": "한 줄 설명" }
    ],
    "summary": "연애성 종합 풀이 3~4문장"
  }
}`,
  2: `{
  "loveStyle": {
    "intro": "연애 기질 핵심 한 줄 (1문장)",
    "keywords": ["키워드1", "키워드2", "키워드3"],
    "modes": [
      { "icon": "💕", "title": "감정을 표현하는 방식", "desc": "5~6문장, 각 문장 25자 이상" },
      { "icon": "🔄", "title": "연애할 때 나타나는 패턴", "desc": "5~6문장, 각 문장 25자 이상" },
      { "icon": "⚡", "title": "사랑 앞의 강점과 주의점", "desc": "5~6문장, 각 문장 25자 이상" }
    ],
    "traits": [
      { "label": "적극성", "score": 75 },
      { "label": "헌신도", "score": 85 },
      { "label": "감성", "score": 65 },
      { "label": "독립성", "score": 50 }
    ],
    "summaryParagraphs": ["기질 특성 + 사주 연결 (2~3문장)", "연애 강점 체감 언어 (2~3문장)", "감정·헌신 방식 + 맹점 (2~3문장)", "강점 살리며 맹점 보완 방향 조언 (2~3문장)"]
  }
}`,
  3: `{
  "loveStyle": {
    "intro": "절대 쓰지 마오 — 빈 문자열로",
    "callout": "절대 쓰지 마오 — 빈 문자열로",
    "paragraphs": [
      "【필수 — 하나의 흐름으로 700~900자】 아래 세 가지를 순서대로, 누구나 쉽게 이해할 수 있는 말로 풀어 쓰오. 사주 용어를 쓸 때는 반드시 괄호 안에 쉬운 말로 풀이하오. 어렵거나 딱딱한 표현 금지. 홍연 말투(~이오/~하오/~겠소).\n【필수 규칙】 ① 첫 문장은 반드시 '○○일주로 태어난 {이름}님은 ~' 형식으로 시작하오. ② 이름 뒤에는 반드시 '님'을 붙이오. ③ '그', '그녀', '이 사람', '이분' 등의 3인칭 호칭은 절대 사용 금지. ④ 가능하면 주어를 생략하거나 '~한 기질이오', '~하는 성향이오' 등 주어 없는 문장 구조를 활용하오.\n1) 연애관: 일주 전체 명칭을 쓰고, 연애에서 어떤 태도와 방식으로 사랑하는지 일상적 언어로 묘사하오.\n2) 어떤 이성에게 끌리는지: 어떤 분위기·성격·조건의 사람에게 끌리는지 구체적으로 묘사하오.\n3) 주의할 점: 주입된 합충형 목록에 있는 것만 근거로, 연애에서 어떤 갈등 패턴이 생기기 쉬운지, 어떻게 하면 좋은지 따뜻하게 조언하오. 합충형이 없으면 일지 기운에서 주의점을 찾으오."
    ]
  },
  "loveFlow": {
    "intro": "절대 쓰지 마오 — 빈 문자열로",
    "callout": "절대 쓰지 마오 — 빈 문자열로",
    "flow": [],
    "peakCallout": "절대 쓰지 마오 — 빈 문자열로",
    "paragraphs": [
      "【필수 — 500자 내외】 위 연애운 점수표를 기반으로 2024~2033년 중 최소 5개 연도를 반드시 직접 언급하오. 점수 높은 해·낮은 해·전환점이 되는 해를 골고루 짚으오. 점수 숫자는 언급 금지. 연도는 반드시 '○○년 갑진년은' 형식으로 표기하오. '가장' 최상급은 1위 연도에만 사용하오. 각 연도마다 그 시기에 어떻게 행동하면 좋은지, 어떤 점을 조심해야 하는지 조언을 담으오. 【시제】 위에 주입된 리포트 생성 기준일을 확인하여 시제를 적용하오. 홍연 말투. '~ㅂ니다', '~어요' 절대 금지."
    ]
  },
  "compatibleJuju": [
    {
      "juju": "【순서 절대 고정】[1순위 pillars] 블록의 일주명 그대로",
      "ganEl": "il.ganEl 값 그대로", "jiEl": "il.jiEl 값 그대로",
      "avoidTti": "주입된 '피해야 할 상대 띠' 문자열 그대로 (1번만, 2·3번은 빈 문자열)",
      "birthDate": "[1순위 pillars] birthDate 값 그대로 (예: 1986.01.06)",
      "siName": "[1순위 pillars] siName 값 그대로 (예: 진시)",
      "tags": "[1순위 pillars] tags 배열 그대로",
      "pillars": { "nyeon":{"gan":"[1순위] nyeon.gan","ji":"nyeon.ji","ganEl":"nyeon.ganEl","jiEl":"nyeon.jiEl"}, "wol":{"gan":"wol.gan","ji":"wol.ji","ganEl":"wol.ganEl","jiEl":"wol.jiEl"}, "il":{"gan":"il.gan","ji":"il.ji","ganEl":"il.ganEl","jiEl":"il.jiEl"}, "si":{"gan":"si.gan","ji":"si.ji","ganEl":"si.ganEl","jiEl":"si.jiEl"} },
      "desc": "아래 [1순위 DESC 작성 지시] 참조하여 작성"
    },
    {
      "juju": "[2순위 pillars] 블록의 일주명 그대로",
      "ganEl": "il.ganEl 값 그대로", "jiEl": "il.jiEl 값 그대로",
      "avoidTti": "",
      "birthDate": "[2순위 pillars] birthDate 값 그대로",
      "siName": "[2순위 pillars] siName 값 그대로",
      "tags": "[2순위 pillars] tags 배열 그대로",
      "pillars": { "nyeon":{"gan":"[2순위] nyeon.gan","ji":"nyeon.ji","ganEl":"nyeon.ganEl","jiEl":"nyeon.jiEl"}, "wol":{"gan":"wol.gan","ji":"wol.ji","ganEl":"wol.ganEl","jiEl":"wol.jiEl"}, "il":{"gan":"il.gan","ji":"il.ji","ganEl":"il.ganEl","jiEl":"il.jiEl"}, "si":{"gan":"si.gan","ji":"si.ji","ganEl":"si.ganEl","jiEl":"si.jiEl"} },
      "desc": "▶ 아래 [2순위 DESC 작성 지시] 참조하여 작성"
    },
    {
      "juju": "[3순위 pillars] 블록의 일주명 그대로",
      "ganEl": "il.ganEl 값 그대로", "jiEl": "il.jiEl 값 그대로",
      "avoidTti": "",
      "birthDate": "[3순위 pillars] birthDate 값 그대로",
      "siName": "[3순위 pillars] siName 값 그대로",
      "tags": "[3순위 pillars] tags 배열 그대로",
      "pillars": { "nyeon":{"gan":"[3순위] nyeon.gan","ji":"nyeon.ji","ganEl":"nyeon.ganEl","jiEl":"nyeon.jiEl"}, "wol":{"gan":"wol.gan","ji":"wol.ji","ganEl":"wol.ganEl","jiEl":"wol.jiEl"}, "il":{"gan":"il.gan","ji":"il.ji","ganEl":"il.ganEl","jiEl":"il.jiEl"}, "si":{"gan":"si.gan","ji":"si.ji","ganEl":"si.ganEl","jiEl":"si.jiEl"} },
      "desc": "▶ 아래 [3순위 DESC 작성 지시] 참조하여 작성"
    }
  ]
}`,
  4: `{
  "loveTiming": {
    "timingType": "인연 유형명 (예: 늦봄 인연형)",
    "timingKeywords": ["키워드1", "키워드2", "키워드3"],
    "intro": "인연 흐름 핵심 3~4문장",
    "cards": [
      { "icon": "🌸", "title": "인연이 오는 시기", "desc": "3~4문장" },
      { "icon": "💫", "title": "인연의 특징", "desc": "3~4문장" },
      { "icon": "🌿", "title": "맞이하는 자세", "desc": "3~4문장" }
    ],
    "summary": "인연 시기 종합 풀이 3~4문장"
  },
  "loveFlow": {
    "items": [
      { "label": "현재~2026", "trend": "유지", "title": "준비의 계절", "text": "이 시기 연애 흐름 2~3문장" },
      { "label": "2027~2028", "trend": "인연 상승", "title": "설렘의 시작", "text": "이 시기 연애 흐름 2~3문장" },
      { "label": "2029~2030", "trend": "인연 절정", "title": "인연의 절정", "text": "이 시기 연애 흐름 2~3문장" },
      { "label": "2031~2033", "trend": "인연 하강", "title": "안정으로", "text": "이 시기 연애 흐름 2~3문장" }
    ]
  },
  "lovePattern": {
    "leftLabel": "일찍 오는 인연형",
    "left": 40,
    "rightLabel": "늦게 피는 인연형",
    "right": 60,
    "leftDesc": "일찍 오는 인연형 특징 3~4문장",
    "rightDesc": "늦게 피는 인연형 특징 3~4문장",
    "leftTips": ["행동1", "행동2"],
    "rightTips": ["준비1", "준비2"]
  }
}`,
  5: `{
  "meetingWay": {
    "meetingType": "만남 유형명 (예: 우연한 인연형)",
    "meetingKeywords": ["키워드1", "키워드2", "키워드3"],
    "intro": "만남 방식 핵심 3~4문장 (십성·오행 근거 포함)",
    "cards": [
      { "icon": "🌿", "title": "만남의 장소와 상황", "desc": "3~4문장" },
      { "icon": "✨", "title": "만남의 계기", "desc": "3~4문장" },
      { "icon": "💫", "title": "인연이 이어지는 방식", "desc": "3~4문장" }
    ],
    "summary": "만남 방식 종합 풀이 2~3문장"
  },
  "meetingFlow": {
    "items": [
      { "label": "첫 만남", "tone": "good", "title": "설렘", "text": "이 단계 특징 2~3문장" },
      { "label": "호감 발전", "tone": "good", "title": "가까워짐", "text": "이 단계 특징 2~3문장" },
      { "label": "고백의 순간", "tone": "warn", "title": "결단", "text": "이 단계 특징 2~3문장" },
      { "label": "연애 시작", "tone": "good", "title": "시작", "text": "이 단계 특징 2~3문장" }
    ]
  }
}`,
  6: `{
  "loveCare": {
    "element": "목",
    "elementDesc": "이 오행이 부족한 이유와 연애운 보강 효과 2~3문장",
    "tips": [
      { "icon": "🎨", "category": "색상", "text": "구체적인 실천법 2~3문장" },
      { "icon": "🧭", "category": "방향", "text": "구체적인 실천법 2~3문장" },
      { "icon": "🥗", "category": "음식", "text": "구체적인 실천법 2~3문장" },
      { "icon": "📅", "category": "습관", "text": "구체적인 실천법 2~3문장" },
      { "icon": "🏠", "category": "공간", "text": "구체적인 실천법 2~3문장" }
    ]
  },
  "loveAvoid": {
    "intro": "이 명식에서 연애를 방해하는 기운의 특성 2~3문장",
    "blocks": [
      { "icon": "⚡", "title": "피해야 할 상황 이름", "desc": "왜 연애에 해로운지 2~3문장" },
      { "icon": "🌀", "title": "피해야 할 상황 이름", "desc": "왜 연애에 해로운지 2~3문장" },
      { "icon": "🎭", "title": "피해야 할 상황 이름", "desc": "왜 연애에 해로운지 2~3문장" }
    ]
  },
  "loveSummary": {
    "coreMessage": "연애 인생 핵심 메시지 한 문장",
    "items": [
      { "icon": "💡", "title": "정리 항목 제목1", "desc": "설명 2~3문장" },
      { "icon": "⚠️", "title": "정리 항목 제목2", "desc": "설명 2~3문장" },
      { "icon": "🎯", "title": "정리 항목 제목3", "desc": "설명 2~3문장" }
    ],
    "closing": "마무리 격려 한 문장"
  }
}`,
  7: `{
  "letter": {
    "paragraphs": ["단락1 (3~4문장)", "단락2 (3~4문장)", "단락3 (3~4문장)", "단락4 (3~4문장, 마무리)"]
  }
}`,
};

// ── 핵심 함수: 장별 프롬프트 빌더 ──
export function buildYeonaeSajuChapterPrompt(
  chapter: number,
  input: {
    name: string;
    gender: "male" | "female";
    manseryeokText: string;
    pillars?: { pos: string; gan: string; ganEl: string; ji: string; jiEl: string; sipTop: string; sipBot: string; sinsal?: string }[];
    birthYear?: number;
    seun?: { label: string; gz: string; active?: boolean }[];
  }
): { system: string; user: string; ch3Pillars?: CompatPillarObj[]; ch3RankData?: DescRankDataLocal[] } {
  const theme = YEONAE_CH_THEME[chapter] ?? `[제${chapter}장]`;
  const guide = YEONAE_CH_GUIDE[chapter] ?? "";
  const schema = YEONAE_CH_SCHEMA[chapter] ?? "{}";
  const baseName = input.name ? (input.name.slice(1) || input.name) : "";
  const honor = baseName ? `${baseName}님` : "그대";
  const currentYear = new Date().getFullYear();

  // ch1 전용: 득령·득지·득시·득세 판정표 생성 → sinStrength.intro 첫 문장 고정
  let deungTable = "";
  if (chapter === 1 && input.pillars && input.pillars.length >= 4) {
    const ps = input.pillars;
    const byPos: Record<string, typeof ps[0]> = {};
    for (const p of ps) byPos[p.pos] = p;
    const siju = byPos["시주"]; const ilju = byPos["일주"]; const wolju = byPos["월주"]; const nyeonju = byPos["년주"];
    if (siju && ilju && wolju && nyeonju) {
      const ilganEl = ilju.ganEl;
      const generates: Record<string, string> = { 목: "화", 화: "토", 토: "금", 금: "수", 수: "목" };
      const helps = (el: string) => el === ilganEl || generates[el] === ilganEl;
      const seTargets = [siju.ganEl, wolju.ganEl, nyeonju.ganEl, nyeonju.jiEl];
      const seCount = seTargets.filter(helps).length;
      const dn = helps(wolju.jiEl), dj = helps(ilju.jiEl), ds = helps(siju.jiEl), dse = seCount >= 2;
      const successItems = [dn && "득령", dj && "득지", ds && "득시", dse && "득세"].filter(Boolean) as string[];
      const failItems = [!dn && "득령", !dj && "득지", !ds && "득시", !dse && "득세"].filter(Boolean) as string[];
      const shingang = successItems.length >= 3 || (successItems.length === 2 && (dn || dse));
      const sinDesc = shingang ? "신강한 편에 속하오" : "신약한 편에 속하오";
      const firstSentence = failItems.length === 0
        ? `득령·득지·득시·득세 모두에 성공했으므로 ${sinDesc}.`
        : successItems.length === 0
        ? `득령·득지·득시·득세 모두에 실패했으므로 ${sinDesc}.`
        : `${successItems.join("·")}에는 성공했지만 ${failItems.join("·")}에는 실패했으므로 ${sinDesc}.`;
      deungTable = `\n[득령·득지·득시·득세 판정]\n득령(월지 ${wolju.jiEl}): ${dn ? "득" : "실패"}\n득지(일지 ${ilju.jiEl}): ${dj ? "득" : "실패"}\n득시(시지 ${siju.jiEl}): ${ds ? "득" : "실패"}\n득세(시간·월간·년간·년지 중 ${seCount}개 도움): ${dse ? "득" : "실패"}\n\n[sinStrength.intro 첫 문장 — 아래 문장을 글자 하나도 바꾸지 말고 그대로 복사하오]\n"${firstSentence}"\n`;
    }
  }

  // ch1 전용: 오행 분포 계산 → 프롬프트 주입
  let ohaengTable = "";
  if (chapter === 1 && input.pillars && input.pillars.length >= 4) {
    const cnt: Record<string, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
    for (const p of input.pillars) {
      if (p.ganEl && cnt[p.ganEl] !== undefined) cnt[p.ganEl]++;
      if (p.jiEl  && cnt[p.jiEl]  !== undefined) cnt[p.jiEl]++;
    }
    const total = Object.values(cnt).reduce((a, b) => a + b, 0) || 1;
    const sorted = Object.entries(cnt).sort((a, b) => b[1] - a[1]);
    ohaengTable = `\n[오행 분포 — ohaengDesc 풀이에서 반드시 이 수치를 기반으로 서술]\n${sorted.map(([el, n]) => `${el}: ${Math.round((n / total) * 100)}% (${n}개)`).join(" / ")}\n`;
  }

  // ch4 전용: LoveLineChart와 동일한 로직으로 연도별 연애운 점수 계산 → 프롬프트 주입
  let loveScoreBlock = "";
  if (chapter === 4 && input.seun && input.seun.length > 0) {
    const TARGET_YEARS = [2024,2025,2026,2027,2028,2029,2030,2031,2032,2033];
    const STEM_EL: Record<string, string> = { 甲:"목",乙:"목",丙:"화",丁:"화",戊:"토",己:"토",庚:"금",辛:"금",壬:"수",癸:"수" };
    const BRANCH_EL: Record<string, string> = { 子:"수",丑:"토",寅:"목",卯:"목",辰:"토",巳:"화",午:"화",未:"토",申:"금",酉:"금",戌:"토",亥:"수" };
    const GEN: Record<string,string> = { 목:"화",화:"토",토:"금",금:"수",수:"목" };
    const CTL: Record<string,string> = { 목:"토",화:"금",토:"수",금:"목",수:"화" };
    const isFemale = input.gender === "female";
    const LOVE_SS: Record<string, number> = isFemale
      ? { 관성:90, 재성:70, 식상:75, 인성:60, 비겁:50 }
      : { 재성:90, 관성:70, 식상:75, 인성:60, 비겁:50 };
    const toSip = (ilEl: string, tEl: string) => {
      if (ilEl === tEl) return "비겁";
      if (GEN[ilEl] === tEl) return "식상";
      if (CTL[ilEl] === tEl) return "재성";
      if (CTL[tEl] === ilEl) return "관성";
      if (GEN[tEl] === ilEl) return "인성";
      return "비겁";
    };
    const ilganChar = (input.pillars?.[2]?.gan ?? "")[0] ?? "";
    const ilEl = STEM_EL[ilganChar] ?? "목";
    const seunMap: Record<number, string> = {};
    input.seun.forEach(s => { const y = Number(s.label); if (y >= 2024 && y <= 2033) seunMap[y] = s.gz; });
    const GANJIS = ["甲子","乙丑","丙寅","丁卯","戊辰","己巳","庚午","辛未","壬申","癸酉","甲戌","乙亥","丙子","丁丑","戊寅","己卯","庚辰","辛巳","壬午","癸未","甲申","乙酉","丙戌","丁亥","戊子","己丑","庚寅","辛卯","壬辰","癸巳","甲午","乙未","丙申","丁酉","戊戌","己亥","庚子","辛丑","壬寅","癸卯","甲辰","乙巳","丙午","丁未","戊申","己酉","庚戌","辛亥","壬子","癸丑","甲寅","乙卯","丙辰","丁巳","戊午","己未","庚申","辛酉","壬戌","癸亥"];
    const baseIdx = GANJIS.indexOf("甲辰");
    TARGET_YEARS.forEach(y => { if (!seunMap[y]) seunMap[y] = GANJIS[(baseIdx + (y - 2024)) % 60]; });
    const scored = TARGET_YEARS.map(y => {
      const gz = seunMap[y] ?? "";
      const sEl = STEM_EL[gz[0] ?? ""] ?? "";
      const bEl = BRANCH_EL[gz[1] ?? ""] ?? "";
      const s1 = LOVE_SS[toSip(ilEl, sEl)] ?? 65;
      const s2 = LOVE_SS[toSip(ilEl, bEl)] ?? 65;
      const score = Math.min(95, Math.max(40, Math.round(s1 * 0.6 + s2 * 0.4)));
      return { year: y, gz, score };
    });
    const trend = (i: number): string => {
      const prev = scored[i - 1]?.score;
      const cur  = scored[i].score;
      const next = scored[i + 1]?.score;
      if (prev !== undefined && next !== undefined && cur > prev && cur >= next) return "인연 절정";
      if (prev !== undefined && next !== undefined && cur < prev && cur <= next) return "인연 저점";
      if (prev !== undefined && cur > prev) return "인연 상승";
      if (prev !== undefined && cur < prev) return "인연 하강";
      return "유지";
    };
    type Group = { years: number[]; trend: string };
    const groups: Group[] = [];
    scored.forEach((d, i) => {
      const t = trend(i);
      const last = groups[groups.length - 1];
      if (last && last.trend === t) last.years.push(d.year);
      else groups.push({ years: [d.year], trend: t });
    });
    const rows = scored.map((d, i) => `  ${d.year}년(${d.gz}): 점수 ${d.score} → ${trend(i)}`);
    const groupRows = groups
      .filter(g => g.years[g.years.length - 1] >= currentYear) // 현재 연도 이후 구간만
      .map(g => {
        const startYear = Math.max(g.years[0], currentYear);
        const endYear = g.years[g.years.length - 1];
        const label = startYear === endYear ? `${startYear}년` : `${startYear}~${endYear}년`;
        return `  ${label}: ${g.trend}`;
      });
    loveScoreBlock = `\n[연도별 연애운 추세 — 화면 꺾은선 차트와 동일한 계산. loveFlow의 각 시기 설명은 아래 추세와 반드시 일치해야 함]\n` +
      rows.join("\n") +
      `\n\n[구간별 추세 요약 — loveFlow items는 이 구간 단위로, 2026년 이전 구간은 제외하고 작성]\n` +
      groupRows.join("\n") + "\n";
  }

  // ── ch3 전용: 찰떡궁합 사주 TOP 3 + 연애운 점수표 계산 (종합사주 ch6 동일 알고리즘) ──
  let compatPillarBlock = "";
  let ch3Pillars: CompatPillarObj[] = [];
  let ch3RankData: DescRankDataLocal[] = [];

  if (chapter === 3 && input.pillars && input.pillars.length > 0) {
    const ORDER3 = ["년주", "월주", "일주", "시주"];
    const byPos3: Record<string, typeof input.pillars[0]> = {};
    for (const p of input.pillars) byPos3[p.pos] = p;
    const rows3 = ORDER3.map(pos => {
      const p = byPos3[pos];
      if (!p) return null;
      const GAN_KR3: Record<string,string> = { 甲:"갑",乙:"을",丙:"병",丁:"정",戊:"무",己:"기",庚:"경",辛:"신",壬:"임",癸:"계" };
      const JI_KR3: Record<string,string> = { 子:"자",丑:"축",寅:"인",卯:"묘",辰:"진",巳:"사",午:"오",未:"미",申:"신",酉:"유",戌:"술",亥:"해" };
      const ganKr = `${GAN_KR3[p.gan] ?? p.gan}${p.ganEl}`;
      const jiKr = `${JI_KR3[p.ji] ?? p.ji}${p.jiEl}`;
      return `${pos}: 천간 ${ganKr}(${p.sipTop}) / 지지 ${jiKr}(${p.sipBot})`;
    }).filter(Boolean);

    const isFemale3 = input.gender === "female";
    const loveStars3 = isFemale3 ? ["정관", "편관"] : ["정재", "편재"];
    const loveStarName3 = isFemale3 ? "관성(정관·편관)" : "재성(정재·편재)";
    const found3: string[] = [];
    for (const p of input.pillars) {
      if (loveStars3.includes(p.sipTop)) found3.push(`${p.pos} 천간`);
      if (loveStars3.includes(p.sipBot)) found3.push(`${p.pos} 지지`);
    }
    const loveStarResult3 = found3.length > 0
      ? `${loveStarName3} 위치: ${found3.join(", ")}`
      : `${loveStarName3}: 명식에 없음 → ${isFemale3 ? "무관(無官) 사주" : "무재(無財) 사주"}`;

    // 연애운 점수표
    const STEM_EL3: Record<string,string> = { 甲:"목",乙:"목",丙:"화",丁:"화",戊:"토",己:"토",庚:"금",辛:"금",壬:"수",癸:"수" };
    const BRANCH_EL3: Record<string,string> = { 子:"수",丑:"토",寅:"목",卯:"목",辰:"토",巳:"화",午:"화",未:"토",申:"금",酉:"금",戌:"토",亥:"수" };
    const GEN3: Record<string,string> = { 목:"화",화:"토",토:"금",금:"수",수:"목" };
    const CTL3: Record<string,string> = { 목:"토",화:"금",토:"수",금:"목",수:"화" };
    const GAN_KR3x: Record<string,string> = { 甲:"갑",乙:"을",丙:"병",丁:"정",戊:"무",己:"기",庚:"경",辛:"신",壬:"임",癸:"계" };
    const JI_KR3x: Record<string,string> = { 子:"자",丑:"축",寅:"인",卯:"묘",辰:"진",巳:"사",午:"오",未:"미",申:"신",酉:"유",戌:"술",亥:"해" };
    const LOVE_SCORE3: Record<string, number> = isFemale3
      ? { 관성:90,편관:88,정관:92,재성:70,편재:68,정재:72,식상:75,식신:76,상관:74,인성:60,편인:58,정인:62,비겁:50,비견:50,겁재:48 }
      : { 재성:90,편재:88,정재:92,관성:70,편관:68,정관:72,식상:75,식신:76,상관:74,인성:60,편인:58,정인:62,비겁:50,비견:50,겁재:48 };
    function toSip3(ilEl: string, tEl: string): string {
      if (ilEl === tEl) return "비겁";
      if (GEN3[ilEl] === tEl) return "식상";
      if (CTL3[ilEl] === tEl) return "재성";
      if (CTL3[tEl] === ilEl) return "관성";
      if (GEN3[tEl] === ilEl) return "인성";
      return "비겁";
    }
    const ilEl3 = byPos3["일주"]?.ganEl ?? "목";
    const GANJIS3 = ["甲子","乙丑","丙寅","丁卯","戊辰","己巳","庚午","辛未","壬申","癸酉","甲戌","乙亥","丙子","丁丑","戊寅","己卯","庚辰","辛巳","壬午","癸未","甲申","乙酉","丙戌","丁亥","戊子","己丑","庚寅","辛卯","壬辰","癸巳","甲午","乙未","丙申","丁酉","戊戌","己亥","庚子","辛丑","壬寅","癸卯","甲辰","乙巳","丙午","丁未","戊申","己酉","庚戌","辛亥","壬子","癸丑","甲寅","乙卯","丙辰","丁巳","戊午","己未","庚申","辛酉","壬戌","癸亥"];
    const BASE_IDX3 = GANJIS3.indexOf("甲辰");
    const loveRows3: string[] = [];
    for (let yi = 0; yi < 10; yi++) {
      const year = 2024 + yi;
      const gz = GANJIS3[(BASE_IDX3 + yi) % 60];
      const stem = gz[0]; const branch = gz[1];
      const sEl = STEM_EL3[stem]; const bEl = BRANCH_EL3[branch];
      const sip_t = sEl ? toSip3(ilEl3, sEl) : "비겁";
      const sip_b = bEl ? toSip3(ilEl3, bEl) : "비겁";
      const score = Math.min(95, Math.max(40, Math.round((LOVE_SCORE3[sip_t] ?? 55) * 0.6 + (LOVE_SCORE3[sip_b] ?? 55) * 0.4)));
      const gzKr = `${GAN_KR3x[stem] ?? ""}${JI_KR3x[branch] ?? ""}년`;
      loveRows3.push(`${year}년 ${gzKr}: 연애점수=${score}`);
    }
    const sortedLove3 = loveRows3.map((r, i) => ({ i, score: Number(r.split("연애점수=")[1]) })).sort((a, b) => b.score - a.score);
    const lovePeakYear3 = 2024 + sortedLove3[0].i;
    const lovePeakGz3 = loveRows3[sortedLove3[0].i].split(" ")[1];

    // 일주 명칭
    const ilP3 = byPos3["일주"];
    const ilGanKr3 = ilP3 ? (GAN_KR3x[ilP3.gan] ?? "") : "";
    const ilJiKr3 = ilP3 ? (JI_KR3x[ilP3.ji] ?? "") : "";
    const ilJuName3 = `${ilGanKr3}${ilJiKr3}일주`;

    // 지지 합충형
    const jiList3: { pos: string; ji: string }[] = ["년주","월주","일주","시주"]
      .map(pos => ({ pos, ji: byPos3[pos]?.ji ?? "" }))
      .filter(x => x.ji);
    const YUKAP3: [string,string,string][] = [
      ["子","丑","토"],["寅","亥","목"],["卯","戌","화"],
      ["辰","酉","금"],["巳","申","수"],["午","未","화"],
    ];
    const CHUNG3: [string,string][] = [
      ["子","午"],["丑","未"],["寅","申"],["卯","酉"],["辰","戌"],["巳","亥"]
    ];
    const HYEONG3: [string[],string][] = [
      [["子","卯"],"무은지형(예의 없는 갈등)"],
      [["寅","巳","申"],"지세지형(세력 다툼)"],
      [["丑","戌","未"],"무례지형(고집 충돌)"],
    ];
    const hapResults3: string[] = [];
    const chungResults3: string[] = [];
    const hyeongResults3: string[] = [];
    for (let i = 0; i < jiList3.length; i++) {
      for (let j = i+1; j < jiList3.length; j++) {
        const a = jiList3[i]; const b = jiList3[j];
        const aKr = JI_KR3x[a.ji] ?? a.ji; const bKr = JI_KR3x[b.ji] ?? b.ji;
        for (const [x,y] of YUKAP3) {
          if ((a.ji===x && b.ji===y)||(a.ji===y && b.ji===x))
            hapResults3.push(`${a.pos}(${aKr}) ↔ ${b.pos}(${bKr}) 육합`);
        }
        for (const [x,y] of CHUNG3) {
          if ((a.ji===x && b.ji===y)||(a.ji===y && b.ji===x))
            chungResults3.push(`${a.pos}(${aKr}) ↔ ${b.pos}(${bKr}) 충`);
        }
      }
    }
    for (const [group, name] of HYEONG3) {
      const matched = jiList3.filter(x => group.includes(x.ji));
      if (matched.length === group.length)
        hyeongResults3.push(`${matched.map(x=>`${x.pos}(${JI_KR3x[x.ji]??x.ji})`).join("·")} ${name}`);
    }
    const hapChungHyeong3 = [
      hapResults3.length ? `합: ${hapResults3.join(", ")}` : "합: 없음",
      chungResults3.length ? `충: ${chungResults3.join(", ")}` : "충: 없음",
      hyeongResults3.length ? `형: ${hyeongResults3.join(", ")}` : "형: 없음",
    ].join("\n");

    // 잘 맞는 사주팔자 TOP 3 — 만세력 탐색
    {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Solar } = require("lunar-javascript");

      const STEM_EL_C: Record<string,string> = { 甲:"목",乙:"목",丙:"화",丁:"화",戊:"토",己:"토",庚:"금",辛:"금",壬:"수",癸:"수" };
      const BRANCH_EL_C: Record<string,string> = { 子:"수",丑:"토",寅:"목",卯:"목",辰:"토",巳:"화",午:"화",未:"토",申:"금",酉:"금",戌:"토",亥:"수" };
      const GAN_KR_C: Record<string,string> = { 甲:"갑",乙:"을",丙:"병",丁:"정",戊:"무",己:"기",庚:"경",辛:"신",壬:"임",癸:"계" };
      const JI_KR_C: Record<string,string> = { 子:"자",丑:"축",寅:"인",卯:"묘",辰:"진",巳:"사",午:"오",未:"미",申:"신",酉:"유",戌:"술",亥:"해" };
      const JI_띠: Record<string,string> = { 子:"자(쥐)띠",丑:"축(소)띠",寅:"인(호랑이)띠",卯:"묘(토끼)띠",辰:"진(용)띠",巳:"사(뱀)띠",午:"오(말)띠",未:"미(양)띠",申:"신(원숭이)띠",酉:"유(닭)띠",戌:"술(개)띠",亥:"해(돼지)띠" };
      const CHEONGAN_HAP_PARTNER: Record<string,string> = { 甲:"己",己:"甲",乙:"庚",庚:"乙",丙:"辛",辛:"丙",丁:"壬",壬:"丁",戊:"癸",癸:"戊" };
      const YUKAP_PARTNER: Record<string,string> = { 子:"丑",丑:"子",寅:"亥",亥:"寅",卯:"戌",戌:"卯",辰:"酉",酉:"辰",巳:"申",申:"巳",午:"未",未:"午" };
      const CHUNG_PARTNER: Record<string,string> = { 子:"午",午:"子",丑:"未",未:"丑",寅:"申",申:"寅",卯:"酉",酉:"卯",辰:"戌",戌:"辰",巳:"亥",亥:"巳" };
      const WONJIN_PARTNER: Record<string,string> = { 子:"未",未:"子",丑:"午",午:"丑",寅:"酉",酉:"寅",卯:"申",申:"卯",辰:"亥",亥:"辰",巳:"戌",戌:"巳" };
      const CTL_C: Record<string,string> = { 목:"토",화:"금",토:"수",금:"목",수:"화" };
      const GEN_C: Record<string,string> = { 목:"화",화:"토",토:"금",금:"수",수:"목" };

      const myIlGan3    = byPos3["일주"]?.gan ?? "";
      const myIlJi3     = byPos3["일주"]?.ji  ?? "";
      const myWolJi3    = byPos3["월주"]?.ji  ?? "";
      const myNyeonJi3  = byPos3["년주"]?.ji  ?? "";
      const myIlEl3     = byPos3["일주"]?.ganEl ?? "목";

      const elCntC: Record<string,number> = { 목:0,화:0,토:0,금:0,수:0 };
      for (const p of input.pillars) {
        if (p.ganEl && elCntC[p.ganEl] !== undefined) elCntC[p.ganEl]++;
        if (p.jiEl  && elCntC[p.jiEl]  !== undefined) elCntC[p.jiEl]++;
      }
      const sortedElC   = Object.entries(elCntC).sort((a,b) => a[1]-b[1]);
      const yongsinEl   = sortedElC[0][0];
      const heesinEl    = sortedElC[1][0];

      const hapIlGan    = CHEONGAN_HAP_PARTNER[myIlGan3] ?? "";
      const hapIlJi     = YUKAP_PARTNER[myIlJi3] ?? "";
      const hapWolJi    = YUKAP_PARTNER[myWolJi3] ?? "";
      const avoidNyeonJi = new Set([
        CHUNG_PARTNER[myNyeonJi3],
        WONJIN_PARTNER[myNyeonJi3],
      ].filter(Boolean));
      const avoidTtiStr = [...avoidNyeonJi].map(j => JI_띠[j] ?? j).join(", ") || "없음";

      const GANJIS_60 = ["甲子","乙丑","丙寅","丁卯","戊辰","己巳","庚午","辛未","壬申","癸酉","甲戌","乙亥","丙子","丁丑","戊寅","己卯","庚辰","辛巳","壬午","癸未","甲申","乙酉","丙戌","丁亥","戊子","己丑","庚寅","辛卯","壬辰","癸巳","甲午","乙未","丙申","丁酉","戊戌","己亥","庚子","辛丑","壬寅","癸卯","甲辰","乙巳","丙午","丁未","戊申","己酉","庚戌","辛亥","壬子","癸丑","甲寅","乙卯","丙辰","丁巳","戊午","己未","庚申","辛酉","壬戌","癸亥"];
      const myNyeonGz3   = `${byPos3["년주"]?.gan ?? ""}${myNyeonJi3}`;
      const gjIdx3       = GANJIS_60.indexOf(myNyeonGz3);
      const nowYear3     = new Date().getFullYear();
      let myBirthYear3   = nowYear3 - 30;
      if (gjIdx3 >= 0) {
        const candidate = nowYear3 - ((nowYear3 - (1924 + gjIdx3)) % 60 + 60) % 60;
        myBirthYear3 = candidate;
      }

      const SAMHAP3C: Record<string, string[]> = {
        子:["申","辰"], 丑:["酉","巳"], 寅:["午","戌"], 卯:["亥","未"],
        辰:["子","申"], 巳:["酉","丑"], 午:["寅","戌"], 未:["卯","亥"],
        申:["子","辰"], 酉:["巳","丑"], 戌:["午","寅"], 亥:["卯","未"],
      };
      const BANGHAP3C: Record<string, string[]> = {
        子:["亥","丑"], 丑:["子","寅"], 寅:["丑","卯"], 卯:["寅","辰"],
        辰:["卯","巳"], 巳:["辰","午"], 午:["巳","未"], 未:["午","申"],
        申:["未","酉"], 酉:["申","戌"], 戌:["酉","亥"], 亥:["戌","子"],
      };
      function wolJiScoreDyn3(wj: string): number {
        if (wj === hapWolJi) return 30;
        if (SAMHAP3C[myWolJi3]?.includes(wj)) return 20;
        if (BANGHAP3C[myWolJi3]?.includes(wj)) return 15;
        if (BRANCH_EL_C[wj] === yongsinEl) return 10;
        if (BRANCH_EL_C[wj] === heesinEl) return 8;
        return 0;
      }
      const SAMHAP3_NYEON = SAMHAP3C[myNyeonJi3] ?? [];
      const BANGHAP3_NYEON = BANGHAP3C[myNyeonJi3] ?? [];
      function nyeonJiScore3(nj: string): number {
        if (avoidNyeonJi.has(nj)) return -9999;
        if (YUKAP_PARTNER[myNyeonJi3] === nj) return 45;
        if (SAMHAP3_NYEON.includes(nj)) return 35;
        if (BANGHAP3_NYEON.includes(nj)) return 25;
        if (BRANCH_EL_C[nj] === yongsinEl) return 15;
        if (BRANCH_EL_C[nj] === heesinEl) return 10;
        return 0;
      }
      function iljuScore3(ilGan: string, ilJi: string): number | null {
        const ganEl = STEM_EL_C[ilGan] ?? ""; const jiEl = BRANCH_EL_C[ilJi] ?? "";
        const isHap = ilGan === hapIlGan;
        if (!isHap && CTL_C[ganEl] === myIlEl3) return null;
        if (!isHap && CTL_C[myIlEl3] === ganEl) return null;
        if (WONJIN_PARTNER[myIlJi3] === ilJi) return null;
        let s = 0;
        if (isHap) s += 40;
        else if (GEN_C[ganEl] === myIlEl3 || GEN_C[myIlEl3] === ganEl) s += 10;
        if (ilJi === hapIlJi) s += 30;
        if (ganEl === yongsinEl) s += 15; else if (ganEl === heesinEl) s += 10;
        if (jiEl === yongsinEl)  s += 15; else if (jiEl === heesinEl)  s += 10;
        return s;
      }
      function agePenalty3(year: number): number {
        const diff = Math.abs(year - myBirthYear3);
        if (diff > 10) return -9999;
        if (diff >= 7) return -20;
        if (diff >= 4) return -10;
        return 0;
      }

      type CompatResult3 = {
        year: number; month: number; day: number;
        nyeon: string; wol: string; il: string;
        nyeonGan: string; nyeonJi: string;
        wolGan: string; wolJi: string;
        ilGan: string; ilJi: string;
        totalScore: number;
        reasons: string[];
      };

      const candidates3: CompatResult3[] = [];
      const searchStart3 = myBirthYear3 - 10;
      const searchEnd3   = myBirthYear3 + 10;

      for (let yr = searchStart3; yr <= searchEnd3; yr++) {
        const ap = agePenalty3(yr);
        if (ap <= -9999) continue;
        for (let mo = 1; mo <= 12; mo++) {
          const daysInMonth = new Date(yr, mo, 0).getDate();
          for (let dy = 1; dy <= daysInMonth; dy++) {
            try {
              const bazi = Solar.fromYmdHms(yr, mo, dy, 12, 0, 0).getLunar().getEightChar();
              const nyeonStr: string = bazi.getYear();
              const wolStr: string   = bazi.getMonth();
              const ilStr: string    = bazi.getDay();
              const nGan = nyeonStr[0]; const nJi = nyeonStr[1];
              const wGan = wolStr[0];   const wJi  = wolStr[1];
              const iGan = ilStr[0];    const iJi  = ilStr[1];

              const njs = nyeonJiScore3(nJi);
              if (njs <= -9999) continue;
              const ijs = iljuScore3(iGan, iJi);
              if (ijs === null || ijs <= 0) continue;
              const wjs = wolJiScoreDyn3(wJi);
              if (wjs <= 0) continue;

              const total = ijs + njs + wjs + ap;
              const CHEONGAN_HAP_NAME: Record<string,string> = { 甲:"갑기합",己:"갑기합",乙:"을경합",庚:"을경합",丙:"병신합",辛:"병신합",丁:"정임합",壬:"정임합",戊:"무계합",癸:"무계합" };
              const YUKAP_NAME: Record<string,string> = { 子:"자축합",丑:"자축합",寅:"인해합",亥:"인해합",卯:"묘술합",戌:"묘술합",辰:"진유합",酉:"진유합",巳:"사신합",申:"사신합",午:"오미합",未:"오미합" };
              const SAMHAP_NAME: Record<string,string> = { 子:"신자진 삼합",申:"신자진 삼합",辰:"신자진 삼합",丑:"사유축 삼합",酉:"사유축 삼합",巳:"사유축 삼합",寅:"인오술 삼합",午:"인오술 삼합",戌:"인오술 삼합",卯:"해묘미 삼합",亥:"해묘미 삼합",未:"해묘미 삼합" };
              const reasons3: string[] = [];
              if (iGan === hapIlGan) reasons3.push(`일간 ${CHEONGAN_HAP_NAME[iGan]??'천간합'}`);
              if (iJi === hapIlJi)   reasons3.push(`일지 ${YUKAP_NAME[iJi]??'육합'}`);
              if (nJi === YUKAP_PARTNER[myNyeonJi3]) reasons3.push(`년지 ${YUKAP_NAME[nJi]??'육합'}`);
              if (SAMHAP3_NYEON.includes(nJi)) reasons3.push(`년지 ${SAMHAP_NAME[nJi]??'삼합'}`);
              if (wJi === hapWolJi) reasons3.push(`월지 ${YUKAP_NAME[wJi]??'육합'}`);
              if (SAMHAP3C[myWolJi3]?.includes(wJi)) reasons3.push(`월지 ${SAMHAP_NAME[wJi]??'삼합'}`);

              candidates3.push({ year:yr, month:mo, day:dy, nyeon:nyeonStr, wol:wolStr, il:ilStr, nyeonGan:nGan, nyeonJi:nJi, wolGan:wGan, wolJi:wJi, ilGan:iGan, ilJi:iJi, totalScore:total, reasons:reasons3 });
            } catch { /* ignore */ }
          }
        }
      }

      const sorted3 = candidates3.slice().sort((a, b) => b.totalScore - a.totalScore);
      const usedIlGan3 = new Set<string>();
      const usedYear3  = new Set<number>();
      const usedWolJi3 = new Set<string>();
      const picked3: CompatResult3[] = [];
      const pickOne3 = (filter?: (c: CompatResult3) => boolean) => {
        for (const c of sorted3) {
          if (usedIlGan3.has(c.ilGan) || usedYear3.has(c.year) || usedWolJi3.has(c.wolJi)) continue;
          if (filter && !filter(c)) continue;
          usedIlGan3.add(c.ilGan); usedYear3.add(c.year); usedWolJi3.add(c.wolJi); picked3.push(c);
          return;
        }
      };
      pickOne3(c => c.year < myBirthYear3);
      pickOne3(c => c.year > myBirthYear3);
      pickOne3();
      const top3 = picked3.sort((a, b) => b.totalScore - a.totalScore);

      const compatTable3 = top3.map((t,i) => {
        const nKr = `${GAN_KR_C[t.nyeonGan]??t.nyeonGan}${JI_KR_C[t.nyeonJi]??t.nyeonJi}`;
        const wKr = `${GAN_KR_C[t.wolGan]??t.wolGan}${JI_KR_C[t.wolJi]??t.wolJi}`;
        const iKr = `${GAN_KR_C[t.ilGan]??t.ilGan}${JI_KR_C[t.ilJi]??t.ilJi}`;
        return `${i+1}순위: 년주 ${nKr}(${t.year}년생) / 월주 ${wKr} / 일주 ${iKr}일주 — ${t.reasons.join(", ")} — 실제날짜: ${t.year}.${t.month}.${t.day}`;
      }).join("\n");

      // 시주 배정
      const SI_TABLE3: Record<string, string[]> = {
        甲: ["甲子","乙丑","丙寅","丁卯","戊辰","己巳","庚午","辛未","壬申","癸酉","甲戌","乙亥"],
        己: ["甲子","乙丑","丙寅","丁卯","戊辰","己巳","庚午","辛未","壬申","癸酉","甲戌","乙亥"],
        乙: ["丙子","丁丑","戊寅","己卯","庚辰","辛巳","壬午","癸未","甲申","乙酉","丙戌","丁亥"],
        庚: ["丙子","丁丑","戊寅","己卯","庚辰","辛巳","壬午","癸未","甲申","乙酉","丙戌","丁亥"],
        丙: ["戊子","己丑","庚寅","辛卯","壬辰","癸巳","甲午","乙未","丙申","丁酉","戊戌","己亥"],
        辛: ["戊子","己丑","庚寅","辛卯","壬辰","癸巳","甲午","乙未","丙申","丁酉","戊戌","己亥"],
        丁: ["庚子","辛丑","壬寅","癸卯","甲辰","乙巳","丙午","丁未","戊申","己酉","庚戌","辛亥"],
        壬: ["庚子","辛丑","壬寅","癸卯","甲辰","乙巳","丙午","丁未","戊申","己酉","庚戌","辛亥"],
        戊: ["壬子","癸丑","甲寅","乙卯","丙辰","丁巳","戊午","己未","庚申","辛酉","壬戌","癸亥"],
        癸: ["壬子","癸丑","甲寅","乙卯","丙辰","丁巳","戊午","己未","庚申","辛酉","壬戌","癸亥"],
      };
      function siScore3(gz: string): number {
        const g = gz[0], j = gz[1];
        let s = 0;
        const ge = STEM_EL_C[g] ?? ""; const je = BRANCH_EL_C[j] ?? "";
        if (ge === yongsinEl) s += 20; else if (ge === heesinEl) s += 12;
        if (je === yongsinEl) s += 15; else if (je === heesinEl) s += 10;
        return s;
      }
      const usedSiJi3 = new Set<string>();
      const assignedSi3 = top3.map(t => {
        const cands = (SI_TABLE3[t.ilGan] ?? [])
          .filter(gz => !usedSiJi3.has(gz[1]))
          .map(gz => ({ gz, score: siScore3(gz) }))
          .sort((a, b) => b.score - a.score);
        const best = cands[0]?.gz ?? "";
        if (best) usedSiJi3.add(best[1]);
        return best;
      });

      // ch3Pillars 확정
      const JI_SI_NAME3: Record<string,string> = { 子:"자시",丑:"축시",寅:"인시",卯:"묘시",辰:"진시",巳:"사시",午:"오시",未:"미시",申:"신시",酉:"유시",戌:"술시",亥:"해시" };
      ch3Pillars = top3.map((t, i) => {
        const siGz = assignedSi3[i] ?? "";
        const birthDate = `${t.year}.${String(t.month).padStart(2,"0")}.${String(t.day).padStart(2,"0")}`;
        const siName = siGz[1] ? (JI_SI_NAME3[siGz[1]] ?? "") : "";
        return {
          nyeon: { gan:t.nyeonGan, ji:t.nyeonJi, ganEl:STEM_EL_C[t.nyeonGan]??"", jiEl:BRANCH_EL_C[t.nyeonJi]??"" },
          wol:   { gan:t.wolGan,   ji:t.wolJi,   ganEl:STEM_EL_C[t.wolGan]??"",   jiEl:BRANCH_EL_C[t.wolJi]??"" },
          il:    { gan:t.ilGan,    ji:t.ilJi,     ganEl:STEM_EL_C[t.ilGan]??"",    jiEl:BRANCH_EL_C[t.ilJi]??"" },
          si:    { gan:siGz[0]??"", ji:siGz[1]??"", ganEl:STEM_EL_C[siGz[0]]??"", jiEl:BRANCH_EL_C[siGz[1]]??"" },
          birthDate, siName, tags: t.reasons,
        };
      });

      // ch3RankData 확정
      ch3RankData = top3.map(t => {
        const iKrD = `${GAN_KR_C[t.ilGan]??t.ilGan}${JI_KR_C[t.ilJi]??t.ilJi}`;
        const ilGanElD = STEM_EL_C[t.ilGan] ?? "";
        const ageDiffD = Math.abs(t.year - myBirthYear3);
        const ageRelD = t.year < myBirthYear3 ? `연상 ${ageDiffD}살` : t.year > myBirthYear3 ? `연하 ${ageDiffD}살` : `동갑`;
        const ageDescD = t.year < myBirthYear3
          ? `${honor}보다 ${ageDiffD}살 위라 어딘지 모르게 믿음직한 구석이 있소`
          : t.year > myBirthYear3
            ? `${honor}보다 ${ageDiffD}살 어리지만 어딘지 모르게 성숙한 구석이 있소`
            : `동갑이라 처음부터 편하게 말 놓을 수 있는 스타일이오`;
        const JH: Record<string,string> = { 금:"IT 개발자·회계사·공무원·법조인·의료기기 영업", 목:"교사·작가·편집자·환경 관련·인테리어 디자이너", 화:"마케터·유튜버·셰프·뷰티 관련·이벤트 기획자", 수:"연구원·약사·의사·무역·여행업", 토:"건축·부동산·공무원·요리사·농업 관련" };
        const SH: Record<string,string> = { 금:"단정하고 깔끔, 말보다 행동, 한번 마음 주면 끝까지", 목:"표정 풍부하고 온기 있는 말투, 감수성 높고 취미 많음", 화:"에너지 폭발, 눈에 확 띄고 분위기 주도형", 수:"겉은 시크해 보이지만 속은 다정한 로맨티스트", 토:"든든하고 믿음직, 말 아끼지만 한마디에 무게감" };
        return { iKr: iKrD, ageRel: ageRelD, ageDesc: ageDescD, ilGanEl: ilGanElD, styleHint: SH[ilGanElD]??ilGanElD, jobHint: JH[ilGanElD]??ilGanElD, reasons: t.reasons.join(", ") };
      });

      // 순위별 4기둥 프롬프트 주입
      const personLabel3 = input.gender === "male" ? "이 여자는" : "이 남자는";
      const pillarRows3 = top3.map((t, i) => {
        const siGz = assignedSi3[i] ?? "";
        const JI_SI_NAME3x: Record<string,string> = { 子:"자시",丑:"축시",寅:"인시",卯:"묘시",辰:"진시",巳:"사시",午:"오시",未:"미시",申:"신시",酉:"유시",戌:"술시",亥:"해시" };
        const birthDate = `${t.year}.${String(t.month).padStart(2,"0")}.${String(t.day).padStart(2,"0")}`;
        const siName = siGz[1] ? (JI_SI_NAME3x[siGz[1]] ?? "") : "";
        const pillarObj = {
          nyeon: { gan:t.nyeonGan, ji:t.nyeonJi, ganEl:STEM_EL_C[t.nyeonGan]??"", jiEl:BRANCH_EL_C[t.nyeonJi]??"" },
          wol:   { gan:t.wolGan,   ji:t.wolJi,   ganEl:STEM_EL_C[t.wolGan]??"",   jiEl:BRANCH_EL_C[t.wolJi]??"" },
          il:    { gan:t.ilGan,    ji:t.ilJi,     ganEl:STEM_EL_C[t.ilGan]??"",    jiEl:BRANCH_EL_C[t.ilJi]??"" },
          si:    { gan:siGz[0]??"", ji:siGz[1]??"", ganEl:STEM_EL_C[siGz[0]]??"", jiEl:BRANCH_EL_C[siGz[1]]??"" },
          birthDate, siName, tags: t.reasons,
        };
        const nKr = `${GAN_KR_C[t.nyeonGan]??t.nyeonGan}${JI_KR_C[t.nyeonJi]??t.nyeonJi}`;
        const wKr = `${GAN_KR_C[t.wolGan]??t.wolGan}${JI_KR_C[t.wolJi]??t.wolJi}`;
        const iKr = `${GAN_KR_C[t.ilGan]??t.ilGan}${JI_KR_C[t.ilJi]??t.ilJi}`;
        const ilGanEl = STEM_EL_C[t.ilGan] ?? "";
        const ageDiff = Math.abs(t.year - myBirthYear3);
        const ageRel = t.year < myBirthYear3
          ? `연상 ${ageDiff}살 (${honor}보다 ${ageDiff}살 위)`
          : t.year > myBirthYear3
            ? `연하 ${ageDiff}살 (${honor}보다 ${ageDiff}살 아래)`
            : `동갑`;
        const JOB_HINT3: Record<string,string> = { 금:"IT 개발자·회계사·공무원·법조인·의료기기 영업", 목:"교사·작가·편집자·환경 관련·인테리어 디자이너", 화:"마케터·유튜버·셰프·뷰티 관련·이벤트 기획자", 수:"연구원·약사·의사·무역·여행업", 토:"건축·부동산·공무원·요리사·농업 관련" };
        const STYLE_HINT3: Record<string,string> = { 금:"단정하고 깔끔, 말보다 행동, 한번 마음 주면 끝까지", 목:"표정 풍부하고 온기 있는 말투, 감수성 높고 취미 많음", 화:"에너지 폭발, 눈에 확 띄고 분위기 주도형", 수:"겉은 시크해 보이지만 속은 다정한 로맨티스트", 토:"든든하고 믿음직, 말 아끼지만 한마디에 무게감" };
        const ageDesc3 = t.year < myBirthYear3
          ? `${honor}보다 ${ageDiff}살 위라 어딘지 모르게 믿음직한 구석이 있소`
          : t.year > myBirthYear3
            ? `${honor}보다 ${ageDiff}살 어리지만 어딘지 모르게 성숙한 구석이 있소`
            : `동갑이라 처음부터 편하게 말 놓을 수 있는 스타일이오`;
        return `[${i+1}순위 desc 작성용 정보 — 아래 값을 JSON 파싱 없이 그대로 사용하오]\n` +
          `일주명: ${iKr}일주\n` +
          `나이 관계: ${ageRel} → "${ageDesc3}"\n` +
          `상대방 일간 오행: ${ilGanEl} → 성격 힌트: "${STYLE_HINT3[ilGanEl]??ilGanEl}"\n` +
          `상대방 직업 힌트: ${JOB_HINT3[ilGanEl]??ilGanEl}\n` +
          `상대방 일지 오행: ${BRANCH_EL_C[t.ilJi]??""}\n` +
          `찰떡인 이유: ${t.reasons.join(", ")}\n` +
          `신청자 일간: ${GAN_KR_C[myIlGan3]??myIlGan3}(${myIlEl3})\n` +
          `★ 호칭: 상대방='${personLabel3}' / 신청자='${honor}' — 다른 표현 절대 금지\n` +
          `[pillars JSON — compatibleJuju[${i}].pillars 에 그대로 사용]\n${JSON.stringify(pillarObj)}`;
      }).join("\n\n");

      const now3 = new Date();
      const refYear3 = now3.getFullYear();
      const refMonth3 = now3.getMonth() + 1;

      compatPillarBlock = `\n[기둥별 십성 확인표 — 3장 연애 풀이에서 반드시 이 값만 사용, 임의 추론 금지]\n${rows3.join("\n")}\n\n[인연성 분석 결과 — 반드시 이 결과를 그대로 사용하오]\n${loveStarResult3}\n\n[2024~2033 세운별 연애운 점수표 — loveFlow 풀이에서 반드시 이 수치 기반으로만 서술]\n${loveRows3.join("\n")}\n연애운 1위(정점): ${lovePeakYear3}년 ${lovePeakGz3} (점수=${sortedLove3[0].score})\n연애운 상위: ${sortedLove3.slice(1,3).map(x => `${2024+x.i}년`).join(", ")}\n연애운 하위: ${sortedLove3.slice(-3).reverse().map(x => `${2024+x.i}년`).join(", ")}\n[연도 표기] '○○년 갑진년은' 형식. '가장' 최상급은 1위 연도(${lovePeakYear3}년)에만 사용.\n※ 이 점수표와 다른 연도를 정점/저점으로 서술하면 절대 안 되오.\n\n[일주 명칭 — 반드시 이 표현 그대로 사용]\n이 사주의 일주: ${ilJuName3} (일간 ${ilGanKr3}${ilP3?.ganEl ?? ""} / 일지 ${ilJiKr3}${ilP3?.jiEl ?? ""})\n\n[지지 합·충·형 실제 목록 — 없는 합충형을 언급하면 절대 안 되오. 아래 목록에 있는 것만 언급하오]\n${hapChungHyeong3}\n\n[리포트 생성 기준일 — 절대 규칙, 위반 시 탈락]\n오늘: ${refYear3}년 ${refMonth3}월\n\n【시제 적용 — 연도별 예시】\n- ${refYear3 - 2}년, ${refYear3 - 1}년 → 이미 지난 해 → 반드시 과거형: "~이었소", "~았소", "~높았소"\n- ${refYear3}년 → 지금 이 해 → 반드시 현재형: "~이오", "~하오", "~있소"\n- ${refYear3 + 1}년 이후 → 아직 오지 않은 해 → 반드시 미래형: "~될 것이오", "~찾아오겠소"\n\n[잘 맞는 사주팔자 TOP 3 — 만세력 실존 날짜 기반 / 순서 절대 변경 금지]\n※ 아래 순위 순서는 알고리즘 확정값이오. LLM이 임의로 순서를 바꾸는 것은 절대 금지. 반드시 1순위→2순위→3순위 순서 그대로 compatibleJuju 배열에 채울 것.\n※ desc 서술 시 상대방을 지칭할 때 '이 사람', '상대방' 등의 표현을 절대 쓰지 마오. 반드시 '${personLabel3}'로만 표현하오.\n${compatTable3}\n용신: ${yongsinEl} / 희신: ${heesinEl}\n피해야 할 상대 띠: ${avoidTtiStr}\n\n${pillarRows3}\n`;
    }
  }

  const user = `아래는 ${honor}의 사주 명식입니다.

${deungTable}${ohaengTable}${loveScoreBlock}${compatPillarBlock}${input.manseryeokText}
${input.birthYear ? `\n출생연도: ${input.birthYear}년 / 현재연도: ${currentYear}년` : `\n현재연도: ${currentYear}년`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
이번 장의 주제: ${theme}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${guide ? `\n작성 지침:\n${guide}\n` : ""}
【호칭 규칙】
풀이 본문에서 독자를 지칭할 때는 반드시 이름 호칭(${honor})을 사용하시오. "그대", "당신"은 절대 쓰지 마시오.

【조사 규칙】
모든 단어 뒤 조사는 받침 유무에 따라 정확히 적용하시오.
- 받침 있음: 은/이/을/으로/과 (예: 목은, 금이, 마음을, 감정으로, 직관과)
- 받침 없음: 는/가/를/로/와 (예: 화는, 토가, 기운을, 사랑으로, 표현과)
- 이름(${honor}) 뒤 조사도 동일 규칙 적용. (예: 선우님은/선우님이/선우님의)
- ㄹ 받침은 받침 없는 것으로 처리 (예: 별로, 술술)

【연애사주 필독 금지 사항】
이 풀이는 아직 연인이 없는 솔로를 위한 결과지입니다. 아래 표현은 절대 쓰지 마시오.
- "배우자", "남편", "아내", "부부", "결혼 생활", "배우자와의 동질성", "배우자성이 강해지면" 등 이미 배우자가 있는 상황을 전제하는 표현
- 결혼 후의 생활·관계를 묘사하는 내용
- 대신 "인연", "연인", "좋아하는 사람", "만남", "연애" 등 아직 만나지 못한 상대를 향한 표현을 사용하시오.

위 명식을 꼼꼼히 분석하여, 아래 JSON 스키마를 정확히 채워주시오.
반드시 유효한 JSON만 출력하시오. 코드펜스(\`\`\`)나 설명 문장은 절대 쓰지 마시오.

${schema}`;

  return { system: SYSTEM, user, ch3Pillars: chapter === 3 ? ch3Pillars : undefined, ch3RankData: chapter === 3 ? ch3RankData : undefined };
}
