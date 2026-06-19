import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "마이페이지" };

const CREAM = "#fdf8f4";
const MAROON = "#7c1d23";
const INK = "#2d1a10";
const INK_SOFT = "#9c8472";

export default async function MyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/mypage");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const displayName = profile?.display_name ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? "사용자";
  const email = profile?.email ?? user.email ?? "";

  const menuItems = [
    {
      href: "/mypage/orders",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      ),
      label: "결제 내역 / 결과지",
      desc: "구매한 사주 결과지를 확인하세요",
    },
    {
      href: "/mypage/reviews",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ),
      label: "내 후기",
      desc: "작성한 후기를 관리하세요",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-7rem)]" style={{ background: CREAM }}>
      {/* 상단 프로필 배너 */}
      <div className="px-6 pt-10 pb-8" style={{ background: MAROON }}>
        <p className="text-[11px] font-medium tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
          MY ACCOUNT
        </p>
        {/* 카카오 프로필 이미지 */}
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-[22px] font-bold flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.15)", color: "white" }}
          >
            {displayName.charAt(0)}
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-white leading-tight">{displayName}</h1>
            {email && (
              <p className="text-[13px] mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>{email}</p>
            )}
          </div>
        </div>
      </div>

      {/* 메뉴 카드 */}
      <div className="px-5 py-6 flex flex-col gap-3">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-white"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${MAROON}12`, color: MAROON }}
            >
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold" style={{ color: INK }}>{item.label}</p>
              <p className="text-[12px] mt-0.5" style={{ color: INK_SOFT }}>{item.desc}</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={INK_SOFT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </Link>
        ))}
      </div>

      {/* 로그아웃 */}
      <div className="px-5 pb-10">
        <form action="/api/auth/signout" method="post">
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl text-[14px] font-medium"
            style={{ background: "rgba(0,0,0,0.05)", color: INK_SOFT }}
          >
            로그아웃
          </button>
        </form>
      </div>
    </div>
  );
}
