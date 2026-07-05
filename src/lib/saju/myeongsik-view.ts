// =====================================================
// 운세위키(luckyloveme) 풀 분석 응답 → 명식 모달용 뷰 변환
// =====================================================
// ganji / sipseong / twelveFortune / sibisinsals / daeun / seun / weolun 을
// 결과지 "나의 명식" 모달이 그대로 그릴 수 있는 형태로 가공한다.
// 지장간(jijang)은 API 가 제공하지 않아 지지별 고정표로 로컬 계산한다.

export type MsPillar = {
  pos: string; // "시주" | "일주" | "월주" | "년주"
  sipTop: string; // 천간 십성 (일간은 "일원")
  gan: string; // 천간 한자
  ganEl: string; // 천간 오행 (목/화/토/금/수)
  ji: string; // 지지 한자
  jiEl: string; // 지지 오행
  sipBot: string; // 지지 십성
  jijang: string; // 지장간 (로컬 계산)
  unseong: string; // 십이운성
  sinsal: string; // 신살 (여러 개면 공백 구분)
};

export type MsFlowItem = { label: string; gz: string; active: boolean; sipTop?: string; sipBot?: string };
export type MsDaeunItem = MsFlowItem & { yearStart: number }; // 대운 시작 연도(드릴다운용)

export type MyeongsikView = {
  ilgan: string; // "庚 (경금)"
  pillars: MsPillar[]; // 시 → 일 → 월 → 년 순
  daeun: MsDaeunItem[];
  seun: MsFlowItem[]; // 초기 표시용(현재 주변). 인터랙션 시엔 대운 기준으로 재계산.
  weolun: MsFlowItem[];
  currentYear: number; // 현재 세운 연도 (기본 선택/강조)
  currentMonth: number; // 현재 월운 월 (1~12)
  sinStrength?: { score: number; strength: string; level: number }; // 신강/신약 (0~100점, 라벨, 7단계)
};

