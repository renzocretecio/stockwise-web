import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: "access_token",
    value: "",
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });

  response.cookies.set({
    name: "active_business_id",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  response.cookies.set({
    name: "active_business_currency",
    value: "",
    expires: new Date(0),
    path: "/",
  });
  response.cookies.set({
    name: "business_onboarding_completed",
    value: "",
    expires: new Date(0),
    path: "/",
  });
  return response;
}
