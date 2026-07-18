"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { calcSaju } from "@/lib/saju/local-manseryeok";
import { ganCharImage, jiCharImage } from "@/lib/saju/char-image";

const PINK       = "#e4d1b2";
const CARD_BG    = "#0d0b08";
const BORDER_CLR = "#3d3020";
const PH_CLR     = "#7a8590";
const TEXT_CLR   = "#f5f5f5";
const IMG_BG     = "/media/cards/saju_youare/youare-0.jpg";

const BIRTH_TIMES = [
  "자시 (23:30 ~ 01:30)", "축시 (01:30 ~ 03:30)",
  "인시 (03:30 ~ 05:30)", "묘시 (05:30 ~ 07:30)",
  "진시 (07:30 ~ 09:30)", "사시 (09:30 ~ 11:30)",
  "오시 (11:30 ~ 13:30)", "미시 (13:30 ~ 15:30)",
  "신시 (15:30 ~ 17:30)", "유시 (17:30 ~ 19:30)",
  "술시 (19:30 ~ 21:30)", "해시 (21:30 ~ 23:30)",
];

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

function FormShell({ children }: { children: React.ReactNode }) {
  const vh = useViewportHeight();
  return (
    <div className="relative w-full overflow-hidden" style={{ height: vh ? `${vh}px` : "100%", maxHeight: "100%", backgroundColor: "#0d0f14" }}>
      <img src={IMG_BG} aria-hidden className="absolute inset-0 w-full h-full object-cover object-top" />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.15) 30%, rgba(13,11,8,0.55) 55%, rgba(13,11,8,0.92) 72%, rgba(13,11,8,1) 82%)" }} />
      <div className="absolute bottom-0 left-0 right-0">
        <div style={{ height: 56, background: `linear-gradient(to bottom, transparent, ${CARD_BG})`, pointerEvents: "none" }} />
        {children}
      </div>
    </div>
  );
}

function BottomNav({ onPrev, onNext, nextLabel, nextDisabled = false }: {
  onPrev?: () => void; onNext: () => void; nextLabel: string; nextDisabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-5 pb-8 pt-4" style={{ backgroundColor: CARD_BG }}>
      {onPrev && (
        <button onClick={onPrev} className="flex-shrink-0 px-5 py-3.5 rounded-2xl text-[15px] font-semibold"
          style={{ backgroundColor: CARD_BG, color: "#999", border: "1.5px solid #555" }}>이전</button>
      )}
      <button onClick={onNext} disabled={nextDisabled} className="flex-1 py-3.5 rounded-2xl text-[16px] font-bold transition-all"
        style={{ backgroundColor: PINK, color: "#1a1408", opacity: nextDisabled ? 0.35 : 1, letterSpacing: "-0.3px" }}>{nextLabel}</button>
    </div>
  );
}

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
    <div className="relative flex flex-col items-center justify-center" style={{ minHeight: "100dvh", backgroundColor: "#0d0b08" }}>
      <img src={IMG_BG} className="absolute inset-0 w-full h-full object-cover object-top opacity-30" alt="" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(13,11,8,0.3) 0%, rgba(13,11,8,0.7) 60%, rgba(13,11,8,1) 100%)" }} />
      <div className="relative z-10 px-8 text-center">
        <p className="text-[26px] font-bold leading-relaxed whitespace-pre-line" style={{ color: "#fff", minHeight: "2.2em" }}>
          {displayed}
          <span className="inline-block w-[2px] h-[1.1em] ml-1 align-middle animate-pulse" style={{ backgroundColor: PINK, verticalAlign: "middle" }} />
        </p>
      </div>
    </div>
  );
}

