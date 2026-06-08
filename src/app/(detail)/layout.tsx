import { DetailHeader } from "@/components/layout/DetailHeader";

export default function DetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mx-auto w-full max-w-[480px] flex flex-col shadow-2xl"
      style={{ backgroundColor: "#fdf8f4", height: "100dvh", overflow: "hidden" }}
    >
      <DetailHeader />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
