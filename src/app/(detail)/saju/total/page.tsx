"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const BG = "#0a0a0a";

// 소셜프루프 랜덤 이름 (성*끝글자)
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
const BADGE_COLORS = ["#9b2335", "#2d6a4f", "#1d4e89", "#b5651d", "#6a4c93", "#c9184a", "#0f766e", "#9a3412"];
function randomColor() {
  return BADGE_COLORS[Math.floor(Math.random() * BADGE_COLORS.length)];
}
// 시간 라벨(타입)별 배지 색
const TIME_COLORS: Record<string, string> = {
  "방금":    "#c9184a",
  "방금 전": "#c9184a",
  "1분 전":  "#9b2335",
  "2분 전":  "#9b2335",
  "3분 전":  "#b5651d",
  "5분 전":  "#6c757d",
  "7분 전":  "#6c757d",
};

// 거친 붓글씨 폰트 (제목/카피용) — globals.css에서 로드
const BRUSH_FONT = "'East Sea Dokdo', cursive";

// ─── 장면 사이 간격 (각각 개별 조절) ────────────────────────────────────────
// GAPS[i] = i번째 장면 위쪽 검은 간격. text를 넣으면 여백 중앙에 흰 글씨 표시.
const GAPS: { height: string; text?: string; line?: boolean; bg?: string }[] = [
  { height: "0px" },                            // 1장 위
  { height: "60px", bg: "#131921" },            // 2장 위 (그라데이션 연결)
  { height: "300px" },                          // 3장 위
  { height: "300px", text: "그의 이름은," },      // 4장 위 ← 여백 중앙 텍스트
  { height: "400px", line: true },              // 5장 위 ← 세로 흰 선
  { height: "400px", text: "내 장담하겠소" },   // 6장 위 ← 여백 중앙 텍스트
  { height: "300px", text: "고귀한 그대의 \n 사주 여덟글자로" },     // 7장 위 ← 여백 중앙 텍스트
  { height: "150px" },                          // 8장 위
  { height: "180px" },                          // 9장(CTA) 위
];

// ─── 7장 스토리 구성 ─────────────────────────────────────────────────────────
// 미디어 파일을 public/images/cards/ 폴더에 넣으세요
const CHAPTERS = [
  {
    chapter: "1장",
    media: { type: "image", src: "/images/cards/total/total-img-1.jpg" },
    bubble: null,
    bottomGrad: { color: "#131921", height: "15%" },
  },
  {
    chapter: "2장",
    media: { type: "video", src: "/images/cards/total/total-vid-1.webm" },
    bubble: null,
    topGrad: { color: "#131921", height: "15%" },
    cornerBubbles: [
      {
        top: "12%", left: "8%", width: "42%", height: "25%",
        panels: [
          { top: "0%", left: "0%", width: "120%", height: "60%", text: "단 한번의\n사주 간명으로\n역모를 막아냈다던.." },
        ],
      },
      {
        top: "90%", left: "35%", width: "58%", height: "20%",
        panels: [
          { top: "-5%",  left: "-20%",  width: "80%", height: "68%", text: "그를 마주하면\n말하지 않아도 알며" },
          { top: "50%", left: "32%", width: "68%", height: "70%", text: "묻지 않아도\n꿰뚫는다고.." },
        ],
      },
    ],
  },
  {
    chapter: "3장",
    media: { type: "image", src: "/images/cards/total/total-img-2.jpg" },
    bubble: null,
    cornerBubbles: [
      {
        top: "15%", left: "6%", width: "44%", height: "30%",
        panels: [
          { top: "-70%", left: "0%", width: "110%", height: "70%", text: "조선의 왕들도\n야심한 밤을 틈타\n몰래 찾아갔다던 자." },
        ],
      },
    ],
  },
  {
    chapter: "4장",
    media: { type: "video", src: "/images/cards/total/total-vid-2.webm" },
    bubble: null,
    circleBubbles: [
      { text: "'홍연(紅連)'", top: "62%", left: "55%", width: "40%", ratio: "5/3" },
    ],
  },
  {
    chapter: "5장",
    media: { type: "video", src: "/images/cards/total/total-0.webm" },
    bubble: null,
    circleBubbles: [
      { text: "그대 왔는가?", top: "-40%", left: "30%",  width: "40%", ratio: "3/2" },
      { text: "기다리고 있었소.", top: "80%", left: "56%", width: "40%", ratio: "4/3" },
    ],
  },
  {
    chapter: "6장",
    media: { type: "video", src: "/images/cards/total/total-vid-3.webm" },
    bubble: null,
    circleBubbles: [
      { text: "내 말 듣고나면", top: "0%", left: "8%",  width: "40%", ratio: "3/2" },
      { text: "앞으로의\n인생이 달라질거요", top: "80%", left: "45%", width: "50%", ratio: "3/2" },
    ],
  },
  {
    chapter: "7장",
    media: { type: "video", src: "/images/cards/total/total-vid-4.webm" },
    bubble: null,
    circleBubbles: [
      { text: "아주 솔직하게", top: "0%", left: "8%",  width: "35%", ratio: "4/3" },
      { text: "이야기 \n 해주겠소", top: "80%", left: "50%", width: "45%", ratio: "4/3" },
    ],
  },
  {
    chapter: "8장",
    media: { type: "video", src: "/images/cards/total/total-vid-5.webm" },
    bubble: null,
    circleBubbles: [
      { text: "자, \n 여기 앉으시오", top: "0%", left: "5%",  width: "40%", ratio: "4/3" },
      { text: "내가 묻는말에 \n 답해주겠나?", top: "110%", left: "30%", width: "40%", ratio: "4/3" },
    ],
  },
  {
    chapter: "9장",
    media: { type: "video", src: "/images/cards/total/total-vid-7.webm" },
    bubble: null,
    isCTA: true,
  },
];

