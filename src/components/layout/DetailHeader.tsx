"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const MENU_ITEMS = [
  { label: "사주풀이", href: "/products?category=사주" },
  { label: "자미두수", href: "/products?category=자미두수" },
  { label: "타로", href: "/products?category=타로" },
  { label: "작명", href: "/products?category=작명" },
  { label: "기타 운세", href: "/products?category=기타" },
];

export function DetailHeader() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 헤더 바 */}
      <header
        className="relative flex-shrink-0 flex items-center justify-between px-4 h-14 z-40"
        style={{ backgroundColor: "#fdf8f4", borderBottom: "1px solid #ede8e2" }}
      >
        {/* 좌: 뒤로가기 */}
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
          aria-label="뒤로"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* 가운데: 로고 (홈으로) */}
        <Link href="/" prefetch={true} aria-label="홈으로" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center px-3 py-2">
          <img
            src="/logo.png"
            alt="홍연당"
            className="h-9 w-auto object-contain"
          />
        </Link>

        {/* 우: 햄버거 메뉴 */}
        <button
          onClick={() => setOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
          aria-label="메뉴"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </header>

      {/* 딤 배경 */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* 사이드 드로어 */}
      <div
        className={`fixed top-0 right-0 h-full w-[320px] max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* 닫기 */}
        <div className="flex justify-end p-4">
          <button
            onClick={() => setOpen(false)}
            className="text-black hover:opacity-50 transition-opacity"
            aria-label="닫기"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* 로그인 배너 */}
        <Link
          href="/login"
          onClick={() => setOpen(false)}
          className="flex items-center justify-between px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <div>
            <p className="text-[16px] font-bold text-black">로그인해 주세요</p>
            <p className="text-[12px] text-gray-400 mt-0.5">사주정보를 간편히 관리하세요</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </Link>

        {/* 메뉴 */}
        <nav className="flex-1 overflow-y-auto py-2">
          {MENU_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-6 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <span className="text-[16px] font-semibold text-black">{item.label}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </Link>
          ))}
        </nav>

        {/* 카카오 문의 */}
        <div className="border-t border-gray-100 px-6 py-5 flex flex-col items-center gap-2">
          <a
            href="https://pf.kakao.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-full py-3 text-[14px] font-bold text-black"
            style={{ backgroundColor: "#FEE500" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.628 1.571 4.938 3.938 6.344L5 21l4.563-2.438A11.3 11.3 0 0012 18c5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/>
            </svg>
            카카오톡 문의
          </a>
          <p className="text-[11px] text-gray-400">운영시간 평일 09:00–18:00</p>
        </div>
      </div>
    </>
  );
}
