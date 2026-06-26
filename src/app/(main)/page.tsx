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
  const [slideIndex, setSlideIndex] = useState(0);
  const slideTimer = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // 슬라이드 자동 재생
  useEffect(() => {
    const visibleProducts = products.filter(p => isAdmin || p.is_active);
    if (visibleProducts.length <= 1) return;
    slideTimer.current = setInterval(() => {
      setSlideIndex(prev => (prev + 1) % visibleProducts.length);
    }, 3000);
    return () => { if (slideTimer.current) clearInterval(slideTimer.current); };
  }, [products, isAdmin]);

  const getHref = (slug: string) => {
    if (slug === "premium-saju") return "/saju/total";
    if (slug === "basic-saju") return "/saju/basic";
    return `/saju/${slug}`;
  };

  if (loading) {
    return <div className="pb-10 px-4 pt-4 flex flex-col gap-4" />;
  }

  return (
    <div className="pb-10 flex flex-col gap-4">

      {/* 상단 슬라이드 배너 - 어드민만 */}
      {isAdmin && products.length > 0 && (() => {
        const current = products[slideIndex % products.length];
        const href = getHref(current.slug);
        const isVideo = current.is_video ?? false;
        const imageUrl = current.image_url ?? "/media/hero/hero-3.jpg";
        return (
          <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
            <Link href={href} className="block w-full relative" style={{ aspectRatio: "16/9", display: "block" }}>
              {isVideo ? (
                <video key={current.id} src={imageUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
              ) : (
                <img key={current.id} src={imageUrl} alt={current.name} className="w-full h-full object-cover" />
              )}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.75))" }} />
              {current.badge && (
                <div style={{ position: "absolute", top: 14, left: 16 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "#9b2335", color: "#fff" }}>{current.badge}</span>
                </div>
              )}
              <div style={{ position: "absolute", bottom: 36, left: 16, right: 16 }}>
                <p style={{ color: "#fff", fontWeight: 900, fontSize: 22, lineHeight: 1.3, margin: "0 0 6px", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{current.name}</p>
                {current.description && (
                  <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, margin: 0 }}>{current.description}</p>
                )}
              </div>
              <div style={{ position: "absolute", bottom: 14, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 5 }}>
                {products.map((_, i) => (
                  <button
                    key={i}
                    onClick={e => { e.preventDefault(); e.stopPropagation(); if (slideTimer.current) clearInterval(slideTimer.current); setSlideIndex(i); }}
                    style={{
                      width: i === slideIndex % products.length ? 20 : 6,
                      height: 6, borderRadius: 3, border: "none", padding: 0,
                      background: i === slideIndex % products.length ? "#fff" : "rgba(255,255,255,0.4)",
                      transition: "width 0.3s, background 0.3s", cursor: "pointer",
                    }}
                  />
                ))}
              </div>
            </Link>
          </div>
        );
      })()}

      <div className="px-4 pt-2 flex flex-col gap-4">

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
      </div>

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
