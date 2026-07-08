"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useMemo, useState, useEffect, useRef, useCallback } from "react";
import { TossWidget } from "@/components/checkout/TossWidget";
import { calcSaju, type LocalSajuResult } from "@/lib/saju/local-manseryeok";
import { MyeongsikTable } from "@/components/saju/MyeongsikModal";
import type { MyeongsikView } from "@/lib/saju/myeongsik-view";
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

// ─── 스크롤 슬라이드 인 훅 ────────────────────────────────────────────────────
function useSlideInUp() {
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
    transform: visible ? "translateY(0)" : "translateY(60px)",
    opacity: visible ? 1 : 0,
    transition: "transform 0.55s cubic-bezier(0.22,1,0.36,1), opacity 0.55s ease",
  };

  return { ref, style };
}

// ─── LocalSajuResult → MyeongsikView 변환 ─────────────────────────────────
const CLASS_TO_EL: Record<string, string> = { wood: "목", fire: "화", earth: "토", metal: "금", water: "수" };
const JIJANG_LOCAL: Record<string, string> = {
  자: "壬·癸", 축: "癸·辛·己", 인: "戊·丙·甲", 묘: "甲·乙",
  진: "乙·癸·戊", 사: "戊·庚·丙", 오: "丙·己·丁", 미: "丁·乙·己",
  신: "戊·壬·庚", 유: "庚·辛", 술: "辛·丁·戊", 해: "戊·甲·壬",
};
function localSajuToMsView(saju: LocalSajuResult): MyeongsikView {
  const order = [
    { key: "time" as const, pos: "시주" },
    { key: "day" as const, pos: "일주" },
    { key: "month" as const, pos: "월주" },
    { key: "year" as const, pos: "년주" },
  ];
  const pillars = order.map(({ key, pos }, idx) => {
    const p = saju.pillars[key];
    return {
      pos, sipTop: idx === 1 ? "일원" : (p.stemSs || "—"),
      gan: p.stem, ganEl: CLASS_TO_EL[p.stemClass] ?? "",
      ji: p.branch, jiEl: CLASS_TO_EL[p.branchClass] ?? "",
      sipBot: p.branchSs || "—", jijang: JIJANG_LOCAL[p.branchHg] ?? "",
      unseong: "", sinsal: "",
    };
  });
  const now = new Date();
  return {
    ilgan: saju.dayStem, pillars, daeun: [], seun: [], weolun: [],
    currentYear: now.getFullYear(), currentMonth: now.getMonth() + 1,
  };
}
function formatDateLabel(date: string, calendar: string, gender: string): string {
  if (!date) return "";
  const calLabel = calendar === "음력" ? "음력" : calendar === "윤달" ? "음력(윤달)" : "양력";
  const parts = date.split("-");
  if (parts.length < 3) return "";
  const formatted = `${parts[0]}년 ${parts[1]}월 ${parts[2]}일`;
  const genderLabel = gender === "female" || gender === "여자" ? "여성" : gender === "male" || gender === "남자" ? "남성" : gender;
  return `${calLabel} ${formatted}${genderLabel ? ` (${genderLabel})` : ""}`;
}

// ─── 두 사람 명식 섹션 ────────────────────────────────────────────────────────
function MyeongsikSection({
  saju, partnerSaju, name, partnerName,
  date, calendar, gender, partnerDate, partnerCalendar, partnerGender,
}: {
  saju: LocalSajuResult | null;
  partnerSaju: LocalSajuResult | null;
  name: string; partnerName: string;
  date: string; calendar: string; gender: string;
  partnerDate: string; partnerCalendar: string; partnerGender: string;
}) {
  const { ref, style } = useSlideInUp();
  const msView        = useMemo(() => saju        ? localSajuToMsView(saju)        : null, [saju]);
  const partnerMsView = useMemo(() => partnerSaju ? localSajuToMsView(partnerSaju) : null, [partnerSaju]);

  return (
    <div style={{ backgroundColor: WHITE }}>
      <div className="pt-6 pb-2">
        <div ref={ref} style={style}>
          <MyeongsikTable view={msView} name={name} birth={null}
            rows={["sipTop", "gan", "ji", "sipBot", "jijang", "sinsal"]}
            header={
              <div className="text-center">
                <p className="text-[22px] font-black mb-1" style={{ color: "#2a2320" }}>{name}님의 사주팔자</p>
                {formatDateLabel(date, calendar, gender) && <p className="text-[13px]" style={{ color: "#5b504a" }}>{formatDateLabel(date, calendar, gender)}</p>}
              </div>
            }
          />
        </div>
      </div>
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none z-10" style={{ background: `linear-gradient(to top, transparent, ${WHITE})` }} />
        <img src="/media/checkout/kunghap_gyeolhon/s2.jpg" alt="" className="w-full block" />
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none" style={{ background: `linear-gradient(to bottom, transparent, ${WHITE})` }} />
      </div>
      <div className="pb-2">
        <MyeongsikTable view={partnerMsView} name={partnerName} birth={null}
          rows={["sipTop", "gan", "ji", "sipBot", "jijang", "sinsal"]}
          header={
            <div className="text-center">
              <p className="text-[22px] font-black mb-1" style={{ color: "#2a2320" }}>{partnerName}님의 사주팔자</p>
              {formatDateLabel(partnerDate, partnerCalendar, partnerGender) && <p className="text-[13px]" style={{ color: "#5b504a" }}>{formatDateLabel(partnerDate, partnerCalendar, partnerGender)}</p>}
            </div>
          }
        />
      </div>
      <div className="h-4" />
    </div>
  );
}

