"use client";

import { ChartNoAxesCombined } from "lucide-react";

import { DailyBriefing } from "@/modules/briefings/components/daily-briefing";
import { FeatureGate } from "@/modules/billing/components/feature-gate";
import { AiUsage } from "@/modules/billing/components/ai-usage";
import { AnomalyList } from "@/modules/dashboard/components/anomaly-list";
import { DemandForecastCard } from "@/modules/dashboard/components/demand-forecast-card";
import { ReorderAssistant } from "@/modules/dashboard/components/reorder-assistant";
import { useDashboard } from "@/modules/dashboard/services/dashboard";

const tile =
    "min-w-0 overflow-hidden rounded-2xl border " +
    "border-border/70 bg-card shadow-sm";
const grid =
    "grid min-w-0 grid-cols-1 items-start gap-4 " + "xl:grid-cols-12 xl:gap-5";

export default function DashboardIntelligencePage() {
    const { data, isLoading, error, isPaused } = useDashboard();

    return (
        <div className="bento-page">
            <div
                className={
                    "flex flex-col gap-4 px-1 py-2 lg:flex-row " +
                    "lg:items-end lg:justify-between"
                }
            >
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Inventory intelligence
                    </h1>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Understand what changed, why it matters, and what to do
                        next.
                    </p>
                </div>
                <AiUsage className="shrink-0 border-border/70 bg-card shadow-sm" />
            </div>

            {!data && isPaused ? (
                <div className={tile + " p-5 text-sm text-muted-foreground"}>
                    Inventory intelligence isn’t saved offline yet. Reconnect to
                    load it.
                </div>
            ) : isLoading && !data ? (
                <IntelligenceLoading />
            ) : !data ? (
                <div className={tile + " p-5 text-sm text-destructive"}>
                    Unable to load inventory intelligence:{" "}
                    {error instanceof Error
                        ? error.message
                        : "Please try again."}
                </div>
            ) : (
                <>
                    <DailyBriefing bento />
                    <FeatureGate
                        className={tile}
                        description={
                            "See demand forecasts and recommended purchase quantities " +
                            "with the Pro plan."
                        }
                        feature="forecasting"
                        title="Demand forecasting is available on Pro"
                    >
                        <div className={grid}>
                            <section className={tile + " xl:col-span-8"}>
                                <header className="flex items-start gap-3 border-b bg-sky-500/5 p-5 sm:p-6">
                                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-sky-500/10 text-sky-700 dark:text-sky-400">
                                        <ChartNoAxesCombined className="size-5" />
                                    </span>
                                    <div className="min-w-0">
                                        <h2 className="font-semibold">
                                            Demand forecasting
                                        </h2>
                                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                            Plan your next order from recent
                                            sales.
                                        </p>
                                    </div>
                                </header>
                                <DemandForecastCard
                                    forecast={data.forecasts[0]}
                                />
                            </section>
                            <div className={tile + " xl:col-span-4"}>
                                <ReorderAssistant forecasts={data.forecasts} />
                            </div>
                        </div>
                    </FeatureGate>
                    <div className={tile}>
                        <AnomalyList anomalies={data.anomalies} />
                    </div>
                </>
            )}
        </div>
    );
}

function IntelligenceLoading() {
    return (
        <div className="space-y-5" aria-label="Loading intelligence" aria-busy>
            {[0, 1].map((row) => (
                <div className={grid} key={row}>
                    {[8, 4].map((span) => (
                        <div
                            key={span}
                            className={
                                tile +
                                (span === 8
                                    ? " p-5 xl:col-span-8"
                                    : " p-5 xl:col-span-4")
                            }
                        >
                            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
                            <div className="mt-5 h-56 animate-pulse rounded-2xl bg-muted/50" />
                        </div>
                    ))}
                </div>
            ))}
            <div className={tile + " h-40 animate-pulse bg-muted/40"} />
        </div>
    );
}
