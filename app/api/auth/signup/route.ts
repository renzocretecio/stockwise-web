import { NextResponse } from "next/server";

const COOKIE_AGE = 60 * 60 * 24 * 7;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiResponse = await fetch(`${process.env.API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      const validationMessage = Array.isArray(data.detail)
        ? data.detail
            .map((issue: { msg?: string }) => issue.msg)
            .filter(Boolean)
            .join(". ")
        : null;
      return NextResponse.json(
        {
          error:
            validationMessage || data.detail || "Unable to create account",
        },
        { status: apiResponse.status },
      );
    }

    const token = data.access_token;
    const business = data.business;
    if (!token || !business?.id) {
      return NextResponse.json(
        { error: "Invalid signup response" },
        { status: 502 },
      );
    }

    const response = NextResponse.json({
      success: true,
      user: data.user,
      active_business: business,
    });
    const common = {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: COOKIE_AGE,
      path: "/",
    };

    response.cookies.set({
      ...common,
      name: "access_token",
      value: token,
      httpOnly: true,
    });
    response.cookies.set({
      ...common,
      name: "active_business_id",
      value: String(business.id),
      httpOnly: false,
    });
    response.cookies.set({
      ...common,
      name: "active_business_currency",
      value: String(business.currency_code || "PHP"),
      httpOnly: false,
    });
    response.cookies.set({
      ...common,
      name: "business_onboarding_completed",
      value: "false",
      httpOnly: true,
    });
    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
