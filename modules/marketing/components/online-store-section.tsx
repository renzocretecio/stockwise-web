import Link from "next/link";
import {
    ArrowRight,
    Check,
    CircleCheck,
    ExternalLink,
    PackageCheck,
    QrCode,
    ShoppingBag,
    Store,
} from "lucide-react";

import { WorkflowScrollReveal } from "./workflow-scroll-reveal";

const sellingSteps = [
    {
        description: "Choose which inventory items customers can order.",
        label: "Publish products",
    },
    {
        description: "Share one permanent link or downloadable QR code.",
        label: "Share your store",
    },
    {
        description: "Confirm requests to reserve the available stock.",
        label: "Review orders",
    },
];

const previewProducts = [
    { name: "Organic Coffee Beans", price: "₱420" },
    { name: "Wireless Earbuds", price: "₱1,250" },
    { name: "USB-C Cable", price: "₱180" },
];

export function OnlineStoreSection() {
    return (
        <section
            aria-labelledby="online-store-heading"
            className={
                "scroll-mt-24 border-t border-border bg-background " +
                "px-4 py-16 text-foreground sm:px-6 lg:py-20"
            }
            id="online-store"
        >
            <WorkflowScrollReveal>
                <div className="grid min-w-0 gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-14">
                    <div className="min-w-0" data-workflow-reveal>
                        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-accent-foreground">
                            <Store className="size-3.5" />
                            Included in every plan
                        </div>
                        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">
                            Online store
                        </p>
                        <h2
                            className="mt-5 max-w-2xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-5xl"
                            id="online-store-heading"
                        >
                            Turn the stock you already manage into a store you
                            can share.
                        </h2>
                        <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                            Publish selected products, share a link or QR code,
                            and receive customer order requests without managing
                            another catalog.
                        </p>

                        <ol className="mt-7 space-y-4">
                            {sellingSteps.map((step, index) => (
                                <li
                                    className="flex items-start gap-3"
                                    data-workflow-order={index}
                                    data-workflow-reveal
                                    key={step.label}
                                >
                                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                        {index + 1}
                                    </span>
                                    <span>
                                        <span className="block text-sm font-semibold">
                                            {step.label}
                                        </span>
                                        <span className="mt-1 block text-sm leading-5 text-muted-foreground">
                                            {step.description}
                                        </span>
                                    </span>
                                </li>
                            ))}
                        </ol>

                        <Link
                            className="group mt-7 inline-flex min-h-11 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-4"
                            href="/signup"
                        >
                            Build your online store
                            <ArrowRight className="size-4 transition-transform motion-safe:group-hover:translate-x-1 motion-reduce:transition-none" />
                        </Link>
                    </div>

                    <StorefrontPreview />
                </div>

                <div className="mt-10 grid overflow-hidden rounded-2xl border border-border bg-card sm:grid-cols-3 lg:mt-12">
                    <StoreFact
                        description="Only products you choose appear in the public catalog."
                        icon={Check}
                        title="You control what is public"
                    />
                    <StoreFact
                        description="Confirmation reserves stock before the order is prepared."
                        icon={PackageCheck}
                        title="Orders respect availability"
                    />
                    <StoreFact
                        description="Completion records the sale and deducts the fulfilled quantity."
                        icon={CircleCheck}
                        title="Inventory stays connected"
                    />
                </div>
            </WorkflowScrollReveal>
        </section>
    );
}

function StorefrontPreview() {
    return (
        <div
            className="relative min-w-0"
            data-workflow-order="1"
            data-workflow-reveal
        >
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/25">
                <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
                            <Store className="size-4" />
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                                Demo Store
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                                Powered by KitaStock
                            </p>
                        </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-2xl border border-border px-3 py-1.5 text-xs font-medium">
                        <ShoppingBag className="size-3.5" />
                        Order · 2
                    </span>
                </div>

                <div className="p-4 sm:p-5">
                    <div className="rounded-2xl bg-muted p-5 sm:p-6">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-foreground">
                            Online store
                        </p>
                        <h3 className="mt-2 text-xl font-semibold">
                            Everyday products, ready to order.
                        </h3>
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                            Browse available items and send an order request—no
                            customer account required.
                        </p>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                        {previewProducts.map((product, index) => (
                            <article
                                className="flex min-h-32 flex-col rounded-2xl border border-border p-3"
                                key={product.name}
                            >
                                <span className="text-[10px] text-muted-foreground">
                                    {index === 0 ? "Grocery" : "Accessories"}
                                </span>
                                <p className="mt-2 text-sm font-semibold leading-5">
                                    {product.name}
                                </p>
                                <div className="mt-auto flex items-end justify-between gap-2 pt-4">
                                    <span className="text-sm font-bold">
                                        {product.price}
                                    </span>
                                    <span className="rounded-xl bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground">
                                        Add
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-secondary p-3 shadow-lg shadow-black/15">
                    <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
                        <CircleCheck className="size-4" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold">
                            New order received
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                            ORD-000128 · waiting for confirmation
                        </p>
                    </div>
                    <ExternalLink className="ml-auto size-3.5 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-secondary p-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-white text-black">
                        <QrCode className="size-7" />
                    </span>
                    <div>
                        <p className="text-xs font-semibold">Share anywhere</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                            Link or QR code
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StoreFact({
    description,
    icon: Icon,
    title,
}: {
    description: string;
    icon: typeof Check;
    title: string;
}) {
    return (
        <article className="border-b border-border p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 lg:p-6">
            <Icon className="size-4 text-accent-foreground" />
            <h3 className="mt-4 text-sm font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
            </p>
        </article>
    );
}
