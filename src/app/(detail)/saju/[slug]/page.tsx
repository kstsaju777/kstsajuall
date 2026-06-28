"use client";

import { useRouter } from "next/navigation";

export default function ComingSoonPage() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#1e1e1e",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 32px",
      gap: 40,
    }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
        <p style={{
          fontSize: 26, fontWeight: 900, color: "#fff",
          letterSpacing: 0.5, lineHeight: 1.5,
          animation: "fadePulse 2.5s ease-in-out infinite",
        }}>
          상품 준비중
        </p>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", lineHeight: 1.8 }}>
          멋진 상품으로 찾아뵙겠습니다.<br />
          감사합니다.
        </p>
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
        @keyframes fadePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
