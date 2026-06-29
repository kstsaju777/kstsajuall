"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useMemo, useState, useEffect } from "react";
import { calcSaju } from "@/lib/saju/local-manseryeok";
import { ganCharImage, jiCharImage } from "@/lib/saju/char-image";
import { LEGAL_DOC_CLASS, TermsContent, PrivacyContent } from "@/components/legal/legal-content";

// ─── 토큰 ────────────────────────────────────────────────────────────────────
const CREAM   = "#f4f9f2";
const WHITE   = "#ffffff";
const GREEN   = "#738e6f";
const GREEN_D = "#4f6b4b";
const GREEN_P = "#eef4ec";
const GRAY1   = "#1a1a1a";
const GRAY2   = "#444444";
const GRAY3   = "#888888";
const GRAY4   = "#dddddd";

const PILLAR_LABELS = ["시주", "일주", "월주", "년주"] as const;
const PRODUCT = { name: "임신사주", original: 59800, discount: 50, price: 29900 };

// ─── 명식 그리드 ──────────────────────────────────────────────────────────────
function SajuGrid({ date, time, calendar, name }: { date: string; time: string; calendar: string; name: string }) {
  const saju = useMemo(() => { try { return calcSaju(date, time, calendar); } catch { return null; } }, [date, time, calendar]);
  const pillars = saju ? [saju.pillars.time, saju.pillars.day, saju.pillars.month, saju.pillars.year] : null;
  return (
    <div className="flex-1">
      <p className="text-[12px] font-bold mb-2 text-center" style={{ color: GRAY3 }}>{name}님의 사주팔자</p>
      <div className="grid grid-cols-4 gap-1.5">
        {(pillars ?? Array(4).fill(null)).map((p, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <p className="text-[9px] tracking-wide" style={{ color: GRAY3 }}>{PILLAR_LABELS[i]}</p>
            <span className="text-[10px]" style={{ color: GRAY2 }}>{p?.stemSs || ""}</span>
            <div className="w-full aspect-square flex items-center justify-center">
              {p ? <img src={ganCharImage(p.stem)} alt={p.stem} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <div className="w-full h-full animate-pulse rounded-xl" style={{ backgroundColor: "#eee" }} />}
            </div>
            <div className="w-full aspect-square flex items-center justify-center">
              {p ? <img src={jiCharImage(p.branch)} alt={p.branch} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <div className="w-full h-full animate-pulse rounded-xl" style={{ backgroundColor: "#eee" }} />}
            </div>
            <span className="text-[10px]" style={{ color: GRAY2 }}>{p?.branchSs || ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 두 명식 나란히 ───────────────────────────────────────────────────────────
function DualSajuGrid({ myDate, myTime, myCalendar, myName, partnerDate, partnerTime, partnerCalendar, partnerName }: {
  myDate: string; myTime: string; myCalendar: string; myName: string;
  partnerDate: string; partnerTime: string; partnerCalendar: string; partnerName: string;
}) {
  return (
    <div className="px-4 py-5" style={{ backgroundColor: WHITE }}>
      <div className="flex gap-3">
        <SajuGrid date={myDate} time={myTime} calendar={myCalendar} name={myName} />
        <div style={{ width: 1, backgroundColor: GRAY4, flexShrink: 0 }} />
        <SajuGrid date={partnerDate} time={partnerTime} calendar={partnerCalendar} name={partnerName} />
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
        <img src="/media/cards/saju_imshin/imshin-0.jpg" alt=""
          className="absolute inset-0 w-full h-full object-cover object-top" />
        <div className="absolute bottom-0 left-0 right-0 h-24" style={{ background: `linear-gradient(to bottom, transparent, ${WHITE})` }} />
      </div>
      <div className="px-6 py-2 text-center">
        <p className="text-[12px] mb-2 tracking-wide" style={{ color: GREEN_D }}>{label}</p>
        <h2 className="text-[26px] font-black leading-snug" style={{ color: GRAY1 }}>
          {parts.map((part, i) => (
            <span key={i}>
              {part.split("\n").map((line, j, arr) => (
                <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
              ))}
              {i < parts.length - 1 && <span style={{ color: GREEN_D }}>{accent}</span>}
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
    icon: "🌱", title: "사주로 본 자녀운 — 아이가 올 운이 있는가", free: true,
    content: "두 사람의 사주팔자를 바탕으로 자녀와의 인연을 분석합니다. 사주에 자녀성이 어떻게 나타나는지, 아이와의 인연이 얼마나 강한지 살펴봅니다.",
    blurLines: [],
  },
  {
    icon: "📅", title: "임신이 가능한 사주적 시기 분석", free: false,
    blurLines: ["████년 ████월 전후가 임신 에너지가 가장 강한 시기입니다.", "특히 ████ 대운과 ████ 세운이 겹치는 시점을 주목하시오.", "이 시기를 놓치지 않으면 ████의 기운이 도움이 될 것이오."],
  },
  {
    icon: "👶", title: "어떤 아이가 올까 — 아이와의 인연", free: false,
    blurLines: ["사주 구성상 ████ 기질을 가진 아이와의 인연이 강합니다.", "아이의 성별은 ████ 쪽이 사주에서 더 또렷이 보입니다.", "이 아이와의 만남은 ████의 의미를 담고 있소이다."],
  },
  {
    icon: "⚠️", title: "임신을 방해하는 사주적 요인과 해소법", free: false,
    blurLines: ["현재 사주에서 ████ 기운이 임신을 방해하고 있습니다.", "이를 해소하기 위해서는 ████ 방면의 조율이 필요합니다.", "████ 시기까지 ████ 방법으로 준비하면 도움이 됩니다."],
  },
  {
    icon: "✨", title: "2026년 임신·출산 운의 흐름", free: false,
    blurLines: ["2026년 두 사람의 합산 임신운은 ████ 수준입니다.", "특히 ████월과 ████월 전후로 큰 흐름이 바뀝니다.", "이 흐름을 타면 ████의 가능성이 높아집니다."],
  },
];

function AnalysisSection({ s }: { s: typeof SECTIONS[number] }) {
  return (
    <div className="mx-5 mb-4 rounded-2xl overflow-hidden"
      style={{ backgroundColor: WHITE, border: `1px solid ${GRAY4}`, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
      <div className="flex items-center gap-2.5 px-4 py-3.5"
        style={{ borderBottom: `1px solid ${GRAY4}`, backgroundColor: s.free ? GREEN_P : WHITE }}>
        <span className="text-[18px]">{s.icon}</span>
        <span className="text-[15px] font-bold" style={{ color: GRAY1 }}>{s.title}</span>
        <span className="ml-auto text-[10px] px-2.5 py-0.5 rounded-full font-medium flex-shrink-0"
          style={{ backgroundColor: s.free ? `${GREEN_D}15` : "#f5f5f5", color: s.free ? GREEN_D : GRAY3, border: `1px solid ${s.free ? GREEN_D + "30" : GRAY4}` }}>
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
                style={{ backgroundColor: GREEN_P, border: `1px solid ${GREEN}` }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GREEN_D} strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <span className="text-[11px] font-semibold" style={{ color: GREEN_D }}>결제 후 열람 가능</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 후기 ────────────────────────────────────────────────────────────────────
const REVIEWS = [
  { star: 5, text: "임신이 잘 안 돼서 너무 힘들었는데 사주로 보니 내년이 맞는 시기라고 나왔어요. 그 시기에 준비했더니 정말 임신 소식이 왔어요.", name: "30대 김○○", date: "2025.05.12" },
  { star: 5, text: "어떤 시기에 노력을 집중해야 할지 몰랐는데 구체적인 달까지 나와서 신기했어요. 준비하는 마음가짐이 달라졌습니다.", name: "30대 이○○", date: "2025.04.28" },
  { star: 5, text: "임신을 방해하는 요인이 사주에 있다고 했는데 그 부분을 해소하고 나서 임신이 됐어요. 두 사람 사주를 같이 봐주는 게 더 좋았어요.", name: "30대 박○○", date: "2025.05.03" },
];

function ReviewSection() {
  return (
    <div className="px-5 py-6" style={{ backgroundColor: CREAM }}>
      <p className="text-center text-[12px] tracking-widest mb-1" style={{ color: GREEN_D }}>✦ 실제 후기 ✦</p>
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

  const DBG = "#111a10"; const DCARD = "#1e2b1d"; const DTXT = "#ffffff";
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
        <div className="flex justify-center pt-3 pb-1"><div style={{ width: 40, height: 4, borderRadius: 99, background: "rgba(255,255,255,0.2)" }} /></div>
        <div className="px-5 pt-2 pb-7">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[18px] font-black" style={{ color: DTXT }}>임신사주 결제 안내</h3>
            <button onClick={requestClose} style={{ width: 28, height: 28, color: "rgba(255,255,255,0.6)", fontSize: 18 }}>✕</button>
          </div>
          <div className="inline-block text-[13px] font-bold px-3.5 py-1.5 rounded-full mb-5"
            style={{ background: "rgba(115,142,111,0.16)", border: `1px solid ${GREEN}55`, color: "#a8d4a4" }}>
            총 <span style={{ color: "#7ecf7a" }}>{saved.toLocaleString()}원</span> 할인받았어요!
          </div>
          <div className="w-full text-left rounded-2xl px-4 py-3.5 mb-5" style={{ backgroundColor: DCARD, border: `1.5px solid ${GREEN}`, boxShadow: `0 0 0 3px ${GREEN}22` }}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[14.5px] font-bold" style={{ color: DTXT }}>임신사주</span>
                <p className="text-[11.5px] mt-1" style={{ color: DMUTE }}>홍연이 들려주는 두 사람의 임신 이야기</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[11px]" style={{ color: DSTRIKE }}>
                  <span style={{ color: GREEN, fontWeight: 700 }}>{PRODUCT.discount}%</span>{" "}
                  <span className="line-through">{PRODUCT.original.toLocaleString()}</span>
                </p>
                <p className="text-[16px] font-black mt-0.5" style={{ color: DTXT }}>{PRODUCT.price.toLocaleString()}원</p>
              </div>
            </div>
          </div>
          <button onClick={onConfirm} className="w-full py-4 rounded-2xl font-black text-[17px] text-white"
            style={{ background: `linear-gradient(135deg, ${GREEN}, ${GREEN_D})`, boxShadow: `0 6px 20px ${GREEN_D}44` }}>
            결제하기
          </button>
          <div className="flex items-center justify-center gap-2 mt-3.5">
            <span className="flex-shrink-0 flex items-center justify-center rounded" style={{ width: 16, height: 16, background: GREEN_D, color: "#fff", fontSize: 10 }}>✓</span>
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
            style={{ pointerEvents: "auto", maxWidth: 290, background: "#152012", boxShadow: "0 14px 40px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", animation: "popIn 0.2s cubic-bezier(0.34,1.4,0.5,1)" }}>
            <button onClick={() => setConfirmExit(false)} className="absolute top-2.5 right-2.5 flex items-center justify-center rounded-full"
              style={{ width: 22, height: 22, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 12 }}>✕</button>
            <p className="text-[14px] font-black pr-5" style={{ color: "#fff" }}>🌿 {saved.toLocaleString()}원 할인이 사라져요!</p>
            <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>이 혜택은 지금만 적용됩니다.</p>
            <button onClick={() => setConfirmExit(false)} className="w-full mt-3 py-2.5 rounded-xl text-[13.5px] font-bold text-white" style={{ background: `linear-gradient(135deg, ${GREEN}, ${GREEN_D})` }}>혜택 받고 계속하기</button>
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
function StickyPayCTA({ onPay, myName, partnerName }: { onPay: () => void; myName: string; partnerName: string }) {
  const [glow, setGlow] = useState(false);
  useEffect(() => { const t = setInterval(() => setGlow((g) => !g), 1800); return () => clearInterval(t); }, []);
  const saved = PRODUCT.original - PRODUCT.price;
  return (
    <div className="flex-shrink-0 px-5 pb-7 pt-4" style={{ backgroundColor: WHITE, boxShadow: "0 -4px 20px rgba(0,0,0,0.08)" }}>
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] line-through" style={{ color: GRAY3 }}>₩{PRODUCT.original.toLocaleString()}</span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: GREEN_P, color: GREEN_D, border: `1px solid ${GREEN}` }}>특가 -{PRODUCT.discount}%</span>
        </div>
        <span className="text-[24px] font-bold" style={{ color: GRAY1 }}>₩{PRODUCT.price.toLocaleString()}</span>
      </div>
      <button onClick={onPay} className="w-full py-4 rounded-2xl font-bold text-[16px] text-white flex items-center justify-center gap-2 active:scale-95 transition-all"
        style={{ background: `linear-gradient(135deg, ${GREEN}, ${GREEN_D})`, boxShadow: glow ? `0 4px 24px ${GREEN_D}88` : `0 2px 12px ${GREEN_D}44`, transition: "box-shadow 1s ease" }}>
        <span>🌿</span>
        <span>{myName} & {partnerName}님 임신사주 확인하기</span>
      </button>
    </div>
  );
}

// ─── 메인 ────────────────────────────────────────────────────────────────────
function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const name            = searchParams.get("name")            ?? "고객";
  const date            = searchParams.get("date")            ?? "";
  const time            = searchParams.get("time")            ?? "시간 모름";
  const calendar        = searchParams.get("calendar")        ?? "양력";
  const gender          = searchParams.get("gender")          ?? "";
  const email           = searchParams.get("email")           ?? "";
  const concern         = searchParams.get("concern")         ?? "";
  const partnerName     = searchParams.get("partnerName")     ?? "상대방";
  const partnerDate     = searchParams.get("partnerDate")     ?? "";
  const partnerTime     = searchParams.get("partnerTime")     ?? "시간 모름";
  const partnerCalendar = searchParams.get("partnerCalendar") ?? "양력";
  const partnerGender   = searchParams.get("partnerGender")   ?? "";
  const [showSheet, setShowSheet] = useState(false);

  const handleConfirm = () => {
    const reportParams = new URLSearchParams({ name, date, time, calendar, gender, email, concern, ch: "0", partnerName, partnerDate, partnerTime, partnerCalendar, partnerGender });
    const reportUrl = `https://www.hongyeondang.com/saju/saju_imshin/report-preview?${reportParams.toString()}`;
    router.push(`/saju/saju_imshin/report-preview?${reportParams.toString()}`);
    setShowSheet(false);
    if (email) {
      fetch("/api/send-order-email", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerEmail: email, customerName: name, productName: PRODUCT.name, price: PRODUCT.price, reportUrl }),
      }).catch(() => {});
    }
    fetch("/api/send-order-sms", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerName: name, productName: PRODUCT.name, price: PRODUCT.price }),
    }).catch(() => {});
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: CREAM }}>
      <div className="flex-1 min-h-0 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        <style>{`div::-webkit-scrollbar{display:none}`}</style>

        <ImageTextBlock
          label="임신사주 · 정밀 리포트"
          headline={`${name}님의\n운명을\n살펴봤어요`}
          accent="살펴봤어요"
        />

        {/* 두 사람 명식 나란히 */}
        {date && partnerDate && (
          <DualSajuGrid
            myDate={date} myTime={time} myCalendar={calendar} myName={name}
            partnerDate={partnerDate} partnerTime={partnerTime} partnerCalendar={partnerCalendar} partnerName={partnerName}
          />
        )}

        <ImageTextBlock label="AI 정밀 임신 분석 · 5가지 항목" headline={`두 사람의\n임신 시기,\n알려드릴게요`} accent="임신 시기," />

        <div className="pb-5" style={{ backgroundColor: CREAM }}>
          {SECTIONS.map((s, i) => <AnalysisSection key={i} s={s} />)}
        </div>

        <ImageTextBlock label="실제 이용 후기" headline={`이미 수천 명이\n임신사주로\n준비했어요`} accent="임신사주로" />

        <ReviewSection />
        <div className="h-4" />
      </div>

      <StickyPayCTA onPay={() => setShowSheet(true)} myName={name} partnerName={partnerName} />
      <PayBottomSheet open={showSheet} onClose={() => setShowSheet(false)} onConfirm={handleConfirm} />
    </div>
  );
}

export default function ImshinCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: CREAM }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: GREEN_D, borderTopColor: "transparent" }} />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
