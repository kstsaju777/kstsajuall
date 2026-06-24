// =====================================================
// 문학형 결과지 구조화 콘텐츠 (Chapter 1)
// =====================================================
// LLM이 명식(만세력 텍스트) 기반으로 아래 JSON 구조를 채운다.
// report-preview 의 문학형 섹션이 이 데이터로 렌더된다(결제자별 실제 풀이).
//
// 차트 수치/대운 간지는 실제 명식 데이터에서 오고, LLM은 "문장(prose)"과
// 각 시기의 작용 설명만 생성한다.
//
// ※ 풀이 프롬프트(말투·주제·지시문)는 ./report-prompts.ts 에서 관리합니다.

import { SYSTEM, CH_THEME, CH_GUIDE } from "./report-prompts";

export type ReportSection = {
  intro: string;        // 도입 문단
  callout: string;      // 강조 박스 (핵심 사주 용어 1~2개 포함)
  paragraphs: string[]; // 본문 문단 2~4개
};

export type ReportFlowItem = {
  label: string;        // 시기 (예: "20대 중반")
  tone: "warn" | "good";
  text: string;         // 그 시기의 운 작용 설명 (한 줄)
};

export type ReportSummaryItem = { title: string; desc: string };
export type ReportRarity = ReportSection & { grade: string; percentile: number };
export type ReportSpecial = { tags: { label: string; sub: string }[]; items: { text: string; hi: string }[] };

export type ReportContent = {
  // ── 1장: 지나온 시간과 선택들 ──
  hardSeason: ReportSection;                 // 힘들 수밖에 없던 시기
  cause: ReportSection & { flow: ReportFlowItem[] }; // 사주 속 원인 + 운흐름 타임라인
  pattern: ReportSection & { summary: ReportSummaryItem[] }; // 반복된 패턴 + 요약
  // ── 2장: 나는 어떤 사람일까 (타고난 본바탕) ──
  wonguk: ReportSection;    // 사주 원국 한눈에 보기
  ohaeng: ReportSection;    // 오행 균형
  chonyeongi: { paragraphs: string[] }; // 초년기(년주) 풀이
  cheongneongi: { paragraphs: string[] }; // 청년기(월주) 풀이
  jungnyeongi: { paragraphs: string[] };  // 중년기(일주) 풀이
  nonyeongi: { paragraphs: string[] };    // 노년기(시주) 풀이 — 시간 모름이면 빈 배열
  ability: { paragraphs: string[] };      // 타고난 능력치 풀이
  sipseong: ReportSection;  // 십성으로 보는 타고난 역할
  unseong: ReportSection;   // 십이운성으로 보는 기운의 세기
  sinsalReading: { paragraphs: string[] }; // 신살 풀이
  pyori: ReportSection;     // 밖에서 보는 나와 실제의 나
  // ── 3장: 나는 왜 이런 사람인 걸까 (사주 속 필연구조) ──
  strength: ReportSection;  // 신강·신약
  gyeokguk: ReportSection & { gyeokgukName: string; gyeokgukKeywords: string[] }; // 격국
  yongsin: ReportSection & { yongsinEl: string; heusinEl: string; gisinEl: string; yongsinReason: string; heusinReason: string; gisinReason: string }; // 용신 (오행 포함)
  hapchung: ReportSection;  // 합·충
  essence: ReportSection;   // 그래서, 내가 진짜 원하는 것
  // ── 4장: 내 사주는 얼마나 희귀할까 ──
  rarity: ReportRarity;     // 발현 확률(등급/백분율 포함)
  special: ReportSpecial;   // 이 사주가 드문 이유(태그 + 강조문단)
  // ── 5장: 세상을 대하는 나만의 방식 ──
  ohaengDesc: ReportSection; // 오행 분포 풀이
  balance: ReportSection & { spectrum: { label: string; value: number } }; // 독립↔협력 균형(0=독립, 100=협력)
  answer: ReportSection & { mbtiType?: string }; // MBTI 유형 + 풀이
  // ── 6장: 앞으로 10년, 어떻게 흘러갈까 ──
  daeFlow: ReportSection;   // 대운으로 보는 10년의 큰 흐름
  seun: ReportSection & { flow: { year: number; score: number }[] }; // 세운(해마다) + 10년 운세 라인
  openLuck: ReportSection & { peak: { title: string; when: string; todo: string } }; // 운이 풀리는 결정적 시점
  domains: { intro: string; paragraphs: string[]; bars: { label: string; value: number }[] }; // 영역별 운세 강도
  // ── 7장: 재물·직업운 정밀풀이 ──
  wealthTime: ReportSection & { bars: { year: number; amount: string; value: number }[] }; // 향후 5년 재물운(연도/금액/상대크기)
  jobFit: ReportSection & { clusters: { category: string; keywords: string[]; jobs: string[]; rankReason?: string; topJobReason?: string }[] };
  jobType: ReportSection & { split: { leftLabel: string; left: number; rightLabel: string; right: number; leftDesc: string; rightDesc: string } }; // 직장인 vs 사업가
  invest: ReportSection; // 내게 잘 맞는 투자 방법
  // ── 8장: 연애·결혼운 정밀풀이 ──
  loveStyle: ReportSection; // 내가 사랑하는 방식
  loveFlow: ReportSection & { flow: { label: string; score: number }[]; peakCallout: string }; // 시기별 연애 흐름(월별)
  spouse: { // 이런 사람이 배우자로 와요
    intro: string; callout: string; paragraphs: string[];
    card: { gender: string; ageBand: string; desc: string; mbti: string; height: string; personality: string; jobField: string; tags: string[] };
  };
  marriage: ReportSection; // 오래가는 궁합의 비결
  // ── 9장: 건강운 정밀풀이 ──
  bodyWeak: ReportSection & { bars: { label: string; value: number }[] }; // 타고난 약한 부위 + 부위별 주의 신호
  riskTime: ReportSection; // 조심해야 할 시기와 사고수
  healthCare: ReportSection & { element: string; tips: { label: string; title: string; desc: string }[] }; // 오행에 따른 건강관리
  // ── 10장: 나를 도와줄 귀인은 누구일까 ──
  helper: { // 귀인은 어떤 사람일까
    intro: string; callout: string; paragraphs: string[];
    card: { gender: string; ageBand: string; desc: string; mbti: string; height: string; personality: string; jobField: string; tags: string[] };
  };
  helperTime: ReportSection; // 귀인은 언제 올까
  helperUse: ReportSection;  // 그 인연을 어떻게 활용할지
  // ── 11장: 반드시 조심해야 할 시기는 언제일까 ──
  samjae: ReportSection & { // 가장 거친 3년, 삼재
    trap: { title: string; desc: string; items: { title: string; desc: string }[] }; // 조심할 시기의 함정
    yearly: { year: string; phase: string; action: string }[]; // 삼재 연차별 주의점
    guide: string[]; // 해마다 이렇게 보내요(문단)
  };
  samjaeFocus: ReportSection; // 그때 조심할 것: 변동·관계·건강
  // ── 12장: 반드시 조심해야 할 악인은 누구일까 ──
  villain: { // 나를 흔드는 사람은 이렇게 온다
    intro: string; callout: string; paragraphs: string[];
    card: { gender: string; ageBand: string; desc: string; mbti: string; height: string; personality: string; jobField: string; tags: string[] };
  };
  loss: ReportSection; // 그때 무엇을 잃을 수 있는지
  // ── 13장: 핵심 정리 ──
  sumEssence: ReportSection;  // 본질, 타고난 본바탕
  sumTime: ReportSection;     // 시기, 지금 흐르는 운의 때
  sumRelation: ReportSection; // 관계, 기운끼리의 충과 합
  // ── 14장: 지금부터 해야 할 일들 ──
  openMethod: ReportSection & { element: string; tips: { label: string; title: string; desc: string }[] }; // 나만의 개운법
  tomorrow: { intro: string; paragraphs: string[] }; // 내일의 할 일
  weekFlow: ReportSection & { days: { top: string; label: string; status: string }[] }; // 이번 주 일진
  monthFlow: ReportSection & { months: { top: string; label: string; status: string }[] }; // 향후 3개월
  // ── 15장: 흔들리지 않는 법에 대하여 ──
  simju: ReportSection & { heart: { label: string; gan: string; ji: string } }; // 흔들림 없는 마음의 기둥(심주)
  shake: ReportSection;  // 무엇이 나의 심주를 흔드는가
  forge: ReportSection;  // 심주를 단단히 세우는 법
  // ── 마무리: 단하의 편지 ──
  letter: { paragraphs: string[] }; // 상담가 '단하'가 쓰는 개인화 편지
};

// 장 ↔ 포함 섹션 (장별 온디맨드 생성/완료 판정용)
export const CHAPTER_SECTIONS: Record<number, string[]> = {
  1: ["wonguk", "ohaeng", "chonyeongi", "cheongneongi", "jungnyeongi", "nonyeongi", "ability", "sipseong", "unseong", "sinsalReading", "pyori"],     // 제1장 환경
  2: ["strength", "gyeokguk", "yongsin", "hapchung", "essence"], // 제2장 운명
  3: ["ohaengDesc", "balance", "answer"],                       // 제3장 관계
  4: ["rarity", "special"],                                     // 제4장 특징
  5: ["wealthTime", "jobFit", "jobType", "invest"],             // 제5장 재물
  6: ["loveStyle", "loveFlow", "spouse", "marriage"],           // 제6장 사랑
  7: ["bodyWeak", "riskTime", "healthCare"],                    // 제7장 건강
  8: ["helper", "helperTime", "helperUse"],                     // 제8장 귀인
  9: ["villain", "loss"],                                       // 제9장 악인
  10: ["hardSeason", "cause", "pattern"],                       // 제10장 굴곡
  11: ["daeFlow", "seun", "openLuck", "domains"],               // 제11장 흐름
  12: ["samjae", "samjaeFocus"],                                // 제12장 주의
  13: ["sumEssence", "sumTime", "sumRelation"],                 // 제13장 당부
  14: ["openMethod", "tomorrow", "weekFlow", "monthFlow"],      // 제14장 개운
  15: ["simju", "shake", "forge"],                              // 제15장 중심
  16: ["letter"],                                               // 마무리
};

// 해당 장의 콘텐츠가 이미 생성됐는지 (모든 섹션 키 확인, paragraphs 빈 배열도 미완성)
export function isChapterReady(content: Record<string, unknown> | null | undefined, chapter: number): boolean {
  if (!content) return false;
  const keys = CHAPTER_SECTIONS[chapter];
  if (!keys?.length) return false;
  return keys.every((k) => {
    const v = content[k];
    if (v == null) return false;
    if (typeof v === "object" && v !== null && "paragraphs" in v) {
      return ((v as { paragraphs: unknown[] }).paragraphs?.length ?? 0) > 0;
    }
    return true;
  });
}

export type ReportPromptInput = {
  name: string;
  gender: "male" | "female";
  manseryeokText: string; // formatSajuToManseryeok 결과 (16종 풀 명식)
  pillars?: { pos: string; gan: string; ganEl: string; ji: string; jiEl: string; sipTop: string; sipBot: string; sinsal?: string }[];
  birthYear?: number; // 생년 (나이 기반 시제 판단용)
};

