// =====================================================
// 연애사주 결과지 — 장별 풀이 프롬프트 & 구조
// =====================================================
// 정통사주(report-content.ts)와 독립적으로 관리합니다.
// 홍연 화자 SYSTEM은 report-prompts.ts에서 공유.

import { SYSTEM } from "./report-prompts";

// ── 장별 필수 섹션 키 ──
export const YEONAE_SAJU_CHAPTER_SECTIONS: Record<number, string[]> = {
  1: ["wonguk", "geokguk", "yeonaeseong"],
  2: ["loveStyle"],
  3: ["idealType", "compatTypes"],
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
    if (!val || typeof val !== "object") return false;
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
- keyword: 이 격이 가진 핵심 특성 키워드 2~3개를 "·"로 구분 (예: "직관·창의·독립").
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
  - desc: 해당 기질 설명 3~4문장. 구체적인 십성·오행 근거 포함. 홍연 화자.
- traits: 4개 연애 성향 점수. 각 항목 { label, score(0~100 정수) }
  반드시 이 4개: "적극성" "헌신도" "감성" "독립성"
  사주 명식에 근거해 점수 산출.
- summary: 연애 기질 종합 풀이 3~4문장. 이 사람이 사랑과 어떻게 살아가야 하는지 방향 제시. 홍연 화자.`,

  3: `[idealType 섹션 — 이상형]
- intro: 내가 끌리는 사람의 핵심 특징 3~4문장. 사주 명식의 근거를 포함해 구체적으로. 홍연 화자.
- keywords: 이상형을 압축하는 키워드 3개. 각 2~4글자. (예: ["따뜻한 눈빛", "듬직한 리더", "감성 충만"])
- cards: 이상형 묘사 카드 3개. 각 card:
  - icon: 관련 이모지 1개
  - title: 짧은 소제목 (예: "외모와 분위기", "성격과 가치관", "생활방식과 직업")
  - desc: 그 관점에서 끌리는 사람의 특징 5~6문장. 구체적인 십성·오행 근거 포함. 각 문장 최소 30자 이상. 홍연 화자.
- summary: 이상형 종합 풀이 4~5문장. 홍연 화자.

[compatTypes 섹션 — 궁합 유형]
- wellTypes: 잘 맞는 유형 2개. 각 { icon, typeDesc(유형 특징 명사형으로 끝내기, 예: "협력적이고 진취적인 성향의 유형"), reason(사주적 이유 2문장) }
- avoidTypes: 피해야 할 유형 2개. 각 { icon, typeDesc(유형 특징 명사형으로 끝내기, 예: "감정기복이 크고 의존적인 유형"), reason(왜 충극되는지 2문장) }`,

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
    "ohaengDesc": { "intro": "목이 38%로 가장 높고, 화가 25%, 토와 금, 수가 각각 13%로 연애 흐름을 설명하겠소. 강한 목의 기운은 선우님의 연애에서 포용과 성장으로 나타나, 상대방을 품어주고 함께 발전하려는 성향이 도움이 되오. 화의 기운은 표현과 열정으로 이어져 감정을 솔직하게 전달하고 분위기를 밝히는 데 힘이 되고 있소. 연애의 흐름이 따뜻하고 활발하게 이어질 수 있는 구조를 가지고 있소. 다만 금과 수의 기운이 부족하여 절제와 직관의 면에서 아쉬움이 남을 수 있으니, 이 기운이 부족하여 연애에서 결단과 감수성의 면이 채워지지 않을 수 있소.", "paragraphs": ["강한 오행들이 연애에서 어떻게 드러나는지 2~3문장", "부족한 오행으로 인한 연애 빈자리와 보완 방향 1~2문장"] },
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
      { "icon": "💕", "title": "감정을 표현하는 방식", "desc": "3~4문장" },
      { "icon": "🔄", "title": "연애할 때 나타나는 패턴", "desc": "3~4문장" },
      { "icon": "⚡", "title": "사랑 앞의 강점과 주의점", "desc": "3~4문장" }
    ],
    "traits": [
      { "label": "적극성", "score": 75 },
      { "label": "헌신도", "score": 85 },
      { "label": "감성", "score": 65 },
      { "label": "독립성", "score": 50 }
    ],
    "summary": "연애 기질 종합 풀이 3~4문장"
  }
}`,
  3: `{
  "idealType": {
    "intro": "이상형 핵심 특징 3~4문장 (사주 근거 포함)",
    "keywords": ["키워드1", "키워드2", "키워드3"],
    "cards": [
      { "icon": "✨", "title": "외모와 분위기", "desc": "5~6문장 (각 문장 최소 30자 이상)" },
      { "icon": "💬", "title": "성격과 가치관", "desc": "5~6문장 (각 문장 최소 30자 이상)" },
      { "icon": "🏡", "title": "생활방식과 직업", "desc": "5~6문장 (각 문장 최소 30자 이상)" }
    ],
    "summary": "이상형 종합 풀이 2~3문장"
  },
  "compatTypes": {
    "wellTypes": [
      { "icon": "💚", "typeDesc": "협력적이고 진취적인 성향의 유형", "reason": "사주적 이유 2문장" },
      { "icon": "💚", "typeDesc": "감성적이고 따뜻한 마음의 유형", "reason": "사주적 이유 2문장" }
    ],
    "avoidTypes": [
      { "icon": "⚠️", "typeDesc": "감정기복이 크고 의존적인 유형", "reason": "충극 이유 2문장" },
      { "icon": "⚠️", "typeDesc": "지배적이고 통제적 성향의 유형", "reason": "충극 이유 2문장" }
    ]
  }
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
): { system: string; user: string } {
  const theme = YEONAE_CH_THEME[chapter] ?? `[제${chapter}장]`;
  const guide = YEONAE_CH_GUIDE[chapter] ?? "";
  const schema = YEONAE_CH_SCHEMA[chapter] ?? "{}";
  const honor = input.name
    ? input.gender === "male" ? `${input.name}군` : `${input.name}양`
    : "그대";
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

  const user = `아래는 ${honor}의 사주 명식입니다.

${deungTable}${ohaengTable}${loveScoreBlock}${input.manseryeokText}
${input.birthYear ? `\n출생연도: ${input.birthYear}년 / 현재연도: ${currentYear}년` : `\n현재연도: ${currentYear}년`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
이번 장의 주제: ${theme}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${guide ? `\n작성 지침:\n${guide}\n` : ""}
【호칭 규칙】
풀이 본문에서 독자를 지칭할 때는 반드시 이름 호칭(${honor})을 사용하시오. "그대", "당신"은 절대 쓰지 마시오.

【연애사주 필독 금지 사항】
이 풀이는 아직 연인이 없는 솔로를 위한 결과지입니다. 아래 표현은 절대 쓰지 마시오.
- "배우자", "남편", "아내", "부부", "결혼 생활", "배우자와의 동질성", "배우자성이 강해지면" 등 이미 배우자가 있는 상황을 전제하는 표현
- 결혼 후의 생활·관계를 묘사하는 내용
- 대신 "인연", "연인", "좋아하는 사람", "만남", "연애" 등 아직 만나지 못한 상대를 향한 표현을 사용하시오.

위 명식을 꼼꼼히 분석하여, 아래 JSON 스키마를 정확히 채워주시오.
반드시 유효한 JSON만 출력하시오. 코드펜스(\`\`\`)나 설명 문장은 절대 쓰지 마시오.

${schema}`;

  return { system: SYSTEM, user };
}
