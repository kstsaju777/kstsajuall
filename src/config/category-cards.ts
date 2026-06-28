/**
 * 탭 카테고리별 카드 목록
 * href → 각 상세페이지 라우트
 */

export type CategoryCard = {
  image: string;
  type?: "video";
  badge: string;
  tag?: string;
  name: string;
  desc: string;
  href: string;
};

export type FreeSection = {
  title: string;
  subtitle: string;
  cards: CategoryCard[];
  hasMore?: boolean;
};

export const FREE_SECTIONS: FreeSection[] = [
  {
    title: "나를 알고 싶을 때",
    subtitle: "내 타고난 기질과 운명을 무료로 먼저 확인해보세요 🔮",
    cards: [
      { image: "/media/hero/hero-1.jpg", badge: "무료", tag: "FREE", name: "정통사주 맛보기", desc: "내 사주 4기둥과 오행 균형을 무료로 확인해보세요", href: "/saju/jeongtong" },
      { image: "/media/cards/saju_total/total-1.jpg", badge: "무료", tag: "FREE", name: "사주 기초 풀이", desc: "나는 어떤 사람일까? 기본 기질부터 확인해보세요", href: "/saju/jeongtong" },
      { image: "/media/hero/hero-3.jpg", badge: "무료", tag: "FREE", name: "오행 균형 분석", desc: "내 에너지의 강약을 한눈에 파악해보세요", href: "/saju/jeongtong" },
      { image: "/media/hero/hero-7.jpg", badge: "무료", tag: "FREE", name: "일주 성격 풀이", desc: "일주로 보는 내 숨겨진 성격과 매력", href: "/saju/jeongtong" },
    ],
    hasMore: true,
  },
  {
    title: "운세/점괘",
    subtitle: "이번 해 운세부터, 작명/개명, 점괘까지 운세를 봐드려요 🔥",
    cards: [
      { image: "/media/hero/hero-2.jpg", badge: "무료", tag: "FREE", name: "길흉화복 사주", desc: "앞으로 3년, 좋은 달과 조심할 달을 한눈에", href: "/saju/jeongtong" },
      { image: "/media/hero/hero-4.jpg", badge: "무료", tag: "FREE", name: "해외 이민 사주", desc: "내가 살아야 하는 곳은 따로 정해져 있어요", href: "/saju/jeongtong" },
      { image: "/media/hero/hero-5.jpg", badge: "무료", tag: "FREE", name: "전환점 사주", desc: "내 인생 전환점은 언제 올까", href: "/saju/jeongtong" },
      { image: "/media/hero/hero-6.jpg", badge: "무료", tag: "FREE", name: "꿈 해몽", desc: "어젯밤 그 꿈, 인생을 바꿀 겁니다", href: "/saju/jeongtong" },
    ],
    hasMore: true,
  },
  {
    title: "연애/재회",
    subtitle: "썸, 속마음, 커플궁합, 재회 타이밍까지 관계 흐름을 분석해요 ❤️",
    cards: [
      { image: "/media/cards/saju_total/total-2.jpg", badge: "무료", tag: "FREE", name: "재회vs환승 사주", desc: "X와 새로운 인연, 누구를 선택할까", href: "/saju/jeongtong" },
      { image: "/media/hero/hero-3.jpg", badge: "무료", tag: "FREE", name: "속마음 사주", desc: "그 사람, 나에 대해 어떻게 생각할까", href: "/saju/jeongtong" },
      { image: "/media/hero/hero-7.jpg", badge: "무료", tag: "FREE", name: "썸 타이밍 사주", desc: "지금 고백해도 될까? 최적의 타이밍 분석", href: "/saju/jeongtong" },
      { image: "/media/hero/hero-1.jpg", badge: "무료", tag: "FREE", name: "커플 궁합", desc: "우리 둘, 오래 갈 수 있을까요?", href: "/saju/jeongtong" },
    ],
    hasMore: true,
  },
  {
    title: "돈/재테크",
    subtitle: "내 사주 맞춤 재테크 방향을 찾아 드립니다 📈",
    cards: [
      { image: "/media/cards/saju_total/total-1.jpg", badge: "무료", tag: "FREE", name: "풍수지리 사주", desc: "이사가는 곳이 터가 맞을까? 이사 시기는?", href: "/saju/jeongtong" },
      { image: "/media/hero/hero-5.jpg", badge: "무료", tag: "FREE", name: "귀인 사주", desc: "내 인생을 바꿀 운명의 귀인은 누구일까?", href: "/saju/jeongtong" },
      { image: "/media/hero/hero-4.jpg", badge: "무료", tag: "FREE", name: "재물 흐름 사주", desc: "돈이 들어오고 나가는 시기를 미리 알아보세요", href: "/saju/jeongtong" },
      { image: "/media/hero/hero-6.jpg", badge: "무료", tag: "FREE", name: "사업 궁합 사주", desc: "이 파트너와 함께하면 성공할 수 있을까?", href: "/saju/jeongtong" },
    ],
    hasMore: true,
  },
];

