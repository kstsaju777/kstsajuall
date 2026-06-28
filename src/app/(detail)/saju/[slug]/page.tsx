"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ComingSoonPage() {
  const router = useRouter();
  const [dots, setDots] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#1e1e1e",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 32px",
      gap: 32,
    }}>
      {/* 진행 중 애니메이션 */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        {/* 스피너 */}
        <div style={{
          width: 56, height: 56,
          border: "4px solid rgba(255,255,255,0.1)",
          borderTop: "4px solid rgba(255,255,255,0.7)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }} />

        <div style={{ textAlign: "center" }}>
          <p style={{
            fontSize: 22, fontWeight: 900, color: "#fff",
            letterSpacing: 0.5, lineHeight: 1.5,
            minWidth: 220, textAlign: "center",
          }}>
            상품 준비중입니다<span style={{ display: "inline-block", width: 24, textAlign: "left" }}>{dots}</span>
          </p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 10, lineHeight: 1.7 }}>
            멋진 풀이로 곧 찾아올게요.<br />조금만 기다려 주세요
          </p>
        </div>

        {/* 진행 바 */}
        <div style={{ width: 180, height: 3, background: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            background: "rgba(255,255,255,0.5)",
            borderRadius: 2,
            animation: "progress 2s ease-in-out infinite",
          }} />
        </div>
      </div>

      <button
        onClick={() => router.back()}
        style={{
          padding: "13px 36px",
          borderRadius: 50,
          border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.7)",
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          letterSpacing: 0.3,
        }}
      >
        ← 돌아가기
      </button>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes progress {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 70%; margin-left: 15%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}
