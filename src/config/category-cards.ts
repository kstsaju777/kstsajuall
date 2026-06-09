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

export const CATEGORY_CARDS: Record<string, CategoryCard[]> = {

  무료: [
    { image: "/images/hero/hero-1.jpg",  badge: "무료", tag: "FREE", name: "정통사주 맛보기",   desc: "내 사주 4기둥과 오행 균형을 무료로 확인해보세요",         href: "/saju/jeongtong" },
    { image: "/images/hero/hero-2.jpg",  badge: "무료", tag: "FREE", name: "오늘의 일진",       desc: "하루의 기운을 사주로 읽는 일진 풀이",                    href: "/saju/daily" },
    { image: "/images/hero/hero-3.jpg",  badge: "무료", tag: "FREE", name: "사주 기본 감명",    desc: "사주 4기둥으로 보는 타고난 성향",                        href: "/saju/basic" },
    { image: "/images/hero/hero-9.jpg",  badge: "무료", tag: "FREE", name: "월간 운세",         desc: "이번 달 나의 운세 흐름 분석",                            href: "/saju/monthly" },
  ],

  재물: [
    { image: "/images/hero/hero-3.jpg",  badge: "재물", tag: "인기", name: "정통사주 재물운",   desc: "평생 재물운과 돈이 들어오는 시기를 분석합니다",           href: "/saju/jeongtong" },
    { image: "/images/hero/hero-4.jpg",  badge: "재물", tag: "NEW",  name: "자미두수 재물운",   desc: "동양 별자리로 보는 내 재물의 흐름과 재테크 타이밍",       href: "/saju/jamisusu" },
    { image: "/images/cards/total-1.jpg",badge: "재물", tag: "베스트",name: "종합 사주 감명",   desc: "대운·세운·직업운·재물운·건강운 정통 종합 풀이",           href: "/saju/total" },
    { image: "/images/cards/total-3.jpg",badge: "재물",              name: "신년 사주",         desc: "새해 한 해 전체 운세 종합 분석",                          href: "/saju/new-year" },
    { image: "/images/hero/hero-16.jpg", badge: "재물",              name: "자미두수 인생 흐름",desc: "12궁과 14주성으로 향후 10년의 기운 흐름을 분석합니다",    href: "/saju/jamisusu-life" },
  ],

  연애: [
    { image: "/images/hero/hero-12.jpg", badge: "연애", tag: "인기", name: "날 얼마나 좋아할까?",    desc: "동양의 별자리로 보는 궁합과 상대의 마음 크기",           href: "/saju/jamisusu-compat" },
    { image: "/images/cards/love-2.mp4", type: "video", badge: "연애", tag: "인기", name: "자미두수 연애운", desc: "동양의 별자리가 알려주는 나의 연애운과 솔로탈출 시기", href: "/saju/jamisusu-love" },
    { image: "/images/hero/hero-7.jpg",  badge: "연애", tag: "HOT",  name: "유혹사주",              desc: "쉿, 내게 숨겨진 색기와 이성을 홀리는 매력 알아보기",     href: "/saju/yuhok" },
    { image: "/images/hero/hero-5.webm", type: "video", badge: "연애", tag: "인기", name: "솔로지옥 연애사주", desc: "사주로 보는 나의 연애 매력과 운명의 인연 타이밍",  href: "/saju/solo-hell" },
    { image: "/images/hero/hero-15.jpg", badge: "연애",              name: "솔로탈출 연애사주",     desc: "언제 어떤 사람과 만날까? 외모부터 성격까지 알려드립니다",href: "/saju/love" },
    { image: "/images/cards/love2-1.jpg",badge: "연애", tag: "인기", name: "연애 궁합 분석",        desc: "사주로 보는 두 사람의 궁합 분석",                        href: "/saju/love-compat" },
    { image: "/images/cards/love2-2.jpg",badge: "연애", tag: "NEW",  name: "종합 궁합",             desc: "인연의 시기와 운명적 만남 분석",                         href: "/saju/total-compat" },
    { image: "/images/cards/love2-3.jpg",badge: "연애",              name: "띠 궁합",               desc: "띠로 보는 기본 궁합 풀이",                               href: "/saju/zodiac-compat" },
    { image: "/images/cards/love2-5.jpg",badge: "연애",              name: "인연 사주",             desc: "운명적 인연이 오는 시기 분석",                           href: "/saju/destiny" },
    { image: "/images/cards/love-7.jpg", badge: "연애", tag: "NEW",  name: "자미두수 갈등 궁합",    desc: "사주가 답 못하는 질문, 부처궁이 풀어드려요",              href: "/saju/jamisusu-conflict" },
  ],

  재회: [
    { image: "/images/cards/reunion-1.jpg", badge: "재회", tag: "추천", name: "재회 사주",      desc: "헤어진 그 사람과 다시 만날 수 있을까",        href: "/saju/reunion" },
    { image: "/images/cards/reunion-5.jpg", badge: "재회", tag: "인기", name: "연락 사주",      desc: "그 사람이 먼저 연락할 시기 분석",              href: "/saju/contact" },
    { image: "/images/cards/reunion-2.jpg", badge: "재회",              name: "재회 가능성",    desc: "상대의 속마음과 재회 타이밍 분석",             href: "/saju/reunion-chance" },
    { image: "/images/cards/reunion-3.jpg", badge: "재회", tag: "NEW",  name: "자미두수 재회",  desc: "동양 별자리로 보는 재회 가능성",               href: "/saju/jamisusu-reunion" },
    { image: "/images/hero/hero-10.jpg",    badge: "재회",              name: "베딕 재회",      desc: "인도 점성술로 보는 재회 시기와 확률",          href: "/saju/vedic-reunion" },
    { image: "/images/hero/hero-17.jpg",    badge: "재회",              name: "자미두수 재회",  desc: "동양의 별자리가 알려주는 너의 속마음과 재회가능성", href: "/saju/jamisusu-reunion" },
    { image: "/images/cards/reunion-6.jpg", badge: "재회",              name: "이별 원인 분석", desc: "이별의 진짜 원인과 회복 가능성",               href: "/saju/breakup" },
    { image: "/images/cards/reunion-7.jpg", badge: "재회", tag: "추천", name: "재결합 타이밍",  desc: "다시 시작하기 좋은 시기와 방법",               href: "/saju/reconcile" },
    { image: "/images/cards/reunion-8.jpg", badge: "재회",              name: "감정선 분석",    desc: "상대의 감정 흐름과 현재 마음 상태",            href: "/saju/emotion" },
  ],

  결혼: [
    { image: "/images/cards/marriage-1.jpg", badge: "결혼", tag: "추천", name: "배우자 사주",    desc: "내 운명의 상대 외모·성격·직업 분석",         href: "/saju/spouse" },
    { image: "/images/hero/hero-11.jpg",     badge: "결혼", tag: "NEW",  name: "자미두수 결혼운",desc: "별자리 속 운명의 상대, 나의 배우자의 모습과 결혼운 시기", href: "/saju/jamisusu-marriage" },
    { image: "/images/cards/marriage-2.jpg", badge: "결혼", tag: "NEW",  name: "결혼 시기",      desc: "결혼 적령기와 만남의 시기 분석",             href: "/saju/marriage-timing" },
    { image: "/images/cards/marriage-3.jpg", badge: "결혼",              name: "결혼 궁합",      desc: "두 사람의 결혼 후 운세 흐름 분석",           href: "/saju/marriage-compat" },
    { image: "/images/cards/marriage-4.jpg", badge: "결혼", tag: "인기", name: "혼인 택일",      desc: "결혼식 날짜를 사주로 정하는 혼인 택일",      href: "/saju/wedding-date" },
    { image: "/images/cards/compat2-5.jpg",  badge: "결혼",              name: "비즈니스 궁합",  desc: "동업·사업 파트너 궁합 분석",                  href: "/saju/biz-compat" },
    { image: "/images/cards/love2-4.jpg",    badge: "결혼", tag: "추천", name: "부부 궁합",      desc: "결혼 후 부부 사이의 운세 흐름",               href: "/saju/couple-compat" },
  ],

  자녀: [
    { image: "/images/hero/hero-8.jpg",   badge: "자녀", tag: "인기", name: "우리 아이 사주",  desc: "우리 아이는 영재일까? 자녀의 천재성과 재능을 분석합니다", href: "/saju/child" },
    { image: "/images/hero/hero-9.jpg",   badge: "자녀", tag: "추천", name: "영재 사주",       desc: "타고난 영재성·재능분야·맞춤 양육법까지 정통 사주로 풀어드립니다", href: "/saju/gifted" },
    { image: "/images/hero/hero-13.jpg",  badge: "자녀",              name: "임신 사주",       desc: "임신날짜, 아이 성별, 총 자녀수를 점지해드립니다",         href: "/saju/pregnancy" },
    { image: "/images/hero/hero-14.jpg",  badge: "자녀", tag: "NEW",  name: "천운 임신사주",   desc: "임신 길일, 합궁 택일, 태아 기운까지 50년 전통 명리학으로 풀어드립니다", href: "/saju/premium-pregnancy" },
    { image: "/images/cards/baby-4.jpg",  badge: "자녀",              name: "태명 작명",       desc: "사주에 맞는 좋은 태명과 이름 짓기",                       href: "/saju/naming" },
    { image: "/images/cards/baby-6.jpg",  badge: "자녀", tag: "추천", name: "합궁 택일",       desc: "임신 길일과 합궁 택일 분석",                              href: "/saju/hapgung" },
    { image: "/images/cards/love-4.mp4",  type: "video", badge: "자녀", tag: "NEW", name: "자미두수 임신운", desc: "동양의 별자리가 알려주는 임신 시기와 아이 성별", href: "/saju/jamisusu-baby" },
  ],

  기타: [
    { image: "/images/cards/total-1.jpg",  badge: "종합", tag: "베스트", name: "종합 사주 감명",  desc: "대운·세운·직업운·재물운·건강운 정통 종합 풀이",   href: "/saju/total" },
    { image: "/images/cards/health-1.jpg", badge: "건강", tag: "추천",   name: "건강 사주",       desc: "타고난 체질과 건강 주의 시기 분석",               href: "/saju/health" },
    { image: "/images/cards/health-2.jpg", badge: "건강", tag: "NEW",    name: "체질 분석",       desc: "사주 오행으로 보는 나의 체질과 건강 관리",         href: "/saju/constitution" },
    { image: "/images/cards/health-3.jpg", badge: "건강",                name: "수명·건강운",     desc: "건강 주의 시기와 예방 포인트",                    href: "/saju/longevity" },
    { image: "/images/hero/hero-10.jpg",   badge: "베딕",                name: "인도 베딕 점성술",desc: "다샤 주기와 7하우스 분석으로 재회의 시기와 가능성을 예측합니다", href: "/saju/vedic" },
    { image: "/images/cards/total-3.jpg",  badge: "종합", tag: "NEW",    name: "신년 사주",       desc: "새해 한 해 전체 운세 종합 분석",                  href: "/saju/new-year" },
    { image: "/images/cards/total-5.jpg",  badge: "종합",                name: "월간 운세",       desc: "이번 달 나의 운세 흐름 분석",                     href: "/saju/monthly" },
  ],
};

// 전체 = 모든 카테고리 카드 합치기 (중복 href 제거)
const _all = Object.values(CATEGORY_CARDS).flat();
const _seen = new Set<string>();
CATEGORY_CARDS["전체"] = _all.filter((c) => {
  if (_seen.has(c.href + c.name)) return false;
  _seen.add(c.href + c.name);
  return true;
});
