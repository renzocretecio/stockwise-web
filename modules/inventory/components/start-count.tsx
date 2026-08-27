"use client";

import {
    useState,
    type ChangeEvent,
    type FormEvent,
} from "react";
import { Button } from "@/components/ui/button";
import {
    useStartCount,
} from "@/modules/inventory/services/counts";
import { useAllCategories } from "@/modules/products/services/category";
import { useProducts } from "@/modules/products/services";
import { CountScope } from "../types/counts";

type StartCountFormProps = {
    onSuccess?: (countId: string) => void;
    onCancel?: () => void;
};

export function StartCountForm({ onSuccess, onCancel }: StartCountFormProps) {
    const { mutateAsync: startCount, isPending, error } = useStartCount();

    const { data: categoriesData } = useAllCategories();
    const categories = categoriesData?.categories ?? [];

    const [productQuery, setProductQuery] = useState("");
    const { data: productsData, isLoading: productsLoading } = useProducts(
        1,
        50,
        productQuery
    );
    const products = productsData?.products ?? [];

    const [name, setName] = useState(
        `Count — ${new Date().toLocaleDateString()}`
    );
    const [scope, setScope] = useState<CountScope>("all");
    const [category, setCategory] = useState("");
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

    const toggleProduct = (productId: string) => {
        setSelectedProductIds((previous) =>
            previous.includes(productId)
                ? previous.filter((id) => id !== productId)
                : [...previous, productId]
        );
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            const result = await startCount({
                name,
                scope,
                category: scope === "category" ? category : undefined,
                product_ids: scope === "custom" ? selectedProductIds : undefined,
            });
            onSuccess?.(result.inventory_count_id);
        } catch {
            // Mutation error is already available through the error value above.
        }
    };

    const isValid =
        name.trim().length > 0 &&
        (scope === "all" ||
            (scope === "category" && category) ||
            (scope === "custom" && selectedProductIds.length > 0));

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                    {error instanceof Error
                        ? error.message
                        : "An error occurred while starting the count."}
                </div>
            )}

            <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium">
                    Session name *
                </label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g. Q3 2026 Full Count"
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">Scope *</label>

                <div className="grid grid-cols-3 gap-2">
                    {(
                        [
                            { value: "all", label: "All products" },
                            { value: "category", label: "By category" },
                            { value: "custom", label: "Custom selection" },
                        ] as { value: CountScope; label: string }[]
                    ).map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => setScope(option.value)}
                            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                                scope === option.value
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-input text-muted-foreground hover:bg-muted"
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {scope === "category" && (
                <div>
                    <label
                        htmlFor="category"
                        className="mb-1 block text-sm font-medium"
                    >
                        Category *
                    </label>
                    <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">Select a category</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.name}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {scope === "custom" && (
                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Select products * ({selectedProductIds.length} selected)
                    </label>
                    <input
                        type="text"
                        value={productQuery}
                        onChange={(e) => setProductQuery(e.target.value)}
                        placeholder="Search products…"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary mb-2"
                    />
                    <div className="max-h-56 overflow-y-auto rounded-lg border border-input divide-y">
                        {productsLoading ? (
                            <p className="p-3 text-sm text-muted-foreground">
                                Loading products…
                            </p>
                        ) : products.length === 0 ? (
                            <p className="p-3 text-sm text-muted-foreground">
                                No products found.
                            </p>
                        ) : (
                            products.map((p) => (
                                <label
                                    key={p.id}
                                    className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-muted"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedProductIds.includes(p.id)}
                                        onChange={() => toggleProduct(p.id)}
                                        className="size-4 rounded border-input"
                                    />
                                    <span className="flex-1">{p.name}</span>
                                    {p.sku && (
                                        <span className="text-xs text-muted-foreground font-mono">
                                            {p.sku}
                                        </span>
                                    )}
                                </label>
                            ))
                        )}
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-2 border-t pt-6">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isPending}
                >
                    Cancel
                </Button>

                <Button type="submit" disabled={isPending || !isValid}>
                    {isPending ? "Starting..." : "Start count"}
                </Button>
            </div>
        </form>
    );
}