// 장별 JSON 스키마 (출력 필드 구조 — 화면 렌더와 1:1). 톤/주제/지시는 report-prompts.ts 참고.
const CH_SCHEMA: Record<number, string> = {
  10: `{
  "hardSeason": { "intro": "유독 힘들었던 시기 도입 1~2문장", "callout": "특정 대운/시기를 짚는 핵심 문장(사주 용어 포함)", "paragraphs": ["문단","문단","문단"] },
  "cause": { "intro": "왜 힘들었는지 도입", "callout": "월지/일간 등 원국 구조로 원인을 짚는 문장", "paragraphs": ["문단","문단","문단"],
    "flow": [ {"label":"20대 중반","tone":"warn","text":"그 시기 운 작용 한 줄"}, {"label":"현재","tone":"good","text":"한 줄"} ] },
  "pattern": { "intro": "반복 패턴 도입", "callout": "반복 패턴 핵심 문장", "paragraphs": ["문단","문단"],
    "summary": [ {"title":"핵심 키워드","desc":"한 줄 설명"} ] }
}`,
  1: `{
  "wonguk": {
    "intro": "【필수 규칙 — 반드시 순서대로 따를 것】\nSTEP 1. 명식에서 월주(月柱)의 지지(地支) 글자, 즉 '월지(月支)' 글자를 먼저 확인하오. 이 글자 하나가 태어난 계절과 기후를 결정하오.\n월지 글자별 계절·기후 대응표 (이 표만 사용하고 임의 추론 금지):\n子=한겨울 칼바람 / 亥=초겨울 냉기 / 丑=겨울 끝 습한 냉기 / 寅=이른 봄 온기 시작 / 卯=봄 한창 생동감 / 辰=봄 끝 습한 기운 / 巳=초여름 더위 / 午=한여름 뜨거운 炎熱 / 未=여름 끝 건조한 더위 / 申=초가을 서늘한 금기운 / 酉=가을 한창 청량함 / 戌=가을 끝 건조한 기운\nSTEP 2. 위 표에서 확인한 계절·기후를 그대로 사용하여, 첫 문장을 반드시 다음 형식으로 시작하오: '[계절·기후 묘사]의 기운 속에서 태어난 [이름]은 [자연물 이미지]와 같은 기운을 타고났소.'\n예시(월지=子, 일간=甲木): '차가운 한겨울 냉수의 기운 속에서 태어난 [이름]은 얼어붙은 대지 위로 홀로 꼿꼿하게 일어선 푸른 나무와 같은 기운을 타고났소.'\nSTEP 3. 이어서 일간 오행·계절 기운을 자연물 이미지로 시각화하는 2~3문장을 추가하오. 반드시 홍연 말투(~이오/~하오/~했소/~겠소)로 작성하오.",
    "callout": "겉으로 드러나는 천간 인상과 지지에 숨겨진 내면 본성의 핵심 대비 한 문장. 홍연 말투(~이오/~하오/~했소)로 작성.",
    "paragraphs": [
      "신강/신약 판단 → 타고난 생명력·추진력·자생력을 위 intro와 이어지는 자연 이미지로 이어 묘사. 지배적 십성(비겁·식상 등)의 장점과 과할 때 그림자 → 용신·희신·기신 구체 언급 → 격국 이름과 특성. 반드시 홍연 말투(~이오/~하오/~했소/~겠소)로 4~5문장 작성.",
      "천간 십성 기반 겉모습(표현·행동 방식) → 지지 십성 기반 내면(감추어진 욕구·경계심) → 두 얼굴의 온도 차이와 대인관계 패턴·주의점. 반드시 홍연 말투(~이오/~하오/~했소/~겠소)로 4~5문장 작성."
    ]
  },
  "ohaeng": { "intro": "어떤 기운이 강한지 도입", "callout": "가장 강한 오행과 의미", "paragraphs": ["성격에 주는 영향","약한 오행 보완점","조언"] },
  "chonyeongi": {
    "paragraphs": [
      "【초년기 풀이 — 년주(年柱) 기반, 필수 규칙】⓪ 위에 제공된 [기둥별 십성 확인표]에서 년주 항목의 천간 십성과 지지 십성 값을 그대로 가져오오. 절대 추론하거나 임의로 변경하지 마오. 확인표에 없는 십성은 언급 자체를 금지하오. ① 십성을 언급할 때는 반드시 [기둥별 십성 확인표]에서 확인한 년주 천간 글자명+십성, 지지 글자명+십성을 함께 붙여서 말하오. ② 드러난 십성(년주 천간 십성·지지 십성)만을 해석하며, 명식에 없는 십성은 언급하지 마오. ③ 육친으로 보면 년주는 조부모를 나타내오. 아래 [십성별 의미 가이드]를 반드시 참고하여, 년주 천간 십성과 지지 십성 각각의 의미를 초년기 풀이에 녹여내오.

[년주 천간 십성별 의미 가이드 — 조부(조상)의 인연·태어난 환경]
비견=조상으로부터 독립적 성향 물려받음·경쟁 많은 초년·형제자매 친구 중요 / 겁재=경쟁적 상황 많음·나눔·희생 강요받았을 가능성·자립성 강해짐 / 식신=조화롭고 안정적 가정환경·성실하고 차분한 성격 형성·조상 인연 긍정적 / 상관=창의적·자유로운 환경·규칙보다 자유 추구·부모와 갈등 가능 / 편재=초년 변화 많거나 물질적 불안정·부모가 대담하고 외향적 / 정재=안정적 가정환경·책임감과 성실함을 부모로부터 배움 / 편관=부모가 강인하고 독립적·도전과 변화 많은 환경 / 정관=규칙·질서 중시 환경·전통적이고 책임감 있는 부모 / 편인=부모가 독특하고 창의적·다양한 시도 경험·고립감 가능 / 정인=부모 도움 많이 받음·학문적이고 안정된 환경·부모와 조화로운 관계

[년주 지지 십성별 의미 가이드 — 조모(조상)의 인연·성장 환경]
비견=형제자매·친구로부터 큰 영향·독립적으로 각자의 길 추구 / 겁재=또래와 갈등·경쟁 많음·그 과정에서 성장 / 식신=안정적이고 평화로운 가정·부모 도움으로 안정적 초년 / 상관=독특하고 창의적 성향·자유로운 사고·반항적 성향 가능 / 편재=어릴때부터 재물 경험·부모 지원 가능·변동성 강함 / 정재=조상으로부터 물질적 지원 가능·실속있고 안정적 환경 / 편관=독립적이고 변동성 강한 환경·부모와 갈등·긴장 가능 / 정관=안정적이고 체계적 교육·부모에 대한 존경심 형성 / 편인=독립적이고 창의적 환경·부모와의 관계 복잡하거나 특이함 / 정인=안정적이고 현실적인 부모·초년기에 보호받는 느낌 ④ 년주 천간 오행과 지지 오행 사이의 관계를 아래 표에서 정확히 확인하오. [상극표: 목극토 / 토극수 / 수극화 / 화극금 / 금극목] [상생표: 목생화 / 화생토 / 토생금 / 금생수 / 수생목] [비화: 같은 오행끼리] — 이 표에 없는 조합은 상극이 아니오. 상극이 맞는 경우에만 그 긴장이 초년기에 어떤 갈등이나 부침으로 작용했는지 첨언하오. 상생이면 그 기운이 서로 도왔다고 서술하오. 비화이면 기운이 강하게 모였다고 서술하오. ⑤ 위 [섹션별 시제 지시]에서 chonyeongi에 지정된 시제로만 모든 문장을 작성하오. 다른 시제를 섞지 마오. ⑥ 첫 문장은 반드시 '초년기에는'으로 시작하오. '이번 초년기에는', '그대의 초년기에는' 등 다른 표현은 절대 금지하오. ⑦ 좋은 면과 좋지 않은 면을 반드시 모두 담으오. 좋은 점만 나열하거나 좋지 않은 면을 희석하여 얼버무리지 마오. 반드시 홍연 말투로 300자(공백 포함) 내외로 작성하오."
    ]
  },
  "cheongneongi": {
    "paragraphs": [
      "【청년기 풀이 — 월주(月柱) 기반, 필수 규칙】⓪ 위에 제공된 [기둥별 십성 확인표]에서 월주 항목의 천간 십성과 지지 십성 값을 그대로 가져오오. 절대 추론하거나 임의로 변경하지 마오. 확인표에 없는 십성은 언급 자체를 금지하오. ① 십성을 언급할 때는 반드시 [기둥별 십성 확인표]에서 확인한 월주 천간 글자명+십성, 지지 글자명+십성을 함께 붙여서 말하오. ② 드러난 십성(월주 천간 십성·지지 십성)만을 해석하며, 명식에 없는 십성은 언급하지 마오. ③ 육친으로 보면 월주는 부모를 나타내오. 아래 [십성별 의미 가이드]를 반드시 참고하여, 월주 천간 십성과 지지 십성 각각의 의미를 청년기 풀이에 녹여내오.

[월주 천간 십성별 의미 가이드 — 부친·사회활동·직업]
비견=동등한 입장과 경쟁 많음·직업적 독립성 강함·자기주장 강한 부모 관계 / 겁재=재물 나눔·소모 경험·직업적 과감한 도전·부모와 자율적·독립적 관계 / 식신=직업에서 안정적이고 조화로운 성과·타인과 협력·부모와 원만한 관계 / 상관=창의적·독립적·틀을 깨는 아이디어·직업에서 새로운 방식 추구 / 편재=재물 흐름 크고 변동성 있음·직업적으로 활발하고 대담·부모와 자유로운 관계 / 정재=재물관리 능력 뛰어남·성실하고 안정적 직업 기반·책임감 있는 부모 관계 / 편관=직업 변동 많고 도전적·새로운 시도 즐김·자신의 방식 고수 / 정관=안정적이고 책임감 있는 직업 태도·전통·규범 중시·부모와 조화로운 관계 / 편인=창의적·독립적 성향·직업 변동 많음·부모와 독특한 관계 방식 / 정인=학문적·지적 직업 태도·사회적 신뢰·부모에게 존경받음

[월주 지지 십성별 의미 가이드 — 모친·사회활동·직업]
비견=사회 교류 활발·협력보다 경쟁 강함·동료와 끊임없는 경쟁 / 겁재=과도한 사회 경쟁·강한 추진력과 대담한 도전·재물 관리 주의 / 식신=사회적 안정 기반·직업에서 지속적 성과·주변과 조화롭고 평화로운 관계 / 상관=독창적이고 도전적·예술적·창의적 직업 적합·지나친 자유로움으로 갈등 가능 / 편재=재물운 큰 기회·변동성 강해 관리 필요·사교적이고 외향적 활동 적합 / 정재=안정적 재물운·직업에서 성실·가족을 위한 책임감 강조 / 편관=강한 추진력과 리더십·도전적·지나친 독단 주의 / 정관=안정적 직업으로 사회 신뢰·책임감·상사·부모와 조화·규범 준수 / 편인=독립적·창의적·지적 직업에서 두각·지나친 고립 주의 / 정인=학문적·지적 활동 강함·부모와 안정적·조화로운 관계·직업적 신뢰 높음 ④ 월주 천간 오행과 지지 오행 사이의 관계를 아래 표에서 정확히 확인하오. [상극표: 목극토 / 토극수 / 수극화 / 화극금 / 금극목] [상생표: 목생화 / 화생토 / 토생금 / 금생수 / 수생목] [비화: 같은 오행끼리] — 이 표에 없는 조합은 상극이 아니오. 상극이 맞는 경우에만 그 긴장이 청년기에 어떤 갈등이나 부침으로 작용했는지 첨언하오. 상생이면 그 기운이 서로 도왔다고 서술하오. 비화이면 기운이 강하게 모였다고 서술하오. ⑤ 위 [섹션별 시제 지시]에서 cheongneongi에 지정된 시제로만 모든 문장을 작성하오. 다른 시제를 섞지 마오. 두 십성이 함께 만들어내는 청년기 전체 분위기를 통합하여 서술하오. ⑥ 월주는 사회생활에서의 나의 모습을 나타내므로, 월주 십성과 오행을 근거로 직장인(조직 생활)이 어울리는 사주인지 사업·독립이 어울리는 사주인지 명확히 언급하오. ⑦ 좋은 면과 좋지 않은 면을 반드시 모두 담으오. 좋은 점만 나열하거나 좋지 않은 면을 희석하여 얼버무리지 마오. 반드시 홍연 말투(~이오/~하오/~했소/~겠소)로 300자(공백 포함) 내외로 작성하오."
    ]
  },
  "jungnyeongi": {
    "paragraphs": [
      "【중년기 풀이 — 일주(日柱) 기반, 필수 규칙】⓪ 위에 제공된 [기둥별 십성 확인표]에서 일주 항목의 천간 십성과 지지 십성 값을 그대로 가져오오. 절대 추론하거나 임의로 변경하지 마오. 확인표에 없는 십성은 언급 자체를 금지하오. ① 십성을 언급할 때는 반드시 '[기둥별 십성 확인표]에서 확인한 일주 천간 글자명+오행'과 '일지 글자명+십성'을 함께 붙여서 말하오. 예시 형식: '일주 천간이 [글자]이고, 일주 지지가 [글자] [십성]이오.' ② 드러난 십성(일주 천간의 오행 본질·일지 십성)만을 해석하며, 명식에 없는 십성은 언급하지 마오. ③ 육친으로 보면 일주는 나 자신과 배우자를 나타내오. 일간의 오행·음양 본질이 나라는 사람의 중년기 삶의 방식을 결정하고, 아래 [십성별 의미 가이드]를 반드시 참고하여 일지 십성이 배우자와의 관계·결혼생활·내면 심리에 어떤 영향을 미치는지 구체적으로 풀이하오. 아울러 사회적 역할 완성, 직업 전성기 혹은 전환점, 내면의 성숙도 함께 서술하오.

[일주 지지 십성별 의미 가이드 — 배우자궁·결혼생활·내면심리]
비견=배우자와 대등하고 평등한 관계·서로 의견 존중·협력 기반·경쟁적 의견충돌 가능 / 겁재=경쟁적이고 도전적인 기운·배우자 활발하고 적극적·활기차고 역동적·지나친 갈등·간섭 가능 / 식신=안정적이고 평화로운 기운·배우자 온화하고 가정적·안정 중시하나 변화 두려워할 수 있음 / 상관=자유로운 분위기 선호·배우자 창의적이고 개성 강함·전통 결혼관 탈피·지나친 자유 추구 시 불안정 / 편재=활발하고 다채로운 관계·배우자 외향적이고 매력적·활기찬 결혼생활·지나친 외향성으로 갈등 가능 / 정재=안정적이고 현실적·배우자 성실하고 책임감 강함·신뢰 기반 결혼생활·낭만 부족할 수 있음 / 편관=강렬하고 도전적인 기운·배우자 강인하고 독립적·열정적이고 다이나믹·갈등·긴장 가능 / 정관=안정적이고 전통적 가치·배우자 신뢰할 수 있고 책임감·믿음직한 결혼생활·틀에 박힌 삶 가능 / 편인=독창적이고 독립적·배우자 창의적이고 독특·개성 넘치는 결혼생활·감정적 예민함·고립 가능 / 정인=안정적이고 배려심 강함·배우자 가정적이고 보호적·따뜻하고 조화로운 결혼생활·지나친 의존·희생 가능 ④ 일주 천간 오행과 지지 오행 사이의 관계를 아래 표에서 정확히 확인하오. [상극표: 목극토 / 토극수 / 수극화 / 화극금 / 금극목] [상생표: 목생화 / 화생토 / 토생금 / 금생수 / 수생목] [비화: 같은 오행끼리] — 이 표에 없는 조합은 상극이 아니오. 상극이 맞는 경우에만 그 긴장이 중년기에 어떤 갈등이나 삶의 전환으로 작용했는지 첨언하오. 상생이면 그 기운이 서로 도왔다고 서술하오. 비화이면 기운이 강하게 모였다고 서술하오. ⑤ 위 [섹션별 시제 지시]에서 jungnyeongi에 지정된 시제로만 모든 문장을 작성하오. 다른 시제를 섞지 마오. 두 기운이 함께 만들어내는 중년기 전체 분위기를 통합하여 서술하오. ⑥ 좋은 면과 좋지 않은 면을 반드시 모두 담으오. 좋은 점만 나열하거나 좋지 않은 면을 희석하여 얼버무리지 마오. 반드시 홍연 말투(~이오/~하오/~했소/~겠소)로 300자(공백 포함) 내외로 작성하오."
    ]
  },
  "nonyeongi": {
    "paragraphs": [
      "【말년기 풀이 — 시주(時柱) 기반, 필수 규칙】⓪ 위에 제공된 [기둥별 십성 확인표]에서 시주 항목의 천간 십성과 지지 십성 값을 그대로 가져오오. 절대 추론하거나 임의로 변경하지 마오. 확인표에 없는 십성은 언급 자체를 금지하오. ① 십성을 언급할 때는 반드시 [기둥별 십성 확인표]에서 확인한 시주 천간 글자명+십성, 지지 글자명+십성을 함께 붙여서 말하오. ② 드러난 십성(시주 천간 십성·지지 십성)만을 해석하며, 명식에 없는 십성은 언급하지 마오. ③ 육친으로 보면 시주는 자녀를 나타내오. 아래 [십성별 의미 가이드]를 반드시 참고하여, 시주 천간 십성과 지지 십성 각각의 의미를 말년기 풀이에 녹여내오. 아울러 노후 재물·건강, 인생의 결실과 마무리도 함께 서술하오.

[시주 천간 십성별 의미 가이드 — 말년·자녀(아들)]
비견=자식 도움보다 자기의지로 삶 꾸림·말년에도 독립적·자신만의 방식 고수 / 겁재=말년에 재물 나눔·희생 발생·책임감 과중·자녀와 재물·책임 갈등 가능·소통 중요 / 식신=안정적이고 평화로운 말년·자식과 원만하고 조화로운 관계·자녀에게 풍요 제공 / 상관=도전적이고 창의적인 말년·틀을 깨는 일 많음·자녀 독립적이고 반항적 가능 / 편재=말년에 큰 재물 기회·외부 재물 활용·자녀에게 대담하고 관대한 태도 / 정재=말년에도 꾸준하고 안정적 재물·자녀에게 경제적 도움 가능한 위치 / 편관=말년에 변동 많고 도전적 삶·자녀와의 관계도 독립적이고 강렬 / 정관=안정적 사회적 지위 유지·자녀와 조화로운 관계·규칙적이고 책임감 있는 모습 / 편인=창의적이고 독특한 말년·직관적·독립적·다소 고독해질 가능성 / 정인=안정감 있고 조화로운 말년·자녀·후손에게 존경받는 위치·학문적이고 지혜로운 태도

[시주 지지 십성별 의미 가이드 — 말년·자녀(딸)]
비견=말년에 동료·형제자매·친구와 교류 활발·인간관계에서 도움받음·자녀에게서 협력과 도움 가능 / 겁재=자녀에게서 도움 받으나 감정적 갈등 가능·말년에 도전적 행동으로 인생 전환점 만들기도 함 / 식신=자식이 안정적이고 평화롭게 자리잡음·평화롭고 성실한 말년·자녀가 창의적 / 상관=자식 개성 강하고 독립적·말년에 갈등 상황 가능·조화를 신경써야 함 / 편재=자식 활발하고 사교적·재물 변동 많아 안정보다 변화 추구 성향 / 정재=자식 성실하고 안정적·재물관리 신중하게 해야 하는 경향 / 편관=자식 독립적이고 자기주장 강함·갈등·변동 유발 가능성 / 정관=자식 전통적이고 안정적 성향·너무 틀에 박히지 않도록 균형 필요 / 편인=자식 독창적이고 자유로운 성향·감정적 갈등 발생 여지 있음 / 정인=자식 안정적이고 현실적·부모에게 도움이 되는 역할 가능성 ④ 시주 천간 오행과 지지 오행 사이의 관계를 아래 표에서 정확히 확인하오. [상극표: 목극토 / 토극수 / 수극화 / 화극금 / 금극목] [상생표: 목생화 / 화생토 / 토생금 / 금생수 / 수생목] [비화: 같은 오행끼리] — 이 표에 없는 조합은 상극이 아니오. 상극이 맞는 경우에만 그 긴장이 말년기에 어떤 갈등이나 마무리의 과제로 작용하는지 첨언하오. 상생이면 그 기운이 서로 도왔다고 서술하오. 비화이면 기운이 강하게 모였다고 서술하오. ⑤ 위 [섹션별 시제 지시]에서 nonyeongi에 지정된 시제로만 모든 문장을 작성하오. 다른 시제를 섞지 마오. 두 기운이 함께 만들어내는 말년기 전체 분위기를 통합하여 서술하오. ⑥ 좋은 면과 좋지 않은 면을 반드시 모두 담으오. 좋은 점만 나열하거나 좋지 않은 면을 희석하여 얼버무리지 마오. 반드시 홍연 말투(~이오/~하오/~했소/~겠소)로 300자(공백 포함) 내외로 작성하오."
    ]
  },
  "ability": {
    "paragraphs": [
      "【타고난 능력치 풀이 — 필수 규칙】위에 제공된 [타고난 능력치 점수]를 참고하여 풀이하오. ① 점수 수치는 절대 언급하지 마오. 높고 낮음을 글로만 표현하오. ② 80점 이상인 능력치는 두각되는 강점으로, 60점 미만인 능력치는 솔직하게 보완이 필요한 부분으로 서술하오. 좋은 점만 나열하거나 부족한 부분을 얼버무리지 마오. ③ 가장 높은 능력치 2~3개와 가장 낮은 능력치 1~2개를 구체적으로 언급하오. ④ 능력치 이름을 직접 언급(예: '추진력이 강하오')하여 명시적으로 서술하오. ⑤ 단순 나열이 아니라 이 조합이 실제 삶에서 어떤 방식으로 드러나는지 입체적으로 풀이하오. ⑥ 반드시 홍연 말투(~이오/~하오/~겠소)로 500자 내외로 작성하오."
    ]
  },
  "sipseong": { "intro": "십성으로 본 사회적 역할 도입", "callout": "가장 활성화된 십성과 의미", "paragraphs": ["그 십성의 강점","어떤 일에서 빛나는지","문단"] },
  "unseong": { "intro": "십이운성 도입", "callout": "일주 등 핵심 운성과 기운", "paragraphs": ["기운의 특징","주의점/조언"] },
  "sinsalReading": {
    "paragraphs": [
      "【신살 풀이 — 필수 규칙】위 명식표에 기재된 신살들을 기반으로 이 사람의 사주를 풀이하오. 반드시 아래 다섯 가지 접근을 모두 담아 입체적으로 서술하오.\n① [실존 신살만] 명식표에 실제로 기재된 신살만 언급하오. 없는 신살을 지어내지 마오.\n② [삶의 서사] 각 신살이 이 사람의 삶에 어떤 이야기를 만들어내는지, 단순 정의가 아니라 실제 삶의 장면으로 풀어내오. 어떤 상황에서, 어떤 방식으로 그 기운이 드러나는지 구체적으로 서술하오.\n③ [귀인과 보호의 기운] 귀인살(천을귀인·문창귀인·천덕귀인·월덕귀인·금여록·암록 등)이 있다면, 어떤 형태의 귀인이 어떤 시기에 어떻게 찾아오는지 서술하오.\n④ [살의 이면] 역마살·도화살·화개살·현침살·망신살·홍염살 등 살의 기운이 있다면, 부정적 면만 나열하지 말고 그 살이 오히려 이 사람에게 개성과 추진력이 되는 면을 함께 서술하오. 일간·오행·십성과 연결하여 이 사람만의 방식으로 해석하오.\n⑤ [통합 기운] 신살들이 서로 어우러지며 만들어내는 이 사람만의 독특한 기운의 색채를 종합적으로 마무리하오. 이 사람이 신살의 기운을 어떻게 활용하면 좋은지 조언도 담아내오.\n반드시 홍연 말투(~이오/~하오/~했소/~겠소)로 560자 내외로 작성하오."
    ]
  },
  "pyori": { "intro": "겉과 속이 다를 수 있다는 도입", "callout": "겉모습 vs 속마음 핵심 대비", "paragraphs": ["밖에서 보는 모습","실제 내면의 모습"] }
}`,
  2: `{
  "strength": { "intro": "【필수】위 [득령·득지·득시·득세 판정] 결과를 그대로 사용하여, '~~~은 득령·득지에는 성공했지만 득시·득세에는 실패했으므로 신강한 편에 속하오.' 형식으로 반드시 첫 문장에 득/실패 결과를 명시하오. 이후 일간 오행과 지배적 십성으로 신강/신약의 성향을 자연 이미지로 서술하오.", "callout": "득령·득지·득시·득세 중 득한 항목을 근거로 신강/신약을 짚는 한 문장 (사주 용어 포함)", "paragraphs": ["신강/신약의 핵심 성향과 장점 — 지배적 십성(비겁·식상 등)과 연결하여 자연 이미지로 서술, 2~3문장","그 기운이 과할 때 그림자·단점을 자연 비유로 솔직하게 묘사, 2문장","주의점과 조언, 1~2문장"] },
  "gyeokguk": { "intro": "【필수】'격국으로는 [격국명]에 해당하여 ~' 형식으로 시작하여, 이 격국이 지닌 핵심 능력과 특성 2가지를 자연스럽게 서술하오.", "callout": "이 격국에 어울리는 구체적 분야(직업·학문·기술 등)를 나열하는 한 문장", "paragraphs": ["이 격국의 성향과 기질을 체감 언어로 서술 — 강점과 특징 위주, 2~3문장","이 격국이 과하거나 채워지지 않을 때 나타나는 주의점, 1~2문장"], "gyeokgukName": "격국 이름 (예: 편인격, 식신격, 정관격 등)", "gyeokgukKeywords": ["이 격국을 한 단어로 표현하는 키워드 3개"] },
  "yongsin": { "intro": "【필수】용신 오행이 일간에 대해 어떤 역할(제어·다듬기·균형·생조 등)을 하는지, 왜 이 기운이 가장 필요한지 체감 언어로 서술하는 도입", "callout": "용신 오행과 일간 오행의 관계(상생·상극·비화)를 한 문장으로 짚는 핵심 문장 — 오행 이름 명시 필수", "paragraphs": ["용신 오행이 일간에 어떤 역할을 하는지, 이 기운이 있을 때 삶이 어떻게 달라지는지 체감 언어로 2~3문장","희신 오행이 일간을 어떻게 보완·뒷받침하는지(뿌리·영양분·안정 등) 2문장 — 오행 이름 명시","기신 오행이 왜 삶을 버겁게 만드는지(일간을 더 강하게 하거나 흐름을 막는 이유) 2문장으로 마무리 — 전체 합계 800자 내외"], "yongsinEl": "목/화/토/금/수 중 하나(용신 오행 — 일간과의 상생·상극·비화 관계 근거로 도출)", "heusinEl": "목/화/토/금/수 중 하나(희신 오행)", "gisinEl": "목/화/토/금/수 중 하나(기신 오행)", "yongsinReason": "이 기운이 있을 때 삶에 어떤 변화가 생기는지 체감 언어로 15자 이내 (예: 있으면 중심이 잡히고 성과가 난다)", "heusinReason": "이 기운이 있으면 어떤 점이 좋아지는지 체감 언어로 15자 이내 (예: 있으면 관계가 부드러워진다)", "gisinReason": "이 기운이 강하면 삶이 어떻게 흔들리는지 체감 언어로 15자 이내 (예: 강하면 고집이 세져 막힌다)" },
  "hapchung": { "intro": "끌어당기고 뒤흔드는 합·충 도입", "callout": "주요 원진/합/충과 작용(사주 용어 포함)", "paragraphs": ["부정적 작용과 경계점","긍정적 작용(육합 등)","중심을 잡는 법"] },
  "essence": { "intro": "【필수】'겉으로 드러나는 모습은 [천간 십성] 기운이 강하게 작용하여 ~' 형식으로 시작하여, 천간에 드러나는 십성 기운과 그로 인한 겉모습·성향을 2~3문장으로 서술하오.", "callout": "지지에 숨겨진 십성 기운과 내면 심리를 '지지에 숨겨진 내면을 들여다보면 ~' 형식으로 짚는 한 문장", "paragraphs": ["지지 십성이 만들어내는 내면 심리와 실제 작동 방식 — 겉모습과의 대비를 살려 2~3문장으로 서술하오","명식 내 십성들의 오행 흐름(예: 식상→재성 연결 등)과 그로 인한 현실적 영향·기회를 서술하오","과다한 기운이나 흐름이 막힐 때 나타나는 위험·주의점으로 마무리하오"] }
}`,
  4: `{
  "rarity": {
    "intro": "사주의 희소성/특별함 도입",
    "callout": "귀인(천을귀인 등)·건록·격국 등 귀한 조합을 짚는 문장",
    "paragraphs": ["어떤 글자 배치가 드문지","그 희소성이 의미하는 바","격려"],
    "grade": "S/A/B/C 중 하나(귀한 정도)",
    "percentile": 2.5
  },
  "special": {
    "tags": [ {"label":"乙卯","sub":"을묘일주 × 도화살"}, {"label":"巳 ↔ 申","sub":"사신육합"}, {"label":"卯 ↔ 申","sub":"묘신원진"} ],
    "items": [ {"text":"신살/합/충의 의미 설명 1~2문장","hi":"그 덕에 좋은 점 한 줄"} ]
  }
}`,
  3: `{
  "ohaengDesc": {
    "intro": "【필수】위 [오행 분포]에서 가장 높은 비율의 오행부터 순서대로 언급하며, 각 오행이 상징하는 바(목=성장·창조, 화=열정·표현, 토=안정·신뢰, 금=절제·결단, 수=지혜·유연)를 바탕으로 이 사람이 어떤 삶을 사는지 설명하오. 비율이 0%인 오행은 '이 기운이 부족하여 ~한 면이 채워지지 않을 수 있소' 형식으로 언급하오.",
    "paragraphs": ["강한 오행들이 삶에서 어떻게 드러나는지 2~3문장","부족한 오행으로 인한 빈자리와 보완 방향 1~2문장"]
  },
  "balance": {
    "intro": "【필수】'사회적 활동 영역을 상징하는 월주를 보면 [기둥별 십성 확인표]에서 확인한 격국명의 특성이 강하게 나타나오.' 형식으로 시작하여, 이 격국이 직업·재능 면에서 어떤 방향을 암시하는지 1~2문장으로 서술하오.",
    "callout": "【필수】'월간에 떠 있는 [월주 천간 글자명] [월주 천간 십성]의 기운은 ~' 형식으로 월간 천간 십성이 사회적 활동에서 어떻게 발현되는지 구체적으로 짚는 한 문장",
    "paragraphs": ["이 격국과 월간 십성에 최적화된 직업·분야를 구체적으로 나열하오 (창의적 기획, 특수 기술, 전문 상담 등 본인의 개성이 드러나는 분야 위주)", "해당 기운이 과할 때 나타나는 주의점과 보완 방향으로 마무리하오"],
    "spectrum": { "label": "혼자 힘으로 살아가는 나", "value": 30 }
  },
  "answer": {
    "intro": "【필수】첫 문장에서만 MBTI 유형명(예: ENFP)을 한 번 언급하고, 이후 문장에서는 절대 유형명을 반복하지 마오. '이 사주는', '이 유형은', '이 기질은' 등으로 대체하오. 왜 이 유형인지 사주 명식과 연결하여 설명하오.",
    "callout": "사주의 일간 오행·격국·십성 조합과 해당 유형의 공통된 핵심 특성을 짚는 한 문장 — 유형명 반복 금지",
    "paragraphs": ["이 유형의 강점과 이 사주가 공유하는 면모 2~3문장 — 유형명 반복 금지","주의해야 할 그림자·약점 1~2문장"],
    "mbtiType": "INTJ"
  }
}`,
  11: `{
  "daeFlow": {
    "intro": "앞으로 10년간 삶을 지배할 거대한 대운의 흐름과 인생의 계절 변화를 분석하는 도입 1~2문장",
    "callout": "현재 진행 중인 대운(간지 한자 포함)이 어떤 시기인지(상승/정비/도약 등)를 한 문장으로 짚기. 천간(십성)·지지(십성) 작용 언급",
    "paragraphs": ["이번 대운에 들어온 천간/지지의 십성이 주는 긍정적 기운","지난 대운과 비교한 변화(용신/기신 관점)","이 시기에 유리한 현실적 목표(직장·이직·내 집·결혼 등)","흐름을 대하는 마음가짐/조언"]
  },
  "seun": {
    "intro": "대운이라는 큰 프레임 안에서 해마다 찾아오는 세운의 구체적인 변화와 흐름을 짚는 도입",
    "callout": "현재 지나고 있는 해(연도+간지 한자)의 십성 기운과 그 해의 핵심 분위기를 짚는 문장",
    "paragraphs": ["다음 해의 간지/십성과 그 작용","대망의 정점이 되는 해(연도+간지)와 용신 조화로 운이 정점","그 시기에 돌아오는 결실(재물·명예 등)","이어지는 해의 흐름과 자산/커리어 조언","향후 수년간 기운을 대하는 마음가짐"],
    "flow": [
      {"year": 2026, "score": 62}, {"year": 2027, "score": 74}, {"year": 2028, "score": 92},
      {"year": 2029, "score": 88}, {"year": 2030, "score": 70}, {"year": 2031, "score": 64},
      {"year": 2032, "score": 58}, {"year": 2033, "score": 60}
    ]
  },
  "openLuck": {
    "intro": "막힌 운이 본격적으로 풀리고 인생의 황금기가 시작되는 결정적 타이밍을 짚는 도입",
    "callout": "운이 가장 강력하게 열리는 시기(만 나이 + 연도 + 간지 한자)와 그때 폭발하는 기운(재물·관성 등)을 짚는 문장",
    "paragraphs": ["그 해에 활성화되는 원국의 합/십성과 사회적 결실","머릿속 구상이 현실 성과로 이어짐","직장/이직/승진 등 구체적 기회","주체적으로 판을 주도하라는 조언","그 시점을 위한 지금의 준비"],
    "peak": { "title": "2028년 무신(戊申)년의 강력한 재관(財官) 활성화", "when": "용신과 희신이 함께 들어오는 때", "todo": "망설이지 말고 주체적으로 도전하세요" }
  },
  "domains": {
    "intro": "사주 데이터를 바탕으로 앞으로 10년간의 주요 인생 영역별 운세 강도를 종합 비교하는 도입",
    "paragraphs": ["돈·일·연애·결혼·건강 다섯 영역의 위계와 무게중심을 짚는 문장","이 비교를 삶의 기획·에너지 분배 가이드로 삼으라는 조언"],
    "bars": [ {"label":"재물","value":85}, {"label":"직업","value":90}, {"label":"애정","value":75}, {"label":"결혼","value":80}, {"label":"건강","value":70} ]
  }
}`,
  5: `{
  "wealthTime": {
    "intro": "절대 쓰지 마오 — 이 필드는 비워두시오",
    "callout": "절대 쓰지 마오 — 이 필드는 비워두시오",
    "paragraphs": [
      "【하나의 흐름으로 작성】 2024~2033년 세운 전체를 하나의 연속된 풀이로 작성하오. 먼저 재물이 가장 강하게 열리는 시기(재성·식상 세운)를 연도와 간지를 명시하며 왜 그 해인지 십성 논리로 설명하오. 이어서 재물이 정체되거나 손실이 우려되는 시기(관성·인성·비겁 과다 세운)도 연도와 간지를 명시하며 이유를 서술하오. 각 시기에 어떻게 행동해야 하는지(투자·지출·자산관리)를 녹여 마무리하오. 단락 구분 없이 하나의 흐름으로, 홍연 말투(~이오/~하오/~겠소)로 8~10문장 이내로 작성하오.",
      ""
    ],
    "bars": [
      {"year":2026,"amount":"1억 5천","value":15}, {"year":2027,"amount":"2억 5천","value":25},
      {"year":2028,"amount":"6억","value":60}, {"year":2029,"amount":"5억","value":50}, {"year":2030,"amount":"2억","value":20}
    ]
  },
  "jobFit": {
    "intro": "어떤 일에서 가장 큰 성과를 내는지(타고난 적성)를 짚는 도입",
    "callout": "강점(틈새 포착·전문성 브랜드화 등)을 십성 근거로 짚는 문장",
    "paragraphs": ["맞지 않는 환경(단순 반복/지시)에서의 한계","전문성을 갈고닦아 증명할 때 따르는 명예·성취"],
    "clusters": [
      {
        "category": "계열명 — 명식 특성을 담은 이름으로",
        "keywords": ["적성 키워드1", "키워드2", "키워드3"],
        "jobs": ["직업1", "직업2", "직업3", "직업4", "직업5", "직업6", "직업7", "직업8"],
        "rankReason": "이 계열이 1순위인 이유 — 명식 십성·오행 근거로 2~3문장. 왜 이 사람의 사주가 이 계열에 가장 잘 맞는지.",
        "topJobReason": "대표 직업(jobs[0])을 첫 번째로 고른 이유 — 구체적 십성 작용으로 1~2문장."
      },
      {
        "category": "계열명",
        "keywords": ["키워드1", "키워드2", "키워드3"],
        "jobs": ["직업1", "직업2", "직업3", "직업4", "직업5", "직업6", "직업7"],
        "rankReason": "이 계열이 2순위인 이유 — 1순위보다는 약하지만 충분히 맞는 근거.",
        "topJobReason": "대표 직업 선정 이유."
      },
      {
        "category": "계열명",
        "keywords": ["키워드1", "키워드2", "키워드3"],
        "jobs": ["직업1", "직업2", "직업3", "직업4", "직업5", "직업6"],
        "rankReason": "이 계열이 3순위인 이유 — 보완 기운으로 가능성은 있지만 가장 약한 근거.",
        "topJobReason": "대표 직업 선정 이유."
      }
    ]
  },
  "jobType": {
    "intro": "절대 쓰지 마오 — 빈 문자열로",
    "callout": "절대 쓰지 마오 — 빈 문자열로",
    "paragraphs": [
      "첫 문장: 직장인 X점, 사업가 Y점을 직접 언급하며 어느 길이 더 잘 맞는지 결론 제시.",
      "두 번째 문장 이후: 일간 오행과 두드러진 십성(비겁·식상·재성·관성·인성 등)이 왜 그 길에 유리하게 작용하는지 명리학 근거로 2~3문장 서술.",
      "이어서: 우세한 길에서 어떤 환경·역할·방식일 때 가장 크게 성과가 나는지 구체적으로 1~2문장 서술.",
      "마지막: 열세한 길을 선택했을 때 어떤 어려움이나 답답함이 생기는지 1~2문장 경고. 전체 합산 500자(공백 포함) 내외. 홍연 말투(~이오/~하오/~겠소) 필수."
    ],
    "split": { "leftLabel":"직장인","left":40,"rightLabel":"사업가","right":60,"leftDesc":"안정적이지만 답답함을 느끼기 쉬워요","rightDesc":"주도적으로 판을 짤 때 성과가 극대화돼요" }
  },
  "invest": {
    "intro": "절대 쓰지 마오 — 빈 문자열로",
    "callout": "절대 쓰지 마오 — 빈 문자열로",
    "paragraphs": [
      "【필수 — 500자 내외 하나의 흐름으로】 investTypes의 점수 순서를 기반으로 어떤 투자가 잘 맞고, 어떤 투자가 위험한지 구체적으로 서술하오. 십성·오행 명칭은 사용하지 마오. 대신 이 사람의 기질·성향·삶의 태도(예: 안정을 중시하는 성향, 변동에 취약한 기질, 꼼꼼하게 따지는 성격 등)로 풀어서 설명하오. 잘 맞는 투자 유형은 구체적으로 어떤 방식으로 접근하면 좋은지(예: 매달 일정액 적립, 달러 분할 매수 등) 실용적 조언을 담으오. 위험한 투자 유형은 왜 이 사람에게 손실로 이어지기 쉬운지 구체적으로 경고하오. 하나의 자연스러운 단락으로, 홍연 말투(~이오/~하오/~겠소), 500자(공백 포함) 내외."
    ],
    "investTypes": [
      {
        "category": "저축",
        "icon": "🏦",
        "score": 85,
        "products": ["CMA", "적금", "예금"],
        "tip": "이 사주에 저축이 맞는 이유 한 줄"
      },
      {
        "category": "주식",
        "icon": "📈",
        "score": 60,
        "products": ["미장ETF", "국내성장주", "배당주"],
        "tip": "주식 궁합 한 줄"
      },
      {
        "category": "코인",
        "icon": "🪙",
        "score": 20,
        "products": ["비트코인", "이더리움"],
        "tip": "코인 궁합 한 줄"
      },
      {
        "category": "현물",
        "icon": "🥇",
        "score": 75,
        "products": ["금", "달러", "은"],
        "tip": "현물 궁합 한 줄"
      },
      {
        "category": "부동산",
        "icon": "🏠",
        "score": 55,
        "products": ["아파트", "리츠", "경매"],
        "tip": "부동산 궁합 한 줄"
      }
    ]
  }
}`,
  6: `{
  "loveStyle": {
    "intro": "절대 쓰지 마오 — 빈 문자열로",
    "callout": "절대 쓰지 마오 — 빈 문자열로",
    "paragraphs": [
      "【필수 — 하나의 풀이로】 일주 기반 연애 성향 → 재성/관성 위치 분석 → 일지 배우자궁+합충형 경고 순서로, 단락 구분 없이 하나의 자연스러운 흐름으로 서술하오. 사주 용어는 반드시 괄호로 풀이하오(예: 건록(자수성가와 독립의 기운)). 신강/신약, 일지 십이운성, 합·충·형 유무를 실제 명식에서 확인하여 근거로 사용하오. 여성 사주면 배우자를 상징하는 관성(정관·편관)이 어느 기둥에 있는지(없으면 무관 사주임을 명시), 남성 사주면 재성(정재·편재)이 어느 기둥에 있는지(없으면 무재 사주임을 명시) 반드시 분석하고 그 위치와 유무가 인연에 어떤 의미를 갖는지 풀이하오. 절대 두 개념 혼용 금지. 장점과 단점 모두 담되 따뜻한 시선으로. 홍연 말투(~이오/~하오/~겠소/~있소)로 통일하오. "~ㅂ니다", "~어요", "~습니다" 절대 금지. 700~900자(공백 포함)."
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
  "spouse": {
    "intro": "사주에 예정된 미래 배우자의 전반적 분위기를 짚는 도입",
    "callout": "배우자가 선우님에게 어떤 존재인지(중심을 잡아주는 멘토 등)를 짚는 문장",
    "paragraphs": ["예의·상식과 겉/속의 심지","서로의 전문성을 존중하는 동반자 관계"],
    "card": {
      "gender": "여성 또는 남성(상대 성별)",
      "ageBand": "30대 초반 등 연령대",
      "desc": "배우자의 분위기·성격 2~3문장",
      "mbti": "ISTJ 등 추정 MBTI",
      "height": "163cm 내외 등",
      "personality": "성격 한 줄",
      "jobField": "직업 계열(금융·공공기관 등)",
      "tags": ["키워드","키워드","키워드","키워드","키워드","키워드"]
    }
  },
  "marriage": {
    "intro": "배우자와 오래 행복하게 지내는 핵심(독립 공간 존중 등)을 짚는 도입",
    "callout": "주의할 합/충(묘신원진 등)과 그로 인한 갈등 포인트, 소통 태도를 짚는 문장",
    "paragraphs": ["객관적 사실 기반 소통 훈련 조언","결혼 결실의 시기(연도+간지)와 결혼이 주는 안정감"]
  }
}`,
  7: `{
  "bodyWeak": {
    "intro": "건강 관리를 위해 가장 먼저 챙겨야 할 신체 부위를 짚는 도입",
    "callout": "오행 불균형(특정 오행 과다 → 약해지는 장부/부위)을 근거로 약한 부위를 짚는 문장(오행 한자 포함)",
    "paragraphs": ["일상에서 먼저 나타나는 증상/신호","스트레스·수면 등 누적 시 주의점","기본 바탕을 다지는 조언"],
    "bars": [ {"label":"호흡기","value":80}, {"label":"피부","value":60}, {"label":"관절","value":85}, {"label":"수면","value":70} ]
  },
  "riskTime": {
    "intro": "특별히 건강·사고수를 조심해야 할 구체적 시기와 상황을 짚는 도입",
    "callout": "계절적으로 취약한 때(약해지는 오행·여름/환절기 등)를 짚는 문장",
    "paragraphs": ["원국의 합/충 활성 시기의 정신적 증상","운동·생활에서의 주의점","삼재 등 특정 연도와 정기검진 권유"]
  },
  "healthCare": {
    "intro": "약한 부위를 보완할 맞춤형 건강 관리법 도입",
    "callout": "가장 필요한 오행(용신, 한자 포함)을 채워 몸을 보강한다는 문장",
    "paragraphs": ["바른 자세·호흡 등 생활 실천","작은 습관 변화의 효과와 격려"],
    "element": "쇠 (金)",
    "tips": [
      {"label":"수분","title":"미지근한 물 자주 마시기","desc":"기관지 점막을 촉촉하게 유지해 줍니다"},
      {"label":"음식","title":"도라지, 무, 배 등 흰색 음식","desc":"폐와 호흡기 기능을 강화하는 데 좋아요"},
      {"label":"운동","title":"맨몸 스트레칭과 필라테스","desc":"관절의 유연성을 기르고 뼈를 보호해요"},
      {"label":"습관","title":"바른 자세 유지와 척추 정렬","desc":"뼈와 관절에 무리가 가지 않도록 돕습니다"}
    ]
  }
}`,
  8: `{
  "helper": {
    "intro": "인생의 결정적 순간마다 도움을 줄 귀인이 어떤 성향인지 짚는 도입",
    "callout": "귀인이 어떤 식으로 돕는 존재인지(냉정·공정한 멘토 등)를 짚는 문장",
    "paragraphs": ["귀인의 모습(선배·상사 등)과 중심을 잡아주는 역할","감정에 흔들릴 때 귀인이 주는 도움"],
    "card": {
      "gender": "남성 또는 여성",
      "ageBand": "40대 초반 등 연령대",
      "desc": "귀인의 분위기·특징 2~3문장",
      "mbti": "ENTJ 등 추정 MBTI",
      "height": "178cm 내외 등",
      "personality": "성격 한 줄",
      "jobField": "직업 계열",
      "tags": ["키워드","키워드","키워드","키워드","키워드","키워드","키워드","키워드"]
    }
  },
  "helperTime": {
    "intro": "귀인의 인연이 본격적으로 찾아오고 활성화되는 시기를 짚는 도입",
    "callout": "귀인이 들어오는 시기(대운/세운 간지·정관 등 십성)를 짚는 문장",
    "paragraphs": ["특정 연도(연도+간지)의 조력과 승진·이직 등 결실"]
  },
  "helperUse": {
    "intro": "귀인의 인연을 알아보고 현명하게 활용하는 비결 도입",
    "callout": "귀인이 다가오는 방식(직설적 조언 등)을 짚는 문장",
    "paragraphs": ["직설적 말투를 받아들이는 태도","무리한 결정을 막아주는 역할","조언을 보석 같은 피드백으로 수용","귀인의 규칙·시스템을 적용","고민을 털어놓고 자문 구하기","예의·공적 신뢰를 쌓는 관계 유지","성과·공정함 기반 소통","귀인의 네트워크에 참여해 지평 넓히기"]
  }
}`,
  12: `{
  "samjae": {
    "intro": "미리 대비하고 조심해야 할 가장 거친 3년(삼재)의 시기를 알려주는 도입",
    "callout": "띠(생년 지지)를 근거로 삼재 기간(시작~끝 연도+간지, 만 나이)을 정확히 짚는 문장",
    "paragraphs": ["대운 교체기와 맞물린 변동성","들삼재(1년차)의 핵심 주의","눌삼재(2년차)의 관계 갈등 주의","날삼재(3년차)의 건강 주의","삼재를 속도 조절의 신호로 받아들이라는 위로"],
    "trap": {
      "title": "대운 교체기와 맞물리는 삼재의 변동성",
      "desc": "대운이 바뀌는 시기와 삼재가 겹쳐 변동성이 가장 커지는 구간이에요.",
      "items": [
        {"title":"무리한 투자 및 확장 금지","desc":"새로운 사업 확장이나 큰 액수의 투자는 위험해요."},
        {"title":"대인관계에서의 구설수 주의","desc":"사소한 말로 오해가 깊어져 관계에 금이 갈 수 있어요."},
        {"title":"면역력 저하 및 건강 관리","desc":"호흡기·정신 건강을 평소보다 더 신경 써야 해요."}
      ]
    },
    "yearly": [
      {"year":"2031년","phase":"들삼재","action":"신규 투자 및 동업 제안 거절"},
      {"year":"2032년","phase":"눌삼재","action":"가족 및 연인과의 갈등 조율"},
      {"year":"2033년","phase":"날삼재","action":"건강 검진 및 만성 피로 관리"}
    ],
    "guide": ["들삼재(1년차)의 행동 지침","눌삼재(2년차)의 소통 지침","날삼재(3년차)의 건강 지침","삼재를 충전의 기회로 삼으라는 격려"]
  },
  "samjaeFocus": {
    "intro": "삼재 기간 동안 구체적으로 조심해야 할 세 가지 핵심 포인트(변동·관계·건강) 도입",
    "callout": "첫째 핵심: 무리한 재정적 변동/투기/돈거래 금지를 짚는 문장",
    "paragraphs": ["둘째 핵심: 대인관계 오해·구설수(합/충 작용)","셋째 핵심: 뼈·관절·호흡기 건강 관리","새 일보다 기존 일 안정·시스템 정비","계약·서면 증거 등 실무 주의","조급함을 내려놓고 성찰의 시간으로 삼으라는 위로"]
  }
}`,
  9: `{
  "villain": {
    "intro": "선우님을 흔들고 힘들게 만드는 악인이 어떤 모습으로 다가오는지 패턴을 분석하는 도입",
    "callout": "악인이 처음 접근하는 방식(과도한 칭찬·아군처럼 등)을 짚는 문장",
    "paragraphs": ["선우님의 어떤 기질(상관 등)을 파고드는지","경계심을 무장해제 시키는 방식"],
    "card": {
      "gender": "남성 또는 여성",
      "ageBand": "30대 후반 등 연령대",
      "desc": "조심할 인물의 분위기·특징 2~3문장",
      "mbti": "ESTP 등 추정 MBTI",
      "height": "175cm 내외 등",
      "personality": "성격 한 줄",
      "jobField": "직업 계열(다단계·투기성 영업 등)",
      "tags": ["키워드","키워드","키워드","키워드","키워드","키워드","키워드","키워드"]
    }
  },
  "loss": {
    "intro": "악인의 유혹에 넘어갔을 때 잃게 될 구체적 손실을 짚는 도입",
    "callout": "가장 먼저 타격받는 것(재물·자산의 누수, 십성 한자 포함)을 짚는 문장",
    "paragraphs": ["경제적 어려움","정신적 배신감·마음앓이","불신·자책으로의 확산","본업 집중력·커리어 손실","진짜 인연과의 관계 악화","건강·수면 손실","평판·신용 실추","정관/상관 관점의 근본 원인","회복의 어려움과 예방의 중요성","의심스러운 인연을 정리하는 결단","깨어있는 이성으로 황금기를 지키라는 마무리"]
  }
}`,
  13: `{
  "sumEssence": {
    "intro": "타고난 본질을 한 문단으로 요약(일주 한자·생명력·주체성)",
    "callout": "강점을 살려 가장 큰 성취를 이루는 길을 짚는 한 문장",
    "paragraphs": ["주체적인 삶이 곧 본질이라는 마무리 한 문단"]
  },
  "sumTime": {
    "intro": "현재 대운(간지 한자)이 주는 흐름을 한 문단으로 요약",
    "callout": "결정적 도약의 해(만 나이+연도+간지)를 짚는 한 문장",
    "paragraphs": ["지금의 준비가 황금기를 만든다는 마무리 한 문단"]
  },
  "sumRelation": {
    "intro": "관계에서 다스릴 합/충(예민함)과 소통 태도를 한 문단으로 요약",
    "callout": "귀인의 조언을 받아들이는 것이 성공의 비결이라는 한 문장",
    "paragraphs": ["귀인과 협력할 때 기회·재물이 흐른다는 마무리 한 문단"]
  }
}`,
  14: `{
  "openMethod": {
    "intro": "부족하거나 조후를 조율해 줄 핵심 기운을 일상에서 채우는 생활 처방 도입",
    "callout": "그 기운(용신/희신 오행 한자 포함)이 십성으로 무엇을 뜻하며 어떤 약이 되는지 짚는 문장",
    "paragraphs": ["가벼운 실천으로 운의 흐름을 바꾸자는 한 문단"],
    "element": "물 (水) 등 보강할 오행",
    "tips": [
      {"label":"색","title":"보강할 색 계열","desc":"옷·소품 활용 팁"},
      {"label":"방향","title":"이로운 방향/공간","desc":"잠자리·책상 배치 팁"},
      {"label":"음식","title":"이로운 음식","desc":"장부/조후를 돕는 이유"},
      {"label":"생활","title":"이로운 생활 습관","desc":"순환·내면을 돕는 이유"}
    ]
  },
  "tomorrow": {
    "intro": "내일 날짜와 일진(간지 한자+십성)을 짚고 어떤 기운의 날인지 한 문장",
    "paragraphs": ["그 기운을 살린 구체적 행동 제안","미뤄둔 일/기획을 정리하라는 제안","재능을 드러낼 때의 결실"]
  },
  "weekFlow": {
    "intro": "이번 한 주 요일별 일진 변화와 대처법을 안내하는 도입",
    "callout": "주 초반 특정 일진(간지+십성)의 주의점을 짚는 문장",
    "paragraphs": ["주 중반 재물/계약에 좋은 일진","주말 공적 업무에 좋은 일진","요일 흐름을 알고 대처하라는 정리","아침 스트레칭 등 건강 팁"],
    "days": [
      {"top":"6/10","label":"을묘일","status":"나쁨"}, {"top":"6/11","label":"병진일","status":"보통"},
      {"top":"6/12","label":"정사일","status":"좋음"}, {"top":"6/13","label":"무오일","status":"좋음"}, {"top":"6/14","label":"기미일","status":"좋음"}
    ]
  },
  "monthFlow": {
    "intro": "앞으로 3개월 월별 기운의 흐름과 마음가짐을 짚는 도입",
    "callout": "변화가 큰 달(월+간지)의 주의점을 짚는 문장",
    "paragraphs": ["재물/협력에 좋은 달","충돌·스트레스를 주의할 달과 자기관리"],
    "months": [
      {"top":"6월","label":"갑오월","status":"나쁨"}, {"top":"7월","label":"을미월","status":"좋음"}, {"top":"8월","label":"병신월","status":"좋음"}
    ]
  }
}`,
  15: `{
  "simju": {
    "intro": "마음이 흔들릴 때 중심을 잡아줄 '심주'(용신 기둥)를 짚는 도입",
    "callout": "심주가 되는 기운(용신 간지 한자+십성)이 어떤 단단한 바탕을 의미하는지 짚는 문장",
    "paragraphs": ["그 심주가 흔들리지 않는 이성·중심을 의미한다는 한 문단"],
    "heart": { "label": "경신(庚申)", "gan": "庚", "ji": "申" }
  },
  "shake": {
    "intro": "무엇이 그 심주(마음의 중심)를 흔드는지 짚는 도입",
    "callout": "심주를 흔드는 기운(특정 십성/합충, 감정 과잉 등)을 짚는 문장",
    "paragraphs": ["충동적 결정/오해 등 흔들리는 상황","불안·조급함이 커질 때의 신호"]
  },
  "forge": {
    "intro": "심주를 단단히 세우는 구체적 방법 도입",
    "callout": "감정과 사실을 분리해 자문하는 습관 등 핵심 방법을 짚는 문장",
    "paragraphs": ["원칙 점검·기록 등 일상 훈련","중심을 세우면 흔들리지 않는다는 격려"]
  }
}`,
  16: `{
  "letter": {
    "paragraphs": [
      "이름을 부르며 시작하는 인사와, 어떤 고민(올해 운세·재물·결혼 등)을 안고 찾아왔는지 따뜻하게 회상하는 한 문단",
      "지난 힘들었던 시기를 일간 비유로 공감하며 잘 견뎌줘서 고맙다는 한 문단",
      "지금의 대운과 다가올 황금기(연도)의 결실을 희망으로 전하는 한 문단",
      "결혼/인연에 대한 격려 한 문단",
      "삼재·악인 등 거친 시기를 만나도 강인한 생명력과 귀인의 보살핌이 함께함을 일러주는 한 문단",
      "조급함을 내려놓고 자신의 속도로 살라는 위로 한 문단",
      "앞날을 축원하는 한 문단",
      "'힘든 날도 날씨 같은 것'이라는 비유로 스스로를 믿고 당당히 걸어가라는 마무리 한 문단"
    ]
  }
}`,
};

