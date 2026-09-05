"use client";

import Link from "next/link";
import { useState } from "react";
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
import { useDashboard } from
  "@/modules/dashboard/services/dashboard";

const thresholds = [3, 7, 14, 30];

export function InventoryRiskPanel({ compact = false }: { compact?: boolean }) {
  const [stockDaysThreshold, setStockDaysThreshold] = useState(7);
  const dashboard = useDashboard(stockDaysThreshold);

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

  const risk = dashboard.data.inventory_risk;
  const rows = [
    {
      label: compact ? "Out of stock" : "Out-of-stock SKUs",
      value: risk.out_of_stock_skus,
      icon: PackageX,
      href: "/reports/low-stock",
    },
    {
      label: compact ? "Low stock" : "Low-stock SKUs",
      value: risk.low_stock_skus,
      icon: AlertTriangle,
      href: "/reports/low-stock",
    },
    {
      label: "Below reorder point",
      value: risk.below_reorder_point,
      icon: PackageSearch,
      href: "/reports/low-stock",
    },
    {
      label: `Under ${risk.stock_days_threshold} days of stock`,
      value: risk.below_days_of_stock,
      icon: Timer,
      href: "/dashboard/intelligence",
    },
    {
      label: "Pending reorder suggestions",
      value: risk.pending_reorder_recommendations,
      icon: ClipboardList,
      href: "/dashboard/intelligence",
    },
    {
      label: "Deliveries expected today",
      value: risk.expected_deliveries_today,
      icon: Truck,
      href: "/purchases",
    },
    {
      label: "Late purchase orders",
      value: risk.late_purchase_orders,
      icon: CalendarClock,
      href: "/purchases",
    },
  ];
  const visibleRows = compact ? rows.slice(0, 4) : rows;

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

      {!compact ? <div className="my-5 bg-destructive/5 p-4">
        <p className="text-xs font-medium text-muted-foreground">
          Estimated sales at risk
        </p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">
          {formatCurrency(risk.estimated_sales_at_risk)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Revenue exposed during supplier lead times
        </p>
      </div> : null}

      <div className="divide-y">
        {visibleRows.map((row) => {
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
                  "grid size-8 shrink-0 place-items-center bg-muted"
                }
              >
                <Icon className="size-4 text-primary" />
              </span>
              <span className="min-w-0 flex-1 text-sm text-muted-foreground">
                {row.label}
              </span>
              <span className="font-semibold tabular-nums">
                {row.value}
              </span>
              <ArrowUpRight
                className={
                  "size-3.5 text-muted-foreground transition-transform " +
                  "group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                }
              />
            </Link>
          );
        })}
      </div>
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
