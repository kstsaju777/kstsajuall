import type { NextRequest } from "next/server";
import { shortLinkRedirect } from "@/lib/short-link";

// 네이버 파워링크용: /n → /welcome?utm_source=naver&utm_medium=cpc&utm_campaign=powerlink
export function GET(request: NextRequest) {
  return shortLinkRedirect(request, { utm_source: "naver", utm_medium: "cpc", utm_campaign: "powerlink" });
}
