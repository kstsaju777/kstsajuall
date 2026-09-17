import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

import { isChapterReady, CHAPTER_SECTIONS } from "@/lib/saju/report-content";
import { isJanyeoChapterReady, JANYEO_CHAPTER_SECTIONS } from "@/lib/saju/janyeo-report-content";
import { isYouareChapterReady, YOUARE_CHAPTER_SECTIONS } from "@/lib/saju/youare-report-content";
import { isGyeolhonKunghapChapterReady, GYEOLHON_KUNGHAP_CHAPTER_SECTIONS } from "@/lib/saju/kunghap_gyeolhon-report-content";
import { isEhonKunghapChapterReady, EHON_KUNGHAP_CHAPTER_SECTIONS } from "@/lib/saju/kunghap_ehon-report-content";
import { isJaehweKunghapChapterReady, JAEHWE_KUNGHAP_CHAPTER_SECTIONS } from "@/lib/saju/kunghap_jaehwe-report-content";
import { isJanyeoKunghapChapterReady, JANYEO_KUNGHAP_CHAPTER_SECTIONS } from "@/lib/saju/kunghap_janyeo-report-content";
import { isBusinessKunghapChapterReady, BUSINESS_KUNGHAP_CHAPTER_SECTIONS } from "@/lib/saju/kunghap_business-report-content";
import { isImshinKunghapChapterReady, IMSHIN_KUNGHAP_CHAPTER_SECTIONS } from "@/lib/saju/kunghap_imshin-report-content";
import { isYeonaeKunghapChapterReady, YEONAE_KUNGHAP_CHAPTER_SECTIONS } from "@/lib/saju/kunghap_yeonae-report-content";

export const maxDuration = 300;

const SITE_ORIGIN = "https://www.hongyeondang.com";

type ChapterReadyFn = (content: Record<string, unknown> | null | undefined, chapter: number) => boolean;

// 이미지 완료 후에만 알림톡을 보내는(WAIT_FOR_IMAGE) 10개 상품 전부의 설정.
// 결제 직후 after() 백그라운드 안에서 시도하는 이미지 생성이 원인 불명의 이유로
// 계속 실패해서(자기 자신 self-fetch든 직접 함수 호출이든 동일), 요청 생명주기와
// 완전히 분리된 이 예약 작업이 놓친 이미지를 대신 완성시킨다 - 고객이 결제 후
// 화면을 완전히 벗어나도(수 분~수십 분 뒤에도) 결국엔 이미지가 만들어지고
// 알림톡이 나가도록 보장하는 최종 안전망이다.
const PRODUCTS: Array<{
  slug: string;
  route: string;
  totalChapters: number;
  isChapterReady: ChapterReadyFn;
  chapterSections: Record<number, unknown>;
  dualImage: boolean;
}> = [
  { slug: "total", route: "/api/saju_total-report", totalChapters: 10, isChapterReady, chapterSections: CHAPTER_SECTIONS, dualImage: false },
  { slug: "saju_janyeo", route: "/api/saju_janyeo-report", totalChapters: 8, isChapterReady: isJanyeoChapterReady, chapterSections: JANYEO_CHAPTER_SECTIONS, dualImage: false },
  { slug: "saju_youare", route: "/api/saju_youare-report", totalChapters: 7, isChapterReady: isYouareChapterReady, chapterSections: YOUARE_CHAPTER_SECTIONS, dualImage: false },
  { slug: "kunghap_gyeolhon", route: "/api/kunghap_gyeolhon-report", totalChapters: 10, isChapterReady: isGyeolhonKunghapChapterReady, chapterSections: GYEOLHON_KUNGHAP_CHAPTER_SECTIONS, dualImage: true },
  { slug: "kunghap_ehon", route: "/api/kunghap_ehon-report", totalChapters: 10, isChapterReady: isEhonKunghapChapterReady, chapterSections: EHON_KUNGHAP_CHAPTER_SECTIONS, dualImage: true },
  { slug: "kunghap_jaehwe", route: "/api/kunghap_jaehwe-report", totalChapters: 10, isChapterReady: isJaehweKunghapChapterReady, chapterSections: JAEHWE_KUNGHAP_CHAPTER_SECTIONS, dualImage: true },
  { slug: "kunghap_janyeo", route: "/api/kunghap_janyeo-report", totalChapters: 9, isChapterReady: isJanyeoKunghapChapterReady, chapterSections: JANYEO_KUNGHAP_CHAPTER_SECTIONS, dualImage: true },
  { slug: "kunghap_business", route: "/api/kunghap_business-report", totalChapters: 9, isChapterReady: isBusinessKunghapChapterReady, chapterSections: BUSINESS_KUNGHAP_CHAPTER_SECTIONS, dualImage: true },
  { slug: "kunghap_imshin", route: "/api/kunghap_imshin-report", totalChapters: 8, isChapterReady: isImshinKunghapChapterReady, chapterSections: IMSHIN_KUNGHAP_CHAPTER_SECTIONS, dualImage: true },
  { slug: "kunghap_yeonae", route: "/api/kunghap_yeonae-report", totalChapters: 11, isChapterReady: isYeonaeKunghapChapterReady, chapterSections: YEONAE_KUNGHAP_CHAPTER_SECTIONS, dualImage: true },
];

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const service = createServiceClient();
  const sinceIso = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(); // 최근 6시간 결제 건만 검사

  const fixed: string[] = [];
  const stillWaiting: string[] = [];
  const errors: string[] = [];

  for (const product of PRODUCTS) {
    const { data: productRow } = await service.from("products").select("id").eq("slug", product.slug).maybeSingle();
    if (!productRow) continue;

    const { data: orders } = await service
      .from("orders")
      .select("id")
      .eq("product_id", productRow.id)
      .eq("status", "paid")
      .gte("created_at", sinceIso);
    if (!orders || orders.length === 0) continue;

    const orderIds = orders.map((o) => o.id);
    const { data: results } = await service
      .from("saju_results")
      .select("id, order_id, myeongsik, interpretation_md")
      .in("order_id", orderIds);
    if (!results) continue;

    for (const r of results) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stored = r.myeongsik as any;
      let content: Record<string, unknown> = {};
      try { content = JSON.parse(r.interpretation_md || "{}") || {}; } catch { content = {}; }

      const totalChapters = Object.keys(product.chapterSections).map(Number);
      const chaptersDone = totalChapters.every((n) => product.isChapterReady(content, n));
      if (!chaptersDone) { stillWaiting.push(`${product.slug}:${r.id}(챕터 미완성)`); continue; }

      const imageDone = product.dualImage
        ? !!stored?.sajuImageUrl && !!stored?.partnerSajuImageUrl
        : !!stored?.sajuImageUrl;
      if (imageDone) continue; // 이미 완성됨 - 손댈 것 없음

      try {
        const patchRes = await fetch(`${SITE_ORIGIN}${product.route}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: r.id }),
        });
        if (!patchRes.ok) { errors.push(`${product.slug}:${r.id} 이미지 생성 실패(${patchRes.status})`); continue; }

        // 이미지까지 확인된 지금 다시 저장을 재확인시켜 알림톡을 발송시킨다
        // (챕터 합본 저장은 이미지가 없을 때 이미 끝나 알림톡이 스킵됐을 것이다).
        await fetch(`${SITE_ORIGIN}${product.route}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: r.id, content: {} }),
        }).catch(() => {});

        fixed.push(`${product.slug}:${r.id}`);
      } catch (e) {
        errors.push(`${product.slug}:${r.id} 예외: ${String(e)}`);
      }
    }
  }

  return NextResponse.json({ fixed, stillWaiting, errors });
}
