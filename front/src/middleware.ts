import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "./lib/supabaseClient";

const ACCESS_COOKIE = "sb-access-token";
const REFRESH_COOKIE = "sb-refresh-token";

const isProtectedPath = (pathname: string): boolean =>
  pathname.startsWith("/app") || pathname.startsWith("/admin");

const redirectTo = (req: NextRequest, path: string): NextResponse =>
  NextResponse.redirect(new URL(path, req.url));

const setAuthCookies = (
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
  expiresAt?: number | null,
): void => {
  const secure = process.env.NODE_ENV === "production";
  const maxAge = 60 * 60 * 24 * 7; // 7 days

  response.cookies.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge,
    expires: expiresAt ? new Date(expiresAt * 1000) : undefined,
  });

  response.cookies.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
};

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;

  if (!accessToken || !refreshToken) {
    return redirectTo(req, "/login");
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    if (!refreshToken) {
      return redirectTo(req, "/login");
    }

    const { data: refreshData, error: refreshError } =
      await supabase.auth.refreshSession({ refresh_token: refreshToken });

    if (refreshError || !refreshData.session) {
      const response = redirectTo(req, "/login");
      response.cookies.delete(ACCESS_COOKIE);
      response.cookies.delete(REFRESH_COOKIE);
      return response;
    }

    const adminRole = refreshData.session.user.user_metadata?.role;
    if (pathname.startsWith("/admin") && adminRole !== "admin") {
      const redirectResponse = redirectTo(req, "/app");
      setAuthCookies(
        redirectResponse,
        refreshData.session.access_token,
        refreshData.session.refresh_token ?? refreshToken,
        refreshData.session.expires_at,
      );
      return redirectResponse;
    }

    const response = NextResponse.next();
    setAuthCookies(
      response,
      refreshData.session.access_token,
      refreshData.session.refresh_token ?? refreshToken,
      refreshData.session.expires_at,
    );
    return response;
  }

  if (pathname.startsWith("/admin")) {
    const role = data.user.user_metadata?.role;
    if (role !== "admin") {
      return redirectTo(req, "/app");
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};

