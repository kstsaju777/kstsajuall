"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import { CATEGORY_CARDS, FREE_SECTIONS, type CategoryCard } from "@/config/category-cards";

// ─── 뱃지/태그 색상 맵 ────────────────────────────────────────────────────────
const BADGE_COLORS: Record<string, string> = {
  "궁합": "#e1337d",
  "반려동물": "#b47221",
  "사주": "#711b20",
  "종합": "#711b20",
  "재물": "#eac660",
  "건강": "#2e7d32",
  "결혼": "#c2185b",
  "임신": "#6a1b9a",
  "연애": "#e1337d",
  "자녀": "#0077b6",
  "유아": "#dddbd1",
  "재회": "#7b2fff",
  "이혼": "#444",
  "비즈니스": "#1d6fce",
};

const TAG_COLORS: Record<string, string> = {
  "반려동물": "#b47221",
  "사주": "#111111",
  "HOT": "#ff4500",
  "궁합": "#e1337d",
  "비즈니스": "#1d6fce",
  "재회": "#7b2fff",
  "추천": "#00ff73",
  "인기": "#c0392b",
  "NEW": "#4fd5e8",
  "베스트": "#b47221",
  "FREE": "#555",
};

const TAG_ANIMATIONS = `
  @keyframes hotShimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes bestShimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes tagBeat {
    0%, 40%, 60%, 100% { transform: scale(1); }
    20% { transform: scale(1.18); }
    50% { transform: scale(1.1); }
  }
  @keyframes newBounce {
    0%, 100% { transform: translateY(0); }
    30%       { transform: translateY(-5px); }
    60%       { transform: translateY(-2px); }
  }
  @keyframes chukNeon {
    0%, 100% { box-shadow: 0 0 3px 1px rgba(0,255,115,0.5), 0 0 6px 2px rgba(0,255,115,0.2); }
    50%       { box-shadow: 0 0 7px 2px rgba(0,255,115,0.9), 0 0 12px 4px rgba(0,255,115,0.4); }
  }
`;

