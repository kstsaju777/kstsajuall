/**
 * ╔══════════════════════════════════════════════════════╗
 * ║           홍빈관 — 콘텐츠 관리 파일                  ║
 * ║  이미지·텍스트 수정은 이 파일 하나에서 모두 하세요   ║
 * ╚══════════════════════════════════════════════════════╝
 *
 * 📁 이미지 위치
 *   히어로  → public/images/hero/hero-1.jpg ~ hero-11.jpg
 *   카드    → public/images/cards/love-1.jpg 등 (아래 경로 참고)
 *
 * 💡 이미지 교체 방법
 *   1. public/images/... 폴더에 파일 붙여넣기
 *   2. 파일명을 아래 image: "..." 경로와 동일하게 맞추기
 *   3. 저장하면 자동 반영 (서버 재시작 불필요)
 */

// ─────────────────────────────────────────
// 히어로 캐러셀 (11장)
// ─────────────────────────────────────────
export type HeroSlide = {
  image: string;
  type?: "image" | "video"; // 기본값 "image"
  badge: string;
  title: string;
  desc: string;
  href: string;
};

export const heroSlides: HeroSlide[] = [
  {
    image: "/images/hero/hero-1.jpg",
    badge: "정통사주",
    title: "내 인생 전반을\n정통사주로",
    desc: "프리미엄 명리학 기반 내 인생 전반 알아보기",
    href: "/products",
  },
  {
    image: "/images/hero/hero-2.jpg",
    badge: "인생사주",
    title: "내 인생의\n흐름을 한눈에",
    desc: "연애, 재물, 직업, 건강까지 인생 전반을 정통 사주로 풀어드립니다",
    href: "/products?category=연애",
  },
  {
    image: "/images/hero/hero-3.jpg",
    badge: "정통사주",
    title: "프리미엄\n정통사주",
    desc: "평생 운명 심층 분석 : 연애, 결혼, 재물, 직장, 건강 총망라",
    href: "/products?category=재물",
  },
  {
    image: "/images/hero/hero-4.jpg",
    badge: "자미두수",
    title: "프리미엄\n자미두수",
    desc: "명반 속 12개 별자리로 읽는 100년 인생 흐름",
    href: "/products?category=궁합",
  },
  {
    image: "/images/hero/hero-5.webm",
    type: "video",
    badge: "솔로지옥",
    title: "솔로지옥\n연애사주",
    desc: "사주로 보는 나의 연애 매력과 운명의 인연 타이밍",
    href: "/products?category=직업",
  },
  {
    image: "/images/hero/hero-6.jpg",
    badge: "자미두수 갈등 궁합",
    title: "우리 갈등의\n진짜 이유는?",
    desc: "별자리로 분석하는 갈등 포인트와 사랑을 막는 방해 별",
    href: "/products?category=건강",
  },
  {
    image: "/images/hero/hero-7.jpg",
    badge: "유혹사주",
    title: "유혹사주",
    desc: "쉿, 내게 숨겨진 색기와 이성을 홀리는 매력 알아보기",
    href: "/products?category=자미두수",
  },
  {
    image: "/images/hero/hero-8.jpg",
    badge: "우리 아이 사주",
    title: "우리 아이의\n숨겨진 천재성",
    desc: "우리 아이는 영재일까? 자녀의 천재성과 재능을 분석합니다",
    href: "/products?category=타로",
  },
  {
    image: "/images/hero/hero-9.jpg",
    badge: "영재 사주",
    title: "우리 아이는\n어떤 영재일까",
    desc: "타고난 영재성·재능분야·맞춤 양육법까지 정통 사주로 풀어드립니다",
    href: "/products?category=작명",
  },
  {
    image: "/images/hero/hero-10.jpg",
    badge: "베딕 점성술",
    title: "인도 베딕\n재회 점성술",
    desc: "다샤 주기와 7하우스 분석으로 재회의 시기와 가능성을 예측합니다",
    href: "/products?category=오늘운세",
  },
  {
    image: "/images/hero/hero-11.jpg",
    badge: "자미두수 결혼",
    title: "별자리 속\n나의 결혼운",
    desc: "별자리 속 운명의 상대, 나의 배우자의 모습과 결혼운 시기",
    href: "/products?category=종합",
  },
  {
    image: "/images/hero/hero-12.jpg",
    badge: "자미두수 궁합",
    title: "날 얼마나\n좋아할까?",
    desc: "동양의 별자리로 보는 궁합과 상대의 마음 크기",
    href: "/products?category=신년운세",
  },
  {
    image: "/images/hero/hero-13.jpg",
    badge: "임신 사주",
    title: "올해 난 정말\n임실할 수 있을까?",
    desc: "임신날짜, 아이 성별, 총 자녀수를 점지해드립니다",
    href: "/products?category=월간운세",
  },
  {
    image: "/images/hero/hero-14.jpg",
    badge: "천운 임신사주",
    title: "사주가 점지하는\n임신 길일",
    desc: "임신 길일, 합궁 택일, 태아 기운까지 50년 전통 명리학으로 풀어드립니다",
    href: "/products?category=작명",
  },
  {
    image: "/images/hero/hero-15.jpg",
    badge: "연애사주",
    title: "솔로탈출\n연애사주",
    desc: "언제 어떤 사람과 만날까? 외모부터 성격까지 알려드립니다",
    href: "/products?category=꿈해몽",
  },
  {
    image: "/images/hero/hero-16.jpg",
    badge: "자미두수",
    title: "별자리로 보는\n나의 인생 흐름",
    desc: "12궁과 14주성으로 향후 10년의 기운 흐름을 분석합니다",
    href: "/products?category=띠운세",
  },
  {
    image: "/images/hero/hero-17.jpg",
    badge: "자미두수 재회",
    title: "우리 다시\n만날 수 있을까",
    desc: "동양의 별자리가 알려주는 너의 속마음과 재회가능성",
    href: "/products?category=육친",
  },
];

