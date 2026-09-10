import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
    ArrowRight,
    BarChart3,
    Bot,
    Boxes,
    Check,
    ChevronRight,
    CloudCheck,
    ClipboardCheck,
    FileText,
    PackageCheck,
    ShoppingCart,
    Sparkles,
    Store,
    Truck,
    WifiOff,
    type LucideIcon,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
    title: "StockWise — Inventory clarity for small businesses",
    description:
        "Manage sales, purchases, stock, and reports in one place. " +
        "Turn reliable inventory data into clear daily decisions.",
};

const coreFeatures = [
    {
        description:
            "Record completed sales and partial returns while StockWise " +
            "keeps the right product quantities in sync.",
        icon: ShoppingCart,
        label: "Sales and returns",
        value: "Sell with confidence",
    },
    {
        description:
            "Create purchase orders, track expected deliveries, and receive " +
            "only what actually arrived.",
        icon: Truck,
        label: "Purchasing",
        value: "Receive accurately",
    },
    {
        description:
            "Review balances, movements, adjustments, and physical counts " +
            "from one reliable inventory history.",
        icon: PackageCheck,
        label: "Inventory control",
        value: "Know what is in stock",
    },
    {
        description:
            "Explore sales, profit, purchasing, and inventory reports for " +
            "the exact date range you choose.",
        icon: BarChart3,
        label: "Reports",
        value: "Understand performance",
    },
];

const intelligenceFeatures = [
    {
        description:
            "A concise owner-ready account of sales, receipts, returns, and " +
            "the risks that need attention.",
        label: "Daily Inventory Briefing",
        question: "What happened?",
    },
    {
        description:
            "Demand estimates calculated from recorded product sales and " +
            "recent selling velocity.",
        label: "Demand Forecasting",
        question: "What is likely to sell?",
    },
    {
        description:
            "Suggested quantities based on demand, available stock, safety " +
            "stock, and supplier lead time.",
        label: "Reorder Assistant",
        question: "What should I order?",
    },
    {
        description:
            "Plain-language context for unusual counts, adjustments, losses, " +
            "and unexpected stock movement.",
        label: "Anomaly Explanations",
        question: "What needs attention?",
    },
];

const plans = [
    {
        description: "Essential inventory management for solo owners.",
        features: [
            "50 active SKUs",
            "1 member",
            "5 AI actions each week",
            "Core operations and reports",
        ],
        name: "Free",
        price: "₱0",
        suffix: "forever",
    },
    {
        description:
            "More products, a small team, and reliable offline operations.",
        features: [
            "500 active SKUs",
            "3 members included",
            "30 AI actions each week",
            "Offline mode and automatic sync",
            "Weekly owner summary",
            "Additional members at ₱79/month",
        ],
        name: "Pro",
        popular: true,
        price: "₱299",
        suffix: "per month",
    },
    {
        description:
            "Higher capacity and advanced control for larger teams.",
        features: [
            "10,000 active SKUs",
            "25 members included",
            "150 AI actions each week",
            "Everything in Pro",
            "Custom roles and permissions",
        ],
        name: "Business",
        price: "₱899",
        suffix: "per month",
    },
];

const questions = [
    {
        answer:
            "StockWise is an inventory and sales system for small-business " +
            "owners. It connects products, stock, purchasing, sales, " +
            "returns, " +
            "reports, and decision support in one workspace.",
        question: "What is StockWise?",
    },
    {
        answer:
            "No. StockWise calculates from recorded business data first. " +
            "AI communicates those facts in plain language without inventing " +
            "inventory numbers or order quantities.",
        question: "Does AI calculate my inventory numbers?",
    },
    {
        answer:
            "Eligible new accounts receive a 14-day Pro trial. If Pro is not " +
            "activated afterward, the business returns to Free limits while " +
            "its existing records remain available.",
        question: "What happens after the Pro trial?",
    },
    {
        answer:
            "Yes. One account can access multiple businesses. Each business " +
            "has separate inventory, members, AI usage, and subscription.",
        question: "Can I manage multiple businesses?",
    },
    {
        answer:
            "Pro and Business support offline operations. Eligible changes " +
            "are queued on the device and synchronized after the connection " +
            "returns.",
        question: "Can StockWise work without internet?",
    },
];

export default function HomePage() {
    return (
        <main
            className={
                "min-h-svh overflow-x-clip bg-white text-zinc-950 " +
                "[--primary:#007a55] [--primary-foreground:#ffffff]"
            }
        >
            <MarketingHeader />
            <Hero />
            <ProductStrip />
            <CoreFeatures />
            <OfflineFeature />
            <Intelligence />
            <AiActionLimits />
            <Pricing />
            <Faq />
            <FinalCallToAction />
            <MarketingFooter />
        </main>
    );
}

