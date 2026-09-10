"use client";

import { DailyBriefing } from
  "@/modules/briefings/components/daily-briefing";
import { FeatureGate } from
  "@/modules/billing/components/feature-gate";
import { AiUsage } from
  "@/modules/billing/components/ai-usage";
import { AnomalyList } from
  "@/modules/dashboard/components/anomaly-list";
import { DemandForecastCard } from
  "@/modules/dashboard/components/demand-forecast-card";
import { ReorderAssistant } from
  "@/modules/dashboard/components/reorder-assistant";
import { useDashboard } from "@/modules/dashboard/services/dashboard";
import { DashboardDivider } from "@/modules/dashboard/components/dashboard-divider";

export default function DashboardIntelligencePage() {
  const { data, isLoading, error } = useDashboard();

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
        <AiUsage />
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
          <DashboardDivider />
          <FeatureGate
            className="border-y"
            description={
              "See demand forecasts and recommended purchase quantities " +
              "with the Pro plan."
            }
            feature="forecasting"
            title="Demand forecasting is available on Pro"
          >
            <div>
              <div
                className={
                  "flex flex-col gap-1 border-b p-4 " +
                  "sm:flex-row sm:items-center sm:gap-3"
                }
              >
                <h2 className="font-semibold">Demand forecasting</h2>
                <p
                  className={
                    "text-xs text-muted-foreground sm:border-l " +
                    "sm:pl-3"
                  }
                >
                  What your recent sales suggest you should order.
                </p>
              </div>

              <div
                className={
                  "grid min-w-0 grid-cols-1 divide-y " +
                  "lg:grid-cols-2 lg:divide-x lg:divide-y-0"
                }
              >
                <DemandForecastCard forecast={data.forecasts[0]} />
                <ReorderAssistant forecasts={data.forecasts} />
              </div>
            </div>
          </FeatureGate>
          <DashboardDivider />
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
