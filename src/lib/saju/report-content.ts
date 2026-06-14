// =====================================================
// 문학형 결과지 구조화 콘텐츠 (Chapter 1)
// =====================================================
// LLM이 명식(만세력 텍스트) 기반으로 아래 JSON 구조를 채운다.
// report-preview 의 문학형 섹션이 이 데이터로 렌더된다(결제자별 실제 풀이).
//
// 차트 수치/대운 간지는 실제 명식 데이터에서 오고, LLM은 "문장(prose)"과
// 각 시기의 작용 설명만 생성한다.

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
  sipseong: ReportSection;  // 십성으로 보는 타고난 역할
  unseong: ReportSection;   // 십이운성으로 보는 기운의 세기
  pyori: ReportSection;     // 밖에서 보는 나와 실제의 나
  // ── 3장: 나는 왜 이런 사람인 걸까 (사주 속 필연구조) ──
  strength: ReportSection;  // 신강·신약
  gyeokguk: ReportSection;  // 격국
  yongsin: ReportSection;   // 용신
  hapchung: ReportSection;  // 합·충
  essence: ReportSection;   // 그래서, 내가 진짜 원하는 것
  // ── 4장: 내 사주는 얼마나 희귀할까 ──
  rarity: ReportRarity;     // 발현 확률(등급/백분율 포함)
  special: ReportSpecial;   // 이 사주가 드문 이유(태그 + 강조문단)
  // ── 5장: 세상을 대하는 나만의 방식 ──
  balance: ReportSection & { spectrum: { label: string; value: number } }; // 독립↔협력 균형(0=독립, 100=협력)
  answer: ReportSection;    // 삶의 해답이 어디에 있는지
  // ── 6장: 앞으로 10년, 어떻게 흘러갈까 ──
  daeFlow: ReportSection;   // 대운으로 보는 10년의 큰 흐름
  seun: ReportSection & { flow: { year: number; score: number }[] }; // 세운(해마다) + 10년 운세 라인
  openLuck: ReportSection & { peak: { title: string; when: string; todo: string } }; // 운이 풀리는 결정적 시점
  domains: { intro: string; paragraphs: string[]; bars: { label: string; value: number }[] }; // 영역별 운세 강도
  // ── 7장: 재물·직업운 정밀풀이 ──
  wealthTime: ReportSection & { bars: { year: number; amount: string; value: number }[] }; // 향후 5년 재물운(연도/금액/상대크기)
  jobFit: ReportSection & { jobs: { title: string; desc: string }[] }; // 내게 맞는 직업 TOP 3
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
};

// 장 ↔ 포함 섹션 (장별 온디맨드 생성/완료 판정용)
export const CHAPTER_SECTIONS: Record<number, string[]> = {
  1: ["hardSeason", "cause", "pattern"],
  2: ["wonguk", "ohaeng", "sipseong", "unseong", "pyori"],
  3: ["strength", "gyeokguk", "yongsin", "hapchung", "essence"],
  4: ["rarity", "special"],
  5: ["balance", "answer"],
  6: ["daeFlow", "seun", "openLuck", "domains"],
  7: ["wealthTime", "jobFit", "jobType", "invest"],
  8: ["loveStyle", "loveFlow", "spouse", "marriage"],
  9: ["bodyWeak", "riskTime", "healthCare"],
};

// 해당 장의 콘텐츠가 이미 생성됐는지
export function isChapterReady(content: Record<string, unknown> | null | undefined, chapter: number): boolean {
  if (!content) return false;
  const first = CHAPTER_SECTIONS[chapter]?.[0];
  return !!first && content[first] != null;
}

const SYSTEM = `당신은 30년 경력의 따뜻한 사주 명리학 상담가입니다.
주어진 사주 명식을 근거로, 한 사람의 '지나온 삶'을 문학적이면서도 공감 가는 톤으로 풀어냅니다.

원칙:
- 반드시 명식(천간지지/십성/대운/신살 등)에 근거해 해석합니다. 막연한 일반론 금지.
- 단정적 운명론은 피하고 가능성·경향으로 표현하며, 부정적 내용도 따뜻한 위로/방향으로 마무리합니다.
- 한국어 존댓말. 상담가가 내담자에게 말하듯 친근하게.
- callout 에는 핵심 사주 용어(예: 계유 대운, 자수 편인, 묘신원진 등)를 자연스럽게 1~2개 넣습니다.
- 반드시 아래 JSON 스키마에 정확히 맞는 "유효한 JSON 만" 출력합니다. 코드펜스/설명 금지.`;

export type ReportPromptInput = {
  name: string;
  gender: "male" | "female";
  manseryeokText: string; // formatSajuToManseryeok 결과 (16종 풀 명식)
};

