export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", color: "#111" }}>
      {children}
    </div>
  );
}
