"use client";

// =====================================================
// 결과지 디자인 스캐폴드 (정적 미리보기) — 문학형 프리미엄 레이아웃
// =====================================================
// 레퍼런스(용용사주 평생 총운 리포트) 스타일을 따라 만드는 디자인 전용 페이지.
// 실제 사주/LLM 데이터는 아직 연결하지 않고 SAMPLE 텍스트로 렌더한다.
// 토막 스크린샷을 받을 때마다 아래로 섹션을 누적해서 추가/수정한다.
//
// 미리보기: http://localhost:3000/saju/jeongtong/report-preview
//
// ⚠️ 이미지는 전부 임시(placeholder)다. 레퍼런스의 한복 일러스트 대신
//    기존 hero 이미지를 끼워둠 — 추후 전용 일러스트로 교체.

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { MyeongsikView } from "@/lib/saju/myeongsik-view";
import type { ReportContent, ReportSection, ReportFlowItem } from "@/lib/saju/report-content";
import { MyeongsikModalView } from "@/components/saju/MyeongsikModal";
import { ganCharImage, jiCharImage } from "@/lib/saju/char-image";

// ─── 디자인 토큰 ──────────────────────────────────────────────────
const CREAM = "#fdf8f4";
const WHITE = "#ffffff";
const PINK_PALE = "#f9eef0";
const INK = "#2a2320"; // 짙은 먹빛 브라운
const INK_SOFT = "#5b504a";
const MUTE = "#9a8f88";
const ROSE = "#b56576";
const MAROON = "#9b2335";
const CALLOUT_BG = "#f7e9ec";
const BLUE = "#3f63c4";
const WARN = "#c9474f";
const NAVY = "#2d3a8c";
const SERIF = "'Nanum Myeongjo', 'Apple SD Gothic Neo', serif";

// 오행 색상
const OHAENG: { key: string; label: string; color: string }[] = [
  { key: "목", label: "목", color: "#7cc47f" },
  { key: "화", label: "화", color: "#e88aa0" },
  { key: "토", label: "토", color: "#e8c97a" },
  { key: "금", label: "금", color: "#b8c0c4" },
  { key: "수", label: "수", color: "#8fb3e0" },
];

