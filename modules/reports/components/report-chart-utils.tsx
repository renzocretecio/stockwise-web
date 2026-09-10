import type { ReactNode } from "react";

import { getActiveCurrencyCode } from "@/lib/currency";

export const reportPrimary = "var(--primary)";
export const reportSecondary = "var(--chart-1)";
export const reportTertiary = "var(--chart-3)";

export const reportChartMargin = {
    top: 12,
    right: 18,
    bottom: 36,
    left: 52,
};

export const horizontalReportChartMargin = {
    top: 10,
    right: 20,
    bottom: 38,
    left: 128,
};

const decimalNumber = new Intl.NumberFormat("en-PH", {
    maximumFractionDigits: 2,
});

const compactNumber = new Intl.NumberFormat("en-PH", {
    notation: "compact",
    maximumFractionDigits: 1,
});

export function ReportChartLegend({
    items,
}: {
    items: { color: string; label: string; dashed?: boolean }[];
}) {
    return (
        <div
            aria-label="Chart legend"
            className={
                "mb-2 flex min-h-5 flex-wrap items-center justify-end " +
                "gap-x-4 gap-y-1 text-xs text-muted-foreground"
            }
        >
            {items.map((item) => (
                <span
                    className="inline-flex items-center gap-1.5"
                    key={item.label}
                >
                    <span
                        aria-hidden="true"
                        className={
                            item.dashed
                                ? "w-4 border-t-2 border-dashed"
                                : "size-2 rounded-full"
                        }
                        style={
                            item.dashed
                                ? { borderColor: item.color }
                                : { backgroundColor: item.color }
                        }
                    />
                    {item.label}
                </span>
            ))}
        </div>
    );
}

export function EmptyReportChart({ children }: { children: ReactNode }) {
    return (
        <div
            className={
                "flex h-[280px] items-center justify-center text-sm " +
                "text-muted-foreground"
            }
        >
            {children}
        </div>
    );
}

export function toChartNumber(value: unknown) {
    const parsed = typeof value === "number" ? value : Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
}

export function formatChartNumber(value: number) {
    return decimalNumber.format(value);
}

export function formatWholeChartNumber(value: number) {
    return decimalNumber.format(Math.round(value));
}

export function formatSignedChartNumber(value: number) {
    if (value === 0) {
        return "0";
    }
    return `${value > 0 ? "+" : ""}${decimalNumber.format(value)}`;
}

export function formatCompactChartNumber(value: number) {
    return compactNumber.format(value);
}

export function formatCompactChartCurrency(value: number) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: getActiveCurrencyCode(),
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value);
}
