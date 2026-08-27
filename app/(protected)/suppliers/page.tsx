"use client";

import {
    useMemo,
    useState,
} from "react";
import {
    Plus,
    Search,
    Truck,
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
import { Pagination } from "@/components/Pagination";
import { DeleteConfirmDialog } from "@/components/DeleteDialog";

import { SupplierForm } from "@/modules/suppliers/components/supplier-form";
import { getSupplierColumns } from "@/modules/suppliers/columns/suppliers";
import {
    useDeleteSupplier,
    useSuppliers,
} from "@/modules/suppliers/services/suppliers";
import { Supplier } from "@/modules/suppliers/types";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";

export default function SuppliersPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const {
        page,
        pageSize,
        setPage,
        setPageSize,
    } = usePagination();

    const [
        isSupplierFormOpen,
        setIsSupplierFormOpen,
    ] = useState(false);

    const [
        selectedSupplier,
        setSelectedSupplier,
    ] = useState<Supplier | null>(null);

    const [
        supplierToDelete,
        setSupplierToDelete,
    ] = useState<Supplier | null>(null);

    const [
        isDeleteConfirmOpen,
        setIsDeleteConfirmOpen,
    ] = useState(false);

    const debouncedSearch =
        useDebounce(searchQuery, 500);

    const {
        data,
        isLoading,
        isError,
        error,
    } = useSuppliers(
        page,
        pageSize,
        debouncedSearch,
    );

    const {
        mutateAsync: deleteSupplier,
        isPending: isDeleting,
    } = useDeleteSupplier();

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

    const handleAddSupplier = () => {
        setSelectedSupplier(null);
        setIsSupplierFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsSupplierFormOpen(false);
        setSelectedSupplier(null);
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Suppliers
                        </h1>

                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                            {pagination?.total}
                        </span>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage suppliers, contact details,
                        payment terms, and lead times.
                    </p>
                </div>

                <Button
                    size="sm"
                    onClick={handleAddSupplier}
                    className="cursor-pointer gap-1.5"
                >
                    <Plus className="h-4 w-4" />
                    Add Supplier
                </Button>
            </div>

            <Card className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                        value={searchQuery}
                        onChange={(event) => {
                            setSearchQuery(
                                event.target.value,
                            );

                            setPage(1);
                        }}
                        placeholder="Search suppliers..."
                        className="pl-9"
                    />
                </div>
            </Card>

            {isError && (
                <Card className="border-destructive/50 bg-destructive/5 p-6 text-destructive">
                    <p className="text-sm">
                        {error instanceof Error
                            ? error.message
                            : "Failed to load suppliers."}
                    </p>
                </Card>
            )}

            {!isError && (
                <>
                    <DataTable
                        columns={columns}
                        data={suppliers}
                        getRowId={(supplier) => supplier.id}
                        isLoading={isLoading}
                    />

                    {pagination && (
                        <Pagination
                            pagination={pagination}
                            onPageChange={setPage}
                            onPageSizeChange={setPageSize}
                            className="mt-4"
                        />
                    )}
                </>
            )}

            {!isLoading &&
                !isError &&
                (pagination && pagination.total === 0) && (
                    <Card className="border-2 border-dashed p-12 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Truck className="h-6 w-6" />
                        </div>

                        <h3 className="text-lg font-semibold">
                            No suppliers found
                        </h3>

                        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                            {searchQuery
                                ? "No suppliers match your search."
                                : "Add your first supplier to start managing purchasing and inventory relationships."}
                        </p>

                        {!searchQuery && (
                            <Button
                                type="button"
                                size="sm"
                                onClick={
                                    handleAddSupplier
                                }
                                className="mt-4 gap-1.5"
                            >
                                <Plus className="h-4 w-4" />
                                Add Supplier
                            </Button>
                        )}
                    </Card>
                )}

            <Dialog
                open={isSupplierFormOpen}
                onOpenChange={(open) => {
                    setIsSupplierFormOpen(
                        open,
                    );

                    if (!open) {
                        setSelectedSupplier(
                            null,
                        );
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedSupplier
                                ? "Update Supplier"
                                : "Add Supplier"}
                        </DialogTitle>

                        <DialogDescription>
                            {selectedSupplier
                                ? "Update the supplier information."
                                : "Add a new supplier to your business."}
                        </DialogDescription>
                    </DialogHeader>

                    <SupplierForm
                        key={
                            selectedSupplier?.id ??
                            "new"
                        }
                        supplier={
                            selectedSupplier
                        }
                        onSuccess={
                            handleCloseForm
                        }
                        onCancel={
                            handleCloseForm
                        }
                    />
                </DialogContent>
            </Dialog>

            <DeleteConfirmDialog<Supplier>
                open={isDeleteConfirmOpen}
                onOpenChange={
                    setIsDeleteConfirmOpen
                }
                item={supplierToDelete}
                itemLabel="supplier"
                getItemName={(supplier) =>
                    supplier.name
                }
                onConfirm={async (
                    supplier,
                ) => {
                    await deleteSupplier(
                        supplier.id,
                    );

                    setSupplierToDelete(
                        null,
                    );
                }}
            />
        </div>
    );
}