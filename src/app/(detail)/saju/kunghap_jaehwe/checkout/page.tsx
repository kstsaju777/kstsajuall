"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useMemo, useState, useEffect, useRef } from "react";
import { calcSaju, type LocalSajuResult } from "@/lib/saju/local-manseryeok";
import { ganCharImage, jiCharImage } from "@/lib/saju/char-image";
import { LEGAL_DOC_CLASS, TermsContent, PrivacyContent } from "@/components/legal/legal-content";

// ─── 디자인 토큰 ──────────────────────────────────────────────────────────────
const CREAM    = "#fdf8f4";
const WHITE    = "#ffffff";
const RED      = "#9b2335";
const RED_SOFT = "#c1394d";
const RED_PALE = "#fdf0f2";
const ROSE     = "#e8a0ab";
const GRAY1    = "#1a1a1a";
const GRAY2    = "#444444";
const GRAY3    = "#888888";
const GRAY4    = "#dddddd";
const CARD_BG  = "#ffffff";

const PILLAR_LABELS = ["시주", "일주", "월주", "년주"] as const;

// ─── 스크롤 슬라이드 인 훅 ────────────────────────────────────────────────────
function useSlideIn(direction: "left" | "right" = "left") {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const style: React.CSSProperties = {
    transform: visible ? "translateX(0)" : direction === "left" ? "translateX(-60px)" : "translateX(60px)",
    opacity: visible ? 1 : 0,
    transition: "transform 0.55s cubic-bezier(0.22,1,0.36,1), opacity 0.55s ease",
  };

  return { ref, style };
}

