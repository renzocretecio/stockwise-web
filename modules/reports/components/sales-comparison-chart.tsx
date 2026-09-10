"use client";

import { Bar } from "@/components/charts/bar";
import { BarChart } from "@/components/charts/bar-chart";
import { BarXAxis } from "@/components/charts/bar-x-axis";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from
    "@/components/charts/tooltip/chart-tooltip";
import { YAxis } from "@/components/charts/y-axis";
import { currency } from "@/lib/currency";
import {
    formatCompactChartCurrency,
    reportChartMargin,
    ReportChartLegend,
    reportPrimary,
    reportSecondary,
    toChartNumber,
} from "@/modules/reports/components/report-chart-utils";
import type {
    ReportDateRange,
    SalesReport,
} from "@/modules/reports/types";

type DailySale = SalesReport["by_day"][number];

function fillDates(points: DailySale[], dateRange: ReportDateRange) {
    const values = new Map(points.map((point) => [point.date, point]));
    const start = new Date(`${dateRange.startDate}T00:00:00Z`);
    const end = new Date(`${dateRange.endDate}T00:00:00Z`);
    const dayCount =
        Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;

    return Array.from({ length: dayCount }, (_, index) => {
        const date = new Date(start);
        date.setUTCDate(date.getUTCDate() + index);
        const key = date.toISOString().slice(0, 10);
        const point = values.get(key);

        return {
            date: new Date(`${key}T12:00:00`),
            revenue: point?.revenue ?? 0,
            profit: point?.profit ?? 0,
            sales_count: point?.sales_count ?? 0,
        };
    });
}

export function SalesComparisonChart({
    points,
    dateRange,
}: {
    points: DailySale[];
    dateRange: ReportDateRange;
}) {
    const data = fillDates(points, dateRange);

    return (
        <div className="min-w-0">
            <div className="mb-4">
                <h2 className="font-semibold">Daily sales comparison</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                    Revenue and gross profit for each day.
                </p>
            </div>
            <ReportChartLegend
                items={[
                    { color: reportPrimary, label: "Revenue" },
                    { color: reportSecondary, label: "Gross profit" },
                ]}
            />
            <BarChart
                aspectRatio="auto"
                barGap={0.28}
                className="h-[300px]"
                data={data}
                margin={reportChartMargin}
                xDataKey="date"
            >
                <Grid horizontal strokeDasharray="3,5" />
                <YAxis formatValue={formatCompactChartCurrency} />
                <Bar
                    dataKey="revenue"
                    fill={reportPrimary}
                    groupGap={3}
                    lineCap={4}
                />
                <Bar
                    dataKey="profit"
                    fill={reportSecondary}
                    groupGap={3}
                    lineCap={4}
                />
                <BarXAxis maxLabels={6} />
                <ChartTooltip
                    indicatorDasharray="3,5"
                    rows={(point) => [
                        {
                            color: reportPrimary,
                            label: "Revenue",
                            value: currency.format(
                                toChartNumber(point.revenue),
                            ),
                        },
                        {
                            color: reportSecondary,
                            label: "Gross profit",
                            value: currency.format(
                                toChartNumber(point.profit),
                            ),
                        },
                    ]}
                />
            </BarChart>
        </div>
    );
}
