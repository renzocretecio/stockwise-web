"use client";

import { useMemo, useState } from "react";

import { Area } from "@/components/charts/area";
import { AreaChart } from "@/components/charts/area-chart";
import { Bar } from "@/components/charts/bar";
import { BarChart } from "@/components/charts/bar-chart";
import { BarXAxis } from "@/components/charts/bar-x-axis";
import { ComposedChart } from "@/components/charts/composed-chart";
import { Grid } from "@/components/charts/grid";
import { Line } from "@/components/charts/line";
import { SeriesBar } from "@/components/charts/series-bar";
import { ChartTooltip } from
  "@/components/charts/tooltip/chart-tooltip";
import { XAxis } from "@/components/charts/x-axis";
import { YAxis } from "@/components/charts/y-axis";
import { Button } from "@/components/ui/button";
import { currency, getActiveCurrencyCode } from "@/lib/currency";
import { useDashboardTrends } from
  "@/modules/dashboard/services/dashboard";
import type { DashboardTrendPoint } from
  "@/modules/dashboard/types";
import type { ReportDateRange } from "@/modules/reports/types";

const primary = "var(--primary)";
const secondary = "var(--chart-1)";
const tertiary = "var(--chart-3)";
const chartMargin = {
  top: 12,
  right: 18,
  bottom: 36,
  left: 48,
};
const dualAxisMargin = {
  ...chartMargin,
  right: 52,
};

type TrendView = "stockouts" | "turnover" | "operations";

type ChartPoint = Omit<DashboardTrendPoint, "date"> & {
  date: Date;
};

type LegendItem = {
  color: string;
  label: string;
};

const extraTrendViews: { label: string; value: TrendView }[] = [
  { label: "Stockouts", value: "stockouts" },
  { label: "Turnover", value: "turnover" },
  { label: "Stock operations", value: "operations" },
];

const salesLegend: LegendItem[] = [
  { color: primary, label: "Items sold" },
  { color: secondary, label: "Orders" },
];

const capitalLegend: LegendItem[] = [
  { color: primary, label: "Inventory value" },
  { color: secondary, label: "Dead-stock value" },
];

const operationsLegend: LegendItem[] = [
  { color: primary, label: "Purchase receipts" },
  { color: secondary, label: "Other adjustments" },
  { color: tertiary, label: "Count discrepancies" },
];

const number = new Intl.NumberFormat("en-PH", {
  maximumFractionDigits: 2,
});

