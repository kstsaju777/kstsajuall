"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const BG = "#080a0f";
const ACCENT = "#e1337d";

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
  "방금": "#e1337d", "방금 전": "#e1337d",
  "1분 전": "#c02468", "2분 전": "#c02468",
  "3분 전": "#a02555", "5분 전": "#6c757d",
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
            <span style={{ backgroundColor: TIME_COLORS[t.time] ?? "#c02468", color: "#fff", fontSize: "10px", fontWeight: 700, borderRadius: "9999px", padding: "2px 7px" }}>{t.time}</span>
            <span><b>{t.name}</b>님이 신청하였습니다.</span>
          </div>
        ))}
      </div>
      <p className="text-center text-[13px] font-bold mb-1">
        <span style={{ color: "#ffffff" }}>할인혜택 종료까지 </span>
        <span style={{ color: ACCENT }}>{timeLeft}</span>
      </p>
      <button
        onClick={() => router.push("/saju/saju_gyeolhon/form")}
        className="w-full py-2 rounded-2xl font-bold text-white active:scale-95 transition-transform"
        style={{ backgroundColor: ACCENT, fontSize: "22px" }}
      >
        결혼궁합 보러가기
      </button>
    </div>
  );
}

export default function GyeolhonSajuPage() {
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
        <img src="/media/cards/saju_gyeolhon/gyeolhon-0.jpg" alt="결혼궁합"
          style={{ display: "block", width: "100%", height: "auto" }} />
      </div>

      {/* 리포트 미리보기 */}
      <div style={{ backgroundColor: "#0f0f14", padding: "32px 20px 40px" }}>
        <p style={{ fontSize: 13, color: ACCENT, fontWeight: 700, marginBottom: 6 }}>결혼궁합</p>
        <p style={{ fontSize: 22, color: "#fff", fontWeight: 900, marginBottom: 20 }}>리포트 미리보기</p>
        <div style={{ background: "#1a1a22", borderRadius: 16, overflow: "hidden", marginBottom: 8 }}>
          <img src="/media/cards/saju_gyeolhon/gyeolhon-0.jpg" alt="미리보기"
            style={{ display: "block", width: "100%", height: "auto" }} />
          <div style={{ padding: "20px 20px 24px" }}>
            <p style={{ fontSize: 12, color: ACCENT, fontWeight: 700, marginBottom: 4 }}>+15,000자</p>
            <p style={{ fontSize: 22, color: "#fff", fontWeight: 900, marginBottom: 12 }}>2026 결혼궁합</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 20 }}>
              결혼을 앞두고, 혹은 결혼을 꿈꾸고 있다면 사주로 먼저 살펴보세요.<br /><br />
              홍연이 그대의 사주팔자를 통해 결혼 시기, 배우자 인연, 결혼 후 삶의 흐름까지 깊이 풀어드릴게요.
            </p>
            {[
              "나의 타고난 결혼 인연과 배우자 유형",
              "결혼 적령기 — 사주로 본 최적의 시기",
              "배우자와의 궁합 및 결혼 후 관계 흐름",
              "결혼을 가로막는 장애 요인과 해결법",
              "결혼 후 경제적 흐름과 가정운",
              "자녀 인연 — 아이가 생기는 시기와 관계",
              "결혼 생활에서 주의해야 할 갈등 패턴",
              "홍연이 전하는 결혼에 대한 한 마디",
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
            name: "이**", avatar: "💍", tag: "결혼 준비 중인 예비신부",
            stars: 5, text: "결혼을 앞두고 시기가 맞는 건지 불안했는데, 사주로 보니 지금이 딱 맞는 시기라고 해서 안심이 됐어요. 배우자 유형도 너무 정확해서 소름이 돋았습니다.",
          },
          {
            name: "박**", avatar: "🌸", tag: "30대 미혼 여성",
            stars: 5, text: "결혼이 언제쯤 될지 너무 궁금했는데 대운 흐름으로 구체적인 시기까지 나와서 놀랐어요. 지금 만나는 사람과 잘 될 것 같다는 풀이를 보고 용기를 얻었어요.",
          },
          {
            name: "김**", avatar: "💒", tag: "결혼 1년차 신혼부부",
            stars: 5, text: "결혼 전에 봤는데 갈등 패턴 부분이 실제로 너무 잘 맞아서 미리 대비할 수 있었어요. 덕분에 신혼생활이 훨씬 수월한 것 같아요. 강력 추천합니다!",
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
