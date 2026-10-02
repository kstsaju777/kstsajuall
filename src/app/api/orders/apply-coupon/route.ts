import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  orderId: z.string().min(1),
  couponId: z.string().min(1).nullable(), // null = 쿠폰 적용 해제
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
  }
  const { orderId, couponId } = parsed.data;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const service = createServiceClient();

  const { data: order } = await service
    .from("orders")
    .select("id, amount, status, product_id, coupon_user_coupon_id")
    .eq("order_id", orderId)
    .maybeSingle();
  if (!order) return NextResponse.json({ error: "주문을 찾을 수 없습니다" }, { status: 404 });
  if (order.status !== "pending") return NextResponse.json({ error: "이미 처리된 주문입니다" }, { status: 400 });

  const { data: product } = await service.from("products").select("price").eq("id", order.product_id).maybeSingle();
  if (!product) return NextResponse.json({ error: "상품을 찾을 수 없습니다" }, { status: 404 });

  // 이전에 이 주문에 걸어둔 쿠폰이 있으면 먼저 풀어준다 (쿠폰 교체/해제 시)
  if (order.coupon_user_coupon_id) {
    await service.from("user_coupons").update({ order_id: null }).eq("id", order.coupon_user_coupon_id);
  }

  if (couponId === null) {
    await service.from("orders").update({ amount: product.price, coupon_user_coupon_id: null, coupon_discount: 0 }).eq("id", order.id);
    return NextResponse.json({ amount: product.price });
  }

  const { data: coupon } = await service
    .from("user_coupons")
    .select("id, user_id, status, coupon_type_id")
    .eq("id", couponId)
    .maybeSingle();
  if (!coupon || coupon.user_id !== user.id || coupon.status !== "unused") {
    return NextResponse.json({ error: "사용할 수 없는 쿠폰입니다" }, { status: 400 });
  }

  const { data: couponType } = await service
    .from("coupon_types")
    .select("discount_kind, amount")
    .eq("id", coupon.coupon_type_id)
    .maybeSingle();
  if (!couponType) return NextResponse.json({ error: "쿠폰 정보를 찾을 수 없습니다" }, { status: 400 });

  const discount = couponType.discount_kind === "free_pass" ? product.price : Math.min(couponType.amount, product.price);
  const newAmount = Math.max(0, product.price - discount);

  await service.from("user_coupons").update({ order_id: order.id }).eq("id", coupon.id);
  await service
    .from("orders")
    .update({ amount: newAmount, coupon_user_coupon_id: coupon.id, coupon_discount: discount })
    .eq("id", order.id);

  return NextResponse.json({ amount: newAmount });
}
