import Link from "next/link";
import { siteConfig, businessInfo } from "@/config/site";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth";
import { SideDrawer } from "@/components/layout/SideDrawer";
import { AdminOverlay } from "@/components/admin/AdminOverlay";
import { FooterLegal } from "@/components/layout/FooterLegal";
import { NavTabs } from "@/components/layout/NavTabs";
import { CategoryProvider } from "@/components/layout/CategoryContext";

const ADMIN_EMAIL = "admin@hongyeondang.com";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = isSupabaseConfigured() ? await getCurrentUser() : null;
  const isLoggedIn = !!user;
  const isAdmin = !!user && user.email === ADMIN_EMAIL;

  return (
    <CategoryProvider>
      <div className="mx-auto w-full max-w-[480px] min-h-screen shadow-2xl relative overflow-hidden flex flex-col" style={{ backgroundColor: "#711b20" }}>
        <div className="relative z-10 flex flex-col flex-1">
          <SiteHeader isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
        {isAdmin && <AdminOverlay />}
      </div>
    </CategoryProvider>
  );
}

function SiteHeader({ isLoggedIn, isAdmin }: { isLoggedIn: boolean; isAdmin: boolean }) {
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
      <NavTabs />
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
          </p>
          <p><span className="text-mute">MAIL</span> {businessInfo.email}</p>
          <p><span className="text-mute">TEL</span> 010-2395-8953</p>
        </div>
        <FooterLegal />
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
