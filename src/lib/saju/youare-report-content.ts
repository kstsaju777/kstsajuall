export const YOUARE_CHAPTER_SECTIONS: Record<number, string[]> = {
  1: ["nature","temperament","talentFlow"], 2: ["hiddenTalent","growthPath","weaknesses"], 3: ["studyStyle","career","environment"], 4: ["hardPeriod","luckyPeriod","yearFlow"], 5: ["health","parentingTips","warnings"], 6: ["letter"],
};
export function isYouareChapterReady(content: Record<string, unknown> | null | undefined, chapter: number): boolean {
  if (!content) return false;
  const keys = YOUARE_CHAPTER_SECTIONS[chapter] ?? [];
  return keys.every((k) => { const val = content[k]; if (!val) return false; const v = val as { paragraphs?: unknown[] }; return Array.isArray(v.paragraphs) && v.paragraphs.length > 0; });
}