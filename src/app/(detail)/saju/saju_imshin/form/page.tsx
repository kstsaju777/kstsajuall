"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { calcSaju } from "@/lib/saju/local-manseryeok";
import { ganCharImage, jiCharImage } from "@/lib/saju/char-image";

// ─── 디자인 토큰 ─────────────────────────────────────────────────────────────
const ACCENT     = "#738e6f";
const CARD_BG    = "#080c0a";
const LABEL_CLR  = "#b5c9b3";
const BORDER_CLR = "#3a4a38";
const PH_CLR     = "#7a8590";
const TEXT_CLR   = "#f5f5f5";
const IMG_BG     = "/media/cards/saju_imshin/imshin-0.jpg";

const BIRTH_TIMES = [
  "자시 (23:30 ~ 01:30)", "축시 (01:30 ~ 03:30)",
  "인시 (03:30 ~ 05:30)", "묘시 (05:30 ~ 07:30)",
  "진시 (07:30 ~ 09:30)", "사시 (09:30 ~ 11:30)",
  "오시 (11:30 ~ 13:30)", "미시 (13:30 ~ 15:30)",
  "신시 (15:30 ~ 17:30)", "유시 (17:30 ~ 19:30)",
  "술시 (19:30 ~ 21:30)", "해시 (21:30 ~ 23:30)",
];

// ─── 뷰포트 훅 ───────────────────────────────────────────────────────────────
function useViewportHeight() {
  const [vh, setVh] = useState<number | null>(null);
  useEffect(() => {
    const update = () => { const vp = window.visualViewport; if (vp) setVh(vp.height); };
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

// ─── FormShell ───────────────────────────────────────────────────────────────
function FormShell({ children }: { children: React.ReactNode }) {
  const vh = useViewportHeight();
  return (
    <div className="relative w-full overflow-hidden"
      style={{ height: vh ? `${vh}px` : "100%", maxHeight: "100%", backgroundColor: CARD_BG }}>
      <img src={IMG_BG} aria-hidden className="absolute inset-0 w-full h-full object-cover object-top" />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.15) 30%, rgba(8,12,10,0.55) 55%, rgba(8,12,10,0.92) 72%, rgba(8,12,10,1) 82%)" }} />
      <div className="absolute bottom-0 left-0 right-0">
        <div style={{ height: 56, background: `linear-gradient(to bottom, transparent, ${CARD_BG})`, pointerEvents: "none" }} />
        {children}
      </div>
    </div>
  );
}

// ─── BottomNav ───────────────────────────────────────────────────────────────
function BottomNav({ onPrev, onNext, nextLabel, nextDisabled = false }: {
  onPrev?: () => void; onNext: () => void; nextLabel: string; nextDisabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-5 pb-8 pt-4" style={{ backgroundColor: CARD_BG }}>
      {onPrev && (
        <button onClick={onPrev} className="flex-shrink-0 px-5 py-3.5 rounded-2xl text-[15px] font-semibold"
          style={{ backgroundColor: CARD_BG, color: "#999", border: "1.5px solid #555" }}>이전</button>
      )}
      <button onClick={onNext} disabled={nextDisabled}
        className="flex-1 py-3.5 rounded-2xl text-white text-[16px] font-bold transition-all"
        style={{ backgroundColor: ACCENT, opacity: nextDisabled ? 0.35 : 1, letterSpacing: "-0.3px" }}>
        {nextLabel}
      </button>
    </div>
  );
}

// ─── 타이핑 인트로 ───────────────────────────────────────────────────────────
function StepIntro({ scenes, onNext }: { scenes: string[]; onNext: () => void }) {
  const [scene, setScene] = useState(0);
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    const text = scenes[scene];
    let i = 0; setDisplayed("");
    const iv = setInterval(() => {
      i++; setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(iv);
        setTimeout(() => {
          if (scene < scenes.length - 1) setScene((s) => s + 1);
          else setTimeout(onNext, 700);
        }, 1000);
      }
    }, 65);
    return () => clearInterval(iv);
  }, [scene]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="relative flex flex-col items-center justify-center" style={{ minHeight: "100dvh", backgroundColor: CARD_BG }}>
      <img src={IMG_BG} className="absolute inset-0 w-full h-full object-cover object-top opacity-30" alt="" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(8,12,10,0.3) 0%, rgba(8,12,10,0.7) 60%, rgba(8,12,10,1) 100%)" }} />
      <div className="relative z-10 px-8 text-center">
        <p className="text-[26px] font-bold leading-relaxed whitespace-pre-line" style={{ color: "#fff", minHeight: "2.2em" }}>
          {displayed}
          <span className="inline-block w-[2px] h-[1.1em] ml-1 align-middle animate-pulse"
            style={{ backgroundColor: ACCENT, verticalAlign: "middle" }} />
        </p>
      </div>
    </div>
  );
}

