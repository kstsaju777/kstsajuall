import Link from "next/link";
import { requireAdminPassword } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { formatKRW, formatDate } from "@/lib/utils";

export const metadata = { title: "관리자 - 결제 내역" };

type SearchParams = Promise<{ product?: string }>;

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

  const { product: productFilter } = await searchParams;
  const demoMode = !isSupabaseConfigured();

  let allOrders: OrderRow[] = [];
  let productMap = new Map<string, { name: string; slug: string | null }>();
  let resultMap = new Map<string, string>();
  let inputMap = new Map<string, InputRow>();

  if (!demoMode) {
    const service = createServiceClient();

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

  const paidOrders = allOrders.filter((o) => o.status === "paid");
  const totalPaid = paidOrders.length;
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amount, 0);

  // ── 상품별 집계 (결제완료 건 기준) ──
  type ProductStat = { productId: string; name: string; slug: string | null; paid: number; revenue: number };
  const statsMap = new Map<string, ProductStat>();
  for (const o of paidOrders) {
    const p = productMap.get(o.product_id);
    const key = o.product_id;
    if (!statsMap.has(key)) {
      statsMap.set(key, { productId: key, name: p?.name ?? "알 수 없음", slug: p?.slug ?? null, paid: 0, revenue: 0 });
    }
    const s = statsMap.get(key)!;
    s.paid += 1;
    s.revenue += o.amount;
  }
  const productStats = Array.from(statsMap.values()).sort((a, b) => b.paid - a.paid);

  // 결제완료 건만 표시 (결제대기·실패는 디스플레이하지 않음)
  const filteredOrders = paidOrders.filter((o) => {
    if (productFilter && o.product_id !== productFilter) return false;
    return true;
  });

  const buildHref = (next: { product?: string }) => {
    const p = new URLSearchParams();
    const pr = next.product !== undefined ? next.product : (productFilter ?? "");
    if (pr) p.set("product", pr);
    const qs = p.toString();
    return qs ? `/admin/orders?${qs}` : "/admin/orders";
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <Link href="/admin" style={{ fontSize: 13, color: "#888", textDecoration: "none" }}>← 대시보드</Link>
        <span style={{ color: "#ddd" }}>|</span>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111", margin: 0 }}>결제 내역</h1>
      </div>

      {demoMode ? (
        <div style={{ marginBottom: 24, padding: "14px 18px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, fontSize: 13, color: "#9a3412", lineHeight: 1.6 }}>
          <strong>데모 모드 — DB 미연결.</strong> .env.local 의 Supabase 설정을 확인하세요.
        </div>
      ) : null}

      {/* 전체 요약 (결제완료 기준) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 28 }}>
        {[
          { label: "결제완료 건수", value: totalPaid.toLocaleString(), color: "#047857" },
          { label: "총 매출", value: formatKRW(totalRevenue), color: "#111" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: 11, color: "#888", margin: "0 0 6px" }}>{s.label}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* 상품별 집계 카드 */}
      <p style={{ fontSize: 12, color: "#888", margin: "0 0 10px" }}>상품별 주문 현황 · 클릭하면 아래 목록이 해당 상품으로 필터링됩니다</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10, marginBottom: 28 }}>
        {productStats.map((s) => {
          const active = productFilter === s.productId;
          return (
            <Link
              key={s.productId}
              href={buildHref({ product: active ? "" : s.productId })}
              style={{
                display: "block", padding: "16px 18px", borderRadius: 12, textDecoration: "none",
                background: active ? "#111" : "#fff",
                border: `1px solid ${active ? "#111" : "#e8e8e8"}`,
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px", color: active ? "#fff" : "#111" }}>{s.name}</p>
              <p style={{ fontSize: 17, fontWeight: 700, fontFamily: "ui-monospace, monospace", margin: "0 0 6px", color: active ? "#fff" : "#111" }}>
                {formatKRW(s.revenue)}
              </p>
              <span style={{ fontSize: 11, color: active ? "#d1fae5" : "#047857", fontWeight: 600 }}>결제완료 {s.paid}건</span>
            </Link>
          );
        })}
        {productStats.length === 0 && (
          <p style={{ gridColumn: "1 / -1", textAlign: "center", padding: "24px 0", fontSize: 13, color: "#aaa" }}>아직 주문이 없습니다.</p>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
        <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>결제완료 {filteredOrders.length}건 표시 중</p>
        {productFilter && (
          <Link href={buildHref({ product: "" })} style={{ fontSize: 12, color: "#888", textDecoration: "underline" }}>
            상품 필터 해제 ({productMap.get(productFilter)?.name ?? productFilter})
          </Link>
        )}
      </div>

      <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, overflow: "hidden" }}>
        {filteredOrders.length === 0 ? (
          <div style={{ padding: "48px 0", textAlign: "center", fontSize: 13, color: "#aaa" }}>
            {demoMode ? "데모 모드에서는 결제 내역이 비어 있습니다." : "조건에 맞는 결제 내역이 없습니다."}
          </div>
        ) : (
        <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#fafafa", borderBottom: "1px solid #eee" }}>
              {["생성일", "주문번호", "상품", "신청자", "고객 계정", "금액", "결과지"].map((h, i) => (
                <th key={h} style={{ padding: "10px 14px", textAlign: i === 5 ? "right" : "left", fontSize: 11, color: "#999", fontWeight: 600, whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((o) => {
              const product = productMap.get(o.product_id);
              const input = inputMap.get(o.id);
              const resultId = resultMap.get(o.id);

              let reportHref: string | null = null;
              if (resultId && product?.slug) {
                reportHref = `/saju/${product.slug}/report-preview?id=${resultId}`;
              }

              const partnerName = product?.slug?.startsWith("kunghap_") ? getPartnerName(input?.concerns) : "";
              const applicantLabel = input?.name
                ? partnerName ? `${input.name}님 · ${partnerName}님` : `${input.name}님`
                : "-";

              return (
                <tr key={o.id} style={{ borderBottom: "1px solid #f2f2f2" }}>
                  <td style={{ padding: "10px 14px", color: "#888", whiteSpace: "nowrap" }}>{formatDate(o.created_at)}</td>
                  <td style={{ padding: "10px 14px", fontFamily: "ui-monospace, monospace", fontSize: 12, color: "#555" }}>{o.order_id}</td>
                  <td style={{ padding: "10px 14px", color: "#111", whiteSpace: "nowrap" }}>{product?.name ?? "-"}</td>
                  <td style={{ padding: "10px 14px", color: "#333", whiteSpace: "nowrap" }}>{applicantLabel}</td>
                  <td style={{ padding: "10px 14px", color: "#999", whiteSpace: "nowrap" }}>{o.user_id ? "회원" : o.guest_email}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontFamily: "ui-monospace, monospace", color: "#111", whiteSpace: "nowrap" }}>{formatKRW(o.amount)}</td>
                  <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                    {reportHref ? (
                      <Link href={reportHref} target="_blank" style={{ fontSize: 12, fontWeight: 600, color: "#111", textDecoration: "underline" }}>
                        보기 ↗
                      </Link>
                    ) : (
                      <span style={{ fontSize: 12, color: "#ccc" }}>-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
        )}
      </div>
    </div>
  );
}
