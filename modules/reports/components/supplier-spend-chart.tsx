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
import type { PurchaseReport } from "@/modules/reports/types";

type Supplier = PurchaseReport["by_supplier"][number];

const colors = [reportPrimary, reportSecondary, reportTertiary];

export function SupplierSpendChart({ suppliers }: { suppliers: Supplier[] }) {
    const data = [...suppliers]
        .sort((left, right) => right.total_spent - left.total_spent)
        .slice(0, 5);

    if (!data.length) {
        return (
            <EmptyReportChart>
                No received supplier purchases in this period.
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
            xDataKey="supplier_name"
        >
            <Grid horizontal={false} strokeDasharray="3,5" vertical />
            <BarValueAxis formatValue={formatCompactChartCurrency} />
            <Bar
                dataKey="total_spent"
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
                        label: "Total spent",
                        value: currency.format(
                            toChartNumber(point.total_spent),
                        ),
                    },
                    {
                        color: reportTertiary,
                        label: "Received orders",
                        value: toChartNumber(
                            point.purchases_count,
                        ).toLocaleString("en-PH"),
                    },
                ]}
            />
        </BarChart>
    );
}
