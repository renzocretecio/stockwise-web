"use client";

import { RefreshCw, type LucideIcon } from "lucide-react";

import { DateRangePicker } from "@/components/DateRangePicker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    ReportExportButton,
    type ExportableReport,
} from "@/modules/reports/components/report-export-button";
import {
    fromPickerRange,
    toPickerRange,
} from "@/modules/reports/date-range";
import type { ReportDateRange } from "@/modules/reports/types";

export { currency } from "@/lib/currency";

export const number = new Intl.NumberFormat("en-PH", {
    maximumFractionDigits: 3,
});

export function ReportHeader({
    title,
    description,
    icon: Icon,
    dateRange,
    onDateRangeChange,
    onRefresh,
    isRefreshing = false,
    exportReport,
}: {
    title: string;
    description: string;
    icon: LucideIcon;
    dateRange?: ReportDateRange;
    onDateRangeChange?: (range: ReportDateRange) => void;
    onRefresh?: () => void;
    isRefreshing?: boolean;
    exportReport?: ExportableReport;
}) {
    return (
        <header
            className={
                "flex flex-col gap-4 border-b p-4 sm:flex-row " +
                "sm:items-end sm:justify-between"
            }
        >
            <div className="flex items-start gap-3">
                <div
                    className={
                        "mt-0.5 flex size-9 shrink-0 items-center " +
                        "justify-center bg-muted text-primary"
                    }
                >
                    <Icon className="size-4" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {title}
                    </h1>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                {exportReport ? (
                    <ReportExportButton
                        dateRange={dateRange}
                        report={exportReport}
                    />
                ) : null}
                {dateRange && onDateRangeChange ? (
                    <DateRangePicker
                        maxDays={365}
                        onChange={(range) => {
                            const nextRange = fromPickerRange(range);
                            if (nextRange) {
                                onDateRangeChange(nextRange);
                            }
                        }}
                        value={toPickerRange(dateRange)}
                    />
                ) : null}
                {onRefresh ? (
                    <Button
                        aria-label={`Refresh ${title}`}
                        disabled={isRefreshing}
                        onClick={onRefresh}
                        size="icon"
                        type="button"
                        variant="outline"
                    >
                        <RefreshCw
                            className={cn(
                                "size-4",
                                isRefreshing && "animate-spin",
                            )}
                        />
                    </Button>
                ) : null}
            </div>
        </header>
    );
}

export function ReportError({ error }: { error: unknown }) {
    return (
        <section
            className={
                "border-b bg-destructive/5 p-5 text-sm " +
                "text-destructive"
            }
        >
            <p className="font-medium">Unable to load this report</p>
            <p className="mt-1 text-xs text-muted-foreground">
                {error instanceof Error ? error.message : "Please try again."}
            </p>
        </section>
    );
}

export function ReportLoading() {
    return (
        <div className="space-y-px bg-border">
            <div className="h-16 animate-pulse bg-background" />
            <div className="h-[300px] animate-pulse bg-background" />
            <div className="h-16 animate-pulse bg-background" />
        </div>
    );
}
