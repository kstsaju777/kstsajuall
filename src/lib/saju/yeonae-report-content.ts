// 연애궁합 결과지 공유 상수 (client + server 모두 사용)

export const YEONAE_CHAPTER_SECTIONS: Record<number, string[]> = {
  1: ["myGist", "partnerGist", "attractionReason"],
  2: ["compatScore", "conflictPattern", "emotionDiff"],
  3: ["partnerView", "partnerFeelings", "approachTiming"],
  4: ["lovePeriod", "luckyPeriod", "warningPeriod"],
  5: ["obstacles", "badActions", "correctApproach"],
  6: ["letter"],
};

export function isYeonaeChapterReady(content: Record<string, unknown> | null | undefined, chapter: number): boolean {
  if (!content) return false;
  const keys = YEONAE_CHAPTER_SECTIONS[chapter] ?? [];
  return keys.every((k) => {
    const val = content[k];
    if (!val) return false;
    const v = val as { paragraphs?: unknown[] };
    return Array.isArray(v.paragraphs) && v.paragraphs.length > 0;
  });
}
