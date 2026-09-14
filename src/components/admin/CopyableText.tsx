"use client";

import { useState } from "react";

export function CopyableText({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // 클립보드 접근 실패 시 조용히 무시
    }
  };

  return (
    <button
      onClick={handleClick}
      title="클릭해서 복사"
      style={{
        all: "unset", cursor: "pointer", fontFamily: "ui-monospace, monospace", fontSize: 12,
        color: copied ? "#047857" : "#555", whiteSpace: "nowrap",
      }}
    >
      {copied ? "복사됨 ✓" : text}
    </button>
  );
}
