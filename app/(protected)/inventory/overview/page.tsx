"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
    AlertTriangle,
    Boxes,
    Package,
    RefreshCw,
    Search,
    XCircle,
} from "lucide-react";

import { DataTable } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { getInventoryOverviewColumns } from "@/modules/inventory/columns/overview";
import { useStockOverview } from "@/modules/inventory/services/overview";
import type { InventoryOverviewItem } from "@/modules/inventory/types/overview";

const inventoryStatuses = [
    { value: "all", label: "All stock" },
    { value: "in_stock", label: "In stock" },
    { value: "low_stock", label: "Low stock" },
    { value: "out_of_stock", label: "Out of stock" },
];

export default function InventoryPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [status, setStatus] = useState("all");
    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    const { page, pageSize, setPage, setPageSize } = usePagination();

    const { data, isLoading, isFetching, isError, error, refetch } =
        useStockOverview(page, pageSize, debouncedSearchQuery, status);

    const items: InventoryOverviewItem[] = data?.items ?? [];
    const summary = data?.summary;
    const columns = useMemo(() => getInventoryOverviewColumns(), []);
    const hasFilters = Boolean(searchQuery) || status !== "all";

    const clearFilters = () => {
        setSearchQuery("");
        setStatus("all");
        setPage(1);
    };

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
                            Inventory
                        </h1>
                        <span className="text-xs text-muted-foreground">
                            {data?.pagination.total ?? items.length} products
                        </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Monitor stock on hand, stock value, and products that
                        need attention.
                    </p>
                </div>
                <Button
                    aria-label="Refresh inventory"
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
                <div className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-4">
                    <InventoryStat
                        icon={<Package className="size-4" />}
                        label="Products tracked"
                        value={summary?.total_products ?? 0}
                        loading={isLoading}
                    />
                    <InventoryStat
                        className="text-emerald-600"
                        icon={<Boxes className="size-4" />}
                        label="Inventory value"
                        value={formatCurrency(summary?.total_stock_value ?? 0)}
                        loading={isLoading}
                    />
                    <InventoryStat
                        className="text-amber-600"
                        icon={<AlertTriangle className="size-4" />}
                        label="Low stock"
                        value={summary?.low_stock_count ?? 0}
                        loading={isLoading}
                    />
                    <InventoryStat
                        className="text-destructive"
                        icon={<XCircle className="size-4" />}
                        label="Out of stock"
                        value={summary?.out_of_stock_count ?? 0}
                        loading={isLoading}
                    />
                </div>
            </section>

            <section className="border-b">
                <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
                    <div className="relative min-w-0 flex-1">
                        <Search
                            aria-hidden="true"
                            className={
                                "absolute left-3 top-1/2 size-4 -translate-y-1/2 " +
                                "text-muted-foreground"
                            }
                        />
                        <Input
                            aria-label="Search inventory"
                            className="h-10 pl-9"
                            onChange={(event) => {
                                setPage(1);
                                setSearchQuery(event.target.value);
                            }}
                            placeholder="Search by product name or SKU"
                            value={searchQuery}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {inventoryStatuses.map((option) => (
                            <Button
                                key={option.value}
                                onClick={() => {
                                    setPage(1);
                                    setStatus(option.value);
                                }}
                                size="sm"
                                type="button"
                                variant={
                                    status === option.value
                                        ? "default"
                                        : "outline"
                                }
                            >
                                {option.label}
                            </Button>
                        ))}
                        {hasFilters ? (
                            <Button
                                onClick={clearFilters}
                                size="sm"
                                type="button"
                                variant="ghost"
                            >
                                Clear filters
                            </Button>
                        ) : null}
                    </div>
                </div>
            </section>

            {isError ? (
                <section className="border-b bg-destructive/5 p-5">
                    <div className="flex items-start gap-3 text-sm text-destructive">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                        <div className="min-w-0 flex-1">
                            <p className="font-medium">
                                Unable to load inventory
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
                <DataTable<InventoryOverviewItem>
                        className="rounded-none border-0 shadow-none ring-0"
                        columns={columns}
                        data={items}
                        emptyLabel="inventory item"
                        getRowId={(item) => item.product_id}
                        isLoading={isLoading}
                    />
                    {data?.pagination ? (
                        <Pagination
                            className="mt-4"
                            isLoading={isFetching}
                            onPageChange={setPage}
                            onPageSizeChange={setPageSize}
                            pagination={data.pagination}
                        />
                    ) : null}
                </div>
            </section>
        </div>
    );
}

function InventoryStat({
    className,
    icon,
    label,
    value,
    loading
}: {
    className?: string;
    icon: ReactNode;
    label: string;
    value: number | string;
    loading?: boolean;
}) {
    return (
        <div className="flex items-center justify-between bg-background p-4 sm:p-5">
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={cn("mt-1 text-xl font-semibold tabular-nums", className,)}>
                {loading ? "…" : value ?? 0}
                </p>
            </div>
            <span className={cn("text-muted-foreground", className)}>{icon}</span>
        </div>
    );
}
