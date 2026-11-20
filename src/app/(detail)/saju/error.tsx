"use client";

// 결과지·상품 화면에서 예상치 못한 오류가 나도 브라우저 기본 "Application error" 대신
// 안내 화면을 보여준다. (특정 장의 AI 풀이 형식이 깨졌을 때 등)
export default function SajuErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-24 text-center" style={{ background: "#fdf8f4", minHeight: "70vh" }}>
      <p className="text-[18px] font-bold mb-3" style={{ color: "#1a1a1a" }}>이 화면을 불러오는 중 문제가 생겼소</p>
      <p className="text-[14px] leading-relaxed mb-6" style={{ color: "#666" }}>
        잠시 후 다시 시도하거나, 목차에서 다른 장을 먼저 보아 주시오.<br />
        계속 같은 화면이 나오면 카카오톡 채널로 알려주시면 바로 고쳐드리겠소.
      </p>
      <div className="flex gap-3">
        <button onClick={reset} className="px-5 py-2.5 rounded-full text-[14px] font-bold" style={{ background: "#9b2335", color: "#fff" }}>
          다시 시도
        </button>
        <button onClick={() => history.back()} className="px-5 py-2.5 rounded-full text-[14px] font-bold" style={{ background: "#fff", color: "#9b2335", border: "1px solid #9b2335" }}>
          이전 화면
        </button>
      </div>
    </div>
  );
}
