"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Package,
  Plus,
  RefreshCw,
  Search,
  Upload,
  XCircle,
} from "lucide-react";

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
import { apiClient } from "@/lib/api-client";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { usePagination } from "@/hooks/use-pagination";
import { getProductColumns } from "@/modules/products/columns/Product";
import { ProductForm } from "@/modules/products/components/product-form";
import { ProductImportDialog } from
  "@/modules/products/components/product-import-dialog";
import {
  productKeys,
  useDeleteProduct,
  useProductOverallStats,
} from "@/modules/products/services";
import type { Product, ProductsResponse } from "@/modules/products/types";

const selectClass =
  "h-9 rounded-md border border-input bg-background px-3 text-sm " +
  "text-foreground outline-none focus:ring-2 focus:ring-primary";

export default function ProductsPage() {
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] =
    useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const { mutateAsync: deleteProduct } = useDeleteProduct();

  const {
    data: productsData,
    isLoading: isProductsLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<ProductsResponse>({
    queryKey: [
      ...productKeys.list(),
      page,
      pageSize,
      debouncedSearchQuery,
      selectedCategory,
      selectedStatus,
    ],
    queryFn: () => {
      const query = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
      });
      if (debouncedSearchQuery) {
        query.set("search", debouncedSearchQuery);
      }
      if (selectedCategory !== "all") {
        query.set("category", selectedCategory);
      }
      if (selectedStatus !== "all") {
        query.set("stock_status", selectedStatus);
      }
      return apiClient<ProductsResponse>(`/api/products?${query}`);
    },
    staleTime: 1000 * 60 * 2,
  });

  const {
    data: overviewData,
    isLoading: isOverviewDataLoading,
    refetch: refetchOverall,
  } = useProductOverallStats();

  const products = useMemo(
    () => productsData?.products ?? [],
    [productsData?.products],
  );
  const pagination = productsData?.pagination;
  const isPageLoading = isProductsLoading || isOverviewDataLoading;

  const categories = useMemo(() => {
    const values = new Set<string>();
    products.forEach((product) => {
      const category = product.category_name ?? product.category;
      if (category) values.add(category);
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const visibleProducts = products;

  const columns = getProductColumns({
    onEdit: (product) => {
      setSelectedProduct(product);
      setIsProductFormOpen(true);
    },
    onDelete: (product) => {
      setProductToDelete(product);
      setIsDeleteConfirmOpen(true);
    },
  });

  const refreshProducts = () => {
    void Promise.all([refetch(), refetchOverall()]);
  };

  const closeProductForm = () => {
    setIsProductFormOpen(false);
    setSelectedProduct(null);
  };

  const handleProductSuccess = () => {
    closeProductForm();
    void refetchOverall();
  };

  const hasFilters =
    Boolean(searchQuery) ||
    selectedCategory !== "all" ||
    selectedStatus !== "all";

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
            <h1 className="text-2xl font-bold tracking-tight">Products</h1>
            <span className="text-xs text-muted-foreground">
              {pagination?.total ?? products.length} in catalog
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Manage your catalog, stock levels, and product pricing.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            aria-label="Refresh products"
            disabled={isFetching}
            onClick={refreshProducts}
            size="icon"
            type="button"
            variant="outline"
          >
            <RefreshCw
              className={cn("size-4", isFetching && "animate-spin")}
            />
          </Button>
          <Button
            onClick={() => setIsImportDialogOpen(true)}
            size="sm"
            type="button"
            variant="outline"
          >
            <Upload className="mr-1.5 size-4" />
            Import
          </Button>
          <Button
            onClick={() => setIsProductFormOpen(true)}
            size="sm"
            type="button"
          >
            <Plus className="mr-1.5 size-4" />
            Add product
          </Button>
        </div>
      </header>

      <section className="border-b">
        <div className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-4">
          <ProductStat
            icon={<Boxes className="size-4" />}
            label="Total products"
            value={overviewData?.total_products}
            loading={isPageLoading}
          />
          <ProductStat
            className="text-emerald-600"
            icon={<CheckCircle2 className="size-4" />}
            label="In stock"
            value={overviewData?.in_stock}
            loading={isPageLoading}
          />
          <ProductStat
            className="text-amber-600"
            icon={<AlertTriangle className="size-4" />}
            label="Low stock"
            value={overviewData?.low_stock}
            loading={isPageLoading}
          />
          <ProductStat
            className="text-destructive"
            icon={<XCircle className="size-4" />}
            label="Out of stock"
            value={overviewData?.out_of_stock}
            loading={isPageLoading}
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
              aria-label="Search products"
              className="h-10 pl-9"
              onChange={(event) => {
                setPage(1);
                setSearchQuery(event.target.value);
              }}
              placeholder="Search by name, SKU, category, or barcode"
              value={searchQuery}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              aria-label="Filter by category"
              className={selectClass}
              onChange={(event) => {
                setPage(1);
                setSelectedCategory(event.target.value);
              }}
              value={selectedCategory}
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by stock status"
              className={selectClass}
              onChange={(event) => {
                setPage(1);
                setSelectedStatus(event.target.value);
              }}
              value={selectedStatus}
            >
              <option value="all">All stock</option>
              <option value="in_stock">In stock</option>
              <option value="low_stock">Low stock</option>
              <option value="out_of_stock">Out of stock</option>
            </select>
            {hasFilters ? (
              <Button
                onClick={() => {
                  setPage(1);
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedStatus("all");
                }}
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
              <p className="font-medium">Unable to load products</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {error instanceof Error
                  ? error.message
                  : "Please try again."}
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
        {isProductsLoading ? (
          <div className="space-y-px bg-border">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                className="h-14 animate-pulse bg-background"
                key={index}
              />
            ))}
          </div>
        ) : (
          <div className="p-2 sm:p-4">
            <DataTable
              className="rounded-none border-0 shadow-none ring-0"
              columns={columns}
              data={visibleProducts}
              emptyLabel="product"
              emptyState={
                <ProductEmptyState
                  filtered={hasFilters}
                  onClear={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedStatus("all");
                  }}
                  onCreate={() => setIsProductFormOpen(true)}
                />
              }
              getRowId={(product) => product.id}
              isLoading={isProductsLoading}
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
          setIsProductFormOpen(open);
          if (!open) setSelectedProduct(null);
        }}
        open={isProductFormOpen}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? "Update product" : "Add product"}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct
                ? "Update the details for this product."
                : "Add a product to your inventory catalog."}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            initialData={selectedProduct ?? undefined}
            onCancel={closeProductForm}
            onSuccess={handleProductSuccess}
            productId={selectedProduct?.id}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog<Product>
        getItemName={(product) => product.name}
        item={productToDelete}
        itemLabel="product"
        onConfirm={async (product) => {
          await deleteProduct(product.id);
          await refetchOverall();
        }}
        onOpenChange={setIsDeleteConfirmOpen}
        open={isDeleteConfirmOpen}
      />

      <ProductImportDialog
        onOpenChange={setIsImportDialogOpen}
        onSuccess={refreshProducts}
        open={isImportDialogOpen}
      />
    </div>
  );
}

function ProductStat({
  className,
  icon,
  label,
  loading,
  value,
}: {
  className?: string;
  icon: ReactNode;
  label: string;
  loading: boolean;
  value?: number;
}) {
  return (
    <div className="flex items-center justify-between bg-background p-4 sm:p-5">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={cn(
            "mt-1 text-xl font-semibold tabular-nums",
            className,
          )}
        >
          {loading ? "…" : value ?? 0}
        </p>
      </div>
      <span className={cn("text-muted-foreground", className)}>{icon}</span>
    </div>
  );
}

function ProductEmptyState({
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
        <Package className="size-5" />
      </div>
      <p className="font-medium">
        {filtered ? "No matching products" : "No products yet"}
      </p>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">
        {filtered
          ? "Try a different search or clear the active filters."
          : "Add your first product to start tracking inventory."}
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {filtered ? (
          <Button onClick={onClear} size="sm" variant="outline">
            Clear filters
          </Button>
        ) : null}
        <Button onClick={onCreate} size="sm">
          <Plus className="mr-1.5 size-4" />
          Add product
        </Button>
      </div>
    </div>
  );
}
