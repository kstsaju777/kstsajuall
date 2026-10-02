import { NextResponse, type NextRequest } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const service = createServiceClient();

  const { data: types, error: typesErr } = await service
    .from("coupon_types")
    .select("id, code, name, discount_kind, amount, is_active, created_at")
    .order("created_at", { ascending: true });
  if (typesErr) return NextResponse.json({ error: typesErr.message }, { status: 500 });

  const { data: issued, error: issuedErr } = await service
    .from("user_coupons")
    .select("id, user_id, coupon_type_id, status, order_id, created_at, used_at")
    .order("created_at", { ascending: false });
  if (issuedErr) return NextResponse.json({ error: issuedErr.message }, { status: 500 });

  const userIds = Array.from(new Set((issued ?? []).map((i) => i.user_id)));
  const { data: profiles } = userIds.length
    ? await service.from("profiles").select("id, email").in("id", userIds)
    : { data: [] };
  const emailMap = new Map((profiles ?? []).map((p) => [p.id, p.email]));

  const issuedWithEmail = (issued ?? []).map((i) => ({ ...i, email: emailMap.get(i.user_id) ?? "(알 수 없음)" }));

  return NextResponse.json({ types: types ?? [], issued: issuedWithEmail });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const { code, name, discountKind, amount } = body;
  if (!code || !name || !discountKind) {
    return NextResponse.json({ error: "code, name, discountKind은 필수입니다" }, { status: 400 });
  }
  const service = createServiceClient();
  const { data, error } = await service
    .from("coupon_types")
    .insert({
      code,
      name,
      discount_kind: discountKind === "free_pass" ? "free_pass" : "fixed",
      amount: discountKind === "free_pass" ? 0 : Number(amount) || 0,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ type: data });
}
