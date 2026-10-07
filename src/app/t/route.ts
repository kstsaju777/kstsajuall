import type { NextRequest } from "next/server";
import { shortLinkRedirect } from "@/lib/short-link";

// 스레드 프로필 링크용: /t → /welcome?utm_source=threads&utm_medium=bio
export function GET(request: NextRequest) {
  return shortLinkRedirect(request, { utm_source: "threads", utm_medium: "bio" });
}
