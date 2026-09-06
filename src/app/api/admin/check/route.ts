import { NextResponse } from "next/server";
import { isCurrentUserAdmin } from "@/lib/auth";

export async function GET() {
  const isAdmin = await isCurrentUserAdmin();
  return NextResponse.json({ isAdmin });
}
