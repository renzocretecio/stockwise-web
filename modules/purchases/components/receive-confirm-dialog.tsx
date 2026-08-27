"use client";

import { PackageCheck } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useReceivePurchase } from "@/modules/purchases/services/purchases";
import { Purchase } from "@/modules/purchases/types";

interface ReceiveConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    purchase: Purchase | null;
    onSuccess?: () => void;
}

export function ReceiveConfirmDialog({
    open,
    onOpenChange,
    purchase,
    onSuccess,
}: ReceiveConfirmDialogProps) {
    // Hooks must be called unconditionally — bind to purchase?.id, same
    // pattern as useDeleteCategory(categoryId ?? ""). The mutation is only
    // ever actually triggered while the dialog is open with a real purchase
    // selected, so "" here is just a safe placeholder during closed state.
    const {
        mutateAsync: receivePurchase,
        isPending,
        error,
    } = useReceivePurchase(purchase?.id ?? "");

    const handleConfirm = async () => {
        if (!purchase) return;
        try {
            await receivePurchase();   // ← no argument — id is already bound
            onOpenChange(false);
            onSuccess?.();
        } catch {
            // error surfaced below via the error value
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <PackageCheck className="h-5 w-5" />
                        </div>
                        <DialogTitle>Receive purchase</DialogTitle>
                    </div>
                </DialogHeader>

                {purchase && (
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <p>
                            Receiving{" "}
                            <span className="font-medium text-foreground">
                                {purchase.reference_number ?? purchase.id.slice(0, 8)}
                            </span>{" "}
                            from{" "}
                            <span className="font-medium text-foreground">
                                {purchase.supplier_name}
                            </span>{" "}
                            will add {purchase.item_count} item
                            {purchase.item_count === 1 ? "" : "s"} to your stock and
                            update average cost. This cannot be undone.
                        </p>
                    </div>
                )}

                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                        {error instanceof Error
                            ? error.message
                            : "Failed to receive this purchase."}
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isPending}
                    >
                        {isPending ? "Receiving..." : "Receive"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}