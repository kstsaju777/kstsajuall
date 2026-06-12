"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { calcSaju, ELEMENT_COLORS, type LocalSajuResult } from "@/lib/saju/local-manseryeok";

// ─── 디자인 토큰 ─────────────────────────────────────────────────────────────
const NAVY       = "#9b2335";          // 포인트(버튼/토글) — 시그니처 레드
const CARD_BG    = "#131921";          // 하단 카드 — 어두운 톤
const LABEL_CLR  = "#e0a8b0";          // 소제목 — 밝은 로즈
const BORDER_CLR = "#4a5560";          // 입력 밑줄
const PH_CLR     = "#7a8590";          // 플레이스홀더
const TEXT_CLR   = "#f5f5f5";          // 본문 텍스트 (어두운 카드 위)

const BIRTH_TIMES = [
  "자시 (23:30 ~ 01:30)", "축시 (01:30 ~ 03:30)",
  "인시 (03:30 ~ 05:30)", "묘시 (05:30 ~ 07:30)",
  "진시 (07:30 ~ 09:30)", "사시 (09:30 ~ 11:30)",
  "오시 (11:30 ~ 13:30)", "미시 (13:30 ~ 15:30)",
  "신시 (15:30 ~ 17:30)", "유시 (17:30 ~ 19:30)",
  "술시 (19:30 ~ 21:30)", "해시 (21:30 ~ 23:30)",
];

// ─── 키보드 대응: visualViewport 기반 높이 훅 ─────────────────────────────────
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

// ─── 공통: 배경 이미지 + 하단 카드 래퍼 ─────────────────────────────────────
function FormShell({ children }: { children: React.ReactNode }) {
  const vh = useViewportHeight();

  return (
    // visualViewport 높이에 맞춰 동적으로 조정 → 키보드 올라와도 카드 보임
    <div
      className="relative w-full overflow-hidden"
      style={{ height: vh ? `${vh}px` : "100%", maxHeight: "100%" }}
    >
      {/* 배경 영상 */}
      <video
        src="/images/cards/total-apply.webm"
        aria-hidden
        autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover object-top"
      />
      {/* 그라데이션 오버레이 — 영상 → 어두운 카드 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 20%, rgba(19,25,33,0.15) 45%, rgba(19,25,33,0.55) 60%, rgba(19,25,33,0.85) 72%, rgba(19,25,33,0.97) 82%)",
        }}
      />
      {/* 하단 카드 */}
      <div className="absolute bottom-0 left-0 right-0">
        <div
          style={{
            height: 56,
            background: `linear-gradient(to bottom, transparent, ${CARD_BG})`,
            pointerEvents: "none",
          }}
        />
        {children}
      </div>
    </div>
  );
}

// ─── 공통: 소제목 ─────────────────────────────────────────────────────────────
function Label({ text }: { text: string }) {
  return (
    <p className="text-[13px] font-medium mb-1" style={{ color: LABEL_CLR }}>
      {text}
    </p>
  );
}

// ─── 공통: 메인 타이틀 ────────────────────────────────────────────────────────
function Title({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[24px] font-bold mb-6" style={{ color: TEXT_CLR }}>
      {children}
    </h2>
  );
}

