"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ReferenceLine,
    XAxis,
    YAxis,
} from "recharts";

import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import type { StockMovementReport } from "@/modules/reports/types";

const chartConfig = {
    total_quantity_change: {
        label: "Net quantity",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig;

type Movement = StockMovementReport["by_type"][number];

const movementLabel = (value: string) =>
    value
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

export function MovementTypeChart({ movements }: { movements: Movement[] }) {
    const data = movements.map((movement) => ({
        ...movement,
        label: movementLabel(movement.movement_type),
    }));

    if (!data.length) {
        return <EmptyState />;
    }

    return (
        <ChartContainer
            config={chartConfig}
            className="h-[280px] w-full min-w-0 max-w-full"
        >
            <BarChart
                accessibilityLayer
                data={data}
                layout="vertical"
                margin={{ top: 4, right: 12, left: 4, bottom: 0 }}
            >
                <CartesianGrid horizontal={false} strokeDasharray="3 5" />
                <ReferenceLine x={0} stroke="var(--border)" />
                <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                />
                <YAxis
                    type="category"
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    width={100}
                    tick={{ fontSize: 11 }}
                />
                <ChartTooltip
                    cursor={{ fill: "var(--muted)" }}
                    content={
                        <ChartTooltipContent
                            labelKey="label"
                            formatter={(value) => {
                                const quantity = Number(value);
                                return (
                                    <div
                                        className={
                                            "flex w-full min-w-36 justify-between gap-4"
                                        }
                                    >
                                        <span className="text-muted-foreground">
                                            Net quantity
                                        </span>
                                        <span className="font-mono font-medium">
                                            {quantity > 0 ? "+" : ""}
                                            {quantity.toLocaleString("en-PH")}
                                        </span>
                                    </div>
                                );
                            }}
                        />
                    }
                />
                <Bar
                    dataKey="total_quantity_change"
                    name="total_quantity_change"
                    radius={[0, 6, 6, 0]}
                >
                    {data.map((movement) => (
                        <Cell
                            key={movement.movement_type}
                            fill={
                                movement.total_quantity_change < 0
                                    ? "var(--chart-3)"
                                    : "var(--chart-1)"
                            }
                        />
                    ))}
                </Bar>
            </BarChart>
        </ChartContainer>
    );
}

function EmptyState() {
    return (
        <div
            className={
                "flex h-[280px] items-center justify-center text-sm " +
                "text-muted-foreground"
            }
        >
            No stock movements in this period.
        </div>
    );
}
