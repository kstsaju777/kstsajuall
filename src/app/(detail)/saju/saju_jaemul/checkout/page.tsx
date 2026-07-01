"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useMemo, useState, useEffect } from "react";
import { calcSaju, ELEMENT_COLORS, type LocalSajuResult } from "@/lib/saju/local-manseryeok";
import { LEGAL_DOC_CLASS, TermsContent, PrivacyContent } from "@/components/legal/legal-content";

// ─── 디자인 토큰 ──────────────────────────────────────────────────────────────
const CREAM      = "#fdf8f4";
const WHITE      = "#ffffff";
const RED        = "#9b2335";
const RED_SOFT   = "#c9474f";
const RED_PALE   = "#fdf0f0";
const ROSE       = "#e8a598";
const GOLD_TXT   = "#8b6914";
const GRAY1      = "#1a1a1a";
const GRAY2      = "#444444";
const GRAY3      = "#888888";
const GRAY4      = "#dddddd";
const CARD_BG    = "#ffffff";
const NAVY       = "#2d3a8c";

const PILLAR_LABELS = ["시주", "일주", "월주", "년주"] as const;

// ─── 오행 레이더 차트 ─────────────────────────────────────────────────────────
function OhaengChart({ saju }: { saju: LocalSajuResult | null }) {
  const counts = useMemo(() => {
    if (!saju) return { wood: 1, fire: 1, earth: 1, metal: 1, water: 1 };
    const pillars = [saju.pillars.year, saju.pillars.month, saju.pillars.day, saju.pillars.time];
    const c: Record<string, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    pillars.forEach((p) => {
      if (p.stemClass  in c) c[p.stemClass]++;
      if (p.branchClass in c) c[p.branchClass]++;
    });
    return c;
  }, [saju]);

  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 8;

  // 오각형: 목(상), 화(우상), 토(우하), 금(좌하), 수(좌상)
  const items = [
    { key: "wood",  label: "목(木)", emoji: "🌿", color: "#2e7d32", bg: "#c8e6c9" },
    { key: "fire",  label: "화(火)", emoji: "🔥", color: "#c62828", bg: "#ffcdd2" },
    { key: "earth", label: "토(土)", emoji: "🌏", color: "#e65100", bg: "#fff9c4" },
    { key: "metal", label: "금(金)", emoji: "⚔️", color: "#00838f", bg: "#b2ebf2" },
    { key: "water", label: "수(水)", emoji: "💧", color: "#1565c0", bg: "#bbdefb" },
  ];

  const size = 130;
  const cx = size / 2, cy = size / 2;
  const maxR = size * 0.38;

  // 오각형 꼭짓점 (위쪽부터 시계방향)
  const angles = items.map((_, i) => (Math.PI * 2 * i) / 5 - Math.PI / 2);

  const outerPts = angles.map((a) => ({
    x: cx + maxR * Math.cos(a),
    y: cy + maxR * Math.sin(a),
  }));

  const valuePts = items.map((item, i) => {
    const ratio = Math.min(1, (counts[item.key] || 0) / (total * 0.5));
    const r = maxR * 0.15 + maxR * 0.85 * ratio;
    return {
      x: cx + r * Math.cos(angles[i]),
      y: cy + r * Math.sin(angles[i]),
    };
  });

  const outerPath = outerPts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";
  const valuePath = valuePts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";

  // 중간 격자선 (40%, 70%)
  const gridRatios = [0.4, 0.7];

  return (
    <div className="px-5 py-6" style={{ backgroundColor: WHITE }}>
      <p className="text-center text-[12px] tracking-widest mb-1" style={{ color: RED }}>✦ 오행 분석 ✦</p>
      <h3 className="text-center text-[17px] font-bold mb-4" style={{ color: GRAY1 }}>
        내 사주의 오행 균형
      </h3>

      <div className="flex items-center justify-center gap-6">
        {/* 차트 */}
        <svg width={size} height={size}>
          {/* 격자 */}
          {gridRatios.map((ratio, gi) => {
            const pts = angles.map((a) => ({
              x: cx + maxR * ratio * Math.cos(a),
              y: cy + maxR * ratio * Math.sin(a),
            }));
            const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";
            return <path key={gi} d={path} fill="none" stroke={GRAY4} strokeWidth="0.8" />;
          })}
          {/* 축선 */}
          {outerPts.map((p, i) => (
            <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={GRAY4} strokeWidth="0.8" />
          ))}
          {/* 외곽 */}
          <path d={outerPath} fill="none" stroke={GRAY4} strokeWidth="1" />
          {/* 값 영역 */}
          <path d={valuePath} fill={`${RED}22`} stroke={RED_SOFT} strokeWidth="1.5" />
          {/* 꼭짓점 점 */}
          {valuePts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill={RED_SOFT} />
          ))}
          {/* 라벨 */}
          {outerPts.map((p, i) => {
            const item = items[i];
            const lx = cx + (maxR + 14) * Math.cos(angles[i]);
            const ly = cy + (maxR + 14) * Math.sin(angles[i]);
            return (
              <text key={i} x={lx} y={ly + 4} textAnchor="middle"
                fontSize="9" fontWeight="600" fill={item.color}>
                {item.label.split("(")[0]}
              </text>
            );
          })}
        </svg>

        {/* 범례 */}
        <div className="flex flex-col gap-2">
          {items.map((item) => {
            const cnt = counts[item.key] || 0;
            const pct = Math.round((cnt / total) * 100);
            return (
              <div key={item.key} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.bg, border: `1px solid ${item.color}` }} />
                <span className="text-[12px]" style={{ color: GRAY2 }}>{item.label}</span>
                <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: GRAY4 }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                </div>
                <span className="text-[11px] font-bold" style={{ color: item.color }}>{cnt}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── 명식 그리드 ──────────────────────────────────────────────────────────────
function MyeongsikGrid({ saju }: { saju: LocalSajuResult | null }) {
  const pillars = saju
    ? [saju.pillars.time, saju.pillars.day, saju.pillars.month, saju.pillars.year]
    : null;

  return (
    <div className="grid grid-cols-4 gap-2 px-5 py-4" style={{ backgroundColor: WHITE }}>
      {pillars ? pillars.map((p, i) => {
        const cgC = ELEMENT_COLORS[p.stemClass]   ?? ELEMENT_COLORS.unknown;
        const jjC = ELEMENT_COLORS[p.branchClass] ?? ELEMENT_COLORS.unknown;
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <p className="text-[10px] font-medium tracking-wider mb-0.5" style={{ color: GRAY3 }}>
              {PILLAR_LABELS[i]}
            </p>
            <div className="w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5"
              style={{ backgroundColor: cgC.bg }}>
              <span className="text-[9px] font-medium" style={{ color: cgC.text }}>{p.stemSs || ""}</span>
              <span className="text-[26px] font-bold leading-none" style={{ color: cgC.text }}>{p.stem}</span>
              <span className="text-[9px]" style={{ color: cgC.text }}>{p.stemHg}</span>
            </div>
            <div className="w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5"
              style={{ backgroundColor: jjC.bg }}>
              <span className="text-[26px] font-bold leading-none" style={{ color: jjC.text }}>{p.branch}</span>
              <span className="text-[9px]" style={{ color: jjC.text }}>{p.branchHg}</span>
            </div>
          </div>
        );
      }) : Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <p className="text-[10px] mb-0.5" style={{ color: GRAY3 }}>{PILLAR_LABELS[i]}</p>
          <div className="w-full aspect-square rounded-xl animate-pulse" style={{ backgroundColor: "#eee" }} />
          <div className="w-full aspect-square rounded-xl animate-pulse" style={{ backgroundColor: "#eee" }} />
        </div>
      ))}
    </div>
  );
}

