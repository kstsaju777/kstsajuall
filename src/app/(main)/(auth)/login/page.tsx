"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LEGAL_DOC_CLASS, TermsContent, PrivacyContent } from "@/components/legal/legal-content";

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

  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [resetDone, setResetDone] = useState(false);
  const [kakaoLoading, setKakaoLoading] = useState(false);
  const [idInput, setIdInput] = useState("");
  const [pwInput, setPwInput] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [legalDoc, setLegalDoc] = useState<"terms" | "privacy" | null>(null);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!idInput.trim() || !pwInput) return;
    setLoading(true);
    setError("");
    const supabase = createClient();
    const email = idInput.trim().toLowerCase() + ID_DOMAIN;

    if (mode === "login") {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password: pwInput });
      if (err) {
        setError("아이디 또는 비밀번호가 올바르지 않습니다.");
        setLoading(false);
      } else {
        router.push(redirectTo);
      }
    } else {
      if (pwInput !== pwConfirm) {
        setError("비밀번호가 일치하지 않습니다.");
        setLoading(false);
        return;
      }
      if (pwInput.length < 6) {
        setError("비밀번호는 6자 이상이어야 합니다.");
        setLoading(false);
        return;
      }
      if (!emailInput.trim() || !emailInput.includes("@")) {
        setError("실제 이메일 주소를 입력해주세요.");
        setLoading(false);
        return;
      }
      const { error: err } = await supabase.auth.signUp({
        email,
        password: pwInput,
        options: { data: { display_name: idInput.trim(), real_email: emailInput.trim() } },
      });
      if (err) {
        setError(err.message.includes("already") ? "이미 사용 중인 아이디입니다." : "회원가입에 실패했습니다.");
        setLoading(false);
      } else {
        router.push(redirectTo);
      }
    }
  }

  function switchMode(next: "login" | "signup" | "reset") {
    setMode(next);
    setError("");
    setPwInput("");
    setPwConfirm("");
    setResetDone(false);
  }

  const [resetEmail, setResetEmail] = useState("");

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/mypage`,
    });
    setLoading(false);
    if (err) setError("이메일 발송에 실패했습니다. 가입한 이메일 주소를 확인해주세요.");
    else setResetDone(true);
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

      {/* 비밀번호 재설정 폼 */}
      {mode === "reset" && (
        <div className="w-full max-w-[320px]">
          {resetDone ? (
            <div className="text-center py-4">
              <p className="text-[15px] font-bold mb-2" style={{ color: "#3a2820" }}>이메일을 확인해주세요</p>
              <p className="text-[13px]" style={{ color: "#9c8472" }}>비밀번호 재설정 링크를 보내드렸습니다.</p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="flex flex-col gap-2.5">
              <p className="text-[13px] text-center mb-1" style={{ color: "#9c8472" }}>
                가입 시 입력한 이메일 주소로 재설정 링크를 보내드립니다.
              </p>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="이메일 주소"
                className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
                style={{ background: "#f0e8e0", border: "1px solid #ddd0c4", color: "#3a2820" }}
              />
              {error && <p className="text-[12px] text-center" style={{ color: "#c0392b" }}>{error}</p>}
              <button type="submit" disabled={loading || !resetEmail.trim()} className="w-full py-3.5 rounded-xl font-bold text-[15px] text-white"
                style={{ background: !resetEmail.trim() ? "#c8b8a8" : "#9b2335" }}>
                {loading ? "발송 중..." : "재설정 링크 보내기"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* 로그인 / 회원가입 폼 */}
      {mode !== "reset" && <form onSubmit={handleSubmit} className="w-full max-w-[320px] flex flex-col gap-2.5">
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
        {mode === "signup" && (
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="이메일 주소 (비밀번호 재설정용)"
            className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
            style={{ background: "#f0e8e0", border: "1px solid #ddd0c4", color: "#3a2820" }}
          />
        )}
        {error && <p className="text-[12px] text-center" style={{ color: "#c0392b" }}>{error}</p>}
        <button
          type="submit"
          disabled={loading || !idInput.trim() || !pwInput}
          className="w-full py-3.5 rounded-xl font-bold text-[15px] text-white transition-opacity active:opacity-70"
          style={{ background: loading || !idInput.trim() || !pwInput ? "#c8b8a8" : "#9b2335" }}
        >
          {loading ? (mode === "login" ? "로그인 중..." : "가입 중...") : (mode === "login" ? "로그인" : "회원가입")}
        </button>
      </form>}

      {/* 하단 링크 */}
      <div className="w-full max-w-[320px] flex flex-col items-center gap-3 mt-5">
        {mode === "login" ? (
          <>
            <button onClick={() => switchMode("signup")} className="text-[13px]" style={{ color: "#6b5344" }}>
              아직 계정이 없으신가요? <span className="font-bold underline" style={{ color: "#9b2335" }}>회원가입하기</span>
            </button>
            <button onClick={() => switchMode("reset")} className="text-[12px]" style={{ color: "#b0a090" }}>
              비밀번호를 잊어버리셨나요? <span className="underline">비밀번호 재설정</span>
            </button>
          </>
        ) : mode === "signup" ? (
          <button onClick={() => switchMode("login")} className="text-[13px]" style={{ color: "#6b5344" }}>
            이미 계정이 있으신가요? <span className="font-bold underline" style={{ color: "#9b2335" }}>로그인하기</span>
          </button>
        ) : (
          <button onClick={() => switchMode("login")} className="text-[13px]" style={{ color: "#6b5344" }}>
            로그인으로 돌아가기
          </button>
        )}
      </div>

      <p className="mt-5 text-[11px] text-center" style={{ color: "#bbb" }}>
        로그인 시{" "}
        <button onClick={() => setLegalDoc("terms")} className="underline" style={{ color: "#9c8472" }}>이용약관</button>
        {" "}및{" "}
        <button onClick={() => setLegalDoc("privacy")} className="underline" style={{ color: "#9c8472" }}>개인정보처리방침</button>
        에 동의하게 됩니다.
      </p>

      {/* 약관 팝업 */}
      {legalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setLegalDoc(null)}>
          <div className="flex flex-col rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}
            style={{ width: "min(80vw, 300px)", maxHeight: "56vh", background: "#fff", boxShadow: "0 20px 50px rgba(0,0,0,0.4)", animation: "legalPop 0.2s cubic-bezier(0.34,1.4,0.5,1)" }}>
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid #eee" }}>
              <span className="text-[13px] font-bold" style={{ color: "#111" }}>{legalDoc === "terms" ? "이용약관" : "개인정보처리방침"}</span>
              <button onClick={() => setLegalDoc(null)} aria-label="닫기" className="flex items-center justify-center rounded-full" style={{ width: 24, height: 24, background: "#f1f1f1", color: "#666", fontSize: 13, lineHeight: 1 }}>✕</button>
            </div>
            <div className={`legal-scroll flex-1 overflow-y-auto px-4 pt-2 pb-6 ${LEGAL_DOC_CLASS} [&_h1]:hidden [&_h2:first-of-type]:border-t-0 [&_h2:first-of-type]:pt-0`} style={{ background: "#fff", zoom: 0.82, scrollbarWidth: "thin", scrollbarColor: "#cfcfcf transparent" } as React.CSSProperties}>
              {legalDoc === "terms" ? <TermsContent /> : <PrivacyContent />}
            </div>
          </div>
          <style>{`@keyframes legalPop{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}.legal-scroll::-webkit-scrollbar{width:5px}.legal-scroll::-webkit-scrollbar-thumb{background:#cfcfcf;border-radius:3px}.legal-scroll::-webkit-scrollbar-track{background:transparent}`}</style>
        </div>
      )}
    </div>
  );
}
