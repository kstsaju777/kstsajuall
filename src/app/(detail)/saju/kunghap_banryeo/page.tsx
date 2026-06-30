"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const BG = "#0a0a0a";
const ACCENT = "#b47221";

const SURNAMES = ["김","이","박","최","정","강","조","윤","장","임","한","오","서","신","권"];
const ENDINGS = ["지","은","현","수","민","호","아","연","준","서","영","우","빈","진"];
const TIMES = ["방금","방금 전","1분 전","2분 전","3분 전","5분 전","7분 전"];
function randomName() { const s=SURNAMES[Math.floor(Math.random()*SURNAMES.length)]; const e=ENDINGS[Math.floor(Math.random()*ENDINGS.length)]; return `${s}*${e}`; }
function randomTime() { return TIMES[Math.floor(Math.random()*TIMES.length)]; }
const TIME_COLORS: Record<string,string> = { "방금": "#b47221", "방금 전": "#b47221", "1분 전": "#b47221", "2분 전": "#b47221", "3분 전": "#6c757d", "5분 전": "#6c757d", "7분 전": "#6c757d" };

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
      paddingTop: "260px",
      left: "max(0px, calc(50vw - 240px))",
      width: "min(100%, 480px)",
      background: "linear-gradient(to top, rgba(10,10,10,0.85) 40%, rgba(10,10,10,0.5) 70%, transparent)",
    }}>
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
      <video src="/media/cards/kunghap_banryeo/banryeo-0.mp4" autoPlay muted loop playsInline style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
      <img src="/media/cards/kunghap_banryeo/typo-banryeo.png" alt="" style={{position:"absolute",bottom:"145px",left:"7.5%",width:"85%",objectFit:"contain",pointerEvents:"none",zIndex:41}}/>
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
