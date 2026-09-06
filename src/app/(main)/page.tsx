import { createServiceClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { HomeClient } from "./HomeClient";

// 60초마다 재빌드 — 매 요청마다 Supabase 쿼리 실행하지 않음
export const revalidate = 60;

export default async function HomePage() {
  const isAdmin = isSupabaseConfigured() ? await isCurrentUserAdmin() : false;

  const service = createServiceClient();
  let query = service
    .from("products")
    .select("id, name, slug, price, description, is_active, image_url, badge, tag, is_video, category")
    .order("display_order", { ascending: true });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: products } = await (query as any);

  return <HomeClient initialProducts={products ?? []} isAdmin={isAdmin} />;
}
