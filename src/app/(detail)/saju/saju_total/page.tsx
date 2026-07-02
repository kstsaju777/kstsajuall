"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ─── 리뷰 데이터 ───────────────────────────────────────────────────────────────
const REVIEWS = [
  {
    id: 1,
    email: "car****@naver.com",
    avatar: "계묘일주",
    avatarBg: "#f3e8d2",
    avatarText: "#8b5e3c",
    rating: 5,
    date: "2026.06.08",
    content:
      "다른 곳 사주집 비교했을 때 같은 내용이라도 더 히랑적으로 해석해 주는 것 같음!\n사람을 믿는대로 된다고, 이렇게 보여하면 될지인건가 어떤 마음가짐을 가져야 되던가 어떤 얘기들을 부드럽게 제시해주는데... 그리고 발행심이 구체적이라 좋음\n잊지 않는다라라도 차라로 살면 게 좋을 것 같다 싶어 목표가 생기는 느낌\n그리고 지금남친이랑 결혼하나봄 어케알았지 키랑 직업 체형 성격까지 똑같이 맞히시 놀납\n35000원 낸 게 아깝지 않음! 열심히 살겠은",
  },
  {
    id: 2,
    email: "suh****@gmail.com",
    avatar: "청사일주",
    avatarBg: "#e8f0d8",
    avatarText: "#4a7c3f",
    rating: 5,
    date: "2026.06.08",
    content:
      "사실 광고인줄로만 알았다. 근데 지금까지의 상황을 맞추는 것 같으론 매우 상세하고 과거에 있었던 일들이 미래에 집중되어 있어 참고하기 좋습니다. 특히 대운을 이렇게 활용할지에 대해 제가 필요 느꼈던 것과 비슷해서 흐름이 합리적입니다. 연애이 들어오는 시기, 관운이 들어오는 시기를 집어 주셔서 참고하며 살아가도록 하겠습니다 ㅎㅎ 감사합니다 🙏 돈이 아깝지 않은 내용이라 주변에도 홍보할게요 🙌",
  },
  {
    id: 3,
    email: "luc****@naver.com",
    avatar: "갑오일주",
    avatarBg: "#e8d8f0",
    avatarText: "#7c3f7a",
    rating: 5,
    date: "2026.06.08",
    content:
      "와우... 인생을 팍 다 스포하네요 ㅋㅋ 전 재물운이 궁금해서 왔는데 연애/결혼/일신/직장 등등 다 쥐서 가성비 합리적입니다. 풀이 내용이 생각보다 사이트처럼 대충이 아니고 소름이 너무 돋아서 자리없잖아요 ㅎ 추천합니다! 아무래도 말하지 못한 생각들을 이렇게 보게 되니 뭔가 위로받는 것 같기도 하고 공감받은 것 같아 조금 눈물이 나기도 하네요.. 꼭 여기서 말해준 것처럼 좋은 인생을 살 수 있으면 좋겠네요! :)",
  },
  {
    id: 4,
    email: "hap****@gmail.com",
    avatar: "을묘일주",
    avatarBg: "#fce8d8",
    avatarText: "#c05a2a",
    rating: 5,
    date: "2026.06.07",
    content:
      "제가 혼자 생각했던 점들 정말 그대로 얘기해줘서 놀랐습니다... 사실 그냥 그런 점술이나 사이트처럼 대충 받점도가 맞으면 다행이겠다 했는데 소름이 너무 돋아서 신기했어요 ㅎ 추천합니다! 아무래도 말하지 못한 생각들을 이렇게 보게 되니 뭔가 위로받는 것 같기도 하고 공감받은 것 같아 조금 눈물이 나기도 하네요.. 꼭 여기서 말해준 것처럼 좋은 인생을 살 수 있으면 좋겠네요! :)",
  },
];

// ─── 미리보기 결과 아이템 ─────────────────────────────────────────────────────
const PREVIEW_ITEMS = [
  { num: 1, text: "잘 맞는 직업은 ■■■■ 분야에요." },
  { num: 2, text: "■■년 뒤, 황금 대운이 찾아와요." },
  { num: 3, text: "2028에 ■■■■ 한 사람과 결혼해요." },
];

