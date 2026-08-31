import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/profile",
  "/products",
  "/suppliers",
  "/purchases",
  "/sales",
  "/inventory",
  "/reports",
  "/alerts",
  "/settings",
  "/onboarding",
];
const AUTH_ROUTES = ["/login", "/signup"];

function isTokenExpired(token: string): boolean {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return true;
    const normalized = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const base64 = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    const decodedJson = atob(base64);
    const payload = JSON.parse(decodedJson);
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("access_token")?.value;
  const onboardingCompleted = request.cookies.get(
    "business_onboarding_completed",
  )?.value;

  const isExpired = sessionToken ? isTokenExpired(sessionToken) : false;
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // missing o expired ang token, redirect to login page
  if (isProtectedRoute && (!sessionToken || isExpired)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("access_token");
    response.headers.set(
      "Cache-Control",
      "no-store, max-age=0, must-revalidate",
    );
    return response;
  }

  const isOnboardingRoute = pathname.startsWith("/onboarding/business");
  if (
    isProtectedRoute &&
    sessionToken &&
    !isExpired &&
    onboardingCompleted === "false" &&
    !isOnboardingRoute
  ) {
    return NextResponse.redirect(
      new URL("/onboarding/business", request.url),
    );
  }

  if (isOnboardingRoute && onboardingCompleted === "true") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // kapag authenticated at inaccess ang login/signup page, redirect to dashboard
  if (isAuthRoute && sessionToken && !isExpired) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$).*)",
  ],
};
