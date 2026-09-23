"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trackPurchase } from "@/lib/analytics";

const TOTAL = 12;

function CreatingScreen({ doneCount, currentChapter, pct }: { doneCount: number; currentChapter: number; pct: number }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 px-8"
      style={{ background: "radial-gradient(ellipse at 50% 40%, #0a1209 0%, #060a05 100%)" }}>
      <style>{`
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }
        @keyframes glow-pulse { 0%,100%{box-shadow:0 0 8px 2px #738e6faa,0 0 20px 4px #8faa8baa} 50%{box-shadow:0 0 16px 4px #8faa8bcc,0 0 40px 10px #738e6f88} }
        @keyframes title-fade { 0%{opacity:0;transform:translateY(6px)} 20%{opacity:1;transform:translateY(0)} 80%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-6px)} }
        @keyframes orbit { 0%{transform:rotate(0deg) translateX(38px) rotate(0deg)} 100%{transform:rotate(360deg) translateX(38px) rotate(-360deg)} }
      `}</style>
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, #738e6f22 0%, transparent 70%)" }} />
        {[0,1,2,3,4,5].map(i => (
          <div key={i} className="absolute w-1 h-1 rounded-full" style={{
            top: "50%", left: "50%", marginTop: "-2px", marginLeft: "-2px",
            background: i % 2 === 0 ? "#738e6f" : "#8faa8b",
            boxShadow: `0 0 6px 2px ${i % 2 === 0 ? "#738e6f" : "#8faa8b"}`,
            animation: `orbit ${2.5 + i * 0.4}s linear infinite`,
            animationDelay: `${i * -0.5}s`,
          }} />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo_128.jpg" alt="홍연당" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", boxShadow: "0 0 14px 4px #5bbfea66" }} />
        </div>
      </div>
      <p className="text-[18px] font-bold mb-1" style={{ color: "#fff5f5", fontFamily: "'Noto Serif KR', serif", textShadow: "0 0 20px #738e6f88" }}>
        결과지를 완성하고 있소…
      </p>
      <div className="w-full max-w-[280px] mb-3">
        <div className="flex justify-end text-[11px] mb-2" style={{ color: "#8faa8b" }}>
          <span>{pct}%</span>
        </div>
        <div className="w-full h-3 rounded-full overflow-hidden relative" style={{ background: "#0d1a0c" }}>
          <div className="h-full rounded-full relative overflow-hidden transition-all duration-700"
            style={{ width: `${pct}%`, background: "linear-gradient(90deg, #4a6a45, #738e6f, #8faa8b)", animation: pct > 0 ? "glow-pulse 1.8s ease-in-out infinite" : "none" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)", animation: "shimmer 1.6s linear infinite", width: "40%" }} />
          </div>
        </div>
      </div>
      <div className="w-full max-w-[280px] mt-5 px-4 py-3 rounded-xl text-center"
        style={{ background: "rgba(115,142,111,0.15)", border: "1px solid rgba(115,142,111,0.4)" }}>
        <p className="text-[15px] font-semibold mb-1" style={{ color: "#8faa8b" }}>⚠️ 절대 새로고침 금지</p>
        <p className="text-[13px] leading-relaxed" style={{ color: "#8faa8b" }}>
          결과지 생성에 최대 5분 정도 걸릴 수 있소.<br />오래 걸려도 정상이니 그대로 기다려 주시오.<br />새로고침하면 처음부터 다시 시작되어<br />시간이 더 걸리게 되오.
        </p>
      </div>
      <p className="text-[13px] text-center leading-relaxed mt-4" style={{ color: "#6a9066" }}>
        풀이가 완성되면 자동으로 열리오.<br />이 창을 벗어나셔도 입력하신 이메일로<br />결과지 링크를 보내드렸으니 언제든 확인하실 수 있소.
      </p>
    </div>
  );
}

function TimedOutScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center px-8 text-center" style={{ background: "#0a0002" }}>
      <p className="text-[18px] font-bold mb-3" style={{ color: "#fff5f5" }}>결과지가 예상보다 오래 걸리고 있소</p>
      <p className="text-[13px] leading-relaxed mb-6" style={{ color: "#886677" }}>
        완성되는 대로 카카오 알림톡으로 결과지 링크를 보내드리오.<br />이 창은 이제 닫으셔도 되오.
      </p>
      <p className="text-[12px]" style={{ color: "#886677" }}>계속 오지 않으면 고객센터로 문의해 주시오: hongyeon@hongyeondang.com</p>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center px-8 text-center" style={{ background: "#0a0002" }}>
      <p className="text-[18px] font-bold mb-3" style={{ color: "#fff5f5" }}>결제 처리 중 오류가 발생했습니다</p>
      <p className="text-[13px] leading-relaxed mb-6" style={{ color: "#886677" }}>{message}</p>
      <p className="text-[12px]" style={{ color: "#886677" }}>고객센터: hongyeon@hongyeondang.com</p>
    </div>
  );
}

