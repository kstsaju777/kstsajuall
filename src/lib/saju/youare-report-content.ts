// =====================================================
// 유아사주 결과지 — 장별 풀이 프롬프트 & 구조
// =====================================================

import { SYSTEM } from "./report-prompts";

// ── 장별 필수 섹션 키 ──
export const YOUARE_CHAPTER_SECTIONS: Record<number, string[]> = {
  1: ["personality"],
  2: ["health"],
  3: ["parenting"],
  4: ["namingGuide"],
  5: ["talent"],
  6: ["cautionPeriod"],
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
    if ("weakPoints" in v) return Array.isArray(v.weakPoints) && (v.weakPoints as unknown[]).length > 0 && "healthTips" in v && Array.isArray(v.healthTips) && (v.healthTips as unknown[]).length > 0;
    if ("parentingStyles" in v) return Array.isArray(v.parentingStyles) && (v.parentingStyles as unknown[]).length > 0 && "parentingTips" in v && Array.isArray(v.parentingTips) && (v.parentingTips as unknown[]).length > 0;
    if ("paragraphs" in v) return Array.isArray(v.paragraphs) && (v.paragraphs as unknown[]).length > 0;
    if ("tips" in v) return Array.isArray(v.tips) && (v.tips as unknown[]).length > 0;
    if ("talentFields" in v) return Array.isArray(v.talentFields) && (v.talentFields as unknown[]).length > 0 && "talentTips" in v && Array.isArray(v.talentTips) && (v.talentTips as unknown[]).length > 0;
    if ("fields" in v) return Array.isArray(v.fields) && (v.fields as unknown[]).length > 0;
    if ("items" in v) return Array.isArray(v.items) && (v.items as unknown[]).length > 0;
    if ("namingAdvice" in v && !("weakPoints" in v)) return Array.isArray(v.namingAdvice) && (v.namingAdvice as unknown[]).length > 0 && "colors" in v && Array.isArray(v.colors) && (v.colors as unknown[]).length > 0;
    if ("colors" in v) return Array.isArray(v.colors) && (v.colors as unknown[]).length > 0;
    if ("elements" in v) return Array.isArray(v.elements) && (v.elements as unknown[]).length > 0;
    if ("cautionPeriods" in v) return Array.isArray(v.cautionPeriods) && (v.cautionPeriods as unknown[]).length > 0 && "cautionTips" in v && Array.isArray(v.cautionTips) && (v.cautionTips as unknown[]).length > 0;
    if ("periods" in v) return Array.isArray(v.periods) && (v.periods as unknown[]).length > 0;
    if ("element" in v) return typeof v.element === "string" && (v.element as string).length > 0;
    return false;
  });
}

// ── 장별 주제 ──
const YOUARE_CH_THEME: Record<number, string> = {
  1: "[제1장 기질] 이 아이는 어떤 기질로 태어났나 — 일간 오행, 신강·신약, 타고난 성격과 행동 패턴",
  2: "[제2장 건강] 아이의 건강과 주의할 부분 — 오행 취약점, 주의 신체 부위, 건강 관리 지침",
  3: "[제3장 양육] 잘 맞는 양육 환경과 방식 — 아이 기질에 맞는 교육·환경·부모의 역할",
  4: "[제4장 이름·색·방향] 아이에게 맞는 이름·색·방향 — 용신 오행 기반 이름 조건, 길한 색깔, 길한 방향",
  5: "[제5장 재능] 성장하면서 두드러질 재능 — 십성·오행으로 보는 타고난 강점과 계발 방향",
  6: "[제6장 시기] 부모가 조심해야 할 시기 — 대운·세운 흐름에서 주의할 성장 구간과 부모의 대처법",
  7: "[마무리] 홍연의 서신 — 유아사주 풀이를 마치며 부모에게 전하는 따뜻한 손편지",
};

