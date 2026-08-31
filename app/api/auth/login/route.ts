import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const apiResponse = await fetch(`${process.env.API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return NextResponse.json(
        {
          error: data.detail ?? data.error ?? "Invalid credentials",
        },
        {
          status: apiResponse.status,
        },
      );
    }

    if (!data.access_token) {
      return NextResponse.json(
        {
          error: "Access token was not returned",
        },
        {
          status: 502,
        },
      );
    }

    const accessToken = data.access_token;

    const businessesResponse = await fetch(
      `${process.env.API_URL}/businesses/my-businesses`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    const businessesData = await businessesResponse.json();

    if (!businessesResponse.ok) {
      return NextResponse.json(
        {
          error: businessesData.detail ?? "Failed to load businesses",
        },
        {
          status: businessesResponse.status,
        },
      );
    }

    const businesses = Array.isArray(businessesData)
      ? businessesData
      : (businessesData.businesses ?? []);

    const firstBusiness = businesses[0];

    if (!firstBusiness) {
      return NextResponse.json(
        {
          error: "No business found for this user",
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
      success: true,
    });

    response.cookies.set({
      name: "access_token",
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    response.cookies.set({
      name: "active_business_id",
      value: String(firstBusiness.id ?? firstBusiness.business_id),
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
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
    console.error("Login error:", error);

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
