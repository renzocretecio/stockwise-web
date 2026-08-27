"use client";

import { useState } from "react";
import { Plus, RefreshCw, AlertTriangle, SlidersHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { usePagination } from "@/hooks/use-pagination";
import { useStockMovements } from "@/modules/inventory/services/movements";
import { getStockMovementColumns } from "@/modules/inventory/columns/movements";
import { AdjustStockForm } from "@/modules/inventory/components/adjust-stock-form";

export default function StockAdjustmentsPage() {
    const [isAdjustFormOpen, setIsAdjustFormOpen] = useState(false);
    const { page, pageSize, setPage, setPageSize } = usePagination();

    const columns = getStockMovementColumns();

    // Stock Adjustments page is really "Movements filtered to type=adjustment" —
    // reuses the same endpoint/columns as Stock Movements instead of a
    // separate history table.
    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useStockMovements(page, pageSize, undefined, "adjustment");

    const adjustments = data?.movements ?? [];
    const pagination = data?.pagination;
    const errorMessage =
        error instanceof Error ? error.message : "Failed to load stock adjustments";

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Stock Adjustments
                        </h1>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                            {pagination?.total ?? 0}{" "}
                            {pagination?.total === 1 ? "entry" : "entries"}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manually correct stock for damage, shrinkage, expiry, or
                        found items.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="cursor-pointer gap-1.5"
                    >
                        <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
                        <span>Refresh</span>
                    </Button>
                    <Button
                        size="sm"
                        className="cursor-pointer gap-1.5 bg-primary text-primary-foreground shadow-sm"
                        onClick={() => setIsAdjustFormOpen(true)}
                    >
                        <Plus className="h-4 w-4" />
                        <span>New Adjustment</span>
                    </Button>
                </div>
            </div>

            {isError && (
                <Card className="p-6 border-destructive/50 bg-destructive/5 text-destructive">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-sm">
                                Failed to load adjustments
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {errorMessage}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetch()}
                            className="cursor-pointer"
                        >
                            Try Again
                        </Button>
                    </div>
                </Card>
            )}

            {!isError && adjustments.length === 0 && !isLoading && (
                <Card className="p-12 text-center border-dashed border-2">
                    <div className="h-12 w-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4">
                        <SlidersHorizontal className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                        No adjustments yet
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-6">
                        Manual stock corrections will show up here once you make one.
                    </p>
                    <Button
                        size="sm"
                        onClick={() => setIsAdjustFormOpen(true)}
                        className="cursor-pointer gap-1.5 bg-primary text-primary-foreground shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        <span>New Adjustment</span>
                    </Button>
                </Card>
            )}

            {!isError && (adjustments.length > 0 || isLoading) && (
                <>
                    <DataTable
                        columns={columns}
                        data={adjustments}
                        getRowId={(m) => m.id}
                        isLoading={isLoading}
                        emptyLabel="adjustment"
                    />
                    {pagination && (
                        <Pagination
                            pagination={pagination}
                            onPageChange={setPage}
                            onPageSizeChange={setPageSize}
                            isLoading={isFetching}
                            className="mt-4"
                        />
                    )}
                </>
            )}

            <Dialog open={isAdjustFormOpen} onOpenChange={setIsAdjustFormOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>New Stock Adjustment</DialogTitle>
                        <DialogDescription>
                            Manually correct the stock quantity for a product.
                        </DialogDescription>
                    </DialogHeader>

                    <AdjustStockForm
                        onSuccess={() => setIsAdjustFormOpen(false)}
                        onCancel={() => setIsAdjustFormOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}