/** 한국어 조사 유틸 */

export function hasBatchim(char: string): boolean {
  const code = char.charCodeAt(0);
  if (code < 0xAC00 || code > 0xD7A3) return false;
  return (code - 0xAC00) % 28 !== 0;
}

// ※ 조사 받침 추측·어미 오타 교정 규칙은 전부 제거함 — 문맥에 맞는 표현·문법 선택은
// LLM 자체 능력과 프롬프트 지시(GLOBAL_GRAMMAR_RULES)에 맡긴다.
//
// 단, 한자 병기만은 예외로 후처리를 유지한다. GLOBAL_GRAMMAR_RULES에서 여러 차례
// 강화했음에도 '본기(本氣)', '편인격(偏印格)', '식상관(食傷官)', '결(結)'처럼 매번 다른
// 한자가 계속 새어나와 — 한자는 종류가 사실상 무한해서 예시를 아무리 추가해도 근본적으로
// 못 막기 때문에, 한글 뒤에 괄호로 순수 한자만 오는 패턴을 기계적으로 제거한다. 이 패턴은
// 정상적인 한국어에 없으므로 오탐 위험이 없다.
export function fixJosa(text: string): string {
  if (!text) return text;
  text = text.replace(/([가-힣])\([一-鿿]+\)/g, "$1");

  // '신강(71점)', '신강(점수 60)', '신약 65점', '신강 기운(점수 60점)'처럼 신강/신약/중화/중강
  // 뒤에(사이에 '기운'같은 짧은 수식어가 끼어도) 점수 숫자를 괄호 안팎 어떤 순서·형태로
  // 붙이든 — GLOBAL_GRAMMAR_RULES로 여러 차례 금지했음에도 계속 새어나와, 이 정성적
  // 표현 뒤에 오는 숫자+'점' 표기만 기계적으로 제거한다(사이 수식어는 보존).
  // 정상적인 문장에 없는 조합이라 안전하다.
  text = text.replace(/(신강|신약|중화|중강)([가-힣\s]{0,6})\(\s*(?:점수\s*)?\d+\s*점?\s*\)/g, "$1$2");
  text = text.replace(/(신강|신약|중화|중강)([가-힣\s]{0,6})(?:점수\s*)?\d+\s*점/g, "$1$2");

  // '정재이란' 같은 받침 불일치 — '이란/란'도 은/는처럼 받침에 따라 갈리는 조사인데
  // GLOBAL_GRAMMAR_RULES로 명시했음에도 계속 새어나와 기계적으로 교정한다. '이란'(나라 이름)과
  // 우연히 겹칠 위험은 이 서비스 문맥상 사실상 없다.
  text = text.replace(/([가-힣])(이란|란)(?=[\s.,!?)]|$)/g, (m, ch: string, particle: string) => {
    const expected = hasBatchim(ch) ? "이란" : "란";
    return particle === expected ? m : `${ch}${expected}`;
  });

  // '있은'/'없은' — 관형사형으로 쓰일 때('고집 있은 독립형' 등)는 '있는'/'없는'이 맞으므로
  // GLOBAL_GRAMMAR_RULES로 여러 차례 금지했음에도 계속 새어나온다. 단, '~있은 지'/'~있은 후'/
  // '~있은 이래'처럼 시간 경과를 나타내는 의존명사 앞에 오는 '있은'은 정상적인 한국어이므로
  // (예: '다툼이 있은 지 얼마 안 돼') 이 경우는 예외로 두고 건드리지 않는다.
  text = text.replace(/(있|없)은(?!\s*(지|후|이래|다음))/g, "$1는");

  // '대했은이', '그랬은이'처럼 과거형 어미(았/었/했/였) 뒤에 존재하지 않는 '은이'를 붙이는
  // 오류 — GLOBAL_GRAMMAR_RULES에서 '-는이/-은이/-인이' 어미를 금지했음에도 계속 새어나온다.
  // 과거형 뒤의 '은이'는 표준 간접의문형 '-는지'가 맞으므로(예: '대했는지 되짚어보는') 그렇게
  // 교정한다. 과거형 어미(았/었/했/였) 바로 뒤에 온 경우만 대상으로 하여, '지은이'(저자)처럼
  // 무관한 정상 단어와 겹칠 위험은 없다.
  text = text.replace(/(았|었|했|였)은이/g, "$1는지");

  // 마크다운 굵게(**) 표시 — 이 텍스트는 화면에 그대로 렌더링되는 일반 문자열이라
  // GLOBAL_GRAMMAR_RULES로 금지했음에도 별표가 그대로 노출되는 경우가 있다. 정상적인
  // 한국어 문장에 별표 2개가 붙어 나올 일이 없으므로 안전하게 제거한다.
  text = text.replace(/\*\*/g, "");

  // 문장 중간의 줄표(—, ㅡ) — GLOBAL_GRAMMAR_RULES에서 금지했음에도 계속 새어나온다.
  // 정상적인 한국어 문장에 이 기호가 필요한 경우가 없으므로, 두 절을 자연스럽게 잇는
  // 쉼표로 안전하게 치환한다.
  text = text.replace(/\s*[—ㅡ]\s*/g, ", ");

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
