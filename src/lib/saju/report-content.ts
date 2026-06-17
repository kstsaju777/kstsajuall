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
  1: ["wonguk", "ohaeng", "sipseong", "unseong", "pyori"],     // 제1장 환경
  2: ["strength", "gyeokguk", "yongsin", "hapchung", "essence"], // 제2장 운명
  3: ["balance", "answer"],                                     // 제3장 관계
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

// 해당 장의 콘텐츠가 이미 생성됐는지
export function isChapterReady(content: Record<string, unknown> | null | undefined, chapter: number): boolean {
  if (!content) return false;
  const first = CHAPTER_SECTIONS[chapter]?.[0];
  return !!first && content[first] != null;
}

export type ReportPromptInput = {
  name: string;
  gender: "male" | "female";
  manseryeokText: string; // formatSajuToManseryeok 결과 (16종 풀 명식)
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
  "wonguk": { "intro": "일주의 강점/생명력 도입", "callout": "일간의 본질을 짚는 문장", "paragraphs": ["각 기둥(월/년/시) 해석","원국 전체 조화","문단"] },
  "ohaeng": { "intro": "어떤 기운이 강한지 도입", "callout": "가장 강한 오행과 의미", "paragraphs": ["성격에 주는 영향","약한 오행 보완점","조언"] },
  "sipseong": { "intro": "십성으로 본 사회적 역할 도입", "callout": "가장 활성화된 십성과 의미", "paragraphs": ["그 십성의 강점","어떤 일에서 빛나는지","문단"] },
  "unseong": { "intro": "십이운성 도입", "callout": "일주 등 핵심 운성과 기운", "paragraphs": ["기운의 특징","주의점/조언"] },
  "pyori": { "intro": "겉과 속이 다를 수 있다는 도입", "callout": "겉모습 vs 속마음 핵심 대비", "paragraphs": ["밖에서 보는 모습","실제 내면의 모습"] }
}`,
  2: `{
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
  3: `{
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
  6: `{
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

// 한 장(chapter)의 콘텐츠만 생성하는 프롬프트 (장별 병렬 호출용)
export function buildChapterPrompt(chapter: number, input: ReportPromptInput): { system: string; user: string } {
  const honor = input.name?.trim() ? `${input.name}님` : "이분";
  const user = `[대상] ${honor} (${input.gender === "male" ? "남성" : "여성"})

[사주 명식]
${input.manseryeokText}

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
