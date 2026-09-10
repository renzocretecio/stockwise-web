"use client";

import { Grid } from "@/components/charts/grid";
import { Line } from "@/components/charts/line";
import { LineChart } from "@/components/charts/line-chart";
import { ChartTooltip } from
  "@/components/charts/tooltip/chart-tooltip";
import { XAxis } from "@/components/charts/x-axis";
import { YAxis } from "@/components/charts/y-axis";
import type { ForecastPoint } from "@/modules/dashboard/types";

const seriesColor = "var(--primary)";
const number = new Intl.NumberFormat("en-PH", {
  maximumFractionDigits: 1,
});

export function ForecastChart({ points }: { points: ForecastPoint[] }) {
  if (!points.length) {
    return (
      <div
        className={
          "flex h-[240px] items-center justify-center text-sm " +
          "text-muted-foreground"
        }
      >
        No forecast series available.
      </div>
    );
  }

  const firstForecastIndex = points.findIndex(
    (point) => point.forecast !== null,
  );
  const data = points.map((point) => ({
    date: new Date(`${point.date}T12:00:00`),
    units: point.actual ?? point.forecast ?? 0,
    phase: point.actual !== null ? "actual" : "forecast",
  }));

  return (
    <div className="min-w-0">
      <div
        aria-label="Chart legend"
        className={
          "mb-2 flex items-center justify-end gap-4 text-xs " +
          "text-muted-foreground"
        }
      >
        <LegendItem label="Net sales" />
        <LegendItem dashed label="Forecast" />
      </div>
      <LineChart
        aspectRatio="auto"
        className="h-[220px] min-h-[200px] sm:h-[240px]"
        data={data}
        margin={{ top: 12, right: 18, bottom: 36, left: 44 }}
      >
        <Grid horizontal strokeDasharray="3,5" />
        <YAxis formatLargeNumbers={false} formatValue={formatUnits} />
        <Line
          dashFromIndex={
            firstForecastIndex >= 0 ? firstForecastIndex : undefined
          }
          dataKey="units"
          fadeEdges={false}
          stroke={seriesColor}
          strokeWidth={2.5}
        />
        <XAxis numTicks={5} />
        <ChartTooltip
          indicatorDasharray="3,5"
          rows={(point) => [
            {
              color: seriesColor,
              label: point.phase === "forecast" ? "Forecast" : "Net sales",
              value: formatUnits(toNumber(point.units)),
            },
          ]}
        />
      </LineChart>
    </div>
  );
}

function LegendItem({
  dashed = false,
  label,
}: {
  dashed?: boolean;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden="true"
        className={
          dashed
            ? "w-4 border-t-2 border-dashed"
            : "w-4 border-t-2"
        }
        style={{ borderColor: seriesColor }}
      />
      {label}
    </span>
  );
}

function toNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatUnits(value: number) {
  return number.format(value);
}
