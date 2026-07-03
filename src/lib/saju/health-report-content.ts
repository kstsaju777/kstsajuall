// =====================================================
// 건강사주 결과지 — 장별 풀이 프롬프트 & 구조
// =====================================================

import { SYSTEM } from "./report-prompts";

// ── 장별 필수 섹션 키 ──
export const HEALTH_CHAPTER_SECTIONS: Record<number, string[]> = {
  1: ["constitution"],
  2: ["weakParts"],
  3: ["diseases"],
  4: ["lifestyle"],
  5: ["healthFlow"],
  6: ["remedy"],
  7: ["letter"],
};

// ── 장 완성 여부 확인 ──
export function isHealthChapterReady(
  content: Record<string, unknown> | null | undefined,
  chapter: number
): boolean {
  if (!content) return false;
  const keys = HEALTH_CHAPTER_SECTIONS[chapter] ?? [];
  return keys.every((k) => {
    const val = content[k];
    if (!val || typeof val !== "object") return false;
    const v = val as Record<string, unknown>;
    if ("constitutionTraits" in v) return Array.isArray(v.constitutionTraits) && (v.constitutionTraits as unknown[]).length > 0 && "constitutionType" in v && "constitutionCautions" in v && Array.isArray(v.constitutionCautions) && (v.constitutionCautions as unknown[]).length > 0;
    if ("bodySignals" in v) return Array.isArray(v.bodySignals) && (v.bodySignals as unknown[]).length > 0 && "parts" in v && Array.isArray(v.parts) && (v.parts as unknown[]).length > 0;
    if ("symptomTriggers" in v) return Array.isArray(v.symptomTriggers) && (v.symptomTriggers as unknown[]).length > 0 && "symptoms" in v && Array.isArray(v.symptoms) && (v.symptoms as unknown[]).length > 0;
    if ("foodRecs" in v) return Array.isArray(v.foodRecs) && (v.foodRecs as unknown[]).length > 0 && "lifestyleCards" in v && Array.isArray(v.lifestyleCards) && (v.lifestyleCards as unknown[]).length > 0;
    if ("periodTips" in v) return Array.isArray(v.periodTips) && (v.periodTips as unknown[]).length > 0 && "periods" in v && Array.isArray(v.periods) && (v.periods as unknown[]).length > 0;
    if ("remedyCats" in v) return Array.isArray(v.remedyCats) && (v.remedyCats as unknown[]).length > 0 && "remedies" in v && Array.isArray(v.remedies) && (v.remedies as unknown[]).length > 0;
    if ("paragraphs" in v) return Array.isArray(v.paragraphs) && (v.paragraphs as unknown[]).length > 0;
    if ("tips" in v) return Array.isArray(v.tips) && (v.tips as unknown[]).length > 0;
    if ("items" in v) return Array.isArray(v.items) && (v.items as unknown[]).length > 0;
    if ("parts" in v) return Array.isArray(v.parts) && (v.parts as unknown[]).length > 0;
    if ("symptoms" in v) return Array.isArray(v.symptoms) && (v.symptoms as unknown[]).length > 0;
    if ("periods" in v) return Array.isArray(v.periods) && (v.periods as unknown[]).length > 0;
    if ("remedies" in v) return Array.isArray(v.remedies) && (v.remedies as unknown[]).length > 0;
    return false;
  });
}

// ── 장별 주제 ──
const HEALTH_CH_THEME: Record<number, string> = {
  1: "[제1장 체질] 나는 어떤 체질로 태어났나 — 일간 오행, 신강·신약, 타고난 체질과 에너지 특성",
  2: "[제2장 약점] 내 사주에 약한 부위는 어디인가 — 오행 취약점으로 보는 신체 취약 부위와 장기",
  3: "[제3장 질병] 내가 특히 조심해야 할 질병과 증상 — 사주 오행 불균형에서 비롯되는 질환 경향",
  4: "[제4장 식습관] 나에게 맞는 식습관과 생활 방식 — 용신 오행 기반 맞는 음식·운동·수면·환경",
  5: "[제5장 흐름] 내 건강 흐름과 조심해야 할 시기 — 대운·세운 흐름으로 보는 건강 고비 시기",
  6: "[제6장 개운법] 내 건강을 살릴 개운법 — 부족한 오행을 채우는 생활·환경·마음 개운법",
  7: "[마무리] 홍연의 서신 — 건강사주 풀이를 마치며 전하는 따뜻한 손편지",
};

