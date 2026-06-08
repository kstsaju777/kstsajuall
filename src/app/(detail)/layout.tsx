import { DetailHeader } from "@/components/layout/DetailHeader";

export default function DetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mx-auto w-full max-w-[480px] min-h-screen shadow-2xl relative"
      style={{ backgroundColor: "#fdf8f4" }}
    >
      <DetailHeader />
      <main>{children}</main>
    </div>
  );
}
