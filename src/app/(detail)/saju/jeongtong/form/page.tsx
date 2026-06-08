"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ─── 디자인 토큰 ─────────────────────────────────────────────────────────────
const NAVY       = "#2d3a8c";
const CARD_BG    = "rgb(252,220,228)";
const LABEL_CLR  = "#c47c85";
const BORDER_CLR = "#d4a8b4";
const PH_CLR     = "#d4a8b4";

const BIRTH_TIMES = [
  "자시 (23:00 ~ 01:00)", "축시 (01:00 ~ 03:00)",
  "인시 (03:00 ~ 05:00)", "묘시 (05:00 ~ 07:00)",
  "진시 (07:00 ~ 09:00)", "사시 (09:00 ~ 11:00)",
  "오시 (11:00 ~ 13:00)", "미시 (13:00 ~ 15:00)",
  "신시 (15:00 ~ 17:00)", "유시 (17:00 ~ 19:00)",
  "술시 (19:00 ~ 21:00)", "해시 (21:00 ~ 23:00)",
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
      style={{ height: vh ? `${vh}px` : "100%" }}
    >
      {/* 배경 이미지 */}
      <img
        src="/images/hero/hero-1.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover object-top"
      />
      {/* 그라데이션 오버레이 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 20%, rgba(252,220,228,0.15) 45%, rgba(252,220,228,0.55) 60%, rgba(252,220,228,0.85) 72%, rgba(252,220,228,0.97) 82%)",
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
    <h2 className="text-[24px] font-bold mb-6" style={{ color: "#1a1a1a" }}>
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
            backgroundColor: "rgba(255,255,255,0.55)",
            color: "#888",
            border: "1.5px solid rgba(200,180,185,0.5)",
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
          backgroundColor: nextDisabled ? "#c0b8d0" : NAVY,
          letterSpacing: "-0.3px",
        }}
      >
        {nextLabel}
      </button>
    </div>
  );
}

// ─── Step 1: 성별 ─────────────────────────────────────────────────────────────
function StepGender({ onNext }: { onNext: (v: string) => void }) {
  const [gender, setGender] = useState<"여자" | "남자" | null>(null);

  return (
    <FormShell>
      <div className="px-6 pt-6 pb-2" style={{ backgroundColor: CARD_BG }}>
        <Label text="꼼꼼히 사주 봐드릴게요!" />
        <Title>성별이 어떻게 되세요?</Title>
        <div className="flex flex-col gap-3">
          {(["여자", "남자"] as const).map((g) => {
            const active = gender === g;
            return (
              <button
                key={g}
                onClick={() => setGender(g)}
                className="w-full py-4 rounded-2xl text-[16px] font-semibold transition-all"
                style={{
                  backgroundColor: active ? "rgba(45,58,140,0.08)" : "rgba(255,255,255,0.7)",
                  border: `1.5px solid ${active ? NAVY : "rgba(200,180,185,0.5)"}`,
                  color: active ? NAVY : "#555",
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
        nextLabel="다음으로!"
        nextDisabled={!gender}
      />
    </FormShell>
  );
}

// ─── Step 2: 생년월일 ─────────────────────────────────────────────────────────
function StepBirthDate({
  onPrev,
  onNext,
}: {
  onPrev: () => void;
  onNext: (v: { date: string; calendar: string }) => void;
}) {
  const [date, setDate] = useState("");
  const [calendar, setCalendar] = useState<"양력" | "음력" | "윤달">("양력");

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

  return (
    <FormShell>
      <div className="px-6 pt-6 pb-2" style={{ backgroundColor: CARD_BG }}>
        <Label text="사주의 첫 단추예요" />
        <Title>생년월일을 알려주세요</Title>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <input
              type="text"
              inputMode="numeric"
              placeholder="1999.01.01"
              value={date}
              onChange={(e) => setDate(formatDate(e.target.value))}
              className="w-full bg-transparent text-[17px] pb-2.5 outline-none"
              style={{
                borderBottom: `1.5px solid ${!isValidDate && isFilled ? "#e03" : BORDER_CLR}`,
                color: date ? "#1a1a1a" : PH_CLR,
                caretColor: NAVY,
              }}
            />
          </div>
          <div className="pb-1.5">
            <PillToggle
              options={["양력", "음력", "윤달"] as const}
              value={calendar}
              onChange={setCalendar}
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
        nextLabel="응, 입력했어!"
        nextDisabled={!isValid}
      />
    </FormShell>
  );
}

// ─── Step 3: 태어난 시간 ──────────────────────────────────────────────────────
function StepBirthTime({
  onPrev,
  onNext,
}: {
  onPrev: () => void;
  onNext: (v: string) => void;
}) {
  const [unknown, setUnknown] = useState(false);
  const [time, setTime] = useState("");
  const [open, setOpen] = useState(false);

  const selected = unknown ? "시간 모름" : time;

  return (
    <FormShell>
      <div className="px-6 pt-6 pb-2" style={{ backgroundColor: CARD_BG }}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <Label text="태어난 시간이 운명을 가른대요" />
            <h2 className="text-[24px] font-bold" style={{ color: "#1a1a1a" }}>
              나의 태어난 시간
            </h2>
          </div>
          <button
            onClick={() => { setUnknown((v) => !v); setTime(""); setOpen(false); }}
            className="flex items-center gap-1.5 mt-2 flex-shrink-0"
          >
            <div
              className="w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-all"
              style={{
                borderColor: unknown ? NAVY : "#c0a8b4",
                backgroundColor: unknown ? NAVY : "transparent",
              }}
            >
              {unknown && (
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-[13px] font-medium" style={{ color: unknown ? NAVY : "#b0909a" }}>
              시간 모름
            </span>
          </button>
        </div>

        {/* 드롭다운 — 위로 열림 */}
        <div className="relative">
          {/* 목록: bottom-full 로 위로 펼침 */}
          {open && !unknown && (
            <div
              className="absolute bottom-full left-0 right-0 z-20 rounded-2xl overflow-hidden shadow-xl mb-2"
              style={{ border: "1px solid #eadde0", backgroundColor: "white" }}
            >
              <div className="max-h-56 overflow-y-auto flex flex-col-reverse">
                {/* 시간 목록 (역순으로 쌓아서 위에서 자시가 먼저 보이게) */}
                <div>
                  {BIRTH_TIMES.map((t) => (
                    <div
                      key={t}
                      onClick={() => { setTime(t); setOpen(false); }}
                      className="px-4 py-3 text-[14px] cursor-pointer"
                      style={{
                        backgroundColor: time === t ? "rgba(45,58,140,0.06)" : "white",
                        color: time === t ? NAVY : "#333",
                        borderBottom: "1px solid #faf5f6",
                      }}
                    >
                      {t}
                    </div>
                  ))}
                </div>
              </div>
              <div
                onClick={() => { setUnknown(true); setTime(""); setOpen(false); }}
                className="px-4 py-3 text-[14px] cursor-pointer"
                style={{ color: "#b0909a", borderTop: "1px solid #f5eff0", backgroundColor: "#fdf8f9" }}
              >
                시간 모름
              </div>
              <div className="px-4 py-2 text-[12px] font-bold tracking-wide"
                style={{ backgroundColor: "#f5eff0", color: "#b0909a" }}>
                태어난 시간 선택
              </div>
            </div>
          )}

          {/* 트리거 버튼 */}
          <button
            onClick={() => !unknown && setOpen((v) => !v)}
            disabled={unknown}
            className="w-full flex items-center justify-between py-3 text-[16px]"
            style={{
              borderBottom: `1.5px solid ${unknown ? "rgba(200,168,180,0.4)" : BORDER_CLR}`,
              color: (time && !unknown) ? "#1a1a1a" : PH_CLR,
              opacity: unknown ? 0.5 : 1,
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
      </div>
      <BottomNav
        onPrev={onPrev}
        onNext={() => selected && onNext(selected)}
        nextLabel="응, 입력했어!"
        nextDisabled={!selected}
      />
    </FormShell>
  );
}

// ─── Step 4: 이름 ─────────────────────────────────────────────────────────────
function StepName({
  onPrev,
  onNext,
}: {
  onPrev: () => void;
  onNext: (v: string) => void;
}) {
  const [name, setName] = useState("");

  return (
    <FormShell>
      <div className="px-6 pt-6 pb-2" style={{ backgroundColor: CARD_BG }}>
        <Label text="이제 거의 다 왔어요" />
        <Title>이름이 어떻게 되세요?</Title>
        <input
          type="text"
          placeholder="김지은"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          className="w-full bg-transparent text-[17px] pb-2.5 outline-none"
          style={{
            borderBottom: `1.5px solid ${BORDER_CLR}`,
            color: name ? "#1a1a1a" : PH_CLR,
            caretColor: NAVY,
          }}
        />
      </div>
      <BottomNav
        onPrev={onPrev}
        onNext={() => name.trim() && onNext(name.trim())}
        nextLabel="내 이름이야!"
        nextDisabled={!name.trim()}
      />
    </FormShell>
  );
}

// ─── Step 5: 고민 ─────────────────────────────────────────────────────────────
function StepConcern({
  onPrev,
  onSubmit,
}: {
  onPrev: () => void;
  onSubmit: (v: string) => void;
}) {
  const [text, setText] = useState("");
  const MAX = 200;
  const filled = text.trim().length > 0;

  return (
    <FormShell>
      <div className="px-6 pt-6 pb-2" style={{ backgroundColor: CARD_BG }}>
        <Label text="자세히 적을수록 더 깊이 봐드려요" />
        <h2 className="text-[24px] font-bold mb-0.5" style={{ color: "#1a1a1a" }}>
          어떤 고민이 있으세요?{" "}
          <span className="text-[17px] font-normal" style={{ color: "#c0a8b0" }}>(선택)</span>
        </h2>
        <p className="text-[12px] mb-4" style={{ color: "#c0a8b0" }}>비워도 괜찮아요!</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX))}
          placeholder={`(예시) 남자친구랑 헤어지고 다음 연애 상대는 언제 생길지, 아님 재회할 수 있을지 궁금해요...\n직장은 마케팅 쪽으로 갈 수 있을지도 알려주세요!`}
          rows={5}
          className="w-full rounded-2xl p-4 text-[14px] outline-none resize-none leading-relaxed"
          style={{
            backgroundColor: "rgba(255,255,255,0.7)",
            border: "1.5px solid rgba(200,168,180,0.4)",
            color: "#333",
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

// ─── 메인: 스텝 관리 ──────────────────────────────────────────────────────────
type FormData = {
  gender: string;
  date: string;
  calendar: string;
  time: string;
  name: string;
  concern: string;
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
      {step === 1 && <StepGender onNext={(gender) => next({ gender }, 2)} />}
      {step === 2 && (
        <StepBirthDate
          onPrev={() => setStep(1)}
          onNext={({ date, calendar }) => next({ date, calendar }, 3)}
        />
      )}
      {step === 3 && (
        <StepBirthTime
          onPrev={() => setStep(2)}
          onNext={(time) => next({ time }, 4)}
        />
      )}
      {step === 4 && (
        <StepName
          onPrev={() => setStep(3)}
          onNext={(name) => next({ name }, 5)}
        />
      )}
      {step === 5 && (
        <StepConcern
          onPrev={() => setStep(4)}
          onSubmit={(concern) => {
            console.log("사주 데이터:", { ...form, concern });
            router.push("/checkout");
          }}
        />
      )}
    </>
  );
}