// ─── FAQ 섹션 ────────────────────────────────────────────────────────────────
const FAQS = [
  { q: "결과지는 얼마나 걸리나요?", a: "결제 직후 약 1~2분 내에 자동 생성됩니다. 입력하신 이메일로도 링크를 보내드려, 언제든 다시 확인하실 수 있소." },
  { q: "상대방 생년월일이 정확하지 않으면요?", a: "시주까지 입력할 수 있으나, 시간을 모르는 경우도 분석이 가능하오. 다만 시주 관련 항목의 정확도는 다소 낮을 수 있소." },
  { q: "어떤 결혼 궁합 항목을 분석하나요?", a: "두 사람의 기질 분석, 결혼 궁합 점수, 배우자로서의 상대방, 결혼 시기, 결혼을 방해하는 요인 등 총 14장에 걸쳐 상세히 풀이하오." },
];

function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="px-5 py-7" style={{ backgroundColor: WHITE }}>
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
const PRODUCT = { name: "결혼궁합", original: 49800, discount: 40, price: 29900 };

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
  const ACCENT = "#e1337d";
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
            <h3 className="text-[18px] font-black" style={{ color: DTXT }}>결혼궁합 결제 안내</h3>
            <button onClick={requestClose} className="flex items-center justify-center" style={{ width: 28, height: 28, color: "rgba(255,255,255,0.6)", fontSize: 18 }}>✕</button>
          </div>
          <div className="inline-block text-[13px] font-bold px-3.5 py-1.5 rounded-full mb-5"
            style={{ background: "rgba(224,70,90,0.16)", border: `1px solid ${ACCENT}55`, color: "#ff9aa6" }}>
            총 <span style={{ color: "#ff6b9d" }}>{saved.toLocaleString()}원</span> 할인받았어요!
          </div>
          <div className="mb-5">
            <div className="w-full text-left rounded-2xl px-4 py-3.5"
              style={{ backgroundColor: DCARD, border: `1.5px solid ${ACCENT}`, boxShadow: `0 0 0 3px ${ACCENT}22` }}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[14.5px] font-bold" style={{ color: DTXT }}>결혼궁합</span>
                  <p className="text-[11.5px] mt-1" style={{ color: DMUTE }}>홍연이 들려주는 두 사람의 결혼 궁합 이야기</p>
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
              <span style={{ color: "#ff6b9d", fontWeight: 700 }}>지금 결제 시 할인 ({PRODUCT.discount}% 특가)</span>
              <span style={{ color: "#ff6b9d", fontWeight: 700 }}>-{saved.toLocaleString()}</span>
            </div>
          </div>
          <button onClick={onConfirm}
            className="w-full py-4 rounded-2xl font-black text-[17px] text-white active:scale-[0.99] transition-transform"
            style={{ background: "linear-gradient(135deg, #ff6b9d, #e1337d)", boxShadow: "0 6px 20px rgba(255,107,157,0.4)" }}>
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
              style={{ background: "linear-gradient(135deg, #ff6b9d, #e1337d)" }}>혜택 받고 계속하기</button>
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
  "방금": "#c9184a", "방금 전": "#c9184a",
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
        @keyframes gyeolhonBtnNeon {
          0%   { background: #ff6b9d; box-shadow: 0 0 12px 3px rgba(255,107,157,0.7); }
          33%  { background: #e1337d; box-shadow: 0 0 12px 3px rgba(225,51,125,0.7); }
          66%  { background: #ff0a6c; box-shadow: 0 0 12px 3px rgba(255,10,108,0.7); }
          100% { background: #ff6b9d; box-shadow: 0 0 12px 3px rgba(255,107,157,0.7); }
        }
        @keyframes gyeolhonBtnBeat {
          0%, 40%, 60%, 100% { transform: scale(1); }
          20% { transform: scale(1.05); }
          50% { transform: scale(1.03); }
        }
      `}</style>
      <button onClick={onPay}
        className="flex-1 py-3.5 rounded-2xl font-black text-[18px] text-white flex items-center justify-center"
        style={{ animation: "gyeolhonBtnNeon 3s ease-in-out infinite, gyeolhonBtnBeat 2s ease-in-out infinite" }}>
        결혼궁합 확인하기
      </button>
    </div>
  );
}

// ─── 생성 로딩 화면 ───────────────────────────────────────────────────────────
const CHAPTER_TITLES = [
  "제1장 — 나의 원국", "제2장 — 상대 원국", "제3장 — 결혼 가능성",
  "제4장 — 부부상", "제5장 — 장단점", "제6장 — 합·충",
  "제7장 — 재물·가정", "제8장 — 자녀운", "제9장 — 위기·극복",
  "제10장 — 결혼 시기", "제11장 — 미래 흐름", "마무리 — 홍연의 서신",
];
const TOTAL = 12;

function CreatingScreen({ doneCount, currentChapter }: { doneCount: number; currentChapter: number }) {
  const pct = Math.round((doneCount / TOTAL) * 100);
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 px-8"
      style={{ background: "radial-gradient(ellipse at 50% 40%, #1a0010 0%, #0a0208 100%)" }}>
      <style>{`
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }
        @keyframes glow-pulse { 0%,100%{box-shadow:0 0 8px 2px #e1337daa,0 0 20px 4px #aa195555} 50%{box-shadow:0 0 16px 4px #f055a0cc,0 0 40px 10px #e1337d88} }
        @keyframes title-fade { 0%{opacity:0;transform:translateY(6px)} 20%{opacity:1;transform:translateY(0)} 80%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-6px)} }
        @keyframes orbit { 0%{transform:rotate(0deg) translateX(38px) rotate(0deg)} 100%{transform:rotate(360deg) translateX(38px) rotate(-360deg)} }
      `}</style>
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, #e1337d22 0%, transparent 70%)" }} />
        {[0,1,2,3,4,5].map(i => (
          <div key={i} className="absolute w-1 h-1 rounded-full" style={{
            top: "50%", left: "50%", marginTop: "-2px", marginLeft: "-2px",
            background: i % 2 === 0 ? "#f055a0" : "#f8a0c8",
            boxShadow: `0 0 6px 2px ${i % 2 === 0 ? "#e1337d" : "#f077b0"}`,
            animation: `orbit ${2.5 + i * 0.4}s linear infinite`,
            animationDelay: `${i * -0.5}s`,
          }} />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{ fontSize: 28, filter: "drop-shadow(0 0 8px #e1337d)" }}>✦</span>
        </div>
      </div>
      <p className="text-[18px] font-bold mb-1" style={{ color: "#fff5ee", fontFamily: "'Noto Serif KR', serif", textShadow: "0 0 20px #e1337d88" }}>
        결과지를 완성하고 있소…
      </p>
      <p key={currentChapter} className="text-[13px] mb-8" style={{ color: "#f088bb", animation: "title-fade 4s ease-in-out", minHeight: 20 }}>
        {doneCount < TOTAL ? CHAPTER_TITLES[currentChapter - 1] + " 풀이 중" : "마무리 중이오…"}
      </p>
      <div className="w-full max-w-[280px] mb-3">
        <div className="flex justify-between text-[11px] mb-2" style={{ color: "#bb4488" }}>
          <span>{doneCount} / {TOTAL} 장 완성</span>
          <span>{pct}%</span>
        </div>
        <div className="w-full h-3 rounded-full overflow-hidden relative" style={{ background: "#1a0810" }}>
          <div className="h-full rounded-full relative overflow-hidden transition-all duration-700"
            style={{ width: `${pct}%`, background: "linear-gradient(90deg, #7a1040, #e1337d, #f088bb)", animation: pct > 0 ? "glow-pulse 1.8s ease-in-out infinite" : "none" }}>
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
const PRODUCT_SLUG = "kunghap_gyeolhon";
const PRODUCT_INFO = { name: "결혼궁합", price: 29900 };

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const name            = searchParams.get("name")            ?? "고객";
  const date            = searchParams.get("date")            ?? "";
  const time            = searchParams.get("time")            ?? "시간 모름";
  const calendar        = searchParams.get("calendar")        ?? "양력";
  const gender          = searchParams.get("gender")          ?? "";
  const email           = searchParams.get("email")           ?? "";
  const phone    = searchParams.get("phone")    ?? "";
  const partnerName     = searchParams.get("partnerName")     ?? "상대방";
  const partnerDate     = searchParams.get("partnerDate")     ?? "";
  const partnerTime     = searchParams.get("partnerTime")     ?? "시간 모름";
  const partnerCalendar = searchParams.get("partnerCalendar") ?? "양력";
  const partnerGender   = searchParams.get("partnerGender")   ?? "";

  const saju        = useMemo(() => calcSaju(date, time, calendar), [date, time, calendar]);
  const partnerSaju = useMemo(() => calcSaju(partnerDate, partnerTime, partnerCalendar), [partnerDate, partnerTime, partnerCalendar]);

  const [showSheet, setShowSheet] = useState(false);
  const [showWidget, setShowWidget] = useState(false);
  const [widgetOrderId, setWidgetOrderId] = useState<string | null>(null);
  const [widgetAmount, setWidgetAmount] = useState<number>(PRODUCT_INFO.price);
  const [orderError, setOrderError] = useState<string | null>(null);

  const pendingOrderId = useRef<string | null>(null);
  const pendingAmount = useRef<number>(PRODUCT_INFO.price);
  const orderCreating = useRef(false);

  const buildOrderBody = useCallback(() => {
    const birthDate = date ? date.replace(/\./g, "-") : "";
    const birthTime = (time && time !== "시간 모름") ? time : null;
    const timeUnknown = !birthTime;
    const calApi = calendar === "음력" ? "lunar" : "solar";
    const genderApi: "male" | "female" = gender === "여자" || gender === "여성" || gender === "female" ? "female" : "male";
    const partnerBirthDate = partnerDate ? partnerDate.replace(/\./g, "-") : undefined;
    const partnerBirthTime = (partnerTime && partnerTime !== "시간 모름") ? partnerTime : null;
    const partnerTimeUnknown = !partnerBirthTime;
    const partnerCalApi = partnerCalendar === "음력" ? "lunar" : "solar";
    const partnerGenderApi: "male" | "female" = partnerGender === "여자" || partnerGender === "여성" || partnerGender === "female" ? "female" : "male";
    return { productSlug: PRODUCT_SLUG, email: email || "", name, birthDate, birthTime, timeUnknown, gender: genderApi, calendar: calApi, concerns: [], phone: phone || undefined, partnerName, partnerBirthDate, partnerBirthTime, partnerTimeUnknown, partnerGender: partnerGenderApi, partnerCalendar: partnerCalApi };
  }, [name, date, time, calendar, gender, email, phone, partnerName, partnerDate, partnerTime, partnerCalendar, partnerGender]);

  useEffect(() => {
    if (orderCreating.current) return;
    orderCreating.current = true;
    const body = buildOrderBody();
    fetch("/api/orders/create-guest-kunghap", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(r => r.json())
      .then(({ orderId, amount }) => { pendingOrderId.current = orderId; pendingAmount.current = amount; setWidgetAmount(amount); })
      .catch(() => setOrderError("주문 준비 중 오류가 발생했습니다."));
  }, [buildOrderBody]);

  const handleConfirm = async () => {
    setShowSheet(false);
    if (!pendingOrderId.current) {
      orderCreating.current = false;
      try {
        const body = buildOrderBody();
        const r = await fetch("/api/orders/create-guest-kunghap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = await r.json();
        if (json.orderId) {
          pendingOrderId.current = json.orderId;
          pendingAmount.current = json.amount;
          setWidgetAmount(json.amount);
        } else {
          setOrderError("주문 생성에 실패했습니다. 다시 시도해 주세요.");
          return;
        }
      } catch {
        setOrderError("주문 생성에 실패했습니다. 다시 시도해 주세요.");
        return;
      }
    }
    setOrderError(null);
    setWidgetOrderId(pendingOrderId.current);
    setShowWidget(true);
  };

  return (
    <div className="w-full h-full" style={{ backgroundColor: WHITE }}>
      <div className="w-full h-full overflow-y-auto" style={{ scrollbarWidth: "none", paddingBottom: 80 }}>
        <style>{`div::-webkit-scrollbar{display:none}`}</style>

        {/* ① 상단 이미지 */}
        <div className="relative">
          <img src="/media/checkout/kunghap_gyeolhon/s1.jpg" alt="" className="w-full block" />
          <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none" style={{ background: `linear-gradient(to bottom, transparent, ${WHITE})` }} />
        </div>

        {/* ② 두 사람 명식 */}
        <MyeongsikSection saju={saju} partnerSaju={partnerSaju} name={name} partnerName={partnerName} date={date} calendar={calendar} gender={gender} partnerDate={partnerDate} partnerCalendar={partnerCalendar} partnerGender={partnerGender} />

        {/* ③ 하단 이미지 */}
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none z-10" style={{ background: `linear-gradient(to top, transparent, ${WHITE})` }} />
          <img src="/media/checkout/kunghap_gyeolhon/s3.jpg" alt="" className="w-full block" />
          <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none" style={{ background: `linear-gradient(to bottom, transparent, ${WHITE})` }} />
        </div>

        {/* ④ FAQ */}
        <FAQSection />

        <div className="h-4" />
      </div>

      <ToastLayer />
      <StickyPayCTA onPay={() => setShowSheet(true)} name={name} partnerName={partnerName} />
      <PayBottomSheet open={showSheet} onClose={() => setShowSheet(false)} onConfirm={handleConfirm} />

      {showWidget && widgetOrderId && (
        <>
          <div className="fixed inset-0 z-[55]" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setShowWidget(false)} />
          <div className="fixed bottom-0 z-[60] rounded-t-3xl overflow-hidden"
            style={{ left: "max(0px, calc(50vw - 240px))", width: "min(100%, 480px)", background: "#fff", boxShadow: "0 -12px 40px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto" }}>
            <style>{`
              .toss-widget-wrap button[class*="inline-flex"][class*="w-full"] { background: #3182F6 !important; color: #fff !important; border-radius: 12px !important; font-weight: 700 !important; font-size: 16px !important; box-shadow: none !important; width: calc(100% - 48px) !important; margin-left: 24px !important; height: 56px !important; margin-top: -18px !important; }
              .toss-widget-wrap button[class*="inline-flex"][class*="w-full"]:hover { background: #1b6fe8 !important; }
              .toss-widget-wrap #agreement { transform: scale(0.75); transform-origin: left top; width: 133% !important; margin-top: -12px; }
            `}</style>
            <div className="flex justify-center pt-3 pb-1">
              <div style={{ width: 40, height: 4, borderRadius: 99, background: "#e0e0e0" }} />
            </div>
            <div className="px-6 pt-2 pb-2">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-[17px] font-normal" style={{ color: "#1a1a1a" }}>복비를 결제해 주세요</h3>
                <button onClick={() => setShowWidget(false)} style={{ fontSize: 18, color: "#888" }}>✕</button>
              </div>
              <p className="text-[16px] font-normal mb-4" style={{ color: "#3182F6" }}>[{PRODUCT_INFO.name}] - {widgetAmount.toLocaleString()}원</p>
            </div>
            <div className="toss-widget-wrap">
              <TossWidget
                orderId={widgetOrderId}
                amount={widgetAmount}
                customerKey={widgetOrderId}
                productName={PRODUCT_INFO.name}
                customerEmail={email || null}
                successUrl={`${typeof window !== 'undefined' ? window.location.origin : 'https://www.hongyeondang.com'}/saju/kunghap_gyeolhon/checkout/success`}
                failUrl={`${typeof window !== 'undefined' ? window.location.origin : 'https://www.hongyeondang.com'}/checkout/fail`}
              />
            </div>
          </div>
        </>
      )}
      {orderError && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[70] bg-red-500 text-white text-sm px-4 py-2 rounded-full">{orderError}</div>
      )}
    </div>
  );
}

export default function KunghapGyeolhonCheckoutPage() {
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
