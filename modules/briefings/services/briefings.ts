import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { useSession } from "@/modules/auth/services/session";
import { subscriptionKeys } from
    "@/modules/billing/services/billing";
import type { BriefingEnvelope } from "@/modules/briefings/types";

export const briefingKeys = {
    all: ["briefings"] as const,
    today: (businessId?: string) =>
        ["briefings", businessId, "today"] as const,
};

export const useTodayBriefing = () => {
    const session = useSession();
    const businessId = session.data?.active_business?.id;
    const briefing = useQuery({
        queryKey: briefingKeys.today(businessId),
        queryFn: () =>
            apiClient<BriefingEnvelope>("/api/briefings/today"),
        enabled: Boolean(businessId),
        staleTime: 60_000,
        refetchOnMount: false,
    });

    return {
        ...briefing,
        error: session.error ?? briefing.error,
        isLoading: session.isLoading || briefing.isLoading,
    };
};

export const useGenerateBriefing = () => {
    const client = useQueryClient();
    const session = useSession();
    const businessId = session.data?.active_business?.id;

    return useMutation({
        mutationFn: (force: boolean) =>
            apiClient<BriefingEnvelope>(
                `/api/briefings/generate?force=${force}`,
                { method: "POST" },
            ),
        onSuccess: (data) => {
            client.setQueryData(briefingKeys.today(businessId), data);
        },
        onSettled: () => {
            void client.invalidateQueries({
                queryKey: subscriptionKeys.all,
            });
        },
    });
};

export const useRecommendationAction = () => {
    const client = useQueryClient();
    const session = useSession();
    const businessId = session.data?.active_business?.id;

    return useMutation({
        mutationFn: ({
            id,
            action,
        }: {
            id: string;
            action: "dismiss" | "resolve";
        }) =>
            apiClient(
                `/api/briefings/recommendations/${id}/${action}`,
                { method: "POST" },
            ),
        onSuccess: () => {
            void client.invalidateQueries({
                queryKey: briefingKeys.today(businessId),
            });
        },
    });
};
