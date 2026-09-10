import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

const GOOGLE_AUTHORIZATION_URL =
  "https://accounts.google.com/o/oauth2/v2/auth";
const OAUTH_COOKIE_AGE = 10 * 60;

export function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return redirectToLogin(request, "not_configured");
  }

  const state = randomBytes(32).toString("base64url");
  const codeVerifier = randomBytes(64).toString("base64url");
  const codeChallenge = createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ??
    new URL("/api/auth/google/callback", request.nextUrl.origin).toString();
  const requestedCallback = request.nextUrl.searchParams.get("callbackUrl");
  const callbackUrl = isSafeCallback(requestedCallback)
    ? requestedCallback
    : "/dashboard";

  const authorizationUrl = new URL(GOOGLE_AUTHORIZATION_URL);
  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", "openid email profile");
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("code_challenge", codeChallenge);
  authorizationUrl.searchParams.set("code_challenge_method", "S256");
  authorizationUrl.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(authorizationUrl);
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: OAUTH_COOKIE_AGE,
    path: "/api/auth/google",
  };
  response.cookies.set("google_oauth_state", state, cookieOptions);
  response.cookies.set(
    "google_oauth_code_verifier",
    codeVerifier,
    cookieOptions,
  );
  response.cookies.set(
    "google_oauth_callback_url",
    callbackUrl,
    cookieOptions,
  );
  return response;
}

function isSafeCallback(value: string | null): value is string {
  return Boolean(value?.startsWith("/") && !value.startsWith("//"));
}

function redirectToLogin(request: NextRequest, error: string) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("oauth_error", error);
  return NextResponse.redirect(loginUrl);
}