function Bubble({ text, position }: { text: string; position: "top" | "bottom" }) {
  return (
    <div
      className="absolute z-20 mx-5"
      style={{
        ...(position === "top" ? { top: "16px" } : { bottom: "60px" }),
        left: 0, right: 0,
      }}
    >
      <div
        className="inline-block px-4 py-3 rounded-2xl text-center max-w-[80%]"
        style={{
          backgroundColor: "rgba(255,255,255,0.92)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
          margin: "0 auto",
          display: "block",
        }}
      >
        <p className="text-[14px] font-bold leading-relaxed whitespace-pre-line" style={{ color: "#1a1a1a" }}>
          {text}
        </p>
        {/* 말풍선 꼬리 */}
        <div
          style={{
            position: "absolute",
            ...(position === "top"
              ? { bottom: "-10px", left: "50%", transform: "translateX(-50%)", borderTop: "10px solid rgba(255,255,255,0.92)", borderLeft: "8px solid transparent", borderRight: "8px solid transparent" }
              : { top: "-10px", left: "50%", transform: "translateX(-50%)", borderBottom: "10px solid rgba(255,255,255,0.92)", borderLeft: "8px solid transparent", borderRight: "8px solid transparent" }
            ),
          }}
        />
      </div>
    </div>
  );
}

// 화면에 보일 때만 재생되는 영상 (스크롤 성능 최적화)
function LazyVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { rootMargin: "300px 0px" } // 화면 들어오기 300px 전에 미리 재생
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <video ref={ref} src={src} className="w-full h-auto block" muted loop playsInline preload="metadata" />
  );
}

