"use client";

// import { HeroCarousel } from "@/components/landing/HeroCarousel"; // 심사용 비활성화
import Link from "next/link";

const CARDS = [
  {
    image: "/images/cards/total-1.jpg",
    badge: "종합",
    tag: "베스트",
    name: "종합 사주 감명",
    desc: "대운·세운·직업운·재물운·건강운 정통 종합 풀이",
    href: "/saju/jeongtong",
  },
  {
    image: "/images/hero/hero-3.jpg",
    badge: "재물",
    tag: "인기",
    name: "정통사주 재물운",
    desc: "평생 재물운과 돈이 들어오는 시기를 분석합니다",
    href: "/saju/jeongtong",
  },
  {
    image: "/images/hero/hero-7.jpg",
    badge: "연애",
    tag: "HOT",
    name: "유혹사주",
    desc: "쉿, 내게 숨겨진 색기와 이성을 홀리는 매력 알아보기",
    href: "/saju/jeongtong",
  },
];

export default function HomePage() {
  return (
    <div className="pb-10 px-4 pt-4 flex flex-col gap-4">
      {CARDS.map((card) => (
        <Link key={card.name} href={card.href} className="block w-full rounded-2xl overflow-hidden relative" style={{ aspectRatio: "16/9" }}>
          <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
          {/* 하단 그라데이션 오버레이 */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.7))" }} />
          {/* 뱃지 */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#9b2335", color: "#fff" }}>{card.badge}</span>
            {card.tag && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.5)", color: "#fff" }}>{card.tag}</span>}
          </div>
          {/* 텍스트 */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-white font-bold text-[18px] leading-tight">{card.name}</p>
            <p className="text-white/80 text-[12px] mt-1">{card.desc}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

/*
  =====================================================================
  ↓↓↓ 심사 후 원복 예정 ↓↓↓
  import { HeroCarousel } from "@/components/landing/HeroCarousel";
  import { ShuffledCategorySection as CategorySection } from "@/components/landing/ShuffledCategorySection";
  import { cardSections } from "@/config/content";
  ... 전체 섹션들 복원
  =====================================================================
*/
