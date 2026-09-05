"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Boxes,
  PackageOpen,
  Sprout,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { useDashboard } from
  "@/modules/dashboard/services/dashboard";
import type {
  InventoryAgingBucket,
  InventoryEfficiencyAction,
} from "@/modules/dashboard/types";

const number = new Intl.NumberFormat("en-PH", {
  maximumFractionDigits: 1,
});

const bucketDetails: Record<
  InventoryAgingBucket["key"],
  { className: string; label: string; range: string }
> = {
  active: {
    className: "bg-primary",
    label: "Active",
    range: "Sold within 30 days",
  },
  slowing: {
    className: "bg-primary/70",
    label: "Slowing",
    range: "No sales for 30–59 days",
  },
  at_risk: {
    className: "bg-primary/45",
    label: "Very Slow",
    range: "No sales for 60–89 days",
  },
  dead_stock: {
    className: "bg-primary/25",
    label: "Dead stock",
    range: "No sales for 90+ days",
  },
};

export function InventoryEfficiency({
  compact = false,
}: {
  compact?: boolean;
}) {
  const dashboard = useDashboard();

  if (dashboard.error) {
    return (
      <section className="border-t p-5 text-sm text-destructive">
        Unable to load inventory-efficiency data.
      </section>
    );
  }

  if (dashboard.isLoading || !dashboard.data) {
    return <InventoryEfficiencyLoading />;
  }

  const efficiency = dashboard.data.inventory_efficiency;

  return (
    <section className="min-w-0 border-t">
      <div
        className={
          "flex flex-col gap-2 p-4 sm:flex-row sm:items-end " +
          "sm:justify-between"
        }
      >
        <div>
            <h2 className="font-semibold">
              {compact ? "Money tied up in inventory" : "Inventory efficiency"}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {compact
                ? "See how much money is sitting in products that are not moving efficiently"
                : "Find slow-moving and excess stock that may be tying up your money"}
          </p>
        </div>
        <Link
          className={
            "flex items-center gap-1 text-xs font-medium text-primary " +
            "hover:underline"
          }
          href={compact ? "/reports/sales" : "/reports/inventory"}
        >
          {compact ? "Review slow-moving stock" : "View inventory report"}
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <div
        className={
          "grid border-t xl:grid-cols-[minmax(0,3fr)_minmax(22rem,2fr)]"
        }
      >
        <ExposureSummary
          capitalTiedUp={efficiency.capital_tied_up}
          deadStockPercentage={efficiency.dead_stock_percentage}
          deadStockValue={efficiency.dead_stock_value}
        />
        <AgingBuckets buckets={efficiency.aging_buckets} />
      </div>

      {!compact ? (
        <div
          className={
            "grid gap-px border-t bg-border sm:grid-cols-3"
          }
        >
        <CompactMetric
          detail="No sales for 30–89 days"
          icon={PackageOpen}
          label="Slow-moving SKUs"
          value={efficiency.slow_moving_skus}
        />
        <CompactMetric
          detail="Expiry dates require batch tracking"
          icon={Sprout}
          label="Perishable SKUs"
          value={efficiency.perishable_skus}
        />
        <CompactMetric
          detail="Stock above demand and safety targets"
          icon={Boxes}
          label="Overstocked products"
          value={efficiency.overstocked_products}
        />
        </div>
      ) : null}

      {!compact ? <ActionTable actions={efficiency.actions} /> : null}
    </section>
  );
}

