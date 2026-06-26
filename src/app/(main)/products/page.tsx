"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import { CATEGORY_CARDS, FREE_SECTIONS, type CategoryCard } from "@/config/category-cards";

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
        <div className="flex gap-1.5 mb-1.5">
          <span className="font-bold rounded-full"
            style={{ fontSize: small ? 8 : 12, padding: small ? "2px 6px" : "2px 10px", backgroundColor: "#711b20", color: "#fff" }}>
            {card.badge}
          </span>
          {card.tag && (
            <span className="font-bold rounded-full"
              style={{ fontSize: small ? 8 : 12, padding: small ? "2px 6px" : "2px 10px", backgroundColor: "rgba(255,255,255,0.2)", color: "#fff", backdropFilter: "blur(4px)" }}>
              {card.tag}
            </span>
          )}
        </div>
        {/* 서브 태그라인 */}
        <p className="font-medium mb-1" style={{ fontSize: small ? 8 : 12, color: "rgba(255,255,255,0.55)" }}>
          {card.desc}
        </p>
        {/* 메인 타이틀 */}
        <p className="text-white font-bold leading-tight mb-1" style={{ fontSize: small ? 20 : 33 }}>
          {card.name}
        </p>
        {/* 부연 설명 */}
        <p className="leading-relaxed" style={{ fontSize: small ? 10 : 16, color: "rgba(255,255,255,0.45)" }}>
          {card.desc}
        </p>
      </div>
    </Link>
  );
}

// ─── 무료 탭 전용 카드 (이미지 위 + 하단 텍스트) ──────────────────────────────
function FreeCard({ card }: { card: CategoryCard }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <Link href={card.href} className="block rounded-2xl overflow-hidden" style={{ background: "#1a1a1a" }}>
      <div className="relative" style={{ aspectRatio: "4/3" }}>
        {imgErr ? (
          <div className="w-full h-full" style={{ background: "linear-gradient(135deg,#2a1a2a,#1a1a3a)" }} />
        ) : (
          <img src={card.image} alt={card.name} className="w-full h-full object-cover" onError={() => setImgErr(true)} />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)" }} />
        {card.badge && (
          <div className="absolute top-2 left-2 flex gap-1">
            <span className="text-white font-bold rounded-full" style={{ fontSize: 10, padding: "2px 8px", background: "#711b20" }}>{card.badge}</span>
            {card.tag && <span className="text-white font-bold rounded-full" style={{ fontSize: 10, padding: "2px 8px", background: "rgba(255,255,255,0.2)" }}>{card.tag}</span>}
          </div>
        )}
      </div>
      <div style={{ padding: "10px 12px 14px", background: "#1c1c1e" }}>
        <p className="font-black text-white leading-tight" style={{ fontSize: 15, marginBottom: 4 }}>{card.name}</p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{card.desc}</p>
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
        <div key={section.title} style={{ marginBottom: 32 }}>
          <div style={{ padding: "0 16px 12px" }}>
            <p style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginBottom: 4 }}>{section.title}</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{section.subtitle}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "0 12px" }}>
            {section.cards.map((card, i) => (
              <FreeCard key={i} card={card} />
            ))}
          </div>
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
        {(() => {
          const rows: React.ReactNode[] = [];
          let i = 0;
          let rowIdx = 0;
          while (i < cards.length) {
            if (rowIdx % 2 === 0) {
              rows.push(<Card key={i} card={cards[i]} aspectRatio="4/3" />);
              i++;
            } else {
              const left  = cards[i];
              const right = cards[i + 1];
              rows.push(
                <div key={i} className="flex gap-3">
                  <div className="flex-1"><Card card={left}  aspectRatio="2/3" small /></div>
                  {right
                    ? <div className="flex-1"><Card card={right} aspectRatio="2/3" small /></div>
                    : <div className="flex-1" />
                  }
                </div>
              );
              i += 2;
            }
            rowIdx++;
          }
          return rows;
        })()}
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
