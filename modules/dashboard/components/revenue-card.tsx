"use client";

import { MetricTrendCard } from "./metric-trend-card";
import type { ReportDateRange, SalesReport } from "@/modules/reports/types";

export function RevenueCard({
    dateRange,
    report,
    className,
}: {
    dateRange: ReportDateRange;
    report: SalesReport;
    className?: string;
}) {
    const metrics = dailySalesMetrics(report, dateRange);
    const hasSales = report.summary.total_sales > 0;

    return (
        <MetricTrendCard
            label="Revenue"
            value={report.summary.total_revenue}
            data={
                hasSales
                    ? metrics.map((point) => ({
                          date: point.date,
                          value: point.revenue,
                      }))
                    : []
            }
            secondaryData={
                hasSales
                    ? metrics.map((point) => ({
                          date: point.date,
                          value: point.profit,
                      }))
                    : []
            }
            secondaryLabel="Gross profit"
            dateRange={dateRange}
            description="Total for selected period"
            href="/reports/sales"
            linkLabel="Sales report"
            emptyMessage="No sales in this period yet."
            className={className}
        />
    );
}

// Zero-fill sales days, but leave margin undefined when revenue is zero.
export function dailySalesMetrics(report: SalesReport, range: ReportDateRange) {
    const dayMs = 86_400_000;
    const start = Date.parse(range.startDate + "T00:00:00Z");
    const end = Date.parse(range.endDate + "T00:00:00Z");
    const days = Math.floor((end - start) / dayMs) + 1;
    const byDate = new Map(report.by_day.map((point) => [point.date, point]));

    return Array.from({ length: Math.max(0, days) }, (_, index) => {
        const date = new Date(start + index * dayMs).toISOString().slice(0, 10);
        const point = byDate.get(date);
        const revenue = point?.revenue ?? 0;
        const profit = point?.profit ?? 0;

        return {
            date,
            revenue,
            profit,
            margin: revenue > 0 ? (profit / revenue) * 100 : undefined,
        };
    });
}
