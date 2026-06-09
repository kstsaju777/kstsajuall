"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useMemo } from "react";
import { calcSaju, ELEMENT_COLORS } from "@/lib/saju/local-manseryeok";

const NAVY = "#2d3a8c";
const PINK_BG = "#fdf4f6";
const CARD_BORDER = "#f0e4e8";

const PILLAR_LABELS = ["시주", "일주", "월주", "년주"] as const;

// ─── 블러 미리보기 섹션 데이터 ────────────────────────────────────────────────
const PREVIEW_SECTIONS = [
  {
    icon: "🔮",
    title: "타고난 기질과 성격",
    preview: "일간 기준 오행의 균형과 신강·신약 분석을 통해 타고난 성향, 대인관계 스타일, 강점과 약점을 풀어드립니다.",
    blurLines: [
      "당신은 ██████ 타입으로, 겉으로는 ███████하지만",
      "내면에 ████████한 감성을 품고 있습니다.",
      "특히 ██████ 방면에서 탁월한 재능이 있으며...",
    ],
  },
  {
    icon: "💼",
    title: "직업운과 재물운",
    preview: "격국·용신 분석으로 어떤 직종이 맞는지, 재물이 들어오는 시기와 주의할 시기를 알려드립니다.",
    blurLines: [
      "재물운은 ████년까지 상승세를 보이며,",
      "특히 ████ 계통의 직업에서 능력을 발휘합니다.",
      "주의할 시기는 ████년으로...",
    ],
  },
  {
    icon: "❤️",
    title: "연애운과 결혼운",
    preview: "십성 분석으로 이상형과 인연의 시기, 결혼 적령기, 현재 연애 운세를 상세히 알려드립니다.",
    blurLines: [
      "인연이 들어오는 시기는 ████년이며,",
      "이상형은 ██████한 성향의 이성입니다.",
      "결혼 적령기는 ████~████년 사이...",
    ],
  },
  {
    icon: "📅",
    title: "2025~2026 대운·세운",
    preview: "지금 이 순간 어떤 운이 흐르는지, 올해와 내년 세운에서 집중해야 할 것과 피해야 할 것.",
    blurLines: [
      "현재 대운은 ████으로, ████한 기운이 강합니다.",
      "2025년은 ███████하게 움직이는 것이 유리하며,",
      "2026년에는 ████ 방면에 집중하세요...",
    ],
  },
  {
    icon: "⚡",
    title: "신살 및 주의사항",
    preview: "도화살·홍염살·화개살 등 특수 신살 분석과 건강, 사고 주의 시기 등 삶에서 알아야 할 포인트.",
    blurLines: [
      "당신의 사주에는 ████살이 있어 ████한 매력이 있습니다.",
      "건강 주의 부위는 ████이며,",
      "████년에 특히 조심해야 할 것은...",
    ],
  },
];

