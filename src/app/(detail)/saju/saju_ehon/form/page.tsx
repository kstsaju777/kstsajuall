"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { calcSaju } from "@/lib/saju/local-manseryeok";
import { ganCharImage, jiCharImage } from "@/lib/saju/char-image";

// ─── 디자인 토큰 ─────────────────────────────────────────────────────────────
const NAVY       = "#7c6af6";
const CARD_BG    = "#0a0c10";
const LABEL_CLR  = "#b8b0fb";
const BORDER_CLR = "#4a5560";
const PH_CLR     = "#7a8590";
const TEXT_CLR   = "#f5f5f5";

const BIRTH_TIMES = [
  "자시 (23:30 ~ 01:30)", "축시 (01:30 ~ 03:30)",
  "인시 (03:30 ~ 05:30)", "묘시 (05:30 ~ 07:30)",
  "진시 (07:30 ~ 09:30)", "사시 (09:30 ~ 11:30)",
  "오시 (11:30 ~ 13:30)", "미시 (13:30 ~ 15:30)",
  "신시 (15:30 ~ 17:30)", "유시 (17:30 ~ 19:30)",
  "술시 (19:30 ~ 21:30)", "해시 (21:30 ~ 23:30)",
];

// ─── visualViewport 높이 훅 ───────────────────────────────────────────────────
function useViewportHeight() {
  const [vh, setVh] = useState<number | null>(null);
  useEffect(() => {
    const update = () => {
      const vp = window.visualViewport;
      if (vp) setVh(vp.height);
    };
    update();
    window.visualViewport?.addEventListener("resize", update);
    window.visualViewport?.addEventListener("scroll", update);
    return () => {
      window.visualViewport?.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
    };
  }, []);
  return vh;
}

// ─── 배경 이미지 + 하단 카드 래퍼 ───────────────────────────────────────────
function FormShell({ children }: { children: React.ReactNode }) {
  const vh = useViewportHeight();
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: vh ? `${vh}px` : "100%", maxHeight: "100%", backgroundColor: "#131921" }}
    >
      {/* 배경 이미지 — 전체 화면 */}
      <img
        src="/media/cards/saju_ehon/ehon-0.jpg"
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover object-top"
      />
      {/* 그라데이션 오버레이 — 하단으로 자연스럽게 페이드 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.2) 30%, rgba(19,25,33,0.5) 55%, rgba(19,25,33,0.9) 72%, rgba(19,25,33,1) 82%)",
        }}
      />
      {/* 하단 카드 */}
      <div className="absolute bottom-0 left-0 right-0">
        <div style={{ height: 56, background: `linear-gradient(to bottom, transparent, ${CARD_BG})`, pointerEvents: "none" }} />
        {children}
      </div>
    </div>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[24px] font-bold mb-6" style={{ color: TEXT_CLR }}>
      {children}
    </h2>
  );
}

