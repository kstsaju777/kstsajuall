import { NextResponse, type NextRequest, after } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { confirmTossPayment } from "@/lib/toss/confirm";
import { isCurrentUserAdmin } from "@/lib/auth";
import {
  isSajuApiConfigured,
  fetchSajuAnalysis,
  formatSajuToManseryeok,
  type BirthInfo,
} from "@/lib/saju/saju-api";
import { buildMyeongsikView } from "@/lib/saju/myeongsik-view";
import { serverEnv } from "@/lib/env";
import { sendOrderSms, sendOrderEmail } from "@/lib/order-notifications";

export const maxDuration = 300;
const SITE_ORIGIN = "https://www.hongyeondang.com";
const API_ROUTE = "/api/saju_total-report";
const TOTAL_CHAPTERS = 10;

const PRODUCT_NAME = "정통사주";
const PRODUCT_PRICE = 24900;
const REPORT_PATH = "saju/saju_total/report-preview";

// 결제 직후 서버가 알아서 전체 리포트를 만들어두는 백그라운드 작업.
// 예전엔 고객 브라우저가 10개 장을 다 모아서 한 번에 저장해야만 완성/알림톡이
// 발송되는 구조라, 로딩 중 고객이 화면을 벗어나면(흔한 일) 저장 자체가 아예 안 되는
// 사고가 있었음(기노현님 건). 장별로 개별 저장하는 방식으로 한 번 바꿨다가, 여러
// 장이 거의 동시에 저장되며 "전부 완성됐나" 체크가 서로 다른 스냅샷을 보는 경쟁
// 상태로 알림톡이 끝내 안 나가는 사고가 다시 있었음(자녀궁합 건). 그래서 10개
// 장을 전부 병렬 생성만 해두고, 다 모인 뒤 딱 한 번만 합쳐서 저장한다 — 저장이
// 정확히 한 번만 일어나 경쟁 상태 자체가 생기지 않는다. 클라이언트 쪽 자동 생성
// 로직은 안전망으로 그대로 유지(이미 저장된 장은 재생성 안 함).
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

    const merged: Record<string, unknown> = {};
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
          Object.assign(merged, sections);
        } catch (e) {
          console.error(`[bg-gen] ${resultId} ${chapter}장 처리 중 예외:`, e);
        }
      }),
    );

    if (Object.keys(merged).length > 0) {
      const saveRes = await fetch(`${SITE_ORIGIN}${API_ROUTE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resultId, content: merged }),
      });
      if (!saveRes.ok) console.error(`[bg-gen] ${resultId} 합본 저장 실패:`, saveRes.status);
    }
  } catch (e) {
    console.error(`[bg-gen] ${resultId} 백그라운드 생성 전체 실패:`, e);
  }
}

const bodySchema = z.object({
  paymentKey: z.string().min(1),
  orderId: z.string().min(1),
  amount: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
  }
  const { paymentKey, orderId, amount } = parsed.data;

  const service = createServiceClient();

  // 1. 주문 조회 및 금액 검증
  const { data: order } = await service
    .from("orders")
    .select("id, amount, status, guest_email, product_id")
    .eq("order_id", orderId)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: "주문을 찾을 수 없습니다" }, { status: 404 });
  }
  if (order.status === "paid") {
    const { data: result } = await service
      .from("saju_results")
      .select("id")
      .eq("order_id", order.id)
      .maybeSingle();
    if (result) {
      const { data: si } = await service.from("saju_inputs").select("name, gender").eq("order_id", order.id).maybeSingle();
      return NextResponse.json({ resultId: result.id, name: si?.name ?? "", gender: si?.gender ?? "male", alreadyPaid: true });
    }
  }
  if (order.amount !== amount) {
    return NextResponse.json({ error: "금액이 일치하지 않습니다" }, { status: 400 });
  }

  // 2. 토스 결제 확인
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

  await service
    .from("orders")
    .update({ status: "paid", toss_payment_key: paymentKey, paid_at: toss.data.approvedAt })
    .eq("id", order.id);

  // 3. 사주 입력 조회
  const { data: input } = await service
    .from("saju_inputs")
    .select("*")
    .eq("order_id", order.id)
    .maybeSingle();

  if (!input) {
    return NextResponse.json({ error: "사주 정보를 찾을 수 없습니다" }, { status: 500 });
  }

  if (!isSajuApiConfigured()) {
    return NextResponse.json({ error: "사주 API가 설정되지 않았습니다" }, { status: 503 });
  }

  try {
    const [y, m, d] = String(input.birth_date).split("-");
    const hasTime = !input.time_unknown && !!input.birth_time;
    const [hh, mm] = hasTime ? String(input.birth_time).split(":") : ["", ""];
    const pad = (n: string | number) => String(n).padStart(2, "0");

    const birthInfo: BirthInfo = {
      birthYear: y,
      birthMonth: String(Number(m)),
      birthDay: String(Number(d)),
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

    const { data: result, error: resultErr } = await service
      .from("saju_results")
      .insert({
        order_id: order.id,
        myeongsik: {
          view,
          name: input.name ?? "",
          birth,
          manseryeokText,
          gender: input.gender,
          concern: (input.concerns as string[] | null)?.[0] ?? "",
        } as never,
        interpretation_md: JSON.stringify({}),
        llm_provider: llmMeta.provider,
        llm_model: llmMeta.model,
      })
      .select("id")
      .single();

    if (resultErr || !result) {
      return NextResponse.json({ error: "결과 레코드 저장 실패", detail: resultErr?.message }, { status: 500 });
    }

    const reportUrl = `https://www.hongyeondang.com/${REPORT_PATH}?id=${result.id}`;
    await Promise.all([
      sendOrderSms({ customerName: input.name ?? "고객", productName: PRODUCT_NAME, price: PRODUCT_PRICE }),
      order.guest_email ? sendOrderEmail({ customerEmail: order.guest_email, customerName: input.name ?? "고객", productName: PRODUCT_NAME, price: PRODUCT_PRICE, reportUrl }) : Promise.resolve(),
    ]);

    // 결제 확인 응답은 즉시 내려주고, 실제 10개 장 생성은 응답 이후 백그라운드에서
    // 계속 진행한다(고객이 결과지 로딩 화면을 벗어나도 서버가 끝까지 만들어 저장함).
    after(() => generateReportInBackground(result.id));

    return NextResponse.json({
      resultId: result.id,
      name: input.name ?? "",
      gender: input.gender ?? "male",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
