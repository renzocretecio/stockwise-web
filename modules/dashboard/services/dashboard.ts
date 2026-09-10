import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  DashboardData,
  DashboardTrendsData,
} from "@/modules/dashboard/types";
import type { ReportDateRange } from "@/modules/reports/types";
import { useSession } from "@/modules/auth/services/session";

export const useDashboard = (stockDaysThreshold = 7) => {
  const session = useSession();
  const businessId = session.data?.active_business?.id;
  const dashboard = useQuery({
    queryKey: ["dashboard", businessId, stockDaysThreshold],
    queryFn: () => apiClient<DashboardData>(
      "/api/dashboard?stock_days_threshold=" + stockDaysThreshold,
    ),
    enabled: Boolean(businessId),
    staleTime: 10 * 60 * 1000,
    refetchOnMount: false,
  });

  return {
    ...dashboard,
    error: session.error ?? dashboard.error,
    isLoading: session.isLoading || dashboard.isLoading,
  };
};

export const useDashboardTrends = (range: ReportDateRange) => {
  const session = useSession();
  const businessId = session.data?.active_business?.id;
  const query = new URLSearchParams({
    start_date: range.startDate,
    end_date: range.endDate,
  });

  const trends = useQuery({
    queryKey: [
      "dashboard",
      businessId,
      "trends",
      range.startDate,
      range.endDate,
    ],
    queryFn: () => apiClient<DashboardTrendsData>(
      `/api/dashboard/trends?${query.toString()}`,
    ),
    enabled: Boolean(businessId),
    staleTime: 10 * 60 * 1000,
    refetchOnMount: false,
  });

  return {
    ...trends,
    error: session.error ?? trends.error,
    isLoading: session.isLoading || trends.isLoading,
  };
};

export const auditDashboardPdfExport = (range: ReportDateRange) =>
  apiClient<{ success: boolean }>(
    "/api/reports/dashboard/export-audit",
    {
      body: JSON.stringify({
        end_date: range.endDate,
        start_date: range.startDate,
      }),
      method: "POST",
    },
  );
