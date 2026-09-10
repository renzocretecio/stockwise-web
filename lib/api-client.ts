import { requestPlanUpgrade } from "@/modules/billing/upgrade-events";
import type { UpgradeReason } from "@/modules/billing/types";

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

function getErrorDetail(data: unknown): unknown {
  if (typeof data !== "object" || data === null) return data;
  return "detail" in data ? data.detail : data;
}

function getErrorMessage(data: unknown): string {
  const detail = getErrorDetail(data);

  if (typeof detail === "string") return detail;
  if (typeof detail === "object" && detail !== null) {
    if ("message" in detail && typeof detail.message === "string") {
      return detail.message;
    }
  }

  if (typeof data === "object" && data !== null) {
    const record = data as Record<string, unknown>;
    for (const key of ["message", "error"] as const) {
      if (typeof record[key] === "string") {
        return record[key];
      }
    }
  }

  return "API request failed";
}

function getUpgradeReason(data: unknown): UpgradeReason {
  const detail = getErrorDetail(data);
  if (typeof detail !== "object" || detail === null) {
    return { message: getErrorMessage(data) };
  }
  return detail as UpgradeReason;
}

export class ApiOfflineError extends Error {
  constructor() {
    super("The application is offline");
    this.name = "ApiOfflineError";
  }
}

export async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  if (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    !navigator.onLine
  ) {
    throw new ApiOfflineError();
  }

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
    if (response.status === 402) {
      requestPlanUpgrade(getUpgradeReason(data));
    }

    throw new ApiError(
      response.status,
      getErrorMessage(data),
      data,
    );
  }

  return data as T;
}
