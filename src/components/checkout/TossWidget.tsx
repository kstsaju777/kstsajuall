"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { loadWidgets } from "@/lib/toss/client";
import { publicEnv } from "@/lib/env";
import { detectInApp, externalBrowserUrl, isAndroid } from "@/lib/inapp";

type Props = {
  orderId: string;
  amount: number;
  customerKey: string;
  productName: string;
  customerEmail: string | null;
  successUrl?: string;
  failUrl?: string;
};

export function TossWidget({ orderId, amount, customerKey, productName, customerEmail, successUrl, failUrl }: Props) {
  const paymentMethodsRef = useRef<HTMLDivElement>(null);
  const agreementRef = useRef<HTMLDivElement>(null);
  const widgetsRef = useRef<Awaited<ReturnType<typeof loadWidgets>> | null>(null);
  const [ready, setReady] = useState(false);
  const [paying, setPaying] = useState(false);
  // null = 어드민 여부 확인 중 — 확인 전에는 위젯을 로드하지 않음 (테스트/라이브 키 오적용 방지)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  // 스레드·카카오톡 앱 안에서는 결제가 자주 막혀서, 결제 전에 외부 브라우저 안내를 한 번 띄움
  const [inAppGuide, setInAppGuide] = useState(false);
  const [payInApp, setPayInApp] = useState(false);

  useEffect(() => {
    fetch("/api/admin/check")
      .then((r) => r.json())
      .then((d) => setIsAdmin(!!d.isAdmin))
      .catch(() => setIsAdmin(false));
  }, []);

  useEffect(() => {
    if (isAdmin === null) return;
    let canceled = false;
    (async () => {
      const widgets = await loadWidgets(customerKey, !isAdmin);
      if (canceled) return;
      widgetsRef.current = widgets;
      await widgets.setAmount({ currency: "KRW", value: amount });
      await Promise.all([
        widgets.renderPaymentMethods({ selector: "#payment-methods", variantKey: "DEFAULT" }),
        widgets.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" }),
      ]);
      setReady(true);
    })().catch((e) => {
      toast.error(e instanceof Error ? e.message : "결제 위젯 로드 실패");
    });
    return () => {
      canceled = true;
    };
  }, [amount, customerKey, isAdmin]);

  function openExternalBrowser() {
    const target = externalBrowserUrl(detectInApp(), window.location.href, isAndroid());
    if (target) window.location.href = target;
  }

  async function handlePay(skipInAppGuide = false) {
    const widgets = widgetsRef.current;
    if (!widgets) return;
    if (!skipInAppGuide && !payInApp && detectInApp()) {
      setInAppGuide(true);
      return;
    }
    setPaying(true);
    try {
      await widgets.requestPayment({
        orderId,
        orderName: productName,
        successUrl: successUrl ?? `${publicEnv.NEXT_PUBLIC_SITE_URL}/checkout/success`,
        failUrl: failUrl ?? `${publicEnv.NEXT_PUBLIC_SITE_URL}/checkout/fail`,
        customerEmail: customerEmail ?? undefined,
      });
    } catch (err) {
      setPaying(false);
      toast.error(err instanceof Error ? err.message : "결제 요청 실패");
    }
  }

  return (
    <div className="space-y-4 pb-8">
      <div id="payment-methods" ref={paymentMethodsRef} />
      <div id="agreement" ref={agreementRef} />
      <Button onClick={() => handlePay()} disabled={!ready || paying} size="lg" className="w-full">
        {paying ? "결제 진행 중..." : "결제하기"}
      </Button>

      {inAppGuide && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
          <div className="w-full max-w-[400px] rounded-2xl bg-white p-6 text-center text-[#1a1a1a]">
            <p className="text-lg font-bold">외부 브라우저에서 결제해 주세요</p>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              앱 안의 브라우저에서는 카드·간편결제 앱으로
              <br />
              넘어가지 않아 결제가 멈출 수 있어요.
            </p>
            <p className="mt-4 rounded-xl bg-gray-100 p-3 text-sm leading-relaxed">
              오른쪽 위 <b>⋯</b> 버튼을 누르고
              <br />
              <b>&lsquo;외부 브라우저에서 열기&rsquo;</b>를 선택해 주세요
            </p>
            <Button onClick={openExternalBrowser} size="lg" className="mt-5 w-full">
              외부 브라우저로 열기
            </Button>
            <button
              type="button"
              className="mt-3 w-full py-2 text-sm text-gray-500 underline"
              onClick={() => {
                setInAppGuide(false);
                setPayInApp(true);
                handlePay(true);
              }}
            >
              여기서 그냥 결제할게요
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
