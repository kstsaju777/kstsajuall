import { DetailHeader } from "@/components/layout/DetailHeader";

export default function DetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/*
        position: fixed + inset-0 로 브라우저 UI바 상관없이
        완전히 viewport에 고정 → 어떤 환경에서도 스크롤 불가
        max-w-[480px] + left-1/2 transform으로 데스크탑에서는 가운데 정렬
      */}
      <div
        className="fixed inset-0 flex flex-col mx-auto shadow-2xl"
        style={{
          backgroundColor: "#fdf8f4",
          maxWidth: "480px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
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