function ChapterBlock({ chapter, index }: { chapter: typeof CHAPTERS[0]; index: number }) {
  const isFirst = index === 0;
  const isLast = index === CHAPTERS.length - 1;

  // 1장 — 텍스트 전용 섹션
  if (chapter.media.type === "text") {
    return (
      <div className="relative w-full flex flex-col items-center justify-center" style={{ aspectRatio: "4/3", backgroundColor: BG }}>
        {/* 배경 별빛 효과 */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at 50% 60%, rgba(155,35,53,0.18) 0%, transparent 70%)",
        }} />

        {/* 텍스트 */}
        <div className="relative z-10 text-center px-8">
          <h1 className="font-black leading-tight" style={{
            fontSize: "clamp(32px, 9vw, 44px)",
            fontFamily: "'Noto Serif KR', 'Nanum Myeongjo', serif",
            background: "linear-gradient(to bottom, #fff9c4 0%, #ffb347 40%, #ff4500 80%, #cc1100 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textShadow: "none",
            filter: "drop-shadow(0 0 12px rgba(255,80,0,0.7)) drop-shadow(0 0 30px rgba(255,40,0,0.4))",
          }}>
            조선에<br />묘한 소문이<br />있었다
          </h1>
        </div>

        {/* 하단 그라데이션 */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{
          height: "35%",
          background: `linear-gradient(to top, ${BG}, transparent)`,
        }} />
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* 상단 그라데이션 */}
      {!isFirst && (
        <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none" style={{
          height: (chapter as any).topGrad?.height ?? "35%",
          background: `linear-gradient(to bottom, ${(chapter as any).topGrad?.color ?? BG}, transparent)`,
        }} />
      )}

      {/* 미디어 — 원본 비율 유지 */}
      {chapter.media.type === "video" ? (
        <LazyVideo src={chapter.media.src} />
      ) : (
        <img src={chapter.media.src} alt="" className="w-full h-auto block" loading="lazy" />
      )}

      {/* 말풍선 */}
      {(chapter as any).bubble && (
        <Bubble text={(chapter as any).bubble.text} position={(chapter as any).bubble.position as "top" | "bottom"} />
      )}

      {/* 거친 한지 질감 말풍선 (겹친 패널 = 경계 없이 합쳐짐) */}
      {(chapter as any).cornerBubbles?.map((b: any, bi: number) => (
        <div key={bi} className="absolute z-20"
          style={{ top: b.top, left: b.left, width: b.width, height: b.height }}>
          {/* 배경 그룹 — 패널들 불투명으로 합친 뒤 그룹 전체에 한 번만 투명도/필터 */}
          <div className="absolute inset-0" style={{
            filter: "url(#rough-paper-edge)",
            opacity: 1,
          }}>
            {b.panels.map((p: any, pi: number) => (
              <div key={pi} className="absolute" style={{
                top: p.top, left: p.left, width: p.width, height: p.height,
                backgroundColor: "#ffffff",
                borderRadius: "4px",
                boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
              }} />
            ))}
          </div>
          {/* 텍스트 레이어 (선명) */}
          {b.panels.map((p: any, pi: number) => (
            <div key={pi} className="absolute flex items-center justify-center text-center px-3" style={{
              top: p.top, left: p.left, width: p.width, height: p.height,
            }}>
              <p className="whitespace-pre-line font-bold leading-snug" style={{
                fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
                fontSize: "18px",
                color: "#1a1a1a",
              }}>
                {p.text}
              </p>
            </div>
          ))}
        </div>
      ))}

      {/* 동그란 말풍선 */}
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
            fontSize: c.fontSize ?? "20px",
            color: "#1a1a1a",
          }}>
            {c.text}
          </p>
        </div>
      ))}

      {/* 오버레이 텍스트 */}
      {(chapter as any).overlayText && (
        <div className="absolute z-20 left-0 right-0 text-center"
          style={{ top: (chapter as any).overlayText.position === "top" ? "0%" : undefined, bottom: (chapter as any).overlayText.position === "bottom" ? "8%" : undefined, transform: (chapter as any).overlayText.position === "top" ? "translateY(-50%)" : undefined }}>
          <p style={{
            fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
            fontSize: "24px",
            fontWeight: 700,
            color: "#9b2335",
            letterSpacing: "0.05em",
          }}>
            {(chapter as any).overlayText.text}
          </p>
        </div>
      )}

      {/* 하단 그라데이션 */}
      {!isLast && (
        <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none" style={{
          height: (chapter as any).bottomGrad?.height ?? "35%",
          background: `linear-gradient(to top, ${(chapter as any).bottomGrad?.color ?? BG}, transparent)`,
        }} />
      )}
    </div>
  );
}

// ─── 하단 고정 CTA (카운트다운 + 토스트) — 별도 컴포넌트로 분리해 스토리 리렌더 방지 ───
function StickyCTA() {
  const router = useRouter();

  // 03:27:35:43 부터 카운트다운
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

  // 소셜프루프 토스트 (랜덤 간격, 가끔 연달아 2개)
  const [toasts, setToasts] = useState<{ id: number; name: string; time: string; color: string }[]>([]);
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const addToast = () => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, name: randomName(), time: randomTime(), color: randomColor() }]);
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
        홍연에게 사주보러 가기
      </button>
    </div>
  );
}

export default function TotalPage() {
  const router = useRouter();

  return (
    <div className="w-full flex flex-col relative" style={{ backgroundColor: BG }}>
      {/* 거친 종이 SVG 필터 정의 */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id="rough-paper-edge">
            <feTurbulence type="fractalNoise" baseFrequency="0.014 0.016" numOctaves="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="11" />
          </filter>
          <filter id="paper-texture">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="grain" />
            <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
          </filter>
        </defs>
      </svg>

      {/* 뒤로가기 */}
      <button
        onClick={() => router.back()}
        className="fixed z-50 w-9 h-9 rounded-full flex items-center justify-center"
        style={{ top: "16px", left: "max(16px, calc(50vw - 224px))", backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>

      {/* 스토리 — 장면 사이 간격 + 그라데이션 */}
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
                      fontSize: "30px",
                      fontWeight: 700,
                      color: "#ffffff",
                      letterSpacing: "0.05em",
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

      {/* 하단 여백 (고정 버튼에 마지막 장면이 가려지지 않도록) */}
      <div style={{ height: "110px" }} />

      {/* 하단 고정 CTA (별도 컴포넌트) */}
      <StickyCTA />
    </div>
  );
}
