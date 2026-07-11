// =====================================================
// 건강사주 결과지 — 장별 풀이 프롬프트 & 구조
// =====================================================

import { SYSTEM } from "./report-prompts";

// ── 장별 필수 섹션 키 ──
export const HEALTH_CHAPTER_SECTIONS: Record<number, string[]> = {
  1: ["constitution"],
  2: ["weakParts"],
  3: ["lifestyle"],
  4: ["healthFlow"],
  5: ["letter"],
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
  3: "[제3장 식습관] 나에게 맞는 식습관과 생활 방식 — 용신 오행 기반 맞는 음식·운동·수면·환경",
  4: "[제4장 흐름] 내 건강 흐름과 조심해야 할 시기 — 대운·세운 흐름으로 보는 건강 고비 시기",
  5: "[마무리] 홍연의 서신 — 건강사주 풀이를 마치며 전하는 따뜻한 손편지",
};

const HEALTH_REMEDY_THEME = "[개운법] 내 건강을 살릴 개운법 — 부족한 오행을 채우는 생활·환경·마음 개운법";

// ── 장별 추가 지시 ──
const HEALTH_CH_GUIDE: Record<number, string> = {
  1: `[constitution 섹션 — 체질]
- yongsinEl: 용신 오행 1글자 (예: "화", "목", "수", "금", "토")
- heusinEl: 희신 오행 1글자
- gisinEl: 기신 오행 1글자
- yongsinReason: 용신 오행이 왜 이 사람에게 필요한지 1~2문장.
- heusinReason: 희신 오행이 왜 보조 역할을 하는지 1~2문장.
- gisinReason: 기신 오행이 왜 이 사람에게 부담이 되는지 1~2문장.
- gyeokguk: 이 사주의 격국명 (예: "정관격", "식신격" 등). 격국을 먼저 판단하여 이후 모든 풀이의 기준으로 삼으시오.
- intro: 한 줄 체질 요약. 일간 오행과 신강·신약을 담아 (1문장)
- callout: 이 사람의 에너지 특성과 체질 핵심 한 문장.
- paragraphs 3개. 각 단락은 반드시 7~9문장, 300자 이상. 짧은 단락 절대 금지. 홍연 말투(~이오/~하오/~겠소) 유지.
  ⚠️ 성격·기질·직업·성공 등 일반 인생 풀이는 절대 금지. 오직 '건강'에만 초점을 맞추시오.
  ①[건강] 일간 오행과 신강신약이 몸에 어떻게 작용하는가 — [사주 실제 구성]의 오행 비율(%) 수치를 그대로 언급(예: "목이 38%…", "토·금·수가 각 13%…")하며, 그 비율이 이 사람의 체력·면역·에너지 흐름에 미치는 영향을 건강 관점으로만 서술.
  ②[건강] 오행 상생상극으로 보는 취약 장기·계통 — 강한 오행이 과잉될 때 생기는 장기 부하(간·심장·폐 등), 목극토·목생화 등 상생상극으로 눌리는 장기, 실제로 나타나는 건강 증상(두통·소화장애·피로·염증 등)을 구체적으로 서술. 성격 언급 금지.
  ③[건강] 건강 관리 핵심 방향 — 강한 오행 기운을 발산하는 방법, 약한 오행(비율 낮은 것)을 보완하는 식습관·생활 습관, 주의해야 할 건강 행동 패턴. 성격·커리어 언급 금지, 오직 몸과 건강만.
- constitutionType: { icon(이모지 1자), name(체질 유형명 4~6자, 예: "목형 체질"), badge(신강/신약 표기), desc(이 체질의 핵심 기운을 2~3문장으로) }
- constitutionTraits: 4개. 각 trait: { icon(이모지), label(특성명 3~5자), desc(한 줄 설명) } — 이 체질이 타고난 강점·특성 중심으로
- constitutionCautions: 3개. 각: { num(번호 1~3), title(주의 포인트 5~8자), desc(2~3문장, 왜 이 체질에서 이 점이 중요한지) }
- sinStrengthHealthParagraphs: 4개 단락. 신강·신약 정도가 건강에 어떻게 작용하는지 건강 중심으로 풀이. ①신강·신약 체질과 전반적인 건강 특성 (이 기운의 강도가 몸에 미치는 영향 5~7문장 200자 이상) ②일간 오행과 연결된 취약 장기·계통과 그 이유 (구체적 장기명, 언제 악화되는지 5~7문장 200자 이상) ③기운 강도에서 비롯되는 체력·피로·스트레스 패턴 (몸이 보내는 신호 포함 5~7문장 200자 이상) ④건강 관리의 핵심 방향 (이 체질에 맞는 발산 또는 보충의 방향 5~7문장 200자 이상). 홍연 말투(~이오/~하오/~겠소) 유지.
- yongsinHealthParagraphs: 2개 단락. 용신·희신·기신 오행이 이 사람의 건강에 구체적으로 어떻게 작용하는지 풀이. 반드시 7~9문장 300자 이상. 성격·기질 언급 금지, 오직 건강만.
  ①용신·희신 오행이 몸에 미치는 긍정적 영향 — 이 기운이 충족될 때 몸의 어떤 계통이 강해지고 어떤 증상이 완화되는지 구체적으로. 관련 장기명, 보완 방향 포함.
  ②기신 오행이 몸에 미치는 부담 — 이 기운이 과잉될 때 어떤 장기·계통에 부하가 걸리고 어떤 증상으로 나타나는지. 피해야 할 생활 습관·식품 포함.`,

  2: `[weakParts 섹션 — 약한 신체 부위]
- intro: 이 사람이 가장 주의해야 할 신체 부위 핵심 한 줄. (1문장)
- callout: 오행 취약점과 연결된 신체 핵심 한 문장.
- paragraphs 3개. 각 단락 반드시 7~9문장 300자 이상. 홍연 말투(~이오/~하오/~겠소) 유지.
  ①첫 문장은 반드시 "오행마다 관장하는 신체 기관이 따로 있소. 취약한 기운이 곧 약해지기 쉬운 부위와 이어지니…" 식으로 오행과 신체 연결의 원리를 먼저 설명하며 시작. 이후 [사주 실제 구성]의 오행 비율(%)을 수치 그대로 언급하며, 부족한 오행이 관장하는 장기와 그 사주적 이유(목극토·금생수 등 상생상극 포함)를 구체적으로 서술.
  ②부족한 오행의 장기들이 약해질 때 실제로 나타나는 몸의 변화와 초기 신호 — 구체적인 증상(소화장애·호흡기·피로·부종 등), 언제 악화되는지, 어떤 상황에서 더 심해지는지.
  ③예방과 보완 방향 — 약한 오행을 보충하는 식습관·생활 습관, 강한 오행의 과잉을 조절하는 방법, 마음가짐과 실천 방향.
- parts: 취약 부위 3~4개. 각 part: icon(이모지), name(부위명 3~6자), ohaeng(연관 오행 1자, 예: "목"), desc(4~5문장 150자 이상).
  desc 작성 원칙:
  · 오행 비율(%)이나 "부족하다"는 표현 절대 금지. 대신 상생상극 관계(예: 목극토, 수생목)로 왜 이 장기가 눌리는지 원리를 서술하시오.
  · 이 장기가 약해질 때 실제로 나타나는 구체적인 증상, 언제·어떤 상황에서 악화되는지 서술.
  · 홍연 말투(~이오/~하오/~겠소) 유지.
  ⚠️ parts의 ohaeng은 반드시 [사주 실제 구성]에서 "약한 오행(0~1개)"으로 표시된 오행에서만 선택하시오. 강한 오행(2개 이상)의 장기는 절대 포함 금지.
  ⚠️ parts의 name은 반드시 아래 오행별 장기 목록에서만 선택하시오 (화면에 표시되는 장기명과 일치해야 함):
  목(木): 간, 담낭, 눈, 근육, 손발톱 / 화(火): 심장, 소장, 혀, 혈관, 뇌 / 토(土): 비장, 위장, 입, 근육, 살 / 금(金): 폐, 대장, 코, 피부, 기관지 / 수(水): 신장, 방광, 귀, 뼈, 생식기
- bodySignals: 3~4개. 이 체질이 몸에서 보내는 초기 신호. 각: { icon(이모지), title(신호 제목 5~8자), desc(이 신호가 무엇을 의미하는지, 왜 이 체질에서 이 신호가 나타나는지, 어떻게 대응해야 하는지 4~5문장 150자 이상) }
- weakAdvice: 이 약점을 안고 살아갈 때 필요한 마음가짐과 실천 방향. 홍연이 직접 당부하듯 따뜻하고 진지하게. 4~5문장 150자 이상.`,

  3: `[lifestyle 섹션 — 식습관과 생활]
- intro: 이 사람에게 맞는 생활 방향 핵심 한 줄. (1문장)
- callout: 용신 오행과 생활 습관의 연결 핵심 한 문장.
- paragraphs 3개. 각 단락 반드시 8문장 이상, 350자 이상. 짧으면 절대 안 됨.
  ①용신 오행이 이 사람의 식습관에 어떻게 연결되는지 원리 설명 → 용신 오행이 주관하는 장기 → 그 장기를 보하는 구체적 식재료(이름 명시) → 왜 그 식재료가 이 사주에 맞는지 이유 → 피해야 할 식재료와 이유까지.
  ②이 체질에 맞는 운동 종류와 강도·빈도 → 수면 패턴(취침 시간, 환경) → 생활 공간·방향·습도 등 환경 조건 → 각각 왜 이 사주에 맞는지 사주적 이유 포함.
  ③바로 위 식품 가이드(적극 추천·도움됨·절제)를 풀어서 설명하는 단락. 이 단락은 반드시 세 파트로 구성하시오.
    [적극 추천] 용신 오행이 주관하는 장기와 그 식재료들을 자주 섭취해야 하는 사주적 이유를 구체적으로.
    [도움됨] 희신 오행 식재료가 이 사주의 균형에 어떻게 기여하는지.
    [절제] 기신 오행 식재료를 과다 섭취하면 왜 해로운지, 어떤 증상으로 나타나는지, 어느 정도 빈도로 절제해야 하는지.
- foodRecs: 4개. 이 체질에 맞는 권장 식품·식재료. 각: { icon(이모지), name(식품명 2~6자), ohaeng(보완하는 오행 1자), category("채소"/"과일"/"곡류"/"육류"/"해산물"/"약재" 중), benefit(이 식품이 왜 이 체질에 좋은지, 어떻게 섭취하면 좋은지 3~4문장 120자 이상) }
  ⚠️ foodRecs의 ohaeng은 반드시 용신 또는 희신 오행에 해당하는 식품만 선택할 것. 기신·구신 오행을 보완하는 식품은 절대 포함하지 말 것.
- lifestyleCards: 3개. 운동·수면·환경 각 영역별 루틴 제안. 각: { icon(이모지), area("운동" 또는 "수면" 또는 "환경"), title(루틴 핵심 제목 5~8자), desc(이 체질에 이 루틴이 왜 맞는지, 구체적인 실천 방법 4~5문장 150자 이상) }
- tips: 실천 팁 4~5개. 각: { icon(이모지), title(팁 제목 5~8자), desc(구체적인 실천 방법과 이유 3~4문장 120자 이상) }
- lifestyleAdvice: 홍연이 이 사람의 일상을 응원하듯 전하는 당부. 따뜻하고 실용적으로. 4~5문장 150자 이상.`,

  4: `[healthFlow 섹션 — 건강 흐름과 시기]
- intro: 이 사람의 건강 흐름에서 가장 주의해야 할 시기 핵심 한 줄. (1문장)
- callout: 대운·세운 흐름과 건강의 연관 핵심 한 문장.
- paragraphs 3개: ①대운의 원리와 이 사람의 건강 흐름 전반 ②주의 시기에 몸에서 일어나는 변화와 그 사주적 이유 ③건강 흐름을 받아들이는 마음가짐과 장기적 관리 방향. 각 7~9문장 300자 이상.
- periods: 건강 주의 시기 4~5개. 각 period: label(시기 표현, 예: "40대 초반"), tone("warn" 또는 "good"), text(그 시기 건강 흐름 핵심을 3~4문장 120자 이상으로), advice(이 시기에 구체적으로 할 수 있는 대비 1~2문장).
- periodTips: 3~4개. 건강 고비 시기를 대비하는 일반 수칙. 각: { icon(이모지), title(수칙 제목 5~8자), desc(이 수칙이 왜 이 사람에게 특히 중요한지, 어떻게 실천하는지 3~4문장 120자 이상) }
- flowAdvice: 홍연이 건강 흐름 전체를 바라보며 전하는 당부. 건강을 지키며 살아가길 바라는 마음으로. 4~5문장 150자 이상.`,

  5: `[letter 섹션 — 홍연의 서신]
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
    "yongsinEl": "화",
    "heusinEl": "목",
    "gisinEl": "금",
    "yongsinReason": "용신 오행이 이 사람에게 필요한 이유 1~2문장",
    "heusinReason": "희신 오행이 보조 역할을 하는 이유 1~2문장",
    "gisinReason": "기신 오행이 이 사람에게 부담이 되는 이유 1~2문장",
    "gyeokguk": "정관격",
    "intro": "체질 요약 한 줄 (1문장)",
    "callout": "에너지 특성·체질 핵심 한 문장",
    "paragraphs": ["단락1 — 반드시 7~9문장 300자 이상. 오행 비율(%) 수치를 직접 언급하며 일간·신강신약·격국으로 본 체질 서술", "단락2 — 반드시 7~9문장 300자 이상. 오행 상생상극에서 비롯되는 에너지 패턴과 취약 장부·계통·증상 서술", "단락3 — 반드시 7~9문장 300자 이상. 약한 오행 보완 방향과 건강 관리 핵심 방향 서술"],
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
    ],
"sinStrengthHealthParagraphs": ["단락1 (5~7문장 200자+)", "단락2 (5~7문장 200자+)", "단락3 (5~7문장 200자+)", "단락4 (5~7문장 200자+)"],
    "yongsinHealthParagraphs": ["단락1 — 반드시 7~9문장 300자 이상. 용신·희신 오행이 건강에 미치는 긍정적 영향, 관련 장기·계통, 보완 방향", "단락2 — 반드시 7~9문장 300자 이상. 기신 오행이 건강에 미치는 부담, 취약 장기·증상, 피해야 할 생활 습관"]
  }
}`,
  2: `{
  "weakParts": {
    "intro": "취약 부위 핵심 한 줄 (1문장)",
    "callout": "오행 취약점·신체 핵심 한 문장",
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
  "lifestyle": {
    "intro": "생활 방향 핵심 한 줄 (1문장)",
    "callout": "용신 오행·생활 연결 핵심 한 문장",
    "paragraphs": ["단락1 — 용신 오행·장기·식재료 원리 (8문장 이상 350자 이상)", "단락2 — 운동·수면·환경 방향과 이유 (8문장 이상 350자 이상)", "단락3 — 피해야 할 것들과 오행 원리 기반 경고 (8문장 이상 350자 이상)"],
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
  4: `{
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
  5: `{
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
    yongsinEl?: string;
    heusinEl?: string;
    gisinEl?: string;
    gyeokguk?: string;
  }
): { system: string; user: string } {
  const theme = HEALTH_CH_THEME[chapter] ?? `[제${chapter}장]`;
  const guide = HEALTH_CH_GUIDE[chapter] ?? "";
  const schema = HEALTH_CH_SCHEMA[chapter] ?? "{}";
  const honorific = input.name ? `${input.name} 님` : "그대";
  const currentYear = new Date().getFullYear();

  // 오행 카운트 + 십성 분포 주입 (전 장 공통)
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
    ohaengCountNote = `\n[사주 실제 구성 — 반드시 이 값 그대로 사용하시오]\n오행: 강한 오행(2개 이상)=${strong} / 약한 오행(0~1개)=${weak}\n십성: ${sipLines || "없음"}\n`;
  }

  // 확정된 용신/희신/기신/격국 주입 (1장 생성 후 myeongsik에 저장된 값)
  let yongsinNote = "";
  if (chapter !== 1 && input.yongsinEl && input.heusinEl && input.gisinEl) {
    yongsinNote = `\n[확정 오행 및 격국 — 반드시 아래 값을 그대로 사용하시오. 임의로 변경 금지]\n용신: ${input.yongsinEl} / 희신: ${input.heusinEl} / 기신: ${input.gisinEl}${input.gyeokguk ? ` / 격국: ${input.gyeokguk}` : ""}\n`;
  }

  // ch4: 대운 건강 흐름 데이터 주입
  let healthFlowInject = "";
  if (chapter === 4 && input.ilganChar && input.daeun && input.daeun.length > 0) {
    const flowData = computeHealthFlowData(input.ilganChar, input.daeun);
    healthFlowInject = `\n[건강 흐름 그래프 데이터 — 이 데이터에 맞춰 periods의 tone과 풀이를 작성하시오]\n${flowData}\n`;
  }

  const ilganNote = input.ilganChar ? `\n[일간 — 절대 변경 금지]\n일간: ${input.ilganChar} (${({ 갑:"목", 을:"목", 병:"화", 정:"화", 무:"토", 기:"토", 경:"금", 신:"금", 임:"수", 계:"수" }[input.ilganChar] ?? "?") } 오행)\n모든 풀이는 반드시 이 일간을 기준으로 작성하시오.\n` : "";

  const lengthWarning = (chapter === 1 || chapter === 2) ? `\n⚠️ [분량 최우선 원칙 — 절대 준수]\nparagraphs 배열의 각 항목은 반드시 7문장 이상, 300자 이상으로 서술하시오.\n짧은 단락(5문장 미만 또는 200자 미만)은 오류로 간주합니다.\n${chapter === 1 ? "다른 필드(constitutionType·constitutionTraits 등)는 간결하게 쓰고,\n오직 paragraphs와 sinStrengthHealthParagraphs에만 충분한 분량을 투자하시오.\n" : ""}` : "";

  const user = `아래는 ${honorific}의 사주 명식입니다.

${input.manseryeokText}
${input.birthYear ? `\n출생연도: ${input.birthYear}년 / 현재연도: ${currentYear}년` : `\n현재연도: ${currentYear}년`}
${ilganNote}${ohaengCountNote}${yongsinNote}${healthFlowInject}${lengthWarning}
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

// ── ch2 paragraphs 전용 프롬프트 (오직 글쓰기에만 집중) ──
export function buildHealthCh2ParagraphsPrompt(
  input: Parameters<typeof buildHealthChapterPrompt>[1]
): { system: string; user: string } {
  const honorific = input.name ? `${input.name} 님` : "그대";
  const currentYear = new Date().getFullYear();

  let ohaengCountNote = "";
  if (input.pillars && input.pillars.length > 0) {
    const elCnt: Record<string, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
    for (const p of input.pillars) {
      if (p.ganEl && elCnt[p.ganEl] !== undefined) elCnt[p.ganEl]++;
      if (p.jiEl  && elCnt[p.jiEl]  !== undefined) elCnt[p.jiEl]++;
    }
    const elTotal = Object.values(elCnt).reduce((a, b) => a + b, 0) || 1;
    const elSorted = Object.entries(elCnt).sort((a, b) => b[1] - a[1]);
    const strong = elSorted.filter(([, v]) => v >= 2).map(([k, v]) => `${k}(${v}개, ${Math.round(v/elTotal*100)}%)`).join("·") || "없음";
    const weak   = elSorted.filter(([, v]) => v <= 1).map(([k, v]) => `${k}(${v}개, ${Math.round(v/elTotal*100)}%)`).join("·") || "없음";
    ohaengCountNote = `\n[사주 실제 구성 — 반드시 이 값 그대로 사용하시오]\n오행: 강한 오행(2개 이상)=${strong} / 약한 오행(0~1개)=${weak}\n`;
  }

  const ilganNote = input.ilganChar ? `\n[일간 — 절대 변경 금지]\n일간: ${input.ilganChar} (${({ 갑:"목", 을:"목", 병:"화", 정:"화", 무:"토", 기:"토", 경:"금", 신:"금", 임:"수", 계:"수" }[input.ilganChar] ?? "?")} 오행)\n모든 풀이는 반드시 이 일간을 기준으로 작성하시오.\n` : "";

  let yongsinNote = "";
  if (input.yongsinEl && input.heusinEl && input.gisinEl) {
    yongsinNote = `\n[확정 오행 — 반드시 그대로 사용]\n용신: ${input.yongsinEl} / 희신: ${input.heusinEl} / 기신: ${input.gisinEl}${input.gyeokguk ? ` / 격국: ${input.gyeokguk}` : ""}\n`;
  }

  const user = `아래는 ${honorific}의 사주 명식입니다.

${input.manseryeokText}
${input.birthYear ? `\n출생연도: ${input.birthYear}년 / 현재연도: ${currentYear}년` : `\n현재연도: ${currentYear}년`}
${ilganNote}${ohaengCountNote}${yongsinNote}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
이번 장의 주제: [제2장 약점] 오행 취약점으로 보는 신체 취약 부위와 장기
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ [오직 아래 JSON 하나만 출력하시오 — 다른 필드 없음]
paragraphs 3개를 아래 주제에 맞게 작성하시오.
각 단락은 반드시 8문장 이상, 350자 이상. 짧으면 오류입니다. 홍연 말투(~이오/~하오/~겠소) 유지.
⚠️ 성격·기질·직업·성공 관련 풀이 절대 금지. 오직 신체·건강·장기에만 초점.

①첫 문장은 반드시 "오행마다 관장하는 신체 기관이 따로 있소. 취약한 기운이 곧 약해지기 쉬운 부위와 이어지니…" 식으로 시작. 이후 이 명식의 오행 비율(%)을 수치 그대로 언급하며, 부족한 오행이 관장하는 장기와 그 사주적 이유(상생상극 포함)를 구체적으로 서술.
②부족한 오행의 장기들이 약해질 때 실제로 나타나는 몸의 변화·초기 신호·악화 상황을 구체적으로 서술(증상명, 언제 심해지는지).
③약한 오행을 보충하는 식습관·생활 습관, 강한 오행의 과잉을 조절하는 방법, 마음가짐과 실천 방향.

반드시 유효한 JSON만 출력하시오. 코드펜스(\`\`\`)나 설명 문장은 절대 쓰지 마시오.

{
  "weakParts": {
    "paragraphs": [
      "단락1 — 반드시 8문장 이상 350자 이상. 오행 비율(%) 수치 직접 언급, 부족한 오행·관장 장기·상생상극 구체 서술.",
      "단락2 — 반드시 8문장 이상 350자 이상. 약해질 때 몸의 변화·초기 신호·악화 상황 구체 서술.",
      "단락3 — 반드시 8문장 이상 350자 이상. 보완 식습관·생활 습관·과잉 조절·마음가짐 서술."
    ]
  }
}`;

  return { system: SYSTEM, user };
}

// ── remedy(개운법) 전용 프롬프트 빌더 (ch3 페이지 내 개운법 카드용) ──
export function buildHealthRemedyPrompt(
  input: Parameters<typeof buildHealthChapterPrompt>[1]
): { system: string; user: string } {
  const honorific = input.name ? `${input.name} 님` : "그대";
  const currentYear = new Date().getFullYear();

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
    ohaengCountNote = `\n[사주 실제 구성 — 반드시 이 값 그대로 사용하시오]\n오행: 강한 오행(2개 이상)=${strong} / 약한 오행(0~1개)=${weak}\n십성: ${sipLines || "없음"}\n`;
  }

  let yongsinNote = "";
  if (input.yongsinEl && input.heusinEl && input.gisinEl) {
    yongsinNote = `\n[확정 오행 및 격국 — 반드시 아래 값을 그대로 사용하시오]\n용신: ${input.yongsinEl} / 희신: ${input.heusinEl} / 기신: ${input.gisinEl}${input.gyeokguk ? ` / 격국: ${input.gyeokguk}` : ""}\n`;
  }

  const ilganNote = input.ilganChar ? `\n[일간 — 절대 변경 금지]\n일간: ${input.ilganChar} (${({ 갑:"목", 을:"목", 병:"화", 정:"화", 무:"토", 기:"토", 경:"금", 신:"금", 임:"수", 계:"수" }[input.ilganChar] ?? "?")} 오행)\n` : "";

  const user = `아래는 ${honorific}의 사주 명식입니다.

${input.manseryeokText}
${input.birthYear ? `\n출생연도: ${input.birthYear}년 / 현재연도: ${currentYear}년` : `\n현재연도: ${currentYear}년`}
${ilganNote}${ohaengCountNote}${yongsinNote}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
이번 장의 주제: ${HEALTH_REMEDY_THEME}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[remedy 섹션 — 개운법]
- intro: 이 사람의 건강 개운법 방향 핵심 한 줄. (1문장)
- callout: 부족한 오행과 개운의 방향 핵심 한 문장.
- paragraphs 3개: ①부족한 오행을 채우는 원리와 이 사람의 사주에 맞는 이유를 구체적으로 ②생활·환경·마음 각 영역에서 기운을 보완하는 방향과 그 효과 ③개운법을 꾸준히 실천할 때의 변화와 마음가짐. 각 7~9문장 300자 이상.
- remedies: 개운법 4~5개. 반드시 용신·희신 오행을 보강하는 방향으로만 선택하시오. 각 remedy: icon(이모지), category("생활습관"/"환경·공간"/"마음·명상"/"음식·약재"/"색상·방향" 중 하나), title(개운법 이름 4~8자), desc는 반드시 7문장 이상 300자 이상.
- remedyCats: 3개. 분야별 실천 항목 묶음. 각: { icon(이모지), category("생활" 또는 "환경" 또는 "마음"), items: 실천 가능한 구체적 항목 3~4개 }
- remedyAdvice: 홍연이 이 사람의 건강 개운을 응원하며 전하는 당부. 따뜻하고 진지하게. 4~5문장 150자 이상.

반드시 유효한 JSON만 출력하시오. 코드펜스(\`\`\`)나 설명 문장은 절대 쓰지 마시오.

{
  "remedy": {
    "intro": "개운법 방향 핵심 한 줄 (1문장)",
    "callout": "부족 오행·개운 방향 핵심 한 문장",
    "paragraphs": ["단락1 (7~9문장 300자+)", "단락2 (7~9문장 300자+)", "단락3 (7~9문장 300자+)"],
    "remedies": [
      { "icon": "🌿", "category": "생활습관", "title": "개운법 이름", "desc": "7문장 이상 300자+" },
      { "icon": "🎵", "category": "마음·명상", "title": "개운법 이름", "desc": "7문장 이상 300자+" },
      { "icon": "🌅", "category": "환경·공간", "title": "개운법 이름", "desc": "7문장 이상 300자+" },
      { "icon": "💧", "category": "음식·약재", "title": "개운법 이름", "desc": "7문장 이상 300자+" }
    ],
    "remedyCats": [
      { "icon": "🏃", "category": "생활", "items": ["구체적 실천 항목 1", "구체적 실천 항목 2", "구체적 실천 항목 3"] },
      { "icon": "🏠", "category": "환경", "items": ["구체적 실천 항목 1", "구체적 실천 항목 2", "구체적 실천 항목 3"] },
      { "icon": "🧘", "category": "마음", "items": ["구체적 실천 항목 1", "구체적 실천 항목 2", "구체적 실천 항목 3"] }
    ],
    "remedyAdvice": "홍연의 따뜻한 당부 4~5문장"
  }
}`;

  return { system: SYSTEM, user };
}