// ── 장별 추가 지시 ──
const HEALTH_CH_GUIDE: Record<number, string> = {
  1: `[constitution 섹션 — 체질]
- intro: 한 줄 체질 요약. 일간 오행과 신강·신약을 담아 (1문장)
- callout: 이 사람의 에너지 특성과 체질 핵심 한 문장.
- paragraphs 3개: ①일간 오행과 신강·신약으로 본 체질 ②타고난 에너지 패턴과 몸의 특성 ③이 체질이 주는 강점과 주의 포인트. 각 5~7문장 200자 이상으로 상세하게.
- constitutionType: { icon(이모지 1자), name(체질 유형명 4~6자, 예: "목형 체질"), badge(신강/신약 표기), desc(이 체질의 핵심 기운을 2~3문장으로) }
- constitutionTraits: 4개. 각 trait: { icon(이모지), label(특성명 3~5자), desc(한 줄 설명) } — 이 체질이 타고난 강점·특성 중심으로
- constitutionCautions: 3개. 각: { num(번호 1~3), title(주의 포인트 5~8자), desc(2~3문장, 왜 이 체질에서 이 점이 중요한지) }`,

  2: `[weakParts 섹션 — 약한 신체 부위]
- intro: 이 사람이 가장 주의해야 할 신체 부위 핵심 한 줄. (1문장)
- callout: 오행 취약점과 연결된 신체 핵심 한 문장.
- paragraphs 3개: ①오행 취약점으로 본 약한 장기·부위와 그 사주적 이유를 구체적으로 ②이 부위들이 약해질 때 나타나는 몸의 변화와 신호 ③예방과 보완을 위한 마음가짐과 방향. 각 7~9문장 300자 이상, 홍연의 깊은 통찰이 담기도록 충분히 서술하시오.
- parts: 취약 부위 3~4개. 각 part: icon(이모지), name(부위명 3~6자), ohaeng(연관 오행 1자, 예: "목"), desc(이 부위가 약한 사주적 이유, 어떤 상황에서 악화되는지, 어떤 증상으로 나타나는지 4~5문장 150자 이상).
- bodySignals: 3~4개. 이 체질이 몸에서 보내는 초기 신호. 각: { icon(이모지), title(신호 제목 5~8자), desc(이 신호가 무엇을 의미하는지, 왜 이 체질에서 이 신호가 나타나는지, 어떻게 대응해야 하는지 4~5문장 150자 이상) }
- weakAdvice: 이 약점을 안고 살아갈 때 필요한 마음가짐과 실천 방향. 홍연이 직접 당부하듯 따뜻하고 진지하게. 4~5문장 150자 이상.`,

  3: `[diseases 섹션 — 질병과 증상]
- intro: 이 사람이 특히 조심해야 할 질환 방향 핵심 한 줄. (1문장)
- callout: 오행 불균형에서 비롯되는 주요 질환 경향 한 문장.
- paragraphs 3개: ①사주 오행으로 보는 질환 경향과 그 이유를 구체적으로 ②이 질환들이 어떤 상황에서 심해지고 어떻게 나타나는지 ③예방과 조기 대처를 위한 방향. 각 7~9문장 300자 이상.
- symptoms: 주의 증상·질환 3~4개. 각 symptom: icon(이모지), name(질환/증상명 3~8자), level("주의" 또는 "관찰"), desc(이 질환이 왜 이 사주에서 나타나는지, 어떤 증상으로 발현되는지, 언제 악화되는지 4~5문장 150자 이상).
- symptomTriggers: 3~4개. 이 체질에서 증상을 악화시키는 상황·패턴. 각: { icon(이모지), trigger(상황 제목 5~8자), desc(이 상황이 왜 이 체질에 특히 해로운지, 어떻게 대응해야 하는지 3~4문장 120자 이상) }
- preventionTips: 3~4개. 실천 가능한 예방 수칙. 각: { num(번호), title(수칙 제목 5~8자), desc(구체적인 실천 방법과 그 이유 3~4문장 120자 이상) }
- diseaseAdvice: 홍연이 이 사람에게 전하는 질병 예방 당부. 따뜻하고 진지하게. 4~5문장 150자 이상.`,

  4: `[lifestyle 섹션 — 식습관과 생활]
- intro: 이 사람에게 맞는 생활 방향 핵심 한 줄. (1문장)
- callout: 용신 오행과 생활 습관의 연결 핵심 한 문장.
- paragraphs 3개: ①용신 오행과 식습관의 연결 원리 및 이 사람에게 맞는 음식과 식재료 ②이 체질에 맞는 운동·수면·환경의 방향과 이유 ③일상에서 피해야 할 것들과 주의 사항. 각 7~9문장 300자 이상.
- foodRecs: 4개. 이 체질에 맞는 권장 식품·식재료. 각: { icon(이모지), name(식품명 2~6자), ohaeng(보완하는 오행 1자), category("채소"/"과일"/"곡류"/"육류"/"해산물"/"약재" 중), benefit(이 식품이 왜 이 체질에 좋은지, 어떻게 섭취하면 좋은지 3~4문장 120자 이상) }
- lifestyleCards: 3개. 운동·수면·환경 각 영역별 루틴 제안. 각: { icon(이모지), area("운동" 또는 "수면" 또는 "환경"), title(루틴 핵심 제목 5~8자), desc(이 체질에 이 루틴이 왜 맞는지, 구체적인 실천 방법 4~5문장 150자 이상) }
- tips: 실천 팁 4~5개. 각: { icon(이모지), title(팁 제목 5~8자), desc(구체적인 실천 방법과 이유 3~4문장 120자 이상) }
- lifestyleAdvice: 홍연이 이 사람의 일상을 응원하듯 전하는 당부. 따뜻하고 실용적으로. 4~5문장 150자 이상.`,

  5: `[healthFlow 섹션 — 건강 흐름과 시기]
- intro: 이 사람의 건강 흐름에서 가장 주의해야 할 시기 핵심 한 줄. (1문장)
- callout: 대운·세운 흐름과 건강의 연관 핵심 한 문장.
- paragraphs 3개: ①대운의 원리와 이 사람의 건강 흐름 전반 ②주의 시기에 몸에서 일어나는 변화와 그 사주적 이유 ③건강 흐름을 받아들이는 마음가짐과 장기적 관리 방향. 각 7~9문장 300자 이상.
- periods: 건강 주의 시기 4~5개. 각 period: label(시기 표현, 예: "40대 초반"), tone("warn" 또는 "good"), text(그 시기 건강 흐름 핵심을 3~4문장 120자 이상으로), advice(이 시기에 구체적으로 할 수 있는 대비 1~2문장).
- periodTips: 3~4개. 건강 고비 시기를 대비하는 일반 수칙. 각: { icon(이모지), title(수칙 제목 5~8자), desc(이 수칙이 왜 이 사람에게 특히 중요한지, 어떻게 실천하는지 3~4문장 120자 이상) }
- flowAdvice: 홍연이 건강 흐름 전체를 바라보며 전하는 당부. 건강을 지키며 살아가길 바라는 마음으로. 4~5문장 150자 이상.`,

  6: `[remedy 섹션 — 개운법]
- intro: 이 사람의 건강 개운법 방향 핵심 한 줄. (1문장)
- callout: 부족한 오행과 개운의 방향 핵심 한 문장.
- paragraphs 3개: ①부족한 오행을 채우는 원리와 이 사람의 사주에 맞는 이유를 구체적으로 ②생활·환경·마음 각 영역에서 기운을 보완하는 방향과 그 효과 ③개운법을 꾸준히 실천할 때의 변화와 마음가짐. 각 7~9문장 300자 이상.
- remedies: 개운법 4~5개. 각 remedy: icon(이모지), category("생활습관"/"환경·공간"/"마음·명상"/"음식·약재"/"색상·방향" 중 하나), title(개운법 이름 4~8자), desc(이 개운법이 왜 이 사주에 효과적인지, 구체적으로 어떻게 실천하는지 4~5문장 150자 이상).
- remedyCats: 3개. 분야별 실천 항목 묶음. 각: { icon(이모지), category("생활" 또는 "환경" 또는 "마음"), items: 실천 가능한 구체적 항목 3~4개 (각 한 줄, 매우 구체적으로 — 예: "매일 아침 15분 걷기", "침실에 수 오행 계열 파란색 소품 배치") }
- remedyAdvice: 홍연이 이 사람의 건강 개운을 응원하며 전하는 당부. 따뜻하고 진지하게. 4~5문장 150자 이상.`,

  7: `[letter 섹션 — 홍연의 서신]
건강사주 풀이를 마치며 홍연이 전하는 따뜻한 손편지.
- 이 사람의 체질, 약한 부위, 건강 흐름, 식습관, 개운법 — 풀이 전체를 아우르며 건강하게 살아가길 바라는 마음을 담아 쓰시오.
- 홍연의 말투(~이오/~하오/~겠소/~했소)로 일관되게 쓰시오. "~ㅂ니다/~어요" 금지.
- paragraphs: 6개 단락. 각 단락 반드시 12~15문장, 500자 이상. 단락 하나하나가 독립된 편지 절처럼 충분한 분량으로 쓰시오. 단락별 주제: ①이 몸이 타고난 사주와 체질, 오행의 흐름이 몸에 어떻게 새겨졌는가 ②몸이 보내는 신호와 취약한 부위, 그 의미와 원인 ③인생의 건강 굴곡기를 어떻게 받아들이고 준비할 것인가 ④매일의 식습관·수면·운동에서 반드시 지켜야 할 것들 ⑤개운과 자기 돌봄이 건강에 미치는 진짜 의미 ⑥건강하게 오래 살아가길 바라는 홍연의 진심 어린 응원과 당부.
- 마치 이 사람을 평생 지켜본 사람이 손편지를 쓰듯, 따뜻하고 깊고 진지하게. 읽는 이가 가슴이 뭉클하고 눈물이 고일 만큼 충분한 분량과 감동으로 서술하시오. 짧은 단락은 절대 금지.
- 바로 본론으로 시작하여 따뜻한 마무리로 끝내시오.`,
};

