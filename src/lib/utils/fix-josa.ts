/** 한국어 조사 유틸 */

export function hasBatchim(char: string): boolean {
  const code = char.charCodeAt(0);
  if (code < 0xAC00 || code > 0xD7A3) return false;
  return (code - 0xAC00) % 28 !== 0;
}

// ※ 받침 유무를 "추측"해서 조사를 바꾸는 일괄 교정 규칙(은/는, 이/가, 을/를, 과/와 등)은
// 전부 제거함 — "효과·결과·가을·마을" 같은 고정 단어를 깨뜨리거나 멀쩡한 동사 어미를
// 오탐으로 고치는 부작용이 반복적으로 확인되어, 문맥에 맞는 조사 선택은 LLM 자체 문법
// 능력과 프롬프트 지시(GLOBAL_GRAMMAR_RULES)에 맡긴다.
//
// 단, 아래 "이(가)"/"을(를)" 같은 괄호 병기는 정상적인 한국어에 절대 나올 수 없는
// 명백한 오류 문자열이라 오탐 위험이 없으므로, 이것만은 기계적으로 교정한다.
export function fixJosa(text: string): string {
  if (!text) return text;

  // 조사를 '이(가)'/'은(는)'/'을(를)'/'과(와)' 처럼 괄호로 두 가지 다 병기해버리는
  // LLM 오류 — 앞 글자의 받침 유무로 정확한 하나만 남기고 나머지는 제거.
  // (닫는 따옴표 뒤에 붙는 경우도 있어 앞 문자가 따옴표면 그 앞 글자 기준으로 판단)
  text = text.replace(
    /([가-힣])(['"’”]?)(이\(가\)|가\(이\)|은\(는\)|는\(은\)|을\(를\)|를\(을\)|과\(와\)|와\(과\))/g,
    (_m, ch: string, quote: string, pair: string) => {
      const batchim = hasBatchim(ch);
      const table: Record<string, [string, string]> = {
        "이(가)": ["이", "가"], "가(이)": ["이", "가"],
        "은(는)": ["은", "는"], "는(은)": ["은", "는"],
        "을(를)": ["을", "를"], "를(을)": ["을", "를"],
        "과(와)": ["과", "와"], "와(과)": ["과", "와"],
      };
      const [withBatchim, withoutBatchim] = table[pair];
      return `${ch}${quote}${batchim ? withBatchim : withoutBatchim}`;
    },
  );

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
