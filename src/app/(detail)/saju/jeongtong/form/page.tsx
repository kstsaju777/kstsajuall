"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ─── 상수 ────────────────────────────────────────────────────────────────────
const NAVY = "#2d3a8c";
const PINK_LABEL = "#c47c85";
const BG_CARD = "rgba(255,240,243,0.97)";

const BIRTH_TIMES = [
  "자시 (23:00 ~ 01:00)",
  "축시 (01:00 ~ 03:00)",
  "인시 (03:00 ~ 05:00)",
  "묘시 (05:00 ~ 07:00)",
  "진시 (07:00 ~ 09:00)",
  "사시 (09:00 ~ 11:00)",
  "오시 (11:00 ~ 13:00)",
  "미시 (13:00 ~ 15:00)",
  "신시 (15:00 ~ 17:00)",
  "유시 (17:00 ~ 19:00)",
  "술시 (19:00 ~ 21:00)",
  "해시 (21:00 ~ 23:00)",
];

// ─── 공통 레이아웃 래퍼 ───────────────────────────────────────────────────────
// 배경 이미지는 항상 full-screen, 하단 카드가 위에 얹힘
function FormShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* 배경 이미지 — 항상 유지 */}
      <img
        src="/images/hero/hero-1.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover object-top"
      />
      {/* 하단 그라데이션 페이드 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 30%, rgba(252,220,228,0.6) 65%, rgba(252,220,228,0.97) 80%)",
        }}
      />
      {/* 콘텐츠 (하단 카드) */}
      <div className="absolute bottom-0 left-0 right-0">{children}</div>
    </div>
  );
}