// ─── 명식 카드 (슬라이드 인) ──────────────────────────────────────────────────
function MyeongsikCard({
  saju, label, direction,
}: {
  saju: LocalSajuResult | null;
  label: string;
  direction: "left" | "right";
}) {
  const { ref, style } = useSlideIn(direction);
  const pillars = saju
    ? [saju.pillars.time, saju.pillars.day, saju.pillars.month, saju.pillars.year]
    : null;

  return (
    <div ref={ref} style={{ ...style, flex: 1 }}>
      <div className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: WHITE, border: `1px solid ${GRAY4}`, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <div className="py-2.5 text-center" style={{ backgroundColor: RED_PALE, borderBottom: `1px solid ${ROSE}` }}>
          <p className="text-[12px] font-bold" style={{ color: RED }}>{label}</p>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-4 gap-1.5">
            {(pillars ?? Array(4).fill(null)).map((p, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <p className="text-[9px] font-medium tracking-wider" style={{ color: GRAY3 }}>{PILLAR_LABELS[i]}</p>
                <span style={{ fontSize: 9, color: RED, lineHeight: 1 }}>{p?.stemSs || " "}</span>
                <div className="w-full aspect-square flex items-center justify-center">
                  {p ? <img src={ganCharImage(p.stem)} alt={p.stem} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    : <div className="w-full h-full animate-pulse rounded" style={{ backgroundColor: "#eee" }} />}
                </div>
                <div className="w-full aspect-square flex items-center justify-center">
                  {p ? <img src={jiCharImage(p.branch)} alt={p.branch} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    : <div className="w-full h-full animate-pulse rounded" style={{ backgroundColor: "#eee" }} />}
                </div>
                <span style={{ fontSize: 9, color: RED, lineHeight: 1 }}>{p?.branchSs || " "}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 히어로 섹션 ──────────────────────────────────────────────────────────────
function HeroSection({ name, partnerName }: { name: string; partnerName: string }) {
  return (
    <div style={{ backgroundColor: WHITE }}>
      {/* 카피 텍스트 */}
      <div className="px-6 pt-10 pb-5 text-center">
        <p className="text-[11px] tracking-[0.2em] mb-3 font-medium" style={{ color: RED }}>재회궁합 · 정밀 리포트</p>
        <h1 className="text-[26px] font-black leading-snug" style={{ color: GRAY1 }}>
          두 사람의 재회,<br />
          사주가 <span style={{ color: RED }}>모두</span> 알고 있소
        </h1>
        <p className="text-[13px] mt-3 leading-relaxed" style={{ color: GRAY2 }}>
          {name}님과 {partnerName}님의 팔자를<br />
          낱낱이 풀었소. 지금 확인하시오.
        </p>
      </div>

      {/* 영상 */}
      <div className="relative overflow-hidden w-full" style={{ aspectRatio: "9/16" }}>
        <div className="absolute top-0 left-0 right-0 h-20 pointer-events-none z-10"
          style={{ background: `linear-gradient(to bottom, ${WHITE}, transparent)` }} />
        <video
          src="/media/cards/kunghap_jaehwe/jaehwe-0.mp4"
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(255,255,255,0.55)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none z-10"
          style={{ background: `linear-gradient(to bottom, transparent, ${WHITE})` }} />
      </div>
    </div>
  );
}

// ─── 두 사람 명식 섹션 ────────────────────────────────────────────────────────
function MyeongsikSection({
  saju, partnerSaju, name, partnerName,
}: {
  saju: LocalSajuResult | null;
  partnerSaju: LocalSajuResult | null;
  name: string;
  partnerName: string;
}) {
  return (
    <div style={{ backgroundColor: WHITE }}>
      <div className="px-5 pb-2">
        <p className="text-center text-[11px] tracking-[0.2em] mb-1 font-medium" style={{ color: RED }}>✦ 사주 명식 ✦</p>
        <p className="text-center text-[13px] font-bold mb-4" style={{ color: GRAY1 }}>두 사람의 팔자가 품은 이야기</p>
        <div className="flex gap-3">
          <MyeongsikCard saju={saju} label={`${name}님`} direction="left" />
          <div style={{ width: 1, backgroundColor: GRAY4, flexShrink: 0, alignSelf: "stretch" }} />
          <MyeongsikCard saju={partnerSaju} label={`${partnerName}님`} direction="right" />
        </div>
      </div>
      <div className="h-6" />
    </div>
  );
}

// ─── 분석 미리보기 섹션 ───────────────────────────────────────────────────────
const PREVIEW_SECTIONS = [
  {
    icon: "🕊️", title: "두 사람의 재회 가능성", free: true,
    content: "각자의 일간과 오행 구성을 바탕으로 두 사람의 재회 가능성을 분석합니다. 헤어진 이후에도 남아있는 인연의 기운이 사주 속에 담겨 있습니다.\n\n다시 만날 운명인지, 아니면 새로운 시작을 준비해야 할지 사주는 조용히 알고 있습니다.",
    blurLines: [],
  },
  {
    icon: "💭", title: "상대방의 그리움과 현재 마음", free: false,
    content: "",
    blurLines: [
      "상대방의 일간 기준으로 당신은 ████에 해당합니다.",
      "헤어진 후 상대방의 마음속에 당신은 ████한 존재로 남아있습니다.",
      "현재 상대방이 그리워하는 정도는 ████에 이릅니다.",
    ],
  },
  {
    icon: "🌸", title: "재회를 앞당기는 시기", free: false,
    content: "",
    blurLines: [
      "두 사람이 다시 이어질 수 있는 시기는 ████년 ████월입니다.",
      "현재 두 사람의 대운은 ████으로 ████한 기운이 작용합니다.",
      "이 시기를 놓치면 다음 재회 기운은 ████년 이후로 밀립니다.",
    ],
  },
  {
    icon: "🔑", title: "재회를 여는 결정적 행동", free: false,
    content: "",
    blurLines: [
      "상대방에게 효과적인 접근 방식은 ████한 태도입니다.",
      "████ 방향의 연락과 ████한 행동이 마음을 움직입니다.",
      "████년 ████월은 재회 시도에 가장 유리한 시기입니다.",
    ],
  },
  {
    icon: "⚡", title: "재회를 막는 요인", free: false,
    content: "",
    blurLines: [
      "당신의 사주에서 ████살이 재회를 방해하고 있습니다.",
      "████ 방향의 접근과 ████한 행동은 반드시 피하세요.",
      "████년 ████월은 특별히 주의가 필요한 시기입니다.",
    ],
  },
];

function PreviewCard({ s }: { s: typeof PREVIEW_SECTIONS[number] }) {
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
                <p key={i} className="text-[13px] leading-relaxed"
                  style={{ color: GRAY2, filter: "blur(5.5px)", userSelect: "none" }}>
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

function PreviewSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); observer.disconnect(); } }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      backgroundColor: CREAM,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(30px)",
      transition: "opacity 0.6s ease, transform 0.6s ease",
    }}>
      <div className="pt-7 pb-2 text-center px-5">
        <p className="text-[11px] tracking-[0.2em] mb-1 font-medium" style={{ color: RED }}>✦ AI 정밀 분석 · 14장 ✦</p>
        <h2 className="text-[20px] font-black mb-1.5" style={{ color: GRAY1 }}>두 사람의 운명, 이제 확인하오</h2>
        <p className="text-[12px]" style={{ color: GRAY3 }}>일부 내용은 결제 후 열람할 수 있소</p>
      </div>
      <div className="pt-4 pb-5">
        {PREVIEW_SECTIONS.map((s, i) => <PreviewCard key={i} s={s} />)}
      </div>
    </div>
  );
}

