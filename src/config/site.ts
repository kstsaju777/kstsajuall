// =====================================================
// 사이트 메타 / 사업자 정보
// =====================================================
// 운영 전 본인 정보로 반드시 교체하세요. 아래는 모두 더미 데이터입니다.

export const siteConfig = {
  name: "홍빈관",
  tagline: "정통 명리학의 깊이, 지금 당신의 사주",
  description: "사주 팔자의 정통 해석과 AI 분석이 만납니다. 운현각에서 나의 운명을 읽어보세요.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "support@example.com",
};

// 통신판매업 / 사업자 정보 — 법적 페이지 및 푸터에 노출됩니다.
// ※ 아래 값은 모두 더미입니다. 운영 전 본인 사업자 정보로 반드시 교체하세요.
export const businessInfo = {
  companyName: "(예시) 회사명",
  representative: "(예시) 홍길동",
  businessNumber: "000-00-00000",
  mailOrderNumber: "0000-지역-0000",
  address: "(예시) 서울특별시 OO구 OO로 OO, OO호",
  phone: "010-0000-0000",
  phoneNote: "문자만", // 비우면 푸터에서 부가표시 없이 노출
  email: "support@example.com",
  privacyOfficer: "(예시) 홍길동",
  // 호스팅 / 주요 처리 위탁 업체 — 개인정보처리방침에 노출
  hostingProvider: "Vercel Inc.",
  // 시행일 — 약관 / 개인정보처리방침 / 환불정책에 공통 노출
  effectiveDate: "2026-01-01",
};
