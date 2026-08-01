// 결혼/연애 궁합 합충형해파원진 계산 — page.tsx와 route.ts 공유

export const HANJA_TO_KOR: Record<string, string> = {
  "甲":"갑","乙":"을","丙":"병","丁":"정","戊":"무","己":"기","庚":"경","辛":"신","壬":"임","癸":"계",
  "子":"자","丑":"축","寅":"인","卯":"묘","辰":"진","巳":"사","午":"오","未":"미","申":"신","酉":"유","戌":"술","亥":"해",
};
export const toKor = (h: string) => HANJA_TO_KOR[h] ?? h;

export const GAN_HAP: [string,string,string][] = [
  ["갑","기","갑기합"],["을","경","을경합"],["병","신","병신합"],["정","임","정임합"],["무","계","무계합"],
];
export const GAN_CHUNG: [string,string,string][] = [
  ["갑","경","갑경충"],["을","신","을신충"],["병","임","병임충"],["정","계","정계충"],
  ["무","임","무임충"],["갑","무","갑무충"],["경","병","경병충"],["기","을","기을충"],["계","기","계기충"],
];
export const YUK_HAP: [string,string,string][] = [
  ["자","축","자축합"],["인","해","인해합"],["묘","술","묘술합"],["진","유","진유합"],["사","신","사신합"],["오","미","오미합"],
];
export const SAM_HAP: [string[],string][] = [
  [["인","오","술"],"인오술 삼합(화국)"],[["신","자","진"],"신자진 삼합(수국)"],
  [["해","묘","미"],"해묘미 삼합(목국)"],[["사","유","축"],"사유축 삼합(금국)"],
];
export const JI_CHUNG: [string,string,string][] = [
  ["자","오","자오충"],["축","미","축미충"],["인","신","인신충"],["묘","유","묘유충"],["진","술","진술충"],["사","해","사해충"],
];
export const HYEONG: [string[],string][] = [
  [["인","사","신"],"인사신 형"],[["축","술","미"],"축술미 형"],
  [["진","진"],"진진 자형"],[["오","오"],"오오 자형"],[["유","유"],"유유 자형"],[["해","해"],"해해 자형"],
  [["자","묘"],"자묘 상형"],
];
export const PA: [string,string,string][] = [
  ["자","유","자유파"],["오","묘","오묘파"],["인","해","인해파"],["사","신","사신파"],["축","진","축진파"],["술","미","술미파"],
];
export const HAE: [string,string,string][] = [
  ["자","미","자미해"],["축","오","축오해"],["인","사","인사해"],["묘","진","묘진해"],["신","해","신해해"],["유","술","유술해"],
];
export const WONJIN: [string,string,string][] = [
  ["자","미","자미원진"],["축","오","축오원진"],["인","유","인유원진"],["묘","신","묘신원진"],["진","해","진해원진"],["사","술","사술원진"],
];

export const HAP_KINDS = ["천간합", "육합", "삼합"];

export const REL_SCORE: Record<string, number> = {
  "삼합":   +12,
  "천간합": +8,
  "육합":   +7,
  "천간충": -8,
  "원진":   -7,
  "충":     -6,
  "형":     -5,
  "해":     -4,
  "파":     -3,
};

export type CrossRel = { kind: string; chars: string[]; label: string };

export function calcCrossRelations(
  myView: { pillars: Array<{ gan: string; ji: string }> },
  ptView: { pillars: Array<{ gan: string; ji: string }> }
): CrossRel[] {
  const myGans = myView.pillars.map(p => toKor(p.gan));
  const myJis  = myView.pillars.map(p => toKor(p.ji));
  const ptGans = ptView.pillars.map(p => toKor(p.gan));
  const ptJis  = ptView.pillars.map(p => toKor(p.ji));

  const rels: CrossRel[] = [];
  const added = new Set<string>();
  const add = (r: CrossRel) => {
    const k = r.kind + r.chars.join("");
    if (!added.has(k)) { added.add(k); rels.push(r); }
  };

  for (const [a, b, lbl] of GAN_HAP)
    if ((myGans.includes(a) && ptGans.includes(b)) || (myGans.includes(b) && ptGans.includes(a)))
      add({ kind: "천간합", chars: [a, b], label: lbl });

  for (const [a, b, lbl] of GAN_CHUNG)
    if ((myGans.includes(a) && ptGans.includes(b)) || (myGans.includes(b) && ptGans.includes(a)))
      add({ kind: "천간충", chars: [a, b], label: lbl });

  for (const [a, b, lbl] of YUK_HAP)
    if ((myJis.includes(a) && ptJis.includes(b)) || (myJis.includes(b) && ptJis.includes(a)))
      add({ kind: "육합", chars: [a, b], label: lbl });

  for (const [arr, lbl] of SAM_HAP) {
    const myFound = arr.filter(c => myJis.includes(c));
    const ptFound = arr.filter(c => ptJis.includes(c));
    const allFound = [...new Set([...myFound, ...ptFound])];
    if (allFound.length >= 2 && myFound.length >= 1 && ptFound.length >= 1)
      add({ kind: "삼합", chars: allFound, label: lbl });
  }

  for (const [a, b, lbl] of JI_CHUNG)
    if ((myJis.includes(a) && ptJis.includes(b)) || (myJis.includes(b) && ptJis.includes(a)))
      add({ kind: "충", chars: [a, b], label: lbl });

  for (const [arr, lbl] of HYEONG) {
    const myFound = arr.filter(c => myJis.includes(c));
    const ptFound = arr.filter(c => ptJis.includes(c));
    const allFound = [...new Set([...myFound, ...ptFound])];
    if (allFound.length >= 2 && myFound.length >= 1 && ptFound.length >= 1)
      add({ kind: "형", chars: allFound, label: lbl });
  }

  for (const [a, b, lbl] of PA)
    if ((myJis.includes(a) && ptJis.includes(b)) || (myJis.includes(b) && ptJis.includes(a)))
      add({ kind: "파", chars: [a, b], label: lbl });

  for (const [a, b, lbl] of HAE)
    if ((myJis.includes(a) && ptJis.includes(b)) || (myJis.includes(b) && ptJis.includes(a)))
      add({ kind: "해", chars: [a, b], label: lbl });

  for (const [a, b, lbl] of WONJIN)
    if ((myJis.includes(a) && ptJis.includes(b)) || (myJis.includes(b) && ptJis.includes(a)))
      add({ kind: "원진", chars: [a, b], label: lbl });

  return rels;
}

