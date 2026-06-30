"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const BG = "#0a0a0a";
const ACCENT = "#4e9eff";

const SURNAMES = ["김","이","박","최","정","강","조","윤","장","임","한","오","서","신","권"];
const ENDINGS = ["지","은","현","수","민","호","아","연","준","서","영","우","빈","진"];
const TIMES = ["방금","방금 전","1분 전","2분 전","3분 전","5분 전","7분 전"];
function randomName() { const s=SURNAMES[Math.floor(Math.random()*SURNAMES.length)]; const e=ENDINGS[Math.floor(Math.random()*ENDINGS.length)]; return `${s}*${e}`; }
function randomTime() { return TIMES[Math.floor(Math.random()*TIMES.length)]; }
const TIME_COLORS: Record<string,string> = { "방금": "#4e9eff", "방금 전": "#4e9eff", "1분 전": "#4e9eff", "2분 전": "#4e9eff", "3분 전": "#6c757d", "5분 전": "#6c757d", "7분 전": "#6c757d" };

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
    <div className="fixed bottom-0 z-40 px-5 pb-6 pt-20" style={{
      left: "max(0px, calc(50vw - 240px))",
      width: "min(100%, 480px)",
      background: `linear-gradient(to top, ${BG} 55%, transparent)`,
    }}>
      <p className="text-center text-[13px] font-bold mb-1">
        <span style={{ color: "#ffffff" }}>할인혜택 종료까지 </span>
        <span style={{ color: ACCENT }}>{timeLeft}</span>
      </p>
      <style>{`
        @keyframes bizRotate {
          from { transform: translate(-50%, -50%) rotate(-45deg); }
          to   { transform: translate(-50%, -50%) rotate(315deg); }
        }
        @keyframes bizBeat {
          0%, 40%, 60%, 100% { transform: scale(1); }
          20% { transform: scale(1.05); }
          50% { transform: scale(1.03); }
        }
        @keyframes bizPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(78,158,255,0.5); }
          50% { box-shadow: 0 0 0 8px rgba(78,158,255,0); }
        }
      `}</style>
      <div style={{ position: "relative", borderRadius: "16px", padding: "2px", overflow: "hidden", background: "#1d6fce" }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          width: "200%", height: "200%",
          background: "conic-gradient(from 0deg, transparent 0%, transparent 65%, #4e9eff 78%, #a8d4ff 85%, #4e9eff 92%, transparent 100%)",
          animation: "bizRotate 2s linear infinite",
          pointerEvents: "none",
        }} />
        <button
          onClick={() => router.push("/saju/kunghap_business/form")}
          className="w-full py-2 rounded-2xl font-bold active:scale-95 transition-transform relative"
          style={{ backgroundColor: ACCENT, fontSize: "22px", color: "#fff", animation: "bizPulse 2s ease-in-out infinite, bizBeat 2.5s ease-in-out infinite" }}
        >
          비즈니스궁합 보러가기
        </button>
      </div>
    </div>
  );
}

export default function BusinessPage() {
  const router = useRouter();
  const [toasts,setToasts] = useState<{id:number;name:string;time:string}[]>([]);
  useEffect(()=>{ const main=document.querySelector("main"); if(main){main.style.overflow="hidden";} return ()=>{if(main)main.style.overflow="";}; },[]);
  useEffect(()=>{ const timers:ReturnType<typeof setTimeout>[]=[];
    const addToast=()=>{ const id=Date.now()+Math.random(); setToasts(prev=>[...prev,{id,name:randomName(),time:randomTime()}]); timers.push(setTimeout(()=>setToasts(prev=>prev.filter(t=>t.id!==id)),3000)); };
    const schedule=()=>{ const delay=2500+Math.random()*5500; timers.push(setTimeout(()=>{addToast(); if(Math.random()<0.3)timers.push(setTimeout(addToast,500)); schedule();},delay)); };
    schedule(); return ()=>timers.forEach(clearTimeout);
  },[]);
  return (
    <div className="w-full relative" style={{height:"100dvh",backgroundColor:BG,overflow:"hidden"}}>
      <button onClick={()=>router.back()} className="fixed z-50 w-9 h-9 rounded-full flex items-center justify-center" style={{top:"16px",left:"max(16px,calc(50vw - 224px))",backgroundColor:"rgba(0,0,0,0.5)"}}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <video src="/media/cards/kunghap_business/business-0.mp4" autoPlay muted loop playsInline style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
      <img src="/media/cards/kunghap_business/typo-business.png" alt="" style={{position:"absolute",bottom:"130px",left:0,width:"100%",objectFit:"contain",pointerEvents:"none",zIndex:41}}/>
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateY(-16px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <div style={{position:"fixed",top:64,left:"max(0px,calc(50vw - 240px))",width:"min(100%,480px)",zIndex:50,display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"0 20px",pointerEvents:"none"}}>
        {toasts.map(t=>(
          <div key={t.id} style={{animation:"toastIn 0.35s ease",display:"flex",alignItems:"center",gap:"6px",backgroundColor:"rgba(0,0,0,0.7)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:"9999px",padding:"6px 14px",fontSize:"12px",color:"#fff",whiteSpace:"nowrap",backdropFilter:"blur(6px)"}}>
            <span style={{backgroundColor:TIME_COLORS[t.time]??"#555",color:"#fff",fontSize:"10px",fontWeight:700,borderRadius:"9999px",padding:"2px 7px"}}>{t.time}</span>
            <span><b>{t.name}</b>님이 신청하였습니다.</span>
          </div>
        ))}
      </div>
      <StickyCTA/>
    </div>
  );
}
