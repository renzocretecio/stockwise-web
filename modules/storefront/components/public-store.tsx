"use client";

import {
    type FormEvent,
    useMemo,
    useState,
} from "react";
import { useRouter } from "next/navigation";
import {
    Minus,
    PackageOpen,
    Plus,
    Search,
    ShoppingBag,
    Store,
    Trash2,
} from "lucide-react";

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
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import {
    formatStoreCurrency,
    paymentLabels,
} from "@/modules/storefront/components/storefront-ui";
import {
    useCreatePublicOrder,
    usePublicCategories,
    usePublicProducts,
    usePublicStore,
} from "@/modules/storefront/services";
import type {
    DeliveryMethod,
    StorePaymentMethod,
    StoreProduct,
    Storefront,
} from "@/modules/storefront/types";

type CartLine = {
    product: StoreProduct;
    quantity: number;
};

export function PublicStorePage({ slug }: { slug: string }) {
    const store = usePublicStore(slug);
    const categories = usePublicCategories(slug);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [cart, setCart] = useState<Record<string, CartLine>>({});
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const debouncedSearch = useDebounce(search, 350);
    const products = usePublicProducts(
        slug,
        page,
        debouncedSearch,
        category,
    );

    const cartLines = useMemo(() => Object.values(cart), [cart]);
    const cartCount = cartLines.reduce(
        (total, line) => total + line.quantity,
        0,
    );
    const cartTotal = cartLines.reduce(
        (total, line) => total + line.product.price * line.quantity,
        0,
    );

    const changeQuantity = (product: StoreProduct, change: number) => {
        if (!product.id) return;
        setCart((current) => {
            const next = { ...current };
            const quantity = (next[product.id!]?.quantity ?? 0) + change;
            if (quantity <= 0) {
                delete next[product.id!];
            } else {
                next[product.id!] = { product, quantity };
            }
            return next;
        });
    };

    if (store.isLoading) {
        return <PublicStoreLoading />;
    }

    if (!store.data || store.isError) {
        return (
            <main className="flex min-h-dvh items-center justify-center bg-background p-6">
                <div className="max-w-sm text-center">
                    <Store className="mx-auto mb-4 size-10 text-muted-foreground" />
                    <h1 className="text-xl font-semibold">Store unavailable</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        This store is closed or the link is no longer available.
                    </p>
                </div>
            </main>
        );
    }

    const storefront = store.data;

    return (
        <main className="min-h-dvh bg-background pb-28">
            <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-xl">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary text-primary-foreground">
                            <Store className="size-5" />
                        </span>
                        <div className="min-w-0">
                            <p className="truncate font-semibold">
                                {storefront.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Powered by KitaStock
                            </p>
                        </div>
                    </div>
                    <Button
                        disabled={!cartCount}
                        onClick={() => setCheckoutOpen(true)}
                        variant="outline"
                    >
                        <ShoppingBag className="size-4" />
                        <span className="hidden sm:inline">Your order</span>
                        {cartCount ? (
                            <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                                {cartCount}
                            </span>
                        ) : null}
                    </Button>
                </div>
            </header>

            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
                <section className="relative overflow-hidden rounded-2xl bg-card p-6 ring-1 ring-foreground/5 sm:p-10">
                    <div className="relative max-w-2xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">
                            Online store
                        </p>
                        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                            {storefront.name}
                        </h1>
                        {storefront.description ? (
                            <p className="mt-3 max-w-xl text-sm leading-6 opacity-80 sm:text-base">
                                {storefront.description}
                            </p>
                        ) : null}
                    </div>
                </section>

                <section className="mt-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            <CategoryButton
                                active={!category}
                                label="All products"
                                onClick={() => {
                                    setCategory("");
                                    setPage(1);
                                }}
                            />
                            {categories.data?.categories.map((item) => (
                                <CategoryButton
                                    active={category === item.id}
                                    key={item.id}
                                    label={item.name}
                                    onClick={() => {
                                        setCategory(item.id);
                                        setPage(1);
                                    }}
                                />
                            ))}
                        </div>
                        <label className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="bg-card pl-9"
                                onChange={(event) => {
                                    setSearch(event.target.value);
                                    setPage(1);
                                }}
                                placeholder="Search this store"
                                value={search}
                            />
                        </label>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {products.isLoading
                            ? Array.from({ length: 8 }).map((_, index) => (
                                  <div
                                      className="h-80 animate-pulse rounded-2xl bg-muted"
                                      key={index}
                                  />
                              ))
                            : products.data?.products.map((product) => (
                                  <PublicProductCard
                                      cartQuantity={
                                          product.id
                                              ? cart[product.id]?.quantity ?? 0
                                              : 0
                                      }
                                      currencyCode={storefront.currency_code}
                                      key={product.id}
                                      onChange={(change) =>
                                          changeQuantity(product, change)
                                      }
                                      product={product}
                                  />
                              ))}
                    </div>

                    {!products.isLoading && !products.data?.products.length ? (
                        <div className="flex min-h-64 flex-col items-center justify-center text-center">
                            <PackageOpen className="mb-3 size-8 text-muted-foreground" />
                            <p className="font-medium">No products found</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Try another search or category.
                            </p>
                        </div>
                    ) : null}

                    {(products.data?.pagination.total_pages ?? 0) > 1 ? (
                        <div className="mt-6 flex items-center justify-center gap-3">
                            <Button
                                disabled={!products.data?.pagination.has_previous}
                                onClick={() => setPage((value) => value - 1)}
                                variant="outline"
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                {page} of {products.data?.pagination.total_pages}
                            </span>
                            <Button
                                disabled={!products.data?.pagination.has_next}
                                onClick={() => setPage((value) => value + 1)}
                                variant="outline"
                            >
                                Next
                            </Button>
                        </div>
                    ) : null}
                </section>
            </div>

            {cartCount ? (
                <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 p-3 backdrop-blur-xl">
                    <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground">
                                {cartCount} {cartCount === 1 ? "item" : "items"}
                            </p>
                            <p className="font-semibold">
                                {formatStoreCurrency(
                                    cartTotal,
                                    storefront.currency_code,
                                )}
                            </p>
                        </div>
                        <Button onClick={() => setCheckoutOpen(true)} size="lg">
                            Review order
                            <ShoppingBag className="size-4" />
                        </Button>
                    </div>
                </div>
            ) : null}

            <CheckoutDialog
                cartLines={cartLines}
                onCartChange={changeQuantity}
                onOpenChange={setCheckoutOpen}
                open={checkoutOpen}
                slug={slug}
                store={storefront}
            />
        </main>
    );
}

function PublicProductCard({
    cartQuantity,
    currencyCode,
    onChange,
    product,
}: {
    cartQuantity: number;
    currencyCode: string;
    onChange: (change: number) => void;
    product: StoreProduct;
}) {
    const soldOut = product.availability === "sold_out";

    return (
        <article className="flex min-h-56 flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/5">
            <div className="flex flex-1 flex-col p-4">
                {product.category ? (
                    <p className="text-xs text-muted-foreground">
                        {product.category.name}
                    </p>
                ) : null}
                <h2 className="mt-1 font-semibold">{product.name}</h2>
                {product.description ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">
                        {product.description}
                    </p>
                ) : null}
                <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                    <div>
                        <p className="text-lg font-bold">
                            {formatStoreCurrency(product.price, currencyCode)}
                        </p>
                        {soldOut ? (
                            <p className="text-xs font-medium text-destructive">
                                Sold out
                            </p>
                        ) : null}
                    </div>
                    {cartQuantity ? (
                        <QuantityControl
                            onChange={onChange}
                            quantity={cartQuantity}
                        />
                    ) : (
                        <Button
                            disabled={soldOut}
                            onClick={() => onChange(1)}
                            size="sm"
                        >
                            <Plus className="size-4" />
                            Add
                        </Button>
                    )}
                </div>
            </div>
        </article>
    );
}