// ── 장별 JSON 스키마 ──
const HEALTH_CH_SCHEMA: Record<number, string> = {
  1: `{
  "constitution": {
    "intro": "체질 요약 한 줄 (1문장)",
    "callout": "에너지 특성·체질 핵심 한 문장",
    "paragraphs": ["단락1 (5~7문장 200자+)", "단락2 (5~7문장 200자+)", "단락3 (5~7문장 200자+)"],
    "constitutionType": {
      "icon": "🌿",
      "name": "목형 체질",
      "badge": "신강",
      "desc": "이 체질의 핵심 기운을 2~3문장으로"
    },
    "constitutionTraits": [
      { "icon": "⚡", "label": "강한 생명력", "desc": "한 줄 설명" },
      { "icon": "🧠", "label": "예리한 직관", "desc": "한 줄 설명" },
      { "icon": "💪", "label": "회복 탄력성", "desc": "한 줄 설명" },
      { "icon": "🌊", "label": "유연한 적응력", "desc": "한 줄 설명" }
    ],
    "constitutionCautions": [
      { "num": 1, "title": "주의 포인트 제목", "desc": "2~3문장 설명" },
      { "num": 2, "title": "주의 포인트 제목", "desc": "2~3문장 설명" },
      { "num": 3, "title": "주의 포인트 제목", "desc": "2~3문장 설명" }
    ]
  }
}`,
  2: `{
  "weakParts": {
    "intro": "취약 부위 핵심 한 줄 (1문장)",
    "callout": "오행 취약점·신체 핵심 한 문장",
    "paragraphs": ["단락1 (5~7문장 200자+)", "단락2 (5~7문장 200자+)", "단락3 (5~7문장 200자+)"],
    "parts": [
      { "icon": "🫁", "name": "부위명", "ohaeng": "목", "desc": "사주적 이유와 증상 2~3문장" },
      { "icon": "❤️", "name": "부위명", "ohaeng": "화", "desc": "사주적 이유와 증상 2~3문장" },
      { "icon": "🦴", "name": "부위명", "ohaeng": "수", "desc": "사주적 이유와 증상 2~3문장" }
    ],
    "bodySignals": [
      { "icon": "😴", "title": "신호 제목", "desc": "2~3문장 설명" },
      { "icon": "🤧", "title": "신호 제목", "desc": "2~3문장 설명" },
      { "icon": "😰", "title": "신호 제목", "desc": "2~3문장 설명" }
    ],
    "weakAdvice": "마음가짐과 실천 방향 2~3문장"
  }
}`,
  3: `{
  "diseases": {
    "intro": "질환 방향 핵심 한 줄 (1문장)",
    "callout": "오행 불균형·질환 경향 핵심 한 문장",
    "paragraphs": ["단락1 (7~9문장 300자+)", "단락2 (7~9문장 300자+)", "단락3 (7~9문장 300자+)"],
    "symptoms": [
      { "icon": "🫁", "name": "질환/증상명", "level": "주의", "desc": "사주적 이유 + 증상 + 악화 상황 4~5문장" },
      { "icon": "❤️", "name": "질환/증상명", "level": "관찰", "desc": "4~5문장" },
      { "icon": "🦴", "name": "질환/증상명", "level": "주의", "desc": "4~5문장" }
    ],
    "symptomTriggers": [
      { "icon": "😓", "trigger": "상황 제목", "desc": "3~4문장 120자+" },
      { "icon": "🌙", "trigger": "상황 제목", "desc": "3~4문장 120자+" },
      { "icon": "🍷", "trigger": "상황 제목", "desc": "3~4문장 120자+" }
    ],
    "preventionTips": [
      { "num": 1, "title": "수칙 제목", "desc": "3~4문장 120자+" },
      { "num": 2, "title": "수칙 제목", "desc": "3~4문장 120자+" },
      { "num": 3, "title": "수칙 제목", "desc": "3~4문장 120자+" }
    ],
    "diseaseAdvice": "홍연의 따뜻한 당부 4~5문장"
  }
}`,
  4: `{
  "lifestyle": {
    "intro": "생활 방향 핵심 한 줄 (1문장)",
    "callout": "용신 오행·생활 연결 핵심 한 문장",
    "paragraphs": ["단락1 (7~9문장 300자+)", "단락2 (7~9문장 300자+)", "단락3 (7~9문장 300자+)"],
    "foodRecs": [
      { "icon": "🥦", "name": "식품명", "ohaeng": "목", "category": "채소", "benefit": "3~4문장 120자+" },
      { "icon": "🫐", "name": "식품명", "ohaeng": "수", "category": "과일", "benefit": "3~4문장 120자+" },
      { "icon": "🌾", "name": "식품명", "ohaeng": "토", "category": "곡류", "benefit": "3~4문장 120자+" },
      { "icon": "🐟", "name": "식품명", "ohaeng": "수", "category": "해산물", "benefit": "3~4문장 120자+" }
    ],
    "lifestyleCards": [
      { "icon": "🏃", "area": "운동", "title": "루틴 제목", "desc": "4~5문장 150자+" },
      { "icon": "🌙", "area": "수면", "title": "루틴 제목", "desc": "4~5문장 150자+" },
      { "icon": "🌿", "area": "환경", "title": "루틴 제목", "desc": "4~5문장 150자+" }
    ],
    "tips": [
      { "icon": "✅", "title": "팁 제목", "desc": "3~4문장 120자+" },
      { "icon": "✅", "title": "팁 제목", "desc": "3~4문장 120자+" },
      { "icon": "✅", "title": "팁 제목", "desc": "3~4문장 120자+" },
      { "icon": "✅", "title": "팁 제목", "desc": "3~4문장 120자+" }
    ],
    "lifestyleAdvice": "홍연의 따뜻한 응원 당부 4~5문장"
  }
}`,
  5: `{
  "healthFlow": {
    "intro": "건강 흐름 핵심 한 줄 (1문장)",
    "callout": "대운·세운과 건강 연관 핵심 한 문장",
    "paragraphs": ["단락1 (7~9문장 300자+)", "단락2 (7~9문장 300자+)", "단락3 (7~9문장 300자+)"],
    "periods": [
      { "label": "40대 초반", "tone": "warn", "text": "3~4문장 120자+", "advice": "이 시기 대비 1~2문장" },
      { "label": "50대", "tone": "good", "text": "3~4문장 120자+", "advice": "이 시기 대비 1~2문장" },
      { "label": "60대 초반", "tone": "warn", "text": "3~4문장 120자+", "advice": "이 시기 대비 1~2문장" },
      { "label": "60대 후반", "tone": "good", "text": "3~4문장 120자+", "advice": "이 시기 대비 1~2문장" }
    ],
    "periodTips": [
      { "icon": "🏥", "title": "수칙 제목", "desc": "3~4문장 120자+" },
      { "icon": "🧘", "title": "수칙 제목", "desc": "3~4문장 120자+" },
      { "icon": "📋", "title": "수칙 제목", "desc": "3~4문장 120자+" }
    ],
    "flowAdvice": "홍연의 따뜻한 당부 4~5문장"
  }
}`,
  6: `{
  "remedy": {
    "intro": "개운법 방향 핵심 한 줄 (1문장)",
    "callout": "부족 오행·개운 방향 핵심 한 문장",
    "paragraphs": ["단락1 (7~9문장 300자+)", "단락2 (7~9문장 300자+)", "단락3 (7~9문장 300자+)"],
    "remedies": [
      { "icon": "🌿", "category": "생활습관", "title": "개운법 이름", "desc": "4~5문장 150자+" },
      { "icon": "🎵", "category": "마음·명상", "title": "개운법 이름", "desc": "4~5문장 150자+" },
      { "icon": "🌅", "category": "환경·공간", "title": "개운법 이름", "desc": "4~5문장 150자+" },
      { "icon": "💧", "category": "음식·약재", "title": "개운법 이름", "desc": "4~5문장 150자+" }
    ],
    "remedyCats": [
      { "icon": "🏃", "category": "생활", "items": ["구체적 실천 항목 1", "구체적 실천 항목 2", "구체적 실천 항목 3"] },
      { "icon": "🏠", "category": "환경", "items": ["구체적 실천 항목 1", "구체적 실천 항목 2", "구체적 실천 항목 3"] },
      { "icon": "🧘", "category": "마음", "items": ["구체적 실천 항목 1", "구체적 실천 항목 2", "구체적 실천 항목 3"] }
    ],
    "remedyAdvice": "홍연의 따뜻한 당부 4~5문장"
  }
}`,
  7: `{
  "letter": {
    "paragraphs": ["단락1-사주와 체질 (12~15문장 500자+)", "단락2-몸의 신호와 취약 부위 (12~15문장 500자+)", "단락3-건강 굴곡기 대응 (12~15문장 500자+)", "단락4-식습관과 일상 실천 (12~15문장 500자+)", "단락5-개운과 자기돌봄 (12~15문장 500자+)", "단락6-응원과 당부 (12~15문장 500자+)"]
  }
}`,
};

