"use client";

import Link from "next/link";
import {
    Check,
    Circle,
    Clipboard,
    MapPin,
    PackageCheck,
    RefreshCw,
    Store,
    Truck,
    XCircle,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    formatStoreCurrency,
    formatStoreDate,
    OrderStatusBadge,
    paymentLabels,
} from "@/modules/storefront/components/storefront-ui";
import { usePublicOrder } from "@/modules/storefront/services";
import type {
    DeliveryMethod,
    StoreOrderStatus,
} from "@/modules/storefront/types";

const statusOrder: StoreOrderStatus[] = [
    "new",
    "confirmed",
    "processing",
    "ready",
    "shipped",
    "completed",
];

const statusCopy: Record<
    StoreOrderStatus,
    { title: string; description: string }
> = {
    new: {
        title: "Order received",
        description: "The store will review your items and confirm availability.",
    },
    confirmed: {
        title: "Order confirmed",
        description: "Your items are reserved and ready to be prepared.",
    },
    processing: {
        title: "Preparing your order",
        description: "The store is getting your items ready.",
    },
    ready: {
        title: "Ready for pickup",
        description: "Your order is ready. Coordinate pickup with the store.",
    },
    shipped: {
        title: "Out for delivery",
        description: "Your order has left the store for delivery.",
    },
    completed: {
        title: "Order completed",
        description: "This order has been fulfilled.",
    },
    cancelled: {
        title: "Order cancelled",
        description: "This order will not be fulfilled.",
    },
};