function PillToggle<T extends string>({
  options, value, onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className="px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all"
            style={{
              backgroundColor: active ? NAVY : "transparent",
              color: active ? "white" : "#aaa",
              border: active ? `1.5px solid ${NAVY}` : "1.5px solid transparent",
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function BottomNav({
  onPrev, onNext, nextLabel, nextDisabled = false,
}: {
  onPrev?: () => void;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-5 pb-8 pt-4" style={{ backgroundColor: CARD_BG }}>
      {onPrev && (
        <button
          onClick={onPrev}
          className="flex-shrink-0 px-5 py-3.5 rounded-2xl text-[15px] font-semibold"
          style={{ backgroundColor: CARD_BG, color: "#999", border: "1.5px solid #555" }}
        >
          이전
        </button>
      )}
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="flex-1 py-3.5 rounded-2xl text-white text-[16px] font-bold transition-all"
        style={{ backgroundColor: NAVY, opacity: nextDisabled ? 0.35 : 1, letterSpacing: "-0.3px" }}
      >
        {nextLabel}
      </button>
    </div>
  );
}

// ─── Step 1: 이별 이유 ────────────────────────────────────────────────────────
const BREAKUP_REASONS = [
  "성격 차이",
  "연락 두절 / 잠수",
  "바람 / 배신",
  "장거리 / 환경 변화",
  "부모님의 반대",
  "기타",
];

function StepBreakupReason({ onNext, initial }: { onNext: (v: string) => void; initial?: string }) {
  const [selected, setSelected] = useState<string | null>(initial ?? null);
  return (
    <>
      <div className="px-6 pt-3 pb-2" style={{ backgroundColor: CARD_BG }}>
        <p className="text-[13px] font-medium mb-1" style={{ color: "#8a8a8a" }}>이별한 이유</p>
        <h2 className="text-[20px] mb-3" style={{ color: TEXT_CLR }}>
          <span className="font-normal" style={{ color: "rgba(245,245,245,0.45)" }}>그대들이 </span>
          <span className="font-bold">이별한 이유는?</span>
        </h2>
        <div className="flex flex-col gap-2">
          {BREAKUP_REASONS.map((reason) => {
            const active = selected === reason;
            return (
              <button
                key={reason}
                onClick={() => setSelected(reason)}
                className="w-full py-2.5 rounded-xl text-[14px] font-semibold transition-all"
                style={{
                  backgroundColor: active ? "rgba(155,35,53,0.18)" : "rgba(255,255,255,0.04)",
                  border: `1.5px solid ${active ? NAVY : "rgba(255,255,255,0.18)"}`,
                  color: active ? "#ffffff" : "#dddddd",
                  opacity: active ? 1 : 0.55,
                }}
              >
                {reason}
              </button>
            );
          })}
        </div>
      </div>
      <BottomNav onNext={() => selected && onNext(selected)} nextLabel="다음으로" nextDisabled={!selected} />
    </>
  );
}

// ─── Step 2: 이별 통보자 ─────────────────────────────────────────────────────
function StepWhoEnded({ onPrev, onNext, initial }: { onPrev: () => void; onNext: (v: string) => void; initial?: string }) {
  const [selected, setSelected] = useState<string | null>(initial ?? null);
  return (
    <>
      <div className="px-6 pt-6 pb-2" style={{ backgroundColor: CARD_BG }}>
        <p className="text-[13px] font-medium mb-1" style={{ color: "#8a8a8a" }}>이별 통보</p>
        <h2 className="text-[24px] mb-6" style={{ color: TEXT_CLR }}>
          <span className="font-normal" style={{ color: "rgba(245,245,245,0.45)" }}>누가 </span>
          <span className="font-bold">헤어지자고 했소?</span>
        </h2>
        <div className="flex flex-col gap-3">
          {(["내가", "상대방이", "둘 다"] as const).map((opt) => {
            const active = selected === opt;
            return (
              <button
                key={opt}
                onClick={() => setSelected(opt)}
                className="w-full py-4 rounded-2xl text-[16px] font-semibold transition-all"
                style={{
                  backgroundColor: active ? "rgba(124,106,246,0.18)" : "rgba(255,255,255,0.04)",
                  border: `1.5px solid ${active ? NAVY : "rgba(255,255,255,0.18)"}`,
                  color: active ? "#ffffff" : "#dddddd",
                  opacity: active ? 1 : 0.55,
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
      <BottomNav onPrev={onPrev} onNext={() => selected && onNext(selected)} nextLabel="다음으로" nextDisabled={!selected} />
    </>
  );
}

// ─── Step 3: 이별 날짜 ────────────────────────────────────────────────────────
function StepBreakupDate({ onPrev, onNext, initial }: { onPrev: () => void; onNext: (v: string) => void; initial?: string }) {
  const [year, setYear]     = useState(initial ? initial.split(".")[0] : "");
  const [month, setMonth]   = useState(initial ? initial.split(".")[1] ?? "" : "");
  const [day, setDay]       = useState(initial ? initial.split(".")[2] ?? "" : "");
  const [dayUnknown, setDayUnknown] = useState(false);
  const [yearErr, setYearErr]   = useState(false);
  const [monthErr, setMonthErr] = useState(false);
  const [dayErr, setDayErr]     = useState(false);
  const monthRef = useRef<HTMLInputElement>(null);
  const dayRef   = useRef<HTMLInputElement>(null);

  const pad = (v: string, max: number) => v.replace(/\D/g, "").slice(0, max);
  const mNum = parseInt(month, 10);
  const dNum = parseInt(day, 10);
  const yNum = parseInt(year, 10);
  const dayValid = dayUnknown || (dNum >= 1 && dNum <= 31);
  const isValid = year.length === 4 && yNum >= 1950 && yNum <= 2050 && mNum >= 1 && mNum <= 12 && dayValid && !yearErr && !monthErr && !dayErr;
  const dateStr = `${year}.${month.padStart(2,"0")}.${dayUnknown ? "01" : day.padStart(2,"0")}`;

  const activeBorder = `2px solid ${NAVY}`;
  const normalBorder = `2px solid ${BORDER_CLR}`;
  const errorBorder  = `2px solid #ff4444`;

  return (
    <>
      <div className="px-6 pt-6 pb-4" style={{ backgroundColor: CARD_BG }}>
        <p className="text-[13px] font-medium mb-1" style={{ color: "#8a8a8a" }}>기억이 나시오?</p>
        <h2 className="text-[24px] mb-6" style={{ color: TEXT_CLR }}>
          <span className="font-normal" style={{ color: "rgba(245,245,245,0.45)" }}>그대들이 </span>
          <span className="font-bold">이별한 날짜는?</span>
        </h2>

        {/* 년/월/일 입력 */}
        <div className="flex items-end gap-3 mb-2">
          <style>{`input::placeholder { color: rgba(255,255,255,0.25); }`}</style>
          {/* 년 */}
          <div className="flex flex-col items-center gap-0">
            <div className="flex items-end gap-1">
              <input
                type="text" inputMode="numeric" placeholder="2026" autoComplete="off"
                value={year}
                onChange={(e) => { const v = pad(e.target.value, 4); setYear(v); if (v.length === 4) { const y = parseInt(v, 10); const err = y < 1950 || y > 2050; setYearErr(err); if (!err) monthRef.current?.focus(); } else { setYearErr(false); } }}
                className="bg-transparent text-[28px] font-bold pb-1 outline-none text-center"
                style={{ width: 80, borderBottom: yearErr ? errorBorder : year ? activeBorder : normalBorder, color: yearErr ? "#ff4444" : TEXT_CLR, caretColor: NAVY }}
              />
              <span className="text-[16px] pb-2" style={{ color: "rgba(255,255,255,0.5)", fontSize: 22 }}>년</span>
            </div>
            {yearErr && <span style={{ fontSize: 10, color: "#ff4444", marginTop: 2 }}>잘못 입력</span>}
          </div>
          {/* 월 */}
          <div className="flex flex-col items-center gap-0">
            <div className="flex items-end gap-1">
              <input
                ref={monthRef}
                type="text" inputMode="numeric" placeholder="06" autoComplete="off"
                value={month}
                onChange={(e) => { const v = pad(e.target.value, 2); setMonth(v); if (v.length === 2) { const m = parseInt(v, 10); const err = m < 1 || m > 12; setMonthErr(err); if (!err) dayRef.current?.focus(); } else { setMonthErr(false); } }}
                className="bg-transparent text-[28px] font-bold pb-1 outline-none text-center"
                style={{ width: 48, borderBottom: monthErr ? errorBorder : month ? activeBorder : normalBorder, color: monthErr ? "#ff4444" : TEXT_CLR, caretColor: NAVY }}
              />
              <span className="text-[16px] pb-2" style={{ color: "rgba(255,255,255,0.5)", fontSize: 22 }}>월</span>
            </div>
            {monthErr && <span style={{ fontSize: 10, color: "#ff4444", marginTop: 2 }}>잘못 입력</span>}
          </div>
          {/* 일 */}
          <div className="flex flex-col items-center gap-0">
            <div className="flex items-end gap-1">
              <input
                ref={dayRef}
                type="text" inputMode="numeric" placeholder="10" autoComplete="off"
                value={dayUnknown ? "-" : day}
                disabled={dayUnknown}
                onChange={(e) => { const v = pad(e.target.value, 2); setDay(v); if (v.length === 2) { const d = parseInt(v, 10); setDayErr(d < 1 || d > 31); } else { setDayErr(false); } }}
                className="bg-transparent text-[28px] font-bold pb-1 outline-none text-center"
                style={{ width: 48, borderBottom: dayErr ? errorBorder : day && !dayUnknown ? activeBorder : normalBorder, color: dayUnknown ? "rgba(255,255,255,0.35)" : dayErr ? "#ff4444" : TEXT_CLR, caretColor: NAVY }}
              />
              <span className="text-[16px] pb-2" style={{ color: "rgba(255,255,255,0.5)", fontSize: 22 }}>일</span>
            </div>
            {dayErr && <span style={{ fontSize: 10, color: "#ff4444", marginTop: 2 }}>잘못 입력</span>}
          </div>
        </div>

        {/* 기억안남 체크 */}
        <div className="flex items-center gap-2 mb-5" onClick={() => { setDayUnknown(v => !v); setDay(""); }} style={{ cursor: "pointer" }}>
          <div style={{
            width: 18, height: 18, borderRadius: 4, flexShrink: 0,
            border: `1.5px solid ${dayUnknown ? NAVY : "rgba(255,255,255,0.3)"}`,
            backgroundColor: dayUnknown ? NAVY : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {dayUnknown && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 2.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
          <span className="text-[13px]" style={{ color: dayUnknown ? "#fff" : "rgba(255,255,255,0.5)" }}>정확한 날짜가 기억안남 (년·월만 알고 있소)</span>
        </div>

        {/* 안내 텍스트 */}
        <div className="rounded-2xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            이별한 날을 알면{" "}
            <span style={{ color: TEXT_CLR, fontWeight: 700 }}>그때 그대들의 사주가 어떻게 엇갈렸는지</span>,{" "}
            <span style={{ color: TEXT_CLR, fontWeight: 700 }}>왜 그리 될 수밖에 없었는지</span> 소인이 살펴볼 수 있소.
          </p>
        </div>
      </div>
      <BottomNav onPrev={onPrev} onNext={() => isValid && onNext(dateStr)} nextLabel="다음으로" nextDisabled={!isValid} />
    </>
  );
}

// ─── Step 4: 타이핑 안내 ──────────────────────────────────────────────────────
function StepIntro({ onNext }: { onNext: () => void }) {
  const SCENES = ["적느라 수고 많았소.", "이제 그대들의\n정보를 부탁하오."];
  const [scene, setScene] = useState(0);
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    const text = SCENES[scene];
    let i = 0;
    setDisplayed("");
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(iv);
        setTimeout(() => {
          if (scene < SCENES.length - 1) {
            setScene((s) => s + 1);
          } else {
            setTimeout(onNext, 700);
          }
        }, 1000);
      }
    }, 65);
    return () => clearInterval(iv);
  }, [scene]);

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ minHeight: "100dvh", backgroundColor: "#0a0c10" }}>
      <img src="/media/cards/saju_ehon/ehon-0.jpg" className="absolute inset-0 w-full h-full object-cover object-top opacity-30" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(10,12,16,0.3) 0%, rgba(10,12,16,0.7) 60%, rgba(10,12,16,1) 100%)" }} />
      <div className="relative z-10 px-8 text-center">
        <p className="text-[26px] font-bold leading-relaxed whitespace-pre-line" style={{ color: "#fff", minHeight: "2.2em" }}>
          {displayed}
          <span className="inline-block w-[2px] h-[1.1em] ml-1 align-middle animate-pulse" style={{ backgroundColor: "#7c6af6", verticalAlign: "middle" }} />
        </p>
      </div>
    </div>
  );
}

// ─── Step 10: 중간 타이핑 모션 ───────────────────────────────────────────────
function StepIntro2({ onNext }: { onNext: () => void }) {
  const SCENES = ["과거를 회상하느라\n고생많았소...", "이제 마지막\n단계만 남았소!"];
  const [scene, setScene] = useState(0);
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    const text = SCENES[scene];
    let i = 0;
    setDisplayed("");
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(iv);
        setTimeout(() => {
          if (scene < SCENES.length - 1) {
            setScene((s) => s + 1);
          } else {
            setTimeout(onNext, 700);
          }
        }, 1000);
      }
    }, 65);
    return () => clearInterval(iv);
  }, [scene]);

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ minHeight: "100dvh", backgroundColor: "#0a0c10" }}>
      <img src="/media/cards/saju_ehon/ehon-0.jpg" className="absolute inset-0 w-full h-full object-cover object-top opacity-30" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(10,12,16,0.3) 0%, rgba(10,12,16,0.7) 60%, rgba(10,12,16,1) 100%)" }} />
      <div className="relative z-10 px-8 text-center">
        <p className="text-[26px] font-bold leading-relaxed whitespace-pre-line" style={{ color: "#fff", minHeight: "2.2em" }}>
          {displayed}
          <span className="inline-block w-[2px] h-[1.1em] ml-1 align-middle animate-pulse" style={{ backgroundColor: "#7c6af6", verticalAlign: "middle" }} />
        </p>
      </div>
    </div>
  );
}

