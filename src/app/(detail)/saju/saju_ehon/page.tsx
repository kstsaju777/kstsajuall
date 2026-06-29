"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const BG = "#0a0a0a";
const ACCENT = "#7c6af7";
const ACCENT_D = "#4b3bbf";

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
  "방금": "#4b3bbf", "방금 전": "#4b3bbf",
  "1분 전": "#5c4fd4", "2분 전": "#5c4fd4",
  "3분 전": "#6b5a9e", "5분 전": "#6c757d", "7분 전": "#6c757d",
};

const CHAPTERS = [
  { media: { src: "/media/cards/saju_ehon/ehon-0.jpg" } },
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
            <span style={{ backgroundColor: TIME_COLORS[t.time] ?? ACCENT_D, color: "#fff", fontSize: "10px", fontWeight: 700, borderRadius: "9999px", padding: "2px 7px" }}>{t.time}</span>
            <span><b>{t.name}</b>님이 신청하였습니다.</span>
          </div>
        ))}
      </div>
      <p className="text-center text-[13px] font-bold mb-1">
        <span style={{ color: "#ffffff" }}>할인혜택 종료까지 </span>
        <span style={{ color: ACCENT }}>{timeLeft}</span>
      </p>
      <style>{`
        @keyframes ehonNeon {
          0%   { background: #7c6af7; box-shadow: 0 0 12px 3px rgba(124,106,247,0.7); }
          33%  { background: #4b3bbf; box-shadow: 0 0 12px 3px rgba(75,59,191,0.7); }
          66%  { background: #2d2080; box-shadow: 0 0 12px 3px rgba(45,32,128,0.7); }
          100% { background: #7c6af7; box-shadow: 0 0 12px 3px rgba(124,106,247,0.7); }
        }
      `}</style>
      <button
        onClick={() => router.push("/saju/saju_ehon/form")}
        className="w-full py-2 rounded-2xl font-bold active:scale-95 transition-transform"
        style={{ color: "#ffffff", fontSize: "22px", animation: "ehonNeon 3s ease-in-out infinite" }}
      >
        이혼사주 보러가기
      </button>
    </div>
  );
}

export default function EhonPage() {
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
        <p style={{ fontSize: 13, color: ACCENT_D, fontWeight: 700, marginBottom: 6 }}>이혼사주</p>
        <p style={{ fontSize: 22, color: "#fff", fontWeight: 900, marginBottom: 20 }}>리포트 미리보기</p>
        <div style={{ background: "#1a1a1a", borderRadius: 16, overflow: "hidden", marginBottom: 8 }}>
          <img src="/media/cards/saju_ehon/ehon-0.jpg" alt="미리보기" style={{ display: "block", width: "100%", height: "auto" }} />
          <div style={{ padding: "20px 20px 24px" }}>
            <p style={{ fontSize: 12, color: ACCENT_D, fontWeight: 700, marginBottom: 4 }}>+20,000자</p>
            <p style={{ fontSize: 22, color: "#fff", fontWeight: 900, marginBottom: 12 }}>2026 이혼사주</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 20 }}>
              이혼을 고민하고 있다면, 사주가 먼저 알고 있어요.<br /><br />
              두 사람의 사주팔자로 지금의 위기가 인연의 끝인지, 아니면 새로운 시작인지 홍연이 깊이 살펴봐 드릴게요.
            </p>
            {[
              "사주로 본 결혼 인연과 부부 궁합",
              "지금 이 위기, 사주에서 이미 보였다",
              "배우자 사주에서 본 관계의 진실",
              "이혼이 맞는 선택인지 사주로 판단하기 🔍",
              "이혼 후 삶의 흐름과 운의 변화 📊",
              "재혼 가능성과 새로운 인연의 시기",
              "[중요 🔥] 지금 당장 확인해야 할 것들",
              "이혼을 막을 수 있는 마지막 기회",
              "홍연이 전하는 솔직한 조언",
              "앞으로의 삶, 더 나아질 수 있어요",
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
            name: "최**", avatar: "🌿", tag: "신금일간 🌙 | 이혼 고민 중인 사람",
            stars: 5, product: "이혼사주 💜",
            text: "남편과 몇 년째 갈등이 반복되면서 이혼을 진지하게 고민했어요. 홍연 사주를 보고 나서 지금 이 시기가 왜 힘든지, 앞으로 어떻게 될지 보이더라고요. 단순히 이혼해라 말아라가 아니라 제 사주에서 나오는 흐름을 짚어줘서 결정하는 데 정말 큰 도움이 됐어요.",
          },
          {
            name: "정**", avatar: "🌙", tag: "계수일간 💧 | 별거 중인 사람",
            stars: 5, product: "이혼사주 💜",
            text: "별거한 지 6개월이 됐는데 이혼을 해야 할지 계속 망설였어요. 사주에서 지금 시기가 어떤 운인지, 이후 삶이 어떻게 펼쳐지는지까지 나와서 마음을 정리하는 데 도움이 많이 됐어요. 혼자 끙끙 앓던 게 조금 풀린 느낌이에요.",
          },
          {
            name: "한**", avatar: "🍂", tag: "무토일간 🌾 | 이혼 후 새 출발 준비 중",
            stars: 5, product: "이혼사주 💜",
            text: "이혼하고 나서 앞날이 너무 막막했는데, 사주에서 앞으로의 운 흐름이랑 재혼 시기까지 봐줘서 희망이 생겼어요. 새로운 인연이 언제쯤 오는지, 어떤 삶이 기다리고 있는지 알고 나니 한결 가벼워졌어요.",
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
            <p style={{ fontSize: 12, color: ACCENT, fontWeight: 700, marginBottom: 8 }}>선택: {review.product}</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>{review.text}</p>
          </div>
        ))}
      </div>

      <div style={{ height: "110px" }} />
      <StickyCTA />
    </div>
  );
}
