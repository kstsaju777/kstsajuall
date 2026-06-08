"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";

const TABS = [
  { label: "전체", category: "" },
  { label: "무료", category: "사주" },
  { label: "연애", category: "자미두수" },
  { label: "재회", category: "타로" },
  { label: "결혼", category: "무료" },
  { label: "가정", category: "기타" },
  { label: "기타", category: "기타2" },
  { label: "채팅", category: "채팅" },
];

export function NavTabs() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentCategory = searchParams.get("category") ?? "";

  return (
    <div className="overflow-x-auto scrollbar-none border-t border-gray-200">
      <div className="flex w-full">
        {TABS.map((tab) => {
          const isActive =
            pathname === "/" || pathname === "/products"
              ? currentCategory === tab.category
              : false;
          // 홈에서는 전체를 기본 활성
          const active = pathname === "/" ? tab.category === "" : isActive;

          return (
            <Link
              key={tab.label}
              href={tab.category ? `/products?category=${tab.category}` : "/"}
              className={`relative flex-1 text-center py-3 text-[14px] whitespace-nowrap transition-colors ${
                active
                  ? "font-bold text-[#111]"
                  : "font-normal text-[#999] hover:text-[#555]"
              }`}
            >
              {tab.label}
              {/* 활성 밑줄 */}
              {active && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#111] rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
