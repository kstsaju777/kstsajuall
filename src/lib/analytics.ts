// 결제 완료 시점에 Google Analytics · Meta Pixel로 전환(구매) 이벤트를 보낸다.
// 두 스크립트 모두 layout.tsx에서 로드되지만, 로드 타이밍이 늦거나 광고 차단
// 확장 프로그램으로 아예 없을 수도 있어 optional call로 안전하게 호출한다.
// 실패해도 결제/결과지 흐름에는 전혀 영향을 주지 않는다.
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackPurchase(orderId: string, amount: number): void {
  if (typeof window === "undefined") return;
  try {
    window.fbq?.("track", "Purchase", { value: amount, currency: "KRW" });
  } catch { /* 무시 */ }
  try {
    window.gtag?.("event", "purchase", { transaction_id: orderId, value: amount, currency: "KRW" });
  } catch { /* 무시 */ }
}