export function SuggestedActions() {
  const dashboard = useDashboard();

  if (dashboard.error) {
    return (
      <section className="border-t p-5 text-sm text-destructive">
        Unable to load suggested actions.
      </section>
    );
  }

  if (dashboard.isLoading || !dashboard.data) {
    return (
      <section className="border-t p-5">
        <div className="h-5 w-52 animate-pulse bg-muted/40" />
      </section>
    );
  }

  const actions = dashboard.data.inventory_efficiency.actions.slice(0, 3);

  return (
    <section className="border-t">
      <div className="flex items-end justify-between gap-3 p-4">
        <div>
          <h2 className="font-semibold">Recommended actions</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Products worth reviewing first
          </p>
        </div>
        <Link
          className="text-xs font-medium text-primary hover:underline"
          href="/dashboard/intelligence"
        >
          View all
          <ArrowUpRight className="ml-1 inline size-3.5" />
        </Link>
      </div>
      {actions.length ? (
        <div className="grid gap-px border-t bg-border lg:grid-cols-3">
          {actions.map((action) => (
            <div className="bg-background p-4" key={action.product_id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {action.product_name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {action.days_without_sale} days without a sale ·
                    {` ${formatCurrency(action.inventory_value)} tied up`}
                  </p>
                </div>
                <Badge
                  variant={
                    action.classification === "dead_stock"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {bucketDetails[action.classification].label}
                </Badge>
              </div>
              <p className="mt-4 min-h-10 text-sm text-muted-foreground">
                {action.suggested_action}
              </p>
              <Link
                className={
                  "mt-4 inline-flex h-9 items-center border px-3 text-sm " +
                  "font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/80"
                }
                href="/products"
              >
                Review product
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="border-t p-5 text-sm text-muted-foreground">
          No inventory actions need attention.
        </p>
      )}
    </section>
  );
}

function ExposureSummary({
  capitalTiedUp,
  deadStockPercentage,
  deadStockValue,
}: {
  capitalTiedUp: number;
  deadStockPercentage: number;
  deadStockValue: number;
}) {
  return (
    <div className="p-5 xl:border-r">
      <p className="text-xs font-medium text-muted-foreground">
        Money tied up in dead stock
      </p>

      <div className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-1">
        <p className="text-3xl font-semibold tabular-nums">
          {formatCurrency(deadStockValue)}
        </p>

        <p className="pb-1 text-sm text-muted-foreground">
          {number.format(deadStockPercentage)}% of your current inventory value
        </p>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Products with no sales for 90+ days
      </p>

      <div className="mt-7 bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground">
          Money tied up in excess stock
        </p>

        <p className="mt-1 text-xl font-semibold tabular-nums">
          {formatCurrency(capitalTiedUp)}
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Stock you currently have beyond expected demand and safety needs
        </p>
      </div>
    </div>
  );
}

function AgingBuckets({
  buckets,
}: {
  buckets: InventoryAgingBucket[];
}) {
  const totalValue = buckets.reduce(
    (sum, bucket) => sum + bucket.inventory_value,
    0,
  );

  return (
    <div className="border-t p-5 xl:border-t-0">
      <p className="text-sm font-medium">Inventory aging</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Products grouped by how recently they sold
      </p>
      <div
        aria-label="Inventory value by aging bucket"
        className="mt-5 flex h-3 w-full overflow-hidden bg-muted"
      >
        {buckets.map((bucket) => (
          <div
            className={bucketDetails[bucket.key].className}
            key={bucket.key}
            style={{
              width: totalValue > 0
                ? `${bucket.inventory_value / totalValue * 100}%`
                : "0%",
            }}
          />
        ))}
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {buckets.map((bucket) => {
          const details = bucketDetails[bucket.key];

          return (
            <div className="min-w-0" key={bucket.key}>
              <div className="flex items-center gap-2">
                <span className={`size-2.5 rounded-full ${details.className}`} />
                <p className="text-xs font-medium">{details.label}</p>
                <p className="ml-auto text-xs tabular-nums">
                  {bucket.sku_count} SKUs
                </p>
              </div>
              <p className="mt-1 pl-4.5 text-xs text-muted-foreground">
                {details.range}
              </p>
              <p className="mt-1 pl-4.5 text-xs font-medium tabular-nums">
                {formatCurrency(bucket.inventory_value)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CompactMetric({
  detail,
  icon: Icon,
  label,
  value,
}: {
  detail: string;
  icon: typeof Boxes;
  label: string;
  value: number;
}) {
  return (
    <div className="flex gap-3 bg-background p-4">
      <span
        className={
          "grid size-9 shrink-0 place-items-center bg-primary/10 " +
          "text-primary"
        }
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

function ActionTable({
  actions,
}: {
  actions: InventoryEfficiencyAction[];
}) {
  return (
    <div className="border-t">
      <div className="p-4">
        <h3 className="text-sm font-semibold">Suggested actions</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Deterministic recommendations ordered by urgency and value
        </p>
      </div>
      {actions.length ? (
        <div className="max-h-[32rem] overflow-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead
              className={
                "sticky top-0 z-10 border-y bg-background text-xs " +
                "uppercase tracking-wider text-muted-foreground"
              }
            >
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">
                  Stock value
                </th>
                <th className="px-4 py-3 text-right font-medium">
                  Last sale
                </th>
                <th className="px-4 py-3 text-right font-medium">
                  Excess value
                </th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {actions.map((action) => (
                <ActionRow action={action} key={action.product_id} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="border-t p-5 text-sm text-muted-foreground">
          No inventory-efficiency actions need attention.
        </p>
      )}
    </div>
  );
}

function ActionRow({
  action,
}: {
  action: InventoryEfficiencyAction;
}) {
  const details = bucketDetails[action.classification];

  return (
    <tr className="hover:bg-muted/30">
      <td className="max-w-56 px-4 py-3">
        <p className="truncate font-medium">{action.product_name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {action.sku || "No SKU"}
        </p>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          <Badge
            variant={
              action.classification === "dead_stock"
                ? "destructive"
                : "secondary"
            }
          >
            {details.label}
          </Badge>
          {action.is_perishable ? (
            <Badge variant="outline">Perishable</Badge>
          ) : null}
        </div>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
        {formatCurrency(action.inventory_value)}
      </td>
      <td
        className={
          "whitespace-nowrap px-4 py-3 text-right " +
          "text-muted-foreground"
        }
      >
        {action.last_sale_date
          ? new Date(`${action.last_sale_date}T12:00:00`)
            .toLocaleDateString()
          : "Never"}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
        {formatCurrency(action.excess_value)}
      </td>
      <td className="max-w-72 px-4 py-3 text-muted-foreground">
        {action.suggested_action}
      </td>
    </tr>
  );
}

function InventoryEfficiencyLoading() {
  return (
    <section className="border-t">
      <div className="h-16 animate-pulse bg-muted/20" />
      <div className="grid gap-px border-t bg-border xl:grid-cols-2">
        <div className="h-56 animate-pulse bg-muted/30" />
        <div className="h-56 animate-pulse bg-muted/20" />
      </div>
      <div className="h-72 animate-pulse border-t bg-muted/20" />
    </section>
  );
}