function MarketingHeader() {
    return (
        <header
            className={
                "pointer-events-none sticky top-0 z-50 px-3 py-3 " +
                "sm:px-6"
            }
        >
            <nav
                aria-label="Marketing navigation"
                className={
                    "pointer-events-auto mx-auto flex h-14 max-w-6xl " +
                    "items-center justify-between rounded-2xl border " +
                    "border-zinc-200/80 bg-white/90 px-3 shadow-lg " +
                    "shadow-zinc-950/5 backdrop-blur-xl sm:px-4"
                }
            >
                <Brand />
                <div
                    className={
                        "hidden items-center gap-1 rounded-2xl bg-zinc-100 " +
                        "p-1 md:flex"
                    }
                >
                    <HeaderLink href="#features">Features</HeaderLink>
                    <HeaderLink href="#offline">Offline</HeaderLink>
                    <HeaderLink href="#intelligence">
                        Intelligence
                    </HeaderLink>
                    <HeaderLink href="#pricing">Pricing</HeaderLink>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        className={
                            "hidden px-3 text-sm font-medium text-zinc-600 " +
                            "transition-colors hover:text-zinc-950 sm:block"
                        }
                        href="/login"
                    >
                        Sign in
                    </Link>
                    <Link
                        className={cn(
                            buttonVariants({ size: "sm" }),
                            "rounded-2xl bg-primary px-4",
                            "text-primary-foreground hover:bg-primary/90",
                        )}
                        href="/signup"
                    >
                        Start free
                    </Link>
                </div>
            </nav>
        </header>
    );
}

function HeaderLink({
    children,
    href,
}: {
    children: React.ReactNode;
    href: string;
}) {
    return (
        <Link
            className={
                "rounded-2xl px-3 py-2 text-xs font-medium text-zinc-600 " +
                "transition-colors hover:bg-white hover:text-zinc-950"
            }
            href={href}
        >
            {children}
        </Link>
    );
}

function Brand({ inverse = false }: { inverse?: boolean }) {
    return (
        <Link className="flex items-center gap-2.5" href="/">
            <span
                className={
                    "flex size-8 items-center justify-center rounded-2xl " +
                    "bg-primary text-primary-foreground"
                }
            >
                <Boxes className="size-4" />
            </span>
            <span
                className={cn(
                    "text-base font-semibold tracking-tight",
                    inverse ? "text-white" : "text-zinc-950",
                )}
            >
                StockWise
            </span>
        </Link>
    );
}

function Hero() {
    return (
        <section className="relative isolate px-4 pb-16 pt-16 sm:px-6">
            <div
                aria-hidden="true"
                className={
                    "absolute left-1/2 top-0 -z-10 size-[520px] " +
                    "-translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
                }
            />
            <div className="mx-auto max-w-7xl text-center">
                <Link
                    className={
                        "inline-flex items-center gap-2 rounded-full border " +
                        "border-primary/20 bg-primary/5 px-3 py-1.5 text-xs " +
                        "font-medium text-primary transition-colors " +
                        "hover:bg-primary/10"
                    }
                    href="#intelligence"
                >
                    <Sparkles className="size-3.5" />
                    AI report summaries are now included
                    <ChevronRight className="size-3.5" />
                </Link>
                <h1
                    className={
                        "mx-auto mt-8 max-w-5xl text-5xl font-semibold " +
                        "leading-[0.95] tracking-[-0.065em] sm:text-7xl " +
                        "lg:text-[5.75rem]"
                    }
                >
                    Your inventory,
                    <span className="block text-primary">
                        organized and understood.
                    </span>
                </h1>
                <p
                    className={
                        "mx-auto mt-7 max-w-2xl text-base leading-7 " +
                        "text-zinc-600 sm:text-lg"
                    }
                >
                    StockWise helps small businesses manage products, sales,
                    purchases, inventory, and reports—with practical AI that
                    explains what is happening in plain language.
                </p>
                <div
                    className={
                        "mt-8 flex flex-col items-center justify-center " +
                        "gap-3 sm:flex-row"
                    }
                >
                    <Link
                        className={cn(
                            buttonVariants({ size: "lg" }),
                            "w-full rounded-2xl bg-primary px-6",
                            "text-primary-foreground hover:bg-primary/90",
                            "sm:w-auto",
                        )}
                        href="/signup"
                    >
                        Start free
                        <ArrowRight className="size-4" />
                    </Link>
                    <Link
                        className={cn(
                            buttonVariants({
                                size: "lg",
                                variant: "outline",
                            }),
                            "w-full rounded-2xl border-zinc-300 bg-white",
                            "px-6 hover:bg-zinc-100 sm:w-auto",
                        )}
                        href="#features"
                    >
                        Explore the product
                    </Link>
                </div>
                <div
                    className={
                        "mt-5 flex flex-wrap items-center justify-center " +
                        "gap-x-5 gap-y-2 text-xs text-zinc-500"
                    }
                >
                    <HeroCheck label="No card required" />
                    <HeroCheck label="14-day Pro trial" />
                    <HeroCheck label="Start with up to 50 SKUs" />
                </div>
                <HeroScreenshot />
            </div>
        </section>
    );
}

