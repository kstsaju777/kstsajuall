export const YEONAE_SAJU_CHAPTER_SECTIONS: Record<number, string[]> = {
  1: ["myGist","loveStyle","attractionType"], 2: ["loveTiming","luckyPeriod","warningPeriod"], 3: ["idealPartner","meetingChance","lovePattern"], 4: ["conflictStyle","emotionPattern","growthInLove"], 5: ["obstacles","badLoveHabits","correctApproach"], 6: ["letter"],
};
export function isYeonaeSajuChapterReady(content: Record<string, unknown> | null | undefined, chapter: number): boolean {
  if (!content) return false;
  const keys = YEONAE_SAJU_CHAPTER_SECTIONS[chapter] ?? [];
  return keys.every((k) => { const val = content[k]; if (!val) return false; const v = val as { paragraphs?: unknown[] }; return Array.isArray(v.paragraphs) && v.paragraphs.length > 0; });
}