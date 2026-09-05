"use client";

import { ChangeEvent, FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    useCreateSupplier,
    useUpdateSupplier,
} from "@/modules/suppliers/services/suppliers";
import { Supplier, SupplierFormData } from "@/modules/suppliers/types";

type SupplierFormProps = {
    supplier?: Supplier | null;
    onSuccess?: () => void;
    onCancel?: () => void;
};

export function SupplierForm({
    supplier,
    onSuccess,
    onCancel,
}: SupplierFormProps) {
    const isEditMode = !!supplier;

    const {
        mutateAsync: createSupplier,
        isPending: isCreating,
        error: createError,
    } = useCreateSupplier();

    const {
        mutateAsync: updateSupplier,
        isPending: isUpdating,
        error: updateError,
    } = useUpdateSupplier(supplier?.id ?? "");

    const [formData, setFormData] = useState<SupplierFormData>({
        name: supplier?.name ?? "",
        contact_person: supplier?.contact_person ?? "",
        email: supplier?.email ?? "",
        phone: supplier?.phone ?? "",
        address: supplier?.address ?? "",
        payment_terms: supplier?.payment_terms ?? "",
        lead_time_days: supplier?.lead_time_days ?? 0,
        notes: supplier?.notes ?? "",
    });

    const isPending = isCreating || isUpdating;

    const error = createError || updateError;

    const handleChange = (
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value, type } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: type === "number" ? Number(value) || 0 : value,
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            if (isEditMode) {
                await updateSupplier(formData);
            } else {
                await createSupplier(formData);
            }

            onSuccess?.();
        } catch {
            // Mutation error is available through error.
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    {error instanceof Error
                        ? error.message
                        : "An error occurred while saving the supplier."}
                </div>
            )}

            <section className="space-y-4">
                <div>
                    <label
                        htmlFor="name"
                        className="mb-1 block text-sm font-medium"
                    >
                        Supplier name *
                    </label>

                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Laguna Wholesale Supply"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <div>
                    <label
                        htmlFor="contact_person"
                        className="mb-1 block text-sm font-medium"
                    >
                        Contact person
                    </label>

                    <input
                        id="contact_person"
                        name="contact_person"
                        type="text"
                        value={formData.contact_person}
                        onChange={handleChange}
                        placeholder="Contact person"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-1 block text-sm font-medium"
                        >
                            Email
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="supplier@example.com"
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="phone"
                            className="mb-1 block text-sm font-medium"
                        >
                            Phone
                        </label>

                        <input
                            id="phone"
                            name="phone"
                            type="text"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="09123456789"
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="address"
                        className="mb-1 block text-sm font-medium"
                    >
                        Address
                    </label>

                    <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Supplier address"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </section>

            <section className="space-y-4 border-t pt-6">
                <h2 className="text-base font-semibold">Terms</h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="payment_terms"
                            className="mb-1 block text-sm font-medium"
                        >
                            Payment terms
                        </label>

                        <input
                            id="payment_terms"
                            name="payment_terms"
                            type="text"
                            value={formData.payment_terms}
                            onChange={handleChange}
                            placeholder="e.g. Net 30"
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="lead_time_days"
                            className="mb-1 block text-sm font-medium"
                        >
                            Lead time (days)
                        </label>

                        <input
                            id="lead_time_days"
                            name="lead_time_days"
                            type="number"
                            min="0"
                            step="1"
                            value={formData.lead_time_days}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
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
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Additional supplier notes..."
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </section>

            <div className="flex justify-end gap-2 border-t pt-6">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isPending}
                >
                    Cancel
                </Button>

                <Button type="submit" disabled={isPending}>
                    {isPending
                        ? "Saving..."
                        : isEditMode
                          ? "Update supplier"
                          : "Create supplier"}
                </Button>
            </div>
        </form>
    );
}
