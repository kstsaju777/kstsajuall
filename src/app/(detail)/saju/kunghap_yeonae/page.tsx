"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const BG = "#0a0a0a";
const ACCENT = "#ff6b9d";
const ACCENT_D = "#c9184a";

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
  "방금": "#c9184a", "방금 전": "#c9184a",
  "1분 전": "#9b2335", "2분 전": "#9b2335",
  "3분 전": "#b5651d", "5분 전": "#6c757d", "7분 전": "#6c757d",
};

const CHAPTERS = [
  { media: { src: "/media/cards/kunghap_yeonae/yeonae-0.jpg" } },
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

  return (
    <div className="fixed bottom-0 z-40 px-5 pb-6" style={{
      left: "max(0px, calc(50vw - 240px))",
      width: "min(100%, 480px)",
      paddingTop: "260px",
      background: "linear-gradient(to top, rgba(10,10,10,0.95) 35%, rgba(10,10,10,0.7) 60%, rgba(10,10,10,0.3) 80%, transparent)",
    }}>
      <p className="text-center text-[13px] font-bold mb-1">
        <span style={{ color: "#ffffff" }}>할인혜택 종료까지 </span>
        <span style={{ color: ACCENT }}>{timeLeft}</span>
      </p>
      <style>{`
        @keyframes yeonaeBtnNeon {
          0%   { background: #ff6b9d; box-shadow: 0 0 12px 3px rgba(255,107,157,0.7); }
          33%  { background: #e1337d; box-shadow: 0 0 12px 3px rgba(225,51,125,0.7); }
          66%  { background: #ff0a6c; box-shadow: 0 0 12px 3px rgba(255,10,108,0.7); }
          100% { background: #ff6b9d; box-shadow: 0 0 12px 3px rgba(255,107,157,0.7); }
        }
        @keyframes yeonaeBtnBeat {
          0%, 40%, 60%, 100% { transform: scale(1); }
          20% { transform: scale(1.05); }
          50% { transform: scale(1.03); }
        }
        @keyframes heartFloat {
          0%   { transform: translateY(0) scale(1);   opacity: 1; }
          80%  { transform: translateY(-80px) scale(1.2); opacity: 0.6; }
          100% { transform: translateY(-110px) scale(0.8); opacity: 0; }
        }
      `}</style>
      <div style={{ position: "relative" }}>
        {[
          { right: "12%", size: 18, delay: "0s",    dur: "1.8s" },
          { right: "6%",  size: 14, delay: "0.6s",  dur: "2.1s" },
          { right: "20%", size: 12, delay: "1.1s",  dur: "1.6s" },
          { right: "3%",  size: 20, delay: "1.6s",  dur: "2.3s" },
          { right: "16%", size: 10, delay: "0.3s",  dur: "1.9s" },
        ].map((h, i) => (
          <span key={i} style={{
            position: "absolute", bottom: "50%", right: h.right,
            fontSize: h.size, pointerEvents: "none", zIndex: 10,
            animation: `heartFloat ${h.dur} ease-out ${h.delay} infinite`,
          }}>💗</span>
        ))}
        <button
          onClick={() => router.push("/saju/kunghap_yeonae/form")}
          className="w-full py-2 rounded-2xl font-bold active:scale-95"
          style={{ color: "#fff", fontSize: "22px", animation: "yeonaeBtnNeon 3s ease-in-out infinite, yeonaeBtnBeat 2s ease-in-out infinite" }}
        >
          연애궁합 보러가기
        </button>
      </div>
    </div>
  );
}

