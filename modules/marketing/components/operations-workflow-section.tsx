import Link from "next/link";
import {
    ArrowRight,
    BarChart3,
    ClipboardList,
    PackageCheck,
    ShoppingCart,
    Undo2,
    type LucideIcon,
} from "lucide-react";

import { WorkflowScrollReveal } from "./workflow-scroll-reveal";

const workflowSteps: Array<{
    description: string;
    icon: LucideIcon;
    label: string;
    number: string;
}> = [
    {
        description:
            "Create an order for one supplier and keep expected stock " +
            "separate from available stock.",
        icon: ClipboardList,
        label: "Purchase",
        number: "01",
    },
    {
        description:
            "Record only what arrived. Partial deliveries remain visible " +
            "until the order is complete.",
        icon: PackageCheck,
        label: "Receive",
        number: "02",
    },
    {
        description:
            "Completed sales reduce stock, while valid returns restore only " +
            "the quantity received back.",
        icon: ShoppingCart,
        label: "Sell and return",
        number: "03",
    },
    {
        description:
            "Sales, profit, purchasing, and inventory reports use the same " +
            "transaction history.",
        icon: BarChart3,
        label: "Review",
        number: "04",
    },
];

const outcomes = [
    "Stock balances update from recorded transactions",
    "Movements preserve who changed what and when",
    "Reports trace back to the same inventory history",
];

export function OperationsWorkflowSection() {
    return (
        <section
            className={
                "border-t border-[#e2edf0] bg-[#f8fbfc] px-4 py-16 " +
                "text-[#203039] sm:px-6 lg:py-20"
            }
            id="features"
        >
            <WorkflowScrollReveal>
                <div
                    className={
                        "grid gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-end"
                    }
                >
                    <div data-workflow-reveal>
                        <p
                            className={
                                "text-xs font-semibold uppercase " +
                                "tracking-[0.18em] text-[#245564]"
                            }
                        >
                            One connected workflow
                        </p>
                        <h2
                            className={
                                "mt-5 max-w-4xl text-4xl font-semibold " +
                                "leading-[0.98] tracking-[-0.055em] " +
                                "sm:text-5xl"
                            }
                        >
                            Every stock change follows one clear path.
                        </h2>
                    </div>
                    <div
                        className="lg:pb-1"
                        data-workflow-order="1"
                        data-workflow-reveal
                    >
                        <p
                            className={
                                "max-w-xl text-sm leading-6 text-[#5e6d75] " +
                                "sm:text-base sm:leading-7"
                            }
                        >
                            KitaStock connects purchasing, receiving, sales,
                            returns, and reports so owners do not have to
                            reconcile separate records.
                        </p>
                        <Link
                            className={
                                "group mt-5 inline-flex items-center gap-2 " +
                                "rounded-2xl text-sm font-semibold " +
                                "text-[#245564] focus-visible:outline-2 " +
                                "focus-visible:outline-offset-4"
                            }
                            href="/signup"
                        >
                            Start with your first product
                            <ArrowRight
                                className={
                                    "size-4 transition-transform " +
                                    "motion-safe:group-hover:translate-x-1 " +
                                    "motion-reduce:transition-none"
                                }
                            />
                        </Link>
                    </div>
                </div>

                <div
                    className={
                        "mt-10 overflow-hidden rounded-2xl border " +
                        "border-[#dcebee] bg-white lg:mt-12"
                    }
                >
                    <div className="grid md:grid-cols-2 xl:grid-cols-4">
                        {workflowSteps.map((step, index) => (
                            <WorkflowStep
                                index={index}
                                isLast={index === workflowSteps.length - 1}
                                key={step.number}
                                step={step}
                            />
                        ))}
                    </div>

                    <div
                        className={
                            "grid border-t border-[#dcebee] bg-[#f5fafb] " +
                            "md:grid-cols-3"
                        }
                    >
                        {outcomes.map((outcome, index) => (
                            <div
                                className={
                                    "flex items-start gap-3 border-b " +
                                    "border-[#dcebee] px-5 py-4 " +
                                    "last:border-b-0 md:border-b-0 " +
                                    "md:border-r md:last:border-r-0 lg:px-7"
                                }
                                key={outcome}
                            >
                                <span
                                    className={
                                        "mt-0.5 flex size-6 shrink-0 " +
                                        "items-center justify-center " +
                                        "rounded-full bg-[#e7f2f5] " +
                                        "text-[#376674]"
                                    }
                                >
                                    <Undo2
                                        className="size-3.5 rotate-180"
                                    />
                                </span>
                                <p
                                    className={
                                        "text-sm leading-5 text-[#43545c]"
                                    }
                                    data-workflow-order={index}
                                    data-workflow-reveal
                                >
                                    {outcome}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </WorkflowScrollReveal>
        </section>
    );
}

function WorkflowStep({
    index,
    isLast,
    step,
}: {
    index: number;
    isLast: boolean;
    step: (typeof workflowSteps)[number];
}) {
    const Icon = step.icon;

    return (
        <article
            className={
                "group relative min-h-60 border-b border-[#dcebee] " +
                "p-5 md:odd:border-r xl:border-b-0 xl:border-r " +
                "xl:last:border-r-0 lg:p-6 transition-colors " +
                "duration-300 hover:bg-[#f2f8fa] " +
                "motion-reduce:transition-none"
            }
        >
            <span
                aria-hidden="true"
                className={
                    "absolute inset-x-0 top-0 h-0.5 origin-left " +
                    "bg-[#c6e0e6]"
                }
            />
            <div className="flex items-center justify-between">
                <span
                    className={
                        "font-mono text-xs font-medium text-[#819198]"
                    }
                >
                    {step.number}
                </span>
                <span
                    className={
                        "flex size-10 items-center justify-center " +
                        "rounded-2xl border border-[#dcebee] " +
                        "bg-[#eff7f9] text-[#376674] " +
                        "transition-colors duration-300 " +
                        "group-hover:bg-[#deedf1] " +
                        "motion-reduce:transition-none"
                    }
                >
                    <Icon className="size-4.5" />
                </span>
            </div>

            <div
                className="mt-12"
                data-workflow-order={index}
                data-workflow-reveal
            >
                <h3 className="text-xl font-semibold tracking-[-0.025em]">
                    {step.label}
                </h3>
                <p
                    className={
                        "mt-3 max-w-xs text-sm leading-6 text-[#5e6d75]"
                    }
                >
                    {step.description}
                </p>
            </div>

            {!isLast ? (
                <span
                    aria-hidden="true"
                    className={
                        "absolute -right-3 top-1/2 z-10 hidden size-6 " +
                        "-translate-y-1/2 items-center justify-center " +
                        "rounded-full border border-[#dcebee] " +
                        "bg-[#eff7f9] text-[#376674] xl:flex"
                    }
                >
                    <ArrowRight className="size-3" />
                </span>
            ) : null}
        </article>
    );
}
