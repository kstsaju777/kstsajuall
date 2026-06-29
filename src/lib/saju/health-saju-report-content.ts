export const HEALTH_CHAPTER_SECTIONS: Record<number, string[]> = {
  1: ["myGist","bodyType","energyBalance"], 2: ["weakOrgans","chronicRisk","mentalHealth"], 3: ["healthTiming","luckyPeriod","warningPeriod"], 4: ["dietStyle","exerciseStyle","restStyle"], 5: ["obstacles","badHabits","correctApproach"], 6: ["letter"],
};
export function isHealthChapterReady(content: Record<string, unknown> | null | undefined, chapter: number): boolean {
  if (!content) return false;
  const keys = HEALTH_CHAPTER_SECTIONS[chapter] ?? [];
  return keys.every((k) => { const val = content[k]; if (!val) return false; const v = val as { paragraphs?: unknown[] }; return Array.isArray(v.paragraphs) && v.paragraphs.length > 0; });
}