// 오행 균형 도넛 차트 (명식 천간·지지 오행 비율)
function OhaengDonut({ view }: { view: MyeongsikView | null }) {
  const counts: Record<string, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  if (view) {
    for (const p of view.pillars) {
      if (p.ganEl && counts[p.ganEl] !== undefined) counts[p.ganEl]++;
      if (p.jiEl && counts[p.jiEl] !== undefined) counts[p.jiEl]++;
    }
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  const pct = (n: number) => Math.round((n / total) * 100);
  const dom = OHAENG.reduce((a, b) => (counts[b.key] > counts[a.key] ? b : a), OHAENG[0]);

  // 도넛 (stroke-dasharray)
  const R = 52, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div className="mx-5 my-2 rounded-2xl p-5" style={{ background: WHITE, border: `1px solid ${INK}12`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      <h3 className="text-[16px] font-black flex items-center gap-1.5 mb-1" style={{ color: INK }}>
        <span style={{ color: ROSE }}>◎</span> 오행 균형
      </h3>
      <p className="text-[12px] mb-4" style={{ color: MUTE }}>목·화·토·금·수, 다섯 기운의 비율이에요.</p>
      <div className="flex justify-center">
        <svg viewBox="0 0 140 140" style={{ width: 150, height: 150 }}>
          <g transform="rotate(-90 70 70)">
            {OHAENG.map((e) => {
              const frac = counts[e.key] / total;
              const len = frac * C;
              const el = (
                <circle key={e.key} cx="70" cy="70" r={R} fill="none" stroke={e.color} strokeWidth="16"
                  strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-acc} />
              );
              acc += len;
              return el;
            })}
          </g>
          <text x="70" y="64" textAnchor="middle" fontSize="9" fill={MUTE}>가장 강한 기운</text>
          <text x="70" y="80" textAnchor="middle" fontSize="20" fontWeight="900" fill={dom.color}>{dom.label}</text>
          <text x="70" y="95" textAnchor="middle" fontSize="11" fontWeight="700" fill={INK_SOFT}>{pct(counts[dom.key])}%</text>
        </svg>
      </div>
      <div className="flex gap-1.5 mt-3">
        {OHAENG.map((e) => (
          <div key={e.key} className="flex-1 text-center rounded-lg py-1.5" style={{ background: `${e.color}22` }}>
            <div className="text-[12px] font-black" style={{ color: INK }}>{e.label}</div>
            <div className="text-[11px] font-bold" style={{ color: INK_SOFT }}>{pct(counts[e.key])}%</div>
          </div>
        ))}
      </div>
      <p className="text-[10.5px] mt-3 text-center" style={{ color: MUTE }}>기운을 눌러 자세히 보세요</p>
    </div>
  );
}

// 미니 십성표 (내 명식 속 십성: 천간/지지 글자 + 천간십성/지지십성)
function SipseongMini({ view }: { view: MyeongsikView | null }) {
  if (!view) return null;
  const ps = view.pillars;
  const cols: [string, string][] = [["시", ""], ["일", ""], ["월", ""], ["년", ""]];
  const GC = "62px repeat(4, 1fr)";
  const rs = { gridTemplateColumns: GC, borderTop: `1px solid ${INK}0c` } as const;
  const lbl = (t: string) => <div className="flex items-center justify-center text-[10.5px] font-bold" style={{ color: MUTE }}>{t}</div>;
  const txt = (t: string) => <div className="py-1.5 text-center text-[11px]" style={{ color: INK_SOFT }}>{t}</div>;
  const img = (src: string, alt: string) => (
    <div className="py-0.5 flex items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} style={{ width: 34, height: 34, objectFit: "contain" }} />
    </div>
  );
  return (
    <div className="rounded-2xl p-3.5 mb-4" style={{ background: WHITE, border: `1px solid ${INK}12` }}>
      <p className="text-[11px] font-bold mb-2" style={{ color: MUTE }}>내 명식 속 십성</p>
      <div className="grid" style={{ gridTemplateColumns: GC }}>
        <div />
        {cols.map(([h]) => <div key={h} className="py-1 text-center text-[11px] font-bold" style={{ color: MUTE }}>{h}</div>)}
      </div>
      <div className="grid" style={rs}>{lbl("천간")}{ps.map((p, i) => <div key={i}>{img(ganCharImage(p.gan), p.gan)}</div>)}</div>
      <div className="grid" style={rs}>{lbl("지지")}{ps.map((p, i) => <div key={i}>{img(jiCharImage(p.ji), p.ji)}</div>)}</div>
      <div className="grid" style={rs}>{lbl("천간 십성")}{ps.map((p, i) => <div key={i}>{txt(p.sipTop)}</div>)}</div>
      <div className="grid" style={rs}>{lbl("지지 십성")}{ps.map((p, i) => <div key={i}>{txt(p.sipBot)}</div>)}</div>
    </div>
  );
}

// 십성 → 6축 역할 값 (명식 기반)
function sipseongRadar(view: MyeongsikView | null): { label: string; value: number }[] {
  const cat: Record<string, number> = { 비겁: 0, 식상: 0, 재성: 0, 관성: 0, 인성: 0 };
  const map: Record<string, string> = {
    비견: "비겁", 겁재: "비겁", 식신: "식상", 상관: "식상", 편재: "재성",
    정재: "재성", 편관: "관성", 정관: "관성", 편인: "인성", 정인: "인성",
  };
  if (view) for (const p of view.pillars) for (const s of [p.sipTop, p.sipBot]) { const c = map[s]; if (c) cat[c]++; }
  const sc = (n: number) => Math.min(100, 35 + n * 16);
  const avg = (cat.비겁 + cat.식상 + cat.재성 + cat.관성 + cat.인성) / 5;
  return [
    { label: "자기주도", value: sc(cat.비겁) },
    { label: "표현력", value: sc(cat.식상) },
    { label: "재물감각", value: sc(cat.재성) },
    { label: "책임감", value: sc(cat.관성) },
    { label: "배움", value: sc(cat.인성) },
    { label: "관계유연", value: sc(avg) },
  ];
}

// 육각형 레이더 차트
function RadarChart({ axes }: { axes: { label: string; value: number }[] }) {
  const cx = 100, cy = 100, maxR = 60;
  const ang = (i: number) => (-90 + i * 60) * (Math.PI / 180);
  const pt = (i: number, r: number) => [cx + r * Math.cos(ang(i)), cy + r * Math.sin(ang(i))];
  const grid = (frac: number) => axes.map((_, i) => pt(i, maxR * frac).join(",")).join(" ");
  const valPoly = axes.map((a, i) => pt(i, maxR * (a.value / 100)).join(",")).join(" ");
  return (
    <div className="rounded-2xl p-5 mt-4" style={{ background: WHITE, border: `1px solid ${INK}12`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      <h3 className="text-[16px] font-black flex items-center gap-1.5 mb-1" style={{ color: INK }}>
        <span style={{ color: ROSE }}>⬡</span> 십성 역할
      </h3>
      <p className="text-[12px] mb-2" style={{ color: MUTE }}>타고난 역할과 관계 맺는 방식을 여섯 축으로 정리했어요.</p>
      <svg viewBox="0 0 200 200" className="w-full" style={{ maxHeight: 220 }}>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <polygon key={f} points={grid(f)} fill="none" stroke={`${INK}14`} />
        ))}
        {axes.map((_, i) => { const [x, y] = pt(i, maxR); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={`${INK}10`} />; })}
        <polygon points={valPoly} fill={`${"#7cc47f"}55`} stroke="#5aa86a" strokeWidth="1.5" />
        {axes.map((a, i) => { const [x, y] = pt(i, maxR * (a.value / 100)); return <circle key={i} cx={x} cy={y} r="2.5" fill="#5aa86a" />; })}
        {axes.map((a, i) => {
          const [x, y] = pt(i, maxR + 18);
          return (
            <text key={i} x={x} y={y} textAnchor="middle" fontSize="9" fontWeight="700" fill={INK}>
              <tspan x={x} dy="0">{a.label}</tspan>
              <tspan x={x} dy="10" fontSize="8" fill={MUTE}>{a.value}%</tspan>
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// 미니 십이운성표 (천간/지지 + 십이운성)
function UnseongMini({ view }: { view: MyeongsikView | null }) {
  if (!view) return null;
  const ps = view.pillars;
  const GC = "56px repeat(4, 1fr)";
  const rs = { gridTemplateColumns: GC, borderTop: `1px solid ${INK}0c` } as const;
  const lbl = (t: string) => <div className="flex items-center justify-center text-[10.5px] font-bold" style={{ color: MUTE }}>{t}</div>;
  const img = (src: string, alt: string) => (
    <div className="py-0.5 flex items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} style={{ width: 34, height: 34, objectFit: "contain" }} />
    </div>
  );
  return (
    <div className="rounded-2xl p-3.5 mb-4" style={{ background: WHITE, border: `1px solid ${INK}12` }}>
      <p className="text-[11px] font-bold mb-2" style={{ color: MUTE }}>내 명식 속 십이운성</p>
      <div className="grid" style={{ gridTemplateColumns: GC }}>
        <div />
        {["시", "일", "월", "년"].map((h) => <div key={h} className="py-1 text-center text-[11px] font-bold" style={{ color: MUTE }}>{h}</div>)}
      </div>
      <div className="grid" style={rs}>{lbl("천간")}{ps.map((p, i) => <div key={i}>{img(ganCharImage(p.gan), p.gan)}</div>)}</div>
      <div className="grid" style={rs}>{lbl("지지")}{ps.map((p, i) => <div key={i}>{img(jiCharImage(p.ji), p.ji)}</div>)}</div>
      <div className="grid" style={rs}>{lbl("운성")}{ps.map((p, i) => <div key={i} className="py-1.5 text-center text-[12px] font-bold" style={{ color: MAROON }}>{p.unseong}</div>)}</div>
    </div>
  );
}

// 간단 명식 (천간/지지만)
function GanjiMini({ view }: { view: MyeongsikView | null }) {
  if (!view) return null;
  const ps = view.pillars;
  const GC = "repeat(4, 1fr)";
  const img = (src: string, alt: string) => (
    <div className="flex justify-center py-1">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} style={{ width: 42, height: 42, objectFit: "contain" }} />
    </div>
  );
  return (
    <div className="rounded-2xl p-3.5 mb-4" style={{ background: WHITE, border: `1px solid ${INK}12` }}>
      <p className="text-[11px] font-bold mb-2" style={{ color: MUTE }}>내 명식</p>
      <div className="grid" style={{ gridTemplateColumns: GC }}>
        {["시", "일", "월", "년"].map((h) => <div key={h} className="text-center text-[11px] font-bold" style={{ color: MUTE }}>{h}</div>)}
      </div>
      <div className="grid" style={{ gridTemplateColumns: GC }}>{ps.map((p, i) => <div key={i}>{img(ganCharImage(p.gan), p.gan)}</div>)}</div>
      <div className="grid" style={{ gridTemplateColumns: GC }}>{ps.map((p, i) => <div key={i}>{img(jiCharImage(p.ji), p.ji)}</div>)}</div>
    </div>
  );
}

// 강조 문단 (끝에 하이라이트 문장)
function HiP({ children, hi }: { children: React.ReactNode; hi: string }) {
  return (
    <p className="text-[14.5px] leading-[1.95] mb-4" style={{ color: INK_SOFT }}>
      {children}{" "}
      <span style={{ background: "#fdf3c9", color: INK, fontWeight: 600, padding: "1px 3px", borderRadius: 3, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" } as React.CSSProperties}>{hi}</span>
    </p>
  );
}

// 신살/합/충 태그 카드
function SpecialTag({ label, sub, color }: { label: string; sub?: string; color: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 mb-2" style={{ background: `${color}12`, borderLeft: `3px solid ${color}` }}>
      <span className="text-[15px] font-black" style={{ color }}>{label}</span>
      {sub && <span className="text-[12.5px]" style={{ color: INK_SOFT }}>{sub}</span>}
    </div>
  );
}

const CHAPTER_TITLES: Record<string, string> = {
  "1": "제1장 · 지나온 시간과 선택들",
  "2": "제2장 · 타고난 길",
  "3": "제3장 · 나는 왜 이런 사람인 걸까",
  "4": "제4장 · 내 사주는 얼마나 희귀할까",
};

// 사주 희귀도 — 종형 분포 + 등급/백분율 마커
function RarityChart({ grade, percentile, name }: { grade: string; percentile: number; name: string }) {
  const W = 300, H = 120, n = 60, base = H - 12, top = 16;
  const pts = Array.from({ length: n + 1 }, (_, i) => {
    const x = i / n;
    const g = Math.exp(-Math.pow((x - 0.5) * 5, 2) / 2);
    return [x * W, base - g * (base - top)];
  });
  const line = "M " + pts.map((p) => p.join(",")).join(" L ");
  const area = line + ` L ${W},${base} L 0,${base} Z`;
  const mf = Math.min(0.97, Math.max(0.03, 1 - percentile / 100)); // 희귀할수록 오른쪽 꼬리
  const mx = mf * W;
  return (
    <div className="mx-5 my-2 rounded-2xl p-5" style={{ background: WHITE, border: `1px solid ${INK}12`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      <h3 className="text-[16px] font-black flex items-center gap-1.5 mb-1" style={{ color: INK }}>
        <span style={{ color: ROSE }}>△</span> 사주 희귀도
      </h3>
      <p className="text-[12px] mb-4" style={{ color: MUTE }}>같은 명식이 얼마나 드문지 분포 위에 표시했어요.</p>
      <div className="text-center mb-2">
        <span className="text-[12px] font-black px-3 py-1 rounded-full" style={{ background: MAROON, color: WHITE }}>{grade}</span>
        <p className="text-[24px] font-black mt-2" style={{ color: INK }}>전국민 중 {percentile}%</p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 130 }}>
        <defs>
          <linearGradient id="rar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={MAROON} stopOpacity="0.18" />
            <stop offset="100%" stopColor={MAROON} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#rar)" />
        <path d={line} fill="none" stroke="#e88aa0" strokeWidth="2" />
        <line x1={mx} y1={top - 4} x2={mx} y2={base} stroke={INK} strokeWidth="1.5" strokeDasharray="2 2" />
        <circle cx={mx} cy={base} r="3.5" fill={INK} />
        <text x={mx} y={top - 8} textAnchor="middle" fontSize="9" fontWeight="700" fill={INK}>{name}님</text>
      </svg>
    </div>
  );
}

// 사주등급 표
function GradeTable({ myGrade }: { myGrade: string }) {
  const rows = [
    { g: "S등급", ratio: "상위 1% 이내", desc: "매우 드문 특수 격국이나 신살의 조합" },
    { g: "A등급", ratio: "상위 1~5%", desc: "천을귀인 중첩과 건록 일주의 귀한 조화" },
    { g: "B등급", ratio: "상위 5~25%", desc: "일반적인 오행의 균형 잡힌 구성" },
    { g: "C등급", ratio: "상위 25%~", desc: "대중적이고 평범한 사주 구성" },
  ];
  return (
    <div className="mx-5 my-2 rounded-2xl overflow-hidden" style={{ border: `1px solid ${INK}12` }}>
      <p className="px-4 py-2.5 text-[13px] font-black" style={{ color: INK, background: "#f4ece7" }}>사주등급</p>
      <div className="grid text-[11px] font-bold" style={{ gridTemplateColumns: "52px 78px 1fr", color: MUTE, background: "#faf3ee" }}>
        <div className="px-2 py-1.5">등급</div><div className="px-2 py-1.5">비율</div><div className="px-2 py-1.5">특징</div>
      </div>
      {rows.map((r) => {
        const me = r.g === myGrade;
        return (
          <div key={r.g} className="grid items-center" style={{ gridTemplateColumns: "52px 78px 1fr", background: me ? `${MAROON}0d` : WHITE, borderTop: `1px solid ${INK}0a` }}>
            <div className="px-2 py-2.5 text-[12px] font-black" style={{ color: me ? MAROON : INK }}>{r.g}</div>
            <div className="px-2 py-2.5 text-[11px]" style={{ color: INK_SOFT }}>{r.ratio}</div>
            <div className="px-2 py-2.5 text-[11px] leading-snug" style={{ color: INK_SOFT }}>{r.desc}{me && <span style={{ color: MAROON, fontWeight: 800 }}> · 나</span>}</div>
          </div>
        );
      })}
    </div>
  );
}

// 한글 텍스트 디바이더 (한자 없이)
function TextDivider({ title }: { title: string }) {
  return (
    <div className="px-6 py-12 text-center" style={{ background: `linear-gradient(to bottom, ${CREAM}, ${PINK_PALE})` }}>
      <p className="text-[20px] font-black leading-snug whitespace-pre-line" style={{ color: INK, fontFamily: SERIF }}>{title}</p>
    </div>
  );
}

// 신강·신약 반원 게이지
function SinStrengthGauge({ view }: { view: MyeongsikView | null }) {
  const score = Math.max(0, Math.min(100, view?.sinStrength?.score ?? 50));
  const label = view?.sinStrength?.strength ?? "중화";
  const cx = 100, cy = 100, R = 76;
  const pt = (frac: number) => { const a = Math.PI * (1 - frac); return [cx + R * Math.cos(a), cy - R * Math.sin(a)]; };
  const arc = (f0: number, f1: number) => { const [x0, y0] = pt(f0); const [x1, y1] = pt(f1); return `M ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1}`; };
  const [mx, my] = pt(score / 100);
  return (
    <div className="rounded-2xl p-5 mt-4" style={{ background: WHITE, border: `1px solid ${INK}12`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      <h3 className="text-[16px] font-black flex items-center gap-1.5 mb-1" style={{ color: INK }}>
        <span style={{ color: ROSE }}>◠</span> 신강·신약 지수
      </h3>
      <p className="text-[12px] mb-2" style={{ color: MUTE }}>기운이 강한지 약한지 게이지로 보여드려요.</p>
      <svg viewBox="0 0 200 118" className="w-full" style={{ maxHeight: 130 }}>
        <path d={arc(0, 1)} stroke={`${INK}10`} strokeWidth="14" fill="none" strokeLinecap="round" />
        <path d={arc(0, 0.5)} stroke="#8fb3e0" strokeWidth="14" fill="none" strokeLinecap="round" />
        <path d={arc(0.5, 1)} stroke="#e88aa0" strokeWidth="14" fill="none" strokeLinecap="round" />
        <circle cx={mx} cy={my} r="8" fill={WHITE} stroke={INK} strokeWidth="2.5" />
        <text x="100" y="86" textAnchor="middle" fontSize="26" fontWeight="900" fill={INK}>{score}</text>
        <text x="100" y="102" textAnchor="middle" fontSize="9" fill={MUTE}>/ 100 · {label}</text>
      </svg>
      <div className="flex justify-between text-[11px] font-bold px-2 -mt-1">
        <span style={{ color: "#5a7fc0" }}>신약</span>
        <span style={{ color: "#c9474f" }}>신강</span>
      </div>
    </div>
  );
}

// 인라인 명식표 (제2장 두루마리)
function ScrollMyeongsik({ view, name, birth }: { view: MyeongsikView | null; name: string; birth: { date: string; calendar: string; time: string } | null }) {
  if (!view) return null;
  const ps = view.pillars;
  const cols: [string, string][] = [["時", "시"], ["日", "일"], ["月", "월"], ["年", "년"]];
  const GC = "40px repeat(4, 1fr)";
  const rowStyle = { gridTemplateColumns: GC, borderTop: `1px solid ${INK}10` } as const;
  const lbl = (t: string) => (
    <div className="flex items-center justify-center text-[10px] font-bold" style={{ color: MUTE, background: "#efe6d6" }}>{t}</div>
  );
  const txt = (t: string, color: string = INK_SOFT) => (
    <div className="py-1.5 text-center text-[11px]" style={{ color, background: "#fff" }}>{t}</div>
  );
  const img = (src: string, alt: string) => (
    <div className="py-1 flex items-center justify-center" style={{ background: "#fff" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} style={{ width: 40, height: 40, objectFit: "contain" }} />
    </div>
  );
  return (
    <div className="mx-5 my-2 rounded-2xl p-4" style={{ background: "linear-gradient(#faf3e4, #f1e3cc)", border: "1px solid #d8c4a0", boxShadow: "0 6px 20px rgba(0,0,0,0.12)" }}>
      <div className="text-center mb-3">
        <p className="text-[18px] font-black" style={{ color: INK, fontFamily: SERIF }}>{name}님</p>
        {birth && <p className="text-[11px] mt-0.5" style={{ color: MUTE }}>{birth.date} · {birth.calendar} · {birth.time}</p>}
      </div>
      <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${INK}22` }}>
        <div className="grid" style={{ gridTemplateColumns: GC }}>
          <div style={{ background: "#efe6d6" }} />
          {cols.map(([h, s]) => (
            <div key={h} className="py-1 text-center" style={{ background: "#e7d9bf" }}>
              <div className="text-[13px] font-black" style={{ color: MAROON }}>{h}</div>
              <div className="text-[9px]" style={{ color: MUTE }}>{s}</div>
            </div>
          ))}
        </div>
        <div className="grid" style={rowStyle}>{lbl("십성")}{ps.map((p, i) => <div key={i}>{txt(p.sipTop)}</div>)}</div>
        <div className="grid" style={rowStyle}>{lbl("천간")}{ps.map((p, i) => <div key={i}>{img(ganCharImage(p.gan), p.gan)}</div>)}</div>
        <div className="grid" style={rowStyle}>{lbl("지지")}{ps.map((p, i) => <div key={i}>{img(jiCharImage(p.ji), p.ji)}</div>)}</div>
        <div className="grid" style={rowStyle}>{lbl("십성")}{ps.map((p, i) => <div key={i}>{txt(p.sipBot)}</div>)}</div>
        <div className="grid" style={rowStyle}>{lbl("운성")}{ps.map((p, i) => <div key={i}>{txt(p.unseong)}</div>)}</div>
        <div className="grid" style={rowStyle}>{lbl("신살")}{ps.map((p, i) => <div key={i}>{txt(p.sinsal || "—", MAROON)}</div>)}</div>
      </div>
    </div>
  );
}

// ─── 샘플 데이터 (파라미터 없이 열었을 때 폴백) ──────────────────────
const NAME = "선우";

const SAMPLE_CONTENT: ReportContent = {
  hardSeason: {
    intro: "지난 시간 동안 걸어온 길을 돌아보면 유독 마음이 무겁고 답답했던 터널 같은 시기가 있었을 것으로 보여요.",
    callout: "특히 20대 중반부터 30대 초반까지 이어졌던 계유(癸酉) 대운의 시기는 깊은 내면의 방황과 정체기를 안겨주었네요.",
    paragraphs: [
      "이 시기에는 열심히 노력해도 제자리걸음을 하는 듯한 기분이 들고, 현실적인 돌파구를 찾기가 쉽지 않았을 거예요.",
      "남들은 앞으로 나아가는 것처럼 보이는데 나만 홀로 멈춰 서 있는 듯한 고립감에 마음고생이 많으셨을 것 같아요.",
      "이 고단했던 시간들은 인생의 다음 단계를 준비하기 위해 내면의 힘을 기르는 혹독한 겨울이었던 셈이에요.",
    ],
  },
  cause: {
    intro: "그토록 힘든 시기를 보낼 수밖에 없었던 이유는 사주 원국과 대운의 기운이 서로 부딪쳤기 때문이에요.",
    callout: "월지에 자리 잡은 자수(子) 편인의 기운이 대운에서 들어온 계유(癸酉)의 강한 물 기운과 만나 과해진 탓이에요.",
    paragraphs: [
      "을목(乙) 일간에게 적당한 물은 성장의 자양분이 되지만 너무 과한 물은 오히려 뿌리를 썩게 만들어요.",
      "이로 인해 현실적인 실행력보다는 머릿속의 생각과 걱정만 비대해져 스스로를 고립시키는 결과를 낳게 되었어요.",
    ],
    flow: [
      { label: "20대 중반", tone: "warn", text: "진로와 미래에 대한 깊은 고민과 방황" },
      { label: "20대 후반", tone: "warn", text: "내면의 성찰과 내실 다지기" },
      { label: "30대 초반", tone: "warn", text: "생각의 늪에서 벗어나기 위한 고군분투" },
      { label: "30대 중반", tone: "good", text: "안정적인 기반을 마련하기 시작" },
      { label: "현재", tone: "good", text: "사회적 인정과 내면의 단단함이 조화를 이루는 시기" },
    ],
  },
  pattern: {
    intro: "삶에서 반복되어 온 가장 뚜렷한 패턴은 완벽하게 준비하려다 오히려 시작을 미루게 되는 현상이에요.",
    callout: "어떤 일을 시작하기 전에 머릿속으로 수많은 시나리오를 그리며 걱정을 사서 하다가 타이밍을 놓치곤 하셨네요.",
    paragraphs: [
      "잘하고 싶은 마음이 너무 강하다 보니 작은 실수도 용납하지 못해 스스로에게 가혹한 기준을 들이대곤 했어요.",
      "이제는 이 반복되는 고리를 끊어내고 조금 더 가볍고 유연하게 세상과 마주할 준비를 하셔야 할 때가 되었어요.",
    ],
    summary: [
      { title: "과도한 생각의 늪", desc: "준비가 완벽해질 때까지 실행을 미루며 스스로를 압박하던 흐름이에요." },
      { title: "내면의 고립감", desc: "힘든 일이 있어도 주변에 나누지 않고 혼자 삭이려 했던 성향이 강해요." },
      { title: "새로운 돌파구 마련", desc: "30대 중반에 접어들며 현실적인 성과와 안정을 향해 나아가기 시작했어요." },
    ],
  },
  wonguk: {
    intro: "사주 원국을 들여다보면 가장 먼저 눈에 띄는 것은 일주가 가진 강인하고 푸른 생명력이에요.",
    callout: "일간은 유연하면서도 끈질긴 잡초나 넝쿨 같아서 어떤 척박한 환경에서도 결국 살아남는 강인함을 뜻해요.",
    paragraphs: [
      "지지에 비견을 깔고 있어 스스로의 힘으로 우뚝 서려는 주체성과 자립심이 대단히 강한 분이네요.",
      "각 기둥의 기운이 스스로를 지키는 힘과 세상에 나를 드러내는 표현력으로 조화롭게 구성되어 있어요.",
    ],
  },
  ohaeng: {
    intro: "사주 속 다섯 가지 기운의 비율을 살펴보면 목과 화의 기운이 전체의 절반 이상을 차지하고 있어요.",
    callout: "나무의 기운이 가장 강하게 자리 잡고 있으며 불의 기운이 그 뒤를 든든하게 받쳐주고 있네요.",
    paragraphs: [
      "이는 태생적으로 강한 추진력과 열정, 자신을 표현하고자 하는 욕구가 매우 강한 사람임을 뜻해요.",
      "강한 목화의 기운을 다듬어 줄 쇠와 흙의 기운을 일상에서 보완해 주는 것이 운을 여는 열쇠예요.",
    ],
  },
  sipseong: {
    intro: "십성이라는 도구를 통해 세상을 살아가는 주된 무기와 사회적 역할을 살펴볼게요.",
    callout: "가장 활성화된 십성은 나 자신을 뜻하는 비견과 표현력을 뜻하는 상관이에요.",
    paragraphs: [
      "비견은 굳건한 자존심과 주체성을, 상관은 독창적인 아이디어를 매력적으로 표현하는 재능을 뜻해요.",
      "이 두 기운이 결합해 나만의 전문성을 바탕으로 주도적인 역할을 맡을 때 빛나는 사주예요.",
    ],
  },
  unseong: {
    intro: "십이운성은 각 기둥의 기운이 지금 어느 단계에 있는지를 보여줘요.",
    callout: "일주에 건록을 두어, 스스로 일어서서 자기 힘으로 자리를 만들어가는 단단한 기운을 타고났어요.",
    paragraphs: [
      "건록은 누구에게 기대지 않고 독립적으로 성취를 이루는 자립의 별이에요.",
      "다만 혼자 짊어지려다 지칠 수 있으니, 적절히 나누고 맡기는 연습이 운을 부드럽게 만들어줘요.",
    ],
  },
  pyori: {
    intro: "사람은 누구나 겉으로 드러나는 모습과 속에 감춰진 진짜 마음이 조금씩 달라요.",
    callout: "겉으로 보기엔 차분하고 단단해 보이지만, 속으로는 섬세하고 감수성이 풍부한 양면을 지니셨네요.",
    paragraphs: [
      "밖에서 보는 모습은 주관이 뚜렷하고 자기 일을 알아서 해내는 믿음직한 사람이에요.",
      "하지만 실제로는 작은 말에도 마음이 오래 머무는, 따뜻하고 깊은 내면을 가진 분이에요.",
    ],
  },
  strength: {
    intro: "사주가 가진 본질적인 힘의 강도를 분석해 보면 스스로의 심지가 매우 굳건한 신강 사주에 해당해요.",
    callout: "일간이 일지에 완벽하게 통근하여 뿌리를 내렸기에 어떤 비바람에도 쉽게 꺾이지 않는 뚝심이 있어요.",
    paragraphs: [
      "신강한 사주는 외부의 압박이나 타인의 시선에 흔들리지 않고 스스로 내린 결정을 끝까지 밀고 나가는 힘을 갈망해요.",
      "남에게 기대기보다 내 힘으로 일구어낸 성과를 볼 때 진정한 만족감과 희열을 느끼게 되지요.",
      "다만 이 강한 힘이 안으로만 뭉치면 고집불통이 되거나 스스로를 고립시키는 독이 될 수도 있어요.",
    ],
  },
  gyeokguk: {
    intro: "사회적으로 어떤 그릇을 가지고 태어났는지 보여주는 격국은 월지를 중심으로 한 편인격에 가까워요.",
    callout: "편인격의 사주는 평범한 기준을 따르기보다 자신만의 독창적인 전문 지식과 통찰력을 갈망하는 특징이 있어요.",
    paragraphs: [
      "남들이 보지 못하는 틈새를 직관적으로 찾아내 나만의 기술로 승화시키는 자리를 간절히 원하지요.",
      "이 격국이 제대로 발현되면 특정 분야의 독보적인 전문가나 기획자로서 대체 불가능한 존재가 될 수 있어요.",
    ],
  },
  yongsin: {
    intro: "삶의 균형을 잡아주고 운의 물꼬를 터줄 단 하나의 핵심 기운인 용신은 바로 쇠(金)의 기운이에요.",
    callout: "강한 나무의 기운을 다듬어 쓸모 있는 재목으로 만들어 줄 날카롭고 공정한 칼날인 쇠의 기운을 갈망하고 있네요.",
    paragraphs: [
      "쇠의 기운은 규칙과 절제, 공적인 책임감을 뜻하는 관성에 해당하여 삶의 방향타 역할을 해 줍니다.",
      "일상에서 쇠와 흙의 기운을 가까이하고 행동 지침으로 삼을 때 불안감이 사라지고 안정이 찾아오게 돼요.",
    ],
  },
  hapchung: {
    intro: "사주 원국에서 서로를 끌어당기고 뒤흔드는 글자들의 역동적인 작용을 짚어드릴게요.",
    callout: "가장 주목할 부분은 일지와 시지가 만들어내는 묘신원진과 귀문의 작용이에요.",
    paragraphs: [
      "원진살은 가까운 사이일수록 사소한 오해로 미워하게 만드는 예민한 감정의 누수를 촉발해요.",
      "한편 사신육합은 사회적인 다정과 협력의 통로를 열어주니, 내면의 예민함을 다스리면 평온이 찾아와요.",
    ],
  },
  essence: {
    intro: "지금까지 분석한 사주를 종합해 볼 때 인생에서 진짜 갈망하는 단 하나의 본질이 드러납니다.",
    callout: "그것은 바로 ‘누구에게도 간섭받지 않는 나만의 독립적인 영역에서, 완벽한 전문성을 발휘해 확실한 성과를 거두는 것’이에요.",
    paragraphs: [
      "남의 밑에서 지시를 따르는 삶은 강한 주체성과 편인의 자존심을 채워주지 못해 늘 갈증을 느끼게 만들어요.",
      "이미 그 길을 스스로 열어갈 수 있는 충분히 단단하고 귀한 힘을 품고 태어났음을 꼭 기억해 주셨으면 해요.",
    ],
  },
};

// ─── 섹션 컴포넌트 ────────────────────────────────────────────────

// 상단 앱바 (챕터 타이틀 + 공유/목차 + 진행 게이지)
function TopBar({ progress, title, onMenu, onMyeongsik }: { progress: number; title: string; onMenu: () => void; onMyeongsik: () => void }) {
  return (
    <div
      className="sticky top-0 z-30"
      style={{ background: "rgba(253,248,244,0.92)", backdropFilter: "blur(6px)", borderBottom: `1px solid ${INK}10` }}
    >
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[15px]">🐉</span>
          <div className="min-w-0">
            <p className="text-[12.5px] font-bold truncate" style={{ color: INK }}>
              {title}
            </p>
            <p className="text-[10px]" style={{ color: MUTE }}>
              평생 총운 리포트
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={onMyeongsik}
            className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1"
            style={{ color: MAROON, border: `1px solid ${MAROON}55`, background: `${MAROON}0a`, lineHeight: 1 }}
          >
            🔮 나의 명식보기
          </button>
          <button onClick={onMenu} className="flex flex-col items-center" style={{ color: INK_SOFT, lineHeight: 1 }}>
            <span className="text-[14px]">☰</span>
            <span className="text-[9px] mt-0.5">목차</span>
          </button>
        </div>
      </div>
      {/* 진행 게이지 */}
      <div style={{ height: 3, background: `${INK}12` }}>
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: `linear-gradient(to right, ${ROSE}, ${MAROON})`,
            transition: "width 0.08s linear",
          }}
        />
      </div>
    </div>
  );
}

// ─── 목차 (플로팅 패널) ───────────────────────────────────────────
type TocItem = { no: string; title: string; current?: boolean };
type TocGroup =
  | { type: "single"; label: string; title: string }
  | { type: "part"; part: string; sub: string; items: TocItem[] };

const TOC_GROUPS: TocGroup[] = [
  { type: "single", label: "인트로", title: "들어가며" },
  { type: "part", part: "제1부", sub: "지나온 길", items: [{ no: "01", title: "내가 지나온 시간과 선택들" }] },
  {
    type: "part",
    part: "제2부",
    sub: "타고난 길",
    items: [
      { no: "02", title: "나는 어떤 사람일까" },
      { no: "03", title: "나는 왜 이런 사람인 걸까 (사주 속 필연구조)" },
      { no: "04", title: "내 사주는 얼마나 희귀할까" },
      { no: "05", title: "세상을 대하는 나만의 방식" },
    ],
  },
  {
    type: "part",
    part: "제3부",
    sub: "열리는 길",
    items: [
      { no: "06", title: "앞으로 10년, 어떻게 흘러갈까?" },
      { no: "07", title: "재물·직업운 정밀풀이" },
      { no: "08", title: "연애·결혼운 정밀풀이" },
      { no: "09", title: "건강운 정밀풀이" },
      { no: "10", title: "나를 도와줄 귀인은 누구일까?" },
    ],
  },
  {
    type: "part",
    part: "제4부",
    sub: "흔들리는 길",
    items: [
      { no: "11", title: "반드시 조심해야 할 시기는 언제일까?" },
      { no: "12", title: "반드시 조심해야 할 악인은 누구일까?" },
    ],
  },
  {
    type: "part",
    part: "제5부",
    sub: "선우님만의 길",
    items: [
      { no: "13", title: "핵심 정리" },
      { no: "14", title: "지금부터 해야할 일들" },
      { no: "15", title: "흔들리지 않는 법에 대하여" },
    ],
  },
  { type: "single", label: "마무리", title: "단하의 편지" },
];

function Dot({ active }: { active?: boolean }) {
  return (
    <span
      className="flex-shrink-0 rounded-full"
      style={{ width: 9, height: 9, background: active ? BLUE : "transparent", border: active ? "none" : `2px solid ${INK}30` }}
    />
  );
}

function TocPanel({ open, onClose, currentNo, onSelect }: { open: boolean; onClose: () => void; currentNo: string; onSelect: (no: string) => void }) {
  return (
    <div
      className="fixed inset-y-0 z-50 flex items-start justify-center"
      style={{
        width: "min(100%, 480px)",
        left: "max(0px, calc(50vw - 240px))",
        pointerEvents: open ? "auto" : "none",
        paddingLeft: 14,
        paddingRight: 14,
        paddingTop: 76,
        paddingBottom: 20,
      }}
    >
      {/* 배경 딤 */}
      <div
        onClick={onClose}
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.4)", opacity: open ? 1 : 0, transition: "opacity 0.25s ease" }}
      />
      {/* 모달 창 (화면 안에 쏙 — 길면 내부 스크롤) */}
      <div
        className="relative w-full overflow-y-auto rounded-3xl"
        style={{
          maxHeight: "100%",
          background: CREAM,
          boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
          opacity: open ? 1 : 0,
          transform: open ? "scale(1) translateY(0)" : "scale(0.96) translateY(8px)",
          transition: "opacity 0.22s ease, transform 0.22s ease",
          scrollbarWidth: "none",
        }}
      >
        <div className="px-6 py-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-baseline gap-2">
              <h2 className="text-[22px] font-black" style={{ color: INK }}>
                목차
              </h2>
              <span className="text-[12px]" style={{ color: MUTE }}>
                총 15장
              </span>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center rounded-full"
              style={{ width: 28, height: 28, background: `${INK}0d`, color: INK_SOFT, fontSize: 15, lineHeight: 1 }}
              aria-label="닫기"
            >
              ✕
            </button>
          </div>

          {/* 목록 */}
          <div className="space-y-4">
            {TOC_GROUPS.map((g, gi) =>
              g.type === "single" ? (
                <div key={gi} className="flex items-center gap-3">
                  <Dot />
                  <span className="text-[14px] font-black" style={{ color: INK }}>
                    {g.label}
                  </span>
                  <span className="text-[12.5px]" style={{ color: MUTE }}>
                    · {g.title}
                  </span>
                </div>
              ) : (
                <div key={gi}>
                  <div className="flex items-center gap-3 mb-2.5">
                    <Dot active={g.items.some((i) => i.no === currentNo)} />
                    <span className="text-[14px] font-black" style={{ color: INK }}>
                      {g.part}
                    </span>
                    <span className="text-[11px]" style={{ color: MUTE }}>
                      {g.sub}
                    </span>
                  </div>
                  <div className="ml-[4px] pl-5 space-y-2.5" style={{ borderLeft: `1px solid ${INK}14` }}>
                    {g.items.map((it) => {
                      const active = it.no === currentNo;
                      return (
                      <button
                        key={it.no}
                        onClick={() => { onSelect(it.no); onClose(); }}
                        className="flex gap-2.5 items-start text-left w-full"
                      >
                        <span
                          className="text-[12px] font-bold flex-shrink-0"
                          style={{ color: active ? BLUE : MUTE, minWidth: 18 }}
                        >
                          {it.no}
                        </span>
                        <span
                          className="text-[13px] leading-snug"
                          style={{ color: active ? BLUE : INK_SOFT, fontWeight: active ? 700 : 400 }}
                        >
                          {it.title}
                        </span>
                      </button>
                      );
                    })}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 표지 — 풀블리드 일러스트 + 흰 세리프 제목
function Cover() {
  return (
    <div className="relative overflow-hidden" style={{ height: 520 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/hero/hero-15.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, transparent 30%, transparent 70%, rgba(253,248,244,0.95) 100%)" }} />
      <div className="absolute top-7 left-0 right-0 text-center px-6">
        <p className="text-[12px] tracking-[0.2em] mb-3" style={{ color: "rgba(255,255,255,0.9)" }}>
          제1부 · 지나온 길
        </p>
        <h1 className="text-[30px] font-black leading-snug" style={{ color: "#fff", fontFamily: SERIF, textShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
          “내가 지나온
          <br />
          시간과 선택들”
        </h1>
      </div>
    </div>
  );
}

// 중앙 세리프 인용구
function Quote({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-8 py-12 text-center">
      <p className="text-[18px] leading-[2] whitespace-pre-line" style={{ color: INK, fontFamily: SERIF }}>
        {children}
      </p>
    </div>
  );
}

// 한자 대형 디바이더
function HanjaDivider({ hanja, sub }: { hanja: string; sub: string }) {
  return (
    <div className="px-6 py-14 text-center" style={{ background: `linear-gradient(to bottom, ${CREAM}, ${PINK_PALE})` }}>
      <p className="text-[64px] leading-none font-black tracking-widest" style={{ color: INK, fontFamily: SERIF }}>
        {hanja.split("").map((c, i) => (
          <span key={i} className="block">
            {c}
          </span>
        ))}
      </p>
      <p className="mt-6 text-[13px]" style={{ color: MUTE }}>
        {sub}
      </p>
    </div>
  );
}

// 풀블리드 일러스트 (표제 없는 삽화)
function Illust({ src, h = 480 }: { src: string; h?: number }) {
  return (
    <div className="relative overflow-hidden" style={{ height: h, background: PINK_PALE }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute bottom-0 left-0 right-0 h-24" style={{ background: `linear-gradient(to bottom, transparent, ${CREAM})` }} />
    </div>
  );
}

// 본문 섹션 제목
function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[19px] font-black mb-4" style={{ color: INK }}>
      {children}
    </h2>
  );
}

// 본문 문단
function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[14.5px] leading-[1.95] mb-4" style={{ color: INK_SOFT }}>
      {children}
    </p>
  );
}

// 강조 콜아웃 박스 (사주 용어 하이라이트)
function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl px-4 py-3.5 mb-4" style={{ background: CALLOUT_BG, borderLeft: `3px solid ${ROSE}` }}>
      <p className="text-[14px] leading-[1.85]" style={{ color: INK }}>
        {children}
      </p>
    </div>
  );
}

// 사주 용어 강조 (인라인)
function Term({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ color: MAROON, fontWeight: 800 }}>{children}</span>
  );
}

// 지난 시간의 운 흐름 — 라인 차트 + 시기별 타임라인
function RunFlowChart({ flow }: { flow: ReportFlowItem[] }) {
  const src = flow.length ? flow : [{ label: "현재", tone: "good" as const, text: "" }];
  // tone(주의/좋음) + 순서로 차트 y값 산출 (과거→현재 상승 흐름)
  const data = src.map((f, i) => ({ ...f, v: (f.tone === "good" ? 58 : 26) + i * 6 }));
  const W = 300, H = 140, padX = 26, padTop = 16, padBot = 32, avg = 50;
  const innerW = W - padX * 2;
  const n = data.length;
  const x = (i: number) => padX + (innerW * i) / Math.max(1, n - 1);
  const y = (v: number) => padTop + (H - padTop - padBot) * (1 - v / 100);
  const pts = data.map((d, i) => `${x(i)},${y(d.v)}`).join(" ");
  const area = `${padX},${y(0)} ${pts} ${x(n - 1)},${y(0)}`;
  return (
    <div className="rounded-2xl p-5 mt-6" style={{ background: WHITE, border: `1px solid ${INK}12`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[16px] font-black flex items-center gap-1.5" style={{ color: INK }}>
          <span style={{ color: ROSE }}>〰</span> 지난 시간의 운 흐름
        </h3>
      </div>
      <p className="text-[12px] mb-3" style={{ color: MUTE }}>
        강하게 흔들린 해와 회복된 해를 함께 표시했어요.
      </p>
      {/* 범례 */}
      <div className="flex justify-end gap-3 mb-1 text-[10.5px]" style={{ color: INK_SOFT }}>
        <span className="flex items-center gap-1"><span style={{ width: 7, height: 7, borderRadius: 99, background: BLUE, display: "inline-block" }} /> 좋은 흐름</span>
        <span className="flex items-center gap-1"><span style={{ width: 7, height: 7, borderRadius: 99, background: WARN, display: "inline-block" }} /> 주의</span>
      </div>
      {/* 차트 */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="flowArea" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={WARN} stopOpacity="0.16" />
            <stop offset="100%" stopColor={BLUE} stopOpacity="0.18" />
          </linearGradient>
          <linearGradient id="flowLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="35%" stopColor={WARN} />
            <stop offset="70%" stopColor={BLUE} />
          </linearGradient>
        </defs>
        {/* 평균 기준선 */}
        <line x1={padX} y1={y(avg)} x2={W - padX} y2={y(avg)} stroke={INK} strokeOpacity="0.25" strokeDasharray="3 3" />
        <text x={padX} y={y(avg) - 4} fontSize="8" fill={MUTE}>평균 기준</text>
        {/* 면적 */}
        <polygon points={area} fill="url(#flowArea)" />
        {/* 선 */}
        <polyline points={pts} fill="none" stroke="url(#flowLine)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* 점 */}
        {data.map((d, i) => (
          <circle key={i} cx={x(i)} cy={y(d.v)} r="4" fill={WHITE} stroke={d.tone === "good" ? BLUE : WARN} strokeWidth="2.5" />
        ))}
        {/* x축 라벨 */}
        {data.map((d, i) => (
          <text key={i} x={x(i)} y={H - 14} fontSize="8.5" fill={INK_SOFT} textAnchor="middle">{d.label}</text>
        ))}
      </svg>
      {/* 시기별 타임라인 */}
      <div className="mt-4 space-y-2">
        {data.map((d) => {
          const c = d.tone === "good" ? BLUE : WARN;
          return (
            <div key={d.label} className="flex gap-2.5 items-start">
              <span className="flex-shrink-0 text-[10.5px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${c}14`, color: c, minWidth: 56, textAlign: "center" }}>
                {d.label}
              </span>
              <span className="text-[12.5px] leading-relaxed" style={{ color: INK_SOFT }}>{d.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 요약 카드 (제목 + 설명 항목 리스트)
function SummaryCard({ title, items }: { title: string; items: { title: string; desc: string }[] }) {
  return (
    <div className="rounded-2xl p-5 mt-6" style={{ background: "#faf3ee", border: `1px solid ${INK}10` }}>
      <p className="text-[11px] font-bold tracking-wide mb-3" style={{ color: MUTE }}>
        {title}
      </p>
      <div className="space-y-3.5">
        {items.map((it) => (
          <div key={it.title}>
            <p className="text-[14px] font-black mb-1 inline-block px-1.5 rounded" style={{ color: INK, background: "#f1e2e4" }}>
              {it.title}
            </p>
            <p className="text-[13px] leading-relaxed" style={{ color: INK_SOFT }}>
              {it.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const PATTERN_SUMMARY = [
  { title: "과도한 생각의 늪", desc: "준비가 완벽해질 때까지 실행을 미루며 스스로를 압박하던 흐름이에요." },
  { title: "내면의 고립감", desc: "힘든 일이 있어도 주변에 나누지 않고 혼자 삭이려 했던 성향이 강해요." },
  { title: "새로운 돌파구 마련", desc: "30대 중반에 접어들며 현실적인 성과와 안정을 향해 나아가기 시작했어요." },
];

// ─── 페이지 ──────────────────────────────────────────────────────
export default function ReportPreviewPage() {
  return (
    <Suspense fallback={null}>
      <ReportPreviewInner />
    </Suspense>
  );
}

function ReportPreviewInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id") ?? "";
  const ch = searchParams.get("ch") ?? "1";
  const date = searchParams.get("date") ?? "";
  const time = searchParams.get("time") ?? "";
  const calendar = searchParams.get("calendar") ?? "양력";
  const gender = searchParams.get("gender") ?? "";
  const nameParam = searchParams.get("name") ?? "";
  const email = searchParams.get("email") ?? "";

  const rootRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const [msOpen, setMsOpen] = useState(false);

  // 결과지 데이터 (명식 view + 구조화 풀이 content + 이름 + 생년월일)
  type BirthMeta = { date: string; calendar: string; time: string } | null;
  const [report, setReport] = useState<{ view: MyeongsikView; content: ReportContent; name: string; birth: BirthMeta } | null>(null);
  const [loading, setLoading] = useState(!!(id || date));
  const startedRef = useRef(false);

  // id 있으면 저장된 결과 조회(재생성 X), 입력만 있으면 생성+저장 후 id 주소로 교체
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    if (id) {
      fetch(`/api/jeongtong-report?id=${encodeURIComponent(id)}`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => setReport({ view: d.view, content: d.content, name: d.name, birth: d.birth ?? null }))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (date) {
      fetch("/api/jeongtong-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameParam, date, time, calendar, gender, email }),
      })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => {
          setReport({ view: d.view, content: d.content, name: d.name, birth: d.birth ?? null });
          if (d.resultId) router.replace(`/saju/jeongtong/report-preview?id=${d.resultId}`);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openMyeongsik = () => setMsOpen(true);

  // (detail) 레이아웃의 스크롤 컨테이너(<main>)를 찾아 진행률 계산
  useEffect(() => {
    let scroller: HTMLElement | null = rootRef.current?.parentElement ?? null;
    while (scroller) {
      const oy = getComputedStyle(scroller).overflowY;
      if ((oy === "auto" || oy === "scroll") && scroller.scrollHeight > scroller.clientHeight) break;
      scroller = scroller.parentElement;
    }
    const onScroll = () => {
      const st = scroller ? scroller.scrollTop : window.scrollY;
      const max = scroller
        ? scroller.scrollHeight - scroller.clientHeight
        : document.body.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, (st / max) * 100) : 0);
    };
    const target: HTMLElement | Window = scroller ?? window;
    target.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => target.removeEventListener("scroll", onScroll);
  }, []);

  // 생성/조회 중 로딩 화면
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center px-6 text-center" style={{ backgroundColor: CREAM, minHeight: "100%", height: "100%" }}>
        <div className="rounded-full animate-spin" style={{ width: 44, height: 44, border: `3px solid ${MAROON}22`, borderTopColor: MAROON }} />
        <p className="mt-5 text-[15px] font-bold" style={{ color: INK }}>사주를 풀이하고 있어요</p>
        <p className="mt-1 text-[13px]" style={{ color: MUTE }}>명식을 세우고 해석을 작성하는 중입니다…</p>
      </div>
    );
  }

  const name = report?.name?.trim() || "고객";
  // 누락 섹션(옛 데이터)은 샘플로 폴백
  const c: ReportContent = { ...SAMPLE_CONTENT, ...(report?.content ?? {}) };
  const ilganHanja = (report?.view?.ilgan ?? "乙")[0];
  const ilganLabel = (report?.view?.ilgan ?? "乙 (을목)").match(/\(([^)]+)\)/)?.[1] ?? "을목";

  const next = (n: string) => router.push(`/saju/jeongtong/report-preview?${id ? `id=${id}&` : ""}ch=${n}`);

  return (
    <div ref={rootRef} style={{ backgroundColor: CREAM, minHeight: "100%" }}>
      <TopBar progress={progress} title={CHAPTER_TITLES[ch] ?? `제${ch}장`} onMenu={() => setTocOpen(true)} onMyeongsik={openMyeongsik} />
      <TocPanel
        open={tocOpen}
        onClose={() => setTocOpen(false)}
        currentNo={String(ch).padStart(2, "0")}
        onSelect={(no) => next(String(Number(no)))}
      />
      <MyeongsikModalView open={msOpen} onClose={() => setMsOpen(false)} view={report?.view ?? null} loading={false} />

      {/* ═══════════ 제2장 ═══════════ */}
      {ch === "2" && (
        <>
          {/* 표지 */}
          <div className="relative overflow-hidden" style={{ height: 460 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/hero/hero-8.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, transparent 30%, transparent 70%, rgba(253,248,244,0.95) 100%)" }} />
            <div className="absolute top-7 left-0 right-0 text-center px-6">
              <p className="text-[12px] tracking-[0.2em] mb-3" style={{ color: "rgba(255,255,255,0.9)" }}>제2부 · 타고난 길</p>
              <h1 className="text-[30px] font-black leading-snug" style={{ color: "#fff", fontFamily: SERIF, textShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
                “나는 어떤 사람일까”
              </h1>
            </div>
          </div>

          <Quote>{`"자, 이제부터 ${name}님의 사주를\n한 장씩 펼쳐보겠습니다.\n가장 먼저, 타고난 본바탕부터\n들여다보겠습니다."`}</Quote>

          {/* 삽화 + 명식표(두루마리) */}
          <Illust src="/images/hero/hero-11.jpg" h={320} />
          <ScrollMyeongsik view={report?.view ?? null} name={name} birth={report?.birth ?? null} />

          {/* 原局 디바이더 */}
          <HanjaDivider hanja="原局" sub="사주 원국 한눈에 보기" />

          {/* 원국 분석 */}
          <section className="px-6 pt-2 pb-12">
            <Heading>사주 원국 한눈에 보기</Heading>
            <P>{c.wonguk.intro}</P>
            <Callout>{c.wonguk.callout}</Callout>
            {c.wonguk.paragraphs.map((p, i) => <P key={i}>{p}</P>)}
          </section>

          {/* 五行 디바이더 */}
          <HanjaDivider hanja="五行" sub="오행으로 보는 다섯 기운의 균형" />

          {/* 오행 분석 + 도넛 */}
          <section className="px-6 pt-2 pb-4">
            <Heading>오행으로 보는 다섯 기운의 균형</Heading>
            <P>{c.ohaeng.intro}</P>
            <Callout>{c.ohaeng.callout}</Callout>
            {c.ohaeng.paragraphs.map((p, i) => <P key={i}>{p}</P>)}

            <OhaengDonut view={report?.view ?? null} />
          </section>

          {/* 인용 */}
          <Quote>{`"나무와 불의 활기찬 에너지가\n${name}님의 삶을 이끄는 원동력이\n되어 주네요."`}</Quote>

          {/* 十星 디바이더 */}
          <HanjaDivider hanja="十星" sub="십성으로 보는 타고난 역할" />

          {/* 십성 분석 + 레이더 */}
          <section className="px-6 pt-2 pb-4">
            <Heading>십성으로 보는 타고난 역할</Heading>
            <SipseongMini view={report?.view ?? null} />
            <P>{c.sipseong.intro}</P>
            <Callout>{c.sipseong.callout}</Callout>
            {c.sipseong.paragraphs.map((p, i) => <P key={i}>{p}</P>)}

            <RadarChart axes={sipseongRadar(report?.view ?? null)} />
          </section>

          {/* 인용 */}
          <Quote>{`"나를 표현하는 힘과 주체적인\n의지가 ${name}님 사주에서 가장\n돋보이네요."`}</Quote>

          {/* 十二運星 디바이더 */}
          <HanjaDivider hanja="十二運星" sub="십이운성으로 보는 기운의 세기" />

          {/* 십이운성 분석 */}
          <section className="px-6 pt-2 pb-4">
            <Heading>십이운성으로 보는 기운의 세기</Heading>
            <UnseongMini view={report?.view ?? null} />
            <P>{c.unseong.intro}</P>
            <Callout>{c.unseong.callout}</Callout>
            {c.unseong.paragraphs.map((p, i) => <P key={i}>{p}</P>)}
          </section>

          {/* 表裏 디바이더 */}
          <HanjaDivider hanja="表裏" sub="밖에서 보는 나와 실제의 나" />

          {/* 표리 분석 */}
          <section className="px-6 pt-2 pb-4">
            <Heading>밖에서 보는 나와 실제의 나</Heading>
            <P>{c.pyori.intro}</P>
            <Callout>{c.pyori.callout}</Callout>
            {c.pyori.paragraphs.map((p, i) => <P key={i}>{p}</P>)}
          </section>

          {/* 삽화 */}
          <Illust src="/images/hero/hero-12.jpg" h={360} />

          {/* 마무리 인용 */}
          <Quote>{`"복잡한 사주 명식이지만,\n제가 ${name}님께 자세히\n설명해 드릴게요."`}</Quote>

          {/* 다음 장 네비 */}
          <div className="px-6 pb-10 flex gap-2 items-stretch">
            <button onClick={() => next("1")} className="px-4 py-4 rounded-2xl font-bold text-[14px]" style={{ color: INK_SOFT, border: `1px solid ${INK}22` }}>←</button>
            <button onClick={() => next("3")} className="flex-1 py-4 rounded-2xl font-bold text-[14px] text-white flex items-center justify-center gap-2" style={{ background: NAVY }}>
              <span>나는 왜 이런 사람인 걸까</span>
              <span>→</span>
            </button>
          </div>
        </>
      )}

      {/* ═══════════ 제3장 ═══════════ */}
      {ch === "3" && (
        <>
          {/* 표지 */}
          <div className="relative overflow-hidden" style={{ height: 480 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/hero/hero-7.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.1) 35%, transparent 65%, rgba(253,248,244,0.95) 100%)" }} />
            <div className="absolute top-7 left-0 right-0 text-center px-6">
              <p className="text-[12px] tracking-[0.2em] mb-3" style={{ color: "rgba(255,255,255,0.9)" }}>제2부 · 타고난 길</p>
              <h1 className="text-[28px] font-black leading-snug" style={{ color: "#fff", fontFamily: SERIF, textShadow: "0 2px 12px rgba(0,0,0,0.45)" }}>
                “나는 왜 이런<br />사람인 걸까”
              </h1>
              <p className="text-[12px] mt-2" style={{ color: "rgba(255,255,255,0.8)" }}>(사주 속 필연구조)</p>
            </div>
          </div>

          <Quote>{`"이전에는 ${name}님 자체의\n성격을 봤다면,\n이번에는 왜 그럴 수밖에 없었는지\n내면의 욕망과 결핍을 살펴볼게요."`}</Quote>

          {/* 신강·신약 디바이더 */}
          <TextDivider title={"신강·신약, 내 힘은\n얼마나 단단할까"} />

          {/* 신강·신약 분석 + 게이지 */}
          <section className="px-6 pt-2 pb-4">
            <Heading>신강·신약, 내 힘은 얼마나 단단할까</Heading>
            <P>{c.strength.intro}</P>
            <Callout>{c.strength.callout}</Callout>
            {c.strength.paragraphs.map((p, i) => <P key={i}>{p}</P>)}

            <SinStrengthGauge view={report?.view ?? null} />
          </section>

          {/* 인용 */}
          <Quote>{`"내면의 단단한 심지가 굳건하여\n스스로 삶을 개척할 힘이\n충분히 넘치네요."`}</Quote>

          {/* 격국 디바이더 */}
          <TextDivider title={"격국, 내가 마음\n깊이 서고 싶은 자리"} />

          {/* 격국 분석 */}
          <section className="px-6 pt-2 pb-4">
            <Heading>격국, 내가 마음 깊이 서고 싶은 자리</Heading>
            <P>{c.gyeokguk.intro}</P>
            <Callout>{c.gyeokguk.callout}</Callout>
            {c.gyeokguk.paragraphs.map((p, i) => <P key={i}>{p}</P>)}
          </section>

          {/* 용신 디바이더 */}
          <TextDivider title={"용신, 내가 가장\n목마른 단 하나의 기운"} />

          {/* 용신 분석 */}
          <section className="px-6 pt-2 pb-4">
            <Heading>용신, 내가 가장 목마른 단 하나의 기운</Heading>
            <P>{c.yongsin.intro}</P>
            <Callout>{c.yongsin.callout}</Callout>
            {c.yongsin.paragraphs.map((p, i) => <P key={i}>{p}</P>)}

            {/* 용신 요약 카드 */}
            <div className="rounded-2xl overflow-hidden mt-4" style={{ border: `1px solid ${NAVY}33` }}>
              <div className="px-4 py-3" style={{ background: NAVY }}>
                <p className="text-[14px] font-black text-white flex items-center gap-1.5">🌀 나에게 약이 되는 기운, 용신</p>
                <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.8)" }}>무엇을 키우고 무엇을 줄이면 운이 풀리는지 정리했어요.</p>
              </div>
              <div className="p-4" style={{ background: WHITE }}>
                <p className="text-[12.5px] font-bold mb-3 px-3 py-2 rounded-lg" style={{ color: NAVY, background: `${NAVY}0d` }}>
                  강한 나무의 기운을 다듬어 줄 절제와 규칙이 필요해요.
                </p>
                <p className="text-[12.5px] font-black mb-1.5" style={{ color: "#3f63c4" }}>▲ 늘리면 좋아요</p>
                <ul className="space-y-1 mb-3">
                  {["실력으로 승부보기", "정리정돈 습관 들이기", "원칙된 루틴 유지하기"].map((t) => (
                    <li key={t} className="text-[13px] flex gap-1.5" style={{ color: INK_SOFT }}><span style={{ color: "#3f63c4" }}>·</span>{t}</li>
                  ))}
                </ul>
                <p className="text-[12.5px] font-black mb-1.5" style={{ color: WARN }}>▼ 줄이면 좋아요</p>
                <ul className="space-y-1">
                  {["충동적인 결정 내리기", "생각만 길고 미루기", "과욕으로 무리하기"].map((t) => (
                    <li key={t} className="text-[13px] flex gap-1.5" style={{ color: INK_SOFT }}><span style={{ color: WARN }}>·</span>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 합·충 디바이더 */}
          <TextDivider title={"합·충, 나를\n끌어당기고 뒤흔드는 것들"} />

          {/* 합충 분석 */}
          <section className="px-6 pt-2 pb-4">
            <Heading>합·충, 나를 끌어당기고 뒤흔드는 것들</Heading>
            <P>{c.hapchung.intro}</P>
            <Callout>{c.hapchung.callout}</Callout>
            {c.hapchung.paragraphs.map((p, i) => <P key={i}>{p}</P>)}
          </section>

          {/* 핵심 갈망 디바이더 */}
          <TextDivider title={"그래서, 내가\n진짜 원하는 것"} />

          {/* 핵심 갈망 */}
          <section className="px-6 pt-2 pb-4">
            <Heading>그래서, 내가 진짜 원하는 것</Heading>
            <P>{c.essence.intro}</P>
            <Callout>{c.essence.callout}</Callout>
            {c.essence.paragraphs.map((p, i) => <P key={i}>{p}</P>)}
          </section>

          {/* 삽화 */}
          <Illust src="/images/hero/hero-15.jpg" h={360} />

          {/* 마무리 인용 */}
          <Quote>{`"나를 지키는 단단한 심지와\n세상을 향해 뻗어 나가는 표현력이\n${name}님의 삶을 가장 눈부시게\n빛춰줄 등불이 될 거예요."`}</Quote>

          {/* 다음 장 네비 */}
          <div className="px-6 pb-10 flex gap-2 items-stretch">
            <button onClick={() => next("2")} className="px-4 py-4 rounded-2xl font-bold text-[14px]" style={{ color: INK_SOFT, border: `1px solid ${INK}22` }}>←</button>
            <button onClick={() => next("4")} className="flex-1 py-4 rounded-2xl font-bold text-[14px] text-white flex items-center justify-center gap-2" style={{ background: NAVY }}>
              <span>내 사주는 얼마나 희귀할까</span>
              <span>→</span>
            </button>
          </div>
        </>
      )}

      {/* ═══════════ 제4장 ═══════════ */}
      {ch === "4" && (
        <>
          {/* 표지 */}
          <div className="relative overflow-hidden" style={{ height: 470 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/hero/hero-11.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 32%, transparent 68%, rgba(253,248,244,0.95) 100%)" }} />
            <div className="absolute top-7 left-0 right-0 text-center px-6">
              <p className="text-[12px] tracking-[0.2em] mb-3" style={{ color: "rgba(255,255,255,0.9)" }}>제2부 · 타고난 길</p>
              <h1 className="text-[28px] font-black leading-snug" style={{ color: "#fff", fontFamily: SERIF, textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
                “내 사주는<br />얼마나 희귀할까”
              </h1>
            </div>
          </div>

          <Quote>{`"${name}님의 사주가\n얼마나 드문지\n살펴보겠습니다."`}</Quote>

          {/* 발현 확률 분석 + 희귀도 차트 + 등급표 */}
          <section className="px-6 pt-2 pb-4">
            <Heading>내 사주의 발현 확률</Heading>
            <P>
              {name}님의 사주가 지닌 희소성과 특별함에 대해 명리학적인 근거를 들어 자세히 풀어드릴게요.
            </P>
            <Callout>
              {name}님의 사주는 을묘(乙卯) 건록 일주라는 강력한 주체성의 기둥 위에, 하늘의 보살핌을 뜻하는
              천을귀인(天乙貴人)이 중첩된 귀한 명식이에요.
            </Callout>
            <P>
              일간 을목(乙)에게 가장 귀한 글자인 자수(子)와 신금(申)이 월지와 시지에 나란히 자리 잡은 구성은 매우
              드물답니다.
            </P>
            <P>
              이러한 특별한 글자들의 배치와 오행의 조화는 전체 사주 구성 중 상위 2.5%에 해당하는 아주 높은 희소성을
              보여줘요.
            </P>
            <P>
              천을귀인이 두 개나 자리 잡고 있다는 것은 인생의 큰 위기나 고비마다 나를 돕는 귀인이 반드시 나타남을
              의미해요.
            </P>
            <P>
              이 귀하고 단단한 사주의 그릇을 믿고 주체적으로 삶을 이끌어갈 때 {name}님만의 특별한 복록은 온전히 발현될
              거예요.
            </P>

            <RarityChart grade="A등급" percentile={2.5} name={name} />
            <GradeTable myGrade="A등급" />
          </section>

          {/* 인용 */}
          <Quote>{`"${name}님 사주가 지닌\n특별한 귀인의 기운을\n지금부터 구체적으로\n풀어드릴게요."`}</Quote>

          {/* 이 사주가 드문 이유 */}
          <section className="px-6 pt-2 pb-4">
            <Heading>이 사주가 드문 이유</Heading>
            <GanjiMini view={report?.view ?? null} />

            <div className="mb-4">
              <SpecialTag label="乙卯" sub="을묘일주 × 도화살" color={NAVY} />
              <SpecialTag label="巳 ↔ 申" sub="사신육합" color="#b5891c" />
              <SpecialTag label="태극귀인 × 역마살" color="#c9474f" />
              <SpecialTag label="卯 ↔ 申" sub="묘신원진" color="#3f8a52" />
            </div>

            <HiP hi="어느 자리에서든 시선을 독차지하게 해줘요.">
              화초 같은 을묘일주에 도화살(타고난 인기)까지 더해졌어요. 강한 기질이 한층 또렷하게 드러나는 사주예요.
            </HiP>
            <HiP hi="사람과 깊이 엮이며 든든한 인연을 만들어내게 해줘요.">
              뱀(巳)과 원숭이(申)가 단단히 묶여, 인연과 결속이 깊어지는 자리예요.
            </HiP>
            <HiP hi="막다른 길에서도 결국 도와줄 사람과 길이 나타나게 해줘요.">
              태극귀인(막힌 일을 푸는 복)에 역마살(끊임없는 이동)까지 더해졌어요. 한 사주에 같이 있기 쉽지 않은 구성이에요.
            </HiP>
            <HiP hi="예민한 촉으로 남들이 놓치는 신호를 먼저 알아채게 해줘요.">
              토끼(卯)와 원숭이(申)가 서로 밀어내, 예민함과 애증이 함께 도는 자리예요.
            </HiP>
          </section>

          {/* 삽화 */}
          <Illust src="/images/hero/hero-7.jpg" h={360} />

          {/* 마무리 인용 */}
          <Quote>{`"하늘이 내린 귀한 별들이\n${name}님의 길을 비추고 있으니,\n어떤 어둠 속에서도\n길을 잃지 않을 거예요."`}</Quote>

          {/* 다음 장 네비 */}
          <div className="px-6 pb-10 flex gap-2 items-stretch">
            <button onClick={() => next("3")} className="px-4 py-4 rounded-2xl font-bold text-[14px]" style={{ color: INK_SOFT, border: `1px solid ${INK}22` }}>←</button>
            <button onClick={() => next("5")} className="flex-1 py-4 rounded-2xl font-bold text-[14px] text-white flex items-center justify-center gap-2" style={{ background: NAVY }}>
              <span>세상을 대하는 나만의 방식</span>
              <span>→</span>
            </button>
          </div>
        </>
      )}

      {/* ═══════════ 제5장 이후 — 준비 중 ═══════════ */}
      {ch !== "1" && ch !== "2" && ch !== "3" && ch !== "4" && (
        <div className="flex flex-col items-center justify-center px-8 text-center" style={{ minHeight: "70vh" }}>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full mb-3" style={{ background: `${MAROON}12`, color: MAROON }}>Chapter {ch}</span>
          <p className="text-[14px]" style={{ color: MUTE }}>이 장은 준비 중입니다.</p>
          <button onClick={() => next("1")} className="mt-6 px-5 py-3 rounded-xl text-[13px] font-bold" style={{ color: INK_SOFT, border: `1px solid ${INK}22` }}>← 처음으로</button>
        </div>
      )}

      {/* ═══════════ 제1장 ═══════════ */}
      {ch === "1" && (
      <>
      {/* ── 표지 ── */}
      <Cover />

      {/* ── 도입 인용 ── */}
      <Quote>
        {`"오늘의 ${name}님이 되기까지,\n${name}님은 어떤 선택들을\n거쳐 왔는지 살펴보겠습니다."`}
      </Quote>

      {/* ── 한자 디바이더 ── */}
      <HanjaDivider hanja="往事" sub="그해, 무슨 일이 있었을까" />

      {/* ── 삽화 ── */}
      <Illust src="/images/hero/hero-8.jpg" />

      {/* ── 인용 ── */}
      <Quote>
        {`"그럼 지난 시간의 운이\n어떻게 흘러왔는지\n함께 살펴볼게요."`}
      </Quote>

      {/* ── 본문: 힘들었던 시기 ── */}
      <section className="px-6 pt-2 pb-12">
        <Heading>{name}님 삶이 힘들 수밖에 없던 시기</Heading>
        <P>{c.hardSeason.intro}</P>
        <Callout>{c.hardSeason.callout}</Callout>
        {c.hardSeason.paragraphs.map((p, i) => (
          <P key={i}>{p}</P>
        ))}
      </section>

      {/* ── 한자 디바이더: 연유 ── */}
      <HanjaDivider hanja="緣由" sub="왜 힘들었던 걸까, 사주 속 숨어있는 이유" />

      {/* ── 삽화 ── */}
      <Illust src="/images/hero/hero-12.jpg" />

      {/* ── 인용 ── */}
      <Quote>
        {`"왜 ${name}님께\n힘든 일이 일어난 건지\n사주 속에 답이 있어요."`}
      </Quote>

      {/* ── 삽화 ── */}
      <Illust src="/images/hero/hero-7.jpg" />

      {/* ── 인용 (천간 강조) ── */}
      <div className="px-8 py-12 text-center">
        <p className="text-[18px] leading-[2]" style={{ color: INK, fontFamily: SERIF }}>
          &quot;그것은 {name}님의 일주가
          <br />
          <Term>{ilganHanja}({ilganLabel})</Term>이기 때문이에요.&quot;
        </p>
      </div>

      {/* ── 본문: 사주 속 원인 + 운 흐름 차트 ── */}
      <section className="px-6 pt-2 pb-4">
        <Heading>왜 힘들었던 걸까, 사주 속 숨어있는 이유</Heading>
        <P>{c.cause.intro}</P>
        <Callout>{c.cause.callout}</Callout>
        {c.cause.paragraphs.map((p, i) => (
          <P key={i}>{p}</P>
        ))}

        <RunFlowChart flow={c.cause.flow} />
      </section>

      {/* ── 인용 ── */}
      <Quote>
        {`"생각의 터널을 지나 비로소 단단한\n대지에 뿌리를 내리기 시작했네요."`}
      </Quote>

      {/* ── 한자 디바이더: 숙명 ── */}
      <HanjaDivider hanja="宿命" sub="반복되어 온 삶의 패턴" />

      {/* ── 삽화 ── */}
      <Illust src="/images/hero/hero-11.jpg" />

      {/* ── 인용 ── */}
      <Quote>
        {`"비슷한 일이\n자꾸 반복된다고\n느끼지 않으셨어요?"`}
      </Quote>

      {/* ── 본문: 반복되어 온 삶의 패턴 ── */}
      <section className="px-6 pt-2 pb-4">
        <Heading>반복되어 온 삶의 패턴</Heading>
        <P>{c.pattern.intro}</P>
        <Callout>{c.pattern.callout}</Callout>
        {c.pattern.paragraphs.map((p, i) => (
          <P key={i}>{p}</P>
        ))}

        <SummaryCard title="지난 흐름 요약" items={c.pattern.summary} />
      </section>

      {/* ── 삽화 ── */}
      <Illust src="/images/hero/hero-7.jpg" />

      {/* ── 마무리 인용 ── */}
      <Quote>
        {`"지나온 모든 발걸음이 ${name}님만의\n단단한 지혜가 되었음을\n믿어 드려요."`}
      </Quote>

      {/* ── 마무리 인용 (천간 강조) ── */}
      <div className="px-8 pb-10 text-center">
        <p className="text-[18px] leading-[2]" style={{ color: INK, fontFamily: SERIF }}>
          &quot;차가운 겨울 물속에서 견뎌낸
          <br />
          <Term>{ilganLabel}</Term>의 끈기가
          <br />
          이제 따뜻한 봄볕을 만나 싹을
          <br />
          틔울 준비를 마쳤네요.&quot;
        </p>
      </div>

      {/* ── 다음 장 네비게이션 ── */}
      <div className="px-6 pb-10">
        <button
          onClick={() => router.push(`/saju/jeongtong/report-preview?${id ? `id=${id}&` : ""}ch=2`)}
          className="w-full py-4 rounded-2xl font-bold text-[15px] text-white flex items-center justify-center gap-2 active:scale-95 transition-all"
          style={{ background: NAVY, boxShadow: `0 4px 16px ${NAVY}44` }}
        >
          <span>나는 어떤 사람일까</span>
          <span>→</span>
        </button>
      </div>
      </>
      )}
    </div>
  );
}