// ─── Step 1: 성별 ─────────────────────────────────────────────────────────────
function StepGender({ onNext, initial }: { onNext: (v: string) => void; initial?: string }) {
  const [gender, setGender] = useState(initial ?? "");
  return (
    <>
      <div className="px-6 pt-6 pb-2" style={{ backgroundColor: CARD_BG }}>
        <p className="text-[13px] font-medium mb-1" style={{ color: "#8a8a8a" }}>자녀 성별</p>
        <h2 className="text-[24px] font-bold mb-6" style={{ color: TEXT_CLR }}>아이의 성별은 무엇이오?</h2>
        <div className="flex gap-3">
          {["남아", "여아"].map((g) => {
            const active = gender === g;
            return (
              <button key={g} onClick={() => { setGender(g); setTimeout(() => onNext(g), 350); }}
                className="flex-1 py-4 rounded-2xl text-[16px] font-semibold transition-all"
                style={{
                  backgroundColor: active ? "rgba(228,209,178,0.15)" : "rgba(255,255,255,0.04)",
                  border: `1.5px solid ${active ? PINK : "rgba(255,255,255,0.18)"}`,
                  color: active ? "#fff" : "#dddddd",
                  opacity: active ? 1 : 0.65,
                }}>
                {g}
              </button>
            );
          })}
        </div>
      </div>
      <BottomNav onNext={() => gender && onNext(gender)} nextLabel="다음으로" nextDisabled={!gender} />
    </>
  );
}

// ─── Step 2: 생년월일 ─────────────────────────────────────────────────────────
function StepBirthDate({ onPrev, onNext, initial, initialCalendar }: {
  onPrev: () => void; onNext: (date: string, calendar: string) => void;
  initial?: string; initialCalendar?: string;
}) {
  const [calendar, setCalendar] = useState(initialCalendar ?? "");
  const [year, setYear]   = useState(initial?.split(".")[0] ?? "");
  const [month, setMonth] = useState(initial?.split(".")[1] ?? "");
  const [day, setDay]     = useState(initial?.split(".")[2] ?? "");
  const [yearErr, setYearErr]   = useState(false);
  const [monthErr, setMonthErr] = useState(false);
  const [dayErr, setDayErr]     = useState(false);
  const monthRef = useRef<HTMLInputElement>(null);
  const dayRef   = useRef<HTMLInputElement>(null);
  const interacted = useRef(false);

  const pad = (v: string, max: number) => v.replace(/\D/g, "").slice(0, max);
  const mNum = parseInt(month, 10);
  const dNum = parseInt(day, 10);
  const isValid = year.length === 4 && !yearErr && mNum >= 1 && mNum <= 12 && !monthErr && dNum >= 1 && dNum <= 31 && !dayErr && !!calendar;
  const dateStr = `${year}.${month.padStart(2, "0")}.${day.padStart(2, "0")}`;
  const AB = `2px solid ${PINK}`;
  const NB = `2px solid ${BORDER_CLR}`;
  const EB = `2px solid #ff4444`;

  useEffect(() => {
    if (isValid && interacted.current && day.length === 2) {
      const t = setTimeout(() => onNext(dateStr, calendar), 500);
      return () => clearTimeout(t);
    }
  }, [isValid, day, dateStr, calendar, onNext]);

  return (
    <>
      <style>{`input::placeholder{color:rgba(255,255,255,0.25)}`}</style>
      <div className="px-6 pt-6 pb-2" style={{ backgroundColor: CARD_BG }}>
        <p className="text-[13px] font-medium mb-1" style={{ color: "#8a8a8a" }}>자녀 태어난 날짜</p>
        <h2 className="text-[20px] font-bold mb-6" style={{ color: TEXT_CLR }}>아이가 태어난 날짜를 알려주시오</h2>
        <div className="flex gap-2 mb-5">
          {["양력", "음력"].map((c) => (
            <button key={c} onClick={() => setCalendar(c)}
              className="flex-1 py-2 rounded-xl text-[13px] font-bold transition-all"
              style={{
                backgroundColor: calendar === c ? "rgba(228,209,178,0.15)" : "rgba(255,255,255,0.04)",
                border: `1.5px solid ${calendar === c ? PINK : "rgba(255,255,255,0.1)"}`,
                color: calendar === c ? "#fff" : "rgba(255,255,255,0.6)",
              }}>{c}</button>
          ))}
        </div>
        <div className="flex items-end gap-3">
          <div className="flex flex-col items-center">
            <div className="flex items-end gap-1">
              <input type="text" inputMode="numeric" placeholder="2020" autoComplete="off" value={year}
                onChange={(e) => { interacted.current = true; const v = pad(e.target.value, 4); setYear(v); if (v.length === 4) { const y = parseInt(v, 10); const err = y < 1900 || y > 2030; setYearErr(err); if (!err) monthRef.current?.focus(); } else setYearErr(false); }}
                className="bg-transparent text-[22px] font-bold pb-1 outline-none text-center"
                style={{ width: 70, borderBottom: yearErr ? EB : year ? AB : NB, color: yearErr ? "#ff4444" : TEXT_CLR, caretColor: PINK }} />
              <span className="pb-1" style={{ color: "rgba(255,255,255,0.5)", fontSize: 18 }}>년</span>
            </div>
            {yearErr && <span style={{ fontSize: 10, color: "#ff4444", marginTop: 2 }}>잘못 입력</span>}
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-end gap-1">
              <input ref={monthRef} type="text" inputMode="numeric" placeholder="01" autoComplete="off" value={month}
                onChange={(e) => { interacted.current = true; const v = pad(e.target.value, 2); setMonth(v); if (v.length === 2) { const m = parseInt(v, 10); const err = m < 1 || m > 12; setMonthErr(err); if (!err) dayRef.current?.focus(); } else setMonthErr(false); }}
                className="bg-transparent text-[22px] font-bold pb-1 outline-none text-center"
                style={{ width: 42, borderBottom: monthErr ? EB : month ? AB : NB, color: monthErr ? "#ff4444" : TEXT_CLR, caretColor: PINK }} />
              <span className="pb-1" style={{ color: "rgba(255,255,255,0.5)", fontSize: 18 }}>월</span>
            </div>
            {monthErr && <span style={{ fontSize: 10, color: "#ff4444", marginTop: 2 }}>잘못 입력</span>}
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-end gap-1">
              <input ref={dayRef} type="text" inputMode="numeric" placeholder="01" autoComplete="off" value={day}
                onChange={(e) => { interacted.current = true; const v = pad(e.target.value, 2); setDay(v); if (v.length === 2) { const d = parseInt(v, 10); setDayErr(d < 1 || d > 31); } else setDayErr(false); }}
                className="bg-transparent text-[22px] font-bold pb-1 outline-none text-center"
                style={{ width: 42, borderBottom: dayErr ? EB : day ? AB : NB, color: dayErr ? "#ff4444" : TEXT_CLR, caretColor: PINK }} />
              <span className="pb-1" style={{ color: "rgba(255,255,255,0.5)", fontSize: 18 }}>일</span>
            </div>
            {dayErr && <span style={{ fontSize: 10, color: "#ff4444", marginTop: 2 }}>잘못 입력</span>}
          </div>
        </div>
      </div>
      <BottomNav onPrev={onPrev} onNext={() => isValid && onNext(dateStr, calendar)} nextLabel="다음으로" nextDisabled={!isValid} />
    </>
  );
}

