"use client";

import { DashboardMetricCards } from "./dashboard-metric-cards";
import { SalesAiInsight } from "./sales-ai-insight";
import type { InventoryBriefing } from "@/modules/briefings/types";
import type { SalesReport } from "@/modules/reports/types";

export type SalesReportViewProps = {
    report?: SalesReport;
    isLoading: boolean;
    isPaused: boolean;
    isError: boolean;
};

export function DashboardSalesSummary({
    report,
    isLoading,
    isPaused,
    isError,
    inventory,
    inventoryDescription,
    briefing,
    briefingLoading,
}: SalesReportViewProps & {
    inventory?: number;
    inventoryDescription: string;
    briefing?: InventoryBriefing | null;
    briefingLoading: boolean;
}) {
    return (
        <section
            aria-label="Business metrics and yesterday's insight"
            className={
                "grid min-w-0 items-stretch gap-4 " +
                "xl:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]"
            }
        >
            <div className="order-2 min-w-0 xl:order-1">
                {report ? (
                    <DashboardMetricCards
                        report={report}
                        inventory={inventory}
                        inventoryDescription={inventoryDescription}
                    />
                ) : isPaused ? (
                    <p className="h-full rounded-2xl border bg-card p-4 text-sm text-muted-foreground">
                        Metrics aren’t saved for this period. Reconnect to load
                        them.
                    </p>
                ) : isError ? (
                    <p
                        role="alert"
                        className="h-full rounded-2xl border bg-card p-4 text-sm text-destructive"
                    >
                        Unable to load business metrics. Please try again.
                    </p>
                ) : (
                    <div
                        aria-label="Loading business metrics"
                        aria-busy={isLoading || !report}
                        className="grid h-full gap-4 sm:grid-cols-2 lg:grid-cols-4"
                    >
                        {[0, 1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="h-44 animate-pulse rounded-2xl bg-muted"
                            />
                        ))}
                    </div>
                )}
            </div>
            <div className="order-1 min-w-0 xl:order-2">
                <SalesAiInsight
                    briefing={briefing}
                    isLoading={briefingLoading}
                />
            </div>
        </section>
    );
}
