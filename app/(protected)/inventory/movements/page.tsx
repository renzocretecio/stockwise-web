"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeftRight, RefreshCw, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { usePagination } from "@/hooks/use-pagination";
import { useStockMovements } from "@/modules/inventory/services/movements";
import { getStockMovementColumns } from "@/modules/inventory/columns/movements";

const MOVEMENT_TYPES = [
    { value: "", label: "All types" },
    { value: "purchase", label: "Purchase received" },
    { value: "sale", label: "Sale" },
    { value: "adjustment", label: "Adjustment" },
    { value: "count_adjustment", label: "Count adjustment" },
    { value: "return", label: "Return" },
    { value: "damage", label: "Damage" },
    { value: "expired", label: "Expired" },
    { value: "transfer_in", label: "Transfer in" },
    { value: "transfer_out", label: "Transfer out" },
];

export default function StockMovementsPage() {
    return <Suspense fallback={<Card className="h-64 animate-pulse bg-muted/40" />}><StockMovementsContent /></Suspense>;
}

function StockMovementsContent() {
    // Supports deep-linking from Stock Overview, e.g. /inventory/movements?product_id=xxx
    const searchParams = useSearchParams();
    const productIdFilter = searchParams.get("product_id") ?? undefined;

    const [movementType, setMovementType] = useState<string>("");
    const { page, pageSize, setPage, setPageSize } = usePagination({
        resetDeps: [movementType, productIdFilter],
    });

    const columns = getStockMovementColumns();

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useStockMovements(page, pageSize, productIdFilter, movementType || undefined);

    const movements = data?.movements ?? [];
    const pagination = data?.pagination;
    const errorMessage = error instanceof Error ? error.message : "Failed to load stock movements";

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Stock Movements
                        </h1>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                            {pagination?.total ?? 0}{" "}
                            {pagination?.total === 1 ? "entry" : "entries"}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Full audit trail of every stock change — purchases, sales,
                        adjustments, and count corrections.
                    </p>
                </div>

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
            </div>

            <Card className="p-4 border-border/80">
                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={movementType}
                        onChange={(e) => setMovementType(e.target.value)}
                        className="h-9 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                        aria-label="Filter by movement type"
                    >
                        {MOVEMENT_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                                {t.label}
                            </option>
                        ))}
                    </select>

                    {productIdFilter && (
                        <span className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-muted text-sm text-foreground">
                            Filtered to one product
                            <a
                                href="/inventory/movements"
                                className="text-muted-foreground hover:text-foreground ml-1"
                                aria-label="Clear product filter"
                            >
                                ✕
                            </a>
                        </span>
                    )}
                </div>
            </Card>

            {isError && (
                <Card className="p-6 border-destructive/50 bg-destructive/5 text-destructive">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-sm">
                                Failed to load stock movements
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

            {!isError && movements.length === 0 && !isLoading && (
                <Card className="p-12 text-center border-dashed border-2">
                    <div className="h-12 w-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4">
                        <ArrowLeftRight className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                        No stock movements found
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
                        {movementType || productIdFilter
                            ? "No movements match your current filters."
                            : "Stock movements will appear here once purchases, sales, or adjustments happen."}
                    </p>
                </Card>
            )}

            {!isError && (movements.length > 0 || isLoading) && (
                <>
                    <DataTable
                        columns={columns}
                        data={movements}
                        getRowId={(m) => m.id}
                        isLoading={isLoading}
                        emptyLabel="movement"
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
        </div>
    );
}
