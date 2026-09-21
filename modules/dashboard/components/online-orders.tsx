"use client";

import Link from "next/link";
import {
    ArrowRight,
    ArrowUpRight,
    PackageSearch,
    ShoppingBag,
    Store,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import {
    formatStoreCurrency,
    formatStoreDate,
    OrderStatusBadge,
} from "@/modules/storefront/components/storefront-ui";
import {
    useStorefront,
    useStoreOrders,
} from "@/modules/storefront/services";
import type { StoreOrder } from "@/modules/storefront/types";

export function OnlineOrders() {
    const storefront = useStorefront();
    const hasStore = Boolean(storefront.data);
    const orders = useStoreOrders(1, 6, "all", "", hasStore);
    const storeNotCreated =
        storefront.error instanceof ApiError &&
        storefront.error.status === 404;

    return (
        <section className="min-w-0" aria-labelledby="online-orders-title">
            <header className="flex items-start justify-between gap-4 border-b border-border/70 p-5 sm:p-6">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <ShoppingBag
                            aria-hidden="true"
                            className="size-4 text-primary"
                        />
                        <h2
                            className="font-semibold"
                            id="online-orders-title"
                        >
                            Online orders
                        </h2>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Recent customer requests from your public store
                    </p>
                </div>
                {hasStore ? (
                    <Link
                        className={
                            "inline-flex min-h-9 shrink-0 items-center gap-1 " +
                            "text-xs font-medium text-primary " +
                            "hover:underline focus-visible:outline-none " +
                            "focus-visible:ring-2 focus-visible:ring-ring"
                        }
                        href="/storefront?tab=orders"
                    >
                        Manage orders
                        <ArrowUpRight
                            aria-hidden="true"
                            className="size-3.5"
                        />
                    </Link>
                ) : null}
            </header>

            {storefront.isLoading || (hasStore && orders.isLoading) ? (
                <OrdersLoading />
            ) : storeNotCreated ? (
                <StoreSetupEmpty />
            ) : storefront.error || orders.error ? (
                <div className="grid min-h-56 place-items-center p-8 text-center">
                    <div>
                        <ShoppingBag className="mx-auto size-6 text-muted-foreground" />
                        <p className="mt-3 text-sm font-medium">
                            Unable to load online orders
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Refresh the page to try again.
                        </p>
                    </div>
                </div>
            ) : orders.data?.orders.length ? (
                <>
                    <OrdersTable
                        currencyCode={
                            storefront.data?.currency_code ?? "PHP"
                        }
                        orders={orders.data.orders}
                    />
                    <OrdersMobileList
                        currencyCode={
                            storefront.data?.currency_code ?? "PHP"
                        }
                        orders={orders.data.orders}
                    />
                </>
            ) : (
                <OrdersEmpty />
            )}
        </section>
    );
}

function OrdersTable({
    currencyCode,
    orders,
}: {
    currencyCode: string;
    orders: StoreOrder[];
}) {
    return (
        <div
            className="hidden min-w-0 overflow-x-auto sm:block"
            data-dashboard-swipe-ignore
        >
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr className="border-b border-border/70 bg-muted/25 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        <th className="px-6 py-3 font-medium">Order</th>
                        <th className="px-4 py-3 font-medium">Customer</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 text-right font-medium">
                            Total
                        </th>
                        <th className="px-4 py-3 font-medium">Placed</th>
                        <th className="w-12 px-4 py-3">
                            <span className="sr-only">Open</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                    {orders.map((order) => (
                        <tr
                            className="transition-colors hover:bg-muted/30"
                            key={order.id}
                        >
                            <td className="whitespace-nowrap px-6 py-3.5 text-sm font-semibold">
                                {order.reference_number}
                            </td>
                            <td className="max-w-48 px-4 py-3.5">
                                <p className="truncate text-sm font-medium">
                                    {order.customer_name}
                                </p>
                                <p className="mt-1 truncate text-xs text-muted-foreground">
                                    {order.delivery_method === "pickup"
                                        ? "Pickup"
                                        : "Delivery"}
                                </p>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3.5">
                                <OrderStatusBadge status={order.status} />
                            </td>
                            <td className="whitespace-nowrap px-4 py-3.5 text-right text-sm font-semibold tabular-nums">
                                {formatStoreCurrency(
                                    order.total_amount,
                                    currencyCode,
                                )}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3.5 text-xs text-muted-foreground">
                                {formatStoreDate(order.created_at)}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                                <Link
                                    aria-label={`Manage ${order.reference_number}`}
                                    className="inline-grid size-9 place-items-center rounded-2xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    href="/storefront?tab=orders"
                                >
                                    <ArrowRight className="size-4" />
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function OrdersMobileList({
    currencyCode,
    orders,
}: {
    currencyCode: string;
    orders: StoreOrder[];
}) {
    return (
        <div className="divide-y divide-border/70 sm:hidden">
            {orders.map((order) => (
                <Link
                    className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-3 px-5 py-4 transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    href="/storefront?tab=orders"
                    key={order.id}
                >
                    <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold">
                                {order.reference_number}
                            </span>
                            <OrderStatusBadge status={order.status} />
                        </span>
                        <span className="mt-1 block truncate text-xs text-muted-foreground">
                            {order.customer_name} · {formatStoreDate(
                                order.created_at,
                            )}
                        </span>
                    </span>
                    <span className="self-center text-sm font-semibold tabular-nums">
                        {formatStoreCurrency(
                            order.total_amount,
                            currencyCode,
                        )}
                    </span>
                </Link>
            ))}
        </div>
    );
}

function StoreSetupEmpty() {
    return (
        <div className="grid min-h-56 place-items-center p-8 text-center">
            <div>
                <Store className="mx-auto size-6 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">
                    Your online store is not set up yet
                </p>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
                    Create a public store to receive customer order requests
                    here.
                </p>
                <Link
                    className={cn(buttonVariants({ size: "sm" }), "mt-4")}
                    href="/storefront"
                >
                    Set up store
                </Link>
            </div>
        </div>
    );
}

function OrdersEmpty() {
    return (
        <div className="grid min-h-56 place-items-center p-8 text-center">
            <div>
                <PackageSearch className="mx-auto size-6 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">
                    No online orders yet
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    New orders will appear here when customers check out.
                </p>
            </div>
        </div>
    );
}

function OrdersLoading() {
    return (
        <div className="divide-y divide-border/70" aria-busy="true">
            {[0, 1, 2, 3, 4].map((item) => (
                <div
                    className="flex items-center gap-3 px-5 py-4 sm:px-6"
                    key={item}
                >
                    <div className="min-w-0 flex-1">
                        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                        <div className="mt-2 h-3 w-44 animate-pulse rounded bg-muted" />
                    </div>
                    <div className="h-6 w-20 animate-pulse rounded-2xl bg-muted" />
                    <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                </div>
            ))}
        </div>
    );
}