// ─── 사주 명식 그리드 (로딩 화면과 동일한 디자인) ────────────────────────────
function MyeongsikGrid({ name, date, time, calendar }: {
  name: string; date: string; time: string; calendar: string;
}) {
  const saju = useMemo(() => calcSaju(date, time, calendar), [date, time, calendar]);
  const pillars = saju
    ? [saju.pillars.time, saju.pillars.day, saju.pillars.month, saju.pillars.year]
    : null;

  return (
    <div className="px-5 pt-6 pb-4" style={{ backgroundColor: PINK_BG }}>
      <p className="text-center text-[13px] mb-1" style={{ color: "#b0909a" }}>
        {date} · {calendar} · {time}
      </p>
      <h2 className="text-center text-[20px] font-bold mb-4" style={{ color: "#1a1a1a" }}>
        {name}님의 사주 명식
      </h2>
      <div className="grid grid-cols-4 gap-2">
        {pillars ? pillars.map((p, i) => {
          const cgC = ELEMENT_COLORS[p.stemClass] ?? ELEMENT_COLORS.unknown;
          const jjC = ELEMENT_COLORS[p.branchClass] ?? ELEMENT_COLORS.unknown;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <p className="text-[11px] font-medium mb-0.5" style={{ color: "#b0909a" }}>
                {PILLAR_LABELS[i]}
              </p>
              <div className="w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5"
                style={{ backgroundColor: cgC.bg }}>
                <span className="text-[9px] font-medium" style={{ color: cgC.text }}>{p.stemSs || p.stemHg}</span>
                <span className="text-[28px] font-bold leading-none" style={{ color: cgC.text }}>{p.stem}</span>
                <span className="text-[9px]" style={{ color: cgC.text }}>{p.stemHg}</span>
              </div>
              <div className="w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5"
                style={{ backgroundColor: jjC.bg }}>
                <span className="text-[28px] font-bold leading-none" style={{ color: jjC.text }}>{p.branch}</span>
                <span className="text-[9px]" style={{ color: jjC.text }}>{p.branchHg}</span>
              </div>
            </div>
          );
        }) : Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <p className="text-[11px] font-medium mb-0.5" style={{ color: "#b0909a" }}>{PILLAR_LABELS[i]}</p>
            <div className="w-full aspect-square rounded-xl animate-pulse" style={{ backgroundColor: "#ede0e3" }} />
            <div className="w-full aspect-square rounded-xl animate-pulse" style={{ backgroundColor: "#ede0e3" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 블러 미리보기 카드 ───────────────────────────────────────────────────────
function PreviewCard({ section, index }: {
  section: typeof PREVIEW_SECTIONS[number];
  index: number;
}) {
  const isFirst = index === 0;

  return (
    <div className="rounded-2xl overflow-hidden mb-3"
      style={{ border: `1px solid ${CARD_BORDER}`, backgroundColor: "white" }}>
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-4 py-3.5"
        style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
        <span className="text-[18px]">{section.icon}</span>
        <span className="text-[15px] font-bold" style={{ color: "#1a1a1a" }}>{section.title}</span>
        {!isFirst && (
          <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: "#f0e4e8", color: "#c47c85" }}>
            🔒 잠김
          </span>
        )}
      </div>

      {/* 내용 */}
      <div className="px-4 py-4">
        {isFirst ? (
          // 첫 번째만 텍스트 보임 (맛보기)
          <p className="text-[13px] leading-relaxed" style={{ color: "#666" }}>
            {section.preview}
          </p>
        ) : (
          // 나머지는 블러
          <div className="relative">
            <div className="space-y-2">
              {section.blurLines.map((line, i) => (
                <p key={i} className="text-[13px] leading-relaxed select-none"
                  style={{ color: "#555", filter: "blur(5px)", userSelect: "none" }}>
                  {line}
                </p>
              ))}
            </div>
            {/* 잠금 오버레이 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#f0e4e8" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c47c85" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <span className="text-[11px] font-medium" style={{ color: "#c47c85" }}>결제 후 확인 가능</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────
function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const name = searchParams.get("name") ?? "고객";
  const date = searchParams.get("date") ?? "";
  const time = searchParams.get("time") ?? "시간 모름";
  const calendar = searchParams.get("calendar") ?? "양력";

  const handlePayment = () => {
    // TODO: 토스페이먼츠 결제 연동
    const params = new URLSearchParams({ name, date, time, calendar });
    router.push(`/saju/jeongtong/report?${params.toString()}`);
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: PINK_BG }}>
      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto pb-32">
        {/* 명식 그리드 */}
        <MyeongsikGrid name={name} date={date} time={time} calendar={calendar} />

        {/* 구분선 + 안내 문구 */}
        <div className="px-5 py-4">
          <div className="rounded-2xl px-4 py-3.5 flex items-start gap-3"
            style={{ backgroundColor: "#fff3f5", border: "1px solid #f0d8dc" }}>
            <span className="text-[20px] mt-0.5">✨</span>
            <div>
              <p className="text-[14px] font-bold mb-0.5" style={{ color: "#1a1a1a" }}>
                {name}님의 풀 사주 분석이 준비됐어요
              </p>
              <p className="text-[12px] leading-relaxed" style={{ color: "#888" }}>
                아래 5가지 항목을 AI가 정밀 분석했습니다.<br />
                지금 바로 확인해보세요.
              </p>
            </div>
          </div>
        </div>

        {/* 미리보기 카드 목록 */}
        <div className="px-5">
          {PREVIEW_SECTIONS.map((section, i) => (
            <PreviewCard key={i} section={section} index={i} />
          ))}
        </div>

        {/* 후기 한 줄 */}
        <div className="px-5 pb-2">
          <div className="rounded-xl px-4 py-3 flex items-center gap-3"
            style={{ backgroundColor: "white", border: `1px solid ${CARD_BORDER}` }}>
            <span className="text-[20px]">⭐</span>
            <p className="text-[12px] leading-relaxed" style={{ color: "#666" }}>
              <span className="font-bold" style={{ color: "#1a1a1a" }}>"정확도가 너무 높아서 소름돋았어요"</span>
              <br />
              <span style={{ color: "#bbb" }}>— 30대 직장인 김○○님</span>
            </p>
          </div>
        </div>
      </div>

      {/* 하단 고정 결제 CTA */}
      <div className="flex-shrink-0 px-5 pb-6 pt-3"
        style={{
          backgroundColor: PINK_BG,
          boxShadow: "0 -8px 24px rgba(0,0,0,0.06)",
        }}>
        {/* 가격 정보 */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <span className="text-[13px] line-through mr-2" style={{ color: "#bbb" }}>₩29,000</span>
            <span className="text-[12px] font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#fff0f2", color: "#e84057" }}>
              특별 할인 -48%
            </span>
          </div>
          <span className="text-[22px] font-bold" style={{ color: "#1a1a1a" }}>₩14,900</span>
        </div>

        {/* 결제 버튼 */}
        <button
          onClick={handlePayment}
          className="w-full py-4 rounded-2xl text-white font-bold text-[16px] flex items-center justify-center gap-2 active:scale-95 transition-transform"
          style={{ backgroundColor: NAVY }}
        >
          <span>🔓</span>
          <span>전체 풀이 지금 확인하기</span>
        </button>

        {/* 보안 안내 */}
        <p className="text-center text-[11px] mt-2" style={{ color: "#bbb" }}>
          🔒 토스페이먼츠 안전결제 · 즉시 열람 · 환불 불가
        </p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: PINK_BG }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: NAVY, borderTopColor: "transparent" }} />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
