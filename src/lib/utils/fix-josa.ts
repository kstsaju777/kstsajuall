/** 한국어 조사 유틸 */

export function hasBatchim(char: string): boolean {
  const code = char.charCodeAt(0);
  if (code < 0xAC00 || code > 0xD7A3) return false;
  return (code - 0xAC00) % 28 !== 0;
}

// ※ 이 파일의 텍스트 자동교정 규칙(조사 받침 추측, 어미 오타, 한자/괄호 병기 제거 등)은
// 전부 제거함 — 문맥에 맞는 표현·문법 선택은 LLM 자체 능력과 프롬프트 지시
// (GLOBAL_GRAMMAR_RULES, 각 상품 프롬프트)에 전적으로 맡긴다.
export function fixJosa(text: string): string {
  return text;
}

// 객체·배열 내 모든 문자열에 재귀 적용 (현재는 통과만 시킴 — 위 설명 참고)
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
