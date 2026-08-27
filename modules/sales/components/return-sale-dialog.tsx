"use client";

import { FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    useCreateSaleReturn,
    useSale,
} from "@/modules/sales/services/sales";
import { Sale } from "@/modules/sales/types";

type ReturnSaleDialogProps = {
    open: boolean;
    sale: Sale | null;
    onOpenChange: (open: boolean) => void;
};

const currency = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
});

export function ReturnSaleDialog({
    open,
    sale,
    onOpenChange,
}: ReturnSaleDialogProps) {
    const { data: detail, isLoading, error: detailError } = useSale(
        open ? sale?.id ?? "" : "",
    );
    const {
        mutateAsync: createReturn,
        isPending,
        error: mutationError,
        reset,
    } = useCreateSaleReturn();
    const [reason, setReason] = useState("");
    const [notes, setNotes] = useState("");
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const items = useMemo(() => detail?.items ?? [], [detail?.items]);

    const handleOpenChange = (nextOpen: boolean) => {
        if (isPending) return;
        if (!nextOpen) {
            setReason("");
            setNotes("");
            setQuantities({});
            reset();
        }
        onOpenChange(nextOpen);
    };

    const refundEstimate = useMemo(
        () => items.reduce((total, item) => {
            const quantity = quantities[item.id] ?? 0;
            return total + (item.line_total / item.quantity) * quantity;
        }, 0),
        [items, quantities],
    );

    const selectedItems = items
        .map((item) => ({
            sale_item_id: item.id,
            quantity: quantities[item.id] ?? 0,
        }))
        .filter((item) => item.quantity > 0);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!sale || !reason.trim() || selectedItems.length === 0) return;

        await createReturn({
            saleId: sale.id,
            payload: {
                reason: reason.trim(),
                notes: notes.trim() || undefined,
                items: selectedItems,
            },
        });
        handleOpenChange(false);
    };

    const displayedError = mutationError ?? detailError;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Return sale items</DialogTitle>
                    <DialogDescription>
                        Select quantities from {sale?.reference_number || "this sale"}. Returned stock is restored immediately.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {displayedError && (
                        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                            {displayedError instanceof Error ? displayedError.message : "Failed to process return."}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">Loading sale items…</div>
                    ) : (
                        <div className="space-y-2">
                            {items.map((item) => {
                                const remaining = item.returnable_quantity ?? item.quantity;
                                const quantity = quantities[item.id] ?? 0;
                                return (
                                    <div key={item.id} className="grid gap-3 rounded-xl border p-3 sm:grid-cols-[1fr_130px_130px] sm:items-center">
                                        <div>
                                            <p className="font-medium">{item.product_name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {item.sku || "No SKU"} · Sold {item.quantity} · Already returned {item.returned_quantity ?? 0}
                                            </p>
                                        </div>
                                        <div className="text-sm sm:text-right">
                                            <span className="text-muted-foreground">Available </span>
                                            <span className="font-medium">{remaining}</span>
                                        </div>
                                        <Input
                                            aria-label={`Return quantity for ${item.product_name}`}
                                            type="number"
                                            min="0"
                                            max={remaining}
                                            step="0.001"
                                            value={quantity}
                                            disabled={remaining <= 0 || isPending}
                                            onChange={(event) => {
                                                const next = Number(event.target.value);
                                                setQuantities((current) => ({
                                                    ...current,
                                                    [item.id]: Math.min(Math.max(Number.isFinite(next) ? next : 0, 0), remaining),
                                                }));
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="return-reason" className="mb-1 block text-sm font-medium">Reason *</label>
                            <Input
                                id="return-reason"
                                value={reason}
                                onChange={(event) => setReason(event.target.value)}
                                placeholder="e.g. Wrong item"
                                maxLength={500}
                                required
                                disabled={isPending}
                            />
                        </div>
                        <div>
                            <label htmlFor="return-notes" className="mb-1 block text-sm font-medium">Notes</label>
                            <Textarea
                                id="return-notes"
                                value={notes}
                                onChange={(event) => setNotes(event.target.value)}
                                placeholder="Optional details"
                                disabled={isPending}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                        <span className="text-sm text-muted-foreground">Estimated refund</span>
                        <span className="text-lg font-semibold">{currency.format(refundEstimate)}</span>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>Cancel</Button>
                        <Button type="submit" disabled={isLoading || isPending || !reason.trim() || selectedItems.length === 0}>
                            {isPending ? "Processing…" : "Complete return"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
