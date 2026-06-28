"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const BG = "#0a0a0a";

const SURNAMES = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오", "서", "신", "권"];
const ENDINGS = ["지", "은", "현", "수", "민", "호", "아", "연", "준", "서", "영", "우", "빈", "진"];
const TIMES = ["방금", "방금 전", "1분 전", "2분 전", "3분 전", "5분 전", "7분 전"];
function randomName() {
  const s = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
  const e = ENDINGS[Math.floor(Math.random() * ENDINGS.length)];
  return `${s}*${e}`;
}
function randomTime() {
  return TIMES[Math.floor(Math.random() * TIMES.length)];
}
const TIME_COLORS: Record<string, string> = {
  "방금":    "#c9184a",
  "방금 전": "#c9184a",
  "1분 전":  "#9b2335",
  "2분 전":  "#9b2335",
  "3분 전":  "#b5651d",
  "5분 전":  "#6c757d",
  "7분 전":  "#6c757d",
};

const GAPS: { height: string; text?: string; line?: boolean; bg?: string }[] = [
  { height: "0px" },
  { height: "60px", bg: "#131921" },
  { height: "300px", text: "그 사람이\n아직도 생각나나요?" },
  { height: "300px", text: "홍연이\n답을 알고 있소" },
  { height: "180px" },
];

const CHAPTERS = [
  {
    chapter: "1장",
    media: { type: "image", src: "/media/cards/kunghap_jaehwe/jaehwe-0.jpg" },
    bubble: null,
    bottomGrad: { color: "#131921", height: "15%" },
  },
  {
    chapter: "2장",
    media: { type: "image", src: "/media/cards/kunghap_jaehwe/jaehwe-1.png" },
    bubble: null,
    topGrad: { color: "#131921", height: "15%" },
    cornerBubbles: [
      {
        top: "10%", left: "6%", width: "50%", height: "28%",
        panels: [
          { top: "0%", left: "0%", width: "115%", height: "65%", text: "헤어진 그 사람,\n아직 마음에 남아있소?" },
        ],
      },
      {
        top: "85%", left: "30%", width: "60%", height: "22%",
        panels: [
          { top: "-5%", left: "-10%", width: "80%", height: "70%", text: "사주에 이미\n답이 적혀있소.." },
        ],
      },
    ],
  },
  {
    chapter: "3장",
    media: { type: "image", src: "/media/cards/kunghap_jaehwe/jaehwe-0.jpg" },
    bubble: null,
    circleBubbles: [
      { text: "다시 만날\n운명인지", top: "5%", left: "5%", width: "42%", ratio: "4/3" },
      { text: "그 시기가\n언제인지", top: "75%", left: "52%", width: "42%", ratio: "4/3" },
    ],
  },
  {
    chapter: "4장",
    media: { type: "image", src: "/media/cards/kunghap_jaehwe/jaehwe-1.png" },
    bubble: null,
    circleBubbles: [
      { text: "두 사람의\n인연을", top: "0%", left: "8%", width: "40%", ratio: "3/2" },
      { text: "내가\n풀어드리겠소", top: "80%", left: "48%", width: "44%", ratio: "3/2" },
    ],
    isCTA: true,
  },
];

function LazyImage({ src, alt, isFirst, onReady }: { src: string; alt?: string; isFirst?: boolean; onReady?: () => void }) {
  return (
    <img src={src} alt={alt ?? ""} className="w-full h-auto block"
      loading={isFirst ? "eager" : "lazy"} onLoad={onReady} />
  );
}

function ChapterBlock({ chapter, index }: { chapter: typeof CHAPTERS[0]; index: number }) {
  const isFirst = index === 0;
  const isLast = index === CHAPTERS.length - 1;
  const [mediaReady, setMediaReady] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  useEffect(() => { if (imgRef.current?.complete) setMediaReady(true); }, []);

  return (
    <div className="relative w-full">
      {!isFirst && (
        <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none" style={{
          height: (chapter as any).topGrad?.height ?? "35%",
          background: `linear-gradient(to bottom, ${(chapter as any).topGrad?.color ?? BG}, transparent)`,
        }} />
      )}

      <LazyImage src={chapter.media.src} isFirst={isFirst} onReady={() => setMediaReady(true)} />

      <div style={{ opacity: mediaReady ? 1 : 0, transition: "opacity 0.3s ease" }}>
        {(chapter as any).cornerBubbles?.map((b: any, bi: number) => (
          <div key={bi} className="absolute z-20"
            style={{ top: b.top, left: b.left, width: b.width, height: b.height }}>
            <div className="absolute inset-0" style={{ filter: "url(#rough-paper-edge)", opacity: 1 }}>
              {b.panels.map((p: any, pi: number) => (
                <div key={pi} className="absolute" style={{
                  top: p.top, left: p.left, width: p.width, height: p.height,
                  backgroundColor: "#ffffff", borderRadius: "4px",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
                }} />
              ))}
            </div>
            {b.panels.map((p: any, pi: number) => (
              <div key={pi} className="absolute flex items-center justify-center text-center px-3" style={{
                top: p.top, left: p.left, width: p.width, height: p.height,
              }}>
                <p className="whitespace-pre-line font-bold leading-snug" style={{
                  fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
                  fontSize: "18px", color: "#1a1a1a",
                }}>
                  {p.text}
                </p>
              </div>
            ))}
          </div>
        ))}

        {(chapter as any).circleBubbles?.map((c: any, ci: number) => (
          <div key={ci} className="absolute z-20 flex items-center justify-center text-center"
            style={{
              top: c.top, left: c.left,
              width: c.width, aspectRatio: c.ratio ?? "1/1",
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            }}>
            <p className="font-bold whitespace-pre-line leading-snug" style={{
              fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
              fontSize: "18px", color: "#1a1a1a",
            }}>
              {c.text}
            </p>
          </div>
        ))}
      </div>

      {!isLast && (
        <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none" style={{
          height: (chapter as any).bottomGrad?.height ?? "35%",
          background: `linear-gradient(to top, ${(chapter as any).bottomGrad?.color ?? BG}, transparent)`,
        }} />
      )}
    </div>
  );
}

