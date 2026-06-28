"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";

export type Product = {
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
  category?: string | null;
};

const CATEGORIES = [
  {
    tag: "궁합",
    title: "우리, 잘 맞는 걸까?",
    slugs: ["kunghap_yeonae", "kunghap_banryeo", "kunghap_janyeo", "kunghap_jaehwe", "kunghap_business"],
  },
  {
    tag: "연애·결혼",
    title: "사랑이 궁금할 때",
    slugs: ["saju_yeonae", "saju_gyeolhon", "saju_ehon"],
  },
  {
    tag: "임신·육아",
    title: "우리 아이가 궁금할 때",
    slugs: ["saju_imshin", "saju_janyeo"],
  },
  {
    tag: "재물·건강",
    title: "돈과 건강, 둘 다 챙기세요",
    slugs: ["saju_jaemul", "saju_health"],
  },
  {
    tag: "나를 알고 싶을 때",
    title: "나는 어떤 사람일까?",
    slugs: ["saju_youare"],
  },
];

const DUMMY_GRADIENTS = [
  "linear-gradient(135deg, #2d1b4e 0%, #6b2d6b 50%, #c0392b 100%)",
  "linear-gradient(135deg, #1a2a4a 0%, #2d6b8a 50%, #1abc9c 100%)",
  "linear-gradient(135deg, #3d1a00 0%, #8b4513 50%, #d4a017 100%)",
  "linear-gradient(135deg, #1a3a1a 0%, #2d6b2d 50%, #a8d5a2 100%)",
];


