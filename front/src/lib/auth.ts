import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Session, User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "./supabaseClient";

const ACCESS_COOKIE = "sb-access-token";
const REFRESH_COOKIE = "sb-refresh-token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const persistAuthSession = async (session: Session): Promise<void> => {
  const expiresAt = session.expires_at
    ? new Date(session.expires_at * 1000)
    : undefined;
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";

  cookieStore.set(ACCESS_COOKIE, session.access_token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    expires: expiresAt,
  });

  cookieStore.set(REFRESH_COOKIE, session.refresh_token ?? "", {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
};

export const clearAuthCookies = async (): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
};

const fetchUserWithAccessToken = async (
  accessToken: string,
): Promise<User | null> => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    return null;
  }

  return data.user;
};

const refreshSession = async (
  refreshToken: string,
): Promise<AuthSession | null> => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session) {
    return null;
  }

  await persistAuthSession(data.session);

  return {
    user: data.session.user,
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token ?? refreshToken,
  };
};

export const getSession = async (): Promise<AuthSession | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (!accessToken || !refreshToken) {
    return null;
  }

  const user = await fetchUserWithAccessToken(accessToken);

  if (user) {
    return { user, accessToken, refreshToken };
  }

  const refreshed = await refreshSession(refreshToken);

  if (!refreshed) {
    await clearAuthCookies();
  }

  return refreshed;
};

export const requireUser = async (): Promise<AuthSession> => {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
};

export const requireAdmin = async (): Promise<AuthSession> => {
  const session = await requireUser();
  const role = session.user.user_metadata?.role;

  if (role !== "admin") {
    redirect("/app");
  }

  return session;
};

export const getUserRole = (user: User): string | undefined =>
  user.user_metadata?.role;

