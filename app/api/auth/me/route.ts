import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userResponse = await fetch(`${process.env.API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch user" },
        { status: 401 },
      );
    }

    const data = await userResponse.json();
    console.log("User data fetched successfully:", data);
    if (!data.success) {
      return NextResponse.json(
        {
          error: data.detail ?? data.error ?? "Invalid token",
        },
        {
          status: data.status,
        },
      );
    }

    const businesses = Array.isArray(data) ? data : (data.businesses ?? []);

    const firstBusiness = businesses[0];

    if (!firstBusiness) {
      return NextResponse.json(
        {
          error: "No business found",
        },
        {
          status: 403,
        },
      );
    }

    const response = NextResponse.json({
      user: data.user ?? null,
      businesses,
      active_business: firstBusiness,
      business_id: firstBusiness.id ?? firstBusiness.business_id,
      business_name: firstBusiness.name ?? firstBusiness.business_name,
      permissions: firstBusiness.permissions ?? [],
      success: true,
    });
    response.cookies.set({
      name: "active_business_currency",
      value: String(firstBusiness.currency_code || "PHP"),
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("Failed to load user session:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}
