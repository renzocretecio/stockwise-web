import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { business_id: businessId } = await request.json();
  const profileResponse = await fetch(`${process.env.API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const profile = await profileResponse.json();
  const businesses = profile.businesses ?? [];
  const business = businesses.find(
    (item: { id?: string; business_id?: string }) =>
      String(item.id ?? item.business_id) === String(businessId),
  );

  if (!profileResponse.ok || !business) {
    return NextResponse.json(
      { error: "You do not belong to this business" },
      { status: 403 },
    );
  }

  const response = NextResponse.json({
    success: true,
    active_business: business,
  });
  const common = {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  };
  response.cookies.set({
    ...common,
    name: "active_business_id",
    value: String(business.id ?? business.business_id),
  });
  response.cookies.set({
    ...common,
    name: "active_business_currency",
    value: String(business.currency_code || "PHP"),
  });
  response.cookies.set({
    ...common,
    name: "business_onboarding_completed",
    value: String(
      business.onboarding_completed !== false ||
        business.role?.toLowerCase() !== "owner",
    ),
    httpOnly: true,
  });
  return response;
}
