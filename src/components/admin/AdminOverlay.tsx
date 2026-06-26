"use client";

import { useState, useEffect } from "react";

type Product = { id: string; name: string; slug: string | null; price: number; is_active: boolean };
type Usage = { used: number; limit: number; bySource: { confirm: number; demo: number; manual: number } } | null;

export function AdminOverlay() {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [usage, setUsage] = useState<Usage>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/products").then(r => r.json()).then(d => setProducts(d.products ?? [])).catch(() => {});
    fetch("/api/admin/usage").then(r => r.json()).then(d => setUsage(d)).catch(() => {});
  }, []);

  const toggle = async (id: string, current: boolean) => {
    setToggling(id);
    const res = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: !current }),
    });
    if (res.ok) setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
    setToggling(null);
  };

  return (
    <>
      {/* 플로팅 관리자 버튼 */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          position: "fixed", top: 12, right: 12, zIndex: 9999,
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
          {usage && (
            <div style={{ margin: "16px 20px", padding: "14px 16px", background: "#f8f8f8", borderRadius: 10 }}>
              <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 6px", letterSpacing: 1 }}>API 사용량</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: "#111", margin: 0 }}>
                {usage.used.toLocaleString()}
                <span style={{ fontSize: 13, color: "#888", fontWeight: 400 }}> / {usage.limit.toLocaleString()}회</span>
              </p>
              <div style={{ margin: "8px 0 4px", height: 6, background: "#e0e0e0", borderRadius: 3 }}>
                <div style={{
                  width: `${Math.min(100, Math.round(usage.used / usage.limit * 100))}%`,
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

          {/* 상품 목록 */}
          <div style={{ padding: "0 20px" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#555", margin: "8px 0 10px", letterSpacing: 0.5 }}>상품 공개 관리</p>
            <div style={{ display: "grid", gap: 8 }}>
              {products.map(p => (
                <div key={p.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", background: p.is_active ? "#f0fdf4" : "#fafafa",
                  borderRadius: 8, border: `1px solid ${p.is_active ? "#bbf7d0" : "#e8e8e8"}`,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#111", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                    <p style={{ fontSize: 11, color: "#aaa", margin: "2px 0 0" }}>{p.price.toLocaleString()}원</p>
                  </div>
                  <button
                    onClick={() => toggle(p.id, p.is_active)}
                    disabled={toggling === p.id}
                    style={{
                      flexShrink: 0, padding: "4px 12px", borderRadius: 16, border: "none",
                      fontSize: 12, fontWeight: 700, cursor: "pointer",
                      background: p.is_active ? "#16a34a" : "#d1d5db",
                      color: p.is_active ? "#fff" : "#555",
                      opacity: toggling === p.id ? 0.5 : 1,
                    }}
                  >
                    {p.is_active ? "공개" : "비공개"}
                  </button>
                </div>
              ))}
            </div>
          </div>

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
        </div>
      )}
    </>
  );
}

// 상품 카드 위에 올라가는 토글 배지 (홈페이지에서 사용)
export function AdminProductBadge({ productId, isActive }: { productId: string; isActive: boolean }) {
  const [active, setActive] = useState(isActive);
  const [loading, setLoading] = useState(false);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    const res = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: productId, is_active: !active }),
    });
    if (res.ok) setActive(v => !v);
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      style={{
        position: "absolute", top: 8, right: 8, zIndex: 10,
        padding: "3px 10px", borderRadius: 12, border: "none",
        fontSize: 11, fontWeight: 700, cursor: "pointer",
        background: active ? "#16a34a" : "#6b7280",
        color: "#fff", opacity: loading ? 0.6 : 1,
        boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
      }}
    >
      {active ? "공개" : "비공개"}
    </button>
  );
}
