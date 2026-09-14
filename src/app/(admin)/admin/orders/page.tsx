import Link from "next/link";
import { requireAdminPassword } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { formatKRW, formatDate } from "@/lib/utils";
import { ADMIN_EMAILS } from "@/lib/auth";
import { ConcernCell } from "@/components/admin/ConcernCell";
import { CopyableText } from "@/components/admin/CopyableText";

export const metadata = { title: "관리자 - 결제 내역" };

// 사주 상품 카드에 쓸 표시명 및 정렬 순서 (요청된 순서: 종합→재물→연애→건강→자녀→유아)
const SAJU_DISPLAY_ORDER = ["total", "saju_jaemul", "saju_yeonae", "saju_health", "saju_janyeo", "saju_youare"];
const SAJU_DISPLAY_NAME: Record<string, string> = {
  total: "종합사주",
  saju_jaemul: "재물사주",
  saju_yeonae: "연애사주",
  saju_health: "건강사주",
  saju_janyeo: "자녀사주",
  saju_youare: "유아사주",
};

// 궁합 상품 카드에 쓸 표시명 및 정렬 순서
const KUNGHAP_DISPLAY_ORDER = [
  "kunghap_yeonae", "kunghap_gyeolhon", "kunghap_ehon", "kunghap_jaehwe",
  "kunghap_janyeo", "kunghap_imshin", "kunghap_business", "kunghap_banryeo",
];
// 각 상품 상세페이지에서 쓰는 시그니처 컬러 (ACCENT/PINK 상수 값 그대로)
const PRODUCT_COLOR: Record<string, string> = {
  total: "#9b2335",
  saju_jaemul: "#f9dc64",
  saju_yeonae: "#e9bdae",
  saju_health: "#ca884b",
  saju_janyeo: "#5bbfea",
  saju_youare: "#e4d1b2",
  kunghap_yeonae: "#ff6b9d",
  kunghap_gyeolhon: "#e1337d",
  kunghap_ehon: "#7c6af7",
  kunghap_jaehwe: "#9b2335",
  kunghap_janyeo: "#00b4d8",
  kunghap_imshin: "#738e6f",
  kunghap_business: "#4e9eff",
  kunghap_banryeo: "#b47221",
};

const KUNGHAP_DISPLAY_NAME: Record<string, string> = {
  kunghap_yeonae: "연애궁합",
  kunghap_gyeolhon: "결혼궁합",
  kunghap_ehon: "이혼궁합",
  kunghap_jaehwe: "재회궁합",
  kunghap_janyeo: "자녀궁합",
  kunghap_imshin: "임신궁합",
  kunghap_business: "비즈궁합",
  kunghap_banryeo: "반려궁합",
};

// 배경색 밝기에 따라 검정/흰색 중 가독성 좋은 글자색 선택 (YIQ 공식)
function contrastTextColor(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? "#111" : "#fff";
}

type SearchParams = Promise<{ product?: string; month?: string }>;

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
  birth_date: string | null;
  birth_time: string | null;
  time_unknown: boolean | null;
  calendar: string | null;
};

// 12지지 시진(자시~해시) — 23:00~01:00 = 자시, 이후 2시간씩
const SIJIN_NAMES = ["자시", "축시", "인시", "묘시", "진시", "사시", "오시", "미시", "신시", "유시", "술시", "해시"];
function toSijinName(hhmm: string): string {
  const [hStr] = hhmm.split(":");
  const h = parseInt(hStr, 10);
  if (Number.isNaN(h)) return "";
  const idx = Math.floor(((h + 1) % 24) / 2);
  return SIJIN_NAMES[idx] ?? "";
}

function formatBirth(input: InputRow | undefined): string {
  if (!input?.birth_date) return "-";
  const cal = input.calendar === "lunar" ? "음력" : "양력";
  if (input.time_unknown || !input.birth_time) {
    return `${input.birth_date} (${cal}) · 시간모름`;
  }
  const hhmm = input.birth_time.slice(0, 5);
  const sijin = toSijinName(hhmm);
  return `${input.birth_date} (${cal}) · ${hhmm}${sijin ? ` (${sijin})` : ""}`;
}