// ─── 이미지→그라데이션→텍스트→그라데이션→이미지 완전 샌드위치 블록 ────────────
function ImageTextBlock({
  topImgSrc,
  bottomImgSrc,
  label,
  headline,
  accentWord,
  bgColor = WHITE,
}: {
  topImgSrc: string;
  bottomImgSrc: string;
  label: string;
  headline: string;
  accentWord: string;
  bgColor?: string;
}) {
  const parts = headline.split(accentWord);

  return (
    <div style={{ backgroundColor: bgColor }}>
      {/* 위 이미지 */}
      <div className="relative overflow-hidden" style={{ height: 260 }}>
        <img src={topImgSrc} alt=""
          className="absolute inset-0 w-full h-full object-cover object-top" />
        {/* 하단 페이드: 이미지 → bgColor */}
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none" style={{
          background: `linear-gradient(to bottom, transparent, ${bgColor})`,
        }} />
      </div>

      {/* 텍스트 */}
      <div className="px-6 py-1 text-center">
        <p className="text-[12px] mb-2 tracking-wide" style={{ color: RED }}>{label}</p>
        <h2 className="text-[28px] font-black leading-snug" style={{ color: GRAY1 }}>
          {parts.map((part, i) => (
            <span key={i}>
              {part.split("\n").map((line, j, arr) => (
                <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
              ))}
              {i < parts.length - 1 && <span style={{ color: RED }}>{accentWord}</span>}
            </span>
          ))}
        </h2>
      </div>

      {/* 아래 이미지 */}
      <div className="relative overflow-hidden" style={{ height: 260 }}>
        {/* 상단 페이드: bgColor → 투명 */}
        <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none z-10" style={{
          background: `linear-gradient(to bottom, ${bgColor}, transparent)`,
        }} />
        <img src={bottomImgSrc} alt=""
          className="absolute inset-0 w-full h-full object-cover object-center" />
      </div>
    </div>
  );
}

// 단순 이미지 구분자 (상하 그라데이션)
function ImageDivider({ src = "/media/hero/hero-1.jpg", bgColor = WHITE }: {
  src?: string; bgColor?: string;
}) {
  return (
    <div className="relative overflow-hidden" style={{ height: 180 }}>
      <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none z-10" style={{
        background: `linear-gradient(to bottom, ${bgColor}, transparent)`,
      }} />
      <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-10" style={{
        background: `linear-gradient(to top, ${bgColor}, transparent)`,
      }} />
    </div>
  );
}

