"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { heroSlides as originalSlides } from "@/config/content";

const CARD_W = 78;
const CARD_GAP = 8;
const OFFSET = (100 - CARD_W) / 2;

// 뒤에만 첫번째 클론 추가 → 마지막→첫번째만 루프, 첫번째 왼쪽은 비어있음
const slides = [
  ...originalSlides,
  originalSlides[0], // 클론 (첫번째)
];
const REAL_COUNT = originalSlides.length;
const FIRST_REAL = 0;

function getTranslate(index: number) {
  return `translateX(calc(-${index * CARD_W}% - ${index * CARD_GAP}px + ${OFFSET}%))`;
}

export function HeroCarousel() {
  const [current, setCurrent] = useState(FIRST_REAL);
  const [animated, setAnimated] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 자동 슬라이드
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((p) => p + 1);
      setAnimated(true);
    }, 4000);
  };

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // 트랜지션 끝나면 클론 → 실제 첫번째로 순간이동
  const handleTransitionEnd = () => {
    if (current === slides.length - 1) {
      setAnimated(false);
      setCurrent(0);
    }
  };

  // 실제 슬라이드 인덱스 (도트용)
  const realIndex = current === slides.length - 1 ? 0 : current;

  // 터치 스와이프
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    if (timerRef.current) clearInterval(timerRef.current);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) {
      setAnimated(true);
      setCurrent((p) => {
        const next = p + (dx > 0 ? 1 : -1);
        // 첫번째에서 왼쪽 스와이프 막기
        if (next < 0) return 0;
        return next;
      });
    }
    startTimer();
  };

  return (
    <div className="w-full overflow-hidden pt-6 pb-8">
      <div
        className="flex"
        style={{
          transform: getTranslate(current),
          transition: animated ? "transform 0.18s ease-out" : "none",
        }}
        onTransitionEnd={handleTransitionEnd}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {slides.map((slide, i) => {
          const isActive = i === current;
          return (
            <Link
              key={i}
              href={slide.href}
              className="relative flex-shrink-0 overflow-hidden rounded-3xl cursor-pointer block"
              style={{
                width: `${CARD_W}%`,
                marginRight: CARD_GAP,
                aspectRatio: "1/1",
                backgroundColor: "#1a1a1a",
                opacity: isActive ? 1 : 0.6,
                transform: isActive ? "scale(1)" : "scale(0.97)",
                transition: "opacity 0.4s, transform 0.4s",
                WebkitMaskImage: "-webkit-radial-gradient(white, black)",
              }}
            >
              {slide.type === "video" ? (
                <video
                  src={slide.image}
                  className="absolute inset-0 h-full w-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                />
              ) : (
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              )}
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#2a1f3d] to-[#111]" />
              <div className="absolute inset-x-0 top-0 -bottom-px bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="mb-2 inline-block rounded-full bg-orange-500 px-2.5 py-0.5 text-[11px] font-bold text-white">
                  {slide.badge}
                </span>
                <h2 className="font-blackhan whitespace-pre-line text-[24px] leading-tight text-white">
                  {slide.title}
                </h2>
                <p className="mt-1.5 text-[12px] text-white/70 leading-snug">{slide.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 도트 인디케이터 */}
      <div className="mt-3 flex justify-center gap-1.5 overflow-x-auto scrollbar-none px-4">
        {originalSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setAnimated(true); setCurrent(i); }}
            className={`flex-shrink-0 h-1.5 rounded-full transition-all ${
              i === realIndex ? "w-5 bg-orange-500" : "w-1.5 bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
