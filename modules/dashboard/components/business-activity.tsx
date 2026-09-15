"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
    ArrowDownToLine,
    ArrowLeftRight,
    ArrowUpRight,
    CircleDollarSign,
    PackageSearch,
    RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStockMovements } from "@/modules/inventory/services/movements";
import type { StockMovementItem } from "@/modules/inventory/types/movements";

type ActivityFilter = "all" | "sales" | "purchases" | "returns" | "inventory";

const filters: { label: string; value: ActivityFilter }[] = [
    { label: "All activity", value: "all" },
    { label: "Sales", value: "sales" },
    { label: "Purchases", value: "purchases" },
    { label: "Returns", value: "returns" },
    { label: "Inventory", value: "inventory" },
];

const date = new Intl.DateTimeFormat("en-PH", {
    day: "numeric",
    month: "long",
    timeZone: "Asia/Manila",
    year: "numeric",
});

const time = new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
});

function category(type: string): Exclude<ActivityFilter, "all"> {
    if (type === "sale") return "sales";
    if (type === "purchase" || type === "purchase_receive") {
        return "purchases";
    }
    if (type === "return") return "returns";
    return "inventory";
}

function activityDetails(movement: StockMovementItem) {
    const type = category(movement.movement_type);
    const quantity = Math.abs(movement.quantity_change);
    const unitLabel = quantity === 1 ? "unit" : "units";

    if (type === "sales") {
        return {
            Icon: CircleDollarSign,
            accent: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
            href: "/sales",
            label: "Sale completed",
            quantity: `${quantity} ${unitLabel} sold`,
        };
    }
    if (type === "purchases") {
        return {
            Icon: ArrowDownToLine,
            accent: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
            href: "/purchases",
            label: "Purchase received",
            quantity: `${quantity} ${unitLabel} received`,
        };
    }
    if (type === "returns") {
        return {
            Icon: RotateCcw,
            accent: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
            href: "/sales/returns",
            label: "Sale returned",
            quantity: `${quantity} ${unitLabel} returned`,
        };
    }

    const readableType = movement.movement_type
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

    return {
        Icon: ArrowLeftRight,
        accent: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
        href: `/inventory/movements?product_id=${movement.product_id}`,
        label: readableType,
        quantity:
            `${movement.quantity_change > 0 ? "+" : ""}` +
            `${movement.quantity_change} ${unitLabel}`,
    };
}

export function BusinessActivity() {
    const [filter, setFilter] = useState<ActivityFilter>("all");
    const movements = useStockMovements(1, 15);
    const activity = useMemo(() => {
        const rows = movements.data?.movements ?? [];
        return filter === "all"
            ? rows
            : rows.filter(
                  (movement) => category(movement.movement_type) === filter,
              );
    }, [filter, movements.data?.movements]);

    return (
        <section className="min-w-0" aria-labelledby="business-activity-title">
            <header
                className={
                    "flex flex-col gap-4 border-b p-5 sm:p-6 " +
                    "lg:flex-row lg:items-end lg:justify-between"
                }
            >
                <div>
                    <h2 id="business-activity-title" className="font-semibold">
                        Business activity
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Latest sales, receipts, returns, and stock changes
                    </p>
                </div>
                <Link
                    className={
                        "inline-flex items-center gap-1 text-xs font-medium " +
                        "text-primary hover:underline"
                    }
                    href="/inventory/movements"
                >
                    View all activity <ArrowUpRight className="size-3.5" />
                </Link>
            </header>

            <div
                aria-label="Filter business activity"
                className="flex gap-2 overflow-x-auto border-b p-3 sm:px-5"
                role="group"
            >
                {filters.map((item) => (
                    <Button
                        aria-pressed={filter === item.value}
                        className="shrink-0"
                        key={item.value}
                        onClick={() => setFilter(item.value)}
                        size="sm"
                        type="button"
                        variant={filter === item.value ? "default" : "ghost"}
                    >
                        {item.label}
                    </Button>
                ))}
            </div>

            {movements.isLoading && !movements.data ? (
                <ActivityLoading />
            ) : movements.error && !movements.data ? (
                <div className="p-8 text-center text-sm text-destructive">
                    Unable to load recent business activity.
                </div>
            ) : activity.length ? (
                <div className="divide-y">
                    {activity.slice(0, 10).map((movement) => (
                        <ActivityRow key={movement.id} movement={movement} />
                    ))}
                </div>
            ) : (
                <div className="grid min-h-48 place-items-center p-8 text-center">
                    <div>
                        <PackageSearch className="mx-auto size-6 text-muted-foreground" />
                        <p className="mt-3 text-sm font-medium">
                            No matching activity yet
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Try another filter or record a new transaction.
                        </p>
                    </div>
                </div>
            )}
        </section>
    );
}

function ActivityRow({ movement }: { movement: StockMovementItem }) {
    const details = activityDetails(movement);
    const occurredAt = new Date(movement.created_at);

    return (
        <Link
            className={
                "group grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] " +
                "items-center gap-3 px-5 py-4 transition-colors " +
                "hover:bg-muted/40 focus-visible:outline-none " +
                "focus-visible:ring-2 focus-visible:ring-inset " +
                "focus-visible:ring-ring sm:px-6"
            }
            href={details.href}
        >
            <span
                className={cn(
                    "grid size-9 place-items-center rounded-2xl",
                    details.accent,
                )}
            >
                <details.Icon className="size-4" />
            </span>
            <span className="min-w-0">
                <span className="flex min-w-0 flex-wrap items-baseline gap-x-2">
                    <span className="font-medium">{details.label}</span>
                    <span className="truncate text-xs text-muted-foreground">
                        {movement.product_name}
                    </span>
                </span>
                <span className="mt-1 block truncate text-xs text-muted-foreground">
                    {movement.reason || details.quantity}
                </span>
            </span>
            <span className="flex items-center gap-3 text-right">
                <span>
                    <span className="block text-sm font-medium tabular-nums">
                        {details.quantity}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                        {date.format(occurredAt)} · {time.format(occurredAt)}
                    </span>
                </span>
                <ArrowUpRight
                    className={
                        "hidden size-4 text-muted-foreground transition-transform " +
                        "group-hover:-translate-y-0.5 group-hover:translate-x-0.5 " +
                        "sm:block"
                    }
                />
            </span>
        </Link>
    );
}

function ActivityLoading() {
    return (
        <div
            className="divide-y"
            aria-label="Loading business activity"
            aria-busy
        >
            {[0, 1, 2, 3, 4].map((item) => (
                <div
                    className="flex items-center gap-3 px-5 py-4 sm:px-6"
                    key={item}
                >
                    <div className="size-9 animate-pulse rounded-2xl bg-muted" />
                    <div className="min-w-0 flex-1">
                        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                        <div className="mt-2 h-3 w-28 animate-pulse rounded bg-muted" />
                    </div>
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                </div>
            ))}
        </div>
    );
}
