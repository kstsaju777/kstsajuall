// report 생성(명식 + LLM 해석) 동안 보여줄 로딩 화면
export default function ReportLoading() {
  const CREAM = "#fdf8f4";
  const RED = "#9b2335";
  return (
    <div
      className="flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: CREAM, minHeight: "100%", height: "100%" }}
    >
      <div
        className="rounded-full animate-spin"
        style={{
          width: 44,
          height: 44,
          border: `3px solid ${RED}22`,
          borderTopColor: RED,
        }}
      />
      <p className="mt-5 text-[15px] font-bold" style={{ color: "#1a1a1a" }}>
        사주를 풀이하고 있어요
      </p>
      <p className="mt-1 text-[13px]" style={{ color: "#888888" }}>
        명식을 세우고 해석을 작성하는 중입니다…
      </p>
    </div>
  );
}
