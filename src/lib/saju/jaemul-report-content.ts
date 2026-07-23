// =====================================================
// 재물사주 결과지 — 장별 풀이 프롬프트 & 구조
// =====================================================
// 정통사주(report-content.ts)와 독립적으로 관리합니다.
// 홍연 화자 SYSTEM은 report-prompts.ts에서 공유.

import { SYSTEM } from "./report-prompts";

// ── 장별 필수 섹션 키 ──
export const JAEMUL_CHAPTER_SECTIONS: Record<number, string[]> = {
  1: ["wonguk", "geokguk"],
  2: ["wealthStyle"],
  3: ["wealthPresence", "investStyle", "jaeseong"],
  4: ["careerWealth", "jobFit", "splitType"],
  5: ["wealthPeak", "moneyTrap", "warningFlow"],
  6: ["wealthCare", "wealthAvoid", "wealthSummary"],
  7: ["letter", "concernAdvice"],
};

// ── 장 완성 여부 확인 ──
export function isJaemulChapterReady(
  content: Record<string, unknown> | null | undefined,
  chapter: number
): boolean {
  if (!content) return false;
  const keys = JAEMUL_CHAPTER_SECTIONS[chapter] ?? [];
  const OPTIONAL_SECTIONS = ["concernAdvice"];
  return keys.every((k) => {
    if (OPTIONAL_SECTIONS.includes(k)) {
      const ov = content[k];
      if (ov == null) return true;
      if (typeof ov === "object" && Array.isArray((ov as Record<string, unknown>).paragraphs) && ((ov as Record<string, unknown>).paragraphs as unknown[]).length === 0) return true;
      if (typeof ov === "object" && Object.keys(ov as object).length === 0) return true;
    }
    const val = content[k];
    if (!val || typeof val !== "object") return false;
    const v = val as Record<string, unknown>;
    if ("modes" in v) return Array.isArray(v.modes) && (v.modes as unknown[]).length > 0;
    if ("score" in v && "reDesc" in v) return typeof v.score === "number" && typeof v.reDesc === "string" && (v.reDesc as string).length > 0;
    if ("paragraphs" in v) return Array.isArray(v.paragraphs) && (v.paragraphs as unknown[]).length > 0;
    if ("sinDesc" in v) return typeof v.sinDesc === "string" && (v.sinDesc as string).length > 0;
    if ("sinStrength" in v) { const ss = v.sinStrength as Record<string, unknown>; return typeof ss?.intro === "string" && (ss.intro as string).length > 0; }
    if ("clusters" in v) return Array.isArray(v.clusters) && (v.clusters as unknown[]).length > 0;
    if ("types" in v) return Array.isArray(v.types) && (v.types as unknown[]).length > 0;
    if ("cards" in v) return Array.isArray(v.cards) && (v.cards as unknown[]).length > 0;
    if ("phases" in v) return Array.isArray(v.phases) && (v.phases as unknown[]).length > 0;
    if ("traps" in v) return Array.isArray(v.traps) && (v.traps as unknown[]).length > 0;
    if ("blocks" in v) return Array.isArray(v.blocks) && (v.blocks as unknown[]).length > 0;
    if ("summary" in v && "items" in v) return Array.isArray(v.items) && (v.items as unknown[]).length > 0;
    if ("items" in v) return Array.isArray(v.items) && (v.items as unknown[]).length > 0;
    if ("tips" in v && "element" in v) return Array.isArray(v.tips) && (v.tips as unknown[]).length > 0;
    if ("coreMessage" in v) return typeof v.coreMessage === "string" && (v.coreMessage as string).length > 0;
    if ("tips" in v) return Array.isArray(v.tips) && (v.tips as unknown[]).length > 0;
    if ("leftLabel" in v) return typeof v.left === "number" && typeof v.right === "number";
    if ("name" in v) return typeof v.name === "string" && (v.name as string).length > 0;
    if ("peakTitle" in v) return typeof v.peakTitle === "string" && (v.peakTitle as string).length > 0;
    if ("when" in v) return typeof v.title === "string" && (v.title as string).length > 0;
    if ("element" in v) return typeof v.element === "string" && (v.element as string).length > 0;
    return false;
  });
}

// ── 장별 주제 ──
const JAEMUL_CH_THEME: Record<number, string> = {
  1: "[제1장 그릇] 나는 어떤 그릇으로 태어났나 — 일간 오행, 오행 균형, 신강·신약, 타고난 본바탕",
  2: "[제2장 재물기질] 내 재물 기질 — 돈을 대하는 나의 방식, 재물에 대한 태도, 소비·저축·집착 패턴",
  3: "[제3장 재물] 내 사주에 재물이 보이는가 — 재성의 유무·강약, 어울리는 직군, 투자 스타일, 직장인형 vs 사업가형",
  4: "[제4장 천직] 돈이 되는 일과 나의 천직 — 재물이 따르는 일, 적성과 직업, 돈 버는 황금기",
  5: "[제5장 대운] 내 재물 대운 — 언제 벌고 언제 조심할까, 돈의 함정, 시기별 재물 흐름",
  6: "[제6장 개운법] 내 재물운을 바꾸는 개운법 — 부족한 오행 보강, 재물 개운 핵심 조언, 종합 정리",
  7: "[마무리] 홍연의 서신 — 재물에 관한 따뜻한 손편지로 결과지를 맺는 글",
};

