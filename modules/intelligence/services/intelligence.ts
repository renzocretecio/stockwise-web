import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useSession } from "@/modules/auth/services/session";
import type { IntelligenceResponse } from "@/modules/intelligence/types";
import type {
  ReportDateRange,
  ReportPeriod,
} from "@/modules/reports/types";
import { subscriptionKeys } from
  "@/modules/billing/services/billing";

export const useForecastExplanation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) =>
      apiClient<IntelligenceResponse>(
        `/api/intelligence/forecasts/${productId}/explanation`,
      ),
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: subscriptionKeys.all,
      });
    },
  });
};

export const useAnomalyExplanation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (anomalyId: string) =>
      apiClient<IntelligenceResponse>(
        `/api/intelligence/anomalies/${anomalyId}/explanation`,
      ),
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: subscriptionKeys.all,
      });
    },
  });
};

export type ReportSummaryType =
  | "sales"
  | "purchases"
  | "inventory"
  | "profit"
  | "low_stock"
  | "movements";

export const intelligenceKeys = {
  reportSummary: (
    businessId: string | undefined,
    report: ReportSummaryType,
    days: ReportPeriod,
    dateRange?: ReportDateRange,
  ) => [
    "intelligence",
    "report-summary",
    businessId,
    report,
    dateRange?.startDate ?? `last-${days}`,
    dateRange?.endDate ?? "days",
  ] as const,
};

export const useStoredReportSummary = (
  report: ReportSummaryType,
  days?: ReportPeriod,
  dateRange?: ReportDateRange,
) => {
  const session = useSession();
  const businessId = session.data?.active_business?.id;
  const normalizedDays = days ?? 30;

  return useQuery<IntelligenceResponse | undefined>({
    queryKey: intelligenceKeys.reportSummary(
      businessId,
      report,
      normalizedDays,
      dateRange,
    ),
    queryFn: async () => undefined,
    enabled: false,
    staleTime: Infinity,
  });
};

export const useReportSummary = () => {
  const queryClient = useQueryClient();
  const session = useSession();
  const businessId = session.data?.active_business?.id;

  return useMutation({
    mutationFn: ({
      report,
      days = 30,
      dateRange,
    }: {
      report: ReportSummaryType;
      days?: ReportPeriod;
      dateRange?: ReportDateRange;
    }) =>
      apiClient<IntelligenceResponse>("/api/intelligence/reports/summary", {
        method: "POST",
        body: JSON.stringify({
          report,
          days,
          start_date: dateRange?.startDate,
          end_date: dateRange?.endDate,
        }),
      }),
    onSuccess: (response, variables) => {
      if (businessId) {
        queryClient.setQueryData(
          intelligenceKeys.reportSummary(
            businessId,
            variables.report,
            variables.days ?? 30,
            variables.dateRange,
          ),
          response,
        );
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: subscriptionKeys.all,
      });
    },
  });
};
