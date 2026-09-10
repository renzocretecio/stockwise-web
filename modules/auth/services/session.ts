import { type QueryClient, useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { clearReferenceData, dexieQueryPersister } from "@/lib/offline-db";

const SESSION_STALE_TIME = 5 * 60 * 1000;

export type SessionBusiness = {
  id: string;
  name: string;
  role: string;
  plan?: "free" | "pro" | "business";
  subscription_status?: string;
  slug?: string;
  permissions?: string[];
  currency_code?: string;
  onboarding_completed?: boolean;
};

export type SessionUser = {
  id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  is_superadmin?: boolean;
};

export type SessionResponse = {
  user?: SessionUser | null;
  businesses?: SessionBusiness[];
  active_business?: SessionBusiness | null;
  business_id?: string;
  business_name?: string;
  permissions?: string[];
  role?: string;
  success?: boolean;
};

export const authKeys = {
  me: ["auth", "me"] as const,
};

export function fetchSession() {
  return apiClient<SessionResponse>("/api/auth/me");
}

export function useSession() {
  return useQuery<SessionResponse>({
    queryKey: authKeys.me,
    queryFn: fetchSession,
    staleTime: SESSION_STALE_TIME,
    refetchOnMount: (query) => {
      const session = query.state.data as SessionResponse | undefined;
      const business = session?.active_business;
      const accessContextIsIncomplete =
        !business?.role || !Array.isArray(business.permissions);

      return accessContextIsIncomplete || query.isStale();
    },
    retry: false,
  });
}

export function hydrateSessionCache(queryClient: QueryClient) {
  return queryClient.fetchQuery({
    queryKey: authKeys.me,
    queryFn: fetchSession,
    staleTime: SESSION_STALE_TIME,
  });
}

export async function resetSessionCache(
  queryClient: QueryClient,
  options: { clearReferenceData?: boolean } = {},
) {
  await queryClient.cancelQueries();
  queryClient.clear();
  await dexieQueryPersister.removeClient?.();
  if (options.clearReferenceData) {
    await clearReferenceData();
  }
}