// ── 로컬 신살 계산표 ──────────────────────────────────────────────────────────
// 천을귀인: 일간 → 해당 지지 목록
const TBL_CHEONUL: Record<string, string[]> = {
  "甲": ["丑","未"], "戊": ["丑","未"], "庚": ["丑","未"],
  "乙": ["子","申"], "己": ["子","申"],
  "丙": ["亥","酉"], "丁": ["亥","酉"],
  "辛": ["寅","午"],
  "壬": ["卯","巳"], "癸": ["卯","巳"],
};
// 문창귀인: 일간 → 지지
const TBL_MUNCHANG: Record<string, string> = {
  "甲":"巳","乙":"午","丙":"申","丁":"酉",
  "戊":"申","己":"酉","庚":"亥","辛":"子","壬":"寅","癸":"卯",
};
// 양인살: 일간 → 지지
const TBL_YANGIN: Record<string, string> = {
  "甲":"卯","乙":"寅","丙":"午","丁":"巳",
  "戊":"午","己":"巳","庚":"酉","辛":"申","壬":"子","癸":"亥",
};
// 암록: 일간 → 지지
const TBL_AMNOK: Record<string, string> = {
  "甲":"亥","乙":"戌","丙":"申","丁":"未",
  "戊":"申","己":"未","庚":"巳","辛":"辰","壬":"寅","癸":"丑",
};
// 금여록: 일간 → 지지
const TBL_GEUMNYEO: Record<string, string> = {
  "甲":"辰","乙":"巳","丙":"未","丁":"申",
  "戊":"未","己":"申","庚":"戌","辛":"亥","壬":"丑","癸":"寅",
};
// 천덕귀인: 월지 → 천간 또는 지지 (사주 4기둥 어디든 해당 글자 있으면 적용)
const TBL_CHEONDEOK: Record<string, string> = {
  "寅":"丁","卯":"申","辰":"壬","巳":"辛",
  "午":"亥","未":"甲","申":"癸","酉":"寅",
  "戌":"丙","亥":"乙","子":"巳","丑":"庚",
};
// 월덕귀인: 월지 → 천간 (해당 천간이 있는 기둥에 적용)
const TBL_WOLDEOK: Record<string, string> = {
  "寅":"丙","午":"丙","戌":"丙",
  "亥":"甲","卯":"甲","未":"甲",
  "申":"壬","子":"壬","辰":"壬",
  "巳":"庚","酉":"庚","丑":"庚",
};
// 문곡귀인: 일간 → 지지
const TBL_MUNGOK: Record<string, string> = {
  "甲":"亥","乙":"子","丙":"寅","丁":"卯",
  "戊":"寅","己":"卯","庚":"巳","辛":"午","壬":"申","癸":"酉",
};
// 학당귀인: 일간 → 지지
const TBL_HAKDANG: Record<string, string> = {
  "甲":"寅","戊":"寅","乙":"午","丙":"寅",
  "丁":"酉","己":"酉","庚":"巳","辛":"子","壬":"申","癸":"卯",
};
// 홍염살: 일간 → 지지 목록
const TBL_HONGYEOM: Record<string, string[]> = {
  "甲":["午","申"],"乙":["申"],"丙":["寅"],"丁":["未"],
  "戊":["辰"],"己":["辰"],"庚":["戌","申"],"辛":["酉"],"壬":["子"],"癸":["申"],
};
// 백호살: 일주(천간+지지) 7가지 고정
const SET_BAEHO = new Set(["甲辰","乙未","丙戌","丁丑","戊辰","壬戌","癸丑"]);
// 괴강살: 일주(천간+지지) 4가지 고정
const SET_GOEGANG = new Set(["庚辰","庚戌","壬辰","戊戌"]);
// 태극귀인: 일간 → 지지 목록 (년지 또는 일지에 해당 지지가 있으면 성립)
const TBL_TAEGUK: Record<string, string[]> = {
  "甲": ["子","午"], "乙": ["子","午"],
  "丙": ["卯","酉"], "丁": ["卯","酉"],
  "戊": ["辰","戌","丑","未"], "己": ["辰","戌","丑","未"],
  "庚": ["寅","亥"], "辛": ["寅","亥"],
  "壬": ["巳","申"], "癸": ["巳","申"],
};
// 화개살: 년지/일지 삼합 그룹 → 묘고지 (해당 지지가 있는 기둥에 적용)
const TBL_HWAGAE: Record<string, string> = {
  "亥":"未","卯":"未","未":"未",
  "寅":"戌","午":"戌","戌":"戌",
  "巳":"丑","酉":"丑","丑":"丑",
  "申":"辰","子":"辰","辰":"辰",
};
// 장성살: 일지 삼합 그룹 → 왕지 (해당 지지가 있는 기둥에 적용)
const TBL_JANGSEONG: Record<string, string> = {
  "申":"子","子":"子","辰":"子",
  "寅":"午","午":"午","戌":"午",
  "亥":"卯","卯":"卯","未":"卯",
  "巳":"酉","酉":"酉","丑":"酉",
};
// 겁살: 년지 삼합 그룹 → 절지 (해당 지지가 있는 기둥에 적용)
const TBL_GEOBSAL: Record<string, string> = {
  "申":"巳","子":"巳","辰":"巳",
  "寅":"亥","午":"亥","戌":"亥",
  "亥":"申","卯":"申","未":"申",
  "巳":"寅","酉":"寅","丑":"寅",
};

export function applyLocalSinsal(pillars: MsPillar[]): MsPillar[] {
  const extra = calcLocalSinsal(pillars);
  return pillars.map((p) => {
    const existing = new Set(p.sinsal.split(/\s+/).filter(Boolean));
    const toAdd = (extra[p.pos] ?? []).filter((s) => !existing.has(s));
    if (toAdd.length === 0) return p;
    return { ...p, sinsal: [p.sinsal, ...toAdd].filter(Boolean).join(" ") };
  });
}

