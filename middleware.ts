import { NextRequest, NextResponse } from "next/server";

export const PROTECTED_PREFIXES = [
  "/home",
  "/dashboard",
  "/profile",
  "/gallery",
  "/portfolios",
  "/versions",
  "/pages",
  "/resumes",
  "/templates",
  "/settings",
  "/teste-vocacional/app",
];
const SESSION_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];
const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const CSRF_EXEMPT_API_PREFIXES = ["/api/auth/"];

export function hasSessionCookie(request: NextRequest) {
  return SESSION_COOKIE_NAMES.some((name) => Boolean(request.cookies.get(name)?.value));
}

export function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function getConfiguredAppOrigin() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return null;

  try {
    return new URL(appUrl).origin;
  } catch {
    return null;
  }
}

function getHeaderOrigin(value: string | null) {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function isCsrfExemptApiPath(pathname: string) {
  return CSRF_EXEMPT_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isApiMutation(request: NextRequest) {
  return (
    request.nextUrl.pathname.startsWith("/api/") &&
    MUTATION_METHODS.has(request.method.toUpperCase()) &&
    !isCsrfExemptApiPath(request.nextUrl.pathname)
  );
}

function hasAllowedOrigin(request: NextRequest) {
  const allowedOrigins = new Set([
    request.nextUrl.origin,
    getConfiguredAppOrigin(),
  ].filter((origin): origin is string => Boolean(origin)));
  const origin = request.headers.get("origin");

  if (origin) {
    return allowedOrigins.has(origin);
  }

  const refererOrigin = getHeaderOrigin(request.headers.get("referer"));
  if (refererOrigin) {
    return allowedOrigins.has(refererOrigin);
  }

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && !["same-origin", "same-site", "none"].includes(fetchSite)) {
    return false;
  }

  return true;
}

export default function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const isLoggedIn = hasSessionCookie(request);
  const isProtected = isProtectedPath(nextUrl.pathname);

  if (isApiMutation(request) && !hasAllowedOrigin(request)) {
    return NextResponse.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "Acesso negado.",
        },
      },
      { status: 403 }
    );
  }

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
