import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "admin@hongyeondang.com";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = !!user && user.email === ADMIN_EMAIL;
  return NextResponse.json({ isAdmin });
}