// 사주 원국 이미지 생성용 프롬프트 빌더
export function buildSajuImagePrompt(pillars: { gan: string; ji: string }[]): string {
  const [si, il, wol, nyeon] = pillars;

  // 일간별 핵심 사물
  const ILGAN_SUBJECT: Record<string, string> = {
    甲: "a towering ancient tree — straight, mighty, a born leader of the forest",
    乙: "lush vines and grass — flexible, vital, adapting gracefully to every environment",
    丙: "the blazing sun — radiant, outward, powerful presence driving everything forward",
    丁: "a candle flame — delicate, warm, gently illuminating the world around it",
    戊: "a grand mountain — steadfast, trustworthy, immovable and enduring",
    己: "fertile farmland — nurturing, caring, deeply rooted in practical reality",
    庚: "a massive boulder — principled, weighty, unyielding and commanding",
    辛: "shimmering gems and refined metal — sharp, elegant, refined to perfection",
    壬: "a vast ocean — deep, expansive, flowing freely with broad perspective",
    癸: "a spring or morning dew — pure, intuitive, quietly perceptive",
  };

  // 월지별 계절·분위기
  const WOLJI_SEASON: Record<string, string> = {
    寅: "early spring — first hints of warmth, pale green buds emerging from frozen earth",
    卯: "full spring — soft pink blossoms, gentle breeze, fresh green everywhere",
    辰: "late spring — lush greenery, warm humid air, mist over the hills",
    巳: "early summer — rising heat, bright sky, vibrant life in full swing",
    午: "midsummer — blazing sun overhead, intense light, deep saturated greens",
    未: "late summer — golden haze, heat shimmer, earth beginning to dry",
    申: "early autumn — crisp cool air, first leaves turning amber and red",
    酉: "full autumn — golden amber landscape, falling leaves, serene melancholy",
    戌: "late autumn — bare branches, dry earth, muted earth tones, cold wind",
    亥: "early winter — first frost, barren ground, cold mist, darkness approaching",
    子: "midwinter — deep cold, blue moonlight, snow blanketing the frozen ground",
    丑: "late winter — lingering snow, pale dawn light, the earth waiting to thaw",
  };

  // 나머지 6글자 → 보조 사물 매핑 (일간·월지 제외)
  const CHAR_ELEMENT: Record<string, string> = {
    甲: "a tall straight tree in the background",
    乙: "climbing vines or wildflowers nearby",
    丙: "a bright sun or warm sunbeams breaking through",
    丁: "a small flickering flame or lantern light",
    戊: "a rugged mountain ridge in the distance",
    己: "gentle rolling farmland or fertile soil",
    庚: "large weathered boulders or rocky outcrops",
    辛: "glinting crystal formations or refined metallic sheen",
    壬: "a wide river or reflective ocean in the background",
    癸: "morning dew on leaves or a quiet stream",
    寅: "young saplings or fresh bamboo",
    卯: "scattered blossoms or green meadow",
    辰: "misty hills or mossy ground",
    巳: "warm embers glowing in a crevice",
    午: "sunlight streaming intensely through clouds",
    未: "dry golden grass swaying in the breeze",
    申: "sharp metallic rocks catching the light",
    酉: "refined stone surfaces with cool sheen",
    戌: "dark earth and scattered autumn leaves",
    亥: "cold dark water or shadowed icy pool",
    子: "deep still water reflecting moonlight",
    丑: "frost-covered soil or patches of melting snow",
  };

  // 일간 오행 → 동물 색상
  const ILGAN_COLOR: Record<string, string> = {
    甲: "vibrant green", 乙: "soft green",
    丙: "vivid red", 丁: "deep crimson",
    戊: "golden yellow", 己: "warm amber",
    庚: "pure white", 辛: "silver",
    壬: "deep black", 癸: "dark blue",
  };
  // 일지(지지) → 동물
  const ILJI_ANIMAL: Record<string, string> = {
    子: "rat", 丑: "ox", 寅: "tiger", 卯: "rabbit",
    辰: "dragon", 巳: "serpent", 午: "horse", 未: "goat",
    申: "monkey", 酉: "rooster", 戌: "dog", 亥: "boar",
  };

  const ilgan = il?.gan ?? "";
  const ilji = il?.ji ?? "";
  const wolji = wol?.ji ?? "";
  const subject = ILGAN_SUBJECT[ilgan] ?? "an ancient tree";
  const season = WOLJI_SEASON[wolji] ?? "winter";
  const animalColor = ILGAN_COLOR[ilgan] ?? "white";
  const animal = ILJI_ANIMAL[ilji] ?? "";

  // 일간·월지 제외한 나머지 6글자 추출
  const others = [
    nyeon?.gan, nyeon?.ji,
    wol?.gan,            // 월간은 포함 (월지만 제외)
    il?.ji,              // 일지 포함 (일간만 제외)
    si?.gan, si?.ji,
  ].filter(Boolean) as string[];

  const secondaryElements = [...new Set(others)]
    .map(ch => CHAR_ELEMENT[ch])
    .filter(Boolean)
    .join("; ");

  const animalLine = animal
    ? `ZODIAC ANIMAL: A ${animalColor} ${animal} appears naturally within the scene — placed in a fitting position (e.g. resting near the primary subject, perched on a rock, or partially hidden in the environment). The animal should feel like a natural part of the landscape, not forced. Its color is distinctly ${animalColor}.`
    : "";

  return `A breathtaking cinematic nature painting, Studio Ghibli / Makoto Shinkai style. No people, no text, no watermarks. Wide landscape composition.

PRIMARY SUBJECT: ${subject}. This is the DOMINANT visual centerpiece of the painting.

SEASON AND ATMOSPHERE: ${season}. All lighting, color palette, and weather must reflect this season precisely.

${animalLine}

SECONDARY ELEMENTS to blend naturally into the scene: ${secondaryElements || "none"}

Composition: cinematic wide landscape, dramatic natural lighting, volumetric atmosphere, painterly and luminous, ultra-detailed, emotionally resonant.`;
}