// ─── 카드 컴포넌트 ─────────────────────────────────────────────────────────────
function Card({ card, aspectRatio = "4/3", small = false }: { card: CategoryCard; aspectRatio?: string; small?: boolean }) {
  const isVideo = card.type === "video";
  const videoRef = useRef<HTMLVideoElement>(null);
  const [imgErr, setImgErr] = useState(false);

  return (
    <Link href={card.href} className="block rounded-2xl overflow-hidden relative"
      style={{ backgroundColor: "#1a1a1a", aspectRatio }}>

      {/* 미디어 */}
      {isVideo ? (
        <video
          ref={videoRef}
          src={card.image}
          className="w-full h-full object-cover"
          autoPlay muted loop playsInline
        />
      ) : imgErr ? (
        <div className="w-full h-full" style={{ background: "linear-gradient(135deg,#2a1a2a,#1a1a3a)" }} />
      ) : (
        <img src={card.image} alt={card.name}
          className="w-full h-full object-cover"
          onError={() => setImgErr(true)} />
      )}

      {/* 그라데이션 오버레이 */}
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)" }} />

      {/* 텍스트 + 뱃지 (하단 통합) */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
        {/* 뱃지 & 태그 */}
        <div className="flex gap-1.5" style={{ marginBottom: 3 }}>
          {card.tag && (
            card.tag === "HOT" ? (
              <span className="font-bold rounded-full"
                style={{
                  fontSize: small ? 8 : 12, padding: small ? "2px 6px" : "2px 10px", color: "#fff",
                  background: "linear-gradient(105deg, #ff4500 30%, #ffd700 48%, #fff8e0 53%, #ffd700 58%, #ff4500 72%)",
                  backgroundSize: "200% auto",
                  animation: "hotShimmer 1.8s linear infinite",
                }}>
                HOT
              </span>
            ) : card.tag === "BEST" ? (
              <span className="font-bold rounded-full"
                style={{
                  fontSize: small ? 8 : 12, padding: small ? "2px 6px" : "2px 10px", color: "#111",
                  background: "linear-gradient(105deg, #e6a800 30%, #ffe566 48%, #fffbe0 53%, #ffe566 58%, #e6a800 72%)",
                  backgroundSize: "200% auto",
                  animation: "bestShimmer 2s linear infinite",
                }}>
                BEST
              </span>
            ) : card.tag === "NEW" ? (
              <span className="font-bold rounded-full"
                style={{
                  fontSize: small ? 8 : 12, padding: small ? "2px 6px" : "2px 10px",
                  backgroundColor: "#4fd5e8", color: "#000", display: "inline-block",
                  animation: "newBounce 1.2s ease-in-out infinite",
                }}>
                NEW
              </span>
            ) : card.tag === "추천" ? (
              <span className="font-bold rounded-full"
                style={{
                  fontSize: small ? 8 : 12, padding: small ? "2px 6px" : "2px 10px",
                  backgroundColor: "#00ff73", color: "#000",
                  animation: "chukNeon 1.6s ease-in-out infinite",
                }}>
                추천
              </span>
            ) : card.tag === "궁합" ? (
              <span className="font-bold rounded-full"
                style={{ fontSize: small ? 8 : 12, padding: small ? "2px 6px" : "2px 10px", backgroundColor: TAG_COLORS["궁합"], color: "#fff", display: "inline-block", animation: "tagBeat 1.5s ease-in-out infinite" }}>
                궁합
              </span>
            ) : (
              <span className="font-bold rounded-full"
                style={{ fontSize: small ? 8 : 12, padding: small ? "2px 6px" : "2px 10px", backgroundColor: TAG_COLORS[card.tag] ?? "rgba(255,255,255,0.2)", color: "#fff", backdropFilter: "blur(4px)" }}>
                {card.tag}
              </span>
            )
          )}
          {card.tag2 && (
            <span className="font-bold rounded-full"
              style={{
                fontSize: small ? 8 : 12, padding: small ? "2px 6px" : "2px 10px",
                backgroundColor: TAG_COLORS[card.tag2] ?? "rgba(255,255,255,0.2)", color: "#fff", backdropFilter: "blur(4px)",
                ...(card.tag2 === "궁합" ? { animation: "tagBeat 1.5s ease-in-out infinite", display: "inline-block" } : {}),
              }}>
              {card.tag2}
            </span>
          )}
          <span className="font-bold rounded-full"
            style={{ fontSize: small ? 8 : 12, padding: small ? "2px 6px" : "2px 10px", backgroundColor: BADGE_COLORS[card.badge] ?? "#711b20", color: ["유아", "BEST", "재물"].includes(card.badge) ? "#000" : "#fff" }}>
            {card.badge}
          </span>
        </div>
        {/* 꾸밈어 */}
        {card.tagline && (
          <p style={{ fontSize: small ? 8 : 13, color: "rgba(255,255,255,0.6)", marginBottom: 1, fontStyle: "normal" }}>
            {card.tagline}
          </p>
        )}
        {/* 메인 타이틀 */}
        <p className="text-white font-bold leading-tight" style={{ fontSize: small ? 16 : 30, marginBottom: 2 }}>
          {card.name}
        </p>
        {/* 부연 설명 */}
        <p className="leading-snug" style={{ fontSize: small ? 9 : 15, color: "rgba(255,255,255,0.45)" }}>
          {card.desc}
        </p>
      </div>
    </Link>
  );
}

const DUMMY_GRADIENTS = [
  "linear-gradient(135deg, #1a0a2e 0%, #4a1060 50%, #8b1a3a 100%)",
  "linear-gradient(135deg, #0a1a2e 0%, #103060 50%, #1a5080 100%)",
  "linear-gradient(135deg, #1a1000 0%, #4a2800 50%, #8b5a00 100%)",
  "linear-gradient(135deg, #0a1a0a 0%, #103010 50%, #204020 100%)",
  "linear-gradient(135deg, #2a0a0a 0%, #600a0a 50%, #901a1a 100%)",
  "linear-gradient(135deg, #1a0a1a 0%, #400a40 50%, #6a1a6a 100%)",
];

