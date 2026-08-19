import Cookies from "js-cookie";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(
    options.headers,
  );

  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  if (
    options.body &&
    !isFormData &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: "include",
  });

  const contentType =
    response.headers.get("content-type");

  const data = contentType?.includes(
    "application/json",
  )
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.detail ||
        data?.message ||
        data?.error ||
        "API request failed",
      data,
    );
  }

  return data as T;
}