"use client";

// =====================================================
// 연애궁합 결과지 — 정통사주 포맷 기반, 두 사람 명식/이미지 추가
// =====================================================

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { MyeongsikView } from "@/lib/saju/myeongsik-view";
import type { ReportContent } from "@/lib/saju/report-content";
import { isChapterReady, CHAPTER_SECTIONS } from "@/lib/saju/report-content";
import { MyeongsikModalView, MyeongsikTable } from "@/components/saju/MyeongsikModal";
import { ganCharImage, jiCharImage } from "@/lib/saju/char-image";

// ─── 디자인 토큰 ──────────────────────────────────────────────────
const CREAM = "#fdf8f4";
const WHITE = "#ffffff";
const INK = "#2a2320";
const INK_SOFT = "#5b504a";
const MUTE = "#9a8f88";
const ROSE = "#b56576";
const MAROON = "#9b2335";
const CALLOUT_BG = "#f7e9ec";
const SERIF = "'Nanum Myeongjo', 'Apple SD Gothic Neo', serif";

// ─── 목차 ────────────────────────────────────────────────────────
type TocEntry = { disp: string; chip: string; title: string; no: string };

const TOC_A: TocEntry[] = [
  { disp: "인트로",  chip: "서론", title: "연애궁합이란 무엇인가",             no: "0"  },
  { disp: "제1장",  chip: "원국", title: "두 사람의 사주 원국",               no: "1"  },
  { disp: "제2장",  chip: "운명", title: "운명의 큰 구조와 흐름",             no: "2"  },
  { disp: "제3장",  chip: "관계", title: "두 사람의 인간관계 패턴",           no: "3"  },
  { disp: "제4장",  chip: "특징", title: "숨겨진 재능과 특징",               no: "4"  },
  { disp: "제5장",  chip: "재물", title: "재물운과 직업 적성",               no: "5"  },
  { disp: "제6장",  chip: "사랑", title: "두 사람의 사랑과 결혼 궁합",       no: "6"  },
  { disp: "제7장",  chip: "건강", title: "건강과 주의해야 할 부분",           no: "7"  },
  { disp: "제8장",  chip: "귀인", title: "두 사람의 귀인",                   no: "8"  },
  { disp: "제9장",  chip: "주의", title: "주의해야 할 사람의 유형",           no: "9"  },
  { disp: "제10장", chip: "굴곡", title: "삶의 굴곡과 위기",                 no: "10" },
  { disp: "제11장", chip: "흐름", title: "대운의 큰 흐름",                   no: "11" },
  { disp: "제12장", chip: "시기", title: "주의해야 할 시기",                  no: "12" },
  { disp: "제13장", chip: "당부", title: "홍연이 드리는 당부의 말씀",         no: "13" },
  { disp: "제14장", chip: "개운", title: "개운하는 방법",                    no: "14" },
];

const CHAPTER_TITLES: Record<string, string> = {
  "0":  "연애궁합 들어가며",
  "1":  "제1장 · 사주 원국",
  "2":  "제2장 · 운명의 구조",
  "3":  "제3장 · 인간관계",
  "4":  "제4장 · 숨겨진 특징",
  "5":  "제5장 · 재물과 직업",
  "6":  "제6장 · 사랑과 결혼",
  "7":  "제7장 · 건강",
  "8":  "제8장 · 귀인",
  "9":  "제9장 · 주의할 사람",
  "10": "제10장 · 굴곡과 위기",
  "11": "제11장 · 대운 흐름",
  "12": "제12장 · 주의 시기",
  "13": "제13장 · 당부의 말",
  "14": "제14장 · 개운법",
};

