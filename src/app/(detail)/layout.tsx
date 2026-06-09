import { DetailHeader } from "@/components/layout/DetailHeader";

export default function DetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/*
        transform을 쓰면 내부 fixed 요소가 viewport 기준이 아닌
        컨테이너 기준으로 위치해서 드로어가 오작동함.
        transform 없이 left 계산으로 중앙 정렬.
      */}
      <div
        className="fixed top-0 bottom-0 flex flex-col shadow-2xl"
        style={{
          backgroundColor: "#fdf8f4",
          width: "min(100%, 480px)",
          left: "max(0px, calc(50vw - 240px))",
        }}
      >
        <DetailHeader />
        <main className="flex-1 overflow-hidden min-h-0">
          {children}
        </main>
      </div>
    </>
  );
}
