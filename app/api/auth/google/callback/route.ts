import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

const COOKIE_AGE = 60 * 60 * 24 * 7;
const TEMPORARY_COOKIES = [
  "google_oauth_state",
  "google_oauth_code_verifier",
  "google_oauth_callback_url",
];

export async function GET(request: NextRequest) {
  const providerError = request.nextUrl.searchParams.get("error");
  if (providerError) {
    return redirectToLogin(request, "cancelled");
  }

  const code = request.nextUrl.searchParams.get("code");
  const returnedState = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get("google_oauth_state")?.value;
  const codeVerifier = request.cookies.get(
    "google_oauth_code_verifier",
  )?.value;

  if (!code || !codeVerifier || !safeEqual(returnedState, expectedState)) {
    return redirectToLogin(request, "invalid_state");
  }

  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ??
    new URL("/api/auth/google/callback", request.nextUrl.origin).toString();

  try {
    const exchangeResponse = await fetch(
      `${process.env.API_URL}/auth/google/exchange`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          code_verifier: codeVerifier,
          redirect_uri: redirectUri,
        }),
        cache: "no-store",
      },
    );
    const exchange = await exchangeResponse.json().catch(() => ({}));
    if (!exchangeResponse.ok || !exchange.access_token) {
      return redirectToLogin(request, "exchange_failed");
    }

    const accessToken = String(exchange.access_token);
    const businessesResponse = await fetch(
      `${process.env.API_URL}/businesses/my-businesses`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );
    if (!businessesResponse.ok) {
      return redirectToLogin(request, "businesses_failed");
    }

    const businessesPayload = await businessesResponse.json();
    const businesses = Array.isArray(businessesPayload)
      ? businessesPayload
      : (businessesPayload.businesses ?? []);
    const firstBusiness = businesses[0];
    const requestedCallback = request.cookies.get(
      "google_oauth_callback_url",
    )?.value;
    const invitationCallback = requestedCallback?.startsWith(
      "/invitations/accept?",
    );
    const destination = firstBusiness || invitationCallback
      ? safeCallback(requestedCallback)
      : "/businesses/new";
    const response = NextResponse.redirect(
      new URL(destination, request.url),
    );

    response.cookies.set({
      name: "access_token",
      value: accessToken,
      httpOnly: true,
      ...sessionCookieOptions(),
    });

    if (firstBusiness) {
      response.cookies.set({
        name: "active_business_id",
        value: String(firstBusiness.id ?? firstBusiness.business_id),
        httpOnly: false,
        ...sessionCookieOptions(),
      });
      response.cookies.set({
        name: "active_business_currency",
        value: String(firstBusiness.currency_code || "PHP"),
        httpOnly: false,
        ...sessionCookieOptions(),
      });
      response.cookies.set({
        name: "business_onboarding_completed",
        value: String(
          firstBusiness.onboarding_completed !== false ||
            firstBusiness.role?.toLowerCase() !== "owner",
        ),
        httpOnly: true,
        ...sessionCookieOptions(),
      });
    } else {
      response.cookies.delete("active_business_id");
      response.cookies.delete("active_business_currency");
      response.cookies.delete("business_onboarding_completed");
    }

    clearTemporaryCookies(response);
    return response;
  } catch {
    return redirectToLogin(request, "unavailable");
  }
}

function safeEqual(left?: string | null, right?: string | null) {
  if (!left || !right) return false;
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function safeCallback(value?: string) {
  return value?.startsWith("/") && !value.startsWith("//")
    ? value
    : "/dashboard";
}

function sessionCookieOptions() {
  return {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: COOKIE_AGE,
    path: "/",
  };
}

function redirectToLogin(request: NextRequest, error: string) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("oauth_error", error);
  const response = NextResponse.redirect(loginUrl);
  clearTemporaryCookies(response);
  return response;
}

function clearTemporaryCookies(response: NextResponse) {
  TEMPORARY_COOKIES.forEach((name) => response.cookies.delete(name));
}
