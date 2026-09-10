"use client";

import { Bar } from "@/components/charts/bar";
import { BarChart } from "@/components/charts/bar-chart";
import { BarValueAxis } from "@/components/charts/bar-value-axis";
import { BarYAxis } from "@/components/charts/bar-y-axis";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from
    "@/components/charts/tooltip/chart-tooltip";
import { currency } from "@/lib/currency";
import {
    EmptyReportChart,
    formatCompactChartCurrency,
    horizontalReportChartMargin,
    reportPrimary,
    reportSecondary,
    reportTertiary,
    toChartNumber,
} from "@/modules/reports/components/report-chart-utils";
import type { ProfitReport } from "@/modules/reports/types";

type Product = ProfitReport["by_product"][number];

const positiveColors = [reportPrimary, reportSecondary, reportTertiary];

export function ProductProfitChart({ products }: { products: Product[] }) {
    const data = [...products]
        .sort((left, right) => right.profit - left.profit)
        .slice(0, 5);

    if (!data.length) {
        return (
            <EmptyReportChart>
                No product profit data in this period.
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
            <BarValueAxis formatValue={formatCompactChartCurrency} />
            <Bar
                dataKey="profit"
                fill={(point, index) =>
                    toChartNumber(point.profit) < 0
                        ? "var(--destructive)"
                        : positiveColors[index % positiveColors.length]
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
                            toChartNumber(point.profit) < 0
                                ? "var(--destructive)"
                                : reportPrimary,
                        label: "Gross profit",
                        value: currency.format(toChartNumber(point.profit)),
                    },
                    {
                        color: reportTertiary,
                        label: "Margin",
                        value: `${toChartNumber(
                            point.margin_percent,
                        ).toFixed(1)}%`,
                    },
                ]}
            />
        </BarChart>
    );
}
