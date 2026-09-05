import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  DashboardData,
  DashboardTrendsData,
} from "@/modules/dashboard/types";
import type { ReportDateRange } from "@/modules/reports/types";

export const useDashboard = (stockDaysThreshold = 7) => useQuery({
  queryKey: ["dashboard", stockDaysThreshold],
  queryFn: () => apiClient<DashboardData>(
    "/api/dashboard?stock_days_threshold=" + stockDaysThreshold,
  ),
  staleTime: 60_000,
});

export const useDashboardTrends = (range: ReportDateRange) => {
  const query = new URLSearchParams({
    start_date: range.startDate,
    end_date: range.endDate,
  });

  return useQuery({
    queryKey: [
      "dashboard",
      "trends",
      range.startDate,
      range.endDate,
    ],
    queryFn: () => apiClient<DashboardTrendsData>(
      `/api/dashboard/trends?${query.toString()}`,
    ),
    staleTime: 60_000,
  });
};
