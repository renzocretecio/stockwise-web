"use client";

import { useState } from "react";
import { FolderTree, Plus, RefreshCw, Search } from "lucide-react";

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
import { getCategoryColumns } from
  "@/modules/products/columns/Category";
import { CategoryForm } from
  "@/modules/products/components/category-form";
import {
  useCategories,
  useDeleteCategory,
} from "@/modules/products/services/category";
import type { Category } from "@/modules/products/types/category";

export default function CategoriesPage() {
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] =
    useState<Category | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const { page, pageSize, search, setPage, setPageSize, setSearch } =
    usePagination();
  const debouncedSearch = useDebounce(search, 400);
  const { mutateAsync: deleteCategory } = useDeleteCategory(
    categoryToDelete?.id ?? "",
  );
  const {
    data: categoriesData,
    error,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useCategories(page, pageSize, debouncedSearch);

  const categories = categoriesData?.categories ?? [];
  const pagination = categoriesData?.pagination;
  const hasSearch = Boolean(search);

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

  const closeCategoryForm = () => {
    setIsCategoryFormOpen(false);
    setSelectedCategory(null);
  };

  const handleCategorySuccess = () => {
    closeCategoryForm();
    void refetch();
  };

  return (
    <div className="pb-12">
      <header
        className={
          "flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-end " +
          "sm:justify-between"
        }
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
            <span className="text-xs text-muted-foreground">
              {pagination?.total ?? categories.length} in catalog
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Group products into categories for clearer inventory reporting.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            aria-label="Refresh categories"
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
          <Button
            onClick={() => {
              setSelectedCategory(null);
              setIsCategoryFormOpen(true);
            }}
            size="sm"
            type="button"
          >
            <Plus className="mr-1.5 size-4" />
            Add category
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
              aria-label="Search categories"
              className="h-10 pl-9"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search categories"
              value={search}
            />
          </div>
          {hasSearch ? (
            <Button
              onClick={() => setSearch("")}
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
            <FolderTree className="mt-0.5 size-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-medium">Unable to load categories</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {error instanceof Error ? error.message : "Please try again."}
              </p>
            </div>
            <Button
              onClick={() => void refetch()}
              size="sm"
              variant="outline"
            >
              Try again
            </Button>
          </div>
        </section>
      ) : null}

      <section>
        {isLoading ? (
          <CategoriesLoading />
        ) : (
          <div className="p-2 sm:p-4">
            <DataTable
              className="rounded-none border-0 shadow-none ring-0"
              columns={columns}
              data={categories}
              emptyLabel="category"
              emptyState={
                <EmptyCategories
                  filtered={hasSearch}
                  onClear={() => setSearch("")}
                  onCreate={() => setIsCategoryFormOpen(true)}
                />
              }
              getRowId={(category) => category.id}
            />
            {pagination ? (
              <Pagination
                className="mt-4"
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                pagination={pagination}
              />
            ) : null}
          </div>
        )}
      </section>

      <Dialog
        onOpenChange={(open) => {
          setIsCategoryFormOpen(open);
          if (!open) setSelectedCategory(null);
        }}
        open={isCategoryFormOpen}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? "Update category" : "Add category"}
            </DialogTitle>
            <DialogDescription>
              {selectedCategory
                ? "Update the category details."
                : "Create a category to keep related products together."}
            </DialogDescription>
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
            onCancel={closeCategoryForm}
            onSuccess={handleCategorySuccess}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog<Category>
        getItemName={(category) => category.name}
        item={categoryToDelete}
        itemLabel="category"
        onConfirm={async () => {
          await deleteCategory();
          await refetch();
        }}
        onOpenChange={setIsDeleteConfirmOpen}
        open={isDeleteConfirmOpen}
        warning={(category) =>
          category.product_count > 0
            ? `${category.product_count} product(s) are assigned to this category.`
            : null
        }
      />
    </div>
  );
}

function EmptyCategories({
  filtered,
  onClear,
  onCreate,
}: {
  filtered: boolean;
  onClear: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        <FolderTree className="size-5" />
      </div>
      <p className="font-medium">
        {filtered ? "No matching categories" : "No categories yet"}
      </p>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">
        {filtered
          ? "Try a different search or clear the current search."
          : "Create categories to keep related products organized."}
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {filtered ? (
          <Button onClick={onClear} size="sm" variant="outline">
            Clear search
          </Button>
        ) : null}
        <Button onClick={onCreate} size="sm">
          <Plus className="mr-1.5 size-4" />
          Add category
        </Button>
      </div>
    </div>
  );
}

function CategoriesLoading() {
  return (
    <div className="space-y-px bg-border">
      {Array.from({ length: 6 }).map((_, index) => (
        <div className="h-14 animate-pulse bg-background" key={index} />
      ))}
    </div>
  );
}
