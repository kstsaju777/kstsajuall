"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type CouponType = {
  id: string;
  code: string;
  name: string;
  discount_kind: "fixed" | "free_pass";
  amount: number;
  is_active: boolean;
};

type IssuedCoupon = {
  id: string;
  user_id: string;
  email: string;
  coupon_type_id: string;
  status: "unused" | "used";
  order_id: string | null;
  created_at: string;
  used_at: string | null;
};

export default function AdminCouponsPage() {
  const [types, setTypes] = useState<CouponType[]>([]);
  const [issued, setIssued] = useState<IssuedCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [issueUserId, setIssueUserId] = useState("");
  const [issueTypeId, setIssueTypeId] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/coupons");
    if (res.status === 401) { window.location.href = "/admin/login?from=/admin/coupons"; return; }
    const data = await res.json();
    setTypes(data.types ?? []);
    setIssued(data.issued ?? []);
    if (!issueTypeId && data.types?.length) setIssueTypeId(data.types[0].id);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueUserId || !issueTypeId) return;
    setIssuing(true);
    setMessage(null);
    const res = await fetch("/api/admin/coupons/issue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: issueUserId, couponTypeId: issueTypeId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(`❌ ${data.error ?? "지급 실패"}`);
    } else {
      setMessage(`✅ ${issueUserId} 계정에 쿠폰을 지급했습니다.`);
      setIssueUserId("");
      await load();
    }
    setIssuing(false);
  };

  const typeName = (id: string) => types.find((t) => t.id === id)?.name ?? "-";

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <Link href="/admin" style={{ fontSize: 13, color: "#888", textDecoration: "none" }}>← 대시보드</Link>
        <span style={{ color: "#ddd" }}>|</span>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111", margin: 0 }}>쿠폰 관리</h1>
      </div>

      <p style={{ fontSize: 12, color: "#999", marginBottom: 20 }}>
        체험단 등 특정 계정에 쿠폰을 지급합니다. 지급 대상은 사이트에 회원가입(이메일)된 계정이어야 하며,
        쿠폰은 1상품 1회만 사용 가능합니다. (현재 종합사주 상품에서만 사용 가능)
      </p>

      {/* 쿠폰 지급 폼 */}
      <form onSubmit={handleIssue} style={{
        display: "flex", flexDirection: "column", gap: 10,
        padding: "16px 18px", background: "#fff", borderRadius: 12,
        border: "1px solid #e8e8e8", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", marginBottom: 24,
      }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#111", margin: "0 0 4px" }}>쿠폰 지급</p>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input
            type="text"
            placeholder="체험단 계정 아이디"
            value={issueUserId}
            onChange={(e) => setIssueUserId(e.target.value)}
            required
            autoCapitalize="none"
            style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }}
          />
          <span style={{ fontSize: 13, color: "#999", flexShrink: 0 }}>@hongyeondang.com</span>
        </div>
        <select
          value={issueTypeId}
          onChange={(e) => setIssueTypeId(e.target.value)}
          style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }}
        >
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}{t.discount_kind === "fixed" ? ` (${t.amount.toLocaleString()}원 할인)` : " (전체 무료)"}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={issuing}
          style={{
            padding: "10px 14px", borderRadius: 8, border: "none", background: "#111", color: "#fff",
            fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: issuing ? 0.6 : 1,
          }}
        >
          {issuing ? "지급 중…" : "지급하기"}
        </button>
        {message && <p style={{ fontSize: 13, margin: 0, color: message.startsWith("✅") ? "#16a34a" : "#dc2626" }}>{message}</p>}
      </form>

      {/* 발급 내역 */}
      <p style={{ fontSize: 14, fontWeight: 700, color: "#111", margin: "0 0 10px" }}>발급 내역</p>
      {loading ? (
        <p style={{ color: "#888", fontSize: 14 }}>불러오는 중…</p>
      ) : issued.length === 0 ? (
        <p style={{ color: "#888", fontSize: 14 }}>발급된 쿠폰이 없습니다.</p>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {issued.map((c) => (
            <div key={c.id} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px", background: "#fff", borderRadius: 10,
              border: `1px solid ${c.status === "used" ? "#e8e8e8" : "#d1fae5"}`,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#111", margin: 0 }}>{c.email}</p>
                <p style={{ fontSize: 12, color: "#999", margin: "2px 0 0" }}>
                  {typeName(c.coupon_type_id)} · {new Date(c.created_at).toLocaleString("ko-KR")}
                  {c.used_at && ` · 사용: ${new Date(c.used_at).toLocaleString("ko-KR")}`}
                </p>
              </div>
              <span style={{
                flexShrink: 0, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                background: c.status === "used" ? "#f3f4f6" : "#16a34a",
                color: c.status === "used" ? "#888" : "#fff",
              }}>
                {c.status === "used" ? "사용완료" : "미사용"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