// ─── 공통: Pill 토글 버튼 ────────────────────────────────────────────────────
function PillToggle<T extends string>({
  options,
  value,
  onChange,
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

// ─── 공통: 하단 버튼 영역 ─────────────────────────────────────────────────────
function BottomNav({
  onPrev,
  onNext,
  nextLabel,
  nextDisabled = false,
}: {
  onPrev?: () => void;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-3 px-5 pb-8 pt-4"
      style={{ backgroundColor: CARD_BG }}
    >
      {onPrev && (
        <button
          onClick={onPrev}
          className="flex-shrink-0 px-5 py-3.5 rounded-2xl text-[15px] font-semibold"
          style={{
            backgroundColor: CARD_BG,
            color: "#999",
            border: "1.5px solid #555",
          }}
        >
          이전
        </button>
      )}
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="flex-1 py-3.5 rounded-2xl text-white text-[16px] font-bold transition-all"
        style={{
          backgroundColor: NAVY,
          opacity: nextDisabled ? 0.35 : 1,
          letterSpacing: "-0.3px",
        }}
      >
        {nextLabel}
      </button>
    </div>
  );
}

// ─── Step 1: 성별 ─────────────────────────────────────────────────────────────
function StepGender({ onNext, initial }: { onNext: (v: string) => void; initial?: string }) {
  const [gender, setGender] = useState<"여자" | "남자" | null>((initial as "여자" | "남자") ?? null);

  return (
    <FormShell>
      <div className="px-6 pt-6 pb-2" style={{ backgroundColor: CARD_BG }}>
        <p className="text-[13px] font-medium mb-1" style={{ color: "#8a8a8a" }}>내 질문에 답을 해주시오</p>
        <Title>그대의 성별은 무엇이오?</Title>
        <div className="flex flex-col gap-3">
          {(["여자", "남자"] as const).map((g) => {
            const active = gender === g;
            return (
              <button
                key={g}
                onClick={() => { setGender(g); setTimeout(() => onNext(g), 350); }}
                className="w-full py-4 rounded-2xl text-[16px] font-semibold transition-all"
                style={{
                  backgroundColor: active ? "rgba(155,35,53,0.18)" : "rgba(255,255,255,0.04)",
                  border: `1.5px solid ${active ? NAVY : "rgba(255,255,255,0.18)"}`,
                  color: active ? "#ffffff" : "#dddddd",
                  opacity: active ? 1 : 0.55,
                }}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>
      <BottomNav
        onNext={() => gender && onNext(gender)}
        nextLabel="다음으로"
        nextDisabled={!gender}
      />
    </FormShell>
  );
}

// ─── Step 2: 생년월일 ─────────────────────────────────────────────────────────
function StepBirthDate({
  onPrev,
  onNext,
  gender,
  initialDate,
  initialCalendar,
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

  // 생년월일 유효 입력 시 자동 진행 (사용자가 직접 입력했을 때만)
  useEffect(() => {
    if (isValid && interacted.current) {
      const t = setTimeout(() => onNext({ date, calendar }), 600);
      return () => clearTimeout(t);
    }
  }, [isValid, date, calendar]);

  const greeting = gender === "남자" ? "멋진 도련님, 잘 찾아오셨소" : "어여쁜 아가씨, 잘 찾아오셨소";
  const greetColor = gender === "남자" ? "#7ec8e3" : "#f8a5c2";

  return (
    <FormShell>
      <div className="px-6 pt-6 pb-2" style={{ backgroundColor: CARD_BG }}>
        <p className="text-[13px] font-medium mb-1" style={{ color: greetColor }}>{greeting}</p>
        <Title>언제 태어났는지 말해주게</Title>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <input
              type="text"
              inputMode="numeric"
              placeholder="1999.01.01"
              value={date}
              onChange={(e) => { interacted.current = true; setDate(formatDate(e.target.value)); }}
              className="w-full bg-transparent text-[17px] pb-2.5 outline-none"
              style={{
                borderBottom: `1.5px solid ${!isValidDate && isFilled ? "#e03" : BORDER_CLR}`,
                color: date ? TEXT_CLR : PH_CLR,
                caretColor: NAVY,
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
          <p className="mt-2 text-[13px] font-medium" style={{ color: "#e03" }}>
            생년월일을 다시 확인해주세요!
          </p>
        )}
      </div>
      <BottomNav
        onPrev={onPrev}
        onNext={() => isValid && onNext({ date, calendar })}
        nextLabel="다음으로"
        nextDisabled={!isValid}
      />
    </FormShell>
  );
}

// ─── Step 3: 태어난 시간 ──────────────────────────────────────────────────────
function StepBirthTime({
  onPrev,
  onNext,
  initialTime,
}: {
  onPrev: () => void;
  onNext: (v: string) => void;
  initialTime?: string;
}) {
  const [unknown, setUnknown] = useState(initialTime === "시간 모름");
  const [time, setTime] = useState(initialTime && initialTime !== "시간 모름" ? initialTime : "");
  const [open, setOpen] = useState(false);
  const interacted = useRef(false);

  const selected = unknown ? "시간 모름" : time;

  // 시간 선택 / 시간모름 시 자동 진행 (사용자가 직접 선택했을 때만)
  useEffect(() => {
    if (selected && interacted.current) {
      const t = setTimeout(() => onNext(selected), 450);
      return () => clearTimeout(t);
    }
  }, [selected]);

  return (
    <FormShell>
      <div className="px-6 pt-6 pb-2" style={{ backgroundColor: CARD_BG }}>
        <p className="text-[13px] font-medium mb-1" style={{ color: "#8a8a8a" }}>몰라도 딱히 상관없소</p>
        <h2 className="text-[24px] font-bold mb-6" style={{ color: TEXT_CLR }}>
          혹, 태어난 시간도 아시오?
        </h2>

        {/* 드롭다운(좌) + 시간모름(우) */}
        <div className="flex gap-2 items-stretch">
          {/* 드롭다운 — 위로 열림 */}
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
                <div className="px-4 py-2 text-[12px] font-bold tracking-wide"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "#999" }}>
                  태어난 시간 선택
                </div>
              </div>
            )}

            {/* 트리거 버튼 */}
            <button
              onClick={() => {
                if (unknown) { setUnknown(false); setOpen(true); }
                else setOpen((v) => !v);
              }}
              className="w-full flex items-center justify-between py-3 text-[16px]"
              style={{
                borderBottom: `1.5px solid ${unknown ? "rgba(255,255,255,0.1)" : BORDER_CLR}`,
                color: (time && !unknown) ? TEXT_CLR : PH_CLR,
                opacity: unknown ? 0.4 : 1,
                background: "transparent",
              }}
            >
              <span>{unknown ? "시간 모름" : (time || "태어난 시간")}</span>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke={PH_CLR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>

          {/* 시간 모름 박스 (우측) */}
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
      <BottomNav
        onPrev={onPrev}
        onNext={() => selected && onNext(selected)}
        nextLabel="다음으로"
        nextDisabled={!selected}
      />
    </FormShell>
  );
}

// ─── Step 4: 이름 ─────────────────────────────────────────────────────────────
function StepName({
  onPrev,
  onNext,
  initial,
}: {
  onPrev: () => void;
  onNext: (v: string) => void;
  initial?: string;
}) {
  const [name, setName] = useState(initial ?? "");

  return (
    <FormShell>
      <div className="px-6 pt-6 pb-2" style={{ backgroundColor: CARD_BG }}>
        <p className="text-[13px] font-medium mb-1" style={{ color: "#8a8a8a" }}>이제 거의 다왔소</p>
        <Title>이름이 어떻게 되시오?</Title>
        <input
          type="text"
          placeholder="홍연주"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          className="w-full bg-transparent text-[17px] pb-2.5 outline-none"
          style={{
            borderBottom: `1.5px solid ${BORDER_CLR}`,
            color: name ? TEXT_CLR : PH_CLR,
            caretColor: NAVY,
          }}
        />
      </div>
      <BottomNav
        onPrev={onPrev}
        onNext={() => name.trim() && onNext(name.trim())}
        nextLabel="다음으로"
        nextDisabled={!name.trim()}
      />
    </FormShell>
  );
}

// ─── Step 5: 고민 ─────────────────────────────────────────────────────────────
function StepConcern({
  onPrev,
  onSubmit,
  initial,
}: {
  onPrev: () => void;
  onSubmit: (v: string) => void;
  initial?: string;
}) {
  const [text, setText] = useState(initial ?? "");
  const MAX = 200;
  const filled = text.trim().length > 0;

  return (
    <FormShell>
      <div className="px-6 pt-6 pb-2" style={{ backgroundColor: CARD_BG }}>
        <p className="text-[13px] font-medium mb-1" style={{ color: "#8a8a8a" }}>자세히 적을수록 좋소</p>
        <h2 className="text-[24px] font-bold mb-4" style={{ color: TEXT_CLR }}>
          고민을 상세히 적어주겠소?{" "}
          <span className="text-[15px] font-normal" style={{ color: "#888" }}>(선택) 비워도 괜찮소</span>
        </h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX))}
          placeholder={`(예시) 남자친구랑 헤어지고 다음 연애 상대는 언제 생길지, 아님 재회할 수 있을지 궁금해요...\n직장은 마케팅 쪽으로 갈 수 있을지도 알려주세요!`}
          rows={5}
          className="w-full rounded-2xl p-4 text-[14px] outline-none resize-none leading-relaxed"
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1.5px solid rgba(255,255,255,0.15)",
            color: TEXT_CLR,
            caretColor: NAVY,
          }}
        />
        <p className="text-right text-[12px] mt-1.5 pr-0.5"
          style={{ color: text.length >= MAX ? "#e55" : "#c0a8b0" }}>
          {text.length}/{MAX}
        </p>
      </div>
      <BottomNav
        onPrev={onPrev}
        onNext={() => onSubmit(text)}
        nextLabel={filled ? "이게 내 고민이야!" : "딱히 없어, 넘어가자!"}
      />
    </FormShell>
  );
}

