"use client";

import { useState, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * Delete Confirmation Dialog
 * ---------------------------------------------------------------------------
 * Generic confirm-before-delete dialog. Caller controls open/close state
 * explicitly via `open`/`onOpenChange` (same as any shadcn Dialog); pass the
 * item being deleted separately for display content. The dialog manages its
 * own pending/error state internally so callers don't need to juggle
 * isDeleting flags themselves.
 *
 * Usage:
 *   const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
 *   const [isDeleteOpen, setIsDeleteOpen] = useState(false);
 *   const { mutateAsync: deleteCategory } = useDeleteCategory();
 *
 *   <DeleteConfirmDialog
 *     open={isDeleteOpen}
 *     onOpenChange={setIsDeleteOpen}
 *     item={categoryToDelete}
 *     itemLabel="category"
 *     getItemName={(c) => c.name}
 *     onConfirm={(c) => deleteCategory(c.id)}
 *   />
 */

export interface DeleteConfirmDialogProps<T> {
    /** Controls whether the dialog is visible */
    open: boolean;
    /** Called when the dialog should open/close (backdrop click, Cancel, Escape, etc.) */
    onOpenChange: (open: boolean) => void;
    /** The item pending deletion — used for display content only */
    item: T | null | undefined;
    /** Called when the user confirms — throw to keep the dialog open and show the error */
    onConfirm: (item: T) => Promise<void> | void;
    /** Human label for the entity type, e.g. "category", "product", "supplier" */
    itemLabel?: string;
    /** Extract a display name from the item, shown in the confirmation copy */
    getItemName: (item: T) => string;
    /** Override the default description text entirely */
    description?: (item: T) => ReactNode;
    /** Extra warning shown below the description, e.g. "3 products use this category" */
    warning?: (item: T) => ReactNode | null | undefined;
    confirmLabel?: string;
    cancelLabel?: string;
}

export function DeleteConfirmDialog<T>({
    open,
    onOpenChange,
    item,
    onConfirm,
    itemLabel = "item",
    getItemName,
    description,
    warning,
    confirmLabel = "Delete",
    cancelLabel = "Cancel",
}: DeleteConfirmDialogProps<T>) {
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = async () => {
        if (!item) return;
        setError(null);
        setIsPending(true);
        try {
            await onConfirm(item);
            setIsPending(false);
            onOpenChange(false);
        } catch (err) {
            setIsPending(false);
            setError(
                err instanceof Error
                    ? err.message
                    : `Failed to delete this ${itemLabel}.`
            );
        }
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && isPending) return;
        if (!nextOpen) setError(null);
        onOpenChange(nextOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle>Delete {itemLabel}</DialogTitle>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-2 text-sm text-muted-foreground">
                    {item &&
                        (description ? (
                            description(item)
                        ) : (
                            <p>
                                Are you sure you want to delete{" "}
                                <span className="font-medium text-foreground">
                                    {getItemName(item)}
                                </span>
                                ? This action cannot be undone.
                            </p>
                        ))}
                    {item && warning?.(item) && (
                        <p className="rounded-md bg-amber-500/10 px-3 py-2 text-amber-700">
                            {warning(item)}
                        </p>
                    )}
                </div>

                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                        {error}
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={isPending}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isPending}
                    >
                        {isPending ? "Deleting..." : confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}