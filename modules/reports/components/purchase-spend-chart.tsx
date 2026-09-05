"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { currency } from "@/lib/currency";
import type { PurchaseReport } from "@/modules/reports/types";

const chartConfig = {
    spent: {
        label: "Purchasing spend",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig;

type DailyPurchase = PurchaseReport["by_day"][number];

const dateLabel = (value: string) =>
    new Date(`${value}T00:00:00`).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
    });

const shortNumber = (value: number) =>
    new Intl.NumberFormat("en-PH", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value);

function fillDates(points: DailyPurchase[], days: number): DailyPurchase[] {
    const values = new Map(points.map((point) => [point.date, point]));
    const today = new Date();

    return Array.from({ length: days }, (_, index) => {
        const date = new Date(today);
        date.setHours(12, 0, 0, 0);
        date.setDate(today.getDate() - days + index + 1);
        const key = [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0"),
        ].join("-");

        return (
            values.get(key) ?? {
                date: key,
                spent: 0,
                purchases_count: 0,
            }
        );
    });
}

export function PurchaseSpendChart({
    points,
    days,
}: {
    points: DailyPurchase[];
    days: number;
}) {
    const data = fillDates(points, days);

    return (
        <ChartContainer
            config={chartConfig}
            className="h-[280px] w-full min-w-0 max-w-full"
        >
            <AreaChart
                accessibilityLayer
                data={data}
                margin={{ top: 8, right: 8, left: -4, bottom: 0 }}
            >
                <defs>
                    <linearGradient
                        id="purchase-spend-fill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop
                            offset="5%"
                            stopColor="var(--color-spent)"
                            stopOpacity={0.3}
                        />
                        <stop
                            offset="95%"
                            stopColor="var(--color-spent)"
                            stopOpacity={0.02}
                        />
                    </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 5" />
                <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                    minTickGap={28}
                    tickFormatter={dateLabel}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                    width={42}
                    tickFormatter={shortNumber}
                />
                <ChartTooltip
                    cursor={{ stroke: "var(--border)", strokeDasharray: "3 5" }}
                    content={
                        <ChartTooltipContent
                            indicator="line"
                            labelFormatter={(value) => dateLabel(String(value))}
                            formatter={(value) => (
                                <div className="flex w-full min-w-40 justify-between gap-4">
                                    <span className="text-muted-foreground">
                                        Spend
                                    </span>
                                    <span className="font-mono font-medium">
                                        {currency.format(Number(value))}
                                    </span>
                                </div>
                            )}
                        />
                    }
                />
                <Area
                    dataKey="spent"
                    name="spent"
                    type="monotone"
                    fill="url(#purchase-spend-fill)"
                    stroke="var(--color-spent)"
                    strokeWidth={2}
                />
            </AreaChart>
        </ChartContainer>
    );
}
