"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

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

const GAPS: { height: string }[] = [
  { height: "0px" },
  { height: "0px" },
  { height: "0px" },
  { height: "180px" },
];

const CHAPTERS = [
  {
    chapter: "1장",
    media: { type: "image", src: "/media/cards/kunghap_jaehwe/jaehwe-1.jpg" },
    bubble: null,
  },
  {
    chapter: "2장",
    media: { type: "image", src: "/media/cards/kunghap_jaehwe/jaehwe-2.jpg" },
    bubble: null,
  },
  {
    chapter: "3장",
    media: { type: "image", src: "/media/cards/kunghap_jaehwe/jaehwe-3.jpg" },
    bubble: null,
    isCTA: true,
  },
];

function LazyImage({ src, alt, isFirst, onReady }: { src: string; alt?: string; isFirst?: boolean; onReady?: () => void }) {
  return (
    <img src={src} alt={alt ?? ""} style={{ display: "block", width: "100%", height: "auto", margin: 0, padding: 0, verticalAlign: "bottom" }}
      loading={isFirst ? "eager" : "lazy"} onLoad={onReady} />
  );
}

function ChapterBlock({ chapter, index }: { chapter: typeof CHAPTERS[0]; index: number }) {
  const isFirst = index === 0;
  return (
    <div className="w-full">
      <LazyImage src={chapter.media.src} isFirst={isFirst} />
    </div>
  );
}

function StickyCTA() {
  const router = useRouter();

  const [timeLeft, setTimeLeft] = useState("07:35:24:15");
  useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const DURATION = 7 * 3600000 + 35 * 60000 + 24 * 1000 + 15 * 10;
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
        <span style={{ color: "#ff69b4" }}>{timeLeft}</span>
      </p>
      <button
        onClick={() => router.push("/saju/kunghap_jaehwe/form")}
        className="w-full py-2 rounded-2xl font-bold text-white active:scale-95 transition-transform"
        style={{ backgroundColor: "#ff6b9d", color: "#ffffff", fontSize: "22px" }}
      >
        재회궁합 보러가기
      </button>
    </div>
  );
}

