import Link from "next/link";
import {
    ArrowRight,
    ClipboardCheck,
    PackagePlus,
    ShoppingBag,
} from "lucide-react";

import { OfflinePreview } from "./offline-preview";
import { WorkflowScrollReveal } from "./workflow-scroll-reveal";

const supportedWork = [
    {
        icon: ShoppingBag,
        label: "Record sales",
    },
    {
        icon: PackagePlus,
        label: "Prepare purchase drafts",
    },
    {
        icon: ClipboardCheck,
        label: "Adjust and count stock",
    },
];

export function OfflineSection() {
    return (
        <section
            aria-labelledby="offline-heading"
            className={
                "scroll-mt-24 border-t border-[#dcebee] bg-[#f1f7f8] " +
                "px-4 py-16 text-[#203039] sm:px-6 lg:py-20"
            }
            id="offline"
        >
            <WorkflowScrollReveal>
                <div
                    className={
                        "grid min-w-0 items-center gap-10 " +
                        "lg:grid-cols-[0.88fr_1.12fr] lg:gap-14"
                    }
                >
                    <div className="min-w-0" data-workflow-reveal>
                        <div
                            className={
                                "inline-flex items-center gap-2 rounded-full " +
                                "border border-[#c9dfe3] bg-white " +
                                "px-3 py-1.5 " +
                                "text-xs font-semibold text-[#376674]"
                            }
                        >
                            Pro and Business
                        </div>
                        <p
                            className={
                                "mt-6 text-xs font-semibold uppercase " +
                                "tracking-[0.18em] text-[#245564]"
                            }
                        >
                            Offline operations
                        </p>
                        <h2
                            className={
                                "mt-5 max-w-2xl text-4xl font-semibold " +
                                "leading-[0.98] tracking-[-0.055em] " +
                                "sm:text-5xl"
                            }
                            id="offline-heading"
                        >
                            The connection can pause.
                            <span className="block text-[#376674]">
                                The work does not have to.
                            </span>
                        </h2>
                        <p
                            className={
                                "mt-5 max-w-xl text-sm leading-7 " +
                                "text-[#5e6d75] sm:text-base"
                            }
                        >
                            After reference data is saved on the device,
                            selected day-to-day operations can continue during
                            an outage. KitaStock queues each change and
                            synchronizes it when the connection returns.
                        </p>

                        <ul className="mt-6 space-y-3">
                            {supportedWork.map((item, index) => {
                                const Icon = item.icon;

                                return (
                                    <li
                                        className={
                                            "flex items-center gap-3 text-sm " +
                                            "font-medium text-[#33464f]"
                                        }
                                        data-workflow-order={index}
                                        data-workflow-reveal
                                        key={item.label}
                                    >
                                        <span
                                            className={
                                                "grid size-8 shrink-0 " +
                                                "place-items-center " +
                                                "rounded-xl bg-white " +
                                                "text-[#376674] shadow-sm"
                                            }
                                        >
                                            <Icon
                                                aria-hidden="true"
                                                className="size-4"
                                            />
                                        </span>
                                        {item.label}
                                    </li>
                                );
                            })}
                        </ul>

                        <Link
                            className={
                                "group mt-6 inline-flex min-h-11 " +
                                "items-center " +
                                "gap-2 rounded-2xl text-sm font-semibold " +
                                "text-[#245564] focus-visible:outline-2 " +
                                "focus-visible:outline-offset-4"
                            }
                            href="/signup"
                        >
                            Start your Pro trial
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
                        className="min-w-0 lg:pt-2"
                        data-workflow-order="1"
                        data-workflow-reveal
                    >
                        <OfflinePreview />
                        <p
                            className={
                                "mt-4 text-center text-xs leading-5 " +
                                "text-[#718087]"
                            }
                        >
                            Changes are validated during synchronization.
                            Conflicts remain visible for review.
                        </p>
                    </div>
                </div>
            </WorkflowScrollReveal>
        </section>
    );
}