// ─── Step 3: 태어난 시간 ──────────────────────────────────────────────────────
function StepBirthTime({ onPrev, onNext, initial }: {
  onPrev: () => void; onNext: (v: string) => void; initial?: string;
}) {
  const [btime, setBtime] = useState(initial ?? "");
  const [timeOpen, setTimeOpen] = useState(false);

  const selectTime = (t: string) => { setBtime(t); setTimeOpen(false); setTimeout(() => onNext(t), 350); };

  return (
    <>
      <div className="px-6 pt-6 pb-2" style={{ backgroundColor: CARD_BG }}>
        <p className="text-[13px] font-medium mb-1" style={{ color: "#8a8a8a" }}>자녀 태어난 시간</p>
        <h2 className="text-[24px] font-bold mb-6" style={{ color: TEXT_CLR }}>아이가 태어난 시간은?</h2>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <button className="w-full py-3 px-4 rounded-xl text-[15px] font-bold flex items-center justify-between"
              onClick={() => setTimeOpen((v) => !v)}
              style={{
                backgroundColor: (btime && btime !== "시간 모름") ? "rgba(228,209,178,0.15)" : "rgba(255,255,255,0.04)",
                border: `1.5px solid ${(btime && btime !== "시간 모름") ? PINK : "rgba(255,255,255,0.1)"}`,
                color: (btime && btime !== "시간 모름") ? "#fff" : "rgba(255,255,255,0.45)",
              }}>
              <span>{(btime && btime !== "시간 모름") ? btime : "시간 선택"}</span>
              <span style={{ fontSize: 11, opacity: 0.5, transform: timeOpen ? "rotate(180deg)" : "none", display: "inline-block" }}>▲</span>
            </button>
            {timeOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setTimeOpen(false)} style={{ backdropFilter: "blur(3px)", backgroundColor: "rgba(0,0,0,0.25)" }} />
                <div className="absolute z-50 w-full rounded-xl overflow-hidden"
                  style={{ bottom: "calc(100% + 8px)", maxHeight: 220, overflowY: "auto", backgroundColor: "#1a1e28", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 -8px 24px rgba(0,0,0,0.4)" }}>
                  {BIRTH_TIMES.map((t) => (
                    <button key={t} className="w-full text-left px-4 py-2.5 text-[14px] transition-colors"
                      onClick={() => selectTime(t)}
                      style={{ backgroundColor: btime === t ? "rgba(228,209,178,0.15)" : "transparent", color: btime === t ? "#fff" : "rgba(255,255,255,0.7)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      {t}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <button className="px-4 py-3 rounded-xl text-[14px] font-bold"
            onClick={() => selectTime("시간 모름")}
            style={{
              backgroundColor: btime === "시간 모름" ? "rgba(228,209,178,0.15)" : "rgba(255,255,255,0.04)",
              border: `1.5px solid ${btime === "시간 모름" ? PINK : "rgba(255,255,255,0.1)"}`,
              color: btime === "시간 모름" ? "#fff" : "rgba(255,255,255,0.45)",
            }}>
            시간 모름
          </button>
        </div>
      </div>
      <BottomNav onPrev={onPrev} onNext={() => btime && onNext(btime)} nextLabel="다음으로" nextDisabled={!btime} />
    </>
  );
}

// ─── Step 4: 이름 ─────────────────────────────────────────────────────────────
function StepName({ onPrev, onNext, initial, gender }: {
  onPrev: () => void; onNext: (v: string) => void; initial?: string; gender?: string;
}) {
  const [name, setName] = useState(initial ?? "");
  const nameValid = !!name.trim() && /^[가-힣ㄱ-ㅎㅏ-ㅣ\s]+$/.test(name.trim());
  const suffix = gender === "남아" ? "군" : gender === "여아" ? "양" : "님";
  const AB = `2px solid ${PINK}`;
  const NB = `2px solid ${BORDER_CLR}`;

  return (
    <>
      <style>{`input::placeholder{color:rgba(255,255,255,0.25)}`}</style>
      <div className="px-6 pt-6 pb-2" style={{ backgroundColor: CARD_BG }}>
        <p className="text-[13px] font-medium mb-1" style={{ color: "#8a8a8a" }}>이름</p>
        <h2 className="text-[24px] font-bold mb-6" style={{ color: TEXT_CLR }}>아이의 이름을 알려주시오</h2>
        <input type="text" placeholder="홍길동" autoComplete="off" lang="ko" value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-transparent text-[18px] font-bold pb-2 outline-none"
          style={{ borderBottom: name ? AB : NB, color: TEXT_CLR, caretColor: PINK }}
          autoFocus />
        {name && !nameValid && (
          <p className="mt-1 text-[11px]" style={{ color: "#ff4444" }}>한글 이름만 입력해주세요</p>
        )}
      </div>
      <BottomNav onPrev={onPrev} onNext={() => nameValid && onNext(name.trim())} nextLabel="다음으로" nextDisabled={!nameValid} />
    </>
  );
}

// ─── Step 5: 사주 미리보기 ────────────────────────────────────────────────────
function StepSajuPreview({ onPrev, onNext, date, time, calendar, name, gender }: {
  onPrev: () => void; onNext: () => void;
  date?: string; time?: string; calendar?: string; name?: string; gender?: string;
}) {
  const saju = useMemo(() => {
    if (!date) return null;
    try { return calcSaju(date, time ?? "모름", calendar ?? "양력"); } catch { return null; }
  }, [date, time, calendar]);
  const pillars = saju ? [saju.pillars.time, saju.pillars.day, saju.pillars.month, saju.pillars.year] : null;
  const PILLAR_LABELS = ["시주", "일주", "월주", "년주"];
  const suffix = gender === "남아" ? "군" : gender === "여아" ? "양" : "님";

  return (
    <>
      <div className="px-6 pt-4 pb-3" style={{ backgroundColor: CARD_BG }}>
        <p className="text-[12px] font-medium mb-1" style={{ color: "#8a8a8a" }}>사주팔자</p>
        <h2 className="text-[20px] mb-4" style={{ color: TEXT_CLR }}>
          <span className="font-bold">{name ?? "아이"}{suffix}의 </span>
          <span className="font-bold">사주팔자이오</span>
        </h2>
        <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="grid grid-cols-4 gap-2">
            {(pillars ?? Array(4).fill(null)).map((p, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1 }}>{PILLAR_LABELS[i]}</span>
                <span style={{ fontSize: 13, color: PINK, lineHeight: 1, fontWeight: 700 }}>{p?.stemSs || "-"}</span>
                <div className="w-full flex items-center justify-center" style={{ aspectRatio: "1" }}>
                  {p ? <img src={ganCharImage(p.stem)} alt={p.stem} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <div className="w-full h-full animate-pulse rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />}
                </div>
                <div className="w-full flex items-center justify-center" style={{ aspectRatio: "1" }}>
                  {p ? <img src={jiCharImage(p.branch)} alt={p.branch} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <div className="w-full h-full animate-pulse rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />}
                </div>
                <span style={{ fontSize: 13, color: PINK, lineHeight: 1, fontWeight: 700 }}>{p?.branchSs || "-"}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: "rgba(228,209,178,0.07)", border: "1px solid rgba(228,209,178,0.25)" }}>
          <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
            홍연이 <span style={{ color: TEXT_CLR, fontWeight: 700 }}>{name ?? "아이"}{suffix}</span>의 사주팔자를 살펴봤소.
            이 여덟 글자 안에 아이의 타고난 재능과 성격, 앞으로의 인생이 담겨 있소이다.
          </p>
        </div>
      </div>
      <BottomNav onPrev={onPrev} onNext={onNext} nextLabel="다음으로" />
    </>
  );
}

// ─── Step 6: 고민 입력 ────────────────────────────────────────────────────────
function StepConcern({ onPrev, onNext, initial }: {
  onPrev: () => void; onNext: (v: string) => void; initial?: string;
}) {
  const [text, setText] = useState(initial ?? "");
  const filled = text.trim().length > 0;
  const MAX = 200;
  const PLACEHOLDER = `예) 아이가 건강하게 잘 자랄 수 있을지, 어떤 성격의 아이가 될지 궁금해요. 어떻게 키워야 할지, 나중에 공부는 잘할지도 알고 싶어요.`;

  return (
    <>
      <div className="px-6 pt-4 pb-3" style={{ backgroundColor: CARD_BG }}>
        <p className="text-[12px] font-medium mb-1" style={{ color: "#8a8a8a" }}>고민</p>
        <h2 className="text-[20px] mb-1" style={{ color: TEXT_CLR }}>
          <span className="font-normal" style={{ color: "rgba(245,245,245,0.45)" }}>아이에 대해 </span>
          <span className="font-bold">궁금한 점이 있소?</span>
        </h2>
        <p className="text-[12px] mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>자세히 적을수록 좋소. (안적어도 괜찮소.)</p>
        <div className="rounded-2xl px-4 pt-4 pb-3" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(228,209,178,0.25)" }}>
          <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, MAX))}
            placeholder={PLACEHOLDER} rows={5}
            className="w-full bg-transparent outline-none resize-none text-[13px] leading-relaxed"
            style={{ color: TEXT_CLR, caretColor: PINK, border: "none" }} />
          <p className="text-right text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{text.length}/{MAX}</p>
        </div>
      </div>
      <BottomNav onPrev={onPrev} onNext={() => onNext(text)} nextLabel={filled ? "입력했어요" : "고민은 딱히 없소"} />
    </>
  );
}

// ─── Step 8: 이메일 ──────────────────────────────────────────────────────────
const EMAIL_DOMAINS = ["naver.com", "gmail.com", "kakao.com", "daum.net", "hanmail.net", "hotmail.com", "직접입력"];
const MONO_FONT = "'Pretendard', 'Apple SD Gothic Neo', sans-serif";
const PHONE_PREFIXES = ["010", "011", "016", "017", "018", "019"];

function StepEmail({ onPrev, onNext, initial, initialPhone }: {
  onPrev: () => void; onNext: (email: string, phone: string) => void; initial?: string; initialPhone?: string;
}) {
  const initLocal = initial?.split("@")[0] ?? "";
  const initDom   = initial?.split("@")[1] ?? "";
  const initIsKnown = EMAIL_DOMAINS.includes(initDom);
  const [local, setLocal]   = useState(initLocal);
  const [domain, setDomain] = useState(initDom ? (initIsKnown ? initDom : "직접입력") : "");
  const [custom, setCustom] = useState(initDom && !initIsKnown ? initDom : "");
  const [open, setOpen]     = useState(false);

  const initPhone = initialPhone ?? "";
  const initPrefix = PHONE_PREFIXES.includes(initPhone.slice(0, 3)) ? initPhone.slice(0, 3) : "010";
  const [phonePrefix, setPhonePrefix] = useState(initPrefix);
  const [phoneMid, setPhoneMid] = useState(initPhone.slice(3, 7));
  const [phoneEnd, setPhoneEnd] = useState(initPhone.slice(7, 11));
  const [phoneOpen, setPhoneOpen] = useState(false);
  const phoneEndRef = useRef<HTMLInputElement>(null);

  const isCustom   = domain === "직접입력";
  const fullDomain = isCustom ? custom.trim() : domain;
  const email      = local.trim() && fullDomain ? `${local.trim()}@${fullDomain}` : "";
  const phone      = `${phonePrefix}${phoneMid}${phoneEnd}`;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneValid = /^\d{11}$/.test(phone);
  const isValid    = isEmailValid && isPhoneValid;

  return (
    <>
      <div className="px-6 pt-6 pb-2" style={{ backgroundColor: CARD_BG }}>
        <p className="text-[13px] font-medium mb-1" style={{ color: "#8a8a8a" }}>풀이를 받아볼 곳이오</p>
        <h2 className="text-[20px] font-bold mb-5" style={{ color: TEXT_CLR }}>이메일 주소를 알려주시오</h2>
        <div className="flex items-end gap-2">
          <input type="text" inputMode="email" placeholder="아이디" value={local}
            onChange={(e) => setLocal(e.target.value)}
            className="bg-transparent text-[17px] pb-2.5 outline-none"
            style={{ flex: "1 1 0", minWidth: 0, fontFamily: MONO_FONT, borderBottom: `1.5px solid ${BORDER_CLR}`, color: local ? TEXT_CLR : PH_CLR, caretColor: PINK }}
            autoFocus />
          <span className="text-[17px] font-bold pb-2.5" style={{ color: "#ffffff", fontFamily: MONO_FONT }}>@</span>
          <div className="relative" style={{ flex: "1.2 1 0", minWidth: 0 }}>
            {open && (
              <div className="absolute bottom-full left-0 right-0 z-20 rounded-2xl overflow-hidden shadow-xl mb-2"
                style={{ border: "1px solid rgba(255,255,255,0.12)", backgroundColor: "rgba(19,25,33,0.9)", backdropFilter: "blur(8px)" }}>
                {EMAIL_DOMAINS.map((d) => (
                  <div key={d} onClick={() => { setDomain(d); setOpen(false); }}
                    className="px-4 py-3 text-[14px] cursor-pointer"
                    style={{ backgroundColor: domain === d ? "rgba(228,209,178,0.2)" : "transparent", color: domain === d ? "#fff" : "#ddd", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
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
                  style={{ flex: "1 1 0", minWidth: 0, fontFamily: MONO_FONT, color: custom ? TEXT_CLR : PH_CLR, caretColor: PINK }} />
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

        {/* 전화번호 */}
        <div className="px-6 pt-5 pb-2" style={{ backgroundColor: CARD_BG }}>
          <p className="text-[13px] font-medium mb-1" style={{ color: "#8a8a8a" }}>카카오톡으로도 받아보시게</p>
          <h2 className="text-[20px] font-bold mb-5" style={{ color: TEXT_CLR }}>전화번호를 알려주시오</h2>
          <div className="flex items-end gap-2">
            <div className="relative" style={{ flexShrink: 0 }}>
              {phoneOpen && (
                <div className="absolute bottom-full left-0 z-20 rounded-2xl overflow-hidden shadow-xl mb-2"
                  style={{ minWidth: 80, border: "1px solid rgba(255,255,255,0.12)", backgroundColor: "rgba(19,25,33,0.9)", backdropFilter: "blur(8px)" }}>
                  {PHONE_PREFIXES.map((p) => (
                    <div key={p} onClick={() => { setPhonePrefix(p); setPhoneOpen(false); }}
                      className="px-4 py-3 text-[14px] cursor-pointer"
                      style={{ backgroundColor: phonePrefix === p ? "rgba(228,209,178,0.2)" : "transparent", color: phonePrefix === p ? "#fff" : "#ddd", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      {p}
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => setPhoneOpen((v) => !v)}
                className="flex items-center gap-1 pb-2.5 text-[17px]"
                style={{ borderBottom: `1.5px solid ${BORDER_CLR}`, color: TEXT_CLR, background: "transparent", fontFamily: MONO_FONT }}>
                {phonePrefix}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={PH_CLR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: phoneOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>
            <input type="text" inputMode="numeric" maxLength={4} placeholder="0000" value={phoneMid}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                setPhoneMid(val);
                if (val.length === 4) phoneEndRef.current?.focus();
              }}
              className="bg-transparent text-[17px] pb-2.5 outline-none text-center"
              style={{ flex: "1 1 0", minWidth: 0, fontFamily: MONO_FONT, borderBottom: `1.5px solid ${BORDER_CLR}`, color: phoneMid ? TEXT_CLR : PH_CLR, caretColor: PINK }} />
            <input ref={phoneEndRef} type="text" inputMode="numeric" maxLength={4} placeholder="0000" value={phoneEnd}
              onChange={(e) => setPhoneEnd(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className="bg-transparent text-[17px] pb-2.5 outline-none text-center"
              style={{ flex: "1 1 0", minWidth: 0, fontFamily: MONO_FONT, borderBottom: `1.5px solid ${BORDER_CLR}`, color: phoneEnd ? TEXT_CLR : PH_CLR, caretColor: PINK }} />
          </div>
        </div>

      <BottomNav onPrev={onPrev} onNext={() => isValid && onNext(email, phone)} nextLabel="작성완료" nextDisabled={!isValid} />
    </>
  );
}

// ─── 로딩 ────────────────────────────────────────────────────────────────────
function StepLoading({ name, date, time, calendar, gender, email, concern, phone }: {
  name: string; date: string; time: string; calendar: string; gender: string; email: string; concern: string; phone: string;
}) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [msg, setMsg] = useState("그대의 사주팔자를 세우고 있어요...");
  const doneRef = useRef(false);
  const suffix = gender === "남성" || gender === "남아" || gender === "male" ? "군" : gender === "여성" || gender === "여아" || gender === "female" ? "양" : "님";
  const displayName = name.length > 1 ? name.slice(1) : name;

  const MSGS = [
    "그대의 사주팔자를 세우고 있어요...",
    "타고난 기질과 재능을 분석하고 있어요...",
    "숨겨진 나의 모습을 살펴보고 있어요...",
    "홍연이 나에 대한 풀이를 정리하고 있어요...",
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
    const params = new URLSearchParams({ name, date, time, calendar, gender, email, concern, phone, ch: "0" });
    router.push(`/saju/saju_youare/checkout?${params.toString()}`);
  };

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ minHeight: "100dvh", backgroundColor: "#080a0f" }}>
      <img src={IMG_BG} className="absolute inset-0 w-full h-full object-cover object-top opacity-20" alt="" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(8,10,15,0.5), rgba(8,10,15,0.95))" }} />
      <div className="relative z-10 px-8 w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center"
          style={{ backgroundColor: "rgba(228,209,178,0.15)", border: "2px solid rgba(228,209,178,0.4)" }}>
          <span style={{ fontSize: 28 }}>✨</span>
        </div>
        <p className="text-[22px] font-black mb-1" style={{ color: "#fff" }}>{displayName}{suffix}의 유아사주</p>
        <p className="text-[13px] mb-8" style={{ color: "rgba(255,255,255,0.5)" }}>홍연이 살펴보고 있어요</p>
        <div className="w-full rounded-full h-2 mb-3" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
          <div className="h-full rounded-full transition-all duration-200" style={{ width: `${progress}%`, backgroundColor: PINK }} />
        </div>
        <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.45)" }}>{msg}</p>
      </div>
    </div>
  );
}

// ─── 페이지 ──────────────────────────────────────────────────────────────────
type FormData = {
  gender: string; date: string; calendar: string; time: string; name: string;
  concern: string; email: string; phone: string;
};

export default function YouareFormPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Partial<FormData>>({});

  const next = (data: Partial<FormData>, nextStep: number) => {
    setForm((f) => ({ ...f, ...data }));
    setStep(nextStep);
  };

  // 1: 성별 → 2: 생년월일 → 3: 태어난 시간 → 4: 이름
  // → 5: 사주 미리보기 → 6: 고민 → 7: 인트로 → 8: 이메일 → 9: 로딩

  return (
    <>
      {step === 7 && (
        <StepIntro
          scenes={["입력해주셔서\n감사하오.", "이제 마지막\n단계만 남았소!"]}
          onNext={() => setStep(8)}
        />
      )}

      {[1, 2, 3, 4, 5, 6, 8].includes(step) && (
        <FormShell>
          {step === 1 && <StepGender initial={form.gender} onNext={(gender) => next({ gender }, 2)} />}
          {step === 2 && (
            <StepBirthDate
              onPrev={() => setStep(1)}
              onNext={(date, calendar) => next({ date, calendar }, 3)}
              initial={form.date} initialCalendar={form.calendar}
            />
          )}
          {step === 3 && (
            <StepBirthTime
              onPrev={() => setStep(2)}
              onNext={(time) => next({ time }, 4)}
              initial={form.time}
            />
          )}
          {step === 4 && (
            <StepName
              onPrev={() => setStep(3)}
              onNext={(name) => next({ name }, 5)}
              initial={form.name} gender={form.gender}
            />
          )}
          {step === 5 && (
            <StepSajuPreview
              onPrev={() => setStep(4)}
              onNext={() => setStep(6)}
              date={form.date} time={form.time} calendar={form.calendar}
              name={form.name} gender={form.gender}
            />
          )}
          {step === 6 && (
            <StepConcern
              onPrev={() => setStep(5)}
              onNext={(concern) => next({ concern }, 7)}
              initial={form.concern}
            />
          )}
          {step === 8 && (
            <StepEmail
              onPrev={() => setStep(7)}
              onNext={(email, phone) => next({ email, phone }, 9)}
              initial={form.email}
              initialPhone={form.phone}
            />
          )}
        </FormShell>
      )}

      {step === 9 && (
        <StepLoading
          name={form.name ?? ""}
          date={form.date ?? ""}
          time={form.time ?? "시간 모름"}
          calendar={form.calendar ?? "양력"}
          gender={form.gender ?? ""}
          email={form.email ?? ""}
          concern={form.concern ?? ""}
          phone={form.phone ?? ""}
        />
      )}
    </>
  );
}
