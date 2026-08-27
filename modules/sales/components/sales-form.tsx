"use client";

import {
    FormEvent,
    useMemo,
    useState,
} from "react";
import {
    Plus,
    Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useProducts } from "@/modules/products/services";
import { useCreateSale } from "@/modules/sales/services/sales";
import {
    PaymentMethod,
    SaleFormData,
} from "@/modules/sales/types";

type SaleFormProps = {
    onSuccess?: () => void;
    onCancel?: () => void;
};

const PAYMENT_METHODS: {
    value: PaymentMethod;
    label: string;
}[] = [
    {
        value: "cash",
        label: "Cash",
    },
    {
        value: "card",
        label: "Card",
    },
    {
        value: "gcash",
        label: "GCash",
    },
    {
        value: "bank_transfer",
        label: "Bank Transfer",
    },
];

export function SaleForm({
    onSuccess,
    onCancel,
}: SaleFormProps) {
    const {
        data: productsData,
        isLoading: productsLoading,
    } = useProducts(
        1,
        100,
    );

    const {
        mutateAsync: createSale,
        isPending,
        error,
    } = useCreateSale();

    const products =
        productsData?.products ?? [];

    const [formData, setFormData] =
        useState<SaleFormData>({
            reference_number: "",
            items: [
                {
                    product_id: "",
                    quantity: 1,
                    unit_price: 0,
                },
            ],
            payment_method: "cash",
            tax_amount: 0,
            discount_amount: 0,
            notes: "",
        });

    const subtotal = useMemo(() => {
        return formData.items.reduce(
            (total, item) =>
                total +
                item.quantity *
                    item.unit_price,
            0,
        );
    }, [formData.items]);

    const total = Math.max(
        0,
        subtotal +
            formData.tax_amount -
            formData.discount_amount,
    );

    const handleAddItem = () => {
        setFormData((previous) => ({
            ...previous,
            items: [
                ...previous.items,
                {
                    product_id: "",
                    quantity: 1,
                    unit_price: 0,
                },
            ],
        }));
    };

    const handleRemoveItem = (
        index: number,
    ) => {
        setFormData((previous) => ({
            ...previous,
            items: previous.items.filter(
                (_, itemIndex) =>
                    itemIndex !== index,
            ),
        }));
    };

    const handleItemChange = (
        index: number,
        field:
            | "product_id"
            | "quantity"
            | "unit_price",
        value: string | number,
    ) => {
        setFormData((previous) => ({
            ...previous,
            items: previous.items.map(
                (item, itemIndex) =>
                    itemIndex === index
                        ? {
                            ...item,
                            [field]: value,
                        }
                        : item,
            ),
        }));
    };

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        const hasInvalidItem =
            formData.items.some(
                (item) =>
                    !item.product_id ||
                    item.quantity <= 0 ||
                    item.unit_price < 0,
            );

        if (hasInvalidItem) {
            return;
        }

        try {
            await createSale(formData);
            onSuccess?.();
        } catch {
            // Mutation error is available through error.
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6"
        >
            {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    {error instanceof Error
                        ? error.message
                        : "Failed to create sale."}
                </div>
            )}

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label
                        htmlFor="reference_number"
                        className="mb-1 block text-sm font-medium"
                    >
                        Reference #
                    </label>

                    <input
                        id="reference_number"
                        type="text"
                        value={
                            formData.reference_number
                        }
                        onChange={(event) =>
                            setFormData(
                                (previous) => ({
                                    ...previous,
                                    reference_number:
                                        event.target.value,
                                }),
                            )
                        }
                        placeholder="SALE-2026-001"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <div>
                    <label
                        htmlFor="payment_method"
                        className="mb-1 block text-sm font-medium"
                    >
                        Payment Method *
                    </label>

                    <select
                        id="payment_method"
                        value={
                            formData.payment_method
                        }
                        onChange={(event) =>
                            setFormData(
                                (previous) => ({
                                    ...previous,
                                    payment_method:
                                        event.target
                                            .value as PaymentMethod,
                                }),
                            )
                        }
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                        {PAYMENT_METHODS.map(
                            (method) => (
                                <option
                                    key={
                                        method.value
                                    }
                                    value={
                                        method.value
                                    }
                                >
                                    {method.label}
                                </option>
                            ),
                        )}
                    </select>
                </div>
            </section>

            <section className="space-y-3 border-t pt-6">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold">
                        Items
                    </h2>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddItem}
                    >
                        <Plus className="mr-1 h-4 w-4" />
                        Add item
                    </Button>
                </div>

                {formData.items.map(
                    (item, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-1 gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_100px_130px_40px]"
                        >
                            <div>
                                <label className="mb-1 block text-xs text-muted-foreground">
                                    Product
                                </label>

                                <select
                                    value={
                                        item.product_id
                                    }
                                    onChange={(
                                        event,
                                    ) => {
                                        const productId =
                                            event
                                                .target
                                                .value;

                                        const product =
                                            products.find(
                                                (
                                                    product,
                                                ) =>
                                                    product.id ===
                                                    productId,
                                            );

                                        handleItemChange(
                                            index,
                                            "product_id",
                                            productId,
                                        );

                                        if (
                                            product
                                        ) {
                                            handleItemChange(
                                                index,
                                                "unit_price",
                                                product.selling_price ??
                                                    0,
                                            );
                                        }
                                    }}
                                    required
                                    disabled={
                                        productsLoading
                                    }
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">
                                        Select product
                                    </option>

                                    {products.map(
                                        (
                                            product,
                                        ) => (
                                            <option
                                                key={
                                                    product.id
                                                }
                                                value={
                                                    product.id
                                                }
                                            >
                                                {
                                                    product.name
                                                }
                                                {" — "}
                                                {
                                                    product.quantity
                                                }{" "}
                                                {
                                                    product.unit
                                                }{" "}
                                                available
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs text-muted-foreground">
                                    Quantity
                                </label>

                                <input
                                    type="number"
                                    min="0.001"
                                    step="0.001"
                                    value={
                                        item.quantity
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        handleItemChange(
                                            index,
                                            "quantity",
                                            Number(
                                                event
                                                    .target
                                                    .value,
                                            ) ||
                                                0,
                                        )
                                    }
                                    required
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs text-muted-foreground">
                                    Unit Price
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={
                                        item.unit_price
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        handleItemChange(
                                            index,
                                            "unit_price",
                                            Number(
                                                event
                                                    .target
                                                    .value,
                                            ) ||
                                                0,
                                        )
                                    }
                                    required
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>

                            <div className="flex items-end">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    disabled={
                                        formData
                                            .items
                                            .length ===
                                        1
                                    }
                                    onClick={() =>
                                        handleRemoveItem(
                                            index,
                                        )
                                    }
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>

                            <div className="text-xs text-muted-foreground sm:col-span-4 sm:text-right">
                                Line total: ₱
                                {(
                                    item.quantity *
                                    item.unit_price
                                ).toLocaleString(
                                    "en-PH",
                                    {
                                        minimumFractionDigits: 2,
                                    },
                                )}
                            </div>
                        </div>
                    ),
                )}
            </section>

            <section className="grid grid-cols-1 gap-4 border-t pt-6 sm:grid-cols-2">
                <div>
                    <label
                        htmlFor="tax_amount"
                        className="mb-1 block text-sm font-medium"
                    >
                        Tax
                    </label>

                    <input
                        id="tax_amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                            formData.tax_amount
                        }
                        onChange={(event) =>
                            setFormData(
                                (previous) => ({
                                    ...previous,
                                    tax_amount:
                                        Number(
                                            event
                                                .target
                                                .value,
                                        ) || 0,
                                }),
                            )
                        }
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    />
                </div>

                <div>
                    <label
                        htmlFor="discount_amount"
                        className="mb-1 block text-sm font-medium"
                    >
                        Discount
                    </label>

                    <input
                        id="discount_amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                            formData.discount_amount
                        }
                        onChange={(event) =>
                            setFormData(
                                (previous) => ({
                                    ...previous,
                                    discount_amount:
                                        Number(
                                            event
                                                .target
                                                .value,
                                        ) || 0,
                                }),
                            )
                        }
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    />
                </div>
            </section>

            <div className="space-y-1 rounded-lg bg-muted/40 p-4 text-sm">
                <div className="flex justify-between">
                    <span>
                        Subtotal
                    </span>

                    <span>
                        ₱
                        {subtotal.toLocaleString(
                            "en-PH",
                            {
                                minimumFractionDigits: 2,
                            },
                        )}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span>
                        Tax
                    </span>

                    <span>
                        ₱
                        {formData.tax_amount.toLocaleString(
                            "en-PH",
                            {
                                minimumFractionDigits: 2,
                            },
                        )}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span>
                        Discount
                    </span>

                    <span>
                        -₱
                        {formData.discount_amount.toLocaleString(
                            "en-PH",
                            {
                                minimumFractionDigits: 2,
                            },
                        )}
                    </span>
                </div>

                <div className="flex justify-between border-t pt-2 text-base font-semibold">
                    <span>
                        Total
                    </span>

                    <span>
                        ₱
                        {total.toLocaleString(
                            "en-PH",
                            {
                                minimumFractionDigits: 2,
                            },
                        )}
                    </span>
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
                        setFormData(
                            (previous) => ({
                                ...previous,
                                notes:
                                    event.target.value,
                            }),
                        )
                    }
                    rows={3}
                    placeholder="Optional sale notes..."
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
                    disabled={isPending}
                >
                    {isPending
                        ? "Completing..."
                        : "Complete Sale"}
                </Button>
            </div>
        </form>
    );
}