export function HomeClient({ initialProducts, isAdmin }: { initialProducts: Product[]; isAdmin: boolean }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [confirm, setConfirm] = useState<{ id: string; toActive: boolean } | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [catDragOver, setCatDragOver] = useState<string | null>(null); // 카테고리 섹션 drop 하이라이트
  const [cardDragOver, setCardDragOver] = useState<string | null>(null); // 카테고리 내 카드 drop 하이라이트
  const [catSlots, setCatSlots] = useState<Record<string, number>>(() =>
    Object.fromEntries(CATEGORIES.map(c => [c.tag, 0]))
  );
  const [slideIndex, setSlideIndex] = useState(0);
  const dragId = useRef<string | null>(null);
  const dragSource = useRef<"list" | "cat" | null>(null);
  const hasDragged = useRef(false); // 드래그 vs 클릭 구분
  const slideTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();

  // 드래그 중 화면 가장자리에서 자동 스크롤
  useEffect(() => {
    let rafId: number;
    const onDragOver = (e: DragEvent) => {
      if (!dragId.current) return;
      const zone = 100;
      const maxSpeed = 18;
      const y = e.clientY;
      const h = window.innerHeight;
      let speed = 0;
      if (y < zone) speed = -maxSpeed * (1 - y / zone);
      else if (y > h - zone) speed = maxSpeed * (1 - (h - y) / zone);
      cancelAnimationFrame(rafId);
      if (speed !== 0) rafId = requestAnimationFrame(() => window.scrollBy(0, speed));
    };
    window.addEventListener("dragover", onDragOver);
    return () => { window.removeEventListener("dragover", onDragOver); cancelAnimationFrame(rafId); };
  }, []);

  const getHref = (slug: string) => `/saju/${slug}`;

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

  const patchCategory = async (id: string, category: string | null) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, category } : p));
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, category }),
    });
  };

  // 카테고리 섹션 전체 영역에 드롭 (빈 공간)
  const handleCategoryDrop = async (categoryTag: string | null) => {
    setCatDragOver(null);
    if (!dragId.current) return;
    const id = dragId.current;
    dragId.current = null;
    dragSource.current = null;
    await patchCategory(id, categoryTag);
  };

  // 카테고리 내 카드에 드롭 → 순서 변경 or 카테고리 이동
  const handleCardDropInCat = async (targetId: string, targetCat: string) => {
    setCardDragOver(null);
    if (!dragId.current || dragId.current === targetId) return;
    const srcId = dragId.current;
    dragId.current = null;
    dragSource.current = null;

    const src = products.find(p => p.id === srcId);
    if (!src) return;

    if (src.category === targetCat) {
      // 같은 카테고리 내 순서 변경
      const catList = products.filter(p => p.category === targetCat);
      const fromIdx = catList.findIndex(p => p.id === srcId);
      const toIdx = catList.findIndex(p => p.id === targetId);
      const next = [...catList];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      const reordered = products.map(p => {
        const newIdx = next.findIndex(n => n.id === p.id);
        return newIdx >= 0 ? { ...p, display_order: (newIdx + 1) * 10 } : p;
      });
      setProducts(reordered);
      await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders: next.map((x, i) => ({ id: x.id, display_order: (i + 1) * 10 })) }),
      });
    } else {
      // 다른 카테고리로 이동
      await patchCategory(srcId, targetCat);
    }
  };

  // 하단 전체 목록 내 순서 변경
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
    dragSource.current = null;
    await fetch("/api/admin/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orders: reordered.map(x => ({ id: x.id, display_order: x.display_order })) }),
    });
  };

  return (
    <div className={`flex flex-col gap-4 pt-4 ${isAdmin ? "pb-10" : "pb-4"}`}>
      {/* 캐러셀 — 어드민만 */}
      {isAdmin && products.length > 0 && (
        <AdminSlider
          products={products}
          slideIndex={slideIndex}
          setSlideIndex={setSlideIndex}
          slideTimer={slideTimer}
          getHref={getHref}
        />
      )}


      {/* 카테고리 섹션 — admin 전용 (짝수=큰카드, 홀수=작은카드 지그재그) */}
      {isAdmin && (
        <div className="flex flex-col gap-8 pt-4">
          {CATEGORIES.map((cat, catIdx) => {
            const catProducts = products.filter(p => p.category === cat.tag);
            const isBig = catIdx % 2 === 0;
            const cardW = isBig ? 180 : 120;
            const cardH = isBig ? 220 : 120;
            const fontSize = isBig ? 13 : 10;
            const badgeFontSize = isBig ? 10 : 8;
            const extraSlots = catSlots[cat.tag] ?? 0;
            const totalSlots = Math.min(10, catProducts.length + extraSlots);
            const emptySlots = Math.max(0, totalSlots - catProducts.length);
            const canAddSlot = totalSlots < 10;
            return (
              <div
                key={cat.tag}
                onDragOver={e => { e.preventDefault(); setCatDragOver(cat.tag); }}
                onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setCatDragOver(null); }}
                onDrop={() => handleCategoryDrop(cat.tag)}
                style={{ borderRadius: 16, border: catDragOver === cat.tag ? "2px dashed rgba(255,255,255,0.4)" : "2px solid transparent", transition: "border 0.15s", padding: "0 0 4px" }}
              >
                <div className="px-4 flex items-center justify-between mb-3">
                  <div>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 700, marginBottom: 2, letterSpacing: 1 }}>{cat.tag}</p>
                    <p style={{ fontSize: 22, color: "#fff", fontWeight: 900, lineHeight: 1.3 }}>{cat.title}</p>
                  </div>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 600, whiteSpace: "nowrap" }}>더보기 →</span>
                </div>
                <div style={{ display: "flex", gap: isBig ? 10 : 8, overflowX: "auto", paddingLeft: 16, paddingRight: 16, paddingBottom: 4, scrollbarWidth: "none" }}>
                  {catProducts.map((product, i) => {
                    const imageUrl = product.image_url;
                    const isDummy = !imageUrl;
                    const isVideo = product.is_video ?? false;
                    const isCardOver = cardDragOver === product.id;
                    return (
                      <div
                        key={product.id}
                        draggable
                        onDragStart={e => { e.stopPropagation(); dragId.current = product.id; dragSource.current = "cat"; hasDragged.current = true; }}
                        onDragOver={e => { e.preventDefault(); e.stopPropagation(); setCardDragOver(product.id); setCatDragOver(null); }}
                        onDragLeave={() => setCardDragOver(null)}
                        onDrop={e => { e.stopPropagation(); handleCardDropInCat(product.id, cat.tag); }}
                        onDragEnd={() => { dragId.current = null; dragSource.current = null; setCardDragOver(null); setTimeout(() => { hasDragged.current = false; }, 0); }}
                        onClick={() => { if (hasDragged.current) return; router.push(`/saju/${product.slug}`); }}
                        style={{
                          flexShrink: 0, width: cardW, height: cardH, borderRadius: isBig ? 16 : 12,
                          overflow: "hidden", position: "relative", cursor: "grab",
                          background: isDummy ? DUMMY_GRADIENTS[i % DUMMY_GRADIENTS.length] : undefined,
                          opacity: product.is_active ? 1 : 0.6,
                          outline: isCardOver ? "2px solid rgba(255,255,255,0.7)" : "none",
                          transition: "outline 0.1s, transform 0.1s",
                          transform: isCardOver ? "scale(0.96)" : "scale(1)",
                        }}
                      >
                        {!isDummy && (isVideo ? (
                          <video src={imageUrl!} style={{ width: "100%", height: "100%", objectFit: "cover" }} autoPlay muted loop playsInline />
                        ) : (
                          <img src={imageUrl!} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ))}
                        {isDummy && (
                          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 700 }}>준비중</p>
                          </div>
                        )}
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.85))" }} />
                        <div style={{ position: "absolute", bottom: isBig ? 12 : 8, left: isBig ? 12 : 8, right: isBig ? 12 : 8 }}>
                          {product.badge && (
                            <span style={{ display: "inline-block", fontSize: badgeFontSize, fontWeight: 700, padding: "1px 5px", borderRadius: 20, background: "#9b2335", color: "#fff", marginBottom: 3 }}>
                              {product.badge}
                            </span>
                          )}
                          <p style={{ color: "#fff", fontWeight: 800, fontSize, lineHeight: 1.3, margin: 0 }}>{product.name}</p>
                        </div>
                        {!product.is_active && (
                          <div style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.5)", borderRadius: 8, padding: "2px 5px", fontSize: 8, color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>비공개</div>
                        )}
                      </div>
                    );
                  })}

                  {/* 빈 슬롯들 */}
                  {Array.from({ length: emptySlots }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      onDragOver={e => { e.preventDefault(); e.stopPropagation(); setCatDragOver(`${cat.tag}-slot`); }}
                      onDragLeave={() => setCatDragOver(null)}
                      onDrop={e => { e.stopPropagation(); handleCategoryDrop(cat.tag); }}
                      style={{
                        flexShrink: 0, width: cardW, height: cardH, borderRadius: isBig ? 16 : 12,
                        border: catDragOver === `${cat.tag}-slot` ? "2px dashed rgba(255,255,255,0.7)" : "2px dashed rgba(255,255,255,0.25)",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
                        background: catDragOver === `${cat.tag}-slot` ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
                        transition: "border 0.15s, background 0.15s",
                      }}
                    >
                      <span style={{ fontSize: isBig ? 22 : 16, color: "rgba(255,255,255,0.2)", lineHeight: 1 }}>+</span>
                      <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, fontWeight: 700, margin: 0 }}>드래그</p>
                    </div>
                  ))}

                  {/* + 슬롯 추가 버튼 */}
                  {canAddSlot && (
                    <button
                      onClick={() => setCatSlots(prev => ({ ...prev, [cat.tag]: (prev[cat.tag] ?? 0) + 1 }))}
                      style={{
                        flexShrink: 0, width: isBig ? 44 : 36, height: cardH, borderRadius: isBig ? 16 : 12,
                        border: "2px dashed rgba(255,255,255,0.15)", background: "transparent",
                        color: "rgba(255,255,255,0.2)", fontSize: isBig ? 20 : 16, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >+</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 전체 상품 카드 목록 — admin 전용 */}
      <div
        className={`px-4 flex flex-col gap-4 ${isAdmin ? "pt-4" : "pt-2"}`}
        onDragOver={e => { if (isAdmin) e.preventDefault(); setCatDragOver("__none__"); }}
        onDragLeave={() => setCatDragOver(null)}
        onDrop={() => handleCategoryDrop(null)}
        style={catDragOver === "__none__" ? { outline: "2px dashed rgba(255,255,255,0.4)", borderRadius: 16 } : {}}
      >
        {isAdmin && (
          <div className="px-0 flex items-center justify-between mb-1">
            <div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 2, letterSpacing: 1 }}>전체</p>
              <p style={{ fontSize: 18, color: "#fff", fontWeight: 900, lineHeight: 1.3 }}>상품 전체보기</p>
            </div>
          </div>
        )}
        {products.map((product, index) => {
          const active = product.is_active;
          const comingSoon = !isAdmin && !active;
          const href = getHref(product.slug);
          const isVideo = product.is_video ?? false;
          const imageUrl = product.image_url;
          const isDummy = !imageUrl;
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
                  if (dragId.current) { e.preventDefault(); }
                }}
                className="block w-full rounded-2xl overflow-hidden relative"
                style={{
                  aspectRatio: "4/3",
                  pointerEvents: comingSoon ? "none" : "auto",
                  background: isDummy ? DUMMY_GRADIENTS[index % DUMMY_GRADIENTS.length] : undefined,
                }}
              >
                {!isDummy && (isVideo ? (
                  <video src={imageUrl!} className="w-full h-full object-cover" autoPlay muted loop playsInline
                    style={comingSoon ? { filter: "blur(8px) brightness(0.15)", transform: "scale(1.05)" } : {}} />
                ) : (
                  <img src={imageUrl!} alt={product.name} className="w-full h-full object-cover"
                    style={comingSoon ? { filter: "blur(8px) brightness(0.15)", transform: "scale(1.05)" } : {}} />
                ))}
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

function AdminSlider({ products, slideIndex, setSlideIndex, slideTimer, getHref }: {
  products: Product[];
  slideIndex: number;
  setSlideIndex: React.Dispatch<React.SetStateAction<number>>;
  slideTimer: React.MutableRefObject<ReturnType<typeof setInterval> | null>;
  getHref: (slug: string) => string;
}) {
  const n = products.length;
  const [offset, setOffset] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const isDragging = useRef(false);
  const idx = slideIndex;

  const CARD_W = 290;
  const STEP = CARD_W - 32;

  const startAutoPlay = useCallback(() => {
    if (slideTimer.current) clearInterval(slideTimer.current);
    slideTimer.current = setInterval(() => {
      setSlideIndex((prev: number) => (prev + 1) % n);
      setOffset(0);
    }, 5000);
  }, [n, setSlideIndex, slideTimer]);

  useEffect(() => {
    startAutoPlay();
    return () => { if (slideTimer.current) clearInterval(slideTimer.current); };
  }, [startAutoPlay]);

  const goTo = (i: number) => {
    if (slideTimer.current) clearInterval(slideTimer.current);
    setSlideIndex(((i % n) + n) % n);
    setOffset(0);
    startAutoPlay();
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isDragging.current = false;
    if (slideTimer.current) clearInterval(slideTimer.current);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.touches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 5) isDragging.current = true;
    setOffset(diff);
  };
  const onTouchEnd = () => {
    if (offset < -STEP / 3) goTo(idx + 1);
    else if (offset > STEP / 3) goTo(idx - 1);
    else { setOffset(0); startAutoPlay(); }
    touchStartX.current = null;
  };

  const mouseStartX = useRef<number | null>(null);
  const onMouseDown = (e: React.MouseEvent) => { mouseStartX.current = e.clientX; isDragging.current = false; };
  const onMouseMove = (e: React.MouseEvent) => {
    if (mouseStartX.current === null) return;
    const diff = e.clientX - mouseStartX.current;
    if (Math.abs(diff) > 5) isDragging.current = true;
    setOffset(diff);
  };
  const onMouseUp = () => {
    if (mouseStartX.current === null) return;
    if (offset < -STEP / 3) goTo(idx + 1);
    else if (offset > STEP / 3) goTo(idx - 1);
    else setOffset(0);
    mouseStartX.current = null;
  };

  const containerH = CARD_W + 40;
  const isMoving = offset !== 0;
  const tiltAngle = Math.max(-12, Math.min(12, offset * 0.06));

  return (
    <div style={{ paddingBottom: 8, userSelect: "none", overflow: "hidden" }}>
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{ height: containerH, position: "relative", cursor: "grab", perspective: 800 }}
      >
        {products.map((product, i) => {
          const diff = i - idx;
          let d = diff;
          if (d > n / 2) d -= n;
          if (d < -n / 2) d += n;

          const baseX = d * STEP + offset;
          const scale = d === 0 ? 1 : 0.85;
          const rotateY = d === 0 ? -tiltAngle : (d < 0 ? 8 : -8);
          const opacity = Math.abs(d) > 1 ? 0 : d === 0 ? 1 : 0.5;
          const zIndex = d === 0 ? 2 : 1;
          const imageUrl = product.image_url;
          const isDummy = !imageUrl;
          const isVideo = product.is_video ?? false;
          const href = getHref(product.slug);
          const isCurrent = d === 0;

          return (
            <div
              key={product.id}
              onClick={() => { if (!isDragging.current && !isCurrent) goTo(i); }}
              style={{
                position: "absolute", top: 0, left: "50%",
                width: CARD_W, height: CARD_W,
                borderRadius: 18, overflow: "hidden",
                zIndex, opacity,
                transform: `translateX(calc(-50% + ${baseX}px)) scale(${scale}) rotateY(${rotateY}deg)`,
                transition: isMoving ? "opacity 0.15s" : "transform 0.45s cubic-bezier(.4,0,.2,1), opacity 0.3s, box-shadow 0.3s",
                boxShadow: isCurrent ? "0 10px 28px rgba(0,0,0,0.55)" : "0 4px 12px rgba(0,0,0,0.3)",
                filter: isCurrent ? "none" : "brightness(0.55)",
                cursor: "pointer",
                background: isDummy ? DUMMY_GRADIENTS[i % DUMMY_GRADIENTS.length] : undefined,
              }}
            >
              {!isDummy && (isVideo ? (
                <video src={imageUrl!} style={{ width: "100%", height: "100%", objectFit: "cover" }} autoPlay muted loop playsInline />
              ) : (
                <img src={imageUrl!} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ))}
              {isDummy && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>준비중</p>
                </div>
              )}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.85))" }} />
              <div style={{ position: "absolute", bottom: 16, left: 14, right: 14 }}>
                {product.badge && (
                  <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#9b2335", color: "#fff", marginBottom: 5 }}>
                    {product.badge}
                  </span>
                )}
                <p style={{ color: "#fff", fontWeight: 900, fontSize: 16, lineHeight: 1.3, margin: "0 0 3px", textShadow: "0 2px 6px rgba(0,0,0,0.8)" }}>{product.name}</p>
                {product.description && isCurrent && (
                  <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, margin: 0 }}>{product.description}</p>
                )}
              </div>
              {isCurrent && (
                <Link href={href} style={{ position: "absolute", inset: 0 }} onClick={e => { if (isDragging.current) e.preventDefault(); }} />
              )}
            </div>
          );
        })}
        <div style={{ position: "absolute", bottom: 22, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 5, pointerEvents: "none" }}>
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === idx ? 20 : 6, height: 6, borderRadius: 3,
                border: "none", padding: 0, cursor: "pointer", pointerEvents: "auto",
                background: i === idx ? "#fff" : "rgba(255,255,255,0.45)",
                transition: "width 0.3s, background 0.3s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
