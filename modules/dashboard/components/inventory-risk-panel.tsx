"use client";

import Link from "next/link";
import { useState } from "react";
import {
    AlertTriangle,
    ArrowUpRight,
    CalendarClock,
    ClipboardList,
    PackageSearch,
    PackageX,
    Timer,
    Truck,
} from "lucide-react";

import { formatCurrency } from "@/lib/currency";
import { useDashboard } from "@/modules/dashboard/services/dashboard";

const thresholds = [3, 7, 14, 30];

export function InventoryRiskPanel({ compact = false }: { compact?: boolean }) {
    const [stockDaysThreshold, setStockDaysThreshold] = useState(7);
    const dashboard = useDashboard(stockDaysThreshold);

    if (dashboard.error) {
        return (
            <aside className="p-5 text-sm text-destructive">
                Unable to load the inventory-risk snapshot.
            </aside>
        );
    }

    if (dashboard.isLoading || !dashboard.data) {
        return <InventoryRiskLoading compact={compact} />;
    }

    const loadedRisk = dashboard.data.inventory_risk;
    const rows = [
        {
            label: compact ? "Out of stock" : "Out-of-stock SKUs",
            value: loadedRisk.out_of_stock_skus,
            icon: PackageX,
            href: "/reports/low-stock",
        },
        {
            label: compact ? "Low stock" : "Low-stock SKUs",
            value: loadedRisk.low_stock_skus,
            icon: AlertTriangle,
            href: "/reports/low-stock",
        },
        {
            label: "Below reorder point",
            value: loadedRisk.below_reorder_point,
            icon: PackageSearch,
            href: "/reports/low-stock",
        },
        {
            label: `Under ${loadedRisk.stock_days_threshold} days of stock`,
            value: loadedRisk.below_days_of_stock,
            icon: Timer,
            href: "/dashboard/intelligence",
        },
        {
            label: "Pending reorder suggestions",
            value: loadedRisk.pending_reorder_recommendations,
            icon: ClipboardList,
            href: "/dashboard/intelligence",
        },
        {
            label: "Deliveries expected today",
            value: loadedRisk.expected_deliveries_today,
            icon: Truck,
            href: "/purchases",
        },
        {
            label: "Late purchase orders",
            value: loadedRisk.late_purchase_orders,
            icon: CalendarClock,
            href: "/purchases",
        },
    ];
    const compactSignals = [
        {
            action: "Restock now",
            href: "/reports/low-stock",
            barClassName: "bg-red-500",
            markerClassName: "bg-red-500 ring-red-500/15",
            label: "Out of stock",
            severity: "Critical",
            severityClassName: "text-red-700 dark:text-red-400",
            value: loadedRisk.out_of_stock_skus,
        },
        {
            action: "Review stock",
            href: "/reports/low-stock",
            barClassName: "bg-amber-500",
            markerClassName: "bg-amber-500 ring-amber-500/15",
            label: "Low stock",
            severity: "High",
            severityClassName: "text-amber-700 dark:text-amber-400",
            value: loadedRisk.low_stock_skus,
        },
        {
            action: "Plan reorder",
            href: "/reports/low-stock",
            barClassName: "bg-primary",
            markerClassName: "bg-primary ring-primary/15",
            label: "Below reorder point",
            severity: "Medium",
            severityClassName: "text-primary",
            value: loadedRisk.below_reorder_point,
        },
        {
            action: "Review forecast",
            href: "/dashboard/intelligence",
            barClassName: "bg-primary/55",
            markerClassName: "bg-primary/55 ring-primary/10",
            label: `Under ${loadedRisk.stock_days_threshold} days`,
            severity: "Watch",
            severityClassName: "text-muted-foreground",
            value: loadedRisk.below_days_of_stock,
        },
    ];
    const largestSignal = Math.max(
        1,
        ...compactSignals.map((signal) => signal.value),
    );

    return (
        <aside className="@container/risk flex min-w-0 flex-col gap-4 bg-card p-3">
            <div
                className={
                    "flex flex-col gap-3 @min-[360px]/risk:flex-row " +
                    "@min-[360px]/risk:items-start @min-[360px]/risk:justify-between"
                }
            >
                <div>
                    <p className="text-sm font-semibold">
                        {compact ? "Needs attention" : "Inventory risk"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {compact
                            ? "Current stock issues that may affect sales"
                            : "Current operational snapshot"}
                    </p>
                </div>
                {!compact ? (
                    <select
                        aria-label="Days-of-stock threshold"
                        className={
                            "h-8 border bg-background px-2 text-xs text-muted-foreground"
                        }
                        onChange={(event) => {
                            setStockDaysThreshold(Number(event.target.value));
                        }}
                        value={stockDaysThreshold}
                    >
                        {thresholds.map((days) => (
                            <option key={days} value={days}>
                                {days} days
                            </option>
                        ))}
                    </select>
                ) : null}
                {compact ? (
                    <Link
                        className={
                            "inline-flex shrink-0 items-center gap-1 self-start " +
                            "text-xs font-medium text-primary hover:underline"
                        }
                        href="/dashboard/intelligence"
                    >
                        Review risks
                        <ArrowUpRight className="size-3.5" />
                    </Link>
                ) : null}
            </div>

            {compact ? (
                <div className="flex min-w-0 flex-1 flex-col gap-4">
                    <ol className="space-y-1" aria-label="Stock risk ladder">
                        {compactSignals.map((signal, index) => (
                            <li key={signal.label}>
                                <Link
                                    aria-label={
                                        signal.severity +
                                        ": " +
                                        signal.label +
                                        ", " +
                                        signal.value +
                                        " SKUs. " +
                                        signal.action
                                    }
                                    className={
                                        "group grid grid-cols-[4rem_1rem_minmax(0,1fr)] " +
                                        "gap-x-3 rounded-2xl p-2.5 " +
                                        "transition-colors hover:bg-muted/50 " +
                                        "focus-visible:outline-none " +
                                        "focus-visible:ring-2 focus-visible:ring-ring"
                                    }
                                    href={signal.href}
                                >
                                    <span
                                        className={
                                            "pt-0.5 text-[0.65rem] font-semibold " +
                                            "uppercase tracking-wide " +
                                            signal.severityClassName
                                        }
                                    >
                                        {signal.severity}
                                    </span>
                                    <span
                                        aria-hidden="true"
                                        className="relative flex justify-center"
                                    >
                                        {index > 0 ? (
                                            <span className="absolute -top-2.5 bottom-1/2 w-px bg-border" />
                                        ) : null}
                                        {index < compactSignals.length - 1 ? (
                                            <span className="absolute top-1/2 -bottom-2.5 w-px bg-border" />
                                        ) : null}
                                        <span
                                            className={
                                                "relative z-10 mt-1 size-2.5 " +
                                                "rounded-full ring-4 " +
                                                signal.markerClassName
                                            }
                                        />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="flex items-center gap-2">
                                            <span className="min-w-0 flex-1 text-sm font-medium">
                                                {signal.label}
                                            </span>
                                            <span className="font-semibold tabular-nums">
                                                {signal.value}
                                            </span>
                                            <ArrowUpRight
                                                className={
                                                    "size-3.5 shrink-0 text-muted-foreground " +
                                                    "transition-transform group-hover:-translate-y-0.5 " +
                                                    "group-hover:translate-x-0.5"
                                                }
                                            />
                                        </span>
                                        <span
                                            aria-hidden="true"
                                            className="mt-2 block h-1.5 overflow-hidden rounded-full bg-muted"
                                        >
                                            <span
                                                className={
                                                    "block h-full rounded-full " +
                                                    signal.barClassName
                                                }
                                                style={{
                                                    width:
                                                        (signal.value /
                                                            largestSignal) *
                                                            100 +
                                                        "%",
                                                }}
                                            />
                                        </span>
                                        <span className="mt-1.5 block text-xs text-muted-foreground">
                                            {signal.action}
                                        </span>
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ol>
                </div>
            ) : (
                <>
                    <div className="my-5 bg-destructive/5 p-4">
                        <p className="text-xs font-medium text-muted-foreground">
                            Estimated sales at risk
                        </p>
                        <p className="mt-1 text-2xl font-semibold tabular-nums">
                            {formatCurrency(loadedRisk.estimated_sales_at_risk)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Revenue exposed during supplier lead times
                        </p>
                    </div>

                    <div className="divide-y">
                        {rows.map((row) => {
                            const Icon = row.icon;

                            return (
                                <Link
                                    className={
                                        "group flex items-center gap-3 py-3 first:pt-0 " +
                                        "last:pb-0"
                                    }
                                    href={row.href}
                                    key={row.label}
                                >
                                    <span
                                        className={
                                            "grid size-8 shrink-0 place-items-center " +
                                            "rounded-2xl bg-muted"
                                        }
                                    >
                                        <Icon className="size-4 text-primary" />
                                    </span>
                                    <span
                                        className={
                                            "min-w-0 flex-1 text-sm " +
                                            "text-muted-foreground"
                                        }
                                    >
                                        {row.label}
                                    </span>
                                    <span className="font-semibold tabular-nums">
                                        {row.value}
                                    </span>
                                    <ArrowUpRight
                                        className={
                                            "size-3.5 text-muted-foreground " +
                                            "transition-transform " +
                                            "group-hover:-translate-y-0.5 " +
                                            "group-hover:translate-x-0.5"
                                        }
                                    />
                                </Link>
                            );
                        })}
                    </div>
                </>
            )}
        </aside>
    );
}

function InventoryRiskLoading({ compact = false }: { compact?: boolean }) {
    return (
        <aside className="space-y-4 p-5">
            <div className="h-10 w-40 animate-pulse bg-muted/60" />
            <div className="h-24 animate-pulse bg-muted/40" />
            {Array.from({ length: compact ? 4 : 7 }, (_, item) => (
                <div className="h-9 animate-pulse bg-muted/30" key={item} />
            ))}
        </aside>
    );
}