function calcLocalSinsal(pillars: MsPillar[]): Record<string, string[]> {
  const extra: Record<string, string[]> = { "시주": [], "일주": [], "월주": [], "년주": [] };
  const add = (pos: string, name: string) => { extra[pos]?.push(name); };

  const ilgan = pillars[1]?.gan;  // 일간
  const wolji = pillars[2]?.ji;   // 월지
  const nyeonji = pillars[3]?.ji; // 년지
  if (!ilgan) return extra;

  // 천을귀인 — 일간 기준, 각 기둥 지지 체크
  const cuJis = TBL_CHEONUL[ilgan] ?? [];
  for (const p of pillars) if (cuJis.includes(p.ji)) add(p.pos, "천을귀인");

  // 문창귀인 — 일간 기준
  const mcJi = TBL_MUNCHANG[ilgan];
  if (mcJi) for (const p of pillars) if (p.ji === mcJi) add(p.pos, "문창귀인");

  // 양인살 — 일간 기준
  const yiJi = TBL_YANGIN[ilgan];
  if (yiJi) for (const p of pillars) if (p.ji === yiJi) add(p.pos, "양인살");

  // 암록 — 일간 기준
  const amJi = TBL_AMNOK[ilgan];
  if (amJi) for (const p of pillars) if (p.ji === amJi) add(p.pos, "암록");

  // 금여록 — 일간 기준
  const gnJi = TBL_GEUMNYEO[ilgan];
  if (gnJi) for (const p of pillars) if (p.ji === gnJi) add(p.pos, "금여록");

  // 천덕귀인 — 월지 기준, 해당 천간/지지가 있는 기둥
  if (wolji) {
    const cdTarget = TBL_CHEONDEOK[wolji];
    if (cdTarget) for (const p of pillars) if (p.gan === cdTarget || p.ji === cdTarget) add(p.pos, "천덕귀인");
  }

  // 월덕귀인 — 월지 기준, 해당 천간이 있는 기둥
  if (wolji) {
    const wdTarget = TBL_WOLDEOK[wolji];
    if (wdTarget) for (const p of pillars) if (p.gan === wdTarget) add(p.pos, "월덕귀인");
  }

  // 백호살 — 일주(천간+지지) 기준
  const ilju = pillars[1];
  if (ilju && SET_BAEHO.has(ilju.gan + ilju.ji)) add("일주", "백호살");

  // 괴강살 — 일주(천간+지지) 기준
  if (ilju && SET_GOEGANG.has(ilju.gan + ilju.ji)) add("일주", "괴강살");

  // 태극귀인 — 일간 기준, 4기둥 지지 전체 체크
  const tgJis = TBL_TAEGUK[ilgan] ?? [];
  for (const p of pillars) if (tgJis.includes(p.ji)) add(p.pos, "태극귀인");

  // 현침살 — 천간 甲·辛 또는 지지 卯·午·未·申
  const HYEONCHIM_GAN = new Set(["甲","辛"]);
  const HYEONCHIM_JI = new Set(["卯","午","未","申"]);
  for (const p of pillars) if (HYEONCHIM_GAN.has(p.gan) || HYEONCHIM_JI.has(p.ji)) add(p.pos, "현침살");

  // 귀문관살 — 지지에 특정 두 글자가 동시에 있으면 해당 기둥 모두에 표기
  const GWIMUN_PAIRS: [string, string][] = [
    ["子","酉"],["丑","午"],["寅","未"],["卯","申"],["辰","亥"],["巳","戌"],
  ];
  const jiSet = pillars.map((p) => p.ji);
  for (const [a, b] of GWIMUN_PAIRS) {
    if (jiSet.includes(a) && jiSet.includes(b)) {
      for (const p of pillars) if (p.ji === a || p.ji === b) add(p.pos, "귀문관살");
    }
  }

  // 도화살 — 지지에 子·午·卯·酉
  const DOHWA = new Set(["子","午","卯","酉"]);
  for (const p of pillars) if (DOHWA.has(p.ji)) add(p.pos, "도화살");

  // 역마살 — 지지에 寅·申·巳·亥
  const YEOKMA = new Set(["寅","申","巳","亥"]);
  for (const p of pillars) if (YEOKMA.has(p.ji)) add(p.pos, "역마살");

  // 문곡귀인 — 일간 기준
  const mgJi = TBL_MUNGOK[ilgan];
  if (mgJi) for (const p of pillars) if (p.ji === mgJi) add(p.pos, "문곡귀인");

  // 학당귀인 — 일간 기준
  const hdJi = TBL_HAKDANG[ilgan];
  if (hdJi) for (const p of pillars) if (p.ji === hdJi) add(p.pos, "학당귀인");

  // 홍염살 — 일간 기준
  const hyJis = TBL_HONGYEOM[ilgan] ?? [];
  for (const p of pillars) if (hyJis.includes(p.ji)) add(p.pos, "홍염살");

  // 화개살 — 년지/일지 기준
  const hwagaeTargets = new Set<string>();
  const ilji = pillars[1]?.ji;

  // 장성살 — 일지 기준, 왕지가 있는 기둥에 적용
  if (ilji) {
    const jsTarget = TBL_JANGSEONG[ilji];
    if (jsTarget) for (const p of pillars) if (p.ji === jsTarget) add(p.pos, "장성살");
  }
  if (nyeonji && TBL_HWAGAE[nyeonji]) hwagaeTargets.add(TBL_HWAGAE[nyeonji]);
  if (ilji && TBL_HWAGAE[ilji]) hwagaeTargets.add(TBL_HWAGAE[ilji]);
  for (const p of pillars) if (hwagaeTargets.has(p.ji)) add(p.pos, "화개살");

  // 겁살 — 년지 기준
  if (nyeonji) {
    const gsJi = TBL_GEOBSAL[nyeonji];
    if (gsJi) for (const p of pillars) if (p.ji === gsJi) add(p.pos, "겁살");
  }

  return extra;
}

