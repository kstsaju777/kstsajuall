"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense>
      <KakaoLogin />
    </Suspense>
  );
}

function KakaoLogin() {
  const search = useSearchParams();
  const redirectTo = search.get("redirect") ?? "/mypage";
  const [loading, setLoading] = useState(false);

  async function handleKakaoLogin() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        scopes: "profile_nickname profile_image plusfriends",
      },
    });
  }

  return (
    <div
      className="min-h-[calc(100vh-7rem)] flex flex-col items-center justify-center px-6"
      style={{ background: "#fdf8f4" }}
    >
      {/* 로고 */}
      <img src="/logo.png" alt="홍연당" className="h-12 w-auto object-contain mb-8" />

      {/* 안내 문구 */}
      <p className="text-[15px] text-center leading-relaxed mb-2" style={{ color: "#4a3728" }}>
        홍연당에 오신 것을 환영합니다.
      </p>
      <p className="text-[13px] text-center mb-10" style={{ color: "#9c8472" }}>
        카카오 계정으로 간편하게 시작하세요.
      </p>

      {/* 카카오 로그인 버튼 */}
      <button
        onClick={handleKakaoLogin}
        disabled={loading}
        className="w-full max-w-[320px] flex items-center justify-center gap-3 py-3.5 rounded-xl font-bold text-[15px] transition-opacity active:opacity-70"
        style={{ background: "#FEE500", color: "#3C1E1E" }}
      >
        {/* 카카오 아이콘 */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#3C1E1E">
          <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.628 1.571 4.938 3.938 6.344L5 21l4.563-2.438A11.3 11.3 0 0012 18c5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/>
        </svg>
        {loading ? "카카오 로그인 중..." : "카카오로 시작하기"}
      </button>

      <p className="mt-8 text-[11px] text-center" style={{ color: "#bbb" }}>
        로그인 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.
      </p>
    </div>
  );
}
