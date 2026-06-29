export const JAEMUL_CHAPTER_SECTIONS: Record<number, string[]> = {
  1: ["myGist","moneyStyle","wealthPotential"], 2: ["wealthTiming","luckyPeriod","warningPeriod"], 3: ["incomeSource","investStyle","riskPattern"], 4: ["careerWealth","businessFit","partnershipWealth"], 5: ["obstacles","badMoneyHabits","correctApproach"], 6: ["letter"],
};
export function isJaemulChapterReady(content: Record<string, unknown> | null | undefined, chapter: number): boolean {
  if (!content) return false;
  const keys = JAEMUL_CHAPTER_SECTIONS[chapter] ?? [];
  return keys.every((k) => { const val = content[k]; if (!val) return false; const v = val as { paragraphs?: unknown[] }; return Array.isArray(v.paragraphs) && v.paragraphs.length > 0; });
}