/** 한국어 조사 자동 교정 유틸 */

function hasBatchim(char: string): boolean {
  const code = char.charCodeAt(0);
  if (code < 0xAC00 || code > 0xD7A3) return false;
  return (code - 0xAC00) % 28 !== 0;
}

function getBatchimIndex(char: string): number {
  const code = char.charCodeAt(0);
  if (code < 0xAC00 || code > 0xD7A3) return -1;
  return (code - 0xAC00) % 28;
}

const RIEUL = 8; // ㄹ 받침 인덱스

export function fixJosa(text: string): string {
  if (!text) return text;

  // 은/는
  text = text.replace(/([가-힣])(은|는)/g, (_, p) => p + (hasBatchim(p) ? "은" : "는"));

  // 을/를
  text = text.replace(/([가-힣])(을|를)/g, (_, p) => p + (hasBatchim(p) ? "을" : "를"));

  // 으로/로 — ㄹ받침·받침없음 → 로, 나머지 받침 → 으로
  text = text.replace(/([가-힣])(으로|로)/g, (_, p) => {
    const b = getBatchimIndex(p);
    return p + (b === 0 || b === RIEUL ? "로" : "으로");
  });

  // 과/와
  text = text.replace(/([가-힣])(과|와)/g, (_, p) => p + (hasBatchim(p) ? "과" : "와"));

  // 이/가 — "~이/가 " 패턴에서만 (조사 뒤에 공백+한글이 이어질 때만 교정, 단어 끝 오탐 방지)
  text = text.replace(/([가-힣])(이|가)(?= [가-힣])/g, (_, p) => p + (hasBatchim(p) ? "이" : "가"));

  // 이라/라 — 공백·구두점 앞에만
  text = text.replace(/([가-힣])(이라|라)(?=[\s,\.!\?"'·\n\r]|$)/g, (_, p) => p + (hasBatchim(p) ? "이라" : "라"));

  // 이며/며
  text = text.replace(/([가-힣])(이며|며)/g, (_, p) => p + (hasBatchim(p) ? "이며" : "며"));

  // 동사 활용 오류 교정
  text = text.replace(/있은/g, "있는");
  text = text.replace(/없은/g, "없는");

  return text;
}

// 객체·배열 내 모든 문자열에 재귀 적용
export function fixJosaInObject<T>(obj: T): T {
  if (typeof obj === "string") return fixJosa(obj) as unknown as T;
  if (Array.isArray(obj)) return obj.map(fixJosaInObject) as unknown as T;
  if (obj && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      result[k] = fixJosaInObject(v);
    }
    return result as T;
  }
  return obj;
}
