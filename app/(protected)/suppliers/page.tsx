"use client";

import { useState } from "react";
import { Plus, RefreshCw, Search, Truck } from "lucide-react";

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
import { getSupplierColumns } from "@/modules/suppliers/columns/suppliers";
import { SupplierForm } from "@/modules/suppliers/components/supplier-form";
import {
    useDeleteSupplier,
    useSuppliers,
} from "@/modules/suppliers/services/suppliers";
import type { Supplier } from "@/modules/suppliers/types";

export default function SuppliersPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isSupplierFormOpen, setIsSupplierFormOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
        null,
    );
    const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(
        null,
    );
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const { page, pageSize, setPage, setPageSize } = usePagination();
    const debouncedSearch = useDebounce(searchQuery, 500);
    const { data, isLoading, isError, error, refetch, isFetching } =
        useSuppliers(page, pageSize, debouncedSearch);
    const { mutateAsync: deleteSupplier } = useDeleteSupplier();
    const suppliers = data?.suppliers ?? [];
    const pagination = data?.pagination;

    const columns = getSupplierColumns({
        onEdit: (supplier) => {
            setSelectedSupplier(supplier);
            setIsSupplierFormOpen(true);
        },
        onDelete: (supplier) => {
            setSupplierToDelete(supplier);
            setIsDeleteConfirmOpen(true);
        },
    });

    const closeForm = () => {
        setIsSupplierFormOpen(false);
        setSelectedSupplier(null);
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
                            Suppliers
                        </h1>
                        <span className="text-xs text-muted-foreground">
                            {pagination?.total ?? suppliers.length} suppliers
                        </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Manage supplier contacts, payment terms, and
                        replenishment lead times.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        aria-label="Refresh suppliers"
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
                        onClick={() => setIsSupplierFormOpen(true)}
                        size="sm"
                    >
                        <Plus className="mr-1.5 size-4" />
                        Add supplier
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
                            aria-label="Search suppliers"
                            className="h-10 pl-9"
                            onChange={(event) => {
                                setPage(1);
                                setSearchQuery(event.target.value);
                            }}
                            placeholder="Search supplier, contact, email, or phone"
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
                        <Truck className="mt-0.5 size-4 shrink-0" />
                        <div className="min-w-0 flex-1">
                            <p className="font-medium">
                                Unable to load suppliers
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

            <div className="p-2 sm:p-4">
                <DataTable
                    className="rounded-none border-0 shadow-none ring-0"
                    columns={columns}
                    data={suppliers}
                    emptyLabel="supplier"
                    emptyState={
                        <EmptySuppliers
                            filtered={Boolean(searchQuery)}
                            onCreate={() => setIsSupplierFormOpen(true)}
                        />
                    }
                    getRowId={(supplier) => supplier.id}
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

            <Dialog
                onOpenChange={(open) => {
                    setIsSupplierFormOpen(open);
                    if (!open) setSelectedSupplier(null);
                }}
                open={isSupplierFormOpen}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedSupplier
                                ? "Update supplier"
                                : "Add supplier"}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedSupplier
                                ? "Update this supplier's information."
                                : "Add a supplier to use in purchase orders."}
                        </DialogDescription>
                    </DialogHeader>
                    <SupplierForm
                        key={selectedSupplier?.id ?? "new"}
                        onCancel={closeForm}
                        onSuccess={closeForm}
                        supplier={selectedSupplier}
                    />
                </DialogContent>
            </Dialog>

            <DeleteConfirmDialog<Supplier>
                getItemName={(supplier) => supplier.name}
                item={supplierToDelete}
                itemLabel="supplier"
                onConfirm={async (supplier) => {
                    await deleteSupplier(supplier.id);
                    setSupplierToDelete(null);
                }}
                onOpenChange={(open) => {
                    setIsDeleteConfirmOpen(open);
                    if (!open) setSupplierToDelete(null);
                }}
                open={isDeleteConfirmOpen}
            />
        </div>
    );
}

function EmptySuppliers({
    filtered,
    onCreate,
}: {
    filtered: boolean;
    onCreate: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Truck className="size-5" />
            </div>
            <p className="font-medium">
                {filtered ? "No matching suppliers" : "No suppliers yet"}
            </p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                {filtered
                    ? "Try a different search or clear the current search."
                    : "Add a supplier before creating your next purchase order."}
            </p>
            {!filtered ? (
                <Button
                    className="mt-5"
                    onClick={onCreate}
                    size="sm"
                    type="button"
                >
                    <Plus className="mr-1.5 size-4" />
                    Add supplier
                </Button>
            ) : null}
        </div>
    );
}