// ── 대운 기반 건강 흐름 점수 계산 (서버사이드, AI 프롬프트 주입용) ──
const STEM_EL: Record<string, string> = { 甲:"목",乙:"목",丙:"화",丁:"화",戊:"토",己:"토",庚:"금",辛:"금",壬:"수",癸:"수" };
const BRANCH_EL: Record<string, string> = { 子:"수",丑:"토",寅:"목",卯:"목",辰:"토",巳:"화",午:"화",未:"토",申:"금",酉:"금",戌:"토",亥:"수" };
const GEN_H: Record<string, string> = { 목:"화",화:"토",토:"금",금:"수",수:"목" };
const CTL_H: Record<string, string> = { 목:"토",화:"금",토:"수",금:"목",수:"화" };
const SIPSEONG_HEALTH: Record<string, number> = {
  인성:82, 정인:85, 편인:76,
  비겁:72, 비견:74, 겁재:65,
  식상:50, 식신:54, 상관:44,
  재성:28, 정재:32, 편재:24,
  관성:18, 정관:22, 편관:14,
};
function toSipH(ilEl: string, tEl: string): string {
  if (ilEl === tEl) return "비겁";
  if (GEN_H[ilEl] === tEl) return "식상";
  if (CTL_H[ilEl] === tEl) return "재성";
  if (CTL_H[tEl] === ilEl) return "관성";
  if (GEN_H[tEl] === ilEl) return "인성";
  return "비겁";
}

