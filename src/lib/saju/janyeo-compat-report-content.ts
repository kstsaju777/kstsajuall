export const JANYEO_COMPAT_CHAPTER_SECTIONS: Record<number, string[]> = {
  1: ["myGist", "partnerGist", "parentChildIneon"],
  2: ["compatScore", "conflictPattern", "emotionDiff"],
  3: ["partnerView", "partnerFeelings", "parentingStyle"],
  4: ["luckyPeriod", "warningPeriod", "growthPeriod"],
  5: ["obstacles", "badActions", "correctApproach"],
  6: ["letter"],
};
export function isJanyeoCompatChapterReady(content: Record<string, unknown> | null | undefined, chapter: number): boolean {
  if (!content) return false;
  const keys = JANYEO_COMPAT_CHAPTER_SECTIONS[chapter] ?? [];
  return keys.every((k) => { const val = content[k]; if (!val) return false; const v = val as { paragraphs?: unknown[] }; return Array.isArray(v.paragraphs) && v.paragraphs.length > 0; });
}