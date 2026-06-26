import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { serverEnv } from "@/lib/env";

const ID_DOMAIN = "@hongyeondang.com";

// 어드민 패스워드로 보호 — 테스트 계정 생성용
export async function POST(req: NextRequest) {
  const { username, password, adminPassword } = await req.json();

  if (!adminPassword || adminPassword !== serverEnv().ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!username || !password) {
    return NextResponse.json({ error: "username and password required" }, { status: 400 });
  }

  const email = username.trim().toLowerCase() + ID_DOMAIN;
  const supabase = createServiceClient();

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: username },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ id: data.user.id, email });
}
