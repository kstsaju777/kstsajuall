"use client";

import { useState } from "react";

export function ConcernCell({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  if (!text || text === "-") {
    return <span style={{ fontSize: 12, color: "#ccc" }}>-</span>;
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "inline-block", padding: "4px 10px", borderRadius: 999,
          fontSize: 11, fontWeight: 600, color: "#2563eb", background: "#eff6ff",
          border: "1px solid #bfdbfe", cursor: "pointer", whiteSpace: "nowrap",
        }}
      >
        고민보기
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 10000,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 14, padding: "22px 24px", maxWidth: 480, width: "100%",
              maxHeight: "70vh", overflowY: "auto", boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#888", margin: 0, letterSpacing: 0.5 }}>고민 내용</p>
              <button
                onClick={() => setOpen(false)}
                style={{ all: "unset", cursor: "pointer", fontSize: 18, color: "#aaa", lineHeight: 1 }}
              >
                ✕
              </button>
            </div>
            <p style={{ fontSize: 14, color: "#222", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{text}</p>
          </div>
        </div>
      )}
    </>
  );
}