// ─── StepPersonInfo (본인 or 상대방) ─────────────────────────────────────────
function StepPersonInfo({ onPrev, onNext, isPartner }: {
  onPrev: () => void;
  onNext: (gender: string, date: string, time: string, calendar: string, name: string) => void;
  isPartner?: boolean;
}) {
  const [gender, setGender] = useState("");
  const [showDate, setShowDate] = useState(false);
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
  const monthRef = useRef<HTMLInputElement>(null);
  const dayRef   = useRef<HTMLInputElement>(null);

  const pad = (v: string, max: number) => v.replace(/\D/g, "").slice(0, max);
  const mNum = parseInt(month, 10);
  const dNum = parseInt(day, 10);
  const dateEntered = year.length === 4 && !yearErr && mNum >= 1 && mNum <= 12 && !monthErr && dNum >= 1 && dNum <= 31 && !dayErr && !!calendar;
  const timeSelected = dateEntered && !!btime;
  const nameValid = !!name.trim() && /^[가-힣ㄱ-ㅎㅏ-ㅣ\s]+$/.test(name.trim());
  const canNext = timeSelected && nameValid;
  const dateStr = `${year}.${month.padStart(2, "0")}.${day.padStart(2, "0")}`;

  const AB = `2px solid ${ACCENT}`;
  const NB = `2px solid ${BORDER_CLR}`;
  const EB = `2px solid #ff4444`;

  const subjectLabel = isPartner ? "상대방의" : "그대의";
  const subjectShort = isPartner ? "상대방의" : "나의";

  return (
    <>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}} input::placeholder{color:rgba(255,255,255,0.25)}`}</style>
      <div className="px-6 pt-4 pb-3 overflow-y-auto" style={{ backgroundColor: CARD_BG, maxHeight: "70vh" }}>
        {/* 성별 */}
        <p className="text-[12px] font-medium mb-0.5" style={{ color: "#8a8a8a" }}>{subjectShort} 성별</p>
        <h2 className="text-[20px] mb-3" style={{ color: TEXT_CLR }}>
          <span className="font-normal" style={{ color: "rgba(245,245,245,0.45)" }}>{subjectLabel} </span>
          <span className="font-bold">성별은 무엇이오?</span>
        </h2>
        <div className="flex gap-3 mb-4">
          {["남성", "여성"].map((label) => (
            <button key={label} onClick={() => { setGender(label); setShowDate(true); }}
              className="flex-1 py-2 rounded-2xl text-[16px] font-bold transition-all"
              style={{
                backgroundColor: gender === label ? "rgba(115,142,111,0.18)" : "rgba(255,255,255,0.04)",
                border: `2px solid ${gender === label ? ACCENT : "rgba(255,255,255,0.1)"}`,
                color: gender === label ? "#fff" : "rgba(255,255,255,0.6)",
              }}>
              {label}
            </button>
          ))}
        </div>

        {showDate && (
          <div style={{ animation: "slideUp 0.35s ease" }}>
            <div className="w-full mb-3" style={{ height: 1, backgroundColor: "rgba(255,255,255,0.08)" }} />
            <p className="text-[12px] font-medium mb-0.5" style={{ color: "#8a8a8a" }}>{subjectShort} 생년월일</p>
            <h2 className="text-[20px] mb-3" style={{ color: TEXT_CLR }}>
              <span className="font-normal" style={{ color: "rgba(245,245,245,0.45)" }}>{isPartner ? "상대방이 " : "그대가 "}</span>
              <span className="font-bold">태어난 날짜는?</span>
            </h2>
            <div className="flex gap-2 mb-3">
              {["양력", "음력", "윤달"].map((c) => (
                <button key={c} onClick={() => setCalendar(c)}
                  className="flex-1 py-2 rounded-xl text-[13px] font-bold transition-all"
                  style={{
                    backgroundColor: calendar === c ? "rgba(115,142,111,0.18)" : "rgba(255,255,255,0.04)",
                    border: `1.5px solid ${calendar === c ? ACCENT : "rgba(255,255,255,0.1)"}`,
                    color: calendar === c ? "#fff" : "rgba(255,255,255,0.6)",
                  }}>{c}</button>
              ))}
            </div>
            <div className="flex items-end gap-3 mb-2">
              <div className="flex flex-col items-center">
                <div className="flex items-end gap-1">
                  <input type="text" inputMode="numeric" placeholder="1990" autoComplete="off" value={year}
                    onChange={(e) => { const v = pad(e.target.value, 4); setYear(v); if (v.length === 4) { const y = parseInt(v, 10); const err = y < 1950 || y > 2010; setYearErr(err); if (!err) monthRef.current?.focus(); } else setYearErr(false); }}
                    className="bg-transparent text-[22px] font-bold pb-1 outline-none text-center"
                    style={{ width: 70, borderBottom: yearErr ? EB : year ? AB : NB, color: yearErr ? "#ff4444" : TEXT_CLR, caretColor: ACCENT }} />
                  <span className="pb-1" style={{ color: "rgba(255,255,255,0.5)", fontSize: 18 }}>년</span>
                </div>
                {yearErr && <span style={{ fontSize: 10, color: "#ff4444", marginTop: 2 }}>잘못 입력</span>}
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-end gap-1">
                  <input ref={monthRef} type="text" inputMode="numeric" placeholder="01" autoComplete="off" value={month}
                    onChange={(e) => { const v = pad(e.target.value, 2); setMonth(v); if (v.length === 2) { const m = parseInt(v, 10); const err = m < 1 || m > 12; setMonthErr(err); if (!err) dayRef.current?.focus(); } else setMonthErr(false); }}
                    className="bg-transparent text-[22px] font-bold pb-1 outline-none text-center"
                    style={{ width: 42, borderBottom: monthErr ? EB : month ? AB : NB, color: monthErr ? "#ff4444" : TEXT_CLR, caretColor: ACCENT }} />
                  <span className="pb-1" style={{ color: "rgba(255,255,255,0.5)", fontSize: 18 }}>월</span>
                </div>
                {monthErr && <span style={{ fontSize: 10, color: "#ff4444", marginTop: 2 }}>잘못 입력</span>}
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-end gap-1">
                  <input ref={dayRef} type="text" inputMode="numeric" placeholder="01" autoComplete="off" value={day}
                    onChange={(e) => { const v = pad(e.target.value, 2); setDay(v); if (v.length === 2) { const d = parseInt(v, 10); setDayErr(d < 1 || d > 31); } else setDayErr(false); }}
                    className="bg-transparent text-[22px] font-bold pb-1 outline-none text-center"
                    style={{ width: 42, borderBottom: dayErr ? EB : day ? AB : NB, color: dayErr ? "#ff4444" : TEXT_CLR, caretColor: ACCENT }} />
                  <span className="pb-1" style={{ color: "rgba(255,255,255,0.5)", fontSize: 18 }}>일</span>
                </div>
                {dayErr && <span style={{ fontSize: 10, color: "#ff4444", marginTop: 2 }}>잘못 입력</span>}
              </div>
            </div>

            {dateEntered && (
              <div style={{ animation: "slideUp 0.35s ease" }}>
                <div className="w-full my-3" style={{ height: 1, backgroundColor: "rgba(255,255,255,0.08)" }} />
                <p className="text-[12px] font-medium mb-0.5" style={{ color: "#8a8a8a" }}>{subjectShort} 태어난 시간</p>
                <h2 className="text-[20px] mb-3" style={{ color: TEXT_CLR }}>
                  <span className="font-normal" style={{ color: "rgba(245,245,245,0.45)" }}>{isPartner ? "상대방이 " : "그대가 "}</span>
                  <span className="font-bold">태어난 시간은?</span>
                </h2>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <button className="w-full py-3 px-4 rounded-xl text-[15px] font-bold flex items-center justify-between"
                      onClick={() => setTimeOpen((v) => !v)}
                      style={{
                        backgroundColor: (btime && btime !== "시간 모름") ? "rgba(115,142,111,0.18)" : "rgba(255,255,255,0.04)",
                        border: `1.5px solid ${(btime && btime !== "시간 모름") ? ACCENT : "rgba(255,255,255,0.1)"}`,
                        color: (btime && btime !== "시간 모름") ? "#fff" : "rgba(255,255,255,0.45)",
                      }}>
                      <span>{(btime && btime !== "시간 모름") ? btime : "시간 선택"}</span>
                      <span style={{ fontSize: 11, opacity: 0.5, transform: timeOpen ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block" }}>▲</span>
                    </button>
                    {timeOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setTimeOpen(false)}
                          style={{ backdropFilter: "blur(3px)", backgroundColor: "rgba(0,0,0,0.25)" }} />
                        <div className="absolute z-50 w-full rounded-xl overflow-hidden"
                          style={{ bottom: "calc(100% + 8px)", maxHeight: 220, overflowY: "auto", backgroundColor: "#131a12", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 -8px 24px rgba(0,0,0,0.4)" }}>
                          {BIRTH_TIMES.map((t) => (
                            <button key={t} className="w-full text-left px-4 py-2.5 text-[14px] transition-colors"
                              onClick={() => { setBtime(t); setTimeOpen(false); }}
                              style={{ backgroundColor: btime === t ? "rgba(115,142,111,0.18)" : "transparent", color: btime === t ? "#fff" : "rgba(255,255,255,0.7)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                              {t}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <button className="px-4 py-3 rounded-xl text-[14px] font-bold"
                    onClick={() => setBtime("시간 모름")}
                    style={{
                      backgroundColor: btime === "시간 모름" ? "rgba(115,142,111,0.18)" : "rgba(255,255,255,0.04)",
                      border: `1.5px solid ${btime === "시간 모름" ? ACCENT : "rgba(255,255,255,0.1)"}`,
                      color: btime === "시간 모름" ? "#fff" : "rgba(255,255,255,0.45)",
                    }}>
                    시간 모름
                  </button>
                </div>
              </div>
            )}

            {timeSelected && (
              <div style={{ animation: "slideUp 0.35s ease" }}>
                <div className="w-full my-3" style={{ height: 1, backgroundColor: "rgba(255,255,255,0.08)" }} />
                <p className="text-[12px] font-medium mb-0.5" style={{ color: "#8a8a8a" }}>이름</p>
                <h2 className="text-[20px] mb-3" style={{ color: TEXT_CLR }}>
                  <span className="font-normal" style={{ color: "rgba(245,245,245,0.45)" }}>{subjectLabel} </span>
                  <span className="font-bold">이름을 알려주시오.</span>
                </h2>
                <input type="text" placeholder="홍길동" autoComplete="off" value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent text-[18px] font-bold pb-2 outline-none"
                  style={{ borderBottom: name ? AB : NB, color: TEXT_CLR, caretColor: ACCENT }} />
                {name && !nameValid && (
                  <p className="mt-1 text-[11px]" style={{ color: "#ff4444" }}>한글 이름만 입력해주세요</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <BottomNav onPrev={onPrev} onNext={() => canNext && onNext(gender, dateStr, btime, calendar, name.trim())} nextLabel="다음으로" nextDisabled={!canNext} />
    </>
  );
}

// ─── StepSajuPreview ─────────────────────────────────────────────────────────
const PILLAR_LABELS = ["시주", "일주", "월주", "년주"];

function StepSajuPreview({ onPrev, onNext, date, time, calendar, name, isPartner }: {
  onPrev: () => void; onNext: () => void;
  date?: string; time?: string; calendar?: string; name?: string; isPartner?: boolean;
}) {
  const saju = useMemo(() => {
    if (!date) return null;
    try { return calcSaju(date, time ?? "모름", calendar ?? "양력"); } catch { return null; }
  }, [date, time, calendar]);
  const pillars = saju ? [saju.pillars.time, saju.pillars.day, saju.pillars.month, saju.pillars.year] : null;

  return (
    <>
      <div className="px-6 pt-4 pb-3" style={{ backgroundColor: CARD_BG }}>
        <p className="text-[12px] font-medium mb-1" style={{ color: "#8a8a8a" }}>{isPartner ? "상대방의" : "나의"} 사주팔자</p>
        <h2 className="text-[20px] mb-4" style={{ color: TEXT_CLR }}>
          <span className="font-bold">{name ?? (isPartner ? "상대방" : "그대")}님의 </span>
          <span className="font-bold">사주팔자이오</span>
        </h2>
        <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="grid grid-cols-4 gap-2">
            {(pillars ?? Array(4).fill(null)).map((p, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1 }}>{PILLAR_LABELS[i]}</span>
                <span style={{ fontSize: 13, color: ACCENT, lineHeight: 1, fontWeight: 700 }}>{p?.stemSs || " "}</span>
                <div className="w-full flex items-center justify-center" style={{ aspectRatio: "1" }}>
                  {p ? <img src={ganCharImage(p.stem)} alt={p.stem} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <div className="w-full h-full animate-pulse rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />}
                </div>
                <div className="w-full flex items-center justify-center" style={{ aspectRatio: "1" }}>
                  {p ? <img src={jiCharImage(p.branch)} alt={p.branch} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <div className="w-full h-full animate-pulse rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />}
                </div>
                <span style={{ fontSize: 13, color: ACCENT, lineHeight: 1, fontWeight: 700 }}>{p?.branchSs || " "}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: "rgba(115,142,111,0.08)", border: "1px solid rgba(115,142,111,0.3)" }}>
          <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
            홍연이 <span style={{ color: TEXT_CLR, fontWeight: 700 }}>{name ?? (isPartner ? "상대방" : "그대")}님</span>의 사주팔자를 살펴봤소.{" "}
            {isPartner
              ? "두 사람의 사주를 함께 보면 임신의 기운이 더 또렷이 보이오."
              : "이 여덟 글자 안에 그대의 자녀운과 임신의 기운이 담겨 있소이다."}
          </p>
        </div>
      </div>
      <BottomNav onPrev={onPrev} onNext={onNext} nextLabel="다음으로" />
    </>
  );
}

// ─── 미니 명식 ───────────────────────────────────────────────────────────────
function MiniMyeongsik({ date, time, calendar, name }: { date?: string; time?: string; calendar?: string; name?: string }) {
  const saju = useMemo(() => {
    if (!date) return null;
    try { return calcSaju(date, time ?? "모름", calendar ?? "양력"); } catch { return null; }
  }, [date, time, calendar]);
  const pillars = saju ? [saju.pillars.time, saju.pillars.day, saju.pillars.month, saju.pillars.year] : null;
  return (
    <div className="flex-1">
      <p className="text-[13px] font-bold mb-2 text-center" style={{ color: TEXT_CLR }}>{name ?? "—"}님</p>
      <div className="grid grid-cols-4 gap-1 rounded-2xl p-2.5" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
        {(pillars ?? Array(4).fill(null)).map((p, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span style={{ fontSize: 11, color: LABEL_CLR, lineHeight: 1 }}>{p?.stemSs || " "}</span>
            <div className="w-full flex items-center justify-center" style={{ aspectRatio: "1" }}>
              {p ? <img src={ganCharImage(p.stem)} alt={p.stem} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <div className="w-full h-full animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />}
            </div>
            <div className="w-full flex items-center justify-center" style={{ aspectRatio: "1" }}>
              {p ? <img src={jiCharImage(p.branch)} alt={p.branch} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <div className="w-full h-full animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />}
            </div>
            <span style={{ fontSize: 11, color: LABEL_CLR, lineHeight: 1 }}>{p?.branchSs || " "}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 고민 입력 (두 명식 + textarea) ─────────────────────────────────────────
function StepConcern({ onPrev, onNext,
  myDate, myTime, myCalendar, myName,
  partnerDate, partnerTime, partnerCalendar, partnerName,
}: {
  onPrev: () => void; onNext: (v: string) => void;
  myDate?: string; myTime?: string; myCalendar?: string; myName?: string;
  partnerDate?: string; partnerTime?: string; partnerCalendar?: string; partnerName?: string;
}) {
  const [text, setText] = useState("");
  const MAX = 200;
  const filled = text.trim().length > 0;
  return (
    <>
      <div className="px-6 pt-4 pb-3" style={{ backgroundColor: CARD_BG }}>
        <div className="flex gap-2 mb-5">
          <MiniMyeongsik date={myDate} time={myTime} calendar={myCalendar} name={myName} />
          <div style={{ width: 1, backgroundColor: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
          <MiniMyeongsik date={partnerDate} time={partnerTime} calendar={partnerCalendar} name={partnerName} />
        </div>
        <p className="text-[12px] font-medium mb-1" style={{ color: "#8a8a8a" }}>임신 고민</p>
        <h2 className="text-[20px] mb-3" style={{ color: TEXT_CLR }}>
          <span className="font-normal" style={{ color: "rgba(245,245,245,0.45)" }}>임신에 대해 </span>
          <span className="font-bold">궁금한 점이 있소?</span>
        </h2>
        <div className="rounded-2xl px-4 pt-4 pb-3" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(115,142,111,0.3)" }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX))}
            placeholder="예) 임신이 잘 안 되는데 사주적으로 좋은 시기가 언제인지 궁금해요. 아이와의 인연이 있는지도 알고 싶어요."
            rows={4}
            className="w-full bg-transparent outline-none resize-none text-[13px] leading-relaxed"
            style={{ color: TEXT_CLR, caretColor: ACCENT, border: "none" }}
          />
          <p className="text-right text-[11px] mt-1" style={{ color: "rgba(115,142,111,0.7)" }}>{text.length}/{MAX}</p>
        </div>
      </div>
      <BottomNav onPrev={onPrev} onNext={() => onNext(text)} nextLabel={filled ? "입력했어요" : "궁금한 건 없소"} />
    </>
  );
}

// ─── 이메일 ──────────────────────────────────────────────────────────────────
const EMAIL_DOMAINS = ["naver.com", "gmail.com", "kakao.com", "daum.net", "hanmail.net", "hotmail.com", "직접입력"];
const MONO_FONT = "'Pretendard', 'Apple SD Gothic Neo', sans-serif";

function StepEmail({ onPrev, onNext, initial }: { onPrev: () => void; onNext: (v: string) => void; initial?: string }) {
  const initLocal = initial?.split("@")[0] ?? "";
  const initDom   = initial?.split("@")[1] ?? "";
  const initIsKnown = EMAIL_DOMAINS.includes(initDom);

  const [local, setLocal]   = useState(initLocal);
  const [domain, setDomain] = useState(initDom ? (initIsKnown ? initDom : "직접입력") : "");
  const [custom, setCustom] = useState(initDom && !initIsKnown ? initDom : "");
  const [open, setOpen]     = useState(false);

  const isCustom   = domain === "직접입력";
  const fullDomain = isCustom ? custom.trim() : domain;
  const email      = local.trim() && fullDomain ? `${local.trim()}@${fullDomain}` : "";
  const isValid    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <>
      <div className="px-6 pt-6 pb-2" style={{ backgroundColor: CARD_BG }}>
        <p className="text-[13px] font-medium mb-1" style={{ color: "#8a8a8a" }}>풀이를 받아볼 곳이오</p>
        <h2 className="text-[20px] font-bold mb-5" style={{ color: TEXT_CLR }}>이메일 주소를 알려주시오</h2>
        <div className="flex items-end gap-2">
          <input type="text" inputMode="email" placeholder="아이디" value={local}
            onChange={(e) => setLocal(e.target.value)}
            className="bg-transparent text-[17px] pb-2.5 outline-none"
            style={{ flex: "1 1 0", minWidth: 0, fontFamily: MONO_FONT, borderBottom: `1.5px solid ${BORDER_CLR}`, color: local ? TEXT_CLR : PH_CLR, caretColor: ACCENT }}
            autoFocus />
          <span className="text-[17px] font-bold pb-2.5" style={{ color: "#ffffff", fontFamily: MONO_FONT }}>@</span>
          <div className="relative" style={{ flex: "1.2 1 0", minWidth: 0 }}>
            {open && (
              <div className="absolute bottom-full left-0 right-0 z-20 rounded-2xl overflow-hidden shadow-xl mb-2"
                style={{ border: "1px solid rgba(255,255,255,0.12)", backgroundColor: "rgba(8,20,10,0.9)", backdropFilter: "blur(8px)" }}>
                {EMAIL_DOMAINS.map((d) => (
                  <div key={d} onClick={() => { setDomain(d); setOpen(false); }}
                    className="px-4 py-3 text-[14px] cursor-pointer"
                    style={{ backgroundColor: domain === d ? "rgba(115,142,111,0.2)" : "transparent", color: domain === d ? "#fff" : "#ddd", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {d}
                  </div>
                ))}
              </div>
            )}
            {isCustom ? (
              <div className="flex items-center" style={{ borderBottom: `1.5px solid ${BORDER_CLR}` }}>
                <input type="text" placeholder="직접입력" value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  className="bg-transparent text-[16px] pb-2.5 outline-none"
                  style={{ flex: "1 1 0", minWidth: 0, fontFamily: MONO_FONT, color: custom ? TEXT_CLR : PH_CLR, caretColor: ACCENT }} />
                <button onClick={() => setOpen((v) => !v)} className="pb-2.5 pl-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PH_CLR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>
            ) : (
              <button onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between text-[16px] pb-2.5"
                style={{ borderBottom: `1.5px solid ${BORDER_CLR}`, color: domain ? TEXT_CLR : "#7a8590", background: "transparent", fontFamily: MONO_FONT }}>
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

// ─── 로딩 ────────────────────────────────────────────────────────────────────
function StepLoading({ name, date, time, calendar, gender, email, concern,
  partnerName, partnerDate, partnerTime, partnerCalendar, partnerGender }: {
  name: string; date: string; time: string; calendar: string; gender: string; email: string; concern: string;
  partnerName: string; partnerDate: string; partnerTime: string; partnerCalendar: string; partnerGender: string;
}) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [msg, setMsg] = useState("사주팔자를 세우고 있어요...");
  const doneRef = useRef(false);

  const MSGS = [
    "사주팔자를 세우고 있어요...",
    "자녀운을 살펴보고 있어요...",
    "임신 시기를 분석하고 있어요...",
    "홍연이 풀이를 완성하고 있어요...",
  ];

  useEffect(() => {
    let p = 0;
    const iv = setInterval(() => {
      p = Math.min(p + (Math.random() * 3 + 0.5), 95);
      setProgress(p);
      setMsg(MSGS[Math.floor((p / 100) * MSGS.length)] ?? MSGS[MSGS.length - 1]);
    }, 120);
    const t = setTimeout(() => {
      clearInterval(iv);
      setProgress(100);
      if (!doneRef.current) { doneRef.current = true; goNext(); }
    }, 4500);
    return () => { clearInterval(iv); clearTimeout(t); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const goNext = () => {
    const params = new URLSearchParams({
      name, date, time, calendar, gender, email, concern, ch: "0",
      partnerName, partnerDate, partnerTime, partnerCalendar, partnerGender,
    });
    router.push(`/saju/saju_imshin/checkout?${params.toString()}`);
  };

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ minHeight: "100dvh", backgroundColor: CARD_BG }}>
      <img src={IMG_BG} className="absolute inset-0 w-full h-full object-cover object-top opacity-20" alt="" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(8,12,10,0.5), rgba(8,12,10,0.95))" }} />
      <div className="relative z-10 px-8 w-full max-w-sm text-center">
        <div className="flex items-center justify-center gap-2 mb-5">
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(115,142,111,0.15)", border: "2px solid rgba(115,142,111,0.4)" }}>
            <span style={{ fontSize: 20 }}>🌿</span>
          </div>
          <span style={{ color: "rgba(115,142,111,0.6)", fontSize: 18, fontWeight: 700 }}>♡</span>
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(115,142,111,0.15)", border: "2px solid rgba(115,142,111,0.4)" }}>
            <span style={{ fontSize: 20 }}>🌱</span>
          </div>
        </div>
        <p className="text-[22px] font-black mb-1" style={{ color: "#fff" }}>
          <span style={{ color: ACCENT }}>{name}</span>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 16 }}> & </span>
          <span style={{ color: ACCENT }}>{partnerName}</span>
          <span style={{ color: "#fff" }}>님의</span>
        </p>
        <p className="text-[18px] font-black mb-2" style={{ color: "#fff" }}>임신 궁합</p>
        <p className="text-[13px] mb-8" style={{ color: "rgba(255,255,255,0.5)" }}>홍연이 두 분의 사주를 살펴보고 있어요</p>
        <div className="w-full rounded-full h-2 mb-3" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
          <div className="h-full rounded-full transition-all duration-200" style={{ width: `${progress}%`, backgroundColor: ACCENT }} />
        </div>
        <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.45)" }}>{msg}</p>
      </div>
    </div>
  );
}

// ─── 메인 ────────────────────────────────────────────────────────────────────
type FormData = {
  gender: string; date: string; time: string; calendar: string; name: string;
  partnerGender: string; partnerDate: string; partnerTime: string; partnerCalendar: string; partnerName: string;
  concern: string; email: string;
};

export default function ImshinFormPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Partial<FormData>>({});

  const next = (data: Partial<FormData>, to: number) => {
    setForm((f) => ({ ...f, ...data }));
    setStep(to);
  };

  // step 1: 나의 성별+생년월일+시간+이름
  // step 2: 나의 사주 미리보기
  // step 3: 인트로 "이제 상대방 정보를 알려주시오"
  // step 4: 상대방 성별+생년월일+시간+이름
  // step 5: 상대방 사주 미리보기
  // step 6: 고민 입력
  // step 7: 인트로2 "이제 마지막 단계만 남았소"
  // step 8: 이메일
  // step 9: 로딩

  return (
    <>
      {step === 3 && (
        <StepIntro
          scenes={["입력해주셔서\n감사하오.", "이제 상대방의\n정보를 알려주시오."]}
          onNext={() => setStep(4)}
        />
      )}
      {step === 7 && (
        <StepIntro
          scenes={["적느라\n수고 많았소.", "이제 마지막\n단계만 남았소!"]}
          onNext={() => setStep(8)}
        />
      )}

      {[1, 2, 4, 5, 6, 8].includes(step) && (
        <FormShell>
          {step === 1 && (
            <StepPersonInfo
              onPrev={() => history.back()}
              onNext={(gender, date, time, calendar, name) => next({ gender, date, time, calendar, name }, 2)}
            />
          )}
          {step === 2 && (
            <StepSajuPreview
              onPrev={() => setStep(1)} onNext={() => setStep(3)}
              date={form.date} time={form.time} calendar={form.calendar} name={form.name}
            />
          )}
          {step === 4 && (
            <StepPersonInfo
              isPartner
              onPrev={() => setStep(3)}
              onNext={(gender, date, time, calendar, name) => next({ partnerGender: gender, partnerDate: date, partnerTime: time, partnerCalendar: calendar, partnerName: name }, 5)}
            />
          )}
          {step === 5 && (
            <StepSajuPreview
              isPartner
              onPrev={() => setStep(4)} onNext={() => setStep(6)}
              date={form.partnerDate} time={form.partnerTime} calendar={form.partnerCalendar} name={form.partnerName}
            />
          )}
          {step === 6 && (
            <StepConcern
              onPrev={() => setStep(5)} onNext={(concern) => next({ concern }, 7)}
              myDate={form.date} myTime={form.time} myCalendar={form.calendar} myName={form.name}
              partnerDate={form.partnerDate} partnerTime={form.partnerTime} partnerCalendar={form.partnerCalendar} partnerName={form.partnerName}
            />
          )}
          {step === 8 && (
            <StepEmail
              onPrev={() => setStep(7)}
              onNext={(email) => next({ email }, 9)}
              initial={form.email}
            />
          )}
        </FormShell>
      )}

      {step === 9 && (
        <StepLoading
          name={form.name ?? ""} date={form.date ?? ""} time={form.time ?? "시간 모름"}
          calendar={form.calendar ?? "양력"} gender={form.gender ?? ""} email={form.email ?? ""} concern={form.concern ?? ""}
          partnerName={form.partnerName ?? ""} partnerDate={form.partnerDate ?? ""} partnerTime={form.partnerTime ?? "시간 모름"}
          partnerCalendar={form.partnerCalendar ?? "양력"} partnerGender={form.partnerGender ?? ""}
        />
      )}
    </>
  );
}
