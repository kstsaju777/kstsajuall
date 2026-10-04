"use client";

import { useEffect } from "react";
import { detectInApp, externalBrowserUrl, isAndroid } from "@/lib/inapp";

const TRIED_KEY = "inapp_redirect_tried";

// 페이지가 열리면 바로 외부 브라우저로 전환 (안드로이드 스레드, 카카오톡)
// 아이폰 스레드는 강제로 열 수 없어서 결제 직전에 TossWidget이 안내함
export function InAppBrowserRedirect() {
  useEffect(() => {
    const kind = detectInApp();
    if (!kind) return;
    const android = isAndroid();
    if (kind === "threads" && !android) return;

    // 같은 앱 세션에서 한 번만 시도 — 사용자가 "돌아가기"를 누르거나 크롬이 없을 때 반복 방지
    try {
      if (sessionStorage.getItem(TRIED_KEY)) return;
      sessionStorage.setItem(TRIED_KEY, "1");
    } catch {
      return;
    }

    const target = externalBrowserUrl(kind, window.location.href, android);
    if (target) window.location.href = target;
  }, []);

  return null;
}
