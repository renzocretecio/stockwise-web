"use client";

import { Bar } from "@/components/charts/bar";
import { BarChart } from "@/components/charts/bar-chart";
import { BarValueAxis } from "@/components/charts/bar-value-axis";
import { BarYAxis } from "@/components/charts/bar-y-axis";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from
    "@/components/charts/tooltip/chart-tooltip";
import {
    EmptyReportChart,
    formatWholeChartNumber,
    horizontalReportChartMargin,
    reportPrimary,
    reportSecondary,
    toChartNumber,
} from "@/modules/reports/components/report-chart-utils";
import type { LowStockReport } from "@/modules/reports/types";

type StockItem = LowStockReport["items"][number];

export function StockGapChart({ items }: { items: StockItem[] }) {
    const data = items
        .map((item) => ({
            ...item,
            stock_gap: Math.max(
                0,
                Math.max(item.reorder_point, item.safety_stock) - item.quantity,
            ),
        }))
        .sort((left, right) => right.stock_gap - left.stock_gap)
        .slice(0, 5);

    if (!data.length) {
        return (
            <EmptyReportChart>
                No products currently require replenishment.
            </EmptyReportChart>
        );
    }

    return (
        <BarChart
            aspectRatio="auto"
            barGap={0.34}
            className="h-[280px]"
            data={data}
            margin={horizontalReportChartMargin}
            orientation="horizontal"
            xDataKey="product_name"
        >
            <Grid horizontal={false} strokeDasharray="3,5" vertical />
            <BarValueAxis formatValue={formatWholeChartNumber} />
            <Bar
                dataKey="stock_gap"
                fill={(point) =>
                    point.status === "out_of_stock"
                        ? reportSecondary
                        : reportPrimary
                }
                lineCap={6}
                stroke={reportPrimary}
            />
            <BarYAxis labelWidth={108} />
            <ChartTooltip
                showDatePill={false}
                rows={(point) => [
                    {
                        color:
                            point.status === "out_of_stock"
                                ? reportSecondary
                                : reportPrimary,
                        label: "Units below target",
                        value: formatWholeChartNumber(
                            toChartNumber(point.stock_gap),
                        ),
                    },
                    {
                        color: "var(--chart-3)",
                        label: "On hand",
                        value: formatWholeChartNumber(
                            toChartNumber(point.quantity),
                        ),
                    },
                ]}
            />
        </BarChart>
    );
}