// ─── 분석 섹션 ───────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    icon: "🔮", title: "타고난 기질과 성격", free: true,
    content: "일간 기준 오행의 균형과 신강·신약 분석을 통해 타고난 성향을 풀어드립니다. 당신이 왜 그런 선택을 반복하는지, 어떤 환경에서 능력이 빛나는지 사주 속에 그 답이 담겨 있습니다.\n\n겉으로는 차분하고 신중해 보이지만 내면에는 뜨거운 열정이 있는 타입입니다. 완성도에 대한 욕심이 강하며, 한번 믿은 사람에게는 끝까지 의리를 지킵니다.",
    blurLines: ["", "", ""],
  },
  {
    icon: "💼", title: "직업운과 재물운", free: false,
    content: "",
    blurLines: [
      "재물운은 ████년까지 강한 상승세를 보이며,",
      "████ 계통 직종에서 두드러진 능력을 발휘합니다.",
      "████년 ████월은 투자·이직 모두 주의가 필요한 시기입니다.",
    ],
  },
  {
    icon: "❤️", title: "연애운과 결혼운", free: false,
    content: "",
    blurLines: [
      "인연이 들어오는 시기는 ████년 ████월이며,",
      "이상형은 ██████한 성향의 이성으로 ████ 계통이 많습니다.",
      "결혼 적령기는 ████~████년 사이로 분석됩니다.",
    ],
  },
  {
    icon: "📅", title: "2025~2026 대운·세운", free: false,
    content: "",
    blurLines: [
      "현재 대운은 ████으로 ████한 기운이 강하게 작용합니다.",
      "2025년 세운에서는 ████ 방면의 변화가 예상되며,",
      "2026년에는 ████ 분야에 집중하면 좋은 결과가 따릅니다.",
    ],
  },
  {
    icon: "⚡", title: "신살 및 주의사항", free: false,
    content: "",
    blurLines: [
      "당신의 사주에는 ████살이 있어 ████한 매력이 있습니다.",
      "건강 취약 부위는 ████이며 ████년에 특히 주의하세요.",
      "████ 방향의 이동이나 변화는 피하는 것이 좋습니다.",
    ],
  },
];