// ─── 하단 버튼 영역 ───────────────────────────────────────────────────────────
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
    <div className="flex gap-3 px-5 pb-8 pt-3" style={{ backgroundColor: "rgba(252,220,228,0.97)" }}>
      {onPrev && (
        <button
          onClick={onPrev}
          className="flex-shrink-0 px-5 py-3.5 rounded-xl border text-[15px] font-semibold"
          style={{ borderColor: "#ccc", color: "#666", backgroundColor: "white" }}
        >
          이전
        </button>
      )}
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="flex-1 py-3.5 rounded-xl text-white text-[16px] font-bold transition-all"
        style={{ backgroundColor: nextDisabled ? "#b0b8d4" : NAVY }}
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
      <div className="px-6 pt-8 pb-2" style={{ backgroundColor: "rgba(252,220,228,0.97)" }}>
        <p className="text-[13px] font-medium mb-1" style={{ color: PINK_LABEL }}>
          꼼꼼히 사주 봐드릴게요!
        </p>
        <h2 className="text-[24px] font-bold mb-5" style={{ color: "#1a1a1a" }}>
          성별이 어떻게 되세요?
        </h2>
        <div className="flex flex-col gap-3">
          {(["여자", "남자"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className="w-full py-4 rounded-xl text-[16px] font-semibold border transition-all"
              style={{
                backgroundColor: gender === g ? "#e2e6f5" : "white",
                borderColor: gender === g ? NAVY : "#e0d8dc",
                color: gender === g ? NAVY : "#444",
              }}
            >
              {g}
            </button>
          ))}
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

  const isValid = date.replace(/\./g, "").length >= 8;

  return (
    <FormShell>
      <div className="px-6 pt-8 pb-2" style={{ backgroundColor: "rgba(252,220,228,0.97)" }}>
        <p className="text-[13px] font-medium mb-1" style={{ color: PINK_LABEL }}>
          사주의 첫 단추예요
        </p>
        <h2 className="text-[24px] font-bold mb-7" style={{ color: "#1a1a1a" }}>
          생년월일을 알려주세요
        </h2>

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <input
              type="text"
              inputMode="numeric"
              placeholder="1999.01.01"
              value={date}
              onChange={(e) => setDate(formatDate(e.target.value))}
              className="w-full bg-transparent text-[17px] pb-2 outline-none"
              style={{
                borderBottom: "2px solid #c0a8b0",
                color: date ? "#1a1a1a" : "#c0a8b0",
              }}
            />
          </div>
          <div className="flex gap-1.5 pb-1">
            {(["양력", "음력", "윤달"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCalendar(c)}
                className="px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all"
                style={{
                  backgroundColor: calendar === c ? NAVY : "rgba(255,255,255,0.6)",
                  color: calendar === c ? "white" : "#888",
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
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
      <div className="px-6 pt-8 pb-2" style={{ backgroundColor: "rgba(252,220,228,0.97)" }}>
        <div className="flex items-start justify-between mb-7">
          <div>
            <p className="text-[13px] font-medium mb-1" style={{ color: PINK_LABEL }}>
              태어난 시간이 운명을 가른대요
            </p>
            <h2 className="text-[24px] font-bold" style={{ color: "#1a1a1a" }}>
              나의 태어난 시간
            </h2>
          </div>
          <button
            onClick={() => { setUnknown((v) => !v); setTime(""); setOpen(false); }}
            className="flex items-center gap-1.5 mt-2 flex-shrink-0"
          >
            <div
              className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
              style={{
                borderColor: unknown ? NAVY : "#bbb",
                backgroundColor: unknown ? NAVY : "transparent",
              }}
            >
              {unknown && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-[13px] font-medium" style={{ color: unknown ? NAVY : "#999" }}>
              시간 모름
            </span>
          </button>
        </div>

        {/* 드롭다운 */}
        <div className="relative">
          <button
            onClick={() => !unknown && setOpen((v) => !v)}
            disabled={unknown}
            className="w-full flex items-center justify-between py-3.5 px-4 rounded-xl text-[15px]"
            style={{
              backgroundColor: "white",
              border: "1px solid #e0d0d4",
              color: (time && !unknown) ? "#1a1a1a" : "#bbb",
              opacity: unknown ? 0.45 : 1,
            }}
          >
            <span>{unknown ? "시간 모름" : (time || "태어난 시간")}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {open && !unknown && (
            <div
              className="absolute top-full left-0 right-0 z-20 rounded-xl overflow-hidden shadow-xl mt-1"
              style={{ border: "1px solid #e0d0d4", backgroundColor: "white" }}
            >
              <div className="px-4 py-2.5 text-[13px] font-bold" style={{ backgroundColor: "#ede8e4", color: "#666" }}>
                태어난 시간
              </div>
              <div
                onClick={() => { setUnknown(true); setTime(""); setOpen(false); }}
                className="px-4 py-3 text-[14px] cursor-pointer hover:bg-gray-50"
                style={{ color: "#999", borderBottom: "1px solid #f5f0ee" }}
              >
                시간 모름
              </div>
              <div className="max-h-48 overflow-y-auto">
                {BIRTH_TIMES.map((t) => (
                  <div
                    key={t}
                    onClick={() => { setTime(t); setOpen(false); }}
                    className="px-4 py-3 text-[14px] cursor-pointer"
                    style={{
                      backgroundColor: time === t ? "#eef0f9" : "white",
                      color: time === t ? NAVY : "#333",
                      borderBottom: "1px solid #f8f5f4",
                    }}
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>
          )}
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
      <div className="px-6 pt-8 pb-2" style={{ backgroundColor: "rgba(252,220,228,0.97)" }}>
        <p className="text-[13px] font-medium mb-1" style={{ color: PINK_LABEL }}>
          이제 거의 다 왔어요
        </p>
        <h2 className="text-[24px] font-bold mb-7" style={{ color: "#1a1a1a" }}>
          이름이 어떻게 되세요?
        </h2>
        <input
          type="text"
          placeholder="김지은"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-transparent text-[17px] pb-2 outline-none"
          style={{
            borderBottom: "2px solid #c0a8b0",
            color: name ? "#1a1a1a" : "#c0a8b0",
          }}
          autoFocus
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
      <div className="px-6 pt-8 pb-2" style={{ backgroundColor: "rgba(252,220,228,0.97)" }}>
        <p className="text-[13px] font-medium mb-1" style={{ color: PINK_LABEL }}>
          자세히 적을수록 더 깊이 봐드려요
        </p>
        <h2 className="text-[24px] font-bold mb-1" style={{ color: "#1a1a1a" }}>
          어떤 고민이 있으세요?{" "}
          <span className="text-[18px] font-normal" style={{ color: "#bbb" }}>
            (선택)
          </span>
        </h2>
        <p className="text-[12px] mb-4" style={{ color: "#c0a0a8" }}>비워도 괜찮아요!</p>

        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX))}
            placeholder={`(예시) 남자친구랑 헤어지고 다음 연애 상대는 언제 생길지, 아님 재회할 수 있을지 궁금해요...\n직장은 마케팅 쪽으로 갈 수 있을지도 알려주세요!`}
            rows={5}
            className="w-full rounded-2xl p-4 text-[14px] outline-none resize-none leading-relaxed"
            style={{
              backgroundColor: "white",
              border: "1px solid #e0d0d4",
              color: "#333",
            }}
          />
          <p className="text-right text-[12px] mt-1 pr-1" style={{ color: text.length >= MAX ? "#e55" : "#c0a8b0" }}>
            {text.length}/{MAX}
          </p>
        </div>
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

  const updateAndNext = (data: Partial<FormData>, nextStep: number) => {
    setForm((prev) => ({ ...prev, ...data }));
    setStep(nextStep);
  };

  const handleSubmit = (concern: string) => {
    const final = { ...form, concern };
    console.log("최종 사주 데이터:", final);
    router.push("/checkout");
  };

  return (
    <>
      {step === 1 && <StepGender onNext={(gender) => updateAndNext({ gender }, 2)} />}
      {step === 2 && (
        <StepBirthDate
          onPrev={() => setStep(1)}
          onNext={({ date, calendar }) => updateAndNext({ date, calendar }, 3)}
        />
      )}
      {step === 3 && (
        <StepBirthTime
          onPrev={() => setStep(2)}
          onNext={(time) => updateAndNext({ time }, 4)}
        />
      )}
      {step === 4 && (
        <StepName
          onPrev={() => setStep(3)}
          onNext={(name) => updateAndNext({ name }, 5)}
        />
      )}
      {step === 5 && (
        <StepConcern
          onPrev={() => setStep(4)}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}