// ─────────────────────────────────────────
// 카드 섹션
// ─────────────────────────────────────────

export const cardSections = {

  /** 연애 섹션 — layout: "large" (2장씩 크게) */
  love: {
    badge: "자미두수",
    title: "요즘 SNS에서 난리난 동양 점성술",
    moreHref: "/products?category=연애",
    layout: "large" as const,
    cards: [
      { image: "/images/cards/love-1.jpg", badge: "연애", tag: "NEW",  name: "연애·합궁 분석", desc: "내 연애 기운과 잘 맞는 사람의 사주 궁합 분석", href: "/products" },
      { image: "/images/cards/love-2.mp4", type: "video" as const, badge: "연애", tag: "인기", name: "궁합 리포트",    desc: "두 사람의 사주로 보는 심층 궁합 분석",         href: "/products" },
      { image: "/images/cards/love-3.mp4", type: "video" as const, badge: "연애",              name: "연애운 풀이",    desc: "올해 나의 연애운 흐름 분석",                   href: "/products" },
      { image: "/images/cards/love-4.mp4", type: "video" as const, badge: "연애", tag: "추천", name: "인연 사주",      desc: "운명적 인연이 오는 시기 분석",                 href: "/products" },
      { image: "/images/cards/love-5.jpg", badge: "연애",              name: "결혼운 분석",    desc: "결혼 적령기와 배우자 사주 분석",               href: "/products" },
    ],
  },

  /** 재물 섹션 — layout: "medium" (3장씩 촘촘히) */
  money: {
    badge: "재물",
    title: "재물운이 터지는 날은?",
    moreHref: "/products?category=재물",
    layout: "medium" as const,
    cards: [
      { image: "/images/cards/money-1.jpg", badge: "재물", tag: "추천", name: "재물운 분석",    desc: "언제 돈이 들어오는지 사주로 확인하세요",   href: "/products" },
      { image: "/images/cards/money-2.jpg", badge: "재물",              name: "종합 사주 감명", desc: "대운·세운·재물운 종합 풀이",               href: "/products" },
      { image: "/images/cards/money-3.jpg", badge: "재물", tag: "NEW",  name: "사업운 분석",    desc: "사업 시작 적기와 재물 흐름 분석",           href: "/products" },
      { image: "/images/cards/money-4.jpg", badge: "재물",              name: "투자운 풀이",    desc: "재테크·투자 운세 집중 분석",               href: "/products" },
      { image: "/images/cards/money-5.jpg", badge: "재물", tag: "인기", name: "부동산운",       desc: "부동산 매매·이사 길한 시기 분석",           href: "/products" },
    ],
  },

  /** 궁합 섹션 — layout: "tall" (2장씩 더 길게) */
  compat: {
    badge: "궁합",
    title: "우리 얼마나 잘 맞을까",
    moreHref: "/products?category=궁합",
    layout: "tall" as const,
    cards: [
      { image: "/images/cards/compat-1.jpg", badge: "궁합", tag: "인기", name: "연애 궁합 분석", desc: "사주로 보는 두 사람의 궁합 분석",         href: "/products" },
      { image: "/images/cards/compat-2.jpg", badge: "궁합", tag: "NEW",  name: "종합 궁합",      desc: "인연의 시기와 운명적 만남 분석",           href: "/products" },
      { image: "/images/cards/compat-3.jpg", badge: "궁합",              name: "띠 궁합",        desc: "띠로 보는 기본 궁합 풀이",                 href: "/products" },
      { image: "/images/cards/compat-4.jpg", badge: "궁합", tag: "추천", name: "부부 궁합",      desc: "결혼 후 부부 사이의 운세 흐름",             href: "/products" },
      { image: "/images/cards/compat-5.jpg", badge: "궁합",              name: "비즈니스 궁합",  desc: "동업·사업 파트너 궁합 분석",               href: "/products" },
    ],
  },

  /** 직업 섹션 — layout: "medium" (3장씩 촘촘히) */
  career: {
    badge: "직업",
    title: "내 직업운과 적성은?",
    moreHref: "/products?category=직업",
    layout: "medium" as const,
    cards: [
      { image: "/images/cards/career-1.jpg", badge: "직업", tag: "추천", name: "사주 기본 감명", desc: "타고난 성향과 직업 적성 분석",           href: "/products" },
      { image: "/images/cards/career-2.jpg", badge: "직업",              name: "종합 사주 감명", desc: "직업운·재물운 포함 종합 사주 풀이",       href: "/products" },
      { image: "/images/cards/career-3.jpg", badge: "직업", tag: "NEW",  name: "취업·이직운",   desc: "올해 취업과 이직 운세 집중 분석",         href: "/products" },
      { image: "/images/cards/career-4.jpg", badge: "직업",              name: "승진운 분석",   desc: "승진·인사 길한 시기와 흐름",             href: "/products" },
      { image: "/images/cards/career-5.jpg", badge: "직업", tag: "인기", name: "적성 분석",     desc: "나에게 맞는 직업군과 적성 탐색",         href: "/products" },
    ],
  },

  /** 건강 섹션 — layout: "large" (2장씩 크게) */
  health: {
    badge: "건강",
    title: "건강하게 오래 살려면?",
    moreHref: "/products?category=건강",
    layout: "large" as const,
    cards: [
      { image: "/images/cards/health-1.jpg", badge: "건강", tag: "NEW",  name: "종합 사주 감명", desc: "건강운 포함 대운·세운 종합 풀이",         href: "/products" },
      { image: "/images/cards/health-2.jpg", badge: "건강",              name: "사주 기본 감명", desc: "타고난 체질과 건강 흐름 분석",           href: "/products" },
      { image: "/images/cards/health-3.jpg", badge: "건강", tag: "추천", name: "체질 분석",     desc: "사주로 보는 오행 체질과 건강 관리",       href: "/products" },
      { image: "/images/cards/health-4.jpg", badge: "건강",              name: "수명·건강운",   desc: "건강 주의 시기와 예방 포인트",           href: "/products" },
      { image: "/images/cards/health-5.jpg", badge: "건강", tag: "인기", name: "오늘의 건강운", desc: "오늘 내 건강 기운은 어떤가요",           href: "/products" },
    ],
  },

  /** 종합 섹션 — layout: "tall" (2장씩 가장 길게) */
  total: {
    badge: "종합",
    title: "내 사주 속 숨은 이야기",
    moreHref: "/products?category=종합",
    layout: "tall" as const,
    cards: [
      { image: "/images/cards/total-1.jpg", badge: "종합", tag: "베스트", name: "종합 사주 감명", desc: "대운·세운·직업운·재물운·건강운 정통 종합 풀이", href: "/products" },
      { image: "/images/cards/total-2.jpg", badge: "종합",               name: "오늘의 일진",   desc: "하루의 기운을 사주로 읽는 일진 풀이",         href: "/products" },
      { image: "/images/cards/total-3.jpg", badge: "종합", tag: "NEW",   name: "신년 사주",     desc: "새해 한 해 전체 운세 종합 분석",               href: "/products" },
      { image: "/images/cards/total-4.jpg", badge: "종합", tag: "인기",  name: "사주 기본 감명", desc: "사주 4기둥으로 보는 타고난 성향",             href: "/products" },
      { image: "/images/cards/total-5.jpg", badge: "종합",               name: "월간 운세",     desc: "이번 달 나의 운세 흐름 분석",                 href: "/products" },
    ],
  },
};
