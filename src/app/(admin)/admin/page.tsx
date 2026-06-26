import Link from "next/link";
import { requireAdminPassword } from "@/lib/admin-auth";
import { getTotalUsage, type UsageStat } from "@/lib/saju/usage";

export const metadata = { title: "관리자 대시보드" };

export default async function AdminHome() {
  await requireAdminPassword("/admin");
  const usage = await getTotalUsage();

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui, sans-serif" }}>
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <p style={{ fontSize: 11, color: "#888", marginBottom: 4, letterSpacing: 1, margin: 0 }}>ADMIN DASHBOARD</p>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111", margin: "4px 0 0" }}>홍연당 관리자</h1>
        </div>
        <form action="/admin/logout" method="post">
          <button type="submit" style={{ fontSize: 13, color: "#555", background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: "6px 14px", cursor: "pointer" }}>
            로그아웃
          </button>
        </form>
      </div>

      {/* API 사용량 카드 */}
      <UsageCard usage={usage} />

      {/* 메뉴 */}
      <div style={{ display: "grid", gap: 10, marginTop: 20 }}>
        <MenuCard href="/" emoji="🏠" title="사이트 홈 보기" desc="실제 소비자 화면 확인" external />
        <MenuCard href="/admin/products" emoji="📦" title="상품 관리" desc="상품 공개 / 비공개 전환" />
        <MenuCard href="/admin/orders" emoji="💳" title="결제 내역" desc="전체 결제 내역 조회" />
        <MenuCard href="https://app.tosspayments.com" emoji="💰" title="토스페이먼츠" desc="환불 · 결제취소" external />
        <MenuCard href="https://supabase.com/dashboard" emoji="🗄️" title="Supabase" desc="DB · 유저 관리" external />
      </div>
    </div>
  );
}

function MenuCard({ href, emoji, title, desc, external }: {
  href: string; emoji: string; title: string; desc: string; external?: boolean;
}) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "14px 18px", background: "#fff", borderRadius: 12,
        border: "1px solid #e8e8e8", textDecoration: "none", color: "inherit",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <span style={{ fontSize: 26 }}>{emoji}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: "#111", margin: 0 }}>{title}</p>
        <p style={{ fontSize: 13, color: "#888", margin: "2px 0 0" }}>{desc}</p>
      </div>
      <span style={{ color: "#bbb", fontSize: 16 }}>{external ? "↗" : "→"}</span>
    </Link>
  );
}

function UsageCard({ usage }: { usage: UsageStat | null }) {
  if (!usage) return null;
  const pct = Math.min(100, Math.round((usage.used / usage.limit) * 100));
  const barColor = pct >= 100 ? "#ef4444" : pct >= 80 ? "#f59e0b" : "#22c55e";

  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8e8e8", padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      <p style={{ fontSize: 11, color: "#888", letterSpacing: 1, margin: "0 0 8px" }}>사주 API 누적 사용량</p>
      <p style={{ fontSize: 28, fontWeight: 700, color: "#111", margin: 0 }}>
        {usage.used.toLocaleString()}
        <span style={{ fontSize: 15, color: "#888", fontWeight: 400 }}> / {usage.limit.toLocaleString()}회</span>
      </p>
      <div style={{ margin: "12px 0 4px", height: 8, background: "#f0f0f0", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: 4 }} />
      </div>
      <p style={{ fontSize: 12, color: "#888", margin: "0 0 12px" }}>{pct}% 사용</p>
      <div style={{ display: "flex", gap: 24 }}>
        {[
          { label: "결제 후 결과지", value: usage.bySource.confirm },
          { label: "데모", value: usage.bySource.demo },
          { label: "수동", value: usage.bySource.manual },
        ].map(r => (
          <div key={r.label}>
            <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>{r.label}</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#333", margin: 0 }}>{r.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
