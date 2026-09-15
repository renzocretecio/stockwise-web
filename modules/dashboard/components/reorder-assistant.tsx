import Link from "next/link";
import { CalendarClock, CircleAlert, PackagePlus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import type { DemandForecast } from "@/modules/dashboard/types";

const number = new Intl.NumberFormat("en-PH", {
    maximumFractionDigits: 1,
});

export function ReorderAssistant({
    forecasts,
}: {
    forecasts: DemandForecast[];
}) {
    const recommendations = forecasts.slice(0, 5);

    return (
        <section className="@container/reorder min-w-0">
            <header
                className={
                    "flex flex-wrap items-start justify-between gap-3 " +
                    "border-b bg-amber-500/5 p-5 sm:p-6"
                }
            >
                <div>
                    <div className="flex items-center gap-2">
                        <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400">
                            <PackagePlus className="size-4" />
                        </span>
                        <h2 className="font-semibold">Reorder assistant</h2>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Suggested quantities for your next purchase.
                    </p>
                </div>
                <Badge variant="secondary">
                    {recommendations.length} to review
                </Badge>
            </header>

            {recommendations.length === 0 ? (
                <p className="p-5 text-sm text-muted-foreground">
                    No purchase is currently recommended from the available
                    sales history.
                </p>
            ) : (
                <div className="space-y-3 p-4 sm:p-5">
                    {recommendations.map((forecast) => (
                        <RecommendationRow
                            forecast={forecast}
                            key={forecast.product_id}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

function RecommendationRow({ forecast }: { forecast: DemandForecast }) {
    const canCreateDraft = Boolean(forecast.supplier_id);

    return (
        <article
            className={
                "flex flex-col gap-4 rounded-2xl border border-border/60 " +
                "bg-muted/20 p-4 @min-[720px]/reorder:flex-row " +
                "@min-[720px]/reorder:items-center @min-[720px]/reorder:justify-between"
            }
        >
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">{forecast.product_name}</h3>
                    <Badge variant="secondary">
                        {forecast.confidence} confidence
                    </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                    {forecast.supplier_name ?? "Supplier needs to be assigned"}
                    {forecast.supplier_name
                        ? ` · ${forecast.lead_time_days}-day lead time`
                        : ""}
                </p>
                <div
                    className={
                        "mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs " +
                        "text-muted-foreground"
                    }
                >
                    <span>
                        {number.format(forecast.current_stock)} available
                    </span>
                    <span>
                        {number.format(forecast.incoming_stock)} incoming
                    </span>
                    <span>
                        {number.format(forecast.lead_time_demand)} needed during
                        lead time
                    </span>
                </div>
            </div>

            <div
                className={
                    "flex shrink-0 flex-wrap items-center justify-between gap-3 " +
                    "rounded-2xl bg-primary/5 p-3 " +
                    "@min-[720px]/reorder:justify-end"
                }
            >
                <div className="@min-[720px]/reorder:text-right">
                    <p className="text-lg font-semibold tabular-nums text-primary">
                        Order{" "}
                        {number.format(forecast.recommended_order_quantity)}{" "}
                        units
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Est. {formatCurrency(forecast.estimated_order_cost)}
                    </p>
                </div>
                {canCreateDraft ? (
                    <Link
                        className={buttonVariants({ size: "sm" })}
                        href={purchaseDraftHref(forecast)}
                    >
                        <PackagePlus className="mr-1.5 size-4" />
                        Create draft
                    </Link>
                ) : (
                    <Button disabled size="sm" title="Assign a supplier first">
                        <CircleAlert className="mr-1.5 size-4" />
                        Assign supplier
                    </Button>
                )}
            </div>

            <p
                className={
                    "flex items-center gap-1.5 text-xs text-muted-foreground " +
                    "@min-[720px]/reorder:hidden"
                }
            >
                <CalendarClock className="size-3.5" />
                Order by {displayDate(forecast.order_by_date)}
            </p>
        </article>
    );
}

function purchaseDraftHref(forecast: DemandForecast) {
    const parameters = new URLSearchParams({
        expected_delivery_date: expectedDeliveryDate(
            forecast.order_by_date,
            forecast.lead_time_days,
        ),
        product_id: forecast.product_id,
        quantity: String(forecast.recommended_order_quantity),
        supplier_id: forecast.supplier_id ?? "",
        unit_cost: String(forecast.estimated_unit_cost),
    });

    return `/purchases?${parameters.toString()}`;
}

function expectedDeliveryDate(orderByDate: string, leadTimeDays: number) {
    const [year, month, day] = orderByDate.split("-").map(Number);
    const value = new Date(Date.UTC(year, month - 1, day));
    value.setUTCDate(value.getUTCDate() + leadTimeDays);
    return value.toISOString().slice(0, 10);
}

function displayDate(value: string) {
    return new Date(`${value}T00:00:00`).toLocaleDateString("en-PH", {
        day: "numeric",
        month: "short",
    });
}
