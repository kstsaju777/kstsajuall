"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import { CATEGORY_CARDS, type CategoryCard } from "@/config/category-cards";

// ─── 카드 컴포넌트 ─────────────────────────────────────────────────────────────
function Card({ card }: { card: CategoryCard }) {
  const isVideo = card.type === "video";
  const videoRef = useRef<HTMLVideoElement>(null);
  const [imgErr, setImgErr] = useState(false);

  return (
    <Link href={card.href} className="block rounded-2xl overflow-hidden relative"
      style={{ backgroundColor: "#1a1a1a", aspectRatio: "4/3" }}>

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

      {/* 뱃지 & 태그 */}
      <div className="absolute top-3 left-3 flex gap-1.5">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: "#711b20", color: "#fff" }}>
          {card.badge}
        </span>
        {card.tag && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#fff", backdropFilter: "blur(4px)" }}>
            {card.tag}
          </span>
        )}
      </div>

      {/* 텍스트 */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-white font-bold text-[17px] leading-snug">{card.name}</p>
        <p className="text-[12px] mt-1 leading-relaxed line-clamp-2"
          style={{ color: "rgba(255,255,255,0.7)" }}>{card.desc}</p>
      </div>
    </Link>
  );
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────
function ProductsContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "";
  const label = category || "전체";

  const cards = CATEGORY_CARDS[label] ?? CATEGORY_CARDS["전체"];

  return (
    <div className="px-3 pt-4 pb-20">
      {/* 카테고리 타이틀 */}
      <p className="text-[13px] font-bold mb-4 px-1" style={{ color: "rgba(255,255,255,0.5)" }}>
        {label} <span style={{ color: "rgba(255,255,255,0.3)" }}>· {cards.length}개</span>
      </p>

      {/* 카드 리스트 */}
      <div className="flex flex-col gap-3">
        {cards.map((card, i) => (
          <Card key={i} card={card} />
        ))}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
