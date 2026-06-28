"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ─── 디자인 토큰 ─────────────────────────────────────────────────────────────
const NAVY       = "#9b2335";
const CARD_BG    = "#131921";
const LABEL_CLR  = "#e0a8b0";
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
      {/* 이미지 영역 — 화면 상단 40% */}
      <div className="absolute top-0 left-0 right-0" style={{ height: "40%" }}>
        <img
          src="/media/cards/kunghap_jaehwe/jaehwe-apply-1.jpg"
          aria-hidden
          className="w-full h-full object-cover" style={{ objectPosition: "center -50px" }}
        />
        {/* 이미지 하단 그라데이션 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent 30%, rgba(19,25,33,0.5) 65%, rgba(19,25,33,0.9) 85%, rgba(19,25,33,1) 100%)",
          }}
        />
      </div>
      {/* 하단 카드 */}
      <div className="absolute bottom-0 left-0 right-0">
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

// ─── Step 2: 생년월일 ─────────────────────────────────────────────────────────
function StepBirthDate({
  onPrev, onNext, gender, initialDate, initialCalendar,
}: {
  onPrev: () => void;
  onNext: (v: { date: string; calendar: string }) => void;
  gender?: string;
  initialDate?: string;
  initialCalendar?: string;
}) {
  const [date, setDate] = useState(initialDate ?? "");
  const [calendar, setCalendar] = useState<"양력" | "음력" | "윤달">((initialCalendar as "양력" | "음력" | "윤달") ?? "양력");
  const interacted = useRef(false);

  const formatDate = (raw: string) => {
    const nums = raw.replace(/\D/g, "").slice(0, 8);
    if (nums.length <= 4) return nums;
    if (nums.length <= 6) return nums.slice(0, 4) + "." + nums.slice(4);
    return nums.slice(0, 4) + "." + nums.slice(4, 6) + "." + nums.slice(6);
  };

  const nums = date.replace(/\./g, "");
  const isFilled = nums.length >= 8;
  const isValidDate = (() => {
    if (!isFilled) return true;
    const y = parseInt(nums.slice(0, 4), 10);
    const m = parseInt(nums.slice(4, 6), 10);
    const d = parseInt(nums.slice(6, 8), 10);
    if (m < 1 || m > 12 || d < 1) return false;
    return d <= new Date(y, m, 0).getDate();
  })();
  const isValid = isFilled && isValidDate;

  useEffect(() => {
    if (isValid && interacted.current) {
      const t = setTimeout(() => onNext({ date, calendar }), 600);
      return () => clearTimeout(t);
    }
  }, [isValid, date, calendar]);

  const greeting = gender === "남자" ? "멋진 도련님, 잘 찾아오셨소" : "어여쁜 아가씨, 잘 찾아오셨소";
  const greetColor = gender === "남자" ? "#7ec8e3" : "#f8a5c2";

  return (
    <>
      <div className="px-6 pt-6 pb-2" style={{ backgroundColor: CARD_BG }}>
        <p className="text-[13px] font-medium mb-1" style={{ color: greetColor }}>{greeting}</p>
        <Title>언제 태어났는지 말해주게</Title>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <input
              type="text" inputMode="numeric" placeholder="1999.01.01"
              value={date}
              onChange={(e) => { interacted.current = true; setDate(formatDate(e.target.value)); }}
              className="w-full bg-transparent text-[17px] pb-2.5 outline-none"
              style={{
                borderBottom: `1.5px solid ${!isValidDate && isFilled ? "#e03" : BORDER_CLR}`,
                color: date ? TEXT_CLR : PH_CLR, caretColor: NAVY,
              }}
            />
          </div>
          <div className="pb-1.5">
            <PillToggle
              options={["양력", "음력", "윤달"] as const}
              value={calendar}
              onChange={(c) => { interacted.current = true; setCalendar(c); }}
            />
          </div>
        </div>
        {!isValidDate && isFilled && (
          <p className="mt-2 text-[13px] font-medium" style={{ color: "#e03" }}>생년월일을 다시 확인해주세요!</p>
        )}
      </div>
      <BottomNav onPrev={onPrev} onNext={() => isValid && onNext({ date, calendar })} nextLabel="다음으로" nextDisabled={!isValid} />
    </>
  );
}

