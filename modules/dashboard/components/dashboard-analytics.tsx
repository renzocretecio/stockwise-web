"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { InventoryRiskPanel } from
  "@/modules/dashboard/components/inventory-risk-panel";
import { SalesProfitChart } from
  "@/modules/dashboard/components/sales-profit-chart";
import { useSalesReportByDateRange } from
  "@/modules/reports/services/reports";
import type { ReportDateRange } from "@/modules/reports/types";

export function DashboardAnalytics({
  dateRange,
}: {
  dateRange: ReportDateRange;
}) {
  const sales = useSalesReportByDateRange(dateRange);

  if (sales.error) {
    return (
      <Card
        className={
          "border-destructive/30 p-5 text-sm text-destructive"
        }
      >
        Unable to load revenue and gross-profit data. Please try again.
      </Card>
    );
  }

  if (sales.isLoading || !sales.data) {
    return <DashboardAnalyticsLoading />;
  }

  return (
    <section
      className={
        "grid min-w-0 border-t xl:grid-cols-[minmax(0,7fr)_minmax(19rem,3fr)]"
      }
    >
      <div className="min-w-0 xl:border-r">
        <div className="flex items-end justify-between gap-3 p-4">
          <div>
            <h2 className="font-semibold">Performance</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Revenue and gross profit for the selected period
            </p>
          </div>
          <Link
            className={
              "flex shrink-0 items-center gap-1 text-xs font-medium " +
              "text-primary hover:underline"
            }
            href="/reports/sales"
          >
            View details
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        <div className="min-w-0 px-2 pb-4 sm:px-4">
          <SalesProfitChart
            className="h-[360px]"
            dateRange={dateRange}
            points={sales.data.by_day}
          />
        </div>
      </div>
      <div className="border-t xl:border-t-0">
        <InventoryRiskPanel compact />
      </div>
    </section>
  );
}

function DashboardAnalyticsLoading() {
  return (
    <section className="min-w-0 border-y">
      <div className="space-y-2 border-b p-4">
        <div className="h-5 w-52 animate-pulse bg-muted/60" />
        <div className="h-4 w-72 max-w-full animate-pulse bg-muted/40" />
      </div>
      <div className="mx-4 mb-4 h-[360px] animate-pulse bg-muted/30" />
    </section>
  );
}
