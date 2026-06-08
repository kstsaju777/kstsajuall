import { HeroCarousel } from "@/components/landing/HeroCarousel";
import { ShuffledCategorySection as CategorySection } from "@/components/landing/ShuffledCategorySection";
import { cardSections } from "@/config/content";

export default function HomePage() {
  const s = cardSections;
  return (
    <div className="pb-10">
      <HeroCarousel />

      <CategorySection
        layout={s.love.layout}
        badge={s.love.badge}
        badgeColor="text-orange-400"
        badgeBg="bg-orange-400/10"
        title={s.love.title}
        moreHref={s.love.moreHref}
        cards={s.love.cards}
      />

      <CategorySection
        layout={s.baby.layout}
        badge={s.baby.badge}
        badgeColor="text-orange-400"
        badgeBg="bg-orange-400/10"
        title={s.baby.title}
        moreHref={s.baby.moreHref}
        cards={s.baby.cards}
      />

      <CategorySection
        layout={s.compat.layout}
        badge={s.compat.badge}
        badgeColor="text-orange-400"
        badgeBg="bg-orange-400/10"
        title={s.compat.title}
        moreHref={s.compat.moreHref}
        cards={s.compat.cards}
      />

      <CategorySection
        layout={s.career.layout}
        badge={s.career.badge}
        badgeColor="text-orange-400"
        badgeBg="bg-orange-400/10"
        title={s.career.title}
        moreHref={s.career.moreHref}
        cards={s.career.cards}
      />

      <CategorySection
        layout={s.health.layout}
        badge={s.health.badge}
        badgeColor="text-orange-400"
        badgeBg="bg-orange-400/10"
        title={s.health.title}
        moreHref={s.health.moreHref}
        cards={s.health.cards}
      />

      <CategorySection
        layout={s.marriage.layout}
        badge={s.marriage.badge}
        badgeColor="text-orange-400"
        badgeBg="bg-orange-400/10"
        title={s.marriage.title}
        moreHref={s.marriage.moreHref}
        cards={s.marriage.cards}
      />

      <CategorySection
        layout={s.total.layout}
        badge={s.total.badge}
        badgeColor="text-orange-400"
        badgeBg="bg-orange-400/10"
        title={s.total.title}
        moreHref={s.total.moreHref}
        cards={s.total.cards}
      />
    </div>
  );
}
