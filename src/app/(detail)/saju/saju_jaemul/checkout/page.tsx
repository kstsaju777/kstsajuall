"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useMemo, useState, useEffect } from "react";
import { calcSaju } from "@/lib/saju/local-manseryeok";
import { ganCharImage, jiCharImage } from "@/lib/saju/char-image";
import { LEGAL_DOC_CLASS, TermsContent, PrivacyContent } from "@/components/legal/legal-content";

// ─── 토큰 ────────────────────────────────────────────────────────────────────
const CREAM  = "#fdf8f0";
const WHITE  = "#ffffff";
const GOLD   = "#f9dc64";
const GOLD_D = "#b8860b";
const GOLD_P = "#fdf8e8";
const GRAY1  = "#1a1a1a";
const GRAY2  = "#444444";
const GRAY3  = "#888888";
const GRAY4  = "#dddddd";
// aliases for compat
const PINK   = GOLD;
const PINK_D = GOLD_D;
const PINK_P = GOLD_P;

const PILLAR_LABELS = ["시주", "일주", "월주", "년주"] as const;
const PRODUCT = { name: "재물운사주", original: 49800, discount: 40, price: 29900 };

const GOLD_BTN_STYLE = `
  @keyframes goldGlow {
    0%,100%{box-shadow:0 0 12px 3px rgba(249,220,100,0.45),0 0 28px 6px rgba(184,134,11,0.2),inset 0 1px 0 rgba(255,240,120,0.4);}
    50%{box-shadow:0 0 22px 8px rgba(255,220,50,0.65),0 0 48px 14px rgba(184,134,11,0.3),inset 0 1px 0 rgba(255,255,160,0.6);}
  }
  @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
`;

