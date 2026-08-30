import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { IntelligenceResponse } from "@/modules/intelligence/types";

export const useAskIntelligence = () =>
  useMutation({
    mutationFn: (question: string) =>
      apiClient<IntelligenceResponse>("/api/intelligence/ask", {
        method: "POST",
        body: JSON.stringify({ question }),
      }),
  });

export const useForecastExplanation = () =>
  useMutation({
    mutationFn: (productId: string) =>
      apiClient<IntelligenceResponse>(
        `/api/intelligence/forecasts/${productId}/explanation`,
      ),
  });

export const useAnomalyExplanation = () =>
  useMutation({
    mutationFn: (anomalyId: string) =>
      apiClient<IntelligenceResponse>(
        `/api/intelligence/anomalies/${anomalyId}/explanation`,
      ),
  });
