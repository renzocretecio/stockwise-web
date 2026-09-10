"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { useOnlineStatus } from "@/hooks/use-online-status";
import {
    useCreatePurchase,
    useUpdatePurchase,
} from "@/modules/purchases/services/purchases";
import { Purchase, PurchaseFormData } from "@/modules/purchases/types";
import { ReferenceDataStatus } from
    "@/modules/offline/components/reference-data-status";
import { ReferenceCombobox } from
    "@/modules/offline/components/reference-combobox";
import { useReferenceCatalog } from
    "@/modules/offline/services/reference-data";

type PurchaseFormProps = {
    purchase?: Purchase | null;
    initialData?: Partial<PurchaseFormData>;
    onSuccess?: () => void;
    onCancel?: () => void;
};

export function PurchaseForm({
    purchase,
    initialData,
    onSuccess,
    onCancel,
}: PurchaseFormProps) {
    const isEditMode = !!purchase;
    const isOnline = useOnlineStatus();

    const {
        data: referenceData,
        isLoading: referenceDataLoading,
    } = useReferenceCatalog();

    const {
        mutateAsync: createPurchase,
        isPending: isCreating,
        error: createError,
    } = useCreatePurchase();

    const {
        mutateAsync: updatePurchase,
        isPending: isUpdating,
        error: updateError,
    } = useUpdatePurchase(purchase?.id ?? "");

    const [formData, setFormData] = useState<PurchaseFormData>({
        supplier_id: purchase?.supplier_id ?? initialData?.supplier_id ?? "",
        supplier_reference_number:
            purchase?.supplier_reference_number ??
            initialData?.supplier_reference_number ??
            "",
        expected_delivery_date:
            purchase?.expected_delivery_date ??
            initialData?.expected_delivery_date ??
            null,
        items: purchase?.items.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
        })) ?? initialData?.items ?? [
            {
                product_id: "",
                quantity: 1,
                unit_cost: 0,
            },
        ],
        tax_amount: purchase?.tax_amount ?? initialData?.tax_amount ?? 0,
        discount_amount:
            purchase?.discount_amount ?? initialData?.discount_amount ?? 0,
        notes: purchase?.notes ?? initialData?.notes ?? "",
    });
    const [showOtherProducts, setShowOtherProducts] = useState(false);
    const [minimumDeliveryDate, setMinimumDeliveryDate] = useState("");

    useEffect(() => {
        const timer = window.setTimeout(() => {
            const date = new Date();
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
            setMinimumDeliveryDate(date.toISOString().slice(0, 10));
        }, 0);

        return () => window.clearTimeout(timer);
    }, []);

    const suppliers = useMemo(
        () => referenceData?.suppliers ?? [],
        [referenceData?.suppliers],
    );

    const products = useMemo(
        () => referenceData?.products ?? [],
        [referenceData?.products],
    );

    const supplierProducts = useMemo(
        () => referenceData?.supplier_products ?? [],
        [referenceData?.supplier_products],
    );

    const referenceDataAvailable = referenceData?.available ?? false;

    const supplierOptions = useMemo(
        () =>
            suppliers.map((supplier) => ({
                id: supplier.id,
                label: supplier.name,
                description: `${supplier.lead_time_days}-day lead time`,
            })),
        [suppliers],
    );

    const selectedSupplier = useMemo(
        () =>
            suppliers.find(
                (supplier) => supplier.id === formData.supplier_id,
            ),
        [formData.supplier_id, suppliers],
    );

    const selectedSupplierProducts = useMemo(
        () =>
            supplierProducts.filter(
                (item) => item.supplier_id === formData.supplier_id,
            ),
        [formData.supplier_id, supplierProducts],
    );

    const supplierProductByProduct = useMemo(
        () =>
            new Map(
                selectedSupplierProducts.map((item) => [
                    item.product_id,
                    item,
                ]),
            ),
        [selectedSupplierProducts],
    );

    const productIdsWithSuppliers = useMemo(
        () => new Set(supplierProducts.map((item) => item.product_id)),
        [supplierProducts],
    );

    const productById = useMemo(
        () => new Map(products.map((product) => [product.id, product])),
        [products],
    );

    const productOptions = useMemo(
        () => {
            const currentSupplierGroup = `Products from ${
                selectedSupplier?.name ?? "this supplier"
            }`;

            return products
                .map((product) => {
                    const supplierProduct = supplierProductByProduct.get(
                        product.id,
                    );
                    const hasSupplier = productIdsWithSuppliers.has(product.id);
                    const group = supplierProduct
                        ? currentSupplierGroup
                        : hasSupplier
                          ? "Products from other suppliers"
                          : "Products without a supplier";
                    const details = [
                        supplierProduct
                            ? `Saved cost: ${formatCurrency(
                                  supplierProduct.unit_cost,
                              )}`
                            : `Default cost: ${formatCurrency(
                                  product.cost_price,
                              )}`,
                        supplierProduct?.supplier_sku ?? product.sku,
                        product.unit,
                        supplierProduct &&
                        supplierProduct.minimum_order_quantity > 1
                            ? `Min ${supplierProduct.minimum_order_quantity}`
                            : undefined,
                        supplierProduct && supplierProduct.pack_size > 1
                            ? `Pack ${supplierProduct.pack_size}`
                            : undefined,
                    ].filter(Boolean);

                    return {
                        id: product.id,
                        label: product.name,
                        description: details.join(" · "),
                        searchText: product.barcode ?? undefined,
                        group,
                    };
                })
                .sort((left, right) => {
                    const groupOrder = [
                        currentSupplierGroup,
                        "Products without a supplier",
                        "Products from other suppliers",
                    ];
                    const leftGroup = groupOrder.indexOf(left.group ?? "");
                    const rightGroup = groupOrder.indexOf(right.group ?? "");

                    if (leftGroup !== rightGroup) {
                        return leftGroup - rightGroup;
                    }

                    return left.label.localeCompare(right.label);
                });
        },
        [
            products,
            productIdsWithSuppliers,
            selectedSupplier?.name,
            supplierProductByProduct,
        ],
    );

    const visibleProductOptions = useMemo(
        () =>
            productOptions.filter(
                (option) =>
                    showOtherProducts ||
                    option.group !== "Products from other suppliers",
            ),
        [productOptions, showOtherProducts],
    );

    const hasProductsFromOtherSuppliers = useMemo(
        () =>
            productOptions.some(
                (option) => option.group === "Products from other suppliers",
            ),
        [productOptions],
    );

    const getSupplierRelationshipNotice = (productId: string) => {
        if (!productId || supplierProductByProduct.has(productId)) {
            return null;
        }

        const product = productById.get(productId);
        const supplierName = selectedSupplier?.name ?? "this supplier";

        if (!product) {
            return null;
        }

        if (!productIdsWithSuppliers.has(productId)) {
            return `${product.name} is not yet linked to ${supplierName}. ` +
                "Saving this purchase will add it as a supplier.";
        }

        return `${product.name} is currently sourced from another supplier. ` +
            `Saving this purchase will add ${supplierName} as an ` +
            "additional supplier.";
    };

    const selectedProductIds = useMemo(
        () =>
            new Set(
                formData.items
                    .map((item) => item.product_id)
                    .filter(Boolean),
            ),
        [formData.items],
    );

    const isPending = isCreating || isUpdating;

    const error = createError || updateError;

    const subtotal = useMemo(() => {
        return formData.items.reduce(
            (total, item) => total + item.quantity * item.unit_cost,
            0,
        );
    }, [formData.items]);

    const total = Math.max(
        0,
        subtotal + formData.tax_amount - formData.discount_amount,
    );

    const handleAddItem = () => {
        setFormData((previous) => ({
            ...previous,
            items: [
                ...previous.items,
                {
                    product_id: "",
                    quantity: 1,
                    unit_cost: 0,
                },
            ],
        }));
    };

    const handleSupplierChange = (supplierId: string) => {
        setFormData((previous) => {
            if (previous.supplier_id === supplierId) {
                return previous;
            }

            const linksByProduct = new Map(
                supplierProducts
                    .filter((item) => item.supplier_id === supplierId)
                    .map((item) => [item.product_id, item]),
            );

            return {
                ...previous,
                supplier_id: supplierId,
                items: previous.items.map((item) => {
                    const link = linksByProduct.get(item.product_id);
                    const product = productById.get(item.product_id);

                    return {
                        ...item,
                        quantity: Math.max(
                            item.quantity,
                            link?.minimum_order_quantity ?? 1,
                        ),
                        unit_cost:
                            link?.unit_cost ?? product?.cost_price ?? 0,
                    };
                }),
            };
        });
        setShowOtherProducts(false);
    };

    const handleProductChange = (
        index: number,
        productId: string,
    ) => {
        const link = supplierProductByProduct.get(productId);
        const product = productById.get(productId);

        setFormData((previous) => ({
            ...previous,
            items: previous.items.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                          ...item,
                          product_id: productId,
                          quantity: Math.max(
                              item.quantity,
                              link?.minimum_order_quantity ?? 1,
                          ),
                          unit_cost:
                              link?.unit_cost ?? product?.cost_price ?? 0,
                      }
                    : item,
            ),
        }));
    };

    const handleRemoveItem = (index: number) => {
        setFormData((previous) => ({
            ...previous,
            items: previous.items.filter((_, itemIndex) => itemIndex !== index),
        }));
    };

    const handleItemChange = (
        index: number,
        field: "product_id" | "quantity" | "unit_cost",
        value: string | number,
    ) => {
        setFormData((previous) => ({
            ...previous,
            items: previous.items.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                          ...item,
                          [field]: value,
                      }
                    : item,
            ),
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (
            !formData.supplier_id ||
            formData.items.length === 0 ||
            formData.items.some(
                (item) =>
                    !item.product_id ||
                    item.quantity <= 0 ||
                    item.unit_cost < 0,
            )
        ) {
            return;
        }

        try {
            if (isEditMode) {
                await updatePurchase(formData);
            } else {
                await createPurchase(formData);
            }

            onSuccess?.();
        } catch {
            // Error provided by mutation.
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    {error instanceof Error
                        ? error.message
                        : "Failed to save purchase."}
                </div>
            )}

            <ReferenceDataStatus
                available={referenceDataAvailable}
                generatedAt={referenceData?.generated_at}
                loading={referenceDataLoading}
            />

            {isEditMode && !isOnline && (
                <div
                    className={
                        "rounded-2xl border border-amber-500/30 " +
                        "bg-amber-500/10 p-4 text-sm text-amber-950 " +
                        "dark:text-amber-100"
                    }
                >
                    Editing an existing purchase requires a connection. New
                    purchase drafts can still be created offline.
                </div>
            )}

            <section className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="supplier_id"
                            className="mb-1 block text-sm font-medium"
                        >
                            Supplier *
                        </label>

                        <ReferenceCombobox
                            id="supplier_id"
                            value={formData.supplier_id}
                            options={supplierOptions}
                            onValueChange={handleSupplierChange}
                            disabled={
                                referenceDataLoading ||
                                !referenceDataAvailable
                            }
                            placeholder="Select supplier"
                            searchPlaceholder="Search suppliers..."
                            emptyMessage="No suppliers found."
                        />

                        {formData.supplier_id && (
                            <p className="mt-1 text-xs text-muted-foreground">
                                {selectedSupplierProducts.length} saved
                                supplier price
                                {selectedSupplierProducts.length === 1
                                    ? ""
                                    : "s"}
                                {" · Other products can also be added"}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="supplier_reference_number"
                            className="mb-1 block text-sm font-medium"
                        >
                            Supplier invoice / reference
                        </label>

                        <input
                            id="supplier_reference_number"
                            value={formData.supplier_reference_number}
                            onChange={(event) =>
                                setFormData((previous) => ({
                                    ...previous,
                                    supplier_reference_number:
                                        event.target.value,
                                }))
                            }
                            placeholder="Optional supplier invoice number"
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="expected_delivery_date"
                            className="mb-1 block text-sm font-medium"
                        >
                            Expected delivery
                        </label>

                        <input
                            className={
                                "w-full rounded-lg border border-input bg-background " +
                                "px-3 py-2 text-sm"
                            }
                            id="expected_delivery_date"
                            min={minimumDeliveryDate || undefined}
                            onChange={(event) =>
                                setFormData((previous) => ({
                                    ...previous,
                                    expected_delivery_date:
                                        event.target.value || null,
                                }))
                            }
                            type="date"
                            value={formData.expected_delivery_date ?? ""}
                        />
                    </div>
                </div>
            </section>

            <section className="space-y-3 border-t pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold">Items</h2>
                        <p className="text-xs text-muted-foreground">
                            Saved prices are applied automatically. New
                            supplier-product pairings are remembered.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {formData.supplier_id &&
                        hasProductsFromOtherSuppliers && (
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                    setShowOtherProducts((visible) => !visible)
                                }
                                disabled={!formData.supplier_id}
                            >
                                {showOtherProducts
                                    ? "Hide other products"
                                    : "Show other products"}
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddItem}
                            disabled={!formData.supplier_id}
                        >
                            <Plus className="mr-1 h-4 w-4" />
                            Add item
                        </Button>
                    </div>
                </div>

                {formData.items.map((item, index) => (
                    <div
                        key={index}
                        className="grid grid-cols-1 gap-3 border rounded-2xl p-3 sm:grid-cols-[1fr_100px_130px_40px]"
                    >
                        <div>
                            <label className="mb-1 block text-xs text-muted-foreground">
                                Product
                            </label>

                            <ReferenceCombobox
                                value={item.product_id}
                                options={visibleProductOptions.filter(
                                    (option) =>
                                        option.id === item.product_id ||
                                        !selectedProductIds.has(option.id),
                                )}
                                onValueChange={(productId) =>
                                    handleProductChange(index, productId)
                                }
                                disabled={
                                    referenceDataLoading ||
                                    !referenceDataAvailable ||
                                    !formData.supplier_id
                                }
                                placeholder={
                                    formData.supplier_id
                                        ? "Select product"
                                        : "Select a supplier first"
                                }
                                searchPlaceholder={
                                    "Search by product, SKU, or barcode..."
                                }
                                emptyMessage="No products found."
                            />

                            {getSupplierRelationshipNotice(item.product_id) && (
                                <p
                                    className={
                                        "mt-2 rounded-2xl border border-amber-" +
                                        "500/30 bg-amber-500/10 px-2.5 py-2 " +
                                        "text-xs text-amber-950 dark:text-amber-" +
                                        "100"
                                    }
                                >
                                    {getSupplierRelationshipNotice(item.product_id)}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs text-muted-foreground">
                                Quantity
                            </label>

                            <input
                                type="number"
                                min="0.001"
                                step="0.001"
                                value={item.quantity}
                                onChange={(event) =>
                                    handleItemChange(
                                        index,
                                        "quantity",
                                        Number(event.target.value) || 0,
                                    )
                                }
                                required
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs text-muted-foreground">
                                Unit cost
                            </label>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unit_cost}
                                onChange={(event) =>
                                    handleItemChange(
                                        index,
                                        "unit_cost",
                                        Number(event.target.value) || 0,
                                    )
                                }
                                required
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>

                        <div className="flex items-end">
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                disabled={formData.items.length === 1}
                                onClick={() => handleRemoveItem(index)}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>

                        <div className="text-xs text-muted-foreground sm:col-span-4 sm:text-right">
                            Line total:{" "}
                            {formatCurrency(item.quantity * item.unit_cost)}
                        </div>
                    </div>
                ))}
            </section>

            <section className="grid grid-cols-1 gap-4 border-t pt-6 sm:grid-cols-2">
                <div>
                    <label
                        htmlFor="tax"
                        className="mb-1 block text-sm font-medium"
                    >
                        Tax
                    </label>

                    <input
                        id="tax"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.tax_amount}
                        onChange={(event) =>
                            setFormData((previous) => ({
                                ...previous,
                                tax_amount: Number(event.target.value) || 0,
                            }))
                        }
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    />
                </div>

                <div>
                    <label
                        htmlFor="discount"
                        className="mb-1 block text-sm font-medium"
                    >
                        Discount
                    </label>

                    <input
                        id="discount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.discount_amount}
                        onChange={(event) =>
                            setFormData((previous) => ({
                                ...previous,
                                discount_amount:
                                    Number(event.target.value) || 0,
                            }))
                        }
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    />
                </div>
            </section>

            <div className="space-y-1 bg-muted/40 p-4 text-sm">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatCurrency(formData.tax_amount)}</span>
                </div>

                <div className="flex justify-between">
                    <span>Discount</span>
                    <span>{formatCurrency(-formData.discount_amount)}</span>
                </div>

                <div className="flex justify-between border-t pt-2 text-base font-semibold">
                    <span>Total</span>

                    <span>{formatCurrency(total)}</span>
                </div>
            </div>

            <div>
                <label
                    htmlFor="notes"
                    className="mb-1 block text-sm font-medium"
                >
                    Notes
                </label>

                <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(event) =>
                        setFormData((previous) => ({
                            ...previous,
                            notes: event.target.value,
                        }))
                    }
                    rows={3}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
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
                        formData.items.length === 0 ||
                        !referenceDataAvailable ||
                        !formData.supplier_id ||
                        (isEditMode && !isOnline)
                    }
                >
                    {isPending
                        ? "Saving..."
                        : isEditMode
                          ? "Update Purchase"
                          : "Create Draft"}
                </Button>
            </div>
        </form>
    );
}
