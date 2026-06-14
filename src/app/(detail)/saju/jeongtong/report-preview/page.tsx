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
};

// ─── 섹션 컴포넌트 ────────────────────────────────────────────────

// 상단 앱바 (챕터 타이틀 + 공유/목차 + 진행 게이지)
function TopBar({ progress, onMenu, onMyeongsik }: { progress: number; onMenu: () => void; onMyeongsik: () => void }) {
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
              제1장 · 지나온 시간과 선택들
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
  { type: "part", part: "제1부", sub: "지나온 길", items: [{ no: "01", title: "내가 지나온 시간과 선택들", current: true }] },
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

function TocPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
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
                    <Dot active={g.items.some((i) => i.current)} />
                    <span className="text-[14px] font-black" style={{ color: INK }}>
                      {g.part}
                    </span>
                    <span className="text-[11px]" style={{ color: MUTE }}>
                      {g.sub}
                    </span>
                  </div>
                  <div className="ml-[4px] pl-5 space-y-2.5" style={{ borderLeft: `1px solid ${INK}14` }}>
                    {g.items.map((it) => (
                      <button
                        key={it.no}
                        onClick={onClose}
                        className="flex gap-2.5 items-start text-left w-full"
                      >
                        <span
                          className="text-[12px] font-bold flex-shrink-0"
                          style={{ color: it.current ? BLUE : MUTE, minWidth: 18 }}
                        >
                          {it.no}
                        </span>
                        <span
                          className="text-[13px] leading-snug"
                          style={{ color: it.current ? BLUE : INK_SOFT, fontWeight: it.current ? 700 : 400 }}
                        >
                          {it.title}
                        </span>
                      </button>
                    ))}
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

  // 결과지 데이터 (명식 view + 구조화 풀이 content + 이름)
  const [report, setReport] = useState<{ view: MyeongsikView; content: ReportContent; name: string } | null>(null);
  const [loading, setLoading] = useState(!!(id || date));
  const startedRef = useRef(false);

  // id 있으면 저장된 결과 조회(재생성 X), 입력만 있으면 생성+저장 후 id 주소로 교체
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    if (id) {
      fetch(`/api/jeongtong-report?id=${encodeURIComponent(id)}`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => setReport({ view: d.view, content: d.content, name: d.name }))
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
          setReport({ view: d.view, content: d.content, name: d.name });
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
  const c: ReportContent = report?.content ?? SAMPLE_CONTENT;
  const ilganHanja = (report?.view?.ilgan ?? "乙")[0];
  const ilganLabel = (report?.view?.ilgan ?? "乙 (을목)").match(/\(([^)]+)\)/)?.[1] ?? "을목";

  return (
    <div ref={rootRef} style={{ backgroundColor: CREAM, minHeight: "100%" }}>
      <TopBar progress={progress} onMenu={() => setTocOpen(true)} onMyeongsik={openMyeongsik} />
      <TocPanel open={tocOpen} onClose={() => setTocOpen(false)} />
      <MyeongsikModalView open={msOpen} onClose={() => setMsOpen(false)} view={report?.view ?? null} loading={false} />

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
          className="w-full py-4 rounded-2xl font-bold text-[15px] text-white flex items-center justify-center gap-2 active:scale-95 transition-all"
          style={{ background: NAVY, boxShadow: `0 4px 16px ${NAVY}44` }}
        >
          <span>나는 어떤 사람일까</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
