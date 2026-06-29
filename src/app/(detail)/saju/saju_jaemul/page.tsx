"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const BG = "#080a0f";
const ACCENT = "#f9dc64";

const SURNAMES = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임"];
const ENDINGS = ["지", "은", "현", "수", "민", "아", "연", "준", "서", "우"];
const TIMES = ["방금", "방금 전", "1분 전", "2분 전", "3분 전", "5분 전"];
function randomName() {
  return `${SURNAMES[Math.floor(Math.random() * SURNAMES.length)]}*${ENDINGS[Math.floor(Math.random() * ENDINGS.length)]}`;
}
function randomTime() {
  return TIMES[Math.floor(Math.random() * TIMES.length)];
}
const TIME_COLORS: Record<string, string> = {
  "방금": "#d4a017", "방금 전": "#d4a017",
  "1분 전": "#b8860b", "2분 전": "#b8860b",
  "3분 전": "#8b6914", "5분 전": "#6c757d",
};

function StickyCTA() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState("05:42:11:08");
  const [toasts, setToasts] = useState<{ id: number; name: string; time: string }[]>([]);

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

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const addToast = () => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, name: randomName(), time: randomTime() }]);
      timers.push(setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500));
    };
    const schedule = () => {
      const delay = 2500 + Math.random() * 5500;
      timers.push(setTimeout(() => { addToast(); if (Math.random() < 0.3) timers.push(setTimeout(addToast, 500)); schedule(); }, delay));
    };
    schedule();
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed bottom-0 z-40 px-5 pb-6 pt-20" style={{
      left: "max(0px, calc(50vw - 240px))",
      width: "min(100%, 480px)",
      background: `linear-gradient(to top, ${BG} 55%, transparent)`,
    }}>
      <style>{`@keyframes spFadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <div className="flex flex-col items-end gap-1 mb-2" style={{ minHeight: "30px" }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            animation: "spFadeIn 0.4s ease",
            display: "flex", alignItems: "center", gap: "6px",
            backgroundColor: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "9999px", padding: "5px 12px", fontSize: "12px", color: "#fff", whiteSpace: "nowrap",
          }}>
            <span style={{ backgroundColor: TIME_COLORS[t.time] ?? "#b8860b", color: "#fff", fontSize: "10px", fontWeight: 700, borderRadius: "9999px", padding: "2px 7px" }}>{t.time}</span>
            <span><b>{t.name}</b>님이 신청하였습니다.</span>
          </div>
        ))}
      </div>
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
      {/* 테두리 장식 */}
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
          재물운사주 보러가기
        </button>
      </div>
    </div>
  );
}

export default function JaemulSajuPage() {
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

      {/* 메인 이미지 */}
      <div style={{ fontSize: 0 }}>
        <img src="/media/cards/saju_jaemul/jaemul-0.jpg" alt="재물운사주"
          style={{ display: "block", width: "100%", height: "auto" }} />
      </div>

      {/* 리포트 미리보기 */}
      <div style={{ backgroundColor: "#0f0f14", padding: "32px 20px 40px" }}>
        <p style={{ fontSize: 13, color: ACCENT, fontWeight: 700, marginBottom: 6 }}>재물운사주</p>
        <p style={{ fontSize: 22, color: "#fff", fontWeight: 900, marginBottom: 20 }}>리포트 미리보기</p>
        <div style={{ background: "#1a1a22", borderRadius: 16, overflow: "hidden", marginBottom: 8 }}>
          <img src="/media/cards/saju_jaemul/jaemul-0.jpg" alt="미리보기"
            style={{ display: "block", width: "100%", height: "auto" }} />
          <div style={{ padding: "20px 20px 24px" }}>
            <p style={{ fontSize: 12, color: ACCENT, fontWeight: 700, marginBottom: 4 }}>+15,000자</p>
            <p style={{ fontSize: 22, color: "#fff", fontWeight: 900, marginBottom: 12 }}>2026 재물운사주</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 20 }}>
              돈이 왜 모이지 않는지, 언제 기회가 오는지 사주에 답이 있어요.<br /><br />
              홍연이 그대의 사주팔자를 통해 타고난 재물 그릇, 돈 버는 시기, 주의해야 할 함정까지 깊이 풀어드릴게요.
            </p>
            {[
              "나의 타고난 재물 그릇 — 얼마나 모을 수 있을까",
              "돈이 들어오는 시기 vs 나가는 시기",
              "나에게 맞는 재물 획득 방식 (직장·사업·투자)",
              "재물운을 막는 사주적 장애 요인",
              "2026년 재물운 — 지금 투자해도 될까?",
              "사주로 본 나의 부업·투자 적성",
              "재물을 지키는 법 — 새는 돈 막기",
              "홍연이 전하는 돈과 나에 대한 한 마디",
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: ACCENT, flexShrink: 0, marginTop: 6 }} />
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 후기 */}
      <div style={{ backgroundColor: "#080a0f", padding: "32px 20px 40px" }}>
        <p style={{ fontSize: 22, color: "#fff", fontWeight: 900, marginBottom: 24 }}>실제 이용 후기</p>
        {[
          {
            name: "김**", avatar: "💰", tag: "30대 직장인",
            stars: 5, text: "돈이 안 모이는 이유가 뭔지 항상 답답했는데, 사주로 보니 내 재물 그릇과 소비 패턴이 딱 맞게 나오더라고요. 올해 재물운도 나와서 계획 잡는 데 도움이 많이 됐어요.",
          },
          {
            name: "이**", avatar: "📈", tag: "40대 자영업자",
            stars: 5, text: "사업 확장 시기를 고민하던 중에 봤는데 지금이 맞는 타이밍인지, 어떤 방식이 맞는지까지 나와서 정말 놀랐어요. 실제로 결정하는 데 큰 도움이 됐습니다.",
          },
          {
            name: "박**", avatar: "🏠", tag: "30대 투자 준비 중",
            stars: 5, text: "부동산 투자를 고민하고 있었는데 내 사주에 재물 들어오는 시기가 따로 있다는 걸 알고 무리하지 않기로 했어요. 덕분에 냉정하게 판단할 수 있었어요.",
          },
        ].map((r, i) => (
          <div key={i} style={{ backgroundColor: "#1a1a22", borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#2a2a32", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{r.avatar}</div>
              <div>
                <p style={{ fontSize: 14, color: "#fff", fontWeight: 700 }}>{r.name}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{r.tag}</p>
              </div>
              <div style={{ marginLeft: "auto" }}>
                {Array.from({ length: r.stars }).map((_, si) => <span key={si} style={{ color: "#ffc107", fontSize: 14 }}>★</span>)}
              </div>
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>{r.text}</p>
          </div>
        ))}
      </div>

      <div style={{ height: "110px" }} />
      <StickyCTA />
    </div>
  );
}
