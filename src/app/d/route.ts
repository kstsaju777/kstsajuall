import type { NextRequest } from "next/server";
import { shortLinkRedirect } from "@/lib/short-link";

// 당근 광고용: /d → /welcome?utm_source=daangn&utm_medium=paid&utm_campaign=welcome_v1
export function GET(request: NextRequest) {
  return shortLinkRedirect(request, { utm_source: "daangn", utm_medium: "paid", utm_campaign: "welcome_v1" });
}
