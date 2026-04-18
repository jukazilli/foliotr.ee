import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PROTECTED = [
  "/dashboard",
  "/profile",
  "/versions",
  "/pages",
  "/resumes",
  "/settings",
  "/onboarding",
];
const AUTH_PAGES = ["/login", "/register", "/forgot-password"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isProtected = PROTECTED.some((p) => nextUrl.pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => nextUrl.pathname.startsWith(p));

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
