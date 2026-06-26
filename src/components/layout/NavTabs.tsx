"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";

const TABS = [
  { label: "전체", category: "" },
  { label: "종합", category: "종합" },
  { label: "재물", category: "재물" },
  { label: "사랑", category: "사랑" },
  { label: "가족", category: "가족" },
  { label: "기타", category: "기타" },
  { label: "무료", category: "무료" },
];

const RED = "#711b20";

export function NavTabs() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentCategory = searchParams.get("category") ?? "";

  return (
    <div className="overflow-x-auto scrollbar-none" style={{ backgroundColor: "transparent" }}>
      <div className="flex w-full gap-[2px]">
        {TABS.map((tab) => {
          const isActive =
            pathname === "/" || pathname === "/products"
              ? currentCategory === tab.category
              : false;
          const active = pathname === "/" ? tab.category === "" : isActive;

          return (
            <Link
              key={tab.label}
              href={tab.category ? `/products?category=${tab.category}` : "/"}
              className="relative flex-1 text-center whitespace-nowrap transition-all"
              style={{
                padding: "10px 0 8px",
                fontSize: 13,
                fontWeight: active ? 700 : 400,
                color: active ? "#fff" : "#111",
                backgroundColor: active ? RED : "#eeeeee",
                borderRadius: "8px 8px 0 0",
                boxShadow: "none",
                zIndex: active ? 1 : 0,
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
