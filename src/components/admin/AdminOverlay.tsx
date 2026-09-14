"use client";

import { useState, useEffect } from "react";

type Usage = { used: number; limit: number; bySource: { confirm: number; demo: number; manual: number } } | null;
type SajuReview = { id: string; name: string; gender: string | null; star: number; text: string; created_at: string; approved: boolean };

export function AdminOverlay() {
  const [open, setOpen] = useState(false);
  const [usage, setUsage] = useState<Usage>(null);
  const [reviews, setReviews] = useState<SajuReview[]>([]);
  const [reviewTab, setReviewTab] = useState<"pending" | "approved">("pending");

  const loadReviews = async () => {
    const res = await fetch("/api/admin/reviews");
    const data = await res.json();
    setReviews(Array.isArray(data) ? data : []);
  };

  const approveReview = async (id: string) => {
    await fetch("/api/admin/reviews", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setReviews(prev => prev.map(r => r.id === id ? { ...r, approved: true } : r));
  };

  const deleteReview = async (id: string) => {
    await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  useEffect(() => {
    fetch("/api/admin/usage").then(r => r.json()).then(d => setUsage(d)).catch(() => {});
  }, []);

  return (
    <>
      {/* 플로팅 관리자 버튼 */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)", zIndex: 9999,
          background: open ? "#111" : "#9b2335",
          color: "#fff", border: "none", borderRadius: 20,
          padding: "6px 14px", fontSize: 12, fontWeight: 700,
          cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          display: "flex", alignItems: "center", gap: 6,
        }}
      >
        <span>{open ? "✕" : "⚙️"}</span>
        <span>{open ? "닫기" : "관리자"}</span>
      </button>

      {/* 사이드 패널 */}
      {open && (
        <div style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: 320, zIndex: 9998,
          background: "#fff", boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
          overflowY: "auto", padding: "56px 0 24px",
          fontFamily: "system-ui, sans-serif",
        }}>
          {/* 헤더 */}
          <div style={{ padding: "0 20px 16px", borderBottom: "1px solid #f0f0f0" }}>
            <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 2px", letterSpacing: 1 }}>ADMIN DASHBOARD</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: 0 }}>홍연당 관리자</p>
          </div>

          {/* API 사용량 */}
          {usage && usage.used != null && (
            <div style={{ margin: "16px 20px", padding: "14px 16px", background: "#f8f8f8", borderRadius: 10 }}>
              <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 6px", letterSpacing: 1 }}>API 사용량</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: "#111", margin: 0 }}>
                {(usage.used ?? 0).toLocaleString()}
                <span style={{ fontSize: 13, color: "#888", fontWeight: 400 }}> / {(usage.limit ?? 0).toLocaleString()}회</span>
              </p>
              <div style={{ margin: "8px 0 4px", height: 6, background: "#e0e0e0", borderRadius: 3 }}>
                <div style={{
                  width: `${Math.min(100, Math.round((usage.used ?? 0) / (usage.limit || 1) * 100))}%`,
                  height: "100%", background: "#22c55e", borderRadius: 3,
                }} />
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                {[["결제", usage.bySource.confirm], ["데모", usage.bySource.demo], ["수동", usage.bySource.manual]].map(([l, v]) => (
                  <div key={String(l)}>
                    <p style={{ fontSize: 10, color: "#bbb", margin: 0 }}>{l}</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#333", margin: 0 }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 링크 */}
          <div style={{ padding: "16px 20px 0", borderTop: "1px solid #f0f0f0", marginTop: 16 }}>
            {[
              { href: "/admin/orders", label: "💳 결제 내역" },
              { href: "https://app.tosspayments.com", label: "💰 토스페이먼츠", ext: true },
              { href: "https://supabase.com/dashboard", label: "🗄️ Supabase", ext: true },
            ].map(l => (
              <a key={l.href} href={l.href} target={l.ext ? "_blank" : undefined} rel={l.ext ? "noreferrer" : undefined}
                style={{ display: "block", padding: "10px 0", fontSize: 13, color: "#333", textDecoration: "none", borderBottom: "1px solid #f5f5f5" }}>
                {l.label} <span style={{ color: "#ccc" }}>{l.ext ? "↗" : "→"}</span>
              </a>
            ))}
            <button
              onClick={async () => {
                const { createClient } = await import("@/lib/supabase/client");
                await createClient().auth.signOut();
                window.location.href = "/";
              }}
              style={{ width: "100%", padding: "8px", background: "#f5f5f5", border: "none", borderRadius: 8, fontSize: 13, color: "#888", cursor: "pointer", marginTop: 12 }}
            >
              로그아웃
            </button>
          </div>

          {/* 후기 관리 */}
          <div style={{ margin: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <p style={{ fontSize: 11, color: "#aaa", margin: 0, letterSpacing: 1 }}>후기 관리</p>
              <button onClick={loadReviews} style={{ fontSize: 11, color: "#9b2335", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>불러오기</button>
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {(["pending", "approved"] as const).map(tab => (
                <button key={tab} onClick={() => setReviewTab(tab)}
                  style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer",
                    background: reviewTab === tab ? "#9b2335" : "#f5f5f5", color: reviewTab === tab ? "#fff" : "#888" }}>
                  {tab === "pending" ? `대기 (${reviews.filter(r => !r.approved).length})` : `승인 (${reviews.filter(r => r.approved).length})`}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {reviews.filter(r => reviewTab === "pending" ? !r.approved : r.approved).map(r => (
                <div key={r.id} style={{ background: "#f9f9f9", borderRadius: 10, padding: "10px 12px", border: "1px solid #eee" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#333" }}>{"★".repeat(r.star)}{"☆".repeat(5 - r.star)}</span>
                    <span style={{ fontSize: 11, color: "#aaa" }}>{r.created_at?.slice(0, 10)}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#555", margin: "0 0 6px", lineHeight: 1.5 }}>{r.text || "(텍스트 없음)"}</p>
                  <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 8px" }}>{r.name} · {r.gender}</p>
                  <div style={{ display: "flex", gap: 6 }}>
                    {!r.approved && (
                      <button onClick={() => approveReview(r.id)}
                        style={{ flex: 1, padding: "5px 0", borderRadius: 6, border: "none", background: "#9b2335", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        승인
                      </button>
                    )}
                    <button onClick={() => deleteReview(r.id)}
                      style={{ flex: 1, padding: "5px 0", borderRadius: 6, border: "1px solid #ddd", background: "#fff", color: "#888", fontSize: 12, cursor: "pointer" }}>
                      삭제
                    </button>
                  </div>
                </div>
              ))}
              {reviews.filter(r => reviewTab === "pending" ? !r.approved : r.approved).length === 0 && (
                <p style={{ fontSize: 12, color: "#ccc", textAlign: "center", padding: "16px 0" }}>없음</p>
              )}
            </div>
          </div>
        </div>
      )}

    </>
  );
}