export default function YeonaePage() {
  const router = useRouter();
  const [toasts, setToasts] = useState<{ id: number; name: string; time: string }[]>([]);
  useEffect(() => {
    const main = document.querySelector("main");
    if (main) { main.style.overflow = "hidden"; }
    return () => { if (main) main.style.overflow = ""; };
  }, []);
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const addToast = () => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, name: randomName(), time: randomTime() }]);
      timers.push(setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000));
    };
    const schedule = () => {
      const delay = 2500 + Math.random() * 5500;
      timers.push(setTimeout(() => { addToast(); if (Math.random() < 0.3) timers.push(setTimeout(addToast, 500)); schedule(); }, delay));
    };
    schedule();
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="w-full relative" style={{ height: "100dvh", backgroundColor: BG, overflow: "hidden" }}>
      <button
        onClick={() => router.back()}
        className="fixed z-50 w-9 h-9 rounded-full flex items-center justify-center"
        style={{ top: "16px", left: "max(16px, calc(50vw - 224px))", backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>

      {/* 영상 풀스크린 */}
      <video
        src="/media/cards/kunghap_yeonae/yeonae-0.mp4"
        autoPlay muted loop playsInline
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* 후기 플로팅 카드 */}
      <style>{`
        @keyframes cardAppear {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0px); }
        }
        @keyframes floatA { 0%,100%{transform:translateY(0px) rotate(-2deg)} 50%{transform:translateY(-8px) rotate(-2deg)} }
        @keyframes floatB { 0%,100%{transform:translateY(0px) rotate(1.5deg)} 50%{transform:translateY(-10px) rotate(1.5deg)} }
        @keyframes floatC { 0%,100%{transform:translateY(0px) rotate(-1deg)} 50%{transform:translateY(-7px) rotate(-1deg)} }
      `}</style>
      {[
        { top: "72px", left: "5%",  appearDelay: "1s",   floatDelay: "1.6s",  floatAnim: "floatA",
          name: "김*연", stars: 5, text: "남자친구랑 궁합 봤는데 소름돋을 정도로 정확해요 💗" },
        { top: "24%",  left: "52%", appearDelay: "2s",   floatDelay: "2.6s",  floatAnim: "floatB",
          name: "이*희", stars: 5, text: "썸타는 사람이랑 결이 맞는지 궁금했는데 딱 나왔어요!" },
        { top: "45%",  left: "4%",  appearDelay: "3s",   floatDelay: "3.6s",  floatAnim: "floatC",
          name: "최*영", stars: 5, text: "연애할 때마다 왜 힘든지 이유를 알게 됐어요 ㅠㅠ" },
      ].map((r, i) => (
        <div key={i} style={{
          position: "absolute", top: r.top, left: r.left,
          animation: `cardAppear 0.6s ease ${r.appearDelay} forwards, ${r.floatAnim} 3.8s ease-in-out ${r.floatDelay} infinite`,
          animationFillMode: "both",
          opacity: 0,
          backgroundColor: "rgba(255,255,255,0.3)", backdropFilter: "blur(6px)",
          border: "1px solid rgba(255,255,255,0.3)",
          borderRadius: "14px", padding: "8px 12px",
          maxWidth: "185px", zIndex: 42, pointerEvents: "none",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#111" }}>{r.name}</span>
            <span style={{ fontSize: "13px", color: "#ffcc00" }}>{"★".repeat(r.stars)}</span>
          </div>
          <p style={{ fontSize: "13px", color: "#222", margin: 0, lineHeight: 1.5, wordBreak: "keep-all" }}>{r.text}</p>
        </div>
      ))}
      {/* 타이포 오버레이 */}
      <img
        src="/media/cards/kunghap_yeonae/typo-1.png"
        alt=""
        style={{ position: "absolute", bottom: "145px", left: "7.5%", width: "85%", objectFit: "contain", pointerEvents: "none", zIndex: 41 }}
      />

      {/* 상단 토스트 */}
      <style>{`
        @keyframes toastInRight { from { opacity: 0; transform: translateX(60px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
      <div style={{ position: "fixed", bottom: "250px", right: "max(8px, calc(50vw - 232px))", zIndex: 50, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, pointerEvents: "none" }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            animation: "toastInRight 0.35s ease",
            display: "flex", alignItems: "center", gap: "6px",
            backgroundColor: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "9999px", padding: "6px 14px", fontSize: "12px", color: "#fff", whiteSpace: "nowrap",
            backdropFilter: "blur(6px)",
          }}>
            <span style={{ backgroundColor: TIME_COLORS[t.time] ?? "#9b2335", color: "#fff", fontSize: "10px", fontWeight: 700, borderRadius: "9999px", padding: "2px 7px" }}>{t.time}</span>
            <span><b>{t.name}</b>님이 신청하였습니다.</span>
          </div>
        ))}
      </div>

      <StickyCTA />
    </div>
  );
}
