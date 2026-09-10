import { NextRequest } from "next/server";

const API_URL = process.env.API_URL;

type Context = {
  params: Promise<{
    path: string[];
  }>;
};

async function handler(
  request: NextRequest,
  context: Context,
) {
  const { path } = await context.params;

  const backendPath = path.join("/");
  const query = request.nextUrl.search;
  const url = `${API_URL}/${backendPath}${query}`;

  const headers = new Headers();

  const token =
    request.cookies.get(
      "access_token",
    )?.value;

  const businessId =
    request.cookies.get(
      "active_business_id",
    )?.value;

  if (!token) {
    return Response.json(
      {
        detail: "Missing access token",
      },
      {
        status: 401,
      },
    );
  }

  headers.set(
    "Authorization",
    `Bearer ${token}`,
  );

  if (businessId) {
    headers.set(
      "X-Business-ID",
      businessId,
    );
  }

  const contentType =
    request.headers.get("content-type");

  if (contentType) {
    headers.set(
      "Content-Type",
      contentType,
    );
  }

  const body =
    request.method === "GET" ||
    request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  const response = await fetch(url, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  });

  const responseHeaders = new Headers();
  responseHeaders.set(
    "Content-Type",
    response.headers.get(
      "content-type",
    ) || "application/json",
  );
  for (const header of [
    "cache-control",
    "content-disposition",
    "x-content-type-options",
  ]) {
    const value = response.headers.get(header);
    if (value) responseHeaders.set(header, value);
  }

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
