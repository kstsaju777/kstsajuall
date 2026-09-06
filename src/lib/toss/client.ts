import { loadTossPayments, type TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import { publicEnv } from "@/lib/env";

// isLive: false(기본) → TEST 키(어드민), true → LIVE 키(그 외 모든 사용자)
export async function loadWidgets(customerKey: string, isLive: boolean): Promise<TossPaymentsWidgets> {
  const clientKey = isLive ? publicEnv.NEXT_PUBLIC_TOSS_CLIENT_KEY_LIVE : publicEnv.NEXT_PUBLIC_TOSS_CLIENT_KEY_TEST;
  const tossPayments = await loadTossPayments(clientKey);
  return tossPayments.widgets({ customerKey });
}
