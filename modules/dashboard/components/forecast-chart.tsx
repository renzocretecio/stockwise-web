"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
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
import type { ForecastPoint } from "@/modules/dashboard/types";

const chartConfig = {
  actual: {
    label: "Net sales",
    color: "var(--chart-1)",
  },
  forecast: {
    label: "Forecast",
    color: "var(--color-secondary)",
  },
} satisfies ChartConfig;

const formatDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });

export function ForecastChart({ points }: { points: ForecastPoint[] }) {
  if (!points.length) {
    return (
      <div
        className={
          "flex h-[240px] items-center justify-center text-sm " +
          "text-muted-foreground"
        }
      >
        No forecast series available.
      </div>
    );
  }

  return (
    <ChartContainer
      config={chartConfig}
      className={
        "h-[220px] min-h-[200px] w-full min-w-0 max-w-full " +
        "sm:h-[240px]"
      }
    >
      <LineChart
        accessibilityLayer
        data={points}
        margin={{ top: 8, right: 4, left: -8, bottom: 0 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 5" />
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tickMargin={10}
          minTickGap={28}
          tickFormatter={formatDate}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tickMargin={8}
          width={36}
          allowDecimals={false}
        />
        <ChartTooltip
          cursor={{ stroke: "var(--border)", strokeDasharray: "3 5" }}
          content={
            <ChartTooltipContent
              indicator="line"
              labelFormatter={(value) => formatDate(String(value))}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          dataKey="actual"
          name="actual"
          type="monotone"
          stroke="var(--color-actual)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
          connectNulls={false}
        />
        <Line
          dataKey="forecast"
          name="forecast"
          type="monotone"
          stroke="var(--color-forecast)"
          strokeWidth={2}
          strokeDasharray="7 6"
          dot={false}
          activeDot={{ r: 4 }}
          connectNulls={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
