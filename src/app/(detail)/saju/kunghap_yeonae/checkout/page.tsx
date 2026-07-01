"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useMemo, useState, useEffect } from "react";
import { calcSaju, ELEMENT_COLORS, type LocalSajuResult } from "@/lib/saju/local-manseryeok";
import { ganCharImage, jiCharImage } from "@/lib/saju/char-image";
import { LEGAL_DOC_CLASS, TermsContent, PrivacyContent } from "@/components/legal/legal-content";

// ─── 디자인 토큰 ──────────────────────────────────────────────────────────────
const CREAM    = "#fdf8f4";
const WHITE    = "#ffffff";
const RED      = "#e1337d";
const RED_SOFT = "#ff6b9d";
const RED_PALE = "#fff0f6";
const ROSE     = "#ffb3d0";
const GRAY1    = "#1a1a1a";
const GRAY2    = "#444444";
const GRAY3    = "#888888";
const GRAY4    = "#dddddd";
const CARD_BG  = "#ffffff";

const PILLAR_LABELS = ["시주", "일주", "월주", "년주"] as const;

// ─── 명식 그리드 (이미지 방식) ────────────────────────────────────────────────
function MyeongsikGrid({ saju, label }: { saju: LocalSajuResult | null; label: string }) {
  const pillars = saju
    ? [saju.pillars.time, saju.pillars.day, saju.pillars.month, saju.pillars.year]
    : null;

  return (
    <div className="px-5 pb-4">
      <p className="text-[12px] font-bold mb-3" style={{ color: GRAY3 }}>{label}</p>
      <div className="grid grid-cols-4 gap-2">
        {(pillars ?? Array(4).fill(null)).map((p, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <p className="text-[10px] font-medium tracking-wider mb-0.5" style={{ color: GRAY3 }}>
              {PILLAR_LABELS[i]}
            </p>
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

// ─── 두 사람 명식 나란히 ──────────────────────────────────────────────────────
function DoubleMini({ saju, label }: { saju: LocalSajuResult | null; label: string }) {
  const pillars = saju
    ? [saju.pillars.time, saju.pillars.day, saju.pillars.month, saju.pillars.year]
    : null;
  return (
    <div className="flex-1">
      <p className="text-[12px] font-bold mb-2 text-center" style={{ color: GRAY3 }}>{label}</p>
      <div className="grid grid-cols-4 gap-1">
        {(pillars ?? Array(4).fill(null)).map((p, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <span style={{ fontSize: 9, color: RED, lineHeight: 1 }}>{p?.stemSs || " "}</span>
            <div className="w-full aspect-square flex items-center justify-center">
              {p ? <img src={ganCharImage(p.stem)} alt={p.stem} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <div className="w-full h-full animate-pulse rounded-lg" style={{ backgroundColor: "#eee" }} />}
            </div>
            <div className="w-full aspect-square flex items-center justify-center">
              {p ? <img src={jiCharImage(p.branch)} alt={p.branch} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <div className="w-full h-full animate-pulse rounded-lg" style={{ backgroundColor: "#eee" }} />}
            </div>
            <span style={{ fontSize: 9, color: RED, lineHeight: 1 }}>{p?.branchSs || " "}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 이미지→텍스트→이미지 블록 ───────────────────────────────────────────────
function ImageTextBlock({
  topImgSrc, bottomImgSrc, label, headline, accentWord, bgColor = WHITE,
}: {
  topImgSrc: string; bottomImgSrc: string; label: string; headline: string; accentWord: string; bgColor?: string;
}) {
  const parts = headline.split(accentWord);
  return (
    <div style={{ backgroundColor: bgColor }}>
      <div className="relative overflow-hidden" style={{ height: 260 }}>
        <img src={topImgSrc} alt="" className="absolute inset-0 w-full h-full object-cover object-top" />
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none" style={{ background: `linear-gradient(to bottom, transparent, ${bgColor})` }} />
      </div>
      <div className="px-6 py-1 text-center">
        <p className="text-[12px] mb-2 tracking-wide" style={{ color: RED }}>{label}</p>
        <h2 className="text-[28px] font-black leading-snug" style={{ color: GRAY1 }}>
          {parts.map((part, i) => (
            <span key={i}>
              {part.split("\n").map((line, j, arr) => (
                <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
              ))}
              {i < parts.length - 1 && <span style={{ color: RED }}>{accentWord}</span>}
            </span>
          ))}
        </h2>
      </div>
      <div className="relative overflow-hidden" style={{ height: 260 }}>
        <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none z-10" style={{ background: `linear-gradient(to bottom, ${bgColor}, transparent)` }} />
        <img src={bottomImgSrc} alt="" className="absolute inset-0 w-full h-full object-cover object-center" />
      </div>
    </div>
  );
}

function ImageDivider({ src = "/media/hero/hero-1.jpg", bgColor = WHITE }: { src?: string; bgColor?: string }) {
  return (
    <div className="relative overflow-hidden" style={{ height: 180 }}>
      <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none z-10" style={{ background: `linear-gradient(to bottom, ${bgColor}, transparent)` }} />
      <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-10" style={{ background: `linear-gradient(to top, ${bgColor}, transparent)` }} />
    </div>
  );
}

// ─── 분석 섹션 ───────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    icon: "🔮", title: "두 사람의 타고난 기질", free: true,
    content: "각자의 일간과 오행 구성을 바탕으로 두 사람의 타고난 성향과 기질을 분석합니다. 서로의 차이가 갈등을 만드는지, 아니면 오히려 보완이 되는지 사주 속에 답이 있습니다.\n\n처음 만났을 때 끌렸던 이유, 그리고 헤어지게 된 이유까지 사주는 조용히 기록하고 있습니다.",
    blurLines: ["", "", ""],
  },
  {
    icon: "💔", title: "이별의 사주적 원인", free: false,
    content: "",
    blurLines: [
      "두 사람의 ████간 충돌이 이별의 핵심 원인으로 분석됩니다.",
      "████년 ████월, 운의 흐름이 두 사람을 멀어지게 했습니다.",
      "이 시기의 선택은 사주상 ████한 영향을 받고 있었습니다.",
    ],
  },
  {
    icon: "❤️", title: "상대방이 나를 바라보는 시선", free: false,
    content: "",
    blurLines: [
      "상대방의 일간 기준으로 당신은 ████에 해당합니다.",
      "현재 상대방의 마음속에 당신은 ████한 존재로 남아있습니다.",
      "재회를 원한다면 ████한 접근이 효과적입니다.",
    ],
  },
  {
    icon: "📅", title: "재회 시기와 운의 흐름", free: false,
    content: "",
    blurLines: [
      "재회 가능성이 높은 시기는 ████년 ████월로 분석됩니다.",
      "현재 두 사람의 대운은 ████으로 ████한 기운이 작용합니다.",
      "이 시기를 놓치면 다음 기회는 ████년 이후로 밀립니다.",
    ],
  },
  {
    icon: "⚡", title: "재회를 방해하는 요인", free: false,
    content: "",
    blurLines: [
      "당신의 사주에서 ████살이 재회를 방해하고 있습니다.",
      "████ 방향의 접근과 ████한 행동은 반드시 피하세요.",
      "████년 ████월은 절대 연락하지 말아야 할 시기입니다.",
    ],
  },
];

function AnalysisSection({ s }: { s: typeof SECTIONS[number] }) {
  return (
    <div className="mx-5 mb-4 rounded-2xl overflow-hidden"
      style={{ backgroundColor: CARD_BG, border: `1px solid ${GRAY4}`, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
      <div className="flex items-center gap-2.5 px-4 py-3.5"
        style={{ borderBottom: `1px solid ${GRAY4}`, backgroundColor: s.free ? RED_PALE : WHITE }}>
        <span className="text-[18px]">{s.icon}</span>
        <span className="text-[15px] font-bold" style={{ color: GRAY1 }}>{s.title}</span>
        <span className="ml-auto text-[10px] px-2.5 py-0.5 rounded-full font-medium"
          style={{ backgroundColor: s.free ? `${RED}15` : "#f5f5f5", color: s.free ? RED : GRAY3, border: `1px solid ${s.free ? RED + "30" : GRAY4}` }}>
          {s.free ? "✓ 공개" : "🔒 잠김"}
        </span>
      </div>
      <div className="px-4 py-4">
        {s.free ? (
          <p className="text-[13px] leading-relaxed whitespace-pre-line" style={{ color: GRAY2 }}>{s.content}</p>
        ) : (
          <div className="relative py-1">
            <div className="space-y-2 select-none">
              {s.blurLines.map((line, i) => (
                <p key={i} className="text-[13px] leading-relaxed" style={{ color: GRAY2, filter: "blur(5.5px)", userSelect: "none" }}>
                  {line || "█████████████████████████████"}
                </p>
              ))}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ backgroundColor: RED_PALE, border: `1px solid ${ROSE}` }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <span className="text-[11px] font-semibold" style={{ color: RED }}>결제 후 열람 가능</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 후기 ─────────────────────────────────────────────────────────────────────
const REVIEWS = [
  { star: 5, text: "헤어진 지 6개월 됐는데 재회 시기가 딱 맞았어요. 사주에서 알려준 대로 움직였더니 진짜로 연락이 왔습니다.", name: "30대 직장인 김○○", date: "2025.05.12" },
  { star: 5, text: "상대방이 나를 어떻게 생각하는지 사주로 보니 너무 정확해서 소름이었어요. 덕분에 마음 정리도 됐습니다.", name: "20대 대학생 이○○", date: "2025.04.28" },
  { star: 5, text: "재회를 방해하는 요인이 제 행동 패턴이랑 너무 맞아서 깜짝 놀랐어요. 앞으로 어떻게 해야 할지 방향이 잡혔습니다.", name: "30대 자영업자 박○○", date: "2025.05.03" },
];

function ReviewSection() {
  return (
    <div className="px-5 py-6" style={{ backgroundColor: CREAM }}>
      <p className="text-center text-[12px] tracking-widest mb-1" style={{ color: RED }}>✦ 실제 후기 ✦</p>
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

// ─── 결제 모달 ────────────────────────────────────────────────────────────────
const PRODUCTS = [
  { id: "yeonae", name: "연애궁합", original: 59800, discount: 50, price: 29900 },
];

function PayBottomSheet({ open, onClose, onConfirm }: {
  open: boolean; onClose: () => void; onConfirm: (id: string) => void;
}) {
  const [selected] = useState("yeonae");
  const [legalDoc, setLegalDoc] = useState<null | "terms" | "privacy">(null);
  const [confirmExit, setConfirmExit] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setClosing(false);
      const id = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(id);
    }
    setMounted(false);
    setConfirmExit(false);
  }, [open]);

  if (!open) return null;

  const DBG = "#1b1820"; const DCARD = "#262229"; const DTXT = "#ffffff";
  const DMUTE = "rgba(255,255,255,0.5)"; const DSTRIKE = "rgba(255,255,255,0.38)";
  const ACCENT = "#ff6b9d";
  const sel = PRODUCTS[0];
  const saved = sel.original - sel.price;
  const visible = mounted && !closing;
  const requestClose = () => setConfirmExit(true);
  const doExit = () => { setConfirmExit(false); setClosing(true); setTimeout(onClose, 320); };

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.6)", opacity: visible ? 1 : 0, transition: "opacity 0.3s ease" }} onClick={requestClose} />
      <div className="fixed bottom-0 z-50 overflow-y-auto rounded-t-3xl"
        style={{ left: "max(0px, calc(50vw - 240px))", width: "min(100%, 480px)", maxHeight: "92vh", backgroundColor: DBG, boxShadow: "0 -12px 40px rgba(0,0,0,0.5)", scrollbarWidth: "none", transform: visible ? "translateY(0)" : "translateY(100%)", transition: "transform 0.34s cubic-bezier(0.32,0.72,0,1)" }}>
        <div className="flex justify-center pt-3 pb-1">
          <div style={{ width: 40, height: 4, borderRadius: 99, background: "rgba(255,255,255,0.2)" }} />
        </div>
        <div className="px-5 pt-2 pb-7">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[18px] font-black" style={{ color: DTXT }}>연애궁합 결제 안내</h3>
            <button onClick={requestClose} className="flex items-center justify-center" style={{ width: 28, height: 28, color: "rgba(255,255,255,0.6)", fontSize: 18 }}>✕</button>
          </div>
          <div className="inline-block text-[13px] font-bold px-3.5 py-1.5 rounded-full mb-5"
            style={{ background: "rgba(224,70,90,0.16)", border: `1px solid ${ACCENT}55`, color: "#ff9aa6" }}>
            총 <span style={{ color: "#ff6b9d" }}>{saved.toLocaleString()}원</span> 할인받았어요!
          </div>
          <div className="mb-5">
            <div className="w-full text-left rounded-2xl px-4 py-3.5" style={{ backgroundColor: DCARD, border: `1.5px solid ${ACCENT}`, boxShadow: `0 0 0 3px ${ACCENT}22` }}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[14.5px] font-bold" style={{ color: DTXT }}>연애궁합</span>
                  <p className="text-[11.5px] mt-1" style={{ color: DMUTE }}>홍연이 들려주는 두 사람의 재회 이야기</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[11px]" style={{ color: DSTRIKE }}>
                    <span style={{ color: ACCENT, fontWeight: 700 }}>{sel.discount}%</span>{" "}
                    <span className="line-through">{sel.original.toLocaleString()}</span>
                  </p>
                  <p className="text-[16px] font-black mt-0.5" style={{ color: DTXT }}>{sel.price.toLocaleString()}원</p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center justify-between text-[13px]">
              <span style={{ color: DMUTE }}>상품 판매가 (정가)</span>
              <span style={{ color: "rgba(255,255,255,0.85)" }}>{sel.original.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span style={{ color: "#ff6b9d", fontWeight: 700 }}>지금 결제 시 할인 ({sel.discount}% 특가)</span>
              <span style={{ color: "#ff6b9d", fontWeight: 700 }}>-{saved.toLocaleString()}</span>
            </div>
          </div>
          <button onClick={() => onConfirm(selected)} className="w-full py-4 rounded-2xl font-black text-[17px] text-white active:scale-[0.99] transition-transform"
            style={{ background: "linear-gradient(135deg, #ff6b9d, #e1337d)", boxShadow: "0 6px 20px rgba(255,107,157,0.4)" }}>
            결제하기
          </button>
          <div className="flex items-center justify-center gap-2 mt-3.5">
            <span className="flex-shrink-0 flex items-center justify-center rounded" style={{ width: 16, height: 16, background: ACCENT, color: "#fff", fontSize: 10 }}>✓</span>
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
              style={{ width: 22, height: 22, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 12, lineHeight: 1 }}>✕</button>
            <p className="text-[14px] font-black pr-5" style={{ color: "#fff" }}>🎁 {saved.toLocaleString()}원 할인이 사라져요!</p>
            <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>이 혜택은 지금만 적용됩니다.</p>
            <button onClick={() => setConfirmExit(false)} className="w-full mt-3 py-2.5 rounded-xl text-[13.5px] font-bold text-white" style={{ background: "linear-gradient(135deg, #ff6b9d, #e1337d)" }}>혜택 받고 계속하기</button>
            <button onClick={doExit} className="w-full mt-2 py-2.5 rounded-xl text-[13px] font-bold" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)" }}>나가기</button>
          </div>
          <style>{`@keyframes popIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}`}</style>
        </div>
      )}

      {legalDoc && (
        <div className="fixed inset-0 z-[70]">
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setLegalDoc(null)} />
          <div className="fixed z-[71] flex flex-col rounded-2xl overflow-hidden"
            style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "min(80vw, 300px)", maxHeight: "56vh", background: "#fff", boxShadow: "0 20px 50px rgba(0,0,0,0.4)", animation: "legalPop 0.2s cubic-bezier(0.34,1.4,0.5,1)" }}>
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid #eee" }}>
              <span className="text-[13px] font-bold" style={{ color: "#111" }}>{legalDoc === "terms" ? "이용약관" : "개인정보처리방침"}</span>
              <button onClick={() => setLegalDoc(null)} className="flex items-center justify-center rounded-full" style={{ width: 24, height: 24, background: "#f1f1f1", color: "#666", fontSize: 13, lineHeight: 1 }}>✕</button>
            </div>
            <div className={`legal-scroll flex-1 overflow-y-auto px-4 pt-2 pb-6 ${LEGAL_DOC_CLASS} [&_h1]:hidden [&_h2:first-of-type]:border-t-0 [&_h2:first-of-type]:pt-0`}
              style={{ background: "#fff", zoom: 0.82, scrollbarWidth: "thin", scrollbarColor: "#cfcfcf transparent" } as React.CSSProperties}>
              {legalDoc === "terms" ? <TermsContent /> : <PrivacyContent />}
            </div>
          </div>
          <style>{`@keyframes legalPop{from{opacity:0;transform:translate(-50%,-50%) scale(0.9)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}.legal-scroll::-webkit-scrollbar{width:5px}.legal-scroll::-webkit-scrollbar-thumb{background:#cfcfcf;border-radius:3px}.legal-scroll::-webkit-scrollbar-track{background:transparent}`}</style>
        </div>
      )}
    </>
  );
}

// ─── 고정 결제 CTA ────────────────────────────────────────────────────────────
function StickyPayCTA({ onPay, name, partnerName }: { onPay: () => void; name: string; partnerName: string }) {
  const [glow, setGlow] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setGlow((g) => !g), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex-shrink-0 px-5 pb-7 pt-4"
      style={{ backgroundColor: WHITE, boxShadow: "0 -4px 20px rgba(0,0,0,0.08)" }}>
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] line-through" style={{ color: GRAY3 }}>₩59,800</span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "#fff0f2", color: RED_SOFT, border: `1px solid ${ROSE}` }}>특가 -50%</span>
        </div>
        <span className="text-[24px] font-bold" style={{ color: GRAY1 }}>₩29,900</span>
      </div>
      <button onClick={onPay}
        className="w-full py-4 rounded-2xl font-bold text-[16px] text-white flex items-center justify-center gap-2 active:scale-95 transition-all"
        style={{ backgroundColor: RED, boxShadow: glow ? `0 4px 24px ${RED}88` : `0 2px 12px ${RED}44`, transition: "box-shadow 1s ease" }}>
        <span>🔓</span>
        <span>{name}님 · {partnerName}님 연애궁합 확인하기</span>
      </button>
    </div>
  );
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────
function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const name           = searchParams.get("name")           ?? "고객";
  const date           = searchParams.get("date")           ?? "";
  const time           = searchParams.get("time")           ?? "시간 모름";
  const calendar       = searchParams.get("calendar")       ?? "양력";
  const gender         = searchParams.get("gender")         ?? "";
  const email          = searchParams.get("email")          ?? "";
  const concern        = searchParams.get("concern")        ?? "";
  const partnerName    = searchParams.get("partnerName")    ?? "상대방";
  const partnerDate    = searchParams.get("partnerDate")    ?? "";
  const partnerTime    = searchParams.get("partnerTime")    ?? "시간 모름";
  const partnerCalendar = searchParams.get("partnerCalendar") ?? "양력";
  const partnerGender  = searchParams.get("partnerGender")  ?? "";

  const saju        = useMemo(() => calcSaju(date, time, calendar), [date, time, calendar]);
  const partnerSaju = useMemo(() => calcSaju(partnerDate, partnerTime, partnerCalendar), [partnerDate, partnerTime, partnerCalendar]);

  const [showSheet, setShowSheet] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleConfirm = async () => {
    setShowSheet(false);
    const product = PRODUCTS[0];
    setCreating(true);
    try {
      const res = await fetch("/api/kunghap_yeonae-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, date, time, calendar, gender, email, partnerName, partnerDate, partnerTime, partnerCalendar, partnerGender }),
      });
      const d = res.ok ? await res.json() : null;
      const reportUrl = d?.resultId
        ? `https://www.hongyeondang.com/saju/kunghap_yeonae/report?id=${d.resultId}`
        : `https://www.hongyeondang.com/saju/kunghap_yeonae/report?${new URLSearchParams({ name, date, time, calendar, gender, email, partnerName, partnerDate, partnerTime, partnerCalendar, partnerGender, ch: "0" }).toString()}`;
      if (d?.resultId) {
        router.push(`/saju/kunghap_yeonae/report?id=${d.resultId}`);
      } else {
        router.push(`/saju/kunghap_yeonae/report?${new URLSearchParams({ name, date, time, calendar, gender, email, partnerName, partnerDate, partnerTime, partnerCalendar, partnerGender, ch: "0" }).toString()}`);
      }
    } catch {
      router.push(`/saju/kunghap_yeonae/report?${new URLSearchParams({ name, date, time, calendar, gender, email, partnerName, partnerDate, partnerTime, partnerCalendar, partnerGender, ch: "0" }).toString()}`);
    }
  };

  if (creating) return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 z-50" style={{ background: "#fdf8f4" }}>
      <svg className="animate-spin" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8b2e14" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.2"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
      <div className="text-center px-8">
        <p className="text-[16px] font-bold" style={{ color: "#3a1a0a", fontFamily: "'Noto Serif KR', serif" }}>결과지를 완성하고 있소…</p>
        <p className="text-[13px] mt-2 leading-relaxed" style={{ color: "#7a5a40" }}>16장 풀이와 사주 원국 이미지를<br />모두 생성하는 중이오.<br /><br />1~2분 정도 소요되오니<br />이 화면을 벗어나도 괜찮소.<br /><br />입력하신 이메일로 결과지 링크를<br />보내드렸으니 언제든 확인하실 수 있소.</p>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: CREAM }}>
      <div className="flex-1 min-h-0 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>

        {/* ① 헤더 이미지 + 제목 */}
        <ImageTextBlock
          topImgSrc="/media/cards/kunghap_yeonae/jaehwe-1.jpg"
          bottomImgSrc="/media/cards/kunghap_yeonae/jaehwe-2.jpg"
          label="연애궁합 · 정밀 리포트"
          headline={`${name}님과\n${partnerName}님의 인연,\n낱낱이 봤어요`}
          accentWord="낱낱이"
          bgColor={WHITE}
        />

        {/* ② 두 사람 명식 */}
        <div style={{ backgroundColor: WHITE }}>
          <p className="text-center text-[12px] tracking-widest pt-5 pb-2" style={{ color: RED }}>✦ 사주 명식 ✦</p>
          <div className="flex gap-3 px-5 pb-5">
            <DoubleMini saju={saju} label={`${name}님`} />
            <div style={{ width: 1, backgroundColor: GRAY4, flexShrink: 0 }} />
            <DoubleMini saju={partnerSaju} label={`${partnerName}님`} />
          </div>
        </div>

        {/* ③ 분석 섹션 헤더 */}
        <ImageTextBlock
          topImgSrc="/media/cards/kunghap_yeonae/jaehwe-3.jpg"
          bottomImgSrc="/media/cards/kunghap_yeonae/jaehwe-1.jpg"
          label="AI 정밀 재회 분석 · 5가지 항목"
          headline={`두 사람의 운명,\n이제\n알려드릴게요`}
          accentWord="이제"
          bgColor={CREAM}
        />

        {/* ④ 분석 섹션 */}
        <div className="pb-5" style={{ backgroundColor: CREAM }}>
          {SECTIONS.slice(0, 3).map((s, i) => <AnalysisSection key={i} s={s} />)}
        </div>

        <ImageDivider src="/media/cards/kunghap_yeonae/jaehwe-2.jpg" bgColor={CREAM} />

        <div className="py-5" style={{ backgroundColor: CREAM }}>
          {SECTIONS.slice(3).map((s, i) => <AnalysisSection key={i} s={s} />)}
        </div>

        {/* ⑤ 후기 이미지 + 텍스트 */}
        <ImageTextBlock
          topImgSrc="/media/cards/kunghap_yeonae/jaehwe-3.jpg"
          bottomImgSrc="/media/cards/kunghap_yeonae/jaehwe-2.jpg"
          label="실제 이용 후기"
          headline={`이미 수천 명이\n확인한\n그 정확함`}
          accentWord="그 정확함"
          bgColor={WHITE}
        />

        {/* ⑥ 후기 */}
        <ReviewSection />
        <div className="h-4" />
      </div>

      <StickyPayCTA onPay={() => setShowSheet(true)} name={name} partnerName={partnerName} />
      <PayBottomSheet open={showSheet} onClose={() => setShowSheet(false)} onConfirm={handleConfirm} />
    </div>
  );
}

export default function JaehweCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: CREAM }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: RED, borderTopColor: "transparent" }} />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
