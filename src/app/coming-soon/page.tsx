import Link from "next/link";

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: "#000000" }}>
      <div className="text-center space-y-4">
        <p className="text-[13px] tracking-widest" style={{ color: "#9b2335" }}>✦ 준비 중 ✦</p>
        <h1 className="text-[28px] font-black" style={{ color: "#ffffff" }}>곧 오픈됩니다</h1>
        <p className="text-[14px] leading-relaxed" style={{ color: "#aaaaaa" }}>
          현재 준비 중인 서비스입니다.<br/>조금만 기다려 주세요!
        </p>
        <Link href="/" className="inline-block mt-4 px-6 py-3 rounded-full text-white font-bold text-[14px]" style={{ backgroundColor: "#9b2335" }}>
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
