"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, RotateCcw, Search } from "lucide-react";

import { DataTable } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { cn } from "@/lib/utils";
import { returnColumns } from "@/modules/sales/columns/returns";
import { useSaleReturns } from "@/modules/sales/services/sales";

export default function ReturnsPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 400);
    const { page, pageSize, setPage, setPageSize } = usePagination();
    const { data, isLoading, isError, error, refetch, isFetching } =
        useSaleReturns(page, pageSize, debouncedSearch);
    const returns = data?.returns ?? [];
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
                            Return history
                        </h1>
                        <span className="text-xs text-muted-foreground">
                            {pagination?.total ?? returns.length} returns
                        </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Review returned products, reasons, and refund amounts.
                    </p>
                </div>
                <Button
                    aria-label="Refresh returns"
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
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                    <div className="relative min-w-0 flex-1">
                        <Search
                            aria-hidden="true"
                            className={
                                "absolute left-3 top-1/2 size-4 -translate-y-1/2 " +
                                "text-muted-foreground"
                            }
                        />
                        <Input
                            aria-label="Search returns"
                            className="h-10 pl-9"
                            onChange={(event) => {
                                setPage(1);
                                setSearch(event.target.value);
                            }}
                            placeholder="Search by sale reference or reason"
                            value={search}
                        />
                    </div>
                    {search ? (
                        <Button
                            onClick={() => {
                                setPage(1);
                                setSearch("");
                            }}
                            size="sm"
                            type="button"
                            variant="ghost"
                        >
                            Clear search
                        </Button>
                    ) : null}
                </div>
            </section>

            {isError ? (
                <section className="border-b bg-destructive/5 p-5">
                    <div className="flex items-start gap-3 text-sm text-destructive">
                        <RotateCcw className="mt-0.5 size-4 shrink-0" />
                        <div className="min-w-0 flex-1">
                            <p className="font-medium">
                                Unable to load returns
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
                        columns={returnColumns}
                        data={returns}
                        emptyLabel="return"
                        emptyState={
                            <EmptyReturns
                                filtered={Boolean(search)}
                                onViewSales={() => router.push("/sales")}
                            />
                        }
                        getRowId={(saleReturn) => saleReturn.id}
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

function EmptyReturns({
    filtered,
    onViewSales,
}: {
    filtered: boolean;
    onViewSales: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <RotateCcw className="size-5" />
            </div>
            <p className="font-medium">
                {filtered ? "No matching returns" : "No returns yet"}
            </p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                {filtered
                    ? "Try a different sale reference or clear the search."
                    : "Process a return from a completed sale when stock comes back."}
            </p>
            {!filtered ? (
                <Button
                    className="mt-5"
                    onClick={onViewSales}
                    size="sm"
                    type="button"
                    variant="outline"
                >
                    View sales
                </Button>
            ) : null}
        </div>
    );
}
