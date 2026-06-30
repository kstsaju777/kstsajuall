"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const BG = "#080a0f";
const ACCENT = "#e1337d";

const SURNAMES = ["김","이","박","최","정","강","조","윤","장","임","한","오","서","신","권"];
const ENDINGS = ["지","은","현","수","민","호","아","연","준","서","영","우","빈","진"];
const TIMES = ["방금","방금 전","1분 전","2분 전","3분 전","5분 전","7분 전"];
function randomName() { const s=SURNAMES[Math.floor(Math.random()*SURNAMES.length)]; const e=ENDINGS[Math.floor(Math.random()*ENDINGS.length)]; return `${s}*${e}`; }
function randomTime() { return TIMES[Math.floor(Math.random()*TIMES.length)]; }
const TIME_COLORS: Record<string,string> = { "방금": "#e1337d", "방금 전": "#e1337d", "1분 전": "#e1337d", "2분 전": "#e1337d", "3분 전": "#6c757d", "5분 전": "#6c757d", "7분 전": "#6c757d" };

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
        <span style={{ color: ACCENT }}>{timeLeft}</span>
      </p>
      <style>{`
        @keyframes btnPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(225,51,125,0.5); }
          50% { box-shadow: 0 0 0 8px rgba(225,51,125,0); }
        }
        @keyframes btnBounce {
          0%, 40%, 60%, 100% { transform: scale(1); }
          20% { transform: scale(1.06); }
          50% { transform: scale(1.04); }
        }
      `}</style>
      <button
        onClick={() => router.push("/saju/kunghap_gyeolhon/form")}
        className="w-full relative flex items-center justify-center active:scale-95"
        style={{
          backgroundImage: "url('/media/cards/kunghap_gyeolhon/button1.png')",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          height: "52px",
          borderRadius: "12px",
          border: "none",
          backgroundColor: "transparent",
          animation: "btnPulse 2s ease-in-out infinite, btnBounce 2.5s ease-in-out infinite",
          transition: "transform 0.1s",
        }}
      >
        <span style={{ fontSize: "22px", fontWeight: 900, color: ACCENT, textShadow: "0 1px 4px rgba(255,255,255,0.8)" }}>결혼궁합 보러가기</span>
      </button>
    </div>
  );
}

export default function GyeolhonPage() {
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
      <video src="/media/cards/kunghap_gyeolhon/gyeolhon-0.mp4" autoPlay muted loop playsInline style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
      <style>{`
        @keyframes cardAppear { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatA{0%,100%{transform:translateY(0px) rotate(-2deg)}50%{transform:translateY(-8px) rotate(-2deg)}}
        @keyframes floatB{0%,100%{transform:translateY(0px) rotate(1.5deg)}50%{transform:translateY(-10px) rotate(1.5deg)}}
        @keyframes floatC{0%,100%{transform:translateY(0px) rotate(-1deg)}50%{transform:translateY(-7px) rotate(-1deg)}}
      `}</style>
      {[
        {top:"72px",left:"5%",appearDelay:"1s",floatDelay:"1.6s",floatAnim:"floatA",name:"최*은",stars:5,text:"결혼 전에 궁합 봤는데 진짜 잘 맞는 사람이었어요 💍"},
        {top:"24%",left:"52%",appearDelay:"2s",floatDelay:"2.6s",floatAnim:"floatB",name:"장*희",stars:5,text:"결혼 시기 물어봤는데 딱 그 시기에 만나게 됐어요!"},
      ].map((r,i)=>(
        <div key={i} style={{position:"absolute",top:r.top,left:r.left,animation:`cardAppear 0.6s ease ${r.appearDelay} forwards, ${r.floatAnim} 3.8s ease-in-out ${r.floatDelay} infinite`,animationFillMode:"both",opacity:0,backgroundColor:"rgba(255,255,255,0.3)",backdropFilter:"blur(6px)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:"14px",padding:"8px 12px",maxWidth:"185px",zIndex:42,pointerEvents:"none"}}>
          <div style={{display:"flex",alignItems:"center",gap:"5px",marginBottom:"4px"}}>
            <span style={{fontSize:"13px",fontWeight:700,color:"#111"}}>{r.name}</span>
            <span style={{fontSize:"13px",color:"#ffcc00"}}>{"★".repeat(r.stars)}</span>
          </div>
          <p style={{fontSize:"13px",color:"#222",margin:0,lineHeight:1.5,wordBreak:"keep-all"}}>{r.text}</p>
        </div>
      ))}
      <img src="/media/cards/kunghap_gyeolhon/typo-gyeolhon.png" alt="" style={{position:"absolute",bottom:"150px",left:"7.5%",width:"85%",objectFit:"contain",pointerEvents:"none",zIndex:41}}/>
      <style>{`@keyframes toastInRight { from { opacity:0; transform:translateX(60px); } to { opacity:1; transform:translateX(0); } }`}</style>
      <div style={{position:"fixed",bottom:"250px",right:"max(8px,calc(50vw - 232px))",zIndex:50,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,pointerEvents:"none"}}>
        {toasts.map(t=>(
          <div key={t.id} style={{animation:"toastInRight 0.35s ease",display:"flex",alignItems:"center",gap:"6px",backgroundColor:"rgba(0,0,0,0.7)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:"9999px",padding:"6px 14px",fontSize:"12px",color:"#fff",whiteSpace:"nowrap",backdropFilter:"blur(6px)"}}>
            <span style={{backgroundColor:TIME_COLORS[t.time]??"#555",color:"#fff",fontSize:"10px",fontWeight:700,borderRadius:"9999px",padding:"2px 7px"}}>{t.time}</span>
            <span><b>{t.name}</b>님이 신청하였습니다.</span>
          </div>
        ))}
      </div>
      <StickyCTA/>
    </div>
  );
}
