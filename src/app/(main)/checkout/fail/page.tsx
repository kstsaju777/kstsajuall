"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CheckoutFailPage() {
  return (
    <Suspense>
      <CheckoutFailInner />
    </Suspense>
  );
}

function CheckoutFailInner() {
  const search = useSearchParams();
  const code = search.get("code");
  const message = search.get("message") ?? "결제가 정상적으로 처리되지 않았습니다.";

  return (
    <div className="container py-16 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>결제 실패</CardTitle>
          <CardDescription>{message}{code ? ` (${code})` : ""}</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Link href="/products" className={cn(buttonVariants({ variant: "outline" }), "flex-1")}>
            상품으로
          </Link>
          <Link href="/" className={cn(buttonVariants(), "flex-1")}>
            홈으로
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
