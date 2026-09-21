"use client";

import { useState } from "react";
import { ArrowRight, PackageCheck, Search, ShoppingBag } from "lucide-react";

import { Pagination } from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useDebounce } from "@/hooks/use-debounce";
import {
    formatStoreCurrency,
    formatStoreDate,
    OrderStatusBadge,
    paymentLabels,
} from "@/modules/storefront/components/storefront-ui";
import {
    useStoreOrders,
    useUpdateStoreOrderStatus,
} from "@/modules/storefront/services";
import type {
    StoreOrder,
    StoreOrderStatus,
} from "@/modules/storefront/types";

const statuses: Array<{ label: string; value: StoreOrderStatus | "all" }> = [
    { label: "All orders", value: "all" },
    { label: "New", value: "new" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Processing", value: "processing" },
    { label: "Ready", value: "ready" },
    { label: "Shipped", value: "shipped" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
];

export function StorefrontOrders({
    canManage,
    currencyCode,
}: {
    canManage: boolean;
    currencyCode: string;
}) {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [status, setStatus] = useState("all");
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<StoreOrder>();
    const debouncedSearch = useDebounce(search, 350);
    const orders = useStoreOrders(
        page,
        pageSize,
        status,
        debouncedSearch,
    );

    return (
        <section className="bg-card">
            <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h2 className="text-base font-semibold">Customer orders</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Confirm an order to reserve stock. Inventory is deducted
                        only when the order is completed.
                    </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <select
                        className="h-9 rounded-2xl border border-input bg-background px-3 text-sm"
                        onChange={(event) => {
                            setStatus(event.target.value);
                            setPage(1);
                        }}
                        value={status}
                    >
                        {statuses.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </select>
                    <label className="relative min-w-64">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            className="pl-9"
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setPage(1);
                            }}
                            placeholder="Search name or order number"
                            value={search}
                        />
                    </label>
                </div>
            </div>

            <div className="divide-y">
                {orders.isLoading
                    ? Array.from({ length: 6 }).map((_, index) => (
                          <div className="h-20 animate-pulse bg-muted/20" key={index} />
                      ))
                    : orders.data?.orders.map((order) => (
                          <button
                              className="grid w-full gap-3 p-4 text-left transition-colors hover:bg-muted/30 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:items-center"
                              key={order.id}
                              onClick={() => setSelected(order)}
                              type="button"
                          >
                              <span className="min-w-0">
                                  <span className="flex flex-wrap items-center gap-2">
                                      <span className="font-semibold">
                                          {order.reference_number}
                                      </span>
                                      <OrderStatusBadge status={order.status} />
                                  </span>
                                  <span className="mt-1 block truncate text-xs text-muted-foreground">
                                      {order.customer_name} · {order.customer_contact}
                                  </span>
                              </span>
                              <span className="text-sm capitalize text-muted-foreground">
                                  {order.delivery_method}
                              </span>
                              <span>
                                  <span className="block font-semibold">
                                      {formatStoreCurrency(
                                          order.total_amount,
                                          currencyCode,
                                      )}
                                  </span>
                                  <span className="block text-xs text-muted-foreground">
                                      {formatStoreDate(order.created_at)}
                                  </span>
                              </span>
                              <ArrowRight className="hidden size-4 text-muted-foreground sm:block" />
                          </button>
                      ))}
            </div>

            {!orders.isLoading && !orders.data?.orders.length ? (
                <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
                    <ShoppingBag className="mb-3 size-8 text-muted-foreground" />
                    <p className="text-sm font-medium">No orders found</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        New customer orders will appear here.
                    </p>
                </div>
            ) : null}

            {orders.data?.pagination ? (
                <Pagination
                    className="border-t p-4"
                    isLoading={orders.isFetching}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setPage(1);
                    }}
                    pagination={orders.data.pagination}
                />
            ) : null}

            <OrderDialog
                canManage={canManage}
                currencyCode={currencyCode}
                key={selected?.id ?? "empty"}
                onOpenChange={(open) => {
                    if (!open) setSelected(undefined);
                }}
                open={Boolean(selected)}
                order={selected}
            />
        </section>
    );
}

