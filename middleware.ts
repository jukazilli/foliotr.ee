import { NextRequest, NextResponse } from "next/server";

export const PROTECTED_PREFIXES = [
  "/dashboard",
  "/profile",
  "/versions",
  "/pages",
  "/resumes",
  "/templates",
  "/settings",
  "/onboarding",
];
const SESSION_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

export function hasSessionCookie(request: NextRequest) {
  return SESSION_COOKIE_NAMES.some((name) => Boolean(request.cookies.get(name)?.value));
}

export function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const isLoggedIn = hasSessionCookie(request);
  const isProtected = isProtectedPath(nextUrl.pathname);

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
