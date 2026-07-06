/**
 * 로딩 화면 전용 만세력 계산 엔진
 * lunar-javascript 라이브러리 기반, API 호출 없이 클라이언트에서 직접 계산
 * ※ 결제 후 풀 리포트 생성(manseryeok.ts / saju-api.ts)과는 완전히 독립된 파일
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Solar, Lunar } = require("lunar-javascript");

// ─── 오행 매핑 ───────────────────────────────────────────────────────────────
export const ohaengMap: Record<string, { hg: string; el: string; type: string; class: string }> = {
  '甲': { hg: '갑', el: '목', type: '+목', class: 'wood' },
  '乙': { hg: '을', el: '목', type: '-목', class: 'wood' },
  '丙': { hg: '병', el: '화', type: '+화', class: 'fire' },
  '丁': { hg: '정', el: '화', type: '-화', class: 'fire' },
  '戊': { hg: '무', el: '토', type: '+토', class: 'earth' },
  '己': { hg: '기', el: '토', type: '-토', class: 'earth' },
  '庚': { hg: '경', el: '금', type: '+금', class: 'metal' },
  '辛': { hg: '신', el: '금', type: '-금', class: 'metal' },
  '壬': { hg: '임', el: '수', type: '+수', class: 'water' },
  '癸': { hg: '계', el: '수', type: '-수', class: 'water' },
  '子': { hg: '자', el: '수', type: '-수', class: 'water' },
  '丑': { hg: '축', el: '토', type: '-토', class: 'earth' },
  '寅': { hg: '인', el: '목', type: '+목', class: 'wood' },
  '卯': { hg: '묘', el: '목', type: '-목', class: 'wood' },
  '辰': { hg: '진', el: '토', type: '+토', class: 'earth' },
  '巳': { hg: '사', el: '화', type: '+화', class: 'fire' },
  '午': { hg: '오', el: '화', type: '-화', class: 'fire' },
  '未': { hg: '미', el: '토', type: '-토', class: 'earth' },
  '申': { hg: '신', el: '금', type: '+금', class: 'metal' },
  '酉': { hg: '유', el: '금', type: '-금', class: 'metal' },
  '戌': { hg: '술', el: '토', type: '+토', class: 'earth' },
  '亥': { hg: '해', el: '수', type: '+수', class: 'water' },
};

// ─── 오행별 UI 색상 ───────────────────────────────────────────────────────────
export const ELEMENT_COLORS: Record<string, { bg: string; text: string }> = {
  wood:    { bg: '#c8e6c9', text: '#2e7d32' },
  fire:    { bg: '#ffcdd2', text: '#c62828' },
  earth:   { bg: '#fff9c4', text: '#e65100' },
  metal:   { bg: '#b2ebf2', text: '#00838f' },
  water:   { bg: '#bbdefb', text: '#1565c0' },
  unknown: { bg: '#eeeeee', text: '#757575' },
};

// ─── 타입 ────────────────────────────────────────────────────────────────────
export type LocalPillar = {
  stem: string;       // 천간 한자 (甲乙丙...)
  branch: string;     // 지지 한자 (子丑寅...)
  stemHg: string;     // 천간 한글 (갑을병...)
  branchHg: string;   // 지지 한글 (자축인...)
  stemClass: string;  // 오행 CSS class
  branchClass: string;
  stemSs: string;     // 십성
  branchSs: string;
};

export type LocalSajuResult = {
  dayStem: string;
  pillars: {
    year: LocalPillar;
    month: LocalPillar;
    day: LocalPillar;
    time: LocalPillar;
  };
};

// ─── 십성 계산 ───────────────────────────────────────────────────────────────
function getShipseong(dsh: string, th: string): string {
  if (!dsh || !th || th === '?') return '';
  if (dsh === th) return '비견';
  const me = ohaengMap[dsh];
  const target = ohaengMap[th];
  if (!me || !target) return '';
  const els: Record<string, number> = { '목': 0, '화': 1, '토': 2, '금': 3, '수': 4 };
  const diff = (els[target.el] - els[me.el] + 5) % 5;
  const isSame = me.type[0] === target.type[0];
  const map: Record<number, string> = {
    0: isSame ? '비견' : '겁재',
    1: isSame ? '식신' : '상관',
    2: isSame ? '편재' : '정재',
    3: isSame ? '편관' : '정관',
    4: isSame ? '편인' : '정인',
  };
  return map[diff] ?? '';
}

// ─── 폼 입력값 파싱 헬퍼 ─────────────────────────────────────────────────────

// 시진 이름 → 그 시진 한가운데 시각 (lunar-javascript가 어느 경계 기준이든 오분류 없이 맞아떨어짐)
// 30분 오프셋 기준: 자시=23:30~01:30, 신시=15:30~17:30 등
const SIJU_HOUR_MAP: Record<string, string> = {
  '자시': '00:30',  // 23:30~01:30 중간
  '축시': '02:30',
  '인시': '04:30',
  '묘시': '06:30',
  '진시': '08:30',
  '사시': '10:30',
  '오시': '12:30',
  '미시': '14:30',
  '신시': '16:30',
  '유시': '18:30',
  '술시': '20:30',
  '해시': '22:30',
};

// "신시 (15:30 ~ 17:30)" → "16:30" / "시간 모름" → "unknown"
export function parseTimeVal(timeStr: string): string {
  if (!timeStr || timeStr === '시간 모름') return 'unknown';
  // 시진 이름 추출 — SIJU_HOUR_MAP 키와 직접 매칭
  for (const key of Object.keys(SIJU_HOUR_MAP)) {
    if (timeStr.startsWith(key)) return SIJU_HOUR_MAP[key];
  }
  // fallback: 괄호 안 시각 추출
  const match = timeStr.match(/\((\d{2}:\d{2})/);
  return match ? match[1] : 'unknown';
}

// "양력"/"음력"/"윤달" → 'solar'/'lunar'/'leap'
export function parseCalendar(cal: string): 'solar' | 'lunar' | 'leap' {
  if (cal === '음력') return 'lunar';
  if (cal === '윤달') return 'leap';
  return 'solar';
}

// "1989.12.21" → { year, month, day }
export function parseDate(dateStr: string): { year: number; month: number; day: number } | null {
  const parts = dateStr?.split('.');
  if (!parts || parts.length < 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return { year, month, day };
}

// ─── 핵심 계산 ───────────────────────────────────────────────────────────────
export function calcSaju(
  date: string,
  timeStr: string,
  calendarStr: string,
): LocalSajuResult | null {
  try {
    const parsed = parseDate(date);
    if (!parsed) return null;
    const { year, month, day } = parsed;
    const timeVal = parseTimeVal(timeStr);
    const calendar = parseCalendar(calendarStr);

    let h = 12, m = 0;
    if (timeVal !== 'unknown') {
      const parts = timeVal.split(':').map(Number);
      h = parts[0];
      m = parts[1] ?? 0;
    }

    let bazi;
    if (calendar === 'solar') {
      bazi = Solar.fromYmdHms(year, month, day, h, m, 0).getLunar().getEightChar();
    } else {
      bazi = Lunar.fromYmdHms(
        year,
        calendar === 'leap' ? -month : month,
        day, h, m, 0,
      ).getEightChar();
    }

    const yh: string = bazi.getYear();
    const mh: string = bazi.getMonth();
    const dh: string = bazi.getDay();
    const thRaw: string | null = timeVal === 'unknown' ? null : bazi.getTime();
    const dStem = dh[0];

    const makePillar = (s: string, b: string, isDay = false): LocalPillar => ({
      stem: s,
      branch: b,
      stemHg: ohaengMap[s]?.hg ?? s,
      branchHg: ohaengMap[b]?.hg ?? b,
      stemClass: ohaengMap[s]?.class ?? 'unknown',
      branchClass: ohaengMap[b]?.class ?? 'unknown',
      stemSs: isDay ? '일간' : getShipseong(dStem, s),
      branchSs: getShipseong(dStem, b),
    });

    return {
      dayStem: dStem,
      pillars: {
        year:  makePillar(yh[0], yh[1]),
        month: makePillar(mh[0], mh[1]),
        day:   makePillar(dh[0], dh[1], true),
        time:  makePillar(thRaw ? thRaw[0] : '?', thRaw ? thRaw[1] : '?'),
      },
    };
  } catch {
    return null;
  }
}
