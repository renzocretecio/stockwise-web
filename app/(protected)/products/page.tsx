"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
    Package,
    Search,
    Plus,
    Upload,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    LayoutGrid,
    List,
    Boxes,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Product, ProductsResponse } from "@/modules/products/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import { ProductForm } from "@/modules/products/components/product-form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    productKeys,
    useProductOverallStats,
    useDeleteProduct,
} from "@/modules/products/services";
import { getProductColumns } from "@/modules/products/columns/Product";
import { DataTable } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { usePagination } from "@/hooks/use-pagination";
import { DeleteConfirmDialog } from "@/components/DeleteDialog";
import { ProductImportDialog } from "@/modules/products/components/product-import-dialog";

export default function ProductsPage() {
    const [isProductFormOpen, setIsProductFormOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("name-asc");
    const [viewMode, setViewMode] = useState<"table" | "grid">("table");
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] =
        useState<Product | null>(null);

    const [selectedProduct, setSelectedProduct] =
        useState<Product | null>(null);

    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const {
        page,
        pageSize,
        setPage,
        setPageSize,
    } = usePagination();

    const { mutateAsync: deleteProduct } = useDeleteProduct();

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

    const {
        data: productsData,
        isLoading: isProductsLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useQuery<ProductsResponse>({
        queryKey: [...productKeys.list(), page, pageSize],
        queryFn: () =>
            apiClient<ProductsResponse>(
                `/api/products?page=${page}&page_size=${pageSize}` +
                    (searchQuery
                        ? `&search=${encodeURIComponent(searchQuery)}`
                        : "") +
                    (selectedCategory !== "all"
                        ? `&category=${encodeURIComponent(selectedCategory)}`
                        : ""),
            ),
        staleTime: 1000 * 60 * 2,
    });

    const products: Product[] = productsData?.products ?? [];
    const pagination = productsData?.pagination;

    const {
        data: overviewData,
        isLoading: isOverviewDataLoading,
        refetch: refetchOverall
    } = useProductOverallStats();

    const categories = useMemo(() => {
        const set = new Set<string>();

        products.forEach((product) => {
            const category =
                product.category || product.category_name;

            if (category) {
                set.add(category);
            }
        });

        return Array.from(set);
    }, [products]);

    const isPageLoading = isProductsLoading || isOverviewDataLoading;

    return(
        <div className="space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Products
                        </h1>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                        {products.length} {products.length === 1 ? "Item" : "Items"}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your inventory catalog, stock levels, and product pricing.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {refetch(), refetchOverall()}}
                        disabled={isFetching}
                        className="cursor-pointer gap-1.5"
                    >
                        <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
                        <span>Refresh</span>
                    </Button>
                    <Button variant="outline" size="sm" className="cursor-pointer gap-1.5" onClick={() => setIsImportDialogOpen(true)}>
                        <Upload className="h-4 w-4" />
                        <span>Import</span>
                    </Button>
                    <Button size="sm" className="cursor-pointer gap-1.5 bg-primary text-primary-foreground shadow-sm" onClick={() => setIsProductFormOpen(true)}>
                        <Plus className="h-4 w-4" />
                        <span>Add Product</span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 border-border/80 bg-card hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Total Products
                        </span>
                        <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                        <Boxes className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-foreground">
                        {isPageLoading ? "…" : overviewData?.total_products}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 block">
                        Catalog inventory
                    </span>
                </Card>
                    {/* In Stock */}
                <Card className="p-4 border-border/80 bg-card hover:border-emerald-500/30 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        In Stock
                        </span>
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-emerald-600">
                        {isPageLoading ? "…" : overviewData?.in_stock}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 block">
                        Healthy stock levels
                    </span>
                </Card>
                {/* Low Stock */}
                <Card className="p-4 border-border/80 bg-card hover:border-amber-500/30 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Low Stock
                        </span>
                        <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                            <AlertTriangle className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-amber-600">
                        {isPageLoading ? "…" : overviewData?.low_stock}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 block">
                        Needs replenishment
                    </span>
                </Card>

                {/* Out of Stock */}
                <Card className="p-4 border-border/80 bg-card hover:border-rose-500/30 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Out of Stock
                        </span>
                        <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
                            <XCircle className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-rose-600">
                        {isPageLoading ? "…" : overviewData?.out_of_stock}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 block">
                        Unavailable items
                    </span>
                </Card>
            </div>

            <Card className="p-4 border-border/80">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    <div className="relative flex-1 min-w-[240px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search by name, SKU, category, or barcode…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-background"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Category Filter */}
                    {categories.length > 0 && (
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="h-9 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                            aria-label="Filter by category"
                        >
                            <option value="all">All Categories</option>
                                {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                            ))}
                        </select>
                    )}

                    {/* Stock Status Filter */}
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="h-9 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                        aria-label="Filter by stock status"
                    >
                        <option value="all">All Status</option>
                        <option value="in_stock">In Stock</option>
                        <option value="low_stock">Low Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="h-9 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                        aria-label="Sort products"
                    >
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                        <option value="price-asc">Price (Low to High)</option>
                        <option value="price-desc">Price (High to Low)</option>
                        <option value="stock-desc">Stock (Highest first)</option>
                        <option value="stock-asc">Stock (Lowest first)</option>
                    </select>

                    <div className="flex items-center border border-input rounded-lg p-0.5 bg-muted/40">
                        <button
                            type="button"
                            onClick={() => setViewMode("table")}
                            className={cn(
                            "p-1.5 rounded-md transition-colors cursor-pointer",
                            viewMode === "table"
                                ? "bg-background text-foreground shadow-xs font-semibold"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                            aria-label="Table view"
                        >
                            <List className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode("grid")}
                            className={cn(
                            "p-1.5 rounded-md transition-colors cursor-pointer",
                            viewMode === "grid"
                                ? "bg-background text-foreground shadow-xs font-semibold"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                            aria-label="Grid view"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </Card>

            {isError && (
                <Card className="p-6 border-destructive/50 bg-destructive/5 text-destructive">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-sm">Failed to load products</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {(error as Error)?.message || "An unexpected error occurred while fetching product data."}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetch()}
                            className="cursor-pointer"
                        >
                            Try Again
                        </Button>
                    </div>
                </Card>
            )}

            {isPageLoading && (
                <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                    key={i}
                    className="h-16 rounded-xl bg-muted/60 animate-pulse border border-border/40"
                    />
                ))}
                </div>
            )}

            {!isPageLoading && !isError && (
                // <ProductsConsole products={products} />
                <>
                    <DataTable columns={columns} data={products} getRowId={(p) => p.id} isLoading={isProductsLoading} />
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
            

            {/* 8. EMPTY STATE */}
            {!isPageLoading && !isError && products.length === 0 && (
                <Card className="p-12 text-center border-dashed border-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4">
                    <Package className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                    No products found
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-6">
                    {searchQuery || selectedCategory !== "all" || selectedStatus !== "all"
                    ? "No products match your active search or filter criteria. Try clearing your filters."
                    : "You haven't added any products to this business catalog yet."}
                </p>
                <div className="flex items-center justify-center gap-3">
                    {(searchQuery || selectedCategory !== "all" || selectedStatus !== "all") && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("all");
                        setSelectedStatus("all");
                        }}
                        className="cursor-pointer"
                    >
                        Clear Filters
                    </Button>
                    )}
                    <Link href="/products/new">
                        <Button
                            size="sm"
                            onClick={() => setIsProductFormOpen(true)}
                            className="cursor-pointer gap-1.5 bg-primary text-primary-foreground shadow-sm"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Add Product</span>
                        </Button>
                    </Link>
                </div>
                </Card>
            )}

            <Dialog
                open={isProductFormOpen}
                onOpenChange={(open) => {
                    setIsProductFormOpen(open);

                    if (!open) {
                        setSelectedProduct(null);
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedProduct
                                ? "Update Product"
                                : "Add Product"}
                        </DialogTitle>

                        <DialogDescription>
                            {selectedProduct
                                ? "Update existing product."
                                : "Add a new product to your inventory catalog."}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedProduct ? (
                        <ProductForm
                            productId={selectedProduct.id}
                            initialData={selectedProduct}
                            onSuccess={() => {
                                setIsProductFormOpen(false);
                                setSelectedProduct(null);
                            }}
                            onCancel={() => {
                                setIsProductFormOpen(false);
                                setSelectedProduct(null);
                            }}
                        />
                    ) : (
                        <ProductForm
                            onSuccess={() => {
                                setIsProductFormOpen(false);
                            }}
                            onCancel={() => {
                                setIsProductFormOpen(false);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <DeleteConfirmDialog<Product>
                open={isDeleteConfirmOpen}
                onOpenChange={setIsDeleteConfirmOpen}
                item={productToDelete}
                itemLabel="product"
                getItemName={(product) => product.name}
                onConfirm={async (product) => {
                    await deleteProduct(product.id);
                }}
            />
            <ProductImportDialog
                open={isImportDialogOpen}
                onOpenChange={setIsImportDialogOpen}
                onSuccess={() => {
                    refetch();
                    refetchOverall();
                }}
            />
        </div>
    );
}