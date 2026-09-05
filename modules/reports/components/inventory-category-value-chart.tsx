"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    XAxis,
    YAxis,
} from "recharts";

import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCurrency, getActiveCurrencyCode } from "@/lib/currency";
import type { InventoryReport } from "@/modules/reports/types";

type Category = InventoryReport["by_category"][number];

const chartConfig = {
    stock_value: {
        label: "Stock value",
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

const compactCurrency = (value: number) =>
    new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: getActiveCurrencyCode(),
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value);

function labelFor(category: string) {
    return category.length > 18 ? `${category.slice(0, 17)}…` : category;
}

export function InventoryCategoryValueChart({
    categories,
}: {
    categories: Category[];
}) {
    const data = [...categories]
        .sort((left, right) => right.stock_value - left.stock_value)
        .slice(0, 6)
        .map((category) => ({
            ...category,
            label: labelFor(category.category),
        }));

    if (!data.length) {
        return (
            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
                No inventory value by category yet.
            </div>
        );
    }

    return (
        <ChartContainer
            className="h-[280px] w-full min-w-0 max-w-full"
            config={chartConfig}
        >
            <BarChart
                accessibilityLayer
                data={data}
                layout="vertical"
                margin={{ top: 4, right: 12, left: 4, bottom: 0 }}
            >
                <CartesianGrid horizontal={false} strokeDasharray="3 5" />
                <XAxis
                    axisLine={false}
                    dataKey="stock_value"
                    tickFormatter={compactCurrency}
                    tickLine={false}
                    type="number"
                />
                <YAxis
                    axisLine={false}
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    type="category"
                    width={100}
                />
                <ChartTooltip
                    content={
                        <ChartTooltipContent
                            formatter={(value, _name, item) => (
                                <div className="grid w-full min-w-44 gap-1">
                                    <div className="flex justify-between gap-4">
                                        <span className="text-muted-foreground">
                                            Stock value
                                        </span>
                                        <span className="font-mono font-medium">
                                            {formatCurrency(Number(value))}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <span className="text-muted-foreground">
                                            Products
                                        </span>
                                        <span className="font-mono font-medium">
                                            {Number(
                                                item.payload.product_count,
                                            ).toLocaleString("en-PH")}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <span className="text-muted-foreground">
                                            Units on hand
                                        </span>
                                        <span className="font-mono font-medium">
                                            {Number(
                                                item.payload.total_units,
                                            ).toLocaleString("en-PH")}
                                        </span>
                                    </div>
                                </div>
                            )}
                            labelFormatter={(_label, payload) =>
                                payload[0]?.payload.category ?? "Category"
                            }
                        />
                    }
                    cursor={{ fill: "var(--muted)" }}
                />
                <Bar dataKey="stock_value" name="stock_value" radius={0}>
                    {data.map((category, index) => (
                        <Cell
                            fill={chartShades[index % chartShades.length]}
                            key={category.category}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ChartContainer>
    );
}
