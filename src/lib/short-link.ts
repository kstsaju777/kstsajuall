// 광고·프로필용 짧은 주소 → /welcome (광고 출처 utm 포함)
// 예) /t → /welcome?utm_source=threads
// 짧은 주소 뒤에 붙인 값(예: /d?utm_campaign=video_a)은 그대로 이어 붙이고, 같은 이름이면 뒤에 붙인 값이 우선한다.
import { NextResponse, type NextRequest } from "next/server";

export type ShortLinkPreset = Record<string, string>;

export function shortLinkRedirect(request: NextRequest, preset: ShortLinkPreset): NextResponse {
  const url = new URL("/welcome", request.url);
  for (const [k, v] of Object.entries(preset)) url.searchParams.set(k, v);
  request.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));
  // 임시 이동(307): 나중에 목적지를 바꿔도 브라우저가 옛 주소를 기억하지 않는다.
  const res = NextResponse.redirect(url, 307);
  res.headers.set("Cache-Control", "no-store");
  return res;
}
