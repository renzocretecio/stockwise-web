"use client";

import { type FormEvent, useMemo, useState } from "react";
import {
    CheckSquare2,
    Eye,
    EyeOff,
    Pencil,
    Search,
} from "lucide-react";

import { Pagination } from "@/components/Pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useDebounce } from "@/hooks/use-debounce";
import { formatStoreCurrency } from
    "@/modules/storefront/components/storefront-ui";
import {
    useBulkPublishStoreProducts,
    useStoreProducts,
    useUpdateStoreProduct,
} from "@/modules/storefront/services";
import type {
    StoreProduct,
    StoreProductPayload,
} from "@/modules/storefront/types";

export function StorefrontProducts({
    canManage,
    currencyCode,
}: {
    canManage: boolean;
    currencyCode: string;
}) {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<StoreProduct>();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(
        () => new Set(),
    );
    const debouncedSearch = useDebounce(search, 350);
    const bulkPublish = useBulkPublishStoreProducts();
    const products = useStoreProducts(
        page,
        pageSize,
        debouncedSearch,
    );

    const published = useMemo(
        () => products.data?.products.filter((item) => item.is_public).length ?? 0,
        [products.data?.products],
    );
    const pageProductIds = useMemo(
        () =>
            products.data?.products.map((product) => product.product_id) ?? [],
        [products.data?.products],
    );
    const allPageSelected =
        pageProductIds.length > 0 &&
        pageProductIds.every((productId) => selectedIds.has(productId));

    const toggleSelection = (productId: string) => {
        setSelectedIds((current) => {
            const next = new Set(current);
            if (next.has(productId)) next.delete(productId);
            else next.add(productId);
            return next;
        });
    };

    const togglePage = () => {
        setSelectedIds((current) => {
            const next = new Set(current);
            for (const productId of pageProductIds) {
                if (allPageSelected) next.delete(productId);
                else next.add(productId);
            }
            return next;
        });
    };

    const updateSelected = async (isPublic: boolean) => {
        try {
            const result = await bulkPublish.mutateAsync({
                product_ids: Array.from(selectedIds),
                is_public: isPublic,
            });
            toast.add({
                title: isPublic
                    ? "Selected products published"
                    : "Selected products unpublished",
                description: `${result.updated_count} product${
                    result.updated_count === 1 ? "" : "s"
                } updated.`,
                type: "success",
            });
            setSelectedIds(new Set());
        } catch (reason) {
            toast.add({
                title: "Products were not updated",
                description:
                    reason instanceof Error
                        ? reason.message
                        : "Try again in a moment.",
                type: "error",
            });
        }
    };

    return (
        <section className="bg-card">
            <div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-base font-semibold">Store products</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {published} published on this page. Inventory quantities
                        stay managed in the main product catalog.
                    </p>
                </div>
                <label className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        className="pl-9"
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setPage(1);
                            setSelectedIds(new Set());
                        }}
                        placeholder="Search products"
                        value={search}
                    />
                </label>
            </div>

            {canManage ? (
                <div className="flex flex-col gap-3 border-b bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                        <input
                            checked={allPageSelected}
                            className="size-4 accent-primary"
                            onChange={togglePage}
                            type="checkbox"
                        />
                        Select this page
                    </label>
                    {selectedIds.size ? (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="mr-1 text-xs text-muted-foreground">
                                {selectedIds.size} selected
                            </span>
                            <Button
                                disabled={bulkPublish.isPending}
                                onClick={() => updateSelected(false)}
                                size="sm"
                                type="button"
                                variant="outline"
                            >
                                <EyeOff className="size-3.5" />
                                Unpublish selected
                            </Button>
                            <Button
                                disabled={bulkPublish.isPending}
                                onClick={() => updateSelected(true)}
                                size="sm"
                                type="button"
                            >
                                <CheckSquare2 className="size-3.5" />
                                Publish selected
                            </Button>
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground">
                            Select products to publish them together.
                        </p>
                    )}
                </div>
            ) : null}

            <div className="divide-y">
                {products.isLoading
                    ? Array.from({ length: 6 }).map((_, index) => (
                          <div className="h-20 animate-pulse bg-muted/20" key={index} />
                      ))
                    : products.data?.products.map((product) => (
                          <ProductRow
                              canManage={canManage}
                              currencyCode={currencyCode}
                              key={product.product_id}
                              onEdit={() => setSelected(product)}
                              onSelect={() =>
                                  toggleSelection(product.product_id)
                              }
                              product={product}
                              selected={selectedIds.has(product.product_id)}
                          />
                      ))}
            </div>

            {!products.isLoading && !products.data?.products.length ? (
                <div className="p-12 text-center">
                    <p className="text-sm font-medium">No products found</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Add products to your inventory before publishing them.
                    </p>
                </div>
            ) : null}

            {products.data?.pagination ? (
                <Pagination
                    className="border-t p-4"
                    isLoading={products.isFetching}
                    onPageChange={(nextPage) => {
                        setPage(nextPage);
                        setSelectedIds(new Set());
                    }}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setPage(1);
                        setSelectedIds(new Set());
                    }}
                    pagination={products.data.pagination}
                />
            ) : null}

            <ProductListingDialog
                currencyCode={currencyCode}
                key={selected?.product_id ?? "empty"}
                onOpenChange={(open) => {
                    if (!open) setSelected(undefined);
                }}
                open={Boolean(selected)}
                product={selected}
            />
        </section>
    );
}

