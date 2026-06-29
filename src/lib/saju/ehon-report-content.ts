// 이혼사주 결과지 공유 상수 (client + server 모두 사용)

export const EHON_CHAPTER_SECTIONS: Record<number, string[]> = {
  1: ["myGist", "partnerGist", "marriageIneon"],
  2: ["compatScore", "conflictRoot", "emotionGap"],
  3: ["partnerMind", "partnerFeelings", "reconcilePossibility"],
  4: ["divorceTimingAnalysis", "warningPeriod", "luckyPeriod"],
  5: ["afterDivorceLife", "newIneon", "selfRecovery"],
  6: ["letter"],
};

export function isEhonChapterReady(content: Record<string, unknown> | null | undefined, chapter: number): boolean {
  if (!content) return false;
  const keys = EHON_CHAPTER_SECTIONS[chapter] ?? [];
  return keys.every((k) => {
    const val = content[k];
    if (!val) return false;
    const v = val as { paragraphs?: unknown[] };
    return Array.isArray(v.paragraphs) && v.paragraphs.length > 0;
  });
}
