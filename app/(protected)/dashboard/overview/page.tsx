"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import {
  DateRangePicker,
  type DateRange,
} from "@/components/DateRangePicker";
import { DashboardAnalytics } from
  "@/modules/dashboard/components/dashboard-analytics";
import { BusinessHealth } from
  "@/modules/dashboard/components/business-health";
import { DashboardTrends } from
  "@/modules/dashboard/components/dashboard-trends";
import {
  InventoryEfficiency,
  SuggestedActions,
} from
  "@/modules/dashboard/components/inventory-efficiency";
import { Button } from "@/components/ui/button";
import type { ReportDateRange } from "@/modules/reports/types";

const toDateValue = (date: Date) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, "0"),
  String(date.getDate()).padStart(2, "0"),
].join("-");

const initialSalesRange = (): ReportDateRange => {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 29);

  return {
    startDate: toDateValue(start),
    endDate: toDateValue(end),
  };
};

export default function DashboardOverviewPage() {
  const [salesRange, setSalesRange] = useState(initialSalesRange);
  const queryClient = useQueryClient();

  const changeSalesRange = (range: DateRange) => {
    if (!range.from || !range.to) return;

    setSalesRange({
      startDate: toDateValue(range.from),
      endDate: toDateValue(range.to),
    });
  };

  const refreshDashboard = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["reports"] });
  };

  return (
    <div className="pb-12">
      <div
        className={
          "flex flex-col gap-4 p-4 sm:flex-row sm:items-end " +
          "sm:justify-between"
        }
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Business overview
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Monitor sales performance and your current inventory health.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker
            maxDays={365}
            onChange={changeSalesRange}
            value={{
              from: new Date(`${salesRange.startDate}T12:00:00`),
              to: new Date(`${salesRange.endDate}T12:00:00`),
            }}
          />
          <Button
            aria-label="Refresh dashboard"
            onClick={refreshDashboard}
            size="icon"
            type="button"
            variant="outline"
          >
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </div>

      <BusinessHealth dateRange={salesRange} />
      <DashboardAnalytics dateRange={salesRange} />
      <InventoryEfficiency compact />
      <SuggestedActions />
      <DashboardTrends dateRange={salesRange} />
    </div>
  );
}
