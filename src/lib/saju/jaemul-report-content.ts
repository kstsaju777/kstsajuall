// =====================================================
// 재물사주 결과지 — 장별 풀이 프롬프트 & 구조
// =====================================================
// 정통사주(report-content.ts)와 독립적으로 관리합니다.
// 홍연 화자 SYSTEM은 report-prompts.ts에서 공유.

import { SYSTEM } from "./report-prompts";

// ── 장별 필수 섹션 키 ──
export const JAEMUL_CHAPTER_SECTIONS: Record<number, string[]> = {
  1: ["wonguk", "geokguk", "jaeseong"],
  2: ["wealthStyle"],
  3: ["wealthPresence", "investStyle"],
  4: ["careerWealth", "jobFit", "splitType"],
  5: ["wealthPeak", "moneyTrap", "warningFlow"],
  6: ["wealthCare", "wealthAvoid", "wealthSummary"],
  7: ["letter"],
};

// ── 장 완성 여부 확인 ──
export function isJaemulChapterReady(
  content: Record<string, unknown> | null | undefined,
  chapter: number
): boolean {
  if (!content) return false;
  const keys = JAEMUL_CHAPTER_SECTIONS[chapter] ?? [];
  return keys.every((k) => {
    const val = content[k];
    if (!val || typeof val !== "object") return false;
    const v = val as Record<string, unknown>;
    if ("modes" in v) return Array.isArray(v.modes) && (v.modes as unknown[]).length > 0;
    if ("score" in v && "reDesc" in v) return typeof v.score === "number" && typeof v.reDesc === "string" && (v.reDesc as string).length > 0;
    if ("paragraphs" in v) return Array.isArray(v.paragraphs) && (v.paragraphs as unknown[]).length > 0;
    if ("sinDesc" in v) return typeof v.sinDesc === "string" && (v.sinDesc as string).length > 0;
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
- sinDesc: 신강·신약 판단과 돈을 다루는 그릇의 크기. 3~4문장. (명식표 아래 표시됨)
- ohaengDesc: 오행 균형의 특징과 재물에 미치는 영향. 3~4문장. (오행 도넛 아래 표시됨)
- ilganDesc: 일간 오행과 타고난 기운이 재물에 미치는 의미. 3~4문장. (일간 카드 아래 표시됨)

[geokguk 섹션 — 격국]
이 사람의 격국(格局)을 판단하여 아래 형식으로 출력하오.
- name: 격국 이름 (예: "편인격", "정관격", "식신격", "재격" 등). 반드시 월지 기준으로 판단.
- keyword: 이 격이 가진 핵심 특성 키워드 2~3개를 "·"로 구분 (예: "직관·창의·독립").
- desc: 이 격국이 재물과 어떻게 연결되는지 2~3문장으로 설명. 홍연 화자로.

[jaeseong 섹션 — 재물성(재성) 체크]
이 사람의 사주 원국에서 재물성(재성)의 상태를 항목별로 점검하오.
items: 반드시 4개 항목. 각 항목:
- label: 체크 항목명 (예: "재성 존재", "재성 힘", "식상→재 흐름", "관성 보호")
- exists: true(있음/좋음) 또는 false(없음/약함)
- desc: 해당 항목의 상태를 한 줄로 설명 (구체적인 천간·지지·십성 언급).
summary: 위 4가지 점검 결과를 종합한 재물성 풀이. 3~4문장. 이 사람의 재물 구조의 강점·약점·종합 방향을 홍연 화자(~했소/~이오)로 풍부하게 서술. 단순 요약이 아니라 인물 중심 이야기처럼.`,

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
- summary: 재물 기질 종합 풀이 3~4문장. 이 사람이 돈과 어떻게 살아가야 하는지 방향 제시. 홍연 화자.`,

  3: `[wealthPresence 섹션 — 재성 강도 & 조건 분석]
- score: 이 명식의 재성(財星) 종합 강도 0~100 정수. 재성의 유무·위치·힘·생조 여부 종합 판단.
- reDesc: 재성의 유무·강약과 그 의미를 깊이 풀어쓴 풀이. 6~8문장. 위 [기둥별 십성] 목록에서 정재·편재에 해당하는 자리만 재성으로 언급할 것 — 상관·식신·인성·비겁·관성은 재성이 아니므로 재성이라고 부르거나 재성처럼 설명하면 절대 안 됨. ①재성이 어느 주(柱) 어느 자리에 있는지 (재성이 아예 없으면 "원국에 재성이 나타나고 있지는 않지만"으로 시작하여 재성 부재의 의미와 대신 재물을 만드는 구조를 설명) ②그 재성의 힘이 강하거나 약한 이유 — 생조·극제·합충 여부 구체적으로 ③일간과의 관계와 재물을 다루는 방식 ④재성이 놓인 주(柱)가 갖는 시기적 의미(년주=초년/조상, 월주=중년/직업, 일주=배우자/현재, 시주=말년/자녀) ⑤이 구조가 삶의 재물 흐름 전체에 주는 의미와 방향 순서로 풍부하게 서술. 홍연 화자. 호칭 사용.
- conditions: 4개 항목. 재물과 관련한 유리한 조건 2개(type:"good") + 조심할 조건 2개(type:"warn"). 각 { type, text: 구체적 한 줄 }.
- condDesc: 위 조건들을 종합한 풀이. 7문장. 어떤 환경·시기·방식에서 재물이 잘 흐르는지, 좋은 조건을 어떻게 살려야 하는지, 조심할 조건은 어떻게 대비해야 하는지를 풍부하게 서술. 홍연 화자. 호칭 사용.

[investStyle 섹션 — 투자 스타일]
types: 2~3개 투자 유형.
각 type: category(투자 유형명), icon(관련 이모지 1개), score(적합도 0~100 정수), products(구체적 투자상품 2~3개), tip(이 명식에 맞는 투자 풀이 3~4문장. 왜 이 투자 유형이 맞는지 십성·오행 근거 포함, 어떤 방식으로 접근해야 재물이 따르는지, 주의할 점은 무엇인지. 홍연 화자. 호칭 사용).`,

  4: `[careerWealth 섹션 — 천직 방향 분석]
- vocType: 이 명식의 천직 유형 이름. 2~4글자로 압축. (예: "전문가형", "창업선도형", "조직관리형", "예술창작형")
- vocKeywords: 천직 방향을 압축하는 키워드 3개. 각 2~4글자. (예: ["전문성", "독립성", "대인관계"])
- intro: 이 사람에게 돈이 따르는 일의 핵심 방향 한 줄. 어떤 십성·오행이 직업운을 만드는지 포함. (1문장, 홍연 화자)
- cards: 천직 방향 3가지 관점 카드. 각 card:
  - icon: 관련 이모지 1개 (💡 적성, 🏆 강점, ⚠️ 주의 등)
  - title: 짧은 소제목 (예: "타고난 적성", "돈이 따르는 환경", "피해야 할 방향")
  - desc: 해당 관점 설명 3~4문장. 구체적인 십성·오행 근거 포함. 이 명식에서 어떤 환경·분야에서 능력이 발휘되고 재물이 따르는지. 홍연 화자. 호칭 사용.
- summary: 천직과 재물 방향 종합 풀이 3~4문장. 어떤 일을 해야 재물이 따르고 어떤 태도로 임해야 하는지 방향 제시. 홍연 화자. 호칭 사용.

[jobFit 섹션 — 어울리는 직군]
clusters: 2~3개 직군 그룹.
각 cluster: category(직군 대분류명), keywords(해당 직군 특성 키워드 2~3개), jobs(구체적인 직업 3~5개), desc(이 직군이 왜 이 명식에 맞는지 3~4문장. 어떤 십성·오행 기운이 이 분야와 연결되는지, 어떤 환경에서 재물이 잘 따르는지, 주의할 점은 무엇인지 포함. 홍연 화자. 호칭 사용).

[splitType 섹션 — 직장인 vs 사업가]
leftLabel: "직장인형", left: (비율 정수 0~100),
rightLabel: "사업가형", right: (100-left 계산),
leftDesc: 직장인으로서 이 명식이 왜 유리한지 3~4문장. 어떤 십성·오행이 조직생활에 맞는지, 어떤 환경에서 능력이 발휘되는지, 재물이 어떻게 따르는지. 홍연 화자. 호칭 사용.
rightDesc: 사업가로서 이 명식이 왜 유리한지 3~4문장. 어떤 십성·오행이 독립·창업에 맞는지, 어떤 분야에서 두각을 나타내는지, 재물이 어떻게 따르는지. 홍연 화자. 호칭 사용.
leftTips: 직장인형 구체적 강점 2~3개 (각각 짧은 한 줄),
rightTips: 사업가형 구체적 강점 2~3개 (각각 짧은 한 줄).

`,

  5: `[wealthPeak 섹션 — 재물 황금기]
- peakTitle: 이 명식 황금기의 핵심 이름. 2~6글자. (예: "재성 절정기", "관인상생의 시절")
- peakWhen: 황금기가 오는 시기 (예: "30대 후반~40대 초반", "갑진 대운 시작 무렵")
- peakDesc: 황금기의 본질과 그 시기를 어떻게 준비해야 하는지 3~4문장. 어떤 대운·세운이 열리는지 구체적으로. 홍연 화자. 호칭 사용.
- phases: 재물 흐름 3단계. 각 phase: { label(시기 2~6글자, 예:"준비기·성장기·절정기"), tone("grow"|"peak"|"rest"), text(그 시기 재물 기운과 해야 할 일 한 줄) }
- action: 황금기를 잡기 위해 지금 당장 해야 할 핵심 행동 한 줄.

[moneyTrap 섹션 — 돈의 함정]
- trapType: 이 명식에서 가장 경계해야 할 함정 유형명. 2~4글자. (예: "과욕형", "충동형", "방심형", "의존형")
- intro: 이 사람이 재물에서 빠지기 쉬운 함정의 본질. 3~4문장. 어떤 십성·오행이 이런 함정을 만드는지 근거 포함. 홍연 화자. 호칭 사용.
- traps: 구체적인 함정 상황 3개. 각 trap:
  - icon: 관련 이모지 1개
  - title: 함정 상황 이름 (짧은 명사구, 예: "큰 수익에 눈이 멀 때", "주변의 달콤한 말에 흔들릴 때")
  - desc: 이 함정이 어떤 상황에서 어떻게 발생하고 어떤 피해를 주는지 2~3문장. 구체적 예시 포함. 홍연 화자.
  - counter: 이 함정을 피하는 핵심 대처법 한 줄.

[warningFlow 섹션 — 시기별 재물 흐름]
- summary: 이 명식의 향후 대운 흐름 전반적인 방향과 특징. 3~4문장. 어떤 대운이 어떻게 흐르는지, 언제가 기회고 언제가 위기인지 큰 그림. 홍연 화자. 호칭 사용.
- items: 위 [구간별 추세 요약]의 모든 구간을 빠짐없이 작성. 반드시 2033년까지 전부 커버할 것. 계산된 추세(상승 중·고점·하락 중·저점·유지)를 그대로 반영할 것.
  각 item: label(시기 예: "2024~2026"), trend(계산된 추세 그대로: "상승 중"|"고점"|"하락 중"|"저점"|"유지"), title(이 시기 재물 기운을 한 마디로. 추세와 일치하게. 예: 상승 중→"재물이 오르는 시기", 고점→"재물운의 정점", 하락 중→"숨고르기 시기", 저점→"조심해야 할 시기"), text(이 시기 재물 기운의 원인·흐름·해야 할 일을 2~3문장으로. 홍연 화자. 호칭 사용).
  ※ 대운 표현 주의: 대운은 보통 10년 단위 하나의 흐름이오. "A 대운과 B 대운이 결합"처럼 여러 대운을 합치는 표현은 쓰지 마시오. 해당 시기에 흐르는 대운 하나를 기준으로 서술할 것.`,

  6: `[wealthCare 섹션 — 재물 개운법]
- element: 보강해야 할 오행 이름 (반드시 "금", "목", "화", "토", "수" 중 하나만 출력)
- elementDesc: 이 명식에서 왜 이 오행이 부족하고 보강하면 어떤 변화가 오는지 2~3문장. 홍연 화자. 호칭 사용.
- tips: 재물 개운 실천법 5~6개. 각 tip:
  - icon: 관련 이모지 1개
  - category: 실천 분야 (예: "색상", "방향", "음식", "습관", "공간", "인간관계")
  - text: 구체적인 실천법 2~3문장. 무엇을 어떻게 해야 하는지, 왜 이 오행 보강에 도움이 되는지 포함. 막연하지 않고 실제로 행동 가능한 내용.

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
  - title: 짧은 소제목 (예: "타고난 강점", "조심할 점", "재물의 방향")
  - desc: 이 명식의 핵심을 담은 풀이 2~3문장. 결과지 전체 내용을 압축·통합. 홍연 화자. 호칭 사용.
- closing: 따뜻하고 힘이 되는 마무리 격려 한 문장. 홍연 화자. 호칭 사용.`,

  7: `[letter 섹션 — 홍연의 서신]
재물사주 풀이를 마치며 홍연이 독자에게 쓰는 따뜻한 손편지.
- paragraphs: 3~4개 단락. 각 단락 6~8문장.
- 이 사람의 재물 기운, 강점, 주의할 점을 따뜻하게 갈무리하되 희망적인 메시지로 맺으시오.
- 바로 본론으로 시작하여 따뜻한 마무리로 끝내시오.`,
};

// ── 장별 JSON 스키마 ──
const JAEMUL_CH_SCHEMA: Record<number, string> = {
  1: `{
  "wonguk": {
    "intro": "~한 사주로, 한 줄 요약 (1문장)",
    "sinDesc": "신강신약 판단과 그릇의 크기 (3~4문장)",
    "ohaengDesc": "오행 균형과 재물의 관계 (3~4문장)",
    "ilganDesc": "일간 오행과 재물 기운 (3~4문장)"
  },
  "geokguk": {
    "name": "격국명 (예: 편인격)",
    "keyword": "특성1·특성2·특성3",
    "desc": "이 격국과 재물의 연결 2~3문장"
  },
  "jaeseong": {
    "items": [
      { "label": "재성 존재", "exists": true, "desc": "구체적인 천간·지지 언급 한 줄" },
      { "label": "재성 힘", "exists": true, "desc": "재성 강약 상태 한 줄" },
      { "label": "식상→재 흐름", "exists": false, "desc": "식상 → 재성 연결 상태 한 줄" },
      { "label": "관성 보호", "exists": true, "desc": "관성의 재성 보호 여부 한 줄" }
    ],
    "summary": "4가지 점검 결과를 종합한 재물성 풀이 3~4문장"
  }
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
    "summary": "재물 기질 종합 풀이 3~4문장"
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
    "types": [
      { "category": "투자 유형명", "icon": "이모지", "score": 85, "products": ["상품1", "상품2"], "tip": "이 투자 유형이 왜 맞는지 + 접근 방식 + 주의할 점 3~4문장" }
    ]
  },
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
      { "category": "직군 대분류명", "keywords": ["특성1", "특성2"], "jobs": ["직업1", "직업2", "직업3"], "desc": "이 직군이 왜 맞는지 3~4문장 풀이" }
    ]
  },
  "splitType": {
    "leftLabel": "직장인형",
    "left": 40,
    "rightLabel": "사업가형",
    "right": 60,
    "leftDesc": "직장인으로서 왜 유리한지 3~4문장 풀이",
    "rightDesc": "사업가로서 왜 유리한지 3~4문장 풀이",
    "leftTips": ["직장인 강점1 한 줄", "직장인 강점2 한 줄"],
    "rightTips": ["사업가 강점1 한 줄", "사업가 강점2 한 줄"]
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
    "trapType": "함정 유형명 (예: 과욕형)",
    "intro": "이 명식의 재물 함정 본질 3~4문장",
    "traps": [
      { "icon": "⚡", "title": "함정 상황 이름", "desc": "함정 발생 상황과 피해 2~3문장", "counter": "대처법 한 줄" },
      { "icon": "🌀", "title": "함정 상황 이름", "desc": "함정 발생 상황과 피해 2~3문장", "counter": "대처법 한 줄" },
      { "icon": "🎭", "title": "함정 상황 이름", "desc": "함정 발생 상황과 피해 2~3문장", "counter": "대처법 한 줄" }
    ]
  },
  "warningFlow": {
    "summary": "향후 대운 흐름 전반적 방향 3~4문장",
    "items": [
      { "label": "2024~2026", "trend": "상승 중", "title": "재물이 오르는 시기", "text": "이 시기 재물 기운·원인·해야 할 일 2~3문장" },
      { "label": "2027년", "trend": "고점", "title": "재물운의 정점", "text": "이 시기 재물 기운·원인·해야 할 일 2~3문장" },
      { "label": "2028~2030", "trend": "하락 중", "title": "숨고르기 시기", "text": "이 시기 재물 기운·원인·해야 할 일 2~3문장" },
      { "label": "2031년", "trend": "저점", "title": "조심해야 할 시기", "text": "이 시기 재물 기운·원인·해야 할 일 2~3문장" },
      { "label": "2032~2033", "trend": "상승 중", "title": "재물이 다시 오르는 시기", "text": "이 시기 재물 기운·원인·해야 할 일 2~3문장" }
    ]
  }
}`,
  6: `{
  "wealthCare": {
    "element": "금",
    "elementDesc": "이 오행이 부족한 이유와 보강 효과 2~3문장",
    "tips": [
      { "icon": "🎨", "category": "색상", "text": "구체적인 실천법 2~3문장" },
      { "icon": "🧭", "category": "방향", "text": "구체적인 실천법 2~3문장" },
      { "icon": "🥗", "category": "음식", "text": "구체적인 실천법 2~3문장" },
      { "icon": "📅", "category": "습관", "text": "구체적인 실천법 2~3문장" },
      { "icon": "🏠", "category": "공간", "text": "구체적인 실천법 2~3문장" }
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
    "coreMessage": "재물 인생 핵심 메시지 한 문장",
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
    "paragraphs": ["단락1 (6~8문장, 각 단락 최소 150자 이상)", "단락2 (6~8문장, 각 단락 최소 150자 이상)", "단락3 (6~8문장, 각 단락 최소 150자 이상)", "단락4 (6~8문장, 따뜻한 마무리, 최소 150자 이상)"]
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
  }
): { system: string; user: string } {
  const theme = JAEMUL_CH_THEME[chapter] ?? `[제${chapter}장]`;
  const guide = JAEMUL_CH_GUIDE[chapter] ?? "";
  const schema = JAEMUL_CH_SCHEMA[chapter] ?? "{}";
  const honor = input.name
    ? input.gender === "male" ? `${input.name}군` : `${input.name}양`
    : "그대";
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

  const pillarSipseong = input.pillars && input.pillars.length > 0
    ? `\n[기둥별 십성 — 반드시 이 목록만 참고할 것. 임의로 십성을 계산하거나 추정하지 말 것]\n` +
      input.pillars.map(p => `  ${p.pos}: 천간 ${p.gan}(${p.sipTop}) / 지지 ${p.ji}(${p.sipBot})`).join("\n") +
      `\n  ※ 재성(정재·편재) 위치: ${jaeSungPositions || "없음"} — 이 외의 자리에 재성이 있다고 절대 쓰지 말 것`
    : "";

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

  const user = `아래는 ${honor}의 사주 명식입니다.
${pillarSipseong}
${wealthScoreBlock}
${input.manseryeokText}
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
