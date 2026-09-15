"use client";

import { SalesProfitChart } from "@/modules/dashboard/components/sales-profit-chart";
import type { ReportDateRange } from "@/modules/reports/types";
import type { SalesReportViewProps } from "./dashboard-sales-summary";

const tile =
    "min-w-0 overflow-hidden rounded-2xl border " +
    "border-border/70 bg-card shadow-sm";

export function DashboardAnalytics({
    dateRange,
    report,
    isPaused,
    isError,
}: SalesReportViewProps & { dateRange: ReportDateRange }) {
    if (!report && isPaused) {
        return (
            <section className="p-5 text-sm text-muted-foreground">
                Revenue and gross-profit data isn’t saved for this period yet.
                Reconnect to load it.
            </section>
        );
    }

    if (isError && !report) {
        return (
            <section className="border-y p-5 text-sm text-destructive">
                Unable to load revenue and gross-profit data. Please try again.
            </section>
        );
    }

    if (!report) {
        return <DashboardAnalyticsLoading />;
    }

    return (
        <section
            className="w-full space-y-4"
            aria-label="Sales and inventory overview"
        >
            <div className="flex min-w-0 flex-col">
                <div className="min-w-0 flex-1 px-1 pb-3 pt-4 sm:px-3">
                    <SalesProfitChart
                        className="h-[280px] sm:h-[340px]"
                        dateRange={dateRange}
                        points={report.by_day}
                    />
                </div>
            </div>
        </section>
    );
}

function DashboardAnalyticsLoading() {
    return (
        <section
            className={tile + " p-5"}
            aria-label="Loading analytics"
            aria-busy
        >
            <div className="h-[280px] animate-pulse rounded-2xl bg-muted sm:h-[340px]" />
        </section>
    );
}
