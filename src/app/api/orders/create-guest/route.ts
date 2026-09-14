import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  productSlug: z.string(),
  email: z.string().optional(),
  phone: z.string().max(20).optional(),
  name: z.string().max(50),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthTime: z.string().nullable(),
  timeUnknown: z.boolean(),
  gender: z.enum(["male", "female"]),
  calendar: z.enum(["solar", "lunar"]),
  concerns: z.array(z.string().max(500)).max(20),
  partnerName: z.string().optional(),
  partnerBirthDate: z.string().optional(),
  partnerBirthTime: z.string().nullable().optional(),
  partnerGender: z.string().optional(),
  partnerCalendar: z.string().optional(),
});

function toHHMM(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (/^\d{2}:\d{2}$/.test(raw)) return raw;
  const match = raw.match(/(\d{1,2}):(\d{2})\s*[-–~]\s*(\d{1,2}):(\d{2})/);
  if (match) {
    const start = parseInt(match[1]) * 60 + parseInt(match[2]);
    let end = parseInt(match[3]) * 60 + parseInt(match[4]);
    if (end < start) end += 24 * 60;
    const mid = Math.round((start + end) / 2) % (24 * 60);
    return `${String(Math.floor(mid / 60)).padStart(2, "0")}:${String(mid % 60).padStart(2, "0")}`;
  }
  return null;
}

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 요청입니다", details: parsed.error.flatten() }, { status: 400 });
  }
  const body = parsed.data;

  const service = createServiceClient();

  // 이름과 달리 "게스트 결제"용 라우트지만, 실제로는 로그인한 상태(예: 어드민 계정)로
  // 결제하는 경우도 이 라우트를 그대로 타므로, 로그인 세션이 있으면 user_id를 함께 기록한다.
  // (그래야 어드민 계정 결제가 매출 집계에서 정상적으로 자동 제외된다.)
  const supabaseAuth = await createClient();
  const { data: { user: loggedInUser } } = await supabaseAuth.auth.getUser();

  const { data: product } = await service
    .from("products")
    .select("id, price, is_active")
    .eq("slug", body.productSlug)
    .maybeSingle();

  if (!product) {
    return NextResponse.json({ error: "상품을 찾을 수 없습니다" }, { status: 404 });
  }

  const orderId = `ord_${nanoid(20)}`;

  const { data: order, error: orderErr } = await service
    .from("orders")
    .insert({
      order_id: orderId,
      user_id: loggedInUser?.id ?? null,
      guest_email: body.email,
      product_id: product.id,
      amount: product.price,
      status: "pending",
    })
    .select("id")
    .single();

  if (orderErr || !order) {
    return NextResponse.json({ error: "주문 생성 실패", detail: orderErr?.message }, { status: 500 });
  }

  const concerns: string[] = [...body.concerns];
  if (body.partnerBirthDate) {
    if (concerns.length === 0) concerns.push("");
    concerns[1] = JSON.stringify({
      partnerName: body.partnerName ?? "",
      partnerBirthDate: body.partnerBirthDate,
      partnerBirthTime: body.partnerBirthTime ?? null,
      partnerGender: body.partnerGender ?? "",
      partnerCalendar: body.partnerCalendar ?? "양력",
    });
  }

  const { error: inputErr } = await service.from("saju_inputs").insert({
    order_id: order.id,
    name: body.name,
    birth_date: body.birthDate,
    birth_time: toHHMM(body.birthTime),
    time_unknown: body.timeUnknown,
    gender: body.gender,
    calendar: body.calendar,
    concerns,
    phone: body.phone ?? null,
  });

  if (inputErr) {
    await service.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: "사주 정보 저장 실패", detail: inputErr.message }, { status: 500 });
  }

  return NextResponse.json({ orderId, amount: product.price });
}
