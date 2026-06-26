"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const CARDS = [
  {
    id: "main-0",
    image: "/media/cards/total/total-0.mp4",
    type: "video" as const,
    badge: "종합",
    tag: "베스트",
    name: "종합 사주 감명",
    desc: "대운·세운·직업운·재물운·건강운 정통 종합 풀이",
    href: "/saju/jeongtong",
    defaultActive: true,
  },
  {
    id: "main-1",
    image: "/media/hero/hero-3.jpg",
    badge: "재물",
    tag: "인기",
    name: "정통사주 재물운",
    desc: "평생 재물운과 돈이 들어오는 시기를 분석합니다",
    href: "/coming-soon",
    defaultActive: false,
  },
  {
    id: "main-2",
    image: "/media/hero/hero-7.jpg",
    badge: "연애",
    tag: "HOT",
    name: "유혹사주",
    desc: "쉿, 내게 숨겨진 색기와 이성을 홀리는 매력 알아보기",
    href: "/coming-soon",
    defaultActive: false,
  },
];

export default function HomePage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeMap, setActiveMap] = useState<Record<string, boolean>>(
    Object.fromEntries(CARDS.map(c => [c.id, c.defaultActive]))
  );

  useEffect(() => {
    fetch("/api/admin/check").then(r => r.json()).then(d => { if (d.isAdmin) setIsAdmin(true); }).catch(() => {});
  }, []);

  const [confirm, setConfirm] = useState<string | null>(null);

  const toggleCard = (id: string) => {
    const current = activeMap[id];
    if (!current) {
      setConfirm(id); // 비공개→공개 시 확인창
    } else {
      setActiveMap(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="pb-10 px-4 pt-4 flex flex-col gap-4">
      {CARDS.map((card) => {
        const active = activeMap[card.id];
        const comingSoon = !isAdmin && !active;
        return (
          <div key={card.id} className="relative">
            <Link
              href={comingSoon ? "#" : card.href}
              onClick={comingSoon ? (e) => e.preventDefault() : undefined}
              className="block w-full rounded-2xl overflow-hidden relative"
              style={{ aspectRatio: "4/3", pointerEvents: comingSoon ? "none" : "auto" }}
            >
              {card.type === "video" ? (
                <video src={card.image} className="w-full h-full object-cover" autoPlay muted loop playsInline
                  style={comingSoon ? { filter: "blur(8px) brightness(0.15)", transform: "scale(1.05)" } : {}} />
              ) : (
                <img src={card.image} alt={card.name} className="w-full h-full object-cover"
                  style={comingSoon ? { filter: "blur(8px) brightness(0.15)", transform: "scale(1.05)" } : {}} />
              )}
              {comingSoon ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <p className="text-white font-black text-[18px]">서비스 준비중입니다</p>
                  <p className="text-white/70 text-[13px]">멋진 풀이로 선보이겠습니다</p>
                </div>
              ) : (
                <>
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.7))" }} />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#9b2335", color: "#fff" }}>{card.badge}</span>
                    {card.tag && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.5)", color: "#fff" }}>{card.tag}</span>}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-bold text-[18px] leading-tight">{card.name}</p>
                    <p className="text-white/80 text-[12px] mt-1">{card.desc}</p>
                  </div>
                </>
              )}
            </Link>
            {isAdmin && (
              <button
                onClick={() => toggleCard(card.id)}
                style={{
                  position: "absolute", top: 8, right: 8, zIndex: 10,
                  padding: "4px 11px", borderRadius: 12, border: "none",
                  fontSize: 11, fontWeight: 700, cursor: "pointer",
                  background: active ? "#16a34a" : "#6b7280",
                  color: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
                }}
              >
                {active ? "✓ 공개" : "비공개"}
              </button>
            )}
          </div>
        );
      })}

      {/* 공개 전환 확인 모달 */}
      {confirm && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "0 32px",
        }}>
          <div style={{
            background: "#fff", borderRadius: 16, padding: "28px 24px",
            width: "100%", maxWidth: 300, textAlign: "center",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 8 }}>상품 공개</p>
            <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 24 }}>
              실제 고객에게 상품이 노출됩니다.<br />오픈하시겠습니까?
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setConfirm(null)}
                style={{
                  flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid #ddd",
                  background: "#f5f5f5", color: "#555", fontSize: 14, fontWeight: 700, cursor: "pointer",
                }}
              >NO</button>
              <button
                onClick={() => { setActiveMap(prev => ({ ...prev, [confirm]: true })); setConfirm(null); }}
                style={{
                  flex: 1, padding: "11px 0", borderRadius: 10, border: "none",
                  background: "#9b2335", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                }}
              >YES</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
