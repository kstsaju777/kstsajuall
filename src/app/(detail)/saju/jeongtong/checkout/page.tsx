"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useMemo, useEffect, useState } from "react";
import { calcSaju, ELEMENT_COLORS } from "@/lib/saju/local-manseryeok";

// ─── 디자인 토큰 (yongyong.ai 스타일) ────────────────────────────────────────
const INK       = "#0a0e1f";
const INK2      = "#121834";
const INK3      = "#1a2040";
const GOLD      = "#c7d1e3";
const GOLD_SOFT = "#e8ecf5";
const CREAM     = "#edf0f6";
const ROSE      = "#b9a5d4";
const CRIMSON   = "#5e5a8a";
const DIM       = "rgba(255,255,255,0.06)";

const PILLAR_LABELS = ["시주", "일주", "월주", "년주"] as const;

// ─── 분석 섹션 데이터 ─────────────────────────────────────────────────────────
const SECTIONS = [
  {
    icon: "🔮",
    title: "타고난 기질과 성격",
    tag: "무료 공개",
    free: true,
    preview: "일간 기준 오행의 균형과 신강·신약 분석을 통해 타고난 성향, 강점과 약점, 대인관계 스타일을 풀어드립니다. 당신이 왜 그런 선택을 반복하는지 사주 속에 답이 있습니다.",
    blurLines: [
      "당신은 ██████ 타입으로, 겉으로는 ███████하지만 내면엔",
      "████████한 감성을 품고 있습니다. 특히 ██████ 방면에서",
      "탁월한 재능이 숨어 있으며, ████ 관계에서 진가를 발휘합니다.",
    ],
  },
  {
    icon: "💼",
    title: "직업운과 재물운",
    tag: "잠김",
    free: false,
    preview: "",
    blurLines: [
      "재물운은 ████년까지 강한 상승세를 보이며,",
      "████ 계통에서 두드러진 능력을 발휘합니다.",
      "주의할 시기는 ████년 ████월이며...",
    ],
  },
  {
    icon: "❤️",
    title: "연애운과 결혼운",
    tag: "잠김",
    free: false,
    preview: "",
    blurLines: [
      "인연이 들어오는 시기는 ████년이며,",
      "이상형은 ██████한 성향의 이성입니다.",
      "결혼 적령기는 ████~████년 사이...",
    ],
  },
  {
    icon: "📅",
    title: "2025~2026 대운·세운",
    tag: "잠김",
    free: false,
    preview: "",
    blurLines: [
      "현재 대운은 ████으로, ████한 기운이 강합니다.",
      "2025년은 ████████하게 움직이는 것이 유리하며,",
      "2026년에는 ████ 방면에 집중하세요...",
    ],
  },
  {
    icon: "⚡",
    title: "신살 및 특수 기운",
    tag: "잠김",
    free: false,
    preview: "",
    blurLines: [
      "당신의 사주에는 ████살이 있어 ████한 매력이 있습니다.",
      "건강 주의 부위는 ████이며,",
      "████년에 특히 조심해야 할 것은...",
    ],
  },
];

