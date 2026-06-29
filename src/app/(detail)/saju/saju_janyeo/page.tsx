"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const BG = "#080a0f";
const PINK = "#5bbfea";

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
  "방금": "#c9184a", "방금 전": "#c9184a",
  "1분 전": "#9b2335", "2분 전": "#9b2335",
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
            <span style={{ backgroundColor: TIME_COLORS[t.time] ?? "#9b2335", color: "#fff", fontSize: "10px", fontWeight: 700, borderRadius: "9999px", padding: "2px 7px" }}>{t.time}</span>
            <span><b>{t.name}</b>님이 신청하였습니다.</span>
          </div>
        ))}
      </div>
      <p className="text-center text-[13px] font-bold mb-1">
        <span style={{ color: "#ffffff" }}>할인혜택 종료까지 </span>
        <span style={{ color: PINK }}>{timeLeft}</span>
      </p>
      <button
        onClick={() => router.push("/saju/saju_janyeo/form")}
        className="w-full py-2 rounded-2xl font-bold text-white active:scale-95 transition-transform"
        style={{ backgroundColor: PINK, fontSize: "22px" }}
      >
        자녀사주 보러가기
      </button>
    </div>
  );
}

export default function ChildSajuPage() {
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
        <img src="/media/cards/saju_janyeo/janyeo-0.jpg" alt="자녀사주"
          style={{ display: "block", width: "100%", height: "auto" }} />
      </div>

      {/* 리포트 미리보기 */}
      <div style={{ backgroundColor: "#0f0f14", padding: "32px 20px 40px" }}>
        <p style={{ fontSize: 13, color: PINK, fontWeight: 700, marginBottom: 6 }}>자녀사주</p>
        <p style={{ fontSize: 22, color: "#fff", fontWeight: 900, marginBottom: 20 }}>리포트 미리보기</p>
        <div style={{ background: "#1a1a22", borderRadius: 16, overflow: "hidden", marginBottom: 8 }}>
          <img src="/media/cards/saju_janyeo/janyeo-0.jpg" alt="미리보기"
            style={{ display: "block", width: "100%", height: "auto" }} />
          <div style={{ padding: "20px 20px 24px" }}>
            <p style={{ fontSize: 12, color: PINK, fontWeight: 700, marginBottom: 4 }}>+15,000자</p>
            <p style={{ fontSize: 22, color: "#fff", fontWeight: 900, marginBottom: 12 }}>2026 자녀사주</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 20 }}>
              아이의 사주에는 타고난 재능, 성격, 그리고 앞으로 걸어갈 길이 담겨 있어요.<br /><br />
              홍연이 아이의 사주팔자를 꼼꼼히 살펴보고, 부모가 어떻게 도와줄 수 있는지까지 풀어드릴게요.
            </p>
            {[
              "아이의 타고난 기질과 성격",
              "숨겨진 재능과 잠재력 발견",
              "어떤 공부 / 직업이 잘 맞을까?",
              "아이가 힘든 시기는 언제? 미리 대비하기",
              "부모와의 궁합 — 어떻게 키워야 할까",
              "아이의 건강 취약 부위",
              "2026년 아이에게 오는 운의 흐름",
              "부모가 꼭 알아야 할 육아 주의사항",
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: PINK, flexShrink: 0, marginTop: 6 }} />
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
            name: "김**", avatar: "👶", tag: "7살 아이 엄마",
            stars: 5, text: "아이가 왜 이렇게 고집이 센지, 왜 특정 과목만 싫어하는지 항상 궁금했는데 사주로 보니 다 이유가 있더라고요. 아이를 이해하는 데 정말 많은 도움이 됐어요.",
          },
          {
            name: "이**", avatar: "🌙", tag: "5살 아이 아빠",
            stars: 5, text: "처음엔 반신반의했는데 아이 성격 분석이 너무 정확해서 깜짝 놀랐어요. 앞으로 어떤 분야를 지원해줘야 할지 방향이 잡혔습니다.",
          },
          {
            name: "박**", avatar: "⭐", tag: "10살 아이 엄마",
            stars: 5, text: "아이가 힘든 시기가 언제인지 미리 알 수 있어서 좋았어요. 그 시기에 더 잘 챙겨줄 수 있을 것 같아요. 육아에 실질적인 도움이 되는 내용이었습니다.",
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