// ─── 두루마리 버튼 (정통사주 스타일) ────────────────────────────
function ScrollBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center"
      style={{ background: "none", border: "none", padding: 0 }}
    >
      <div className="flex items-center" style={{ position: "relative" }}>
        <div style={{
          width: 8, height: 30, flexShrink: 0, zIndex: 2, position: "relative",
          background: "linear-gradient(to right, #5a2e00, #a05a10, #d4903a, #f0c060, #d4903a, #a05a10, #5a2e00)",
          borderRadius: 4,
          boxShadow: "1px 0 3px rgba(0,0,0,0.4), inset -1px 0 2px rgba(255,200,80,0.4)",
        }} />
        <div style={{
          padding: "5px 8px",
          background: "linear-gradient(to bottom, #f9f0d8 0%, #edd9a3 40%, #e8d090 60%, #f0e0b0 100%)",
          borderTop: "1.5px solid #b8892a",
          borderBottom: "1.5px solid #b8892a",
          boxShadow: "inset 0 1px 3px rgba(184,137,42,0.2), inset 0 -1px 3px rgba(184,137,42,0.2)",
          color: "#5a2e14",
          fontFamily: SERIF,
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.08em",
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}>
          {label}
        </div>
        <div style={{
          width: 8, height: 30, flexShrink: 0, zIndex: 2, position: "relative",
          background: "linear-gradient(to right, #5a2e00, #a05a10, #d4903a, #f0c060, #d4903a, #a05a10, #5a2e00)",
          borderRadius: 4,
          boxShadow: "-1px 0 3px rgba(0,0,0,0.4), inset 1px 0 2px rgba(255,200,80,0.4)",
        }} />
      </div>
    </button>
  );
}

