import type { Metadata } from "next";
import { WelcomeClient } from "./WelcomeClient";

// 광고(당근·인스타 등)로 처음 들어온 방문자용 원페이지 랜딩
// 검색 노출은 막아 둔다(홈과 내용이 겹치므로 광고 전용 주소로만 사용).
export const metadata: Metadata = {
  title: "조선의 정통 명리학, AI를 만나다",
  description: "생년월일 하나로 사주 여덟 글자를 헤아리고, AI가 그대만의 결과지를 써 드리오. 홍연당.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "조선의 정통 명리학, AI를 만나다 | 홍연당",
    description: "생년월일 하나로, 그대만의 이야기를 써 드리겠소.",
    images: [{ url: "/media/welcome/hero-poster.jpg", width: 720, height: 1280, alt: "홍연당" }],
  },
};

export default function WelcomePage() {
  return <WelcomeClient />;
}
