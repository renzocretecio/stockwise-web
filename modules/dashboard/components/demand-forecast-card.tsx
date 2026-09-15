"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarClock, PackagePlus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ForecastChart } from "@/modules/dashboard/components/forecast-chart";
import type { DemandForecast } from "@/modules/dashboard/types";
import { ExplanationDrawer } from "@/modules/intelligence/components/explanation-drawer";
import { useForecastExplanation } from "@/modules/intelligence/services/intelligence";
import { useAiAllowance } from "@/modules/billing/components/ai-usage";

const number = new Intl.NumberFormat("en-PH", { maximumFractionDigits: 1 });
const dateLabel = (value: string) =>
    new Date(`${value}T00:00:00`).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
    });

export function DemandForecastCard({
    forecast,
}: {
    forecast?: DemandForecast;
}) {
    const explanation = useForecastExplanation();
    const aiAllowance = useAiAllowance();
    const [drawerOpen, setDrawerOpen] = useState(false);

    if (!forecast)
        return (
            <div className="p-6">
                <h2 className="text-lg font-semibold">Demand forecast</h2>
                <p className="mt-4 text-sm text-muted-foreground">
                    No replenishment is currently recommended from the available
                    sales history.
                </p>
            </div>
        );

    return (
        <div className="@container/forecast w-full min-w-0 max-w-full overflow-hidden p-4 sm:p-6">
            <div
                className={
                    "flex flex-col justify-between gap-4 pb-5 @min-[520px]/forecast:flex-row"
                }
            >
                <div>
                    <h2 className="flex flex-wrap items-center gap-2 break-words text-lg font-semibold">
                        {forecast.product_name}{" "}
                        <Badge variant="secondary">
                            {forecast.confidence} confidence
                        </Badge>
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {forecast.supplier_name
                            ? `${forecast.supplier_name} · `
                            : ""}
                        {forecast.lead_time_days}-day lead time
                    </p>
                </div>
                <Link
                    href="/purchases"
                    className={buttonVariants({
                        variant: "outline",
                        className: "shrink-0 self-start",
                    })}
                >
                    <PackagePlus className="mr-2 h-4 w-4" />
                    Review purchase
                </Link>
            </div>
            <div className="rounded-2xl border border-border/50 bg-muted/20 p-2 pt-4 sm:p-4">
                <ForecastChart points={forecast.series} />
            </div>
            <div className="max-w-7xl mx-auto space-y-4 mt-4">
                <div className="grid grid-cols-1 gap-3 @min-[360px]/forecast:grid-cols-2 @min-[720px]/forecast:grid-cols-4">
                    <Metric
                        label="Forecast during lead time"
                        value={`${number.format(forecast.lead_time_demand)} units`}
                    />
                    <Metric
                        label="Recommended order"
                        value={`${number.format(
                            forecast.recommended_order_quantity,
                        )} units`}
                        emphasis
                    />
                    <Metric
                        label="Available"
                        value={`${number.format(forecast.current_stock)} units`}
                    />
                    <Metric
                        label="Incoming"
                        value={`${number.format(forecast.incoming_stock)} units`}
                    />
                </div>
                <div
                    className={
                        "flex items-start gap-2 rounded-2xl bg-amber-500/10 " +
                        "p-3 text-sm"
                    }
                >
                    <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <span>
                        Order by{" "}
                        <strong>{dateLabel(forecast.order_by_date)}</strong>
                        {forecast.estimated_stockout_date
                            ? ` · Estimated stockout ${dateLabel(
                                  forecast.estimated_stockout_date,
                              )}`
                            : ""}
                    </span>
                </div>
                <details className="rounded-2xl border border-border/60 p-4">
                    <summary className="cursor-pointer text-sm font-medium text-primary">
                        How this was calculated
                    </summary>
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                        {forecast.explanation.map((line) => (
                            <li key={line}>• {line}</li>
                        ))}
                    </ul>
                </details>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={explanation.isPending || aiAllowance.exhausted}
                    onClick={() => {
                        explanation.mutate(forecast.product_id, {
                            onSuccess: () => setDrawerOpen(true),
                        });
                    }}
                >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {explanation.isPending
                        ? "Explaining…"
                        : aiAllowance.exhausted
                          ? "Weekly AI limit reached"
                          : "Explain · 1 AI action"}
                </Button>
            </div>
            {explanation.error ? (
                <p className="border-t p-5 text-sm text-destructive">
                    {explanation.error.message}
                </p>
            ) : null}
            <ExplanationDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                title={`Why ${forecast.product_name} needs attention`}
                description="StockWise explanation for this demand forecast."
                response={explanation.data}
            />
        </div>
    );
}

function Metric({
    label,
    value,
    emphasis = false,
}: {
    label: string;
    value: string;
    emphasis?: boolean;
}) {
    return (
        <div
            className={
                "min-w-0 rounded-2xl border p-4 " +
                (emphasis
                    ? "border-primary/20 bg-primary/10"
                    : "border-border/50 bg-muted/20")
            }
        >
            <p className="text-xs text-muted-foreground">{label}</p>
            <p
                className={
                    "mt-2 break-words text-xl font-semibold tabular-nums " +
                    (emphasis ? "text-primary" : "")
                }
            >
                {value}
            </p>
        </div>
    );
}
