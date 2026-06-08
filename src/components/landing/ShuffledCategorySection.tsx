"use client";

import { useEffect, useState } from "react";
import { CategorySection } from "./CategorySection";
import { CardData } from "./ProductCard";

type LayoutType = "large" | "medium" | "tall";

interface Props {
  badge: string;
  badgeColor?: string;
  badgeBg?: string;
  title: string;
  moreHref?: string;
  cards: CardData[];
  layout?: LayoutType;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function ShuffledCategorySection({ cards, ...rest }: Props) {
  const [shuffled, setShuffled] = useState<CardData[] | null>(null);

  useEffect(() => {
    setShuffled(shuffle(cards));
  }, []);

  if (!shuffled) return null;

  return <CategorySection {...rest} cards={shuffled} />;
}