// ── 장별 추가 지시 ──
const JAEMUL_CH_GUIDE: Record<number, string> = {
  1: `[wonguk 섹션 — 타고난 그릇 분석]
- intro: "~한 사주로, 한 문장 요약" 형식으로 시작. (1문장)
- sinStrength: 신강·신약 풀이. 아래 구조로 출력.
  - intro: 【필수】위 [득령·득지·득시·득세 판정] 결과를 그대로 사용하여, 아래 [sinStrength.intro 첫 문장]을 글자 하나도 바꾸지 말고 그대로 복사하오. 이후 일간 오행과 지배적 십성으로 신강/신약의 성향을 자연 이미지로 서술하오.
  - paragraphs: 아래 3개 단락 배열.
    ① 신강/신약의 핵심 성향과 장점 — 지배적 십성(비겁·식상 등)과 연결하여 자연 이미지로 서술. 재물 그릇과 사회적 모습에 어떻게 발현되는지 포함. (2~3문장)
    ② 그 기운이 과할 때 그림자·단점을 자연 비유로 솔직하게 묘사. (2문장)
    ③ 주의점과 조언. (1~2문장)
- ohaengDesc: 오행 균형 풀이. 아래 구조로 출력.
  - intro: 【필수】위 [오행 분포]에서 가장 높은 비율의 오행부터 순서대로 언급하며, 각 오행이 재물과 연결되는 의미(목=성장·확장, 화=표현·활동, 토=안정·축적, 금=절제·결단, 수=지혜·유통)를 바탕으로 이 사람의 재물 흐름을 설명하오. 비율이 0%인 오행은 '이 기운이 부족하여 재물의 ~한 면이 채워지지 않을 수 있소' 형식으로 언급하오.
  - paragraphs: ["강한 오행들이 재물 활동에서 어떻게 드러나는지 2~3문장", "부족한 오행으로 인한 재물 빈자리와 보완 방향 1~2문장"]
- ilganDesc: 이 사람의 일간({일간한자} {일간명})을 자연물 하나에 빗대어 재물 기질을 풀이하오. 아래 구조를 반드시 따르오.
  ① 첫 문장: "{호칭}님의 일간인 {일간명}은 [자연물 은유]이오." 로 시작.
  ② 그 자연물의 고유한 움직임·성질을 구체적으로 전개하여 이 일간의 기질을 생생하게 묘사. (2문장 — 각 문장을 충분히 펼쳐 쓰오.)
  ③ 재물이 이 기질과 어떻게 연결되는지 — 돈이 흘러오는 구조와 실제 패턴을 구체적 예시(인맥·업종·행동 방식 등)와 함께 서술. (2문장)
  ④ "다만 {일간명}의 {특성}은 때로 {부정적 측면}으로 번지오." 형식으로 약점 한 가지. (1문장)
  ⑤ 그 약점이 재물에 어떤 결과를 낳는지 짚고, 보완하는 구체적 행동 조언으로 마무리. (1문장)
  [제약] 어미는 "~이오" "~하오" "~소" "~오" 등 고어체. 전체 6~7문장, 300자 이상 충분히 서술. 짧게 끊지 말고 각 문장을 밀도 있게 전개하오. "뛰어나오" "중요하오" 같은 추상적 칭찬 금지 — 반드시 구체적 상황·행동·패턴으로 풀어쓰오. 자연물 은유는 아래 일간별 특성표에서 도출하오.
  [일간별 특성표 — 반드시 해당 일간의 자연물·기질·재물 패턴·약점을 풀이에 반영하오]
  甲(갑목): 자연물=곧게 뻗은 큰 나무. 양목(陽木). 기질=개척·리더십·직진하는 기상. 재물패턴=먼저 치고 나가 크게 확장하는 방식, 사업·독립·성장에서 돈이 쌓임. 약점=고집과 독선으로 협력 기회를 밀어냄.
  乙(을목): 자연물=담장을 타는 덩굴·화초. 음목(陰木). 기질=유연함·적응력·환경 활용. 재물패턴=인맥·소개·협업 사이에서 돈이 흘러옴, 관계망이 재물망. 약점=우유부단하여 결단 타이밍을 놓침.
  丙(병화): 자연물=태양. 양화(陽火). 기질=밝음·표현력·사람을 끌어모으는 에너지. 재물패턴=드러냄·홍보·대중을 상대하는 방식에서 기회가 생김, 주목받을수록 돈이 따름. 약점=빠르게 타오르고 쉽게 식어 지속성이 부족함.
  丁(정화): 자연물=촛불·등불. 음화(陰火). 기질=섬세함·깊은 집중·관계를 밝히는 힘. 재물패턴=전문성·기술·신뢰 관계에서 꾸준히 쌓임, 한 분야를 깊이 파는 방식. 약점=소심함과 불안이 결정을 미루게 함.
  戊(무토): 자연물=산·대지. 양토(陽土). 기질=묵직한 안정감·포용력·뚝심. 재물패턴=부동산·실물자산·안전한 축적 방식, 서두르지 않고 쌓아가는 구조. 약점=변화에 둔하여 새 흐름을 놓침.
  己(기토): 자연물=논밭·평지. 음토(陰土). 기질=세심함·실용성·꾸준히 가꾸는 힘. 재물패턴=반복적·꼼꼼한 방식으로 일구며, 세심한 관리에서 손실을 막음. 약점=욕심이 생길 때 오히려 판단이 흐려짐.
  庚(경금): 자연물=바위·쇠도끼. 양금(陽金). 기질=결단력·원칙·강한 추진력. 재물패턴=원칙과 승부수로 큰 기회를 포착, 결단이 빠를수록 재물이 따름. 약점=유연성 부족으로 협상·타협에서 손해를 봄.
  辛(신금): 자연물=보석·칼날. 음금(陰金). 기질=정제됨·예민한 심미안·고부가가치 추구. 재물패턴=품질·안목·희소성 있는 영역에서 돈이 만들어짐. 약점=완벽주의로 시작과 실행이 늦어져 타이밍을 놓침.
  壬(임수): 자연물=바다·큰 강. 양수(陽水). 기질=넓은 시야·정보력·유동적 지략. 재물패턴=유통·정보·네트워크·흐름을 타는 방식, 여러 갈래로 벌어지는 구조. 약점=방향이 산만하여 한 곳에 집중해야 할 때 힘이 분산됨.
  癸(계수): 자연물=샘물·이슬·빗물. 음수(陰水). 기질=깊은 직관·예리함·조용한 침투력. 재물패턴=타이밍과 직관으로 기회를 포착, 남이 모를 때 먼저 움직임. 약점=불안과 의심이 지나쳐 좋은 기회를 스스로 걷어냄.

[geokguk 섹션 — 격국]
이 사람의 격국(格局)을 월지 기준으로 판단하여 아래 형식으로 출력하오.
- name: 격국 이름 (예: "편인격", "정관격", "식신격", "재격" 등).
- keyword: 이 격이 가진 핵심 특성 키워드 2~3개를 "·"로 구분 (예: "직관·창의·독립").
- intro: 【필수】'격국으로는 [격국명]에 해당하여 ~' 형식으로 시작하여, 이 격국이 재물과 연결되는 핵심 능력·특성 2가지를 자연스럽게 서술하오.
- callout: 이 격국에 어울리는 재물 획득 방식·분야(직업·기술·사업 등)를 구체적으로 나열하는 한 문장.
- paragraphs: 아래 2개 단락 배열.
  ① 이 격국의 재물 기질과 강점을 체감 언어로 서술. (2~3문장)
  ② 이 격국이 과하거나 채워지지 않을 때 재물에서 나타나는 주의점. (1~2문장)
`,

  2: `[wealthStyle 섹션 — 재물 기질]
- intro: 이 사람의 재물 기질을 대표하는 핵심 한 줄. (1문장, 홍연 화자)
- keywords: 재물 기질을 압축하는 키워드 3개. 각 2~4글자. 예: ["적극 추진형", "선계획 후실행", "안전 우선"]
- modes: 3개 항목. 각 항목:
  - icon: 성격에 맞는 이모지 1개 (💰 벌기, 💳 소비·저축, 🧠 재물심리 등 구분)
  - title: 짧은 소제목 (예: "돈을 버는 방식", "소비와 저축 습관", "재물에 대한 심리")
  - desc: 해당 기질 설명 3~4문장. 구체적인 십성·오행 근거 포함. 홍연 화자.
- traits: 4개 돈 성향 점수. 각 항목 { label, score(0~100 정수) }
  반드시 이 4개: "적극성" "절약성" "위험선호" "장기계획"
  사주 명식에 근거해 점수 산출.
- summaryParagraphs: 재물 기질 종합 풀이를 반드시 4개 단락 배열로 작성하오. 점수 숫자는 절대 언급하지 마오. 각 단락 2~3문장. 홍연 화자(~했소/~이오).
  [0] 이 사람의 재물 기질을 가장 잘 대표하는 특성을 짚고, 그 기질이 어디서 비롯되는지 사주 원국과 연결하여 서술.
  [1] 그 기질이 실제 재물을 버는 방식에서 어떤 강점으로 발현되는지, 구체적인 상황을 떠올릴 수 있도록 체감 언어로 풍부하게 서술.
  [2] 소비·저축 습관에서 이 기질이 어떻게 나타나는지 서술하고, 이 기질의 맹점(지나친 안전 고집·목표 집중으로 놓치는 부분 등)을 구체적으로 짚어줌.
  [3] 강점을 살리면서 맹점을 보완하는 재물 운용 방향 조언. 이 사람만의 재물 길을 제시하는 마무리 단락.`,

  3: `[wealthPresence 섹션 — 재성 강도 & 조건 분석]
- score: 이 명식의 재성(財星) 종합 강도 0~100 정수. 재성의 유무·위치·힘·생조 여부 종합 판단.
- reDesc: 재성의 유무·강약과 그 의미를 깊이 풀어쓴 풀이. 6~8문장. 위 [기둥별 십성] 목록에서 정재·편재에 해당하는 자리만 재성으로 언급할 것 — 상관·식신·인성·비겁·관성은 재성이 아니므로 재성이라고 부르거나 재성처럼 설명하면 절대 안 됨. ①재성이 어느 주(柱) 어느 자리에 있는지 (재성이 아예 없으면 "원국에 재성이 나타나고 있지는 않지만"으로 시작하여 재성 부재의 의미와 대신 재물을 만드는 구조를 설명) ②그 재성의 힘이 강하거나 약한 이유 — 생조·극제·합충 여부 구체적으로 ③일간과의 관계와 재물을 다루는 방식 ④재성이 놓인 주(柱)가 갖는 시기적 의미(년주=초년/조상, 월주=중년/직업, 일주=배우자/현재, 시주=말년/자녀) ⑤이 구조가 삶의 재물 흐름 전체에 주는 의미와 방향 순서로 풍부하게 서술. 홍연 화자. 호칭 사용.
- conditions: 4개 항목. 재물과 관련한 유리한 조건 2개(type:"good") + 조심할 조건 2개(type:"warn"). 각 { type, text: 구체적 한 줄 }.
- condDesc: 위 조건들을 종합한 풀이. 7문장. 어떤 환경·시기·방식에서 재물이 잘 흐르는지, 좋은 조건을 어떻게 살려야 하는지, 조심할 조건은 어떻게 대비해야 하는지를 풍부하게 서술. 홍연 화자. 호칭 사용.

[jaeseong 섹션 — 재물성(재성) 체크]
이 사람의 사주 원국에서 재물성(재성)의 상태를 항목별로 점검하오.
items: 반드시 4개 항목. 각 항목:
- label: 체크 항목명 (예: "재성 존재", "재성 힘", "식상→재 흐름", "관성 보호")
- exists: true(있음/좋음) 또는 false(없음/약함)
- desc: 해당 항목의 상태를 한 줄로 설명 (구체적인 천간·지지·십성 언급).
【필수】"식상→재 흐름" 항목의 exists 값은 반드시 위 [식상생재 흐름 판정] 결과를 그대로 따르오. 임의로 판단하지 마오.
summary: "재성 존재", "재성 힘", "관성 보호" 3가지 항목만을 바탕으로 재물성 풀이를 작성하오. "식상→재 흐름"은 절대 언급하지 마오. 반드시 200자 이상 작성하오.
작성 순서:
① 재성이 어느 기둥(년주·월주·일주·시주)에 위치하는지, 편재·정재 중 무엇인지 명시하며 재물과의 인연이 어떻게 열려 있는지 서술. (2문장 이상)
② 재성의 힘이 강하거나 약한 이유를 원국 구조와 연결하여 풀이하고, 실제 삶에서 어떤 방식으로 재물이 만들어지는지 체감 언어로 서술. (2문장 이상)
③ 관성의 보호가 있다면 재물이 안정적으로 지켜지는 구조를 구체적으로 서술. 관성이 없거나 약하면 재물이 흩어질 수 있다는 점을 짚어줌. (1~2문장)
④ 이 사람에게 맞는 재물 운용 방향·태도를 구체적인 조언으로 마무리. (1문장)
홍연 화자(~했소/~이오)로. 단순 나열 금지 — 이 사람의 원국 구조에서 자연스럽게 흘러나오는 이야기처럼 쓰오.

[분량·문체 기준 예시 — 내용은 절대 그대로 쓰지 말고, 이 사람의 실제 원국 데이터(위 [기둥별 십성] 참고)를 바탕으로 새로 작성할 것]
"이 사주에는 편재가 뿌리 깊은 년주에 자리하여, 재물과의 인연이 일찍부터 열려 있었소. 년주의 재성은 조상이나 환경으로부터 물려받은 재물의 씨앗과도 같으니, 이 사람은 일찍부터 돈의 흐름을 몸으로 익혀온 편이오. 재성의 힘 또한 신강한 사주 위에서 강하게 작용하니, 스스로 재물을 끌어당기는 기운이 원국 안에 충분히 갖춰져 있소이다. 이는 재물을 쌓는 데 있어 외부 도움보다 자신의 역량으로 이끌어내는 방식이 더 잘 맞는다는 뜻이기도 하오. 더하여 관성이 재성을 감싸고 있으니, 번 재물이 쉬이 흩어지지 않고 안정적으로 지켜지는 구조이오. 다만 재성이 강하다 하여 무리하게 벌이를 키우기보다, 관성의 규율 아래 꾸준히 쌓아가는 방식이 이 사주에 가장 잘 맞는 재물의 길이오."
※ 위 예시는 '편재가 년주에 있고 관성이 있는 경우'의 예시일 뿐. 이 사람의 실제 재성 위치·종류·힘·관성 여부를 위 [기둥별 십성] 목록에서 확인하여 완전히 다른 내용으로 작성하오.

[investStyle 섹션 — 투자 스타일]
- investorType: 이 사람을 대표하는 투자자 유형명. 반드시 "○○형" 형식 (예: "안정성장형", "공격확장형", "가치투자형", "배당수익형", "부동산집중형"). 이 명식의 재성·신강신약·격국을 종합하여 판단.
- investorTraits: 이 투자자 유형의 핵심 특징 4개. 각 항목 15자 이내 간결하게.
- radarScores: 【필수 — 절대 생략 금지】 투자 성향 레이더 차트 점수. 반드시 아래 5개 키를 모두 포함한 객체로 출력. 각 값은 0~100 정수. 사주 명식(신강신약·재성위치·격국·오행균형)에 근거하여 각 항목을 다르게 산출할 것. 모두 같은 값(예: 50)으로 내면 틀린 것이오.
  { "안전추구": 0~100, "수익추구": 0~100, "장기투자": 0~100, "분산투자": 0~100, "적극성": 0~100 }
- types: 【필수】 반드시 3개. 아래 10개 유형 목록에서만 선택하오. category는 목록의 유형명을 그대로 사용. tip만 이 명식에 맞게 작성(3~4문장, 십성·오행 근거, 홍연 화자, 호칭 사용).
  선택 가능 유형 목록: "안정성장형", "공격확장형", "부동산집중형", "배당수익형", "가치투자형", "트레이딩형", "분산균형형", "채권안전형", "창업투자형", "현금유동형"
  선택 기준: radarScores와 이 명식에 가장 잘 맞는 유형 순서로 3개 선택. 1위는 반드시 위의 investorType과 동일하거나 가장 가까운 유형.
  tip 작성 기준 (사주 근거 언급 금지. 투자 유형 실전 풀이만):
  - 문장 1: 이 유형의 핵심 투자 철학 한 줄
  - 문장 2~3: 실전에서 어떻게 접근하면 잘 통하는지 구체적으로
  - 문장 4: 이 유형의 주의할 맹점 또는 더 잘 활용하는 조언
  - 반드시 4문장. 홍연 화자(~했소/~이오). 호칭 사용. 각 문장 40자 이상.`,

  4: `[careerWealth 섹션 — 천직 방향 분석]
- vocType: 이 명식의 천직 유형 이름. 2~4글자로 압축. (예: "전문가형", "창업선도형", "조직관리형", "예술창작형")
- vocKeywords: 천직 방향을 압축하는 키워드 3개. 각 2~4글자. (예: ["전문성", "독립성", "대인관계"])
- intro: 이 사람에게 돈이 따르는 일의 핵심 방향 한 줄. 어떤 십성·오행이 직업운을 만드는지 포함. (1문장, 홍연 화자)
- cards: 천직 방향 3가지 관점 카드. 각 card:
  - icon: 관련 이모지 1개 (💡 적성, 🏆 강점, ⚠️ 주의 등)
  - title: 짧은 소제목 (예: "타고난 적성", "돈이 따르는 환경", "피해야 할 방향")
  - desc: 반드시 5문장. 각 문장 40자 이상. 사주·십성·오행 언급 금지. 기질·성향·행동 패턴·환경으로만 서술. 호칭(○○님) 반드시 포함. 홍연 화자(~했소/~이오).
    카드별 작성 기준:
    · 타고난 적성: [문1] 가장 잘 발휘되는 역할·환경 [문2] 강점이 드러나는 방식 [문3] 특히 두각을 나타내는 상황 [문4] 맞지 않는 환경과 대비 [문5] 이 기질을 살리는 핵심 방향
    · 돈이 따르는 환경: [문1] 재물이 따르는 수익 구조 [문2] 이 기질과 맞는 일의 방식 [문3] 전문성·깊이와 재물의 연결 [문4] 협력·관계에서의 이상적 구조 [문5] 장기적 재물의 토대가 되는 것
    · 피해야 할 방향: [문1] 기질과 충돌하는 조직·환경 [문2] 그 환경에서 생기는 문제 [문3] 결정·행동 방식의 주의할 점 [문4] 관계에서 조심해야 할 성향 [문5] 장기적으로 갖춰야 할 태도
- summary: 천직과 재물 방향 종합 풀이 3~4문장. 어떤 일을 해야 재물이 따르고 어떤 태도로 임해야 하는지 방향 제시. 홍연 화자. 호칭 사용.

[jobFit 섹션 — 어울리는 직군]
clusters: 【필수】 반드시 3개. 절대 2개로 줄이지 마오.
각 cluster: category(아래 12개 직군 목록 중 반드시 하나를 그대로 선택), keywords(해당 직군 특성 키워드 2~3개), desc(아래 기준에 따라 작성).
선택 가능 직군 목록 (반드시 이 중에서만 선택, 다른 이름 사용 금지):
"창의직군", "전문직군", "비즈니스직군", "기술직군", "금융직군", "미디어직군", "교육직군", "의료/헬스직군", "법률/행정직군", "영업/마케팅직군", "서비스직군", "공학/제조직군"

각 직군별 직업 공통점 (desc 작성 시 반드시 반영):
- 창의직군: 결과물로 자신을 증명, 포트폴리오 기반, 클라이언트 작업, 자신만의 스타일
- 전문직군: 지식·경험 기반, 1:1 또는 소수 대상, 신뢰와 레퍼런스가 수익의 핵심
- 비즈니스직군: 판을 스스로 짜는 구조, 성과가 수익으로 직결, 사람과 자원을 연결
- 기술직군: 논리적 문제 해결, 코드·시스템 구축, 지속적 학습, 성과가 수치로 측정
- 금융직군: 숫자와 리스크 판단, 시장 흐름 읽기, 정밀한 분석, 신뢰가 자산
- 미디어직군: 대중과 직접 소통, 콘텐츠가 브랜드, 구독자·팔로워가 수익 기반
- 교육직군: 지식 전달, 장기적 관계, 신뢰 축적이 핵심, 수강생 성장이 곧 레퍼런스
- 의료/헬스직군: 신체·정신 관리, 반복 고객, 전문 자격 기반, 신뢰가 수익 유지
- 법률/행정직군: 규칙과 원칙 기반, 정밀성 요구, 자격증·경력이 핵심 자산
- 영업/마케팅직군: 관계와 설득, 성과 중심 보상, 네트워크가 곧 재물
- 서비스직군: 감성·경험 제공, 재방문율이 수익 기반, 공간과 분위기가 브랜드
- 공학/제조직군: 실물 결과물, 기술 전문성, 프로젝트 단위 수익, 산업 이해도 중요

desc 작성 기준:
- 반드시 6문장. 각 문장 40자 이상. 사주·십성 언급 금지. 호칭(○○님) 포함. 홍연 화자(~했소/~이오).
- [문1] 이 직군 직업들의 공통된 특성·환경 소개
- [문2] 선우님의 기질과 이 직군이 맞는 이유
- [문3] 이 직군에서 성장하는 방식
- [문4] 재물이 따르는 구체적인 구조
- [문5] 이 직군에서 주의할 점 또는 더 잘 활용하는 방법
- [문6] 마무리 방향 조언

[splitType 섹션 — 직장인 vs 사업가 판정]
- leftLabel: "직장인형", left: 비율 정수 0~100
- rightLabel: "사업가형", right: 100-left
- verdict: 판정 결과 한 줄. "○○님은 직장인형/사업가형에 더 가깝소." 형식. 반드시 호칭 사용. (예: "선우님은 사업가형에 더 가깝소.")
- verdictDesc: 판정 근거 풀이. 반드시 3문장. 각 문장 40자 이상. 사주·십성·오행 언급 금지. 기질·성향·행동 패턴으로만 서술. 호칭(○○님) 반드시 포함. 홍연 화자(~했소/~이오).
  [작성 기준]
  - 문장 1: 조직 vs 독립 중 어디서 더 크게 발휘되는 기질인지
  - 문장 2: 그 기질이 수익 구조·동기와 어떻게 연결되는지
  - 문장 3: 더 잘 활용하기 위한 현실적 조언 한 줄

`,

  5: `[wealthPeak 섹션 — 재물 황금기]
- peakTitle: 이 명식 황금기의 핵심 이름. 2~6글자. (예: "재성 절정기", "관인상생의 시절")
- peakWhen: 황금기가 오는 시기 (예: "30대 후반~40대 초반", "갑진 대운 시작 무렵")
- peakDesc: 황금기의 본질과 그 시기를 어떻게 준비해야 하는지 3~4문장. 어떤 대운·세운이 열리는지 구체적으로. 홍연 화자. 호칭 사용.
- phases: 재물 흐름 3단계. 각 phase: { label(시기 2~6글자, 예:"준비기·성장기·절정기"), tone("grow"|"peak"|"rest"), text(그 시기 재물 기운과 해야 할 일 한 줄) }
- action: 황금기를 잡기 위해 지금 당장 해야 할 핵심 행동 한 줄.

[moneyTrap 섹션 — 돈의 함정]
- trapType: 이 명식에서 가장 경계해야 할 함정 유형명. 2~4글자. (예: "과욕형", "충동형", "방심형", "의존형")
- intro: 이 사람이 재물에서 빠지기 쉬운 함정의 본질. 반드시 3문장, 각 문장 40자 이상. ① 이 명식에서 어떤 십성·오행이 함정을 만드는지 근거를 들어 구체적으로 서술. ② 그 기운이 실제 삶에서 어떤 순간·상황으로 발현되는지 독자가 "내 얘기"처럼 느끼도록 체감 언어로 풀이. ③ 그 순간에 어떻게 대처해야 손실을 막을 수 있는지 구체적 행동 지침으로 마무리. 홍연 화자(~했소/~이오/~하오). 호칭 사용. 사주 용어는 독자가 이해할 수 있는 쉬운 언어로 풀어 설명할 것.
- traps: 구체적인 함정 상황 3개. 각 trap:
  - icon: 관련 이모지 1개
  - title: 함정 상황 이름 (짧은 명사구, 예: "큰 수익에 눈이 멀 때", "주변의 달콤한 말에 흔들릴 때")
  - desc: 이 함정이 어떤 상황에서 어떻게 발생하고 어떤 피해를 주는지. 반드시 3문장, 각 문장 40자 이상. ① 이 함정이 발동되는 구체적인 상황·계기를 독자가 "맞아, 나 이런 적 있어"라고 느낄 수 있도록 체감 언어로 묘사. ② 그 상황을 그냥 두면 어떤 재물 피해가 발생하는지 구체적 결과로 서술. ③ 이 함정을 피하기 위해 그 순간 해야 할 행동을 실천 가능한 언어로 제시. 홍연 화자(~했소/~이오/~하오). 호칭 사용.
  - counter: 이 함정을 피하는 핵심 대처법 한 줄. 구체적이고 즉시 실행 가능한 행동으로.

[warningFlow 섹션 — 시기별 재물 흐름]
- summary: 이 명식의 향후 대운 흐름 전반적인 방향과 특징. 3~4문장. 어떤 대운이 어떻게 흐르는지, 언제가 기회고 언제가 위기인지 큰 그림. 홍연 화자. 호칭 사용.
- items: 위 [구간별 추세 요약]의 구간을 【절대로 합치거나 나누지 말 것】. 구간 수, label, trend 모두 아래 목록 그대로 사용. 임의로 묶거나 재분류하면 안 됨. 반드시 2033년까지 전부 커버할 것.
  각 item: label(시기 예: "2024~2026"), trend(계산된 추세 그대로: "상승 중"|"고점"|"하락 중"|"저점"|"유지"), title(이 시기 재물 기운을 한 마디로. 추세와 일치하게. 예: 상승 중→"재물이 오르는 시기", 고점→"재물운의 정점", 하락 중→"숨고르기 시기", 저점→"조심해야 할 시기"), text(이 시기 재물 기운의 원인·흐름·해야 할 일을 3~4문장으로. 각 문장은 반드시 40자 이상. ① 이 시기에 어떤 기운이 흐르고 재물에 어떤 영향을 주는지 사주 원국과 대운의 흐름을 근거로 구체적으로 서술. ② 이 시기 재물의 실제 움직임(수입·지출·투자·사업 등)이 어떻게 나타날 가능성이 높은지 체감 언어로 풀이. ③ 이 시기에 반드시 해야 할 행동 또는 반드시 피해야 할 행동을 구체적으로 제시. ④ 격려 또는 경계의 마무리 한 문장. 홍연 화자(~했소/~이오/~하오). 호칭 사용. 사주 용어는 쓰되 독자가 이해할 수 있는 쉬운 언어로 풀어 설명할 것.).
  ※ 대운 표현 주의: 대운은 보통 10년 단위 하나의 흐름이오. "A 대운과 B 대운이 결합"처럼 여러 대운을 합치는 표현은 쓰지 마시오. 해당 시기에 흐르는 대운 하나를 기준으로 서술할 것.`,

  6: `[wealthCare 섹션 — 재물 개운법]
- element: 보강해야 할 오행 이름 (반드시 "금", "목", "화", "토", "수" 중 하나만 출력)
- elementDesc: 이 명식에서 왜 이 오행이 부족한지 그 원인과 결과를 서술하고, 보강했을 때 재물에 어떤 변화가 오는지 설명. 반드시 3문장, 각 문장 40자 이상. ① 이 명식에서 해당 오행이 부족하여 재물 흐름에 구체적으로 어떤 약점이 생기는지 (결단력 부족·절제력 약화·기회 놓침 등 오행 특성에 맞게). ② 그 약점이 실제 삶에서 어떤 상황으로 반복되는지 독자가 "내 얘기"처럼 느낄 수 있도록 체감 언어로 묘사. ③ 이 오행을 보강하면 재물에 구체적으로 어떤 변화가 찾아오는지 희망적으로 마무리. 홍연 화자(~했소/~이오/~하오). 호칭 사용.
- tips: 재물 개운 실천법 5~6개. 각 tip:
  - icon: 관련 이모지 1개
  - category: 실천 분야 (예: "색상", "방향", "음식", "습관", "공간", "인간관계")
  - text: 이 오행을 보강하는 실천법을 반드시 4문장, 각 문장 40자 이상으로 작성. ① 이 카테고리(색상·방향·음식·습관·공간 등)가 해당 오행 보강과 어떤 원리로 연결되는지 한 문장으로 설명. ② 구체적인 실천 방법을 2문장으로 — 어떤 물건·음식·행동·장소를 어떻게 활용하는지 즉시 실행 가능한 수준으로 상세히 서술. ③ 이 실천을 꾸준히 했을 때 재물에 어떤 변화가 생기는지 또는 하지 않을 때 어떤 손실이 생기는지 마무리 한 문장. 홍연 화자(~했소/~이오/~하오). 호칭 사용 금지(카테고리 설명이므로). 막연한 표현 금지 — 반드시 구체적 명사(색상명·식재료명·물건명·방향)를 포함할 것.

[wealthAvoid 섹션 — 재물을 막는 것들]
이 명식에서 과하거나 충극되어 재물 흐름을 방해하는 기운과, 그로 인해 피해야 할 행동·습관을 구체적으로 짚어주시오.
- intro: 이 명식에서 재물을 방해하는 기운의 특성 2~3문장. 어떤 오행·십성이 문제인지 근거 포함. 홍연 화자. 호칭 사용.
- blocks: 피해야 할 것 3개. 각 block:
  - icon: 관련 이모지 1개
  - title: 피해야 할 상황·행동 이름 (짧은 명사구, 예: "충동적인 큰 지출", "보증·공동명의")
  - desc: 왜 이것이 이 명식에서 특히 위험한지 2~3문장. 어떤 십성·오행 충극 때문인지 구체적으로. 홍연 화자. 호칭 사용.

[wealthSummary 섹션 — 종합 정리]
- coreMessage: 이 사람의 재물 인생 전체를 관통하는 핵심 메시지 한 문장. 기억에 남을 만큼 인상적으로. (예: "꾸준한 전문성이 그대의 재물을 만들어내오")
- items: 핵심 정리 3개. 각 item:
  - icon: 관련 이모지 1개
  - title: 명령조 행동 지침 (예: "자주성을 무기로 삼으시오", "새는 돈부터 먼저 막으시오", "주도하는 일에 집중하시오"). 반드시 ~하시오 체로 끝낼 것. 이 사람이 재물에서 가장 중요하게 해야 할 행동을 한 줄로 압축.
  - desc: 이 명식의 핵심을 담은 풀이. 반드시 3문장, 각 문장 40자 이상. ① 이 행동이 왜 이 명식에서 특히 중요한지 사주 원국 근거 포함. ② 이 행동을 잘했을 때와 못했을 때 재물에 어떤 차이가 생기는지 체감 언어로 서술. ③ 구체적인 실천 방법 또는 마무리 조언. 홍연 화자(~했소/~이오/~하오). 호칭 사용.
- closing: 따뜻하고 힘이 되는 마무리 격려 한 문장. 홍연 화자. 호칭 사용.`,

  7: `[letter 섹션 — 홍연의 서신]
재물사주 풀이를 마치며 홍연이 독자에게 쓰는 따뜻한 손편지.
- paragraphs: 3~4개 단락. 각 단락 6~8문장.
- 이 사람의 재물 기운, 강점, 주의할 점을 따뜻하게 갈무리하되 희망적인 메시지로 맺으시오.
- 바로 본론으로 시작하여 따뜻한 마무리로 끝내시오.

[concernAdvice 섹션 — 재물 고민에 대한 명리학적 조언]
고민({고민})이 비어있거나 없으면 concernAdvice.paragraphs를 빈 배열([])로 출력하오. 고민이 있을 때만 아래 규칙으로 작성하오.

- paragraphs[0] (5~6문장, 250자 이상): 고민의 핵심을 {이름1}님의 일간·오행·재성 구조와 연결해 풀이하오. "이 고민은 우연이 아니오"라는 뉘앙스로, 사주 속에서 이 재물 고민이 왜 생기는지 명리학적 근거와 함께 설명하오.
- paragraphs[1] (5~6문장, 250자 이상): 현재 대운·세운 흐름이 이 고민에 어떤 영향을 주는지 분석하오. 언제쯤 상황이 바뀌거나 재물의 돌파구가 오는지 구체적 시기와 함께 짚어주오.
- paragraphs[2] (4~5문장, 200자 이상): 지금 당장 실천할 수 있는 명리학적 조언과 마음가짐을 전하오. 홍연의 따뜻하고 단호한 말투로 마무리하오.
총 글자수: 650자 이상. 홍연 말투(~이오/~하오/~겠소). 점수·수치 언급 금지.`,
};

