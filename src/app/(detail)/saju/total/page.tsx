"use client";

import { useRouter } from "next/navigation";

const BG = "#0a0a0a";

// 거친 붓글씨 폰트 (제목/카피용) — globals.css에서 로드
const BRUSH_FONT = "'East Sea Dokdo', cursive";

// ─── 7장 스토리 구성 ─────────────────────────────────────────────────────────
// 미디어 파일을 public/images/cards/ 폴더에 넣으세요
const CHAPTERS = [
  {
    chapter: "1장",
    media: { type: "image", src: "/images/cards/total-img-1.jpg" },
    bubble: null,
  },
  {
    chapter: "2장",
    media: { type: "video", src: "/images/cards/total-vid-1.webm" },
    bubble: null,
    overlayText: { text: "붉은 도포를 입은 자", position: "top" },
    cornerBubble: { text: "김방진\n도령의\n인생을" },
  },
  {
    chapter: "3장",
    media: { type: "video", src: "/images/cards/total-vid-3.webm" },
    bubble: {
      text: "사주는 운명의 지도.\n태어난 년·월·일·시,\n그 네 기둥 안에\n당신의 모든 이야기가 담겨 있소.",
      position: "bottom",
    },
  },
  {
    chapter: "4장",
    media: { type: "image", src: "/images/cards/total-img-4.jpg" },
    bubble: {
      text: "흔한 풀이는 하지 않소.\n당신의 용신·기신,\n올해의 운·사랑·재물·건강\n모두 낱낱이 읽어드리겠소.",
      position: "top",
    },
  },
  {
    chapter: "5장",
    media: { type: "video", src: "/images/cards/total-vid-5.webm" },
    bubble: {
      text: "이미 3,000명의 운명을\n홍연이 읽었소.",
      position: "bottom",
    },
  },
  {
    chapter: "6장",
    media: { type: "image", src: "/images/cards/total-img-6.jpg" },
    bubble: {
      text: "당신은 지금 어떤 계절을\n지나고 있소?\n봄이 오기 전, 가장 추운 법이니—\n두려워 마시오.",
      position: "top",
    },
  },
  {
    chapter: "7장",
    media: { type: "video", src: "/images/cards/total-vid-7.webm" },
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
    <div className="relative w-full" style={{ aspectRatio: "4/3" }}>
      {/* 상단 그라데이션 */}
      {!isFirst && (
        <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none" style={{
          height: "35%",
          background: `linear-gradient(to bottom, ${BG}, transparent)`,
        }} />
      )}

      {/* 미디어 */}
      {chapter.media.type === "video" ? (
        <video src={chapter.media.src} className="w-full h-full object-cover" autoPlay muted loop playsInline />
      ) : (
        <img src={chapter.media.src} alt="" className="w-full h-full object-cover" />
      )}

      {/* 말풍선 */}
      {chapter.bubble && (
        <Bubble text={chapter.bubble.text} position={chapter.bubble.position as "top" | "bottom"} />
      )}

      {/* 좌측 상단 둥근 말풍선 */}
      {(chapter as any).cornerBubble && (
        <div className="absolute z-20 flex items-center justify-center text-center"
          style={{
            top: "6%", left: "6%",
            width: "32%", aspectRatio: "1/1",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.92)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          }}>
          <p className="whitespace-pre-line font-bold leading-snug" style={{
            fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
            fontSize: "clamp(13px, 3.6vw, 17px)",
            color: "#1a1a1a",
          }}>
            {(chapter as any).cornerBubble.text}
          </p>
        </div>
      )}

      {/* 오버레이 텍스트 */}
      {(chapter as any).overlayText && (
        <div className="absolute z-20 left-0 right-0 text-center"
          style={{ top: (chapter as any).overlayText.position === "top" ? "0%" : undefined, bottom: (chapter as any).overlayText.position === "bottom" ? "8%" : undefined, transform: (chapter as any).overlayText.position === "top" ? "translateY(-50%)" : undefined }}>
          <p style={{
            fontFamily: BRUSH_FONT,
            fontSize: "clamp(34px, 9vw, 46px)",
            color: "#9b2335",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            textShadow: "0 0 20px rgba(155,35,53,0.5)",
          }}>
            {(chapter as any).overlayText.text}
          </p>
        </div>
      )}

      {/* 하단 그라데이션 */}
      {!isLast && (
        <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none" style={{
          height: "35%",
          background: `linear-gradient(to top, ${BG}, transparent)`,
        }} />
      )}
    </div>
  );
}

export default function TotalPage() {
  const router = useRouter();

  return (
    <div className="w-full flex flex-col relative" style={{ backgroundColor: BG }}>
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

      {/* 7장 */}
      {CHAPTERS.map((chapter, i) => (
        <ChapterBlock key={i} chapter={chapter} index={i} />
      ))}

      {/* CTA */}
      <div className="px-5 py-10 text-center" style={{ backgroundColor: BG }}>
        <p className="text-white mb-2" style={{ fontFamily: BRUSH_FONT, fontSize: "clamp(30px, 8vw, 40px)" }}>지금, 당신의 사주를 펼치시오.</p>
        <p className="text-white/50 text-[13px] mb-6">홍연이 직접 읽어드리겠소.</p>
        <button
          onClick={() => router.push("/saju/jeongtong")}
          className="w-full py-4 rounded-2xl font-bold text-[17px] text-white active:scale-95 transition-transform"
          style={{ backgroundColor: "#9b2335" }}
        >
          사주 풀이 받기
        </button>
      </div>
    </div>
  );
}
