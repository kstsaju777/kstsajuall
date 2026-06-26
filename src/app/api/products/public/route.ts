import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// 어드민 체크 — 어드민이면 전체(비공개 포함), 아니면 공개만
async function isAdmin(request: Request) {
  try {
    const cookie = request.headers.get("cookie") ?? "";
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return !!user && user.email === "admin@hongyeondang.com";
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const admin = await isAdmin(request);
  const service = createServiceClient();

  let query = service
    .from("products")
    .select("id, name, slug, price, description, is_active, image_url, badge, tag, is_video")
    .order("display_order", { ascending: true });

  if (!admin) {
    query = query.eq("is_active", true);
  }

  const { data: products, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products });
}
