"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  is_active: boolean;
  image_url: string | null;
  badge: string | null;
  tag: string | null;
  is_video: boolean | null;
  description?: string;
};

export default function HomePage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [confirm, setConfirm] = useState<{ id: string; toActive: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const dragId = useRef<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/check")
      .then(r => r.json())
      .then(d => { if (d.isAdmin) setIsAdmin(true); })
      .catch(() => {});

    fetch("/api/products/public")
      .then(r => r.json())
      .then(d => { setProducts(d.products ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const toggleCard = (id: string, current: boolean) => {
    setConfirm({ id, toActive: !current });
  };

  const confirmToggle = async () => {
    if (!confirm) return;
    const res = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: confirm.id, is_active: confirm.toActive }),
    });
    if (res.ok) {
      setProducts(prev => prev.map(p => p.id === confirm.id ? { ...p, is_active: confirm.toActive } : p));
    }
    setConfirm(null);
  };

  const handleDrop = async (targetId: string) => {
    setDragOver(null);
    if (!dragId.current || dragId.current === targetId) return;
    const from = products.findIndex(x => x.id === dragId.current);
    const to = products.findIndex(x => x.id === targetId);
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
  };

  const getHref = (slug: string) => {
    if (slug === "premium-saju") return "/saju/total";
    if (slug === "basic-saju") return "/saju/basic";
    return `/saju/${slug}`;
  };

  if (loading) {
    return <div className="pb-10 px-4 pt-4 flex flex-col gap-4" />;
  }

  return (
    <div className="pb-10 px-4 pt-4 flex flex-col gap-4">
      {isAdmin && (
        <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 -8px" }}>
          ☰ 카드를 길게 잡고 드래그해서 순서 변경
        </p>
      )}

      {products.map((product) => {
        const active = product.is_active;
        const comingSoon = !isAdmin && !active;
        const href = getHref(product.slug);
        const isVideo = product.is_video ?? false;
        const imageUrl = product.image_url ?? "/media/hero/hero-3.jpg";
        const isDragTarget = dragOver === product.id;

        return (
          <div
            key={product.id}
            className="relative"
            draggable={isAdmin}
            onDragStart={() => { dragId.current = product.id; }}
            onDragOver={e => { if (isAdmin) { e.preventDefault(); setDragOver(product.id); } }}
            onDragLeave={() => setDragOver(null)}
            onDrop={() => handleDrop(product.id)}
            onDragEnd={() => { dragId.current = null; setDragOver(null); }}
            style={{
              outline: isDragTarget ? "2px dashed rgba(255,255,255,0.6)" : "none",
              borderRadius: 16,
              transform: isDragTarget ? "scale(0.98)" : "scale(1)",
              transition: "transform 0.15s, outline 0.15s",
              cursor: isAdmin ? "grab" : "auto",
            }}
          >
            {/* 어드민 드래그 힌트 */}
            {isAdmin && (
              <div style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 5, pointerEvents: "none",
                opacity: isDragTarget ? 1 : 0,
                transition: "opacity 0.15s",
                background: "rgba(0,0,0,0.6)", borderRadius: 10,
                padding: "6px 14px", color: "#fff", fontSize: 13, fontWeight: 700,
              }}>
                여기에 놓기
              </div>
            )}

            <Link
              href={comingSoon ? "#" : href}
              onClick={e => {
                if (comingSoon) { e.preventDefault(); return; }
                if (dragId.current) { e.preventDefault(); } // 드래그 중엔 클릭 무시
              }}
              className="block w-full rounded-2xl overflow-hidden relative"
              style={{ aspectRatio: "4/3", pointerEvents: comingSoon ? "none" : "auto" }}
            >
              {isVideo ? (
                <video src={imageUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline
                  style={comingSoon ? { filter: "blur(8px) brightness(0.15)", transform: "scale(1.05)" } : {}} />
              ) : (
                <img src={imageUrl} alt={product.name} className="w-full h-full object-cover"
                  style={comingSoon ? { filter: "blur(8px) brightness(0.15)", transform: "scale(1.05)" } : {}} />
              )}
              {comingSoon ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <p className="text-white font-black text-[18px]">서비스 준비중입니다</p>
                  <p className="text-white/70 text-[13px]">멋진 풀이로 선보이겠습니다</p>
                </div>
              ) : (
                <>
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.7))" }} />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {product.badge && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#9b2335", color: "#fff" }}>{product.badge}</span>
                    )}
                    {product.tag && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.5)", color: "#fff" }}>{product.tag}</span>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-bold text-[18px] leading-tight">{product.name}</p>
                    {product.description && <p className="text-white/80 text-[12px] mt-1">{product.description}</p>}
                  </div>
                </>
              )}
            </Link>

            {isAdmin && (
              <button
                onClick={e => { e.stopPropagation(); toggleCard(product.id, active); }}
                style={{
                  position: "absolute", top: 8, right: 8, zIndex: 10,
                  padding: "4px 11px", borderRadius: 12, border: "none",
                  fontSize: 11, fontWeight: 700, cursor: "pointer",
                  background: active ? "#16a34a" : "#6b7280",
                  color: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
                }}
              >
                {active ? "✓ 공개" : "비공개"}
              </button>
            )}
          </div>
        );
      })}

      {isAdmin && (
        <button
          style={{
            width: "100%", padding: "16px", borderRadius: 16,
            border: "2px dashed rgba(255,255,255,0.3)", background: "transparent",
            color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 700, cursor: "pointer",
          }}
        >
          + 새 상품 추가 (어드민 패널에서)
        </button>
      )}

      {confirm && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
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
              {confirm.toActive ? "상품 공개" : "상품 비공개"}
            </p>
            <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 24 }}>
              {confirm.toActive
                ? <>실제 고객에게 상품이 노출됩니다.<br />오픈하시겠습니까?</>
                : <>상품이 고객에게 노출되지 않습니다.<br />비공개로 전환하시겠습니까?</>}
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirm(null)}
                style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid #ddd", background: "#f5f5f5", color: "#555", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                NO
              </button>
              <button onClick={confirmToggle}
                style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "none", background: confirm.toActive ? "#9b2335" : "#374151", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                YES
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
