"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/currency";
import { useDashboardTrends } from
  "@/modules/dashboard/services/dashboard";
import type { DashboardTrendPoint } from
  "@/modules/dashboard/types";
import type { ReportDateRange } from "@/modules/reports/types";

const primary = "var(--chart-1)";
const medium = "color-mix(in oklab, var(--chart-1) 68%, transparent)";
const light = "color-mix(in oklab, var(--chart-1) 42%, transparent)";

const salesConfig = {
  items_sold: { label: "Items sold", color: primary },
  order_count: { label: "Orders", color: medium },
} satisfies ChartConfig;

const capitalConfig = {
  inventory_value: { label: "Inventory value", color: primary },
  dead_stock_value: { label: "Dead-stock value", color: light },
} satisfies ChartConfig;

const stockoutConfig = {
  stockout_count: { label: "Stockouts", color: primary },
} satisfies ChartConfig;

const turnoverConfig = {
  inventory_turnover: { label: "Turnover", color: primary },
} satisfies ChartConfig;

const operationsConfig = {
  purchase_receipts: { label: "Purchase receipts", color: primary },
  adjustments: { label: "Other adjustments", color: medium },
  discrepancies: { label: "Count discrepancies", color: light },
} satisfies ChartConfig;

type TrendView =
  | "sales"
  | "capital"
  | "stockouts"
  | "turnover"
  | "operations";

const extraTrendViews: { label: string; value: TrendView }[] = [
  { label: "Stockouts", value: "stockouts" },
  { label: "Turnover", value: "turnover" },
  { label: "Stock operations", value: "operations" },
];

const number = new Intl.NumberFormat("en-PH", {
  maximumFractionDigits: 2,
});

const compactNumber = new Intl.NumberFormat("en-PH", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const dateLabel = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });

