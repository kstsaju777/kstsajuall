import Link from "next/link";
import { Suspense } from "react";
import { siteConfig, businessInfo } from "@/config/site";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth";
import { NavTabs } from "@/components/layout/NavTabs";
import { GoldDust } from "@/components/layout/GoldDust";
import { SideDrawer } from "@/components/layout/SideDrawer";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const isLoggedIn = isSupabaseConfigured() ? !!(await getCurrentUser()) : false;

  return (
    <div className="mx-auto w-full max-w-[480px] min-h-screen shadow-2xl relative overflow-hidden" style={{ backgroundColor: "#711b20" }}>
      <GoldDust />
      <div className="relative z-10">
        <SiteHeader isLoggedIn={isLoggedIn} />
        <main className="min-h-[calc(100vh-7rem)]">{children}</main>
        <SiteFooter />
      </div>
    </div>
  );
}

function SiteHeader({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <header className="sticky top-0 z-50" style={{ backgroundColor: "#ffffff" }}>
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center">
          <img src="/logo.png" alt={siteConfig.name} className="h-10 w-auto object-contain" />
        </Link>
        <div className="flex items-center gap-4">
          <button className="text-black hover:opacity-60 transition-opacity" aria-label="검색">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
          </button>
          <SideDrawer isLoggedIn={isLoggedIn} />
        </div>
      </div>
      {/* 심사용 임시 비활성화
      <Suspense fallback={null}>
        <NavTabs />
      </Suspense>
      */}
    </header>
  );
}

function SiteFooter() {
  return (
    <footer style={{ backgroundColor: "#e5e5e5" }}>
      <div className="px-6 py-10 text-center space-y-5" style={{ color: "#333" }}>
        <div className="flex justify-center">
          <Link href="/" aria-label="홈으로">
            <img src="/logo.png" alt={siteConfig.name} className="h-10 w-auto object-contain" />
          </Link>
        </div>
        <div className="space-y-1.5 text-[11px] text-body leading-relaxed">
          <p>
            <span className="text-mute">상호</span> {businessInfo.companyName}
            {businessInfo.representative && (
              <> &nbsp;|&nbsp; <span className="text-mute">대표이사</span> {businessInfo.representative}</>
            )}
          </p>
          {businessInfo.address && <p>{businessInfo.address}</p>}
          {businessInfo.mailOrderNumber && (
            <p><span className="text-mute">통신판매업 신고</span> {businessInfo.mailOrderNumber}</p>
          )}
          {businessInfo.businessNumber && (
            <p><span className="text-mute">사업자등록번호</span> {businessInfo.businessNumber}</p>
          )}
          <p>
            <span className="text-mute">고객센터</span> :{" "}
            <a href={businessInfo.kakaoChannel} target="_blank" rel="noreferrer" className="underline hover:opacity-70">
              카카오톡 홍연당 채널
            </a>
            {" "}|{" "}<span className="text-mute">MAIL</span> {businessInfo.email}
          </p>
        </div>
        <div className="flex justify-center gap-5 text-[11px] text-body font-bold pt-1">
          <Link href="/legal/terms" className="hover:text-ink transition-colors">이용약관</Link>
          <Link href="/legal/privacy" className="hover:text-ink transition-colors">개인정보처리방침</Link>
        </div>
        <div className="space-y-1 pt-1">
          <p className="text-[11px] text-body">AI사주, 궁합, 운세 연구소</p>
          <p className="text-[11px] text-mute">
            Copyright © {new Date().getFullYear()} 홍연당 · All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
