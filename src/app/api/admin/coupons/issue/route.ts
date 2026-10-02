import { NextResponse, type NextRequest } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/server";

const ID_DOMAIN = "@hongyeondang.com";

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const rawId = (body.userId as string | undefined)?.trim().toLowerCase();
  const couponTypeId = body.couponTypeId as string | undefined;
  if (!rawId || !couponTypeId) {
    return NextResponse.json({ error: "userId, couponTypeId는 필수입니다" }, { status: 400 });
  }
  // 사이트 로그인은 "아이디"@hongyeondang.com 형태의 가짜 이메일을 사용한다 — 이미 @가 붙어 있으면 그대로 쓴다.
  const email = rawId.includes("@") ? rawId : rawId + ID_DOMAIN;

  const service = createServiceClient();

  const { data: profile } = await service
    .from("profiles")
    .select("id, email")
    .ilike("email", email)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ error: "해당 이메일로 가입한 계정을 찾을 수 없습니다" }, { status: 404 });
  }

  const { data: couponType } = await service
    .from("coupon_types")
    .select("id")
    .eq("id", couponTypeId)
    .maybeSingle();
  if (!couponType) {
    return NextResponse.json({ error: "쿠폰 종류를 찾을 수 없습니다" }, { status: 404 });
  }

  const { data: issued, error } = await service
    .from("user_coupons")
    .insert({ user_id: profile.id, coupon_type_id: couponTypeId })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ issued });
}