// ─── Step 5: 성별 + 태어난 시간 ───────────────────────────────────────────────
function StepGender({ onPrev, onNext, initial, isPartner }: { onPrev: () => void; onNext: (gender: string, date: string, time: string, calendar: string, name: string) => void; initial?: string; isPartner?: boolean }) {
  const prefix = isPartner ? "상대방의" : "나의";
  const [gender, setGender] = useState(initial ?? "");
  const [showDate, setShowDate] = useState(!!initial);
  const [year, setYear]   = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay]     = useState("");
  const [yearErr, setYearErr]   = useState(false);
  const [monthErr, setMonthErr] = useState(false);
  const [dayErr, setDayErr]     = useState(false);
  const [calendar, setCalendar] = useState("");
  const [btime, setBtime] = useState("");
  const [timeOpen, setTimeOpen] = useState(false);
  const [name, setName] = useState("");
  const monthRef2 = useRef<HTMLInputElement>(null);
  const dayRef2   = useRef<HTMLInputElement>(null);

  const pad = (v: string, max: number) => v.replace(/\D/g, "").slice(0, max);
  const mNum = parseInt(month, 10);
  const dNum = parseInt(day, 10);
  const dateEntered = year.length === 4 && !yearErr && mNum >= 1 && mNum <= 12 && !monthErr && dNum >= 1 && dNum <= 31 && !dayErr && !!calendar;
  const timeSelected = dateEntered && !!btime;
  const nameValid = !!name.trim() && /^[가-힣ㄱ-ㅎㅏ-ㅣ\s]+$/.test(name.trim());
  const dateValid = timeSelected && nameValid;
  const dateStr = `${year}.${month.padStart(2,"0")}.${day.padStart(2,"0")}`;

  const activeBorder = `2px solid ${NAVY}`;
  const normalBorder = `2px solid ${BORDER_CLR}`;
  const errorBorder  = `2px solid #ff4444`;

  const handleGender = (g: string) => { setGender(g); setShowDate(true); };

  return (
    <>
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <div className="px-6 pt-4 pb-3" style={{ backgroundColor: CARD_BG }}>
        {/* 성별 */}
        <p className="text-[12px] font-medium mb-0.5" style={{ color: "#8a8a8a" }}>{prefix} 성별</p>
        <h2 className="text-[20px] mb-3" style={{ color: TEXT_CLR }}>
          <span className="font-normal" style={{ color: "rgba(245,245,245,0.45)" }}>{isPartner ? "상대방의 " : "그대의 "}</span>
          <span className="font-bold">성별은 무엇이오?</span>
        </h2>
        <div className="flex gap-3 mb-4">
          {["남성", "여성"].map((label) => (
            <button key={label} onClick={() => handleGender(label)}
              className="flex-1 py-2 rounded-2xl text-[16px] font-bold transition-all"
              style={{
                backgroundColor: gender === label ? "rgba(124,106,246,0.15)" : "rgba(255,255,255,0.04)",
                border: `2px solid ${gender === label ? NAVY : "rgba(255,255,255,0.1)"}`,
                color: gender === label ? "#fff" : "rgba(255,255,255,0.6)",
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* 태어난 날짜 — 성별 선택 시 슬라이드업 */}
        {showDate && (
          <div style={{ animation: "slideUp 0.35s ease" }}>
            <div className="w-full mb-3" style={{ height: 1, backgroundColor: "rgba(255,255,255,0.08)" }} />
            <p className="text-[12px] font-medium mb-0.5" style={{ color: "#8a8a8a" }}>{prefix} 태어난 날짜</p>
            <h2 className="text-[20px] mb-3" style={{ color: TEXT_CLR }}>
              {isPartner ? (
                <>
                  <span className="font-normal" style={{ color: "rgba(245,245,245,0.45)" }}>상대방이 </span>
                  <span className="font-bold">태어난 날짜는?</span>
                </>
              ) : (
                <>
                  <span className="font-normal" style={{ color: "rgba(245,245,245,0.45)" }}>그대가 </span>
                  <span className="font-bold">태어난 날짜는?</span>
                </>
              )}
            </h2>
            {/* 양력/음력/윤달 — 항상 노출 */}
            <div className="flex gap-2 mb-3">
              {["양력", "음력", "윤달"].map((c) => (
                <button key={c} onClick={() => setCalendar(c)}
                  className="flex-1 py-2 rounded-xl text-[13px] font-bold transition-all"
                  style={{
                    backgroundColor: calendar === c ? "rgba(124,106,246,0.15)" : "rgba(255,255,255,0.04)",
                    border: `1.5px solid ${calendar === c ? NAVY : "rgba(255,255,255,0.1)"}`,
                    color: calendar === c ? "#fff" : "rgba(255,255,255,0.6)",
                  }}>
                  {c}
                </button>
              ))}
            </div>

            <style>{`input::placeholder { color: rgba(255,255,255,0.25); }`}</style>
            <div className="flex items-end gap-3">
              <div className="flex flex-col items-center">
                <div className="flex items-end gap-1">
                  <input type="text" inputMode="numeric" placeholder="2000" autoComplete="off" value={year}
                    onChange={(e) => { const v = pad(e.target.value, 4); setYear(v); if (v.length === 4) { const y = parseInt(v,10); const err = y<1950||y>2050; setYearErr(err); if (!err) monthRef2.current?.focus(); } else setYearErr(false); }}
                    className="bg-transparent text-[22px] font-bold pb-1 outline-none text-center"
                    style={{ width: 70, borderBottom: yearErr ? errorBorder : year ? activeBorder : normalBorder, color: yearErr ? "#ff4444" : TEXT_CLR, caretColor: NAVY }} />
                  <span className="pb-1" style={{ color: "rgba(255,255,255,0.5)", fontSize: 18 }}>년</span>
                </div>
                {yearErr && <span style={{ fontSize: 10, color: "#ff4444", marginTop: 2 }}>잘못 입력</span>}
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-end gap-1">
                  <input ref={monthRef2} type="text" inputMode="numeric" placeholder="01" autoComplete="off" value={month}
                    onChange={(e) => { const v = pad(e.target.value, 2); setMonth(v); if (v.length === 2) { const m = parseInt(v,10); const err = m<1||m>12; setMonthErr(err); if (!err) dayRef2.current?.focus(); } else setMonthErr(false); }}
                    className="bg-transparent text-[22px] font-bold pb-1 outline-none text-center"
                    style={{ width: 42, borderBottom: monthErr ? errorBorder : month ? activeBorder : normalBorder, color: monthErr ? "#ff4444" : TEXT_CLR, caretColor: NAVY }} />
                  <span className="pb-1" style={{ color: "rgba(255,255,255,0.5)", fontSize: 18 }}>월</span>
                </div>
                {monthErr && <span style={{ fontSize: 10, color: "#ff4444", marginTop: 2 }}>잘못 입력</span>}
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-end gap-1">
                  <input ref={dayRef2} type="text" inputMode="numeric" placeholder="01" autoComplete="off" value={day}
                    onChange={(e) => { const v = pad(e.target.value, 2); setDay(v); if (v.length === 2) { const d = parseInt(v,10); setDayErr(d<1||d>31); } else setDayErr(false); }}
                    className="bg-transparent text-[22px] font-bold pb-1 outline-none text-center"
                    style={{ width: 42, borderBottom: dayErr ? errorBorder : day ? activeBorder : normalBorder, color: dayErr ? "#ff4444" : TEXT_CLR, caretColor: NAVY }} />
                  <span className="pb-1" style={{ color: "rgba(255,255,255,0.5)", fontSize: 18 }}>일</span>
                </div>
                {dayErr && <span style={{ fontSize: 10, color: "#ff4444", marginTop: 2 }}>잘못 입력</span>}
              </div>
            </div>

            {/* 태어난 시간 — 날짜 완성 시 슬라이드업 */}
            {dateEntered && (
              <div style={{ animation: "slideUp 0.35s ease" }}>
                <div className="w-full my-3" style={{ height: 1, backgroundColor: "rgba(255,255,255,0.08)" }} />
                <p className="text-[12px] font-medium mb-0.5" style={{ color: "#8a8a8a" }}>{prefix} 태어난 시간</p>
                <h2 className="text-[20px] mb-3" style={{ color: TEXT_CLR }}>
                  {isPartner ? (
                    <>
                      <span className="font-normal" style={{ color: "rgba(245,245,245,0.45)" }}>상대방이 </span>
                      <span className="font-bold">태어난 시간은?</span>
                    </>
                  ) : (
                    <>
                      <span className="font-normal" style={{ color: "rgba(245,245,245,0.45)" }}>그대가 </span>
                      <span className="font-bold">태어난 시간은?</span>
                    </>
                  )}
                </h2>
                <div className="flex gap-3">
                  {/* 커스텀 시간 드롭다운 */}
                  <div className="flex-1 relative">
                    <button className="w-full py-3 px-4 rounded-xl text-[15px] font-bold transition-all flex items-center justify-between"
                      onClick={() => setTimeOpen((v) => !v)}
                      style={{
                        backgroundColor: (btime && btime !== "모름") ? "rgba(124,106,246,0.15)" : "rgba(255,255,255,0.04)",
                        border: `1.5px solid ${(btime && btime !== "모름") ? NAVY : "rgba(255,255,255,0.1)"}`,
                        color: (btime && btime !== "모름") ? "#fff" : "rgba(255,255,255,0.45)",
                      }}>
                      <span>{(btime && btime !== "모름") ? btime : "시간 선택"}</span>
                      <span style={{ fontSize: 11, opacity: 0.5, transition: "transform 0.2s", transform: timeOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▲</span>
                    </button>

                    {/* 위로 펼쳐지는 리스트 */}
                    {timeOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setTimeOpen(false)} style={{ backdropFilter: "blur(3px)", backgroundColor: "rgba(0,0,0,0.25)" }} />
                        <div className="absolute z-50 w-full rounded-xl overflow-hidden"
                          style={{
                            bottom: "calc(100% + 8px)",
                            left: 0,
                            backgroundColor: "rgba(18,20,26,0.92)",
                            backdropFilter: "blur(16px)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            animation: "slideUp 0.25s ease",
                            maxHeight: 260,
                            overflowY: "auto",
                          }}>
                          {[
                            { label: "자시", range: "23:30 – 01:30" }, { label: "축시", range: "01:30 – 03:30" },
                            { label: "인시", range: "03:30 – 05:30" }, { label: "묘시", range: "05:30 – 07:30" },
                            { label: "진시", range: "07:30 – 09:30" }, { label: "사시", range: "09:30 – 11:30" },
                            { label: "오시", range: "11:30 – 13:30" }, { label: "미시", range: "13:30 – 15:30" },
                            { label: "신시", range: "15:30 – 17:30" }, { label: "유시", range: "17:30 – 19:30" },
                            { label: "술시", range: "19:30 – 21:30" }, { label: "해시", range: "21:30 – 23:30" },
                          ].map((t) => {
                            const val = `${t.label}(${t.range})`;
                            const selected = btime === val;
                            return (
                              <button key={t.label} className="w-full px-4 py-3 flex items-center justify-between transition-all"
                                onClick={() => { setBtime(val); setTimeOpen(false); }}
                                style={{ backgroundColor: selected ? "rgba(124,106,246,0.18)" : "transparent", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                <span className="text-[15px] font-bold" style={{ color: selected ? "#fff" : "rgba(255,255,255,0.8)" }}>{t.label}</span>
                                <span className="text-[12px]" style={{ color: selected ? NAVY : "rgba(255,255,255,0.35)" }}>{t.range}</span>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                  {/* 시간 모름 */}
                  <button onClick={() => { setBtime("모름"); setTimeOpen(false); }}
                    className="px-4 py-3 rounded-xl text-[15px] font-bold transition-all"
                    style={{
                      backgroundColor: btime === "모름" ? "rgba(124,106,246,0.15)" : "rgba(255,255,255,0.04)",
                      border: `1.5px solid ${btime === "모름" ? NAVY : "rgba(255,255,255,0.1)"}`,
                      color: btime === "모름" ? "#fff" : "rgba(255,255,255,0.5)",
                      whiteSpace: "nowrap",
                    }}>
                    시간 모름
                  </button>
                </div>

                {/* 이름 입력 — 시간 선택 후 슬라이드업 */}
                {timeSelected && (
                  <div style={{ animation: "slideUp 0.35s ease" }}>
                    <div className="w-full my-3" style={{ height: 1, backgroundColor: "rgba(255,255,255,0.08)" }} />
                    <p className="text-[12px] font-medium mb-0.5" style={{ color: "#8a8a8a" }}>이름</p>
                    <h2 className="text-[20px] mb-3" style={{ color: TEXT_CLR }}>
                      <span className="font-normal" style={{ color: "rgba(245,245,245,0.45)" }}>{isPartner ? "상대방의 " : "그대의 "}</span>
                      <span className="font-bold">이름을 알려주시오.</span>
                    </h2>
                    <input
                      type="text" placeholder="홍길동" autoComplete="off"
                      value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent text-[22px] font-bold pb-1 outline-none"
                      style={{ borderBottom: (name && /[^가-힣ㄱ-ㅎㅏ-ㅣ\s]/.test(name)) ? "2px solid #ff4444" : name ? `2px solid ${NAVY}` : `2px solid ${BORDER_CLR}`, color: TEXT_CLR, caretColor: NAVY }}
                    />
                    {name && /[^가-힣ㄱ-ㅎㅏ-ㅣ\s]/.test(name) && (
                      <p className="text-[11px] mt-1" style={{ color: "#ff4444" }}>한글로만 입력하시오</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <BottomNav onPrev={onPrev} onNext={() => gender && dateValid && onNext(gender, dateStr, btime, calendar, name.trim())} nextLabel="다음으로" nextDisabled={!gender || !dateValid} />
    </>
  );
}

// ─── Step 6: 이름 ─────────────────────────────────────────────────────────────
function StepName({ onPrev, onNext, initial }: { onPrev: () => void; onNext: (v: string) => void; initial?: string }) {
  const [name, setName] = useState(initial ?? "");
  return (
    <>
      <div className="px-6 pt-6 pb-2" style={{ backgroundColor: CARD_BG }}>
        <p className="text-[13px] font-medium mb-1" style={{ color: "#8a8a8a" }}>이제 거의 다왔소</p>
        <Title>이름이 어떻게 되시오?</Title>
        <input
          type="text" placeholder="홍연주" value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          className="w-full bg-transparent text-[17px] pb-2.5 outline-none"
          style={{ borderBottom: `1.5px solid ${BORDER_CLR}`, color: name ? TEXT_CLR : PH_CLR, caretColor: NAVY }}
        />
      </div>
      <BottomNav onPrev={onPrev} onNext={() => name.trim() && onNext(name.trim())} nextLabel="다음으로" nextDisabled={!name.trim()} />
    </>
  );
}

// ─── Step 5: 고민 ─────────────────────────────────────────────────────────────
const PILLAR_LABELS_JW = ["시주", "일주", "월주", "년주"] as const;

function StepConcern({ onPrev, onSubmit, initial, date, btime, calendar, name, isPartner }: {
  onPrev: () => void; onSubmit: (v: string) => void; initial?: string;
  date?: string; btime?: string; calendar?: string; name?: string; isPartner?: boolean;
}) {

  const saju = useMemo(() => {
    if (!date) return null;
    try {
      return calcSaju(date, btime ?? "모름", calendar ?? "양력");
    } catch { return null; }
  }, [date, btime, calendar]);

  const pillars = saju ? [saju.pillars.time, saju.pillars.day, saju.pillars.month, saju.pillars.year] : null;

  return (
    <>
      <div className="px-6 pt-6 pb-2" style={{ backgroundColor: CARD_BG }}>
        {/* 명식 그리드 */}
        {name && (
          <div className="mb-2">
            <p className="text-[12px] font-medium mb-0.5" style={{ color: "#8a8a8a" }}>{isPartner ? "상대방의" : "나의"} 사주팔자</p>
            <h2 className="text-[20px] mb-3" style={{ color: TEXT_CLR }}>
              <span className="font-bold" style={{ color: TEXT_CLR }}>{name}님의 </span>
              <span className="font-bold">사주팔자이오</span>
            </h2>
            <div className="grid grid-cols-4 gap-2 rounded-2xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.05)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {(pillars ?? Array(4).fill(null)).map((p, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <p className="text-[15px] font-medium tracking-wide" style={{ color: "#8a8a8a" }}>{PILLAR_LABELS_JW[i]}</p>
                  <span className="text-[15px]" style={{ color: LABEL_CLR }}>{p?.stemSs || ""}</span>
                  <div className="w-full rounded-2xl flex items-center justify-center overflow-hidden" style={{ aspectRatio: "1", backgroundColor: "rgba(255,255,255,0.06)" }}>
                    {p ? <img src={ganCharImage(p.stem)} alt={p.stem} style={{ width: "80%", height: "80%", objectFit: "contain" }} /> : <div className="animate-pulse w-full h-full" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />}
                  </div>
                  <div className="w-full rounded-2xl flex items-center justify-center overflow-hidden" style={{ aspectRatio: "1", backgroundColor: "rgba(255,255,255,0.06)" }}>
                    {p ? <img src={jiCharImage(p.branch)} alt={p.branch} style={{ width: "80%", height: "80%", objectFit: "contain" }} /> : <div className="animate-pulse w-full h-full" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />}
                  </div>
                  <span className="text-[15px]" style={{ color: LABEL_CLR }}>{p?.branchSs || ""}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <BottomNav onPrev={onPrev} onNext={() => onSubmit("")} nextLabel="다음으로" />
    </>
  );
}

// ─── 미니 명식 (고민 입력 상단용) ────────────────────────────────────────────
function MiniMyeongsik({ date, time, calendar, name }: { date?: string; time?: string; calendar?: string; name?: string }) {
  const saju = useMemo(() => {
    if (!date) return null;
    try { return calcSaju(date, time ?? "모름", calendar ?? "양력"); } catch { return null; }
  }, [date, time, calendar]);
  const pillars = saju ? [saju.pillars.time, saju.pillars.day, saju.pillars.month, saju.pillars.year] : null;
  return (
    <div className="flex-1">
      <p className="text-[14px] font-bold mb-2 text-center" style={{ color: TEXT_CLR }}>{name ?? "—"}님 사주팔자</p>
      <div className="grid grid-cols-4 gap-1.5 rounded-2xl p-3" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
        {(pillars ?? Array(4).fill(null)).map((p, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span style={{ fontSize: 12, color: LABEL_CLR, lineHeight: 1 }}>{p?.stemSs || " "}</span>
            <div className="w-full flex items-center justify-center" style={{ aspectRatio: "1" }}>
              {p ? <img src={ganCharImage(p.stem)} alt={p.stem} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <div className="w-full h-full animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />}
            </div>
            <div className="w-full flex items-center justify-center" style={{ aspectRatio: "1" }}>
              {p ? <img src={jiCharImage(p.branch)} alt={p.branch} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <div className="w-full h-full animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />}
            </div>
            <span style={{ fontSize: 12, color: LABEL_CLR, lineHeight: 1 }}>{p?.branchSs || " "}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 고민 입력 ───────────────────────────────────────────────────────────────
function StepConcernInput({ onPrev, onSubmit, initial, myDate, myTime, myCalendar, myName, partnerDate, partnerTime, partnerCalendar, partnerName }: {
  onPrev: () => void; onSubmit: (v: string) => void; initial?: string;
  myDate?: string; myTime?: string; myCalendar?: string; myName?: string;
  partnerDate?: string; partnerTime?: string; partnerCalendar?: string; partnerName?: string;
}) {
  const [text, setText] = useState(initial ?? "");
  const MAX = 200;
  const filled = text.trim().length > 0;
  return (
    <>
      <div className="px-6 pt-6 pb-2" style={{ backgroundColor: CARD_BG }}>
        {/* 나 / 상대방 명식 나란히 */}
        <div className="flex gap-2 mb-5">
          <MiniMyeongsik date={myDate} time={myTime} calendar={myCalendar} name={myName} />
          <div style={{ width: 1, backgroundColor: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
          <MiniMyeongsik date={partnerDate} time={partnerTime} calendar={partnerCalendar} name={partnerName} />
        </div>
        <p className="text-[13px] font-medium mb-1" style={{ color: "#8a8a8a" }}>자세히 적을수록 좋소</p>
        <h2 className="text-[18px] font-bold mb-4" style={{ color: TEXT_CLR }}>
          고민을 상세히 적어주겠소?{" "}
          <span className="text-[13px] font-normal" style={{ color: "#888" }}>(선택)</span>
        </h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX))}
          placeholder="예) 배우자와 갈등이 심해서 이혼을 고민 중이에요. 지금 헤어지는 게 맞는 건지, 앞으로 어떻게 될지 알고 싶어요."
          rows={5}
          className="w-full rounded-2xl p-4 text-[14px] outline-none resize-none leading-relaxed"
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1.5px solid rgba(255,255,255,0.15)",
            color: TEXT_CLR, caretColor: NAVY,
          }}
        />
        <p className="text-right text-[12px] mt-0.5 pr-0.5" style={{ color: text.length >= MAX ? "#e55" : "#c0a8b0" }}>
          {text.length}/{MAX}
        </p>
      </div>
      <BottomNav onPrev={onPrev} onNext={() => onSubmit(text)} nextLabel={filled ? "입력했어요" : "고민은 딱히 없소"} />
    </>
  );
}

// ─── 이메일 도메인 ────────────────────────────────────────────────────────────
const EMAIL_DOMAINS = ["naver.com", "gmail.com", "kakao.com", "daum.net", "hanmail.net", "hotmail.com", "직접입력"];
const MONO_FONT = "'Pretendard', 'Apple SD Gothic Neo', sans-serif";

// ─── Step 6: 이메일 ───────────────────────────────────────────────────────────
function StepEmail({ onPrev, onNext, initial }: { onPrev: () => void; onNext: (email: string) => void; initial?: string }) {
  const initLocal = initial?.split("@")[0] ?? "";
  const initDom = initial?.split("@")[1] ?? "";
  const initIsKnown = EMAIL_DOMAINS.includes(initDom);

  const [local, setLocal] = useState(initLocal);
  const [domain, setDomain] = useState(initDom ? (initIsKnown ? initDom : "직접입력") : "");
  const [custom, setCustom] = useState(initDom && !initIsKnown ? initDom : "");
  const [open, setOpen] = useState(false);

  const isCustom = domain === "직접입력";
  const fullDomain = isCustom ? custom.trim() : domain;
  const email = local.trim() && fullDomain ? `${local.trim()}@${fullDomain}` : "";
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <>
      <div className="px-6 pt-6 pb-2" style={{ backgroundColor: CARD_BG }}>
        <p className="text-[13px] font-medium mb-1" style={{ color: "#8a8a8a" }}>풀이를 받아볼 곳이오</p>
        <Title>이메일 주소를 알려주시게</Title>
        <div className="flex items-end gap-2">
          <input
            type="text" inputMode="email" placeholder="아이디" value={local}
            onChange={(e) => setLocal(e.target.value)}
            className="bg-transparent text-[17px] pb-2.5 outline-none"
            style={{ flex: "1 1 0", minWidth: 0, fontFamily: MONO_FONT, borderBottom: `1.5px solid ${BORDER_CLR}`, color: local ? TEXT_CLR : PH_CLR, caretColor: NAVY }}
            autoFocus
          />
          <span className="text-[17px] font-bold pb-2.5" style={{ color: "#ffffff", fontFamily: MONO_FONT }}>@</span>
          <div className="relative" style={{ flex: "1.2 1 0", minWidth: 0 }}>
            {open && (
              <div
                className="absolute bottom-full left-0 right-0 z-20 rounded-2xl overflow-hidden shadow-xl mb-2"
                style={{ border: "1px solid rgba(255,255,255,0.12)", backgroundColor: "rgba(19,25,33,0.55)", backdropFilter: "blur(8px)" }}
              >
                {EMAIL_DOMAINS.map((d) => (
                  <div
                    key={d}
                    onClick={() => { setDomain(d); setOpen(false); }}
                    className="px-4 py-3 text-[14px] cursor-pointer"
                    style={{
                      backgroundColor: domain === d ? "rgba(155,35,53,0.25)" : "transparent",
                      color: domain === d ? "#fff" : "#ddd",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {d}
                  </div>
                ))}
              </div>
            )}
            {isCustom ? (
              <div className="flex items-center" style={{ borderBottom: `1.5px solid ${BORDER_CLR}` }}>
                <input
                  type="text" placeholder="직접입력" value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  className="bg-transparent text-[16px] pb-2.5 outline-none"
                  style={{ flex: "1 1 0", minWidth: 0, fontFamily: MONO_FONT, color: custom ? TEXT_CLR : PH_CLR, caretColor: NAVY }}
                />
                <button onClick={() => setOpen((v) => !v)} className="pb-2.5 pl-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PH_CLR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between text-[16px] pb-2.5"
                style={{ borderBottom: `1.5px solid ${BORDER_CLR}`, color: domain ? TEXT_CLR : "#7a8590", background: "transparent", fontFamily: MONO_FONT }}
              >
                <span className="truncate">{domain || "선택하기"}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PH_CLR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      <BottomNav onPrev={onPrev} onNext={() => isValid && onNext(email)} nextLabel="작성완료" nextDisabled={!isValid} />
    </>
  );
}

// ─── Step 7: 로딩 ─────────────────────────────────────────────────────────────
function StepLoading({ name, date, time, calendar, gender, email, partnerName, partnerDate, partnerTime, partnerCalendar, partnerGender, concern }: {
  name: string; date: string; time: string; calendar: string; gender?: string; email: string;
  partnerName?: string; partnerDate?: string; partnerTime?: string; partnerCalendar?: string; partnerGender?: string; concern?: string;
}) {
  const [progress, setProgress] = useState(0);
  const [b1, setB1] = useState(false);
  const [b2, setB2] = useState(false);
  const [b3, setB3] = useState(false);
  const router = useRouter();

  const honor = gender === "남자" ? "군" : "양";

  useEffect(() => {
    const t1 = setTimeout(() => setB1(true), 1000);
    const t2 = setTimeout(() => setB2(true), 3500);
    const t3 = setTimeout(() => { setB3(true); setB1(false); setB2(false); }, 6000);
    // 8초 후 자동 이동
    const tEnd = setTimeout(() => goNext(), 8500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(tEnd); };
  }, []);

  useEffect(() => {
    let start: number | null = null;
    const DURATION = 8500;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const pct = Math.min(100, ((ts - start) / DURATION) * 100);
      setProgress(pct);
      if (pct < 100) requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  const goNext = () => {
    const params = new URLSearchParams({
      name, date, time, calendar, gender: gender ?? "", email, concern: concern ?? "",
      partnerName: partnerName ?? "", partnerDate: partnerDate ?? "", partnerTime: partnerTime ?? "",
      partnerCalendar: partnerCalendar ?? "", partnerGender: partnerGender ?? "",
    });
    router.push(`/saju/saju_ehon/checkout?${params.toString()}`);
  };

  const pct = Math.min(100, Math.round(progress));

  function LoadBubble({ text, size, width }: { text: string; size?: string; width?: string }) {
    return (
      <div className="flex items-center justify-center text-center" style={{
        backgroundColor: "#ffffff", borderRadius: "50%", aspectRatio: "4/3",
        width: width ?? "190px", padding: "0 26px", boxSizing: "border-box", boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
      }}>
        <p className="font-bold leading-snug whitespace-pre-line" style={{ color: "#1a1a1a", fontSize: size ?? "16px", fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif" }}>
          {text}
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ backgroundColor: "#0a0a0a" }}>
      <style>{`@keyframes loadFade { from {opacity:0; transform:translateY(12px);} to {opacity:1; transform:translateY(0);} }`}</style>
      <img src="/media/cards/saju_ehon/ehon-0.jpg" className="absolute inset-0 w-full h-full object-cover" style={{ filter: "blur(8px)", transform: "scale(1.1)" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(10,10,10,0.4), rgba(10,10,10,0.7))" }} />

      <div className="absolute" style={{ top: "10%", left: "6%", opacity: b1 ? 1 : 0, transition: "opacity 0.5s ease" }}>
        <LoadBubble text={`${name}님\n사주를 보니`} size="20px" width="200px" />
      </div>
      <div className="absolute" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", opacity: b2 ? 1 : 0, transition: "opacity 0.5s ease" }}>
        <LoadBubble text={"이혼의 기운이\n보이는군.."} size="25px" width="200px" />
      </div>
      {b3 && (
        <div className="absolute" style={{ bottom: "20%", left: "15%", animation: "loadFade 0.5s ease" }}>
          <LoadBubble text={"한번\n들어보겠소?"} size="35px" width="300px" />
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 px-6 pb-12">
        <p className="text-center text-[15px] font-bold mb-3" style={{ color: "#ffffff" }}>
          사주팔자 정밀분석중... <span style={{ color: "#7c6af6" }}>{pct}%</span>
        </p>
        <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: "#7c6af6", transition: "width 0.2s" }} />
        </div>
      </div>
    </div>
  );
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────
type FormData = { gender: string; date: string; calendar: string; time: string; name: string; concern: string; partnerGender: string; partnerDate: string; partnerCalendar: string; partnerTime: string; partnerName: string; email: string; };

export default function EhonFormPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Partial<FormData>>({});

  const next = (data: Partial<FormData>, to: number) => {
    setForm((prev) => ({ ...prev, ...data }));
    setStep(to);
  };

  return (
    <>
      {(step >= 1 && step <= 6) && (
        <FormShell>
          {step === 1 && (
            <StepGender initial={form.gender} onPrev={() => history.back()} onNext={(gender, date, time, calendar, name) => next({ gender, date, time, calendar, name }, 2)} />
          )}
          {step === 2 && (
            <StepConcern initial="" onPrev={() => setStep(1)} onSubmit={() => next({}, 3)}
              date={form.date} btime={form.time} calendar={form.calendar} name={form.name} />
          )}
          {step === 3 && (
            <StepGender isPartner initial={form.partnerGender} onPrev={() => setStep(2)} onNext={(gender, date, time, calendar, name) => next({ partnerGender: gender, partnerDate: date, partnerTime: time, partnerCalendar: calendar, partnerName: name }, 4)} />
          )}
          {step === 4 && (
            <StepConcern isPartner initial="" onPrev={() => setStep(3)} onSubmit={() => next({}, 5)}
              date={form.partnerDate} btime={form.partnerTime} calendar={form.partnerCalendar} name={form.partnerName} />
          )}
          {step === 5 && (
            <StepConcernInput initial={form.concern} onPrev={() => setStep(4)} onSubmit={(concern) => next({ concern }, 6)}
              myDate={form.date} myTime={form.time} myCalendar={form.calendar} myName={form.name}
              partnerDate={form.partnerDate} partnerTime={form.partnerTime} partnerCalendar={form.partnerCalendar} partnerName={form.partnerName} />
          )}
          {step === 6 && (
            <StepEmail initial={form.email} onPrev={() => setStep(5)} onNext={(email) => next({ email }, 7)} />
          )}
        </FormShell>
      )}
      {step === 7 && (
        <StepLoading
          name={form.name ?? ""} date={form.date ?? ""} time={form.time ?? "시간 모름"}
          calendar={form.calendar ?? "양력"} gender={form.gender} email={form.email ?? ""} concern={form.concern ?? ""}
          partnerName={form.partnerName ?? ""} partnerDate={form.partnerDate ?? ""} partnerTime={form.partnerTime ?? "시간 모름"}
          partnerCalendar={form.partnerCalendar ?? "양력"} partnerGender={form.partnerGender ?? ""}
        />
      )}
    </>
  );
}
