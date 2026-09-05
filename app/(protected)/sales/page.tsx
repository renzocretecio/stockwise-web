"use client";

import { useState } from "react";
import { Plus, RefreshCw, Search, ShoppingCart } from "lucide-react";

import { DataTable } from "@/components/DataTable";
import { DeleteConfirmDialog } from "@/components/DeleteDialog";
import { Pagination } from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { cn } from "@/lib/utils";
import { getSaleColumns } from "@/modules/sales/columns/sales";
import { ReturnSaleDialog } from "@/modules/sales/components/return-sale-dialog";
import { SaleForm } from "@/modules/sales/components/sales-form";
import { useSales, useVoidSale } from "@/modules/sales/services/sales";
import type { Sale } from "@/modules/sales/types";

export default function SalesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isSaleFormOpen, setIsSaleFormOpen] = useState(false);
    const [saleToVoid, setSaleToVoid] = useState<Sale | null>(null);
    const [isVoidConfirmOpen, setIsVoidConfirmOpen] = useState(false);
    const [saleToReturn, setSaleToReturn] = useState<Sale | null>(null);
    const debouncedSearch = useDebounce(searchQuery, 400);
    const { page, pageSize, setPage, setPageSize } = usePagination();
    const { data, isLoading, isError, error, refetch, isFetching } = useSales(
        page,
        pageSize,
        debouncedSearch,
    );
    const { mutateAsync: voidSale } = useVoidSale();
    const sales = data?.sales ?? [];
    const pagination = data?.pagination;

    const columns = getSaleColumns({
        onReturn: (sale) => setSaleToReturn(sale),
        onVoid: (sale) => {
            setSaleToVoid(sale);
            setIsVoidConfirmOpen(true);
        },
    });

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
                            Sales ledger
                        </h1>
                        <span className="text-xs text-muted-foreground">
                            {pagination?.total ?? sales.length} transactions
                        </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Record completed sales, process returns, and keep a
                        clear transaction history.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        aria-label="Refresh sales"
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
                        onClick={() => setIsSaleFormOpen(true)}
                        size="sm"
                        type="button"
                    >
                        <Plus className="mr-1.5 size-4" />
                        New sale
                    </Button>
                </div>
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
                            aria-label="Search sales"
                            className="h-10 pl-9"
                            onChange={(event) => {
                                setPage(1);
                                setSearchQuery(event.target.value);
                            }}
                            placeholder="Search by sale reference"
                            value={searchQuery}
                        />
                    </div>
                    {searchQuery ? (
                        <Button
                            onClick={() => {
                                setPage(1);
                                setSearchQuery("");
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
                        <ShoppingCart className="mt-0.5 size-4 shrink-0" />
                        <div className="min-w-0 flex-1">
                            <p className="font-medium">Unable to load sales</p>
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
                        data={sales}
                        emptyLabel="sale"
                        emptyState={
                            <EmptySales
                                filtered={Boolean(searchQuery)}
                                onCreate={() => setIsSaleFormOpen(true)}
                            />
                        }
                        getRowId={(sale) => sale.id}
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

            <Dialog onOpenChange={setIsSaleFormOpen} open={isSaleFormOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>New sale</DialogTitle>
                        <DialogDescription>
                            Complete a sale and deduct the sold quantity from
                            stock.
                        </DialogDescription>
                    </DialogHeader>
                    <SaleForm
                        onCancel={() => setIsSaleFormOpen(false)}
                        onSuccess={() => setIsSaleFormOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            <ReturnSaleDialog
                onOpenChange={(open) => {
                    if (!open) setSaleToReturn(null);
                }}
                open={saleToReturn !== null}
                sale={saleToReturn}
            />

            <DeleteConfirmDialog<Sale>
                getItemName={(sale) => sale.reference_number || "Sale"}
                item={saleToVoid}
                itemLabel="sale"
                onConfirm={async (sale) => {
                    await voidSale({
                        saleId: sale.id,
                        reason: "Customer cancellation",
                    });
                    setSaleToVoid(null);
                }}
                onOpenChange={(open) => {
                    setIsVoidConfirmOpen(open);
                    if (!open) setSaleToVoid(null);
                }}
                open={isVoidConfirmOpen}
            />
        </div>
    );
}

function EmptySales({
    filtered,
    onCreate,
}: {
    filtered: boolean;
    onCreate: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShoppingCart className="size-5" />
            </div>
            <p className="font-medium">
                {filtered ? "No matching sales" : "No sales yet"}
            </p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                {filtered
                    ? "Try a different sale reference or clear the search."
                    : "Record your first completed sale to begin tracking activity."}
            </p>
            {!filtered ? (
                <Button
                    className="mt-5"
                    onClick={onCreate}
                    size="sm"
                    type="button"
                >
                    <Plus className="mr-1.5 size-4" />
                    New sale
                </Button>
            ) : null}
        </div>
    );
}
