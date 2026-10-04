// =====================================================
// 인앱 브라우저 감지 + 외부 브라우저 전환
// =====================================================
// 스레드·카카오톡 앱 안의 브라우저에서는 카드사·간편결제 앱으로 넘어가는 결제가 자주 막힘.
// 대상: 스레드(UA "Barcelona"), 카카오톡(UA "KAKAOTALK")만.
// 네이버 앱(파워링크 추적)과 인스타·페이스북(메타 광고 추적)은 일부러 제외.

export type InAppKind = "threads" | "kakaotalk" | null;

export function detectInApp(ua: string = typeof navigator !== "undefined" ? navigator.userAgent : ""): InAppKind {
  if (/KAKAOTALK/i.test(ua)) return "kakaotalk";
  if (/Barcelona/i.test(ua)) return "threads";
  return null;
}

export function isAndroid(ua: string = typeof navigator !== "undefined" ? navigator.userAgent : ""): boolean {
  return /Android/i.test(ua);
}

// 외부 브라우저로 여는 주소. 열 수 없으면 null
export function externalBrowserUrl(kind: InAppKind, href: string, android: boolean): string | null {
  if (kind === "kakaotalk") {
    // 카카오톡 공식 스킴 — 아이폰·안드로이드 모두 기본 브라우저로 열림
    return `kakaotalk://web/openExternal?url=${encodeURIComponent(href)}`;
  }
  if (kind === "threads") {
    const url = new URL(href);
    if (android) {
      // 크롬으로 열기. 크롬이 없으면 같은 주소로 돌아옴(리다이렉트 반복은 호출하는 쪽에서 막음)
      return `intent://${url.host}${url.pathname}${url.search}${url.hash}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(href)};end`;
    }
    // iOS 17+ 사파리 스킴. 버전에 따라 동작하지 않을 수 있음 → 버튼으로만 제공
    return `x-safari-${url.protocol.replace(":", "")}://${url.host}${url.pathname}${url.search}${url.hash}`;
  }
  return null;
}