// 한 장(chapter)의 콘텐츠만 생성하는 프롬프트 (장별 병렬 호출용)
const GAN_KR: Record<string, string> = { 甲:"갑", 乙:"을", 丙:"병", 丁:"정", 戊:"무", 己:"기", 庚:"경", 辛:"신", 壬:"임", 癸:"계" };
const JI_KR: Record<string, string> = { 子:"자", 丑:"축", 寅:"인", 卯:"묘", 辰:"진", 巳:"사", 午:"오", 未:"미", 申:"신", 酉:"유", 戌:"술", 亥:"해" };

export function buildChapterPrompt(chapter: number, input: ReportPromptInput): { system: string; user: string } {
  const honorSuffix = input.gender === "male" ? "군" : "양";
  const honor = input.name?.trim() ? `${input.name}${honorSuffix}` : "이분";

  // 현재 나이 계산 및 섹션별 시제 직접 지정
  let ageGuide = "";
  const tenseOf = { chonyeongi: "현재형", cheongneongi: "현재형", jungnyeongi: "현재형", nonyeongi: "현재형" };
  if (chapter === 1 && input.birthYear) {
    const age = new Date().getFullYear() - input.birthYear;
    if (age < 20) {
      tenseOf.chonyeongi = "현재형(~이오/~하오)";
      tenseOf.cheongneongi = "미래형(~겠소/~할 것이오)";
      tenseOf.jungnyeongi = "미래형(~겠소/~할 것이오)";
      tenseOf.nonyeongi   = "미래형(~겠소/~할 것이오)";
    } else if (age < 40) {
      tenseOf.chonyeongi  = "과거형(~했소/~이었소/~였소)";
      tenseOf.cheongneongi = "현재형(~이오/~하오)";
      tenseOf.jungnyeongi = "미래형(~겠소/~할 것이오)";
      tenseOf.nonyeongi   = "미래형(~겠소/~할 것이오)";
    } else if (age < 60) {
      tenseOf.chonyeongi  = "과거형(~했소/~이었소/~였소)";
      tenseOf.cheongneongi = "과거형(~했소/~이었소/~였소)";
      tenseOf.jungnyeongi = "현재형(~이오/~하오)";
      tenseOf.nonyeongi   = "미래형(~겠소/~할 것이오)";
    } else {
      tenseOf.chonyeongi  = "과거형(~했소/~이었소/~였소)";
      tenseOf.cheongneongi = "과거형(~했소/~이었소/~였소)";
      tenseOf.jungnyeongi = "과거형(~했소/~이었소/~였소)";
      tenseOf.nonyeongi   = "현재형(~이오/~하오)";
    }
    ageGuide = `\n[섹션별 시제 지시 — 절대 준수, 예외 없음]
chonyeongi(초년기) 풀이: 반드시 ${tenseOf.chonyeongi}으로만 작성
cheongneongi(청년기) 풀이: 반드시 ${tenseOf.cheongneongi}으로만 작성
jungnyeongi(중년기) 풀이: 반드시 ${tenseOf.jungnyeongi}으로만 작성
nonyeongi(말년기) 풀이: 반드시 ${tenseOf.nonyeongi}으로만 작성\n`;
  }

  // 기둥별 십성 확인표 — chapter 1에서 인생시기 풀이의 십성 오류 방지
  let pillarTable = "";
  if (chapter === 1 && input.pillars && input.pillars.length > 0) {
    // pillars 순서: [0]=시주, [1]=일주, [2]=월주, [3]=년주
    const ORDER = ["년주", "월주", "일주", "시주"];
    const byPos: Record<string, typeof input.pillars[0]> = {};
    for (const p of input.pillars) byPos[p.pos] = p;
    const rows = ORDER.map(pos => {
      const p = byPos[pos];
      if (!p) return null;
      const ganKr = `${GAN_KR[p.gan] ?? p.gan}${p.ganEl}`;
      const jiKr = `${JI_KR[p.ji] ?? p.ji}${p.jiEl}`;
      return `${pos}: 천간 ${ganKr}(${p.sipTop}) / 지지 ${jiKr}(${p.sipBot})`;
    }).filter(Boolean);
    const wolju = byPos["월주"];
    const woljiKr = wolju ? `${JI_KR[wolju.ji] ?? wolju.ji}${wolju.jiEl}` : "";
    const woljiSeason: Record<string, string> = {
      "자수": "한겨울 칼바람이 몰아치는 냉기",
      "해수": "초겨울 스며드는 냉기",
      "축토": "겨울 끝 습하고 차가운 냉기",
      "인목": "이른 봄 온기가 막 시작되는 기운",
      "묘목": "봄 한창 생동감 넘치는 기운",
      "진토": "봄 끝 습기 가득한 기운",
      "사화": "초여름 달아오르는 더위",
      "오화": "한여름 뜨겁게 타오르는 炎熱",
      "미토": "여름 끝 건조하고 무더운 기운",
      "신금": "초가을 서늘한 금기운",
      "유금": "가을 한창 청량하고 맑은 기운",
      "술토": "가을 끝 건조하게 마른 기운",
    };
    const seasonDesc = woljiSeason[woljiKr] ?? "";
    pillarTable = `\n[기둥별 십성 확인표 — 반드시 이 값만 사용하고 임의 추론 금지]\n${rows.join("\n")}\n`;
    if (seasonDesc) {
      pillarTable += `\n[월지 계절 정보 — wonguk intro 첫 문장에서 반드시 이 표현을 그대로 사용]\n월지: ${woljiKr} → 태어난 계절·기후: "${seasonDesc}"\n첫 문장 형식: "${seasonDesc} 속에서 태어난 [이름]은 ~"\n`;
    }

    // 능력치 점수 계산 (ability 섹션 풀이에 사용)
    const sip: Record<string, number> = {};
    const el: Record<string, number> = {};
    for (const p of input.pillars) {
      for (const s of [p.sipTop, p.sipBot]) if (s) sip[s] = (sip[s] ?? 0) + 1;
      for (const e of [p.ganEl, p.jiEl]) if (e) el[e] = (el[e] ?? 0) + 1;
    }
    const g = (keys: string[]) => keys.reduce((a, k) => a + (sip[k] ?? 0), 0);
    const e = (keys: string[]) => keys.reduce((a, k) => a + (el[k] ?? 0), 0);
    const sc = (raw: number) => Math.min(98, Math.max(28, 42 + raw * 13));
    const abilityScores = [
      { label: "추진력", value: sc(g(["겁재","편관"]) + e(["목","금"]) * 0.5) },
      { label: "리더십", value: sc(g(["편관","정관","겁재"]) + e(["금"]) * 0.6) },
      { label: "창의력", value: sc(g(["상관","편인"]) + e(["화","수"]) * 0.5) },
      { label: "재물운", value: sc(g(["편재","정재"]) + e(["토"]) * 0.6) },
      { label: "지속력", value: sc(g(["식신","정재","정관"]) + e(["토","목"]) * 0.4) },
      { label: "사교력", value: sc(g(["비견","식신","상관"]) + e(["화"]) * 0.6) },
      { label: "감수성", value: sc(g(["정인","편인"]) + e(["수"]) * 0.6) },
      { label: "직관력", value: sc(g(["편인","상관"]) + e(["수","화"]) * 0.5) },
    ];
    pillarTable += `\n[타고난 능력치 점수 — ability 풀이에서 이 수치를 기반으로 해석]\n${abilityScores.map(a => `${a.label}: ${Math.round(a.value)}점`).join(" / ")}\n※ 80점 이상=두각, 60~79점=양호, 60점 미만=보완 필요\n`;

    // 신살 목록 주입 (sinsalReading 풀이용)
    const SINSAL_EXCLUDE = new Set(["지살", "재살", "월살", "겁살", "천살", "공망"]);
    const sinsalItems = [...new Set(
      input.pillars.flatMap(p => (p.sinsal ?? "").split(/[,\s·]+/).filter(s => s && !SINSAL_EXCLUDE.has(s)))
    )];
    if (sinsalItems.length > 0) {
      pillarTable += `\n[명식표 신살 목록 — sinsalReading 풀이에서 이 신살들만 사용]\n${sinsalItems.join(", ")}\n`;
    }
  }

  // chapter 2: 득령·득지·득시·득세 계산 후 주입
  let deungTable = "";
  if (chapter === 2 && input.pillars && input.pillars.length >= 4) {
    const ps = input.pillars; // [시주, 일주, 월주, 년주] — index 0=시,1=일,2=월,3=년
    const byPos: Record<string, typeof ps[0]> = {};
    for (const p of ps) byPos[p.pos] = p;
    const siju = byPos["시주"]; const ilju = byPos["일주"]; const wolju = byPos["월주"]; const nyeonju = byPos["년주"];
    if (siju && ilju && wolju && nyeonju) {
      const ilganEl = ilju.ganEl;
      const generates: Record<string, string> = { 목: "화", 화: "토", 토: "금", 금: "수", 수: "목" };
      const helps = (el: string) => el === ilganEl || generates[el] === ilganEl;
      const deungnyeong = helps(wolju.jiEl);
      const deungji = helps(ilju.jiEl);
      const deungsi = helps(siju.jiEl);
      const seCount = [siju.ganEl, wolju.ganEl, nyeonju.ganEl, nyeonju.jiEl].filter(helps).length;
      const deungse = seCount >= 2;
      deungTable = `\n[득령·득지·득시·득세 판정 — strength 풀이 첫 문장에서 반드시 언급]\n득령(월지 ${wolju.jiEl}): ${deungnyeong ? "득" : "실패"}\n득지(일지 ${ilju.jiEl}): ${deungji ? "득" : "실패"}\n득시(시지 ${siju.jiEl}): ${deungsi ? "득" : "실패"}\n득세(시간·월간·년간·년지 중 ${seCount}개 도움): ${deungse ? "득" : "실패"}\n→ 종합: ${[deungnyeong, deungji, deungsi, deungse].filter(Boolean).length}득 ${[deungnyeong, deungji, deungsi, deungse].filter(x => !x).length}실패\n`;
    }
  }

  let ohaengTable = "";
  if (chapter === 3 && input.pillars && input.pillars.length >= 4) {
    const cnt: Record<string, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
    const sip: Record<string, number> = {};
    for (const p of input.pillars) {
      if (p.ganEl && cnt[p.ganEl] !== undefined) cnt[p.ganEl]++;
      if (p.jiEl  && cnt[p.jiEl]  !== undefined) cnt[p.jiEl]++;
      for (const s of [p.sipTop, p.sipBot]) if (s && s !== "일간(나)" && s !== "—") sip[s] = (sip[s] ?? 0) + 1;
    }
    const total = Object.values(cnt).reduce((a, b) => a + b, 0) || 1;
    const sorted = Object.entries(cnt).sort((a, b) => b[1] - a[1]);
    const g2 = (keys: string[]) => keys.reduce((a, k) => a + (sip[k] ?? 0), 0);
    const bigeop    = g2(["비견","겁재"]);
    const siksang   = g2(["식신","상관"]);
    const jaeseong  = g2(["편재","정재"]);
    const gwanseong = g2(["편관","정관"]);
    const inseong   = g2(["편인","정인"]);
    const computedMbti =
      ((bigeop + siksang) >= (inseong + gwanseong) ? "E" : "I") +
      ((inseong + siksang) >= (jaeseong + gwanseong) ? "N" : "S") +
      ((siksang + inseong) >= (gwanseong + jaeseong) ? "F" : "T") +
      ((siksang + bigeop) >= gwanseong ? "P" : "J");
    ohaengTable = `\n[오행 분포 — ohaengDesc 풀이에서 반드시 이 수치를 기반으로 서술]\n${sorted.map(([el, n]) => `${el}: ${Math.round((n / total) * 100)}% (${n}개)`).join(" / ")}\n\n[MBTI 매칭 결과 — answer 풀이에서 반드시 이 유형에 대해서만 서술]\n사주 십성 분포로 도출된 MBTI 유형: ${computedMbti}\n이 유형의 특성·강점·약점을 사주 명식과 연결하여 홍연 말투로 풀이하오. mbtiType 필드값도 반드시 "${computedMbti}"로 설정하오.\n`;
  }

  // chapter 6: 연애/결혼 — 기둥별 십성 확인표 주입 (인연성 위치 오류 방지)
  if (chapter === 6 && input.pillars && input.pillars.length > 0) {
    const ORDER6 = ["년주", "월주", "일주", "시주"];
    const byPos6: Record<string, typeof input.pillars[0]> = {};
    for (const p of input.pillars) byPos6[p.pos] = p;
    const rows6 = ORDER6.map(pos => {
      const p = byPos6[pos];
      if (!p) return null;
      const ganKr = `${GAN_KR[p.gan] ?? p.gan}${p.ganEl}`;
      const jiKr = `${JI_KR[p.ji] ?? p.ji}${p.jiEl}`;
      return `${pos}: 천간 ${ganKr}(${p.sipTop}) / 지지 ${jiKr}(${p.sipBot})`;
    }).filter(Boolean);
    const isFemale = input.gender === "female";
    const loveStars = isFemale
      ? ["정관", "편관"]
      : ["정재", "편재"];
    const loveStarName = isFemale ? "관성(정관·편관)" : "재성(정재·편재)";
    const found: string[] = [];
    for (const p of input.pillars) {
      if (loveStars.includes(p.sipTop)) found.push(`${p.pos} 천간`);
      if (loveStars.includes(p.sipBot)) found.push(`${p.pos} 지지`);
    }
    const loveStarResult = found.length > 0
      ? `${loveStarName} 위치: ${found.join(", ")}`
      : `${loveStarName}: 명식에 없음 → ${isFemale ? "무관(無官) 사주" : "무재(無財) 사주"}`;
    // 연애운 점수표 계산 (프론트 LoveLineChart 동일 알고리즘)
    const STEM_EL6: Record<string, string> = { 甲:"목",乙:"목",丙:"화",丁:"화",戊:"토",己:"토",庚:"금",辛:"금",壬:"수",癸:"수" };
    const BRANCH_EL6: Record<string, string> = { 子:"수",丑:"토",寅:"목",卯:"목",辰:"토",巳:"화",午:"화",未:"토",申:"금",酉:"금",戌:"토",亥:"수" };
    const GEN6: Record<string,string> = { 목:"화",화:"토",토:"금",금:"수",수:"목" };
    const CTL6: Record<string,string> = { 목:"토",화:"금",토:"수",금:"목",수:"화" };
    const GAN_KR6: Record<string,string> = { 甲:"갑",乙:"을",丙:"병",丁:"정",戊:"무",己:"기",庚:"경",辛:"신",壬:"임",癸:"계" };
    const JI_KR6: Record<string,string> = { 子:"자",丑:"축",寅:"인",卯:"묘",辰:"진",巳:"사",午:"오",未:"미",申:"신",酉:"유",戌:"술",亥:"해" };
    const LOVE_SCORE6: Record<string, number> = isFemale
      ? { 관성:90,편관:88,정관:92,재성:70,편재:68,정재:72,식상:75,식신:76,상관:74,인성:60,편인:58,정인:62,비겁:50,비견:50,겁재:48 }
      : { 재성:90,편재:88,정재:92,관성:70,편관:68,정관:72,식상:75,식신:76,상관:74,인성:60,편인:58,정인:62,비겁:50,비견:50,겁재:48 };
    function toSip6(ilEl: string, tEl: string): string {
      if (ilEl === tEl) return "비겁";
      if (GEN6[ilEl] === tEl) return "식상";
      if (CTL6[ilEl] === tEl) return "재성";
      if (CTL6[tEl] === ilEl) return "관성";
      if (GEN6[tEl] === ilEl) return "인성";
      return "비겁";
    }
    const ilEl6 = byPos6["일주"]?.ganEl ?? "목";
    const GANJIS6 = ["甲子","乙丑","丙寅","丁卯","戊辰","己巳","庚午","辛未","壬申","癸酉","甲戌","乙亥","丙子","丁丑","戊寅","己卯","庚辰","辛巳","壬午","癸未","甲申","乙酉","丙戌","丁亥","戊子","己丑","庚寅","辛卯","壬辰","癸巳","甲午","乙未","丙申","丁酉","戊戌","己亥","庚子","辛丑","壬寅","癸卯","甲辰","乙巳","丙午","丁未","戊申","己酉","庚戌","辛亥","壬子","癸丑","甲寅","乙卯","丙辰","丁巳","戊午","己未","庚申","辛酉","壬戌","癸亥"];
    const BASE_IDX6 = GANJIS6.indexOf("甲辰");
    const loveRows: string[] = [];
    for (let yi = 0; yi < 10; yi++) {
      const year = 2024 + yi;
      const gz = GANJIS6[(BASE_IDX6 + yi) % 60];
      const stem = gz[0]; const branch = gz[1];
      const sEl = STEM_EL6[stem]; const bEl = BRANCH_EL6[branch];
      const sip_t = sEl ? toSip6(ilEl6, sEl) : "비겁";
      const sip_b = bEl ? toSip6(ilEl6, bEl) : "비겁";
      const score = Math.min(95, Math.max(40, Math.round((LOVE_SCORE6[sip_t] ?? 55) * 0.6 + (LOVE_SCORE6[sip_b] ?? 55) * 0.4)));
      const gzKr = `${GAN_KR6[stem] ?? ""}${JI_KR6[branch] ?? ""}년`;
      loveRows.push(`${year}년 ${gzKr}: 연애점수=${score}`);
    }
    const sortedLove = loveRows.map((r, i) => ({ i, score: Number(r.split("연애점수=")[1]) })).sort((a, b) => b.score - a.score);
    const lovePeakYear = 2024 + sortedLove[0].i;
    const lovePeakGz = loveRows[sortedLove[0].i].split(" ")[1];

    const now = new Date();
    const refYear = now.getFullYear();
    const refMonth = now.getMonth() + 1;
    pillarTable += `\n[리포트 생성 기준일 — 절대 규칙, 위반 시 탈락]\n오늘: ${refYear}년 ${refMonth}월\n\n【시제 적용 — 연도별 예시】\n- ${refYear - 2}년, ${refYear - 1}년 → 이미 지난 해 → 반드시 과거형: "~이었소", "~았소", "~높았소", "~찾아왔소"\n  예) "2024년 갑진년은 연애운이 높았소" (O) / "될 것이오" (X 절대 금지)\n- ${refYear}년 → 지금 이 해 → 반드시 현재형: "~이오", "~하오", "~있소"\n  예) "2026년 병오년은 연애운이 낮아지고 있소"\n- ${refYear + 1}년 이후 → 아직 오지 않은 해 → 반드시 미래형: "~될 것이오", "~찾아오겠소"\n  예) "2027년 정미년은 연애운이 회복될 것이오"\n\n\n[기둥별 십성 확인표 — 6장 연애 풀이에서 반드시 이 값만 사용, 임의 추론 금지]\n${rows6.join("\n")}\n\n[인연성 분석 결과 — 반드시 이 결과를 그대로 사용하오]\n${loveStarResult}\n\n[2024~2033 세운별 연애운 점수표 — loveFlow 풀이에서 반드시 이 수치 기반으로만 서술]\n${loveRows.join("\n")}\n연애운 1위(정점): ${lovePeakYear}년 ${lovePeakGz} (점수=${sortedLove[0].score})\n연애운 상위: ${sortedLove.slice(1,3).map(x => `${2024+x.i}년`).join(", ")}\n연애운 하위: ${sortedLove.slice(-3).reverse().map(x => `${2024+x.i}년`).join(", ")}\n[연도 표기] '○○년 갑진년은' 형식. '가장' 최상급은 1위 연도(${lovePeakYear}년)에만 사용.\n※ 이 점수표와 다른 연도를 정점/저점으로 서술하면 절대 안 되오.\n`;
  }

  // chapter 5: 세운 재물운 점수 계산 후 주입 (프론트 WealthLineChart 동일 알고리즘)
  let wealthTable = "";
  if (chapter === 5 && input.pillars && input.pillars.length >= 2) {
    const byPos5: Record<string, typeof input.pillars[0]> = {};
    for (const p of input.pillars) byPos5[p.pos] = p;
    const ilEl5 = byPos5["일주"]?.ganEl ?? "목";
    const STEM_EL5: Record<string, string> = { 甲:"목",乙:"목",丙:"화",丁:"화",戊:"토",己:"토",庚:"금",辛:"금",壬:"수",癸:"수" };
    const BRANCH_EL5: Record<string, string> = { 子:"수",丑:"토",寅:"목",卯:"목",辰:"토",巳:"화",午:"화",未:"토",申:"금",酉:"금",戌:"토",亥:"수" };
    const GEN5: Record<string,string> = { 목:"화",화:"토",토:"금",금:"수",수:"목" };
    const CTL5: Record<string,string> = { 목:"토",화:"금",토:"수",금:"목",수:"화" };
    const SIP_SCORE5: Record<string, number> = { 재성:88,편재:90,정재:86,식신:80,상관:78,인성:65,편인:62,정인:68,비겁:55,비견:56,겁재:54,관성:60,편관:58,정관:62 };
    const SIP_NAME5: Record<string, string> = { 재성:"재성",편재:"편재",정재:"정재",식신:"식신",상관:"상관",인성:"인성",편인:"편인",정인:"정인",비겁:"비겁",비견:"비견",겁재:"겁재",관성:"관성",편관:"편관",정관:"정관" };
    function toSip5(ilEl: string, tEl: string): string {
      if (ilEl === tEl) return "비겁";
      if (GEN5[ilEl] === tEl) return "식상";
      if (CTL5[ilEl] === tEl) return "재성";
      if (CTL5[tEl] === ilEl) return "관성";
      if (GEN5[tEl] === ilEl) return "인성";
      return "비겁";
    }
    const GANJIS5 = ["甲子","乙丑","丙寅","丁卯","戊辰","己巳","庚午","辛未","壬申","癸酉","甲戌","乙亥","丙子","丁丑","戊寅","己卯","庚辰","辛巳","壬午","癸未","甲申","乙酉","丙戌","丁亥","戊子","己丑","庚寅","辛卯","壬辰","癸巳","甲午","乙未","丙申","丁酉","戊戌","己亥","庚子","辛丑","壬寅","癸卯","甲辰","乙巳","丙午","丁未","戊申","己酉","庚戌","辛亥","壬子","癸丑","甲寅","乙卯","丙辰","丁巳","戊午","己未","庚申","辛酉","壬戌","癸亥"];
    const BASE_IDX5 = GANJIS5.indexOf("甲辰"); // 2024년
    const GAN_KR5: Record<string,string> = { 甲:"갑",乙:"을",丙:"병",丁:"정",戊:"무",己:"기",庚:"경",辛:"신",壬:"임",癸:"계" };
    const JI_KR5: Record<string,string> = { 子:"자",丑:"축",寅:"인",卯:"묘",辰:"진",巳:"사",午:"오",未:"미",申:"신",酉:"유",戌:"술",亥:"해" };
    const rows5: string[] = [];
    for (let yi = 0; yi < 10; yi++) {
      const year = 2024 + yi;
      const gz = GANJIS5[(BASE_IDX5 + yi) % 60];
      const stem = gz[0]; const branch = gz[1];
      const sEl = STEM_EL5[stem]; const bEl = BRANCH_EL5[branch];
      const sip_t = sEl ? toSip5(ilEl5, sEl) : "비겁";
      const sip_b = bEl ? toSip5(ilEl5, bEl) : "비겁";
      const score = Math.round((SIP_SCORE5[sip_t] ?? 55) * 0.6 + (SIP_SCORE5[sip_b] ?? 55) * 0.4);
      const gzKr = `${GAN_KR5[stem] ?? stem}${JI_KR5[branch] ?? branch}년`;
      rows5.push(`${year}년 ${gzKr}: 천간=${SIP_NAME5[sip_t] ?? sip_t}, 지지=${SIP_NAME5[sip_b] ?? sip_b}, 재물점수=${score}`);
    }
    const sorted5 = [...rows5].map((r, i) => ({ r, i, score: Number(r.split("재물점수=")[1]) })).sort((a, b) => b.score - a.score);
    const peakYear = 2024 + sorted5[0].i;
    const peakGz = rows5[sorted5[0].i].split(" ")[1]; // "병오년" 형태
    wealthTable = `\n[2024~2033 세운별 재물운 점수표 — wealthTime 풀이에서 반드시 이 수치 기반으로만 서술]\n${rows5.join("\n")}\n재물운 1위(유일한 정점): ${peakYear}년 ${peakGz} (점수=${sorted5[0].score})\n재물운 상위: ${sorted5.slice(1,3).map(x => `${2024+x.i}년`).join(", ")}\n재물운 하위: ${sorted5.slice(-3).reverse().map(x => `${2024+x.i}년`).join(", ")}\n\n[연도 표기 규칙] 반드시 '○○년 병오년은' 형식으로 표기하오. '병화오화년' 같이 오행을 붙이거나 괄호로 묶는 표현은 절대 금지하오.\n[가장 표현 규칙] '가장 좋은', '가장 강한' 등 최상급 표현은 재물운 1위 연도(${peakYear}년)에만 단 한 번 사용하오. 2·3위 연도에는 '특히', '두드러지게' 등 다른 표현을 쓰오.\n※ 이 점수표와 다른 연도를 정점/저점으로 서술하면 절대 안 되오.\n`;
  }

  const user = `[대상] ${honor} (${input.gender === "male" ? "남성" : "여성"}) — 풀이 전체에서 이름을 부를 때 반드시 '${honor}'로만 호칭하오. '님' 호칭은 절대 사용하지 마오.

[사주 명식]
${input.manseryeokText}
${ageGuide}${pillarTable}${deungTable}${ohaengTable}${wealthTable}
위 명식을 근거로, ${honor}의 ${CH_THEME[chapter] ?? ""} 에 대한 결과지 콘텐츠를 작성하세요.
${CH_GUIDE[chapter]?.trim() ? `\n[이 장에서 특히 신경 쓸 것]\n${CH_GUIDE[chapter].trim()}\n` : ""}
아래 JSON 스키마를 정확히 채워 **유효한 JSON 만** 출력하세요 (주석/코드펜스/설명 금지, 주석(//)은 빼고 값만 채우기):

${CH_SCHEMA[chapter] ?? "{}"}`;
  return { system: SYSTEM, user };
}

// LLM 응답 텍스트 → JSON 오브젝트 (코드펜스 제거 후 파싱)
export function parseContentJson(text: string): Record<string, unknown> {
  let t = text.trim();
  t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const s = t.indexOf("{");
  const e = t.lastIndexOf("}");
  if (s >= 0 && e > s) t = t.slice(s, e + 1);
  return JSON.parse(t) as Record<string, unknown>;
}
