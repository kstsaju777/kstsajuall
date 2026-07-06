import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { createServiceClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  productSlug: z.string(),
  email: z.string().email(),
  name: z.string().max(50),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
  timeUnknown: z.boolean(),
  gender: z.enum(["male", "female"]),
  calendar: z.enum(["solar", "lunar"]),
  concerns: z.array(z.string().max(100)).max(20),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 요청입니다", details: parsed.error.flatten() }, { status: 400 });
  }
  const body = parsed.data;

  const service = createServiceClient();

  const { data: product } = await service
    .from("products")
    .select("id, price, is_active")
    .eq("slug", body.productSlug)
    .maybeSingle();

  if (!product || !product.is_active) {
    return NextResponse.json({ error: "상품을 찾을 수 없습니다" }, { status: 404 });
  }

  const orderId = `ord_${nanoid(20)}`;

  const { data: order, error: orderErr } = await service
    .from("orders")
    .insert({
      order_id: orderId,
      user_id: null,
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

  const { error: inputErr } = await service.from("saju_inputs").insert({
    order_id: order.id,
    name: body.name,
    birth_date: body.birthDate,
    birth_time: body.birthTime,
    time_unknown: body.timeUnknown,
    gender: body.gender,
    calendar: body.calendar,
    concerns: body.concerns,
  });

  if (inputErr) {
    await service.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: "사주 정보 저장 실패", detail: inputErr.message }, { status: 500 });
  }

  return NextResponse.json({ orderId, amount: product.price });
}
