"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { currency } from "@/lib/currency";
import type { PurchaseReport } from "@/modules/reports/types";

const chartConfig = {
    total_spent: {
        label: "Total spent",
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

type Supplier = PurchaseReport["by_supplier"][number];

const shortNumber = (value: number) =>
    new Intl.NumberFormat("en-PH", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value);

export function SupplierSpendChart({ suppliers }: { suppliers: Supplier[] }) {
    const data = suppliers.slice(0, 5).map((supplier) => ({
        ...supplier,
        label:
            supplier.supplier_name.length > 18
                ? `${supplier.supplier_name.slice(0, 17)}…`
                : supplier.supplier_name,
    }));

    if (!data.length) {
        return (
            <div
                className={
                    "flex h-[280px] items-center justify-center text-sm " +
                    "text-muted-foreground"
                }
            >
                No received supplier purchases in this period.
            </div>
        );
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
                    tickFormatter={shortNumber}
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
                            labelKey="supplier_name"
                            formatter={(value) => (
                                <div className="flex w-full min-w-36 justify-between gap-4">
                                    <span className="text-muted-foreground">
                                        Total spent
                                    </span>
                                    <span className="font-mono font-medium">
                                        {currency.format(Number(value))}
                                    </span>
                                </div>
                            )}
                        />
                    }
                />
                <Bar
                    dataKey="total_spent"
                    name="total_spent"
                    radius={[0, 6, 6, 0]}
                >
                    {data.map((supplier, index) => (
                        <Cell
                            key={supplier.supplier_id}
                            fill={chartShades[index]}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ChartContainer>
    );
}
