import { createServiceClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { HomeClient } from "./HomeClient";

// 60초마다 재빌드 — 매 요청마다 Supabase 쿼리 실행하지 않음
export const revalidate = 60;

const ADMIN_EMAIL = "admin@hongyeondang.com";

export default async function HomePage() {
  const user = isSupabaseConfigured() ? await getCurrentUser() : null;
  const isAdmin = !!user && user.email === ADMIN_EMAIL;

  const service = createServiceClient();
  let query = service
    .from("products")
    .select("id, name, slug, price, description, is_active, image_url, badge, tag, is_video, category")
    .order("display_order", { ascending: true });

  if (!isAdmin) {
    query = query.eq("is_active", true);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: products } = await (query as any);

  return <HomeClient initialProducts={products ?? []} isAdmin={isAdmin} />;
}