// ─── 명식 그리드 ──────────────────────────────────────────────────────────────
function SajuGrid({ date, time, calendar, name, gender }: { date: string; time: string; calendar: string; name: string; gender: string }) {
  const saju = useMemo(() => calcSaju(date, time, calendar), [date, time, calendar]);
  const pillars = saju ? [saju.pillars.time, saju.pillars.day, saju.pillars.month, saju.pillars.year] : null;
  const suffix = "님";
  return (
    <div className="px-5 py-4">
      <p className="text-[12px] font-bold mb-3" style={{ color: GRAY3 }}>{name}{suffix}의 사주팔자</p>
      <div className="grid grid-cols-4 gap-2">
        {(pillars ?? Array(4).fill(null)).map((p, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <p className="text-[10px] tracking-wide mb-0.5" style={{ color: GRAY3 }}>{PILLAR_LABELS[i]}</p>
            <span className="text-[11px]" style={{ color: GRAY2 }}>{p?.stemSs || ""}</span>
            <div className="w-full aspect-square flex items-center justify-center">
              {p ? <img src={ganCharImage(p.stem)} alt={p.stem} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <div className="w-full h-full animate-pulse rounded-xl" style={{ backgroundColor: "#eee" }} />}
            </div>
            <div className="w-full aspect-square flex items-center justify-center">
              {p ? <img src={jiCharImage(p.branch)} alt={p.branch} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <div className="w-full h-full animate-pulse rounded-xl" style={{ backgroundColor: "#eee" }} />}
            </div>
            <span className="text-[11px]" style={{ color: GRAY2 }}>{p?.branchSs || ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 이미지 + 텍스트 블록 ────────────────────────────────────────────────────
function ImageTextBlock({ label, headline, accent }: { label: string; headline: string; accent: string }) {
  const parts = headline.split(accent);
  return (
    <div style={{ backgroundColor: WHITE }}>
      <div className="relative overflow-hidden" style={{ height: 240 }}>
        <img src="/media/cards/saju_jaemul/jaemul-0.jpg" alt=""
          className="absolute inset-0 w-full h-full object-cover object-top" />
        <div className="absolute bottom-0 left-0 right-0 h-24" style={{ background: `linear-gradient(to bottom, transparent, ${WHITE})` }} />
      </div>
      <div className="px-6 py-2 text-center">
        <p className="text-[12px] mb-2 tracking-wide" style={{ color: PINK_D }}>{label}</p>
        <h2 className="text-[26px] font-black leading-snug" style={{ color: GRAY1 }}>
          {parts.map((part, i) => (
            <span key={i}>
              {part.split("\n").map((line, j, arr) => (
                <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
              ))}
              {i < parts.length - 1 && <span style={{ color: PINK_D }}>{accent}</span>}
            </span>
          ))}
        </h2>
      </div>
    </div>
  );
}

// ─── 분석 섹션 ───────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    icon: "💰", title: "타고난 재물 그릇", free: true,
    content: "일간과 사주 구성을 바탕으로 타고난 재물 그릇의 크기를 분석합니다. 돈이 자연스럽게 모이는 체질인지, 어떤 방식으로 재물을 축적하는 게 맞는지 사주 속에 담겨 있어요.",
    blurLines: [],
  },
  {
    icon: "📈", title: "돈이 들어오는 시기", free: false,
    blurLines: ["████년 ~ ████년 사이에 재물운이 크게 열릴 것으로 분석됩니다.", "특히 ████월 전후로 기회가 집중될 가능성이 높습니다.", "이 시기를 놓치지 않으려면 ████ 방식으로 준비하는 것이 좋습니다."],
  },
  {
    icon: "🏢", title: "직장 vs 사업 vs 투자 적성", free: false,
    blurLines: ["사주 구조상 ████ 방식으로 재물을 모으는 것이 유리합니다.", "████ 계열의 사업이나 투자와 궁합이 잘 맞습니다.", "████ 방식은 오히려 재물 손실로 이어질 수 있으니 주의하세요."],
  },
  {
    icon: "🚧", title: "재물을 막는 장애 요인", free: false,
    blurLines: ["사주에서 ████ 구조가 재물 흐름을 방해하고 있습니다.", "특히 ████ 시기에 돈이 새는 패턴이 반복될 수 있어요.", "████ 습관을 고치면 재물 손실을 크게 줄일 수 있습니다."],
  },
  {
    icon: "🔮", title: "2026년 재물운 흐름", free: false,
    blurLines: ["2026년은 재물 면에서 ████ 한 해로 분석됩니다.", "상반기와 하반기의 흐름이 ████ 형태로 나뉩니다.", "지금 ████ 준비를 해두면 기회를 최대한 살릴 수 있어요."],
  },
];

function AnalysisSection({ s }: { s: typeof SECTIONS[number] }) {
  return (
    <div className="mx-5 mb-4 rounded-2xl overflow-hidden"
      style={{ backgroundColor: WHITE, border: `1px solid ${GRAY4}`, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
      <div className="flex items-center gap-2.5 px-4 py-3.5"
        style={{ borderBottom: `1px solid ${GRAY4}`, backgroundColor: s.free ? PINK_P : WHITE }}>
        <span className="text-[18px]">{s.icon}</span>
        <span className="text-[15px] font-bold" style={{ color: GRAY1 }}>{s.title}</span>
        <span className="ml-auto text-[10px] px-2.5 py-0.5 rounded-full font-medium"
          style={{ backgroundColor: s.free ? `${PINK_D}15` : "#f5f5f5", color: s.free ? PINK_D : GRAY3, border: `1px solid ${s.free ? PINK_D + "30" : GRAY4}` }}>
          {s.free ? "✓ 공개" : "🔒 잠김"}
        </span>
      </div>
      <div className="px-4 py-4">
        {s.free ? (
          <p className="text-[13px] leading-relaxed" style={{ color: GRAY2 }}>{s.content}</p>
        ) : (
          <div className="relative py-1">
            <div className="space-y-2 select-none">
              {s.blurLines.map((line, i) => (
                <p key={i} className="text-[13px] leading-relaxed" style={{ color: GRAY2, filter: "blur(5.5px)", userSelect: "none" }}>{line}</p>
              ))}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ backgroundColor: PINK_P, border: `1px solid ${PINK}` }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={PINK_D} strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <span className="text-[11px] font-semibold" style={{ color: PINK_D }}>결제 후 열람 가능</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 후기 ────────────────────────────────────────────────────────────────────
const REVIEWS = [
  { star: 5, text: "재물 그릇 분석이 너무 정확했어요. 왜 돈이 안 모이는지 이유를 알게 됐고 앞으로 어떻게 해야 할지 방향이 잡혔어요.", name: "30대 직장인 김○○", date: "2025.05.12" },
  { star: 5, text: "돈이 들어오는 시기가 구체적으로 나와서 놀랐어요. 실제로 그 시기에 좋은 기회가 생겼고 미리 준비한 덕에 잘 잡을 수 있었습니다.", name: "40대 자영업자 이○○", date: "2025.04.28" },
  { star: 5, text: "투자를 해도 될지 고민이었는데 사주로 보니 지금은 때가 아니라고 나왔어요. 참길 잘했다 싶었습니다. 덕분에 손실을 피했어요.", name: "30대 투자자 박○○", date: "2025.05.03" },
];

function ReviewSection() {
  return (
    <div className="px-5 py-6" style={{ backgroundColor: CREAM }}>
      <p className="text-center text-[12px] tracking-widest mb-1" style={{ color: PINK_D }}>✦ 실제 후기 ✦</p>
      <h3 className="text-center text-[17px] font-bold mb-4" style={{ color: GRAY1 }}>이용하신 분들의 이야기</h3>
      <div className="space-y-3">
        {REVIEWS.map((r, i) => (
          <div key={i} className="rounded-2xl px-4 py-4"
            style={{ backgroundColor: WHITE, border: `1px solid ${GRAY4}`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <span key={j} className="text-[13px]" style={{ color: j < r.star ? "#f5a623" : GRAY4 }}>★</span>
                ))}
              </div>
              <span className="text-[11px]" style={{ color: GRAY3 }}>{r.date}</span>
            </div>
            <p className="text-[13px] leading-relaxed mb-1.5" style={{ color: GRAY2 }}>"{r.text}"</p>
            <p className="text-[11px]" style={{ color: GRAY3 }}>— {r.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 결제 모달 ───────────────────────────────────────────────────────────────
function PayBottomSheet({ open, onClose, onConfirm }: {
  open: boolean; onClose: () => void; onConfirm: () => void;
}) {
  const [legalDoc, setLegalDoc] = useState<null | "terms" | "privacy">(null);
  const [confirmExit, setConfirmExit] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    if (open) { setClosing(false); const id = requestAnimationFrame(() => setMounted(true)); return () => cancelAnimationFrame(id); }
    setMounted(false); setConfirmExit(false);
  }, [open]);
  if (!open) return null;

  const DBG = "#1a1500"; const DCARD = "#251e00"; const DTXT = "#ffffff";
  const DMUTE = "rgba(255,255,255,0.5)"; const DSTRIKE = "rgba(255,255,255,0.38)";
  const saved = PRODUCT.original - PRODUCT.price;
  const visible = mounted && !closing;
  const requestClose = () => setConfirmExit(true);
  const doExit = () => { setConfirmExit(false); setClosing(true); setTimeout(onClose, 320); };

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.6)", opacity: visible ? 1 : 0, transition: "opacity 0.3s ease" }} onClick={requestClose} />
      <div className="fixed bottom-0 z-50 overflow-y-auto rounded-t-3xl"
        style={{ left: "max(0px, calc(50vw - 240px))", width: "min(100%, 480px)", maxHeight: "92vh", backgroundColor: DBG, boxShadow: "0 -12px 40px rgba(0,0,0,0.5)", scrollbarWidth: "none", transform: visible ? "translateY(0)" : "translateY(100%)", transition: "transform 0.34s cubic-bezier(0.32,0.72,0,1)" }}>
        <div className="flex justify-center pt-3 pb-1"><div style={{ width: 40, height: 4, borderRadius: 99, background: "rgba(249,220,100,0.3)" }} /></div>
        <div className="px-5 pt-2 pb-7">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[18px] font-black" style={{ color: DTXT }}>재물운사주 결제 안내</h3>
            <button onClick={requestClose} style={{ width: 28, height: 28, color: "rgba(255,255,255,0.6)", fontSize: 18 }}>✕</button>
          </div>
          <div className="inline-block text-[13px] font-bold px-3.5 py-1.5 rounded-full mb-5"
            style={{ background: "rgba(249,220,100,0.15)", border: "1px solid rgba(249,220,100,0.4)", color: GOLD }}>
            총 <span style={{ color: "#f5c842" }}>{saved.toLocaleString()}원</span> 할인받았어요!
          </div>
          <div className="w-full text-left rounded-2xl px-4 py-3.5 mb-5" style={{ backgroundColor: DCARD, border: `1.5px solid ${GOLD_D}`, boxShadow: `0 0 0 3px rgba(249,220,100,0.12)` }}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[14.5px] font-bold" style={{ color: DTXT }}>재물운사주</span>
                <p className="text-[11.5px] mt-1" style={{ color: DMUTE }}>홍연이 들려주는 재물운 정밀 풀이</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[11px]" style={{ color: DSTRIKE }}>
                  <span style={{ color: GOLD, fontWeight: 700 }}>{PRODUCT.discount}%</span>{" "}
                  <span className="line-through">{PRODUCT.original.toLocaleString()}</span>
                </p>
                <p className="text-[16px] font-black mt-0.5" style={{ color: DTXT }}>{PRODUCT.price.toLocaleString()}원</p>
              </div>
            </div>
          </div>
          <style>{GOLD_BTN_STYLE}</style>
          <div style={{ padding: "2px", borderRadius: "18px", background: "linear-gradient(135deg,#ffe066 0%,#d4a017 30%,#fff5a0 50%,#d4a017 70%,#ffe066 100%)", boxShadow: "0 0 14px 3px rgba(212,160,23,0.35)" }}>
            <button onClick={onConfirm} className="w-full py-4 rounded-2xl font-black text-[17px]"
              style={{ background: "linear-gradient(135deg,#b8860b 0%,#d4a017 25%,#f5c842 50%,#d4a017 75%,#b8860b 100%)", backgroundSize: "200% auto", animation: "goldGlow 2s ease-in-out infinite, shimmer 3s linear infinite", color: "#3a1f00", textShadow: "0 1px 2px rgba(255,220,80,0.4)" }}>
              결제하기
            </button>
          </div>
          <div className="flex items-center justify-center gap-2 mt-3.5">
            <span className="flex-shrink-0 flex items-center justify-center rounded" style={{ width: 16, height: 16, background: PINK_D, color: "#fff", fontSize: 10 }}>✓</span>
            <p className="text-[11px] leading-relaxed" style={{ color: DMUTE }}>
              결제 시{" "}
              <button onClick={() => setLegalDoc("privacy")} className="underline" style={{ color: "rgba(255,255,255,0.78)" }}>개인정보 처리방침</button>과{" "}
              <button onClick={() => setLegalDoc("terms")} className="underline" style={{ color: "rgba(255,255,255,0.78)" }}>이용약관</button>에 동의합니다.
            </p>
          </div>
        </div>
      </div>

      {confirmExit && (
        <div className="fixed z-[60] px-6" style={{ left: "max(0px, calc(50vw - 240px))", width: "min(100%, 480px)", top: "34%", pointerEvents: "none" }}>
          <div className="relative mx-auto rounded-2xl px-5 py-4"
            style={{ pointerEvents: "auto", maxWidth: 290, background: "#211d27", boxShadow: "0 14px 40px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", animation: "popIn 0.2s cubic-bezier(0.34,1.4,0.5,1)" }}>
            <button onClick={() => setConfirmExit(false)} className="absolute top-2.5 right-2.5 flex items-center justify-center rounded-full"
              style={{ width: 22, height: 22, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 12 }}>✕</button>
            <p className="text-[14px] font-black pr-5" style={{ color: "#fff" }}>🎁 {saved.toLocaleString()}원 할인이 사라져요!</p>
            <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>이 혜택은 지금만 적용됩니다.</p>
            <button onClick={() => setConfirmExit(false)} className="w-full mt-3 py-2.5 rounded-xl text-[13.5px] font-bold" style={{ background: "linear-gradient(135deg,#b8860b,#f5c842,#b8860b)", color: "#3a1f00" }}>혜택 받고 계속하기</button>
            <button onClick={doExit} className="w-full mt-2 py-2.5 rounded-xl text-[13px] font-bold" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)" }}>나가기</button>
          </div>
          <style>{`@keyframes popIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}`}</style>
        </div>
      )}

      {legalDoc && (
        <div className="fixed inset-0 z-[70]">
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setLegalDoc(null)} />
          <div className="fixed z-[71] flex flex-col rounded-2xl overflow-hidden"
            style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "min(80vw, 300px)", maxHeight: "56vh", background: "#fff", boxShadow: "0 20px 50px rgba(0,0,0,0.4)" }}>
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid #eee" }}>
              <span className="text-[13px] font-bold">{legalDoc === "terms" ? "이용약관" : "개인정보처리방침"}</span>
              <button onClick={() => setLegalDoc(null)} style={{ width: 24, height: 24, background: "#f1f1f1", color: "#666", fontSize: 13, borderRadius: "50%" }}>✕</button>
            </div>
            <div className={`flex-1 overflow-y-auto px-4 pt-2 pb-6 ${LEGAL_DOC_CLASS}`} style={{ zoom: 0.82 } as React.CSSProperties}>
              {legalDoc === "terms" ? <TermsContent /> : <PrivacyContent />}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── 고정 CTA ────────────────────────────────────────────────────────────────
function StickyPayCTA({ onPay, name, gender }: { onPay: () => void; name: string; gender: string }) {
  const [glow, setGlow] = useState(false);
  useEffect(() => { const t = setInterval(() => setGlow((g) => !g), 1800); return () => clearInterval(t); }, []);
  const saved = PRODUCT.original - PRODUCT.price;
  return (
    <div className="flex-shrink-0 px-5 pb-7 pt-4" style={{ backgroundColor: WHITE, boxShadow: "0 -4px 20px rgba(0,0,0,0.08)" }}>
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] line-through" style={{ color: GRAY3 }}>₩{PRODUCT.original.toLocaleString()}</span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(249,220,100,0.12)", color: GOLD_D, border: `1px solid ${GOLD}` }}>특가 -{PRODUCT.discount}%</span>
        </div>
        <span className="text-[24px] font-bold" style={{ color: GRAY1 }}>₩{PRODUCT.price.toLocaleString()}</span>
      </div>
      <style>{GOLD_BTN_STYLE}</style>
      <div style={{ padding: "2px", borderRadius: "18px", background: "linear-gradient(135deg,#ffe066 0%,#d4a017 30%,#fff5a0 50%,#d4a017 70%,#ffe066 100%)", boxShadow: "0 0 16px 4px rgba(212,160,23,0.4)" }}>
        <button onClick={onPay} className="w-full py-4 rounded-2xl font-bold text-[16px] flex items-center justify-center gap-2 active:scale-95 transition-transform"
          style={{ background: "linear-gradient(135deg,#b8860b 0%,#d4a017 25%,#f5c842 50%,#d4a017 75%,#b8860b 100%)", backgroundSize: "200% auto", animation: "goldGlow 2s ease-in-out infinite, shimmer 3s linear infinite", color: "#3a1f00", fontWeight: 800, textShadow: "0 1px 2px rgba(255,220,80,0.4)" }}>
          <span>🔓</span>
          <span>{name}님 재물운사주 확인하기</span>
        </button>
      </div>
    </div>
  );
}

// ─── 메인 ────────────────────────────────────────────────────────────────────
function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const name     = searchParams.get("name")     ?? "아이";
  const date     = searchParams.get("date")     ?? "";
  const time     = searchParams.get("time")     ?? "시간 모름";
  const calendar = searchParams.get("calendar") ?? "양력";
  const gender   = searchParams.get("gender")   ?? "";
  const email    = searchParams.get("email")    ?? "";
  const concern  = searchParams.get("concern")  ?? "";
  const CHAPTER_TITLES = ["제1장 — 사주 원국","제2장 — 운명의 구조","제3장 — 인간관계","제4장 — 숨겨진 특징","제5장 — 재물과 직업","제6장 — 사랑과 결혼","제7장 — 건강","제8장 — 귀인","제9장 — 주의할 사람","제10장 — 굴곡과 위기","제11장 — 대운 흐름","제12장 — 주의 시기","제13장 — 당부의 말","제14장 — 개운법","제15장 — 중심 잡기","제16장 — 마무리"];
  const TOTAL = 16;
  const [showSheet, setShowSheet] = useState(false);
  const [creating, setCreating] = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(1);

  const handleConfirm = async () => {
    setShowSheet(false);
    setCreating(true);
    setDoneCount(0);
    setCurrentChapter(1);
    try {
      const res = await fetch("/api/saju_jaemul-report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, date, time, calendar, gender, email }) });
      if (!res.ok || !res.body) { router.push(`/saju/saju_jaemul/report?${new URLSearchParams({ name, date, time, calendar, gender, email, ch: "0" }).toString()}`); return; }
      const reader = res.body.getReader(); const decoder = new TextDecoder(); let buf = "";
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n"); buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.chapter) { setDoneCount(data.chapter); setCurrentChapter(Math.min(data.chapter + 1, TOTAL)); }
            if (data.done && data.resultId) { router.push(`/saju/saju_jaemul/report?id=${data.resultId}`); return; }
            if (data.error) { router.push(`/saju/saju_jaemul/report?${new URLSearchParams({ name, date, time, calendar, gender, email, ch: "0" }).toString()}`); return; }
          } catch { /* JSON 파싱 실패 무시 */ }
        }
      }
    } catch { router.push(`/saju/saju_jaemul/report?${new URLSearchParams({ name, date, time, calendar, gender, email, ch: "0" }).toString()}`); }
  };

  if (creating) {
    const pct = Math.round((doneCount / TOTAL) * 100);
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center z-50 px-8" style={{ background: "radial-gradient(ellipse at 50% 40%, #2a0a00 0%, #0d0200 100%)" }}>
        <style>{`@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}@keyframes glow-pulse{0%,100%{box-shadow:0 0 8px 2px #ff4400aa,0 0 20px 4px #ff220055}50%{box-shadow:0 0 16px 4px #ff6600cc,0 0 40px 10px #ff440088}}@keyframes orbit{0%{transform:rotate(0deg) translateX(38px) rotate(0deg)}100%{transform:rotate(360deg) translateX(38px) rotate(-360deg)}}@keyframes title-fade{0%{opacity:0;transform:translateY(6px)}20%{opacity:1;transform:translateY(0)}80%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-6px)}}`}</style>
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, #ff330022 0%, transparent 70%)" }} />
          {[0,1,2,3,4,5].map(i => (<div key={i} className="absolute w-1 h-1 rounded-full" style={{ top:"50%",left:"50%",marginTop:"-2px",marginLeft:"-2px",background:i%2===0?"#ff6633":"#ffaa44",boxShadow:`0 0 6px 2px ${i%2===0?"#ff4400":"#ff8800"}`,animation:`orbit ${2.5+i*0.4}s linear infinite`,animationDelay:`${i*-0.5}s` }} />))}
          <div className="absolute inset-0 flex items-center justify-center"><span style={{ fontSize:28,filter:"drop-shadow(0 0 8px #ff4400)" }}>✦</span></div>
        </div>
        <p className="text-[18px] font-bold mb-1" style={{ color:"#fff5ee",fontFamily:"'Noto Serif KR',serif",textShadow:"0 0 20px #ff440088" }}>결과지를 완성하고 있소…</p>
        <p key={currentChapter} className="text-[13px] mb-8" style={{ color:"#ff9966",animation:"title-fade 4s ease-in-out",minHeight:20 }}>{doneCount < TOTAL ? CHAPTER_TITLES[currentChapter-1]+" 풀이 중" : "마무리 중이오…"}</p>
        <div className="w-full max-w-[280px] mb-3">
          <div className="flex justify-between text-[11px] mb-2" style={{ color:"#cc7755" }}><span>{doneCount} / {TOTAL} 장 완성</span><span>{pct}%</span></div>
          <div className="w-full h-3 rounded-full overflow-hidden relative" style={{ background:"#1a0800" }}>
            <div className="h-full rounded-full relative overflow-hidden transition-all duration-700" style={{ width:`${pct}%`,background:"linear-gradient(90deg,#8b1a00,#ff4400,#ff8833)",animation:pct>0?"glow-pulse 1.8s ease-in-out infinite":"none" }}>
              <div style={{ position:"absolute",top:0,left:0,right:0,bottom:0,background:"linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.4) 50%,transparent 100%)",animation:"shimmer 1.6s linear infinite",width:"40%" }} />
            </div>
          </div>
        </div>
        <p className="text-[11px] text-center leading-relaxed mt-4" style={{ color:"#886655" }}>풀이가 완성되면 자동으로 열리오.<br />이 창을 벗어나셔도 입력하신 이메일로<br />결과지 링크를 보내드렸으니 언제든 확인하실 수 있소.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: CREAM }}>
      <div className="flex-1 min-h-0 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        <style>{`div::-webkit-scrollbar{display:none}`}</style>

        <ImageTextBlock label="재물운사주 · 정밀 리포트" headline={`${name}${gender === "남아" ? "군" : gender === "여아" ? "양" : "님"}의\n운명을\n살펴봤어요`} accent="살펴봤어요" />

        {/* 명식 */}
        <div style={{ backgroundColor: WHITE }}>
          <SajuGrid date={date} time={time} calendar={calendar} name={name} gender={gender} />
        </div>

        <ImageTextBlock label="AI 정밀 재물운 분석 · 5가지 항목" headline={`그대의 재물운,\n이제\n알려드릴게요`} accent="이제" />

        <div className="pb-5" style={{ backgroundColor: CREAM }}>
          {SECTIONS.map((s, i) => <AnalysisSection key={i} s={s} />)}
        </div>

        <ImageTextBlock label="실제 이용 후기" headline={`이미 수천 명이\n재물운을\n확인했어요`} accent="재물운을" />

        <ReviewSection />
        <div className="h-4" />
      </div>

      <StickyPayCTA onPay={() => setShowSheet(true)} name={name} gender={gender} />
      <PayBottomSheet open={showSheet} onClose={() => setShowSheet(false)} onConfirm={handleConfirm} />
    </div>
  );
}

export default function ChildCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: CREAM }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: PINK_D, borderTopColor: "transparent" }} />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
