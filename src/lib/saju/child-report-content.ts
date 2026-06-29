// 자녀사주 결과지 공유 상수 (client + server 모두 사용)

export const CHILD_CHAPTER_SECTIONS: Record<number, string[]> = {
  1: ["nature", "temperament", "parentRelation"],
  2: ["talent", "hiddenStrength", "weaknesses"],
  3: ["studyStyle", "career", "environment"],
  4: ["hardPeriod", "luckyPeriod", "yearFlow"],
  5: ["health", "parentingTips", "warnings"],
  6: ["letter"],
};

export function isChildChapterReady(content: Record<string, unknown> | null | undefined, chapter: number): boolean {
  if (!content) return false;
  const keys = CHILD_CHAPTER_SECTIONS[chapter] ?? [];
  return keys.every((k) => {
    const val = content[k];
    if (!val) return false;
    const v = val as { paragraphs?: unknown[] };
    return Array.isArray(v.paragraphs) && v.paragraphs.length > 0;
  });
}
