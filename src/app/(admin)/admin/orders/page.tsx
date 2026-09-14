import Link from "next/link";
import { requireAdminPassword } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { Badge } from "@/components/ui/badge";
import { formatKRW, formatDate } from "@/lib/utils";

export const metadata = { title: "관리자 - 결제 내역" };

type SearchParams = Promise<{ status?: string; product?: string }>;

const STATUS_LABEL: Record<string, string> = {
  paid: "결제완료",
  pending: "결제대기",
  failed: "실패",
};

type OrderRow = {
  id: string;
  order_id: string;
  amount: number;
  status: string;
  created_at: string;
  user_id: string | null;
  guest_email: string | null;
  product_id: string;
  toss_payment_key: string | null;
};

type InputRow = {
  order_id: string;
  name: string | null;
  concerns: string[] | null;
};

// 궁합 상품은 상대방 이름이 concerns 배열 마지막 요소(JSON)에 들어있음
function getPartnerName(concerns: unknown): string {
  const arr = (concerns as string[] | null) ?? [];
  const raw = arr.at(-1) ?? "{}";
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed?.partnerName === "string" ? parsed.partnerName : "";
  } catch {
    return "";
  }
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdminPassword("/admin/orders");

  const { status, product: productFilter } = await searchParams;
  const demoMode = !isSupabaseConfigured();

  let allOrders: OrderRow[] = [];
  let productMap = new Map<string, { name: string; slug: string | null }>();
  let resultMap = new Map<string, string>();
  let inputMap = new Map<string, InputRow>();

  if (!demoMode) {
    const service = createServiceClient();

    // 상품별 집계 카드용 — 필터와 무관하게 전체를 한 번 가져옴
    const { data: allData } = await service
      .from("orders")
      .select("id, order_id, amount, status, created_at, user_id, guest_email, product_id, toss_payment_key")
      .order("created_at", { ascending: false })
      .limit(2000);
    allOrders = (allData ?? []) as OrderRow[];

    const productIds = Array.from(new Set(allOrders.map((o) => o.product_id)));
    const { data: products } = productIds.length
      ? await service.from("products").select("id, name, slug").in("id", productIds)
      : { data: [] };
    productMap = new Map((products ?? []).map((p) => [p.id, { name: p.name, slug: p.slug }]));

    const orderIds = allOrders.map((o) => o.id);
    const { data: results } = orderIds.length
      ? await service.from("saju_results").select("id, order_id").in("order_id", orderIds)
      : { data: [] };
    resultMap = new Map((results ?? []).map((r) => [r.order_id, r.id]));

    const { data: inputs } = orderIds.length
      ? await service.from("saju_inputs").select("order_id, name, concerns").in("order_id", orderIds)
      : { data: [] };
    inputMap = new Map((inputs ?? []).map((i) => [i.order_id, i as InputRow]));
  }

  // ── 상품별 집계 (필터와 무관하게 전체 기준) ──
  type ProductStat = { productId: string; name: string; slug: string | null; count: number; paidCount: number; revenue: number };
  const statsMap = new Map<string, ProductStat>();
  for (const o of allOrders) {
    const p = productMap.get(o.product_id);
    const key = o.product_id;
    if (!statsMap.has(key)) {
      statsMap.set(key, { productId: key, name: p?.name ?? "알 수 없음", slug: p?.slug ?? null, count: 0, paidCount: 0, revenue: 0 });
    }
    const s = statsMap.get(key)!;
    s.count += 1;
    if (o.status === "paid") {
      s.paidCount += 1;
      s.revenue += o.amount;
    }
  }
  const productStats = Array.from(statsMap.values()).sort((a, b) => b.paidCount - a.paidCount);

  const totalPaid = allOrders.filter((o) => o.status === "paid").length;
  const totalRevenue = allOrders.filter((o) => o.status === "paid").reduce((sum, o) => sum + o.amount, 0);
  const totalPending = allOrders.filter((o) => o.status === "pending").length;
  const totalFailed = allOrders.filter((o) => o.status === "failed").length;

  // ── 화면에 표시할 목록: 상태 + 상품 필터 적용 ──
  const filteredOrders = allOrders.filter((o) => {
    if (status && ["pending", "paid", "failed"].includes(status) && o.status !== status) return false;
    if (productFilter && o.product_id !== productFilter) return false;
    return true;
  });

  const statusFilters = [
    { key: "", label: "전체 상태" },
    { key: "paid", label: "결제완료" },
    { key: "pending", label: "결제대기" },
    { key: "failed", label: "실패" },
  ];

  const buildHref = (next: { status?: string; product?: string }) => {
    const p = new URLSearchParams();
    const s = next.status !== undefined ? next.status : (status ?? "");
    const pr = next.product !== undefined ? next.product : (productFilter ?? "");
    if (s) p.set("status", s);
    if (pr) p.set("product", pr);
    const qs = p.toString();
    return qs ? `/admin/orders?${qs}` : "/admin/orders";
  };

  return (
    <div className="container py-12">
      <header className="mb-8">
        <p className="text-xs font-mono text-mute mb-2">ADMIN / ORDERS</p>
        <h1 className="text-2xl font-semibold tracking-tight">결제 내역</h1>
      </header>

      {demoMode ? (
        <div className="mb-6 rounded-lg border border-hairline bg-canvas p-4 text-xs text-body leading-relaxed">
          <p className="font-semibold text-ink mb-1">데모 모드 — DB 미연결</p>
          <code className="font-mono text-ink">.env.local</code> 의 <code className="font-mono text-ink">NEXT_PUBLIC_SUPABASE_URL</code> 가 placeholder 입니다.
          실제 결제 내역을 보려면 Supabase 프로젝트를 연결하고 마이그레이션을 적용하세요.
        </div>
      ) : null}

      {/* 전체 요약 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "결제완료", value: totalPaid, tone: "text-ink" },
          { label: "결제대기", value: totalPending, tone: "text-amber-600" },
          { label: "실패", value: totalFailed, tone: "text-red-600" },
          { label: "총 매출", value: formatKRW(totalRevenue), tone: "text-ink" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-hairline bg-canvas px-4 py-3">
            <p className="text-[11px] font-mono uppercase tracking-wider text-mute mb-1">{s.label}</p>
            <p className={`text-lg font-semibold font-mono ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* 상품별 집계 카드 — 클릭하면 해당 상품으로 필터링 */}
      <div className="mb-8">
        <p className="text-xs font-mono text-mute mb-3">상품별 주문 현황 (클릭하여 필터)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {productStats.map((s) => {
            const active = productFilter === s.productId;
            return (
              <Link
                key={s.productId}
                href={buildHref({ product: active ? "" : s.productId })}
                className={`rounded-lg border p-4 transition-colors ${
                  active ? "border-ink bg-ink text-canvas" : "border-hairline bg-canvas hover:border-ink"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className={`text-sm font-semibold truncate ${active ? "text-canvas" : "text-ink"}`}>{s.name}</p>
                  <span className={`shrink-0 text-[11px] font-mono ${active ? "text-canvas/70" : "text-mute"}`}>
                    {s.paidCount}/{s.count}건
                  </span>
                </div>
                <p className={`text-base font-mono font-semibold ${active ? "text-canvas" : "text-ink"}`}>
                  {formatKRW(s.revenue)}
                </p>
                <p className={`text-[11px] mt-1 ${active ? "text-canvas/70" : "text-mute"}`}>결제완료 매출 기준</p>
              </Link>
            );
          })}
          {productStats.length === 0 && (
            <div className="col-span-full text-center py-10 text-sm text-mute border border-dashed border-hairline rounded-lg">
              아직 주문이 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* 상태 필터 */}
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <div className="flex gap-2">
          {statusFilters.map((f) => {
            const active = (status ?? "") === f.key;
            return (
              <Link
                key={f.key || "all"}
                href={buildHref({ status: f.key })}
                className={`px-4 h-8 inline-flex items-center rounded-full text-sm border transition-colors ${active ? "bg-ink text-canvas border-ink" : "border-hairline text-ink hover:border-ink"}`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>
        {productFilter && (
          <Link href={buildHref({ product: "" })} className="text-xs text-mute underline underline-offset-2">
            상품 필터 해제 ({productMap.get(productFilter)?.name ?? productFilter})
          </Link>
        )}
      </div>

      <p className="text-xs text-mute font-mono mb-3">{filteredOrders.length} ROWS</p>

      <div className="border border-hairline rounded-lg overflow-hidden overflow-x-auto">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-sm text-mute">
            {demoMode ? "데모 모드에서는 결제 내역이 비어 있습니다." : "조건에 맞는 결제 내역이 없습니다."}
          </div>
        ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline bg-surface-soft">
              <th className="px-4 py-3 text-left text-[11px] font-mono uppercase tracking-wider text-mute whitespace-nowrap">생성일</th>
              <th className="px-4 py-3 text-left text-[11px] font-mono uppercase tracking-wider text-mute whitespace-nowrap">주문번호</th>
              <th className="px-4 py-3 text-left text-[11px] font-mono uppercase tracking-wider text-mute whitespace-nowrap">상품</th>
              <th className="px-4 py-3 text-left text-[11px] font-mono uppercase tracking-wider text-mute whitespace-nowrap">신청자</th>
              <th className="px-4 py-3 text-left text-[11px] font-mono uppercase tracking-wider text-mute whitespace-nowrap">고객 계정</th>
              <th className="px-4 py-3 text-right text-[11px] font-mono uppercase tracking-wider text-mute whitespace-nowrap">금액</th>
              <th className="px-4 py-3 text-left text-[11px] font-mono uppercase tracking-wider text-mute whitespace-nowrap">상태</th>
              <th className="px-4 py-3 text-left text-[11px] font-mono uppercase tracking-wider text-mute whitespace-nowrap">결과</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((o) => {
              const product = productMap.get(o.product_id);
              const input = inputMap.get(o.id);
              const resultId = resultMap.get(o.id);

              let reportHref: string | null = null;
              if (o.status === "paid" && resultId && product?.slug) {
                reportHref = `/saju/${product.slug}/report-preview?id=${resultId}`;
              }

              const partnerName = product?.slug?.startsWith("kunghap_") ? getPartnerName(input?.concerns) : "";
              const applicantLabel = input?.name
                ? partnerName
                  ? `${input.name}님 · ${partnerName}님`
                  : `${input.name}님`
                : "-";

              return (
                <tr key={o.id} className="border-b border-hairline last:border-0 hover:bg-surface-soft/60 transition-colors">
                  <td className="px-4 py-3 text-xs text-body whitespace-nowrap">{formatDate(o.created_at)}</td>
                  <td className="px-4 py-3 font-mono text-xs">{o.order_id}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{product?.name ?? "-"}</td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap">{applicantLabel}</td>
                  <td className="px-4 py-3 text-xs text-mute whitespace-nowrap">{o.user_id ? "회원" : o.guest_email}</td>
                  <td className="px-4 py-3 text-right font-mono whitespace-nowrap">{formatKRW(o.amount)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge
                      variant={
                        o.status === "paid" ? "success" : o.status === "failed" ? "destructive" : "secondary"
                      }
                    >
                      {STATUS_LABEL[o.status] ?? o.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {reportHref ? (
                      <Link href={reportHref} target="_blank" className="text-xs font-medium underline underline-offset-2 text-ink">
                        보기 ↗
                      </Link>
                    ) : (
                      <span className="text-xs text-mute">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}