export function calcKunghapScore(rels: CrossRel[]): { score: number } {
  const raw = rels.reduce((acc, r) => acc + (REL_SCORE[r.kind] ?? 0), 70);
  return { score: Math.min(100, Math.max(0, raw)) };
}

// 일간 오행 상생·상극 — 결혼궁합 점수 전용 보정값 (한글/한자 모두 지원)
const ILGAN_OHAENG: Record<string, string> = {
  "갑":"목","을":"목","병":"화","정":"화","무":"토","기":"토","경":"금","신":"금","임":"수","계":"수",
  "甲":"목","乙":"목","丙":"화","丁":"화","戊":"토","己":"토","庚":"금","辛":"금","壬":"수","癸":"수",
};
const SANGSAENG_PAIRS: [string, string][] = [
  ["목","화"],["화","토"],["토","금"],["금","수"],["수","목"],
];
const SANGGEUK_PAIRS: [string, string][] = [
  ["목","토"],["토","수"],["수","화"],["화","금"],["금","목"],
];
// 음양: 갑·병·무·경·임 = 양, 을·정·기·신·계 = 음
const YANG_ILGAN = new Set(["갑","병","무","경","임"]);

function ilganRelBonus(myIlgan: string, ptIlgan: string): number {
  const myO = ILGAN_OHAENG[myIlgan] ?? "";
  const ptO = ILGAN_OHAENG[ptIlgan] ?? "";
  if (!myO || !ptO) return 0;
  let bonus = 0;
  if (myO === ptO) {
    bonus += 2; // 비화(比和) — 동질감
  } else {
    for (const [a, b] of SANGSAENG_PAIRS) {
      if ((myO === a && ptO === b) || (myO === b && ptO === a)) { bonus += 9; break; }
    }
    for (const [a, b] of SANGGEUK_PAIRS) {
      if ((myO === a && ptO === b) || (myO === b && ptO === a)) { bonus -= 9; break; }
    }
  }
  // 음양 조화: 이성 궁합에서 음양이 다를수록 끌림
  const myYang = YANG_ILGAN.has(myIlgan);
  const ptYang = YANG_ILGAN.has(ptIlgan);
  bonus += myYang !== ptYang ? 3 : -2;
  return bonus;
}

/** 결혼궁합 점수: 합충 기반 + 일간 오행 상생·상극 보정 */
export function calcMarriageScore(rels: CrossRel[], myIlgan: string, ptIlgan: string): { score: number } {
  const base = rels.reduce((acc, r) => acc + (REL_SCORE[r.kind] ?? 0), 90);
  const bonus = ilganRelBonus(myIlgan, ptIlgan);
  return { score: Math.min(100, Math.max(0, base + bonus)) };
}

export function buildBreakdownText(rels: CrossRel[]): string {
  const hapRels = rels.filter(r => HAP_KINDS.includes(r.kind));
  const negRels = rels.filter(r => !HAP_KINDS.includes(r.kind));
  const lines: string[] = [];
  if (hapRels.length)
    lines.push(`[합(合) — 인연을 높이는 요소]\n${hapRels.map(r => `  · ${r.label} (${r.chars.join("↔")})`).join("\n")}`);
  if (negRels.length)
    lines.push(`[충·형·해·파·원진 — 긴장을 만드는 요소]\n${negRels.map(r => `  · ${r.label} (${r.chars.join("↔")})`).join("\n")}`);
  if (!hapRels.length && !negRels.length)
    lines.push("발견된 합충 관계 없음 (중성적 구조)");
  return lines.join("\n");
}