// ─── 리뷰 캐러셀 ─────────────────────────────────────────────────────────────
function ReviewCarousel() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? REVIEWS.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === REVIEWS.length - 1 ? 0 : c + 1));

  const r = REVIEWS[current];

  return (
    <div>
      {/* 페이지네이션 */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          onClick={prev}
          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 active:bg-gray-100 text-base leading-none"
        >
          ‹
        </button>
        <span className="text-[13px] text-gray-500">
          {current + 1} / {REVIEWS.length}
        </span>
        <button
          onClick={next}
          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 active:bg-gray-100 text-base leading-none"
        >
          ›
        </button>
      </div>

      {/* 리뷰 카드 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 text-center leading-tight"
            style={{ backgroundColor: r.avatarBg, color: r.avatarText }}
          >
            {r.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-gray-800">{r.email}</p>
            <p className="text-[11px] text-gray-400">{r.avatar}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="flex gap-0.5 justify-end">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  style={{ fontSize: "13px", color: i < r.rating ? "#f59e0b" : "#e5e7eb" }}
                >
                  ★
                </span>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">{r.date}</p>
          </div>
        </div>
        <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-line">
          {r.content}
        </p>
      </div>
    </div>
  );
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────
export default function JeongtongSajuPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "#fdf8f4" }}>
      {/* ── 히어로 이미지 ── */}
      <div className="relative w-full" style={{ aspectRatio: "9/11", maxHeight: "70vh" }}>
        <img
          src="/media/hero/hero-1.jpg"
          alt="정통사주"
          className="w-full h-full object-cover object-top"
        />
        {/* 그라데이션 오버레이 */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.08) 55%, rgba(253,248,244,0.9) 88%, rgba(253,248,244,1) 100%)",
          }}
        />
        {/* 타이틀 */}
        <div className="absolute bottom-0 left-0 right-0 text-center pb-3">
          <p
            style={{
              fontSize: "56px",
              fontWeight: "800",
              color: "#c8293a",
              fontFamily: "Georgia, 'Times New Roman', serif",
              textShadow: "0 1px 6px rgba(0,0,0,0.12)",
              letterSpacing: "-2px",
              lineHeight: 1,
            }}
          >
            정통사주
          </p>
        </div>
      </div>

      {/* ── 콘텐츠 영역 ── */}
      <div className="px-5 pt-5">
        {/* 미리보기 아이템 3개 */}
        <div className="space-y-2.5 mb-7">
          {PREVIEW_ITEMS.map((item) => (
            <div
              key={item.num}
              className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-sm"
              style={{ border: "1px solid #f0ebe4" }}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
                style={{ backgroundColor: "#c8293a" }}
              >
                {item.num}
              </span>
              <p className="text-[14px] text-gray-700 font-medium">{item.text}</p>
            </div>
          ))}
        </div>

        {/* 구분선 */}
        <div className="flex items-center gap-3 mb-7">
          <div className="flex-1 h-px" style={{ backgroundColor: "#e8e0d8" }} />
          <div className="flex gap-1.5">
            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: "#ccc" }} />
            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: "#ccc" }} />
            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: "#ccc" }} />
          </div>
          <div className="flex-1 h-px" style={{ backgroundColor: "#e8e0d8" }} />
        </div>

        {/* 리뷰 섹션 */}
        <div className="mb-4">
          <h2 className="text-center text-[20px] font-bold mb-1.5" style={{ color: "#1a1a1a" }}>
            리뷰
          </h2>
          <p className="text-center text-[12px] leading-relaxed mb-6" style={{ color: "#888" }}>
            홍문당 사주 유저들의 200% 실제 후기입니다.
            <br />
            다른 유저들이 인정한 압도적인 정확도를 확인하세요!
          </p>

          <ReviewCarousel />
        </div>

        {/* 더보기 텍스트 */}
        <p className="text-center text-[12px] mt-4" style={{ color: "#aaa" }}>
          정통사주 1만개 이상의 리뷰 보기
        </p>
      </div>

      {/* ── 하단 고정 CTA ── */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-5 pb-6 pt-3 z-50"
        style={{ backgroundColor: "#fdf8f4" }}
      >
        <button
          onClick={() => router.push("/saju/saju_total/form")}
          className="w-full py-4 rounded-2xl text-white text-[17px] font-bold shadow-xl"
          style={{ backgroundColor: "#1e1e1e" }}
        >
          정통사주 바로 확인하기
        </button>
      </div>
    </div>
  );
}
