"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trackPurchase } from "@/lib/analytics";

const TOTAL = 8;

function CreatingScreen({ doneCount, currentChapter, pct }: { doneCount: number; currentChapter: number; pct: number }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 px-8"
      style={{ background: "radial-gradient(ellipse at 50% 40%, #1a0010 0%, #0a0208 100%)" }}>
      <style>{`
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }
        @keyframes glow-pulse { 0%,100%{box-shadow:0 0 8px 2px #e9bdaeaa,0 0 20px 4px #f0cdc055} 50%{box-shadow:0 0 16px 4px #f0cdc0cc,0 0 40px 10px #e9bdae88} }
        @keyframes title-fade { 0%{opacity:0;transform:translateY(6px)} 20%{opacity:1;transform:translateY(0)} 80%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-6px)} }
        @keyframes orbit { 0%{transform:rotate(0deg) translateX(38px) rotate(0deg)} 100%{transform:rotate(360deg) translateX(38px) rotate(-360deg)} }
      `}</style>
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, #e9bdae22 0%, transparent 70%)" }} />
        {[0,1,2,3,4,5].map(i => (
          <div key={i} className="absolute w-1 h-1 rounded-full" style={{
            top: "50%", left: "50%", marginTop: "-2px", marginLeft: "-2px",
            background: i % 2 === 0 ? "#e9bdae" : "#f0cdc0",
            boxShadow: `0 0 6px 2px ${i % 2 === 0 ? "#d4a090" : "#e9bdae"}`,
            animation: `orbit ${2.5 + i * 0.4}s linear infinite`,
            animationDelay: `${i * -0.5}s`,
          }} />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo_128.jpg" alt="홍연당" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", boxShadow: "0 0 14px 4px #5bbfea66" }} />
        </div>
      </div>
      <p className="text-[18px] font-bold mb-1" style={{ color: "#fff5ee", fontFamily: "'Noto Serif KR', serif", textShadow: "0 0 20px #e9bdae88" }}>
        결과지를 완성하고 있소…
      </p>
      <div className="w-full max-w-[280px] mb-3">
        <div className="flex justify-end text-[11px] mb-2" style={{ color: "#c9a090" }}>
          <span>{pct}%</span>
        </div>
        <div className="w-full h-3 rounded-full overflow-hidden relative" style={{ background: "#1a0810" }}>
          <div className="h-full rounded-full relative overflow-hidden transition-all duration-700"
            style={{ width: `${pct}%`, background: "linear-gradient(90deg, #c4907a, #e9bdae, #f0cdc0)", animation: pct > 0 ? "glow-pulse 1.8s ease-in-out infinite" : "none" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)", animation: "shimmer 1.6s linear infinite", width: "40%" }} />
          </div>
        </div>
      </div>
      <div className="w-full max-w-[280px] mt-5 px-4 py-3 rounded-xl text-center"
        style={{ background: "rgba(233,189,174,0.15)", border: "1px solid rgba(233,189,174,0.4)" }}>
        <p className="text-[15px] font-semibold mb-1" style={{ color: "#e9bdae" }}>⚠️ 절대 새로고침 금지</p>
        <p className="text-[13px] leading-relaxed" style={{ color: "#e9bdae" }}>
          결과지 생성에 최대 5분 정도 걸릴 수 있소.<br />오래 걸려도 정상이니 그대로 기다려 주시오.<br />새로고침하면 처음부터 다시 시작되어<br />시간이 더 걸리게 되오.
        </p>
      </div>
      <p className="text-[13px] text-center leading-relaxed mt-4" style={{ color: "#886677" }}>
        풀이가 완성되면 자동으로 열리오.<br />이 창을 벗어나셔도 입력하신 이메일로<br />결과지 링크를 보내드렸으니 언제든 확인하실 수 있소.
      </p>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center px-8 text-center" style={{ background: "#0a0208" }}>
      <p className="text-[18px] font-bold mb-3" style={{ color: "#fff5f5" }}>결제 처리 중 오류가 발생했습니다</p>
      <p className="text-[13px] leading-relaxed mb-6" style={{ color: "#886677" }}>{message}</p>
      <p className="text-[12px]" style={{ color: "#886677" }}>고객센터: hongyeon@hongyeondang.com</p>
    </div>
  );
}

export default function SajuYeonaeCheckoutSuccessPage() {
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
  const [pct, setPct] = useState(0);
  const startedAtRef = useRef(Date.now());
  useEffect(() => {
    const id = setInterval(() => {
      setPct((prev) => {
        if (prev >= 96) return prev;
        const elapsedSec = (Date.now() - startedAtRef.current) / 1000;
        const timeBased = Math.min(90, elapsedSec * 2.5); // 대략 36초에 90%까지 서서히
        const realBased = (doneCount / TOTAL) * 96;
        const target = Math.min(96, Math.max(timeBased, realBased));
        return prev + (target - prev) * 0.12;
      });
    }, 150);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneCount]);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const navigatingRef = useRef(false);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { if (navigatingRef.current) return; e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  useEffect(() => {
    const paymentKey = search.get("paymentKey");
    const orderId = search.get("orderId");
    const amount = Number(search.get("amount"));
    if (!paymentKey || !orderId || !amount) { setError("필수 결제 파라미터가 누락되었습니다."); return; }

    (async () => {
      const confirmRes = await fetch("/api/saju_yeonae/payment-confirm", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentKey, orderId, amount }),
      });
      if (!confirmRes.ok) {
        const json = await confirmRes.json().catch(() => ({}));
        setError(json.error ?? "결제 확인에 실패했습니다. 고객센터로 문의해 주세요.");
        return;
      }
      const { resultId, name, gender } = await confirmRes.json();
      trackPurchase(orderId, amount);

      // 실제 생성은 결제 확인 응답 직후 서버가 백그라운드(after())로 전담한다 —
      // 고객이 이 화면을 벗어나도 서버가 끝까지 만들어 저장하고 알림톡까지 보낸다.
      // 여기서는 화면에 진행률을 보여주기 위해 저장 상태를 주기적으로 조회만 한다.
      let cancelled = false;
      const poll = async () => {
        for (let i = 0; i < 150; i++) { // 최대 5분(2초 간격)
          if (cancelled) return;
          try {
            const r = await fetch(`/api/saju_yeonae-report?id=${encodeURIComponent(resultId)}`);
            const d = await r.json();
            if (typeof d.doneCount === "number") {
              setDoneCount(d.doneCount);
              setCurrentChapter(Math.min(d.doneCount + 1, TOTAL));
            }
            if (d.ready) break;
          } catch { /* 무시하고 계속 폴링 */ }
          await new Promise((res) => setTimeout(res, 2000));
        }
      };
      await poll();

      setPct(100);
      await new Promise((res) => setTimeout(res, 350));
      navigatingRef.current = true;
      router.push(`/saju/saju_yeonae/report-preview?id=${resultId}&gender=${encodeURIComponent(gender)}&name=${encodeURIComponent(name)}`);
    })().catch((err) => { setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) return <ErrorScreen message={error} />;
  return <CreatingScreen doneCount={doneCount} currentChapter={currentChapter} pct={Math.round(pct)} />;
}
