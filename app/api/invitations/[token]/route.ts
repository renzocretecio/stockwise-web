import { NextRequest, NextResponse } from "next/server";

type Context = {
    params: Promise<{ token: string }>;
};

export async function GET(_: NextRequest, context: Context) {
    const { token } = await context.params;
    const response = await fetch(
        `${process.env.API_URL}/invitations/${encodeURIComponent(token)}`,
        { cache: "no-store" },
    );
    const payload = await response.json().catch(() => ({}));
    return NextResponse.json(payload, { status: response.status });
}
