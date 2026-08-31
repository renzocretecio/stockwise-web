import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const apiResponse = await fetch(`${process.env.API_URL}/businesses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(await request.json()),
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
      { error: validationMessage || data.detail || "Unable to create business" },
      { status: apiResponse.status },
    );
  }

  const business = data.business;
  const response = NextResponse.json(data);
  const common = {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  };
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
}
