import { NextRequest, NextResponse } from "next/server";

const COOKIE_AGE = 60 * 60 * 24 * 7;

export async function POST(request: NextRequest) {
    const accessToken = request.cookies.get("access_token")?.value;
    if (!accessToken) {
        return NextResponse.json(
            { error: "Sign in before accepting the invitation" },
            { status: 401 },
        );
    }

    const response = await fetch(`${process.env.API_URL}/invitations/accept`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(await request.json()),
        cache: "no-store",
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        return NextResponse.json(payload, { status: response.status });
    }

    const businessesResponse = await fetch(
        `${process.env.API_URL}/businesses/my-businesses`,
        {
            headers: { Authorization: `Bearer ${accessToken}` },
            cache: "no-store",
        },
    );
    const businessesPayload = await businessesResponse.json().catch(() => ({}));
    const businesses = Array.isArray(businessesPayload)
        ? businessesPayload
        : (businessesPayload.businesses ?? []);
    const business = businesses.find(
        (item: { id?: string; business_id?: string }) =>
            String(item.id ?? item.business_id) === String(payload.business_id),
    );
    if (!business) {
        return NextResponse.json(
            { error: "The business membership could not be loaded" },
            { status: 502 },
        );
    }

    const result = NextResponse.json({
        ...payload,
        active_business: business,
    });
    const options = {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        maxAge: COOKIE_AGE,
        path: "/",
    };
    result.cookies.set({
        ...options,
        httpOnly: false,
        name: "active_business_id",
        value: String(business.id ?? business.business_id),
    });
    result.cookies.set({
        ...options,
        httpOnly: false,
        name: "active_business_currency",
        value: String(business.currency_code || "PHP"),
    });
    result.cookies.set({
        ...options,
        httpOnly: true,
        name: "business_onboarding_completed",
        value: "true",
    });
    return result;
}
