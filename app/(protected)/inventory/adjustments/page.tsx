"use client";

import { useState } from "react";
import {
    AlertTriangle,
    Plus,
    RefreshCw,
    SlidersHorizontal,
} from "lucide-react";

import { DataTable } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { usePagination } from "@/hooks/use-pagination";
import { cn } from "@/lib/utils";
import { getStockMovementColumns } from "@/modules/inventory/columns/movements";
import { AdjustStockForm } from "@/modules/inventory/components/adjust-stock-form";
import { useStockMovements } from "@/modules/inventory/services/movements";

export default function StockAdjustmentsPage() {
    const [isAdjustFormOpen, setIsAdjustFormOpen] = useState(false);
    const { page, pageSize, setPage, setPageSize } = usePagination();
    const columns = getStockMovementColumns();
    const { data, isLoading, isError, error, refetch, isFetching } =
        useStockMovements(page, pageSize, undefined, "adjustment");

    const adjustments = data?.movements ?? [];
    const pagination = data?.pagination;

    return (
        <div className="pb-12">
            <header
                className={
                    "flex flex-col gap-4 border-b p-4 sm:flex-row " +
                    "sm:items-end sm:justify-between"
                }
            >
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Stock adjustments
                        </h1>
                        <span className="text-xs text-muted-foreground">
                            {pagination?.total ?? adjustments.length} entries
                        </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Correct stock after damage, shrinkage, expiry, or a
                        count difference.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        aria-label="Refresh stock adjustments"
                        disabled={isFetching}
                        onClick={() => void refetch()}
                        size="icon"
                        type="button"
                        variant="outline"
                    >
                        <RefreshCw
                            className={cn(
                                "size-4",
                                isFetching && "animate-spin",
                            )}
                        />
                    </Button>
                    <Button
                        onClick={() => setIsAdjustFormOpen(true)}
                        size="sm"
                        type="button"
                    >
                        <Plus className="mr-1.5 size-4" />
                        New adjustment
                    </Button>
                </div>
            </header>

            {isError ? (
                <section className="border-b bg-destructive/5 p-5">
                    <div className="flex items-start gap-3 text-sm text-destructive">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                        <div className="min-w-0 flex-1">
                            <p className="font-medium">
                                Unable to load stock adjustments
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {error instanceof Error
                                    ? error.message
                                    : "Please try again."}
                            </p>
                        </div>
                        <Button
                            onClick={() => void refetch()}
                            size="sm"
                            type="button"
                            variant="outline"
                        >
                            Try again
                        </Button>
                    </div>
                </section>
            ) : null}

            <section>
                <div className="p-2 sm:p-4">
                    <DataTable
                        className="rounded-none border-0 shadow-none ring-0"
                        columns={columns}
                        data={adjustments}
                        emptyLabel="adjustment"
                        emptyState={
                            <EmptyAdjustments
                                onCreate={() => setIsAdjustFormOpen(true)}
                            />
                        }
                        getRowId={(movement) => movement.id}
                        isLoading={isLoading}
                    />
                    {pagination ? (
                        <Pagination
                            className="mt-4"
                            isLoading={isFetching}
                            onPageChange={setPage}
                            onPageSizeChange={setPageSize}
                            pagination={pagination}
                        />
                    ) : null}
                </div>
            </section>

            <Dialog onOpenChange={setIsAdjustFormOpen} open={isAdjustFormOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>New stock adjustment</DialogTitle>
                        <DialogDescription>
                            Update a product quantity and record the reason for
                            the correction.
                        </DialogDescription>
                    </DialogHeader>
                    <AdjustStockForm
                        onCancel={() => setIsAdjustFormOpen(false)}
                        onSuccess={() => setIsAdjustFormOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}

function EmptyAdjustments({ onCreate }: { onCreate: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <SlidersHorizontal className="size-5" />
            </div>
            <p className="font-medium">No adjustments yet</p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                Record a correction whenever actual stock differs from the
                system.
            </p>
            <Button className="mt-5" onClick={onCreate} size="sm" type="button">
                <Plus className="mr-1.5 size-4" />
                New adjustment
            </Button>
        </div>
    );
}
