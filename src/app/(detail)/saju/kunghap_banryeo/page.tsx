"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const BG = "#0a0a0a";
const ACCENT = "#b47221";
const ACCENT_D = "#b47221";

const SURNAMES = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오", "서", "신", "권"];
const ENDINGS = ["지", "은", "현", "수", "민", "호", "아", "연", "준", "서", "영", "우", "빈", "진"];
const TIMES = ["방금", "방금 전", "1분 전", "2분 전", "3분 전", "5분 전", "7분 전"];
function randomName() {
  const s = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
  const e = ENDINGS[Math.floor(Math.random() * ENDINGS.length)];
  return `${s}*${e}`;
}
function randomTime() { return TIMES[Math.floor(Math.random() * TIMES.length)]; }
const TIME_COLORS: Record<string, string> = {
  "방금": "#b47221", "방금 전": "#b47221",
  "1분 전": "#b47221", "2분 전": "#b47221",
  "3분 전": "#b5651d", "5분 전": "#6c757d", "7분 전": "#6c757d",
};

const CHAPTERS = [
  { media: { src: "/media/cards/kunghap_banryeo/banryeo-0.jpg" } },
];

function StickyCTA() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState("06:22:14:08");
  useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const DURATION = 6 * 3600000 + 22 * 60000 + 14 * 1000 + 80;
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
      timers.push(setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500));
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
            backgroundColor: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "9999px", padding: "5px 12px", fontSize: "12px", color: "#fff", whiteSpace: "nowrap",
          }}>
            <span style={{ backgroundColor: TIME_COLORS[t.time] ?? "#b47221", color: "#fff", fontSize: "10px", fontWeight: 700, borderRadius: "9999px", padding: "2px 7px" }}>{t.time}</span>
            <span><b>{t.name}</b>님이 신청하였습니다.</span>
          </div>
        ))}
      </div>
      <p className="text-center text-[13px] font-bold mb-1">
        <span style={{ color: "#ffffff" }}>할인혜택 종료까지 </span>
        <span style={{ color: ACCENT }}>{timeLeft}</span>
      </p>
      <style>{`
        @keyframes banryeoBeat {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.07); }
          30% { transform: scale(0.97); }
          45% { transform: scale(1.05); }
          60% { transform: scale(1); }
        }
        @keyframes pawStamp {
          0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
          30%  { transform: scale(1.3) rotate(-20deg); opacity: 1; }
          60%  { transform: scale(1) rotate(-20deg); opacity: 1; }
          100% { transform: scale(1) rotate(-20deg); opacity: 0; }
        }
        @keyframes pawStamp2 {
          0%   { transform: scale(0) rotate(15deg); opacity: 0; }
          30%  { transform: scale(1.3) rotate(15deg); opacity: 1; }
          60%  { transform: scale(1) rotate(15deg); opacity: 1; }
          100% { transform: scale(1) rotate(15deg); opacity: 0; }
        }
        @keyframes pawStamp3 {
          0%   { transform: scale(0) rotate(-5deg); opacity: 0; }
          30%  { transform: scale(1.3) rotate(-5deg); opacity: 1; }
          60%  { transform: scale(1) rotate(-5deg); opacity: 1; }
          100% { transform: scale(1) rotate(-5deg); opacity: 0; }
        }
      `}</style>
      <div className="relative">
        <button
          onClick={() => router.push("/saju/kunghap_banryeo/form")}
          className="w-full py-2 rounded-2xl font-bold text-white active:scale-95 overflow-hidden relative"
          style={{
            fontSize: "22px",
            background: "linear-gradient(105deg, #b47221 35%, #e8c97a 48%, #f5e0a0 53%, #e8c97a 58%, #b47221 72%)",
            backgroundSize: "200% auto",
            animation: "banryeoBeat 1.8s ease-in-out infinite",
          }}
        >
          {/* 발바닥 SVG들 */}
          {[
            { top: "10%", left: "6%", rot: -25, delay: "0s", size: 28 },
            { top: "15%", left: "22%", rot: 10, delay: "0.6s", size: 22 },
            { top: "8%", right: "18%", rot: -10, delay: "1.2s", size: 24 },
            { top: "20%", right: "5%", rot: 20, delay: "0.3s", size: 20 },
          ].map((p, i) => (
            <span key={i} style={{
              position: "absolute", top: p.top, left: p.left, right: p.right,
              pointerEvents: "none", zIndex: 2,
              animation: `pawStamp${(i % 3) + 1} 1.8s ease-in-out ${p.delay} infinite`,
              transform: `rotate(${p.rot}deg)`,
            }}>
              <svg width={p.size} height={p.size} viewBox="0 0 40 40" fill="#3b1a06">
                <ellipse cx="20" cy="26" rx="10" ry="8" />
                <ellipse cx="10" cy="15" rx="4.5" ry="3.5" />
                <ellipse cx="20" cy="11" rx="4.5" ry="3.5" />
                <ellipse cx="30" cy="15" rx="4.5" ry="3.5" />
                <ellipse cx="5" cy="23" rx="3.5" ry="3" />
                <ellipse cx="35" cy="23" rx="3.5" ry="3" />
              </svg>
            </span>
          ))}
          <span style={{ position: "relative", zIndex: 3 }}>반려궁합 보러가기</span>
        </button>
      </div>
    </div>
  );
}

