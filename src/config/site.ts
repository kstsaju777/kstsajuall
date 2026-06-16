// =====================================================
// 사이트 메타 / 사업자 정보
// =====================================================
// 운영 전 본인 정보로 반드시 교체하세요. 아래는 모두 더미 데이터입니다.

export const siteConfig = {
  name: "홍연당 | AI사주, 궁합, 운세 연구소",
  tagline: "정통 명리학의 깊이, 지금 당신의 사주",
  description: "사주 팔자의 정통 해석과 AI 분석이 만납니다. 홍문당에서 나의 운명을 읽어보세요.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "support@villionhive.com",
};

// 통신판매업 / 사업자 정보 — 법적 페이지 및 푸터에 노출됩니다.
export const businessInfo = {
  companyName: "빌리언하이브",
  representative: "김민겸",
  businessNumber: "404-24-02171",
  mailOrderNumber: "2026-서울강남-03327",
  address: "서울특별시 강남구 압구정로 306, 지하 1층 6-S38호",
  phone: "", // 비우면 푸터/법적 페이지에서 전화번호 미노출
  phoneNote: "",
  email: "support@villionhive.com",
  kakaoChannel: "https://pf.kakao.com/", // TODO: 실제 홍연당 카카오톡 채널 주소로 교체
  privacyOfficer: "김민겸", // 개인정보처리방침에 노출(대표 겸임)
  // 호스팅 / 주요 처리 위탁 업체 — 개인정보처리방침에 노출
  hostingProvider: "Vercel Inc.",
  // 시행일 — 약관 / 개인정보처리방침 / 환불정책에 공통 노출
  effectiveDate: "2026-01-01",
};
