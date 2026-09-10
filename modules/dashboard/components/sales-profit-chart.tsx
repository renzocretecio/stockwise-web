"use client";

import { useMemo } from "react";

import { Area } from "@/components/charts/area";
import { AreaChart } from "@/components/charts/area-chart";
import { ChartBrush } from "@/components/charts/chart-brush";
import { ChartBrushLayout } from "@/components/charts/chart-brush-layout";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip/chart-tooltip";
import { XAxis } from "@/components/charts/x-axis";
import { YAxis } from "@/components/charts/y-axis";
import { currency, getActiveCurrencyCode } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { ReportDateRange, SalesReport } from "@/modules/reports/types";

const revenueColor = "var(--chart-1)";
const profitColor = "var(--chart-2)";
const mainChartMargin = {
  top: 12,
  right: 18,
  bottom: 36,
  left: 58,
};
const brushChartMargin = {
  top: 6,
  right: 18,
  bottom: 6,
  left: 18,
};

type DailySale = SalesReport["by_day"][number];

type SalesProfitChartProps = {
  className?: string;
  points: DailySale[];
} & (
  | { dateRange: ReportDateRange; days?: never }
  | { dateRange?: never; days: number }
);

function fillDates(
  points: DailySale[],
  dateRange: ReportDateRange,
): Record<string, unknown>[] {
  const values = new Map(points.map((point) => [point.date, point]));
  const start = new Date(`${dateRange.startDate}T00:00:00Z`);
  const end = new Date(`${dateRange.endDate}T00:00:00Z`);
  const dayCount =
    Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;

  return Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(date.getUTCDate() + index);
    const key = date.toISOString().slice(0, 10);
    const point = values.get(key);

    return {
      date: key,
      revenue: point?.revenue ?? 0,
      profit: point?.profit ?? 0,
      sales_count: point?.sales_count ?? 0,
    };
  });
}

function trailingDateRange(days: number): ReportDateRange {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - days + 1);

  const toValue = (date: Date) =>
    [
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
  const range = useMemo(
    () => dateRange ?? trailingDateRange(days),
    [dateRange, days],
  );
  const data = useMemo(() => fillDates(points, range), [points, range]);
  const brushEnabled = data.length > 2;

  return (
    <div
      className={cn(
        "flex h-[320px] w-full min-w-0 max-w-full flex-col",
        className,
      )}
    >
      <div
        aria-label="Chart legend"
        className={
          "flex shrink-0 items-center justify-end gap-4 px-4 " +
          "pb-2 text-xs text-muted-foreground"
        }
      >
        <ChartKey color={revenueColor} label="Revenue" />
        <ChartKey color={profitColor} label="Gross profit" />
      </div>

      <div className="min-h-0 flex-1">
        <ChartBrushLayout
          brushStrip={(brushLayout) => (
            <AreaChart
              animationDuration={0}
              className="size-full"
              data={data}
              margin={brushChartMargin}
              status="ready"
              style={{
                aspectRatio: "unset",
                height: "100%",
                touchAction: "pan-y",
              }}
            >
              <Area
                animate={false}
                dataKey="revenue"
                fadeEdges
                fill={revenueColor}
                fillOpacity={0.15}
                showHighlight={false}
                strokeWidth={1.5}
              />
              <Area
                animate={false}
                dataKey="profit"
                fill={profitColor}
                fillOpacity={0}
                showHighlight={false}
                strokeWidth={1.5}
              />
              <ChartBrush
                fadeOuterEdges
                initialSelection={brushLayout.brushSelection ?? undefined}
                onSelectionChange={brushLayout.onBrushSelectionChange}
              />
            </AreaChart>
          )}
          data={data}
          enabled={brushEnabled}
          height={58}
        >
          {(brushLayout) => (
            <AreaChart
              className="size-full"
              data={data}
              margin={mainChartMargin}
              style={{
                aspectRatio: "unset",
                height: "100%",
                touchAction: "pan-y",
              }}
              tweenYDomainOnXDomainChange
              xDomain={brushLayout.xDomain}
              xDomainSlotCount={brushLayout.xDomainSlotCount}
              yDomainTween
            >
              <Grid horizontal strokeDasharray="3,5" />
              <YAxis formatValue={formatCompactCurrency} />
              <Area
                dataKey="revenue"
                fadeEdges
                fill={revenueColor}
                fillOpacity={0.28}
                strokeWidth={2}
              />
              <Area
                dataKey="profit"
                fill={profitColor}
                fillOpacity={0}
                strokeWidth={2}
              />
              <XAxis />
              <ChartTooltip
                indicatorDasharray="3,5"
                rows={(point) => [
                  {
                    color: revenueColor,
                    label: "Revenue",
                    value: formatChartCurrency(point.revenue),
                  },
                  {
                    color: profitColor,
                    label: "Gross profit",
                    value: formatChartCurrency(point.profit),
                  },
                ]}
              />
            </AreaChart>
          )}
        </ChartBrushLayout>
      </div>
    </div>
  );
}

function ChartKey({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden="true"
        className="size-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function formatChartCurrency(value: unknown) {
  const amount = typeof value === "number" ? value : Number(value ?? 0);

  return currency.format(Number.isFinite(amount) ? amount : 0);
}

function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: getActiveCurrencyCode(),
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