// ─── 이메일 오타 감지 ─────────────────────────────────────────────────────────
const DOMAIN_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com", "gmil.com": "gmail.com", "gmal.com": "gmail.com",
  "gmail.co": "gmail.com", "gamil.com": "gmail.com", "gmaill.com": "gmail.com",
  "nvaer.com": "naver.com", "naevr.com": "naver.com", "naver.co": "naver.com",
  "daum.ne": "daum.net",   "daumnet": "daum.net",
  "hotmial.com": "hotmail.com", "hotmal.com": "hotmail.com",
  "kakoa.com": "kakao.com", "kaka.com": "kakao.com",
};

function getEmailWarning(email: string): string | null {
  if (!email.includes("@")) return null;
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return null;
  const fix = DOMAIN_TYPOS[domain];
  if (fix) return `혹시 ${fix} 인가요? 한 번 더 확인해주세요`;
  return null;
}

// ─── Step 6: 이메일 ───────────────────────────────────────────────────────────
function StepEmail({
  onPrev,
  onNext,
  initial,
}: {
  onPrev: () => void;
  onNext: (email: string) => void;
  initial?: string;
}) {
  const [email, setEmail] = useState(initial ?? "");
  const warning = getEmailWarning(email);
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !warning;

  return (
    <FormShell>
      <div className="px-6 pt-6 pb-2" style={{ backgroundColor: CARD_BG }}>
        <Label text="리포트를 보내드릴게요" />
        <Title>이메일을 알려주세요</Title>
        <input
          type="email"
          inputMode="email"
          placeholder="id@naver.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-transparent text-[17px] pb-2.5 outline-none"
          style={{
            borderBottom: `1.5px solid ${warning ? "#e03" : BORDER_CLR}`,
            color: email ? TEXT_CLR : PH_CLR,
            caretColor: NAVY,
          }}
          autoFocus
        />
        {warning && (
          <p className="mt-2 text-[13px] font-medium" style={{ color: "#e03" }}>
            {warning}
          </p>
        )}
      </div>
      <BottomNav
        onPrev={onPrev}
        onNext={() => isValid && onNext(email)}
        nextLabel="분석해줘!"
        nextDisabled={!isValid}
      />
    </FormShell>
  );
}

