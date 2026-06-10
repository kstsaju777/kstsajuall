import { HeroCarousel } from "@/components/landing/HeroCarousel";
import { ShuffledCategorySection as CategorySection } from "@/components/landing/ShuffledCategorySection";

// ─── 심사용 카드 3개 ───────────────────────────────────────────────────────────
const reviewCards = {
  total: {
    badge: "종합",
    title: "내 인생의 모든 것을 한눈에",
    moreHref: "/saju/jeongtong",
    layout: "large" as const,
    cards: [
      { image: "/images/cards/total-1.jpg", badge: "종합", tag: "베스트", name: "종합 사주 감명", desc: "대운·세운·직업운·재물운·건강운 정통 종합 풀이", href: "/saju/jeongtong" },
      { image: "/images/cards/total-3.jpg", badge: "종합", tag: "NEW",    name: "신년 사주",      desc: "새해 한 해 전체 운세 종합 분석",              href: "/saju/jeongtong" },
    ],
  },
  wealth: {
    badge: "재물",
    title: "재물운이 터지는 날은?",
    moreHref: "/saju/jeongtong",
    layout: "large" as const,
    cards: [
      { image: "/images/hero/hero-3.jpg", badge: "재물", tag: "인기", name: "정통사주 재물운", desc: "평생 재물운과 돈이 들어오는 시기를 분석합니다", href: "/saju/jeongtong" },
      { image: "/images/hero/hero-4.jpg", badge: "재물", tag: "NEW",  name: "자미두수 재물운", desc: "동양 별자리로 보는 내 재물의 흐름과 재테크 타이밍", href: "/saju/jeongtong" },
    ],
  },
  love: {
    badge: "연애",
    title: "두근두근 내 연애운은?",
    moreHref: "/saju/jeongtong",
    layout: "large" as const,
    cards: [
      { image: "/images/hero/hero-7.jpg",  badge: "연애", tag: "HOT",  name: "유혹사주",      desc: "쉿, 내게 숨겨진 색기와 이성을 홀리는 매력 알아보기", href: "/saju/jeongtong" },
      { image: "/images/hero/hero-12.jpg", badge: "연애", tag: "인기", name: "날 얼마나 좋아할까?", desc: "동양의 별자리로 보는 궁합과 상대의 마음 크기", href: "/saju/jeongtong" },
    ],
  },
};

export default function HomePage() {
  const s = reviewCards;
  return (
    <div className="pb-10">
      <HeroCarousel />

      <CategorySection
        layout={s.total.layout}
        badge={s.total.badge}
        badgeColor="text-orange-400"
        badgeBg="bg-orange-400/10"
        title={s.total.title}
        moreHref={s.total.moreHref}
        cards={s.total.cards}
      />

      <CategorySection
        layout={s.wealth.layout}
        badge={s.wealth.badge}
        badgeColor="text-orange-400"
        badgeBg="bg-orange-400/10"
        title={s.wealth.title}
        moreHref={s.wealth.moreHref}
        cards={s.wealth.cards}
      />

      <CategorySection
        layout={s.love.layout}
        badge={s.love.badge}
        badgeColor="text-orange-400"
        badgeBg="bg-orange-400/10"
        title={s.love.title}
        moreHref={s.love.moreHref}
        cards={s.love.cards}
      />

    </div>
  );
}

/*
  =====================================================================
  ↓↓↓ 심사 후 원복 예정 섹션들 ↓↓↓
  import { cardSections } from "@/config/content";
  const s = cardSections;
  <CategorySection layout={s.love.layout} badge={s.love.badge} ... cards={s.love.cards} />
  <CategorySection layout={s.baby.layout} ... />
  <CategorySection layout={s.compat.layout} ... />
  <CategorySection layout={s.career.layout} ... />
  <CategorySection layout={s.health.layout} ... />
  <CategorySection layout={s.marriage.layout} ... />
  <CategorySection layout={s.total.layout} ... />
  <CategorySection layout={s.wellbeing.layout} ... />
  =====================================================================
*/
