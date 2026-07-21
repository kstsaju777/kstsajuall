"use client";

import { useCategory } from "./CategoryContext";

const TABS = [
  { label: "전체", value: "" },
  { label: "재물", value: "재물" },
  { label: "사랑", value: "사랑" },
  { label: "가족", value: "가족" },
  { label: "기타", value: "기타" },
  { label: "무료", value: "무료" },
];

const RED = "#711b20";

export function NavTabs() {
  const { category, setCategory } = useCategory();

  return (
    <div className="overflow-x-auto scrollbar-none" style={{ backgroundColor: "transparent" }}>
      <div className="flex w-full gap-[2px]">
        {TABS.map((tab) => {
          const active = category === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setCategory(tab.value)}
              style={{
                flex: 1, padding: "10px 0 8px", fontSize: 13, border: "none",
                fontWeight: active ? 700 : 400,
                color: active ? "#fff" : "#111",
                backgroundColor: active ? RED : "#eeeeee",
                borderRadius: "8px 8px 0 0",
                cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
