"use client";

import { useState, useEffect, useRef } from "react";

type Product = { id: string; name: string; slug: string | null; price: number; is_active: boolean; image_url?: string; badge?: string; tag?: string; is_video?: boolean };
type Usage = { used: number; limit: number; bySource: { confirm: number; demo: number; manual: number } } | null;

const EMPTY_FORM = { name: "", slug: "", price: "", description: "", image_url: "", badge: "", tag: "", is_video: false, display_order: "99" };

export function AdminOverlay() {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [usage, setUsage] = useState<Usage>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState<{ id: string; current: boolean } | null>(null);
  const dragId = useRef<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/products").then(r => r.json()).then(d => setProducts(d.products ?? [])).catch(() => {});
    fetch("/api/admin/usage").then(r => r.json()).then(d => setUsage(d)).catch(() => {});
  }, []);

  const toggle = async (id: string, current: boolean) => {
    setConfirmToggle({ id, current });
  };

  const doToggle = async () => {
    if (!confirmToggle) return;
    const { id, current } = confirmToggle;
    setToggling(id);
    setConfirmToggle(null);
    const res = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: !current }),
    });
    if (res.ok) setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
    setToggling(null);
  };

  const addProduct = async () => {
    if (!form.name || !form.slug || !form.price) return;
    setSaving(true);
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: Number(form.price), display_order: Number(form.display_order) }),
    });
    if (res.ok) {
      const d = await res.json();
      setProducts(prev => [...prev, d.product]);
      setForm(EMPTY_FORM);
      setShowAddForm(false);
    }
    setSaving(false);
  };

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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "8px 0 10px" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#555", margin: 0, letterSpacing: 0.5 }}>상품 공개 관리</p>
              <button
                onClick={() => setShowAddForm(v => !v)}
                style={{
                  padding: "4px 10px", borderRadius: 8, border: "none",
                  background: showAddForm ? "#e5e7eb" : "#9b2335",
                  color: showAddForm ? "#555" : "#fff",
                  fontSize: 11, fontWeight: 700, cursor: "pointer",
                }}
              >{showAddForm ? "취소" : "+ 상품추가"}</button>
            </div>

            {/* 상품 추가 폼 */}
            {showAddForm && (
              <div style={{ background: "#fafafa", borderRadius: 10, padding: "14px 12px", marginBottom: 12, border: "1px solid #e8e8e8" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#333", margin: "0 0 10px" }}>새 상품 추가</p>
                {[
                  { key: "name", label: "상품명 *", placeholder: "예) 정통 재물운 풀이" },
                  { key: "slug", label: "슬러그 *", placeholder: "예) wealth-saju" },
                  { key: "price", label: "가격 *", placeholder: "예) 19900" },
                  { key: "description", label: "설명", placeholder: "상품 설명" },
                  { key: "image_url", label: "이미지 URL", placeholder: "/media/hero/hero-3.jpg" },
                  { key: "badge", label: "배지", placeholder: "예) 재물" },
                  { key: "tag", label: "태그", placeholder: "예) 인기" },
                  { key: "display_order", label: "노출순서", placeholder: "99" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} style={{ marginBottom: 8 }}>
                    <p style={{ fontSize: 10, color: "#888", margin: "0 0 3px" }}>{label}</p>
                    <input
                      value={(form as any)[key]}
                      onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder={placeholder}
                      style={{
                        width: "100%", padding: "6px 8px", borderRadius: 6,
                        border: "1px solid #ddd", fontSize: 12, boxSizing: "border-box",
                      }}
                    />
                  </div>
                ))}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <input
                    type="checkbox"
                    id="is_video"
                    checked={form.is_video}
                    onChange={e => setForm(prev => ({ ...prev, is_video: e.target.checked }))}
                  />
                  <label htmlFor="is_video" style={{ fontSize: 12, color: "#555" }}>동영상 카드</label>
                </div>
                <button
                  onClick={addProduct}
                  disabled={saving || !form.name || !form.slug || !form.price}
                  style={{
                    width: "100%", padding: "9px", borderRadius: 8, border: "none",
                    background: "#9b2335", color: "#fff", fontSize: 13, fontWeight: 700,
                    cursor: "pointer", opacity: saving ? 0.6 : 1,
                  }}
                >{saving ? "저장중..." : "저장"}</button>
              </div>
            )}

            <p style={{ fontSize: 11, color: "#bbb", margin: "0 0 8px" }}>≡ 드래그로 순서 변경 가능</p>
            <div style={{ display: "grid", gap: 8 }}>
              {products.map(p => (
                <div
                  key={p.id}
                  draggable
                  onDragStart={() => { dragId.current = p.id; }}
                  onDragOver={e => { e.preventDefault(); setDragOver(p.id); }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={async () => {
                    setDragOver(null);
                    if (!dragId.current || dragId.current === p.id) return;
                    const from = products.findIndex(x => x.id === dragId.current);
                    const to = products.findIndex(x => x.id === p.id);
                    const next = [...products];
                    const [moved] = next.splice(from, 1);
                    next.splice(to, 0, moved);
                    const reordered = next.map((x, i) => ({ ...x, display_order: (i + 1) * 10 }));
                    setProducts(reordered);
                    dragId.current = null;
                    await fetch("/api/admin/products", {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ orders: reordered.map(x => ({ id: x.id, display_order: x.display_order })) }),
                    });
                  }}
                  onDragEnd={() => { dragId.current = null; setDragOver(null); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px",
                    background: dragOver === p.id ? "#e0f2fe" : p.is_active ? "#f0fdf4" : "#fafafa",
                    borderRadius: 8,
                    border: `1px solid ${dragOver === p.id ? "#7dd3fc" : p.is_active ? "#bbf7d0" : "#e8e8e8"}`,
                    cursor: "grab", transition: "background 0.15s",
                  }}
                >
                  <span style={{ fontSize: 16, color: "#ccc", flexShrink: 0, cursor: "grab" }}>☰</span>
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

      {/* 공개/비공개 확인 모달 */}
      {confirmToggle && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 10000,
          background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "0 32px",
        }}>
          <div style={{
            background: "#fff", borderRadius: 16, padding: "28px 24px",
            width: "100%", maxWidth: 300, textAlign: "center",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 8 }}>
              {confirmToggle.current ? "상품 비공개" : "상품 공개"}
            </p>
            <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 24 }}>
              {confirmToggle.current
                ? <>상품이 고객에게 노출되지 않습니다.<br />비공개로 전환하시겠습니까?</>
                : <>실제 고객에게 상품이 노출됩니다.<br />오픈하시겠습니까?</>}
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmToggle(null)}
                style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid #ddd", background: "#f5f5f5", color: "#555", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                NO
              </button>
              <button onClick={doToggle}
                style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "none", background: confirmToggle.current ? "#374151" : "#9b2335", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                YES
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
