"use client";

import { Suspense, useEffect, useRef, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { calcSaju } from "@/lib/saju/local-manseryeok";
import { ganCharImage, jiCharImage } from "@/lib/saju/char-image";
import type { LocalSajuResult } from "@/lib/saju/local-manseryeok";
import { IMSHIN_CHAPTER_SECTIONS, isImshinChapterReady } from "@/lib/saju/imshin-report-content";

// ─── 디자인 토큰 ──────────────────────────────────────────────────────────────
const CREAM    = "#fdf8f4";
const WHITE    = "#ffffff";
const INK      = "#2a2320";
const INK_SOFT = "#5b504a";
const MUTE     = "#9a8f88";
const ROSE     = "#5bbfea";
const PINKD    = "#1a86c8";
const CALLOUT  = "#f0f8fd";
const SERIF    = "'Nanum Myeongjo', 'Apple SD Gothic Neo', serif";
const TOTAL_CH = Object.keys(IMSHIN_CHAPTER_SECTIONS).length;

const CH_TITLES: Record<number, string> = {
  0: "임신 궁합 들어가며", 1: "나의 타고난 기질과 모성 에너지", 2: "임신 시기와 운의 흐름", 3: "아이와의 인연", 4: "임신 중 건강 관리", 5: "주의사항과 올바른 접근", 6: "홍연의 편지",
};

const CH_SUBS: Record<number, string> = {
  0: "", 1: "나의 사주에 담긴 자녀 인연을 살펴봅니다", 2: "임신이 이루어지는 최적의 시기를 찾습니다", 3: "태어날 아이와의 사주적 인연입니다", 4: "임신 기간 건강을 지키는 방법을 안내합니다", 5: "주의해야 할 것들, 미리 알고 대비하세요", 6: "홍연이 당신에게 전하는 마지막 이야기",
};

const CH_IMAGES: Record<number, string> = {
  0: "/media/cards/saju_imshin/imshin-0.jpg",
  1: "/media/cards/saju_imshin/imshin-0.jpg",
  2: "/media/cards/saju_imshin/imshin-0.jpg",
  3: "/media/cards/saju_imshin/imshin-0.jpg",
  4: "/media/cards/saju_imshin/imshin-0.jpg",
  5: "/media/cards/saju_imshin/imshin-0.jpg",
  6: "/media/cards/saju_imshin/imshin-0.jpg",
};

type Section = { title: string; paragraphs: string[] };
type ReportContent = Record<string, Section | unknown>;

// ─── TopBar ───────────────────────────────────────────────────────────────────
function TopBar({ progress, title, onMenu }: { progress: number; title: string; onMenu: () => void }) {
  return (
    <div className="flex-shrink-0 relative" style={{ backgroundColor: WHITE, borderBottom: `1px solid ${INK}10` }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: `${PINKD}18` }}>
        <div className="h-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: PINKD }} />
      </div>
      <div className="flex items-center gap-3 px-4 pt-3 pb-2.5">
        <button onClick={onMenu} className="flex-shrink-0 flex flex-col gap-1 justify-center" style={{ width: 24 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-full" style={{ height: 1.5, backgroundColor: INK_SOFT, width: i === 1 ? 16 : 20 }} />
          ))}
        </button>
        <p className="flex-1 text-[13px] font-black truncate" style={{ color: INK }}>{title}</p>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${PINKD}12`, color: PINKD }}>
          임신 궁합
        </span>
      </div>
    </div>
  );
}

// ─── TocPanel ─────────────────────────────────────────────────────────────────
function TocPanel({ open, onClose, currentCh, content, onSelect }: {
  open: boolean; onClose: () => void; currentCh: number;
  content: ReportContent | null; onSelect: (n: number) => void;
}) {
  if (!open) return null;
  const items = Array.from({ length: TOTAL_CH }, (_, i) => i + 1);
  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.45)" }} onClick={onClose} />
      <div className="fixed z-50 top-0 left-0 bottom-0 flex flex-col"
        style={{ width: "min(80%, 300px)", backgroundColor: WHITE, boxShadow: "4px 0 24px rgba(0,0,0,0.15)" }}>
        <div className="flex items-center justify-between px-5 py-5" style={{ borderBottom: `1px solid ${INK}10` }}>
          <p className="text-[16px] font-black" style={{ color: INK }}>목차</p>
          <button onClick={onClose} className="flex items-center justify-center" style={{ width: 28, height: 28, color: MUTE, fontSize: 18 }}>✕</button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {items.map((n) => {
            const ready = content ? isImshinChapterReady(content, n) : false;
            const active = currentCh === n;
            return (
              <button key={n} onClick={() => { onSelect(n); onClose(); }}
                className="w-full text-left flex items-center gap-3 px-5 py-3.5 transition-colors"
                style={{ backgroundColor: active ? `${PINKD}08` : "transparent" }}>
                <span className="text-[11px] font-bold flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: active ? PINKD : ready ? `${PINKD}15` : `${INK}08`, color: active ? WHITE : ready ? PINKD : MUTE }}>
                  {n}
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold truncate" style={{ color: active ? PINKD : INK }}>{CH_TITLES[n]}</p>
                  <p className="text-[11px] truncate mt-0.5" style={{ color: MUTE }}>{ready ? "✓ 완성" : "준비 중"}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ─── 사주 명식 ───────────────────────────────────────────────────────────────
function MiniSaju({ saju, name }: { saju: LocalSajuResult | null; name: string }) {
  const pillars = saju ? [saju.pillars.time, saju.pillars.day, saju.pillars.month, saju.pillars.year] : null;
  return (
    <div>
      <p className="text-[11px] font-bold text-center mb-2" style={{ color: MUTE }}>{name}님의 사주팔자</p>
      <div className="grid grid-cols-4 gap-1">
        {(pillars ?? Array(4).fill(null)).map((p, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <span style={{ fontSize: 8, color: PINKD, lineHeight: 1 }}>{p?.stemSs || " "}</span>
            <div className="w-full aspect-square"><img src={p ? ganCharImage(p.stem) : ""} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", opacity: p ? 1 : 0 }} /></div>
            <div className="w-full aspect-square"><img src={p ? jiCharImage(p.branch) : ""} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", opacity: p ? 1 : 0 }} /></div>
            <span style={{ fontSize: 8, color: PINKD, lineHeight: 1 }}>{p?.branchSs || " "}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SajuHeader({ saju, name }: { saju: LocalSajuResult | null; name: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5"
        style={{ backgroundColor: CALLOUT, borderBottom: `1px solid ${INK}08` }}>
        <span className="text-[12px] font-bold" style={{ color: PINKD }}>✦ {name}님의 사주 명식</span>
        <span style={{ color: MUTE, fontSize: 12 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="px-4 py-4" style={{ backgroundColor: WHITE, borderBottom: `1px solid ${INK}08` }}>
          <MiniSaju saju={saju} name={name} />
        </div>
      )}
    </>
  );
}

// ─── 섹션 블록 ───────────────────────────────────────────────────────────────
function SectionBlock({ sectionKey, section, accent = false }: { sectionKey: string; section: Section; accent?: boolean }) {
  const isLetter = sectionKey === "letter";
  if (isLetter) {
    return (
      <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: CALLOUT, border: `1px solid ${ROSE}40`, boxShadow: `0 2px 12px ${PINKD}10` }}>
        <p className="text-[13px] font-bold tracking-widest mb-4" style={{ color: PINKD }}>✦ 홍연으로부터 ✦</p>
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
      <div className={accent ? "rounded-xl p-4" : ""} style={accent ? { backgroundColor: `${PINKD}06`, border: `1px solid ${PINKD}15` } : {}}>
        {section.paragraphs.map((para, i) => (
          <p key={i} className="text-[13.5px] leading-loose mb-3 last:mb-0" style={{ color: INK_SOFT }}>{para}</p>
        ))}
      </div>
    </div>
  );
}

// ─── 인트로 (ch=0) ───────────────────────────────────────────────────────────
function ChapterIntro({ name, concern, onStart }: { name: string; concern: string; onStart: () => void }) {
  return (
    <div>
      <div className="relative overflow-hidden" style={{ height: 320 }}>
        <img src="/media/cards/saju_imshin/imshin-0.jpg" alt="" className="absolute inset-0 w-full h-full object-cover object-top" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(253,248,244,0.2) 0%, rgba(253,248,244,1) 90%)" }} />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 text-center">
          <p className="text-[11px] tracking-widest mb-2" style={{ color: PINKD }}>✦ 임신 궁합 리포트 ✦</p>
          <h1 className="text-[26px] font-black leading-snug" style={{ color: INK, fontFamily: SERIF }}>
            {name}님의<br />사주 이야기를 시작할게요
          </h1>
        </div>
      </div>
      <div className="px-5 pb-8">
        {concern && (
          <div className="rounded-2xl p-5 mb-6" style={{ backgroundColor: WHITE, border: `1px solid ${INK}10`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <p className="text-[12px] font-bold mb-2" style={{ color: MUTE }}>부모님의 고민</p>
            <p className="text-[14px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: SERIF }}>{concern}</p>
          </div>
        )}
        <div className="space-y-2 mb-8">
          {Object.entries(CH_TITLES).filter(([k]) => Number(k) >= 1).map(([k, title]) => (
            <div key={k} className="flex items-center gap-3 py-2.5 px-4 rounded-xl" style={{ backgroundColor: `${INK}05` }}>
              <span className="text-[11px] font-bold w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${PINKD}15`, color: PINKD }}>{k}</span>
              <p className="text-[13px] font-bold" style={{ color: INK }}>{title}</p>
            </div>
          ))}
        </div>
        <button onClick={onStart} className="w-full py-4 rounded-2xl font-bold text-[16px] text-white"
          style={{ backgroundColor: PINKD, boxShadow: `0 4px 20px ${PINKD}44` }}>
          제1장부터 시작하기 →
        </button>
      </div>
    </div>
  );
}