// 장별 주제 + JSON 스키마 (병렬 생성용)
const CH_THEME: Record<number, string> = {
  1: "'지나온 시간' — 과거의 흐름, 유독 힘들었던 시기, 반복되어 온 패턴",
  2: "'타고난 본바탕' — 원국 종합, 오행 균형, 십성 역할, 십이운성, 겉과 속",
  3: "'왜 이런 사람인가(사주 속 필연구조)' — 신강/신약, 격국, 용신, 합·충, 핵심 갈망",
  4: "'내 사주는 얼마나 희귀한가' — 명식의 희소성/등급, 귀인·신살·합충이 만드는 특별함",
  5: "'세상을 대하는 나만의 방식' — 독립과 협력 사이의 균형, 삶의 갈등을 푸는 해답",
  6: "'앞으로 10년, 어떻게 흘러갈까' — 현재 진행 중인 대운으로 보는 10년의 큰 흐름",
  7: "'재물·직업운 정밀풀이' — 큰돈이 들어오는 시점, 향후 5년 재물운",
  8: "'연애·결혼운 정밀풀이' — 사랑하는 방식, 시기별 연애 흐름",
  9: "'건강운 정밀풀이' — 타고난 약한 부위, 부위별 주의 신호",
};

const CH_SCHEMA: Record<number, string> = {
  1: `{
  "hardSeason": { "intro": "유독 힘들었던 시기 도입 1~2문장", "callout": "특정 대운/시기를 짚는 핵심 문장(사주 용어 포함)", "paragraphs": ["문단","문단","문단"] },
  "cause": { "intro": "왜 힘들었는지 도입", "callout": "월지/일간 등 원국 구조로 원인을 짚는 문장", "paragraphs": ["문단","문단","문단"],
    "flow": [ {"label":"20대 중반","tone":"warn","text":"그 시기 운 작용 한 줄"}, {"label":"현재","tone":"good","text":"한 줄"} ] },
  "pattern": { "intro": "반복 패턴 도입", "callout": "반복 패턴 핵심 문장", "paragraphs": ["문단","문단"],
    "summary": [ {"title":"핵심 키워드","desc":"한 줄 설명"} ] }
}`,
  2: `{
  "wonguk": { "intro": "일주의 강점/생명력 도입", "callout": "일간의 본질을 짚는 문장", "paragraphs": ["각 기둥(월/년/시) 해석","원국 전체 조화","문단"] },
  "ohaeng": { "intro": "어떤 기운이 강한지 도입", "callout": "가장 강한 오행과 의미", "paragraphs": ["성격에 주는 영향","약한 오행 보완점","조언"] },
  "sipseong": { "intro": "십성으로 본 사회적 역할 도입", "callout": "가장 활성화된 십성과 의미", "paragraphs": ["그 십성의 강점","어떤 일에서 빛나는지","문단"] },
  "unseong": { "intro": "십이운성 도입", "callout": "일주 등 핵심 운성과 기운", "paragraphs": ["기운의 특징","주의점/조언"] },
  "pyori": { "intro": "겉과 속이 다를 수 있다는 도입", "callout": "겉모습 vs 속마음 핵심 대비", "paragraphs": ["밖에서 보는 모습","실제 내면의 모습"] }
}`,
  3: `{
  "strength": { "intro": "본질적 힘의 강도(신강/신약) 도입", "callout": "통근/득령 등으로 힘의 강도를 짚는 문장(사주 용어 포함)", "paragraphs": ["신강(또는 신약)의 특징","장점","안으로 뭉칠 때의 주의점/조언"] },
  "gyeokguk": { "intro": "사회적 그릇(격국) 도입", "callout": "월지 중심 격국명과 특징", "paragraphs": ["그 격국이 원하는 자리","제대로 발현될 때 모습","채워지지 않을 때 주의점"] },
  "yongsin": { "intro": "가장 필요한 기운(용신) 도입", "callout": "용신 오행과 그 의미", "paragraphs": ["용신이 주는 역할","희신 보완","일상 실천 조언"] },
  "hapchung": { "intro": "끌어당기고 뒤흔드는 합·충 도입", "callout": "주요 원진/합/충과 작용(사주 용어 포함)", "paragraphs": ["부정적 작용과 경계점","긍정적 작용(육합 등)","중심을 잡는 법"] },
  "essence": { "intro": "사주 종합 도입", "callout": "진짜 원하는 단 하나의 본질(따옴표로 인용)", "paragraphs": ["왜 그것을 갈망하는지","채워질 때의 모습","격려 마무리"] }
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
  5: `{
  "balance": {
    "intro": "세상을 살아갈 때 독립적 주체성과 타인과의 협력 사이에서 어떻게 균형을 잡는지 도입 1~2문장",
    "callout": "비견/겁재(독립)와 정관/식상 등(협력) 중 어디에 더 무게가 실리는지 짚는 문장(사주 용어 포함)",
    "paragraphs": ["두 성향이 어떻게 조화를 이루는지","독립 쪽 성향이 강할 때의 모습과 강점","협력을 받아들일 때 얻는 것"],
    "spectrum": { "label": "혼자 힘으로 살아가는 나", "value": 30 }
  },
  "answer": {
    "intro": "삶의 갈등과 문제를 마주칠 때 해답을 어디서 찾는지 도입",
    "callout": "강한 주체성을 지키되 타인의 조언·사회적 규칙(정관 등)을 유연하게 받아들이는 화합의 지혜를 짚는 문장",
    "paragraphs": ["혼자 결정하되 고립되지 않는 법","주변의 예법·규율을 내 것으로 소화하는 법","뿌리(독립)와 가지(소통)가 함께 자랄 때 모습"]
  }
}`,
  6: `{
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
  7: `{
  "wealthTime": {
    "intro": "재물운이 어느 나이대로 갈수록 단단해지고 풍요로워지는지 흐름을 짚는 도입",
    "callout": "큰돈을 만질 최고의 시기(연도+간지 한자)와 용신/희신(쇠·흙 등) 작용을 짚는 문장",
    "paragraphs": ["그 시기 자산 가치 상승/투자 수익","상관 등 과해질 때 주의할 해와 투기·지출 리스크","장기적·안정적 자산관리 원칙 조언"],
    "bars": [
      {"year":2026,"amount":"1억 5천","value":15}, {"year":2027,"amount":"2억 5천","value":25},
      {"year":2028,"amount":"6억","value":60}, {"year":2029,"amount":"5억","value":50}, {"year":2030,"amount":"2억","value":20}
    ]
  },
  "jobFit": {
    "intro": "어떤 일에서 가장 큰 성과를 내는지(타고난 적성)를 짚는 도입",
    "callout": "강점(틈새 포착·전문성 브랜드화 등)을 십성 근거로 짚는 문장",
    "paragraphs": ["맞지 않는 환경(단순 반복/지시)에서의 한계","전문성을 갈고닦아 증명할 때 따르는 명예·성취"],
    "jobs": [
      {"title":"직업명 1","desc":"왜 잘 맞는지 한 줄"},
      {"title":"직업명 2","desc":"왜 잘 맞는지 한 줄"},
      {"title":"직업명 3","desc":"왜 잘 맞는지 한 줄"}
    ]
  },
  "jobType": {
    "intro": "직장인 길과 사업가 길 중 어디에 더 강한지 도입",
    "callout": "비견/상관 등으로 독립·주도 성향을 짚는 문장",
    "paragraphs": ["직장 생활을 할 때 필요한 환경(독자적 프로젝트 등)","장기적으로 권하는 독립/1인 기업 방향"],
    "split": { "leftLabel":"직장인 팔자","left":40,"rightLabel":"사업가 팔자","right":60,"leftDesc":"안정적이지만 답답함을 느끼기 쉬워요","rightDesc":"주도적으로 판을 짤 때 성과가 극대화돼요" }
  },
  "invest": {
    "intro": "어떤 재테크 방식이 가장 잘 맞는지(투기성 vs 실물 안정형) 짚는 도입",
    "callout": "용신 오행(흙·쇠 등)을 근거로 부동산·장기채권·우량주 등 안전한 투자처를 짚는 문장",
    "paragraphs": ["상관의 충동적 기운이 부르는 투자 리스크와 경계점","철저한 분석·이성적 기준으로 장기 포트폴리오를 굴릴 때의 결실"]
  }
}`,
  8: `{
  "loveStyle": {
    "intro": "연애할 때 상대를 대하는 태도(다정함·배려 등)를 짚는 도입",
    "callout": "강점(상관의 표현력 등)으로 연인을 사로잡는 매력을 짚는 문장(십성 근거)",
    "paragraphs": ["사생활·독립 영역을 침범받기 싫어하는 까다로운 면","겉과 속의 고집/선, 넘어서면 마음을 닫는 면","서로의 독립성을 존중하며 깊은 교감을 갈망하는 지향"]
  },
  "loveFlow": {
    "intro": "앞으로 1년간 찾아올 연애·인연의 흐름(하반기로 갈수록 강해짐 등) 도입",
    "callout": "특히 좋은 시기(연도+계절+간지/용신)와 인연을 만날 확률을 짚는 문장",
    "flow": [ {"label":"6월","score":55}, {"label":"7월","score":60}, {"label":"8월","score":78}, {"label":"9월","score":88}, {"label":"10월","score":72}, {"label":"11월","score":62}, {"label":"12월","score":56}, {"label":"1월","score":60} ],
    "peakCallout": "연애운이 정점에 달하는 달(연도+월+간지)과 운명의 상대가 나타날 가능성을 짚는 문장",
    "paragraphs": ["그 달의 매력(도화살 등)과 관계 발전","어떤 장소·계기에서 인연을 만나게 되는지"]
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
  9: `{
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
};

// 한 장(chapter)의 콘텐츠만 생성하는 프롬프트 (장별 병렬 호출용)
export function buildChapterPrompt(chapter: number, input: ReportPromptInput): { system: string; user: string } {
  const honor = input.name?.trim() ? `${input.name}님` : "이분";
  const user = `[대상] ${honor} (${input.gender === "male" ? "남성" : "여성"})

[사주 명식]
${input.manseryeokText}

위 명식을 근거로, ${honor}의 ${CH_THEME[chapter] ?? ""} 에 대한 결과지 콘텐츠를 작성하세요.
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
