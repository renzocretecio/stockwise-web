"use client";

import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useOrderPurchase } from "@/modules/purchases/services/purchases";
import type { Purchase } from "@/modules/purchases/types";

type OrderConfirmDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    purchase: Purchase | null;
    onSuccess?: () => void;
};

export function OrderConfirmDialog({
    open,
    onOpenChange,
    purchase,
    onSuccess,
}: OrderConfirmDialogProps) {
    const {
        mutateAsync: orderPurchase,
        isPending,
        error,
    } = useOrderPurchase(purchase?.id ?? "");

    const handleConfirm = async () => {
        if (!purchase) return;
        try {
            await orderPurchase();
            onOpenChange(false);
            onSuccess?.();
        } catch {
            // Mutation error is rendered below.
        }
    };

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Send className="h-5 w-5" />
                        </div>
                        <DialogTitle>Place purchase order</DialogTitle>
                    </div>
                </DialogHeader>

                {purchase && (
                    <p className="text-sm text-muted-foreground">
                        Place <span className="font-medium text-foreground">
                            {purchase.reference_number ?? purchase.id.slice(0, 8)}
                        </span> with {purchase.supplier_name}? It will move to Awaiting Receipt and can no longer be edited.
                    </p>
                )}

                {error && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                        {error instanceof Error ? error.message : "Failed to place this purchase order."}
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-2">
                    <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" disabled={isPending} onClick={handleConfirm}>
                        {isPending ? "Placing…" : "Place order"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