const compactNumber = new Intl.NumberFormat("en-PH", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function DashboardTrends({
  dateRange,
}: {
  dateRange: ReportDateRange;
}) {
  const [selectedView, setSelectedView] = useState<TrendView>("stockouts");
  const [showMore, setShowMore] = useState(false);
  const trends = useDashboardTrends(dateRange);
  const chartData = useMemo(
    () => toChartData(trends.data?.points ?? []),
    [trends.data?.points],
  );

  if (trends.error) {
    return (
      <section className="p-5 text-sm text-destructive">
        Unable to load dashboard trends.
      </section>
    );
  }

  if (trends.isLoading || !trends.data) {
    return <DashboardTrendsLoading />;
  }

  const { data } = trends;

  return (
    <section className="min-w-0">
      <div
        className={
          "flex flex-col gap-3 p-4 lg:flex-row lg:items-end " +
          "lg:justify-between"
        }
      >
        <div>
          <h2 className="font-semibold">Business trends</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose one metric group to explore by {data.granularity}
          </p>
        </div>
        <Button
          aria-expanded={showMore}
          onClick={() => setShowMore((visible) => !visible)}
          size="sm"
          type="button"
          variant="outline"
        >
          {showMore ? "Hide more trends" : "More trends"}
        </Button>
      </div>

      <div className="grid gap-px border-t bg-border xl:grid-cols-2">
        <ChartPanel
          description="Net units sold compared with completed orders"
          title="Sales activity"
        >
          <SalesActivityChart points={chartData} />
        </ChartPanel>
        <ChartPanel
          description={data.inventory_valuation_method}
          title="Inventory capital"
        >
          <InventoryCapitalChart points={chartData} />
        </ChartPanel>
      </div>

      {showMore ? (
        <div className="border-t">
          <div className="flex gap-1 overflow-x-auto p-3">
            {extraTrendViews.map((view) => (
              <Button
                aria-pressed={selectedView === view.value}
                className="shrink-0"
                key={view.value}
                onClick={() => setSelectedView(view.value)}
                size="sm"
                type="button"
                variant={
                  selectedView === view.value ? "secondary" : "ghost"
                }
              >
                {view.label}
              </Button>
            ))}
          </div>
          {selectedView === "stockouts" ? (
            <ChartPanel
              description={
                "Products unavailable at the end of each interval"
              }
              title="Stockout trend"
            >
              <StockoutChart points={chartData} />
            </ChartPanel>
          ) : null}
          {selectedView === "turnover" ? (
            <ChartPanel
              description={
                "Cost of goods sold divided by average inventory"
              }
              title="Inventory turnover"
            >
              <TurnoverChart points={chartData} />
            </ChartPanel>
          ) : null}
          {selectedView === "operations" ? (
            <ChartPanel
              description={
                "Received units and signed inventory corrections"
              }
              title="Receipts, adjustments, and discrepancies"
            >
              <OperationsChart points={chartData} />
            </ChartPanel>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function ChartPanel({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <div className="min-w-0 bg-background p-4 sm:p-5">
      <ChartHeading description={description} title={title} />
      {children}
    </div>
  );
}

function ChartHeading({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function SalesActivityChart({ points }: { points: ChartPoint[] }) {
  return (
    <TrendChart legend={salesLegend}>
      <ComposedChart
        aspectRatio="auto"
        className="h-64"
        data={points}
        margin={dualAxisMargin}
        maxBarSize={24}
      >
        <Grid horizontal strokeDasharray="3,5" />
        <YAxis formatValue={formatCompactNumber} />
        <YAxis
          formatLargeNumbers={false}
          formatValue={formatWholeNumber}
          orientation="right"
          yAxisId="orders"
        />
        <SeriesBar dataKey="items_sold" fill={primary} radius={4} />
        <Line
          dataKey="order_count"
          fadeEdges={false}
          stroke={secondary}
          strokeWidth={2.5}
          yAxisId="orders"
        />
        <XAxis numTicks={5} />
        <ChartTooltip
          indicatorDasharray="3,5"
          rows={(point) => [
            {
              color: primary,
              label: "Items sold",
              value: number.format(toNumber(point.items_sold)),
            },
            {
              color: secondary,
              label: "Orders",
              value: number.format(toNumber(point.order_count)),
            },
          ]}
        />
      </ComposedChart>
    </TrendChart>
  );
}

function InventoryCapitalChart({ points }: { points: ChartPoint[] }) {
  return (
    <TrendChart legend={capitalLegend}>
      <AreaChart
        aspectRatio="auto"
        className="h-64"
        data={points}
        margin={chartMargin}
      >
        <Grid horizontal strokeDasharray="3,5" />
        <YAxis formatValue={formatCompactCurrency} />
        <Area
          dataKey="inventory_value"
          fadeEdges
          fill={primary}
          fillOpacity={0.24}
          strokeWidth={2}
        />
        <Area
          dataKey="dead_stock_value"
          fill={secondary}
          fillOpacity={0}
          strokeWidth={2}
        />
        <XAxis numTicks={5} />
        <ChartTooltip
          indicatorDasharray="3,5"
          rows={(point) => [
            {
              color: primary,
              label: "Inventory value",
              value: currency.format(toNumber(point.inventory_value)),
            },
            {
              color: secondary,
              label: "Dead-stock value",
              value: currency.format(toNumber(point.dead_stock_value)),
            },
          ]}
        />
      </AreaChart>
    </TrendChart>
  );
}

function StockoutChart({ points }: { points: ChartPoint[] }) {
  return (
    <TrendChart legend={[{ color: primary, label: "Stockouts" }]}>
      <BarChart
        aspectRatio="auto"
        barGap={0.3}
        className="h-64"
        data={points}
        margin={chartMargin}
        xDataKey="date"
      >
        <Grid horizontal strokeDasharray="3,5" />
        <YAxis formatLargeNumbers={false} formatValue={formatWholeNumber} />
        <Bar
          dataKey="stockout_count"
          fill={primary}
          lineCap={4}
        />
        <BarXAxis maxLabels={6} />
        <ChartTooltip
          indicatorDasharray="3,5"
          rows={(point) => [
            {
              color: primary,
              label: "Stockouts",
              value: formatWholeNumber(toNumber(point.stockout_count)),
            },
          ]}
        />
      </BarChart>
    </TrendChart>
  );
}

function TurnoverChart({ points }: { points: ChartPoint[] }) {
  return (
    <TrendChart legend={[{ color: primary, label: "Turnover" }]}>
      <AreaChart
        aspectRatio="auto"
        className="h-64"
        data={points}
        margin={chartMargin}
      >
        <Grid horizontal strokeDasharray="3,5" />
        <YAxis formatValue={formatTurnover} />
        <Area
          dataKey="inventory_turnover"
          fadeEdges
          fill={primary}
          fillOpacity={0.2}
          showMarkers={points.length <= 16}
          strokeWidth={2}
        />
        <XAxis numTicks={5} />
        <ChartTooltip
          indicatorDasharray="3,5"
          rows={(point) => [
            {
              color: primary,
              label: "Turnover",
              value: formatTurnover(toNumber(point.inventory_turnover)),
            },
          ]}
        />
      </AreaChart>
    </TrendChart>
  );
}

function OperationsChart({ points }: { points: ChartPoint[] }) {
  return (
    <TrendChart legend={operationsLegend}>
      <AreaChart
        aspectRatio="auto"
        className="h-72"
        data={points}
        margin={dualAxisMargin}
      >
        <Grid horizontal strokeDasharray="3,5" />
        <YAxis formatValue={formatCompactNumber} />
        <YAxis
          formatLargeNumbers={false}
          formatValue={formatSignedNumber}
          orientation="right"
          yAxisId="corrections"
        />
        <Area
          dataKey="purchase_receipts"
          fadeEdges
          fill={primary}
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Area
          dataKey="adjustments"
          fill={secondary}
          fillOpacity={0}
          strokeWidth={2}
          yAxisId="corrections"
        />
        <Area
          dataKey="discrepancies"
          fill={tertiary}
          fillOpacity={0}
          strokeWidth={2}
          yAxisId="corrections"
        />
        <XAxis numTicks={5} />
        <ChartTooltip
          indicatorDasharray="3,5"
          rows={(point) => [
            {
              color: primary,
              label: "Purchase receipts",
              value: number.format(toNumber(point.purchase_receipts)),
            },
            {
              color: secondary,
              label: "Other adjustments",
              value: formatSignedNumber(toNumber(point.adjustments)),
            },
            {
              color: tertiary,
              label: "Count discrepancies",
              value: formatSignedNumber(toNumber(point.discrepancies)),
            },
          ]}
        />
      </AreaChart>
    </TrendChart>
  );
}

function TrendChart({
  children,
  legend,
}: {
  children: React.ReactNode;
  legend: LegendItem[];
}) {
  return (
    <div className="min-w-0">
      <div
        aria-label="Chart legend"
        className={
          "mb-2 flex min-h-5 flex-wrap items-center justify-end " +
          "gap-x-4 gap-y-1 text-xs text-muted-foreground"
        }
      >
        {legend.map((item) => (
          <span className="inline-flex items-center gap-1.5" key={item.label}>
            <span
              aria-hidden="true"
              className="size-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </span>
        ))}
      </div>
      {children}
    </div>
  );
}

function toChartData(points: DashboardTrendPoint[]): ChartPoint[] {
  return points.map((point) => ({
    ...point,
    date: new Date(`${point.date}T12:00:00`),
  }));
}

function toNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCompactNumber(value: number) {
  return compactNumber.format(value);
}

function formatWholeNumber(value: number) {
  return number.format(Math.round(value));
}

function formatSignedNumber(value: number) {
  if (value === 0) {
    return "0";
  }
  return `${value > 0 ? "+" : ""}${number.format(value)}`;
}

function formatTurnover(value: number) {
  return `${number.format(value)}×`;
}

function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: getActiveCurrencyCode(),
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function DashboardTrendsLoading() {
  return (
    <section className="border-t">
      <div className="h-16 animate-pulse bg-muted/20" />
      <div className="h-80 animate-pulse border-t bg-muted/20" />
    </section>
  );
}