// ── 장별 추가 지시 ──
const YOUARE_CH_GUIDE: Record<number, string> = {
  1: `[personality 섹션 — 기질과 성격]
- sinDesc: 신강·신약 해석 1단락. 이 아이의 일간 기운이 강한지 약한지, 그것이 성격에 어떤 영향을 주는지. 3~4문장.
- ohaengDesc: 오행 균형 해석 1단락. 가장 강한 오행과 부족한 오행이 아이의 기질에 어떻게 드러나는지. 3~4문장.
- ilganDesc: 일간 심층 해석 1단락. 일간의 재질이 이 아이에게 구체적으로 어떻게 발현되는지. 3~4문장.
- keywords: 기질 키워드 3개 (단어 형태, 예: "창의적", "섬세함", "리더십").
- cards: 기질 카드 3개. 각 card: icon(이모지), title(기질 제목), desc(2~3문장 설명).
- traits: 성향 점수 4~5개. 각 trait: label(성향명), score(0~100 사이 숫자). 예: "사교성 vs 내향성", "감수성", "집중력", "활동성".
- traitDesc: 성향 분석 종합 1단락. 점수 패턴을 바탕으로 이 아이의 성향을 종합 해석. 3~4문장.
【말투 엄수】 홍연 말투(~이오/~하오/~겠소/~했소). "~ㅂ니다" "~어요" 절대 금지.`,

  2: `[health 섹션 — 건강]
- intro: 이 아이의 건강에서 가장 주의할 오행·기질적 포인트 한 줄. (1문장)
- callout: 건강과 관련된 오행 취약점 핵심 한 문장.
- paragraphs 2개: ①오행과 기질로 본 이 아이의 건강 전반 특성, 어떤 체질인지. ②건강한 아이로 키우기 위해 부모가 일상에서 실천해야 할 것들. 각 단락 4~6문장, 150자 이상.
- weakPoints: 주의할 신체 부위 2~3개. 각 항목: icon(이모지), part(신체 부위명), desc(왜 취약한지, 어떻게 돌봐야 하는지 2~3문장, 80자 이상).
- healthTips: 건강 관리 실천 팁 4~5개. 한 줄씩이 아닌 각 팁마다 2~3문장 분량으로 구체적이고 실천 가능하게.
【말투 엄수】 홍연 말투(~이오/~하오/~겠소/~했소). "~ㅂ니다" "~어요" 절대 금지.`,

  3: `[parenting 섹션 — 양육 환경과 방식]
- intro: 이 아이의 기질에서 비롯된 양육 방향 핵심 한 줄. (1문장)
- callout: 부모가 반드시 기억해야 할 양육 원칙 핵심 한 문장.
- paragraphs 2개:
  ①이 아이의 기질과 사주 특성이 양육 환경에 미치는 영향. 어떤 분위기, 어떤 방식이 이 아이의 잠재력을 꽃피우는지. 각 5~7문장, 200자 이상.
  ②부모와 아이의 관계 방향. 어떤 방식으로 대화하고 훈육해야 하는지, 주의해야 할 것은 무엇인지. 5~7문장, 200자 이상.
- parentingStyles: 이 아이에게 잘 맞는 양육 환경 유형 4개. 각 항목: icon(이모지), name(환경 유형명, 3~5자), desc(왜 이 아이에게 맞는지 2문장).
- parentingTips: 부모를 위한 실천 지침 4~5개. 한 줄이 아니라 각 팁마다 2~3문장 분량으로 구체적이고 실천 가능하게.
- parentingAdvice: 부모에게 전하는 홍연의 한 마디. 따뜻하고 격려하는 어조로 3~4문장.
【말투 엄수】 홍연 말투(~이오/~하오/~겠소/~했소). "~ㅂ니다" "~어요" 절대 금지.`,

  4: `[namingGuide 섹션 — 이름·색·방향]
- intro: 이 아이의 용신 오행을 바탕으로 이름에 담아야 할 기운 핵심 한 줄. (1문장)
- callout: 용신 오행과 이름의 연결 — 부모가 반드시 알아야 할 핵심 원칙 한 문장.
- yongshinDesc: 용신 오행이 무엇인지, 왜 이름에서 중요한지 설명하는 풀이 단락. 4~6문장, 150자 이상.
- namingAdvice: 이름 짓기 조언 3개. 각 항목: icon(이모지), title(조언 제목 3~5자), desc(구체적인 설명 2~3문장 — 어떤 한자 뜻·소리·획수가 좋은지, 왜 그런지 근거 포함).
- namingDesc: 이름 짓기 풀이 단락. 위 조언들을 종합하여 이름이 아이의 인생에 미치는 영향. 4~5문장, 150자 이상.
- colors: 길한 색깔 3개. 각 color: name(색 이름), hex(정확한 헥스코드), reason(왜 길한지 한 줄).
- colorDesc: 색깔 풀이 단락. 이 색깔들이 아이에게 어떤 에너지를 주는지, 일상에서 어떻게 활용하면 좋은지. 3~4문장.
- directions: 길한 방향 4개. 각 direction: name(방위명 + 설명, 예: "동쪽 — 아침 햇살"), icon(방위 이모지 또는 관련 이모지), reason(왜 좋은지 한 줄).
- directionDesc: 방향 풀이 단락. 집 배치·아이 방 위치·책상 방향 등 실생활 적용법. 3~4문장.
【말투 엄수】 홍연 말투(~이오/~하오/~겠소/~했소). "~ㅂ니다" "~어요" 절대 금지.`,

  5: `[talent 섹션 — 재능]
- intro: 이 아이가 타고난 재능의 방향 핵심 한 줄. (1문장)
- callout: 재능과 연결된 십성·오행 핵심 한 문장.
- paragraphs 3개: ①오행·십성으로 본 강점 분야 전반 해설 (5~7문장, 200자 이상) ②각 재능 분야가 어떻게 발현되는지 심화 분석 (5~7문장, 200자 이상) ③성장하면서 언제쯤 어떤 방식으로 재능이 드러나는지 시기·환경 설명 (5~7문장, 200자 이상).
- talentFields: 두드러질 재능 분야 4개. 각 항목: icon(이모지), name(분야명 3~5자), desc(2문장. 왜 이 분야에 강한지 사주 근거와 어떻게 발현되는지 구체적으로).
- talentTips: 재능을 키우는 방법 4~5개. 각 항목은 한 줄이 아닌 2~3문장으로 구체적이고 실천 가능한 조언. (1문장짜리 금지)
- talentAdvice: 부모에게 전하는 재능 계발 당부 1단락. 아이의 재능을 어떻게 바라보고 지지해야 하는지 따뜻하고 격려하는 어조로. 3~4문장.
【말투 엄수】 홍연 말투(~이오/~하오/~겠소/~했소). "~ㅂ니다" "~어요" 절대 금지.`,

  6: `[cautionPeriod 섹션 — 주의 시기]
화면에는 만 0세~15세 성장 기운 꺾은선 그래프가 표시되오. 그래프는 대운 간지와 일간의 십성 관계를 기반으로 자동 계산되며, 인성·비겁 대운이면 + 구간(순탄), 관성·재성 대운이면 − 구간(주의)으로 나타나오. 아래 풀이는 반드시 이 그래프의 흐름(대운 순서, 기운의 높고 낮음)을 그대로 반영하여 작성하시오.

- intro: 이 아이의 성장 기운 흐름 핵심 한 줄. 그래프 전체 흐름을 압축한 문장. (1문장)
- callout: 가장 주의해야 할 대운 시기와 그 이유 핵심 한 문장.
- paragraphs 3개:
  ①대운의 흐름 원리 설명 — 이 아이 사주에서 대운이 어떤 순서로 흐르는지, 어떤 십성 대운이 순탄하고 어떤 대운이 부담스러운지 원리를 설명하오. 그래프의 + 구간과 − 구간이 왜 그렇게 나타나는지 근거를 들어 설명하시오. (5~7문장, 200자 이상)
  ②그래프 흐름 해설 — 만 0세부터 만 15세까지 그래프의 기복을 순서대로 따라가며, 어느 시기에 기운이 오르고 어느 시기에 내려오는지 구체적으로 서술하오. 부모가 각 시기에 무엇을 기대하고 준비해야 하는지 연결하시오. (5~7문장, 200자 이상)
  ③큰 흐름의 시각 — 주의 시기가 있더라도 아이의 성장은 이어진다는 것, 그리고 이 아이가 가진 전반적인 성장 잠재력을 긍정적으로 마무리하시오. (4~5문장, 150자 이상)
- cautionPeriods: 그래프에서 특징적인 시기 3~4개. tone은 그래프의 − 구간이면 "warn", + 구간이면 "good"으로 지정하오. 각 항목: icon(이모지), label(연령대, 예: "만 3~5세"), tone("warn"/"good"), title(이 시기의 성격 제목 5~8자), desc(이 시기 대운 기운과 아이에게 어떤 변화가 생기는지, 부모가 어떻게 대응해야 하는지 2~3문장, 80자 이상).
- cautionTips: 부모가 미리 준비하고 실천할 것 4~5개. 각 항목은 2~3문장으로 구체적이고 실용적인 조언. (1문장짜리 금지)
- cautionAdvice: 부모에게 전하는 시기 관련 당부. 걱정보다 준비가 중요하다는 것, 그래프의 흐름을 알고 있으면 미리 준비할 수 있다는 메시지. 따뜻하고 격려하는 어조로 3~4문장.
【말투 엄수】 홍연 말투(~이오/~하오/~겠소/~했소). "~ㅂ니다" "~어요" 절대 금지.`,

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
  "personality": {
    "sinDesc": "신강·신약 해석 단락 (3~4문장)",
    "ohaengDesc": "오행 균형 해석 단락 (3~4문장)",
    "ilganDesc": "일간 심층 해석 단락 (3~4문장)",
    "keywords": ["키워드1", "키워드2", "키워드3"],
    "cards": [
      { "icon": "🌱", "title": "기질 제목", "desc": "기질 설명 2~3문장" },
      { "icon": "✨", "title": "기질 제목", "desc": "기질 설명 2~3문장" },
      { "icon": "🎯", "title": "기질 제목", "desc": "기질 설명 2~3문장" }
    ],
    "traits": [
      { "label": "성향명", "score": 75 },
      { "label": "성향명", "score": 60 },
      { "label": "성향명", "score": 85 },
      { "label": "성향명", "score": 50 }
    ],
    "traitDesc": "성향 분석 종합 단락 (3~4문장)"
  }
}`,
  2: `{
  "health": {
    "intro": "건강 주의 핵심 한 줄 (1문장)",
    "callout": "취약 오행·신체 핵심 한 문장",
    "paragraphs": ["단락1 (4~6문장, 체질과 건강 특성)", "단락2 (4~6문장, 부모의 실천 방향)"],
    "weakPoints": [
      { "icon": "🫁", "part": "신체 부위명", "desc": "취약한 이유와 관리법 2~3문장" },
      { "icon": "🦷", "part": "신체 부위명", "desc": "취약한 이유와 관리법 2~3문장" },
      { "icon": "🧠", "part": "신체 부위명", "desc": "취약한 이유와 관리법 2~3문장" }
    ],
    "healthTips": [
      "팁1 — 2~3문장 분량으로 구체적으로",
      "팁2 — 2~3문장 분량으로 구체적으로",
      "팁3 — 2~3문장 분량으로 구체적으로",
      "팁4 — 2~3문장 분량으로 구체적으로"
    ]
  }
}`,
  3: `{
  "parenting": {
    "intro": "양육 방향 핵심 한 줄 (1문장)",
    "callout": "부모가 반드시 기억해야 할 양육 원칙 한 문장",
    "paragraphs": [
      "단락1 — 기질과 사주 특성이 양육 환경에 미치는 영향 (5~7문장, 200자 이상)",
      "단락2 — 부모와 아이의 관계·대화·훈육 방향 (5~7문장, 200자 이상)"
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
  "namingGuide": {
    "intro": "용신 오행 기반 이름 방향 핵심 한 줄 (1문장)",
    "callout": "부모가 반드시 알아야 할 이름 원칙 한 문장",
    "yongshinDesc": "용신 오행 의미와 이름에서의 중요성 풀이 단락 (4~6문장, 150자 이상)",
    "namingAdvice": [
      { "icon": "✍️", "title": "조언 제목", "desc": "구체적인 설명 2~3문장 (한자 뜻·소리·획수 근거 포함)" },
      { "icon": "🔤", "title": "조언 제목", "desc": "구체적인 설명 2~3문장 (한자 뜻·소리·획수 근거 포함)" },
      { "icon": "⚡", "title": "조언 제목", "desc": "구체적인 설명 2~3문장 (한자 뜻·소리·획수 근거 포함)" }
    ],
    "namingDesc": "이름 종합 풀이 단락 (4~5문장, 150자 이상)",
    "colors": [
      { "name": "색 이름", "hex": "#RRGGBB", "reason": "왜 길한지 한 줄" },
      { "name": "색 이름", "hex": "#RRGGBB", "reason": "왜 길한지 한 줄" },
      { "name": "색 이름", "hex": "#RRGGBB", "reason": "왜 길한지 한 줄" }
    ],
    "colorDesc": "색깔 풀이 + 일상 활용법 단락 (3~4문장)",
    "directions": [
      { "name": "동쪽 — 아침 햇살 방향", "icon": "🌅", "reason": "왜 길한지 한 줄" },
      { "name": "남쪽 — 밝은 양기 방향", "icon": "☀️", "reason": "왜 길한지 한 줄" },
      { "name": "서쪽 — 결실의 방향", "icon": "🌇", "reason": "왜 길한지 한 줄" },
      { "name": "북쪽 — 고요한 수기", "icon": "🌊", "reason": "왜 길한지 한 줄" }
    ],
    "directionDesc": "방향 풀이 + 집 배치·아이 방·책상 방향 적용법 단락 (3~4문장)"
  }
}`,
  5: `{
  "talent": {
    "intro": "재능 방향 핵심 한 줄 (1문장)",
    "callout": "재능 십성·오행 핵심 한 문장",
    "paragraphs": ["단락1 — 오행·십성으로 본 강점 분야 전반 (5~7문장)", "단락2 — 재능 분야 심화 분석 (5~7문장)", "단락3 — 시기·환경에 따른 재능 발현 (5~7문장)"],
    "talentFields": [
      { "icon": "🎨", "name": "분야명", "desc": "2문장. 왜 강한지 근거 + 어떻게 발현되는지" },
      { "icon": "🎵", "name": "분야명", "desc": "2문장. 왜 강한지 근거 + 어떻게 발현되는지" },
      { "icon": "📚", "name": "분야명", "desc": "2문장. 왜 강한지 근거 + 어떻게 발현되는지" },
      { "icon": "🌿", "name": "분야명", "desc": "2문장. 왜 강한지 근거 + 어떻게 발현되는지" }
    ],
    "talentTips": [
      "팁1 (2~3문장, 구체적 실천 방법)",
      "팁2 (2~3문장, 구체적 실천 방법)",
      "팁3 (2~3문장, 구체적 실천 방법)",
      "팁4 (2~3문장, 구체적 실천 방법)"
    ],
    "talentAdvice": "부모에게 전하는 재능 계발 당부 (3~4문장, 따뜻하고 격려하는 어조)"
  }
}`,
  6: `{
  "cautionPeriod": {
    "intro": "주의 시기 핵심 한 줄 (1문장)",
    "callout": "주의 시기 공통 특징 한 문장",
    "paragraphs": ["단락1 — 대운·세운 원리 설명 (5~7문장)", "단락2 — 부모의 구체적 대처법 (5~7문장)", "단락3 — 큰 흐름의 긍정적 시각 (4~6문장)"],
    "cautionPeriods": [
      { "icon": "🌱", "label": "만 2~4세", "tone": "warn", "title": "시기 제목 5~8자", "desc": "이 시기 기운과 부모 주의사항 2~3문장" },
      { "icon": "🌤", "label": "만 5~7세", "tone": "good", "title": "시기 제목 5~8자", "desc": "이 시기 기운과 부모 주의사항 2~3문장" },
      { "icon": "⚡", "label": "만 10~12세", "tone": "warn", "title": "시기 제목 5~8자", "desc": "이 시기 기운과 부모 주의사항 2~3문장" }
    ],
    "cautionTips": [
      "팁1 (2~3문장, 구체적 실천 방법)",
      "팁2 (2~3문장, 구체적 실천 방법)",
      "팁3 (2~3문장, 구체적 실천 방법)",
      "팁4 (2~3문장, 구체적 실천 방법)"
    ],
    "cautionAdvice": "부모에게 전하는 시기 관련 당부 (3~4문장, 따뜻하고 격려하는 어조)"
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
  }
): { system: string; user: string } {
  const theme = YOUARE_CH_THEME[chapter] ?? `[제${chapter}장]`;
  const guide = YOUARE_CH_GUIDE[chapter] ?? "";
  const schema = YOUARE_CH_SCHEMA[chapter] ?? "{}";
  const childLabel = input.name ? `${input.name} 아이` : "이 아이";
  const currentYear = new Date().getFullYear();

  // ch6: 그래프 데이터를 프롬프트에 주입
  let graphData = "";
  if (chapter === 6 && input.seun && input.ilganChar && input.birthYear) {
    graphData = `\n\n${computeGrowthData(input.ilganChar, input.birthYear, input.seun)}\n`;
  }

  const user = `아래는 ${childLabel}의 사주 명식입니다.

${input.manseryeokText}
${input.birthYear ? `\n출생연도: ${input.birthYear}년 / 현재연도: ${currentYear}년` : `\n현재연도: ${currentYear}년`}
${graphData}
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
