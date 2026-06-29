export const IMSHIN_CHAPTER_SECTIONS: Record<number, string[]> = {
  1: ["myGist","maternityEnergy","bodyBalance"], 2: ["pregnancyTiming","luckyPeriod","warningPeriod"], 3: ["babyIneon","babyGender","babyCharacter"], 4: ["healthCare","mindCare","envCare"], 5: ["obstacles","warnings","correctApproach"], 6: ["letter"],
};
export function isImshinChapterReady(content: Record<string, unknown> | null | undefined, chapter: number): boolean {
  if (!content) return false;
  const keys = IMSHIN_CHAPTER_SECTIONS[chapter] ?? [];
  return keys.every((k) => { const val = content[k]; if (!val) return false; const v = val as { paragraphs?: unknown[] }; return Array.isArray(v.paragraphs) && v.paragraphs.length > 0; });
}