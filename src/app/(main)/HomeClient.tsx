"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { CATEGORY_CARDS } from "@/config/category-cards";

// slug → CategoryCard 맵
const SLUG_CARD_MAP = Object.values(CATEGORY_CARDS).flat().reduce<Record<string, (typeof CATEGORY_CARDS)[string][number]>>((acc, card) => {
  const slug = card.href.replace("/saju/", "");
  if (!acc[slug]) acc[slug] = card;
  return acc;
}, {});

const BADGE_COLORS: Record<string, string> = {
  "궁합": "#e1337d", "반려동물": "#b47221", "사주": "#711b20", "종합": "#711b20",
  "재물": "#eac660", "건강": "#2e7d32", "결혼": "#c2185b", "임신": "#6a1b9a",
  "연애": "#e1337d", "자녀": "#0077b6", "유아": "#dddbd1", "재회": "#7b2fff",
  "이혼": "#444", "비즈니스": "#1d6fce",
};
const BADGE_DARK_TEXT = ["유아", "재물"];

const TAG_COLORS: Record<string, string> = {
  "반려동물": "#b47221", "사주": "#111111", "HOT": "#ff4500", "궁합": "#e1337d",
  "비즈니스": "#1d6fce", "재회": "#7b2fff", "추천": "#00ff73", "인기": "#c0392b",
  "NEW": "#4fd5e8", "FREE": "#555",
};

const TAG_ANIMATIONS = `
  @keyframes hotShimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes bestShimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes newBounce { 0%, 100% { transform: translateY(0); } 30% { transform: translateY(-5px); } 60% { transform: translateY(-2px); } }
  @keyframes tagBeat { 0%, 40%, 60%, 100% { transform: scale(1); } 20% { transform: scale(1.18); } 50% { transform: scale(1.1); } }
  @keyframes chukNeon { 0%, 100% { box-shadow: 0 0 3px 1px rgba(0,255,115,0.5), 0 0 6px 2px rgba(0,255,115,0.2); } 50% { box-shadow: 0 0 7px 2px rgba(0,255,115,0.9), 0 0 12px 4px rgba(0,255,115,0.4); } }
`;

function TagBadge({ value, size = 11 }: { value: string; size?: number }) {
  const p = `${size <= 10 ? 1 : 2}px ${size <= 10 ? 5 : 8}px`;
  const base: React.CSSProperties = { display: "inline-block", fontSize: size, fontWeight: 700, padding: p, borderRadius: 20 };
  if (value === "HOT") return <span style={{ ...base, color: "#fff", background: "linear-gradient(105deg,#ff4500 30%,#ffd700 48%,#fff8e0 53%,#ffd700 58%,#ff4500 72%)", backgroundSize: "200% auto", animation: "hotShimmer 1.8s linear infinite" }}>HOT</span>;
  if (value === "BEST") return <span style={{ ...base, color: "#111", background: "linear-gradient(105deg,#e6a800 30%,#ffe566 48%,#fffbe0 53%,#ffe566 58%,#e6a800 72%)", backgroundSize: "200% auto", animation: "bestShimmer 2s linear infinite" }}>BEST</span>;
  if (value === "NEW") return <span style={{ ...base, backgroundColor: "#4fd5e8", color: "#000", animation: "newBounce 1.2s ease-in-out infinite" }}>NEW</span>;
  if (value === "추천") return <span style={{ ...base, backgroundColor: "#00ff73", color: "#000", animation: "chukNeon 1.6s ease-in-out infinite" }}>추천</span>;
  if (value === "궁합") return <span style={{ ...base, backgroundColor: TAG_COLORS["궁합"], color: "#fff", animation: "tagBeat 1.5s ease-in-out infinite" }}>궁합</span>;
  return <span style={{ ...base, backgroundColor: TAG_COLORS[value] ?? "rgba(255,255,255,0.2)", color: "#fff" }}>{value}</span>;
}

