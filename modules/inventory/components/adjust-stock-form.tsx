"use client";

import {
    useState,
    useMemo,
    type ChangeEvent,
    type FormEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { useAdjustStock } from "@/modules/inventory/services/adjustments";
import { useProducts } from "@/modules/products/services";
import { useDebounce } from "@/hooks/use-debounce";

import {
    Check,
    ChevronsUpDown,
} from "lucide-react";

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { AdjustmentReason, AdjustStockFormData } from "../types/adjustments";

const REASON_OPTIONS: { value: AdjustmentReason; label: string }[] = [
    { value: "damage", label: "Damage" },
    { value: "shrinkage", label: "Shrinkage" },
    { value: "expiry", label: "Expiry" },
    { value: "found", label: "Found stock" },
    { value: "correction", label: "Correction" },
    { value: "other", label: "Other" },
];

type AdjustStockFormProps = {
    /** Pre-select a product (e.g. when opened from a product row's "Adjust stock" action) */
    initialProductId?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
};

export function AdjustStockForm({
    initialProductId,
    onSuccess,
    onCancel,
}: AdjustStockFormProps) {
    const {
        mutateAsync: adjustStock,
        isPending,
        error,
    } = useAdjustStock();

    const [productOpen, setProductOpen] = useState(false);
    const [productQuery, setProductQuery] = useState("");
    const debouncedSearchQuery = useDebounce(productQuery, 500);
    const { data: productsData, isLoading: productsLoading } = useProducts(
        1,
        10,
        debouncedSearchQuery
    );
    const products = productsData?.products ?? [];

    const [formData, setFormData] = useState<AdjustStockFormData>({
        product_id: initialProductId ?? "",
        quantity_change: 0,
        reason: "correction",
        notes: "",
    });

    const selectedProduct = useMemo(
        () => products.find((p) => p.id === formData.product_id),
        [products, formData.product_id]
    );

    const projectedQuantity =
        (selectedProduct?.quantity ?? 0) + formData.quantity_change;

    const handleChange = (
        event: ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value, type } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: type === "number" ? Number(value) || 0 : value,
        }));
    };

    const handleDirection = (direction: "increase" | "decrease") => {
        setFormData((previous) => ({
            ...previous,
            quantity_change:
                direction === "increase"
                    ? Math.abs(previous.quantity_change)
                    : -Math.abs(previous.quantity_change),
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            await adjustStock(formData);
            onSuccess?.();
        } catch {
            // Mutation error is already available
            // through the error value above.
        }
    };

    const isDecrease = formData.quantity_change < 0;
    const isNegativeProjection = projectedQuantity < 0;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                    {error instanceof Error
                        ? error.message
                        : "An error occurred while adjusting stock."}
                </div>
            )}

            <div>
                <label
                    htmlFor="product_id"
                    className="mb-1 block text-sm font-medium"
                >
                    Product *
                </label>

                {initialProductId && selectedProduct ? (
                    <div className="w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm">
                        <span className="font-medium text-foreground">
                            {selectedProduct.name}
                        </span>
                        {selectedProduct.sku && (
                            <span className="ml-2 text-xs text-muted-foreground font-mono">
                                {selectedProduct.sku}
                            </span>
                        )}
                    </div>
                ) : (
                    <>
                        <Popover
                            open={productOpen}
                            onOpenChange={setProductOpen}
                        >
                            <PopoverTrigger
                                className="flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-4 py-2 text-sm font-normal outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                            >
                                {selectedProduct ? (
                                    <span className="truncate">
                                        {selectedProduct.name}

                                        {selectedProduct.sku && (
                                            <span className="ml-2 text-xs text-muted-foreground">
                                                ({selectedProduct.sku})
                                            </span>
                                        )}
                                    </span>
                                ) : (
                                    <span className="text-muted-foreground">
                                        {productsLoading
                                            ? "Loading products..."
                                            : "Search or select a product"}
                                    </span>
                                )}

                                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                            </PopoverTrigger>

                            <PopoverContent
                                className="w-[--radix-popover-trigger-width] p-0 rounded-lg"
                                align="start"
                            >
                                <Command shouldFilter={false}>
                                    <CommandInput
                                        placeholder="Search product by name or SKU..."
                                        value={productQuery}
                                        onValueChange={setProductQuery}
                                    />

                                    <CommandList>
                                        {productsLoading ? (
                                            <CommandEmpty>
                                                Searching products...
                                            </CommandEmpty>
                                        ) : products.length === 0 ? (
                                            <CommandEmpty>
                                                No products found.
                                            </CommandEmpty>
                                        ) : (
                                            <CommandGroup>
                                                {products.map((product) => (
                                                    <CommandItem
                                                        key={product.id}
                                                        value={product.id}
                                                        onSelect={() => {
                                                            setFormData((previous) => ({
                                                                ...previous,
                                                                product_id: product.id,
                                                            }));

                                                            setProductQuery("");
                                                            setProductOpen(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={`mr-2 size-4 ${
                                                                formData.product_id === product.id
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            }`}
                                                        />

                                                        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <p className="truncate font-medium">
                                                                    {product.name}
                                                                </p>

                                                                {product.sku && (
                                                                    <p className="text-xs text-muted-foreground">
                                                                        SKU: {product.sku}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <span className="shrink-0 text-xs text-muted-foreground">
                                                                {product.quantity} {product.unit}
                                                            </span>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        )}
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </>
                )}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">
                    Adjustment *
                </label>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => handleDirection("increase")}
                        className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                            !isDecrease
                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-700"
                                : "border-input text-muted-foreground hover:bg-muted"
                        }`}
                    >
                        + Increase
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDirection("decrease")}
                        className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                            isDecrease
                                ? "border-destructive bg-destructive/10 text-destructive"
                                : "border-input text-muted-foreground hover:bg-muted"
                        }`}
                    >
                        − Decrease
                    </button>
                </div>

                <input
                    id="quantity_change"
                    type="number"
                    name="quantity_change"
                    value={Math.abs(formData.quantity_change)}
                    onChange={(e) => {
                        const magnitude = Math.abs(Number(e.target.value) || 0);
                        setFormData((previous) => ({
                            ...previous,
                            quantity_change: isDecrease ? -magnitude : magnitude,
                        }));
                    }}
                    required
                    min="0"
                    step="1"
                    className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="0"
                />

                {selectedProduct && formData.quantity_change !== 0 && (
                    <p
                        className={`mt-1 text-xs ${
                            isNegativeProjection ? "text-destructive" : "text-muted-foreground"
                        }`}
                    >
                        {selectedProduct.quantity} {selectedProduct.unit} →{" "}
                        <span className="font-medium">
                            {projectedQuantity} {selectedProduct.unit}
                        </span>
                        {isNegativeProjection && " (would go negative — not allowed)"}
                    </p>
                )}
            </div>

            <div>
                <label htmlFor="reason" className="mb-1 block text-sm font-medium">
                    Reason *
                </label>

                <select
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                >
                    {REASON_OPTIONS.map((r) => (
                        <option key={r.value} value={r.value}>
                            {r.label}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="notes" className="mb-1 block text-sm font-medium">
                    Notes
                </label>

                <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Optional details about this adjustment…"
                />
            </div>

            <div className="flex justify-end gap-2 border-t pt-6">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isPending}
                >
                    Cancel
                </Button>

                <Button
                    type="submit"
                    disabled={
                        isPending ||
                        !formData.product_id ||
                        formData.quantity_change === 0 ||
                        isNegativeProjection
                    }
                >
                    {isPending ? "Saving..." : "Adjust stock"}
                </Button>
            </div>
        </form>
    );
}