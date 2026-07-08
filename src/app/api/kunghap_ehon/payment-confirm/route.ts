import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { confirmTossPayment } from "@/lib/toss/confirm";
import { isSajuApiConfigured, fetchSajuAnalysis, formatSajuToManseryeok, type BirthInfo } from "@/lib/saju/saju-api";
import { buildMyeongsikView } from "@/lib/saju/myeongsik-view";
import { serverEnv } from "@/lib/env";
import { sendOrderSms, sendOrderEmail, sendAlimtalk } from "@/lib/order-notifications";

export const maxDuration = 60;

const PRODUCT_NAME = "이혼궁합";
const PRODUCT_PRICE = 29900;
const REPORT_PATH = "saju/kunghap_ehon/report-preview";

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

  const toss = await confirmTossPayment({ paymentKey, orderId, amount });
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
    const partnerDataRaw = (input.concerns as string[] | null)?.[0] ?? "{}";
    const partnerData = JSON.parse(partnerDataRaw);
    const { partnerName: pName, partnerBirthDate, partnerBirthTime, partnerGender: pGenderRaw, partnerCalendar: pCalendar } = partnerData;

    const pad = (n: string | number) => String(n).padStart(2, "0");
    const [y, m, d] = String(input.birth_date).split("-");
    const hasTime = !input.time_unknown && !!input.birth_time;
    const [hh, mm] = hasTime ? String(input.birth_time).split(":") : ["", ""];
    const g: "male" | "female" = input.gender === "female" ? "female" : "male";

    const birthInfo: BirthInfo = {
      birthYear: y, birthMonth: String(Number(m)), birthDay: String(Number(d)),
      ...(hasTime ? { birthHour: String(Number(hh)), birthMinute: String(Number(mm)) } : {}),
      calendarType: input.calendar === "lunar" ? "음력" : "양력",
      gender: g,
    };
    const analysis = await fetchSajuAnalysis(birthInfo, [], { source: "confirm" });
    const view = buildMyeongsikView(analysis);
    const myManseryeokText = formatSajuToManseryeok(analysis, birthInfo);

    const pg: "male" | "female" = pGenderRaw === "female" ? "female" : "male";
    const pymd = partnerBirthDate ? String(partnerBirthDate).split("-") : null;
    let partnerView = null;
    let partnerManseryeokText = "";
    let partnerBirth = null;

    if (pymd && pymd.length === 3) {
      const [py, pm, pd] = pymd;
      const phasTime = !!partnerBirthTime;
      const [phh, pmm2] = phasTime ? String(partnerBirthTime).split(":") : ["", ""];
      const partnerBirthInfo: BirthInfo = {
        birthYear: py, birthMonth: String(Number(pm)), birthDay: String(Number(pd)),
        ...(phasTime ? { birthHour: String(Number(phh)), birthMinute: String(Number(pmm2)) } : {}),
        calendarType: pCalendar === "lunar" ? "음력" : "양력",
        gender: pg,
      };
      const partnerAnalysis = await fetchSajuAnalysis(partnerBirthInfo, [], { source: "confirm" });
      partnerView = buildMyeongsikView(partnerAnalysis);
      partnerManseryeokText = formatSajuToManseryeok(partnerAnalysis, partnerBirthInfo);
      partnerBirth = {
        date: `${py}.${pad(pm)}.${pad(pd)}`,
        calendar: pCalendar === "lunar" ? "음력" : "양력",
        time: phasTime ? `${pad(phh)}:${pad(pmm2)}` : "시간 모름",
        gender: pg,
      };
    }

    const birth = {
      date: `${y}.${pad(m)}.${pad(d)}`,
      calendar: input.calendar === "lunar" ? "음력" : "양력",
      time: hasTime ? `${pad(hh)}:${pad(mm)}` : "시간 모름",
      gender: g,
    };

    const env = serverEnv();
    const llmMeta = { provider: env.LLM_PROVIDER, model: env.LLM_MODEL };

    const { data: result, error: resultErr } = await service.from("saju_results").insert({
      order_id: order.id,
      myeongsik: { view, name: input.name ?? "", birth, manseryeokText: myManseryeokText, partnerManseryeokText, gender: g, partnerView, partnerName: pName ?? "", partnerBirth, partnerGender: pg } as never,
      interpretation_md: JSON.stringify({}),
      llm_provider: llmMeta.provider,
      llm_model: llmMeta.model,
    }).select("id").single();

    if (resultErr || !result) return NextResponse.json({ error: "결과 레코드 저장 실패", detail: resultErr?.message }, { status: 500 });

    const reportUrl = `https://www.hongyeondang.com/${REPORT_PATH}?id=${result.id}`;
    await Promise.all([
      sendOrderSms({ customerName: input.name ?? "고객", productName: PRODUCT_NAME, price: PRODUCT_PRICE }),
      input.phone ? sendAlimtalk({ customerPhone: input.phone, customerName: input.name ?? "고객", resultUrl: reportUrl }) : Promise.resolve(),
      order.guest_email ? sendOrderEmail({ customerEmail: order.guest_email, customerName: input.name ?? "고객", productName: PRODUCT_NAME, price: PRODUCT_PRICE, reportUrl }) : Promise.resolve(),
    ]);

    return NextResponse.json({ resultId: result.id, name: input.name ?? "", gender: g, partnerName: pName ?? "", partnerGender: pg });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
