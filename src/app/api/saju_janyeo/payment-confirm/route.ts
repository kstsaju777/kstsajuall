import { NextResponse, type NextRequest, after } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { confirmTossPayment } from "@/lib/toss/confirm";
import { isCurrentUserAdmin } from "@/lib/auth";
import { isSajuApiConfigured, fetchSajuAnalysis, formatSajuToManseryeok, type BirthInfo } from "@/lib/saju/saju-api";
import { buildMyeongsikView } from "@/lib/saju/myeongsik-view";
import { serverEnv } from "@/lib/env";
import { sendOrderSms, sendOrderEmail } from "@/lib/order-notifications";

export const maxDuration = 300;
const SITE_ORIGIN = "https://www.hongyeondang.com";
const API_ROUTE = "/api/saju_janyeo-report";
const TOTAL_CHAPTERS = 8;

// 결제 직후 서버가 알아서 전체 리포트를 만들어두는 백그라운드 작업 (saju_total과 동일 패턴).
// 장이 끝나는 즉시 그 장만 바로 저장 — 중간에 죽어도 이미 만든 것까지는 안전하게 남고,
// 나머지는 고객이 결과지를 열 때 기존 클라이언트 쪽 자동 생성 로직이 이어서 채운다.
async function generateReportInBackground(resultId: string) {
  try {
    fetch(`${SITE_ORIGIN}${API_ROUTE}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: resultId }),
    }).catch((e) => console.error(`[bg-gen] ${resultId} 이미지 생성 실패:`, e));

    fetch(`${SITE_ORIGIN}${API_ROUTE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: resultId, concernOnly: true }),
    }).catch((e) => console.error(`[bg-gen] ${resultId} 고민조언 생성 실패:`, e));

    await Promise.all(
      Array.from({ length: TOTAL_CHAPTERS }, (_, i) => i + 1).map(async (chapter) => {
        try {
          const genRes = await fetch(`${SITE_ORIGIN}${API_ROUTE}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: resultId, chapter }),
          });
          const genJson = await genRes.json().catch(() => null);
          const sections = genJson?.sections;
          if (!sections) {
            console.error(`[bg-gen] ${resultId} ${chapter}장 생성 실패:`, genJson?.error ?? genRes.status);
            return;
          }
          const saveRes = await fetch(`${SITE_ORIGIN}${API_ROUTE}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: resultId, content: sections }),
          });
          if (!saveRes.ok) console.error(`[bg-gen] ${resultId} ${chapter}장 저장 실패:`, saveRes.status);
        } catch (e) {
          console.error(`[bg-gen] ${resultId} ${chapter}장 처리 중 예외:`, e);
        }
      }),
    );
  } catch (e) {
    console.error(`[bg-gen] ${resultId} 백그라운드 생성 전체 실패:`, e);
  }
}

const PRODUCT_NAME = "자녀사주";
const PRODUCT_PRICE = 19900;
const REPORT_PATH = "saju/saju_janyeo/report-preview";

const bodySchema = z.object({
  paymentKey: z.string().min(1),
  orderId: z.string().min(1),
  amount: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
  const { paymentKey, orderId, amount } = parsed.data;

  const service = createServiceClient();

  const { data: order } = await service.from("orders").select("id, amount, status, guest_email, product_id").eq("order_id", orderId).maybeSingle();
  if (!order) return NextResponse.json({ error: "주문을 찾을 수 없습니다" }, { status: 404 });
  if (order.status === "paid") {
    const { data: result } = await service.from("saju_results").select("id").eq("order_id", order.id).maybeSingle();
    if (result) {
      const { data: si } = await service.from("saju_inputs").select("name, gender").eq("order_id", order.id).maybeSingle();
      return NextResponse.json({ resultId: result.id, name: si?.name ?? "", gender: si?.gender ?? "male", alreadyPaid: true });
    }
  }
  if (order.amount !== amount) return NextResponse.json({ error: "금액이 일치하지 않습니다" }, { status: 400 });

  const isLive = !(await isCurrentUserAdmin());
  const toss = await confirmTossPayment({ paymentKey, orderId, amount }, isLive);
  if (!toss.ok) {
    await service.from("orders").update({ status: "failed" }).eq("id", order.id);
    return NextResponse.json({ error: toss.error.message, code: toss.error.code }, { status: 402 });
  }
  if (toss.data.totalAmount !== amount) {
    await service.from("orders").update({ status: "failed" }).eq("id", order.id);
    return NextResponse.json({ error: "토스 응답 금액 불일치" }, { status: 400 });
  }

  await service.from("orders").update({ status: "paid", toss_payment_key: paymentKey, paid_at: toss.data.approvedAt }).eq("id", order.id);

  const { data: input } = await service.from("saju_inputs").select("*").eq("order_id", order.id).maybeSingle();
  if (!input) return NextResponse.json({ error: "사주 정보를 찾을 수 없습니다" }, { status: 500 });
  if (!isSajuApiConfigured()) return NextResponse.json({ error: "사주 API가 설정되지 않았습니다" }, { status: 503 });

  try {
    const [y, m, d] = String(input.birth_date).split("-");
    const hasTime = !input.time_unknown && !!input.birth_time;
    const [hh, mm] = hasTime ? String(input.birth_time).split(":") : ["", ""];
    const pad = (n: string | number) => String(n).padStart(2, "0");

    const birthInfo: BirthInfo = {
      birthYear: y, birthMonth: String(Number(m)), birthDay: String(Number(d)),
      ...(hasTime ? { birthHour: String(Number(hh)), birthMinute: String(Number(mm)) } : {}),
      calendarType: input.calendar === "lunar" ? "음력" : "양력",
      gender: input.gender as "male" | "female",
    };

    const analysis = await fetchSajuAnalysis(birthInfo, [], { source: "confirm" });
    const view = buildMyeongsikView(analysis);
    const manseryeokText = formatSajuToManseryeok(analysis, birthInfo);
    const env = serverEnv();
    const llmMeta = { provider: env.LLM_PROVIDER, model: env.LLM_MODEL };

    const birth = {
      date: `${y}.${pad(m)}.${pad(d)}`,
      calendar: input.calendar === "lunar" ? "음력" : "양력",
      time: hasTime ? `${pad(hh)}:${pad(mm)}` : "시간 모름",
      gender: input.gender,
    };

    const { data: result, error: resultErr } = await service.from("saju_results").insert({
      order_id: order.id,
      myeongsik: { view, name: input.name ?? "", birth, manseryeokText, gender: input.gender, concern: (input.concerns as string[] | null)?.[0] ?? "" } as never,
      interpretation_md: JSON.stringify({}),
      llm_provider: llmMeta.provider,
      llm_model: llmMeta.model,
    }).select("id").single();

    if (resultErr || !result) return NextResponse.json({ error: "결과 레코드 저장 실패", detail: resultErr?.message }, { status: 500 });

    const reportUrl = `https://www.hongyeondang.com/${REPORT_PATH}?id=${result.id}`;
    await Promise.all([
      sendOrderSms({ customerName: input.name ?? "고객", productName: PRODUCT_NAME, price: PRODUCT_PRICE }),
      order.guest_email ? sendOrderEmail({ customerEmail: order.guest_email, customerName: input.name ?? "고객", productName: PRODUCT_NAME, price: PRODUCT_PRICE, reportUrl }) : Promise.resolve(),
    ]);

    after(() => generateReportInBackground(result.id));

    return NextResponse.json({ resultId: result.id, name: input.name ?? "", gender: input.gender ?? "male" });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