// ─── Step 7: 로딩 화면 ────────────────────────────────────────────────────────
const ANALYSIS_ITEMS = [
  "사주 원국 분석 중",
  "타고난 자산 크기 분석 완료",
  "연애·결혼 흐름 분석 중",
  "직업·재물 대운 분석 중",
  "2024–2034 운세 흐름 분석 중",
];

const PILLAR_LABELS = ["시주", "일주", "월주", "년주"] as const;

function StepLoading({
  name, date, time, calendar,
}: {
  name: string; date: string; time: string; calendar: string;
}) {
  const [progress, setProgress] = useState(0);
  const [doneCount, setDoneCount] = useState(0);
  const router = useRouter();

  // 실제 만세력 계산 (lunar-javascript 기반)
  const saju: LocalSajuResult | null = useMemo(
    () => calcSaju(date, time, calendar),
    [date, time, calendar],
  );
  const pillars = saju
    ? [saju.pillars.time, saju.pillars.day, saju.pillars.month, saju.pillars.year]
    : null;

  useEffect(() => {
    // 진행도 애니메이션
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 3 + 1;
        if (next >= 100) { clearInterval(interval); return 100; }
        return next;
      });
    }, 120);

    // 분석 항목 하나씩 완료
    const itemTimers = ANALYSIS_ITEMS.map((_, i) =>
      setTimeout(() => setDoneCount(i + 1), 800 + i * 1200)
    );

    // 완료 후 이동 (사주 데이터를 query로 전달)
    const done = setTimeout(() => {
      const params = new URLSearchParams({
        name,
        date,
        time,
        calendar,
      });
      router.push(`/saju/jeongtong/checkout?${params.toString()}`);
    }, 800 + ANALYSIS_ITEMS.length * 1200 + 600);

    return () => {
      clearInterval(interval);
      itemTimers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, []);

  const pct = Math.min(100, Math.round(progress));

  return (
    <div className="w-full h-full overflow-y-auto" style={{ backgroundColor: "#fdf4f6" }}>
      <div className="px-5 py-8">
        {/* 타이틀 */}
        <h2 className="text-center text-[18px] font-bold mb-6" style={{ color: "#1a1a1a" }}>
          {name}님의 사주 명식
        </h2>

        {/* 사주 명식 그리드 */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {pillars ? pillars.map((p, i) => {
            const cgC = ELEMENT_COLORS[p.stemClass]   ?? ELEMENT_COLORS.unknown;
            const jjC = ELEMENT_COLORS[p.branchClass] ?? ELEMENT_COLORS.unknown;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <p className="text-[11px] font-medium mb-0.5" style={{ color: "#b0909a" }}>
                  {PILLAR_LABELS[i]}
                </p>
                {/* 천간 */}
                <div className="w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5"
                  style={{ backgroundColor: cgC.bg }}>
                  <span className="text-[9px] font-medium" style={{ color: cgC.text }}>{p.stemSs || p.stemHg}</span>
                  <span className="text-[28px] font-bold leading-none" style={{ color: cgC.text }}>{p.stem}</span>
                  <span className="text-[9px]" style={{ color: cgC.text }}>{p.stemHg}</span>
                </div>
                {/* 지지 */}
                <div className="w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5"
                  style={{ backgroundColor: jjC.bg }}>
                  <span className="text-[28px] font-bold leading-none" style={{ color: jjC.text }}>{p.branch}</span>
                  <span className="text-[9px]" style={{ color: jjC.text }}>{p.branchHg}</span>
                </div>
              </div>
            );
          }) : (
            // 계산 실패 시 스켈레톤
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <p className="text-[11px] font-medium mb-0.5" style={{ color: "#b0909a" }}>{PILLAR_LABELS[i]}</p>
                <div className="w-full aspect-square rounded-xl animate-pulse" style={{ backgroundColor: "#ede0e3" }} />
                <div className="w-full aspect-square rounded-xl animate-pulse" style={{ backgroundColor: "#ede0e3" }} />
              </div>
            ))
          )}
        </div>

        {/* 진행도 */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[13px]" style={{ color: "#888" }}>분석 진행도</span>
            <span className="text-[13px] font-bold" style={{ color: NAVY }}>{pct}%</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#e8dde0" }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${pct}%`, backgroundColor: NAVY }}
            />
          </div>
        </div>

        {/* 분석 항목 리스트 */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "white", border: "1px solid #f0e8ea" }}>
          {ANALYSIS_ITEMS.map((item, i) => {
            const done = i < doneCount;
            const active = i === doneCount;
            return (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5"
                style={{ borderBottom: i < ANALYSIS_ITEMS.length - 1 ? "1px solid #faf5f6" : "none" }}>
                {done ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l3.5 3.5L13 5" stroke="#4caf50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : active ? (
                  <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: NAVY, borderTopColor: "transparent" }} />
                ) : (
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#ede0e3" }} />
                )}
                <span className="text-[14px]" style={{ color: done ? "#333" : active ? "#1a1a1a" : "#bbb",
                  fontWeight: active ? 600 : 400 }}>
                  {item}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── 메인: 스텝 관리 ──────────────────────────────────────────────────────────
type FormData = {
  gender: string;
  date: string;
  calendar: string;
  time: string;
  name: string;
  concern: string;
  email: string;
};

export default function SajuFormPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Partial<FormData>>({});

  const next = (data: Partial<FormData>, to: number) => {
    setForm((prev) => ({ ...prev, ...data }));
    setStep(to);
  };

  return (
    <>
      {step === 1 && <StepGender initial={form.gender} onNext={(gender) => next({ gender }, 2)} />}
      {step === 2 && (
        <StepBirthDate
          gender={form.gender}
          initialDate={form.date}
          initialCalendar={form.calendar}
          onPrev={() => setStep(1)}
          onNext={({ date, calendar }) => next({ date, calendar }, 3)}
        />
      )}
      {step === 3 && (
        <StepBirthTime
          initialTime={form.time}
          onPrev={() => setStep(2)}
          onNext={(time) => next({ time }, 4)}
        />
      )}
      {step === 4 && (
        <StepName
          initial={form.name}
          onPrev={() => setStep(3)}
          onNext={(name) => next({ name }, 5)}
        />
      )}
      {step === 5 && (
        <StepConcern
          initial={form.concern}
          onPrev={() => setStep(4)}
          onSubmit={(concern) => next({ concern }, 6)}
        />
      )}
      {step === 6 && (
        <StepEmail
          initial={form.email}
          onPrev={() => setStep(5)}
          onNext={(email) => next({ email }, 7)}
        />
      )}
      {step === 7 && (
        <StepLoading
          name={form.name ?? ""}
          date={form.date ?? ""}
          time={form.time ?? "시간 모름"}
          calendar={form.calendar ?? "양력"}
        />
      )}
    </>
  );
}