export const CATEGORY_CARDS: Record<string, CategoryCard[]> = {

  무료: [
    { image: "/media/hero/hero-1.jpg",  badge: "무료", tag: "FREE", name: "정통사주 맛보기",   desc: "내 사주 4기둥과 오행 균형을 무료로 확인해보세요",         href: "/saju/jeongtong" },
  ],

  재물: [
    { image: "/media/cards/saju_jaemul/jaemul-0.jpg", badge: "재물", tag: "인기", name: "재물사주", desc: "평생 재물운과 돈이 들어오는 시기를 분석합니다", href: "/saju/saju_jaemul" },
    { image: "/media/cards/kunghap_business/business-0.jpg", badge: "궁합", tag: "비즈니스", name: "비즈니스 궁합", desc: "사업 파트너와의 궁합 분석", href: "/saju/kunghap_business" },
  ],

  연애: [
    { image: "/media/hero/hero-7.jpg",  badge: "연애", tag: "HOT",  name: "유혹사주",              desc: "쉿, 내게 숨겨진 색기와 이성을 홀리는 매력 알아보기",     href: "/saju/jeongtong" },
  ],

  재회: [
    { image: "/media/cards/reunion/reunion-1.jpg", badge: "재회", tag: "추천", name: "재회 사주",      desc: "헤어진 그 사람과 다시 만날 수 있을까",        href: "/saju/jeongtong" },
  ],

  결혼: [
    { image: "/media/cards/marriage/marriage-1.jpg", badge: "결혼", tag: "추천", name: "배우자 사주",    desc: "내 운명의 상대 외모·성격·직업 분석",         href: "/saju/jeongtong" },
  ],

  자녀: [
    { image: "/media/hero/hero-8.jpg",   badge: "자녀", tag: "인기", name: "우리 아이 사주",  desc: "우리 아이는 영재일까? 자녀의 천재성과 재능을 분석합니다", href: "/saju/jeongtong" },
  ],

  기타: [
    { image: "/media/cards/saju_total/total-1.jpg",  badge: "종합", tag: "베스트", name: "종합 사주 감명",  desc: "대운·세운·직업운·재물운·건강운 정통 종합 풀이",   href: "/saju/jeongtong" },
  ],

  /*
  =====================================================================
  ↓↓↓ 심사 후 원복 예정 카드들 ↓↓↓
  =====================================================================

  무료_전체: [
    { image: "/media/hero/hero-2.jpg",  badge: "무료", tag: "FREE", name: "오늘의 일진",       desc: "하루의 기운을 사주로 읽는 일진 풀이",                    href: "/saju/daily" },
    { image: "/media/hero/hero-3.jpg",  badge: "무료", tag: "FREE", name: "사주 기본 감명",    desc: "사주 4기둥으로 보는 타고난 성향",                        href: "/saju/basic" },
    { image: "/media/hero/hero-9.jpg",  badge: "무료", tag: "FREE", name: "월간 운세",         desc: "이번 달 나의 운세 흐름 분석",                            href: "/saju/monthly" },
  ],

  재물_전체: [
    { image: "/media/hero/hero-4.jpg",  badge: "재물", tag: "NEW",  name: "자미두수 재물운",   desc: "동양 별자리로 보는 내 재물의 흐름과 재테크 타이밍",       href: "/saju/jamisusu" },
    { image: "/media/cards/saju_total/total-1.jpg",badge: "재물", tag: "베스트",name: "종합 사주 감명",   desc: "대운·세운·직업운·재물운·건강운 정통 종합 풀이",           href: "/saju/total" },
    { image: "/media/cards/saju_total/total-3.jpg",badge: "재물",              name: "신년 사주",         desc: "새해 한 해 전체 운세 종합 분석",                          href: "/saju/new-year" },
    { image: "/media/hero/hero-16.jpg", badge: "재물",              name: "자미두수 인생 흐름",desc: "12궁과 14주성으로 향후 10년의 기운 흐름을 분석합니다",    href: "/saju/jamisusu-life" },
  ],

  연애_전체: [
    { image: "/media/hero/hero-12.jpg", badge: "연애", tag: "인기", name: "날 얼마나 좋아할까?",    desc: "동양의 별자리로 보는 궁합과 상대의 마음 크기",           href: "/saju/jamisusu-compat" },
    { image: "/media/cards/love/love-2.mp4", type: "video", badge: "연애", tag: "인기", name: "자미두수 연애운", desc: "동양의 별자리가 알려주는 나의 연애운과 솔로탈출 시기", href: "/saju/jamisusu-love" },
    { image: "/media/hero/hero-5.mp4", type: "video", badge: "연애", tag: "인기", name: "솔로지옥 연애사주", desc: "사주로 보는 나의 연애 매력과 운명의 인연 타이밍",  href: "/saju/solo-hell" },
    { image: "/media/hero/hero-15.jpg", badge: "연애",              name: "솔로탈출 연애사주",     desc: "언제 어떤 사람과 만날까? 외모부터 성격까지 알려드립니다",href: "/saju/love" },
    { image: "/media/cards/love2/love2-1.jpg",badge: "연애", tag: "인기", name: "연애 궁합 분석",        desc: "사주로 보는 두 사람의 궁합 분석",                        href: "/saju/love-compat" },
    { image: "/media/cards/love2/love2-2.jpg",badge: "연애", tag: "NEW",  name: "종합 궁합",             desc: "인연의 시기와 운명적 만남 분석",                         href: "/saju/total-compat" },
    { image: "/media/cards/love2/love2-3.jpg",badge: "연애",              name: "띠 궁합",               desc: "띠로 보는 기본 궁합 풀이",                               href: "/saju/zodiac-compat" },
    { image: "/media/cards/love2/love2-5.jpg",badge: "연애",              name: "인연 사주",             desc: "운명적 인연이 오는 시기 분석",                           href: "/saju/destiny" },
    { image: "/media/cards/love/love-7.jpg", badge: "연애", tag: "NEW",  name: "자미두수 갈등 궁합",    desc: "사주가 답 못하는 질문, 부처궁이 풀어드려요",              href: "/saju/jamisusu-conflict" },
  ],

  재회_전체: [
    { image: "/media/cards/reunion/reunion-5.jpg", badge: "재회", tag: "인기", name: "연락 사주",      desc: "그 사람이 먼저 연락할 시기 분석",              href: "/saju/contact" },
    { image: "/media/cards/reunion/reunion-2.jpg", badge: "재회",              name: "재회 가능성",    desc: "상대의 속마음과 재회 타이밍 분석",             href: "/saju/reunion-chance" },
    { image: "/media/cards/reunion/reunion-3.jpg", badge: "재회", tag: "NEW",  name: "자미두수 재회",  desc: "동양 별자리로 보는 재회 가능성",               href: "/saju/jamisusu-reunion" },
    { image: "/media/hero/hero-10.jpg",    badge: "재회",              name: "베딕 재회",      desc: "인도 점성술로 보는 재회 시기와 확률",          href: "/saju/vedic-reunion" },
    { image: "/media/hero/hero-17.jpg",    badge: "재회",              name: "자미두수 재회",  desc: "동양의 별자리가 알려주는 너의 속마음과 재회가능성", href: "/saju/jamisusu-reunion" },
    { image: "/media/cards/reunion/reunion-6.jpg", badge: "재회",              name: "이별 원인 분석", desc: "이별의 진짜 원인과 회복 가능성",               href: "/saju/breakup" },
    { image: "/media/cards/reunion/reunion-7.jpg", badge: "재회", tag: "추천", name: "재결합 타이밍",  desc: "다시 시작하기 좋은 시기와 방법",               href: "/saju/reconcile" },
    { image: "/media/cards/reunion/reunion-8.jpg", badge: "재회",              name: "감정선 분석",    desc: "상대의 감정 흐름과 현재 마음 상태",            href: "/saju/emotion" },
  ],

  결혼_전체: [
    { image: "/media/hero/hero-11.jpg",     badge: "결혼", tag: "NEW",  name: "자미두수 결혼운",desc: "별자리 속 운명의 상대, 나의 배우자의 모습과 결혼운 시기", href: "/saju/jamisusu-marriage" },
    { image: "/media/cards/marriage/marriage-2.jpg", badge: "결혼", tag: "NEW",  name: "결혼 시기",      desc: "결혼 적령기와 만남의 시기 분석",             href: "/saju/marriage-timing" },
    { image: "/media/cards/marriage/marriage-3.jpg", badge: "결혼",              name: "결혼 궁합",      desc: "두 사람의 결혼 후 운세 흐름 분석",           href: "/saju/marriage-compat" },
    { image: "/media/cards/marriage/marriage-4.jpg", badge: "결혼", tag: "인기", name: "혼인 택일",      desc: "결혼식 날짜를 사주로 정하는 혼인 택일",      href: "/saju/wedding-date" },
    { image: "/media/cards/compat2/compat2-5.jpg",  badge: "결혼",              name: "비즈니스 궁합",  desc: "동업·사업 파트너 궁합 분석",                  href: "/saju/biz-compat" },
    { image: "/media/cards/love2/love2-4.jpg",    badge: "결혼", tag: "추천", name: "부부 궁합",      desc: "결혼 후 부부 사이의 운세 흐름",               href: "/saju/couple-compat" },
  ],

  자녀_전체: [
    { image: "/media/hero/hero-9.jpg",   badge: "자녀", tag: "추천", name: "영재 사주",       desc: "타고난 영재성·재능분야·맞춤 양육법까지 정통 사주로 풀어드립니다", href: "/saju/gifted" },
    { image: "/media/hero/hero-13.jpg",  badge: "자녀",              name: "임신 사주",       desc: "임신날짜, 아이 성별, 총 자녀수를 점지해드립니다",         href: "/saju/pregnancy" },
    { image: "/media/hero/hero-14.jpg",  badge: "자녀", tag: "NEW",  name: "천운 임신사주",   desc: "임신 길일, 합궁 택일, 태아 기운까지 50년 전통 명리학으로 풀어드립니다", href: "/saju/premium-pregnancy" },
    { image: "/media/cards/baby/baby-4.jpg",  badge: "자녀",              name: "태명 작명",       desc: "사주에 맞는 좋은 태명과 이름 짓기",                       href: "/saju/naming" },
    { image: "/media/cards/baby/baby-6.jpg",  badge: "자녀", tag: "추천", name: "합궁 택일",       desc: "임신 길일과 합궁 택일 분석",                              href: "/saju/hapgung" },
    { image: "/media/cards/love/love-4.mp4",  type: "video", badge: "자녀", tag: "NEW", name: "자미두수 임신운", desc: "동양의 별자리가 알려주는 임신 시기와 아이 성별", href: "/saju/jamisusu-baby" },
  ],

  기타_전체: [
    { image: "/media/cards/health/health-1.jpg", badge: "건강", tag: "추천",   name: "건강 사주",       desc: "타고난 체질과 건강 주의 시기 분석",               href: "/saju/health" },
    { image: "/media/cards/health/health-2.jpg", badge: "건강", tag: "NEW",    name: "체질 분석",       desc: "사주 오행으로 보는 나의 체질과 건강 관리",         href: "/saju/constitution" },
    { image: "/media/cards/health/health-3.jpg", badge: "건강",                name: "수명·건강운",     desc: "건강 주의 시기와 예방 포인트",                    href: "/saju/longevity" },
    { image: "/media/hero/hero-10.jpg",   badge: "베딕",                name: "인도 베딕 점성술",desc: "다샤 주기와 7하우스 분석으로 재회의 시기와 가능성을 예측합니다", href: "/saju/vedic" },
    { image: "/media/cards/saju_total/total-3.jpg",  badge: "종합", tag: "NEW",    name: "신년 사주",       desc: "새해 한 해 전체 운세 종합 분석",                  href: "/saju/new-year" },
    { image: "/media/cards/saju_total/total-5.jpg",  badge: "종합",                name: "월간 운세",       desc: "이번 달 나의 운세 흐름 분석",                     href: "/saju/monthly" },
  ],
  */
};

// 전체 = 모든 카테고리 카드 합치기 (중복 href 제거)
const _all = Object.values(CATEGORY_CARDS).flat();
const _seen = new Set<string>();
CATEGORY_CARDS["전체"] = _all.filter((c) => {
  if (_seen.has(c.href + c.name)) return false;
  _seen.add(c.href + c.name);
  return true;
});

