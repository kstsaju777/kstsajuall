import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getTotalUsage } from "@/lib/saju/usage";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const usage = await getTotalUsage();
  if (!usage) return NextResponse.json(null);
  return NextResponse.json(usage);
}
