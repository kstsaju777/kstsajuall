import Link from "next/link";
import { ProductCard, CardData } from "./ProductCard";

// layout 종류
// "large"   → 카드 2개, 너비 47%, 비율 3:4  (큼직하게)
// "medium"  → 카드 3개 보임, 너비 32%, 비율 3:4  (촘촘하게)
// "tall"    → 카드 2개, 너비 47%, 비율 2:3  (더 길게)

type LayoutType = "large" | "medium" | "tall";

interface CategorySectionProps {
  badge: string;
  badgeColor?: string;
  badgeBg?: string;
  title: string;
  moreHref?: string;
  cards: CardData[];
  layout?: LayoutType;
}

const layoutConfig: Record<LayoutType, { cardWidth: string; aspectRatio: string }> = {
  large:  { cardWidth: "58%", aspectRatio: "3/4" },
  medium: { cardWidth: "40%", aspectRatio: "3/4" },
  tall:   { cardWidth: "58%", aspectRatio: "4/5" },
};

export function CategorySection({
  badge,
  badgeColor = "text-gold",
  badgeBg = "bg-gold/10",
  title,
  moreHref = "/products",
  cards,
  layout = "large",
}: CategorySectionProps) {
  const { cardWidth, aspectRatio } = layoutConfig[layout];

  return (
    <section className="py-5 px-[2%]">
      {/* 섹션 헤더 */}
      <div className="mb-3 flex flex-col gap-0">
        <span className="text-[17px] font-bold tracking-wide" style={{ fontFamily: 'Pretendard, sans-serif', color: '#de767b' }}>
          {badge}
        </span>
        <div className="flex items-center justify-between">
          <h2 className="font-blackhan text-[20px] leading-tight text-ink md:text-[24px]">
            {title}
          </h2>
          <Link
            href={moreHref}
            className="flex-shrink-0 rounded-full px-3 py-1 text-[12px] text-[#aaaaaa] hover:text-white transition-colors"
            style={{ backgroundColor: '#5a161a' }}
          >
            더보기 →
          </Link>
        </div>
      </div>

      {/* 가로 스크롤 카드 열 */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-[2%] px-[2%]">
        {cards.map((card, i) => (
          <div key={i} className="flex-shrink-0" style={{ width: cardWidth }}>
            <ProductCard {...card} aspectRatio={aspectRatio} />
          </div>
        ))}
        {/* 오른쪽 peek 여백 */}
        <div className="flex-shrink-0 w-[4%]" />
      </div>
    </section>
  );
}
