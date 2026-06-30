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
        @keyframes ehonNeon {
          0%   { background: #7c6af7; box-shadow: 0 0 12px 3px rgba(124,106,247,0.7); }
          33%  { background: #4b3bbf; box-shadow: 0 0 12px 3px rgba(75,59,191,0.7); }
          66%  { background: #2d2080; box-shadow: 0 0 12px 3px rgba(45,32,128,0.7); }
          100% { background: #7c6af7; box-shadow: 0 0 12px 3px rgba(124,106,247,0.7); }
        }
      `}</style>
      <button
        onClick={() => router.push("/saju/kunghap_ehon/form")}
        className="w-full py-2 rounded-2xl font-bold active:scale-95 transition-transform"
        style={{ color: "#ffffff", fontSize: "22px", animation: "ehonNeon 3s ease-in-out infinite" }}
      >
        이혼궁합 보러가기
      </button>
    </div>
  );
}

export default function EhonPage() {
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
        src="/media/cards/kunghap_ehon/ehon-0.mp4"
        autoPlay muted loop playsInline
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center -10%" }}
      />
      <style>{`
        @keyframes cardAppear { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatA{0%,100%{transform:translateY(0px) rotate(-2deg)}50%{transform:translateY(-8px) rotate(-2deg)}}
        @keyframes floatB{0%,100%{transform:translateY(0px) rotate(1.5deg)}50%{transform:translateY(-10px) rotate(1.5deg)}}
        @keyframes floatC{0%,100%{transform:translateY(0px) rotate(-1deg)}50%{transform:translateY(-7px) rotate(-1deg)}}
      `}</style>
      {[
        {top:"72px",left:"5%",appearDelay:"1s",floatDelay:"1.6s",floatAnim:"floatA",name:"서*연",stars:5,text:"이혼 결정 전에 사주 봤는데 방향이 잡혔어요 😮‍💨"},
        {top:"24%",left:"52%",appearDelay:"2s",floatDelay:"2.6s",floatAnim:"floatB",name:"김*진",stars:5,text:"왜 결혼 생활이 힘들었는지 사주로 보니 이해됐어요"},
        {top:"45%",left:"4%",appearDelay:"3s",floatDelay:"3.6s",floatAnim:"floatC",name:"박*수",stars:5,text:"이혼 후 새 출발 시기까지 알려줘서 위로가 됐어요"},
      ].map((r,i)=>(
        <div key={i} style={{position:"absolute",top:r.top,left:r.left,animation:`cardAppear 0.6s ease ${r.appearDelay} forwards, ${r.floatAnim} 3.8s ease-in-out ${r.floatDelay} infinite`,animationFillMode:"both",opacity:0,backgroundColor:"rgba(255,255,255,0.3)",backdropFilter:"blur(6px)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:"14px",padding:"8px 12px",maxWidth:"185px",zIndex:42,pointerEvents:"none"}}>
          <div style={{display:"flex",alignItems:"center",gap:"5px",marginBottom:"4px"}}>
            <span style={{fontSize:"13px",fontWeight:700,color:"#111"}}>{r.name}</span>
            <span style={{fontSize:"13px",color:"#ffcc00"}}>{"★".repeat(r.stars)}</span>
          </div>
          <p style={{fontSize:"13px",color:"#222",margin:0,lineHeight:1.5,wordBreak:"keep-all"}}>{r.text}</p>
        </div>
      ))}
      {/* 타이포 오버레이 (임시: jpg) */}
      <img
        src="/media/cards/kunghap_ehon/typo-ehon.png"
        alt=""
        style={{ position: "absolute", bottom: "140px", left: 0, width: "100%", objectFit: "contain", pointerEvents: "none", zIndex: 41 }}
      />

      {/* 타이포 위 오른쪽 토스트 */}
      <style>{`
        @keyframes toastInRight { from { opacity: 0; transform: translateX(60px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
      <div style={{ position: "fixed", bottom: "270px", right: "max(8px, calc(50vw - 232px))", zIndex: 50, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, pointerEvents: "none" }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            animation: "toastInRight 0.35s ease",
            display: "flex", alignItems: "center", gap: "6px",
            backgroundColor: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "9999px", padding: "6px 14px", fontSize: "12px", color: "#fff", whiteSpace: "nowrap",
            backdropFilter: "blur(6px)",
          }}>
            <span style={{ backgroundColor: TIME_COLORS[t.time] ?? ACCENT_D, color: "#fff", fontSize: "10px", fontWeight: 700, borderRadius: "9999px", padding: "2px 7px" }}>{t.time}</span>
            <span><b>{t.name}</b>님이 신청하였습니다.</span>
          </div>
        ))}
      </div>

      <StickyCTA />
    </div>
  );
}
