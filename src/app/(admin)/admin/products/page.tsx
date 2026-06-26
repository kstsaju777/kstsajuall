"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  slug: string | null;
  price: number;
  is_active: boolean;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/products")
      .then(r => {
        if (r.status === 401) { window.location.href = "/admin/login?from=/admin/products"; return null; }
        return r.json();
      })
      .then(d => { if (d) { setProducts(d.products ?? []); setLoading(false); } })
      .catch(() => setLoading(false));
  }, []);

  const toggle = async (id: string, current: boolean) => {
    setToggling(id);
    const res = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: !current }),
    });
    if (res.ok) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
    }
    setToggling(null);
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <Link href="/admin" style={{ fontSize: 13, color: "#888", textDecoration: "none" }}>← 대시보드</Link>
        <span style={{ color: "#ddd" }}>|</span>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111", margin: 0 }}>상품 관리</h1>
      </div>

      {loading ? (
        <p style={{ color: "#888", fontSize: 14 }}>불러오는 중…</p>
      ) : products.length === 0 ? (
        <p style={{ color: "#888", fontSize: 14 }}>등록된 상품이 없습니다.</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {products.map(p => (
            <div key={p.id} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "14px 18px", background: "#fff", borderRadius: 12,
              border: `1px solid ${p.is_active ? "#d1fae5" : "#e8e8e8"}`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#111", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                <p style={{ fontSize: 12, color: "#999", margin: "3px 0 0" }}>{p.slug ?? "-"} · {p.price.toLocaleString()}원</p>
              </div>
              <button
                onClick={() => toggle(p.id, p.is_active)}
                disabled={toggling === p.id}
                style={{
                  flexShrink: 0,
                  padding: "6px 16px",
                  borderRadius: 20,
                  border: "none",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  background: p.is_active ? "#16a34a" : "#9ca3af",
                  color: "#fff",
                  opacity: toggling === p.id ? 0.5 : 1,
                  transition: "all 0.15s",
                }}
              >
                {p.is_active ? "✓ 공개" : "비공개"}
              </button>
            </div>
          ))}
        </div>
      )}

      <p style={{ marginTop: 20, fontSize: 12, color: "#aaa" }}>
        비공개 상품은 소비자 화면에 노출되지 않으며 결제도 불가합니다.
      </p>
    </div>
  );
}
