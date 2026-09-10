"use client";

import { ComposedChart } from "@/components/charts/composed-chart";
import { Grid } from "@/components/charts/grid";
import { Line } from "@/components/charts/line";
import { SeriesBar } from "@/components/charts/series-bar";
import { ChartTooltip } from
    "@/components/charts/tooltip/chart-tooltip";
import { XAxis } from "@/components/charts/x-axis";
import { YAxis } from "@/components/charts/y-axis";
import { currency } from "@/lib/currency";
import {
    formatCompactChartCurrency,
    formatWholeChartNumber,
    reportChartMargin,
    ReportChartLegend,
    reportPrimary,
    reportSecondary,
    toChartNumber,
} from "@/modules/reports/components/report-chart-utils";
import type {
    PurchaseReport,
    ReportDateRange,
} from "@/modules/reports/types";

type DailyPurchase = PurchaseReport["by_day"][number];

function fillDates(points: DailyPurchase[], dateRange: ReportDateRange) {
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
            spent: point?.spent ?? 0,
            purchases_count: point?.purchases_count ?? 0,
        };
    });
}

export function PurchaseSpendChart({
    points,
    dateRange,
}: {
    points: DailyPurchase[];
    dateRange: ReportDateRange;
}) {
    const data = fillDates(points, dateRange);
    const margin = { ...reportChartMargin, right: 52 };

    return (
        <div className="min-w-0">
            <ReportChartLegend
                items={[
                    { color: reportPrimary, label: "Purchasing spend" },
                    { color: reportSecondary, label: "Received orders" },
                ]}
            />
            <ComposedChart
                aspectRatio="auto"
                className="h-[280px]"
                data={data}
                margin={margin}
                maxBarSize={24}
            >
                <Grid horizontal strokeDasharray="3,5" />
                <YAxis formatValue={formatCompactChartCurrency} />
                <YAxis
                    formatLargeNumbers={false}
                    formatValue={formatWholeChartNumber}
                    orientation="right"
                    yAxisId="orders"
                />
                <SeriesBar dataKey="spent" fill={reportPrimary} radius={4} />
                <Line
                    dataKey="purchases_count"
                    fadeEdges={false}
                    stroke={reportSecondary}
                    strokeWidth={2.5}
                    yAxisId="orders"
                />
                <XAxis numTicks={5} />
                <ChartTooltip
                    indicatorDasharray="3,5"
                    rows={(point) => [
                        {
                            color: reportPrimary,
                            label: "Purchasing spend",
                            value: currency.format(
                                toChartNumber(point.spent),
                            ),
                        },
                        {
                            color: reportSecondary,
                            label: "Received orders",
                            value: formatWholeChartNumber(
                                toChartNumber(point.purchases_count),
                            ),
                        },
                    ]}
                />
            </ComposedChart>
        </div>
    );
}
