"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarClock,
  ClipboardList,
  PackageSearch,
  PackageX,
  Timer,
  Truck,
} from "lucide-react";

import { formatCurrency } from "@/lib/currency";
import {
  Legend,
  LegendItemComponent,
  LegendLabel,
  LegendMarker,
  LegendProgress,
  LegendValue,
} from "@/components/charts/legend";
import { RingChart } from "@/components/charts/ring-chart";
import { Ring } from "@/components/charts/ring";
import { RingCenter } from "@/components/charts/ring-center";
import { useDashboard } from
  "@/modules/dashboard/services/dashboard";

const thresholds = [3, 7, 14, 30];
const riskColors = [
  "var(--primary)",
  "color-mix(in srgb, var(--primary) 82%, var(--background))",
  "color-mix(in srgb, var(--primary) 66%, var(--background))",
  "color-mix(in srgb, var(--primary) 50%, var(--background))",
];

export function InventoryRiskPanel({ compact = false }: { compact?: boolean }) {
  const [stockDaysThreshold, setStockDaysThreshold] = useState(7);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const dashboard = useDashboard(stockDaysThreshold);
  const risk = dashboard.data?.inventory_risk;
  const ringData = useMemo(() => {
    if (!risk) return [];

    const signals = [
      {
        label: "Out of stock",
        value: risk.out_of_stock_skus,
      },
      {
        label: "Low stock",
        value: risk.low_stock_skus,
      },
      {
        label: "Below reorder point",
        value: risk.below_reorder_point,
      },
      {
        label: `Under ${risk.stock_days_threshold} days`,
        value: risk.below_days_of_stock,
      },
    ];
    const total = signals.reduce(
      (sum, signal) => sum + signal.value,
      0,
    );
    const maxValue = Math.max(total, 1);

    return signals.map((signal, index) => ({
      ...signal,
      color: riskColors[index],
      maxValue,
    }));
  }, [risk]);

  if (dashboard.error) {
    return (
      <aside className="p-5 text-sm text-destructive">
        Unable to load the inventory-risk snapshot.
      </aside>
    );
  }

  if (dashboard.isLoading || !dashboard.data) {
    return <InventoryRiskLoading />;
  }

  const loadedRisk = dashboard.data.inventory_risk;
  const rows = [
    {
      label: compact ? "Out of stock" : "Out-of-stock SKUs",
      value: loadedRisk.out_of_stock_skus,
      icon: PackageX,
      href: "/reports/low-stock",
    },
    {
      label: compact ? "Low stock" : "Low-stock SKUs",
      value: loadedRisk.low_stock_skus,
      icon: AlertTriangle,
      href: "/reports/low-stock",
    },
    {
      label: "Below reorder point",
      value: loadedRisk.below_reorder_point,
      icon: PackageSearch,
      href: "/reports/low-stock",
    },
    {
      label: `Under ${loadedRisk.stock_days_threshold} days of stock`,
      value: loadedRisk.below_days_of_stock,
      icon: Timer,
      href: "/dashboard/intelligence",
    },
    {
      label: "Pending reorder suggestions",
      value: loadedRisk.pending_reorder_recommendations,
      icon: ClipboardList,
      href: "/dashboard/intelligence",
    },
    {
      label: "Deliveries expected today",
      value: loadedRisk.expected_deliveries_today,
      icon: Truck,
      href: "/purchases",
    },
    {
      label: "Late purchase orders",
      value: loadedRisk.late_purchase_orders,
      icon: CalendarClock,
      href: "/purchases",
    },
  ];

  return (
    <aside className="flex min-w-0 flex-col p-5 gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">
            {compact ? "Needs attention" : "Inventory risk"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {compact
              ? "Current stock issues that may affect sales"
              : "Current operational snapshot"}
          </p>
        </div>
        {!compact ? (
          <select
            aria-label="Days-of-stock threshold"
            className={
              "h-8 border bg-background px-2 text-xs text-muted-foreground"
            }
            onChange={(event) => {
              setStockDaysThreshold(Number(event.target.value));
            }}
            value={stockDaysThreshold}
          >
            {thresholds.map((days) => (
              <option key={days} value={days}>
                {days} days
              </option>
            ))}
          </select>
        ) : null}
      </div>

      {compact ? (
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex justify-center">
            <RingChart
              baseInnerRadius={48}
              data={ringData}
              hoveredIndex={hoveredIndex}
              onHoverChange={setHoveredIndex}
              ringGap={5}
              size={180}
              strokeWidth={12}
            >
              {ringData.map((item, index) => (
                <Ring index={index} key={item.label} />
              ))}
              <RingCenter defaultLabel="Risk signals" />
            </RingChart>
          </div>

          <Legend
            hoveredIndex={hoveredIndex}
            items={ringData}
            onHoverChange={setHoveredIndex}
          >
            <LegendItemComponent>
              <LegendMarker />
              <LegendLabel />
              <LegendValue showPercentage />
              <LegendProgress />
            </LegendItemComponent>
          </Legend>
        </div>
      ) : (
        <>
          <div className="my-5 bg-destructive/5 p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Estimated sales at risk
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {formatCurrency(loadedRisk.estimated_sales_at_risk)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Revenue exposed during supplier lead times
            </p>
          </div>

          <div className="divide-y">
            {rows.map((row) => {
              const Icon = row.icon;

              return (
                <Link
                  className={
                    "group flex items-center gap-3 py-3 first:pt-0 " +
                    "last:pb-0"
                  }
                  href={row.href}
                  key={row.label}
                >
                  <span
                    className={
                      "grid size-8 shrink-0 place-items-center " +
                      "rounded-2xl bg-muted"
                    }
                  >
                    <Icon className="size-4 text-primary" />
                  </span>
                  <span
                    className={
                      "min-w-0 flex-1 text-sm " +
                      "text-muted-foreground"
                    }
                  >
                    {row.label}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {row.value}
                  </span>
                  <ArrowUpRight
                    className={
                      "size-3.5 text-muted-foreground " +
                      "transition-transform " +
                      "group-hover:-translate-y-0.5 " +
                      "group-hover:translate-x-0.5"
                    }
                  />
                </Link>
              );
            })}
          </div>
        </>
      )}
      {compact ? (
        <Link
          className="mt-4 text-xs font-medium text-primary hover:underline"
          href="/dashboard/intelligence"
        >
          Review risks
          <ArrowUpRight className="ml-1 inline size-3.5" />
        </Link>
      ) : null}
    </aside>
  );
}

function InventoryRiskLoading() {
  return (
    <aside className="space-y-4 p-5">
      <div className="h-10 w-40 animate-pulse bg-muted/60" />
      <div className="h-24 animate-pulse bg-muted/40" />
      {[1, 2, 3, 4, 5, 6, 7].map((item) => (
        <div
          className="h-9 animate-pulse bg-muted/30"
          key={item}
        />
      ))}
    </aside>
  );
}
