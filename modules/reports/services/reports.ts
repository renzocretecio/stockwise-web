import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type {
    InventoryReport,
    LowStockReport,
    OperationalMetrics,
    ProfitReport,
    PurchaseReport,
    ReportDateRange,
    ReportPeriod,
    SalesReport,
    StockMovementReport,
} from "@/modules/reports/types";

export const reportKeys = {
    all: ["reports"] as const,
    sales: (days: number) => [...reportKeys.all, "sales", days] as const,
    salesRange: (range: ReportDateRange) =>
        [...reportKeys.all, "sales", range.startDate, range.endDate] as const,
    operations: (range: ReportDateRange) =>
        [
            ...reportKeys.all,
            "operations",
            range.startDate,
            range.endDate,
        ] as const,
    purchases: (days: number) =>
        [...reportKeys.all, "purchases", days] as const,
    purchasesRange: (range: ReportDateRange) =>
        [
            ...reportKeys.all,
            "purchases",
            range.startDate,
            range.endDate,
        ] as const,
    inventory: () => [...reportKeys.all, "inventory"] as const,
    profit: (days: number) => [...reportKeys.all, "profit", days] as const,
    profitRange: (range: ReportDateRange) =>
        [
            ...reportKeys.all,
            "profit",
            range.startDate,
            range.endDate,
        ] as const,
    lowStock: () => [...reportKeys.all, "low-stock"] as const,
    movements: (days: number) =>
        [...reportKeys.all, "movements", days] as const,
    movementsRange: (range: ReportDateRange) =>
        [
            ...reportKeys.all,
            "movements",
            range.startDate,
            range.endDate,
        ] as const,
};

const usePeriodQuery = <T>(
    path: string,
    key: readonly unknown[],
    days: ReportPeriod,
) =>
    useQuery({
        queryKey: key,
        queryFn: () => apiClient<T>(`/api/reports/${path}?days=${days}`),
        staleTime: 10 * 60 * 1000,
        refetchOnMount: false
    });

const useDateRangeQuery = <T>(
    path: string,
    key: readonly unknown[],
    range: ReportDateRange,
) => {
    const query = new URLSearchParams({
        start_date: range.startDate,
        end_date: range.endDate,
    });

    return useQuery({
        queryKey: key,
        queryFn: () =>
            apiClient<T>(`/api/reports/${path}?${query.toString()}`),
        staleTime: 60_000,
    });
};

export const useSalesReport = (days: ReportPeriod) =>
    usePeriodQuery<SalesReport>("sales", reportKeys.sales(days), days);

export const useSalesReportByDateRange = (range: ReportDateRange) => {
    return useDateRangeQuery<SalesReport>(
        "sales",
        reportKeys.salesRange(range),
        range,
    );
};

export const useOperationalMetrics = (range: ReportDateRange) => {
    const query = new URLSearchParams({
        start_date: range.startDate,
        end_date: range.endDate,
    });

    return useQuery({
        queryKey: reportKeys.operations(range),
        queryFn: () =>
            apiClient<OperationalMetrics>(
                `/api/reports/operations?${query.toString()}`,
            ),
        staleTime: 60_000,
    });
};

export const usePurchaseReport = (days: ReportPeriod) =>
    usePeriodQuery<PurchaseReport>(
        "purchases",
        reportKeys.purchases(days),
        days,
    );

export const usePurchaseReportByDateRange = (range: ReportDateRange) =>
    useDateRangeQuery<PurchaseReport>(
        "purchases",
        reportKeys.purchasesRange(range),
        range,
    );

export const useProfitReport = (days: ReportPeriod) =>
    usePeriodQuery<ProfitReport>("profit", reportKeys.profit(days), days);

export const useProfitReportByDateRange = (range: ReportDateRange) =>
    useDateRangeQuery<ProfitReport>(
        "profit",
        reportKeys.profitRange(range),
        range,
    );

export const useStockMovementReport = (days: ReportPeriod) =>
    usePeriodQuery<StockMovementReport>(
        "stock-movements",
        reportKeys.movements(days),
        days,
    );

export const useStockMovementReportByDateRange = (
    range: ReportDateRange,
) =>
    useDateRangeQuery<StockMovementReport>(
        "stock-movements",
        reportKeys.movementsRange(range),
        range,
    );

export const useInventoryReport = () =>
    useQuery({
        queryKey: reportKeys.inventory(),
        queryFn: () => apiClient<InventoryReport>("/api/reports/inventory"),
        staleTime: 60_000,
        refetchOnMount: false
    });

export const useLowStockReport = () =>
    useQuery({
        queryKey: reportKeys.lowStock(),
        queryFn: () => apiClient<LowStockReport>("/api/reports/low-stock"),
        staleTime: 60_000,
        refetchOnMount: false
    });
