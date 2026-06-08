"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ─── 태어난 시간 목록 ────────────────────────────────────────────────────────
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

// ─── 공통 스타일 ─────────────────────────────────────────────────────────────
const BG = "#fce8ec";
const NAVY = "#2d3a8c";
const PINK_LABEL = "#c47c85";

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
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-5 pb-8 pt-3 flex gap-3"
      style={{ backgroundColor: BG }}>
      {onPrev && (
        <button
          onClick={onPrev}
          className="flex-shrink-0 px-5 py-3.5 rounded-xl border text-[15px] font-semibold"
          style={{ borderColor: "#ccc", color: "#555", backgroundColor: "white" }}
        >
          이전
        </button>
      )}
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="flex-1 py-3.5 rounded-xl text-white text-[16px] font-bold transition-opacity"
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
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: BG }}>
      {/* 캐릭터 이미지 */}
      <div className="relative w-full" style={{ height: "52vh" }}>
        <img
          src="/images/hero/hero-1.jpg"
          alt="사주"
          className="w-full h-full object-cover object-top"
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, transparent 50%, " + BG + " 100%)",
          }}
        />
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 px-6 pt-2 pb-32">
        <p className="text-[13px] font-medium mb-1" style={{ color: PINK_LABEL }}>
          꼼꼼히 사주 봐드릴게요!
        </p>
        <h2 className="text-[24px] font-bold mb-6" style={{ color: "#1a1a1a" }}>
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
                borderColor: gender === g ? NAVY : "#ddd",
                color: gender === g ? NAVY : "#333",
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
    </div>
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
    let out = nums;
    if (nums.length > 4) out = nums.slice(0, 4) + "." + nums.slice(4);
    if (nums.length > 6) out = out.slice(0, 7) + "." + out.slice(7);
    return out;
  };

  return (
    <div className="flex flex-col min-h-screen pt-6 pb-32 px-6" style={{ backgroundColor: BG }}>
      <p className="text-[13px] font-medium mb-1" style={{ color: PINK_LABEL }}>
        사주의 첫 단추예요
      </p>
      <h2 className="text-[24px] font-bold mb-8" style={{ color: "#1a1a1a" }}>
        생년월일을 알려주세요
      </h2>

      {/* 날짜 입력 + 달력 선택 */}
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
              borderBottom: "2px solid #bbb",
              color: date ? "#1a1a1a" : "#bbb",
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
                backgroundColor: calendar === c ? NAVY : "#e8e0dc",
                color: calendar === c ? "white" : "#777",
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <BottomNav
        onPrev={onPrev}
        onNext={() => date.length >= 8 && onNext({ date, calendar })}
        nextLabel="응, 입력했어!"
        nextDisabled={date.replace(/\./g, "").length < 8}
      />
    </div>
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
    <div className="flex flex-col min-h-screen pt-6 pb-32 px-6" style={{ backgroundColor: BG }}>
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[13px] font-medium mb-1" style={{ color: PINK_LABEL }}>
            태어난 시간이 운명을 가른대요
          </p>
          <h2 className="text-[24px] font-bold" style={{ color: "#1a1a1a" }}>
            나의 태어난 시간
          </h2>
        </div>
        {/* 시간 모름 체크박스 */}
        <button
          onClick={() => { setUnknown((v) => !v); setTime(""); }}
          className="flex items-center gap-1.5 mt-1"
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
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span className="text-[13px] font-medium" style={{ color: unknown ? NAVY : "#888" }}>
            시간 모름
          </span>
        </button>
      </div>

      {/* 드롭다운 */}
      <div className="relative">
        <button
          onClick={() => !unknown && setOpen((v) => !v)}
          className="w-full flex items-center justify-between py-3 px-4 rounded-xl text-[15px]"
          style={{
            backgroundColor: unknown ? "#ede8e4" : "white",
            border: "1px solid #ddd",
            color: time && !unknown ? "#1a1a1a" : "#aaa",
            opacity: unknown ? 0.5 : 1,
          }}
          disabled={unknown}
        >
          <span>{unknown ? "시간 모름" : (time || "태어난 시간")}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {/* 드롭다운 목록 */}
        {open && !unknown && (
          <div
            className="absolute top-full left-0 right-0 z-10 rounded-xl overflow-hidden shadow-lg mt-1"
            style={{ border: "1px solid #ddd", backgroundColor: "white" }}
          >
            {/* 상단 헤더 */}
            <div className="px-4 py-3 text-[13px] font-bold" style={{ backgroundColor: "#e8e4e0", color: "#555" }}>
              태어난 시간
            </div>
            <div
              onClick={() => { setUnknown(true); setTime(""); setOpen(false); }}
              className="px-4 py-3 text-[14px] cursor-pointer hover:bg-gray-50"
              style={{ color: "#888", borderBottom: "1px solid #f0ece8" }}
            >
              시간 모름
            </div>
            <div className="max-h-52 overflow-y-auto">
              {BIRTH_TIMES.map((t) => (
                <div
                  key={t}
                  onClick={() => { setTime(t); setOpen(false); }}
                  className="px-4 py-3 text-[14px] cursor-pointer hover:bg-gray-50"
                  style={{
                    backgroundColor: time === t ? "#eef0f9" : "white",
                    color: time === t ? NAVY : "#333",
                    borderBottom: "1px solid #f5f2f0",
                  }}
                >
                  {t}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav
        onPrev={onPrev}
        onNext={() => (selected) && onNext(selected)}
        nextLabel="응, 입력했어!"
        nextDisabled={!selected}
      />
    </div>
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
    <div className="flex flex-col min-h-screen pt-6 pb-32 px-6" style={{ backgroundColor: BG }}>
      <p className="text-[13px] font-medium mb-1" style={{ color: PINK_LABEL }}>
        이제 거의 다 왔어요
      </p>
      <h2 className="text-[24px] font-bold mb-8" style={{ color: "#1a1a1a" }}>
        이름이 어떻게 되세요?
      </h2>

      <input
        type="text"
        placeholder="김지은"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full bg-transparent text-[17px] pb-2 outline-none"
        style={{
          borderBottom: "2px solid #bbb",
          color: name ? "#1a1a1a" : "#bbb",
        }}
        autoFocus
      />

      <BottomNav
        onPrev={onPrev}
        onNext={() => name.trim() && onNext(name.trim())}
        nextLabel="내 이름이야!"
        nextDisabled={!name.trim()}
      />
    </div>
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
    <div className="flex flex-col min-h-screen pt-6 pb-32 px-6" style={{ backgroundColor: BG }}>
      <p className="text-[13px] font-medium mb-1" style={{ color: PINK_LABEL }}>
        자세히 적을수록 더 깊이 봐드려요
      </p>
      <h2 className="text-[24px] font-bold mb-1" style={{ color: "#1a1a1a" }}>
        어떤 고민이 있으세요?{" "}
        <span className="text-[18px] font-normal" style={{ color: "#aaa" }}>
          (선택)
        </span>
      </h2>
      <p className="text-[13px] mb-5" style={{ color: "#bbb" }}>
        비워도 괜찮아요!
      </p>

      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX))}
          placeholder={`(예시) 남자친구랑 헤어지고 다음 연애 상대는 언제 생길지, 아님 재회할 수 있을지 궁금해요...\n직장은 마케팅 쪽으로 갈 수 있을지도 알려주세요!`}
          rows={6}
          className="w-full bg-white rounded-2xl p-4 text-[14px] outline-none resize-none leading-relaxed"
          style={{
            border: "1px solid #e8e0dc",
            color: "#333",
          }}
        />
        <p
          className="text-right text-[12px] mt-1 pr-1"
          style={{ color: text.length >= MAX ? "#e55" : "#bbb" }}
        >
          {text.length}/{MAX}
        </p>
      </div>

      <BottomNav
        onPrev={onPrev}
        onNext={() => onSubmit(text)}
        nextLabel={filled ? "이게 내 고민이야!" : "딱히 없어, 넘어가자!"}
      />
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
    // TODO: 결제 또는 결과 페이지로 이동
    console.log("최종 사주 데이터:", final);
    router.push("/checkout");
  };

  return (
    <>
      {step === 1 && (
        <StepGender
          onNext={(gender) => updateAndNext({ gender }, 2)}
        />
      )}
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
