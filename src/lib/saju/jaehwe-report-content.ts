// 재회궁합 리포트 챕터 정의 (클라이언트·서버 공유)

export const JAEHWE_CHAPTER_SECTIONS: Record<number, string[]> = {
  1: ["myGist", "partnerGist", "breakupMeaning"],
  2: ["breakupCause", "conflictPattern", "emotionFlow"],
  3: ["partnerView", "partnerFeelings", "contactTiming"],
  4: ["reunionTiming", "luckyPeriod", "warningPeriod"],
  5: ["obstacles", "badActions", "correctApproach"],
  6: ["letter"],
};

export function isJaehweChapterReady(content: Record<string, unknown> | null | undefined, chapter: number): boolean {
  if (!content) return false;
  const keys = JAEHWE_CHAPTER_SECTIONS[chapter];
  if (!keys?.length) return false;
  return keys.every((k) => {
    const v = content[k];
    if (!v || typeof v !== "object") return false;
    const p = (v as Record<string, unknown>).paragraphs;
    return Array.isArray(p) && p.length > 0;
  });
}
