"use client";

import { useRouter } from "next/navigation";

export default function ComingSoonPage() {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#711b20",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 32px",
        gap: 24,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 40, marginBottom: 8 }}>🔮</p>
        <p style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 8, lineHeight: 1.4 }}>
          상품 준비중입니다
        </p>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
          멋진 풀이로 곧 찾아올게요.<br />
          조금만 기다려 주세요 🙏
        </p>
      </div>

      <button
        onClick={() => router.back()}
        style={{
          marginTop: 8,
          padding: "13px 32px",
          borderRadius: 50,
          border: "none",
          background: "rgba(255,255,255,0.12)",
          color: "#fff",
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          letterSpacing: 0.3,
        }}
      >
        ← 돌아가기
      </button>
    </div>
  );
}
