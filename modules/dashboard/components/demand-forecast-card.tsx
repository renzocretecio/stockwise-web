"use client";

import Link from "next/link";
import { CalendarClock, PackagePlus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ForecastChart } from "@/modules/dashboard/components/forecast-chart";
import type { DemandForecast } from "@/modules/dashboard/types";
import { IntelligenceMessageView } from
  "@/modules/intelligence/components/message";
import { useForecastExplanation } from
  "@/modules/intelligence/services/intelligence";

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

  if (!forecast)
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold">Demand forecast</h2>
        <p className="mt-4 text-sm text-muted-foreground">
          No replenishment is currently recommended from the available sales
          history.
        </p>
      </Card>
    );
  return (
    <Card className="overflow-hidden">
      <div
        className={
          "flex flex-col justify-between gap-4 border-b p-6 sm:flex-row"
        }
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={
                "text-xs font-semibold uppercase tracking-[0.18em] " +
                "text-primary"
              }
            >
              Demand forecast
            </p>
            <Badge variant="secondary">{forecast.confidence} confidence</Badge>
          </div>
          <h2 className="mt-2 text-xl font-semibold">
            {forecast.product_name}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {forecast.supplier_name ? `${forecast.supplier_name} · ` : ""}
            {forecast.lead_time_days}-day lead time
          </p>
        </div>
        <Link
          href="/purchases"
          className={buttonVariants({ variant: "outline" })}
        >
          <PackagePlus className="mr-2 h-4 w-4" />
          Review purchase
        </Link>
      </div>
      <div
        className={
          "grid gap-6 p-6 " +
          "lg:grid-cols-[minmax(0,1.7fr)_minmax(240px,.8fr)]"
        }
      >
        <ForecastChart points={forecast.series} />
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
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
              "flex items-start gap-2 rounded-lg bg-amber-500/10 " +
              "p-3 text-sm"
            }
          >
            <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <span>
              Order by <strong>{dateLabel(forecast.order_by_date)}</strong>
              {forecast.estimated_stockout_date
                ? ` · Estimated stockout ${dateLabel(
                    forecast.estimated_stockout_date,
                  )}`
                : ""}
            </span>
          </div>
          <details>
            <summary
              className="cursor-pointer text-sm font-medium text-primary"
            >
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
            variant="ghost"
            size="sm"
            disabled={explanation.isPending}
            onClick={() => explanation.mutate(forecast.product_id)}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {explanation.isPending ? "Explaining…" : "Explain with Gemini"}
          </Button>
        </div>
      </div>
      {explanation.error ? (
        <p className="border-t p-5 text-sm text-destructive">
          {explanation.error.message}
        </p>
      ) : null}
      {explanation.data ? (
        <div className="border-t p-5">
          <IntelligenceMessageView response={explanation.data} />
        </div>
      ) : null}
    </Card>
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
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 font-semibold ${emphasis ? "text-primary" : ""}`}>
        {value}
      </p>
    </div>
  );
}
