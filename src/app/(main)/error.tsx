"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container py-24 text-center">
      <h1 className="text-3xl font-bold">문제가 발생했어요</h1>
      <p className="mt-3 text-muted-foreground">{error.message}</p>
      <Button onClick={reset} variant="outline" className="mt-6">다시 시도</Button>
    </div>
  );
}
