"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
    ArrowDownToLine,
    ArrowLeftRight,
    ArrowRight,
    ArrowUpRight,
    CircleDollarSign,
    PackageSearch,
    RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStockMovements } from
    "@/modules/inventory/services/movements";
import type { StockMovementItem } from
    "@/modules/inventory/types/movements";

type ActivityFilter =
    | "all"
    | "sales"
    | "purchases"
    | "returns"
    | "inventory";

type ActivityDetails = {
    Icon: typeof ArrowLeftRight;
    accent: string;
    href: string;
    label: string;
    quantity: string;
};

const filters: { label: string; value: ActivityFilter }[] = [
    { label: "All", value: "all" },
    { label: "Sales", value: "sales" },
    { label: "Purchases", value: "purchases" },
    { label: "Returns", value: "returns" },
    { label: "Inventory", value: "inventory" },
];

const date = new Intl.DateTimeFormat("en-PH", {
    day: "numeric",
    month: "short",
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

function activityDetails(movement: StockMovementItem): ActivityDetails {
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
            accent: "bg-primary/10 text-primary",
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
    const visibleActivity = activity.slice(0, 6);

    return (
        <section className="min-w-0" aria-labelledby="business-activity-title">
            <header className="border-b border-border/70 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h2
                            className="font-semibold"
                            id="business-activity-title"
                        >
                            Business activity
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Your latest sales and inventory movements
                        </p>
                    </div>
                    <Link
                        className={
                            "inline-flex min-h-9 shrink-0 items-center gap-1 " +
                            "text-xs font-medium text-primary " +
                            "hover:underline focus-visible:outline-none " +
                            "focus-visible:ring-2 focus-visible:ring-ring"
                        }
                        href="/inventory/movements"
                    >
                        View all
                        <ArrowUpRight
                            aria-hidden="true"
                            className="size-3.5"
                        />
                    </Link>
                </div>

                <div
                    aria-label="Filter business activity"
                    className={
                        "mt-4 flex max-w-full gap-1 overflow-x-auto " +
                        "rounded-2xl bg-muted/50 p-1 sm:w-fit"
                    }
                    role="group"
                >
                    {filters.map((item) => {
                        const active = filter === item.value;

                        return (
                            <Button
                                aria-pressed={active}
                                className={cn(
                                    "h-8 shrink-0 px-3 text-xs",
                                    "text-muted-foreground",
                                    "hover:bg-background/70",
                                    "hover:text-foreground",
                                    active &&
                                        "bg-background text-foreground " +
                                            "shadow-sm hover:bg-background",
                                )}
                                key={item.value}
                                onClick={() => setFilter(item.value)}
                                size="sm"
                                type="button"
                                variant="ghost"
                            >
                                {item.label}
                            </Button>
                        );
                    })}
                </div>
            </header>

            {movements.isLoading && !movements.data ? (
                <ActivityLoading />
            ) : movements.error && !movements.data ? (
                <div className="p-8 text-center text-sm text-destructive">
                    Unable to load recent business activity.
                </div>
            ) : visibleActivity.length ? (
                <>
                    <ActivityTable activity={visibleActivity} />
                    <ActivityMobileList activity={visibleActivity} />
                </>
            ) : (
                <ActivityEmpty />
            )}
        </section>
    );
}

function ActivityTable({
    activity,
}: {
    activity: StockMovementItem[];
}) {
    return (
        <div
            className="hidden min-w-0 overflow-x-auto sm:block"
            data-dashboard-swipe-ignore
        >
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr
                        className={
                            "border-b border-border/70 bg-muted/25 " +
                            "text-[11px] font-medium uppercase " +
                            "tracking-wide text-muted-foreground"
                        }
                    >
                        <th className="px-6 py-3 font-medium">Activity</th>
                        <th className="px-4 py-3 font-medium">Product</th>
                        <th className="px-4 py-3 font-medium">Quantity</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="w-12 px-4 py-3">
                            <span className="sr-only">Open</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                    {activity.map((movement) => (
                        <ActivityTableRow
                            key={movement.id}
                            movement={movement}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ActivityTableRow({ movement }: { movement: StockMovementItem }) {
    const details = activityDetails(movement);
    const occurredAt = new Date(movement.created_at);

    return (
        <tr className="group transition-colors hover:bg-muted/30">
            <td className="whitespace-nowrap px-6 py-3.5">
                <div className="flex items-center gap-3">
                    <span
                        className={cn(
                            "grid size-9 shrink-0 place-items-center ",
                            "rounded-2xl",
                            details.accent,
                        )}
                    >
                        <details.Icon aria-hidden="true" className="size-4" />
                    </span>
                    <span className="text-sm font-medium">
                        {details.label}
                    </span>
                </div>
            </td>
            <td className="max-w-48 px-4 py-3.5">
                <p className="truncate text-sm">{movement.product_name}</p>
                {movement.reason ? (
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                        {movement.reason}
                    </p>
                ) : null}
            </td>
            <td className="whitespace-nowrap px-4 py-3.5">
                <span className="text-sm font-medium tabular-nums">
                    {details.quantity}
                </span>
            </td>
            <td className="whitespace-nowrap px-4 py-3.5">
                <span className="block text-sm">{date.format(occurredAt)}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                    {time.format(occurredAt)}
                </span>
            </td>
            <td className="px-4 py-3.5 text-right">
                <Link
                    aria-label={`Open ${details.label} for ${movement.product_name}`}
                    className={
                        "inline-grid size-9 place-items-center rounded-2xl " +
                        "text-muted-foreground transition-colors " +
                        "hover:bg-muted hover:text-foreground " +
                        "focus-visible:outline-none focus-visible:ring-2 " +
                        "focus-visible:ring-ring"
                    }
                    href={details.href}
                >
                    <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
            </td>
        </tr>
    );
}

function ActivityMobileList({
    activity,
}: {
    activity: StockMovementItem[];
}) {
    return (
        <div className="divide-y divide-border/70 sm:hidden">
            {activity.map((movement) => (
                <ActivityMobileRow key={movement.id} movement={movement} />
            ))}
        </div>
    );
}

function ActivityMobileRow({ movement }: { movement: StockMovementItem }) {
    const details = activityDetails(movement);
    const occurredAt = new Date(movement.created_at);

    return (
        <Link
            className={
                "group grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] " +
                "items-center gap-3 px-5 py-4 transition-colors " +
                "hover:bg-muted/30 focus-visible:outline-none " +
                "focus-visible:ring-2 focus-visible:ring-inset " +
                "focus-visible:ring-ring"
            }
            href={details.href}
        >
            <span
                className={cn(
                    "grid size-9 place-items-center rounded-2xl",
                    details.accent,
                )}
            >
                <details.Icon aria-hidden="true" className="size-4" />
            </span>
            <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                    {movement.product_name}
                </span>
                <span className="mt-1 block truncate text-xs text-muted-foreground">
                    {details.label} · {date.format(occurredAt)}
                </span>
            </span>
            <span className="text-right">
                <span className="block text-xs font-medium tabular-nums">
                    {details.quantity}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                    {time.format(occurredAt)}
                </span>
            </span>
        </Link>
    );
}

function ActivityEmpty() {
    return (
        <div className="grid min-h-48 place-items-center p-8 text-center">
            <div>
                <PackageSearch
                    aria-hidden="true"
                    className="mx-auto size-6 text-muted-foreground"
                />
                <p className="mt-3 text-sm font-medium">
                    No matching activity yet
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    Try another filter or record a new transaction.
                </p>
            </div>
        </div>
    );
}

function ActivityLoading() {
    return (
        <div
            aria-busy="true"
            aria-label="Loading business activity"
            className="divide-y divide-border/70"
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
