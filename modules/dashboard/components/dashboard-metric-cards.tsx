"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
    ArrowUpRight,
    BadgePercent,
    ChartNoAxesCombined,
    CircleDollarSign,
    PackageOpen,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { formatCurrency, getActiveCurrencyCode } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { SalesReport } from "@/modules/reports/types";

export function DashboardMetricCards({
    report,
    inventory,
    inventoryDescription,
}: {
    report: SalesReport;
    inventory?: number;
    inventoryDescription: string;
}) {
    const { total_profit: profit, total_revenue: revenue } = report.summary;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const compactCurrency = new Intl.NumberFormat("en-PH", {
        currency: getActiveCurrencyCode(),
        maximumFractionDigits: 1,
        notation: "compact",
        style: "currency",
    });
    const percentage = new Intl.NumberFormat("en-PH", {
        maximumFractionDigits: 1,
    });

    return (
        <div
            className={
                "grid h-full min-w-0 items-stretch gap-4 " +
                "sm:grid-cols-2 lg:grid-cols-4"
            }
        >
            <SmallMetricCard
                accent="primary"
                detail="Sales revenue after returns"
                href="/reports/sales"
                icon={ChartNoAxesCombined}
                label="Revenue"
                title={formatCurrency(revenue)}
                value={compactCurrency.format(revenue)}
                valueClassName={signedValueClassName(revenue)}
            />
            <SmallMetricCard
                accent="emerald"
                detail="Revenue minus product costs"
                href="/reports/profit"
                icon={CircleDollarSign}
                label="Gross profit"
                title={formatCurrency(profit)}
                value={compactCurrency.format(profit)}
                valueClassName={signedValueClassName(profit)}
            />
            <SmallMetricCard
                accent="violet"
                detail="Gross profit share of revenue"
                href="/reports/profit"
                icon={BadgePercent}
                label="Margin"
                value={`${percentage.format(margin)}%`}
            />
            <SmallMetricCard
                accent="sky"
                detail={inventoryDescription}
                href="/reports/inventory"
                icon={PackageOpen}
                label="Inventory"
                title={
                    inventory === undefined
                        ? undefined
                        : formatCurrency(inventory)
                }
                value={
                    inventory === undefined
                        ? "—"
                        : compactCurrency.format(inventory)
                }
            />
        </div>
    );
}

const accents = {
    emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    primary: "bg-primary/10 text-primary",
    sky: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
    violet: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
};

function signedValueClassName(value: number) {
    if (value > 0) {
        return "text-emerald-700 dark:text-emerald-400";
    }

    if (value < 0) {
        return "text-red-700 dark:text-red-400";
    }

    return undefined;
}

function SmallMetricCard({
    accent,
    detail,
    href,
    icon: Icon,
    label,
    title,
    value,
    valueClassName,
}: {
    accent: keyof typeof accents;
    detail: string;
    href: string;
    icon: LucideIcon;
    label: string;
    title?: string;
    value: string;
    valueClassName?: string;
}) {
    return (
        <Card className="h-full min-w-0 gap-0 py-0 shadow-sm">
            <Link
                className={
                    "group flex h-full min-w-0 flex-col p-4 " +
                    "transition-colors hover:bg-muted/30 " +
                    "focus-visible:outline-none focus-visible:ring-2 " +
                    "focus-visible:ring-inset focus-visible:ring-ring"
                }
                href={href}
            >
                <div className="flex items-center justify-between gap-3">
                    <span
                        className={cn(
                            "grid size-9 shrink-0 place-items-center rounded-2xl",
                            accents[accent],
                        )}
                    >
                        <Icon className="size-4" />
                    </span>
                    <ArrowUpRight
                        className={
                            "size-4 text-muted-foreground transition-transform " +
                            "group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        }
                    />
                </div>
                <p className="mt-5 text-xs font-medium text-muted-foreground">
                    {label}
                </p>
                <p
                    className={cn(
                        "mt-1 break-words text-2xl font-semibold " +
                            "tracking-tight tabular-nums",
                        valueClassName,
                    )}
                    title={title}
                >
                    {value}
                </p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    {detail}
                </p>
            </Link>
        </Card>
    );
}