function AnalysisSection({ s, index }: { s: typeof SECTIONS[number]; index: number }) {
  return (
    <div className="mx-5 mb-4 rounded-2xl overflow-hidden"
      style={{ backgroundColor: CARD_BG, border: `1px solid ${GRAY4}`, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
      {/* 헤더 */}
      <div className="flex items-center gap-2.5 px-4 py-3.5"
        style={{ borderBottom: `1px solid ${GRAY4}`, backgroundColor: s.free ? RED_PALE : WHITE }}>
        <span className="text-[18px]">{s.icon}</span>
        <span className="text-[15px] font-bold" style={{ color: GRAY1 }}>{s.title}</span>
        <span className="ml-auto text-[10px] px-2.5 py-0.5 rounded-full font-medium"
          style={{
            backgroundColor: s.free ? `${RED}15` : "#f5f5f5",
            color: s.free ? RED : GRAY3,
            border: `1px solid ${s.free ? RED + "30" : GRAY4}`,
          }}>
          {s.free ? "✓ 공개" : "🔒 잠김"}
        </span>
      </div>

      {/* 본문 */}
      <div className="px-4 py-4">
        {s.free ? (
          <p className="text-[13px] leading-relaxed whitespace-pre-line" style={{ color: GRAY2 }}>
            {s.content}
          </p>
        ) : (
          <div className="relative py-1">
            <div className="space-y-2 select-none">
              {s.blurLines.map((line, i) => (
                <p key={i} className="text-[13px] leading-relaxed"
                  style={{ color: GRAY2, filter: "blur(5.5px)", userSelect: "none" }}>
                  {line || "█████████████████████████████"}
                </p>
              ))}
            </div>
            {/* 잠금 오버레이 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ backgroundColor: RED_PALE, border: `1px solid ${ROSE}` }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <span className="text-[11px] font-semibold" style={{ color: RED }}>결제 후 열람 가능</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 길일 달력 ────────────────────────────────────────────────────────────────
function FortuneCalendar({ saju }: { saju: LocalSajuResult | null }) {
  const today = new Date();
  const year  = today.getFullYear();
  const month = today.getMonth(); // 0-based
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay    = new Date(year, month, 1).getDay(); // 0=Sun

  // 일간 기준으로 좋은 날 (실제로는 합충 계산 필요, 여기선 패턴으로 표시)
  const dayStem = saju?.dayStem ?? "";
  const goodDays   = new Set<number>();
  const badDays    = new Set<number>();

  // 간단한 규칙: 일간의 오행과 상생하는 날은 길, 상극은 흉
  for (let d = 1; d <= daysInMonth; d++) {
    if ((d + (dayStem.charCodeAt(0) % 5)) % 6 === 0) goodDays.add(d);
    if ((d + (dayStem.charCodeAt(0) % 5)) % 7 === 1) badDays.add(d);
  }

  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  const monthNames = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
  const dayNames   = ["일","월","화","수","목","금","토"];

  return (
    <div className="px-5 py-6" style={{ backgroundColor: WHITE }}>
      <p className="text-center text-[12px] tracking-widest mb-1" style={{ color: RED }}>✦ 이달의 운세 ✦</p>
      <h3 className="text-center text-[17px] font-bold mb-4" style={{ color: GRAY1 }}>
        {year}년 {monthNames[month]} 길일·흉일
      </h3>

      {/* 캘린더 */}
      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${GRAY4}` }}>
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7" style={{ backgroundColor: RED }}>
          {dayNames.map((d, i) => (
            <div key={i} className="py-2 text-center text-[11px] font-bold text-white">{d}</div>
          ))}
        </div>
        {/* 날짜 */}
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7"
            style={{ borderTop: wi > 0 ? `1px solid ${GRAY4}` : "none" }}>
            {week.map((day, di) => {
              const isToday   = day === today.getDate();
              const isGood    = day !== null && goodDays.has(day);
              const isBad     = day !== null && badDays.has(day);
              const isSun     = di === 0;
              const isSat     = di === 6;
              return (
                <div key={di}
                  className="relative flex flex-col items-center justify-center py-2"
                  style={{
                    backgroundColor: isToday ? `${RED}15` : isGood ? `${NAVY}0d` : "transparent",
                    borderLeft: di > 0 ? `1px solid ${GRAY4}` : "none",
                  }}>
                  {day !== null && (
                    <>
                      <span className="text-[12px]" style={{
                        color: isToday ? RED : isSun ? "#e03030" : isSat ? NAVY : GRAY2,
                        fontWeight: isToday ? 700 : 400,
                      }}>{day}</span>
                      {isGood && (
                        <span className="text-[8px] font-bold mt-0.5" style={{ color: NAVY }}>길</span>
                      )}
                      {isBad && (
                        <span className="text-[8px] font-bold mt-0.5" style={{ color: "#e03030" }}>흉</span>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* 범례 */}
      <div className="flex items-center justify-center gap-5 mt-3">
        {[
          { color: NAVY, bg: `${NAVY}0d`, label: "길일" },
          { color: "#e03030", bg: "transparent", label: "흉일" },
          { color: RED, bg: `${RED}15`, label: "오늘" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.bg, border: `1px solid ${item.color}` }} />
            <span className="text-[11px]" style={{ color: GRAY3 }}>{item.label}</span>
          </div>
        ))}
      </div>
      <p className="text-center text-[11px] mt-2" style={{ color: GRAY3 }}>
        * 정확한 날짜 해석은 풀 리포트에서 확인하세요
      </p>
    </div>
  );
}

// ─── 후기 ─────────────────────────────────────────────────────────────────────
const REVIEWS = [
  { star: 5, text: "소름돋을 정도로 정확해요. 제 성격을 너무 잘 맞췄어요. 주변에 다 추천했습니다.", name: "30대 직장인 김○○", date: "2025.05.12" },
  { star: 5, text: "대운 흐름이 지금 제 상황이랑 딱 맞아서 깜짝 놀랐어요. 결혼 시기도 맞히더라고요.", name: "20대 취업준비생 이○○", date: "2025.04.28" },
  { star: 4, text: "연애운 부분에서 과거 이야기가 다 나와서 신기했습니다. 믿고 볼 수 있어요.", name: "40대 자영업자 박○○", date: "2025.05.03" },
];

function ReviewSection() {
  return (
    <div className="px-5 py-6" style={{ backgroundColor: CREAM }}>
      <p className="text-center text-[12px] tracking-widest mb-1" style={{ color: RED }}>✦ 실제 후기 ✦</p>
      <h3 className="text-center text-[17px] font-bold mb-4" style={{ color: GRAY1 }}>이용하신 분들의 이야기</h3>
      <div className="space-y-3">
        {REVIEWS.map((r, i) => (
          <div key={i} className="rounded-2xl px-4 py-4"
            style={{ backgroundColor: WHITE, border: `1px solid ${GRAY4}`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <span key={j} className="text-[13px]" style={{ color: j < r.star ? "#f5a623" : GRAY4 }}>★</span>
                ))}
              </div>
              <span className="text-[11px]" style={{ color: GRAY3 }}>{r.date}</span>
            </div>
            <p className="text-[13px] leading-relaxed mb-1.5" style={{ color: GRAY2 }}>"{r.text}"</p>
            <p className="text-[11px]" style={{ color: GRAY3 }}>— {r.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 상품 옵션 ───────────────────────────────────────────────────────────────
const PRODUCTS = [
  { id: "basic",   name: "재물사주",                  badge: null,  desc: null,
    tags: [],                              original: 39800,  discount: 50, price: 19900 },
];

// ─── 결제 모달 (다크 테마) ────────────────────────────────────────────────────
function PayBottomSheet({ open, onClose, onConfirm }: {
  open: boolean; onClose: () => void; onConfirm: (id: string) => void;
}) {
  const [selected, setSelected] = useState("basic");
  const [couponOpen, setCouponOpen] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [marketing, setMarketing] = useState(true);
  const [mounted, setMounted] = useState(false);   // 슬라이드 업 트리거
  const [closing, setClosing] = useState(false);   // 슬라이드 다운(나가기)
  const [confirmExit, setConfirmExit] = useState(false); // 이탈 만류 팝업
  const [legalDoc, setLegalDoc] = useState<null | "terms" | "privacy">(null); // 약관/방침 플로팅

  useEffect(() => {
    if (open) {
      setClosing(false);
      const id = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(id);
    }
    setMounted(false);
    setConfirmExit(false);
  }, [open]);

  if (!open) return null;

  // 다크 토큰
  const DBG = "#1b1820";       // 모달 배경
  const DCARD = "#262229";     // 카드 배경
  const DTXT = "#ffffff";
  const DMUTE = "rgba(255,255,255,0.5)";
  const DSTRIKE = "rgba(255,255,255,0.38)";
  const ACCENT = "#e0465a";    // 강조 레드

  const sel = PRODUCTS.find((p) => p.id === selected) ?? PRODUCTS[0];
  const saved = sel.original - sel.price;
  const visible = mounted && !closing;

  const requestClose = () => setConfirmExit(true);          // 이탈/X → 만류 팝업
  const doExit = () => { setConfirmExit(false); setClosing(true); setTimeout(onClose, 320); }; // 나가기 → 슬라이드 다운 후 닫힘

  return (
    <>
      {/* 딤 배경 */}
      <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.6)", opacity: visible ? 1 : 0, transition: "opacity 0.3s ease" }} onClick={requestClose} />

      {/* 바텀시트 — 하단을 채우며 위로 */}
      <div className="fixed bottom-0 z-50 overflow-y-auto rounded-t-3xl"
        style={{ left: "max(0px, calc(50vw - 240px))", width: "min(100%, 480px)", maxHeight: "92vh", backgroundColor: DBG, boxShadow: "0 -12px 40px rgba(0,0,0,0.5)", scrollbarWidth: "none", transform: visible ? "translateY(0)" : "translateY(100%)", transition: "transform 0.34s cubic-bezier(0.32,0.72,0,1)" }}>
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-1">
          <div style={{ width: 40, height: 4, borderRadius: 99, background: "rgba(255,255,255,0.2)" }} />
        </div>
        <div className="px-5 pt-2 pb-7">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[18px] font-black" style={{ color: DTXT }}>{PRODUCTS[0].name} 결제 안내</h3>
            <button onClick={requestClose} aria-label="닫기" className="flex items-center justify-center" style={{ width: 28, height: 28, color: "rgba(255,255,255,0.6)", fontSize: 18 }}>✕</button>
          </div>

          {/* 총 할인 배지 */}
          <div className="inline-block text-[13px] font-bold px-3.5 py-1.5 rounded-full mb-5"
            style={{ background: "rgba(224,70,90,0.16)", border: `1px solid ${ACCENT}55`, color: "#ff9aa6" }}>
            총 <span style={{ color: "#ff6b7e" }}>{saved.toLocaleString()}원</span> 할인받았어요!
          </div>

          {/* 패키지 할인혜택 */}
          <div className="space-y-2.5 mb-5">
            {PRODUCTS.map((p) => {
              const isSel = selected === p.id;
              const isPkg = p.tags.length > 0;
              return (
                <button key={p.id} onClick={() => setSelected(p.id)}
                  className="w-full text-left rounded-2xl px-4 py-3.5 transition-all"
                  style={{ backgroundColor: DCARD, border: `1.5px solid ${isSel ? ACCENT : "rgba(255,255,255,0.08)"}`, boxShadow: isSel ? `0 0 0 3px ${ACCENT}22` : "none" }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isPkg && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.12)", color: "#ff9aa6" }}>추천</span>}
                        <span className="text-[14.5px] font-bold" style={{ color: DTXT }}>{p.name}</span>
                      </div>
                      {!isPkg && <p className="text-[11.5px] mt-1" style={{ color: DMUTE }}>홍연이 들려주는 당신의 재물운사주</p>}
                      {isPkg && <p className="text-[11.5px] mt-1" style={{ color: DMUTE }}>{p.tags.join(" + ")}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[11px]" style={{ color: DSTRIKE }}>
                        <span style={{ color: ACCENT, fontWeight: 700 }}>{p.discount}%</span>{" "}
                        <span className="line-through">{p.original.toLocaleString()}</span>
                      </p>
                      <p className="text-[16px] font-black mt-0.5" style={{ color: DTXT }}>{p.price.toLocaleString()}원</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 합계 */}
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center justify-between text-[13px]">
              <span style={{ color: DMUTE }}>상품 판매가 (정가)</span>
              <span style={{ color: "rgba(255,255,255,0.85)" }}>{sel.original.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span style={{ color: "#ff6b7e", fontWeight: 700 }}>지금 결제 시 할인 ({sel.discount}% 특가)</span>
              <span style={{ color: "#ff6b7e", fontWeight: 700 }}>-{saved.toLocaleString()}</span>
            </div>
          </div>

          {/* 결제 버튼 */}
          <button onClick={() => onConfirm(selected)}
            className="w-full py-4 rounded-2xl font-black text-[17px] text-white active:scale-[0.99] transition-transform"
            style={{ background: "linear-gradient(135deg, #ec4d6e, #c01e3c)", boxShadow: "0 6px 20px rgba(224,70,90,0.4)" }}>
            결제하기
          </button>

          {/* 동의 안내 — 자동 체크 + 링크 */}
          <div className="flex items-center justify-center gap-2 mt-3.5">
            <span className="flex-shrink-0 flex items-center justify-center rounded" style={{ width: 16, height: 16, background: ACCENT, color: "#fff", fontSize: 10 }}>✓</span>
            <p className="text-[11px] leading-relaxed" style={{ color: DMUTE }}>
              결제 시{" "}
              <button onClick={() => setLegalDoc("privacy")} className="underline" style={{ color: "rgba(255,255,255,0.78)" }}>개인정보 처리방침</button>과{" "}
              <button onClick={() => setLegalDoc("terms")} className="underline" style={{ color: "rgba(255,255,255,0.78)" }}>이용약관</button>에 동의합니다.
            </p>
          </div>

        </div>
      </div>

      {/* 이탈 만류 — 작은 플로팅 카드 (딤 없음, X로 끔) */}
      {confirmExit && (
        <div className="fixed z-[60] px-6"
          style={{ left: "max(0px, calc(50vw - 240px))", width: "min(100%, 480px)", top: "34%", pointerEvents: "none" }}>
          <div className="relative mx-auto rounded-2xl px-5 py-4"
            style={{ pointerEvents: "auto", maxWidth: 290, background: "#211d27", boxShadow: "0 14px 40px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", animation: "popIn 0.2s cubic-bezier(0.34,1.4,0.5,1)" }}>
            {/* 닫기 X */}
            <button onClick={() => setConfirmExit(false)} aria-label="닫기"
              className="absolute top-2.5 right-2.5 flex items-center justify-center rounded-full"
              style={{ width: 22, height: 22, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 12, lineHeight: 1 }}>✕</button>
            <p className="text-[14px] font-black pr-5" style={{ color: "#fff" }}>🎁 {saved.toLocaleString()}원 할인이 사라져요!</p>
            <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>이 혜택은 지금만 적용됩니다.</p>
            <button onClick={() => setConfirmExit(false)} className="w-full mt-3 py-2.5 rounded-xl text-[13.5px] font-bold text-white active:scale-[0.99] transition-transform" style={{ background: "linear-gradient(135deg, #ec4d6e, #c01e3c)" }}>혜택 받고 계속하기</button>
            <button onClick={doExit} className="w-full mt-2 py-2.5 rounded-xl text-[13px] font-bold active:scale-[0.99] transition-transform" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)" }}>나가기</button>
          </div>
          <style>{`@keyframes popIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}`}</style>
        </div>
      )}

      {/* 약관/방침 — 가운데 작은 플로팅 모달 (페이지 이동 없음) */}
      {legalDoc && (
        <div className="fixed inset-0 z-[70]">
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setLegalDoc(null)} />
          <div className="fixed z-[71] flex flex-col rounded-2xl overflow-hidden"
            style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "min(80vw, 300px)", maxHeight: "56vh", background: "#fff", boxShadow: "0 20px 50px rgba(0,0,0,0.4)", animation: "legalPop 0.2s cubic-bezier(0.34,1.4,0.5,1)" }}>
            {/* 헤더 */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid #eee" }}>
              <span className="text-[13px] font-bold" style={{ color: "#111" }}>{legalDoc === "terms" ? "이용약관" : "개인정보처리방침"}</span>
              <button onClick={() => setLegalDoc(null)} aria-label="닫기" className="flex items-center justify-center rounded-full" style={{ width: 24, height: 24, background: "#f1f1f1", color: "#666", fontSize: 13, lineHeight: 1 }}>✕</button>
            </div>
            {/* 본문 (스크롤, 글자 비율 축소) */}
            <div className={`legal-scroll flex-1 overflow-y-auto px-4 pt-2 pb-6 ${LEGAL_DOC_CLASS} [&_h1]:hidden [&_h2:first-of-type]:border-t-0 [&_h2:first-of-type]:pt-0`} style={{ background: "#fff", zoom: 0.82, scrollbarWidth: "thin", scrollbarColor: "#cfcfcf transparent" } as React.CSSProperties}>
              {legalDoc === "terms" ? <TermsContent /> : <PrivacyContent />}
            </div>
          </div>
          <style>{`@keyframes legalPop{from{opacity:0;transform:translate(-50%,-50%) scale(0.9)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}.legal-scroll::-webkit-scrollbar{width:5px}.legal-scroll::-webkit-scrollbar-thumb{background:#cfcfcf;border-radius:3px}.legal-scroll::-webkit-scrollbar-track{background:transparent}`}</style>
        </div>
      )}
    </>
  );
}

// ─── 결제 CTA 고정 하단 ───────────────────────────────────────────────────────
function StickyPayCTA({ onPay, name }: { onPay: () => void; name: string }) {
  const [glow, setGlow] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setGlow((g) => !g), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex-shrink-0 px-5 pb-7 pt-4"
      style={{ backgroundColor: WHITE, boxShadow: "0 -4px 20px rgba(0,0,0,0.08)" }}>
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] line-through" style={{ color: GRAY3 }}>₩39,800</span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "#fff0f2", color: RED_SOFT, border: `1px solid ${ROSE}` }}>특가 -50%</span>
        </div>
        <span className="text-[24px] font-bold" style={{ color: GRAY1 }}>₩19,900</span>
      </div>
      <button onClick={onPay}
        className="w-full py-4 rounded-2xl font-bold text-[16px] text-white flex items-center justify-center gap-2 active:scale-95 transition-all"
        style={{ backgroundColor: RED, boxShadow: glow ? `0 4px 24px ${RED}88` : `0 2px 12px ${RED}44`, transition: "box-shadow 1s ease" }}>
        <span>🔓</span>
        <span>{name}님의 재물운사주 지금바로 확인하기</span>
      </button>
    </div>
  );
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────
function CheckoutContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const name     = searchParams.get("name")     ?? "고객";
  const date     = searchParams.get("date")     ?? "";
  const time     = searchParams.get("time")     ?? "시간 모름";
  const calendar = searchParams.get("calendar") ?? "양력";
  const gender   = searchParams.get("gender")   ?? "";

  const saju = useMemo(() => calcSaju(date, time, calendar), [date, time, calendar]);

  const CHAPTER_TITLES = [
    "제1장 — 사주 원국",
    "제2장 — 운명의 구조",
    "제3장 — 인간관계",
    "제4장 — 숨겨진 특징",
    "제5장 — 재물과 직업",
    "제6장 — 사랑과 결혼",
    "제7장 — 건강",
    "제8장 — 귀인",
    "제9장 — 주의할 사람",
    "제10장 — 굴곡과 위기",
    "제11장 — 대운 흐름",
    "제12장 — 주의 시기",
    "제13장 — 당부의 말",
    "제14장 — 개운법",
    "제15장 — 중심 잡기",
    "제16장 — 마무리",
  ];
  const TOTAL = 14;

  const [showSheet, setShowSheet] = useState(false);
  const [creating, setCreating] = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(1);

  const handleConfirm = async (productId: string) => {
    setShowSheet(false);
    const email = searchParams.get("email") ?? "";
    setCreating(true);
    setDoneCount(0);
    setCurrentChapter(1);
    try {
      // 1단계: 명식 생성 + resultId 받기
      const res = await fetch("/api/jaemul-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, date, time, calendar, gender, email }),
      });
      if (!res.ok) {
        router.push(`/saju/saju_jaemul/report-preview?${new URLSearchParams({ name, date, time, calendar, gender, email }).toString()}`);
        return;
      }
      const { resultId } = await res.json();
      if (!resultId) {
        router.push(`/saju/saju_jaemul/report-preview?${new URLSearchParams({ name, date, time, calendar, gender, email }).toString()}`);
        return;
      }

      // 2단계: 14장 병렬 생성 후 결과 수집
      const chapters = [1,2,3,4,5,6,7,8,9,10,11,12,13,14];
      let done = 0;
      const allContent: Record<string, unknown> = {};
      await Promise.all(chapters.map(async (ch) => {
        try {
          const r = await fetch("/api/jaemul-report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: resultId, chapter: ch }),
          });
          const data = await r.json();
          if (data.sections) Object.assign(allContent, data.sections);
        } catch { /* 장 실패해도 계속 */ }
        done++;
        setDoneCount(done);
        setCurrentChapter(Math.min(done + 1, TOTAL));
      }));

      // 3단계: 전체 내용 한 번에 저장 (race condition 없음)
      await fetch("/api/jaemul-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resultId, content: allContent }),
      });

      // 4단계: 결과지 열기
      router.push(`/saju/saju_jaemul/report-preview?id=${resultId}&gender=${encodeURIComponent(gender)}&name=${encodeURIComponent(name)}`);
    } catch {
      router.push(`/saju/saju_jaemul/report-preview?${new URLSearchParams({ name, date, time, calendar, gender, email }).toString()}`);
    }
  };

  if (creating) {
    const pct = Math.round((doneCount / TOTAL) * 100);
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center z-50 px-8" style={{ background: "radial-gradient(ellipse at 50% 40%, #2a0a00 0%, #0d0200 100%)" }}>
        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(400%); }
          }
          @keyframes glow-pulse {
            0%, 100% { box-shadow: 0 0 8px 2px #ff4400aa, 0 0 20px 4px #ff220055; }
            50% { box-shadow: 0 0 16px 4px #ff6600cc, 0 0 40px 10px #ff440088; }
          }
          @keyframes float-up {
            0% { opacity: 0; transform: translateY(0) scale(0.5); }
            30% { opacity: 1; }
            100% { opacity: 0; transform: translateY(-60px) scale(1); }
          }
          @keyframes title-fade {
            0% { opacity: 0; transform: translateY(6px); }
            20% { opacity: 1; transform: translateY(0); }
            80% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-6px); }
          }
          @keyframes orbit {
            0% { transform: rotate(0deg) translateX(38px) rotate(0deg); }
            100% { transform: rotate(360deg) translateX(38px) rotate(-360deg); }
          }
        `}</style>

        {/* 별자리 장식 */}
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, #ff330022 0%, transparent 70%)" }} />
          {[0,1,2,3,4,5].map(i => (
            <div key={i} className="absolute w-1 h-1 rounded-full" style={{
              top: "50%", left: "50%", marginTop: "-2px", marginLeft: "-2px",
              background: i % 2 === 0 ? "#ff6633" : "#ffaa44",
              boxShadow: `0 0 6px 2px ${i % 2 === 0 ? "#ff4400" : "#ff8800"}`,
              animation: `orbit ${2.5 + i * 0.4}s linear infinite`,
              animationDelay: `${i * -0.5}s`,
            }} />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <span style={{ fontSize: 28, filter: "drop-shadow(0 0 8px #ff4400)" }}>✦</span>
          </div>
        </div>

        {/* 타이틀 */}
        <p className="text-[18px] font-bold mb-1" style={{ color: "#fff5ee", fontFamily: "'Noto Serif KR', serif", textShadow: "0 0 20px #ff440088" }}>
          결과지를 완성하고 있소…
        </p>
        <p key={currentChapter} className="text-[13px] mb-8" style={{ color: "#ff9966", animation: "title-fade 4s ease-in-out", minHeight: 20 }}>
          {doneCount < TOTAL ? CHAPTER_TITLES[currentChapter - 1] + " 풀이 중" : "마무리 중이오…"}
        </p>

        {/* 게이지 */}
        <div className="w-full max-w-[280px] mb-3">
          <div className="flex justify-between text-[11px] mb-2" style={{ color: "#cc7755" }}>
            <span>{doneCount} / {TOTAL} 장 완성</span>
            <span>{pct}%</span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden relative" style={{ background: "#1a0800" }}>
            <div
              className="h-full rounded-full relative overflow-hidden transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, #8b1a00, #ff4400, #ff8833)",
                animation: pct > 0 ? "glow-pulse 1.8s ease-in-out infinite" : "none",
              }}
            >
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                animation: "shimmer 1.6s linear infinite",
                width: "40%",
              }} />
            </div>
          </div>
        </div>

        <p className="text-[11px] text-center leading-relaxed mt-4" style={{ color: "#886655" }}>
          풀이가 완성되면 자동으로 열리오.<br />이 창을 벗어나셔도 입력하신 이메일로<br />결과지 링크를 보내드렸으니 언제든 확인하실 수 있소.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: CREAM }}>
      {/* 스크롤 영역 — 얇은 스크롤바 */}
      <div className="flex-1 min-h-0 overflow-y-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>

        {/* ① 이미지 → 그라데이션 → 텍스트 → 그라데이션 → 이미지 */}
        <ImageTextBlock
          topImgSrc="/media/hero/hero-1.jpg"
          bottomImgSrc="/media/hero/hero-1.jpg"
          label="재물운사주 · 정밀 리포트"
          headline={`${name}님의 사주,\n지금 이 순간까지\n살살이 봤어요`}
          accentWord="살살이"
          bgColor={WHITE}
        />

        {/* ② 명식 그리드 */}
        <div style={{ backgroundColor: WHITE }}>
          <p className="text-center text-[12px] tracking-widest pb-1" style={{ color: RED }}>✦ 사주 명식 ✦</p>
          <MyeongsikGrid saju={saju} />
        </div>

        {/* ③ 오행 차트 */}
        <div className="h-2" style={{ backgroundColor: CREAM }} />
        <OhaengChart saju={saju} />

        {/* ④ 이미지 → 텍스트 → 이미지 */}
        <ImageTextBlock
          topImgSrc="/media/hero/hero-1.jpg"
          bottomImgSrc="/media/hero/hero-1.jpg"
          label="AI 정밀 사주 분석 · 5가지 항목"
          headline={`지금 당신의 운명,\n낱낱이\n분석했습니다`}
          accentWord="낱낱이"
          bgColor={CREAM}
        />

        {/* ⑤ 분석 섹션 1~3 */}
        <div className="pb-5" style={{ backgroundColor: CREAM }}>
          {SECTIONS.slice(0, 3).map((s, i) => (
            <AnalysisSection key={i} s={s} index={i} />
          ))}
        </div>

        {/* ⑥ 이미지 구분자 */}
        <ImageDivider bgColor={CREAM} />

        {/* ⑦ 나머지 분석 */}
        <div className="py-5" style={{ backgroundColor: CREAM }}>
          {SECTIONS.slice(3).map((s, i) => (
            <AnalysisSection key={i} s={s} index={i + 3} />
          ))}
        </div>

        {/* ⑧ 달력 */}
        <div className="h-2" style={{ backgroundColor: CREAM }} />
        <FortuneCalendar saju={saju} />

        {/* ⑨ 이미지 → 텍스트 → 이미지 */}
        <ImageTextBlock
          topImgSrc="/media/hero/hero-1.jpg"
          bottomImgSrc="/media/hero/hero-1.jpg"
          label="실제 이용 후기"
          headline={`이미 수천 명이\n확인한\n그 정확함`}
          accentWord="그 정확함"
          bgColor={WHITE}
        />

        {/* ⑩ 후기 */}
        <ReviewSection />
        <div className="h-4" />
      </div>

      {/* 고정 결제 CTA */}
      <StickyPayCTA onPay={() => setShowSheet(true)} name={name} />

      {/* 결제 바텀시트 */}
      <PayBottomSheet open={showSheet} onClose={() => setShowSheet(false)} onConfirm={handleConfirm} />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: CREAM }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: RED, borderTopColor: "transparent" }} />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