// ─── 챕터 뷰 ─────────────────────────────────────────────────────────────────
function ChapterView({ ch, content, generating, name, onRetry, onNext }: {
  ch: number; content: ReportContent | null; generating: boolean;
  name: string; onRetry: () => void; onNext: () => void;
}) {
  const sectionKeys = IMSHIN_CHAPTER_SECTIONS[ch] ?? [];
  const ready = content ? isImshinChapterReady(content, ch) : false;
  const title = CH_TITLES[ch] ?? "";
  const sub = CH_SUBS[ch] ?? "";
  const imgSrc = CH_IMAGES[ch] ?? CH_IMAGES[1];

  return (
    <div>
      <div className="relative overflow-hidden" style={{ height: 220 }}>
        <img src={imgSrc} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "center 20%" }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, rgba(253,248,244,0.15) 0%, ${CREAM} 100%)` }} />
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <p className="text-[10px] tracking-widest mb-1" style={{ color: PINKD }}>✦ 제{ch}장 ✦</p>
          <h2 className="text-[22px] font-black leading-snug" style={{ color: INK, fontFamily: SERIF }}>{title}</h2>
          {sub && <p className="text-[12px] mt-1" style={{ color: MUTE }}>{sub}</p>}
        </div>
      </div>

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
            <ChapterFooter ch={ch} name={name} onNext={onNext} />
          </>
        )}
      </div>
    </div>
  );
}

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
      <p className="text-[12px]" style={{ color: MUTE }}>홍연이 사주를 들여다보고 있어요</p>
    </div>
  );
}

function ErrorRetry({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center py-16 gap-3">
      <p className="text-[14px]" style={{ color: INK_SOFT }}>이 장 풀이 생성에 실패했어요</p>
      <p className="text-[12px] text-center leading-relaxed" style={{ color: MUTE }}>일시적인 오류일 수 있어요.<br />다시 시도해 주세요.</p>
      <button onClick={onRetry} className="mt-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white" style={{ backgroundColor: PINKD }}>다시 시도</button>
    </div>
  );
}

function ChapterFooter({ ch, name, onNext }: { ch: number; name: string; onNext: () => void }) {
  const isLast = ch >= TOTAL_CH;
  if (isLast) {
    return (
      <div className="mt-8 text-center rounded-2xl py-8 px-6" style={{ backgroundColor: CALLOUT, border: `1px solid ${ROSE}40` }}>
        <p className="text-[11px] tracking-widest mb-3" style={{ color: PINKD }}>✦ 임신 궁합 완료 ✦</p>
        <p className="text-[20px] font-black mb-2" style={{ color: INK, fontFamily: SERIF }}>
          {name}님의<br />사주를 모두 살펴봤어요
        </p>
        <p className="text-[13px]" style={{ color: MUTE }}>아이의 앞날에 좋은 일들만 가득하길 홍연이 응원해요 🌸</p>
      </div>
    );
  }
  return (
    <button onClick={onNext} className="w-full mt-8 py-4 rounded-2xl font-bold text-[16px] text-white transition-all active:scale-95"
      style={{ backgroundColor: PINKD, boxShadow: `0 4px 20px ${PINKD}44` }}>
      제{ch + 1}장 — {CH_TITLES[ch + 1]} →
    </button>
  );
}

// ─── 상태 화면들 ──────────────────────────────────────────────────────────────
function AwaitReveal({ name, onReveal }: { name: string; onReveal: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-8 text-center" style={{ minHeight: "70vh" }}>
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: CALLOUT, border: `2px solid ${ROSE}` }}>
        <span style={{ fontSize: 24 }}>👶</span>
      </div>
      <p className="text-[18px] font-black mb-2" style={{ color: INK, fontFamily: SERIF }}>{name}님의 결과지가 준비됐어요</p>
      <p className="text-[13px] leading-relaxed mb-6" style={{ color: MUTE }}>모든 장의 풀이가 완성되었습니다.<br />아래 버튼을 눌러 확인해 보세요.</p>
      <button onClick={onReveal} className="px-8 py-3.5 rounded-2xl text-[15px] font-bold text-white active:scale-95 transition-all"
        style={{ backgroundColor: PINKD, boxShadow: `0 4px 20px ${PINKD}44` }}>
        결과 보기
      </button>
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
      <div className="rounded-full animate-spin mb-5" style={{ width: 44, height: 44, border: `3px solid ${PINKD}22`, borderTopColor: PINKD }} />
      <p className="text-[15px] font-bold" style={{ color: INK }}>아이의 사주를 풀이하고 있어요{d}</p>
      <p className="text-[13px] mt-1" style={{ color: MUTE }}>홍연이 사주를 살피는 중이에요</p>
    </div>
  );
}

function InitLoading() {
  return (
    <div className="relative flex flex-col items-center justify-center" style={{ minHeight: "100dvh", backgroundColor: "#0a0c10" }}>
      <img src="/media/cards/saju_imshin/imshin-0.jpg"
        className="absolute inset-0 w-full h-full object-cover object-top opacity-20 pointer-events-none" alt="" />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(10,12,16,0.4) 0%, rgba(10,12,16,0.9) 70%, #0a0c10 100%)" }} />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="rounded-full animate-spin" style={{ width: 44, height: 44, border: "3px solid rgba(255,255,255,0.15)", borderTopColor: "#5bbfea" }} />
        <p className="text-[15px] font-bold" style={{ color: "rgba(255,255,255,0.9)" }}>임신 궁합 리포트 준비 중</p>
        <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.45)" }}>잠시만 기다려 주세요</p>
      </div>
    </div>
  );
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────
function ReportPreviewInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const id       = searchParams.get("id")       ?? "";
  const ch       = searchParams.get("ch")       ?? "0";
  const name     = searchParams.get("name")     ?? "아이";
  const date     = searchParams.get("date")     ?? "";
  const time     = searchParams.get("time")     ?? "시간 모름";
  const calendar = searchParams.get("calendar") ?? "양력";
  const gender   = searchParams.get("gender")   ?? "";
  const email    = searchParams.get("email")    ?? "";
  const concern  = searchParams.get("concern")  ?? "";

  const saju = useMemo(() => calcSaju(date, time, calendar), [date, time, calendar]);

  const [resultId, setResultId] = useState(id);
  const [content, setContent] = useState<ReportContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const startedRef = useRef(false);
  const generatedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollPct, setScrollPct] = useState(0);

  const chNum = Number(ch);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setScrollPct(Math.min(100, (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100 || 0));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 0 }); }, [ch]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    if (id) {
      fetch(`/api/imshin-report?id=${encodeURIComponent(id)}`)
        .then((r) => r.ok ? r.json() : Promise.reject())
        .then((d) => { setContent(d.content ?? {}); })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (date) {
      fetch("/api/imshin-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, date, time, calendar, gender, email, concern }),
      })
        .then((r) => r.ok ? r.json() : Promise.reject())
        .then((d) => {
          setContent(d.content ?? {});
          const rid = d.resultId ?? "";
          setResultId(rid);
          if (rid) {
            router.replace(`/saju/saju_imshin/report-preview?id=${rid}&name=${encodeURIComponent(name)}&gender=${encodeURIComponent(gender)}&ch=0`);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (loading || !resultId || generatedRef.current) return;
    const allNums = Object.keys(IMSHIN_CHAPTER_SECTIONS).map(Number);
    const missing = allNums.filter((n) => !isImshinChapterReady(content, n));
    if (missing.length === 0) { setRevealed(true); return; }
    generatedRef.current = true;
    setGenerating(true);
    setRevealed(false);

    Promise.all(
      missing.map((n) =>
        fetch("/api/imshin-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: resultId, chapter: n }),
        })
          .then((r) => r.ok ? r.json() : null)
          .catch(() => null),
      ),
    ).then((results) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const patch = Object.assign({}, ...results.filter(Boolean).map((r: any) => r.sections || {}));
      setContent((prev) => {
        const merged = { ...(prev ?? {}), ...patch } as ReportContent;
        fetch("/api/imshin-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: resultId, content: merged }),
        }).catch(() => {});
        return merged;
      });
    }).finally(() => { setGenerating(false); setRevealed(true); });
  }, [loading, resultId]); // eslint-disable-line react-hooks/exhaustive-deps

  const retryChapter = (n: number) => {
    if (!resultId) return;
    setGenerating(true);
    fetch("/api/imshin-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: resultId, chapter: n, force: true }),
    })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => { if (d.sections) setContent((p) => ({ ...(p ?? {}), ...d.sections } as ReportContent)); })
      .catch(() => {})
      .finally(() => setGenerating(false));
  };

  const goTo = (n: number) => {
    const base = `id=${resultId}&name=${encodeURIComponent(name)}&gender=${encodeURIComponent(gender)}`;
    router.push(`/saju/saju_imshin/report-preview?${base}&ch=${n}`);
  };

  if (loading) return <InitLoading />;

  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: CREAM }}>
      <TopBar progress={scrollPct} title={CH_TITLES[chNum] ?? `제${chNum}장`} onMenu={() => setTocOpen(true)} />
      <TocPanel open={tocOpen} onClose={() => setTocOpen(false)} currentCh={chNum} content={content} onSelect={goTo} />
      <SajuHeader saju={saju} name={name} />

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        {chNum === 0 ? (
          <ChapterIntro name={name} concern={concern} onStart={() => goTo(1)} />
        ) : generating && !revealed ? (
          <GeneratingWait />
        ) : !revealed ? (
          <AwaitReveal name={name} onReveal={() => setRevealed(true)} />
        ) : (
          <ChapterView
            ch={chNum} content={content} generating={generating} name={name}
            onRetry={() => retryChapter(chNum)} onNext={() => goTo(Math.min(chNum + 1, TOTAL_CH))}
          />
        )}
      </div>
    </div>
  );
}

export default function ChildReportPreviewPage() {
  return (
    <Suspense fallback={<InitLoading />}>
      <ReportPreviewInner />
    </Suspense>
  );
}
