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
          <img src="/images/logo.png" alt={siteConfig.name} className="h-10 w-auto object-contain" />
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
    <footer className="border-t border-hairline mt-10" style={{ backgroundColor: "#ffffff" }}>
      <div className="px-6 py-10 text-center space-y-5" style={{ color: "#333" }}>
        <div className="flex justify-center">
          <img src="/images/logo.png" alt={siteConfig.name} className="h-10 w-auto object-contain" />
        </div>
        <div className="space-y-1.5 text-[11px] text-body font-myeongjo leading-relaxed">
          <p>
            <span className="text-mute">상호</span> {businessInfo.companyName}
            {businessInfo.representative && (
              <> &nbsp;|&nbsp; <span className="text-mute">대표이사</span> {businessInfo.representative}</>
            )}
          </p>
          {businessInfo.address && <p>{businessInfo.address}</p>}
          <div className="my-2 border-t border-hairline/50" />
          {businessInfo.mailOrderNumber && (
            <p><span className="text-mute">통신판매업 신고</span> {businessInfo.mailOrderNumber}</p>
          )}
          {businessInfo.businessNumber && (
            <p><span className="text-mute">사업자등록번호</span> {businessInfo.businessNumber}</p>
          )}
          <div className="my-2 border-t border-hairline/50" />
          <p>
            <span className="text-mute">고객센터</span>{" "}
            <a href={`mailto:${businessInfo.email}`} className="text-gold hover:underline">
              {businessInfo.email}
            </a>
          </p>
          {businessInfo.phone && (
            <p>
              <span className="text-mute">대표번호</span> {businessInfo.phone}
              {businessInfo.phoneNote && (
                <span className="block text-[10px] text-mute mt-0.5">({businessInfo.phoneNote})</span>
              )}
            </p>
          )}
        </div>
        <div className="flex justify-center gap-5 text-[11px] text-body font-myeongjo pt-1">
          <Link href="/legal/terms" className="hover:text-ink transition-colors">이용약관</Link>
          <Link href="/legal/privacy" className="hover:text-ink transition-colors">개인정보처리방침</Link>
        </div>
        <p className="text-[10px] text-mute font-myeongjo">
          Copyright © {new Date().getFullYear()} {siteConfig.name} · All rights reserved
        </p>
      </div>
    </footer>
  );
}
