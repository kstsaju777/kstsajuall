/** 한국어 조사 유틸 */

export function hasBatchim(char: string): boolean {
  const code = char.charCodeAt(0);
  if (code < 0xAC00 || code > 0xD7A3) return false;
  return (code - 0xAC00) % 28 !== 0;
}

// ※ 조사(은/는, 이/가, 을/를, 과/와 등) 자동 교정 규칙은 전부 제거함.
// 정규식 기반 일괄 교정은 "효과·결과·가을·마을" 같은 고정 단어를 깨뜨리거나
// 멀쩡한 동사 어미를 오탐으로 고치는 부작용이 반복적으로 확인되어,
// 문맥에 맞는 조사 선택은 LLM 자체 문법 능력과 프롬프트 지시(GLOBAL_GRAMMAR_RULES)에
// 맡기고 이 파일에서는 더 이상 텍스트를 변형하지 않는다.
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
