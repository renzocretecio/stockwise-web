"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Plus, RefreshCw } from "lucide-react";
import { useCategories, useDeleteCategory } from "@/modules/products/services/category";
import { Category } from "@/modules/products/types/category";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { usePagination } from "@/hooks/use-pagination";
import { DataTable } from "@/components/DataTable";
import { getCategoryColumns } from "@/modules/products/columns/Category";
import { Pagination } from "@/components/Pagination";
import { CategoryForm } from "@/modules/products/components/category-form";
import { DeleteConfirmDialog } from "@/components/DeleteDialog";

export default function CategoriesPage() {
    const [isMounted, setIsMounted] = useState(false);
    const [businessId, setBusinessId] = useState<string | null>(null);
    const { page, pageSize, search, sort, setPage, setPageSize, setSearch, handleSortChange } = usePagination();
    const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const { mutateAsync: deleteCategory } = useDeleteCategory(categoryToDelete?.id ?? "");

    useEffect(() => {
        setIsMounted(true);
        const id = Cookies.get("active_business_id");
        setBusinessId(id || null);
    }, []);

    const columns = getCategoryColumns({
        onEdit: (category) => {
            setSelectedCategory(category);
            setIsCategoryFormOpen(true);
        },
        onDelete: (category) => {
            setCategoryToDelete(category);
            setIsDeleteConfirmOpen(true);
        },
    });

    const {
        data: categoriesData,
        isLoading: isCategoriesLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useCategories(businessId || "", page, pageSize, search);

    const categories: Category[] = categoriesData?.categories ?? [];
    const pagination = categoriesData?.pagination;
    const errorMessage =
        error instanceof Error
            ? error.message
            : "Failed to load categories";

    const closeCategoryForm = (open: boolean) => {
        setIsCategoryFormOpen(open);
        if (!open) {
            // Clear edit target whenever the dialog closes, so the next
            // "Add category" click doesn't accidentally reopen in edit mode.
            setSelectedCategory(null);
        }
    };

    if (!isMounted) {
        return <CategoriesTableSkeleton />;
    }

    return (
        <main className="space-y-6 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Categories
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Organize your products into categories.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isFetching}
                    >
                        <RefreshCw
                            className={
                                isFetching
                                    ? "mr-2 size-4 animate-spin"
                                    : "mr-2 size-4"
                            }
                        />
                        Refresh
                    </Button>

                    <Button
                        size="sm"
                        onClick={() => {
                            setSelectedCategory(null);
                            setIsCategoryFormOpen(true);
                        }}
                    >
                        <Plus className="mr-2 size-4" />
                        Add category
                    </Button>
                </div>
            </div>

            {isCategoriesLoading && (
                <CategoriesTableSkeleton />
            )}

            {isError && (
                <Card>
                    <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
                        <div>
                            <h2 className="font-medium">
                                Unable to load categories
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                {errorMessage}
                            </p>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetch()}
                        >
                            Try again
                        </Button>
                    </CardContent>
                </Card>
            )}

            {!isCategoriesLoading &&
                !isError && (
                    <div>
                        {!Array.isArray(categories) || categories.length === 0 ? (
                            <EmptyCategories />
                        ) : (
                            <>
                                <DataTable
                                    data={categories}
                                    columns={columns}
                                    getRowId={(p) => p.id}
                                    isLoading={isCategoriesLoading}
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
                    </div>
                )}

            {/* Single dialog handles BOTH create and edit — mode is derived
                from whether selectedCategory is set. */}
            <Dialog open={isCategoryFormOpen} onOpenChange={closeCategoryForm}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedCategory ? "Update category" : "Add category"}
                        </DialogTitle>

                        {!selectedCategory && (
                            <DialogDescription>
                                Add a new category.
                            </DialogDescription>
                        )}
                    </DialogHeader>

                    <CategoryForm
                        categoryId={selectedCategory?.id}
                        initialData={
                            selectedCategory
                                ? {
									name: selectedCategory.name,
									description: selectedCategory.description ?? "",
								}
                                : undefined
                        }
                        onSuccess={() => closeCategoryForm(false)}
                        onCancel={() => closeCategoryForm(false)}
                    />
                </DialogContent>
            </Dialog>

            <DeleteConfirmDialog<Category>
                open={isDeleteConfirmOpen}
                onOpenChange={setIsDeleteConfirmOpen}
                item={categoryToDelete}
                itemLabel="category"
                getItemName={(c) => c.name}
                warning={(c) =>
                    c.product_count > 0
                        ? `${c.product_count} product(s) are assigned to this category.`
                        : null
                }
                onConfirm={async() => {await deleteCategory()}}
            />
        </main>
    );
}

function EmptyCategories() {
	return (
		<div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
			<h2 className="font-medium">
				No categories yet
			</h2>

			<p className="mt-1 max-w-sm text-sm text-muted-foreground">
				Create your first category to organize
				products more easily.
			</p>

			<Button className="mt-4" size="sm">
				<Plus className="mr-2 size-4" />
				Add category
			</Button>
		</div>
	);
}

function CategoriesTableSkeleton() {
	return (
		<Card>
			<CardContent className="space-y-4 p-6">
				{Array.from({ length: 5 }).map(
				(_, index) => (
					<div
					key={index}
					className="h-12 animate-pulse rounded-md bg-muted"
					/>
				),
				)}
			</CardContent>
		</Card>
	);
}