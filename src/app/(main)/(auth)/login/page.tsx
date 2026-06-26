"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ID_DOMAIN = "@hongyeondang.com";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const search = useSearchParams();
  const router = useRouter();
  const redirectTo = search.get("redirect") ?? "/mypage";

  const [kakaoLoading, setKakaoLoading] = useState(false);
  const [idInput, setIdInput] = useState("");
  const [pwInput, setPwInput] = useState("");
  const [idLoading, setIdLoading] = useState(false);
  const [idError, setIdError] = useState("");

  async function handleKakaoLogin() {
    setKakaoLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        scopes: "profile_nickname profile_image plusfriends",
      },
    });
  }

  async function handleIdLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!idInput.trim() || !pwInput) return;
    setIdLoading(true);
    setIdError("");
    const supabase = createClient();
    const email = idInput.trim().toLowerCase() + ID_DOMAIN;
    const { error } = await supabase.auth.signInWithPassword({ email, password: pwInput });
    if (error) {
      setIdError("아이디 또는 비밀번호가 올바르지 않습니다.");
      setIdLoading(false);
    } else {
      router.push(redirectTo);
    }
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
      <p className="text-[13px] text-center mb-8" style={{ color: "#9c8472" }}>
        카카오 계정으로 간편하게 시작하세요.
      </p>

      {/* 카카오 로그인 버튼 */}
      <button
        onClick={handleKakaoLogin}
        disabled={kakaoLoading}
        className="w-full max-w-[320px] flex items-center justify-center gap-3 py-3.5 rounded-xl font-bold text-[15px] transition-opacity active:opacity-70"
        style={{ background: "#FEE500", color: "#3C1E1E" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#3C1E1E">
          <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.628 1.571 4.938 3.938 6.344L5 21l4.563-2.438A11.3 11.3 0 0012 18c5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/>
        </svg>
        {kakaoLoading ? "카카오 로그인 중..." : "카카오로 시작하기"}
      </button>

      {/* 구분선 */}
      <div className="w-full max-w-[320px] flex items-center gap-3 my-5">
        <div className="flex-1 h-px" style={{ background: "#e8ddd4" }} />
        <span className="text-[11px]" style={{ color: "#c0a898" }}>또는</span>
        <div className="flex-1 h-px" style={{ background: "#e8ddd4" }} />
      </div>

      {/* 아이디/비번 로그인 */}
      <form onSubmit={handleIdLogin} className="w-full max-w-[320px] flex flex-col gap-2.5">
        <input
          value={idInput}
          onChange={(e) => setIdInput(e.target.value)}
          placeholder="아이디"
          autoCapitalize="none"
          className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
          style={{ background: "#f0e8e0", border: "1px solid #ddd0c4", color: "#3a2820" }}
        />
        <input
          type="password"
          value={pwInput}
          onChange={(e) => setPwInput(e.target.value)}
          placeholder="비밀번호"
          className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
          style={{ background: "#f0e8e0", border: "1px solid #ddd0c4", color: "#3a2820" }}
        />
        {idError && <p className="text-[12px] text-center" style={{ color: "#c0392b" }}>{idError}</p>}
        <button
          type="submit"
          disabled={idLoading || !idInput.trim() || !pwInput}
          className="w-full py-3.5 rounded-xl font-bold text-[15px] text-white transition-opacity active:opacity-70"
          style={{ background: idLoading || !idInput.trim() || !pwInput ? "#c8b8a8" : "#9b2335" }}
        >
          {idLoading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <p className="mt-8 text-[11px] text-center" style={{ color: "#bbb" }}>
        로그인 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.
      </p>
    </div>
  );
}
