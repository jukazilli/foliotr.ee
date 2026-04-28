import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import middleware, { hasSessionCookie, isProtectedPath } from "@/middleware";

function createRequest(pathname: string, cookie?: string) {
  return new NextRequest(`https://foliotree.test${pathname}`, {
    headers: cookie ? { cookie } : undefined,
  });
}

describe("protected route middleware", () => {
  it("flags the logged shell routes as protected", () => {
    expect(isProtectedPath("/dashboard")).toBe(true);
    expect(isProtectedPath("/profile")).toBe(true);
    expect(isProtectedPath("/gallery")).toBe(true);
    expect(isProtectedPath("/portfolios")).toBe(true);
    expect(isProtectedPath("/versions")).toBe(true);
    expect(isProtectedPath("/pages")).toBe(true);
    expect(isProtectedPath("/resumes")).toBe(true);
    expect(isProtectedPath("/templates")).toBe(true);
    expect(isProtectedPath("/login")).toBe(false);
    expect(isProtectedPath("/ana-souza")).toBe(false);
  });

  it("detects auth cookies using all supported session names", () => {
    expect(
      hasSessionCookie(createRequest("/dashboard", "authjs.session-token=token-value"))
    ).toBe(true);
    expect(
      hasSessionCookie(
        createRequest("/dashboard", "__Secure-next-auth.session-token=token-value")
      )
    ).toBe(true);
    expect(hasSessionCookie(createRequest("/dashboard"))).toBe(false);
  });

  it("redirects anonymous access to login with callback url", () => {
    const response = middleware(createRequest("/templates"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://foliotree.test/login?callbackUrl=%2Ftemplates"
    );
  });

  it("allows authenticated requests to protected routes", () => {
    const response = middleware(
      createRequest("/pages", "authjs.session-token=valid-session-token")
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});