export default function JaehwePage() {
  const router = useRouter();

  return (
    <div className="w-full flex flex-col relative" style={{ backgroundColor: BG }}>
      <button
        onClick={() => router.back()}
        className="fixed z-50 w-9 h-9 rounded-full flex items-center justify-center"
        style={{ top: "16px", left: "max(16px, calc(50vw - 224px))", backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>

      <div style={{ display: "flex", flexDirection: "column", fontSize: 0, lineHeight: 0 }}>
        {CHAPTERS.map((chapter, i) => {
          const gap = GAPS[i] ?? { height: "300px" };
          return (
            <div key={i} className="w-full">
              {gap.height !== "0px" && (
                <div className="relative w-full flex items-center justify-center" style={{ height: gap.height, backgroundColor: (gap as any).bg }}>
                  {(gap as any).line && (
                    <div style={{ position: "absolute", top: "10%", left: "50%", width: "1px", height: "40%", backgroundColor: "#ffffff", opacity: 0.7 }} />
                  )}
                  {(gap as any).text && (
                    <p className="whitespace-pre-line text-center leading-snug" style={{
                      fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
                      fontSize: "30px", fontWeight: 700, color: "#ffffff", letterSpacing: "0.05em",
                    }}>
                      {(gap as any).text}
                    </p>
                  )}
                </div>
              )}
              <ChapterBlock chapter={chapter} index={i} />
            </div>
          );
        })}
      </div>

      {/* 리포트 미리보기 */}
      <div style={{ backgroundColor: "#111", padding: "32px 20px 40px", fontSize: "initial", lineHeight: "initial" }}>
        <p style={{ fontSize: 13, color: "#9b2335", fontWeight: 700, marginBottom: 6 }}>재회사주</p>
        <p style={{ fontSize: 22, color: "#fff", fontWeight: 900, marginBottom: 20 }}>리포트 미리보기</p>
        <div style={{ background: "#1a1a1a", borderRadius: 16, overflow: "hidden", marginBottom: 8 }}>
          <img src="/media/cards/kunghap_jaehwe/jaehwe-0.jpg" alt="미리보기" style={{ display: "block", width: "100%", height: "auto" }} />
          <div style={{ padding: "20px 20px 24px" }}>
            <p style={{ fontSize: 12, color: "#9b2335", fontWeight: 700, marginBottom: 4 }}>+20,000자</p>
            <p style={{ fontSize: 22, color: "#fff", fontWeight: 900, marginBottom: 12 }}>2026 재회사주</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 20 }}>
              사랑은 때로, 사라지는 것이 아니라 잠시 길을 잃는 것일지도 몰라요.<br /><br />
              사주로 모든 마음을 헤아릴 수 조차 없겠지만, 조금이나마 간절하신 분들의 고민을 덜어드리고자 재회사주를 준비했습니다.
            </p>
            {[
              "사주로 본 나의 성향과 상대방 성향",
              "왜 그때 헤어질 수 밖에 없었을까?",
              "상대는 나에 대해 어떻게 생각하고 있을까?",
              "재회를 방해하는 결정적 실수 🚩",
              "우리의 재회 시기는 언제일까? 📅",
              "최악의 연락 타이밍 vs\n무조건 반응하는 골든타임",
              "'매달리는 사람'에서\n'다시 갖고 싶은 사람'으로",
              "사주 애착유형별 재회 접근법",
              "[주의 🔥] 재회 초기 꼭 하면 안되는 행동",
              "재회 이후 더 좋은 관계를 위하여...",
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#9b2335", flexShrink: 0, marginTop: 6 }} />
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 실제 이용 후기 */}
      <div style={{ backgroundColor: "#0a0a0a", padding: "32px 20px 40px", fontSize: "initial", lineHeight: "initial" }}>
        <p style={{ fontSize: 22, color: "#fff", fontWeight: 900, marginBottom: 24 }}>실제 이용 후기</p>
        {[
          {
            name: "김**", avatar: "🐻", tag: "금목일간 ✨ | 전 애인이 그리운 사람 😢",
            stars: 5, product: "재회 사주 💗",
            text: "헤어진 지 3개월 됐는데 아직도 잊지 못해서 재회 가능성이 궁금해서 봤어요. 저와 전 남친의 사주 궁합이랑 재회 시기까지 자세하게 나와서 놀랐습니다. 특히 우리가 왜 헤어졌는지, 어떤 부분에서 안 맞았는지 사주로 보니까 진짜 맞더라고요ㅠㅠ 재회 확률이랑 다시 만났을 때 주의점까지 알려줘서 마음의 준비가 됐어요.",
          },
          {
            name: "이**", avatar: "🌙", tag: "정화일간 🌸 | 재회를 고민중인 사람 😔",
            stars: 5, product: "재회 사주 💗",
            text: "전 여친이랑 1년 사귀다 헤어졌는데 요즘 자꾸 생각나서 연락할까 말까 고민이었어요. 사주 보니까 재회 운이 있긴 한데 시기가 중요하다고 하더라고요. 지금 바로 연락하면 안 된다는 거 보고 조금 더 기다리기로 했어요ㅋㅋ 감정적으로 행동하려던 거 막아줘서 감사합니다.",
          },
          {
            name: "박**", avatar: "🐷", tag: "임수일간 🌊 | 이별 후 힘든 사람 😭",
            stars: 5, product: "재회 사주 💗",
            text: "솔직히 반신반의하면서 봤는데 저희 이별 원인 분석이 소름 돋게 맞아서 깜짝 놀랐어요. 제가 너무 집착했던 것도 사주에 다 나오더라고요... 재회 가능성보다 제가 어떻게 변해야 하는지 알려준 게 더 도움이 됐습니다. 덕분에 마음 정리도 되고 앞으로 어떻게 해야 할지 방향이 잡혔어요.",
          },
        ].map((review, i) => (
          <div key={i} style={{ backgroundColor: "#1a1a1a", borderRadius: 16, padding: "20px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{review.avatar}</div>
              <div>
                <p style={{ fontSize: 14, color: "#fff", fontWeight: 700 }}>{review.name}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{review.tag}</p>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 2 }}>
                {Array.from({ length: review.stars }).map((_, si) => (
                  <span key={si} style={{ color: "#ffc107", fontSize: 14 }}>★</span>
                ))}
              </div>
            </div>
            <p style={{ fontSize: 12, color: "#9b2335", fontWeight: 700, marginBottom: 8 }}>선택: {review.product}</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>{review.text}</p>
          </div>
        ))}
      </div>

      <div style={{ height: "110px" }} />
      <StickyCTA />
    </div>
  );
}
