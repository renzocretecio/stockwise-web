"use client";

import {
    type FormEvent,
    type ReactNode,
    useState,
} from "react";
import { Check, Copy, ExternalLink, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { StorefrontQrCode } from
    "@/modules/storefront/components/storefront-qr-code";
import { useSaveStorefront } from
    "@/modules/storefront/services";
import type {
    OutOfStockBehavior,
    StorePaymentMethod,
    Storefront,
    StorefrontPayload,
} from "@/modules/storefront/types";

const paymentOptions: Array<{
    value: StorePaymentMethod;
    label: string;
    hint: string;
}> = [
    { value: "cod", label: "Cash on delivery", hint: "Collect upon delivery" },
    { value: "gcash", label: "GCash", hint: "Share payment instructions" },
    {
        value: "bank_transfer",
        label: "Bank transfer",
        hint: "Share account instructions",
    },
    {
        value: "pay_on_pickup",
        label: "Pay on pickup",
        hint: "Collect at your store",
    },
];

const defaultState: StorefrontPayload = {
    name: "",
    slug: "",
    description: "",
    logo_url: "",
    banner_url: "",
    is_active: false,
    out_of_stock_behavior: "mark_sold_out",
    pickup_enabled: true,
    delivery_enabled: true,
    payment_methods: ["cod"],
    payment_instructions: {},
};

function initialState(
    store: Storefront | undefined,
    suggestedName: string,
    suggestedSlug: string,
): StorefrontPayload {
    if (!store) {
        return {
            ...defaultState,
            name: suggestedName,
            slug: suggestedSlug || slugify(suggestedName),
        };
    }
    return {
        name: store.name,
        description: store.description ?? "",
        logo_url: store.logo_url ?? "",
        banner_url: store.banner_url ?? "",
        is_active: store.is_active ?? false,
        out_of_stock_behavior:
            store.out_of_stock_behavior ?? "mark_sold_out",
        pickup_enabled: store.pickup_enabled,
        delivery_enabled: store.delivery_enabled,
        payment_methods: store.payment_methods,
        payment_instructions: store.payment_instructions,
    };
}

function slugify(value: string) {
    return value
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function StorefrontSettings({
    canManage,
    hasPublishedProducts,
    store,
    suggestedName,
    suggestedSlug,
}: {
    canManage: boolean;
    hasPublishedProducts: boolean;
    store?: Storefront;
    suggestedName: string;
    suggestedSlug: string;
}) {
    const exists = Boolean(store);
    const saveStore = useSaveStorefront(exists);
    const [form, setForm] = useState<StorefrontPayload>(() =>
        initialState(store, suggestedName, suggestedSlug),
    );
    const [error, setError] = useState<string>();

    const update = <K extends keyof StorefrontPayload>(
        key: K,
        value: StorefrontPayload[K],
    ) => setForm((current) => ({ ...current, [key]: value }));

    const togglePayment = (method: StorePaymentMethod) => {
        const selected = form.payment_methods.includes(method);
        update(
            "payment_methods",
            selected
                ? form.payment_methods.filter((item) => item !== method)
                : [...form.payment_methods, method],
        );
    };

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(undefined);
        if (!form.pickup_enabled && !form.delivery_enabled) {
            setError("Enable pickup, delivery, or both.");
            return;
        }
        if (!form.payment_methods.length) {
            setError("Choose at least one payment method.");
            return;
        }
        const missingPaymentInstructions = form.payment_methods.find(
            (method) =>
                (method === "gcash" || method === "bank_transfer") &&
                !form.payment_instructions[method]?.trim(),
        );
        if (missingPaymentInstructions) {
            setError(
                `Add payment instructions for ${
                    missingPaymentInstructions === "gcash"
                        ? "GCash"
                        : "bank transfer"
                }.`,
            );
            return;
        }
        if (form.is_active && !hasPublishedProducts) {
            setError("Publish at least one product before opening the store.");
            return;
        }
        try {
            await saveStore.mutateAsync({
                ...form,
                slug: exists ? undefined : form.slug || undefined,
            });
            toast.add({
                title: exists ? "Store settings saved" : "Online store created",
                description: exists
                    ? "Your public store is up to date."
                    : "Publish products before opening it to customers.",
                type: "success",
            });
        } catch (reason) {
            setError(
                reason instanceof Error
                    ? reason.message
                    : "Unable to save the online store.",
            );
        }
    };

    const copyLink = async () => {
        if (!store?.public_url) return;
        await navigator.clipboard.writeText(store.public_url);
        toast.add({
            title: "Store link copied",
            description: store.public_url,
            type: "success",
        });
    };

    return (
        <form className="grid gap-px bg-border lg:grid-cols-[1.35fr_1fr]" onSubmit={submit}>
            <section className="space-y-6 bg-card p-4 sm:p-6">
                <div>
                    <h2 className="text-base font-semibold">Store identity</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                        What customers see when they open your store link.
                    </p>
                </div>

                {error ? (
                    <p className="rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">
                        {error}
                    </p>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Store name" required>
                        <Input
                            disabled={!canManage}
                            onChange={(event) => update("name", event.target.value)}
                            placeholder="Juan's Mini Grocery"
                            required
                            value={form.name}
                        />
                    </Field>
                    <Field label="Store link">
                        {exists ? (
                            <div className="flex gap-2">
                                <Input disabled value={store?.public_url ?? ""} />
                                <Button
                                    aria-label="Copy store link"
                                    onClick={copyLink}
                                    size="icon"
                                    type="button"
                                    variant="outline"
                                >
                                    <Copy className="size-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center rounded-2xl border border-input bg-background focus-within:ring-2 focus-within:ring-ring/30">
                                <span className="shrink-0 px-3 text-sm text-muted-foreground">
                                    /s/
                                </span>
                                <Input
                                    className="border-0 shadow-none focus-visible:ring-0 rounded-l-none"
                                    disabled={!canManage}
                                    onChange={(event) =>
                                        update(
                                            "slug",
                                            slugify(event.target.value),
                                        )
                                    }
                                    placeholder="your-store"
                                    required
                                    value={form.slug ?? ""}
                                />
                            </div>
                        )}
                        <span className="mt-1 block text-xs text-muted-foreground">
                            The link becomes permanent after creation.
                        </span>
                    </Field>
                </div>

                <Field label="Description">
                    <Textarea
                        disabled={!canManage}
                        onChange={(event) =>
                            update("description", event.target.value)
                        }
                        placeholder="A short description of what you sell."
                        rows={4}
                        value={form.description ?? ""}
                    />
                </Field>

                {store?.public_url ? (
                    <StorefrontQrCode
                        publicUrl={store.public_url}
                        slug={store.slug}
                        storeName={store.name}
                    />
                ) : null}

            </section>

            <section className="space-y-6 bg-card p-4 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-base font-semibold">Selling options</h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Set availability, fulfillment, and payment choices.
                        </p>
                    </div>
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                        <input
                            checked={form.is_active}
                            className="size-4 accent-primary"
                            disabled={
                                !canManage ||
                                (!form.is_active && !hasPublishedProducts)
                            }
                            onChange={(event) =>
                                update("is_active", event.target.checked)
                            }
                            type="checkbox"
                        />
                        Open
                    </label>
                </div>

                {!hasPublishedProducts ? (
                    <p className="rounded-2xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                        Publish at least one product before opening the store.
                    </p>
                ) : null}

                <Field label="When an item is unavailable">
                    <select
                        className="h-9 w-full rounded-2xl border border-input bg-background px-3 text-sm"
                        disabled={!canManage}
                        onChange={(event) =>
                            update(
                                "out_of_stock_behavior",
                                event.target.value as OutOfStockBehavior,
                            )
                        }
                        value={form.out_of_stock_behavior}
                    >
                        <option value="mark_sold_out">Show as sold out</option>
                        <option value="hide">Hide from the store</option>
                        <option value="continue_selling">Keep accepting orders</option>
                    </select>
                </Field>

                <div>
                    <p className="mb-2 text-sm font-medium">Fulfillment</p>
                    <div className="grid grid-cols-2 gap-2">
                        <CheckOption
                            checked={form.pickup_enabled}
                            disabled={!canManage}
                            label="Pickup"
                            onChange={(checked) =>
                                update("pickup_enabled", checked)
                            }
                        />
                        <CheckOption
                            checked={form.delivery_enabled}
                            disabled={!canManage}
                            label="Delivery"
                            onChange={(checked) =>
                                update("delivery_enabled", checked)
                            }
                        />
                    </div>
                </div>

                <div>
                    <p className="mb-2 text-sm font-medium">Payment methods</p>
                    <div className="space-y-2">
                        {paymentOptions.map((option) => {
                            const checked = form.payment_methods.includes(
                                option.value,
                            );
                            return (
                                <div key={option.value} className="rounded-2xl border p-3">
                                    <CheckOption
                                        checked={checked}
                                        disabled={!canManage}
                                        hint={option.hint}
                                        label={option.label}
                                        onChange={() => togglePayment(option.value)}
                                    />
                                    {checked &&
                                    option.value !== "cod" &&
                                    option.value !== "pay_on_pickup" ? (
                                        <Textarea
                                            className="mt-3"
                                            disabled={!canManage}
                                            onChange={(event) =>
                                                update("payment_instructions", {
                                                    ...form.payment_instructions,
                                                    [option.value]: event.target.value,
                                                })
                                            }
                                            placeholder="Account name, number, and instructions"
                                            rows={2}
                                            value={
                                                form.payment_instructions[
                                                    option.value
                                                ] ?? ""
                                            }
                                        />
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {canManage ? (
                    <div className="flex flex-wrap justify-end gap-2 pt-2">
                        {store?.public_url ? (
                            <Button
                                nativeButton={false}
                                render={<a href={store.public_url} target="_blank" />}
                                type="button"
                                variant="outline"
                            >
                                View store
                                <ExternalLink className="size-4" />
                            </Button>
                        ) : null}
                        <Button disabled={saveStore.isPending} type="submit">
                            {saveStore.isPending
                                ? "Saving…"
                                : exists
                                  ? "Save settings"
                                  : "Create store"}
                        </Button>
                    </div>
                ) : null}
            </section>
        </form>
    );
}

function Field({
    children,
    label,
    required,
}: {
    children: ReactNode;
    label: string;
    required?: boolean;
}) {
    return (
        <label className="block text-sm">
            <span className="mb-1.5 block font-medium">
                {label}
                {required ? " *" : ""}
            </span>
            {children}
        </label>
    );
}

function CheckOption({
    checked,
    disabled,
    hint,
    label,
    onChange,
}: {
    checked: boolean;
    disabled: boolean;
    hint?: string;
    label: string;
    onChange: (checked: boolean) => void;
}) {
    return (
        <label
            className={cn(
                "flex min-w-0 cursor-pointer items-center gap-3 rounded-2xl",
                disabled && "cursor-not-allowed opacity-60",
            )}
        >
            <span
                className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-md border",
                    checked && "border-primary bg-primary text-primary-foreground",
                )}
            >
                {checked ? <Check className="size-3.5" /> : null}
            </span>
            <input
                checked={checked}
                className="sr-only"
                disabled={disabled}
                onChange={(event) => onChange(event.target.checked)}
                type="checkbox"
            />
            <span className="min-w-0">
                <span className="block text-sm font-medium">{label}</span>
                {hint ? (
                    <span className="block text-xs text-muted-foreground">
                        {hint}
                    </span>
                ) : null}
            </span>
        </label>
    );
}

export function StorefrontSetupEmpty() {
    return (
        <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
            <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Store className="size-6" />
            </span>
            <h2 className="text-lg font-semibold">Create your online store</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Set your store details, choose which products are public, then
                share one permanent link with customers.
            </p>
        </div>
    );
}
