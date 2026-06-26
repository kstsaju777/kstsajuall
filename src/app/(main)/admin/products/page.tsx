"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  slug: string | null;
  price: number;
  is_active: boolean;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/products")
      .then(r => {
        if (r.status === 401) { window.location.href = "/admin/login?from=/admin/products"; return null; }
        return r.json();
      })
      .then(d => { if (d) { setProducts(d.products ?? []); setLoading(false); } })
      .catch(() => setLoading(false));
  }, []);

  const toggle = async (id: string, current: boolean) => {
    setToggling(id);
    const res = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: !current }),
    });
    if (res.ok) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
    }
    setToggling(null);
  };

  return (
    <div className="container py-12 max-w-2xl">
      <header className="mb-8 flex items-center gap-4">
        <Link href="/admin" className="text-sm text-body hover:text-ink">← 어드민</Link>
        <div>
          <p className="text-xs font-mono text-mute">ADMIN / PRODUCTS</p>
          <h1 className="text-2xl font-semibold tracking-tight">상품 관리</h1>
        </div>
      </header>

      {loading ? (
        <p className="text-sm text-body">불러오는 중…</p>
      ) : (
        <ul className="divide-y divide-hairline border-y border-hairline">
          {products.map(p => (
            <li key={p.id} className="py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-ink truncate">{p.name}</p>
                <p className="text-xs text-body mt-0.5 font-mono">{p.slug ?? "-"} · {p.price.toLocaleString()}원</p>
              </div>
              <button
                onClick={() => toggle(p.id, p.is_active)}
                disabled={toggling === p.id}
                className="shrink-0 px-4 py-1.5 rounded-full text-[13px] font-bold transition-all"
                style={{
                  background: p.is_active ? "#2d6a4f" : "#9b9b9b",
                  color: "#fff",
                  opacity: toggling === p.id ? 0.6 : 1,
                }}
              >
                {p.is_active ? "공개" : "비공개"}
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-xs text-body">
        비공개 상품은 소비자 화면에 노출되지 않습니다. 공개 상품만 결제가 가능합니다.
      </p>
    </div>
  );
}
