import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ coupons: [] });
  }

  const service = createServiceClient();
  const { data: coupons, error } = await service
    .from("user_coupons")
    .select("id, coupon_type_id, status, created_at")
    .eq("user_id", user.id)
    .eq("status", "unused")
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const typeIds = Array.from(new Set((coupons ?? []).map((c) => c.coupon_type_id)));
  const { data: types } = typeIds.length
    ? await service.from("coupon_types").select("id, name, discount_kind, amount").in("id", typeIds)
    : { data: [] };
  const typeMap = new Map((types ?? []).map((t) => [t.id, t]));

  const result = (coupons ?? [])
    .map((c) => {
      const t = typeMap.get(c.coupon_type_id);
      if (!t) return null;
      return { id: c.id, name: t.name, discountKind: t.discount_kind, amount: t.amount };
    })
    .filter((c): c is { id: string; name: string; discountKind: "fixed" | "free_pass"; amount: number } => !!c);

  return NextResponse.json({ coupons: result });
}
