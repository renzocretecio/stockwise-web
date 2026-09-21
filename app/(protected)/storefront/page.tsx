"use client";

import { Suspense, useState } from "react";
import { ExternalLink, Package, Settings2, ShoppingBag, Store } from "lucide-react";
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
import { useStorefront } from "@/modules/storefront/services";

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
