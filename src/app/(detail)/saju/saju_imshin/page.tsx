"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const BG = "#080c0a";
const ACCENT = "#738e6f";
const ACCENT_D = "#4f6b4b";

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
  "방금": "#4f6b4b", "방금 전": "#4f6b4b",
  "1분 전": "#738e6f", "2분 전": "#738e6f",
  "3분 전": "#b5651d", "5분 전": "#6c757d",
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
            <span style={{ backgroundColor: TIME_COLORS[t.time] ?? "#4f6b4b", color: "#fff", fontSize: "10px", fontWeight: 700, borderRadius: "9999px", padding: "2px 7px" }}>{t.time}</span>
            <span><b>{t.name}</b>님이 신청하였습니다.</span>
          </div>
        ))}
      </div>
      <p className="text-center text-[13px] font-bold mb-1">
        <span style={{ color: "#ffffff" }}>할인혜택 종료까지 </span>
        <span style={{ color: ACCENT }}>{timeLeft}</span>
      </p>
      <style>{`
        @keyframes imshinPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(115,142,111,0.6); }
          50% { box-shadow: 0 0 0 10px rgba(115,142,111,0); }
        }
        @keyframes imshinBeat {
          0%, 40%, 60%, 100% { transform: scale(1); }
          20% { transform: scale(1.05); }
          50% { transform: scale(1.03); }
        }
      `}</style>
      <button
        onClick={() => router.push("/saju/saju_imshin/form")}
        className="w-full py-2 rounded-2xl font-bold text-white"
        style={{
          backgroundColor: ACCENT, fontSize: "22px",
          animation: "imshinPulse 2s ease-in-out infinite, imshinBeat 2.5s ease-in-out infinite",
        }}
      >
        임신 궁합 보러가기
      </button>
    </div>
  );
}

export default function ImshinSajuPage() {
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
        <img src="/media/cards/saju_imshin/imshin-0.jpg" alt="임신 궁합"
          style={{ display: "block", width: "100%", height: "auto" }} />
      </div>

      {/* 리포트 미리보기 */}
      <div style={{ backgroundColor: "#0c120b", padding: "32px 20px 40px" }}>
        <p style={{ fontSize: 13, color: ACCENT, fontWeight: 700, marginBottom: 6 }}>임신 궁합</p>
        <p style={{ fontSize: 22, color: "#fff", fontWeight: 900, marginBottom: 20 }}>리포트 미리보기</p>
        <div style={{ background: "#131a12", borderRadius: 16, overflow: "hidden", marginBottom: 8 }}>
          <img src="/media/cards/saju_imshin/imshin-0.jpg" alt="미리보기"
            style={{ display: "block", width: "100%", height: "auto" }} />
          <div style={{ padding: "20px 20px 24px" }}>
            <p style={{ fontSize: 12, color: ACCENT, fontWeight: 700, marginBottom: 4 }}>+15,000자</p>
            <p style={{ fontSize: 22, color: "#fff", fontWeight: 900, marginBottom: 12 }}>2026 임신 궁합</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 20 }}>
              임신이 가능한 시기가 사주에 담겨 있어요.<br /><br />
              홍연이 그대의 사주팔자를 살펴보고, 아이가 올 수 있는 시기와 준비해야 할 것들을 따뜻하게 풀어드릴게요.
            </p>
            {[
              "사주로 본 나의 자녀운 — 아이가 올 운이 있는가",
              "임신이 가능한 사주적 시기 분석",
              "아이와 나의 인연 — 어떤 아이가 올까",
              "임신을 방해하는 사주적 요인과 해소법",
              "2026년 임신·출산 운의 흐름",
              "태교와 임신 중 주의해야 할 것",
              "출산 이후 변화 — 운이 어떻게 바뀔까",
              "홍연이 전하는 따뜻한 한 마디",
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
      <div style={{ backgroundColor: BG, padding: "32px 20px 40px" }}>
        <p style={{ fontSize: 22, color: "#fff", fontWeight: 900, marginBottom: 24 }}>실제 이용 후기</p>
        {[
          {
            name: "김**", avatar: "🌿", tag: "30대 임신 준비 중",
            stars: 5, text: "임신이 잘 안 되서 너무 힘들었는데 사주로 보니 내년이 맞는 시기라고 나왔어요. 마음이 조금 편해졌고 준비 방향이 잡혔어요. 실제로 그 시기에 임신 소식이 있었어요.",
          },
          {
            name: "이**", avatar: "🌸", tag: "2년째 임신 준비 중",
            stars: 5, text: "어떤 시기에 노력을 집중해야 할지 몰랐는데 사주로 보니 구체적인 달까지 나와서 신기했어요. 준비하는 마음가짐이 달라졌어요.",
          },
          {
            name: "박**", avatar: "☘️", tag: "임신 성공 후 재방문",
            stars: 5, text: "임신 전에 봤는데 홍연이 알려준 시기에 정말 임신이 됐어요. 태교 관련 내용도 유용했고 앞으로 어떻게 달라질지 알 수 있어서 좋았어요.",
          },
        ].map((r, i) => (
          <div key={i} style={{ backgroundColor: "#131a12", borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#1e2b1d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{r.avatar}</div>
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
