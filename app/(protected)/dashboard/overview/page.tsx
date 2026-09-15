"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { DateRangePicker, type DateRange } from "@/components/DateRangePicker";
import { DashboardAnalytics } from "@/modules/dashboard/components/dashboard-analytics";
import { BusinessActivity } from "@/modules/dashboard/components/business-activity";
import { SuggestedActions } from "@/modules/dashboard/components/inventory-efficiency";
import { InventoryRiskPanel } from "@/modules/dashboard/components/inventory-risk-panel";
import { DashboardSalesSummary } from "@/modules/dashboard/components/dashboard-sales-summary";
import { useDashboard } from "@/modules/dashboard/services/dashboard";
import {
    briefingKeys,
    useTodayBriefing,
} from "@/modules/briefings/services/briefings";
import { Button } from "@/components/ui/button";
import { DashboardExportButton } from "@/modules/dashboard/components/dashboard-export-button";
import { useSalesReportByDateRange } from "@/modules/reports/services/reports";
import type { ReportDateRange } from "@/modules/reports/types";
const tile =
    "min-w-0 overflow-hidden rounded-2xl border " +
    "border-border/70 bg-card shadow-sm";

const toDateValue = (date: Date) =>
    [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("-");

const initialSalesRange = (): ReportDateRange => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 29);

    return {
        startDate: toDateValue(start),
        endDate: toDateValue(end),
    };
};

export default function DashboardOverviewPage() {
    const [salesRange, setSalesRange] = useState(initialSalesRange);
    const queryClient = useQueryClient();

    const changeSalesRange = (range: DateRange) => {
        if (!range.from || !range.to) return;

        setSalesRange({
            startDate: toDateValue(range.from),
            endDate: toDateValue(range.to),
        });
    };

    const refreshDashboard = () => {
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["reports"] });
        queryClient.invalidateQueries({ queryKey: briefingKeys.all });
    };

    const sales = useSalesReportByDateRange(salesRange);
    const dashboard = useDashboard();
    const briefing = useTodayBriefing();
    const salesProps = {
        report: sales.data,
        isLoading: sales.isLoading,
        isPaused: sales.isPaused,
        isError: Boolean(sales.error),
    };
    const inventory = dashboard.data?.kpis.inventory_value;
    const inventoryDescription =
        inventory !== undefined
            ? "Current stock value"
            : dashboard.isPaused
              ? "Current value not saved offline"
              : dashboard.error
                ? "Unable to load current value"
                : "Loading current value…";

    return (
        <div className="pb-12">
            <div
                className={
                    "flex flex-col gap-4 px-1 py-2 lg:flex-row " +
                    "lg:items-end lg:justify-between"
                }
            >
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Business overview
                    </h1>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Monitor sales performance and your current inventory
                        health.
                    </p>
                </div>
                <div
                    className="flex min-w-0 flex-wrap items-center gap-2"
                    data-no-print="true"
                >
                    <DashboardExportButton
                        dateRange={salesRange}
                        sales={sales.data}
                        dashboard={dashboard.data}
                    />
                    <DateRangePicker
                        className="max-w-full"
                        maxDays={365}
                        onChange={changeSalesRange}
                        value={{
                            from: new Date(`${salesRange.startDate}T12:00:00`),
                            to: new Date(`${salesRange.endDate}T12:00:00`),
                        }}
                    />
                    <Button
                        aria-label="Refresh dashboard"
                        onClick={refreshDashboard}
                        size="icon"
                        type="button"
                        variant="outline"
                    >
                        <RefreshCw className="size-4" />
                    </Button>
                </div>
            </div>

            <div className="mb-4">
                <DashboardSalesSummary
                    {...salesProps}
                    inventory={inventory}
                    inventoryDescription={inventoryDescription}
                    briefing={briefing.data?.briefing}
                    briefingLoading={briefing.isLoading}
                />
            </div>

            <div className="grid min-w-0 items-stretch gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] mb-4">
                <div className={tile}>
                    <DashboardAnalytics
                        dateRange={salesRange}
                        {...salesProps}
                    />
                </div>
                <div className={tile}>
                    <InventoryRiskPanel compact />
                </div>
            </div>

            <div className="grid min-w-0 items-stretch gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
                <div className={tile}>
                    <BusinessActivity />
                </div>
                <div className={tile + " self-start"}>
                    <SuggestedActions compact />
                </div>
            </div>
        </div>
    );
}