// 지지(한글) → 지장간(한자, 본기 순)
const JIJANG: Record<string, string> = {
  자: "壬·癸", 축: "癸·辛·己", 인: "戊·丙·甲", 묘: "甲·乙",
  진: "乙·癸·戊", 사: "戊·庚·丙", 오: "丙·己·丁", 미: "丁·乙·己",
  신: "戊·壬·庚", 유: "庚·辛", 술: "辛·丁·戊", 해: "戊·甲·壬",
};

const ORDER = [
  { pos: "시주", key: "hour", ganPos: "시간", jiPos: "시지", fortPos: "시주", sinsalKeys: ["시지", "시주"] },
  { pos: "일주", key: "day", ganPos: "일간", jiPos: "일지", fortPos: "일주", sinsalKeys: ["일지", "일주"] },
  { pos: "월주", key: "month", ganPos: "월간", jiPos: "월지", fortPos: "월주", sinsalKeys: ["월지", "월주"] },
  { pos: "년주", key: "year", ganPos: "년간", jiPos: "년지", fortPos: "년주", sinsalKeys: ["년지", "년주"] },
] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildMyeongsikView(a: any): MyeongsikView {
  const ganji = a?.ganji ?? {};
  const sipList: { position?: string; sipseong?: string }[] = a?.sipseong?.sipseongs ?? [];
  const fortList: { position?: string; fortune?: string }[] = a?.twelveFortune?.fortunes ?? [];

  // 신살: 여러 배열을 (position, name) 으로 평탄화
  const sinsalEntries: { position?: string; name?: string }[] = [];
  const API_SINSAL_EXCLUDE = new Set(["낙정관살", "역마"]);
  for (const s of a?.sibisinsals?.sibisinsals ?? []) if (!API_SINSAL_EXCLUDE.has(s.name)) sinsalEntries.push({ position: s.position, name: s.name });
  for (const s of a?.sibisinsals?.cheonui ?? []) sinsalEntries.push({ position: s.position, name: s.name });
  // 낙정관살 제외
  // 괴강살은 로컬 계산으로 대체

  // 도화살
  const dohwaList = Array.isArray(a?.dohwa?.dohwas) ? a.dohwa.dohwas : Array.isArray(a?.dohwa) ? a.dohwa : [];
  for (const s of dohwaList) if (s?.position) sinsalEntries.push({ position: s.position, name: s.name ?? "도화살" });

  // 홍염살
  const hongyeomList = Array.isArray(a?.hongyeom?.hongyeoms) ? a.hongyeom.hongyeoms : Array.isArray(a?.hongyeom) ? a.hongyeom : [];
  for (const s of hongyeomList) if (s?.position) sinsalEntries.push({ position: s.position, name: s.name ?? "홍염살" });

  // 화개살
  const hwagaeList = Array.isArray(a?.hwagae?.hwagaes) ? a.hwagae.hwagaes : Array.isArray(a?.hwagae) ? a.hwagae : [];
  for (const s of hwagaeList) if (s?.position) sinsalEntries.push({ position: s.position, name: s.name ?? "화개살" });

  // 귀인 (16종 — position 있는 항목만)
  const guiinList = Array.isArray(a?.guiin?.guiins) ? a.guiin.guiins : Array.isArray(a?.guiin) ? a.guiin : [];
  for (const s of guiinList) if (s?.position) sinsalEntries.push({ position: s.position, name: s.name ?? s.type ?? "귀인" });

  const sipBy = (pos: string) => sipList.find((s) => s.position === pos)?.sipseong ?? "";
  const fortBy = (pos: string) => fortList.find((f) => f.position === pos)?.fortune ?? "";
  const sinsalBy = (keys: readonly string[]) =>
    sinsalEntries.filter((s) => s.position && keys.includes(s.position)).map((s) => s.name).filter(Boolean).join(" ");

  const pillars: MsPillar[] = ORDER.map((o) => {
    const g = ganji[o.key];
    if (!g) {
      return { pos: o.pos, sipTop: "—", gan: "—", ganEl: "", ji: "—", jiEl: "", sipBot: "—", jijang: "—", unseong: "—", sinsal: "" };
    }
    return {
      pos: o.pos,
      sipTop: o.key === "day" ? "일간(나)" : sipBy(o.ganPos),
      gan: g.ganHanja ?? g.gan ?? "—",
      ganEl: g.ohaeng?.gan ?? "",
      ji: g.jiHanja ?? g.ji ?? "—",
      jiEl: g.ohaeng?.ji ?? "",
      sipBot: sipBy(o.jiPos),
      jijang: JIJANG[g.ji] ?? "—",
      unseong: fortBy(o.fortPos),
      sinsal: sinsalBy(o.sinsalKeys),
    };
  });

  const day = ganji.day ?? {};
  const ilgan = day.ganHanja ? `${day.ganHanja} (${day.gan ?? ""}${day.ohaeng?.gan ?? ""})` : "—";

  // 대운
  const allDaeun: any[] = a?.daeun?.all_daeun ?? []; // eslint-disable-line @typescript-eslint/no-explicit-any
  const curDaeunSeq = a?.daeun?.current_daeun?.sequence;
  const daeun: MsDaeunItem[] = allDaeun.map((d) => ({
    label: String(d.age_start ?? ""),
    gz: d.ganji_hanja ?? d.ganji ?? "",
    active: d.sequence === curDaeunSeq,
    yearStart: Number(d.year_start ?? 0),
  }));

  // 세운 — 육십갑자 로컬 계산으로 현재+미래 10년 보장
  const sEl = a?.seun ?? {};
  const recentSeunAsc = [...(sEl.recentSeuns ?? [])].reverse();
  const seunApiRaw = [...recentSeunAsc.slice(-3), sEl.currentSeun, ...(sEl.upcomingSeuns ?? [])].filter(Boolean); // eslint-disable-line @typescript-eslint/no-explicit-any
  const curYear = sEl.currentSeun?.year as number | undefined;
  const STEMS_S   = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
  const BRANCHES_S = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
  const ganji60 = (y: number) => STEMS_S[((y - 4) % 10 + 10) % 10] + BRANCHES_S[((y - 4) % 12 + 12) % 12];
  // API 데이터를 map으로 취합
  const seunMap = new Map<number, string>();
  for (const s of seunApiRaw as any[]) { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (s?.year) seunMap.set(Number(s.year), s.ganji_hanja ?? s.ganji ?? ganji60(Number(s.year)));
  }
  // 현재 연도부터 9년 미래 보정
  if (curYear) {
    for (let y = curYear; y < curYear + 10; y++) {
      if (!seunMap.has(y)) seunMap.set(y, ganji60(y));
    }
  }
  const seun: MsFlowItem[] = [...seunMap.entries()].sort((a, b) => a[0] - b[0])
    .map(([year, gz]) => ({ label: String(year), gz, active: year === curYear }));

  // 월운 (현재 주변) — recent 는 내림차순으로 오므로 오름차순 정렬
  const wEl = a?.weolun ?? {};
  const recentWeolunAsc = [...(wEl.recentWeoluns ?? [])].reverse();
  const weolunRaw = [...recentWeolunAsc.slice(-3), wEl.currentWeolun, wEl.nextWeolun, ...(wEl.upcomingWeoluns ?? []).slice(0, 3)].filter(Boolean);
  const weolun: MsFlowItem[] = weolunRaw.map((w: any) => ({ label: `${w.month ?? ""}월`, gz: w.ganji_hanja ?? w.ganji ?? "", active: !!w.isCurrentMonth })); // eslint-disable-line @typescript-eslint/no-explicit-any

  const now = new Date();
  const currentYear = Number(sEl.currentSeun?.year ?? now.getFullYear());
  const currentMonth = Number(wEl.currentWeolun?.month ?? now.getMonth() + 1);

  const ss = a?.sinStrength;
  const sinStrength = ss
    ? { score: Number(ss.score ?? 50), strength: String(ss.strength ?? "중화"), level: Number(ss.level ?? 4) }
    : undefined;

  return { ilgan, pillars, daeun, seun, weolun, currentYear, currentMonth, sinStrength };
}
