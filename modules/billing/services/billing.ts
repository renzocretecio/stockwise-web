import { useMutation, useQuery, useQueryClient } from
    "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { useSession } from "@/modules/auth/services/session";
import type { SubscriptionSummary } from "@/modules/billing/types";

export const subscriptionKeys = {
    all: ["billing", "subscription"] as const,
};

export function useSubscription() {
    const auth = useSession();
    const businessId = auth.data?.active_business?.id;

    return useQuery({
        queryKey: [...subscriptionKeys.all, businessId],
        queryFn: () =>
            apiClient<SubscriptionSummary>("/api/billing/subscription"),
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
        enabled:
            subscription.data?.features.offline_sync ?? planAllowsOffline,
        resolved: Boolean(
            subscription.data || auth.data?.active_business,
        ),
    };
}

export function useStartProTrial() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () =>
            apiClient<SubscriptionSummary>(
                "/api/billing/subscription/trial",
                { method: "POST" },
            ),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: subscriptionKeys.all,
            });
        },
    });
}
