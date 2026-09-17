"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import {
    HeatmapCells,
    HeatmapChart,
    HeatmapLegend,
    HeatmapTooltip,
    HeatmapXAxis,
    HeatmapYAxis,
    type HeatmapColumn,
    type HeatmapLevelColors,
} from "@/components/charts/heatmap";
import { useSalesReportByDateRange } from "@/modules/reports/services/reports";
import type { ReportDateRange, SalesReport } from "@/modules/reports/types";

type HeatmapResult = {
    data: HeatmapColumn[];
    dailySales: Map<string, number>;
};

const heatmapColors = [
    "color-mix(in srgb, var(--primary) 7%, transparent)",
    "color-mix(in srgb, var(--primary) 24%, transparent)",
    "color-mix(in srgb, var(--primary) 44%, transparent)",
    "color-mix(in srgb, var(--primary) 68%, transparent)",
    "var(--primary)",
] as const satisfies HeatmapLevelColors;

const number = new Intl.NumberFormat("en-PH", {
    maximumFractionDigits: 1,
});

export function DemandPatterns() {
    const { dateRange, calendarRange, label, previousRange, previousLabel } =
        currentQuarter();
    const sales = useSalesReportByDateRange(dateRange);
    const previousSales = useSalesReportByDateRange(previousRange);
    const report = sales.data;
    const previousReport = previousSales.data;

    if (
        (sales.isLoading && !report) ||
        (previousSales.isLoading && !previousReport)
    ) {
        return <DemandPatternsLoading />;
    }

    if (!report || !previousReport) {
        return (
            <section className="min-w-0 p-5">
                <DemandPatternsHeader />
                <p
                    className={
                        "mt-6 text-sm " +
                        (sales.error || previousSales.error
                            ? "text-destructive"
                            : "text-muted-foreground")
                    }
                >
                    {sales.isPaused || previousSales.isPaused
                        ? "Both quarters must be saved to compare offline."
                        : "Unable to load the quarter comparison."}
                </p>
            </section>
        );
    }

    const maximum = Math.max(
        0,
        ...report.by_day.map((day) => day.sales_count),
        ...previousReport.by_day.map((day) => day.sales_count),
    );
    const heatmap = buildCalendarHeatmap(report, calendarRange, maximum);
    const previousHeatmap = buildCalendarHeatmap(
        previousReport,
        previousRange,
        maximum,
    );
    const comparison = compareQuarters(
        report,
        previousReport,
        dateRange,
        previousRange,
    );

    return (
        <section aria-labelledby="demand-patterns-title" className="min-w-0">
            <div className="p-5">
                <DemandPatternsHeader />
                <div className="mt-5 space-y-5">
                    {[
                        {
                            title: "Current quarter",
                            label,
                            heatmap,
                            calendarRange,
                            dateRange,
                        },
                        {
                            title: "Previous quarter",
                            label: previousLabel,
                            heatmap: previousHeatmap,
                            calendarRange: previousRange,
                            dateRange: previousRange,
                        },
                    ].map((quarter) => (
                        <div key={quarter.title}>
                            <div className="mb-3 flex flex-wrap justify-between gap-1 text-xs">
                                <h3 className="font-medium">{quarter.title}</h3>
                                <span className="text-muted-foreground">
                                    {quarter.label}
                                </span>
                            </div>
                            <QuarterHeatmap {...quarter} />
                        </div>
                    ))}
                </div>
                <HeatmapLegend
                    align="center"
                    cellSize={10}
                    className="mt-4"
                    colorScale={heatmapColorScale}
                    cornerRadius={2}
                    lessLabel="Less"
                    moreLabel="More"
                />
                <p className="mt-2 text-center text-xs text-muted-foreground">
                    Same color scale for both quarters
                </p>
                <div className="mt-5 border-t border-border/70 pt-4">
                    <p className="text-xs font-medium">Average daily sales</p>
                    <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="text-xl font-semibold tabular-nums">
                            {number.format(comparison.currentAverage)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            vs {number.format(comparison.previousAverage)}{" "}
                            previously
                        </span>
                    </div>
                    <p
                        className={
                            "mt-2 text-xs font-medium " +
                            (comparison.change === null ||
                            comparison.change === 0
                                ? "text-muted-foreground"
                                : comparison.change > 0
                                  ? "text-emerald-700 dark:text-emerald-400"
                                  : "text-red-700 dark:text-red-400")
                        }
                    >
                        {comparison.change === null
                            ? "No sales in the previous comparison period"
                            : comparison.change === 0
                              ? "No change from the previous quarter"
                              : `${comparison.change > 0 ? "+" : ""}` +
                                `${number.format(comparison.change)}% ` +
                                "vs the previous quarter"}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        First {comparison.days} days of each quarter, including
                        days with no sales. Today is partial.
                    </p>
                </div>
            </div>
        </section>
    );
}

function QuarterHeatmap({
    heatmap,
    calendarRange,
    dateRange,
}: {
    heatmap: HeatmapResult;
    calendarRange: ReportDateRange;
    dateRange: ReportDateRange;
}) {
    return (
        <div
            aria-label={
                "Daily completed sales from " +
                `${calendarRange.startDate} to ` +
                `${calendarRange.endDate}, data through ${dateRange.endDate}`
            }
            className="mx-auto max-w-full"
            role="img"
            style={{ width: 60 + heatmap.data.length * 20 }}
        >
            <HeatmapChart
                animate
                className="mx-auto"
                data={heatmap.data}
                gap={3}
                levelColors={heatmapColors}
                margin={{
                    bottom: 0,
                    left: 40,
                    right: 20,
                    top: 28,
                }}
                revealSignature={`${dateRange.startDate}:` + dateRange.endDate}
                weekStartDay={0}
            >
                <HeatmapCells cornerRadius={2} hideGhostCells={false} />
                <HeatmapXAxis />
                <HeatmapYAxis labelFormat="full" tickFilter="odd" />
                <HeatmapTooltip
                    backgroundColor="var(--popover)"
                    formatLabel={(_, date) =>
                        formatDailySales(
                            heatmap,
                            date,
                            dateRange,
                            calendarRange,
                        )
                    }
                />
            </HeatmapChart>
        </div>
    );
}

function DemandPatternsHeader() {
    return (
        <header className="flex items-start justify-between gap-3">
            <div className="min-w-0">
                <h2 className="font-semibold" id="demand-patterns-title">
                    Demand patterns
                </h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Daily completed sales · Quarter comparison
                </p>
            </div>
            <Link
                className={
                    "inline-flex min-h-11 shrink-0 items-center gap-1 " +
                    "text-xs font-medium text-primary hover:underline " +
                    "focus-visible:outline-none focus-visible:ring-2 " +
                    "focus-visible:ring-ring"
                }
                href="/dashboard/overview?tab=demand-forecast"
            >
                Forecast
                <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </Link>
        </header>
    );
}

function DemandPatternsLoading() {
    return (
        <section
            aria-busy="true"
            aria-label="Loading demand patterns"
            className="min-w-0 p-5"
        >
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-48 animate-pulse rounded bg-muted" />
            {[0, 1].map((quarter) => (
                <div key={quarter} className="mt-5">
                    <div className="mb-3 h-4 w-32 animate-pulse rounded bg-muted" />
                    <div className="mx-auto grid max-w-80 grid-cols-13 gap-[3px]">
                        {Array.from({ length: 91 }, (_, index) => (
                            <div
                                className="aspect-square animate-pulse rounded-sm bg-muted"
                                key={index}
                            />
                        ))}
                    </div>
                </div>
            ))}
            <div className="mx-auto mt-3 h-3 w-28 animate-pulse rounded bg-muted" />
            <div className="mt-6 h-4 animate-pulse rounded bg-muted" />
        </section>
    );
}

function compareQuarters(
    report: SalesReport,
    previousReport: SalesReport,
    dateRange: ReportDateRange,
    previousRange: ReportDateRange,
) {
    const dayCount = (range: ReportDateRange) =>
        Math.round(
            (parseDate(range.endDate).getTime() -
                parseDate(range.startDate).getTime()) /
                86_400_000,
        ) + 1;
    const days = Math.min(dayCount(dateRange), dayCount(previousRange));
    const total = (data: SalesReport, start: string) => {
        const end = parseDate(start);
        end.setUTCDate(end.getUTCDate() + days - 1);
        const endKey = dateKeyFor(end);
        return data.by_day.reduce(
            (sum, day) =>
                day.date >= start && day.date <= endKey
                    ? sum + day.sales_count
                    : sum,
            0,
        );
    };
    const current = total(report, dateRange.startDate);
    const previous = total(previousReport, previousRange.startDate);

    return {
        days,
        currentAverage: current / days,
        previousAverage: previous / days,
        change:
            previous > 0
                ? ((current - previous) / previous) * 100
                : current === 0
                  ? 0
                  : null,
    };
}

function buildCalendarHeatmap(
    report: SalesReport,
    dateRange: ReportDateRange,
    maximum: number,
): HeatmapResult {
    const dailySales = salesByDateMap(report);
    const rangeStart = parseDate(dateRange.startDate);
    const rangeEnd = parseDate(dateRange.endDate);
    const gridStart = new Date(rangeStart);
    const gridEnd = new Date(rangeEnd);
    const data: HeatmapColumn[] = [];

    gridStart.setUTCDate(gridStart.getUTCDate() - gridStart.getUTCDay());
    gridEnd.setUTCDate(gridEnd.getUTCDate() + (6 - gridEnd.getUTCDay()));

    for (
        let weekStart = new Date(gridStart), weekIndex = 0;
        weekStart <= gridEnd;
        weekStart.setUTCDate(weekStart.getUTCDate() + 7), weekIndex += 1
    ) {
        const bins = Array.from({ length: 7 }, (_, dayIndex) => {
            const date = new Date(weekStart);
            date.setUTCDate(date.getUTCDate() + dayIndex);
            const inRange = date >= rangeStart && date <= rangeEnd;
            const salesCount = inRange
                ? (dailySales.get(dateKeyFor(date)) ?? 0)
                : 0;

            return {
                bin: dayIndex,
                count: heatLevel(salesCount, maximum),
                date,
            };
        });

        data.push({ bin: weekIndex, bins });
    }

    return { data, dailySales };
}

function salesByDateMap(report: SalesReport) {
    return new Map(report.by_day.map((day) => [day.date, day.sales_count]));
}

function heatLevel(value: number, maximum: number) {
    if (value <= 0 || maximum <= 0) return 0;
    return Math.max(1, Math.min(4, Math.ceil((value / maximum) * 4)));
}

function heatmapColorScale(level: number | null | undefined) {
    const index = Math.max(0, Math.min(4, Math.round(level ?? 0)));
    return heatmapColors[index];
}

function formatDailySales(
    heatmap: HeatmapResult,
    date: Date,
    dateRange: ReportDateRange,
    calendarRange: ReportDateRange,
) {
    const dateKey = dateKeyFor(date);

    if (dateKey < calendarRange.startDate || dateKey > calendarRange.endDate) {
        return "Outside this quarter";
    }

    if (dateKey > dateRange.endDate) {
        return "Upcoming date — no sales yet";
    }

    const salesCount = heatmap.dailySales.get(dateKey) ?? 0;
    return `${salesCount} completed ${salesCount === 1 ? "sale" : "sales"}`;
}

function currentQuarter(now = new Date()) {
    const year = now.getFullYear();
    const firstMonth = Math.floor(now.getMonth() / 3) * 3;
    const start = new Date(Date.UTC(year, firstMonth, 1));
    const end = new Date(Date.UTC(year, firstMonth + 3, 0));
    const today = new Date(Date.UTC(year, now.getMonth(), now.getDate()));
    const previousStart = new Date(Date.UTC(year, firstMonth - 3, 1));
    const previousEnd = new Date(Date.UTC(year, firstMonth, 0));
    const month = new Intl.DateTimeFormat("en", {
        month: "short",
        timeZone: "UTC",
    });

    return {
        previousRange: {
            startDate: dateKeyFor(previousStart),
            endDate: dateKeyFor(previousEnd),
        },
        previousLabel:
            `Q${Math.floor(previousStart.getUTCMonth() / 3) + 1} ` +
            `${previousStart.getUTCFullYear()} · ` +
            `${month.format(previousStart)}–${month.format(previousEnd)}`,
        dateRange: {
            startDate: dateKeyFor(start),
            endDate: dateKeyFor(today),
        },
        calendarRange: {
            startDate: dateKeyFor(start),
            endDate: dateKeyFor(end),
        },
        label:
            `Q${firstMonth / 3 + 1} ${year} · ` +
            `${month.format(start)}–${month.format(end)}`,
    };
}

function dateKeyFor(date: Date) {
    return date.toISOString().slice(0, 10);
}

function parseDate(value: string) {
    return new Date(`${value}T00:00:00Z`);
}
