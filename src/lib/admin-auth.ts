// =====================================================
// 어드민 인증 — ID + PASSWORD 방식 (admin / coworker 공통)
// =====================================================
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { serverEnv } from "@/lib/env";

const COOKIE_NAME = "admin_session";
const ADMIN_TOKEN    = "admin_authenticated";
const COWORKER_TOKEN = "coworker_authenticated";
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7일

export function isAdminConfigured(): boolean {
  return serverEnv().ADMIN_PASSWORD.length > 0;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const expected = serverEnv().ADMIN_PASSWORD;
  if (!expected) return false;
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return token === ADMIN_TOKEN || token === COWORKER_TOKEN;
}

// 어드민 페이지의 상단에서 호출 — 미인증이면 /admin/login 으로 리다이렉트
export async function requireAdminPassword(redirectFrom: string) {
  if (!isAdminConfigured()) {
    redirect(`/admin/login?from=${encodeURIComponent(redirectFrom)}&unconfigured=1`);
  }
  if (!(await isAdminAuthenticated())) {
    redirect(`/admin/login?from=${encodeURIComponent(redirectFrom)}`);
  }
}

export async function setAdminCookie(id: string, password: string): Promise<boolean> {
  const env = serverEnv();
  const cookieStore = await cookies();

  let token: string | null = null;

  if (id === "admin" && password === env.ADMIN_PASSWORD) {
    token = ADMIN_TOKEN;
  } else if (id === "semiadmin" && password === env.COWORKER_PASSWORD) {
    token = COWORKER_TOKEN;
  }

  if (!token) return false;

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
  return true;
}

export async function clearAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
