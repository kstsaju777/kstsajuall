const CREAM = "#fdf8f4";
const GOLD = "#b8860b";
const GRAY3 = "#888888";

export default function Loading() {
  return (
    <div style={{ backgroundColor: CREAM, minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px" }}>
      <div style={{ width: 48, height: 48, borderRadius: "50%", border: `3px solid ${GOLD}33`, borderTop: `3px solid ${GOLD}`, animation: "spin 1s linear infinite", marginBottom: 24 }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: GOLD, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>재물운을 분석하고 있어요</p>
      <p style={{ color: GRAY3, fontSize: 13 }}>사주 명식을 계산하고 풀이를 생성 중입니다...</p>
    </div>
  );
}
