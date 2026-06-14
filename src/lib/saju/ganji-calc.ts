// =====================================================
// 연운/월운 간지 로컬 계산 (60갑자 주기)
// =====================================================
// 대운 → 세운(연운) → 월운 드릴다운에서, 임의 연/월의 간지를 API 없이 계산한다.
// 운세위키 응답 표기 규약과 일치하도록 보정됨:
//   • 연 간지: (year-4) mod 60   (예: 2025 = 乙巳)
//   • 월 간지: 2026년 6월 = 甲午(60갑자 index 30) 를 기준점으로 월마다 +1
//     → index = (year*12 + month - 24288) mod 60

const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

function gz(n: number): string {
  const i = ((n % 60) + 60) % 60;
  return STEMS[i % 10] + BRANCHES[i % 12];
}

/** 해당 연도의 세운 간지 (한자) */
export function yearGanji(year: number): string {
  return gz(year - 4);
}

/** 해당 연·월(양력 캘린더 월)의 월운 간지 (한자) */
export function monthGanji(year: number, month: number): string {
  return gz(year * 12 + month - 24288);
}