// ── 장별 JSON 스키마 ──
const JAEMUL_CH_SCHEMA: Record<number, string> = {
  1: `{
  "wonguk": {
    "intro": "~한 사주로, 한 줄 요약 (1문장)",
    "sinStrength": { "intro": "【필수】위 [sinStrength.intro 첫 문장]을 그대로 복사 후 일간·십성 기반 자연 이미지 서술", "paragraphs": ["신강/신약 핵심 성향·장점 (자연 이미지, 재물 그릇과 연결, 2~3문장)", "기운이 과할 때 그림자·단점 (자연 비유, 2문장)", "주의점과 조언 (1~2문장)"] },
    "ohaengDesc": { "intro": "【필수】오행 분포 수치 기반, 높은 오행부터 재물 의미 서술", "paragraphs": ["강한 오행이 재물 활동에 드러나는 방식 (2~3문장)", "부족한 오행의 재물 빈자리와 보완 방향 (1~2문장)"] },
    "ilganDesc": "일간 오행과 재물 기운 (3~4문장)"
  },
  "geokguk": {
    "name": "격국명 (예: 편인격)",
    "keyword": "특성1·특성2·특성3",
    "intro": "【필수】'격국으로는 [격국명]에 해당하여 ~' 형식 시작, 재물 연결 핵심 능력 2가지 서술",
    "callout": "이 격국에 맞는 재물 획득 방식·분야 한 문장",
    "paragraphs": ["격국의 재물 기질·강점 (2~3문장)", "과하거나 부족할 때 재물 주의점 (1~2문장)"]
  },
}`,
  2: `{
  "wealthStyle": {
    "intro": "재물 기질 핵심 한 줄 (1문장)",
    "keywords": ["키워드1", "키워드2", "키워드3"],
    "modes": [
      { "icon": "💰", "title": "돈을 버는 방식", "desc": "버는 방식 설명 3~4문장" },
      { "icon": "💳", "title": "소비와 저축 습관", "desc": "소비·저축·투자 패턴 3~4문장" },
      { "icon": "🧠", "title": "재물에 대한 심리", "desc": "재물 집착·여유·심리 균형 3~4문장" }
    ],
    "traits": [
      { "label": "적극성", "score": 75 },
      { "label": "절약성", "score": 60 },
      { "label": "위험선호", "score": 40 },
      { "label": "장기계획", "score": 80 }
    ],
    "summaryParagraphs": ["기질 특성 + 사주 연결 (2~3문장)", "버는 방식 강점 (2~3문장)", "소비·저축 + 맹점 (2~3문장)", "방향 조언 마무리 (2~3문장)"]
  }
}`,
  3: `{
  "wealthPresence": {
    "score": 65,
    "reDesc": "재성 위치·힘·일간 작용·재물 흐름 의미를 순서대로 풀어쓴 4~5문장",
    "conditions": [
      { "type": "good", "text": "유리한 조건 한 줄" },
      { "type": "good", "text": "유리한 조건 한 줄" },
      { "type": "warn", "text": "조심할 조건 한 줄" },
      { "type": "warn", "text": "조심할 조건 한 줄" }
    ],
    "condDesc": "조건 종합 풀이 7문장 — 유리한 조건을 살리는 법, 조심할 조건 대비법, 재물이 잘 흐르는 환경·시기·방식을 풍부하게"
  },
  "investStyle": {
    "investorType": "안정성장형",
    "investorTraits": ["장기적 관점으로 접근", "리스크보다 안정 우선", "꾸준한 복리 효과 추구", "분산 투자로 리스크 관리"],
    "radarScores": { "안전추구": 70, "수익추구": 60, "장기투자": 80, "분산투자": 65, "적극성": 45 },
    "types": [
      { "category": "안정성장형", "tip": "이 투자 유형이 왜 맞는지 + 접근 방식 + 주의할 점 3~4문장" },
      { "category": "부동산집중형", "tip": "이 투자 유형이 왜 맞는지 + 접근 방식 + 주의할 점 3~4문장" },
      { "category": "배당수익형", "tip": "이 투자 유형이 왜 맞는지 + 접근 방식 + 주의할 점 3~4문장" }
    ]
  },
  "jaeseong": {
    "items": [
      { "label": "재성 존재", "exists": true, "desc": "구체적인 천간·지지 언급 한 줄" },
      { "label": "재성 힘", "exists": true, "desc": "재성 강약 상태 한 줄" },
      { "label": "식상→재 흐름", "exists": false, "desc": "식상 → 재성 연결 상태 한 줄" },
      { "label": "관성 보호", "exists": true, "desc": "관성의 재성 보호 여부 한 줄" }
    ],
    "summary": "재성 위치·힘·관성 보호 기반 재물성 종합 풀이 (식상→재 흐름 언급 금지)"
  }
}`,
  4: `{
  "careerWealth": {
    "vocType": "천직 유형명 (예: 전문가형)",
    "vocKeywords": ["키워드1", "키워드2", "키워드3"],
    "intro": "천직·재물 방향 핵심 한 줄 (1문장)",
    "cards": [
      { "icon": "💡", "title": "타고난 적성", "desc": "적성·능력 방향 3~4문장" },
      { "icon": "🏆", "title": "돈이 따르는 환경", "desc": "재물이 따르는 조건·환경 3~4문장" },
      { "icon": "⚠️", "title": "피해야 할 방향", "desc": "직업 선택 시 주의할 점 3~4문장" }
    ],
    "summary": "천직과 재물 방향 종합 풀이 3~4문장"
  },
  "jobFit": {
    "clusters": [
      { "category": "창의직군", "keywords": ["창의성", "자유로움", "표현력"], "desc": "이 직군이 왜 맞는지 3~4문장 풀이" },
      { "category": "전문직군", "keywords": ["전문성", "독립성", "기획력"], "desc": "이 직군이 왜 맞는지 3~4문장 풀이" },
      { "category": "비즈니스직군", "keywords": ["추진력", "리더십", "사업감각"], "desc": "이 직군이 왜 맞는지 3~4문장 풀이" }
    ]
  },
  "splitType": {
    "leftLabel": "직장인형",
    "left": 40,
    "rightLabel": "사업가형",
    "right": 60,
    "verdict": "○○님은 사업가형에 더 가깝소.",
    "verdictDesc": "조직 안에서 주어진 역할을 수행하는 것보다, ○○님은 스스로 방향을 정하고 움직일 때 더 큰 성과가 나오는 기질이오. 안정된 월급보다 변동성 있는 수익 구조가 ○○님에게는 오히려 동기가 되오. 다만 사업은 혼자 잘한다고 되는 것이 아니니, 신뢰할 수 있는 파트너와 함께하는 것이 핵심이오."
  }
}`,
  5: `{
  "wealthPeak": {
    "peakTitle": "황금기 핵심 이름 (예: 재성 절정기)",
    "peakWhen": "황금기 시기",
    "peakDesc": "황금기 본질 + 준비 방향 3~4문장",
    "phases": [
      { "label": "준비기", "tone": "grow", "text": "이 시기 재물 기운과 해야 할 일 한 줄" },
      { "label": "절정기", "tone": "peak", "text": "이 시기 재물 기운과 해야 할 일 한 줄" },
      { "label": "안정기", "tone": "rest", "text": "이 시기 재물 기운과 해야 할 일 한 줄" }
    ],
    "action": "황금기를 잡기 위해 지금 해야 할 핵심 행동 한 줄"
  },
  "moneyTrap": {
    "trapType": "과욕형",
    "intro": "이 명식에는 내 것을 챙기려는 힘과 밖으로 뻗어나가려는 기운이 동시에 강하게 흐르고 있어, 재물에 대한 욕심이 평소보다 빠르게 달아오르는 순간이 찾아오는 구조이오. 문제는 그 순간 감정이 이미 판단보다 앞서 있어 스스로 알아차리기 어렵다는 것이니, '이번엔 다르다'는 생각이 드는 바로 그때가 가장 위험한 때이오. 결정을 하루 이상 미루는 습관만으로도 치명적인 손실의 절반을 막을 수 있으니, 달아오른 감정이 식은 뒤에 다시 판단하는 것을 철칙으로 삼으시오.",
    "traps": [
      { "icon": "⚡", "title": "큰 수익에 눈이 멀 때", "desc": "주변에서 '이번엔 확실하다'는 말이 들려오거나 단기간에 큰돈을 번 사례를 접했을 때, 평소의 냉정함이 순식간에 흔들려 검증도 없이 자금을 움직이게 되는 것이 이 명식의 가장 위험한 순간이오. 감정이 달아오른 상태에서 내린 투자 결정은 대부분 예상치 못한 손실로 이어지며, 한 번의 실수가 수년간 쌓아온 재물을 한꺼번에 무너뜨릴 수 있소. 수익이 클수록 결정을 사흘 이상 미루는 습관만으로도 치명적인 실수를 절반은 막을 수 있으니, 흥분된 상태에서의 모든 재무 결정은 반드시 보류하시오.", "counter": "투자 결정은 반드시 사흘 뒤, 냉정해진 상태에서 다시 검토하시오." },
      { "icon": "🌀", "title": "주변의 달콤한 말에 흔들릴 때", "desc": "신뢰하는 지인이나 친분 있는 사람의 권유일수록 더 쉽게 무너지는 것이 이 명식의 특징으로, '너니까 알려주는 거야'라는 말 한마디에 검증도 없이 자금을 움직이는 실수가 반복되기 쉬우오. 그렇게 움직인 돈은 나중에 관계도 재물도 동시에 잃는 최악의 결과로 이어지는 경우가 많으니, 아무리 가까운 사람의 말이라도 문서와 데이터로 확인하는 과정을 반드시 거쳐야 하오. 투자와 인간관계는 반드시 분리하고, 부탁받은 자리에서는 즉답 대신 '생각해보겠소'라는 말을 습관으로 삼으시오.", "counter": "아무리 가까운 사람의 권유라도 문서로 확인하고 하루 뒤에 결정하시오." },
      { "icon": "🎭", "title": "재정 관리를 소홀히 할 때", "desc": "수입이 늘어나는 시기일수록 지출도 덩달아 늘어나 결국 통장 잔고가 제자리인 상황이 반복되는 것이 이 명식에서 가장 흔하게 나타나는 함정이오. 장기적인 계획 없이 들어오는 돈을 그때그때 써버리면, 정작 좋은 기회가 찾아왔을 때 움직일 자금이 없어 후회하게 되니 이것이 이 명식의 가장 조용하고 치명적인 손실이오. 매월 수입의 최소 20% 이상을 손대지 않는 계좌에 자동이체로 묶어두는 것이 이 함정을 피하는 가장 확실하고 실천 가능한 방법이오.", "counter": "매월 수입의 20% 이상을 별도 계좌에 자동이체로 강제 저축하시오." }
    ]
  },
  "warningFlow": {
    "summary": "향후 대운 흐름 전반적 방향 3~4문장",
    "items": [
      { "label": "2024~2026", "trend": "상승 중", "title": "재물이 오르는 시기", "text": "이 시기에는 재물을 관장하는 기운이 서서히 힘을 얻기 시작하여, 그동안 묵혀두었던 기회들이 하나씩 모습을 드러낼 것이오. 수입이 눈에 띄게 늘기보다는 일의 흐름이 먼저 정리되고 기반이 다져지는 시기이니, 큰 수익보다 안정적인 수입 구조를 만드는 데 집중하는 것이 현명하오. 이 시기에는 무리한 확장보다 꾸준한 저축과 소규모 투자로 씨앗을 심어두시오. 지금 심은 씨앗이 고점 시기에 꽃을 피울 것이니, 서두르지 말고 단단히 준비하시오." },
      { "label": "2027년", "trend": "고점", "title": "재물운의 정점", "text": "이 시기는 재물 기운이 절정에 달하는 때로, 그동안 쌓아온 노력과 준비가 실제 수익과 기회로 돌아오는 수확의 해이오. 사업 확장·투자 수익·승진·계약 성사 등 재물과 관련된 일들이 유리하게 풀릴 가능성이 가장 높은 시기이니, 미리 준비해둔 것을 과감하게 실행에 옮기시오. 단, 고점은 오래 머물지 않으니 이 시기의 수익 일부를 반드시 현금이나 안전 자산으로 확보해두어야 다음 하락기를 여유롭게 넘길 수 있소. 기회는 준비된 자에게만 오는 법이오." },
      { "label": "2028~2030", "trend": "하락 중", "title": "숨고르기 시기", "text": "재물의 기운이 고점을 지나 서서히 빠져나가는 시기로, 수입이 줄거나 예상치 못한 지출이 생겨 재정 균형이 흔들릴 수 있소. 이 시기에는 새로운 투자나 사업 확장보다 기존에 쌓아둔 자산을 지키는 것이 훨씬 중요하니, 불필요한 지출부터 먼저 점검하고 현금 흐름을 단단히 관리하시오. 주변에서 달콤한 투자 제안이나 동업 권유가 올 수 있으나, 이 시기에는 검증되지 않은 것에 손대지 않는 것이 최선이오. 숨고르기를 잘 한 사람이 다음 상승기에 더 크게 도약하는 법이오." },
      { "label": "2031년", "trend": "저점", "title": "조심해야 할 시기", "text": "이 시기는 재물의 흐름이 가장 낮아지는 때로, 재정적 압박이나 예상 밖의 손실이 찾아올 수 있으니 어느 해보다 신중하게 움직여야 하오. 투자·보증·공동명의·새로운 사업 등 재물이 크게 움직이는 모든 결정은 이 시기를 피해 내리는 것이 현명하며, 가능하다면 지출을 최소화하고 현금을 손에 쥐고 있는 것이 가장 안전하오. 이 시기에 발생하는 손실은 운의 흐름 탓이니 자책보다는 절제와 내실을 다지는 데 에너지를 쏟으시오. 저점은 반드시 끝이 나고, 이 시기를 잘 버틴 자에게 다음 상승이 찾아오는 법이오." },
      { "label": "2032~2033", "trend": "상승 중", "title": "재물이 다시 오르는 시기", "text": "저점을 지나 재물 기운이 다시 회복되기 시작하는 시기로, 그동안 움츠렸던 기회들이 서서히 문을 두드리기 시작할 것이오. 2031년의 어려움을 버티며 지켜둔 자산과 인맥이 이 시기에 다시 힘을 발휘하니, 조심스럽게 행동 반경을 넓혀가도 좋소. 무리한 도전보다는 검증된 방식으로 한 걸음씩 재기의 발판을 다지는 것이 이 시기에 맞는 전략이오. 다시 오르기 시작한 흐름을 타고, 단단한 준비로 다음 고점을 노리시오." }
    ]
  }
}`,
  6: `{
  "wealthCare": {
    "element": "금",
    "elementDesc": "이 명식에는 금(金)의 기운이 현저히 부족하여, 결단력 있게 끊어내는 힘과 재물을 단단히 지키는 절제력이 약해지기 쉬운 구조이오. 이로 인해 좋은 기회를 잡고도 마지막 순간에 망설이다 놓치거나, 불필요한 지출을 쉽게 끊어내지 못해 새는 돈이 반복되는 상황이 생기기 쉬우오. 금의 기운을 의식적으로 보강하면 판단이 빨라지고 재물의 흐름이 안정되며, 쌓아온 것들이 흩어지지 않고 축적되기 시작할 것이오.",
    "tips": [
      { "icon": "🎨", "category": "색상", "text": "금색·흰색·은색 계열은 금(金)의 기운을 직접 보강하는 가장 빠른 방법으로, 매일 눈에 닿고 손에 닿는 물건부터 바꾸는 것이 핵심이오. 지갑·명함 케이스·시계·열쇠고리처럼 하루에도 수십 번 접촉하는 소품을 금속 계열이나 흰색으로 교체하면 무의식 중에 금의 기운이 쌓이기 시작하오. 옷을 고를 때도 주 1~2회 이상 흰색이나 은회색 계열을 의식적으로 선택하면 결단력과 절제력이 서서히 강해지는 것을 느끼게 될 것이오. 환경이 먼저 바뀌면 마음이 따라오는 법이니, 작은 것부터 하나씩 바꿔나가시오." },
      { "icon": "🧭", "category": "방향", "text": "서쪽과 서북쪽은 금(金)의 기운이 집중되는 방향으로, 이 자리를 어떻게 활용하느냐에 따라 재물 기운의 흐름이 달라지오. 책상이나 침대 머리맡을 서쪽·서북쪽으로 향하게 배치하고, 그 방향 공간을 언제나 깔끔하게 유지하는 것이 첫 번째 실천이오. 서쪽 선반이나 창가에 금속 소품·흰 꽃·수정 등을 두면 금의 기운을 끌어당기는 효과가 있으며, 어수선하거나 묵은 물건이 쌓인 공간은 기운을 막으니 주기적으로 정리하시오. 아침마다 서쪽 창을 한 번 열어 빛을 들이는 간단한 습관만으로도 하루의 금 기운이 달라질 수 있소." },
      { "icon": "🥗", "category": "음식", "text": "흰색·금색 계열의 식재료는 금의 기운을 안에서부터 보강하는 방법으로, 의식적으로 식단에 자주 올리는 것이 좋소. 두부·마늘·무·연근·배·흰 쌀밥처럼 흰색 계열의 식재료를 주 3회 이상 꾸준히 섭취하면 몸 안의 금 기운이 채워지기 시작하오. 폐와 대장을 담당하는 금의 기운은 호흡과 배출에도 관여하니, 도라지·배즙·백합근처럼 폐를 이롭게 하는 음식을 틈틈이 챙겨 먹는 것도 같은 효과이오. 인스턴트·자극적인 음식은 금의 절제력 기운을 흩으니 줄이는 것이 현명하오." },
      { "icon": "📅", "category": "습관", "text": "금(金)의 기운은 절제와 결단의 기운이므로, 매일의 작은 약속을 지키는 습관이 이 기운을 가장 효과적으로 키우는 방법이오. 취침 시간·기상 시간·지출 한도처럼 숫자로 정해두는 루틴을 하나씩 만들고 한 달 이상 지속하면, 금의 기운이 생활 속에 뿌리를 내리기 시작하오. 재물과 직결된 습관으로는 매월 수입의 일정 비율을 자동이체로 강제 저축하고, 충동 지출 전에 '하루 뒤에 다시 생각하기' 규칙을 세우는 것만으로도 새는 돈을 절반 이상 막을 수 있소. 꾸준함이 금의 기운을 완성하는 열쇠이니, 작더라도 지킬 수 있는 것부터 시작하시오." },
      { "icon": "🏠", "category": "공간", "text": "공간의 기운은 그 안에 있는 사람의 판단력과 집중력에 직접 영향을 주므로, 단정하고 절제된 공간이 금의 기운을 키우는 가장 강력한 환경이오. 책상 위나 작업 공간에 금속 재질의 소품(펜 홀더·메모 트레이·금속 문진 등)을 두고, 불필요한 물건을 걷어내어 시야를 단순하게 만드는 것이 첫걸음이오. 집 안 서쪽 공간에 흰색 패브릭이나 은빛 조명을 더하고, 금속 프레임의 거울을 서쪽 벽에 두면 금의 기운이 모여들고 증폭되는 효과가 있소. 한 달에 한 번 서쪽 구역 대청소를 루틴으로 삼으면 재물 결단력이 함께 강해지오." }
    ]
  },
  "wealthAvoid": {
    "intro": "이 명식에서 재물을 방해하는 기운의 특성 2~3문장",
    "blocks": [
      { "icon": "⚡", "title": "피해야 할 상황 이름", "desc": "왜 위험한지 2~3문장" },
      { "icon": "🌀", "title": "피해야 할 상황 이름", "desc": "왜 위험한지 2~3문장" },
      { "icon": "🎭", "title": "피해야 할 상황 이름", "desc": "왜 위험한지 2~3문장" }
    ]
  },
  "wealthSummary": {
    "coreMessage": "꾸준한 전문성이 그대의 재물을 만들어내오",
    "items": [
      { "icon": "💡", "title": "자주성을 무기로 삼으시오", "desc": "이 명식의 가장 큰 재물 무기는 누구의 눈치도 보지 않고 스스로 판단하고 실행하는 독립적인 추진력으로, 이 힘이 잘 발휘될 때는 남들이 망설이는 기회에 먼저 움직여 앞서나가는 결과로 이어지오. 본인이 깊이 파고든 분야에서 재물이 따라오는 명식이므로, 이 자주성을 살렸을 때와 억눌렀을 때 수입의 차이가 눈에 띄게 벌어지오. 다만 자주성이 고집으로 굳어지지 않도록 실력은 혼자 쌓되 결정은 한 번 더 검토하는 습관을 철칙으로 삼으시오." },
      { "icon": "⚠️", "title": "새는 돈부터 먼저 막으시오", "desc": "재물이 들어오는 통로는 넓으나 나가는 구멍도 함께 크다는 것이 이 명식의 그림자로, 기분이나 감정 상태에 따라 지출이 크게 흔들리는 경향이 반복되면 결국 남는 것이 없게 되오. 좋을 때 쓰고 나쁠 때 또 쓰는 패턴이 굳어지기 전에 수입의 일정 비율을 자동이체로 강제 저축하는 구조를 먼저 만들어두어야 하오. 큰 지출은 반드시 하루 이상 보류하는 규칙 하나만 지켜도 재물 누수를 크게 줄일 수 있소." },
      { "icon": "🎯", "title": "주도하는 일에 집중하시오", "desc": "이 명식의 재물은 남이 시키는 일보다 본인이 기획하고 주도하는 일에서 훨씬 크게 열리며, 창의성과 독립성이 허용되는 환경일수록 수입이 자연스럽게 따라오는 구조이오. 지금 당장 큰 수익보다 전문성을 쌓는 데 재물과 시간을 투자하면, 그것이 나중에 아무도 빼앗을 수 없는 가장 단단한 재물 기반이 될 것이오. 내가 주도할 수 있는 일을 찾고, 그 안에서 깊어지는 것이 이 명식이 재물을 여는 가장 확실한 열쇠이오." }
    ],
    "closing": "마무리 격려 한 문장"
  }
}`,
  7: `{
  "letter": {
    "paragraphs": ["단락1 (6~8문장, 각 단락 최소 150자 이상)", "단락2 (6~8문장, 각 단락 최소 150자 이상)", "단락3 (6~8문장, 각 단락 최소 150자 이상)", "단락4 (6~8문장, 따뜻한 마무리, 최소 150자 이상)"]
  },
  "concernAdvice": {
    "paragraphs": [
      "고민 + 일간·오행·재성 구조 연결 (5~6문장, 250자 이상)",
      "대운·세운 흐름 분석 + 재물 돌파구 시기 (5~6문장, 250자 이상)",
      "실천 조언 + 마무리 (4~5문장, 200자 이상)"
    ]
  }
}`,
};

