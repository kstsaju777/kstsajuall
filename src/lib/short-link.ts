// 광고·프로필용 짧은 주소 → /welcome (광고 출처 utm 포함)
// 예) /t → /welcome?utm_source=threads
// 짧은 주소 뒤에 붙인 값(예: /d?utm_campaign=video_a)은 그대로 이어 붙이고, 같은 이름이면 뒤에 붙인 값이 우선한다.
import { NextResponse, type NextRequest } from "next/server";

export type ShortLinkPreset = Record<string, string>;

export function shortLinkRedirect(request: NextRequest, preset: ShortLinkPreset, path = "/welcome"): NextResponse {
  const url = new URL(path, request.url);
  for (const [k, v] of Object.entries(preset)) url.searchParams.set(k, v);
  request.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));
  // 임시 이동(307): 나중에 목적지를 바꿔도 브라우저가 옛 주소를 기억하지 않는다.
  const res = NextResponse.redirect(url, 307);
  res.headers.set("Cache-Control", "no-store");
  return res;
}

// 상품별 짧은 주소: /n/jaehwe → /saju/kunghap_jaehwe (+ 광고 출처 utm, utm_content=sub_별칭)
export const PRODUCT_ALIASES: Record<string, string> = {
  total: "total",
  yeonae: "kunghap_yeonae",
  jaehwe: "kunghap_jaehwe",
  gyeolhon: "kunghap_gyeolhon",
  ehon: "kunghap_ehon",
  janyeo: "kunghap_janyeo",
  imshin: "kunghap_imshin",
  banryeo: "kunghap_banryeo",
  biz: "kunghap_business",
  jaemul: "saju_jaemul",
  love: "saju_yeonae",
  health: "saju_health",
  kid: "saju_janyeo",
  baby: "saju_youare",
};

export function productShortLinkRedirect(request: NextRequest, preset: ShortLinkPreset, alias: string): NextResponse {
  const slug = PRODUCT_ALIASES[alias.toLowerCase()];
  // 모르는 별칭은 404 대신 웰컴페이지로 보낸다(광고 클릭을 잃지 않기 위해).
  if (!slug) return shortLinkRedirect(request, preset);
  return shortLinkRedirect(request, { ...preset, utm_content: `sub_${alias.toLowerCase()}` }, `/saju/${slug}`);
}
