import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAILS = ["admin@hongyeondang.com", "semiadmin@hongyeondang.com"];

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = !!user && ADMIN_EMAILS.includes(user.email ?? "");
  return NextResponse.json({ isAdmin });
}
