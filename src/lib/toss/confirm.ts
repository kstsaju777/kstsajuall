import { serverEnv } from "@/lib/env";

const TOSS_CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm";

export type TossConfirmRequest = {
  paymentKey: string;
  orderId: string;
  amount: number;
};

export type TossConfirmResponse = {
  paymentKey: string;
  orderId: string;
  totalAmount: number;
  status: string;
  approvedAt: string;
  method?: string;
  [key: string]: unknown;
};

export type TossErrorResponse = {
  code: string;
  message: string;
};

// isLive: false(기본) → TEST 시크릿키(어드민), true → LIVE 시크릿키(그 외 모든 사용자)
export async function confirmTossPayment(
  body: TossConfirmRequest,
  isLive: boolean,
): Promise<{ ok: true; data: TossConfirmResponse } | { ok: false; error: TossErrorResponse }> {
  const env = serverEnv();
  const secretKey = isLive ? env.TOSS_SECRET_KEY_LIVE : env.TOSS_SECRET_KEY_TEST;
  const auth = Buffer.from(`${secretKey}:`).toString("base64");

  const res = await fetch(TOSS_CONFIRM_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as TossConfirmResponse | TossErrorResponse;

  if (!res.ok) {
    return { ok: false, error: json as TossErrorResponse };
  }
  return { ok: true, data: json as TossConfirmResponse };
}
