import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

import { WorkflowScrollReveal } from "./workflow-scroll-reveal";

const questions = [
    {
        answer:
            "No. KitaStock calculates sales, stock levels, forecasts, and " +
            "reorder quantities from recorded business data. AI receives " +
            "compact results and explains them in plain language.",
        question: "Does AI calculate my inventory numbers?",
    },
    {
        answer:
            "Yes. Daily briefings, demand forecasts, reorder guidance, " +
            "anomaly explanations, and report summaries are available on " +
            "every plan. Free includes 5 AI actions each week.",
        question: "Are the intelligence tools included on Free?",
    },
    {
        answer:
            "Offline changes and automatic sync are included in Pro and " +
            "Business. After reference data is saved on the device, you can " +
            "queue sales, purchase drafts, stock adjustments, and physical " +
            "counts until the connection returns.",
        question: "What can I do without an internet connection?",
    },
    {
        answer:
            "The business returns to Free limits unless Pro is activated. " +
            "Your records remain safe, but paid capabilities stop and team " +
            "members beyond the Free limit lose workspace access.",
        question: "What happens after the Pro trial ends?",
    },
    {
        answer:
            "Yes. Each business keeps its own products, members, settings, " +
            "usage, and subscription. One account can belong to multiple " +
            "businesses with different plans.",
        question: "Does each business have its own subscription?",
    },
    {
        answer:
            "For now, upgrades use a reviewed request. You choose a plan, " +
            "receive payment instructions, submit the payment reference, " +
            "and the plan becomes active after confirmation.",
        question: "How do paid upgrades work today?",
    },
];

export function FaqSection() {
    return (
        <section
            aria-labelledby="faq-heading"
            className={
                "scroll-mt-24 border-t border-border bg-secondary " +
                "px-4 py-16 text-foreground sm:px-6 lg:py-20"
            }
            id="faq"
        >
            <WorkflowScrollReveal>
                <div
                    className={
                        "grid min-w-0 items-start gap-10 " +
                        "lg:grid-cols-[0.72fr_1.28fr] lg:gap-14"
                    }
                >
                    <div
                        className="min-w-0 lg:sticky lg:top-28"
                        data-workflow-reveal
                    >
                        <p
                            className={
                                "text-xs font-semibold uppercase " +
                                "tracking-[0.18em] text-accent-foreground"
                            }
                        >
                            Questions, answered
                        </p>
                        <h2
                            className={
                                "mt-5 max-w-xl text-4xl font-semibold " +
                                "leading-[0.98] tracking-[-0.055em] " +
                                "sm:text-5xl"
                            }
                            id="faq-heading"
                        >
                            Know how it works before you begin.
                        </h2>
                        <p
                            className={
                                "mt-5 max-w-md text-sm leading-7 " +
                                "text-muted-foreground sm:text-base"
                            }
                        >
                            Clear limits, predictable billing, and no mystery
                            about where the recommendations come from.
                        </p>
                        <Link
                            className={
                                "group mt-6 inline-flex min-h-11 " +
                                "items-center " +
                                "gap-2 rounded-2xl text-sm font-semibold " +
                                "text-accent-foreground focus-visible:outline-2 " +
                                "focus-visible:outline-offset-4"
                            }
                            href="/signup"
                        >
                            Start your free account
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

                    <div
                        className={
                            "min-w-0 overflow-hidden rounded-2xl border " +
                            "border-border bg-card"
                        }
                    >
                        {questions.map((item, index) => (
                            <details
                                className={
                                    "group border-b border-border " +
                                    "last:border-b-0"
                                }
                                data-workflow-order={index}
                                data-workflow-reveal
                                key={item.question}
                            >
                                <summary
                                    className={
                                        "flex min-h-18 cursor-pointer " +
                                        "list-none items-center gap-5 px-5 " +
                                        "py-4 transition-colors " +
                                        "hover:bg-muted " +
                                        "focus-visible:outline-2 " +
                                        "focus-visible:outline-inset " +
                                        "focus-visible:outline-accent-foreground " +
                                        "motion-reduce:transition-none " +
                                        "[&::-webkit-details-marker]:hidden"
                                    }
                                >
                                    <span
                                        className={
                                            "hidden text-xs font-semibold " +
                                            "tabular-nums text-muted-foreground " +
                                            "sm:block"
                                        }
                                    >
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                    <span
                                        className={
                                            "min-w-0 flex-1 text-base " +
                                            "font-semibold leading-6"
                                        }
                                    >
                                        {item.question}
                                    </span>
                                    <span
                                        className={
                                            "grid size-8 shrink-0 " +
                                            "place-items-center rounded-full " +
                                            "bg-accent text-accent-foreground"
                                        }
                                    >
                                        <Plus
                                            aria-hidden="true"
                                            className={
                                                "size-4 transition-transform " +
                                                "duration-200 " +
                                                "group-open:rotate-45 " +
                                                "motion-reduce:transition-none"
                                            }
                                        />
                                    </span>
                                </summary>
                                <div
                                    className={
                                        "px-5 pb-5 sm:pl-[4.25rem] " +
                                        "sm:pr-20"
                                    }
                                >
                                    <p
                                        className={
                                            "max-w-2xl text-sm leading-7 " +
                                            "text-muted-foreground"
                                        }
                                    >
                                        {item.answer}
                                    </p>
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </WorkflowScrollReveal>
        </section>
    );
}