export function computeHealthFlowData(
  ilganChar: string,
  daeunData: { label: string; gz: string }[]
): string {
  if (!daeunData.length) return "(대운 데이터 없음)";
  const ilEl = STEM_EL[ilganChar] ?? "목";
  const scored = daeunData.map(d => {
    const sEl = STEM_EL[d.gz[0]];
    const bEl = BRANCH_EL[d.gz[1]];
    const sS = sEl ? (SIPSEONG_HEALTH[toSipH(ilEl, sEl)] ?? 50) : 50;
    const bS = bEl ? (SIPSEONG_HEALTH[toSipH(ilEl, bEl)] ?? 50) : 50;
    const score = Math.round(sS * 0.6 + bS * 0.4);
    return { label: d.label, gz: d.gz, score };
  });
  const scores = scored.map(s => s.score);
  const mid = (Math.max(...scores) + Math.min(...scores)) / 2;
  const lines = scored.map(s => {
    const tone = s.score >= mid ? "순탄" : "주의";
    return `${s.label}세 대운 (간지: ${s.gz}): ${tone === "순탄" ? "+" : "−"}${tone} / 건강지수: ${s.score}점`;
  });
  const warn = scored.filter(s => s.score < mid);
  const good = scored.filter(s => s.score >= mid);
  const summary = `\n[구간 요약] 순탄 구간: ${good.map(s => s.label + "세").join(", ")} / 주의 구간: ${warn.map(s => s.label + "세").join(", ")}`;
  return lines.join("\n") + summary;
}