// ─── 목차 섹션 ───────────────────────────────────────────────────────────────
const CHAPTER_LIST = [
  { ch: 1,  title: "사주 원국",         emoji: "🏛️" },
  { ch: 2,  title: "운명의 구조",        emoji: "🔮" },
  { ch: 3,  title: "인간관계",           emoji: "🤝" },
  { ch: 4,  title: "숨겨진 특징",        emoji: "🌙" },
  { ch: 5,  title: "재물과 직업",        emoji: "💰" },
  { ch: 6,  title: "사랑과 결혼",        emoji: "💑" },
  { ch: 7,  title: "건강",              emoji: "🌿" },
  { ch: 8,  title: "귀인",              emoji: "✨" },
  { ch: 9,  title: "주의할 사람",        emoji: "⚠️" },
  { ch: 10, title: "굴곡과 위기",        emoji: "⚡" },
  { ch: 11, title: "대운 흐름",          emoji: "🌊" },
  { ch: 12, title: "주의 시기",          emoji: "📅" },
  { ch: 13, title: "당부의 말",          emoji: "📝" },
  { ch: 14, title: "개운법",            emoji: "🌸" },
];

function TableOfContents() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); observer.disconnect(); } }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="px-5 py-7" style={{
      backgroundColor: WHITE,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(30px)",
      transition: "opacity 0.6s ease, transform 0.6s ease",
    }}>
      <p className="text-center text-[11px] tracking-[0.2em] mb-1 font-medium" style={{ color: RED }}>✦ 목차 ✦</p>
      <h2 className="text-center text-[20px] font-black mb-4" style={{ color: GRAY1 }}>총 14장 구성</h2>
      <div className="space-y-2">
        {CHAPTER_LIST.map(({ ch, title, emoji }, i) => (
          <div key={ch} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{
              backgroundColor: CREAM,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(-20px)",
              transition: `opacity 0.4s ease ${i * 0.04}s, transform 0.4s ease ${i * 0.04}s`,
            }}>
            <span className="text-[13px] w-5 text-center flex-shrink-0">{emoji}</span>
            <span className="text-[12px] font-medium flex-shrink-0" style={{ color: RED, minWidth: 32 }}>제{ch}장</span>
            <span className="text-[13px] font-bold" style={{ color: GRAY1 }}>{title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 후기 섹션 ───────────────────────────────────────────────────────────────
const REVIEWS = [
  { star: 5, text: "두 사람의 재회 가능성이 이렇게 정확하게 나올 줄 몰랐어요. 상대방 성격 분석이 소름돋을 정도로 맞았습니다.", name: "30대 직장인 김○○", date: "2025.05.12" },
  { star: 5, text: "재회 시기가 딱 맞았어요. 홍연이 알려준 대로 접근했더니 다시 연락이 왔습니다.", name: "20대 대학생 이○○", date: "2025.04.28" },
  { star: 5, text: "두 사람 모두 분석해주는 게 정말 좋았어요. 상대방 입장에서 이해할 수 있게 됐습니다.", name: "30대 자영업자 박○○", date: "2025.05.03" },
  { star: 5, text: "막연하게 불안했는데, 재회 가능성을 딱 짚어줘서 용기를 낼 수 있었어요.", name: "20대 대학원생 최○○", date: "2025.06.01" },
];

function ReviewSection() {
  return (
    <div className="px-5 py-7" style={{ backgroundColor: CREAM }}>
      <p className="text-center text-[11px] tracking-[0.2em] mb-1 font-medium" style={{ color: RED }}>✦ 실제 후기 ✦</p>
      <h2 className="text-center text-[20px] font-black mb-4" style={{ color: GRAY1 }}>이미 수천 명이 확인했소</h2>
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

// ─── FAQ 섹션 ────────────────────────────────────────────────────────────────
const FAQS = [
  { q: "결과지는 얼마나 걸리나요?", a: "결제 직후 약 1~2분 내에 자동 생성됩니다. 입력하신 이메일로도 링크를 보내드려, 언제든 다시 확인하실 수 있소." },
  { q: "상대방 생년월일이 정확하지 않으면요?", a: "시주까지 입력할 수 있으나, 시간을 모르는 경우도 분석이 가능하오. 다만 시주 관련 항목의 정확도는 다소 낮을 수 있소." },
  { q: "어떤 항목을 분석하나요?", a: "두 사람의 재회 가능성, 상대방의 현재 마음, 재회를 앞당기는 시기, 결정적 행동, 방해 요인 등 총 14장에 걸쳐 상세히 풀이하오." },
  { q: "환불이 가능한가요?", a: "AI가 생성한 콘텐츠 특성상, 결과지가 생성된 후에는 환불이 어렵습니다. 구매 전 신중히 결정해주시오." },
];

function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="px-5 py-7" style={{ backgroundColor: WHITE }}>
      <p className="text-center text-[11px] tracking-[0.2em] mb-1 font-medium" style={{ color: RED }}>✦ FAQ ✦</p>
      <h2 className="text-center text-[20px] font-black mb-4" style={{ color: GRAY1 }}>자주 묻는 질문</h2>
      <div className="space-y-2">
        {FAQS.map((faq, i) => (
          <div key={i} className="rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${openIdx === i ? ROSE : GRAY4}`, transition: "border-color 0.2s" }}>
            <button
              className="w-full flex items-center justify-between px-4 py-3.5 text-left"
              style={{ backgroundColor: openIdx === i ? RED_PALE : WHITE }}
              onClick={() => setOpenIdx(openIdx === i ? null : i)}>
              <span className="text-[13.5px] font-bold pr-2" style={{ color: GRAY1 }}>{faq.q}</span>
              <span className="flex-shrink-0 text-[18px] font-light transition-transform duration-200"
                style={{ color: RED, transform: openIdx === i ? "rotate(45deg)" : "rotate(0deg)" }}>+</span>
            </button>
            {openIdx === i && (
              <div className="px-4 pb-4 pt-1" style={{ backgroundColor: RED_PALE }}>
                <p className="text-[13px] leading-relaxed" style={{ color: GRAY2 }}>{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 결제 모달 ────────────────────────────────────────────────────────────────
const PRODUCT = { name: "재회궁합", original: 49800, discount: 50, price: 24900 };

function PayBottomSheet({ open, onClose, onConfirm }: {
  open: boolean; onClose: () => void; onConfirm: () => void;
}) {
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
  const ACCENT = "#9b2335";
  const saved = PRODUCT.original - PRODUCT.price;
  const visible = mounted && !closing;
  const requestClose = () => setConfirmExit(true);
  const doExit = () => { setConfirmExit(false); setClosing(true); setTimeout(onClose, 320); };

  return (
    <>
      <div className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.6)", opacity: visible ? 1 : 0, transition: "opacity 0.3s ease" }}
        onClick={requestClose} />
      <div className="fixed bottom-0 z-50 overflow-y-auto rounded-t-3xl"
        style={{ left: "max(0px, calc(50vw - 240px))", width: "min(100%, 480px)", maxHeight: "92vh", backgroundColor: DBG, boxShadow: "0 -12px 40px rgba(0,0,0,0.5)", scrollbarWidth: "none", transform: visible ? "translateY(0)" : "translateY(100%)", transition: "transform 0.34s cubic-bezier(0.32,0.72,0,1)" }}>
        <div className="flex justify-center pt-3 pb-1">
          <div style={{ width: 40, height: 4, borderRadius: 99, background: "rgba(255,255,255,0.2)" }} />
        </div>
        <div className="px-5 pt-2 pb-7">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[18px] font-black" style={{ color: DTXT }}>재회궁합 결제 안내</h3>
            <button onClick={requestClose} className="flex items-center justify-center" style={{ width: 28, height: 28, color: "rgba(255,255,255,0.6)", fontSize: 18 }}>✕</button>
          </div>
          <div className="inline-block text-[13px] font-bold px-3.5 py-1.5 rounded-full mb-5"
            style={{ background: "rgba(155,35,53,0.16)", border: `1px solid ${ACCENT}55`, color: "#e8a0ab" }}>
            총 <span style={{ color: "#9b2335" }}>{saved.toLocaleString()}원</span> 할인받았어요!
          </div>
          <div className="mb-5">
            <div className="w-full text-left rounded-2xl px-4 py-3.5"
              style={{ backgroundColor: DCARD, border: `1.5px solid ${ACCENT}`, boxShadow: `0 0 0 3px ${ACCENT}22` }}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[14.5px] font-bold" style={{ color: DTXT }}>재회궁합</span>
                  <p className="text-[11.5px] mt-1" style={{ color: DMUTE }}>홍연이 들려주는 두 사람의 재회 이야기</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[11px]" style={{ color: DSTRIKE }}>
                    <span style={{ color: ACCENT, fontWeight: 700 }}>{PRODUCT.discount}%</span>{" "}
                    <span className="line-through">{PRODUCT.original.toLocaleString()}</span>
                  </p>
                  <p className="text-[16px] font-black mt-0.5" style={{ color: DTXT }}>{PRODUCT.price.toLocaleString()}원</p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center justify-between text-[13px]">
              <span style={{ color: DMUTE }}>상품 판매가 (정가)</span>
              <span style={{ color: "rgba(255,255,255,0.85)" }}>{PRODUCT.original.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span style={{ color: "#c1394d", fontWeight: 700 }}>지금 결제 시 할인 ({PRODUCT.discount}% 특가)</span>
              <span style={{ color: "#c1394d", fontWeight: 700 }}>-{saved.toLocaleString()}</span>
            </div>
          </div>
          <button onClick={onConfirm}
            className="w-full py-4 rounded-2xl font-black text-[17px] text-white active:scale-[0.99] transition-transform"
            style={{ background: "linear-gradient(135deg, #c1394d, #9b2335)", boxShadow: "0 6px 20px rgba(155,35,53,0.4)" }}>
            결제하기
          </button>
          <div className="flex items-center justify-center gap-2 mt-3.5">
            <span className="flex-shrink-0 flex items-center justify-center rounded"
              style={{ width: 16, height: 16, background: ACCENT, color: "#fff", fontSize: 10 }}>✓</span>
            <p className="text-[11px] leading-relaxed" style={{ color: DMUTE }}>
              결제 시{" "}
              <button onClick={() => setLegalDoc("privacy")} className="underline" style={{ color: "rgba(255,255,255,0.78)" }}>개인정보 처리방침</button>과{" "}
              <button onClick={() => setLegalDoc("terms")} className="underline" style={{ color: "rgba(255,255,255,0.78)" }}>이용약관</button>에 동의합니다.
            </p>
          </div>
        </div>
      </div>

      {confirmExit && (
        <div className="fixed z-[60] px-6"
          style={{ left: "max(0px, calc(50vw - 240px))", width: "min(100%, 480px)", top: "34%", pointerEvents: "none" }}>
          <div className="relative mx-auto rounded-2xl px-5 py-4"
            style={{ pointerEvents: "auto", maxWidth: 290, background: "#211d27", boxShadow: "0 14px 40px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", animation: "popIn 0.2s cubic-bezier(0.34,1.4,0.5,1)" }}>
            <button onClick={() => setConfirmExit(false)}
              className="absolute top-2.5 right-2.5 flex items-center justify-center rounded-full"
              style={{ width: 22, height: 22, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 12, lineHeight: 1 }}>✕</button>
            <p className="text-[14px] font-black pr-5" style={{ color: "#fff" }}>🎁 {saved.toLocaleString()}원 할인이 사라져요!</p>
            <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>이 혜택은 지금만 적용됩니다.</p>
            <button onClick={() => setConfirmExit(false)}
              className="w-full mt-3 py-2.5 rounded-xl text-[13.5px] font-bold text-white"
              style={{ background: "linear-gradient(135deg, #c1394d, #9b2335)" }}>혜택 받고 계속하기</button>
            <button onClick={doExit}
              className="w-full mt-2 py-2.5 rounded-xl text-[13px] font-bold"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)" }}>나가기</button>
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
              <button onClick={() => setLegalDoc(null)}
                className="flex items-center justify-center rounded-full"
                style={{ width: 24, height: 24, background: "#f1f1f1", color: "#666", fontSize: 13, lineHeight: 1 }}>✕</button>
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
const SURNAMES = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오", "서", "신", "권"];
const ENDINGS  = ["지", "은", "현", "수", "민", "호", "아", "연", "준", "서", "영", "우", "빈", "진"];
const TIMES    = ["방금", "방금 전", "1분 전", "2분 전", "3분 전", "5분 전", "7분 전"];
const TIME_COLORS: Record<string, string> = {
  "방금": "#9b2335", "방금 전": "#9b2335",
  "1분 전": "#9b2335", "2분 전": "#9b2335",
  "3분 전": "#b5651d", "5분 전": "#6c757d", "7분 전": "#6c757d",
};
function randomName() {
  return SURNAMES[Math.floor(Math.random() * SURNAMES.length)] + "*" + ENDINGS[Math.floor(Math.random() * ENDINGS.length)];
}
function randomTime() { return TIMES[Math.floor(Math.random() * TIMES.length)]; }

function ToastLayer() {
  const [toasts, setToasts] = useState<{ id: number; name: string; time: string }[]>([]);
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const addToast = () => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, name: randomName(), time: randomTime() }]);
      timers.push(setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000));
    };
    const schedule = () => {
      const delay = 2500 + Math.random() * 5500;
      timers.push(setTimeout(() => {
        addToast();
        if (Math.random() < 0.3) timers.push(setTimeout(addToast, 500));
        schedule();
      }, delay));
    };
    schedule();
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <>
      <style>{`@keyframes toastInRight{from{opacity:0;transform:translateX(60px)}to{opacity:1;transform:translateX(0)}}`}</style>
      <div style={{ position: "fixed", bottom: 100, right: "max(8px, calc(50vw - 232px))", zIndex: 49, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, pointerEvents: "none" }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ animation: "toastInRight 0.35s ease", display: "flex", alignItems: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 9999, padding: "6px 14px", fontSize: 12, color: "#fff", whiteSpace: "nowrap", backdropFilter: "blur(6px)" }}>
            <span style={{ backgroundColor: TIME_COLORS[t.time] ?? "#9b2335", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 9999, padding: "2px 7px" }}>{t.time}</span>
            <span><b>{t.name}</b>님이 신청하였습니다.</span>
          </div>
        ))}
      </div>
    </>
  );
}

function StickyPayCTA({ onPay }: { onPay: () => void; name: string; partnerName: string }) {
  const [timeLeft, setTimeLeft] = useState("22:14:08");
  useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const DURATION = 6 * 3600000 + 22 * 60000 + 14 * 1000 + 80;
    const endTime = Date.now() + DURATION;
    const tick = () => {
      let diff = Math.max(0, endTime - Date.now());
      const h = Math.floor(diff / 3600000); diff %= 3600000;
      const m = Math.floor(diff / 60000);   diff %= 60000;
      const s = Math.floor(diff / 1000);    diff %= 1000;
      const cs = Math.floor(diff / 10);
      setTimeLeft(`${pad(m)}:${pad(s)}:${pad(cs)}`);
    };
    tick();
    const id = setInterval(tick, 50);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed bottom-0 flex items-center gap-3 px-4 z-50"
      style={{ left: "max(0px, calc(50vw - 240px))", width: "min(100%, 480px)", height: 80, backgroundColor: "#141414" } as React.CSSProperties}>
      {/* 왼쪽: 타이머 */}
      <div className="flex flex-col items-start flex-shrink-0">
        <span className="text-[13px] font-bold tracking-wider" style={{ color: RED }}>할인 혜택까지</span>
        <span className="text-[18px] font-black tabular-nums" style={{ color: WHITE }}>{timeLeft}</span>
      </div>
      {/* 구분선 */}
      <div style={{ width: 1, height: 36, backgroundColor: "rgba(255,255,255,0.15)", flexShrink: 0 }} />
      {/* 오른쪽: 버튼 */}
      <style>{`
        @keyframes jaehweBtnNeon {
          0%   { background: #9b2335; box-shadow: 0 0 12px 3px rgba(155,35,53,0.7); }
          33%  { background: #7a1b29; box-shadow: 0 0 12px 3px rgba(122,27,41,0.7); }
          66%  { background: #bf2d42; box-shadow: 0 0 12px 3px rgba(191,45,66,0.7); }
          100% { background: #9b2335; box-shadow: 0 0 12px 3px rgba(155,35,53,0.7); }
        }
        @keyframes jaehweBtnBeat {
          0%, 40%, 60%, 100% { transform: scale(1); }
          20% { transform: scale(1.05); }
          50% { transform: scale(1.03); }
        }
      `}</style>
      <button onClick={onPay}
        className="flex-1 py-3.5 rounded-2xl font-black text-[18px] text-white flex items-center justify-center"
        style={{ animation: "jaehweBtnNeon 3s ease-in-out infinite, jaehweBtnBeat 2s ease-in-out infinite" }}>
        재회궁합 확인하기
      </button>
    </div>
  );
}

// ─── 생성 로딩 화면 ───────────────────────────────────────────────────────────
const CHAPTER_TITLES = [
  "제1장 — 사주 원국", "제2장 — 운명의 구조", "제3장 — 인간관계",
  "제4장 — 숨겨진 특징", "제5장 — 재물과 직업", "제6장 — 사랑과 결혼",
  "제7장 — 건강", "제8장 — 귀인", "제9장 — 주의할 사람",
  "제10장 — 굴곡과 위기", "제11장 — 대운 흐름", "제12장 — 주의 시기",
  "제13장 — 당부의 말", "제14장 — 개운법",
];
const TOTAL = 14;

function CreatingScreen({ doneCount, currentChapter }: { doneCount: number; currentChapter: number }) {
  const pct = Math.round((doneCount / TOTAL) * 100);
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 px-8"
      style={{ background: "radial-gradient(ellipse at 50% 40%, #1a0010 0%, #0a0208 100%)" }}>
      <style>{`
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }
        @keyframes glow-pulse { 0%,100%{box-shadow:0 0 8px 2px #ff4499aa,0 0 20px 4px #cc007755} 50%{box-shadow:0 0 16px 4px #ff66bbcc,0 0 40px 10px #ff44aa88} }
        @keyframes title-fade { 0%{opacity:0;transform:translateY(6px)} 20%{opacity:1;transform:translateY(0)} 80%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-6px)} }
        @keyframes orbit { 0%{transform:rotate(0deg) translateX(38px) rotate(0deg)} 100%{transform:rotate(360deg) translateX(38px) rotate(-360deg)} }
      `}</style>
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, #ff336622 0%, transparent 70%)" }} />
        {[0,1,2,3,4,5].map(i => (
          <div key={i} className="absolute w-1 h-1 rounded-full" style={{
            top: "50%", left: "50%", marginTop: "-2px", marginLeft: "-2px",
            background: i % 2 === 0 ? "#ff6699" : "#ffaacc",
            boxShadow: `0 0 6px 2px ${i % 2 === 0 ? "#ff3366" : "#ff88aa"}`,
            animation: `orbit ${2.5 + i * 0.4}s linear infinite`,
            animationDelay: `${i * -0.5}s`,
          }} />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{ fontSize: 28, filter: "drop-shadow(0 0 8px #ff3366)" }}>✦</span>
        </div>
      </div>
      <p className="text-[18px] font-bold mb-1" style={{ color: "#fff5ee", fontFamily: "'Noto Serif KR', serif", textShadow: "0 0 20px #ff336688" }}>
        결과지를 완성하고 있소…
      </p>
      <p key={currentChapter} className="text-[13px] mb-8" style={{ color: "#ff99bb", animation: "title-fade 4s ease-in-out", minHeight: 20 }}>
        {doneCount < TOTAL ? CHAPTER_TITLES[currentChapter - 1] + " 풀이 중" : "마무리 중이오…"}
      </p>
      <div className="w-full max-w-[280px] mb-3">
        <div className="flex justify-between text-[11px] mb-2" style={{ color: "#cc7799" }}>
          <span>{doneCount} / {TOTAL} 장 완성</span>
          <span>{pct}%</span>
        </div>
        <div className="w-full h-3 rounded-full overflow-hidden relative" style={{ background: "#1a0810" }}>
          <div className="h-full rounded-full relative overflow-hidden transition-all duration-700"
            style={{ width: `${pct}%`, background: "linear-gradient(90deg, #8b1a40, #ff4488, #ff88bb)", animation: pct > 0 ? "glow-pulse 1.8s ease-in-out infinite" : "none" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)", animation: "shimmer 1.6s linear infinite", width: "40%" }} />
          </div>
        </div>
      </div>
      <p className="text-[11px] text-center leading-relaxed mt-4" style={{ color: "#886677" }}>
        풀이가 완성되면 자동으로 열리오.<br />이 창을 벗어나셔도 입력하신 이메일로<br />결과지 링크를 보내드렸으니 언제든 확인하실 수 있소.
      </p>
    </div>
  );
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────
function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const name            = searchParams.get("name")            ?? "고객";
  const date            = searchParams.get("date")            ?? "";
  const time            = searchParams.get("time")            ?? "시간 모름";
  const calendar        = searchParams.get("calendar")        ?? "양력";
  const gender          = searchParams.get("gender")          ?? "";
  const email           = searchParams.get("email")           ?? "";
  const partnerName     = searchParams.get("partnerName")     ?? "상대방";
  const partnerDate     = searchParams.get("partnerDate")     ?? "";
  const partnerTime     = searchParams.get("partnerTime")     ?? "시간 모름";
  const partnerCalendar = searchParams.get("partnerCalendar") ?? "양력";
  const partnerGender   = searchParams.get("partnerGender")   ?? "";

  const saju        = useMemo(() => calcSaju(date, time, calendar), [date, time, calendar]);
  const partnerSaju = useMemo(() => calcSaju(partnerDate, partnerTime, partnerCalendar), [partnerDate, partnerTime, partnerCalendar]);

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
      const res = await fetch("/api/kunghap_jaehwe-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, date, time, calendar, gender, email, partnerName, partnerDate, partnerTime, partnerCalendar, partnerGender }),
      });
      if (!res.ok) {
        router.push(`/saju/kunghap_jaehwe/report-preview?${new URLSearchParams({ name, gender, partnerName, partnerGender }).toString()}`);
        return;
      }
      const { resultId } = await res.json();
      if (!resultId) {
        router.push(`/saju/kunghap_jaehwe/report-preview?${new URLSearchParams({ name, gender, partnerName, partnerGender }).toString()}`);
        return;
      }

      const chapters = [1,2,3,4,5,6,7,8,9,10,11,12,13,14];
      let done = 0;
      const allContent: Record<string, unknown> = {};
      await Promise.all(chapters.map(async (ch) => {
        try {
          const r = await fetch("/api/kunghap_jaehwe-report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: resultId, chapter: ch }),
          });
          const data = await r.json();
          if (data.sections) Object.assign(allContent, data.sections);
        } catch { /* 장 실패해도 계속 */ }
        done++;
        setDoneCount(done);
        setCurrentChapter(Math.min(done + 1, TOTAL));
      }));

      await fetch("/api/kunghap_jaehwe-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resultId, content: allContent }),
      });

      router.push(`/saju/kunghap_jaehwe/report-preview?id=${resultId}&gender=${encodeURIComponent(gender)}&name=${encodeURIComponent(name)}&partnerName=${encodeURIComponent(partnerName)}&partnerGender=${encodeURIComponent(partnerGender)}`);
    } catch {
      router.push(`/saju/kunghap_jaehwe/report-preview?${new URLSearchParams({ name, gender, partnerName, partnerGender }).toString()}`);
    }
  };

  if (creating) {
    return <CreatingScreen doneCount={doneCount} currentChapter={currentChapter} />;
  }

  return (
    <div className="w-full h-full" style={{ backgroundColor: WHITE }}>
      <div className="w-full h-full overflow-y-auto" style={{ scrollbarWidth: "none", paddingBottom: 80 }}>
        <style>{`div::-webkit-scrollbar{display:none}`}</style>

        {/* ① 히어로 */}
        <HeroSection name={name} partnerName={partnerName} />

        {/* ② 두 사람 명식 */}
        <MyeongsikSection saju={saju} partnerSaju={partnerSaju} name={name} partnerName={partnerName} />

        {/* s1 */}
        <img src="/media/checkout/kunghap_jaehwe/s1.jpg" alt="" className="w-full block" />

        {/* ③ 미리보기 티저 */}
        <PreviewSection />

        {/* s2 */}
        <img src="/media/checkout/kunghap_jaehwe/s2.jpg" alt="" className="w-full block" />

        {/* ④ 목차 */}
        <TableOfContents />

        {/* ⑤ 후기 */}
        <ReviewSection />

        {/* s3 */}
        <img src="/media/checkout/kunghap_jaehwe/s3.jpg" alt="" className="w-full block" />

        {/* ⑥ FAQ */}
        <FAQSection />

        <div className="h-4" />
      </div>

      <ToastLayer />
      <StickyPayCTA onPay={() => setShowSheet(true)} name={name} partnerName={partnerName} />
      <PayBottomSheet open={showSheet} onClose={() => setShowSheet(false)} onConfirm={handleConfirm} />
    </div>
  );
}

export default function KunghapJaehweCheckoutPage() {
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
