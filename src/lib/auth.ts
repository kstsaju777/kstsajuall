import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// React.cache: 같은 렌더 트리 안에서 중복 호출 방지 (layout + page 동시 호출 시 1번만 실행)
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, isAdmin: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  return { user, isAdmin: !!profile?.is_admin };
}
