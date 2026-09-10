"use client";

import { Bar } from "@/components/charts/bar";
import { BarChart } from "@/components/charts/bar-chart";
import { BarValueAxis } from "@/components/charts/bar-value-axis";
import { BarYAxis } from "@/components/charts/bar-y-axis";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from
    "@/components/charts/tooltip/chart-tooltip";
import { formatCurrency } from "@/lib/currency";
import {
    EmptyReportChart,
    formatCompactChartCurrency,
    horizontalReportChartMargin,
    reportPrimary,
    reportSecondary,
    reportTertiary,
    toChartNumber,
} from "@/modules/reports/components/report-chart-utils";
import type { InventoryReport } from "@/modules/reports/types";

type Category = InventoryReport["by_category"][number];

const colors = [reportPrimary, reportSecondary, reportTertiary];

export function InventoryCategoryValueChart({
    categories,
}: {
    categories: Category[];
}) {
    const data = [...categories]
        .sort((left, right) => right.stock_value - left.stock_value)
        .slice(0, 6);

    if (!data.length) {
        return (
            <EmptyReportChart>
                No inventory value by category yet.
            </EmptyReportChart>
        );
    }

    return (
        <BarChart
            aspectRatio="auto"
            barGap={0.32}
            className="h-[280px]"
            data={data}
            margin={horizontalReportChartMargin}
            orientation="horizontal"
            xDataKey="category"
        >
            <Grid horizontal={false} strokeDasharray="3,5" vertical />
            <BarValueAxis formatValue={formatCompactChartCurrency} />
            <Bar
                dataKey="stock_value"
                fill={(_point, index) => colors[index % colors.length]}
                lineCap={6}
                stroke={reportPrimary}
            />
            <BarYAxis labelWidth={108} />
            <ChartTooltip
                showDatePill={false}
                rows={(point) => [
                    {
                        color: reportPrimary,
                        label: "Stock value",
                        value: formatCurrency(
                            toChartNumber(point.stock_value),
                        ),
                    },
                    {
                        color: reportSecondary,
                        label: "Products",
                        value: toChartNumber(
                            point.product_count,
                        ).toLocaleString("en-PH"),
                    },
                    {
                        color: reportTertiary,
                        label: "Units on hand",
                        value: toChartNumber(
                            point.total_units,
                        ).toLocaleString("en-PH"),
                    },
                ]}
            />
        </BarChart>
    );
}
