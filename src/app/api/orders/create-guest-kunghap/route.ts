import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { createServiceClient } from "@/lib/supabase/server";

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
  partnerName: z.string().max(50).optional(),
  partnerBirthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  partnerBirthTime: z.string().nullable().optional(),
  partnerTimeUnknown: z.boolean().optional(),
  partnerGender: z.enum(["male", "female"]).optional(),
  partnerCalendar: z.enum(["solar", "lunar"]).optional(),
  breakupReason: z.string().max(100).optional(),
  whoEnded: z.string().max(20).optional(),
  breakupDate: z.string().max(50).optional(),
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

  const partnerData = JSON.stringify({
    partnerName: body.partnerName ?? "",
    partnerBirthDate: body.partnerBirthDate ?? "",
    partnerBirthTime: toHHMM(body.partnerBirthTime ?? null),
    partnerTimeUnknown: body.partnerTimeUnknown ?? false,
    partnerGender: body.partnerGender ?? "male",
    partnerCalendar: body.partnerCalendar ?? "solar",
    breakupReason: body.breakupReason ?? "",
    whoEnded: body.whoEnded ?? "",
    breakupDate: body.breakupDate ?? "",
  });
  const concerns = [...(body.concerns ?? []), partnerData];

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
