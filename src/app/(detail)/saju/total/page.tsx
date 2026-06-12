"use client";

import { useRouter } from "next/navigation";

const BG = "#0a0a0a";

// ─── 미디어 슬롯 ──────────────────────────────────────────────────────────────
// 파일을 public/images/cards/ 폴더에 넣으세요:
//   total-img-1.jpg  total-vid-1.webm
//   total-img-2.jpg  total-vid-2.webm
//   total-img-3.jpg  total-vid-3.webm
//   total-img-4.jpg
const MEDIA = [
  { type: "image", src: "/images/cards/total-img-1.jpg" },
  { type: "video", src: "/images/cards/total-vid-1.webm" },
  { type: "image", src: "/images/cards/total-img-2.jpg" },
  { type: "video", src: "/images/cards/total-vid-2.webm" },
  { type: "image", src: "/images/cards/total-img-3.jpg" },
  { type: "video", src: "/images/cards/total-vid-3.webm" },
  { type: "image", src: "/images/cards/total-img-4.jpg" },
];

function MediaBlock({ item, index }: { item: typeof MEDIA[0]; index: number }) {
  const isFirst = index === 0;
  const isLast = index === MEDIA.length - 1;

  return (
    <div className="relative w-full" style={{ aspectRatio: "4/3" }}>
      {/* 상단 그라데이션 (첫 번째 제외) */}
      {!isFirst && (
        <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none" style={{
          height: "30%",
          background: `linear-gradient(to bottom, ${BG}, transparent)`,
        }} />
      )}

      {/* 미디어 */}
      {item.type === "video" ? (
        <video
          src={item.src}
          className="w-full h-full object-cover"
          autoPlay muted loop playsInline
        />
      ) : (
        <img src={item.src} alt="" className="w-full h-full object-cover" />
      )}

      {/* 하단 그라데이션 (마지막 제외) */}
      {!isLast && (
        <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none" style={{
          height: "30%",
          background: `linear-gradient(to top, ${BG}, transparent)`,
        }} />
      )}
    </div>
  );
}

export default function TotalPage() {
  const router = useRouter();

  return (
    <div className="w-full min-h-screen flex flex-col relative" style={{ backgroundColor: BG }}>
      {/* 뒤로가기 */}
      <button
        onClick={() => router.back()}
        className="fixed top-4 left-4 z-50 w-9 h-9 rounded-full flex items-center justify-center"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>

      {/* 미디어 슬롯들 */}
      <div className="flex flex-col">
        {MEDIA.map((item, i) => (
          <MediaBlock key={i} item={item} index={i} />
        ))}
      </div>

      {/* 구매 버튼 */}
      <div className="px-5 py-8">
        <button
          onClick={() => router.push("/saju/jeongtong")}
          className="w-full py-4 rounded-2xl font-bold text-[17px] text-white"
          style={{ backgroundColor: "#9b2335" }}
        >
          지금 확인하기
        </button>
      </div>
    </div>
  );
}
