"use client";
import React, { useState, useMemo, useEffect } from "react";
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
  Tag,
  Barcode,
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
import { useQueryClient } from "@tanstack/react-query";
import { productKeys } from "@/modules/products/services";

export default function ProductsPage() {
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("name-asc");
    const [viewMode, setViewMode] = useState<"table" | "grid">("table");
    const [isProductFormOpen, setIsProductFormOpen] = useState(false);
    const [businessId, setBusinessId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);

    useEffect(() => {
        setIsMounted(true);
        const id = Cookies.get("active_business_id");
        setBusinessId(id || null);
    }, []);

    const {
        data: productsData,
        isLoading: isProductsLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useQuery<ProductsResponse>({
        queryKey: [...productKeys.list(businessId || ""), page, pageSize],
        queryFn: () =>
            apiClient<ProductsResponse>(
                `/api/products?page=${page}&page_size=${pageSize}` +
                (searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : "") +
                (selectedCategory !== "all" ? `&category=${encodeURIComponent(selectedCategory)}` : "")
            ),
        enabled: Boolean(businessId),
        staleTime: 1000 * 60 * 2,
    });

    const products: Product[] = productsData?.products ?? [];
    const pagination = productsData?.pagination;

    useEffect(() => {
        setPage(1);
    }, [searchQuery, selectedCategory, selectedStatus]);

    const categories = useMemo(() => {
        const set = new Set<string>();
        products.forEach((p) => {
        const cat = p.category || p.category_name;
        if (cat) set.add(cat);
    });
    return Array.from(set);
    }, [products]);

    // Helper to determine product stock count
    const getProductStock = (p: Product) => p.stock_quantity ?? p.quantity ?? 0;
    const getProductMinStock = (p: Product) => p.min_stock_level ?? p.reorder_point ?? 5;
    const getProductPrice = (p: Product) => p.selling_price ?? p.price ?? 0;
    const getProductCost = (p: Product) => p.cost_price ?? 0;

    const stats = useMemo(() => {
        const total = products.length;
        let inStock = 0;
        let lowStock = 0;
        let outOfStock = 0;
        let totalValue = 0;
        products.forEach((p) => {
            const stock = getProductStock(p);
            const minStock = getProductMinStock(p);
            const price = getProductPrice(p);
            totalValue += stock * price;

            if (stock <= 0) {
                outOfStock++;
            } else if (stock <= minStock) {
                lowStock++;
            } else {
                inStock++;
            }
        });
        return { total, inStock, lowStock, outOfStock, totalValue };
    }, [products]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            // Search query filter
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const nameMatch = p.name?.toLowerCase().includes(q);
                const skuMatch = p.sku?.toLowerCase().includes(q);
                const barcodeMatch = p.barcode?.toLowerCase().includes(q);
                const catMatch = (p.category || p.category_name)?.toLowerCase().includes(q);
                if (!nameMatch && !skuMatch && !barcodeMatch && !catMatch) return false;
            }

            if (selectedCategory !== "all") {
                const cat = p.category || p.category_name;
                if (cat !== selectedCategory) return false;
            }

            if (selectedStatus !== "all") {
                const stock = getProductStock(p);
                const minStock = getProductMinStock(p);
                if (selectedStatus === "in_stock" && stock <= minStock) return false;
                if (selectedStatus === "low_stock" && (stock > minStock || stock <= 0)) return false;
                if (selectedStatus === "out_of_stock" && stock > 0) return false;
            }

            return true;
        }).sort((a, b) => {
            const nameA = a.name || "";
            const nameB = b.name || "";
            const priceA = getProductPrice(a);
            const priceB = getProductPrice(b);
            const stockA = getProductStock(a);
            const stockB = getProductStock(b);

            switch (sortBy) {
                case "name-asc":
                    return nameA.localeCompare(nameB);
                case "name-desc":
                    return nameB.localeCompare(nameA);
                case "price-asc":
                    return priceA - priceB;
                case "price-desc":
                    return priceB - priceA;
                case "stock-asc":
                    return stockA - stockB;
                case "stock-desc":
                    return stockB - stockA;
                default:
                    return 0;
            }
        })
    }, [products, searchQuery, selectedCategory, selectedStatus, sortBy])

    const isPageLoading = !isMounted || businessId === null || isProductsLoading;

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
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="cursor-pointer gap-1.5"
                    >
                        <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
                        <span>Refresh</span>
                    </Button>
                    <Link href="/products/import">
                        <Button variant="outline" size="sm" className="cursor-pointer gap-1.5">
                        <Upload className="h-4 w-4" />
                        <span>Import</span>
                        </Button>
                    </Link>
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
                        {isPageLoading ? "…" : stats.total}
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
                        {isPageLoading ? "…" : stats.inStock}
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
                        {isPageLoading ? "…" : stats.lowStock}
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
                        {isPageLoading ? "…" : stats.outOfStock}
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

            {!isPageLoading && !isError && viewMode === "table" && (
                <Card className="overflow-hidden border-border/80">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 border-b border-border/80 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                <tr>
                                    <th scope="col" className="px-6 py-3.5">
                                        Product
                                    </th>
                                    <th scope="col" className="px-6 py-3.5">
                                        Category
                                    </th>
                                    <th scope="col" className="px-6 py-3.5">
                                        Pricing
                                    </th>
                                    <th scope="col" className="px-6 py-3.5">
                                        Stock Level
                                    </th>
                                    <th scope="col" className="px-6 py-3.5">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3.5 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {filteredProducts.map((product) => {
                                    const stock = getProductStock(product);
                                    const minStock = getProductMinStock(product);
                                    const price = getProductPrice(product);
                                    const cost = getProductCost(product);
                                    const category = product.category || product.category_name || "Uncategorized";
                                    const isOutOfStock = stock <= 0;
                                    const isLowStock = stock > 0 && stock <= minStock;

                                    return(
                                        <tr key={product.id} className="hover:bg-muted/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                                                    <Package className="h-5 w-5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                    {product.name}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                                    {product.sku && (
                                                        <span className="font-mono bg-muted px-1.5 py-0.5 rounded">
                                                        SKU: {product.sku}
                                                        </span>
                                                    )}
                                                    {product.barcode && (
                                                        <span className="flex items-center gap-1 font-mono text-[11px]">
                                                        <Barcode className="h-3 w-3" />
                                                        {product.barcode}
                                                        </span>
                                                    )}
                                                    </div>
                                                </div>
                                                </div>
                                            </td>

                                            {/* Category */}
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground">
                                                <Tag className="h-3 w-3 text-muted-foreground" />
                                                {category}
                                                </span>
                                            </td>
                                            {/* Price */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                <span className="font-semibold text-foreground">
                                                    ${price.toFixed(2)}
                                                </span>
                                                {cost > 0 && (
                                                    <span className="text-xs text-muted-foreground">
                                                    Cost: ${cost.toFixed(2)}
                                                    </span>
                                                )}
                                                </div>
                                            </td>

                                            {/* Stock Level */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1.5 min-w-[120px]">
                                                <div className="flex items-center justify-between text-xs font-medium">
                                                    <span
                                                    className={cn(
                                                        isOutOfStock
                                                        ? "text-rose-600 font-semibold"
                                                        : isLowStock
                                                        ? "text-amber-600 font-semibold"
                                                        : "text-foreground"
                                                    )}
                                                    >
                                                    {stock} {product.unit || "units"}
                                                    </span>
                                                    <span className="text-[11px] text-muted-foreground">
                                                    Min: {minStock}
                                                    </span>
                                                </div>
                                                {/* Stock Health Bar */}
                                                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                                    <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-300",
                                                        isOutOfStock
                                                        ? "bg-rose-500 w-full"
                                                        : isLowStock
                                                        ? "bg-amber-500 w-1/3"
                                                        : "bg-emerald-500 w-full"
                                                    )}
                                                    />
                                                </div>
                                                </div>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="px-6 py-4">
                                                {isOutOfStock ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                                                    <XCircle className="h-3 w-3" />
                                                    Out of Stock
                                                </span>
                                                ) : isLowStock ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    Low Stock
                                                </span>
                                                ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    In Stock
                                                </span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                <Link href={`/products/${product.id}`}>
                                                    <Button variant="ghost" size="sm" className="h-8 px-2.5 cursor-pointer text-xs">
                                                    View
                                                    </Button>
                                                </Link>
                                                <Link href={`/products/${product.id}/edit`}>
                                                    <Button variant="outline" size="sm" className="h-8 px-2.5 cursor-pointer text-xs">
                                                    Edit
                                                    </Button>
                                                </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        {!isPageLoading && !isError && pagination && pagination.total_pages > 1 && (
                            <div className="flex items-center justify-between px-2">
                                <p className="text-sm text-muted-foreground">
                                    Showing page {pagination.page} of {pagination.total_pages} ({pagination.total} total products)
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={!pagination.has_previous || isFetching}
                                        className="cursor-pointer"
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage((p) => p + 1)}
                                        disabled={!pagination.has_next || isFetching}
                                        className="cursor-pointer"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {!isPageLoading && !isError && viewMode === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProducts.map((product) => {
                        const stock = getProductStock(product);
                        const minStock = getProductMinStock(product);
                        const price = getProductPrice(product);
                        const category = product.category || product.category_name || "Uncategorized";
                        const isOutOfStock = stock <= 0;
                        const isLowStock = stock > 0 && stock <= minStock;
                        
                        return(
                            <Card
                                key={product.id}
                                className="p-5 border-border/80 hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between group"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                            <Package className="h-6 w-6" />
                                        </div>
                                        {isOutOfStock ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600">
                                                Out of Stock
                                            </span>
                                            ) : isLowStock ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600">
                                                Low Stock
                                            </span>
                                            ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600">
                                                In Stock
                                            </span>
                                        )}

                                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                            {product.name}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                        {product.sku && (
                                        <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[11px]">
                                            SKU: {product.sku}
                                        </span>
                                        )}
                                        <span className="truncate">{category}</span>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                                        <div>
                                            <span className="text-xs text-muted-foreground block">Price</span>
                                            <span className="text-lg font-bold text-foreground">
                                                ${price.toFixed(2)}
                                            </span>
                                            </div>
                                            <div className="text-right">
                                            <span className="text-xs text-muted-foreground block">Stock</span>
                                            <span
                                                className={cn(
                                                "text-sm font-semibold",
                                                isOutOfStock
                                                    ? "text-rose-600"
                                                    : isLowStock
                                                    ? "text-amber-600"
                                                    : "text-foreground"
                                                )}
                                            >
                                                {stock} {product.unit || "units"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-2">
                                    <Link href={`/products/${product.id}`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full text-xs cursor-pointer">
                                        Details
                                        </Button>
                                    </Link>
                                    <Link href={`/products/${product.id}/edit`} className="flex-1">
                                        <Button size="sm" className="w-full text-xs cursor-pointer">
                                        Edit
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        )
                    })}
                </div> 
            )}
            {/* 8. EMPTY STATE */}
            {!isPageLoading && !isError && filteredProducts.length === 0 && (
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
                onOpenChange={setIsProductFormOpen}
                >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            Add product
                        </DialogTitle>

                        <DialogDescription>
                            Add a new product to your inventory catalog.
                        </DialogDescription>
                    </DialogHeader>

                    <ProductForm
                        onSuccess={() => {
                            setIsProductFormOpen(false);
                        }}
                        onCancel={() => {
                            setIsProductFormOpen(false);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}