function OrderDialog({
    canManage,
    currencyCode,
    onOpenChange,
    open,
    order,
}: {
    canManage: boolean;
    currencyCode: string;
    onOpenChange: (open: boolean) => void;
    open: boolean;
    order?: StoreOrder;
}) {
    const updateStatus = useUpdateStoreOrderStatus(order?.id ?? "");
    const [cancellationReason, setCancellationReason] = useState("");
    const [showCancellation, setShowCancellation] = useState(false);
    const [error, setError] = useState<string>();

    if (!order) return null;

    const moveTo = async (nextStatus: StoreOrderStatus) => {
        setError(undefined);
        try {
            await updateStatus.mutateAsync({
                status: nextStatus,
                cancellation_reason:
                    nextStatus === "cancelled"
                        ? cancellationReason
                        : undefined,
            });
            toast.add({
                title: `Order ${nextStatus}`,
                description: `${order.reference_number} was updated.`,
                type: "success",
            });
            onOpenChange(false);
        } catch (reason) {
            setError(
                reason instanceof Error
                    ? reason.message
                    : "Unable to update this order.",
            );
        }
    };

    const nextActions = getNextActions(order);

    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
            <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <div className="flex flex-wrap items-center gap-2 pr-10">
                        <DialogTitle>{order.reference_number}</DialogTitle>
                        <OrderStatusBadge status={order.status} />
                    </div>
                    <DialogDescription>
                        Placed {formatStoreDate(order.created_at)}
                    </DialogDescription>
                </DialogHeader>

                {error ? (
                    <p className="rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">
                        {error}
                    </p>
                ) : null}

                <div className="grid gap-px overflow-hidden rounded-2xl bg-border sm:grid-cols-2">
                    <Info label="Customer" value={order.customer_name} />
                    <Info label="Contact" value={order.customer_contact} />
                    <Info
                        label="Fulfillment"
                        value={
                            order.delivery_method === "pickup"
                                ? "Customer pickup"
                                : "Delivery"
                        }
                    />
                    <Info
                        label="Payment"
                        value={paymentLabels[order.payment_method]}
                    />
                </div>

                {order.delivery_address ? (
                    <Info label="Delivery address" value={order.delivery_address} />
                ) : null}
                {order.customer_notes ? (
                    <Info label="Customer note" value={order.customer_notes} />
                ) : null}

                <div>
                    <h3 className="mb-2 text-sm font-semibold">Items</h3>
                    <div className="divide-y rounded-2xl border">
                        {order.items.map((item) => (
                            <div
                                className="grid grid-cols-[1fr_auto] gap-3 p-3"
                                key={item.id}
                            >
                                <div className="min-w-0">
                                    <p className="truncate font-medium">
                                        {item.product_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {item.quantity} × {formatStoreCurrency(
                                            item.unit_price,
                                            currencyCode,
                                        )}
                                    </p>
                                </div>
                                <p className="font-semibold">
                                    {formatStoreCurrency(
                                        item.line_total,
                                        currencyCode,
                                    )}
                                </p>
                            </div>
                        ))}
                        <div className="flex items-center justify-between p-3 text-base font-semibold">
                            <span>Total</span>
                            <span>
                                {formatStoreCurrency(
                                    order.total_amount,
                                    currencyCode,
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                {showCancellation ? (
                    <div className="rounded-2xl bg-destructive/5 p-3">
                        <label className="block text-sm font-medium">
                            Cancellation reason
                            <Textarea
                                className="mt-2 bg-background"
                                onChange={(event) =>
                                    setCancellationReason(event.target.value)
                                }
                                placeholder="Why is this order being cancelled?"
                                rows={3}
                                value={cancellationReason}
                            />
                        </label>
                        <div className="mt-3 flex justify-end gap-2">
                            <Button
                                onClick={() => setShowCancellation(false)}
                                size="sm"
                                type="button"
                                variant="outline"
                            >
                                Keep order
                            </Button>
                            <Button
                                disabled={
                                    !cancellationReason.trim() ||
                                    updateStatus.isPending
                                }
                                onClick={() => moveTo("cancelled")}
                                size="sm"
                                type="button"
                                variant="destructive"
                            >
                                Cancel order
                            </Button>
                        </div>
                    </div>
                ) : null}

                {canManage && nextActions.length > 0 && !showCancellation ? (
                    <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
                        {nextActions.includes("cancelled") ? (
                            <Button
                                onClick={() => setShowCancellation(true)}
                                type="button"
                                variant="destructive"
                            >
                                Cancel
                            </Button>
                        ) : null}
                        {nextActions
                            .filter((action) => action !== "cancelled")
                            .map((action) => (
                                <Button
                                    disabled={updateStatus.isPending}
                                    key={action}
                                    onClick={() => moveTo(action)}
                                    type="button"
                                >
                                    {action === "completed" ? (
                                        <PackageCheck className="size-4" />
                                    ) : null}
                                    {actionLabel(action)}
                                </Button>
                            ))}
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-medium">{value}</p>
        </div>
    );
}

function getNextActions(order: StoreOrder): StoreOrderStatus[] {
    if (order.status === "new") return ["cancelled", "confirmed"];
    if (order.status === "confirmed") return ["cancelled", "processing"];
    if (order.status === "processing") {
        return [
            "cancelled",
            order.delivery_method === "delivery" ? "shipped" : "ready",
        ];
    }
    if (order.status === "ready" || order.status === "shipped") {
        return ["cancelled", "completed"];
    }
    return [];
}

function actionLabel(status: StoreOrderStatus) {
    return {
        cancelled: "Cancel",
        completed: "Complete order",
        confirmed: "Confirm and reserve",
        new: "New",
        processing: "Start processing",
        ready: "Mark ready",
        shipped: "Mark shipped",
    }[status];
}
