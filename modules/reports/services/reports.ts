import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { InventoryReport, LowStockReport, ProfitReport, PurchaseReport, ReportPeriod, SalesReport, StockMovementReport } from "@/modules/reports/types";

export const reportKeys = {
    all: ["reports"] as const,
    sales: (days: number) => [...reportKeys.all, "sales", days] as const,
    purchases: (days: number) => [...reportKeys.all, "purchases", days] as const,
    inventory: () => [...reportKeys.all, "inventory"] as const,
    profit: (days: number) => [...reportKeys.all, "profit", days] as const,
    lowStock: () => [...reportKeys.all, "low-stock"] as const,
    movements: (days: number) => [...reportKeys.all, "movements", days] as const,
};

const usePeriodQuery = <T,>(path: string, key: readonly unknown[], days: ReportPeriod) => useQuery({
    queryKey: key,
    queryFn: () => apiClient<T>(`/api/reports/${path}?days=${days}`),
    staleTime: 60_000,
});

export const useSalesReport = (days: ReportPeriod) => usePeriodQuery<SalesReport>("sales", reportKeys.sales(days), days);
export const usePurchaseReport = (days: ReportPeriod) => usePeriodQuery<PurchaseReport>("purchases", reportKeys.purchases(days), days);
export const useProfitReport = (days: ReportPeriod) => usePeriodQuery<ProfitReport>("profit", reportKeys.profit(days), days);
export const useStockMovementReport = (days: ReportPeriod) => usePeriodQuery<StockMovementReport>("stock-movements", reportKeys.movements(days), days);
export const useInventoryReport = () => useQuery({ queryKey: reportKeys.inventory(), queryFn: () => apiClient<InventoryReport>("/api/reports/inventory"), staleTime: 60_000 });
export const useLowStockReport = () => useQuery({ queryKey: reportKeys.lowStock(), queryFn: () => apiClient<LowStockReport>("/api/reports/low-stock"), staleTime: 60_000 });