export function OrderTrackingPage({
    reference,
    token,
}: {
    reference: string;
    token: string;
}) {
    const order = usePublicOrder(reference, token);

    if (!token) {
        return (
            <TrackingMessage
                description="Use the complete tracking link provided after checkout."
                title="Tracking link is incomplete"
            />
        );
    }

    if (order.isLoading) {
        return <OrderTrackingLoading />;
    }

    if (order.isError || !order.data) {
        return (
            <TrackingMessage
                description="Check that the tracking link is complete, then try again."
                onRetry={() => order.refetch()}
                title="We could not find this order"
            />
        );
    }

    const details = order.data;
    const currentCopy = statusCopy[details.status];
    const currencyCode = details.currency_code ?? "PHP";

    return (
        <main className="min-h-dvh bg-background px-4 py-6 sm:px-6 sm:py-10">
            <div className="mx-auto max-w-3xl">
                <header className="mb-6 flex items-center justify-between gap-4">
                    <Link
                        className="flex min-w-0 items-center gap-3"
                        href={
                            details.store_slug
                                ? `/s/${details.store_slug}`
                                : "/"
                        }
                    >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                            <Store className="size-5" />
                        </span>
                        <div className="min-w-0">
                            <p className="truncate font-semibold">
                                {details.store_name ?? "KitaStock store"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Order tracking
                            </p>
                        </div>
                    </Link>
                    <Button
                        aria-label="Refresh order"
                        disabled={order.isFetching}
                        onClick={() => order.refetch()}
                        size="icon"
                        variant="outline"
                    >
                        <RefreshCw
                            className={cn(
                                "size-4",
                                order.isFetching && "animate-spin",
                            )}
                        />
                    </Button>
                </header>

                <section className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/5">
                    <div className="border-b p-5 sm:p-7">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Order {details.reference_number}
                                </p>
                                <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                                    {currentCopy.title}
                                </h1>
                                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                                    {currentCopy.description}
                                </p>
                            </div>
                            <OrderStatusBadge status={details.status} />
                        </div>
                    </div>

                    {details.status === "cancelled" ? (
                        <div className="border-b bg-destructive/5 p-5 sm:p-7">
                            <div className="flex gap-3">
                                <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
                                <div>
                                    <p className="font-medium text-destructive">
                                        This order was cancelled
                                    </p>
                                    {details.cancellation_reason ? (
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {details.cancellation_reason}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <OrderProgress
                            deliveryMethod={details.delivery_method}
                            status={details.status}
                        />
                    )}

                    <div className="grid gap-px bg-border md:grid-cols-[1fr_18rem]">
                        <div className="bg-card p-5 sm:p-7">
                            <h2 className="font-semibold">Order items</h2>
                            <div className="mt-4 divide-y">
                                {details.items.map((item) => (
                                    <div
                                        className="flex gap-4 py-3 first:pt-0 last:pb-0"
                                        key={item.id}
                                    >
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-sm font-semibold">
                                            {item.quantity}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium">
                                                {item.product_name}
                                            </p>
                                            {item.sku ? (
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    SKU {item.sku}
                                                </p>
                                            ) : null}
                                        </div>
                                        <p className="font-medium">
                                            {formatStoreCurrency(
                                                item.line_total,
                                                currencyCode,
                                            )}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-5 flex items-center justify-between border-t pt-4 text-lg font-bold">
                                <span>Total</span>
                                <span>
                                    {formatStoreCurrency(
                                        details.total_amount,
                                        currencyCode,
                                    )}
                                </span>
                            </div>
                        </div>

                        <aside className="space-y-5 bg-card p-5 sm:p-7">
                            <OrderFact
                                label="Placed"
                                value={formatStoreDate(details.created_at)}
                            />
                            <OrderFact
                                label="Payment"
                                value={paymentLabels[details.payment_method]}
                            />
                            <OrderFact
                                label="Fulfillment"
                                value={
                                    details.delivery_method === "pickup"
                                        ? "Store pickup"
                                        : "Delivery"
                                }
                            />
                            {details.delivery_address ? (
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        Delivery address
                                    </p>
                                    <p className="mt-1 flex gap-2 text-sm leading-5">
                                        <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                        {details.delivery_address}
                                    </p>
                                </div>
                            ) : null}
                            {details.payment_instructions ? (
                                <div className="rounded-2xl bg-muted p-3">
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        Payment instructions
                                    </p>
                                    <p className="mt-1 whitespace-pre-line text-sm leading-5">
                                        {details.payment_instructions}
                                    </p>
                                </div>
                            ) : null}
                        </aside>
                    </div>
                </section>

                <div className="mt-5 flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
                    <p className="text-xs text-muted-foreground">
                        Save this private link to check your order later.
                    </p>
                    <Button
                        onClick={() =>
                            navigator.clipboard.writeText(window.location.href)
                        }
                        size="sm"
                        variant="outline"
                    >
                        <Clipboard className="size-4" />
                        Copy tracking link
                    </Button>
                </div>
            </div>
        </main>
    );
}

function OrderProgress({
    deliveryMethod,
    status,
}: {
    deliveryMethod: DeliveryMethod;
    status: StoreOrderStatus;
}) {
    const steps: StoreOrderStatus[] = [
        "new",
        "confirmed",
        "processing",
        deliveryMethod === "pickup" ? "ready" : "shipped",
        "completed",
    ];
    const currentIndex = statusOrder.indexOf(status);

    return (
        <div className="border-b p-5 sm:p-7">
            <ol className="grid gap-4 sm:grid-cols-5 sm:gap-2">
                {steps.map((step, index) => {
                    const stepIndex = statusOrder.indexOf(step);
                    const complete = currentIndex >= stepIndex;
                    const current = status === step;
                    return (
                        <li
                            className="relative flex items-center gap-3 sm:block"
                            key={step}
                        >
                            {index ? (
                                <span
                                    className={cn(
                                        "absolute hidden h-px bg-border sm:block",
                                        "right-1/2 top-4 w-full",
                                        complete && "bg-primary",
                                    )}
                                />
                            ) : null}
                            <span
                                className={cn(
                                    "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border bg-card",
                                    complete &&
                                        "border-primary bg-primary text-primary-foreground",
                                )}
                            >
                                {complete && !current ? (
                                    <Check className="size-4" />
                                ) : current ? (
                                    step === "shipped" ? (
                                        <Truck className="size-4" />
                                    ) : step === "completed" ? (
                                        <PackageCheck className="size-4" />
                                    ) : (
                                        <Circle className="size-3 fill-current" />
                                    )
                                ) : (
                                    <Circle className="size-3" />
                                )}
                            </span>
                            <p
                                className={cn(
                                    "text-sm capitalize text-muted-foreground sm:mt-2 sm:text-xs",
                                    complete && "font-medium text-foreground",
                                )}
                            >
                                {step === "ready" ? "Ready" : step}
                            </p>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}

function OrderFact({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </p>
            <p className="mt-1 text-sm font-medium">{value}</p>
        </div>
    );
}

function TrackingMessage({
    description,
    onRetry,
    title,
}: {
    description: string;
    onRetry?: () => void;
    title: string;
}) {
    return (
        <main className="flex min-h-dvh items-center justify-center bg-background p-6">
            <div className="max-w-sm text-center">
                <PackageCheck className="mx-auto mb-4 size-10 text-muted-foreground" />
                <h1 className="text-xl font-semibold">{title}</h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {description}
                </p>
                <div className="mt-5 flex justify-center gap-2">
                    {onRetry ? (
                        <Button onClick={onRetry} variant="outline">
                            Try again
                        </Button>
                    ) : null}
                    <Link className={buttonVariants()} href="/">
                        Go to KitaStock
                    </Link>
                </div>
            </div>
        </main>
    );
}

function OrderTrackingLoading() {
    return (
        <main className="min-h-dvh bg-background p-4 sm:p-8">
            <div className="mx-auto max-w-3xl space-y-4">
                <div className="h-14 animate-pulse rounded-2xl bg-muted" />
                <div className="h-[38rem] animate-pulse rounded-2xl bg-muted" />
            </div>
        </main>
    );
}
