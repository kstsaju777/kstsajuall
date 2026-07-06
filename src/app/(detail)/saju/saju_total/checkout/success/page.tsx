"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// ─── 로딩 화면 (checkout/page.tsx 와 동일 스타일) ─────────────────────────────
const CHAPTER_TITLES = [
  "제2장 — 나의 진짜 모습은 무엇일까",
  "제1장 — 나는 어떤 그릇으로 태어났나",
  "제3장 — 나는 세상을 어떻게 대하는가",
  "제4장 — 내 사주에 나타나는 특이점",
  "제5장 — 내 재물과 천직은 어떠한가",
  "제6장 — 내 인연과 혼인의 때는 언제인가",
  "제7장 — 내 건강과 약한 곳은 어디인가",
  "제4장 — 내 사주에 나타나는 특이점",
  "제4장 — 내 사주에 나타나는 특이점",
  "제8장 — 내 인생은 어떻게 흐르는가",
];
const TOTAL = 10;

function CreatingScreen({ doneCount, currentChapter }: { doneCount: number; currentChapter: number }) {
  const pct = Math.round((doneCount / TOTAL) * 100);
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 px-8"
      style={{ background: "radial-gradient(ellipse at 50% 40%, #3a0008 0%, #0a0002 100%)" }}>
      <style>{`
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }
        @keyframes glow-pulse { 0%,100%{box-shadow:0 0 8px 2px #9b2335aa,0 0 20px 4px #c9474f55} 50%{box-shadow:0 0 16px 4px #c9474fcc,0 0 40px 10px #9b233588} }
        @keyframes title-fade { 0%{opacity:0;transform:translateY(6px)} 20%{opacity:1;transform:translateY(0)} 80%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-6px)} }
        @keyframes orbit { 0%{transform:rotate(0deg) translateX(38px) rotate(0deg)} 100%{transform:rotate(360deg) translateX(38px) rotate(-360deg)} }
      `}</style>
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, #9b233522 0%, transparent 70%)" }} />
        {[0,1,2,3,4,5].map(i => (
          <div key={i} className="absolute w-1 h-1 rounded-full" style={{
            top: "50%", left: "50%", marginTop: "-2px", marginLeft: "-2px",
            background: i % 2 === 0 ? "#9b2335" : "#e8a0a8",
            boxShadow: `0 0 6px 2px ${i % 2 === 0 ? "#9b2335" : "#e8a0a8"}`,
            animation: `orbit ${2.5 + i * 0.4}s linear infinite`,
            animationDelay: `${i * -0.5}s`,
          }} />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{ fontSize: 28, filter: "drop-shadow(0 0 8px #9b2335)" }}>✦</span>
        </div>
      </div>
      <p className="text-[18px] font-bold mb-1" style={{ color: "#fff5f5", fontFamily: "'Noto Serif KR', serif", textShadow: "0 0 20px #9b233588" }}>
        결과지를 완성하고 있소…
      </p>
      <p key={currentChapter} className="text-[13px] mb-8" style={{ color: "#e8a0a8", animation: "title-fade 4s ease-in-out", minHeight: 20 }}>
        {doneCount < TOTAL ? CHAPTER_TITLES[currentChapter - 1] + " 풀이 중" : "마무리 중이오…"}
      </p>
      <div className="w-full max-w-[280px] mb-3">
        <div className="flex justify-between text-[11px] mb-2" style={{ color: "#c9909a" }}>
          <span>풀이 진행 중</span>
          <span>{pct}%</span>
        </div>
        <div className="w-full h-3 rounded-full overflow-hidden relative" style={{ background: "#1a0005" }}>
          <div className="h-full rounded-full relative overflow-hidden transition-all duration-700"
            style={{ width: `${pct}%`, background: "linear-gradient(90deg, #7a1020, #9b2335, #c9474f)", animation: pct > 0 ? "glow-pulse 1.8s ease-in-out infinite" : "none" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)", animation: "shimmer 1.6s linear infinite", width: "40%" }} />
          </div>
        </div>
      </div>
      <p className="text-[11px] text-center leading-relaxed mt-4" style={{ color: "#886677" }}>
        풀이가 완성되면 자동으로 열리오.<br />이 창을 벗어나셔도 입력하신 이메일로<br />결과지 링크를 보내드렸으니 언제든 확인하실 수 있소.
      </p>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center px-8 text-center"
      style={{ background: "#0a0002" }}>
      <p className="text-[18px] font-bold mb-3" style={{ color: "#fff5f5" }}>결제 처리 중 오류가 발생했습니다</p>
      <p className="text-[13px] leading-relaxed mb-6" style={{ color: "#886677" }}>{message}</p>
      <p className="text-[12px]" style={{ color: "#886677" }}>고객센터: hongyeon@hongyeondang.com</p>
    </div>
  );
}

export default function SajuTotalCheckoutSuccessPage() {
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

    if (!paymentKey || !orderId || !amount) {
      setError("필수 결제 파라미터가 누락되었습니다.");
      return;
    }

    (async () => {
      // 1. 결제 확인 + 명식 생성
      const confirmRes = await fetch("/api/saju_total/payment-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentKey, orderId, amount }),
      });
      if (!confirmRes.ok) {
        const json = await confirmRes.json().catch(() => ({}));
        setError(json.error ?? "결제 확인에 실패했습니다. 고객센터로 문의해 주세요.");
        return;
      }
      const { resultId, name, gender } = await confirmRes.json();

      // 2. 장별 생성 (checkout/page.tsx 와 동일 로직)
      const FIRST = [2];
      const REST  = [1,3,4,5,6,7,8,9,10];
      let done = 0;
      const allContent: Record<string, unknown> = {};

      for (const ch of FIRST) {
        try {
          const r = await fetch("/api/saju_total-report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: resultId, chapter: ch }),
          });
          const data = await r.json();
          if (data.sections) Object.assign(allContent, data.sections);
        } catch { /* 실패해도 계속 */ }
        done++;
        setDoneCount(done);
        setCurrentChapter(Math.min(done + 1, TOTAL));
      }

      await Promise.all(REST.map(async (ch) => {
        try {
          const r = await fetch("/api/saju_total-report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: resultId, chapter: ch }),
          });
          const data = await r.json();
          if (data.sections) Object.assign(allContent, data.sections);
        } catch { /* 장 실패해도 계속 */ }
        done++;
        setDoneCount(done);
        setCurrentChapter(Math.min(done + 1, TOTAL));
      }));

      // 3. 합본 저장
      await fetch("/api/saju_total-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resultId, content: allContent }),
      });

      // 4. 이미지 생성
      await fetch("/api/saju_total-report", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resultId }),
      }).catch(() => {});

      // 5. 결과 페이지로 이동
      router.push(
        `/saju/saju_total/report-preview?id=${resultId}&gender=${encodeURIComponent(gender)}&name=${encodeURIComponent(name)}`
      );
    })().catch((err) => {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) return <ErrorScreen message={error} />;
  return <CreatingScreen doneCount={doneCount} currentChapter={currentChapter} />;
}