function BadgeTag({ badge, tag, tag2, size = 11 }: { badge?: string | null; tag?: string | null; tag2?: string | null; size?: number }) {
  const p = `${size <= 10 ? 1 : 2}px ${size <= 10 ? 5 : 8}px`;
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 4 }}>
      {tag && <TagBadge value={tag} size={size} />}
      {tag2 && <TagBadge value={tag2} size={size} />}
      {badge && <span style={{ display: "inline-block", fontSize: size, fontWeight: 700, padding: p, borderRadius: 20, backgroundColor: BADGE_COLORS[badge] ?? "#711b20", color: BADGE_DARK_TEXT.includes(badge) ? "#000" : "#fff" }}>{badge}</span>}
    </div>
  );
}

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
    tag: "사랑",
    title: "사랑이 궁금할 때",
    slugs: ["saju_yeonae", "kunghap_yeonae", "kunghap_jaehwe", "saju_gyeolhon", "saju_ehon"],
  },
  {
    tag: "재물",
    title: "돈과 건강, 둘 다 챙기세요",
    slugs: ["saju_jaemul", "kunghap_business"],
  },
  {
    tag: "가족",
    title: "우리 아이가 궁금할 때",
    slugs: ["saju_janyeo", "kunghap_janyeo", "saju_imshin", "saju_youare"],
  },
  {
    tag: "기타",
    title: "이것도 궁금해요",
    slugs: ["kunghap_banryeo", "saju_health", "total"],
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
  const [slideIndex, setSlideIndex] = useState(0);
  const slideTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();

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

  return (
    <div className={`flex flex-col gap-4 pt-4 ${isAdmin ? "pb-10" : "pb-4"}`}>
      <style>{TAG_ANIMATIONS}</style>
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

      {/* 카테고리 섹션 */}
      {isAdmin && (
        <div className="flex flex-col gap-5" style={{ marginTop: -12 }}>
          {CATEGORIES.map((cat, catIdx) => {
            const catProducts = cat.slugs
              .map(slug => products.find(p => p.slug === slug))
              .filter(Boolean) as Product[];
            const isBig = catIdx % 2 === 1;
            const isSmallBig = catIdx === 0 || catIdx === 2;
            const cardW = isSmallBig ? "38vw" : isBig ? "65vw" : "28vw";
            const cardH = isSmallBig ? "50vw" : isBig ? "81vw" : "28vw";
            const fontSize = isBig ? 25 : 18;
            const badgeFontSize = isBig ? 10 : 8;

            return (
              <div key={cat.tag} style={{ padding: "0 0 4px" }}>
                <div className="flex items-center justify-between mb-3" style={{ paddingLeft: 10, paddingRight: 10 }}>
                  <div>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 700, marginBottom: 2, letterSpacing: 1 }}>{cat.tag}</p>
                    <p style={{ fontSize: 22, color: "#fff", fontWeight: 900, lineHeight: 1.3 }}>{cat.title}</p>
                  </div>
                  <span onClick={() => router.push(`/products?category=${cat.tag}`)} style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 600, whiteSpace: "nowrap", cursor: "pointer" }}>더보기 →</span>
                </div>
                <div style={{ display: "flex", gap: isBig ? 10 : 8, overflowX: "auto", paddingLeft: 10, paddingRight: 10, paddingBottom: 4, scrollbarWidth: "none", scrollSnapType: "x mandatory", scrollPaddingLeft: 10, WebkitOverflowScrolling: "touch" }}>
                  {catProducts.map((product, i) => {
                    const imageUrl = product.image_url;
                    const isDummy = !imageUrl;
                    const isVideo = product.is_video ?? false;
                    return (
                      <Link
                        key={product.id}
                        href={`/saju/${product.slug}`}
                        prefetch={true}
                        style={{
                          display: "block",
                          flexShrink: 0, width: cardW, height: cardH, borderRadius: isBig ? 16 : 12,
                          overflow: "hidden", position: "relative", cursor: "pointer",
                          scrollSnapAlign: "start",
                          background: isDummy ? DUMMY_GRADIENTS[i % DUMMY_GRADIENTS.length] : undefined,
                          opacity: 1,
                        }}
                      >
                        {!isDummy && (isVideo ? (
                          <video src={imageUrl!} style={{ width: "100%", height: "100%", objectFit: "cover" }} autoPlay muted loop playsInline preload="auto" />
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
                          {(() => { const c = SLUG_CARD_MAP[product.slug]; return <><BadgeTag badge={c?.badge ?? product.badge} tag={c?.tag ?? product.tag} tag2={c?.tag2} size={badgeFontSize} />{c?.tagline && <p style={{ color: "rgba(255,255,255,0.6)", fontSize: isBig ? 11 : 8, margin: "0 0 1px", fontStyle: "normal" }}>{c.tagline}</p>}<p style={{ color: "#fff", fontWeight: 800, fontSize, lineHeight: 1.3, margin: 0 }}>{product.name}</p>{(c?.shortDesc ?? product.description) && <p style={{ color: "rgba(255,255,255,0.8)", fontSize: isBig ? 12 : 9, margin: "2px 0 0" }}>{c?.shortDesc ?? product.description}</p>}</>; })()}
                        </div>
                        {!product.is_active && (
                          <div style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.5)", borderRadius: 8, padding: "2px 5px", fontSize: 8, color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>비공개</div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 로고 구분선 */}
      {isAdmin && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "14px 0 0px" }}>
          <img src="/logo_128.jpg" alt="홍연당" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: "50%", cursor: "pointer" }} />
        </div>
      )}

      {/* 전체 상품 카드 목록 — admin 전용 */}
      <div className={`px-4 flex flex-col gap-4 ${isAdmin ? "pt-4" : "pt-2"}`}>
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

          return (
            <div key={product.id} className="relative">
              <Link
                href={comingSoon ? "#" : href}
                onClick={e => { if (comingSoon) e.preventDefault(); }}
                className="block w-full rounded-2xl overflow-hidden relative"
                style={{
                  aspectRatio: "4/3",
                  pointerEvents: comingSoon ? "none" : "auto",
                  background: isDummy ? DUMMY_GRADIENTS[index % DUMMY_GRADIENTS.length] : undefined,
                }}
              >
                {!isDummy && (isVideo ? (
                  <video src={imageUrl!} className="w-full h-full object-cover" autoPlay muted loop playsInline preload="auto"
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
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      {(() => { const c = SLUG_CARD_MAP[product.slug]; return <><BadgeTag badge={c?.badge ?? product.badge} tag={c?.tag ?? product.tag} tag2={c?.tag2} size={12} />{c?.tagline && <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: "0 0 1px", fontStyle: "normal" }}>{c.tagline}</p>}<p className="text-white font-bold text-[30px] leading-tight">{product.name}</p>{(c?.desc ?? product.description) && <p className="text-white/80 text-[15px] mt-0.5">{c?.desc ?? product.description}</p>}</>; })()}
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
                <video src={imageUrl!} style={{ width: "100%", height: "100%", objectFit: "cover" }} autoPlay muted loop playsInline preload="auto" />
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
                {(() => { const c = SLUG_CARD_MAP[product.slug]; return <><BadgeTag badge={c?.badge ?? product.badge} tag={c?.tag ?? product.tag} tag2={c?.tag2} size={12} />{c?.tagline && <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: "0 0 1px" }}>{c.tagline}</p>}<p style={{ color: "#fff", fontWeight: 900, fontSize: 30, lineHeight: 1.3, margin: "0 0 1px", textShadow: "0 2px 6px rgba(0,0,0,0.8)" }}>{product.name}</p>{isCurrent && (c?.desc ?? product.description) && <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, margin: 0, marginTop: 1 }}>{c?.desc ?? product.description}</p>}</>; })()}
              </div>
              {isCurrent && (
                <Link href={href} prefetch={true} style={{ position: "absolute", inset: 0 }} onClick={e => { if (isDragging.current) e.preventDefault(); }} />
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