export function DashboardTrends({
  dateRange,
}: {
  dateRange: ReportDateRange;
}) {
  const [selectedView, setSelectedView] = useState<TrendView>("stockouts");
  const [showMore, setShowMore] = useState(false);
  const trends = useDashboardTrends(dateRange);

  if (trends.error) {
    return (
      <section className="border-t p-5 text-sm text-destructive">
        Unable to load dashboard trends.
      </section>
    );
  }

  if (trends.isLoading || !trends.data) {
    return <DashboardTrendsLoading />;
  }

  const { data } = trends;

  return (
    <section className="min-w-0 border-t">
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
          <SalesActivityChart points={data.points} />
        </ChartPanel>
        <ChartPanel
          description={data.inventory_valuation_method}
          title="Inventory capital"
        >
          <InventoryCapitalChart points={data.points} />
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
              <StockoutChart points={data.points} />
            </ChartPanel>
          ) : null}
          {selectedView === "turnover" ? (
            <ChartPanel
              description={
                "Cost of goods sold divided by average inventory"
              }
              title="Inventory turnover"
            >
              <TurnoverChart points={data.points} />
            </ChartPanel>
          ) : null}
          {selectedView === "operations" ? (
            <ChartPanel
              description={
                "Received units and signed inventory corrections"
              }
              title="Receipts, adjustments, and discrepancies"
            >
              <OperationsChart points={data.points} />
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

function SalesActivityChart({
  points,
}: {
  points: DashboardTrendPoint[];
}) {
  return (
    <ChartContainer config={salesConfig} className="h-64 w-full">
      <ComposedChart
        accessibilityLayer
        data={points}
        margin={{ left: -10, right: -10 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 5" />
        <ChartXAxis />
        <YAxis
          axisLine={false}
          tickFormatter={(value) => compactNumber.format(value)}
          tickLine={false}
          width={42}
          yAxisId="items"
        />
        <YAxis
          axisLine={false}
          orientation="right"
          tickLine={false}
          width={32}
          yAxisId="orders"
        />
        <MetricTooltip config={salesConfig} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="items_sold"
          fill="var(--color-items_sold)"
          radius={[3, 3, 0, 0]}
          yAxisId="items"
        />
        <Line
          dataKey="order_count"
          dot={false}
          stroke="var(--color-order_count)"
          strokeWidth={2}
          type="monotone"
          yAxisId="orders"
        />
      </ComposedChart>
    </ChartContainer>
  );
}

function InventoryCapitalChart({
  points,
}: {
  points: DashboardTrendPoint[];
}) {
  return (
    <ChartContainer config={capitalConfig} className="h-64 w-full">
      <AreaChart
        accessibilityLayer
        data={points}
        margin={{ left: -4, right: 4 }}
      >
        <defs>
          <linearGradient id="inventory-value-fill" x1="0" x2="0" y1="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-inventory_value)"
              stopOpacity={0.24}
            />
            <stop
              offset="95%"
              stopColor="var(--color-inventory_value)"
              stopOpacity={0.02}
            />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 5" />
        <ChartXAxis />
        <YAxis
          axisLine={false}
          tickFormatter={(value) => compactNumber.format(value)}
          tickLine={false}
          width={46}
        />
        <MetricTooltip config={capitalConfig} currency />
        <ChartLegend content={<ChartLegendContent />} />
        <Area
          dataKey="inventory_value"
          fill="url(#inventory-value-fill)"
          stroke="var(--color-inventory_value)"
          strokeWidth={2}
          type="monotone"
        />
        <Area
          dataKey="dead_stock_value"
          fill="transparent"
          stroke="var(--color-dead_stock_value)"
          strokeWidth={2}
          type="monotone"
        />
      </AreaChart>
    </ChartContainer>
  );
}

function StockoutChart({ points }: { points: DashboardTrendPoint[] }) {
  return (
    <ChartContainer config={stockoutConfig} className="h-64 w-full">
      <BarChart
        accessibilityLayer
        data={points}
        margin={{ left: -12, right: 4 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 5" />
        <ChartXAxis />
        <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
        <MetricTooltip config={stockoutConfig} />
        <Bar
          dataKey="stockout_count"
          fill="var(--color-stockout_count)"
          radius={[3, 3, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}

function TurnoverChart({ points }: { points: DashboardTrendPoint[] }) {
  return (
    <ChartContainer config={turnoverConfig} className="h-64 w-full">
      <LineChart
        accessibilityLayer
        data={points}
        margin={{ left: -12, right: 8 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 5" />
        <ChartXAxis />
        <YAxis
          axisLine={false}
          tickFormatter={(value) => `${number.format(value)}×`}
          tickLine={false}
        />
        <MetricTooltip config={turnoverConfig} suffix="×" />
        <Line
          dataKey="inventory_turnover"
          dot={false}
          stroke="var(--color-inventory_turnover)"
          strokeWidth={2}
          type="monotone"
        />
      </LineChart>
    </ChartContainer>
  );
}

function OperationsChart({
  points,
}: {
  points: DashboardTrendPoint[];
}) {
  return (
    <ChartContainer config={operationsConfig} className="h-72 w-full">
      <BarChart
        accessibilityLayer
        data={points}
        margin={{ left: -4, right: 4 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 5" />
        <ChartXAxis />
        <YAxis
          axisLine={false}
          tickFormatter={(value) => compactNumber.format(value)}
          tickLine={false}
          width={44}
        />
        <MetricTooltip config={operationsConfig} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="purchase_receipts"
          fill="var(--color-purchase_receipts)"
          radius={[3, 3, 0, 0]}
        />
        <Bar
          dataKey="adjustments"
          fill="var(--color-adjustments)"
          radius={[3, 3, 0, 0]}
        />
        <Bar
          dataKey="discrepancies"
          fill="var(--color-discrepancies)"
          radius={[3, 3, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}

function ChartXAxis() {
  return (
    <XAxis
      axisLine={false}
      dataKey="date"
      minTickGap={28}
      tickFormatter={dateLabel}
      tickLine={false}
      tickMargin={10}
    />
  );
}

function MetricTooltip({
  config,
  currency = false,
  suffix = "",
}: {
  config: ChartConfig;
  currency?: boolean;
  suffix?: string;
}) {
  return (
    <ChartTooltip
      content={
        <ChartTooltipContent
          indicator="line"
          labelFormatter={(value) => dateLabel(String(value))}
          formatter={(value, name) => (
            <div className="flex min-w-44 justify-between gap-4">
              <span className="text-muted-foreground">
                {config[String(name)]?.label}
              </span>
              <span className="font-mono font-medium">
                {currency
                  ? formatCurrency(Number(value))
                  : `${number.format(Number(value))}${suffix}`}
              </span>
            </div>
          )}
        />
      }
      cursor={{ stroke: "var(--border)", strokeDasharray: "3 5" }}
    />
  );
}

function DashboardTrendsLoading() {
  return (
    <section className="border-t">
      <div className="h-16 animate-pulse bg-muted/20" />
      <div className="h-80 animate-pulse border-t bg-muted/20" />
    </section>
  );
}