function HeroCheck({ label }: { label: string }) {
    return (
        <span className="inline-flex items-center gap-1.5">
            <Check className="size-3.5 text-primary" />
            {label}
        </span>
    );
}

function HeroScreenshot() {
    return (
        <figure className="relative mx-auto mt-16 max-w-5xl">
            <div
                aria-hidden="true"
                className={
                    "absolute inset-x-10 bottom-0 -z-10 h-2/3 rounded-full " +
                    "bg-primary/25 blur-3xl"
                }
            />
            <div
                className={
                    "group overflow-hidden rounded-2xl border " +
                    "border-zinc-300 bg-zinc-950 p-1.5 shadow-2xl " +
                    "shadow-zinc-950/20"
                }
            >
                <div
                    className={
                        "flex h-9 items-center gap-1.5 rounded-t-2xl " +
                        "bg-zinc-950 px-3"
                    }
                >
                    <span className="size-2 rounded-full bg-zinc-600" />
                    <span className="size-2 rounded-full bg-zinc-600" />
                    <span className="size-2 rounded-full bg-zinc-600" />
                    <span
                        className={
                            "mx-auto hidden rounded-full bg-white/10 px-12 " +
                            "py-1 text-[10px] text-zinc-400 sm:block"
                        }
                    >
                        app.stockwise.ph/dashboard
                    </span>
                </div>
                <Image
                    alt={
                        "StockWise business overview showing revenue, gross " +
                        "profit, inventory risks, and business trends"
                    }
                    className={
                        "h-auto w-full rounded-b-2xl transition-transform " +
                        "duration-700 group-hover:scale-[1.005]"
                    }
                    height={1079}
                    priority
                    src="/marketing/business-overview.png"
                    unoptimized
                    width={1919}
                />
            </div>
            <figcaption className="mt-4 text-xs text-zinc-500">
                Actual StockWise business overview · Demo data
            </figcaption>
        </figure>
    );
}

