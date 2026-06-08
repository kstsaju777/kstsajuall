"use client";

import Link from "next/link";

export interface CardData {
  image: string;
  type?: "image" | "video"; // 기본값 "image"
  badge?: string;
  tag?: string;
  name: string;
  desc: string;
  href: string;
  aspectRatio?: string;
}

export function ProductCard({ image, type, badge, tag, name, desc, href, aspectRatio = "3/4" }: CardData) {
  return (
    <Link href={href} className="group block overflow-hidden rounded-3xl bg-[#1a1a1a]">
      <div className="relative w-full overflow-hidden" style={{ aspectRatio }}>
        {/* 이미지 or 동영상 */}
        {type === "video" ? (
          <video
            src={image}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          />
        ) : (
          <img
            src={image}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        )}
        {/* 플레이스홀더 */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#2a2a2a] to-[#111]" />
        {/* 그라데이션 오버레이 */}
        <div className="absolute bottom-0 left-0 right-0 h-3/5 bg-gradient-to-t from-black/95 to-transparent" />

        {/* 하단 텍스트 영역 */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          {/* 뱃지 행 */}
          <div className="mb-1.5 flex flex-wrap gap-1">
            {badge && (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                {badge}
              </span>
            )}
            {tag && (
              <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-black">
                {tag}
              </span>
            )}
          </div>
          <p className="text-[18px] font-bold leading-tight text-white">{name}</p>
          <p className="mt-0.5 text-[10px] leading-snug text-white/60 line-clamp-2">{desc}</p>
        </div>
      </div>
    </Link>
  );
}