function firstConcern(input: InputRow | undefined): string {
  const c = input?.concerns?.[0];
  return c ? c : "-";
}

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

// KST 기준 YYYY-MM-DD / YYYY-MM
function toKstDateKey(iso: string): string {
  const d = new Date(new Date(iso).getTime() + 9 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}
function toKstMonthKey(iso: string): string {
  return toKstDateKey(iso).slice(0, 7);
}

// 정식 오픈(실결제 집계 시작) 기준일 — 이 시점 이전 주문은 전부 개발 중 테스트결제로 간주해 매출 집계에서 제외
// 정식 오픈일이 정해지면 이 값만 바꿔주면 됨
const REVENUE_START_AT = "2026-09-14T00:00:00+09:00";

// 오픈 이전에 발생했지만 지인에게 부탁한 실제 결제라 매출에 포함시키는 예외 이메일
const REAL_PAYMENT_WHITELIST_EMAILS = new Set(["star960313@gmail.com", "chaeni10@naver.com"]);

// 어드민 본인 테스트 전용 이메일 — 게스트 결제 라우트의 user_id 미기록 버그로 인해
// 로그인해서 결제해도 어드민 필터에 안 걸렸던 과거 주문들을 소급 제외하기 위한 블랙리스트.
// (버그 수정 이후엔 로그인만 하면 user_id로 자동 제외되므로 이 목록은 더 늘어날 필요가 없음)
const TEST_EMAIL_BLACKLIST = new Set(["kimguback@gmail.com"]);

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdminPassword("/admin/orders");

  const { product: productFilter, month: monthFilter } = await searchParams;
  const demoMode = !isSupabaseConfigured();

  let allOrders: OrderRow[] = [];
  let productMap = new Map<string, { name: string; slug: string | null }>();
  let resultMap = new Map<string, string>();
  let inputMap = new Map<string, InputRow>();
  let adminUserIds = new Set<string>();

  if (!demoMode) {
    const service = createServiceClient();

    const { data: allData } = await service
      .from("orders")
      .select("id, order_id, amount, status, created_at, user_id, guest_email, product_id, toss_payment_key")
      .order("created_at", { ascending: false })
      .limit(5000);
    allOrders = (allData ?? []) as OrderRow[];

    const productIds = Array.from(new Set(allOrders.map((o) => o.product_id)));
    const { data: products } = productIds.length
      ? await service.from("products").select("id, name, slug").in("id", productIds)
      : { data: [] };
    productMap = new Map((products ?? []).map((p) => [p.id, { name: p.name, slug: p.slug }]));

    // 주문이 많을 땐 .in() 에 uuid를 수백~수천 개 나열하면 요청 URL이 너무 길어져
    // 조용히 실패(빈 배열 반환)할 수 있어, 필터 없이 전체를 가져와 메모리에서 매칭한다.
    const { data: results } = await service.from("saju_results").select("id, order_id").limit(10000);
    resultMap = new Map((results ?? []).map((r) => [r.order_id, r.id]));

    const { data: inputs } = await service.from("saju_inputs").select("order_id, name, concerns, birth_date, birth_time, time_unknown, calendar").limit(10000);
    inputMap = new Map((inputs ?? []).map((i) => [i.order_id, i as InputRow]));

    // 어드민 계정으로 결제된 건 = 테스트결제로 간주하여 매출 집계에서 제외
    // ⚠️ profiles.is_admin 컬럼은 실제로 채워져 있지 않아(예: admin@hongyeondang.com도 false) 신뢰할 수 없음.
    // 실제 결제 시 테스트/라이브 키를 가르는 기준과 동일하게 lib/auth.ts의 ADMIN_EMAILS 목록으로 판별한다.
    const { data: admins } = await service.from("profiles").select("id").in("email", ADMIN_EMAILS);
    adminUserIds = new Set((admins ?? []).map((a) => a.id));
  }

  const revenueStartAt = new Date(REVENUE_START_AT).getTime();
  // 실결제 판정: (1) 오픈 기준일 이후 && 어드민 계정이 아님, 또는 (2) 오픈 전이라도 화이트리스트에 등록된 지인 결제
  const isRealOrder = (o: OrderRow) => {
    const isAdmin = !!o.user_id && adminUserIds.has(o.user_id);
    if (isAdmin) return false;
    if (o.guest_email && TEST_EMAIL_BLACKLIST.has(o.guest_email)) return false;
    if (o.guest_email && REAL_PAYMENT_WHITELIST_EMAILS.has(o.guest_email)) return true;
    return new Date(o.created_at).getTime() >= revenueStartAt;
  };
  const isTestOrder = (o: OrderRow) => !isRealOrder(o);

  const paidOrders = allOrders.filter((o) => o.status === "paid");
  const realOrders = paidOrders.filter((o) => !isTestOrder(o));
  const testOrders = paidOrders.filter((o) => isTestOrder(o));

  const totalRealPaid = realOrders.length;
  const totalTestPaid = testOrders.length;
  const totalRevenue = realOrders.reduce((sum, o) => sum + o.amount, 0);

  // ── 상품별 집계 (실결제 매출 기준) ──
  type ProductStat = { productId: string; name: string; slug: string | null; real: number; test: number; revenue: number };
  const statsMap = new Map<string, ProductStat>();
  for (const o of paidOrders) {
    const p = productMap.get(o.product_id);
    const key = o.product_id;
    if (!statsMap.has(key)) {
      statsMap.set(key, { productId: key, name: p?.name ?? "알 수 없음", slug: p?.slug ?? null, real: 0, test: 0, revenue: 0 });
    }
    const s = statsMap.get(key)!;
    if (isTestOrder(o)) { s.test += 1; }
    else { s.real += 1; s.revenue += o.amount; }
  }
  const productStats = Array.from(statsMap.values()).sort((a, b) => b.revenue - a.revenue);

  // ── 월별 집계 (실결제만) ──
  type MonthStat = { month: string; count: number; revenue: number };
  const monthMap = new Map<string, MonthStat>();
  for (const o of realOrders) {
    const key = toKstMonthKey(o.created_at);
    if (!monthMap.has(key)) monthMap.set(key, { month: key, count: 0, revenue: 0 });
    const m = monthMap.get(key)!;
    m.count += 1;
    m.revenue += o.amount;
  }
  const monthStats = Array.from(monthMap.values()).sort((a, b) => b.month.localeCompare(a.month));

  // ── 일별 집계 (실결제만, 선택된 월 또는 최근 월 기준) ──
  const activeMonth = monthFilter || monthStats[0]?.month || toKstMonthKey(new Date().toISOString());
  type DayStat = { day: string; count: number; revenue: number; byProduct: Map<string, number> };
  const dayMap = new Map<string, DayStat>();
  for (const o of realOrders) {
    const dayKey = toKstDateKey(o.created_at);
    if (!dayKey.startsWith(activeMonth)) continue;
    if (!dayMap.has(dayKey)) dayMap.set(dayKey, { day: dayKey, count: 0, revenue: 0, byProduct: new Map() });
    const d = dayMap.get(dayKey)!;
    d.count += 1;
    d.revenue += o.amount;
    const pname = productMap.get(o.product_id)?.name ?? "알 수 없음";
    d.byProduct.set(pname, (d.byProduct.get(pname) ?? 0) + o.amount);
  }
  const dayStats = Array.from(dayMap.values()).sort((a, b) => b.day.localeCompare(a.day));

  // ── 화면에 표시할 목록: 실결제 + 상품 필터 ──
  const filteredOrders = realOrders.filter((o) => {
    if (productFilter && o.product_id !== productFilter) return false;
    return true;
  });

  const buildHref = (next: { product?: string; month?: string }) => {
    const p = new URLSearchParams();
    const pr = next.product !== undefined ? next.product : (productFilter ?? "");
    const mo = next.month !== undefined ? next.month : (monthFilter ?? "");
    if (pr) p.set("product", pr);
    if (mo) p.set("month", mo);
    const qs = p.toString();
    return qs ? `/admin/orders?${qs}` : "/admin/orders";
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <Link href="/admin" style={{ fontSize: 13, color: "#888", textDecoration: "none" }}>← 대시보드</Link>
        <span style={{ color: "#ddd" }}>|</span>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111", margin: 0 }}>결제 내역 · 매출 집계</h1>
      </div>

      {demoMode ? (
        <div style={{ marginBottom: 24, padding: "14px 18px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, fontSize: 13, color: "#9a3412", lineHeight: 1.6 }}>
          <strong>데모 모드 — DB 미연결.</strong> .env.local 의 Supabase 설정을 확인하세요.
        </div>
      ) : null}

      <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 20px", lineHeight: 1.6 }}>
        ※ {REVENUE_START_AT.slice(0, 10)} 이전 주문(개발 중 테스트결제) 및 어드민 계정 결제는 매출 집계에서 제외됩니다. (지인에게 부탁한 사전 실결제 {REAL_PAYMENT_WHITELIST_EMAILS.size}건은 예외로 포함)
        {totalTestPaid > 0 && <> (제외된 테스트결제 {totalTestPaid}건)</>}
      </p>

      {/* 전체 요약 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 28 }}>
        <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <p style={{ fontSize: 11, color: "#888", margin: "0 0 6px" }}>실결제 건수</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: "#047857", margin: 0 }}>{totalRealPaid.toLocaleString()}</p>
        </div>
        <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <p style={{ fontSize: 11, color: "#888", margin: "0 0 6px" }}>누적 총 매출</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: 0 }}>{formatKRW(totalRevenue)}</p>
        </div>
      </div>

      {/* 월별 매출 */}
      <p style={{ fontSize: 12, color: "#888", margin: "0 0 10px" }}>월별 매출 · 클릭하면 아래 일별 집계가 해당 월로 전환됩니다</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10, marginBottom: 28 }}>
        {monthStats.map((m) => {
          const active = activeMonth === m.month;
          return (
            <Link
              key={m.month}
              href={buildHref({ month: m.month })}
              style={{
                display: "block", padding: "14px 16px", borderRadius: 12, textDecoration: "none",
                background: active ? "#111" : "#fff",
                border: `1px solid ${active ? "#111" : "#e8e8e8"}`,
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <p style={{ fontSize: 12, fontWeight: 600, margin: "0 0 6px", color: active ? "#fff" : "#888" }}>{m.month}</p>
              <p style={{ fontSize: 15, fontWeight: 700, fontFamily: "ui-monospace, monospace", margin: 0, color: active ? "#fff" : "#111" }}>{formatKRW(m.revenue)}</p>
              <p style={{ fontSize: 11, margin: "4px 0 0", color: active ? "#d1fae5" : "#047857" }}>{m.count}건</p>
            </Link>
          );
        })}
        {monthStats.length === 0 && (
          <p style={{ gridColumn: "1 / -1", textAlign: "center", padding: "24px 0", fontSize: 13, color: "#aaa" }}>실결제 내역이 없습니다.</p>
        )}
      </div>

      {/* 일별 매출 (선택된 월) */}
      <p style={{ fontSize: 12, color: "#888", margin: "0 0 10px" }}>{activeMonth} 일별 매출</p>
      <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
        {dayStats.length === 0 ? (
          <div style={{ padding: "32px 0", textAlign: "center", fontSize: 13, color: "#aaa" }}>해당 월 실결제 내역이 없습니다.</div>
        ) : (
        <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#fafafa", borderBottom: "1px solid #eee" }}>
              <th style={{ padding: "8px 14px", textAlign: "left", fontSize: 11, color: "#999", fontWeight: 600 }}>날짜</th>
              <th style={{ padding: "8px 14px", textAlign: "right", fontSize: 11, color: "#999", fontWeight: 600 }}>건수</th>
              <th style={{ padding: "8px 14px", textAlign: "right", fontSize: 11, color: "#999", fontWeight: 600 }}>매출</th>
              <th style={{ padding: "8px 14px", textAlign: "left", fontSize: 11, color: "#999", fontWeight: 600 }}>상품별 내역</th>
            </tr>
          </thead>
          <tbody>
            {dayStats.map((d) => (
              <tr key={d.day} style={{ borderBottom: "1px solid #f2f2f2" }}>
                <td style={{ padding: "8px 14px", color: "#333", whiteSpace: "nowrap" }}>{d.day}</td>
                <td style={{ padding: "8px 14px", textAlign: "right", color: "#333" }}>{d.count}건</td>
                <td style={{ padding: "8px 14px", textAlign: "right", fontFamily: "ui-monospace, monospace", color: "#111", fontWeight: 600, whiteSpace: "nowrap" }}>{formatKRW(d.revenue)}</td>
                <td style={{ padding: "8px 14px", color: "#888", fontSize: 12 }}>
                  {Array.from(d.byProduct.entries()).map(([name, rev]) => `${name} ${formatKRW(rev)}`).join(" · ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        )}
      </div>

      {/* 상품별 집계 카드 — 사주 상품 / 궁합 상품으로 구분, 작은 블록으로 한눈에 보이게 */}
      <p style={{ fontSize: 12, color: "#888", margin: "0 0 10px" }}>상품별 누적 매출 · 탭하면 아래 목록이 해당 상품으로 필터링됩니다</p>
      {(() => {
        const sajuStats = productStats
          .filter((s) => !s.slug?.startsWith("kunghap_"))
          .map((s) => ({ ...s, name: (s.slug && SAJU_DISPLAY_NAME[s.slug]) ?? s.name }))
          .sort((a, b) => {
            const ai = a.slug ? SAJU_DISPLAY_ORDER.indexOf(a.slug) : -1;
            const bi = b.slug ? SAJU_DISPLAY_ORDER.indexOf(b.slug) : -1;
            return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
          });
        const kunghapStats = productStats
          .filter((s) => s.slug?.startsWith("kunghap_"))
          .map((s) => ({ ...s, name: (s.slug && KUNGHAP_DISPLAY_NAME[s.slug]) ?? s.name }))
          .sort((a, b) => {
            const ai = a.slug ? KUNGHAP_DISPLAY_ORDER.indexOf(a.slug) : -1;
            const bi = b.slug ? KUNGHAP_DISPLAY_ORDER.indexOf(b.slug) : -1;
            return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
          });

        const renderCard = (s: ProductStat) => {
          const active = productFilter === s.productId;
          const signatureColor = (s.slug && PRODUCT_COLOR[s.slug]) ?? "#fff";
          const badgeTextColor = contrastTextColor(signatureColor);
          return (
            <Link
              key={s.productId}
              href={buildHref({ product: active ? "" : s.productId })}
              style={{
                display: "block", padding: "10px 12px", borderRadius: 10, textDecoration: "none",
                background: "#111",
                border: `1px solid ${active ? signatureColor : "#111"}`,
                boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
              }}
            >
              <span style={{
                display: "inline-block", padding: "3px 8px", borderRadius: 6, marginBottom: 6,
                fontSize: 11, fontWeight: 700, background: signatureColor, color: badgeTextColor,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%",
              }}>
                {s.name}
              </span>
              <p style={{ fontSize: 14, fontWeight: 700, fontFamily: "ui-monospace, monospace", margin: "0 0 4px", color: "#fff", whiteSpace: "nowrap" }}>
                {formatKRW(s.revenue)}
              </p>
              <p style={{ fontSize: 10, margin: 0, whiteSpace: "nowrap" }}>
                <span style={{ color: "#6ee7b7", fontWeight: 600 }}>실결제 {s.real}</span>
                {s.test > 0 && <span style={{ color: "#a5b4fc" }}> · 테스트 {s.test}</span>}
              </p>
            </Link>
          );
        };

        const groupGrid = (list: ProductStat[]) => (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(112px, 1fr))", gap: 8 }}>
            {list.map(renderCard)}
            {list.length === 0 && (
              <p style={{ gridColumn: "1 / -1", textAlign: "center", padding: "16px 0", fontSize: 13, color: "#aaa" }}>주문이 없습니다.</p>
            )}
          </div>
        );

        return (
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 6px", fontWeight: 600 }}>사주 상품</p>
            {groupGrid(sajuStats)}
            <p style={{ fontSize: 11, color: "#aaa", margin: "18px 0 6px", fontWeight: 600 }}>궁합 상품</p>
            {groupGrid(kunghapStats)}
          </div>
        );
      })()}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
        <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>실결제 {filteredOrders.length}건 표시 중</p>
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
              {["생성일", "주문번호", "상품", "신청자", "생년월일/시", "고민", "고객 계정", "금액", "결과지"].map((h, i) => (
                <th key={h} style={{ padding: "10px 14px", textAlign: i === 7 ? "right" : "left", fontSize: 11, color: "#999", fontWeight: 600, whiteSpace: "nowrap" }}>
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

              // DB의 products.slug 는 종합사주풀이만 "total" 이고, 실제 라우트 폴더는 "saju_total" 이라 매핑이 필요함
              const routeSlug = product?.slug === "total" ? "saju_total" : product?.slug;
              let reportHref: string | null = null;
              if (resultId && routeSlug) {
                reportHref = `/saju/${routeSlug}/report-preview?id=${resultId}`;
              }

              const partnerName = product?.slug?.startsWith("kunghap_") ? getPartnerName(input?.concerns) : "";
              const applicantLabel = input?.name
                ? partnerName ? `${input.name}님 · ${partnerName}님` : `${input.name}님`
                : "-";

              return (
                <tr key={o.id} style={{ borderBottom: "1px solid #f2f2f2" }}>
                  <td style={{ padding: "10px 14px", color: "#888", whiteSpace: "nowrap" }}>{formatDate(o.created_at)}</td>
                  <td style={{ padding: "10px 14px" }}><CopyableText text={o.order_id} /></td>
                  <td style={{ padding: "10px 14px", color: "#111", whiteSpace: "nowrap" }}>{product?.name ?? "-"}</td>
                  <td style={{ padding: "10px 14px", color: "#333", whiteSpace: "nowrap" }}>{applicantLabel}</td>
                  <td style={{ padding: "10px 14px", color: "#555", whiteSpace: "nowrap", fontSize: 12 }}>{formatBirth(input)}</td>
                  <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                    <ConcernCell text={firstConcern(input)} />
                  </td>
                  <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                    {o.user_id ? (
                      <span style={{ color: "#999" }}>회원</span>
                    ) : o.guest_email ? (
                      <CopyableText text={o.guest_email} color="green" />
                    ) : (
                      <span style={{ color: "#999" }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontFamily: "'Malgun Gothic', sans-serif", color: "#111", whiteSpace: "nowrap" }}>{formatKRW(o.amount)}</td>
                  <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                    {reportHref ? (
                      <Link
                        href={reportHref}
                        target="_blank"
                        style={{
                          display: "inline-block", padding: "3px 10px", borderRadius: 6,
                          fontSize: 11, fontWeight: 600, color: "#9b2335",
                          background: "#fdf1f2", border: "1px solid #f3c6cc", textDecoration: "none",
                        }}
                      >
                        결과지
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
