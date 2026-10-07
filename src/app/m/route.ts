import type { NextRequest } from "next/server";
import { shortLinkRedirect } from "@/lib/short-link";

// 메타(인스타·페이스북) 광고용: /m → /welcome?utm_source=meta&utm_medium=paid&utm_campaign=welcome_v1
export function GET(request: NextRequest) {
  return shortLinkRedirect(request, { utm_source: "meta", utm_medium: "paid", utm_campaign: "welcome_v1" });
}
