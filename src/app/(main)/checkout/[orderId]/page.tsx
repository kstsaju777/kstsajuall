import { notFound, redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { TossWidget } from "@/components/checkout/TossWidget";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatKRW } from "@/lib/utils";

export const metadata = { title: "결제" };

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const service = createServiceClient();

  const { data: order } = await service
    .from("orders")
    .select("id, order_id, amount, status, user_id, guest_email, product_id")
    .eq("order_id", orderId)
    .maybeSingle();

  if (!order) notFound();
  if (order.status === "paid") {
    const { data: result } = await service
      .from("saju_results")
      .select("id")
      .eq("order_id", order.id)
      .maybeSingle();
    if (result) redirect(`/results/${result.id}`);
  }

  const { data: product } = await service
    .from("products")
    .select("name")
    .eq("id", order.product_id)
    .single();

  const customerKey = order.user_id ?? `guest_${order.id}`;
  const email = order.guest_email;

  const { data: productSlugRow } = await service
    .from("products")
    .select("slug")
    .eq("id", order.product_id)
    .single();
  const slug = productSlugRow?.slug ?? "";

  // 상품별 전용 successUrl
  const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const successUrl = slug === "total"
    ? `${SITE}/saju/saju_total/checkout/success`
    : `${SITE}/checkout/success`;

  return (
    <div className="container py-12 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>결제</CardTitle>
          <CardDescription>
            {product?.name ?? "사주 상품"} · <span className="font-semibold text-foreground">{formatKRW(order.amount)}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TossWidget
            orderId={order.order_id}
            amount={order.amount}
            customerKey={customerKey}
            productName={product?.name ?? "사주 상품"}
            customerEmail={email}
            successUrl={successUrl}
          />
        </CardContent>
      </Card>
    </div>
  );
}