function ProductRow({
    canManage,
    currencyCode,
    onEdit,
    onSelect,
    product,
    selected,
}: {
    canManage: boolean;
    currencyCode: string;
    onEdit: () => void;
    onSelect: () => void;
    product: StoreProduct;
    selected: boolean;
}) {
    return (
        <div className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
            <div className="flex min-w-0 items-center gap-3">
                {canManage ? (
                    <input
                        aria-label={`Select ${product.name}`}
                        checked={selected}
                        className="size-4 shrink-0 accent-primary"
                        onChange={onSelect}
                        type="checkbox"
                    />
                ) : null}
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium">{product.name}</p>
                        <Badge
                            variant={product.is_public ? "default" : "secondary"}
                        >
                            {product.is_public ? (
                                <Eye className="size-3" />
                            ) : (
                                <EyeOff className="size-3" />
                            )}
                            {product.is_public ? "Published" : "Hidden"}
                        </Badge>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                        {product.sku || "No SKU"}
                        {product.category ? ` · ${product.category.name}` : ""}
                    </p>
                </div>
            </div>
            <div className="flex items-center justify-between gap-6 sm:block sm:text-right">
                <span className="text-xs text-muted-foreground sm:hidden">Store price</span>
                <p className="font-semibold">
                    {formatStoreCurrency(product.price, currencyCode)}
                </p>
                <p className="text-xs text-muted-foreground">
                    {product.availability === "in_stock"
                        ? `${product.available_quantity ?? 0} available`
                        : "Sold out"}
                </p>
            </div>
            {canManage ? (
                <Button onClick={onEdit} size="sm" type="button" variant="outline">
                    <Pencil className="size-3.5" />
                    Edit listing
                </Button>
            ) : null}
        </div>
    );
}

function ProductListingDialog({
    currencyCode,
    onOpenChange,
    open,
    product,
}: {
    currencyCode: string;
    onOpenChange: (open: boolean) => void;
    open: boolean;
    product?: StoreProduct;
}) {
    const updateProduct = useUpdateStoreProduct(product?.product_id ?? "");
    const [form, setForm] = useState<StoreProductPayload>(() => ({
        is_public: product?.is_public ?? false,
        public_name: product?.name ?? "",
        public_description: product?.description ?? "",
        public_price: product?.price ?? 0,
        public_image_url: product?.image_url ?? "",
        sort_order: product?.sort_order ?? 0,
    }));
    const [error, setError] = useState<string>();

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(undefined);
        try {
            await updateProduct.mutateAsync(form);
            toast.add({
                title: form.is_public ? "Product published" : "Listing saved",
                description: form.is_public
                    ? `${form.public_name} is visible in your store.`
                    : `${form.public_name} is hidden from customers.`,
                type: "success",
            });
            onOpenChange(false);
        } catch (reason) {
            setError(
                reason instanceof Error
                    ? reason.message
                    : "Unable to save this listing.",
            );
        }
    };

    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Product listing</DialogTitle>
                    <DialogDescription>
                        Customize how this inventory item appears to customers.
                    </DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={submit}>
                    {error ? (
                        <p className="rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">
                            {error}
                        </p>
                    ) : null}
                    <label className="flex items-center justify-between rounded-2xl bg-muted/60 p-3">
                        <span>
                            <span className="block text-sm font-medium">
                                Publish in store
                            </span>
                            <span className="block text-xs text-muted-foreground">
                                Customers can order this product when enabled.
                            </span>
                        </span>
                        <input
                            checked={form.is_public}
                            className="size-4 accent-primary"
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    is_public: event.target.checked,
                                }))
                            }
                            type="checkbox"
                        />
                    </label>
                    <label className="block text-sm">
                        <span className="mb-1.5 block font-medium">Public name</span>
                        <Input
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    public_name: event.target.value,
                                }))
                            }
                            required
                            value={form.public_name ?? ""}
                        />
                    </label>
                    <label className="block text-sm">
                        <span className="mb-1.5 block font-medium">Description</span>
                        <Textarea
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    public_description: event.target.value,
                                }))
                            }
                            rows={4}
                            value={form.public_description ?? ""}
                        />
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block text-sm">
                            <span className="mb-1.5 block font-medium">
                                Price ({currencyCode})
                            </span>
                            <Input
                                min="0"
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        public_price: Number(event.target.value),
                                    }))
                                }
                                required
                                step="0.01"
                                type="number"
                                value={form.public_price ?? 0}
                            />
                        </label>
                        <label className="block text-sm">
                            <span className="mb-1.5 block font-medium">Sort order</span>
                            <Input
                                min="0"
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        sort_order: Number(event.target.value),
                                    }))
                                }
                                type="number"
                                value={form.sort_order}
                            />
                        </label>
                    </div>
                    <DialogFooter>
                        <Button
                            disabled={updateProduct.isPending}
                            type="submit"
                        >
                            {updateProduct.isPending ? "Saving…" : "Save listing"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
