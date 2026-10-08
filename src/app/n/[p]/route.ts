import type { NextRequest } from "next/server";
import { productShortLinkRedirect } from "@/lib/short-link";

// 네이버 파워링크 서브링크용: /n/jaehwe → /saju/kunghap_jaehwe?utm_source=naver&utm_medium=cpc&utm_campaign=powerlink&utm_content=sub_jaehwe
export async function GET(request: NextRequest, { params }: { params: Promise<{ p: string }> }) {
  const { p } = await params;
  return productShortLinkRedirect(request, { utm_source: "naver", utm_medium: "cpc", utm_campaign: "powerlink" }, p);
}