export default function KunghapImshinCheckoutSuccessPage() {
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
  const [timedOut, setTimedOut] = useState(false);
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
      const confirmRes = await fetch("/api/kunghap_imshin/payment-confirm", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentKey, orderId, amount }),
      });
      if (!confirmRes.ok) {
        const json = await confirmRes.json().catch(() => ({}));
        setError(json.error ?? "결제 확인에 실패했습니다. 고객센터로 문의해 주세요.");
        return;
      }
      const { resultId, name, gender, partnerName, partnerGender } = await confirmRes.json();
      trackPurchase(orderId, amount);

      // 실제 생성은 결제 확인 응답 직후 서버가 백그라운드(after())로 전담한다 —
      // 고객이 이 화면을 벗어나도 서버가 끝까지 만들어 저장하고 알림톡까지 보낸다.
      // 여기서는 화면에 진행률을 보여주기 위해 저장 상태를 주기적으로 조회만 한다.
      // 챕터 생성은 서버 백그라운드가 안정적으로 처리한다(이탈해도 항상 완료).
      // AI 사주화 이미지는 after() 백그라운드 안에서는 원인 불명의 이유로 계속
      // 실패해서, 이 화면이 직접 요청한다 - 예전부터 안정적으로 작동하던 방식.
      // 고객이 이 화면을 완전히 벗어나면 이 요청도 취소되지만, 1분마다 도는
      // 예약 작업이 놓친 이미지를 마저 완성시키니 알림톡은 결국 정상 발송된다.
      const imageTask = fetch("/api/kunghap_imshin-report", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resultId }),
      }).then((r) => r.ok).catch(() => false);

      let cancelled = false;
      let becameReady = false;
      const poll = async () => {
        for (let i = 0; i < 150; i++) { // 최대 5분(2초 간격)
          if (cancelled) return;
          try {
            const r = await fetch(`/api/kunghap_imshin-report?id=${encodeURIComponent(resultId)}`);
            const d = await r.json();
            if (typeof d.doneCount === "number") {
              setDoneCount(d.doneCount);
              setCurrentChapter(Math.min(d.doneCount + 1, TOTAL));
            }
            if (d.ready) { becameReady = true; break; }
          } catch { /* 무시하고 계속 폴링 */ }
          await new Promise((res) => setTimeout(res, 2000));
        }
      };
      await poll();
      await imageTask;

      // 이미지까지 전부 완성됐을 때만 결과 페이지로 이동한다. 아직 완성되지
      // 않았다면 미완성 결과지를 보여주는 대신 계속 기다리는 화면을 유지한다.
      if (!becameReady) {
        setTimedOut(true);
        return;
      }

      // 챕터 합본 저장은 이미지가 아직 없을 때 이미 끝났을 수 있어(알림톡 스킵됨),
      // 이미지까지 확인된 지금 시점에 한 번 더 재확인시켜 알림톡을 발송시킨다.
      await fetch("/api/kunghap_imshin-report", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resultId, content: {} }),
      }).catch(() => {});

      setPct(100);
      await new Promise((res) => setTimeout(res, 350));
      navigatingRef.current = true;
      router.push(`/saju/kunghap_imshin/report-preview?id=${resultId}&gender=${encodeURIComponent(gender)}&name=${encodeURIComponent(name)}&partnerName=${encodeURIComponent(partnerName ?? "")}&partnerGender=${encodeURIComponent(partnerGender ?? "")}`);
    })().catch((err) => { setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) return <ErrorScreen message={error} />;
  if (timedOut) return <TimedOutScreen />;
  return <CreatingScreen doneCount={doneCount} currentChapter={currentChapter} pct={Math.round(pct)} />;
}
