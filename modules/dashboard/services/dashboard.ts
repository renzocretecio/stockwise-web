import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { DashboardData } from "@/modules/dashboard/types";

export const useDashboard = () => useQuery({ queryKey: ["dashboard"], queryFn: () => apiClient<DashboardData>("/api/dashboard"), staleTime: 60_000 });
