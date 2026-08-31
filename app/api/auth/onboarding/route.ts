import { NextRequest, NextResponse } from "next/server";

function credentials(request: NextRequest) {
  return {
    token: request.cookies.get("access_token")?.value,
    businessId: request.cookies.get("active_business_id")?.value,
  };
}

export async function GET(request: NextRequest) {
  const { token, businessId } = credentials(request);
  if (!token || !businessId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const apiResponse = await fetch(
    `${process.env.API_URL}/businesses/${businessId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );
  return new NextResponse(apiResponse.body, {
    status: apiResponse.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function PATCH(request: NextRequest) {
  const { token, businessId } = credentials(request);
  if (!token || !businessId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const payload = await request.json();
  const apiResponse = await fetch(
    `${process.env.API_URL}/businesses/${businessId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...payload, complete_onboarding: true }),
      cache: "no-store",
    },
  );
  const data = await apiResponse.json();
  if (!apiResponse.ok) {
    return NextResponse.json(
      { error: data.detail ?? "Unable to save business profile" },
      { status: apiResponse.status },
    );
  }

  const response = NextResponse.json(data);
  const common = {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  };
  response.cookies.set({
    ...common,
    name: "business_onboarding_completed",
    value: "true",
    httpOnly: true,
  });
  response.cookies.set({
    ...common,
    name: "active_business_currency",
    value: String(data.business.currency_code),
    httpOnly: false,
  });
  return response;
}