// ── 핵심 함수: 장별 프롬프트 빌더 ──
export function buildHealthChapterPrompt(
  chapter: number,
  input: {
    name: string;
    gender: "male" | "female";
    manseryeokText: string;
    pillars?: { pos: string; gan: string; ganEl: string; ji: string; jiEl: string; sipTop: string; sipBot: string; sinsal?: string }[];
    birthYear?: number;
    daeun?: { label: string; gz: string }[];
    ilganChar?: string;
  }
): { system: string; user: string } {
  const theme = HEALTH_CH_THEME[chapter] ?? `[제${chapter}장]`;
  const guide = HEALTH_CH_GUIDE[chapter] ?? "";
  const schema = HEALTH_CH_SCHEMA[chapter] ?? "{}";
  const honorific = input.name ? `${input.name} 님` : "그대";
  const currentYear = new Date().getFullYear();

  // ch5: 대운 건강 흐름 데이터 주입
  let healthFlowInject = "";
  if (chapter === 5 && input.ilganChar && input.daeun && input.daeun.length > 0) {
    const flowData = computeHealthFlowData(input.ilganChar, input.daeun);
    healthFlowInject = `\n[건강 흐름 그래프 데이터 — 이 데이터에 맞춰 periods의 tone과 풀이를 작성하시오]\n${flowData}\n`;
  }

  const user = `아래는 ${honorific}의 사주 명식입니다.

${input.manseryeokText}
${input.birthYear ? `\n출생연도: ${input.birthYear}년 / 현재연도: ${currentYear}년` : `\n현재연도: ${currentYear}년`}
${healthFlowInject}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
이번 장의 주제: ${theme}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${guide ? `\n작성 지침:\n${guide}\n` : ""}
화면에 대운별 건강 흐름 꺾은선 그래프가 표시됩니다. 그래프 흐름대로 풀이를 작성하시오.
위 명식을 꼼꼼히 분석하여, 아래 JSON 스키마를 정확히 채워주시오.
반드시 유효한 JSON만 출력하시오. 코드펜스(\`\`\`)나 설명 문장은 절대 쓰지 마시오.
풀이 대상은 본인이 읽는 건강 결과지임을 염두에 두고, 따뜻하고 실용적으로 서술하시오.

${schema}`;

  return { system: SYSTEM, user };
}