// ─── TopBar ──────────────────────────────────────────────────────
function TopBar({
  progress, title, onMenu, onMyeongsik, onPartnerMyeongsik, hasPartnerView,
}: {
  progress: number; title: string; onMenu: () => void;
  onMyeongsik: () => void; onPartnerMyeongsik: () => void; hasPartnerView: boolean;
}) {
  const [label, subtitle] = title.includes("·") ? title.split(" · ") : [title, ""];
  return (
    <div
      className="sticky top-0 z-30"
      style={{ background: "rgba(253,248,244,0.92)", backdropFilter: "blur(6px)", borderBottom: `1px solid ${INK}10` }}
    >
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="min-w-0">
            <p className="text-[10px] font-bold" style={{ color: MUTE }}>{label}</p>
            {subtitle && <p className="text-[12.5px] font-bold truncate" style={{ color: INK }}>{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <ScrollBtn label="나의 명식" onClick={onMyeongsik} />
          {hasPartnerView && (
            <ScrollBtn label="상대방 명식" onClick={onPartnerMyeongsik} />
          )}
          <button onClick={onMenu} className="flex flex-col items-center ml-1" style={{ color: INK_SOFT, lineHeight: 1 }}>
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

// ─── TocPanel ────────────────────────────────────────────────────
function TocPanel({ open, onClose, currentNo, onSelect }: {
  open: boolean; onClose: () => void; currentNo: string; onSelect: (no: string) => void;
}) {
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
      <div
        onClick={onClose}
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.4)", opacity: open ? 1 : 0, transition: "opacity 0.25s ease" }}
      />
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
        <div className="px-5 py-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-baseline gap-2">
              <h2 className="text-[21px] font-black" style={{ color: INK, fontFamily: SERIF }}>목차</h2>
              <span className="text-[11.5px]" style={{ color: MUTE }}>홍연이 두 사람에게 들려줄 이야기</span>
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
          <div className="mt-3 space-y-1.5">
            {TOC_A.map((it, i) => {
              const active = !!it.no && it.no === currentNo;
              const handle = () => { if (it.no) { onSelect(it.no); onClose(); } };
              return (
                <button
                  key={i}
                  onClick={handle}
                  className="flex items-center gap-2.5 w-full text-left rounded-xl px-3 py-2 transition-colors"
                  style={{
                    background: active ? `${MAROON}10` : WHITE,
                    border: `1px solid ${active ? MAROON : INK + "12"}`,
                    boxShadow: active ? `0 0 0 1px ${MAROON}` : "none",
                    cursor: "pointer",
                  }}
                >
                  <span className="flex-shrink-0 text-[11px] font-bold text-center" style={{ width: 44, color: active ? MAROON : MUTE }}>
                    {it.disp}
                  </span>
                  <div className="min-w-0">
                    <span className="text-[10px] tracking-wide" style={{ color: active ? MAROON : MUTE }}>{it.chip}</span>
                    <p className="text-[12px] leading-tight truncate" style={{ color: active ? MAROON : INK, fontWeight: active ? 800 : 600, fontFamily: SERIF }}>
                      {it.title}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 미니 사주 명식 (두 사람 나란히) ────────────────────────────
function MiniSajuCol({ view, name }: { view: MyeongsikView | null; name: string }) {
  const ps = view?.pillars ?? [];
  return (
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-bold text-center mb-2" style={{ color: MUTE }}>{name}님</p>
      <div className="grid grid-cols-4 gap-1">
        {[0, 1, 2, 3].map((i) => {
          const p = ps[i];
          return (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <span style={{ fontSize: 8, color: MAROON, lineHeight: 1 }}>{p?.sipTop || " "}</span>
              <div className="w-full aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p ? ganCharImage(p.gan) : ""} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", opacity: p ? 1 : 0 }} />
              </div>
              <div className="w-full aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p ? jiCharImage(p.ji) : ""} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", opacity: p ? 1 : 0 }} />
              </div>
              <span style={{ fontSize: 8, color: MAROON, lineHeight: 1 }}>{p?.sipBot || " "}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 섹션 블록 ───────────────────────────────────────────────────
type Section = { title: string; paragraphs: string[] };

function SectionBlock({ sectionKey, section, accent = false }: {
  sectionKey: string; section: Section; accent?: boolean;
}) {
  const isLetter = sectionKey === "letter";
  if (isLetter) {
    return (
      <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: CALLOUT_BG, border: `1px solid ${ROSE}40`, boxShadow: `0 2px 12px ${MAROON}10` }}>
        <p className="text-[13px] font-bold tracking-widest mb-4" style={{ color: MAROON }}>✦ 홍연으로부터 ✦</p>
        {section.paragraphs.map((para, i) => (
          <p key={i} className="text-[14px] leading-loose mb-4 last:mb-0" style={{ color: INK_SOFT, fontFamily: SERIF }}>{para}</p>
        ))}
      </div>
    );
  }
  return (
    <div className="mb-8">
      <h3 className="text-[15px] font-black mb-3 flex items-center gap-2" style={{ color: INK, fontFamily: SERIF }}>
        <span style={{ color: ROSE }}>◎</span> {section.title}
      </h3>
      <div className={accent ? "rounded-xl p-4" : ""} style={accent ? { backgroundColor: `${MAROON}06`, border: `1px solid ${MAROON}15` } : {}}>
        {section.paragraphs.map((para, i) => (
          <p key={i} className="text-[13.5px] leading-loose mb-3 last:mb-0" style={{ color: INK_SOFT }}>{para}</p>
        ))}
      </div>
    </div>
  );
}

// ─── 로딩/에러 ───────────────────────────────────────────────────
function LoadingDots({ title }: { title: string }) {
  const [d, setD] = useState(".");
  useEffect(() => {
    const t = setInterval(() => setD((x) => x.length >= 3 ? "." : x + "."), 500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: ROSE, borderTopColor: "transparent" }} />
      <p className="text-[14px] font-bold" style={{ color: INK_SOFT }}>{title} 풀이 중{d}</p>
      <p className="text-[12px]" style={{ color: MUTE }}>홍연이 두 사람의 사주를 들여다보고 있어요</p>
    </div>
  );
}

function ErrorRetry({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center py-16 gap-3">
      <p className="text-[14px]" style={{ color: INK_SOFT }}>이 장 풀이 생성에 실패했어요</p>
      <p className="text-[12px] text-center leading-relaxed" style={{ color: MUTE }}>일시적인 오류일 수 있어요.<br />다시 시도해 주세요.</p>
      <button onClick={onRetry} className="mt-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white" style={{ backgroundColor: MAROON }}>다시 시도</button>
    </div>
  );
}

function GeneratingWait() {
  const [d, setD] = useState(".");
  useEffect(() => {
    const t = setInterval(() => setD((x) => x.length >= 3 ? "." : x + "."), 500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex flex-col items-center justify-center px-6 text-center" style={{ minHeight: "70vh" }}>
      <div className="rounded-full animate-spin mb-5" style={{ width: 44, height: 44, border: `3px solid ${MAROON}22`, borderTopColor: MAROON }} />
      <p className="text-[15px] font-bold" style={{ color: INK }}>전체 풀이를 준비하고 있어요{d}</p>
      <p className="text-[13px] mt-1" style={{ color: MUTE }}>홍연이 두 사람의 사주를 살피는 중이에요</p>
    </div>
  );
}

function AwaitReveal({ name, onReveal }: { name: string; onReveal: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-8 text-center" style={{ minHeight: "70vh" }}>
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: CALLOUT_BG, border: `2px solid ${ROSE}` }}>
        <span style={{ fontSize: 24 }}>✨</span>
      </div>
      <p className="text-[18px] font-black mb-2" style={{ color: INK, fontFamily: SERIF }}>{name}님의 결과지가 준비됐어요</p>
      <p className="text-[13px] leading-relaxed mb-6" style={{ color: MUTE }}>모든 장의 풀이가 완성되었습니다.<br />아래 버튼을 눌러 확인해 보세요.</p>
      <button onClick={onReveal} className="px-8 py-3.5 rounded-2xl text-[15px] font-bold text-white active:scale-95 transition-all"
        style={{ backgroundColor: MAROON, boxShadow: `0 4px 20px ${MAROON}44` }}>
        결과 보기
      </button>
    </div>
  );
}

// ─── 인트로 (ch=0) ───────────────────────────────────────────────
function ChapterIntro({ name, partnerName, onStart }: {
  name: string; partnerName: string; onStart: () => void;
}) {
  return (
    <div>
      <div className="text-center px-6 py-4" style={{ background: "#111" }}>
        <p className="text-[10px] tracking-[0.25em] mb-2" style={{ color: "rgba(255,255,255,0.5)", fontFamily: SERIF }}>홍연이 두 사람에게 들려줄 이야기</p>
        <h1 className="text-[20px] font-black leading-snug" style={{ color: "#fff", fontFamily: SERIF }}>
          연애궁합이란 무엇인가
        </h1>
      </div>
      <div className="relative overflow-hidden" style={{ height: 320 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/cards/kunghap_yeonae/yeonae-0.jpg" alt="" className="absolute inset-0 w-full h-full object-cover object-top" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(17,17,17,1) 0%, rgba(17,17,17,0.3) 35%, transparent 60%, transparent 70%, rgba(253,248,244,1) 100%)" }} />
      </div>
      <div className="px-6 pt-8 pb-4">
        <p className="text-[14.5px] leading-[1.95] mb-4 whitespace-pre-line" style={{ color: INK_SOFT, fontFamily: SERIF }}>
          안녕하시오, <span style={{ color: INK, fontWeight: 800 }}>{name}님</span>과 <span style={{ color: INK, fontWeight: 800 }}>{partnerName}님</span>.{"\n"}
          홍연이오. 두 사람의 인연을 사주로 풀어드리겠소.
        </p>
        <div className="rounded-xl px-4 py-3.5 mb-6" style={{ background: CALLOUT_BG, borderLeft: `3px solid ${ROSE}` }}>
          <p className="text-[14px] leading-[1.85]" style={{ color: INK, fontFamily: SERIF }}>
            사주명리학은 태어난 연·월·일·시의 여덟 글자로{"\n"}
            두 사람의 기질·인연·궁합을 해석하는{"\n"}동양의 전통 철학이오.
          </p>
        </div>
      </div>
      <div className="px-5 pb-8">
        <div className="space-y-2 mb-8">
          {TOC_A.filter(t => t.no !== "0").map((it) => (
            <div key={it.no} className="flex items-center gap-3 py-2.5 px-4 rounded-xl" style={{ backgroundColor: `${INK}05` }}>
              <span className="text-[11px] font-bold w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${MAROON}15`, color: MAROON }}>{it.no}</span>
              <p className="text-[13px] font-bold" style={{ color: INK }}>{it.title}</p>
            </div>
          ))}
        </div>
        <button onClick={onStart} className="w-full py-4 rounded-2xl font-bold text-[16px] text-white"
          style={{ backgroundColor: MAROON, boxShadow: `0 4px 20px ${MAROON}44` }}>
          제1장부터 시작하기 →
        </button>
      </div>
    </div>
  );
}

// ─── 챕터 뷰 ─────────────────────────────────────────────────────
const TOTAL_CH = 14;

const CH_TITLES_SHORT: Record<number, string> = {
  1: "사주 원국", 2: "운명의 구조", 3: "인간관계", 4: "숨겨진 특징",
  5: "재물과 직업", 6: "사랑과 결혼", 7: "건강", 8: "귀인",
  9: "주의할 사람", 10: "굴곡과 위기", 11: "대운 흐름", 12: "주의 시기",
  13: "당부의 말", 14: "개운법",
};

function ChapterView({
  ch, content, generating, name, partnerName,
  sajuImageUrl, partnerSajuImageUrl,
  view, partnerView,
  birth, partnerBirth,
  gender, partnerGender,
  onRetry, onNext,
}: {
  ch: number; content: ReportContent | null; generating: boolean;
  name: string; partnerName: string;
  sajuImageUrl?: string | null; partnerSajuImageUrl?: string | null;
  view: MyeongsikView | null; partnerView: MyeongsikView | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  birth: any; partnerBirth: any;
  gender: string; partnerGender: string;
  onRetry: () => void; onNext: () => void;
}) {
  const sectionKeys = CHAPTER_SECTIONS[ch] ?? [];
  const ready = content ? isChapterReady(content as Record<string, unknown>, ch) : false;
  const title = CH_TITLES_SHORT[ch] ?? `제${ch}장`;

  return (
    <div>
      {/* 챕터 커버 */}
      <div className="text-center px-6 py-4" style={{ background: "#111" }}>
        <p className="text-[10px] tracking-[0.25em] mb-2" style={{ color: "rgba(255,255,255,0.5)", fontFamily: SERIF }}>제 {ch} 장</p>
        <h1 className="text-[20px] font-black leading-snug" style={{ color: "#fff", fontFamily: SERIF }}>
          {title}
        </h1>
      </div>
      <div className="relative overflow-hidden" style={{ height: 220 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/cards/kunghap_yeonae/yeonae-0.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "center 20%" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(17,17,17,1) 0%, rgba(17,17,17,0.3) 35%, transparent 60%, transparent 70%, rgba(253,248,244,1) 100%)" }} />
      </div>

      {/* 1장: 명식표 + 사주 이미지 */}
      {ch === 1 && (
        <div className="px-5 pt-6 pb-2">
          {/* 나의 명식표 */}
          <MyeongsikTable
            view={view}
            name={name}
            birth={birth}
          />
          {/* 나의 사주 이미지 */}
          {sajuImageUrl && (
            <div className="relative overflow-hidden w-full rounded-2xl mb-4" style={{ aspectRatio: "4/3" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sajuImageUrl} alt="나의 사주 원국 이미지" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${CREAM} 0%, transparent 15%, transparent 80%, ${CREAM} 100%)` }} />
              <p className="absolute bottom-3 left-0 right-0 text-center text-[11px] font-bold" style={{ color: MUTE }}>{name}님의 사주 원국</p>
            </div>
          )}
          {/* 상대방 명식표 */}
          {partnerView && (
            <MyeongsikTable
              view={partnerView}
              name={partnerName}
              birth={partnerBirth}
            />
          )}
          {/* 상대방 사주 이미지 */}
          {partnerSajuImageUrl && (
            <div className="relative overflow-hidden w-full rounded-2xl mb-4" style={{ aspectRatio: "4/3" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={partnerSajuImageUrl} alt="상대방 사주 원국 이미지" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${CREAM} 0%, transparent 15%, transparent 80%, ${CREAM} 100%)` }} />
              <p className="absolute bottom-3 left-0 right-0 text-center text-[11px] font-bold" style={{ color: MUTE }}>{partnerName}님의 사주 원국</p>
            </div>
          )}
        </div>
      )}

      {/* 본문 */}
      <div className="px-5 py-6">
        {(generating && !ready) ? (
          <LoadingDots title={title} />
        ) : !ready ? (
          <ErrorRetry onRetry={onRetry} />
        ) : (
          <>
            {sectionKeys.map((key, i) => {
              const sec = content?.[key] as Section | undefined;
              if (!sec || !sec.paragraphs?.length) return null;
              return <SectionBlock key={key} sectionKey={key} section={sec} accent={i === 0} />;
            })}
            <ChapterFooter ch={ch} name={name} partnerName={partnerName} onNext={onNext} />
          </>
        )}
      </div>

      {/* 사용 안내 (1장) */}
      {ch === 1 && (
        <div className="px-6 pb-6">
          <div className="rounded-xl px-4 py-3.5" style={{ background: CALLOUT_BG, borderLeft: `3px solid ${ROSE}` }}>
            <p className="text-[14px] leading-[1.85]" style={{ color: INK, fontFamily: SERIF }}>
              풀이를 읽다 명식이 궁금할 때면{"\n"}상단 <span style={{ fontWeight: 800 }}>"나의 명식"</span>이나 <span style={{ fontWeight: 800 }}>"상대방 명식"</span> 버튼을 누르면{"\n"}언제든 다시 꺼내볼 수 있소.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ChapterFooter({ ch, name, partnerName, onNext }: {
  ch: number; name: string; partnerName: string; onNext: () => void;
}) {
  const isLast = ch >= TOTAL_CH;
  if (isLast) {
    return (
      <div className="mt-8 text-center rounded-2xl py-8 px-6" style={{ backgroundColor: CALLOUT_BG, border: `1px solid ${ROSE}40` }}>
        <p className="text-[11px] tracking-widest mb-3" style={{ color: MAROON }}>✦ 연애궁합 완료 ✦</p>
        <p className="text-[20px] font-black mb-2" style={{ color: INK, fontFamily: SERIF }}>
          {name}님과 {partnerName}님의<br />인연을 모두 살펴봤어요
        </p>
        <p className="text-[13px]" style={{ color: MUTE }}>두 사람의 사랑이 깊어지길 홍연이 응원해요</p>
      </div>
    );
  }
  return (
    <button onClick={onNext} className="w-full mt-8 py-4 rounded-2xl font-bold text-[16px] text-white transition-all active:scale-95"
      style={{ backgroundColor: MAROON, boxShadow: `0 4px 20px ${MAROON}44` }}>
      제{ch + 1}장 — {CH_TITLES_SHORT[ch + 1]} →
    </button>
  );
}

// ─── 초기 로딩 ───────────────────────────────────────────────────
function InitLoading() {
  return (
    <div className="relative flex flex-col items-center justify-center" style={{ minHeight: "100dvh", backgroundColor: "#0a0c10" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/media/cards/kunghap_yeonae/yeonae-0.jpg"
        className="absolute inset-0 w-full h-full object-cover object-top opacity-20 pointer-events-none" alt="" />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(10,12,16,0.4) 0%, rgba(10,12,16,0.9) 70%, #0a0c10 100%)" }} />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="rounded-full animate-spin" style={{ width: 44, height: 44, border: "3px solid rgba(255,255,255,0.15)", borderTopColor: "#e0465a" }} />
        <p className="text-[15px] font-bold" style={{ color: "rgba(255,255,255,0.9)" }}>연애궁합 리포트 준비 중</p>
        <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.45)" }}>잠시만 기다려 주세요</p>
      </div>
    </div>
  );
}

// ─── 메인 ────────────────────────────────────────────────────────
function ReportPreviewInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const id             = searchParams.get("id")             ?? "";
  const ch             = searchParams.get("ch")             ?? "0";
  const gender         = searchParams.get("gender")         ?? "";
  const nameParam      = searchParams.get("name")           ?? "";
  const partnerNameParam  = searchParams.get("partnerName") ?? "";
  const partnerGenderParam = searchParams.get("partnerGender") ?? "";

  const rootRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const [msOpen, setMsOpen] = useState(false);          // 나의 명식 모달
  const [partnerMsOpen, setPartnerMsOpen] = useState(false); // 상대방 명식 모달

  type BirthMeta = { date: string; calendar: string; time: string; gender?: string } | null;

  const [report, setReport] = useState<{
    view: MyeongsikView;
    content: ReportContent;
    name: string;
    birth: BirthMeta;
    gender: string;
    sajuImageUrl?: string | null;
    partnerView?: MyeongsikView | null;
    partnerName?: string;
    partnerBirth?: BirthMeta;
    partnerGender?: string;
    partnerSajuImageUrl?: string | null;
  } | null>(null);

  const [loading, setLoading] = useState(!!id);
  const [generating, setGenerating] = useState(false);
  const [revealed, setRevealed] = useState(true);
  const startedRef = useRef(false);
  const generatedRef = useRef(false);
  const chNum = Number(ch);

  // ── 초기 로드 ──
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    if (id) {
      fetch(`/api/kunghap_yeonae-report?id=${encodeURIComponent(id)}`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => setReport({
          view: d.view,
          content: d.content ?? {},
          name: d.name ?? "",
          birth: d.birth ?? null,
          gender: d.gender ?? "",
          sajuImageUrl: d.sajuImageUrl ?? null,
          partnerView: d.partnerView ?? null,
          partnerName: d.partnerName ?? partnerNameParam,
          partnerBirth: d.partnerBirth ?? null,
          partnerGender: d.partnerGender ?? partnerGenderParam,
          partnerSajuImageUrl: d.partnerSajuImageUrl ?? null,
        }))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 전 장 병렬 생성 ──
  useEffect(() => {
    if (loading || !id || generatedRef.current) return;
    const allNums = Array.from({ length: TOTAL_CH }, (_, i) => i + 1);
    const missing = allNums.filter((n) => !isChapterReady(report?.content as Record<string, unknown> | null, n));
    if (missing.length === 0) { setRevealed(true); return; }
    generatedRef.current = true;
    setGenerating(true);
    setRevealed(false);

    Promise.all(
      missing.map((n) =>
        fetch("/api/kunghap_yeonae-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, chapter: n }),
        })
          .then((r) => r.ok ? r.json() : null)
          .catch(() => null),
      ),
    ).then((results) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const patch = Object.assign({}, ...results.filter(Boolean).map((r: any) => r.sections || {}));
      setReport((prev) => {
        if (!prev) return prev;
        const merged = { ...(prev.content as Record<string, unknown>), ...patch } as ReportContent;
        fetch("/api/kunghap_yeonae-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, content: merged }),
        }).catch(() => {});
        return { ...prev, content: merged };
      });
    }).finally(() => { setGenerating(false); setRevealed(true); });
  }, [loading, id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 단일 챕터 재시도 ──
  const retryChapter = (n: number) => {
    if (!id) return;
    setGenerating(true);
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), 90_000);
    fetch("/api/kunghap_yeonae-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, chapter: n, force: true }),
      signal: abort.signal,
    })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => {
        if (d.sections) setReport((p) => p ? { ...p, content: { ...(p.content as Record<string, unknown>), ...d.sections } as ReportContent } : p);
      })
      .catch(() => {})
      .finally(() => { clearTimeout(timer); setGenerating(false); });
  };

  // ── 스크롤 진행률 ──
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

  // ── 챕터 이동 ──
  const goTo = (n: string) => {
    const base = `id=${id}&name=${encodeURIComponent(name)}&partnerName=${encodeURIComponent(partnerName)}&gender=${encodeURIComponent(effectiveGender)}&partnerGender=${encodeURIComponent(effectivePartnerGender)}`;
    router.push(`/saju/kunghap_yeonae/report-preview?${base}&ch=${n}`);
  };

  const name = report?.name?.trim() || nameParam.trim() || "나";
  const partnerName = report?.partnerName?.trim() || partnerNameParam.trim() || "상대방";
  const effectiveGender: "female" | "male" = (report?.gender === "female" || report?.gender === "여자" || gender === "female" || gender === "여자") ? "female" : "male";
  const effectivePartnerGender: "female" | "male" = (report?.partnerGender === "female" || report?.partnerGender === "여자" || partnerGenderParam === "female" || partnerGenderParam === "여자") ? "female" : "male";

  const needGen = !!id && !!CHAPTER_SECTIONS[chNum] && !isChapterReady(report?.content as Record<string, unknown>, chNum);
  const showLoading = generating || (needGen && !generatedRef.current);

  if (loading) return <InitLoading />;

  return (
    <div ref={rootRef} style={{ backgroundColor: CREAM, minHeight: "100%" }}>
      <TopBar
        progress={progress}
        title={CHAPTER_TITLES[ch] ?? `제${ch}장`}
        onMenu={() => setTocOpen(true)}
        onMyeongsik={() => setMsOpen(true)}
        onPartnerMyeongsik={() => setPartnerMsOpen(true)}
        hasPartnerView={!!report?.partnerView}
      />
      <TocPanel
        open={tocOpen}
        onClose={() => setTocOpen(false)}
        currentNo={ch}
        onSelect={(no) => goTo(no)}
      />

      {/* 나의 명식 모달 */}
      <MyeongsikModalView
        open={msOpen}
        onClose={() => setMsOpen(false)}
        view={report?.view ?? null}
        loading={false}
        meta={report?.birth ? {
          name: report.name,
          gender: report.birth.gender || report.gender || gender,
          date: report.birth.date,
          calendar: report.birth.calendar,
          time: report.birth.time,
        } : undefined}
      />

      {/* 상대방 명식 모달 */}
      {report?.partnerView && (
        <MyeongsikModalView
          open={partnerMsOpen}
          onClose={() => setPartnerMsOpen(false)}
          view={report.partnerView}
          loading={false}
          meta={report.partnerBirth ? {
            name: partnerName,
            gender: report.partnerBirth.gender || report.partnerGender || partnerGenderParam,
            date: report.partnerBirth.date,
            calendar: report.partnerBirth.calendar,
            time: report.partnerBirth.time,
          } : undefined}
        />
      )}

      {/* 두 사람 미니 명식 (헤더 하단, 항상 표시) */}
      {(report?.view || report?.partnerView) && (
        <div className="px-4 py-3 flex gap-3 items-start" style={{ backgroundColor: CALLOUT_BG, borderBottom: `1px solid ${INK}08` }}>
          <MiniSajuCol view={report?.view ?? null} name={name} />
          {report?.partnerView && (
            <>
              <div style={{ width: 1, backgroundColor: `${INK}12`, flexShrink: 0, alignSelf: "stretch" }} />
              <MiniSajuCol view={report.partnerView} name={partnerName} />
            </>
          )}
        </div>
      )}

      {/* 본문 */}
      {ch === "0" ? (
        <ChapterIntro name={name} partnerName={partnerName} onStart={() => goTo("1")} />
      ) : generating && !revealed ? (
        <GeneratingWait />
      ) : !revealed ? (
        <AwaitReveal name={name} onReveal={() => setRevealed(true)} />
      ) : (
        <ChapterView
          ch={chNum}
          content={report?.content ?? null}
          generating={showLoading}
          name={name}
          partnerName={partnerName}
          sajuImageUrl={report?.sajuImageUrl ?? null}
          partnerSajuImageUrl={report?.partnerSajuImageUrl ?? null}
          view={report?.view ?? null}
          partnerView={report?.partnerView ?? null}
          birth={report?.birth ?? null}
          partnerBirth={report?.partnerBirth ?? null}
          gender={effectiveGender}
          partnerGender={effectivePartnerGender}
          onRetry={() => retryChapter(chNum)}
          onNext={() => goTo(String(Math.min(chNum + 1, TOTAL_CH)))}
        />
      )}
    </div>
  );
}

export default function KunghapYeonaeReportPreviewPage() {
  return (
    <Suspense fallback={<InitLoading />}>
      <ReportPreviewInner />
    </Suspense>
  );
}
