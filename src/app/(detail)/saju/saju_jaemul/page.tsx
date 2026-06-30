"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const BG = "#080a0f";
const ACCENT = "#f9dc64";

const SURNAMES = ["김","이","박","최","정","강","조","윤","장","임","한","오","서","신","권"];
const ENDINGS = ["지","은","현","수","민","호","아","연","준","서","영","우","빈","진"];
const TIMES = ["방금","방금 전","1분 전","2분 전","3분 전","5분 전","7분 전"];
function randomName() { const s=SURNAMES[Math.floor(Math.random()*SURNAMES.length)]; const e=ENDINGS[Math.floor(Math.random()*ENDINGS.length)]; return `${s}*${e}`; }
function randomTime() { return TIMES[Math.floor(Math.random()*TIMES.length)]; }
const TIME_COLORS: Record<string,string> = { "방금": "#f9dc64", "방금 전": "#f9dc64", "1분 전": "#f9dc64", "2분 전": "#f9dc64", "3분 전": "#6c757d", "5분 전": "#6c757d", "7분 전": "#6c757d" };

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
      <style>{`
        @keyframes goldGlow {
          0%, 100% { box-shadow: 0 0 12px 3px rgba(212,160,23,0.5), 0 0 30px 6px rgba(212,160,23,0.25), inset 0 1px 0 rgba(255,220,80,0.4); }
          50% { box-shadow: 0 0 22px 8px rgba(255,200,40,0.7), 0 0 50px 14px rgba(212,160,23,0.35), inset 0 1px 0 rgba(255,240,120,0.6); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
      <p className="text-center text-[13px] font-bold mb-2">
        <span style={{ color: "#ffffff" }}>할인혜택 종료까지 </span>
        <span style={{ color: ACCENT }}>{timeLeft}</span>
      </p>
      <div style={{
        padding: "2px",
        borderRadius: "18px",
        background: "linear-gradient(135deg, #ffe066 0%, #d4a017 30%, #fff5a0 50%, #d4a017 70%, #ffe066 100%)",
        boxShadow: "0 0 18px 4px rgba(212,160,23,0.4)",
      }}>
        <button
          onClick={() => router.push("/saju/saju_jaemul/form")}
          className="w-full rounded-2xl font-bold text-white active:scale-95 transition-transform relative overflow-hidden"
          style={{
            fontSize: "22px",
            padding: "10px 0",
            background: "linear-gradient(135deg, #b8860b 0%, #d4a017 25%, #f5c842 50%, #d4a017 75%, #b8860b 100%)",
            backgroundSize: "200% auto",
            animation: "goldGlow 2s ease-in-out infinite, shimmer 3s linear infinite",
            color: "#3a1f00",
            textShadow: "0 1px 2px rgba(255,220,80,0.5)",
            letterSpacing: "0.02em",
          }}
        >
          재물사주 보러가기
        </button>
      </div>
    </div>
  );
}

export default function JaemulPage() {
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
      <video src="/media/cards/saju_jaemul/jaemul-0.mp4" autoPlay muted loop playsInline style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"64% center"}}/>
      <style>{`
        @keyframes cardAppear { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatA{0%,100%{transform:translateY(0px) rotate(-2deg)}50%{transform:translateY(-8px) rotate(-2deg)}}
        @keyframes floatB{0%,100%{transform:translateY(0px) rotate(1.5deg)}50%{transform:translateY(-10px) rotate(1.5deg)}}
        @keyframes floatC{0%,100%{transform:translateY(0px) rotate(-1deg)}50%{transform:translateY(-7px) rotate(-1deg)}}
      `}</style>
      {[
        {top:"72px",left:"5%",appearDelay:"1s",floatDelay:"1.6s",floatAnim:"floatA",name:"강*호",stars:5,text:"재물운 터지는 시기 맞아서 그 때 투자했더니 됐어요 💰"},
        {top:"24%",left:"52%",appearDelay:"2s",floatDelay:"2.6s",floatAnim:"floatB",name:"조*민",stars:5,text:"돈이 안 모이는 이유가 사주에 있었네요 소름이에요!"},
        {top:"45%",left:"4%",appearDelay:"3s",floatDelay:"3.6s",floatAnim:"floatC",name:"윤*서",stars:5,text:"부업 시작 시기 물어봤는데 딱 맞게 알려줬어요 ㅎㅎ"},
      ].map((r,i)=>(
        <div key={i} style={{position:"absolute",top:r.top,left:r.left,animation:`cardAppear 0.6s ease ${r.appearDelay} forwards, ${r.floatAnim} 3.8s ease-in-out ${r.floatDelay} infinite`,animationFillMode:"both",opacity:0,backgroundColor:"rgba(255,255,255,0.3)",backdropFilter:"blur(6px)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:"14px",padding:"8px 12px",maxWidth:"185px",zIndex:42,pointerEvents:"none"}}>
          <div style={{display:"flex",alignItems:"center",gap:"5px",marginBottom:"4px"}}>
            <span style={{fontSize:"13px",fontWeight:700,color:"#111"}}>{r.name}</span>
            <span style={{fontSize:"13px",color:"#ffcc00"}}>{"★".repeat(r.stars)}</span>
          </div>
          <p style={{fontSize:"13px",color:"#222",margin:0,lineHeight:1.5,wordBreak:"keep-all"}}>{r.text}</p>
        </div>
      ))}
      <img src="/media/cards/saju_jaemul/typo-jaemul.png" alt="" style={{position:"absolute",bottom:"160px",left:"2.5%",width:"95%",objectFit:"contain",pointerEvents:"none",zIndex:41}}/>
      <style>{`@keyframes toastInRight { from { opacity:0; transform:translateX(60px); } to { opacity:1; transform:translateX(0); } }`}</style>
      <div style={{position:"fixed",bottom:"275px",right:"max(8px,calc(50vw - 232px))",zIndex:50,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,pointerEvents:"none"}}>
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
