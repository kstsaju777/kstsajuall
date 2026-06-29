export const BUSINESS_CHAPTER_SECTIONS: Record<number, string[]> = {
  1: ["myGist", "partnerGist", "businessCompatibility"],
  2: ["strengthsCombo", "conflictPattern", "roleBalance"],
  3: ["partnerView", "partnerFeelings", "trustLevel"],
  4: ["luckyPeriod", "warningPeriod", "expansion"],
  5: ["obstacles", "badActions", "correctApproach"],
  6: ["letter"],
};
export function isBusinessChapterReady(content: Record<string, unknown> | null | undefined, chapter: number): boolean {
  if (!content) return false;
  const keys = BUSINESS_CHAPTER_SECTIONS[chapter] ?? [];
  return keys.every((k) => { const val = content[k]; if (!val) return false; const v = val as { paragraphs?: unknown[] }; return Array.isArray(v.paragraphs) && v.paragraphs.length > 0; });
}