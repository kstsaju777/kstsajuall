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

  // 을/를
  text = text.replace(/([가-힣])(을|를)/g, (_, p) => p + (hasBatchim(p) ? "을" : "를"));

  // 으로/로 — ㄹ받침·받침없음 → 로, 나머지 받침 → 으로
  text = text.replace(/([가-힣])(으로|로)/g, (_, p) => {
    const b = getBatchimIndex(p);
    return p + (b === 0 || b === RIEUL ? "로" : "으로");
  });

  // 과/와
  text = text.replace(/([가-힣])(과|와)/g, (_, p) => p + (hasBatchim(p) ? "과" : "와"));

  // 이라/라 — 공백·구두점 앞에만
  text = text.replace(/([가-힣])(이라|라)(?=[\s,\.!\?"'·\n\r]|$)/g, (_, p) => p + (hasBatchim(p) ? "이라" : "라"));

  // 이며/며
  text = text.replace(/([가-힣])(이며|며)/g, (_, p) => p + (hasBatchim(p) ? "이며" : "며"));

  // ※ '은/는', '이/가'는 명사 주격·보조사(받침 유무로 결정)와 동사·형용사 어미
  // (-는다/-는가/-ㄴ가/-는지 등, 받침과 무관하게 항상 같은 형태)가 똑같은 글자를 공유해서
  // 받침 기준 일괄 교정 시 "않는다면"→"않은다면", "신가 싶소"→"신이 싶소" 처럼
  // 멀쩡한 동사 어미를 깨뜨리는 오탐이 더 잦아 제거함. 실제 확인된 구체적 오류만 아래처럼 콕 집어 교정.

  // 동사 활용 오류 교정
  text = text.replace(/있은/g, "있는");
  text = text.replace(/없은/g, "없는");
  // '-았은/-었은' → '-았는/-었는' (예: '가져다주었은지' → '가져다주었는지') — 모든 동사에 적용되는 일반 오류
  text = text.replace(/았은/g, "았는");
  text = text.replace(/었은/g, "었는");
  // '것인이' → '것인지' (예: '견뎌내셨을 것인이' → '견뎌내셨을 것인지') — '-ㄴ지' 종결을 '-ㄴ이'로 잘못 쓰는 오류
  text = text.replace(/것인이/g, "것인지");
  // '언젠이' → '언젠가' — 고정 부사 '언젠가'를 '언젠이'라 잘못 쓰는 오류
  text = text.replace(/언젠이/g, "언젠가");
  // '무언이'/'누군이'/'어딘이' → '무언가'/'누군가'/'어딘가' — 같은 유형의 고정 부사 오류
  text = text.replace(/무언이/g, "무언가");
  text = text.replace(/누군이/g, "누군가");
  text = text.replace(/어딘이/g, "어딘가");
  // '-신이 싶소/하오' 등 '-ㄴ가 싶다' 구문의 '가'가 '이'로 잘못 쓰인 경우
  text = text.replace(/신이 싶/g, "신가 싶");
  text = text.replace(/으신이/g, "으신가");

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