function StickyCTA() {
  const router = useRouter();

  const [timeLeft, setTimeLeft] = useState("03:27:35:43");
  useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const DURATION = 3 * 3600000 + 27 * 60000 + 35 * 1000 + 43 * 10;
    const endTime = Date.now() + DURATION;
    const tick = () => {
      let diff = Math.max(0, endTime - Date.now());
      const h = Math.floor(diff / 3600000); diff %= 3600000;
      const m = Math.floor(diff / 60000);   diff %= 60000;
      const s = Math.floor(diff / 1000);    diff %= 1000;
      const cs = Math.floor(diff / 10);
      setTimeLeft(`${pad(h)}:${pad(m)}:${pad(s)}:${pad(cs)}`);
    };
    tick();
    const id = setInterval(tick, 50);
    return () => clearInterval(id);
  }, []);

  const [toasts, setToasts] = useState<{ id: number; name: string; time: string }[]>([]);
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const addToast = () => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, name: randomName(), time: randomTime() }]);
      timers.push(setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500));
    };
    const schedule = () => {
      const delay = 2500 + Math.random() * 5500;
      timers.push(setTimeout(() => {
        addToast();
        if (Math.random() < 0.3) timers.push(setTimeout(addToast, 500));
        schedule();
      }, delay));
    };
    schedule();
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed bottom-0 z-40 px-5 pb-6 pt-20" style={{
      left: "max(0px, calc(50vw - 240px))",
      width: "min(100%, 480px)",
      background: "linear-gradient(to top, #0a0a0a 55%, transparent)",
    }}>
      <style>{`@keyframes spFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div className="flex flex-col items-end gap-1 mb-2" style={{ minHeight: "30px" }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            animation: "spFadeIn 0.4s ease",
            display: "flex", alignItems: "center", gap: "6px",
            backgroundColor: "rgba(0,0,0,0.6)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "9999px", padding: "5px 12px",
            fontSize: "12px", color: "#fff", whiteSpace: "nowrap",
          }}>
            <span style={{
              backgroundColor: TIME_COLORS[t.time] ?? "#9b2335",
              color: "#fff", fontSize: "10px", fontWeight: 700,
              borderRadius: "9999px", padding: "2px 7px",
            }}>{t.time}</span>
            <span><b>{t.name}</b>님이 신청하였습니다.</span>
          </div>
        ))}
      </div>

      <p className="text-center text-[13px] font-bold mb-1">
        <span style={{ color: "#ffffff" }}>할인혜택 종료까지 </span>
        <span style={{ color: "#ffc107" }}>{timeLeft}</span>
      </p>
      <button
        onClick={() => router.push("/saju/jeongtong/form")}
        className="w-full py-2 rounded-2xl font-bold text-white active:scale-95 transition-transform"
        style={{ backgroundColor: "#9b2335", fontSize: "22px" }}
      >
        홍연에게 재회궁합 보러 가기
      </button>
    </div>
  );
}

export default function JaehwePage() {
  const router = useRouter();

  return (
    <div className="w-full flex flex-col relative" style={{ backgroundColor: BG }}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id="rough-paper-edge">
            <feTurbulence type="fractalNoise" baseFrequency="0.014 0.016" numOctaves="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="11" />
          </filter>
        </defs>
      </svg>

      <button
        onClick={() => router.back()}
        className="fixed z-50 w-9 h-9 rounded-full flex items-center justify-center"
        style={{ top: "16px", left: "max(16px, calc(50vw - 224px))", backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>

      <div className="flex flex-col">
        {CHAPTERS.map((chapter, i) => {
          const gap = GAPS[i] ?? { height: "300px" };
          return (
            <div key={i} className="w-full">
              {gap.height !== "0px" && (
                <div className="relative w-full flex items-center justify-center" style={{ height: gap.height, backgroundColor: (gap as any).bg }}>
                  {gap.line && (
                    <div style={{ position: "absolute", top: "10%", left: "50%", width: "1px", height: "40%", backgroundColor: "#ffffff", opacity: 0.7 }} />
                  )}
                  {gap.text && (
                    <p className="whitespace-pre-line text-center leading-snug" style={{
                      fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
                      fontSize: "30px", fontWeight: 700, color: "#ffffff", letterSpacing: "0.05em",
                    }}>
                      {gap.text}
                    </p>
                  )}
                </div>
              )}
              <ChapterBlock chapter={chapter} index={i} />
            </div>
          );
        })}
      </div>

      <div style={{ height: "110px" }} />
      <StickyCTA />
    </div>
  );
}
