import type { NextRequest } from "next/server";
import { productShortLinkRedirect } from "@/lib/short-link";

// 메타(인스타·페이스북) 광고용 상품 바로가기: /m/total → /saju/total?utm_source=meta&utm_medium=paid&utm_campaign=ugc&utm_content=sub_total
// 광고 관리자 URL 매개변수(utm_content={{ad.name}})를 붙이면 그 값이 우선한다.
export async function GET(request: NextRequest, { params }: { params: Promise<{ p: string }> }) {
  const { p } = await params;
  return productShortLinkRedirect(request, { utm_source: "meta", utm_medium: "paid", utm_campaign: "ugc" }, p);
}