// ─── 무료 탭 전용 카드 (더미 그라디언트 + 텍스트 오버레이) ───────────────────
function FreeCard({ card, idx }: { card: CategoryCard; idx: number }) {
  const [imgOk, setImgOk] = useState(!!card.image);
  const gradient = DUMMY_GRADIENTS[idx % DUMMY_GRADIENTS.length];

  return (
    <Link href={card.href} className="block rounded-2xl overflow-hidden relative" style={{ aspectRatio: "3/4" }}>
      {/* 배경: 이미지 있으면 이미지, 없으면 더미 그라디언트 */}
      <div className="absolute inset-0" style={{ background: gradient }} />
      {card.image && imgOk && (
        <img src={card.image} alt={card.name} className="absolute inset-0 w-full h-full object-cover" onError={() => setImgOk(false)} />
      )}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)" }} />
      <div className="absolute bottom-0 left-0 right-0" style={{ padding: "0 12px 14px" }}>
        {card.badge && (
          <div className="flex gap-1" style={{ marginBottom: 5 }}>
            <span className="text-white font-bold rounded-full" style={{ fontSize: 10, padding: "2px 8px", background: "#711b20" }}>{card.badge}</span>
            {card.tag && <span className="text-white font-bold rounded-full" style={{ fontSize: 10, padding: "2px 8px", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(4px)" }}>{card.tag}</span>}
          </div>
        )}
        <p className="font-black text-white leading-tight" style={{ fontSize: 14, marginBottom: 4 }}>{card.name}</p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>{card.desc}</p>
      </div>
    </Link>
  );
}

// ─── 무료 탭 레이아웃 ───────────────────────────────────────────────────────────
function FreeContent() {
  return (
    <div className="pb-20">
      {/* 이벤트 배너 */}
      <div style={{ margin: "12px 12px 20px", background: "#fff", borderRadius: 16, padding: "16px 18px" }}>
        <p style={{ fontSize: 16, fontWeight: 900, color: "#111", marginBottom: 8 }}>
          기간 한정 무료 이벤트 🔔
        </p>
        <ul style={{ paddingLeft: 16, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          <li style={{ fontSize: 13, color: "#333", lineHeight: 1.5 }}>아래 상품들은 곧 런칭될 아이템들이에요!</li>
          <li style={{ fontSize: 13, color: "#c0392b", fontWeight: 700, lineHeight: 1.5 }}>
            아이템을 쭉 둘러보고 신중히 골라주세요! (인당 3개 제한)
          </li>
        </ul>
      </div>

      {/* 섹션들 */}
      {FREE_SECTIONS.map((section) => (
        <div key={section.title} style={{ marginBottom: 36 }}>
          <div style={{ padding: "0 16px 12px" }}>
            <p style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginBottom: 4 }}>{section.title}</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{section.subtitle}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "0 12px" }}>
            {section.cards.map((card, i) => (
              <FreeCard key={i} card={card} idx={i} />
            ))}
          </div>
          {section.hasMore && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
              <button style={{
                padding: "9px 28px", borderRadius: 50,
                border: "1px solid rgba(255,255,255,0.25)", background: "transparent",
                color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}>더보기</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────
function ProductsContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "";
  const label = category || "전체";

  if (label === "무료") return <FreeContent />;

  const cards = CATEGORY_CARDS[label] ?? CATEGORY_CARDS["전체"] ?? [];

  return (
    <div className="px-3 pt-4 pb-20">
      <p className="text-[13px] font-bold mb-4 px-1" style={{ color: "rgba(255,255,255,0.5)" }}>
        {label} <span style={{ color: "rgba(255,255,255,0.3)" }}>· {cards.length}개</span>
      </p>
      <div className="flex flex-col gap-3">
        {cards.map((card, i) => (
          <Card key={i} card={card} aspectRatio="4/3" />
        ))}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <>
    <style>{TAG_ANIMATIONS}</style>
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
    </>
  );
}
