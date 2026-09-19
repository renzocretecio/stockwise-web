import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AttentionPreview } from "./attention-preview";
import { WorkflowScrollReveal } from "./workflow-scroll-reveal";

const benefits = [
    {
        title: "Urgent issues appear first.",
        description:
            "Out-of-stock and low-stock products are separated so the " +
            "owner knows what needs action now.",
    },
    {
        title: "Reorder pressure stays visible.",
        description:
            "The overview shows how many products are below their " +
            "configured reorder points.",
    },
    {
        title: "Stock coverage adds context.",
        description:
            "Products with less than seven days of stock link the current " +
            "inventory snapshot to demand forecasting.",
    },
];

export function AttentionSection() {
    return (
        <section
            aria-labelledby="attention-heading"
            className={
                "scroll-mt-24 border-t border-border bg-card " +
                "px-4 py-16 text-foreground sm:px-6 lg:py-20"
            }
            id="attention"
        >
            <WorkflowScrollReveal>
                <div
                    className={
                        "grid min-w-0 items-start gap-10 " +
                        "lg:grid-cols-[0.9fr_1.1fr] lg:gap-14"
                    }
                >
                    <div className="min-w-0">
                        <div data-workflow-reveal>
                            <p
                                className={
                                    "text-xs font-semibold uppercase " +
                                    "tracking-[0.18em] text-accent-foreground"
                                }
                            >
                                Know what needs attention
                            </p>
                            <h2
                                className={
                                    "mt-5 max-w-xl text-4xl font-semibold " +
                                    "leading-[0.98] tracking-[-0.055em] " +
                                    "sm:text-5xl"
                                }
                                id="attention-heading"
                            >
                                A busy store.
                                <span className="block text-accent-foreground">
                                    A clear place to start.
                                </span>
                            </h2>
                            <p
                                className={
                                    "mt-5 max-w-lg text-sm leading-7 " +
                                    "text-muted-foreground sm:text-base"
                                }
                            >
                                The overview orders four stock signals by
                                urgency, giving the owner a short list to
                                review before moving into detailed reports.
                            </p>
                        </div>

                        <div
                            className={
                                "mt-8 divide-y divide-border " +
                                "border-y border-border"
                            }
                        >
                            {benefits.map((benefit, index) => (
                                <div className="py-4" key={benefit.title}>
                                    <div
                                        data-workflow-order={index}
                                        data-workflow-reveal
                                    >
                                        <h3 className="text-sm font-semibold">
                                            {benefit.title}
                                        </h3>
                                        <p
                                            className={
                                                "mt-1.5 max-w-md text-sm " +
                                                "leading-6 text-muted-foreground"
                                            }
                                        >
                                            {benefit.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Link
                            className={
                                "group mt-6 inline-flex min-h-11 " +
                                "items-center gap-2 rounded-2xl text-sm " +
                                "font-semibold text-accent-foreground " +
                                "focus-visible:outline-2 " +
                                "focus-visible:outline-offset-4"
                            }
                            href="/signup"
                        >
                            Get a clearer view of your stock
                            <ArrowRight
                                aria-hidden="true"
                                className={
                                    "size-4 transition-transform " +
                                    "motion-safe:group-hover:translate-x-1 " +
                                    "motion-reduce:transition-none"
                                }
                            />
                        </Link>
                    </div>

                    <div className="min-w-0 lg:pt-1">
                        <AttentionPreview />
                    </div>
                </div>
            </WorkflowScrollReveal>
        </section>
    );
}
