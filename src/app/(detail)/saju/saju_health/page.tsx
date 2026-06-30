"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const BG = "#0d0905";
const PINK = "#ca884b";

const SURNAMES = ["김","이","박","최","정","강","조","윤","장","임","한","오","서","신","권"];
const ENDINGS = ["지","은","현","수","민","호","아","연","준","서","영","우","빈","진"];
const TIMES = ["방금","방금 전","1분 전","2분 전","3분 전","5분 전","7분 전"];
function randomName() { const s=SURNAMES[Math.floor(Math.random()*SURNAMES.length)]; const e=ENDINGS[Math.floor(Math.random()*ENDINGS.length)]; return `${s}*${e}`; }
function randomTime() { return TIMES[Math.floor(Math.random()*TIMES.length)]; }
const TIME_COLORS: Record<string,string> = { "방금": "#2e7d32", "방금 전": "#2e7d32", "1분 전": "#2e7d32", "2분 전": "#2e7d32", "3분 전": "#6c757d", "5분 전": "#6c757d", "7분 전": "#6c757d" };

function StickyCTA() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState("05:42:11:08");

  useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const DURATION = 5 * 3600000 + 42 * 60000 + 11 * 1000 + 80;
    const endTime = Date.now() + DURATION;
    const id = setInterval(() => {
      let diff = Math.max(0, endTime - Date.now());
      const h = Math.floor(diff / 3600000); diff %= 3600000;
      const m = Math.floor(diff / 60000);   diff %= 60000;
      const s = Math.floor(diff / 1000);    diff %= 1000;
      const cs = Math.floor(diff / 10);
      setTimeLeft(`${pad(h)}:${pad(m)}:${pad(s)}:${pad(cs)}`);
    }, 50);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed bottom-0 z-40 px-5 pb-6" style={{
      paddingTop: "260px",
      left: "max(0px, calc(50vw - 240px))",
      width: "min(100%, 480px)",
      background: "linear-gradient(to top, rgba(10,10,10,0.95) 35%, rgba(10,10,10,0.7) 60%, rgba(10,10,10,0.3) 80%, transparent)",
    }}>
      <p className="text-center text-[13px] font-bold mb-1">
        <span style={{ color: "#ffffff" }}>할인혜택 종료까지 </span>
        <span style={{ color: PINK }}>{timeLeft}</span>
      </p>
      <style>{`
        @keyframes rotateSweep {
          from { transform: translate(-50%, -50%) rotate(-45deg); }
          to   { transform: translate(-50%, -50%) rotate(315deg); }
        }
      `}</style>
      <div style={{ position: "relative", borderRadius: "12px", padding: "2px", overflow: "hidden", background: "#3a2010" }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          width: "200%", height: "200%",
          background: "conic-gradient(from 0deg, transparent 0%, transparent 70%, #C8962E 82%, #ffe8a0 88%, #C8962E 94%, transparent 100%)",
          animation: "rotateSweep 2s linear infinite",
          pointerEvents: "none",
        }} />
        <button
          onClick={() => router.push("/saju/saju_health/form")}
          className="w-full active:scale-95 transition-transform"
          style={{
            position: "relative", zIndex: 1,
            background: "linear-gradient(180deg, #3a2010 0%, #2C1A0E 50%, #1e1008 100%)",
            borderRadius: "10px",
            padding: "14px 20px",
            border: "none",
            width: "100%",
          }}
        >
          <span style={{
            fontSize: "18px", fontWeight: 800,
            color: "#ca884b",
            letterSpacing: "0.05em",
            textShadow: "0 1px 4px rgba(0,0,0,0.8)",
          }}>건강사주 보러가기</span>
        </button>
      </div>
    </div>
  );
}

export default function HealthPage() {
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
      <video src="/media/cards/saju_health/health-0.mp4" autoPlay muted loop playsInline style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
      <img src="/media/cards/saju_health/typo-health-1.png" alt="" style={{position:"absolute",bottom:"160px",left:"7.5%",width:"85%",objectFit:"contain",pointerEvents:"none",zIndex:41}}/>
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