export default function BanryeoPage() {
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

      {/* 이미지 */}
      <div style={{ display: "flex", flexDirection: "column", fontSize: 0, lineHeight: 0 }}>
        {CHAPTERS.map((ch, i) => (
          <div key={i} className="w-full">
            <img src={ch.media.src} alt="" loading={i === 0 ? "eager" : "lazy"}
              style={{ display: "block", width: "100%", height: "auto", margin: 0, padding: 0, verticalAlign: "bottom" }} />
          </div>
        ))}
      </div>

      {/* 리포트 미리보기 */}
      <div style={{ backgroundColor: "#111", padding: "32px 20px 40px", fontSize: "initial", lineHeight: "initial" }}>
        <p style={{ fontSize: 13, color: ACCENT_D, fontWeight: 700, marginBottom: 6 }}>반려궁합</p>
        <p style={{ fontSize: 22, color: "#fff", fontWeight: 900, marginBottom: 20 }}>리포트 미리보기</p>
        <div style={{ background: "#1a1a1a", borderRadius: 16, overflow: "hidden", marginBottom: 8 }}>
          <img src="/media/cards/kunghap_banryeo/banryeo-0.jpg" alt="미리보기" style={{ display: "block", width: "100%", height: "auto" }} />
          <div style={{ padding: "20px 20px 24px" }}>
            <p style={{ fontSize: 12, color: ACCENT_D, fontWeight: 700, marginBottom: 4 }}>+20,000자</p>
            <p style={{ fontSize: 22, color: "#fff", fontWeight: 900, marginBottom: 12 }}>2026 반려궁합</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 20 }}>
              두 사람의 사주에는 서로에게 끌리는 이유가 담겨 있어요.<br /><br />
              사주팔자로 두 사람의 궁합을 깊이 살펴보고, 함께할수록 더 좋은 관계가 될 수 있도록 홍연이 도와드릴게요.
            </p>
            {[
              "사주로 본 나의 연애 성향과 상대방 성향",
              "두 사람이 끌리는 사주적 이유",
              "상대방은 나를 어떻게 생각하고 있을까?",
              "우리 궁합, 진짜 잘 맞는 걸까? 💘",
              "연애에서 반복되는 갈등 패턴 🚩",
              "상대방의 마음을 얻는 골든 타이밍",
              "이 사람과 오래가려면 꼭 알아야 할 것",
              "사주로 본 두 사람의 결혼 가능성",
              "[주의 🔥] 절대 하면 안 되는 행동",
              "더 깊은 사랑을 위하여...",
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: ACCENT_D, flexShrink: 0, marginTop: 6 }} />
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
            name: "김**", avatar: "🌸", tag: "정화일간 🌸 | 썸 타는 중인 사람 💕",
            stars: 5, product: "반려궁합 💗",
            text: "좋아하는 사람이 생겼는데 우리 궁합이 어떤지 너무 궁금해서 봤어요. 두 사람의 연애 스타일이 얼마나 잘 맞는지, 어떤 부분에서 조심해야 하는지 정말 세세하게 나와서 깜짝 놀랐어요. 이 분석 보고 나서 상대방 대하는 방식을 조금 바꿨더니 진짜 관계가 좋아졌어요!",
          },
          {
            name: "이**", avatar: "💫", tag: "갑목일간 🌿 | 연애 중인 사람 😊",
            stars: 5, product: "반려궁합 💗",
            text: "남자친구랑 자꾸 같은 이유로 싸우는데 사주 때문인지 궁금해서 봤어요. 갈등 패턴 분석이 우리 관계를 너무 정확하게 짚어서 소름 돋았어요. 덕분에 서로를 더 잘 이해하게 됐고 싸움도 많이 줄었어요.",
          },
          {
            name: "박**", avatar: "🐱", tag: "임수일간 🌊 | 고백을 고민 중인 사람 🥺",
            stars: 5, product: "반려궁합 💗",
            text: "고백할까 말까 오래 고민했는데 궁합 보고 용기 내기로 했어요. 결혼 가능성까지 나와서 장기적으로 어떤 관계가 될지 알 수 있었어요. 결국 고백했고 지금 잘 만나고 있어요ㅎㅎ 감사합니다!",
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
            <p style={{ fontSize: 12, color: ACCENT_D, fontWeight: 700, marginBottom: 8 }}>선택: {review.product}</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>{review.text}</p>
          </div>
        ))}
      </div>

      <div style={{ height: "110px" }} />
      <StickyCTA />
    </div>
  );
}
