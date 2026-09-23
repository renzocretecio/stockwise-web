"use client";

import { Suspense, useState } from "react";
import {
    Check,
    ExternalLink,
    Package,
    Settings2,
    ShoppingBag,
    Store,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { useHasPermission } from
    "@/modules/auth/hooks/use-has-permission";
import { useSession } from "@/modules/auth/services/session";
import { StorefrontOrders } from
    "@/modules/storefront/components/storefront-orders";
import { StorefrontProducts } from
    "@/modules/storefront/components/storefront-products";
import { StorefrontSettings } from
    "@/modules/storefront/components/storefront-settings";
import {
    useStorefront,
    useStoreProducts,
} from "@/modules/storefront/services";

type Tab = "settings" | "products" | "orders";

const tabs: Array<{
    icon: typeof Store;
    label: string;
    value: Tab;
}> = [
    { icon: Settings2, label: "Store setup", value: "settings" },
    { icon: Package, label: "Products", value: "products" },
    { icon: ShoppingBag, label: "Orders", value: "orders" },
];

export default function StorefrontPage() {
    return (
        <Suspense
            fallback={
                <div className="bento-page min-h-[60vh] animate-pulse bg-muted/20" />
            }
        >
            <StorefrontContent />
        </Suspense>
    );
}

function StorefrontContent() {
    const searchParams = useSearchParams();
    const [tab, setTab] = useState<Tab>(() => {
        const requestedTab = searchParams.get("tab");
        return requestedTab === "products" || requestedTab === "orders"
            ? requestedTab
            : "settings";
    });
    const session = useSession();
    const storefront = useStorefront();
    const products = useStoreProducts(1, 1, "", Boolean(storefront.data));
    const canManage = useHasPermission("storefront.manage");
    const canManageOrders = useHasPermission("storefront.orders");
    const notCreated =
        storefront.error instanceof ApiError && storefront.error.status === 404;
    const store = storefront.data;
    const activeBusiness = session.data?.active_business;

    if (storefront.isLoading) {
        return (
            <div className="bento-page min-h-[60vh] animate-pulse bg-muted/20" />
        );
    }

    if (storefront.isError && !notCreated) {
        return (
            <div className="bento-page flex min-h-80 flex-col items-center justify-center p-8 text-center">
                <Store className="mb-3 size-8 text-muted-foreground" />
                <h1 className="text-lg font-semibold">Unable to load online store</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {storefront.error.message}
                </p>
                <Button
                    className="mt-4"
                    onClick={() => storefront.refetch()}
                    variant="outline"
                >
                    Try again
                </Button>
            </div>
        );
    }

    return (
        <div className="bento-page">
            <header className="flex flex-col gap-4 p-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Online store
                        </h1>
                        {store ? (
                            <span
                                className={cn(
                                    "rounded-2xl px-2 py-1 text-xs font-medium",
                                    store.is_active
                                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                        : "bg-muted text-muted-foreground",
                                )}
                            >
                                {store.is_active ? "Open" : "Closed"}
                            </span>
                        ) : null}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Publish products, accept customer requests, and fulfill
                        orders from one permanent store link.
                    </p>
                </div>
                {store?.public_url ? (
                    <Button
                        nativeButton={false}
                        render={<a href={store.public_url} target="_blank" />}
                        variant="outline"
                    >
                        View public store
                        <ExternalLink className="size-4" />
                    </Button>
                ) : null}
            </header>

            {canManage ? (
                <StoreSetupChecklist
                    onSelectTab={setTab}
                    products={products}
                    store={store}
                />
            ) : null}

            <nav className="flex gap-1 overflow-x-auto border-y bg-card p-2">
                {tabs.map((item) => {
                    const Icon = item.icon;
                    const disabled = !store && item.value !== "settings";
                    return (
                        <button
                            className={cn(
                                "flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-colors",
                                tab === item.value
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                disabled && "cursor-not-allowed opacity-40",
                            )}
                            disabled={disabled}
                            key={item.value}
                            onClick={() => setTab(item.value)}
                            type="button"
                        >
                            <Icon className="size-4" />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            {tab === "settings" ? (
                <StorefrontSettings
                    canManage={canManage}
                    hasPublishedProducts={
                        (products.data?.published_count ?? 0) > 0
                    }
                    key={store?.id ?? activeBusiness?.id ?? "new"}
                    store={store}
                    suggestedName={activeBusiness?.name ?? ""}
                    suggestedSlug={activeBusiness?.slug ?? ""}
                />
            ) : null}
            {tab === "products" && store ? (
                <StorefrontProducts
                    canManage={canManage}
                    currencyCode={store.currency_code}
                />
            ) : null}
            {tab === "orders" && store ? (
                <StorefrontOrders
                    canManage={canManageOrders}
                    currencyCode={store.currency_code}
                />
            ) : null}
        </div>
    );
}

function StoreSetupChecklist({
    onSelectTab,
    products,
    store,
}: {
    onSelectTab: (tab: Tab) => void;
    products: ReturnType<typeof useStoreProducts>;
    store: ReturnType<typeof useStorefront>["data"];
}) {
    const storeExists = Boolean(store);
    const hasProducts = (products.data?.published_count ?? 0) > 0;
    const hasFulfillment = Boolean(
        store?.pickup_enabled || store?.delivery_enabled,
    );
    const hasPayments = Boolean(
        store?.payment_methods.length &&
            store.payment_methods.every((method) => {
                if (method !== "gcash" && method !== "bank_transfer") {
                    return true;
                }
                return Boolean(
                    store.payment_instructions[method]?.trim(),
                );
            }),
    );
    const steps: Array<{
        complete: boolean;
        label: string;
        action: string;
        tab: Tab;
    }> = [
        {
            complete: storeExists,
            label: "Create your store",
            action: "Set up",
            tab: "settings",
        },
        {
            complete: hasFulfillment,
            label: "Choose fulfillment",
            action: "Set options",
            tab: "settings",
        },
        {
            complete: hasPayments,
            label: "Set payment methods",
            action: "Set payments",
            tab: "settings",
        },
        {
            complete: hasProducts,
            label: "Publish a product",
            action: "Choose products",
            tab: "products",
        },
        {
            complete: Boolean(store?.is_active),
            label: "Open your store",
            action: "Open store",
            tab: "settings",
        },
    ];
    const completeCount = steps.filter((step) => step.complete).length;

    if (storeExists && products.isLoading) return null;
    if (completeCount === steps.length) return null;

    return (
        <section className="border-t bg-card p-4 sm:p-5" aria-label="Store setup checklist">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h2 className="text-sm font-semibold">Get your store ready</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {completeCount} of {steps.length} steps complete
                    </p>
                </div>
                <div
                    aria-label={`${completeCount} of ${steps.length} steps complete`}
                    className="flex gap-1"
                >
                    {steps.map((step) => (
                        <span
                            className={cn(
                                "h-1.5 w-8 rounded-full bg-muted",
                                step.complete && "bg-primary",
                            )}
                            key={step.label}
                        />
                    ))}
                </div>
            </div>

            {products.isError && storeExists ? (
                <p className="mt-3 text-xs text-destructive">
                    Could not check published products. Try refreshing this page.
                </p>
            ) : null}

            <ol className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                {steps.map((step, index) => (
                    <li
                        className="flex min-w-0 items-center gap-3 rounded-2xl border border-border/70 p-3"
                        key={step.label}
                    >
                        <span
                            className={cn(
                                "grid size-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold",
                                step.complete &&
                                    "bg-primary/15 text-primary",
                            )}
                        >
                            {step.complete ? <Check className="size-4" /> : index + 1}
                        </span>
                        <span className="min-w-0 flex-1 text-sm font-medium">
                            {step.label}
                        </span>
                        {!step.complete &&
                        (index === 0 || storeExists) ? (
                            <Button
                                onClick={() => onSelectTab(step.tab)}
                                size="sm"
                                type="button"
                                variant="outline"
                            >
                                {step.action}
                            </Button>
                        ) : null}
                    </li>
                ))}
            </ol>
        </section>
    );
}
