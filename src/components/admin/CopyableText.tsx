"use client";

import { useState } from "react";

const COLOR_THEMES = {
  blue: { fg: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  green: { fg: "#047857", bg: "#ecfdf5", border: "#a7f3d0" },
} as const;

export function CopyableText({ text, color = "blue" }: { text: string; color?: keyof typeof COLOR_THEMES }) {
  const [copied, setCopied] = useState(false);
  const theme = COLOR_THEMES[color];
  const copiedTheme = COLOR_THEMES.green;

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // 클립보드 접근 실패 시 조용히 무시
    }
  };

  const active = copied ? copiedTheme : theme;

  return (
    <button
      onClick={handleClick}
      title="클릭해서 복사"
      style={{
        all: "unset", cursor: "pointer", fontFamily: "ui-monospace, monospace", fontSize: 12,
        color: active.fg, whiteSpace: "nowrap",
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "3px 8px", borderRadius: 6,
        background: active.bg,
        border: `1px solid ${active.border}`,
      }}
    >
      {copied ? <>✓ 복사됨</> : <>{text}</>}
    </button>
  );
}
