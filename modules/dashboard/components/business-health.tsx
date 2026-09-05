"use client";

import { formatCurrency } from "@/lib/currency";
import { useDashboard } from "@/modules/dashboard/services/dashboard";
import { useSalesReportByDateRange } from
  "@/modules/reports/services/reports";
import type { ReportDateRange } from "@/modules/reports/types";

const percentage = new Intl.NumberFormat("en-PH", {
  maximumFractionDigits: 1,
});

export function BusinessHealth({
  dateRange,
}: {
  dateRange: ReportDateRange;
}) {
  const sales = useSalesReportByDateRange(dateRange);
  const dashboard = useDashboard();

  if (sales.error || dashboard.error) {
    return (
      <section className="border-y p-5 text-sm text-destructive">
        Unable to load business health.
      </section>
    );
  }

  if (
    sales.isLoading ||
    dashboard.isLoading ||
    !sales.data ||
    !dashboard.data
  ) {
    return <BusinessHealthLoading />;
  }

  const revenue = sales.data.summary.total_revenue;
  const profit = sales.data.summary.total_profit;
  const margin = revenue > 0 ? profit / revenue * 100 : 0;

  return (
    <section>
      <div
        className={
          "grid gap-px border-t bg-border sm:grid-cols-2 " +
          "xl:grid-cols-4"
        }
      >
        <HealthValue label="Revenue" value={formatCurrency(revenue)} />
        <HealthValue
          label="Gross profit"
          negative={profit < 0}
          value={formatCurrency(profit)}
        />
        <HealthValue
          label="Margin"
          negative={margin < 0}
          value={`${percentage.format(margin)}%`}
        />
        <HealthValue
          label="Inventory"
          value={formatCurrency(dashboard.data.kpis.inventory_value)}
        />
      </div>
    </section>
  );
}

function HealthValue({
  label,
  negative = false,
  value,
}: {
  label: string;
  negative?: boolean;
  value: string;
}) {
  return (
    <div className="bg-background p-4 sm:p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={
          "mt-1 text-2xl font-semibold tabular-nums " +
          (negative ? "text-destructive" : "")
        }
      >
        {value}
      </p>
    </div>
  );
}

function BusinessHealthLoading() {
  return (
    <section className="border-y">
      <div className="h-12 animate-pulse bg-muted/20" />
      <div
        className={
          "grid gap-px border-t bg-border sm:grid-cols-2 " +
          "xl:grid-cols-4"
        }
      >
        {[1, 2, 3, 4].map((item) => (
          <div className="h-24 animate-pulse bg-muted/30" key={item} />
        ))}
      </div>
    </section>
  );
}
