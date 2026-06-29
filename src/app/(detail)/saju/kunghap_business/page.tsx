"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const BG = "#080c14";
const ACCENT = "#4e9eff";
const ACCENT_D = "#1d6fce";

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
  "방금": "#1d6fce", "방금 전": "#1d6fce",
  "1분 전": "#1558a8", "2분 전": "#1558a8",
  "3분 전": "#b5651d", "5분 전": "#6c757d", "7분 전": "#6c757d",
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
      background: `linear-gradient(to top, ${BG} 55%, transparent)`,
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
            <span style={{ backgroundColor: TIME_COLORS[t.time] ?? "#1558a8", color: "#fff", fontSize: "10px", fontWeight: 700, borderRadius: "9999px", padding: "2px 7px" }}>{t.time}</span>
            <span><b>{t.name}</b>님이 신청하였습니다.</span>
          </div>
        ))}
      </div>
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
        <img src="/media/cards/kunghap_business/business-0.jpg" alt="비즈니스궁합"
          style={{ display: "block", width: "100%", height: "auto" }} />
      </div>

      {/* 리포트 미리보기 */}
      <div style={{ backgroundColor: "#0d1220", padding: "32px 20px 40px" }}>
        <p style={{ fontSize: 13, color: ACCENT, fontWeight: 700, marginBottom: 6 }}>비즈니스궁합</p>
        <p style={{ fontSize: 22, color: "#fff", fontWeight: 900, marginBottom: 20 }}>리포트 미리보기</p>
        <div style={{ background: "#131a2b", borderRadius: 16, overflow: "hidden", marginBottom: 8 }}>
          <img src="/media/cards/kunghap_business/business-0.jpg" alt="미리보기"
            style={{ display: "block", width: "100%", height: "auto" }} />
          <div style={{ padding: "20px 20px 24px" }}>
            <p style={{ fontSize: 12, color: ACCENT, fontWeight: 700, marginBottom: 4 }}>+15,000자</p>
            <p style={{ fontSize: 22, color: "#fff", fontWeight: 900, marginBottom: 12 }}>2026 비즈니스궁합</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 20 }}>
              함께 일했을 때 시너지가 날까, 아니면 서로 발목을 잡을까.<br /><br />
              두 사람의 사주팔자를 분석해 일하는 스타일, 의사결정 방식, 돈의 흐름까지 홍연이 냉철하게 짚어드릴게요.
            </p>
            {[
              "사주로 본 나의 비즈니스 기질과 상대방 기질",
              "두 사람이 함께할 때 생기는 시너지",
              "우리 비즈니스 궁합, 진짜 맞는 걸까?",
              "서로 충돌하는 일 방식과 갈등 패턴",
              "상대방이 나를 어떤 파트너로 보는지",
              "동업했을 때 재물운의 흐름",
              "의사결정 스타일 — 속도·방향·우선순위 차이",
              "함께 성공하려면 꼭 알아야 할 것",
              "이 파트너십이 오래가려면 주의할 점",
              "홍연이 보는 두 사람의 비즈니스 미래",
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: ACCENT, flexShrink: 0, marginTop: 6 }} />
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 실제 이용 후기 */}
      <div style={{ backgroundColor: BG, padding: "32px 20px 40px" }}>
        <p style={{ fontSize: 22, color: "#fff", fontWeight: 900, marginBottom: 24 }}>실제 이용 후기</p>
        {[
          {
            name: "김**", avatar: "🤝", tag: "스타트업 공동창업자",
            stars: 5,
            text: "3년째 같이 일한 공동창업자와 왜 의사결정마다 충돌하는지 몰랐는데, 사주로 보니 일하는 스타일 자체가 달랐더라고요. 각자 어떤 역할을 맡아야 시너지가 나는지까지 나와서 팀 구조를 다시 짰어요. 지금은 훨씬 잘 돌아가고 있어요.",
          },
          {
            name: "이**", avatar: "📊", tag: "40대 사업가",
            stars: 5,
            text: "동업 제안이 들어왔는데 선뜻 믿기가 어려웠어요. 상대방 사주와 비교해보니 재물 흐름이 어떻게 될지, 어떤 부분에서 조심해야 하는지 구체적으로 나와서 계약 전에 미리 조율할 수 있었어요. 정말 유용했습니다.",
          },
          {
            name: "박**", avatar: "💼", tag: "30대 프리랜서",
            stars: 5,
            text: "장기 프로젝트를 같이 할 파트너를 고르는 중이었는데, 두 후보 중 누구와 일하는 게 맞는지 사주로 비교해봤어요. 궁합 점수뿐 아니라 서로의 업무 스타일 차이와 주의 포인트까지 나와서 결정하는 데 큰 도움이 됐어요.",
          },
        ].map((review, i) => (
          <div key={i} style={{ backgroundColor: "#131a2b", borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#1a2340", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{review.avatar}</div>
              <div>
                <p style={{ fontSize: 14, color: "#fff", fontWeight: 700 }}>{review.name}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{review.tag}</p>
              </div>
              <div style={{ marginLeft: "auto" }}>
                {Array.from({ length: review.stars }).map((_, si) => <span key={si} style={{ color: "#ffc107", fontSize: 14 }}>★</span>)}
              </div>
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>{review.text}</p>
          </div>
        ))}
      </div>

      <div style={{ height: "110px" }} />
      <StickyCTA />
    </div>
  );
}
