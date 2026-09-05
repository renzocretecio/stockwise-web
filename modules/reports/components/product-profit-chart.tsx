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
import { currency } from "@/lib/currency";
import type { ProfitReport } from "@/modules/reports/types";

const chartConfig = {
    profit: {
        label: "Gross profit",
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

type Product = ProfitReport["by_product"][number];

const shortNumber = (value: number) =>
    new Intl.NumberFormat("en-PH", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value);

export function ProductProfitChart({ products }: { products: Product[] }) {
    const data = products.slice(0, 5).map((product) => ({
        ...product,
        label:
            product.product_name.length > 18
                ? `${product.product_name.slice(0, 17)}…`
                : product.product_name,
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
                            labelKey="product_name"
                            formatter={(value) => (
                                <div className="flex w-full min-w-36 justify-between gap-4">
                                    <span className="text-muted-foreground">
                                        Gross profit
                                    </span>
                                    <span className="font-mono font-medium">
                                        {currency.format(Number(value))}
                                    </span>
                                </div>
                            )}
                        />
                    }
                />
                <Bar dataKey="profit" name="profit" radius={[0, 6, 6, 0]}>
                    {data.map((product, index) => (
                        <Cell
                            key={product.product_id}
                            fill={
                                product.profit < 0
                                    ? "var(--destructive)"
                                    : chartShades[index]
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
            No product profit data in this period.
        </div>
    );
}
