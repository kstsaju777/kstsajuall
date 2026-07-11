"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const CHAPTER_TITLES = [
  "제1장 — 이 아이는 어떤 기질로 태어났나",
  "제2장 — 아이의 건강과 주의할 부분",
  "제3장 — 잘 맞는 양육 환경과 방식",
  "제4장 — 타고난 기운과 오행 균형",
  "제5장 — 아이에게 맞는 이름·색·방향",
  "제6장 — 성장하면서 두드러질 재능",
  "제7장 — 부모가 조심해야 할 시기",
  "마무리 — 홍연의 서신",
];
const TOTAL = 8;

function CreatingScreen({ doneCount, currentChapter }: { doneCount: number; currentChapter: number }) {
  const pct = Math.round((doneCount / TOTAL) * 100);
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 px-8"
      style={{ background: "radial-gradient(ellipse at 50% 40%, #1a1200 0%, #0a0800 100%)" }}>
      <style>{`
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }
        @keyframes glow-pulse { 0%,100%{box-shadow:0 0 8px 2px #e4d1b2aa,0 0 20px 4px #f5edd855} 50%{box-shadow:0 0 16px 4px #f5edd8cc,0 0 40px 10px #e4d1b288} }
        @keyframes title-fade { 0%{opacity:0;transform:translateY(6px)} 20%{opacity:1;transform:translateY(0)} 80%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-6px)} }
        @keyframes orbit { 0%{transform:rotate(0deg) translateX(38px) rotate(0deg)} 100%{transform:rotate(360deg) translateX(38px) rotate(-360deg)} }
      `}</style>
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, #e4d1b222 0%, transparent 70%)" }} />
        {[0,1,2,3,4,5].map(i => (
          <div key={i} className="absolute w-1 h-1 rounded-full" style={{
            top: "50%", left: "50%", marginTop: "-2px", marginLeft: "-2px",
            background: i % 2 === 0 ? "#e4d1b2" : "#f5edd8",
            boxShadow: `0 0 6px 2px ${i % 2 === 0 ? "#e4d1b2aa" : "#c9b68a55"}`,
            animation: `orbit ${2.5 + i * 0.4}s linear infinite`,
            animationDelay: `${i * -0.5}s`,
          }} />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo_128.jpg" alt="홍연당" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", boxShadow: "0 0 14px 4px #5bbfea66" }} />
        </div>
      </div>
      <p className="text-[18px] font-bold mb-1" style={{ color: "#fffdf5", fontFamily: "'Noto Serif KR', serif", textShadow: "0 0 20px #e4d1b288" }}>
        결과지를 완성하고 있소…
      </p>
      <p key={currentChapter} className="text-[13px] mb-8" style={{ color: "#f5edd8", animation: "title-fade 4s ease-in-out", minHeight: 20 }}>
        {doneCount < TOTAL ? CHAPTER_TITLES[currentChapter - 1] + " 풀이 중" : "마무리 중이오…"}
      </p>
      <div className="w-full max-w-[280px] mb-3">
        <div className="flex justify-between text-[11px] mb-2" style={{ color: "#c9b68a" }}>
          <span>{doneCount} / {TOTAL} 장 완성</span>
          <span>{pct}%</span>
        </div>
        <div className="w-full h-3 rounded-full overflow-hidden relative" style={{ background: "#1a1200" }}>
          <div className="h-full rounded-full relative overflow-hidden transition-all duration-700"
            style={{ width: `${pct}%`, background: "linear-gradient(90deg, #c9b68a, #e4d1b2, #f5edd8)", animation: pct > 0 ? "glow-pulse 1.8s ease-in-out infinite" : "none" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)", animation: "shimmer 1.6s linear infinite", width: "40%" }} />
          </div>
        </div>
      </div>
      <p className="text-[11px] text-center leading-relaxed mt-4" style={{ color: "#806840" }}>
        풀이가 완성되면 자동으로 열리오.<br />이 창을 벗어나셔도 입력하신 이메일로<br />결과지 링크를 보내드렸으니 언제든 확인하실 수 있소.
      </p>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center px-8 text-center" style={{ background: "#0a0800" }}>
      <p className="text-[18px] font-bold mb-3" style={{ color: "#fff5f5" }}>결제 처리 중 오류가 발생했습니다</p>
      <p className="text-[13px] leading-relaxed mb-6" style={{ color: "#886677" }}>{message}</p>
      <p className="text-[12px]" style={{ color: "#886677" }}>고객센터: hongyeon@hongyeondang.com</p>
    </div>
  );
}

export default function SajuYouareCheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessInner />
    </Suspense>
  );
}

function SuccessInner() {
  const router = useRouter();
  const search = useSearchParams();
  const [doneCount, setDoneCount] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const paymentKey = search.get("paymentKey");
    const orderId = search.get("orderId");
    const amount = Number(search.get("amount"));
    if (!paymentKey || !orderId || !amount) { setError("필수 결제 파라미터가 누락되었습니다."); return; }

    (async () => {
      const confirmRes = await fetch("/api/saju_youare/payment-confirm", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentKey, orderId, amount }),
      });
      if (!confirmRes.ok) {
        const json = await confirmRes.json().catch(() => ({}));
        setError(json.error ?? "결제 확인에 실패했습니다. 고객센터로 문의해 주세요.");
        return;
      }
      const { resultId, name, gender } = await confirmRes.json();

      const chapters = [1,2,3,4,5,6,7,8];
      let done = 0;
      const allContent: Record<string, unknown> = {};

      await Promise.all(chapters.map(async (ch) => {
        try {
          const r = await fetch("/api/saju_youare-report", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: resultId, chapter: ch }),
          });
          const data = await r.json();
          if (data.sections) Object.assign(allContent, data.sections);
        } catch { /* 실패해도 계속 */ }
        done++;
        setDoneCount(done);
        setCurrentChapter(Math.min(done + 1, TOTAL));
      }));

      await fetch("/api/saju_youare-report", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resultId, content: allContent }),
      });

      // 이미지 생성 완료까지 대기 (알림톡은 PATCH 완료 후 서버에서 발송)
      await fetch("/api/saju_youare-report", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resultId }),
      }).catch(() => {});

      router.push(`/saju/saju_youare/report-preview?id=${resultId}&gender=${encodeURIComponent(gender)}&name=${encodeURIComponent(name)}`);
    })().catch((err) => { setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) return <ErrorScreen message={error} />;
  return <CreatingScreen doneCount={doneCount} currentChapter={currentChapter} />;
}
