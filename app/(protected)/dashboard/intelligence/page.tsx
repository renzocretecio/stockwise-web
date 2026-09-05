"use client";

import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DailyBriefing } from
  "@/modules/briefings/components/daily-briefing";
import { AnomalyList } from
  "@/modules/dashboard/components/anomaly-list";
import { DemandForecastCard } from
  "@/modules/dashboard/components/demand-forecast-card";
import { ReorderAssistant } from
  "@/modules/dashboard/components/reorder-assistant";
import { useDashboard } from "@/modules/dashboard/services/dashboard";
import { Card } from "@/components/ui/card";

export default function DashboardIntelligencePage() {
  const { data, isLoading, error } = useDashboard();
  const queryClient = useQueryClient();

  const refreshIntelligence = () => {
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    void queryClient.invalidateQueries({ queryKey: ["briefings"] });
  };

  return (
    <div className="pb-12">
      <div
        className={
          "flex flex-col gap-4 p-4 border-b sm:flex-row sm:items-end " +
          "sm:justify-between"
        }
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Inventory intelligence
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Understand what changed, why it matters, and what to do next.
          </p>
        </div>
      </div>
      

      {isLoading ? (
        <IntelligenceLoading />
      ) : error || !data ? (
        <div className="border-t bg-destructive/5 p-5 text-sm text-destructive">
          Unable to load inventory intelligence: {" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </div>
      ) : (
        <>
          <DailyBriefing />

          <div
            className={
              "flex flex-col gap-1 border-t border-b p-4 " +
              "sm:flex-row sm:items-center sm:gap-3"
            }
          >
            <h2 className="font-semibold">Demand forecasting</h2>
            <p className="text-xs text-muted-foreground sm:border-l sm:pl-3">
              What your recent sales suggest you should order.
            </p>
          </div>
          
          <div
            className={
              "grid min-w-0 grid-cols-1 " +
              "lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x"
            }
          >
            <DemandForecastCard forecast={data.forecasts[0]} />
            <ReorderAssistant forecasts={data.forecasts} />
          </div>
          

          <AnomalyList anomalies={data.anomalies} />
        </>
      )}
    </div>
  );
}

function IntelligenceLoading() {
  return (
    <div>
      <div className="h-[28rem] animate-pulse border-t bg-muted/40" />
      <div className="h-64 animate-pulse border-t bg-muted/40" />
    </div>
  );
}