// ── 핵심 함수: 장별 프롬프트 빌더 ──
export function buildJaemulChapterPrompt(
  chapter: number,
  input: {
    name: string;
    gender: "male" | "female";
    manseryeokText: string;
    pillars?: { pos: string; gan: string; ganEl: string; ji: string; jiEl: string; sipTop: string; sipBot: string; sinsal?: string }[];
    birthYear?: number;
    seun?: { label: string; gz: string; active?: boolean }[];
    ilganChar?: string;
    concern?: string;
  }
): { system: string; user: string } {
  const theme = JAEMUL_CH_THEME[chapter] ?? `[제${chapter}장]`;
  const firstName = input.name ? (input.name.slice(1) || input.name) : "";
  const rawGuide = JAEMUL_CH_GUIDE[chapter] ?? "";
  const guide = rawGuide
    .replace(/\{고민\}/g, input.concern?.trim() ?? "")
    .replace(/\{이름1\}/g, firstName);
  const schema = JAEMUL_CH_SCHEMA[chapter] ?? "{}";
  const honor = firstName ? `${firstName}님` : "그대";
  const currentYear = new Date().getFullYear();


  // 기둥별 십성 목록 + 재성 위치 명시
  const jaeSungPositions = input.pillars
    ? input.pillars.filter(p => p.sipTop === "정재" || p.sipTop === "편재" || p.sipBot === "정재" || p.sipBot === "편재")
        .map(p => {
          const parts = [];
          if (p.sipTop === "정재" || p.sipTop === "편재") parts.push(`${p.pos} 천간 ${p.gan}(${p.sipTop})`);
          if (p.sipBot === "정재" || p.sipBot === "편재") parts.push(`${p.pos} 지지 ${p.ji}(${p.sipBot})`);
          return parts.join(", ");
        }).join(", ")
    : "";

  // 식상생재 흐름 판정: 식상과 재성이 인접 기둥에 있으면 강한 흐름
  let siksangJaeFlow = "";
  if (input.pillars && input.pillars.length >= 4) {
    const ORDER = ["시주", "일주", "월주", "년주"];
    const hasSiksang = (p: typeof input.pillars[0]) =>
      ["식신", "상관"].includes(p.sipTop) || ["식신", "상관"].includes(p.sipBot);
    const hasJaeseong = (p: typeof input.pillars[0]) =>
      ["정재", "편재"].includes(p.sipTop) || ["정재", "편재"].includes(p.sipBot);
    const byPos: Record<string, typeof input.pillars[0]> = {};
    for (const p of input.pillars) byPos[p.pos] = p;
    const ADJACENT_PAIRS = [["시주","일주"],["일주","월주"],["월주","년주"]];
    const strongFlow = ADJACENT_PAIRS.some(([a, b]) => {
      const pa = byPos[a], pb = byPos[b];
      if (!pa || !pb) return false;
      return (hasSiksang(pa) && hasJaeseong(pb)) || (hasJaeseong(pa) && hasSiksang(pb));
    });
    const siksangPillars = ORDER.filter(pos => byPos[pos] && hasSiksang(byPos[pos]));
    const jaePillars = ORDER.filter(pos => byPos[pos] && hasJaeseong(byPos[pos]));
    if (siksangPillars.length > 0 && jaePillars.length > 0) {
      siksangJaeFlow = `\n[식상생재 흐름 판정 — jaeseong items 중 "식상→재 흐름" 항목에 반드시 반영]\n식상 위치: ${siksangPillars.join(", ")} / 재성 위치: ${jaePillars.join(", ")}\n판정: ${strongFlow ? "강한 식상생재 흐름 (인접 기둥) — exists: true, 강한 흐름임을 명시" : "식상과 재성이 인접하지 않아 흐름이 약함 — exists: false"}\n`;
    } else if (siksangPillars.length === 0) {
      siksangJaeFlow = `\n[식상생재 흐름 판정 — jaeseong items 중 "식상→재 흐름" 항목에 반드시 반영]\n식상(식신·상관)이 원국에 없음 — exists: false\n`;
    }
  }

  const pillarSipseong = input.pillars && input.pillars.length > 0
    ? `\n[기둥별 십성 — 반드시 이 목록만 참고할 것. 임의로 십성을 계산하거나 추정하지 말 것]\n` +
      input.pillars.map(p => `  ${p.pos}: 천간 ${p.gan}(${p.sipTop}) / 지지 ${p.ji}(${p.sipBot})`).join("\n") +
      `\n  ※ 재성(정재·편재) 위치: ${jaeSungPositions || "없음"} — 이 외의 자리에 재성이 있다고 절대 쓰지 말 것`
    : "";

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

  // ch1 전용: 오행 분포표 생성 → ohaengDesc 풀이에 주입
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

  // ch3 전용: 재성 강도 서버 계산 → 프롬프트 주입
  let jaemulScoreBlock = "";
  if (chapter === 3 && input.pillars && input.pillars.length >= 4) {
    const byPos: Record<string, typeof input.pillars[0]> = {};
    for (const p of input.pillars) byPos[p.pos] = p;
    const isJae = (s: string) => ["정재", "편재"].includes(s);
    const isSiksang = (s: string) => ["식신", "상관"].includes(s);
    const isGwan = (s: string) => ["정관", "편관"].includes(s);

    // ① 재성 존재 여부 (40점)
    const jaeExists = input.pillars.some(p => isJae(p.sipTop) || isJae(p.sipBot));
    let score = jaeExists ? 40 : 0;

    // ② 재성 위치 점수 (최대 20점, 가장 높은 위치 하나만)
    const posScores: Record<string, number> = { 월주: 20, 일주: 15, 시주: 15, 년주: 8 };
    let posScore = 0;
    if (jaeExists) {
      for (const [pos, pts] of Object.entries(posScores)) {
        const p = byPos[pos];
        if (p && (isJae(p.sipTop) || isJae(p.sipBot))) {
          // 천간은 -3점 감점
          const isGanOnly = isJae(p.sipTop) && !isJae(p.sipBot);
          posScore = Math.max(posScore, isGanOnly ? pts - 3 : pts);
        }
      }
    }
    score += posScore;

    // ③ 신강신약 (최대 20점) — deungTable 결과 재활용
    const ilju = byPos["일주"]; const wolju = byPos["월주"]; const siju = byPos["시주"]; const nyeonju = byPos["년주"];
    let sinScore = 12; // 기본 중화
    if (ilju && wolju && siju && nyeonju) {
      const ilganEl = ilju.ganEl;
      const generates: Record<string, string> = { 목: "화", 화: "토", 토: "금", 금: "수", 수: "목" };
      const helps = (el: string) => el === ilganEl || generates[el] === ilganEl;
      const seCount = [siju.ganEl, wolju.ganEl, nyeonju.ganEl, nyeonju.jiEl].filter(helps).length;
      const successCount = [helps(wolju.jiEl), helps(ilju.jiEl), helps(siju.jiEl), seCount >= 2].filter(Boolean).length;
      sinScore = successCount >= 3 ? 20 : successCount >= 2 ? 15 : successCount >= 1 ? 8 : 5;
    }
    score += sinScore;

    // ④ 식상 존재 (10점)
    const siksangExists = input.pillars.some(p => isSiksang(p.sipTop) || isSiksang(p.sipBot));
    if (siksangExists) score += 10;

    // ⑤ 관성 보호 (10점)
    const gwanExists = input.pillars.some(p => isGwan(p.sipTop) || isGwan(p.sipBot));
    if (gwanExists) score += 10;

    score = Math.min(100, Math.max(0, score));

    const jaePositions = input.pillars
      .filter(p => isJae(p.sipTop) || isJae(p.sipBot))
      .map(p => p.pos).join("·") || "없음";

    jaemulScoreBlock = `\n[재성 강도 서버 계산 결과 — wealthPresence.score는 반드시 이 값을 그대로 사용하오. 임의로 변경하지 마오]\n재성 위치: ${jaePositions}\n재성 존재: ${jaeExists ? "있음 (+40)" : "없음 (0)"} / 위치점수: +${posScore} / 신강신약: +${sinScore} / 식상생조: ${siksangExists ? "+10" : "+0"} / 관성보호: ${gwanExists ? "+10" : "+0"}\n최종 score: ${score}\n`;
  }

  // ch5 전용: WealthLineChart와 동일한 로직으로 연도별 재물운 점수 계산 → 프롬프트 주입
  let wealthScoreBlock = "";
  if (chapter === 5 && input.seun && input.seun.length > 0) {
    const TARGET_YEARS = [2024,2025,2026,2027,2028,2029,2030,2031,2032,2033];
    // WealthLineChart의 SIPSEONG_SCORE와 동일 — toSipseong이 대분류("재성","비겁","식상","관성","인성") 반환하므로
    // 대분류 키로 매핑해야 차트와 점수가 일치함
    const SS: Record<string, number> = {
      재성: 88,   // toSipseong → "재성"
      비겁: 55,   // toSipseong → "비겁"
      관성: 60,   // toSipseong → "관성"
      인성: 65,   // toSipseong → "인성"
      // "식상"은 SS에 없으므로 WealthLineChart와 동일하게 fallback 65 사용
    };
    const STEM_EL: Record<string, string> = { 甲:"목",乙:"목",丙:"화",丁:"화",戊:"토",己:"토",庚:"금",辛:"금",壬:"수",癸:"수" };
    const BRANCH_EL: Record<string, string> = { 子:"수",丑:"토",寅:"목",卯:"목",辰:"토",巳:"화",午:"화",未:"토",申:"금",酉:"금",戌:"토",亥:"수" };
    const GEN: Record<string,string> = { 목:"화",화:"토",토:"금",금:"수",수:"목" };
    const CTL: Record<string,string> = { 목:"토",화:"금",토:"수",금:"목",수:"화" };
    // WealthLineChart의 toSipseong과 동일
    const toSip = (ilEl: string, tEl: string) => {
      if (ilEl === tEl) return "비겁";
      if (GEN[ilEl] === tEl) return "식상";
      if (CTL[ilEl] === tEl) return "재성";
      if (CTL[tEl] === ilEl) return "관성";
      if (GEN[tEl] === ilEl) return "인성";
      return "비겁";
    };
    // WealthLineChart와 동일: view.ilgan 첫 글자로 일간 오행 추출
    const ilganChar = (input.pillars?.[2]?.gan ?? "")[0] ?? "";
    const ilEl = STEM_EL[ilganChar] ?? "목";
    const seunMap: Record<number, string> = {};
    input.seun.forEach(s => { const y = Number(s.label); if (y >= 2024 && y <= 2033) seunMap[y] = s.gz; });
    const GANJIS = ["甲子","乙丑","丙寅","丁卯","戊辰","己巳","庚午","辛未","壬申","癸酉","甲戌","乙亥","丙子","丁丑","戊寅","己卯","庚辰","辛巳","壬午","癸未","甲申","乙酉","丙戌","丁亥","戊子","己丑","庚寅","辛卯","壬辰","癸巳","甲午","乙未","丙申","丁酉","戊戌","己亥","庚子","辛丑","壬寅","癸卯","甲辰","乙巳","丙午","丁未","戊申","己酉","庚戌","辛亥","壬子","癸丑","甲寅","乙卯","丙辰","丁巳","戊午","己未","庚申","辛酉","壬戌","癸亥"];
    const baseIdx = GANJIS.indexOf("甲辰");
    TARGET_YEARS.forEach(y => { if (!seunMap[y]) seunMap[y] = GANJIS[(baseIdx + (y - 2024)) % 60]; });
    // 1단계: 원점수 계산 (WealthLineChart와 동일)
    const scored = TARGET_YEARS.map(y => {
      const gz = seunMap[y] ?? "";
      const sEl = STEM_EL[gz[0] ?? ""] ?? "";
      const bEl = BRANCH_EL[gz[1] ?? ""] ?? "";
      const sip1 = sEl ? toSip(ilEl, sEl) : "비겁";
      const sip2 = bEl ? toSip(ilEl, bEl) : "비겁";
      const s1 = SS[sip1] ?? 65;
      const s2 = SS[sip2] ?? 65;
      const score = Math.min(95, Math.max(40, Math.round(s1 * 0.6 + s2 * 0.4)));
      return { year: y, gz, score };
    });

    // 2단계: 각 연도의 추세 결정 (이전·다음 점수 비교)
    const trend = (i: number): string => {
      const prev = scored[i - 1]?.score;
      const cur  = scored[i].score;
      const next = scored[i + 1]?.score;
      const isPeak   = prev !== undefined && next !== undefined && cur > prev && cur >= next;
      const isTrough = prev !== undefined && next !== undefined && cur < prev && cur <= next;
      if (isPeak)   return "고점(이 시기가 가장 좋음)";
      if (isTrough) return "저점(이 시기가 가장 낮음)";
      if (prev !== undefined && cur > prev) return "상승 중";
      if (prev !== undefined && cur < prev) return "하락 중";
      return "유지";
    };

    // 3단계: 연속된 동일 추세 묶기
    type Group = { years: number[]; trend: string };
    const groups: Group[] = [];
    scored.forEach((d, i) => {
      const t = trend(i);
      const last = groups[groups.length - 1];
      if (last && last.trend === t) last.years.push(d.year);
      else groups.push({ years: [d.year], trend: t });
    });

    const rows = scored.map((d, i) => `  ${d.year}년(${d.gz}): 점수 ${d.score} → ${trend(i)}`);
    const groupRows = groups.map(g => {
      const label = g.years.length === 1 ? `${g.years[0]}년` : `${g.years[0]}~${g.years[g.years.length-1]}년`;
      return `  ${label}: ${g.trend}`;
    });

    wealthScoreBlock = `\n[연도별 재물운 추세 — 화면 꺾은선 차트와 동일한 계산. warningFlow의 각 시기 설명은 아래 추세와 반드시 일치해야 함]\n` +
      rows.join("\n") +
      `\n\n[구간별 추세 요약 — warningFlow items는 이 구간 단위로 작성]\n` +
      groupRows.join("\n") + "\n";
  }

  const honorificBlock = `\n\n[호칭 — 아래 형태만 그대로 사용, 절대 변형 금지]
의뢰인을 부를 때 반드시 아래 중 하나를 그대로 복사해 사용하오:
  "${firstName}님은"  "${firstName}님이"  "${firstName}님을"  "${firstName}님과"  "${firstName}님에게"  "${firstName}님으로"  "${firstName}님의"  "${firstName}님"

⚠️ 이름을 직접 조합하거나 추론하지 마오. 반드시 위 형태 중 하나를 그대로 쓰오.
⚠️ 계절 단어("봄" "여름" "가을" "겨울")는 고유 단어이오. 절대 변형 금지.`;

  const user = `아래는 ${honor}의 사주 명식입니다.
${pillarSipseong}
${deungTable}
${ohaengTable}
${siksangJaeFlow}
${jaemulScoreBlock}
${wealthScoreBlock}
${input.ilganChar ? `⚑ 일간(일주 천간): ${input.ilganChar}\n` : ""}${input.manseryeokText}${honorificBlock}
${input.birthYear ? `\n출생연도: ${input.birthYear}년 / 현재연도: ${currentYear}년` : `\n현재연도: ${currentYear}년`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
이번 장의 주제: ${theme}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[호칭 규칙] 풀이 텍스트(desc, summary, intro 등)에서 이 사람을 지칭할 때 반드시 "${honor}"을 사용하시오. "그대", "이 사람", "당신" 같은 익명 표현 대신 "${honor}"을 자연스럽게 섞어 쓰시오.
${guide ? `\n작성 지침:\n${guide}\n` : ""}
위 명식을 꼼꼼히 분석하여, 아래 JSON 스키마를 정확히 채워주시오.
반드시 유효한 JSON만 출력하시오. 코드펜스(\`\`\`)나 설명 문장은 절대 쓰지 마시오.

${schema}`;

  return { system: SYSTEM, user };
}