function ProductStrip() {
    const items = [
        ["Sales", "Completed sales and returns"],
        ["Purchasing", "Orders and receiving"],
        ["Inventory", "Balances and movements"],
        ["Reports", "Performance by date range"],
    ];

    return (
        <section className="border-y border-zinc-200 bg-zinc-50 px-4 sm:px-6">
            <div
                className={
                    "mx-auto grid max-w-6xl sm:grid-cols-2 " +
                    "lg:grid-cols-4"
                }
            >
                {items.map(([label, description]) => (
                    <div
                        className={
                            "border-b border-zinc-200 px-5 py-6 " +
                            "last:border-b-0 sm:odd:border-r " +
                            "lg:border-b-0 lg:border-r " +
                            "lg:last:border-r-0"
                        }
                        key={label}
                    >
                        <p className="text-sm font-semibold">{label}</p>
                        <p className="mt-1 text-xs text-zinc-500">
                            {description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}

function CoreFeatures() {
    return (
        <section
            className="scroll-mt-24 bg-white px-4 py-24 sm:px-6"
            id="features"
        >
            <div className="mx-auto max-w-6xl">
                <SectionHeading
                    eyebrow="One connected workflow"
                    title="Run the operation without piecing tools together."
                    description={
                        "The transaction history that runs your business " +
                        "also powers every report and recommendation."
                    }
                />
                <div className="mt-14 grid gap-4 lg:grid-cols-12">
                    {coreFeatures.map((feature, index) => (
                        <CoreFeatureCard
                            feature={feature}
                            index={index}
                            key={feature.label}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

function CoreFeatureCard({
    feature,
    index,
}: {
    feature: (typeof coreFeatures)[number];
    index: number;
}) {
    const Icon = feature.icon;

    return (
        <article
            className={cn(
                "group relative min-h-72 overflow-hidden rounded-2xl",
                "border border-zinc-200 bg-zinc-50 p-6 transition-all",
                "duration-300 hover:-translate-y-1 hover:border-primary/30",
                "hover:bg-white hover:shadow-xl hover:shadow-zinc-950/5",
                index === 0 || index === 3
                    ? "lg:col-span-7"
                    : "lg:col-span-5",
            )}
        >
            <div
                aria-hidden="true"
                className={
                    "absolute -right-20 -top-20 size-64 rounded-full " +
                    "bg-primary/10 blur-3xl transition-transform " +
                    "duration-500 group-hover:scale-125"
                }
            />
            <div className="relative flex h-full flex-col">
                <span
                    className={
                        "flex size-11 items-center justify-center " +
                        "rounded-2xl bg-primary text-primary-foreground"
                    }
                >
                    <Icon className="size-5" />
                </span>
                <p
                    className={
                        "mt-auto pt-16 text-xs font-medium uppercase " +
                        "tracking-[0.14em] text-primary"
                    }
                >
                    {feature.label}
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                    {feature.value}
                </h3>
                <p className="mt-3 max-w-lg text-sm leading-6 text-zinc-600">
                    {feature.description}
                </p>
                <div
                    className={
                        "mt-6 flex items-center gap-2 text-sm font-medium " +
                        "text-zinc-700 transition-colors " +
                        "group-hover:text-primary"
                    }
                >
                    Connected to the same inventory history
                    <ArrowRight className="size-4" />
                </div>
            </div>
        </article>
    );
}

function SectionHeading({
    description,
    eyebrow,
    title,
}: {
    description: string;
    eyebrow: string;
    title: string;
}) {
    return (
        <div
            className={
                "grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] " +
                "lg:items-end"
            }
        >
            <div>
                <p
                    className={
                        "text-xs font-medium uppercase tracking-[0.16em] " +
                        "text-primary"
                    }
                >
                    {eyebrow}
                </p>
                <h2
                    className={
                        "mt-4 max-w-3xl text-3xl font-semibold " +
                        "tracking-[-0.045em] sm:text-5xl"
                    }
                >
                    {title}
                </h2>
            </div>
            <p className="text-sm leading-6 text-zinc-600 sm:text-base">
                {description}
            </p>
        </div>
    );
}

function OfflineFeature() {
    const steps = [
        {
            icon: WifiOff,
            label: "Connection unavailable",
            state: "Offline",
        },
        {
            icon: Boxes,
            label: "Eligible changes stored on device",
            state: "Queued",
        },
        {
            icon: CloudCheck,
            label: "Changes sent after reconnecting",
            state: "Synced",
        },
    ];

    return (
        <section
            className="scroll-mt-24 bg-zinc-50 px-4 py-24 sm:px-6"
            id="offline"
        >
            <div
                className={
                    "mx-auto grid max-w-6xl overflow-hidden rounded-2xl " +
                    "bg-zinc-950 text-white lg:grid-cols-2"
                }
            >
                <div className="p-6 sm:p-10 lg:p-14">
                    <span
                        className={
                            "inline-flex items-center gap-2 rounded-full " +
                            "bg-primary px-3 py-1.5 text-xs font-medium " +
                            "text-primary-foreground"
                        }
                    >
                        <WifiOff className="size-3.5" />
                        Works offline
                    </span>
                    <h2
                        className={
                            "mt-7 max-w-lg text-3xl font-semibold " +
                            "tracking-[-0.045em] sm:text-5xl"
                        }
                    >
                        Keep working when your connection does not.
                    </h2>
                    <p
                        className={
                            "mt-5 max-w-lg text-sm leading-6 text-zinc-400 " +
                            "sm:text-base"
                        }
                    >
                        Record sales, create purchase drafts, and capture
                        inventory counts or adjustments without a stable
                        connection. Supported changes synchronize when you
                        are online again.
                    </p>
                    <p className="mt-8 text-xs font-medium text-zinc-500">
                        Included with Pro and Business
                    </p>
                </div>
                <div
                    className={
                        "relative flex min-h-[430px] items-center " +
                        "bg-primary/15 p-6 sm:p-10"
                    }
                >
                    <div
                        aria-hidden="true"
                        className={
                            "absolute right-0 top-0 size-72 rounded-full " +
                            "bg-primary/30 blur-3xl"
                        }
                    />
                    <div
                        className={
                            "relative w-full rounded-2xl border " +
                            "border-white/10 bg-zinc-900 p-5 shadow-2xl"
                        }
                    >
                        <div
                            className={
                                "flex items-center justify-between border-b " +
                                "border-white/10 pb-5"
                            }
                        >
                            <div>
                                <p className="text-xs text-zinc-500">
                                    Automatic offline sync
                                </p>
                                <p className="mt-1 font-medium">
                                    Three changes waiting
                                </p>
                            </div>
                            <span
                                className={
                                    "size-2 rounded-full bg-amber-400 " +
                                    "shadow-[0_0_16px_rgba(251,191,36,0.8)]"
                                }
                            />
                        </div>
                        <div className="divide-y divide-white/10">
                            {steps.map((step) => (
                                <OfflineStep key={step.state} {...step} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function OfflineStep({
    icon: Icon,
    label,
    state,
}: {
    icon: LucideIcon;
    label: string;
    state: string;
}) {
    return (
        <div className="flex items-center gap-4 py-4">
            <span
                className={
                    "flex size-9 shrink-0 items-center justify-center " +
                    "rounded-2xl bg-white/5 text-primary"
                }
            >
                <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{state}</p>
                <p className="mt-1 text-xs text-zinc-500">{label}</p>
            </div>
            <Check className="size-4 text-primary" />
        </div>
    );
}

function Intelligence() {
    return (
        <section
            className="scroll-mt-24 bg-white px-4 py-24 sm:px-6"
            id="intelligence"
        >
            <div className="mx-auto max-w-6xl">
                <div
                    className={
                        "overflow-hidden rounded-2xl bg-zinc-950 " +
                        "px-5 pb-5 pt-14 text-white sm:px-10 sm:pb-10 " +
                        "sm:pt-20"
                    }
                >
                    <div className="mx-auto max-w-3xl text-center">
                        <span
                            className={
                                "inline-flex items-center gap-2 rounded-full " +
                                "bg-primary px-3 py-1.5 text-xs font-medium " +
                                "text-primary-foreground"
                            }
                        >
                            <Sparkles className="size-3.5" />
                            Practical intelligence
                        </span>
                        <h2
                            className={
                                "mt-7 text-3xl font-semibold " +
                                "tracking-[-0.045em] sm:text-5xl"
                            }
                        >
                            Clear explanations, grounded in your operations.
                        </h2>
                        <p
                            className={
                                "mx-auto mt-5 max-w-2xl text-sm leading-6 " +
                                "text-zinc-400 sm:text-base"
                            }
                        >
                            StockWise calculates the business facts first.
                            AI explains what changed, why it matters, and
                            what you can do next.
                        </p>
                    </div>
                    <IntelligenceScreenshot />
                    <div
                        className={
                            "mt-8 grid gap-px overflow-hidden rounded-2xl " +
                            "bg-white/10 sm:grid-cols-3"
                        }
                    >
                        <TrustPoint
                            icon={ClipboardCheck}
                            title="Calculated facts first"
                        >
                            Transactions and balances remain the source of
                            every number.
                        </TrustPoint>
                        <TrustPoint
                            icon={Bot}
                            title="AI explains the result"
                        >
                            AI communicates the result without changing the
                            underlying totals.
                        </TrustPoint>
                        <TrustPoint
                            icon={Store}
                            title="Scoped to each business"
                        >
                            Inventory, people, usage, and plans remain
                            separate per business.
                        </TrustPoint>
                    </div>
                </div>

                <div className="mt-20">
                    <SectionHeading
                        eyebrow="From signal to decision"
                        title="See the facts. Understand what they mean."
                        description={
                            "Concrete explanations make the intelligence " +
                            "useful without asking an owner to interpret " +
                            "technical formulas."
                        }
                    />
                    <div className="mt-12 grid gap-4 lg:grid-cols-2">
                        <DecisionExample />
                        <ReportSummaryExample />
                    </div>
                </div>

                <div className="mt-20">
                    <div
                        className={
                            "flex flex-col gap-3 sm:flex-row " +
                            "sm:items-end sm:justify-between"
                        }
                    >
                        <div>
                            <p className="text-xs font-medium text-primary">
                                Four focused workflows
                            </p>
                            <h3
                                className={
                                    "mt-2 text-2xl font-semibold " +
                                    "tracking-tight"
                                }
                            >
                                Intelligence with a clear purpose.
                            </h3>
                        </div>
                        <p className="text-sm text-zinc-500">
                            Included in every plan · Usage limits apply
                        </p>
                    </div>
                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                        {intelligenceFeatures.map((feature, index) => (
                            <AiFeature
                                index={index + 1}
                                key={feature.label}
                                {...feature}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function IntelligenceScreenshot() {
    return (
        <figure className="mx-auto mt-14 max-w-5xl">
            <div
                className={
                    "overflow-hidden rounded-2xl border border-white/15 " +
                    "bg-white p-1 shadow-2xl shadow-black/40"
                }
            >
                <Image
                    alt={
                        "StockWise inventory intelligence showing a daily " +
                        "briefing, forecast, reorder assistant, and alerts"
                    }
                    className="h-auto w-full rounded-2xl"
                    height={1079}
                    src="/marketing/inventory-intelligence.png"
                    unoptimized
                    width={1919}
                />
            </div>
            <figcaption className="mt-4 text-center text-xs text-zinc-500">
                Actual StockWise inventory intelligence · Demo data
            </figcaption>
        </figure>
    );
}

function TrustPoint({
    children,
    icon: Icon,
    title,
}: {
    children: React.ReactNode;
    icon: LucideIcon;
    title: string;
}) {
    return (
        <article className="bg-zinc-900 p-5 sm:p-6">
            <Icon className="size-5 text-primary" />
            <h3 className="mt-8 text-sm font-medium">{title}</h3>
            <p className="mt-2 text-xs leading-5 text-zinc-500">
                {children}
            </p>
        </article>
    );
}

function DecisionExample() {
    return (
        <article
            className={
                "rounded-2xl border border-zinc-200 bg-zinc-50 p-5 " +
                "sm:p-7"
            }
        >
            <div className="flex items-center gap-3">
                <span
                    className={
                        "flex size-10 items-center justify-center " +
                        "rounded-2xl bg-primary/10 text-primary"
                    }
                >
                    <Boxes className="size-5" />
                </span>
                <div>
                    <p className="text-xs text-zinc-500">StockWise detects</p>
                    <h3 className="font-semibold">A reorder risk</h3>
                </div>
            </div>
            <dl className="mt-6 divide-y divide-zinc-200 border-y">
                <MetricRow label="Product" value="Wireless Earbuds" />
                <MetricRow label="Available" value="18 units" />
                <MetricRow label="Lead-time demand" value="14.2 units" />
                <MetricRow label="Incoming" value="0 units" />
            </dl>
            <div className="my-5 flex items-center gap-3 text-primary">
                <span className="h-px flex-1 bg-primary/20" />
                <ArrowRight className="size-4" />
                <span className="h-px flex-1 bg-primary/20" />
            </div>
            <div className="rounded-2xl bg-zinc-950 p-5 text-white">
                <div className="flex items-center gap-2 text-primary">
                    <Sparkles className="size-4" />
                    <p className="text-xs font-medium">StockWise explains</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-300">
                    Demand may use most available stock before the next
                    supplier delivery. Ordering 7 units now restores your
                    safety buffer.
                </p>
            </div>
        </article>
    );
}

function ReportSummaryExample() {
    return (
        <article
            className={
                "rounded-2xl border border-zinc-200 bg-zinc-50 p-5 " +
                "sm:p-7"
            }
        >
            <div className="flex items-center gap-3">
                <span
                    className={
                        "flex size-10 items-center justify-center " +
                        "rounded-2xl bg-primary/10 text-primary"
                    }
                >
                    <FileText className="size-5" />
                </span>
                <div>
                    <p className="text-xs text-zinc-500">
                        On-demand explanation
                    </p>
                    <h3 className="font-semibold">Sales report summary</h3>
                </div>
            </div>
            <p className="mt-6 text-xs text-zinc-500">
                September 1–30 · Example
            </p>
            <dl className="mt-3 grid grid-cols-3 border-y border-zinc-200">
                <SummaryMetric label="Revenue" value="₱184,200" />
                <SummaryMetric label="Sales" value="428" />
                <SummaryMetric label="Average" value="₱430" />
            </dl>
            <div
                className={
                    "mt-5 rounded-2xl border border-primary/20 " +
                    "bg-primary/10 p-5"
                }
            >
                <div className="flex items-center gap-2 text-primary">
                    <Sparkles className="size-4" />
                    <p className="text-xs font-medium">AI summary</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-700">
                    Revenue increased 12% from the previous period, led by
                    Wireless Earbuds. Returns remained low relative to total
                    sales.
                </p>
            </div>
        </article>
    );
}

function MetricRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex justify-between gap-4 py-3 text-sm">
            <dt className="text-zinc-500">{label}</dt>
            <dd className="text-right font-medium">{value}</dd>
        </div>
    );
}

function SummaryMetric({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div
            className={
                "border-r px-2 py-4 last:border-r-0 " +
                "sm:px-3"
            }
        >
            <dt className="text-xs text-zinc-500">{label}</dt>
            <dd className="mt-1 text-sm font-medium tabular-nums">
                {value}
            </dd>
        </div>
    );
}

function AiFeature({
    description,
    index,
    label,
    question,
}: {
    description: string;
    index: number;
    label: string;
    question: string;
}) {
    return (
        <article
            className={
                "group rounded-2xl border border-zinc-200 bg-white p-6 " +
                "transition-all duration-300 hover:-translate-y-1 " +
                "hover:border-primary/30 hover:shadow-xl " +
                "hover:shadow-zinc-950/5"
            }
        >
            <div className="flex items-center justify-between">
                <span
                    className={
                        "flex size-8 items-center justify-center " +
                        "rounded-full bg-zinc-100 text-xs text-zinc-500"
                    }
                >
                    0{index}
                </span>
                <Sparkles className="size-4 text-primary" />
            </div>
            <p className="mt-10 text-xs font-medium text-primary">
                {question}
            </p>
            <h4 className="mt-2 text-lg font-semibold">{label}</h4>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
                {description}
            </p>
        </article>
    );
}

function AiActionLimits() {
    return (
        <section className="bg-white px-4 pb-24 sm:px-6">
            <div
                className={
                    "mx-auto overflow-hidden rounded-2xl bg-primary " +
                    "text-primary-foreground"
                }
            >
                <div
                    className={
                        "mx-auto grid max-w-6xl gap-6 px-6 py-10 " +
                        "lg:grid-cols-[1fr_1.5fr] lg:items-center lg:px-10"
                    }
                >
                    <div>
                        <p className="text-sm font-semibold">
                            AI actions in every plan
                        </p>
                        <p
                            className={
                                "mt-2 max-w-lg text-sm leading-6 " +
                                "text-primary-foreground/75"
                            }
                        >
                            Use actions for on-demand explanations,
                            regenerated briefings, and report summaries.
                        </p>
                    </div>
                    <div
                        className={
                            "grid overflow-hidden rounded-2xl border " +
                            "border-white/20 sm:grid-cols-3"
                        }
                    >
                        <ActionLimit plan="Free" value="5 / week" />
                        <ActionLimit plan="Pro" value="30 / week" />
                        <ActionLimit plan="Business" value="150 / week" />
                    </div>
                </div>
            </div>
        </section>
    );
}

function ActionLimit({
    plan,
    value,
}: {
    plan: string;
    value: string;
}) {
    return (
        <div
            className={
                "border-b border-white/20 p-5 last:border-b-0 " +
                "sm:border-b-0 sm:border-r sm:last:border-r-0"
            }
        >
            <p className="text-xs text-primary-foreground/70">{plan}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
            <p className="mt-1 text-xs text-primary-foreground/70">
                AI actions
            </p>
        </div>
    );
}

function Pricing() {
    return (
        <section
            className="scroll-mt-24 bg-zinc-50 px-4 py-24 sm:px-6"
            id="pricing"
        >
            <div className="mx-auto max-w-6xl">
                <div className="mx-auto max-w-3xl text-center">
                    <p
                        className={
                            "text-xs font-medium uppercase " +
                            "tracking-[0.16em] text-primary"
                        }
                    >
                        Simple pricing
                    </p>
                    <h2
                        className={
                            "mt-4 text-3xl font-semibold " +
                            "tracking-[-0.045em] sm:text-5xl"
                        }
                    >
                        Start small. Add capacity as you grow.
                    </h2>
                    <p
                        className={
                            "mx-auto mt-5 max-w-2xl text-sm leading-6 " +
                            "text-zinc-600 sm:text-base"
                        }
                    >
                        Every plan includes core inventory operations,
                        reporting, and focused AI workflows.
                    </p>
                </div>
                <div className="mt-14 grid gap-4 lg:grid-cols-3">
                    {plans.map((plan) => (
                        <PricingCard key={plan.name} {...plan} />
                    ))}
                </div>
                <p className="mt-6 text-center text-xs text-zinc-500">
                    Eligible accounts receive a 14-day Pro trial. Pro
                    supports up to 10 members with optional add-on seats.
                </p>
            </div>
        </section>
    );
}

function PricingCard({
    description,
    features,
    name,
    popular = false,
    price,
    suffix,
}: {
    description: string;
    features: string[];
    name: string;
    popular?: boolean;
    price: string;
    suffix: string;
}) {
    return (
        <article
            className={cn(
                "relative flex rounded-2xl border bg-white p-6",
                "flex-col transition-all duration-300 hover:-translate-y-1",
                "hover:shadow-xl hover:shadow-zinc-950/5",
                popular
                    ? "border-primary shadow-lg shadow-primary/10"
                    : "border-zinc-200",
            )}
        >
            {popular ? (
                <span
                    className={
                        "absolute right-5 top-5 rounded-full bg-primary " +
                        "px-3 py-1 text-xs font-medium text-primary-foreground"
                    }
                >
                    Most popular
                </span>
            ) : null}
            <p className="text-sm font-semibold">{name}</p>
            <p className="mt-7 text-4xl font-semibold tracking-tight">
                {price}
                <span
                    className={
                        "ml-2 text-xs font-normal tracking-normal " +
                        "text-zinc-500"
                    }
                >
                    {suffix}
                </span>
            </p>
            <p className="mt-5 min-h-12 text-sm leading-6 text-zinc-600">
                {description}
            </p>
            <ul className="mt-7 flex-1 space-y-3 border-t pt-6">
                {features.map((feature) => (
                    <li className="flex gap-2.5 text-sm" key={feature}>
                        <Check className="mt-0.5 size-4 text-primary" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            <Link
                className={cn(
                    buttonVariants({
                        size: "lg",
                        variant: popular ? "default" : "outline",
                    }),
                    "mt-8 w-full rounded-2xl",
                    popular &&
                        "bg-primary text-primary-foreground " +
                            "hover:bg-primary/90",
                )}
                href="/signup"
            >
                Start with {name}
            </Link>
        </article>
    );
}

function Faq() {
    return (
        <section className="bg-white px-4 py-24 sm:px-6">
            <div className="mx-auto max-w-4xl">
                <div className="text-center">
                    <p
                        className={
                            "text-xs font-medium uppercase " +
                            "tracking-[0.16em] text-primary"
                        }
                    >
                        Frequently asked questions
                    </p>
                    <h2
                        className={
                            "mt-4 text-3xl font-semibold " +
                            "tracking-[-0.045em] sm:text-5xl"
                        }
                    >
                        Questions before you begin?
                    </h2>
                </div>
                <div className="mt-12 space-y-3">
                    {questions.map((item) => (
                        <details
                            className={
                                "group rounded-2xl border border-zinc-200 " +
                                "bg-zinc-50 px-5 open:bg-white"
                            }
                            key={item.question}
                        >
                            <summary
                                className={
                                    "flex cursor-pointer list-none " +
                                    "items-center gap-4 py-5 text-sm " +
                                    "font-medium marker:content-none"
                                }
                            >
                                <span className="flex-1">{item.question}</span>
                                <ChevronRight
                                    className={
                                        "size-4 text-zinc-500 transition " +
                                        "group-open:rotate-90"
                                    }
                                />
                            </summary>
                            <p
                                className={
                                    "max-w-2xl pb-5 pr-8 text-sm " +
                                    "leading-6 text-zinc-600"
                                }
                            >
                                {item.answer}
                            </p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}

function FinalCallToAction() {
    return (
        <section className="bg-white px-4 pb-8 sm:px-6">
            <div
                className={
                    "relative mx-auto max-w-6xl overflow-hidden " +
                    "rounded-2xl bg-zinc-950 px-6 py-20 text-center " +
                    "text-white sm:px-10 sm:py-24"
                }
            >
                <div
                    aria-hidden="true"
                    className={
                        "absolute left-1/2 top-1/2 size-96 " +
                        "-translate-x-1/2 -translate-y-1/2 rounded-full " +
                        "bg-primary/40 blur-3xl"
                    }
                />
                <div className="relative">
                    <p className="text-xs font-medium text-primary">
                        Start with a clearer system
                    </p>
                    <h2
                        className={
                            "mx-auto mt-4 max-w-3xl text-4xl font-semibold " +
                            "tracking-[-0.05em] sm:text-6xl"
                        }
                    >
                        Know what is happening. Know what to do next.
                    </h2>
                    <p className="mt-5 text-sm text-zinc-400 sm:text-base">
                        Start free. No card required. Your Pro trial is
                        included.
                    </p>
                    <Link
                        className={cn(
                            buttonVariants({ size: "lg" }),
                            "mt-8 rounded-2xl bg-primary px-6",
                            "text-primary-foreground hover:bg-primary/90",
                        )}
                        href="/signup"
                    >
                        Create your account
                        <ArrowRight className="size-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

function MarketingFooter() {
    return (
        <footer className="bg-white px-4 pb-8 sm:px-6">
            <div
                className={
                    "mx-auto grid max-w-6xl gap-10 border-t " +
                    "border-zinc-200 py-10 md:grid-cols-[1fr_auto]"
                }
            >
                <div>
                    <Brand />
                    <p
                        className={
                            "mt-4 max-w-md text-sm leading-6 text-zinc-500"
                        }
                    >
                        Inventory, sales, purchasing, reports, and practical
                        intelligence for small businesses.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
                    <FooterColumn
                        links={[
                            ["Features", "#features"],
                            ["Offline", "#offline"],
                            ["Intelligence", "#intelligence"],
                        ]}
                        title="Product"
                    />
                    <FooterColumn
                        links={[
                            ["Pricing", "#pricing"],
                            ["Sign in", "/login"],
                            ["Create account", "/signup"],
                        ]}
                        title="Account"
                    />
                    <div>
                        <p className="text-xs font-semibold text-zinc-700">
                            Plans
                        </p>
                        <p className="mt-4 text-xs text-zinc-500">Free</p>
                        <p className="mt-3 text-xs text-zinc-500">
                            Pro · ₱299
                        </p>
                        <p className="mt-3 text-xs text-zinc-500">
                            Business · ₱899
                        </p>
                    </div>
                </div>
                <p
                    className={
                        "border-t border-zinc-200 pt-6 text-xs " +
                        "text-zinc-500 md:col-span-2"
                    }
                >
                    © 2026 StockWise. Built for practical inventory decisions.
                </p>
            </div>
        </footer>
    );
}

function FooterColumn({
    links,
    title,
}: {
    links: [string, string][];
    title: string;
}) {
    return (
        <div>
            <p className="text-xs font-semibold text-zinc-700">{title}</p>
            <div className="mt-4 space-y-3">
                {links.map(([label, href]) => (
                    <Link
                        className={
                            "block text-xs text-zinc-500 transition-colors " +
                            "hover:text-primary"
                        }
                        href={href}
                        key={label}
                    >
                        {label}
                    </Link>
                ))}
            </div>
        </div>
    );
}
