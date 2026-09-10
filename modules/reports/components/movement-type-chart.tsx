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
    formatSignedChartNumber,
    horizontalReportChartMargin,
    reportPrimary,
    reportSecondary,
    reportTertiary,
    toChartNumber,
} from "@/modules/reports/components/report-chart-utils";
import type { StockMovementReport } from "@/modules/reports/types";

type Movement = StockMovementReport["by_type"][number];

const movementLabel = (value: string) =>
    value
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

export function MovementTypeChart({ movements }: { movements: Movement[] }) {
    const data = movements.map((movement) => ({
        ...movement,
        movement_label: movementLabel(movement.movement_type),
    }));

    if (!data.length) {
        return (
            <EmptyReportChart>
                No stock movements in this period.
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
            xDataKey="movement_label"
        >
            <Grid horizontal={false} strokeDasharray="3,5" vertical />
            <BarValueAxis formatValue={formatSignedChartNumber} />
            <Bar
                dataKey="total_quantity_change"
                fill={(point) =>
                    toChartNumber(point.total_quantity_change) < 0
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
                            toChartNumber(point.total_quantity_change) < 0
                                ? reportSecondary
                                : reportPrimary,
                        label: "Net quantity",
                        value: formatSignedChartNumber(
                            toChartNumber(point.total_quantity_change),
                        ),
                    },
                    {
                        color: reportTertiary,
                        label: "Movements",
                        value: toChartNumber(
                            point.total_movements,
                        ).toLocaleString("en-PH"),
                    },
                ]}
            />
        </BarChart>
    );
}
