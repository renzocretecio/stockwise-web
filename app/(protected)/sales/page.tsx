"use client";

import {
    useEffect,
    useState,
} from "react";
import {
    Plus,
    Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/DataTable";
import { DeleteConfirmDialog } from "@/components/DeleteDialog";
import { Pagination } from "@/components/Pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";

import { getSaleColumns } from "@/modules/sales/columns/sales";
import { SaleForm } from "@/modules/sales/components/sales-form";
import { ReturnSaleDialog } from "@/modules/sales/components/return-sale-dialog";
import {
    useSales,
    useVoidSale,
} from "@/modules/sales/services/sales";
import { Sale } from "@/modules/sales/types";

export default function SalesPage() {
    const [searchQuery, setSearchQuery] =
        useState("");

    const [
        isSaleFormOpen,
        setIsSaleFormOpen,
    ] = useState(false);

    const [
        saleToVoid,
        setSaleToVoid,
    ] = useState<Sale | null>(null);

    const [
        isVoidConfirmOpen,
        setIsVoidConfirmOpen,
    ] = useState(false);

    const [saleToReturn, setSaleToReturn] = useState<Sale | null>(null);

    const debouncedSearch =
        useDebounce(
            searchQuery,
            400,
        );

    const {
        page,
        pageSize,
        setPage,
        setPageSize,
    } = usePagination();

    const {
        data,
        isLoading,
        isError,
        error,
    } = useSales(
        page,
        pageSize,
        debouncedSearch,
    );

    const sales = data?.sales ?? [];

    const pagination = data?.pagination;

    const { mutateAsync: voidSale, } = useVoidSale();
    useEffect(() => {
        setPage(1);
    }, [
        debouncedSearch,
        setPage,
    ]);

    const columns = getSaleColumns({
        onReturn: (sale) => setSaleToReturn(sale),
        onVoid: (sale) => {
            setSaleToVoid(sale);
            setIsVoidConfirmOpen(true);
        },
    });

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Sales
                        </h1>

                        {pagination && (
                            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                {
                                    pagination.total
                                }
                            </span>
                        )}
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Record completed sales and manage
                        voided transactions.
                    </p>
                </div>

                <Button
                    size="sm"
                    onClick={() =>
                        setIsSaleFormOpen(
                            true,
                        )
                    }
                    className="gap-1.5"
                >
                    <Plus className="h-4 w-4" />
                    New Sale
                </Button>
            </div>

            <Card className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                        value={searchQuery}
                        onChange={(event) =>
                            setSearchQuery(
                                event.target.value,
                            )
                        }
                        placeholder="Search sales by reference..."
                        className="pl-9"
                    />
                </div>
            </Card>

            {isError && (
                <Card className="border-destructive/50 bg-destructive/5 p-6 text-destructive">
                    {error instanceof Error
                        ? error.message
                        : "Failed to load sales."}
                </Card>
            )}

            {!isError && (
                <>
                    <DataTable
                        columns={columns}
                        data={sales}
                        getRowId={(sale) =>
                            sale.id
                        }
                        isLoading={isLoading}
                    />

                    {pagination && (
                        <Pagination
                            pagination={
                                pagination
                            }
                            onPageChange={
                                setPage
                            }
                            onPageSizeChange={
                                setPageSize
                            }
                            className="mt-4"
                        />
                    )}
                </>
            )}

            <Dialog
                open={isSaleFormOpen}
                onOpenChange={
                    setIsSaleFormOpen
                }
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>
                            New Sale
                        </DialogTitle>

                        <DialogDescription>
                            Record a completed sale.
                            Inventory stock will be
                            deducted immediately.
                        </DialogDescription>
                    </DialogHeader>

                    <SaleForm
                        onSuccess={() => {
                            setIsSaleFormOpen(
                                false,
                            );
                        }}
                        onCancel={() => {
                            setIsSaleFormOpen(
                                false,
                            );
                        }}
                    />
                </DialogContent>
            </Dialog>

            <ReturnSaleDialog
                open={saleToReturn !== null}
                sale={saleToReturn}
                onOpenChange={(open) => {
                    if (!open) setSaleToReturn(null);
                }}
            />

            <DeleteConfirmDialog<Sale>
                open={isVoidConfirmOpen}
                onOpenChange={(open) => {
                    setIsVoidConfirmOpen(open);

                    if (!open) {
                        setSaleToVoid(null);
                    }
                }}
                item={saleToVoid}
                itemLabel="sale"
                getItemName={(sale) =>
                    sale.reference_number ||
                    "Sale"
                }
                onConfirm={async (sale) => {
                    await voidSale({
                        saleId: sale.id,
                        reason: "Customer cancellation",
                    });
                    setSaleToVoid(null);
                }}
            />
        </div>
    );
}
