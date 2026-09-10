import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { useSession } from "@/modules/auth/services/session";
import type {
  BillingAdminAccess,
  SubscriptionSummary,
  PaymentSubmissionInput,
  UpgradeRequest,
  UpgradeRequestInput,
  UpgradeRequestListResponse,
  UpgradeRequestStatus,
} from "@/modules/billing/types";

export const subscriptionKeys = {
  all: ["billing", "subscription"] as const,
};

export const upgradeRequestKeys = {
  all: ["billing", "upgrade-requests"] as const,
  current: (businessId?: string) =>
    [...upgradeRequestKeys.all, "current", businessId] as const,
  admin: (
    page: number,
    pageSize: number,
    status?: UpgradeRequestStatus | "all",
  ) => [...upgradeRequestKeys.all, "admin", page, pageSize, status] as const,
};

export function useSubscription() {
  const auth = useSession();
  const businessId = auth.data?.active_business?.id;

  return useQuery({
    queryKey: [...subscriptionKeys.all, businessId],
    queryFn: () => apiClient<SubscriptionSummary>("/api/billing/subscription"),
    enabled: Boolean(businessId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useOfflineEntitlement() {
  const auth = useSession();
  const subscription = useSubscription();
  const plan = auth.data?.active_business?.plan;
  const planAllowsOffline = plan === "pro" || plan === "business";

  return {
    enabled: subscription.data?.features.offline_sync ?? planAllowsOffline,
    resolved: Boolean(subscription.data || auth.data?.active_business),
  };
}

export function useStartProTrial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient<SubscriptionSummary>("/api/billing/subscription/trial", {
        method: "POST",
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: subscriptionKeys.all,
      });
    },
  });
}

export function useCurrentUpgradeRequest(enabled = true) {
  const auth = useSession();
  const businessId = auth.data?.active_business?.id;

  return useQuery({
    queryKey: upgradeRequestKeys.current(businessId),
    queryFn: () =>
      apiClient<UpgradeRequest | null>("/api/billing/upgrade-requests/current"),
    enabled: enabled && Boolean(businessId),
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
    staleTime: 30 * 1000,
  });
}

export function useCreateUpgradeRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpgradeRequestInput) =>
      apiClient<UpgradeRequest>("/api/billing/upgrade-requests", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: upgradeRequestKeys.all,
      });
    },
  });
}

export function useSubmitUpgradeRequestPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: PaymentSubmissionInput & { id: string }) =>
      apiClient<UpgradeRequest>(
        `/api/billing/upgrade-requests/${id}/submit-payment`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: upgradeRequestKeys.all,
      });
    },
  });
}

export function useCancelUpgradeRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient<UpgradeRequest>(`/api/billing/upgrade-requests/${id}/cancel`, {
        method: "POST",
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: upgradeRequestKeys.all,
      });
    },
  });
}

export function useAdminUpgradeRequests(
  page = 1,
  pageSize = 10,
  status: UpgradeRequestStatus | "all" = "all",
) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  if (status !== "all") {
    params.set("status", status);
  }

  return useQuery({
    queryKey: upgradeRequestKeys.admin(page, pageSize, status),
    queryFn: () =>
      apiClient<UpgradeRequestListResponse>(
        `/api/billing/admin/upgrade-requests?${params.toString()}`,
      ),
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000,
  });
}

export function useBillingAdminAccess(enabled = true) {
  return useQuery({
    queryKey: [...upgradeRequestKeys.all, "admin-access"],
    queryFn: () => apiClient<BillingAdminAccess>("/api/billing/admin/access"),
    enabled,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useApproveUpgradeRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: UpgradeRequestInput & {
      id: string;
      payment_reference?: string;
      admin_note?: string;
    }) =>
      apiClient<UpgradeRequest>(
        `/api/billing/admin/upgrade-requests/${id}/approve`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: upgradeRequestKeys.all,
      });
      void queryClient.invalidateQueries({
        queryKey: subscriptionKeys.all,
      });
    },
  });
}

export function useMarkUpgradeRequestAwaitingPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, admin_note }: { id: string; admin_note: string }) =>
      apiClient<UpgradeRequest>(
        `/api/billing/admin/upgrade-requests/${id}/awaiting-payment`,
        {
          method: "POST",
          body: JSON.stringify({ admin_note }),
        },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: upgradeRequestKeys.all,
      });
    },
  });
}

export function useRejectUpgradeRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, admin_note }: { id: string; admin_note: string }) =>
      apiClient<UpgradeRequest>(
        `/api/billing/admin/upgrade-requests/${id}/reject`,
        {
          method: "POST",
          body: JSON.stringify({ admin_note }),
        },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: upgradeRequestKeys.all,
      });
    },
  });
}
