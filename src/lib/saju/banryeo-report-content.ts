export const BANRYEO_CHAPTER_SECTIONS: Record<number, string[]> = {
  1: ["myGist", "partnerGist", "attractionReason"],
  2: ["compatScore", "conflictPattern", "emotionDiff"],
  3: ["partnerView", "partnerFeelings", "approachTiming"],
  4: ["lovePeriod", "luckyPeriod", "warningPeriod"],
  5: ["obstacles", "badActions", "correctApproach"],
  6: ["letter"],
};
export function isBanryeoChapterReady(content: Record<string, unknown> | null | undefined, chapter: number): boolean {
  if (!content) return false;
  const keys = BANRYEO_CHAPTER_SECTIONS[chapter] ?? [];
  return keys.every((k) => { const val = content[k]; if (!val) return false; const v = val as { paragraphs?: unknown[] }; return Array.isArray(v.paragraphs) && v.paragraphs.length > 0; });
}