"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import type { LowStockReport } from "@/modules/reports/types";

const chartConfig = {
    stock_gap: {
        label: "Units below target",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig;

const chartShades = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
];

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
        .slice(0, 5)
        .map((item) => ({
            ...item,
            label:
                item.product_name.length > 18
                    ? `${item.product_name.slice(0, 17)}…`
                    : item.product_name,
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
                    width={94}
                    tick={{ fontSize: 11 }}
                />
                <ChartTooltip
                    cursor={{ fill: "var(--muted)" }}
                    content={
                        <ChartTooltipContent
                            labelKey="product_name"
                            formatter={(value) => (
                                <div className="flex w-full min-w-40 justify-between gap-4">
                                    <span className="text-muted-foreground">
                                        Units below target
                                    </span>
                                    <span className="font-mono font-medium">
                                        {Number(value).toLocaleString("en-PH")}
                                    </span>
                                </div>
                            )}
                        />
                    }
                />
                <Bar dataKey="stock_gap" name="stock_gap" radius={[0, 6, 6, 0]}>
                    {data.map((item, index) => (
                        <Cell key={item.product_id} fill={chartShades[index]} />
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
            No products currently require replenishment.
        </div>
    );
}
