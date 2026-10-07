import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { WelcomeClient } from "./WelcomeClient";

// 광고(당근·인스타 등)로 처음 들어온 방문자용 원페이지 랜딩
// 검색 노출은 막아 둔다(홈과 내용이 겹치므로 광고 전용 주소로만 사용).
export const metadata: Metadata = {
  title: "조선의 정통 명리학, AI를 만나다",
  description: "생년월일 하나로 사주 여덟 글자를 헤아리고, AI가 그대만의 결과지를 써 드리오. 홍연당.",
  robots: { index: false, follow: false },
  // 카카오톡·메신저 링크 미리보기는 홈과 똑같이 보이도록, 홈(layout)과 같은 값을 그대로 쓴다.
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    type: "website",
    locale: "ko_KR",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: { card: "summary_large_image", images: ["/og-image.png"] },
};

export default function WelcomePage() {
  return <WelcomeClient />;
}
