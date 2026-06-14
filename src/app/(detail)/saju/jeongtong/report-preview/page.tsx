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
import { isChapterReady, CHAPTER_SECTIONS } from "@/lib/saju/report-content";
import { MyeongsikModalView } from "@/components/saju/MyeongsikModal";
import { ganCharImage, jiCharImage } from "@/lib/saju/char-image";
import { sipseongOfStem, sipseongOfBranch, unseongOf } from "@/lib/saju/sipseong-calc";

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
const GOLD = "#c2a23c";
const TAG_COLORS = ["#2d3a8c", "#b5891c", "#c9474f", "#3f8a52"];
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

// 대운 흐름표 (6장) — 명식 view.daeun 기반, 십성/운성 로컬 계산, 가로 스크롤
type FlowCol = { label: string; gz: string; active: boolean; yearStart?: number };
function FlowGrid({ title, sub, items, ilgan, mode }: { title: string; sub: string; items: FlowCol[]; ilgan: string; mode: "daeun" | "seun" }) {
  if (!items.length) return null;
  const COLW = 60, LW = 40;
  const gc = { gridTemplateColumns: `${LW}px repeat(${items.length}, ${COLW}px)` } as const;
  const lbl = (t: string) => <div className="flex items-center justify-center text-[10px] font-bold" style={{ color: MUTE }}>{t}</div>;
  const cellBg = (a: boolean) => (a ? `${MAROON}12` : "transparent");
  const sipTxt = (t: string, a: boolean) => <div className="py-1 text-center text-[11px] font-bold" style={{ color: a ? MAROON : INK_SOFT, background: cellBg(a) }}>{t}</div>;
  const img = (src: string, alt: string, a: boolean) => (
    <div className="py-0.5 flex items-center justify-center" style={{ background: cellBg(a) }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} style={{ width: 30, height: 30, objectFit: "contain" }} />
    </div>
  );
  return (
    <div className="rounded-2xl mb-5 overflow-hidden" style={{ background: WHITE, border: `1px solid ${INK}12` }}>
      <div className="px-4 pt-3.5 pb-2 flex items-baseline gap-2">
        <p className="text-[13px] font-black" style={{ color: INK }}>{title}</p>
        <p className="text-[11px]" style={{ color: MUTE }}>{sub}</p>
      </div>
      <div className="overflow-x-auto pb-2">
        <div style={{ minWidth: LW + items.length * COLW }}>
          {/* 헤더 (대운=연도+나이 / 세운=연도) */}
          <div className="grid" style={gc}>
            <div />
            {items.map((d, i) => (
              <div key={i} className="py-1.5 text-center" style={{ background: cellBg(d.active) }}>
                {mode === "daeun" ? (
                  <>
                    <div className="text-[10px]" style={{ color: MUTE }}>{d.yearStart || ""}</div>
                    <div className="text-[12px] font-black" style={{ color: d.active ? MAROON : INK }}>{d.label}세</div>
                  </>
                ) : (
                  <div className="text-[12px] font-black py-1" style={{ color: d.active ? MAROON : INK }}>{d.label}</div>
                )}
              </div>
            ))}
          </div>
          {[
            { l: "십성", r: (d: FlowCol) => sipTxt(sipseongOfStem(ilgan, d.gz[0]), d.active) },
            { l: "천간", r: (d: FlowCol) => img(ganCharImage(d.gz[0]), d.gz[0], d.active) },
            { l: "지지", r: (d: FlowCol) => img(jiCharImage(d.gz[1]), d.gz[1], d.active) },
            { l: "십성", r: (d: FlowCol) => sipTxt(sipseongOfBranch(ilgan, d.gz[1]), d.active) },
            { l: "운성", r: (d: FlowCol) => sipTxt(unseongOf(ilgan, d.gz[1]), d.active) },
          ].map((row, ri) => (
            <div key={ri} className="grid" style={{ ...gc, borderTop: `1px solid ${INK}0c` }}>
              {lbl(row.l)}
              {items.map((d, i) => <div key={i}>{row.r(d)}</div>)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 대운 흐름표 (6장) — 명식 view.daeun 기반
function DaeunTable({ view }: { view: MyeongsikView | null }) {
  const daeun = view?.daeun ?? [];
  if (!daeun.length) return null;
  return <FlowGrid title="대운 흐름표" sub={`대운 역행 · ${daeun[0]?.label}세 시작`} items={daeun} ilgan={(view?.ilgan ?? "乙")[0]} mode="daeun" />;
}

// 세운 흐름표 (6장) — 현재 연도부터 표시
function SeunTable({ view }: { view: MyeongsikView | null }) {
  const all = view?.seun ?? [];
  const ai = all.findIndex((s) => s.active);
  const items = ai >= 0 ? all.slice(ai) : all;
  if (!items.length) return null;
  return <FlowGrid title="세운 흐름표" sub="해마다의 한 해 리듬" items={items} ilgan={(view?.ilgan ?? "乙")[0]} mode="seun" />;
}

// 앞으로 10년 운세 흐름 — 라인 차트 (세운 flow 기반)
function TrendChart({ flow }: { flow: { year: number; score: number }[] }) {
  const data = flow.length ? flow : [{ year: new Date().getFullYear(), score: 50 }];
  const W = 320, H = 150, padX = 24, padTop = 18, padBot = 28;
  const n = data.length;
  const x = (i: number) => padX + ((W - padX * 2) * i) / Math.max(1, n - 1);
  const y = (v: number) => padTop + (H - padTop - padBot) * (1 - Math.min(100, Math.max(0, v)) / 100);
  const pts = data.map((d, i) => `${x(i)},${y(d.score)}`).join(" ");
  const area = `${padX},${y(0)} ${pts} ${x(n - 1)},${y(0)}`;
  const peakI = data.reduce((m, d, i) => (d.score > data[m].score ? i : m), 0);
  return (
    <div className="rounded-2xl p-5 mt-2 mb-5" style={{ background: WHITE, border: `1px solid ${INK}12`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      <h3 className="text-[15px] font-black flex items-center gap-1.5 mb-1" style={{ color: INK }}>
        <span style={{ color: GOLD }}>📈</span> 앞으로 10년 운세 흐름
      </h3>
      <p className="text-[12px] mb-3" style={{ color: MUTE }}>대운의 큰 방향과 해마다 체감되는 상승 구간을 함께 보여줍니다.</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GOLD} stopOpacity="0.22" />
            <stop offset="100%" stopColor={GOLD} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#trendArea)" />
        <polyline points={pts} fill="none" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => (
          <circle key={i} cx={x(i)} cy={y(d.score)} r={i === peakI ? 5 : 3.5} fill={i === peakI ? GOLD : WHITE} stroke={GOLD} strokeWidth="2" />
        ))}
        {data.map((d, i) => (
          <text key={i} x={x(i)} y={H - 12} fontSize="8.5" fill={INK_SOFT} textAnchor="middle">{d.year}</text>
        ))}
      </svg>
      <p className="text-center text-[11px] mt-1" style={{ color: MUTE }}>점이 높은 해일수록 그 해의 기운이 강해요.</p>
    </div>
  );
}

// 운이 풀리는 결정적 시점 박스 (6장 開運)
function PeakBox({ peak }: { peak: { title: string; when: string; todo: string } }) {
  return (
    <div className="rounded-2xl p-5 mb-4" style={{ background: `linear-gradient(135deg, ${MAROON}0e, ${GOLD}14)`, border: `1px solid ${MAROON}22` }}>
      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: `${MAROON}16`, color: MAROON }}>중요한 전환 시점</span>
      <p className="mt-3 text-[19px] font-black leading-snug" style={{ color: INK, fontFamily: SERIF }}>{peak.title}</p>
      <div className="mt-4 space-y-3">
        <div>
          <p className="text-[11px] font-bold mb-0.5" style={{ color: MAROON }}>핵심 시기</p>
          <p className="text-[13.5px]" style={{ color: INK_SOFT }}>{peak.when}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold mb-0.5" style={{ color: MAROON }}>해야 할 일</p>
          <p className="text-[13.5px]" style={{ color: INK_SOFT }}>{peak.todo}</p>
        </div>
      </div>
    </div>
  );
}

// 영역별/부위별 운세 강도 막대 차트 (6·9장 공용)
function DomainBars({ bars, title = "영역별 운세 강도", sub }: { bars: { label: string; value: number }[]; title?: string; sub?: string }) {
  const src = bars.length ? bars : [{ label: "재물", value: 50 }];
  return (
    <div className="rounded-2xl p-5 mb-5" style={{ background: WHITE, border: `1px solid ${INK}12`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      <h3 className="text-[15px] font-black flex items-center gap-1.5" style={{ color: INK }}>
        <span style={{ color: GOLD }}>📊</span> {title}
      </h3>
      {sub ? <p className="text-[12px] mt-1 mb-4" style={{ color: MUTE }}>{sub}</p> : <div className="mb-4" />}
      <div className="flex justify-between gap-2.5" style={{ height: 160 }}>
        {src.map((b, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end items-center">
            <span className="text-[12px] font-black mb-1" style={{ color: INK }}>{b.value}%</span>
            <div className="w-full rounded-t-lg" style={{ height: `${Math.min(100, Math.max(0, b.value))}%`, background: `linear-gradient(to top, ${GOLD}, ${GOLD}55)`, minHeight: 6 }} />
          </div>
        ))}
      </div>
      <div className="flex justify-between gap-2.5 mt-2">
        {src.map((b, i) => (
          <div key={i} className="flex-1 text-center text-[11.5px] font-bold" style={{ color: INK_SOFT }}>{b.label}</div>
        ))}
      </div>
    </div>
  );
}

// 향후 5년 재물운 막대 차트 (7장) — 금액 라벨 + 상대 높이
function WealthBars({ title, sub, bars }: { title: string; sub: string; bars: { year: number; amount: string; value: number }[] }) {
  const src = bars.length ? bars : [{ year: new Date().getFullYear(), amount: "-", value: 50 }];
  const max = Math.max(...src.map((b) => b.value), 1);
  return (
    <div className="rounded-2xl p-5 mb-5" style={{ background: WHITE, border: `1px solid ${INK}12`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      <h3 className="text-[15px] font-black mb-1 flex items-center gap-1.5" style={{ color: INK }}>
        <span style={{ color: GOLD }}>📊</span> {title}
      </h3>
      <p className="text-[12px] mb-4" style={{ color: MUTE }}>{sub}</p>
      <div className="flex justify-between gap-2" style={{ height: 170 }}>
        {src.map((b, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end items-center">
            <span className="text-[11.5px] font-black mb-1" style={{ color: MAROON }}>{b.amount}</span>
            <div className="w-full rounded-t-lg" style={{ height: `${(b.value / max) * 100}%`, background: `linear-gradient(to top, ${GOLD}, ${GOLD}44)`, minHeight: 6 }} />
          </div>
        ))}
      </div>
      <div className="flex justify-between gap-2 mt-2">
        {src.map((b, i) => (
          <div key={i} className="flex-1 text-center text-[11.5px] font-bold" style={{ color: INK_SOFT }}>{b.year}</div>
        ))}
      </div>
    </div>
  );
}

// 내게 맞는 직업 TOP 3 (7장)
function JobTop3({ jobs }: { jobs: { title: string; desc: string }[] }) {
  if (!jobs.length) return null;
  return (
    <div className="rounded-2xl p-5 mb-4" style={{ background: WHITE, border: `1px solid ${INK}12`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      <h3 className="text-[15px] font-black mb-4" style={{ color: INK }}>내게 맞는 직업 TOP 3</h3>
      <div className="space-y-4">
        {jobs.slice(0, 3).map((j, i) => (
          <div key={i} className="flex gap-3 items-start">
            <span className="flex-shrink-0 flex items-center justify-center text-[13px] font-black text-white rounded-full" style={{ width: 26, height: 26, background: NAVY, opacity: 1 - i * 0.18 }}>{i + 1}</span>
            <div>
              <p className="text-[14px] font-bold" style={{ color: INK }}>{j.title}</p>
              <p className="text-[12.5px] leading-relaxed mt-0.5" style={{ color: MUTE }}>{j.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 직장인 vs 사업가 양분 게이지 (7장)
function SplitGauge({ split }: { split: { leftLabel: string; left: number; rightLabel: string; right: number; leftDesc: string; rightDesc: string } }) {
  return (
    <div className="rounded-2xl p-5 mb-5" style={{ background: WHITE, border: `1px solid ${INK}12`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      <div className="flex justify-between items-end mb-2.5">
        <div>
          <p className="text-[11px] font-bold mb-0.5" style={{ color: MUTE }}>● {split.leftLabel}</p>
          <p className="text-[22px] font-black leading-none" style={{ color: INK_SOFT }}>{split.left}%</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-bold mb-0.5" style={{ color: NAVY }}>{split.rightLabel} ●</p>
          <p className="text-[22px] font-black leading-none" style={{ color: NAVY }}>{split.right}%</p>
        </div>
      </div>
      <div className="flex rounded-full overflow-hidden" style={{ height: 10 }}>
        <div style={{ width: `${split.left}%`, background: `${INK}26` }} />
        <div style={{ width: `${split.right}%`, background: NAVY }} />
      </div>
      <div className="flex justify-between gap-4 mt-2.5">
        <p className="text-[11px] flex-1" style={{ color: MUTE }}>{split.leftDesc}</p>
        <p className="text-[11px] flex-1 text-right" style={{ color: INK_SOFT }}>{split.rightDesc}</p>
      </div>
    </div>
  );
}

// 앞으로 1년 연애 흐름 — 월별 라인 차트 (8장)
function LoveTrendChart({ flow }: { flow: { label: string; score: number }[] }) {
  const data = flow.length ? flow : [{ label: "-", score: 50 }];
  const W = 320, H = 150, padX = 24, padTop = 18, padBot = 28;
  const n = data.length;
  const x = (i: number) => padX + ((W - padX * 2) * i) / Math.max(1, n - 1);
  const y = (v: number) => padTop + (H - padTop - padBot) * (1 - Math.min(100, Math.max(0, v)) / 100);
  const pts = data.map((d, i) => `${x(i)},${y(d.score)}`).join(" ");
  const area = `${padX},${y(0)} ${pts} ${x(n - 1)},${y(0)}`;
  const peakI = data.reduce((m, d, i) => (d.score > data[m].score ? i : m), 0);
  return (
    <div className="rounded-2xl p-5 mb-5" style={{ background: WHITE, border: `1px solid ${INK}12`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      <h3 className="text-[15px] font-black flex items-center gap-1.5 mb-1" style={{ color: INK }}>
        <span style={{ color: GOLD }}>📈</span> 앞으로 1년 연애 흐름
      </h3>
      <p className="text-[12px] mb-3" style={{ color: MUTE }}>인연의 기운이 강해지는 달이에요.</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="loveArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GOLD} stopOpacity="0.22" />
            <stop offset="100%" stopColor={GOLD} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#loveArea)" />
        <polyline points={pts} fill="none" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => (
          <circle key={i} cx={x(i)} cy={y(d.score)} r={i === peakI ? 5 : 3.5} fill={i === peakI ? GOLD : WHITE} stroke={GOLD} strokeWidth="2" />
        ))}
        {data.map((d, i) => (
          <text key={i} x={x(i)} y={H - 12} fontSize="8.5" fill={INK_SOFT} textAnchor="middle">{d.label}</text>
        ))}
      </svg>
      <p className="text-center text-[11px] mt-1" style={{ color: MUTE }}>점이 높은 달일수록 인연의 기운이 강해요.</p>
    </div>
  );
}

// 조심할 시기의 함정 박스 (11장)
function TrapBox({ trap }: { trap: { title: string; desc: string; items: { title: string; desc: string }[] } }) {
  return (
    <div className="rounded-2xl p-5 mb-4" style={{ background: `${WARN}08`, border: `1px solid ${WARN}33` }}>
      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: `${WARN}16`, color: WARN }}>조심할 시기의 함정</span>
      <p className="mt-3 text-[17px] font-black leading-snug" style={{ color: INK }}>{trap.title}</p>
      <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: INK_SOFT }}>{trap.desc}</p>
      <div className="mt-3">
        {trap.items.map((it, i) => (
          <div key={i} className="flex gap-2.5 items-start py-3" style={{ borderTop: `1px solid ${WARN}1c` }}>
            <span className="flex-shrink-0 text-[12px]" style={{ color: WARN, marginTop: 1 }}>▲</span>
            <div>
              <p className="text-[13.5px] font-bold" style={{ color: INK }}>{it.title}</p>
              <p className="text-[12.5px] leading-relaxed mt-0.5" style={{ color: MUTE }}>{it.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 삼재 연차별 주의점 (11장)
function SamjaeYearly({ items }: { items: { year: string; phase: string; action: string }[] }) {
  return (
    <div className="rounded-2xl p-5 mb-5" style={{ background: WHITE, border: `1px solid ${INK}12`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      <h3 className="text-[15px] font-black flex items-center gap-1.5" style={{ color: INK }}>
        <span style={{ color: WARN }}>⚠</span> 삼재 연차별 주의점
      </h3>
      <p className="text-[12px] mt-1 mb-3" style={{ color: MUTE }}>세 해를 한눈에 비교해, 해마다 가장 조심할 일을 정리했어요.</p>
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-3 py-3" style={{ borderTop: `1px solid ${INK}0c` }}>
          <span className="flex-shrink-0 rounded-full" style={{ width: 8, height: 8, background: WARN }} />
          <div className="flex-1">
            <p className="text-[13.5px] font-bold" style={{ color: INK }}>{it.year} · {it.phase}</p>
            <p className="text-[12.5px] mt-0.5" style={{ color: MUTE }}>{it.action}</p>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md" style={{ background: `${WARN}14`, color: WARN }}>경고</span>
        </div>
      ))}
    </div>
  );
}

// 오행에 따른 건강관리 카드 (9장)
function HealthCareCard({ element, tips }: { element: string; tips: { label: string; title: string; desc: string }[] }) {
  return (
    <div className="rounded-2xl p-5 mb-5" style={{ background: WHITE, border: `1px solid ${INK}12`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center gap-3 mb-4">
        <span className="flex items-center justify-center rounded-full text-[16px]" style={{ width: 38, height: 38, background: `${GOLD}1c`, color: GOLD }}>✦</span>
        <div>
          <p className="text-[11px] font-bold" style={{ color: MUTE }}>보강하면 좋은 기운</p>
          <p className="text-[18px] font-black" style={{ color: INK }}>{element}</p>
        </div>
      </div>
      <div>
        {tips.map((t, i) => (
          <div key={i} className="flex gap-3 items-start py-3" style={{ borderTop: `1px solid ${INK}0c` }}>
            <span className="flex-shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-md" style={{ background: `${MAROON}10`, color: MAROON, minWidth: 44, textAlign: "center" }}>{t.label}</span>
            <div>
              <p className="text-[13.5px] font-bold" style={{ color: INK }}>{t.title}</p>
              <p className="text-[12.5px] leading-relaxed mt-0.5" style={{ color: MUTE }}>{t.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 인물 카드 (배우자 8장 · 귀인 10장 공용)
function PersonCard({ title, label, photo, card }: { title?: string; label: string; photo: string; card: { gender: string; ageBand: string; desc: string; mbti: string; height: string; personality: string; jobField: string; tags: string[] } }) {
  const spec = (label: string, val: string) => (
    <div>
      <p className="text-[11px] font-bold mb-0.5" style={{ color: MAROON }}>{label}</p>
      <p className="text-[13px]" style={{ color: INK_SOFT }}>{val}</p>
    </div>
  );
  return (
    <div className="rounded-2xl p-4 mb-4" style={{ background: PINK_PALE, border: `1px solid ${INK}10` }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="flex items-center justify-center rounded-full text-[13px]" style={{ width: 26, height: 26, background: WHITE, color: MAROON }}>👤</span>
        <div>
          {title && <p className="text-[13px] font-black leading-tight" style={{ color: INK }}>{title}</p>}
          <p className="text-[12px]" style={{ color: MUTE }}>{label}</p>
        </div>
      </div>
      <div className="rounded-xl overflow-hidden" style={{ background: WHITE, border: `1px solid ${INK}0e` }}>
        <div className="relative" style={{ height: 200 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <span className="absolute top-3 left-3 text-[11px] font-bold px-2 py-0.5 rounded-md text-white" style={{ background: MAROON }}>{card.gender}</span>
          <span className="absolute top-3 right-3 text-[11px] font-bold px-2 py-0.5 rounded-md" style={{ background: WHITE, color: INK }}>{card.ageBand}</span>
        </div>
        <div className="p-4">
          <p className="text-[13.5px] leading-relaxed mb-3" style={{ color: INK_SOFT }}>{card.desc}</p>
          <div className="grid grid-cols-2 gap-3 pt-3" style={{ borderTop: `1px solid ${INK}0c` }}>
            {spec("MBTI", card.mbti)}
            {spec("키", card.height)}
          </div>
          <div className="mt-3">{spec("성격", card.personality)}</div>
          <div className="mt-3">{spec("직업계열", card.jobField)}</div>
          <div className="flex flex-wrap gap-1.5 mt-4">
            {card.tags.map((t, i) => (
              <span key={i} className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: `${MAROON}10`, color: MAROON }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
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
  "5": "제5장 · 세상을 대하는 나만의 방식",
  "6": "제6장 · 앞으로 10년, 어떻게 흘러갈까",
  "7": "제7장 · 재물·직업운 정밀풀이",
  "8": "제8장 · 연애·결혼운 정밀풀이",
  "9": "제9장 · 건강운 정밀풀이",
  "10": "제10장 · 나를 도와줄 귀인은 누구일까",
  "11": "제11장 · 반드시 조심해야 할 시기는 언제일까",
  "12": "제12장 · 반드시 조심해야 할 악인은 누구일까",
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
  rarity: {
    intro: "사주가 지닌 희소성과 특별함에 대해 명리학적인 근거를 들어 자세히 풀어드릴게요.",
    callout: "건록 일주라는 강력한 주체성의 기둥 위에, 하늘의 보살핌을 뜻하는 천을귀인이 중첩된 귀한 명식이에요.",
    paragraphs: [
      "가장 귀한 글자들이 월지와 시지에 나란히 자리 잡은 구성은 매우 드물답니다.",
      "이 귀하고 단단한 사주의 그릇을 믿고 주체적으로 삶을 이끌어갈 때 특별한 복록은 온전히 발현될 거예요.",
    ],
    grade: "A등급",
    percentile: 2.5,
  },
  special: {
    tags: [
      { label: "乙卯", sub: "을묘일주 × 도화살" },
      { label: "巳 ↔ 申", sub: "사신육합" },
      { label: "卯 ↔ 申", sub: "묘신원진" },
    ],
    items: [
      { text: "화초 같은 일주에 도화살(타고난 인기)까지 더해졌어요. 강한 기질이 또렷하게 드러나는 사주예요.", hi: "어느 자리에서든 시선을 독차지하게 해줘요." },
      { text: "두 글자가 단단히 묶여, 인연과 결속이 깊어지는 자리예요.", hi: "사람과 깊이 엮이며 든든한 인연을 만들어내게 해줘요." },
      { text: "서로 밀어내는 기운이 함께 돌아, 예민함과 애증이 공존하는 자리예요.", hi: "예민한 촉으로 남들이 놓치는 신호를 먼저 알아채게 해줘요." },
    ],
  },
  balance: {
    intro: "세상을 살아갈 때 나만의 독립적인 주체성을 지키는 힘과 타인과 함께 발맞추는 힘, 이 둘 사이에서 어떻게 균형을 잡고 계신지 살펴보겠습니다.",
    callout: "기본적으로 스스로 결정하고 책임지는 독립적인 삶에 더 큰 가치를 두면서도, 사회적 관계 속에서 협력하는 법도 늘 알고 계시네요.",
    paragraphs: [
      "이 두 가지 성향이 어떻게 조화를 이루며 삶을 이끌어가는지, 아래 스펙트럼을 통해 구체적인 모습을 보여드릴게요.",
      "비견·겁재의 단단한 주체성이 중심을 잡고 있어, 나만의 기준을 가지고 세상을 마주할 때 가장 편안함을 느끼시는 분이에요.",
      "남에게 의지하기보다 스스로 판단하고 책임지는 주체성이 강하시며, 그 독립성 위에서 본인의 능력이 극대화되는 성장을 이루어 가시네요.",
    ],
    spectrum: { label: "혼자 힘으로 살아가는 나", value: 30 },
  },
  answer: {
    intro: "삶의 비탈과 갈등을 마주칠 때, 그 해답을 어디에서 찾을 수 있는지 짚어드릴게요.",
    callout: "삶의 해답은 스스로의 강한 주체성(비견)을 잃지 않으면서, 타인의 조언과 사회적 규칙(정관 등)을 유연하게 받아들이는 화합의 지혜에 있어요.",
    paragraphs: [
      "혼자보다는 패턴을 찾아가는 협력 안에서 본인의 주체성을 스스로 강화시키는 길이 더 단단하고 빠르게 열려요.",
      "대중 속의 예법과 규율을 내 것으로 소화해 받쳐 쌓을 때, 나를 가두는 굴레가 아닌 나를 지켜주는 단단한 울타리가 되어 줍니다.",
      "나를 지키는 단단한 뿌리 위에 타인과 소통하는 가지를 뻗을 때, 가장 크고 웅장하게 자리 잡는 삶을 이루게 되실 거예요.",
    ],
  },
  daeFlow: {
    intro: "앞으로 10년간 삶을 지배할 거대한 대운의 흐름과 인생의 계절 변화를 분석해 드릴게요.",
    callout: "현재 34세부터 43세까지 이어지는 임신(壬申) 대운을 지나고 있으며, 이는 인생의 큰 기둥이 잡히는 안정적인 상승기예요.",
    paragraphs: [
      "대운에서 들어온 정인(壬)과 정관(申)은 사회적인 명예와 문서운, 그리고 안정적인 직장과 지위를 보장해 주는 아주 긍정적인 기운이에요.",
      "지난 대운의 차갑고 불안정했던 물 기운(편인)과 달리, 이번 대운은 용신인 금(金) 기운이 든든한 뿌리가 되어 줍니다.",
      "이 시기에는 직장에서의 승진이나 이직, 혹은 내 집 마련이나 결혼 등 인생의 굵직한 현실적 목표들을 성취하기에 아주 유리해요.",
      "억지로 판을 흔들기보다 현재 주어진 역할에 책임을 다하며 내실을 다질 때 사회적 지위가 자연스럽게 격상되는 흐름이에요.",
      "이 든든한 대운의 울타리를 믿고 조급함을 내려놓은 채 차근차근 나만의 성을 쌓아 올리시기를 권해 드려요.",
    ],
  },
  seun: {
    intro: "대운이라는 큰 프레임 안에서 해마다 찾아오는 세운의 구체적인 변화와 흐름을 짚어드릴게요.",
    callout: "현재 지나고 있는 2026년 병오(丙午)년은 상관의 기운이 강해져 창의적인 아이디어가 샘솟고 변화를 꾀하고 싶은 욕구가 커지는 해예요.",
    paragraphs: [
      "2027년 정미(丁未)년에는 식신과 편재가 만나 재물적인 성취를 위한 구체적인 행동과 투자의 발판을 마련하게 될 것으로 보여요.",
      "그리고 대망의 2028년 무신(戊申)년에는 희신인 토(土)와 용신인 금(金)이 완벽하게 조화를 이루며 들어와 운의 정점을 찍게 됩니다.",
      "이 시기에는 그동안 준비해 온 일들이 큰 재물과 확실한 명예로 돌아오며 인생의 큰 도약을 이루는 최고의 기회를 맞이해요.",
      "이어지는 2029년 기유(己酉)년까지도 강한 재물과 관성의 기운이 유지되므로 안정적인 자산 구축과 커리어 확장이 가능해요.",
      "이처럼 향후 수년간은 매우 유리한 기운들이 차례로 들어오니 두려움 없이 기회를 포착할 준비를 하셔야 해요.",
    ],
    flow: [
      { year: 2026, score: 62 }, { year: 2027, score: 74 }, { year: 2028, score: 92 },
      { year: 2029, score: 88 }, { year: 2030, score: 70 }, { year: 2031, score: 64 },
      { year: 2032, score: 58 }, { year: 2033, score: 60 },
    ],
  },
  openLuck: {
    intro: "막힌 운이 본격적으로 풀리고 인생의 황금기가 시작되는 결정적인 타이밍을 짚어드릴게요.",
    callout: "운이 가장 강력하게 열리는 시기는 만 38세가 되는 2028년 무신(戊申)년으로, 재물과 관성의 기운이 동시에 폭발하는 때예요.",
    paragraphs: [
      "이때는 사주 원국의 사신합(巳-申)이 활성화되면서 사회적인 명예와 계약이 맺어져 성사되고 큰돈이 들어오는 통로가 열려요.",
      "그동안 머릿속으로만 구상해 왔던 기획이나 사업 아이템이 있다면 이 시기에 세상에 내놓을 때 가장 큰 성공을 거둘 수 있어요.",
      "또한 직장인이라면 파격적인 승진이나 좋은 조건의 이직 제안을 받게 되며 사회적 위상이 한 단계 격상되는 경험을 하게 돼요.",
      "망설이거나 주저하지 말고 주체적으로 판을 주도해 나갈 때 이 강력한 운의 에너지를 온전히 내 것으로 만들 수 있답니다.",
      "이 눈부신 전환점을 위해 지금부터 실력을 갈고닦으며 내실을 다져두는 것이 가장 현명한 준비임을 잊지 마세요.",
    ],
    peak: { title: "2028년 무신(戊申)년의 강력한 재관(財官) 활성화", when: "용신과 희신이 함께 들어오는 때", todo: "망설이지 말고 주체적으로 도전하세요" },
  },
  domains: {
    intro: "사주 데이터를 바탕으로 앞으로 펼쳐질 10년 동안의 주요 인생 영역별 운세 강도를 종합적으로 비교해 드릴게요.",
    paragraphs: [
      "돈, 일, 연애, 결혼, 건강이라는 다섯 가지 영역이 서로 어떻게 위계적으로 얽혀 있으며 어디에 무게중심을 두어야 할지 한눈에 보여드립니다.",
      "이 차트를 통해 앞으로의 삶을 기획하고 에너지를 분배하는 현명한 가이드라인으로 삼아 보시기를 권해 드려요.",
    ],
    bars: [
      { label: "재물", value: 85 }, { label: "직업", value: 90 }, { label: "애정", value: 75 },
      { label: "결혼", value: 80 }, { label: "건강", value: 70 },
    ],
  },
  wealthTime: {
    intro: "선우님의 재물운은 30대 후반에서 40대 초반으로 갈수록 점차 단단해지고 풍요로워지는 흐름을 보여줍니다.",
    callout: "특히 2028년(무신년)과 2029년(기유년)은 선우님의 용신과 희신인 쇠와 흙의 기운이 강력하게 들어와 큰돈을 만질 수 있는 최고의 기회예요.",
    paragraphs: [
      "이 시기에는 자산 가치가 크게 상승하거나 투자했던 곳에서 예상치 못한 큰 수익이 돌아오는 기쁨을 누릴 수 있어요.",
      "다만 상관의 기운이 과해지는 해에는 충동적인 투기나 무리한 지출로 인해 재물이 새어나갈 수 있으니 주의해야 해요.",
      "장기적이고 안정적인 자산 관리 원칙을 세우고 이를 묵묵히 실천해 나갈 때 선우님의 재물 그릇은 가득 채워질 것입니다.",
    ],
    bars: [
      { year: 2026, amount: "1억 5천", value: 15 }, { year: 2027, amount: "2억 5천", value: 25 },
      { year: 2028, amount: "6억", value: 60 }, { year: 2029, amount: "5억", value: 50 }, { year: 2030, amount: "2억", value: 20 },
    ],
  },
  jobFit: {
    intro: "선우님은 뛰어난 기획력과 독창적인 아이디어를 바탕으로 스스로 판을 짜고 조율하는 일에서 가장 큰 성과를 내는 적성을 가지고 있어요.",
    callout: "남들이 생각하지 못한 틈새시장을 직관적으로 포착하고 이를 나만의 전문적인 지식과 기술로 브랜드화하는 능력이 매우 탁월하네요.",
    paragraphs: [
      "단순히 지시받은 업무를 반복하는 환경에서는 쉽게 지치고 갈증을 느끼니 주도적인 권한이 주어지는 분야에서 일하셔야 해요.",
      "선우님만의 대체 불가능한 전문성을 끊임없이 갈고닦아 세상에 증명해 보일 때 직업적인 명예와 성취가 함께 따를 것입니다.",
    ],
    jobs: [
      { title: "전문 기획 및 전략 컨설턴트", desc: "독창적인 아이디어와 분석력으로 프로젝트를 설계하고 조율하는 역할이 제격이에요." },
      { title: "IT 및 크리에이티브 디렉터", desc: "상관의 표현력을 살려 트렌디한 콘텐츠나 기술을 기획하고 이끄는 분야에 강해요." },
      { title: "전문 자격 기반의 독립 사업가", desc: "세무, 노무, 기술 등 자신만의 전문 라이선스를 활용한 독립적인 비즈니스가 잘 맞아요." },
    ],
  },
  jobType: {
    intro: "선우님은 조직 내에서 능력을 인정받는 직장인의 길도 좋지만, 궁극적으로는 혼자 결정권을 쥐고 주도하는 독립적인 사업이 성향에 훨씬 강해요.",
    callout: "사주에 비견과 상관의 힘이 강하게 자리 잡고 있어 누군가의 통제를 받기보다 내 뜻대로 비즈니스를 이끌어갈 때 에너지가 살아납니다.",
    paragraphs: [
      "직장 생활을 하더라도 독자적인 프로젝트를 맡아 자유롭게 기획할 수 있는 환경이 주어져야 답답함을 느끼지 않고 롱런할 수 있어요.",
      "장기적으로는 자신만의 전문 자격이나 기술을 바탕으로 한 1인 기업이나 독립적인 형태의 사업을 구상해 보시는 것을 적극 추천해 드려요.",
    ],
    split: { leftLabel: "직장인 팔자", left: 40, rightLabel: "사업가 팔자", right: 60, leftDesc: "안정적이지만 답답함을 느끼기 쉬워요", rightDesc: "주도적으로 판을 짤 때 성과가 극대화돼요" },
  },
  invest: {
    intro: "선우님에게 가장 잘 맞는 재테크 방법은 단기적인 주식이나 가상화폐 같은 투기성 투자보다는 실물 자산에 기반한 안정적인 투자예요.",
    callout: "흙(土)과 쇠(金)의 기운이 재물과 안정을 뜻하므로 부동산이나 장기 채권, 혹은 우량주 중심의 장기 묻어두기식 투자가 가장 안전해요.",
    paragraphs: [
      "상관의 충동적인 기운이 발동할 때 귀가 얇아져 남들의 말만 믿고 섣불리 큰돈을 움직였다가는 큰 손실을 보기 쉬우니 경계해야 합니다.",
      "나만의 철저한 분석과 이성적인 기준을 바탕으로 포트폴리오를 구성하고 흔들림 없이 장기적으로 굴려 갈 때 큰 부를 이룰 수 있어요.",
    ],
  },
  loveStyle: {
    intro: "선우님은 연애를 할 때 상대방에게 매우 다정하고 세심한 배려를 아끼지 않는 따뜻한 사랑꾼의 면모를 지니고 있어요.",
    callout: "상관의 풍부한 표현력 덕분에 연인에게 감동을 주는 이벤트를 하거나 예쁜 말로 마음을 사로잡는 능력이 매우 뛰어나시네요.",
    paragraphs: [
      "하지만 동시에 나만의 사생활과 독립적인 영역을 침범받는 것을 극도로 싫어하여 은근히 까다로운 면도 가지고 있답니다.",
      "겉으로는 다 맞춰주는 것처럼 보여도 내면에는 확고한 고집과 선이 있어 상대방이 이를 넘어서면 마음의 문을 닫아버리기도 해요.",
      "서로의 독립성을 존중해 주면서도 정서적인 깊은 교감을 나눌 수 있는 성숙한 연애를 지향하고 갈망하는 스타일이에요.",
    ],
  },
  loveFlow: {
    intro: "앞으로 1년 동안 선우님에게 찾아올 연애와 인연의 흐름은 하반기로 갈수록 점차 긍정적이고 강하게 활성화되는 양상을 보여줍니다.",
    callout: "특히 2026년 가을철에는 선우님의 매력을 돋보이게 하는 기운과 용신인 쇠의 기운이 함께 들어와 마음에 쏙 드는 인연을 만날 확률이 매우 높아요.",
    flow: [
      { label: "6월", score: 55 }, { label: "7월", score: 60 }, { label: "8월", score: 78 }, { label: "9월", score: 88 },
      { label: "10월", score: 72 }, { label: "11월", score: 62 }, { label: "12월", score: 56 }, { label: "1월", score: 60 },
    ],
    peakCallout: "연애운의 흐름이 가장 정점에 달하는 달은 2026년 8월(병신월)과 9월(정유월)로, 이 시기에 운명의 상대가 나타날 가능성이 매우 큽니다.",
    paragraphs: [
      "이 달에는 선우님의 매력(도화살)이 극대화되고 이성을 끌어당기는 관성의 기운이 강해져 자연스럽게 연인 관계로 발전하기 쉬워요.",
      "평소 가보고 싶었던 문화 공간이나 전문적인 배움이 있는 장소에서 자연스럽게 대화가 통하는 사람을 만나게 될 것으로 보여요.",
    ],
  },
  spouse: {
    intro: "선우님의 사주에 예정된 미래의 배우자는 매우 단정하고 이지적인 분위기를 풍기며 자기 일에 대한 책임감이 아주 강한 사람이에요.",
    callout: "차분하고 현실적인 성격으로 선우님이 감정적으로 흔들릴 때 든든하게 중심을 잡아주고 올바른 방향을 제시해 주는 멘토 같은 존재네요.",
    paragraphs: [
      "예의 바르고 상식이 통하는 사람이며, 겉은 부드러워 보이지만 내면은 누구보다 단단하고 굳건한 심지를 가지고 있답니다.",
      "서로의 전문성을 존중해 주며 동반자로서 함께 성장해 나갈 수 있는 가장 이상적이고 든든한 파트너가 되어줄 사람이에요.",
    ],
    card: {
      gender: "여성",
      ageBand: "30대 초반",
      desc: "단정하고 이지적인 분위기를 풍기며, 자기 일에 대한 자부심과 책임감이 강한 여성이에요. 예의 바르고 차분한 성격이지만 내면은 매우 단단해요.",
      mbti: "ISTJ",
      height: "163cm 내외",
      personality: "차분하고 현실적이며 신뢰감을 주는 성격",
      jobField: "금융, 공공기관, 전문 사무직",
      tags: ["이지적인", "책임감 있는", "단정한 외모", "차분한 성격", "공무원/대기업", "자기관리 철저"],
    },
  },
  marriage: {
    intro: "선우님과 미래 배우자와의 결혼 생활은 서로의 독립적인 공간과 시간을 존중해 줄 때 가장 오랫동안 행복하게 유지될 수 있어요.",
    callout: "사주에 있는 묘신원진의 작용으로 인해 사소한 말 한마디에 오해나 서운함이 쌓이기 쉬우니 대화할 때는 늘 이성적이고 차분해야 해요.",
    paragraphs: [
      "감정적으로 욱해서 쏘아붙이기보다 \"내가 이런 부분에서 서운했어\"라고 객관적인 사실을 바탕으로 소통하는 훈련이 필요하답니다.",
      "결혼은 2028년(무신년)에 구체적인 결실을 맺을 가능성이 가장 높으며, 결혼을 통해 선우님의 인생 안정감이 비약적으로 상승할 거예요.",
    ],
  },
  bodyWeak: {
    intro: "선우님의 사주에서 건강 관리를 위해 가장 먼저 보살피고 신경 쓰셔야 할 부위는 바로 호흡기와 관절 계통이에요.",
    callout: "사주에 나무의 기운이 너무 강해지면 상대적으로 쇠(金)의 기운이 억눌려 뼈, 관절, 그리고 폐와 기관지가 약해지기 쉽습니다.",
    paragraphs: [
      "평소에 조금만 피로해도 목과 어깨가 뻐근해지거나 환절기마다 비염이나 감기로 고생하는 경향이 있을 수 있어요.",
      "또한 스트레스가 누적되면 수면의 질이 떨어지고 신경이 예민해져 만성 피로를 호소하기 쉬우니 주의해야 해요.",
      "몸의 뼈대와 호흡기를 튼튼하게 다지는 것이 선우님의 넘치는 열정을 오랫동안 유지할 수 있는 가장 기본적인 바탕이에요.",
    ],
    bars: [
      { label: "호흡기", value: 80 }, { label: "피부", value: 60 }, { label: "관절", value: 85 }, { label: "수면", value: 70 },
    ],
  },
  riskTime: {
    intro: "선우님이 특별히 건강에 주의하고 사고수를 조심하셔야 할 구체적인 시기와 상황들을 짚어드릴게요.",
    callout: "계절적으로는 쇠의 기운이 가장 약해지는 뜨거운 여름철이나, 일교차가 심해 면역력이 떨어지는 환절기에 건강 누수를 조심해야 해요.",
    paragraphs: [
      "또한 사주 원국의 묘신원진이 활성화되는 시기에는 정신적인 스트레스로 인한 두통이나 불면증이 찾아오기 쉬우니 마음을 다스려야 합니다.",
      "운동을 할 때는 무리하게 무거운 무게를 들기보다 관절에 무리가 가지 않는 선에서 가볍고 꾸준하게 진행하는 것이 안전해요.",
      "특히 삼재가 시작되는 2031년에는 만성 피로와 면역력 저하가 찾아올 수 있으니 정기적인 건강 검진을 꼭 챙기시기를 권해 드려요.",
    ],
  },
  healthCare: {
    intro: "오행의 원리를 활용하여 선우님의 약한 부위를 보완하고 활력을 불어넣어 줄 맞춤형 건강 관리법을 알려드릴게요.",
    callout: "선우님에게 가장 필요한 쇠(金)의 기운을 일상에서 채워줌으로써 뼈와 관절을 튼튼히 하고 호흡기 면역력을 높일 수 있어요.",
    paragraphs: [
      "평소에 바른 자세를 유지하여 척추와 골반의 정렬을 맞추고, 깊은 호흡을 통해 폐에 맑은 산소를 충분히 공급해 주는 것이 좋아요.",
      "일상에서의 작은 습관 변화가 선우님의 몸과 마음에 거대한 긍정적 변화를 불러올 것이니 오늘부터 가볍게 실천해 보세요.",
    ],
    element: "쇠 (金)",
    tips: [
      { label: "수분", title: "미지근한 물 자주 마시기", desc: "기관지 점막을 촉촉하게 유지해 줍니다" },
      { label: "음식", title: "도라지, 무, 배 등 흰색 음식", desc: "폐와 호흡기 기능을 강화하는 데 좋아요" },
      { label: "운동", title: "맨몸 스트레칭과 필라테스", desc: "관절의 유연성을 기르고 뼈를 보호해요" },
      { label: "습관", title: "바른 자세 유지와 척추 정렬", desc: "뼈와 관절에 무리가 가지 않도록 돕습니다" },
    ],
  },
  helper: {
    intro: "선우님의 인생 여정에서 결정적인 순간마다 나타나 도움을 줄 귀인은 어떤 성향을 가진 사람인지 알려드릴게요.",
    callout: "귀인은 선우님에게 달콤한 위로보다는 뼈를 때리는 냉정하고 현실적인 조언을 아끼지 않는 이성적이고 공정한 멘토 같은 사람이에요.",
    paragraphs: [
      "공과 사가 확실하고 일 처리가 완벽한 선배나 상사의 모습으로 다가와 선우님이 감정에 치우쳐 흔들릴 때 중심을 잡아 줍니다.",
      "이런 귀인을 만났을 때는 자존심을 내세우기보다 그의 조언에 귀를 기울일 때 더 큰 도약의 기회를 잡을 수 있어요.",
    ],
    card: {
      gender: "남성",
      ageBand: "40대 초반",
      desc: "말투가 다소 차갑고 직설적일 수 있지만, 일 처리가 완벽하고 공과 사가 확실한 선배나 상사예요. 선우님이 감정에 치우칠 때 중심을 잡아 줍니다.",
      mbti: "ENTJ",
      height: "178cm 내외",
      personality: "냉철하지만 의리가 있고 책임감이 강한 성격",
      jobField: "기획, 재무, 법률, 전문 경영인",
      tags: ["이성적인", "공정한", "피드백이 확실한", "추진력 있는", "금융/법조계", "든든한 멘토", "신중한", "의리 있는"],
    },
  },
  helperTime: {
    intro: "이 소중한 귀인의 인연이 선우님의 삶에 본격적으로 찾아오고 활성화되는 구체적인 시기를 짚어드릴게요.",
    callout: "귀인은 현재 지나고 있는 임신(壬申) 대운의 정관(申) 기운이 강해지는 해나, 선우님이 중요한 커리어적 결정을 내려야 할 때 나타나요.",
    paragraphs: [
      "특히 2028년 무신(戊申)년에는 귀인의 강력한 조력과 추천을 통해 승진이나 좋은 조건의 이직을 성취할 가능성이 매우 높답니다.",
    ],
  },
  helperUse: {
    intro: "선우님에게 찾아올 소중한 천을귀인의 인연을 어떻게 알아보고 삶에 현명하게 활용할 그 비결을 전해드릴게요.",
    callout: "귀인은 선우님에게 달콤한 칭찬을 늘어놓기보다 뼈를 때리는 냉정하고 현실적인 조언을 건네는 모습으로 나타나요.",
    paragraphs: [
      "처음에는 그의 직설적인 말투에 자존심이 상하거나 거부감이 들 수 있지만 그의 말속에는 늘 뼈가 있고 진심이 담겨 있어요.",
      "선우님이 감정에 치우쳐 무리한 결정을 내리려 할 때 브레이크를 걸어주고 올바른 방향을 제시해 주는 고마운 존재지요.",
      "이 귀인의 조언을 잔소리로 치부하지 말고 나를 더 단단하게 다듬어주는 보석 같은 피드백으로 받아들이셔야 해요.",
      "귀인이 제시하는 합리적인 규칙과 시스템을 적극적으로 수용하여 선우님의 업무나 사업에 적용해 보세요.",
      "혼자 끙끙 앓으며 고민하던 일들을 귀인에게 털어놓고 자문을 구하면 생각보다 너무나 쉽게 해결책을 찾을 수 있어요.",
      "귀인과의 긍정적인 관계를 유지하기 위해서는 평소에 예의를 갖추고 공적인 신뢰를 쌓아두는 것이 무엇보다 중요해요.",
      "사적인 감정보다는 일의 성과와 공정함을 바탕으로 소통할 때 귀인은 선우님을 더욱 신뢰하고 전폭적으로 지원해 줍니다.",
      "귀인이 이끄는 네트워크나 모임에 적극적으로 참여하여 선우님의 사회적 지평을 넓히는 기회로 삼으셔도 아주 좋아요.",
      "그의 철저한 자기관리와 이성적인 판단 방식을 곁에서 지켜보며 선우님만의 훌륭한 롤모델로 삼아 배워보세요.",
      "묘신원진의 예민함이 발동해 귀인의 의도를 오해하거나 의심하려 할 때마다 \"이것은 나를 위한 약이다\"라고 마음을 다잡으세요.",
      "귀인의 도움을 받아 커리어를 확장해 나갈 때 선우님의 신강한 사주는 비로소 사회적으로 큰 결실을 맺게 됩니다.",
      "고마운 마음을 말로만 끝내지 말고 작은 선물이나 진심 어린 감사 편지로 표현하여 인연의 끈을 더욱 단단히 묶으세요.",
      "귀인은 선우님이 어려움에 처했을 때 보이지 않는 곳에서 든든한 바람막이가 되어줄 진짜 내 사람임을 잊지 마세요.",
      "혼자 서는 삶도 아름답지만 귀인과 손을 잡고 함께 걸어갈 때 선우님의 여정은 훨씬 더 빠르고 풍요로워질 거예요.",
      "하늘이 내려준 천을귀인의 복을 낭비하지 말고 겸손하고 열린 마음으로 그 기운을 온전히 흡수하시기를 바랄게요.",
      "귀인의 지혜와 선우님의 추진력이 결합할 때 그 시너지는 상상 이상으로 거대하며 인생의 큰 도약을 이끌어 낼 것입니다.",
      "소중한 인연을 귀하게 여기고 가꾸어 나가는 지혜로운 태도야말로 선우님의 삶을 가장 눈부시게 만드는 비결이랍니다.",
    ],
  },
  samjae: {
    intro: "선우님이 인생을 살아가며 미리 대비하고 조심해야 할 가장 거친 3년인 삼재의 구체적인 시기를 알려드릴게요.",
    callout: "1989년 뱀띠인 선우님에게 삼재는 만 41세가 되는 2031년(신해년)부터 2033년(계축년)까지의 3년 동안이에요.",
    paragraphs: [
      "이 시기는 현재의 임신(壬) 대운이 끝나고 다음 대운으로 넘어가는 교체기와 맞물려 있어 삶의 변동성이 정점에 다를 거예요.",
      "들삼재인 2031년에는 외부적인 환경 변화나 무리한 신규 투자, 또는 잦은 제안 등을 단호하게 거절하고 수성하는 태도가 필요해요.",
      "눌삼재인 2032년에는 가까운 가족이나 연인과의 갈등이 깊어질 수 있어 묘신원진의 예민함을 다스리는 데 집중하셔야 해요.",
      "날삼재인 2033년에는 건강상의 누수나 만성 피로가 찾아오기 쉬우니 정기적인 검진과 휴식을 통해 몸을 보살펴야 합니다.",
      "삼재는 무조건적인 재앙이 아니라 속도를 줄이고 내실을 기하라는 하늘의 지혜로운 신호임을 기억하고 차분히 대비해야 해요.",
    ],
    trap: {
      title: "대운 교체기와 맞물리는 삼재의 변동성",
      desc: "대운이 바뀌는 시기와 삼재가 겹쳐 변동성이 가장 커지는 구간이니 평소보다 신중해야 해요.",
      items: [
        { title: "무리한 투자 및 확장 금지", desc: "삼재 기간에는 새로운 사업 확장이나 큰 액수의 투자는 위험해요." },
        { title: "대인관계에서의 구설수 주의", desc: "사소한 말로 오해가 깊어져 인간관계에 금이 갈 수 있으니 조심하세요." },
        { title: "면역력 저하 및 건강 관리", desc: "스트레스로 인한 호흡기나 정신 건강을 평소보다 더 신경 써야 해요." },
      ],
    },
    yearly: [
      { year: "2031년", phase: "들삼재", action: "신규 투자 및 동업 제안 거절" },
      { year: "2032년", phase: "눌삼재", action: "가족 및 연인과의 갈등 조율" },
      { year: "2033년", phase: "날삼재", action: "건강 검진 및 만성 피로 관리" },
    ],
    guide: [
      "들삼재인 2031년에는 외부의 달콤한 제안이나 무리한 확장을 단호히 거절하고 현재의 자리를 굳건히 지키는 것이 좋아요.",
      "눌삼재인 2032년에는 가까운 사람들과의 오해를 풀기 위해 감정을 빼고 이성적으로 소통하는 대화법을 실천하셔야 해요.",
      "날삼재인 2033년에는 그동안 쌓인 피로가 몸의 약한 부위로 나타날 수 있으니 정기 검진과 충분한 휴식으로 몸을 보살펴야 해요.",
      "이 거친 3년의 시간을 내실을 다지는 충전의 기회로 삼는다면 삼재가 끝난 뒤 훨씬 더 크게 도약하는 발판이 될 것입니다.",
    ],
  },
  samjaeFocus: {
    intro: "삼재 기간 동안 선우님이 구체적으로 어떤 영역에서 함정을 피하고 조심해야 하는지 세 가지 핵심 포인트를 짚어드릴게요.",
    callout: "첫째는 무리한 재정적 변동을 피하는 것으로, 확실하지 않은 투기성 자산에 돈을 묻거나 남에게 돈을 빌려주는 행위는 절대 금물이에요.",
    paragraphs: [
      "둘째는 대인관계에서의 오해와 구설수로, 묘신원진의 작용이 삼재의 거친 기운과 만나면 사소한 말 한마디가 큰 싸움으로 번지기 쉬워요.",
      "셋째는 뼈와 관절, 그리고 호흡기 계통의 건강 관리로, 스트레스가 몸의 약한 부위로 흘러들어 만성 질환을 유발할 수 있어요.",
      "이 시기에는 새로운 일을 벌이기보다 기존에 하던 일을 안정적으로 유지하고 시스템을 정비하는 데 힘쓰는 것이 훨씬 유리해요.",
      "계약서를 쓸 때는 문구 하나하나를 꼼꼼히 확인하고, 구두 약속보다는 반드시 서면으로 증거를 남기는 습관을 들이셔야 안전해요.",
      "마음의 조급함을 내려놓고 나 자신을 돌아보는 성찰의 시간으로 삼는다면 삼재의 파도 역시 무사히 넘길 수 있답니다.",
    ],
  },
  villain: {
    intro: "선우님을 흔들고 힘들게 만드는 악인들은 주로 어떤 모습으로 다가오는지 그 구체적인 패턴을 분석해 드릴게요.",
    callout: "이들은 처음에는 선우님의 뛰어난 능력과 기획력을 과도하게 칭찬하며 세상에 둘도 없는 아군처럼 달콤하게 접근해요.",
    paragraphs: [
      "상관의 기운이 강한 선우님의 귀를 즐겁게 해 주며 자존심을 한껏 세워주는 방식으로 경계심을 무장해제 시키지요.",
      "하지만 이들의 본질은 선우님의 재능과 자산을 이용해 자신들의 이익을 취하려는 기회주의적인 속성을 지니고 있어요.",
      "특히 확실하지 않은 대박 투자 정보나 동업 제안을 슬쩍 흘리며 선우님의 재물 욕심과 경쟁심을 자극하곤 합니다.",
      "\"너 정도의 능력이면 대기업 밑에서 일하기 아깝다\"는 식으로 부추겨 무리한 독립이나 창업을 유도하기도 해요.",
      "이들의 말을 믿고 섣불리 움직였다가는 공들여 쌓아온 현실적인 기반이 한순간에 흔들리는 경험을 할 수 있어요.",
      "또한 이들은 약속을 쉽게 번복하거나 불리한 상황이 되면 책임을 선우님에게 전가하는 비겁한 태도를 보입니다.",
      "대인관계에서 묘신원진의 예민함을 자극하여 주변의 진짜 귀인들과 선우님 사이를 이간질하는 패턴도 보여요.",
      "겉으로는 화려한 인맥과 성공을 자랑하지만 정작 실속이 없고 말만 앞서는 특징을 가지고 있답니다.",
      "선우님이 곤경에 처했을 때 가장 먼저 발을 빼고 모른 척할 사람들이니 애초에 깊은 인연을 맺지 않는 것이 상책이에요.",
      "이들은 주로 공적인 계약 관계보다는 사적인 친분과 감정에 호소하며 다가오는 경우가 많으니 주의해야 해요.",
      "돈 거래나 중요한 비즈니스 결정을 내릴 때 이성적인 검토 없이 감정적으로 동조하게 만들려는 경향이 강해요.",
      "선우님의 주체성을 교묘하게 흔들어 자신들의 통제 하에 두려고 가스라이팅을 시도하기도 하니 경계하셔야 합니다.",
      "이들과 얽히면 정신적인 피로감이 극에 달해 본업에 집중하지 못하고 슬럼프에 빠지기 쉬워요.",
      "따라서 누군가 지나치게 빠른 속도로 친근하게 다가오며 큰돈을 벌 수 있다고 유혹한다면 일단 의심해 보셔야 해요.",
      "선우님의 사주에 있는 정관(申)의 차갑고 이성적인 칼날을 꺼내어 그들의 의도를 냉정하게 베어내야 합니다.",
      "공과 사를 철저히 구분하고 모든 비즈니스는 서류와 법적 절차를 거쳐 진행하는 것이 이들을 막는 최고의 방어벽이에요.",
      "달콤한 말 뒤에 숨겨진 칼날을 알아보는 혜안을 기를 때 선우님의 소중한 자산과 마음을 안전하게 지킬 수 있답니다.",
    ],
    card: {
      gender: "남성",
      ageBand: "30대 후반",
      desc: "말솜씨가 화려하고 인맥이 넓어 보이지만, 정작 실속이 없고 약속을 자주 번복하는 사람이에요. 선우님의 능력을 치켜세우며 이용하려 듭니다.",
      mbti: "ESTP",
      height: "175cm 내외",
      personality: "외향적이고 사교적이나 끈기가 없고 가벼운 성격",
      jobField: "다단계, 투기성 영업, 불투명한 스타트업",
      tags: ["말만 앞서는", "과장된", "신뢰도가 낮은", "기회주의적인", "동업 제안자", "투기 유도자", "감정 기복이 심한", "무책임한"],
    },
  },
  loss: {
    intro: "만약 이러한 악인들의 유혹에 넘어가 페이스를 잃게 된다면 선우님이 잃게 될 구체적인 손실들을 짚어드릴게요.",
    callout: "가장 먼저 타격을 입는 것은 선우님이 땀 흘려 모아온 소중한 재물(편재 己)과 현실적인 자산의 누수예요.",
    paragraphs: [
      "잘못된 투자나 무리한 동업으로 인해 자금이 묶이거나 사기를 당해 경제적인 어려움에 처할 수 있어요.",
      "하지만 더 큰 손실은 물질적인 돈보다 선우님의 내면에 깊은 상처를 남기는 정신적인 배신감과 마음앓이예요.",
      "묘신원진의 예민한 기운이 배신의 상처와 만나면 사람에 대한 극심한 불신과 의심증으로 발전하기 쉽습니다.",
      "\"내가 왜 그런 사람을 믿었을까\" 하는 자책감에 빠져 스스로를 괴롭힐 수 있어요.",
      "이로 인해 본업에서의 집중력이 흐려지고 커리어의 정점에서 엉뚱한 곳에 에너지를 낭비하는 결과를 초래해요.",
      "또한 주변의 진짜 나를 돕고자 했던 천을귀인 같은 소중한 인연들과의 관계까지 소원해지는 악순환이 생겨요.",
      "스트레스가 극에 달하면서 평소 약했던 호흡기나 관절 부위에 만성적인 질환이 재발하는 건강상의 손실도 뒤따릅니다.",
      "밤마다 걱정과 후회로 잠을 이루지 못해 수면 장애를 겪거나 일상의 리듬이 완전히 깨질 수도 있어요.",
      "직장 내에서의 평판이나 사회적인 신용도에 흠집이 나면서 쌓아온 명예가 실추되는 아픔을 겪을 수도 있네요.",
      "이 모든 손실들은 선우님이 이성적인 정관(金)의 규칙을 잊고 감정적인 상관(火)의 충동에 휘둘렸을 때 발생해요.",
      "한 번 무너진 신뢰와 자산은 회복하는 데 몇 배의 시간과 노력이 필요하므로 애초에 예방하는 것이 최선이에요.",
      "나를 지켜주는 든든한 울타리를 스스로 허물지 말고 의심스러운 인연은 과감하게 정리하는 결단력이 필요합니다.",
      "감정에 치우쳐 \"좋은 게 좋은 거지\"라는 식으로 타협하는 태도는 악인들에게 빌미를 제공하는 독이 될 뿐이에요.",
      "선우님의 인생에서 가장 소중한 가치들을 지키기 위해 마음의 빗장을 단단히 걸어 잠그셔야 할 때도 있는 법이지요.",
      "잃고 나서 후회하기보다 미리 경계하고 예방하는 지혜를 발휘할 때 선우님의 삶은 비로소 안전지대에 놓이게 돼요.",
      "내 안의 단단한 자존심을 상처 입지 않도록 스스로를 보호하는 법을 배우는 것도 중요한 개운의 과정이에요.",
      "소중한 것들을 지켜내고 다가올 황금기를 온전히 누리기 위해 늘 깨어있는 이성으로 세상을 마주하시기를 바랄게요.",
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

// 독립 ↔ 협력 스펙트럼 (5장)
function SpectrumBar({ label, value }: { label: string; value: number }) {
  const v = Math.min(96, Math.max(4, value)); // 0=독립, 100=협력
  return (
    <div className="rounded-2xl px-5 py-5 mb-5" style={{ background: "#fff", border: `1px solid ${INK}14`, boxShadow: "0 4px 18px rgba(0,0,0,0.04)" }}>
      <p className="text-center text-[12px] mb-1" style={{ color: MUTE }}>나의 삶의 방식</p>
      <p className="text-center text-[15px] font-black mb-4" style={{ color: INK }}>{label}</p>
      <div className="relative" style={{ height: 14 }}>
        <div className="absolute inset-0 rounded-full" style={{ background: `linear-gradient(to right, ${MAROON}, ${ROSE} 50%, ${NAVY})` }} />
        <div className="absolute top-1/2" style={{ left: `${v}%`, transform: "translate(-50%,-50%)", width: 20, height: 20, borderRadius: "50%", background: "#fff", border: `3px solid ${INK}`, boxShadow: "0 2px 6px rgba(0,0,0,0.25)" }} />
      </div>
      <div className="flex justify-between mt-2 text-[12px] font-bold" style={{ color: INK_SOFT }}>
        <span>독립</span>
        <span>협력</span>
      </div>
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
  const [generating, setGenerating] = useState(false); // 결제 직후 전 장 일괄 생성 중
  const [revealed, setRevealed] = useState(true); // 일괄 생성 완료 후 '결과 보기'로 본문 공개
  const startedRef = useRef(false);
  const generatedRef = useRef(false); // 일괄 생성 1회만
  const chNum = Number(ch);

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

  // 합본 저장 헬퍼 (생성한 섹션들을 합쳐 1회 저장 → 동시 쓰기 레이스 없음)
  const persist = (mergedContent: Record<string, unknown>) => {
    fetch("/api/jeongtong-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, content: mergedContent }),
    }).catch(() => {});
  };

  // 단일 장 재시도 (에러 화면 '다시 시도'). 실패하면 needGen 유지 → 에러 화면 그대로
  const genChapter = (n: number) => {
    if (!id) return;
    setGenerating(true);
    fetch("/api/jeongtong-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, chapter: n }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        const sec = d?.sections;
        if (!sec || !isChapterReady(sec, n)) return;
        setReport((p) => {
          if (!p) return p;
          const merged = { ...(p.content as Record<string, unknown>), ...sec };
          persist(merged);
          return { ...p, content: merged as ReportContent };
        });
      })
      .catch(() => {})
      .finally(() => setGenerating(false));
  };

  // 결제 직후/조회 후: 빠진 "모든" 장을 병렬 생성 → 합본 1회 저장 (이후 장 이동 즉시)
  useEffect(() => {
    if (!report || !id || loading || generatedRef.current) return;
    const all = Object.keys(CHAPTER_SECTIONS).map(Number);
    const missing = all.filter((n) => !isChapterReady(report.content as Record<string, unknown>, n));
    if (missing.length === 0) return;
    generatedRef.current = true;
    setRevealed(false); // 다 만들어지면 '결과 보기' 버튼으로 공개
    setGenerating(true);
    Promise.all(
      missing.map((n) =>
        fetch("/api/jeongtong-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, chapter: n }),
        })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
      ),
    )
      .then((results) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const patch = Object.assign({}, ...results.filter(Boolean).map((r: any) => r.sections || {}));
        setReport((p) => {
          if (!p) return p;
          const merged = { ...(p.content as Record<string, unknown>), ...patch };
          persist(merged);
          return { ...p, content: merged as ReportContent };
        });
      })
      .finally(() => setGenerating(false));
  }, [report, id, loading]); // eslint-disable-line react-hooks/exhaustive-deps

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
  // 누락 섹션은 샘플로 폴백 (단, 실제 결제자는 needGen 으로 막아 샘플 표시 안 함)
  const c: ReportContent = { ...SAMPLE_CONTENT, ...(report?.content ?? {}) };
  // 실제 결제자(id 있음)인데 현재 장이 아직 생성 안 됨 → 샘플 대신 로딩/에러 표시
  const needGen = !!id && !!CHAPTER_SECTIONS[chNum] && !isChapterReady(report?.content as Record<string, unknown>, chNum);
  const showLoading = generating || (needGen && !generatedRef.current); // 일괄 생성 중/직전
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

      {showLoading ? (
        <div className="flex flex-col items-center justify-center px-6 text-center" style={{ minHeight: "70vh" }}>
          <div className="rounded-full animate-spin" style={{ width: 44, height: 44, border: `3px solid ${MAROON}22`, borderTopColor: MAROON }} />
          <p className="mt-5 text-[15px] font-bold" style={{ color: INK }}>전체 풀이를 준비하고 있어요</p>
          <p className="mt-1 text-[13px]" style={{ color: MUTE }}>명식을 세우고 모든 장을 작성하는 중입니다…</p>
        </div>
      ) : needGen ? (
        <div className="flex flex-col items-center justify-center px-8 text-center" style={{ minHeight: "70vh" }}>
          <p className="text-[15px] font-bold" style={{ color: INK }}>이 장 풀이 생성에 실패했어요</p>
          <p className="mt-1 text-[13px] leading-relaxed" style={{ color: MUTE }}>일시적인 오류일 수 있어요.<br />다시 시도해 주세요.</p>
          <button onClick={() => genChapter(chNum)} className="mt-6 px-6 py-3 rounded-xl text-[14px] font-bold text-white active:scale-95 transition-all" style={{ background: MAROON }}>다시 시도</button>
        </div>
      ) : !revealed ? (
        <div className="flex flex-col items-center justify-center px-8 text-center" style={{ minHeight: "70vh" }}>
          <p className="text-[15px] font-bold" style={{ color: INK }}>{name}님의 결과지가 준비됐어요</p>
          <p className="mt-1 text-[13px] leading-relaxed" style={{ color: MUTE }}>모든 장의 풀이가 완성되었습니다.<br />아래 버튼을 눌러 확인해 보세요.</p>
          <button onClick={() => setRevealed(true)} className="mt-6 px-8 py-3.5 rounded-xl text-[15px] font-bold text-white active:scale-95 transition-all" style={{ background: MAROON }}>결과 보기</button>
        </div>
      ) : (
      <>
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
            <P>{c.rarity.intro}</P>
            <Callout>{c.rarity.callout}</Callout>
            {c.rarity.paragraphs.map((p, i) => <P key={i}>{p}</P>)}

            <RarityChart grade={c.rarity.grade} percentile={c.rarity.percentile} name={name} />
            <GradeTable myGrade={c.rarity.grade} />
          </section>

          {/* 인용 */}
          <Quote>{`"${name}님 사주가 지닌\n특별한 귀인의 기운을\n지금부터 구체적으로\n풀어드릴게요."`}</Quote>

          {/* 이 사주가 드문 이유 */}
          <section className="px-6 pt-2 pb-4">
            <Heading>이 사주가 드문 이유</Heading>
            <GanjiMini view={report?.view ?? null} />

            <div className="mb-4">
              {c.special.tags.map((t, i) => (
                <SpecialTag key={i} label={t.label} sub={t.sub} color={TAG_COLORS[i % TAG_COLORS.length]} />
              ))}
            </div>

            {c.special.items.map((it, i) => (
              <HiP key={i} hi={it.hi}>{it.text}</HiP>
            ))}
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

      {/* ═══════════ 제5장 ═══════════ */}
      {ch === "5" && (
        <>
          {/* 표지 */}
          <div className="relative overflow-hidden" style={{ height: 470 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/hero/hero-12.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 32%, transparent 68%, rgba(253,248,244,0.95) 100%)" }} />
            <div className="absolute top-7 left-0 right-0 text-center px-6">
              <p className="text-[12px] tracking-[0.2em] mb-3" style={{ color: "rgba(255,255,255,0.9)" }}>제2부 · 타고난 길</p>
              <h1 className="text-[28px] font-black leading-snug" style={{ color: "#fff", fontFamily: SERIF, textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
                “세상을 대하는<br />나만의 방식”
              </h1>
            </div>
          </div>

          <Quote>{`"${name}님이 세상을\n어떤 방식으로\n마주하는지 살펴보겠습니다."`}</Quote>

          {/* 균형 */}
          <HanjaDivider hanja="均衡" sub="홀로 여는 삶, 서로 기대는 삶" />
          <section className="px-6 pt-6 pb-4">
            <P>{c.balance.intro}</P>
            <Callout>{c.balance.callout}</Callout>
            <P>{c.balance.paragraphs[0]}</P>
            <SpectrumBar label={c.balance.spectrum.label} value={c.balance.spectrum.value} />
            {c.balance.paragraphs.slice(1).map((p, i) => <P key={i}>{p}</P>)}
          </section>

          {/* 해답 */}
          <HanjaDivider hanja="解答" sub="답이 어디에 있는지" />
          <section className="px-6 pt-6 pb-4">
            <P>{c.answer.intro}</P>
            <Callout>{c.answer.callout}</Callout>
            {c.answer.paragraphs.map((p, i) => <P key={i}>{p}</P>)}
          </section>

          {/* 삽화 */}
          <Illust src="/images/hero/hero-14.jpg" h={360} />

          {/* 마무리 인용 */}
          <Quote>{`"나를 지키는 단단한 뿌리 위에\n타인과 소통하는 가지를 뻗을 때,\n${name}님의 삶은 가장 크고\n웅장하게 자리 잡을 거예요."`}</Quote>

          {/* 다음 장 네비 */}
          <div className="px-6 pb-10 flex gap-2 items-stretch">
            <button onClick={() => next("4")} className="px-4 py-4 rounded-2xl font-bold text-[14px]" style={{ color: INK_SOFT, border: `1px solid ${INK}22` }}>←</button>
            <button onClick={() => next("6")} className="flex-1 py-4 rounded-2xl font-bold text-[14px] text-white flex items-center justify-center gap-2" style={{ background: NAVY }}>
              <span>앞으로 10년, 어떻게 흘러갈까?</span>
              <span>→</span>
            </button>
          </div>
        </>
      )}

      {/* ═══════════ 제6장 ═══════════ */}
      {ch === "6" && (
        <>
          {/* 표지 */}
          <div className="relative overflow-hidden" style={{ height: 470 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/hero/hero-13.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 32%, transparent 68%, rgba(253,248,244,0.95) 100%)" }} />
            <div className="absolute top-7 left-0 right-0 text-center px-6">
              <p className="text-[12px] tracking-[0.2em] mb-3" style={{ color: "rgba(255,255,255,0.9)" }}>제3부 · 열리는 길</p>
              <h1 className="text-[28px] font-black leading-snug" style={{ color: "#fff", fontFamily: SERIF, textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
                “앞으로 10년,<br />어떻게 흘러갈까?”
              </h1>
            </div>
          </div>

          <Quote>{`"앞으로의 10년,\n운의 큰 물결이\n어떻게 흐르는지 살펴보겠습니다."`}</Quote>

          {/* 대운 흐름 */}
          <HanjaDivider hanja="大運" sub="대운으로 보는 10년의 큰 흐름" />
          <section className="px-6 pt-6 pb-4">
            <Heading>대운으로 보는 10년의 큰 흐름</Heading>
            <DaeunTable view={report?.view ?? null} />
            <P>{c.daeFlow.intro}</P>
            <Callout>{c.daeFlow.callout}</Callout>
            {c.daeFlow.paragraphs.map((p, i) => <P key={i}>{p}</P>)}
            <TrendChart flow={c.seun.flow} />
          </section>

          <Quote>{`"2028년과 2029년은 인생의\n황금기 같은 재물과 명예의\n강력한 상승기예요."`}</Quote>

          {/* 세운 흐름 */}
          <HanjaDivider hanja="歲運" sub="세운으로 보는 해마다의 운" />
          <section className="px-6 pt-6 pb-4">
            <Heading>세운으로 보는 해마다의 운</Heading>
            <SeunTable view={report?.view ?? null} />
            <P>{c.seun.intro}</P>
            <Callout>{c.seun.callout}</Callout>
            {c.seun.paragraphs.map((p, i) => <P key={i}>{p}</P>)}
          </section>

          {/* 개운 시점 */}
          <HanjaDivider hanja="開運" sub="운이 언제 풀리는지" />
          <section className="px-6 pt-6 pb-4">
            <Heading>운이 언제 풀리는지</Heading>
            <P>{c.openLuck.intro}</P>
            <Callout>{c.openLuck.callout}</Callout>
            {c.openLuck.paragraphs.map((p, i) => <P key={i}>{p}</P>)}
            <PeakBox peak={c.openLuck.peak} />
          </section>

          <Quote>{`"다가올 눈부신 기회를 잡기 위해\n지금부터 차근차근 준비해 보아요."`}</Quote>

          {/* 5가지 주요 운세 영역 */}
          <section className="px-6 pt-2 pb-4">
            <Heading>5가지 주요 운세 영역</Heading>
            <P>{c.domains.intro}</P>
            {c.domains.paragraphs.map((p, i) => <P key={i}>{p}</P>)}
            <DomainBars bars={c.domains.bars} />
          </section>

          {/* 삽화 */}
          <Illust src="/images/hero/hero-15.jpg" h={360} />

          {/* 마무리 인용 */}
          <Quote>{`"인생의 가장 아름다운 계절이\n머지않았으니,\n조급해하지 말고 나만의 속도로\n걸어가 보아요."`}</Quote>

          {/* 다음 장 네비 */}
          <div className="px-6 pb-10 flex gap-2 items-stretch">
            <button onClick={() => next("5")} className="px-4 py-4 rounded-2xl font-bold text-[14px]" style={{ color: INK_SOFT, border: `1px solid ${INK}22` }}>←</button>
            <button onClick={() => next("7")} className="flex-1 py-4 rounded-2xl font-bold text-[14px] text-white flex items-center justify-center gap-2" style={{ background: NAVY }}>
              <span>재물·직업운 정밀풀이</span>
              <span>→</span>
            </button>
          </div>
        </>
      )}

      {/* ═══════════ 제7장 ═══════════ */}
      {ch === "7" && (
        <>
          {/* 표지 */}
          <div className="relative overflow-hidden" style={{ height: 470 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/hero/hero-16.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 32%, transparent 68%, rgba(253,248,244,0.95) 100%)" }} />
            <div className="absolute top-7 left-0 right-0 text-center px-6">
              <p className="text-[12px] tracking-[0.2em] mb-3" style={{ color: "rgba(255,255,255,0.9)" }}>제3부 · 열리는 길</p>
              <h1 className="text-[28px] font-black leading-snug" style={{ color: "#fff", fontFamily: SERIF, textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
                “재물·직업운<br />정밀풀이”
              </h1>
            </div>
          </div>

          <Quote>{`"돈과 일 —\n${name}님의 재물과 직업운을\n깊이 들여다보겠습니다."`}</Quote>

          {/* 재물운 시점 */}
          <HanjaDivider hanja="財時" sub="재물운이 흐르는 시점" />
          <section className="px-6 pt-6 pb-4">
            <Heading>큰돈이 들어오는 때는 따로 있어요</Heading>
            <P>{c.wealthTime.intro}</P>
            <Callout>{c.wealthTime.callout}</Callout>
            {c.wealthTime.paragraphs.map((p, i) => <P key={i}>{p}</P>)}
            <WealthBars title="향후 5년 재물운" sub="해마다 최대로 모을 수 있는 금액을 표시했어요." bars={c.wealthTime.bars} />
          </section>

          {/* 적직 */}
          <HanjaDivider hanja="適職" sub="타고난 적성과 잘 맞는 직업" />
          <section className="px-6 pt-6 pb-4">
            <Heading>기획하고 조율하는 일에 강해요</Heading>
            <P>{c.jobFit.intro}</P>
            <Callout>{c.jobFit.callout}</Callout>
            {c.jobFit.paragraphs.map((p, i) => <P key={i}>{p}</P>)}
            <JobTop3 jobs={c.jobFit.jobs} />
          </section>

          {/* 직장인 vs 사업가 */}
          <HanjaDivider hanja="職業" sub="직장인 팔자 vs 사업가 팔자" />
          <section className="px-6 pt-6 pb-4">
            <Heading>혼자 결정권을 쥘 때 빛나요</Heading>
            <P>{c.jobType.intro}</P>
            <Callout>{c.jobType.callout}</Callout>
            {c.jobType.paragraphs.map((p, i) => <P key={i}>{p}</P>)}
            <SplitGauge split={c.jobType.split} />
          </section>

          {/* 투자 */}
          <HanjaDivider hanja="投資" sub="내게 잘 맞는 투자 방법" />
          <section className="px-6 pt-6 pb-4">
            <Heading>내게 잘 맞는 투자 방법</Heading>
            <P>{c.invest.intro}</P>
            <Callout>{c.invest.callout}</Callout>
            {c.invest.paragraphs.map((p, i) => <P key={i}>{p}</P>)}
          </section>

          {/* 삽화 */}
          <Illust src="/images/hero/hero-17.jpg" h={360} />

          {/* 마무리 인용 */}
          <Quote>{`"재물은 흙(土)의 대지 위에\n쇠(金)의 도구로 일굴 때 가장\n단단하게 쌓여요.\n조급함을 내려놓고 장기적인\n안목으로 자산을 굴려 가세요."`}</Quote>

          {/* 다음 장 네비 */}
          <div className="px-6 pb-10 flex gap-2 items-stretch">
            <button onClick={() => next("6")} className="px-4 py-4 rounded-2xl font-bold text-[14px]" style={{ color: INK_SOFT, border: `1px solid ${INK}22` }}>←</button>
            <button onClick={() => next("8")} className="flex-1 py-4 rounded-2xl font-bold text-[14px] text-white flex items-center justify-center gap-2" style={{ background: NAVY }}>
              <span>연애·결혼운 정밀풀이</span>
              <span>→</span>
            </button>
          </div>
        </>
      )}

      {/* ═══════════ 제8장 ═══════════ */}
      {ch === "8" && (
        <>
          {/* 표지 */}
          <div className="relative overflow-hidden" style={{ height: 470 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/hero/hero-3.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 32%, transparent 68%, rgba(253,248,244,0.95) 100%)" }} />
            <div className="absolute top-7 left-0 right-0 text-center px-6">
              <p className="text-[12px] tracking-[0.2em] mb-3" style={{ color: "rgba(255,255,255,0.9)" }}>제3부 · 열리는 길</p>
              <h1 className="text-[28px] font-black leading-snug" style={{ color: "#fff", fontFamily: SERIF, textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
                “연애·결혼운<br />정밀풀이”
              </h1>
            </div>
          </div>

          <Quote>{`"${name}님은 어떻게 사랑하고\n어떤 인연을 만날까요.\n연애와 결혼운을 풀어보겠습니다."`}</Quote>

          {/* 사랑하는 방식 */}
          <HanjaDivider hanja="戀愛" sub="내가 사랑하는 방식" />
          <section className="px-6 pt-6 pb-4">
            <Heading>내가 사랑하는 방식</Heading>
            <P>{c.loveStyle.intro}</P>
            <Callout>{c.loveStyle.callout}</Callout>
            {c.loveStyle.paragraphs.map((p, i) => <P key={i}>{p}</P>)}
          </section>

          {/* 시기별 연애 흐름 */}
          <HanjaDivider hanja="戀運" sub="나의 시기별 연애 흐름" />
          <section className="px-6 pt-6 pb-4">
            <Heading>나의 시기별 연애 흐름</Heading>
            <P>{c.loveFlow.intro}</P>
            <Callout>{c.loveFlow.callout}</Callout>
            <LoveTrendChart flow={c.loveFlow.flow} />
            <Callout>{c.loveFlow.peakCallout}</Callout>
            {c.loveFlow.paragraphs.map((p, i) => <P key={i}>{p}</P>)}
          </section>

          {/* 이런 사람이 배우자로 와요 */}
          <section className="px-6 pt-2 pb-4">
            <Heading>이런 사람이 배우자로 와요</Heading>
            <PersonCard label="사주로 본 배우자의 분위기예요." photo="/images/hero/hero-4.jpg" card={c.spouse.card} />
            <P>{c.spouse.intro}</P>
            <Callout>{c.spouse.callout}</Callout>
            {c.spouse.paragraphs.map((p, i) => <P key={i}>{p}</P>)}
          </section>

          {/* 궁합 */}
          <HanjaDivider hanja="宮合" sub="미래 배우자와의 궁합" />
          <section className="px-6 pt-6 pb-4">
            <Heading>오래가는 궁합의 비결</Heading>
            <P>{c.marriage.intro}</P>
            <Callout>{c.marriage.callout}</Callout>
            {c.marriage.paragraphs.map((p, i) => <P key={i}>{p}</P>)}
          </section>

          {/* 삽화 */}
          <Illust src="/images/hero/hero-9.jpg" h={400} />

          {/* 마무리 인용 */}
          <Quote>{`"서로의 화원에 적당한 거리를 두고\n물을 줄 때,\n${ilganLabel}(${ilganHanja})의 사랑은 시들지 않고\n가장 아름답게 피어난답니다."`}</Quote>

          {/* 다음 장 네비 */}
          <div className="px-6 pb-10 flex gap-2 items-stretch">
            <button onClick={() => next("7")} className="px-4 py-4 rounded-2xl font-bold text-[14px]" style={{ color: INK_SOFT, border: `1px solid ${INK}22` }}>←</button>
            <button onClick={() => next("9")} className="flex-1 py-4 rounded-2xl font-bold text-[14px] text-white flex items-center justify-center gap-2" style={{ background: NAVY }}>
              <span>건강운 정밀풀이</span>
              <span>→</span>
            </button>
          </div>
        </>
      )}

      {/* ═══════════ 제9장 ═══════════ */}
      {ch === "9" && (
        <>
          {/* 표지 */}
          <div className="relative overflow-hidden" style={{ height: 470 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/hero/hero-10.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 32%, transparent 68%, rgba(253,248,244,0.95) 100%)" }} />
            <div className="absolute top-7 left-0 right-0 text-center px-6">
              <p className="text-[12px] tracking-[0.2em] mb-3" style={{ color: "rgba(255,255,255,0.9)" }}>제3부 · 열리는 길</p>
              <h1 className="text-[28px] font-black leading-snug" style={{ color: "#fff", fontFamily: SERIF, textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
                “건강운 정밀풀이”
              </h1>
            </div>
          </div>

          <Quote>{`"평생 건강하게 —\n${name}님의 몸이 보내는 신호를\n미리 살펴보겠습니다."`}</Quote>

          {/* 약한 부위 */}
          <HanjaDivider hanja="弱處" sub="타고난 약한 부위" />
          <section className="px-6 pt-6 pb-4">
            <Heading>호흡기와 관절을 먼저 챙기세요</Heading>
            <P>{c.bodyWeak.intro}</P>
            <Callout>{c.bodyWeak.callout}</Callout>
            {c.bodyWeak.paragraphs.map((p, i) => <P key={i}>{p}</P>)}
            <DomainBars title="부위별 주의 신호" sub="몸에서 먼저 신호가 올 수 있는 부위예요." bars={c.bodyWeak.bars} />
          </section>

          {/* 조심해야 할 시기 */}
          <HanjaDivider hanja="厄運" sub="조심해야 할 시기와 사고수" />
          <section className="px-6 pt-6 pb-4">
            <Heading>조심해야 할 시기와 사고수</Heading>
            <P>{c.riskTime.intro}</P>
            <Callout>{c.riskTime.callout}</Callout>
            {c.riskTime.paragraphs.map((p, i) => <P key={i}>{p}</P>)}
          </section>

          {/* 오행에 따른 건강관리 */}
          <HanjaDivider hanja="養生" sub="오행에 따른 건강관리" />
          <section className="px-6 pt-6 pb-4">
            <Heading>오행에 따른 건강관리</Heading>
            <P>{c.healthCare.intro}</P>
            <Callout>{c.healthCare.callout}</Callout>
            {c.healthCare.paragraphs.map((p, i) => <P key={i}>{p}</P>)}
            <HealthCareCard element={c.healthCare.element} tips={c.healthCare.tips} />
          </section>

          {/* 삽화 */}
          <Illust src="/images/hero/hero-1.jpg" h={400} />

          {/* 마무리 인용 */}
          <Quote>{`"몸의 뼈대(金)가 곧게 서야\n두른 나무(木)가 곧게 자라듯,\n관절과 호흡기를 보살피는 것이\n활력의 시작이에요."`}</Quote>

          {/* 다음 장 네비 */}
          <div className="px-6 pb-10 flex gap-2 items-stretch">
            <button onClick={() => next("8")} className="px-4 py-4 rounded-2xl font-bold text-[14px]" style={{ color: INK_SOFT, border: `1px solid ${INK}22` }}>←</button>
            <button onClick={() => next("10")} className="flex-1 py-4 rounded-2xl font-bold text-[14px] text-white flex items-center justify-center gap-2" style={{ background: NAVY }}>
              <span>나를 도와줄 귀인은 누구일까?</span>
              <span>→</span>
            </button>
          </div>
        </>
      )}

      {/* ═══════════ 제10장 ═══════════ */}
      {ch === "10" && (
        <>
          {/* 표지 */}
          <div className="relative overflow-hidden" style={{ height: 470 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/hero/hero-2.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 32%, transparent 68%, rgba(253,248,244,0.95) 100%)" }} />
            <div className="absolute top-7 left-0 right-0 text-center px-6">
              <p className="text-[12px] tracking-[0.2em] mb-3" style={{ color: "rgba(255,255,255,0.9)" }}>제3부 · 열리는 길</p>
              <h1 className="text-[28px] font-black leading-snug" style={{ color: "#fff", fontFamily: SERIF, textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
                “나를 도와줄<br />귀인은 누구일까?”
              </h1>
            </div>
          </div>

          <Quote>{`"${name}님을 돕는 귀인이\n어떤 사람이고,\n언제 찾아오는지 살펴보겠습니다."`}</Quote>

          {/* 귀인은 어떤 사람일까 */}
          <HanjaDivider hanja="貴人" sub="귀인은 어떤 사람일까" />
          <section className="px-6 pt-6 pb-4">
            <Heading>귀인은 어떤 사람일까</Heading>
            <PersonCard title="귀인 인물 카드" label="나를 돕는 사람의 분위기와 특징이에요." photo="/images/hero/hero-6.jpg" card={c.helper.card} />
            <P>{c.helper.intro}</P>
            <Callout>{c.helper.callout}</Callout>
            {c.helper.paragraphs.map((p, i) => <P key={i}>{p}</P>)}
          </section>

          {/* 귀인은 언제 올까 */}
          <HanjaDivider hanja="時機" sub="귀인은 언제 올까" />
          <section className="px-6 pt-6 pb-4">
            <Heading>귀인은 언제 올까</Heading>
            <P>{c.helperTime.intro}</P>
            <Callout>{c.helperTime.callout}</Callout>
            {c.helperTime.paragraphs.map((p, i) => <P key={i}>{p}</P>)}
          </section>

          {/* 그 인연을 어떻게 활용할지 */}
          <HanjaDivider hanja="因緣" sub="그 인연을 어떻게 활용할지" />
          <section className="px-6 pt-6 pb-4">
            <Heading>그 인연을 어떻게 활용할지</Heading>
            <P>{c.helperUse.intro}</P>
            <Callout>{c.helperUse.callout}</Callout>
            {c.helperUse.paragraphs.map((p, i) => <P key={i}>{p}</P>)}
          </section>

          {/* 삽화 */}
          <Illust src="/images/hero/hero-14.jpg" h={400} />

          {/* 마무리 인용 */}
          <Quote>{`"나를 깎아내리는 칼날이 아니라\n나를 다듬어 주는 정교한\n정(金)처럼,\n귀인의 쓴소리를 성장의 발판으로\n삼아 보세요."`}</Quote>

          {/* 다음 장 네비 */}
          <div className="px-6 pb-10 flex gap-2 items-stretch">
            <button onClick={() => next("9")} className="px-4 py-4 rounded-2xl font-bold text-[14px]" style={{ color: INK_SOFT, border: `1px solid ${INK}22` }}>←</button>
            <button onClick={() => next("11")} className="flex-1 py-4 rounded-2xl font-bold text-[14px] text-white flex items-center justify-center gap-2" style={{ background: NAVY }}>
              <span>반드시 조심해야 할 시기는 언제일까?</span>
              <span>→</span>
            </button>
          </div>
        </>
      )}

      {/* ═══════════ 제11장 ═══════════ */}
      {ch === "11" && (
        <>
          {/* 표지 */}
          <div className="relative overflow-hidden" style={{ height: 470 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/hero/hero-8.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(40,0,0,0.45) 0%, transparent 32%, transparent 60%, rgba(253,248,244,0.95) 100%)" }} />
            <div className="absolute top-7 left-0 right-0 text-center px-6">
              <p className="text-[12px] tracking-[0.2em] mb-3" style={{ color: "rgba(255,255,255,0.9)" }}>제4부 · 흔들리는 길</p>
              <h1 className="text-[28px] font-black leading-snug" style={{ color: "#fff", fontFamily: SERIF, textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
                “반드시 조심해야 할<br />시기는 언제일까?”
              </h1>
            </div>
          </div>

          <Quote>{`"가장 거친 3년,\n삼재가 언제\n찾아오는지 살펴보겠습니다."`}</Quote>

          {/* 삼재는 언제 */}
          <HanjaDivider hanja="三災" sub="가장 거친 3년, 삼재는 언제일까" />
          <section className="px-6 pt-6 pb-4">
            <Heading>가장 거친 3년, 삼재는 언제일까</Heading>
            <P>{c.samjae.intro}</P>
            <Callout>{c.samjae.callout}</Callout>
            {c.samjae.paragraphs.map((p, i) => <P key={i}>{p}</P>)}
            <TrapBox trap={c.samjae.trap} />
          </section>

          <Quote>{`"삼재가 흐르는 삼 년 동안\n연차별로 가장 조심할 일을\n알려드릴게요."`}</Quote>

          {/* 삼재 3년, 해마다 이렇게 보내요 */}
          <section className="px-6 pt-2 pb-4">
            <Heading>삼재 3년, 해마다 이렇게 보내요</Heading>
            <SamjaeYearly items={c.samjae.yearly} />
            {c.samjae.guide.map((p, i) => <P key={i}>{p}</P>)}
          </section>

          {/* 그때 조심할 것 (텍스트 디바이더) */}
          <div className="px-6 py-12 text-center" style={{ background: `linear-gradient(to bottom, ${CREAM}, ${PINK_PALE})` }}>
            <p className="text-[20px] font-black leading-snug" style={{ color: INK, fontFamily: SERIF }}>그때 조심할 것:<br />변동 · 관계 · 건강</p>
            <div className="mx-auto mt-4" style={{ width: 30, height: 2, background: `${INK}33` }} />
          </div>
          <section className="px-6 pt-2 pb-4">
            <Heading>그때 조심할 것: 변동·관계·건강</Heading>
            <P>{c.samjaeFocus.intro}</P>
            <Callout>{c.samjaeFocus.callout}</Callout>
            {c.samjaeFocus.paragraphs.map((p, i) => <P key={i}>{p}</P>)}
          </section>

          {/* 삽화 */}
          <Illust src="/images/hero/hero-13.jpg" h={400} />

          {/* 마무리 인용 */}
          <Quote>{`"삼재라는 겨울바람이 불 때는\n억지로 꽃을 피우려 하지 말고,\n뿌리를 더 깊이 내리는 시간으로\n삼으면 안전하답니다."`}</Quote>

          {/* 다음 장 네비 */}
          <div className="px-6 pb-10 flex gap-2 items-stretch">
            <button onClick={() => next("10")} className="px-4 py-4 rounded-2xl font-bold text-[14px]" style={{ color: INK_SOFT, border: `1px solid ${INK}22` }}>←</button>
            <button onClick={() => next("12")} className="flex-1 py-4 rounded-2xl font-bold text-[14px] text-white flex items-center justify-center gap-2" style={{ background: NAVY }}>
              <span>반드시 조심해야 할 악인은 누구일까?</span>
              <span>→</span>
            </button>
          </div>
        </>
      )}

      {/* ═══════════ 제12장 ═══════════ */}
      {ch === "12" && (
        <>
          {/* 표지 */}
          <div className="relative overflow-hidden" style={{ height: 470 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/hero/hero-7.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(40,0,0,0.45) 0%, transparent 32%, transparent 60%, rgba(253,248,244,0.95) 100%)" }} />
            <div className="absolute top-7 left-0 right-0 text-center px-6">
              <p className="text-[12px] tracking-[0.2em] mb-3" style={{ color: "rgba(255,255,255,0.9)" }}>제4부 · 흔들리는 길</p>
              <h1 className="text-[28px] font-black leading-snug" style={{ color: "#fff", fontFamily: SERIF, textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
                “반드시 조심해야 할<br />악인은 누구일까?”
              </h1>
            </div>
          </div>

          <Quote>{`"나를 흔드는 사람은\n이렇게 다가옵니다."`}</Quote>

          {/* 나를 흔드는 사람 */}
          <HanjaDivider hanja="小人" sub="나를 흔드는 사람은 이렇게 온다" />
          <section className="px-6 pt-6 pb-4">
            <Heading>나를 흔드는 사람은 이렇게 온다</Heading>
            <PersonCard title="조심할 인물 카드" label="나를 흔들 수 있는 사람의 분위기와 특징이에요." photo="/images/hero/hero-12.jpg" card={c.villain.card} />
            <P>{c.villain.intro}</P>
            <Callout>{c.villain.callout}</Callout>
            {c.villain.paragraphs.map((p, i) => <P key={i}>{p}</P>)}
          </section>

          <Quote>{`"달콤한 제안 뒤에 숨겨진 의도를\n늘 냉정하고 차갑게\n파악해야 해요."`}</Quote>

          {/* 무엇을 잃을 수 있는지 */}
          <HanjaDivider hanja="損失" sub="그때 무엇을 잃을 수 있는지" />
          <Illust src="/images/hero/hero-16.jpg" h={400} />
          <section className="px-6 pt-6 pb-4">
            <Heading>그때 무엇을 잃을 수 있는지</Heading>
            <P>{c.loss.intro}</P>
            <Callout>{c.loss.callout}</Callout>
            {c.loss.paragraphs.map((p, i) => <P key={i}>{p}</P>)}
          </section>

          {/* 마무리 인용 */}
          <Quote>{`"화려한 말솜씨에 마음을\n빼앗기지 말고,\n그 사람의 발자국이 얼마나\n정직하고 일관된지 먼저\n살펴보세요."`}</Quote>

          {/* 다음 장 네비 */}
          <div className="px-6 pb-10 flex gap-2 items-stretch">
            <button onClick={() => next("11")} className="px-4 py-4 rounded-2xl font-bold text-[14px]" style={{ color: INK_SOFT, border: `1px solid ${INK}22` }}>←</button>
            <button onClick={() => next("13")} className="flex-1 py-4 rounded-2xl font-bold text-[14px] text-white flex items-center justify-center gap-2" style={{ background: NAVY }}>
              <span>핵심 정리</span>
              <span>→</span>
            </button>
          </div>
        </>
      )}

      {/* ═══════════ 제13장 이후 — 준비 중 ═══════════ */}
      {ch !== "1" && ch !== "2" && ch !== "3" && ch !== "4" && ch !== "5" && ch !== "6" && ch !== "7" && ch !== "8" && ch !== "9" && ch !== "10" && ch !== "11" && ch !== "12" && (
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
      </>
      )}
    </div>
  );
}
