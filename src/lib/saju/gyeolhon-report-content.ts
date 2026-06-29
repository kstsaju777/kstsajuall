export const GYEOLHON_CHAPTER_SECTIONS: Record<number, string[]> = {
  1: ["myGist","marriageStyle","idealPartner"], 2: ["marriageTiming","luckFlow","warningPeriod"], 3: ["partnerProfile","meetingChance","attractionType"], 4: ["marriageLife","homeHappiness","conflictPattern"], 5: ["obstacles","badHabits","selfGrowth"], 6: ["letter"],
};
export function isGyeolhonChapterReady(content: Record<string, unknown> | null | undefined, chapter: number): boolean {
  if (!content) return false;
  const keys = GYEOLHON_CHAPTER_SECTIONS[chapter] ?? [];
  return keys.every((k) => { const val = content[k]; if (!val) return false; const v = val as { paragraphs?: unknown[] }; return Array.isArray(v.paragraphs) && v.paragraphs.length > 0; });
}