import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="container py-24 text-center">
      <h1 className="text-3xl font-bold">페이지를 찾을 수 없어요</h1>
      <p className="mt-3 text-muted-foreground">주소를 다시 확인해 주세요.</p>
      <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "mt-6")}>
        홈으로
      </Link>
    </div>
  );
}