// ─── Step 3: 태어난 시간 ──────────────────────────────────────────────────────
function StepBirthTime({ onPrev, onNext, initialTime }: { onPrev: () => void; onNext: (v: string) => void; initialTime?: string }) {
  const [unknown, setUnknown] = useState(initialTime === "시간 모름");
  const [time, setTime] = useState(initialTime && initialTime !== "시간 모름" ? initialTime : "");
  const [open, setOpen] = useState(false);
  const interacted = useRef(false);
  const selected = unknown ? "시간 모름" : time;

  useEffect(() => {
    if (selected && interacted.current) {
      const t = setTimeout(() => onNext(selected), 450);
      return () => clearTimeout(t);
    }
  }, [selected]);

  return (
    <>
      <div className="px-6 pt-6 pb-2" style={{ backgroundColor: CARD_BG }}>
        <p className="text-[13px] font-medium mb-1" style={{ color: "#8a8a8a" }}>몰라도 딱히 상관없소</p>
        <h2 className="text-[24px] font-bold mb-6" style={{ color: TEXT_CLR }}>혹, 태어난 시간도 아시오?</h2>
        <div className="flex gap-2 items-stretch">
          <div className="relative flex-1">
            {open && !unknown && (
              <div
                className="absolute bottom-full left-0 right-0 z-20 rounded-2xl overflow-hidden shadow-xl mb-2"
                style={{ border: "1px solid rgba(255,255,255,0.12)", backgroundColor: "rgba(19,25,33,0.55)", backdropFilter: "blur(8px)" }}
              >
                <div className="max-h-56 overflow-y-auto flex flex-col-reverse">
                  <div>
                    {BIRTH_TIMES.map((t) => (
                      <div
                        key={t}
                        onClick={() => { interacted.current = true; setTime(t); setOpen(false); }}
                        className="px-4 py-3 text-[14px] cursor-pointer"
                        style={{
                          backgroundColor: time === t ? "rgba(155,35,53,0.25)" : "transparent",
                          color: time === t ? "#fff" : "#ddd",
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-4 py-2 text-[12px] font-bold tracking-wide" style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "#999" }}>
                  태어난 시간 선택
                </div>
              </div>
            )}
            <button
              onClick={() => { if (unknown) { setUnknown(false); setOpen(true); } else setOpen((v) => !v); }}
              className="w-full flex items-center justify-between py-3 text-[16px]"
              style={{
                borderBottom: `1.5px solid ${unknown ? "rgba(255,255,255,0.1)" : BORDER_CLR}`,
                color: (time && !unknown) ? TEXT_CLR : PH_CLR,
                opacity: unknown ? 0.4 : 1, background: "transparent",
              }}
            >
              <span>{unknown ? "시간 모름" : (time || "태어난 시간")}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PH_CLR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
          <button
            onClick={() => { interacted.current = true; setUnknown((v) => !v); setTime(""); setOpen(false); }}
            className="flex-shrink-0 px-4 rounded-xl text-[13px] font-semibold transition-all"
            style={{
              backgroundColor: unknown ? "rgba(155,35,53,0.18)" : "rgba(255,255,255,0.04)",
              border: `1.5px solid ${unknown ? NAVY : "rgba(255,255,255,0.18)"}`,
              color: unknown ? "#fff" : "#bbb",
            }}
          >
            시간모름
          </button>
        </div>
      </div>
      <BottomNav onPrev={onPrev} onNext={() => selected && onNext(selected)} nextLabel="다음으로" nextDisabled={!selected} />
    </>
  );
}

// ─── Step 4: 이름 ─────────────────────────────────────────────────────────────
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
function StepConcern({ onPrev, onSubmit, initial }: { onPrev: () => void; onSubmit: (v: string) => void; initial?: string }) {
  const [text, setText] = useState(initial ?? "");
  const MAX = 200;
  const filled = text.trim().length > 0;
  return (
    <>
      <div className="px-6 pt-6 pb-2" style={{ backgroundColor: CARD_BG }}>
        <p className="text-[13px] font-medium mb-1" style={{ color: "#8a8a8a" }}>자세히 적을수록 좋소</p>
        <h2 className="text-[24px] font-bold mb-4" style={{ color: TEXT_CLR }}>
          고민을 상세히 적어주겠소?{" "}
          <span className="text-[15px] font-normal" style={{ color: "#888" }}>(선택)</span>
        </h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX))}
          placeholder="헤어진 이유, 상대방과의 관계, 재회를 원하는 이유 등을 자유롭게 적어주세요."
          rows={5}
          className="w-full rounded-2xl p-4 text-[14px] outline-none resize-none leading-relaxed"
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1.5px solid rgba(255,255,255,0.15)",
            color: TEXT_CLR, caretColor: NAVY,
          }}
        />
        <p className="text-right text-[12px] mt-1.5 pr-0.5" style={{ color: text.length >= MAX ? "#e55" : "#c0a8b0" }}>
          {text.length}/{MAX}
        </p>
      </div>
      <BottomNav onPrev={onPrev} onNext={() => onSubmit(text)} nextLabel={filled ? "다음으로" : "고민은 딱히 없소"} />
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
function StepLoading({ name, date, time, calendar, gender, email }: {
  name: string; date: string; time: string; calendar: string; gender?: string; email: string;
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
    const params = new URLSearchParams({ name, date, time, calendar, gender: gender ?? "", email });
    router.push(`/saju/kunghap_jaehwe/checkout?${params.toString()}`);
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
      <img src="/media/cards/kunghap_jaehwe/jaehwe-1.jpg" className="absolute inset-0 w-full h-full object-cover" style={{ filter: "blur(8px)", transform: "scale(1.1)" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(10,10,10,0.4), rgba(10,10,10,0.7))" }} />

      <div className="absolute" style={{ top: "10%", left: "6%", opacity: b1 ? 1 : 0, transition: "opacity 0.5s ease" }}>
        <LoadBubble text={`${name}${honor}\n사주를 보니`} size="20px" width="200px" />
      </div>
      <div className="absolute" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", opacity: b2 ? 1 : 0, transition: "opacity 0.5s ease" }}>
        <LoadBubble text={"재회의 기운이\n보이는군.."} size="25px" width="200px" />
      </div>
      {b3 && (
        <div className="absolute" style={{ bottom: "20%", left: "15%", animation: "loadFade 0.5s ease" }}>
          <LoadBubble text={"한번\n들어보겠소?"} size="35px" width="300px" />
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 px-6 pb-12">
        <p className="text-center text-[15px] font-bold mb-3" style={{ color: "#ffffff" }}>
          사주팔자 정밀분석중... <span style={{ color: "#ff69b4" }}>{pct}%</span>
        </p>
        <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: "#9b2335", transition: "width 0.2s" }} />
        </div>
      </div>
    </div>
  );
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────
type FormData = { breakupReason: string; gender: string; date: string; calendar: string; time: string; name: string; concern: string; email: string; };

export default function JaehweFormPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Partial<FormData>>({});

  const next = (data: Partial<FormData>, to: number) => {
    setForm((prev) => ({ ...prev, ...data }));
    setStep(to);
  };

  return (
    <>
      {step <= 6 && (
        <FormShell>
          {step === 1 && <StepBreakupReason initial={form.breakupReason} onNext={(breakupReason) => next({ breakupReason }, 2)} />}
          {step === 2 && (
            <StepBirthDate
              gender={form.gender} initialDate={form.date} initialCalendar={form.calendar}
              onPrev={() => setStep(1)}
              onNext={({ date, calendar }) => next({ date, calendar }, 3)}
            />
          )}
          {step === 3 && (
            <StepBirthTime initialTime={form.time} onPrev={() => setStep(2)} onNext={(time) => next({ time }, 4)} />
          )}
          {step === 4 && (
            <StepName initial={form.name} onPrev={() => setStep(3)} onNext={(name) => next({ name }, 5)} />
          )}
          {step === 5 && (
            <StepConcern initial={form.concern} onPrev={() => setStep(4)} onSubmit={(concern) => next({ concern }, 6)} />
          )}
          {step === 6 && (
            <StepEmail initial={form.email} onPrev={() => setStep(5)} onNext={(email) => next({ email }, 7)} />
          )}
        </FormShell>
      )}
      {step === 7 && (
        <StepLoading
          name={form.name ?? ""} date={form.date ?? ""} time={form.time ?? "시간 모름"}
          calendar={form.calendar ?? "양력"} gender={form.gender} email={form.email ?? ""}
        />
      )}
    </>
  );
}