function QuantityControl({
    onChange,
    quantity,
}: {
    onChange: (change: number) => void;
    quantity: number;
}) {
    return (
        <div className="flex items-center rounded-2xl border bg-background p-1">
            <button
                aria-label="Decrease quantity"
                className="flex size-7 items-center justify-center rounded-xl hover:bg-muted"
                onClick={() => onChange(-1)}
                type="button"
            >
                <Minus className="size-3.5" />
            </button>
            <span className="min-w-8 text-center text-sm font-semibold">
                {quantity}
            </span>
            <button
                aria-label="Increase quantity"
                className="flex size-7 items-center justify-center rounded-xl hover:bg-muted"
                onClick={() => onChange(1)}
                type="button"
            >
                <Plus className="size-3.5" />
            </button>
        </div>
    );
}

function CheckoutDialog({
    cartLines,
    onCartChange,
    onOpenChange,
    open,
    slug,
    store,
}: {
    cartLines: CartLine[];
    onCartChange: (product: StoreProduct, change: number) => void;
    onOpenChange: (open: boolean) => void;
    open: boolean;
    slug: string;
    store: Storefront;
}) {
    const router = useRouter();
    const createOrder = useCreatePublicOrder(slug);
    const [customerName, setCustomerName] = useState("");
    const [customerContact, setCustomerContact] = useState("");
    const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(
        store.pickup_enabled ? "pickup" : "delivery",
    );
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [customerNotes, setCustomerNotes] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<StorePaymentMethod>(
        store.payment_methods[0] ?? "cod",
    );
    const [error, setError] = useState<string>();
    const total = cartLines.reduce(
        (sum, line) => sum + line.product.price * line.quantity,
        0,
    );

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(undefined);
        try {
            const result = await createOrder.mutateAsync({
                items: cartLines.map((line) => ({
                    store_product_id: line.product.id!,
                    quantity: line.quantity,
                })),
                customer_name: customerName,
                customer_contact: customerContact,
                delivery_method: deliveryMethod,
                delivery_address:
                    deliveryMethod === "delivery" ? deliveryAddress : null,
                customer_notes: customerNotes || null,
                payment_method: paymentMethod,
            });
            router.push(
                `/order/${result.order.reference_number}?token=` +
                    encodeURIComponent(result.tracking_token),
            );
        } catch (reason) {
            setError(
                reason instanceof Error
                    ? reason.message
                    : "Unable to place your order.",
            );
        }
    };

    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
            <DialogContent className="max-h-[94vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Review your order</DialogTitle>
                    <DialogDescription>
                        No account is required. The store will confirm availability
                        before preparing your items.
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-5" onSubmit={submit}>
                    {error ? (
                        <p className="rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">
                            {error}
                        </p>
                    ) : null}

                    <div className="divide-y rounded-2xl border">
                        {cartLines.map((line) => (
                            <div
                                className="flex items-center gap-3 p-3"
                                key={line.product.id}
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">
                                        {line.product.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatStoreCurrency(
                                            line.product.price,
                                            store.currency_code,
                                        )}
                                    </p>
                                </div>
                                <QuantityControl
                                    onChange={(change) =>
                                        onCartChange(line.product, change)
                                    }
                                    quantity={line.quantity}
                                />
                                <button
                                    aria-label={`Remove ${line.product.name}`}
                                    className="text-muted-foreground hover:text-destructive"
                                    onClick={() =>
                                        onCartChange(
                                            line.product,
                                            -line.quantity,
                                        )
                                    }
                                    type="button"
                                >
                                    <Trash2 className="size-4" />
                                </button>
                            </div>
                        ))}
                        <div className="flex items-center justify-between p-3 font-semibold">
                            <span>Total</span>
                            <span>
                                {formatStoreCurrency(total, store.currency_code)}
                            </span>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="text-sm">
                            <span className="mb-1.5 block font-medium">Name *</span>
                            <Input
                                maxLength={150}
                                onChange={(event) =>
                                    setCustomerName(event.target.value)
                                }
                                required
                                value={customerName}
                            />
                        </label>
                        <label className="text-sm">
                            <span className="mb-1.5 block font-medium">
                                Mobile or Messenger contact *
                            </span>
                            <Input
                                maxLength={100}
                                onChange={(event) =>
                                    setCustomerContact(event.target.value)
                                }
                                required
                                value={customerContact}
                            />
                        </label>
                    </div>

                    <div>
                        <p className="mb-2 text-sm font-medium">Fulfillment</p>
                        <div className="grid grid-cols-2 gap-2">
                            {store.pickup_enabled ? (
                                <ChoiceButton
                                    active={deliveryMethod === "pickup"}
                                    label="Pickup"
                                    onClick={() => setDeliveryMethod("pickup")}
                                />
                            ) : null}
                            {store.delivery_enabled ? (
                                <ChoiceButton
                                    active={deliveryMethod === "delivery"}
                                    label="Delivery"
                                    onClick={() => setDeliveryMethod("delivery")}
                                />
                            ) : null}
                        </div>
                    </div>

                    {deliveryMethod === "delivery" ? (
                        <label className="block text-sm">
                            <span className="mb-1.5 block font-medium">
                                Delivery address *
                            </span>
                            <Textarea
                                onChange={(event) =>
                                    setDeliveryAddress(event.target.value)
                                }
                                required
                                rows={3}
                                value={deliveryAddress}
                            />
                        </label>
                    ) : null}

                    <div>
                        <p className="mb-2 text-sm font-medium">Payment</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {store.payment_methods.map((method) => (
                                <ChoiceButton
                                    active={paymentMethod === method}
                                    key={method}
                                    label={paymentLabels[method]}
                                    onClick={() => setPaymentMethod(method)}
                                />
                            ))}
                        </div>
                        {store.payment_instructions[paymentMethod] ? (
                            <p className="mt-2 rounded-2xl bg-muted p-3 text-sm text-muted-foreground">
                                {store.payment_instructions[paymentMethod]}
                            </p>
                        ) : null}
                    </div>

                    <label className="block text-sm">
                        <span className="mb-1.5 block font-medium">
                            Order note
                        </span>
                        <Textarea
                            onChange={(event) =>
                                setCustomerNotes(event.target.value)
                            }
                            placeholder="Optional delivery or product instructions"
                            rows={3}
                            value={customerNotes}
                        />
                    </label>

                    <DialogFooter>
                        <Button
                            disabled={
                                !cartLines.length || createOrder.isPending
                            }
                            type="submit"
                        >
                            {createOrder.isPending
                                ? "Placing order…"
                                : "Place order"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function CategoryButton({
    active,
    label,
    onClick,
}: {
    active: boolean;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            className={cn(
                "shrink-0 rounded-2xl px-4 py-2 text-sm font-medium transition-colors",
                active
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground ring-1 ring-foreground/5 hover:text-foreground",
            )}
            onClick={onClick}
            type="button"
        >
            {label}
        </button>
    );
}

function ChoiceButton({
    active,
    label,
    onClick,
}: {
    active: boolean;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            className={cn(
                "rounded-2xl border p-3 text-left text-sm font-medium transition-colors",
                active
                    ? "border-primary bg-primary/10"
                    : "hover:bg-muted",
            )}
            onClick={onClick}
            type="button"
        >
            {label}
        </button>
    );
}

function PublicStoreLoading() {
    return (
        <main className="min-h-dvh bg-background p-4">
            <div className="mx-auto max-w-6xl space-y-4">
                <div className="h-16 animate-pulse rounded-2xl bg-muted" />
                <div className="h-64 animate-pulse rounded-2xl bg-muted" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div
                            className="h-80 animate-pulse rounded-2xl bg-muted"
                            key={index}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
}
