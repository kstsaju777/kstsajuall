"use client";

import { useState } from "react";
import Link from "next/link";

const MENU_ITEMS: { label: string; href: string }[] = [];

interface Props {
  isLoggedIn: boolean;
}

export function SideDrawer({ isLoggedIn }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 햄버거 버튼 */}
      <button
        onClick={() => setOpen(true)}
        className="text-black hover:opacity-60 transition-opacity"
        aria-label="메뉴"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {/* 딤 배경 */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* 드로어 */}
      <div
        className={`fixed top-0 right-0 h-full w-[320px] max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* 닫기 버튼 */}
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
          href={isLoggedIn ? "/mypage" : "/login"}
          onClick={() => setOpen(false)}
          className="flex items-center justify-between px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <div>
            <p className="text-[16px] font-bold text-black">
              {isLoggedIn ? "마이페이지" : "로그인해 주세요"}
            </p>
            <p className="text-[12px] text-gray-400 mt-0.5">
              {isLoggedIn ? "내 정보 및 주문 확인" : "사주정보를 간편히 관리하세요"}
            </p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </Link>

        {/* 메뉴 리스트 */}
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

        {/* 하단 카카오 문의 */}
        <div className="border-t border-gray-100 px-6 py-5 flex flex-col items-center gap-2">
          <a
            href="http://pf.kakao.com/_bDxiXX"
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
