"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, ChartColumn, ChartNoAxesCombined } from "lucide-react";
import { curveMonotoneX, curveStepAfter } from "@visx/curve";

import { Area } from "@/components/charts/area";
import { AreaChart } from "@/components/charts/area-chart";
import { Bar } from "@/components/charts/bar";
import { BarChart } from "@/components/charts/bar-chart";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip/chart-tooltip";
import { Card } from "@/components/ui/card";
import { formatCurrency, getActiveCurrencyCode } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { ReportDateRange } from "@/modules/reports/types";

type MetricTrendCardProps = {
    label: string;
    value?: number;
    data: { date: string; value: number }[];
    secondaryData?: { date: string; value: number }[];
    secondaryLabel?: string;
    secondaryColor?: string;
    dateRange: ReportDateRange;
    description: string;
    href: string;
    linkLabel: string;
    percentage?: boolean;
    signed?: boolean;
    defaultView?: "area" | "bar";
    color?: string;
    colorSecondary?: string;
    stepped?: boolean;
    emptyMessage?: string;
    className?: string;
};

const margin = { top: 24, right: 16, bottom: 8, left: 16 };

function displayDate(value: string) {
    return new Intl.DateTimeFormat("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(`${value}T00:00:00Z`));
}

export function MetricTrendCard({
    label,
    value,
    data,
    secondaryData = [],
    secondaryLabel,
    secondaryColor = "var(--chart-2)",
    dateRange,
    description,
    href,
    linkLabel,
    percentage = false,
    signed = false,
    defaultView = "area",
    color = "var(--primary)",
    colorSecondary = "var(--chart-1)",
    stepped = false,
    emptyMessage = "No data for this period yet.",
    className,
}: MetricTrendCardProps) {
    const [view, setView] = useState(defaultView);
    const compactCurrency = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: getActiveCurrencyCode(),
        notation: "compact",
        maximumFractionDigits: 2,
    });
    const percent = new Intl.NumberFormat("en-PH", {
        maximumFractionDigits: 1,
    });
    const fullValue = (amount: number) =>
        percentage ? percent.format(amount) + "%" : formatCurrency(amount);
    const compactValue = (amount: number) =>
        percentage
            ? percent.format(amount) + "%"
            : compactCurrency.format(amount);
    const valueColor =
        !signed || value === undefined || value === 0
            ? "text-foreground"
            : value > 0
              ? "text-green-700 dark:text-green-400"
              : "text-red-700 dark:text-red-400";
    const values = data.map((point) => point.value);
    const secondaryValues = new Map(
        secondaryData.map((point) => [point.date, point.value]),
    );
    const chartData = data.map((point) => ({
        ...point,
        secondaryValue: secondaryValues.get(point.date) ?? 0,
    }));
    const hasSecondarySeries = Boolean(secondaryLabel);
    const peak = values.length ? Math.max(...values) : 0;
    const low = values.length ? Math.min(...values) : 0;
    const average = values.length
        ? values.reduce((total, value) => total + value, 0) / values.length
        : 0;
    const hasData = data.length > 0;
    const rangeLabel =
        dateRange.startDate === dateRange.endDate
            ? displayDate(dateRange.startDate)
            : `${displayDate(dateRange.startDate)} – ` +
              displayDate(dateRange.endDate);
    const tooltip = (
        <ChartTooltip
            backgroundColor="var(--card)"
            showDatePill={false}
            showCrosshair={false}
            panelStyle={{ color: "var(--card-foreground)" }}
            content={({ point }) => (
                <div className="space-y-1 text-xs p-2">
                    <p className="font-semibold tabular-nums">
                        {fullValue(Number(point.value))} {label.toLowerCase()}
                    </p>
                    {hasSecondarySeries ? (
                        <p className="font-medium tabular-nums">
                            {fullValue(Number(point.secondaryValue))}{" "}
                            {secondaryLabel?.toLowerCase()}
                        </p>
                    ) : null}
                    <p className="text-muted-foreground">
                        {displayDate(String(point.date))}
                    </p>
                </div>
            )}
        />
    );

    return (
        <Card
            className={cn(
                "relative isolate h-full min-w-0 gap-0 py-0",
                className,
            )}
        >
            <div className="relative flex min-h-[360px] flex-1 flex-col">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                        backgroundImage:
                            "linear-gradient(to left, " +
                            `color-mix(in srgb, ${color} 10%, ` +
                            "transparent), transparent)",
                    }}
                />
                <div
                    aria-hidden="true"
                    className={
                        "pointer-events-none absolute inset-0 opacity-20 " +
                        "[mask-image:linear-gradient(to_right," +
                        "transparent_20%,black)]"
                    }
                    style={{
                        backgroundImage:
                            `radial-gradient(${color} 0.75px, ` +
                            "transparent 0.75px)",
                        backgroundSize: "14px 14px",
                    }}
                />
                <header
                    className={
                        "relative z-10 flex flex-wrap items-center " +
                        "justify-between gap-3 p-5 sm:p-7"
                    }
                >
                    <div className="flex min-w-0 flex-wrap items-center gap-3">
                        <h2 className="font-semibold">{label}</h2>
                        <div
                            aria-label={`${label} chart view`}
                            role="group"
                            className={
                                "flex gap-1 rounded-2xl border " +
                                "bg-card/90 p-1"
                            }
                        >
                            {(
                                [
                                    ["area", ChartNoAxesCombined, "Area chart"],
                                    ["bar", ChartColumn, "Bar chart"],
                                ] as const
                            ).map(([mode, Icon, label]) => (
                                <button
                                    key={mode}
                                    type="button"
                                    aria-label={label}
                                    aria-pressed={view === mode}
                                    title={label}
                                    onClick={() => setView(mode)}
                                    className={cn(
                                        "grid size-8 place-items-center " +
                                            "rounded-xl transition-colors " +
                                            "focus-visible:outline-none " +
                                            "focus-visible:ring-2 " +
                                            "focus-visible:ring-ring",
                                        view === mode
                                            ? "bg-muted text-foreground"
                                            : "text-muted-foreground " +
                                                  "hover:bg-muted/60",
                                    )}
                                >
                                    <Icon className="size-4" />
                                </button>
                            ))}
                        </div>
                    </div>
                    {hasSecondarySeries ? (
                        <div
                            aria-label="Chart legend"
                            className={
                                "flex items-center gap-4 text-xs " +
                                "text-muted-foreground"
                            }
                        >
                            <ChartKey color={colorSecondary} label={label} />
                            <ChartKey
                                color={secondaryColor}
                                label={secondaryLabel ?? "Comparison"}
                            />
                        </div>
                    ) : null}
                </header>
                <div
                    className={
                        "pointer-events-none relative z-10 px-5 " +
                        "pb-4 sm:absolute sm:left-0 sm:top-24 sm:px-7"
                    }
                >
                    <p
                        title={
                            value === undefined ? undefined : fullValue(value)
                        }
                        aria-label={
                            label +
                            ": " +
                            (value === undefined
                                ? "Unavailable"
                                : fullValue(value))
                        }
                        className={
                            "break-all text-2xl font-semibold " +
                            "tracking-tight tabular-nums sm:text-4xl " +
                            valueColor
                        }
                    >
                        {value === undefined ? "—" : compactValue(value)}
                    </p>
                    <p
                        className={
                            "mt-2 min-h-8 text-xs leading-4 " +
                            "text-muted-foreground"
                        }
                    >
                        {description}
                    </p>
                </div>
                <div
                    role="img"
                    aria-label={
                        `${label} from ${rangeLabel}. ` +
                        `Peak ${fullValue(peak)}, ` +
                        `low ${fullValue(low)}.`
                    }
                    className={
                        "relative min-h-[210px] min-w-0 flex-1 " +
                        "sm:min-h-[270px]"
                    }
                >
                    {hasData ? (
                        <div className="absolute inset-0">
                            {view === "area" ? (
                                <AreaChart
                                    className="size-full"
                                    data={chartData}
                                    margin={margin}
                                    style={{
                                        height: "100%",
                                        aspectRatio: "unset",
                                        touchAction: "pan-y",
                                    }}
                                >
                                    {/* <Grid horizontal strokeDasharray="3,5" /> */}
                                    <Area
                                        dataKey="value"
                                        fill={colorSecondary}
                                        stroke={colorSecondary}
                                        curve={
                                            stepped
                                                ? curveStepAfter
                                                : curveMonotoneX
                                        }
                                        fillOpacity={0.2}
                                        gradientToOpacity={0.02}
                                        strokeWidth={2}
                                        showMarkers={data.length === 1}
                                    />
                                    {hasSecondarySeries ? (
                                        <Area
                                            dataKey="secondaryValue"
                                            fill={secondaryColor}
                                            stroke={secondaryColor}
                                            curve={
                                                stepped
                                                    ? curveStepAfter
                                                    : curveMonotoneX
                                            }
                                            fillOpacity={0}
                                            strokeWidth={2}
                                            showMarkers={data.length === 1}
                                        />
                                    ) : null}
                                    {tooltip}
                                </AreaChart>
                            ) : (
                                <BarChart
                                    aspectRatio="auto"
                                    className="size-full"
                                    data={chartData}
                                    xDataKey="date"
                                    margin={margin}
                                    barGap={0.35}
                                >
                                    <Bar
                                        dataKey="value"
                                        fill={colorSecondary}
                                        lineCap={3}
                                    />
                                    {hasSecondarySeries ? (
                                        <Bar
                                            dataKey="secondaryValue"
                                            fill={secondaryColor}
                                            lineCap={3}
                                        />
                                    ) : null}
                                    {tooltip}
                                </BarChart>
                            )}
                        </div>
                    ) : (
                        <div className="grid h-full min-h-52 place-items-center">
                            <p className="px-5 text-sm text-muted-foreground">
                                {emptyMessage}
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <footer
                className={
                    "relative flex flex-wrap items-center justify-between " +
                    "gap-x-6 gap-y-3 border-t bg-card px-5 py-4 sm:px-7"
                }
            >
                <Link
                    href={href}
                    className={
                        "inline-flex items-center gap-1 text-xs " +
                        "font-medium text-primary hover:underline"
                    }
                >
                    {linkLabel} <ArrowUpRight className="size-3.5" />
                </Link>
                <dl className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                    {(
                        [
                            ["Peak", peak],
                            ["Low", low],
                            ["Avg", average],
                        ] as const
                    ).map(([label, value]) => (
                        <div key={label} className="flex items-center gap-1">
                            <dt className="text-muted-foreground">{label}</dt>
                            <dd
                                title={hasData ? fullValue(value) : undefined}
                                className="font-medium tabular-nums"
                            >
                                {hasData ? compactValue(value) : "—"}
                            </dd>
                        </div>
                    ))}
                </dl>
            </footer>
        </Card>
    );
}

function ChartKey({ color, label }: { color: string; label: string }) {
    return (
        <span className="inline-flex items-center gap-1.5">
            <span
                aria-hidden="true"
                className="size-2 rounded-full"
                style={{ backgroundColor: color }}
            />
            {label}
        </span>
    );
}
