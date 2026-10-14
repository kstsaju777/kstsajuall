import { NextResponse, type NextRequest } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/server";

const ID_DOMAIN = "@hongyeondang.com";
const MAX_COUNT = 10;
const MAX_IDS = 100;

// 아이디 하나 또는 여러 개(userIds)에게 같은 쿠폰을 count장씩 지급한다.
// 사이트 로그인은 "아이디"@hongyeondang.com 형태의 가짜 이메일을 사용한다 — 이미 @가 붙어 있으면 그대로 쓴다.
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const couponTypeId = body.couponTypeId as string | undefined;
  const rawIds: string[] = Array.isArray(body.userIds)
    ? body.userIds
    : typeof body.userId === "string"
      ? [body.userId]
      : [];
  const ids = Array.from(
    new Set(rawIds.map((s) => String(s).trim().toLowerCase()).filter(Boolean)),
  );
  const count = Math.floor(Number(body.count ?? 1));

  if (ids.length === 0 || !couponTypeId) {
    return NextResponse.json({ error: "userId(s), couponTypeId는 필수입니다" }, { status: 400 });
  }
  if (ids.length > MAX_IDS) {
    return NextResponse.json({ error: `한 번에 최대 ${MAX_IDS}명까지 지급할 수 있습니다` }, { status: 400 });
  }
  if (!Number.isFinite(count) || count < 1 || count > MAX_COUNT) {
    return NextResponse.json({ error: `수량은 1~${MAX_COUNT}장입니다` }, { status: 400 });
  }

  const service = createServiceClient();

  const { data: couponType } = await service
    .from("coupon_types")
    .select("id")
    .eq("id", couponTypeId)
    .maybeSingle();
  if (!couponType) {
    return NextResponse.json({ error: "쿠폰 종류를 찾을 수 없습니다" }, { status: 404 });
  }

  const results: { id: string; ok: boolean; issued: number; error?: string }[] = [];
  for (const rawId of ids) {
    const email = rawId.includes("@") ? rawId : rawId + ID_DOMAIN;

    const { data: profile } = await service
      .from("profiles")
      .select("id, email")
      .ilike("email", email)
      .maybeSingle();
    if (!profile) {
      results.push({ id: rawId, ok: false, issued: 0, error: "가입된 계정을 찾을 수 없습니다" });
      continue;
    }

    const rows = Array.from({ length: count }, () => ({ user_id: profile.id, coupon_type_id: couponTypeId }));
    const { error } = await service.from("user_coupons").insert(rows);
    if (error) {
      results.push({ id: rawId, ok: false, issued: 0, error: error.message });
    } else {
      results.push({ id: rawId, ok: true, issued: count });
    }
  }

  return NextResponse.json({ results });
}
