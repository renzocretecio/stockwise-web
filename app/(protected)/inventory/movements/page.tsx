"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeftRight, RefreshCw } from "lucide-react";

import { DataTable } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePagination } from "@/hooks/use-pagination";
import { cn } from "@/lib/utils";
import { getStockMovementColumns } from "@/modules/inventory/columns/movements";
import { useStockMovements } from "@/modules/inventory/services/movements";

const movementTypes = [
    { value: "", label: "All activity" },
    { value: "purchase", label: "Purchase received" },
    { value: "sale", label: "Sales" },
    { value: "adjustment", label: "Adjustments" },
    { value: "count_adjustment", label: "Count adjustments" },
    { value: "return", label: "Returns" },
    { value: "damage", label: "Damaged stock" },
    { value: "expired", label: "Expired stock" },
    { value: "transfer_in", label: "Transfers in" },
    { value: "transfer_out", label: "Transfers out" },
];

const selectClass =
    "h-9 border border-input bg-background px-3 text-sm text-foreground " +
    "outline-none focus:ring-2 focus:ring-primary rounded-md";

export default function StockMovementsPage() {
    return (
        <Suspense
            fallback={<Card className="h-64 animate-pulse bg-muted/40" />}
        >
            <StockMovementsContent />
        </Suspense>
    );
}

function StockMovementsContent() {
    const searchParams = useSearchParams();
    const productIdFilter = searchParams.get("product_id") ?? undefined;
    const [movementType, setMovementType] = useState("");
    const { page, pageSize, setPage, setPageSize } = usePagination({
        resetDeps: [movementType, productIdFilter],
    });
    const columns = getStockMovementColumns();

    const { data, isLoading, isError, error, refetch, isFetching } =
        useStockMovements(
            page,
            pageSize,
            productIdFilter,
            movementType || undefined,
        );

    const movements = data?.movements ?? [];
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
                            Stock movements
                        </h1>
                        <span className="text-xs text-muted-foreground">
                            {pagination?.total ?? movements.length} entries
                        </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Your complete audit trail for purchases, sales, returns,
                        and manual stock changes.
                    </p>
                </div>
                <Button
                    aria-label="Refresh stock movements"
                    disabled={isFetching}
                    onClick={() => void refetch()}
                    size="icon"
                    type="button"
                    variant="outline"
                >
                    <RefreshCw
                        className={cn("size-4", isFetching && "animate-spin")}
                    />
                </Button>
            </header>

            <section className="border-b">
                <div className="flex flex-wrap items-center gap-2 p-4">
                    <select
                        aria-label="Filter by movement type"
                        className={selectClass}
                        onChange={(event) =>
                            setMovementType(event.target.value)
                        }
                        value={movementType}
                    >
                        {movementTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                    {productIdFilter ? (
                        <div className="inline-flex h-9 items-center gap-2 bg-muted px-3 text-sm">
                            Filtered to one product
                            <a
                                aria-label="Clear product filter"
                                className="text-muted-foreground hover:text-foreground"
                                href="/inventory/movements"
                            >
                                Clear
                            </a>
                        </div>
                    ) : null}
                </div>
            </section>

            {isError ? (
                <section className="border-b bg-destructive/5 p-5">
                    <div className="flex items-start gap-3 text-sm text-destructive">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                        <div className="min-w-0 flex-1">
                            <p className="font-medium">
                                Unable to load stock movements
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
                        data={movements}
                        emptyLabel="movement"
                        emptyState={
                            <EmptyMovements
                                filtered={Boolean(
                                    movementType || productIdFilter,
                                )}
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
        </div>
    );
}

function EmptyMovements({ filtered }: { filtered: boolean }) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ArrowLeftRight className="size-5" />
            </div>
            <p className="font-medium">No stock movements found</p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                {filtered
                    ? "No movements match the current filter."
                    : "Movements appear when stock is received, sold, counted, or adjusted."}
            </p>
        </div>
    );
}
