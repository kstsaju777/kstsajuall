// =====================================================
// 십성(十星) 로컬 계산
// =====================================================
// 일간(日干) 기준으로 임의 천간/지지의 십성을 구한다.
// 대운/세운/월운 간지에 십성을 붙이는 용도. 지지는 본기(本氣) 기준.

// 천간 → [오행, 음양]
const STEM: Record<string, [string, "양" | "음"]> = {
  甲: ["목", "양"], 乙: ["목", "음"], 丙: ["화", "양"], 丁: ["화", "음"], 戊: ["토", "양"],
  己: ["토", "음"], 庚: ["금", "양"], 辛: ["금", "음"], 壬: ["수", "양"], 癸: ["수", "음"],
};

// 지지 → 본기 천간
const BRANCH_MAIN: Record<string, string> = {
  子: "癸", 丑: "己", 寅: "甲", 卯: "乙", 辰: "戊", 巳: "丙",
  午: "丁", 未: "己", 申: "庚", 酉: "辛", 戌: "戊", 亥: "壬",
};

const GEN: Record<string, string> = { 목: "화", 화: "토", 토: "금", 금: "수", 수: "목" }; // 생
const CTL: Record<string, string> = { 목: "토", 토: "수", 수: "화", 화: "금", 금: "목" }; // 극

function sipseong(ilgan: string, target: string): string {
  const il = STEM[ilgan];
  const tg = STEM[target];
  if (!il || !tg) return "";
  const [ie, iy] = il;
  const [te, ty] = tg;
  const same = iy === ty;
  if (ie === te) return same ? "비견" : "겁재";
  if (GEN[ie] === te) return same ? "식신" : "상관"; // 일간 生 대상 → 식상
  if (CTL[ie] === te) return same ? "편재" : "정재"; // 일간 克 대상 → 재성
  if (CTL[te] === ie) return same ? "편관" : "정관"; // 대상 克 일간 → 관성
  if (GEN[te] === ie) return same ? "편인" : "정인"; // 대상 生 일간 → 인성
  return "";
}

/** 천간의 십성 */
export function sipseongOfStem(ilgan: string, stem: string): string {
  return sipseong(ilgan, stem);
}

/** 지지의 십성 (본기 기준) */
export function sipseongOfBranch(ilgan: string, branch: string): string {
  const main = BRANCH_MAIN[branch];
  return main ? sipseong(ilgan, main) : "";
}

// ── 십이운성(十二運星) ──
// 일간 기준 어떤 지지가 어느 단계(장생~양)에 있는지. 양간 順行 / 음간 逆行.
const UNSEONG_STAGES = ["장생", "목욕", "관대", "건록", "제왕", "쇠", "병", "사", "묘", "절", "태", "양"];
const BRANCH_ORDER = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
// 일간 → [장생 지지 인덱스, 진행방향(양간 +1 / 음간 -1)]
const JANGSAENG: Record<string, [number, 1 | -1]> = {
  甲: [11, 1], 丙: [2, 1], 戊: [2, 1], 庚: [5, 1], 壬: [8, 1],
  乙: [6, -1], 丁: [9, -1], 己: [9, -1], 辛: [0, -1], 癸: [3, -1],
};

/** 지지의 십이운성 (일간 기준) */
export function unseongOf(ilgan: string, branch: string): string {
  const j = JANGSAENG[ilgan];
  const b = BRANCH_ORDER.indexOf(branch);
  if (!j || b < 0) return "";
  const [start, dir] = j;
  for (let k = 0; k < 12; k++) {
    if ((((start + dir * k) % 12) + 12) % 12 === b) return UNSEONG_STAGES[k];
  }
  return "";
}
