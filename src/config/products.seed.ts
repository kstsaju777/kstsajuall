// =====================================================
// 상품 시드 (scripts/seed-products.ts 에서 사용)
// =====================================================
// 가격대만 다른 단순 라인업. 수강생은 자유롭게 추가/수정 후
// pnpm seed:products 로 DB에 반영합니다.

export type ProductSeed = {
  slug: string;
  name: string;
  description: string;
  price: number;
  display_order: number;
  is_active: boolean;
};

export const productsSeed: ProductSeed[] = [
  {
    slug: "today-fortune",
    name: "오늘의 일진",
    description: "하루의 기운을 사주로 읽는 일진 풀이",
    price: 4900,
    display_order: 10,
    is_active: true,
  },
  {
    slug: "basic-saju",
    name: "사주 기본 감명",
    description: "사주 4기둥으로 보는 타고난 성향과 운의 흐름",
    price: 9900,
    display_order: 20,
    is_active: true,
  },
  {
    slug: "love-saju",
    name: "연애·합궁 분석",
    description: "내 연애 기운과 잘 맞는 사람의 사주 궁합 분석",
    price: 19900,
    display_order: 30,
    is_active: true,
  },
  {
    slug: "premium-saju",
    name: "종합 사주 감명",
    description: "대운·세운·직업운·재물운·건강운 정통 종합 풀이",
    price: 29900,
    display_order: 40,
    is_active: true,
  },
];
