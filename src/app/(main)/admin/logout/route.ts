import { NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/admin-auth";
import { publicEnv } from "@/lib/env";

export async function POST() {
  await clearAdminCookie();
  return NextResponse.redirect(new URL("/admin/login", publicEnv.NEXT_PUBLIC_SITE_URL));
}

export async function GET() {
  await clearAdminCookie();
  return NextResponse.redirect(new URL("/admin/login", publicEnv.NEXT_PUBLIC_SITE_URL));
}
