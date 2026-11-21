import type { NextRequest } from "next/server";
import { productShortLinkRedirect } from "@/lib/short-link";

// 스레드 고정글용 상품 바로가기: /t/jaehwe → /saju/kunghap_jaehwe?utm_source=threads&utm_medium=pinned&utm_content=sub_jaehwe
export async function GET(request: NextRequest, { params }: { params: Promise<{ p: string }> }) {
  const { p } = await params;
  return productShortLinkRedirect(request, { utm_source: "threads", utm_medium: "pinned" }, p);
}
