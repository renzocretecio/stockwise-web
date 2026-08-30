import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { BriefingEnvelope } from "@/modules/briefings/types";

export const briefingKeys = { today: ["briefings", "today"] as const };

export const useTodayBriefing = () => useQuery({
    queryKey: briefingKeys.today,
    queryFn: () => apiClient<BriefingEnvelope>("/api/briefings/today"),
    staleTime: 60_000,
});

export const useGenerateBriefing = () => {
    const client = useQueryClient();
    return useMutation({
        mutationFn: (force: boolean) => apiClient<BriefingEnvelope>(`/api/briefings/generate?force=${force}`, { method: "POST" }),
        onSuccess: (data) => {
            client.setQueryData(briefingKeys.today, data);
        },
    });
};

export const useRecommendationAction = () => {
    const client = useQueryClient();
    return useMutation({
        mutationFn: ({ id, action }: { id: string; action: "dismiss" | "resolve" }) =>
            apiClient(`/api/briefings/recommendations/${id}/${action}`, { method: "POST" }),
        onSuccess: () => {
            void client.invalidateQueries({ queryKey: briefingKeys.today });
        },
    });
};
