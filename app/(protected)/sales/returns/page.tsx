"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Search } from "lucide-react";

import { DataTable } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { returnColumns } from "@/modules/sales/columns/returns";
import { useSaleReturns } from "@/modules/sales/services/sales";

export default function ReturnsPage() {
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 400);
    const { page, pageSize, setPage, setPageSize } = usePagination();
    const { data, isLoading, isError, error } = useSaleReturns(
        page,
        pageSize,
        debouncedSearch,
    );

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, setPage]);

    return (
        <div className="space-y-6 pb-12">
            <div>
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <RotateCcw className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">Returns</h1>
                            {data?.pagination && (
                                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                    {data.pagination.total}
                                </span>
                            )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Review returned sale items, reasons, and refund amounts.
                        </p>
                    </div>
                </div>
            </div>

            <Card className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by sale reference or reason…"
                        className="pl-9"
                    />
                </div>
            </Card>

            {isError ? (
                <Card className="border-destructive/50 bg-destructive/5 p-6 text-destructive">
                    {error instanceof Error ? error.message : "Failed to load returns."}
                </Card>
            ) : (
                <>
                    <DataTable
                        columns={returnColumns}
                        data={data?.returns ?? []}
                        getRowId={(saleReturn) => saleReturn.id}
                        isLoading={isLoading}
                        emptyLabel="return"
                    />
                    {data?.pagination && (
                        <Pagination
                            pagination={data.pagination}
                            onPageChange={setPage}
                            onPageSizeChange={setPageSize}
                            isLoading={isLoading}
                            className="mt-4"
                        />
                    )}
                </>
            )}
        </div>
    );
}
