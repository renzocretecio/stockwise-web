"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    AlertTriangle,
    ArrowLeft,
    Ban,
    CheckCircle2,
    XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
    useCancelCount,
    useFinalizeCount,
    useInventoryCountDetail,
    useRecordCountItems,
} from "@/modules/inventory/services/counts";
import { InventoryCountItemPreview } from "@/modules/inventory/types/counts";

export default function CountDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();

    const countId = params.id;

    const [drafts, setDrafts] = useState<Record<string, string>>({});
    const [isFinalizeOpen, setIsFinalizeOpen] = useState(false);
    const [isCancelOpen, setIsCancelOpen] = useState(false);

    const {
        data,
        isLoading,
        isError,
        error,
    } = useInventoryCountDetail(countId);

    const {
        mutateAsync: recordItems,
        isPending: isSaving,
    } = useRecordCountItems(countId);

    const {
        mutateAsync: finalizeCount,
        isPending: isFinalizing,
        error: finalizeError,
    } = useFinalizeCount(countId);

    const {
        mutateAsync: cancelCount,
        isPending: isCancelling,
    } = useCancelCount(countId);

    const count = data?.count;
    
    const isReadOnly = count?.status !== "in_progress";
    const hasUnsavedChanges = Object.keys(drafts).length > 0;

    const itemsWithVariance = useMemo(() => {
        return count?.items.filter(
            (item) =>
                item.variance !== null &&
                item.variance !== 0,
        ) ?? [];
    }, [count]);

    const handleDraftChange = (
        productId: string,
        value: string,
    ) => {
        setDrafts((previous) => ({
            ...previous,
            [productId]: value,
        }));
    };

    const handleSaveCounts = async () => {
        if (!count) {
            return;
        }

        const items = count.items
            .filter((item) => {
                const value = drafts[item.product_id];

                return value !== undefined && value !== "";
            })
            .map((item) => ({
                product_id: item.product_id,
                counted_quantity: Number(
                    drafts[item.product_id],
                ),
                notes: null,
            }));

        if (items.length === 0) {
            return;
        }

        try {
            await recordItems({ items });
            setDrafts({});
        } catch {
            // Mutation error is handled by React Query.
        }
    };

    const handleFinalize = async () => {
        try {
            await finalizeCount();
            setIsFinalizeOpen(false);
        } catch {
            // Error is displayed through finalizeError.
        }
    };

    const handleCancelCount = async () => {
        try {
            await cancelCount();
            setIsCancelOpen(false);
            router.push("/inventory/counts");
        } catch {
            // Mutation error is handled by React Query.
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((item) => (
                    <div
                        key={item}
                        className="h-14 animate-pulse rounded-xl border border-border/40 bg-muted/60"
                    />
                ))}
            </div>
        );
    }

    if (isError || !count) {
        return (
            <Card className="border-destructive/50 bg-destructive/5 p-6 text-destructive">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 shrink-0" />

                    <p className="text-sm">
                        {error instanceof Error
                            ? error.message
                            : "Failed to load this count session."}
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            <div>
                <button
                    type="button"
                    onClick={() => router.push("/inventory/counts")}
                    className="mb-3 inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to counts
                </button>

                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                {count.name}
                            </h1>

                            <StatusBadge status={count.status} />
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                            {count.counted_items} of {count.total_items} products counted
                            {count.items_with_variance > 0 &&
                                ` — ${count.items_with_variance} with variance`}
                        </p>
                    </div>

                    {count.status === "in_progress" && (
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsCancelOpen(true)}
                                className="cursor-pointer gap-1.5 text-muted-foreground"
                            >
                                <Ban className="h-4 w-4" />
                                Cancel count
                            </Button>

                            <Button
                                type="button"
                                size="sm"
                                onClick={() => setIsFinalizeOpen(true)}
                                disabled={
                                    count.counted_items === 0 ||
                                    hasUnsavedChanges
                                }
                                className="cursor-pointer gap-1.5 bg-primary text-primary-foreground shadow-sm"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                Finalize count
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <Card className="overflow-hidden border-border/80">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-border/80 bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3">
                                    Product
                                </th>

                                <th className="px-4 py-3 text-right">
                                    Expected
                                </th>

                                <th className="px-4 py-3 text-right">
                                    Counted
                                </th>

                                <th className="px-4 py-3 text-right">
                                    Variance
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-border/60">
                            {count.items.map((item) => (
                                <CountRow
                                    key={item.product_id}
                                    item={item}
                                    isReadOnly={isReadOnly}
                                    draftValue={drafts[item.product_id]}
                                    onDraftChange={(value) =>
                                        handleDraftChange(
                                            item.product_id,
                                            value,
                                        )
                                    }
                                />
                            ))}
                        </tbody>
                    </table>
                </div>

                {count.status === "in_progress" && (
                    <div className="flex items-center justify-between border-t px-4 py-3">
                        <div>
                            {hasUnsavedChanges && (
                                <p className="text-sm text-amber-600">
                                    You have unsaved count changes.
                                </p>
                            )}
                        </div>

                        <Button
                            type="button"
                            onClick={handleSaveCounts}
                            disabled={
                                !hasUnsavedChanges ||
                                isSaving
                            }
                        >
                            {isSaving
                                ? "Saving..."
                                : "Save Counts"}
                        </Button>
                    </div>
                )}
            </Card>

            <Dialog
                open={isFinalizeOpen}
                onOpenChange={setIsFinalizeOpen}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>

                            <DialogTitle>
                                Finalize count
                            </DialogTitle>
                        </div>
                    </DialogHeader>

                    <div className="space-y-2 text-sm text-muted-foreground">
                        <p>
                            {count.counted_items} of {count.total_items} products
                            have been counted.

                            {count.total_items - count.counted_items > 0 && (
                                <>
                                    {" "}
                                    <span className="text-amber-600">
                                        {count.total_items - count.counted_items} uncounted
                                        product(s) will be skipped and left unchanged.
                                    </span>
                                </>
                            )}
                        </p>

                        {itemsWithVariance.length > 0 ? (
                            <p className="rounded-md bg-amber-500/10 px-3 py-2 text-amber-700">
                                {itemsWithVariance.length} product(s) have a variance
                                and will have their stock adjusted to match the counted
                                quantity. This creates stock movements and cannot be
                                undone.
                            </p>
                        ) : (
                            <p>
                                No variances detected — finalizing will simply
                                close this session.
                            </p>
                        )}
                    </div>

                    {finalizeError && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                            {finalizeError instanceof Error
                                ? finalizeError.message
                                : "Failed to finalize this count."}
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsFinalizeOpen(false)}
                            disabled={isFinalizing}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="button"
                            onClick={handleFinalize}
                            disabled={isFinalizing}
                        >
                            {isFinalizing
                                ? "Finalizing..."
                                : "Finalize count"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={isCancelOpen}
                onOpenChange={setIsCancelOpen}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                                <XCircle className="h-5 w-5" />
                            </div>

                            <DialogTitle>
                                Cancel this count?
                            </DialogTitle>
                        </div>
                    </DialogHeader>

                    <p className="text-sm text-muted-foreground">
                        All recorded counts for this session will be discarded.
                        No stock will be adjusted. This cannot be undone.
                    </p>

                    <DialogFooter className="gap-2 sm:gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCancelOpen(false)}
                            disabled={isCancelling}
                        >
                            Keep session
                        </Button>

                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleCancelCount}
                            disabled={isCancelling}
                        >
                            {isCancelling
                                ? "Cancelling..."
                                : "Cancel count"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function StatusBadge({
    status,
}: {
    status: string;
}) {
    const statusMap: Record<
        string,
        {
            label: string;
            className: string;
        }
    > = {
        in_progress: {
            label: "In progress",
            className: "bg-amber-500/10 text-amber-600",
        },
        finalized: {
            label: "Completed",
            className: "bg-emerald-500/10 text-emerald-600",
        },
        cancelled: {
            label: "Cancelled",
            className: "bg-muted text-muted-foreground",
        },
    };

    const currentStatus =
        statusMap[status] ??
        statusMap.in_progress;

    return (
        <span
            className={cn(
                "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                currentStatus.className,
            )}
        >
            {currentStatus.label}
        </span>
    );
}

function CountRow({
    item,
    isReadOnly,
    draftValue,
    onDraftChange,
}: {
    item: InventoryCountItemPreview;
    isReadOnly: boolean;
    draftValue: string | undefined;
    onDraftChange: (value: string) => void;
}) {
    const displayValue =
        draftValue !== undefined
            ? draftValue
            : item.counted_quantity !== null
                ? String(item.counted_quantity)
                : "";

    const variance = item.variance;

    const hasVariance =
        variance !== null &&
        variance !== 0;

    return (
        <tr
            className={cn(
                hasVariance && "bg-amber-500/5",
            )}
        >
            <td className="px-4 py-3">
                <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                        {item.product_name}
                    </span>

                    {item.sku && (
                        <span className="font-mono text-xs text-muted-foreground">
                            {item.sku}
                        </span>
                    )}
                </div>
            </td>

            <td className="px-4 py-3 text-right text-muted-foreground">
                {item.expected_quantity}
            </td>

            <td className="px-4 py-3 text-right">
                {isReadOnly ? (
                    <span>
                        {item.counted_quantity ?? "—"}
                    </span>
                ) : (
                    <input
                        type="number"
                        min="0"
                        step="1"
                        value={displayValue}
                        onChange={(event) =>
                            onDraftChange(event.target.value)
                        }
                        placeholder="—"
                        className="w-24 rounded-md border border-input bg-background px-2 py-1 text-right text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                )}
            </td>

            <td className="px-4 py-3 text-right">
                {variance === null ? (
                    <span className="text-muted-foreground">
                        —
                    </span>
                ) : (
                    <span
                        className={cn(
                            "font-medium",
                            variance > 0 &&
                                "text-emerald-600",
                            variance < 0 &&
                                "text-destructive",
                            variance === 0 &&
                                "text-muted-foreground",
                        )}
                    >
                        {variance > 0 && "+"}
                        {variance}
                    </span>
                )}
            </td>
        </tr>
    );
}