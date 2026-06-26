import { NextResponse, type NextRequest } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const service = createServiceClient();
  const { data: products, error } = await service
    .from("products")
    .select("id, name, slug, price, is_active, image_url, badge, tag, is_video")
    .order("display_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products });
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, is_active } = await request.json();
  if (!id || typeof is_active !== "boolean") {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }
  const service = createServiceClient();
  const { error } = await service.from("products").update({ is_active }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // 순서 일괄 업데이트: [{ id, display_order }]
  const { orders } = await request.json();
  if (!Array.isArray(orders)) return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  const service = createServiceClient();
  for (const { id, display_order } of orders) {
    await service.from("products").update({ display_order }).eq("id", id);
  }
  return NextResponse.json({ ok: true });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const { name, slug, price, description, image_url, badge, tag, is_video, display_order } = body;
  if (!name || !slug || !price) {
    return NextResponse.json({ error: "name, slug, price는 필수입니다" }, { status: 400 });
  }
  const service = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (service.from("products") as any).insert({
    name, slug, price: Number(price),
    description: description ?? "",
    image_url: image_url ?? "",
    badge: badge ?? "",
    tag: tag ?? "",
    is_video: is_video ?? false,
    display_order: display_order ?? 99,
    is_active: false,
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data });
}
