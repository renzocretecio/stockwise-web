"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { currency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type {
  ReportDateRange,
  SalesReport,
} from "@/modules/reports/types";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
  profit: {
    label: "Gross profit",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

type DailySale = SalesReport["by_day"][number];

type SalesProfitChartProps = {
  className?: string;
  points: DailySale[];
} & (
  | { dateRange: ReportDateRange; days?: never }
  | { dateRange?: never; days: number }
);

const dateLabel = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });

const shortCurrency = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

function fillDates(
  points: DailySale[],
  dateRange: ReportDateRange,
): DailySale[] {
  const values = new Map(points.map((point) => [point.date, point]));
  const start = new Date(`${dateRange.startDate}T00:00:00Z`);
  const end = new Date(`${dateRange.endDate}T00:00:00Z`);
  const dayCount = Math.floor(
    (end.getTime() - start.getTime()) / 86_400_000,
  ) + 1;

  return Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(date.getUTCDate() + index);
    const key = date.toISOString().slice(0, 10);

    return (
      values.get(key) ?? {
        date: key,
        revenue: 0,
        profit: 0,
        sales_count: 0,
      }
    );
  });
}

function trailingDateRange(days: number): ReportDateRange {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - days + 1);

  const toValue = (date: Date) => [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

  return {
    startDate: toValue(start),
    endDate: toValue(end),
  };
}

export function SalesProfitChart({
  className,
  points,
  dateRange,
  days,
}: SalesProfitChartProps) {
  const range = dateRange ?? trailingDateRange(days);
  const data = fillDates(points, range);

  return (
    <ChartContainer
      config={chartConfig}
      className={cn(
        "h-[320px] w-full min-w-0 max-w-full",
        className,
      )}
    >
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{ top: 8, right: 8, left: -4, bottom: 0 }}
      >
        <defs>
          <linearGradient id="sales-fill" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-revenue)"
              stopOpacity={0.28}
            />
            <stop
              offset="95%"
              stopColor="var(--color-revenue)"
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
          tickFormatter={shortCurrency}
        />
        <ChartTooltip
          cursor={{ stroke: "var(--border)", strokeDasharray: "3 5" }}
          content={
            <ChartTooltipContent
              indicator="line"
              labelFormatter={(value) => dateLabel(String(value))}
              formatter={(value, name) => (
                <div className="flex w-full min-w-36 justify-between gap-4">
                  <span className="text-muted-foreground">
                    {chartConfig[name as keyof typeof chartConfig]?.label}
                  </span>
                  <span className="font-mono font-medium">
                    {value !== 0 ? currency.format(Number(value)) : "No sales data"}
                  </span>
                </div>
              )}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Area
          dataKey="revenue"
          name="revenue"
          type="monotone"
          fill="url(#sales-fill)"
          stroke="var(--color-revenue)"
          strokeWidth={2}
        />
        <Area
          dataKey="profit"
          name="profit"
          type="monotone"
          fill="transparent"
          stroke="var(--color-profit)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
