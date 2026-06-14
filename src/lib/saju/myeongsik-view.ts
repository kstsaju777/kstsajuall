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
};

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
  for (const s of a?.sibisinsals?.sibisinsals ?? []) sinsalEntries.push({ position: s.position, name: s.name });
  for (const s of a?.sibisinsals?.cheonui ?? []) sinsalEntries.push({ position: s.position, name: s.name });
  for (const s of a?.sibisinsals?.nakjeonggwansal ?? []) sinsalEntries.push({ position: s.position, name: s.name });
  const gg = a?.sibisinsals?.goegangsal;
  if (gg?.exists) for (const p of gg.positions ?? []) sinsalEntries.push({ position: p, name: "괴강살" });

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
      sipTop: o.key === "day" ? "일원" : sipBy(o.ganPos),
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

  // 세운 (현재 주변) — recent 는 내림차순으로 오므로 오름차순 정렬
  const sEl = a?.seun ?? {};
  const recentSeunAsc = [...(sEl.recentSeuns ?? [])].reverse();
  const seunRaw = [...recentSeunAsc.slice(-3), sEl.currentSeun, ...(sEl.upcomingSeuns ?? []).slice(0, 4)].filter(Boolean);
  const curYear = sEl.currentSeun?.year;
  const seun: MsFlowItem[] = seunRaw.map((s: any) => ({ label: String(s.year ?? ""), gz: s.ganji_hanja ?? s.ganji ?? "", active: s.year === curYear })); // eslint-disable-line @typescript-eslint/no-explicit-any

  // 월운 (현재 주변) — recent 는 내림차순으로 오므로 오름차순 정렬
  const wEl = a?.weolun ?? {};
  const recentWeolunAsc = [...(wEl.recentWeoluns ?? [])].reverse();
  const weolunRaw = [...recentWeolunAsc.slice(-3), wEl.currentWeolun, wEl.nextWeolun, ...(wEl.upcomingWeoluns ?? []).slice(0, 3)].filter(Boolean);
  const weolun: MsFlowItem[] = weolunRaw.map((w: any) => ({ label: `${w.month ?? ""}월`, gz: w.ganji_hanja ?? w.ganji ?? "", active: !!w.isCurrentMonth })); // eslint-disable-line @typescript-eslint/no-explicit-any

  const now = new Date();
  const currentYear = Number(sEl.currentSeun?.year ?? now.getFullYear());
  const currentMonth = Number(wEl.currentWeolun?.month ?? now.getMonth() + 1);

  return { ilgan, pillars, daeun, seun, weolun, currentYear, currentMonth };
}