// ─── 별빛 배경 ────────────────────────────────────────────────────────────────
function StarField() {
  const stars = useMemo(() =>
    Array.from({ length: 48 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.2,
      delay: Math.random() * 4,
    })), []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            backgroundColor: GOLD_SOFT,
            opacity: s.opacity,
            animation: `twinkle ${2 + s.delay}s ease-in-out infinite alternate`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes twinkle {
          from { opacity: 0.1; transform: scale(0.8); }
          to   { opacity: 0.7; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

// ─── 명식 그리드 ──────────────────────────────────────────────────────────────
function MyeongsikGrid({ name, date, time, calendar }: {
  name: string; date: string; time: string; calendar: string;
}) {
  const saju = useMemo(() => calcSaju(date, time, calendar), [date, time, calendar]);
  const pillars = saju
    ? [saju.pillars.time, saju.pillars.day, saju.pillars.month, saju.pillars.year]
    : null;

  return (
    <div className="relative px-5 pt-8 pb-6">
      {/* 상단 타이틀 */}
      <p className="text-center text-[12px] tracking-widest mb-1" style={{ color: ROSE }}>
        ✦ 사주 명식 ✦
      </p>
      <h2 className="text-center text-[22px] font-bold mb-1" style={{ color: CREAM }}>
        {name}님의 사주팔자
      </h2>
      <p className="text-center text-[12px] mb-5" style={{ color: CRIMSON }}>
        {date} · {calendar} · {time}
      </p>

      {/* 명식 그리드 */}
      <div className="grid grid-cols-4 gap-2">
        {pillars ? pillars.map((p, i) => {
          const cgC = ELEMENT_COLORS[p.stemClass]   ?? ELEMENT_COLORS.unknown;
          const jjC = ELEMENT_COLORS[p.branchClass] ?? ELEMENT_COLORS.unknown;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <p className="text-[10px] font-medium tracking-wider mb-0.5" style={{ color: ROSE }}>
                {PILLAR_LABELS[i]}
              </p>
              {/* 천간 */}
              <div
                className="w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5"
                style={{
                  background: `linear-gradient(135deg, ${cgC.bg}33, ${cgC.bg}88)`,
                  border: `1px solid ${cgC.bg}66`,
                  backdropFilter: "blur(4px)",
                }}
              >
                <span className="text-[9px] font-medium" style={{ color: cgC.text }}>{p.stemSs || p.stemHg}</span>
                <span className="text-[26px] font-bold leading-none" style={{ color: cgC.text }}>{p.stem}</span>
                <span className="text-[9px]" style={{ color: cgC.text }}>{p.stemHg}</span>
              </div>
              {/* 지지 */}
              <div
                className="w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5"
                style={{
                  background: `linear-gradient(135deg, ${jjC.bg}22, ${jjC.bg}66)`,
                  border: `1px solid ${jjC.bg}55`,
                  backdropFilter: "blur(4px)",
                }}
              >
                <span className="text-[26px] font-bold leading-none" style={{ color: jjC.text }}>{p.branch}</span>
                <span className="text-[9px]" style={{ color: jjC.text }}>{p.branchHg}</span>
              </div>
            </div>
          );
        }) : Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <p className="text-[10px] mb-0.5" style={{ color: ROSE }}>{PILLAR_LABELS[i]}</p>
            <div className="w-full aspect-square rounded-xl animate-pulse" style={{ backgroundColor: INK3 }} />
            <div className="w-full aspect-square rounded-xl animate-pulse" style={{ backgroundColor: INK3 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 안내 배너 ────────────────────────────────────────────────────────────────
function ReadyBanner({ name }: { name: string }) {
  return (
    <div className="mx-5 mb-4 rounded-2xl px-4 py-4"
      style={{
        background: `linear-gradient(135deg, ${INK3}, #2a1a40)`,
        border: `1px solid ${CRIMSON}`,
      }}>
      <div className="flex items-start gap-3">
        <span className="text-[24px]">✨</span>
        <div>
          <p className="text-[15px] font-bold mb-1" style={{ color: CREAM }}>
            {name}님의 풀 사주 분석 준비 완료
          </p>
          <p className="text-[12px] leading-relaxed" style={{ color: GOLD }}>
            AI가 5가지 항목을 정밀 분석했습니다.<br />
            지금 열람하지 않으면 데이터가 초기화됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── 분석 섹션 카드 ───────────────────────────────────────────────────────────
function SectionCard({ section, index }: {
  section: typeof SECTIONS[number]; index: number;
}) {
  return (
    <div
      className="mb-3 rounded-2xl overflow-hidden"
      style={{
        background: section.free
          ? `linear-gradient(135deg, ${INK2}, #1e1540)`
          : INK2,
        border: `1px solid ${section.free ? CRIMSON : DIM}`,
      }}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2.5 px-4 py-3.5"
        style={{ borderBottom: `1px solid ${DIM}` }}>
        <span className="text-[18px]">{section.icon}</span>
        <span className="text-[15px] font-bold" style={{ color: CREAM }}>{section.title}</span>
        <span
          className="ml-auto text-[10px] px-2.5 py-0.5 rounded-full font-medium tracking-wide"
          style={{
            backgroundColor: section.free ? `${ROSE}22` : `${CRIMSON}33`,
            color: section.free ? ROSE : GOLD,
            border: `1px solid ${section.free ? ROSE + "44" : CRIMSON + "55"}`,
          }}
        >
          {section.free ? "무료 공개" : "🔒 잠김"}
        </span>
      </div>

      {/* 본문 */}
      <div className="px-4 py-4">
        {section.free ? (
          <p className="text-[13px] leading-relaxed" style={{ color: GOLD }}>
            {section.preview}
          </p>
        ) : (
          <div className="relative">
            <div className="space-y-1.5 select-none">
              {section.blurLines.map((line, i) => (
                <p
                  key={i}
                  className="text-[13px] leading-relaxed"
                  style={{ color: GOLD, filter: "blur(6px)", userSelect: "none" }}
                >
                  {line}
                </p>
              ))}
            </div>
            {/* 잠금 오버레이 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${CRIMSON}44`, border: `1px solid ${CRIMSON}` }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ROSE} strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <span className="text-[11px] font-medium tracking-wide" style={{ color: ROSE }}>
                결제 후 열람 가능
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 후기 섹션 ────────────────────────────────────────────────────────────────
const REVIEWS = [
  { star: 5, text: "소름돋을 정도로 정확해요. 제 성격을 너무 잘 맞췄어요.", name: "30대 직장인 김○○" },
  { star: 5, text: "대운 흐름이 지금 제 상황이랑 딱 맞아서 깜짝 놀랐습니다.", name: "20대 취업준비생 이○○" },
  { star: 5, text: "연애운 부분에서 실제 있었던 일들이 다 나와서 신기했어요.", name: "40대 자영업자 박○○" },
];

function ReviewSection() {
  return (
    <div className="mx-5 mb-4">
      <p className="text-[12px] tracking-widest text-center mb-3" style={{ color: ROSE }}>
        ✦ 실제 이용 후기 ✦
      </p>
      <div className="space-y-2">
        {REVIEWS.map((r, i) => (
          <div key={i} className="rounded-xl px-4 py-3.5"
            style={{ backgroundColor: INK2, border: `1px solid ${DIM}` }}>
            <div className="flex items-center gap-1 mb-1.5">
              {"★".repeat(r.star).split("").map((s, j) => (
                <span key={j} className="text-[12px]" style={{ color: "#f5c842" }}>{s}</span>
              ))}
            </div>
            <p className="text-[13px] leading-relaxed mb-1" style={{ color: CREAM }}>
              &ldquo;{r.text}&rdquo;
            </p>
            <p className="text-[11px]" style={{ color: CRIMSON }}>— {r.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 신뢰 배지 ────────────────────────────────────────────────────────────────
function TrustBadges() {
  const items = [
    { icon: "🔒", text: "안전결제" },
    { icon: "⚡", text: "즉시열람" },
    { icon: "🤖", text: "AI정밀분석" },
    { icon: "📱", text: "모바일최적화" },
  ];
  return (
    <div className="mx-5 mb-6 grid grid-cols-4 gap-2">
      {items.map((item, i) => (
        <div key={i} className="flex flex-col items-center gap-1 rounded-xl py-3"
          style={{ backgroundColor: INK2, border: `1px solid ${DIM}` }}>
          <span className="text-[18px]">{item.icon}</span>
          <span className="text-[10px] text-center" style={{ color: GOLD }}>{item.text}</span>
        </div>
      ))}
    </div>
  );
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────
function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [pulse, setPulse] = useState(false);

  const name     = searchParams.get("name")     ?? "고객";
  const date     = searchParams.get("date")     ?? "";
  const time     = searchParams.get("time")     ?? "시간 모름";
  const calendar = searchParams.get("calendar") ?? "양력";

  // CTA 버튼 주의 유도 펄스
  useEffect(() => {
    const t = setInterval(() => setPulse((p) => !p), 2000);
    return () => clearInterval(t);
  }, []);

  const handlePayment = () => {
    const params = new URLSearchParams({ name, date, time, calendar });
    router.push(`/saju/jeongtong/report?${params.toString()}`);
  };

  return (
    <div className="relative w-full h-full flex flex-col" style={{ backgroundColor: INK }}>
      {/* 별빛 배경 */}
      <StarField />

      {/* 스크롤 영역 */}
      <div className="relative flex-1 overflow-y-auto pb-36">

        {/* 상단 그라데이션 오버레이 */}
        <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none" style={{
          background: `radial-gradient(ellipse at 50% 0%, #2a1a4044 0%, transparent 70%)`,
        }} />

        {/* 명식 그리드 */}
        <MyeongsikGrid name={name} date={date} time={time} calendar={calendar} />

        {/* 구분선 */}
        <div className="mx-5 mb-5 h-px" style={{
          background: `linear-gradient(to right, transparent, ${CRIMSON}66, transparent)`,
        }} />

        {/* 준비 완료 배너 */}
        <ReadyBanner name={name} />

        {/* 분석 섹션 목록 */}
        <div className="px-5">
          {SECTIONS.map((s, i) => (
            <SectionCard key={i} section={s} index={i} />
          ))}
        </div>

        {/* 구분선 */}
        <div className="mx-5 my-5 h-px" style={{
          background: `linear-gradient(to right, transparent, ${CRIMSON}66, transparent)`,
        }} />

        {/* 후기 */}
        <ReviewSection />

        {/* 신뢰 배지 */}
        <TrustBadges />
      </div>

      {/* 하단 고정 결제 CTA */}
      <div
        className="relative flex-shrink-0 px-5 pb-8 pt-4"
        style={{
          background: `linear-gradient(to top, ${INK} 60%, transparent)`,
        }}
      >
        {/* 가격 */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-[13px] line-through" style={{ color: CRIMSON }}>₩29,000</span>
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${ROSE}22`, color: ROSE, border: `1px solid ${ROSE}44` }}
            >
              -48%
            </span>
          </div>
          <span className="text-[24px] font-bold" style={{ color: CREAM }}>₩14,900</span>
        </div>

        {/* 결제 버튼 */}
        <button
          onClick={handlePayment}
          className="relative w-full py-4 rounded-2xl font-bold text-[16px] flex items-center justify-center gap-2 overflow-hidden transition-all active:scale-95"
          style={{
            background: `linear-gradient(135deg, #4a3080, #2d3a8c, #3a2060)`,
            color: GOLD_SOFT,
            border: `1px solid ${ROSE}55`,
            boxShadow: pulse
              ? `0 0 24px ${ROSE}66, 0 4px 20px rgba(0,0,0,0.4)`
              : `0 0 12px ${ROSE}33, 0 4px 20px rgba(0,0,0,0.4)`,
            transition: "box-shadow 1s ease",
          }}
        >
          <span className="text-[18px]">🔓</span>
          <span>지금 전체 풀이 열람하기</span>
        </button>

        {/* 보안 안내 */}
        <p className="text-center text-[11px] mt-2.5" style={{ color: CRIMSON }}>
          🔒 토스페이먼츠 안전결제 · 즉시 열람 가능 · 환불 불가
        </p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: INK }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: ROSE, borderTopColor: "transparent" }} />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
