import { ArrowUpRight } from "lucide-react";

const signals = [
    {
        action: "Restock now",
        barClassName: "bg-[#d85b62]",
        label: "Out of stock",
        markerClassName: "bg-[#d85b62] ring-[#d85b62]/15",
        severity: "Critical",
        severityClassName: "text-[#a43f45]",
        value: 1,
    },
    {
        action: "Review stock",
        barClassName: "bg-[#d99a35]",
        label: "Low stock",
        markerClassName: "bg-[#d99a35] ring-[#d99a35]/15",
        severity: "High",
        severityClassName: "text-[#996619]",
        value: 3,
    },
    {
        action: "Plan reorder",
        barClassName: "bg-[#376674]",
        label: "Below reorder point",
        markerClassName: "bg-[#376674] ring-[#376674]/15",
        severity: "Medium",
        severityClassName: "text-[#376674]",
        value: 4,
    },
    {
        action: "Review forecast",
        barClassName: "bg-[#91afb7]",
        label: "Under 7 days",
        markerClassName: "bg-[#91afb7] ring-[#91afb7]/15",
        severity: "Watch",
        severityClassName: "text-[#687c83]",
        value: 5,
    },
];

export function AttentionPreview() {
    const largestSignal = Math.max(
        1,
        ...signals.map((signal) => signal.value),
    );

    return (
        <aside
            className={
                "min-w-0 overflow-hidden rounded-2xl border " +
                "border-[#dcebee] bg-white shadow-xl shadow-[#245564]/5"
            }
        >
            <div
                className={
                    "flex items-start justify-between gap-4 border-b " +
                    "border-[#e2edf0] bg-[#f5fafb] px-5 py-5 sm:px-6"
                }
            >
                <div>
                    <p className="text-sm font-semibold">Needs attention</p>
                    <p className="mt-1 text-xs text-[#5e6d75]">
                        Current stock issues that may affect sales
                    </p>
                </div>
                <span
                    className={
                        "inline-flex shrink-0 items-center gap-1 pt-0.5 " +
                        "text-xs font-medium text-[#376674]"
                    }
                >
                    Review risks
                    <ArrowUpRight aria-hidden="true" className="size-3.5" />
                </span>
            </div>

            <ol
                aria-label="Sample stock risk ladder"
                className="space-y-1 px-4 py-5 sm:px-5"
            >
                {signals.map((signal, index) => (
                    <li
                        className={
                            "grid grid-cols-[4rem_1rem_minmax(0,1fr)] " +
                            "gap-x-3 rounded-2xl p-2.5 transition-colors " +
                            "hover:bg-[#f2f8fa] " +
                            "motion-reduce:transition-none"
                        }
                        key={signal.label}
                    >
                        <span
                            className={
                                "pt-0.5 text-[0.65rem] font-semibold " +
                                "uppercase tracking-wide " +
                                signal.severityClassName
                            }
                        >
                            {signal.severity}
                        </span>
                        <span
                            aria-hidden="true"
                            className="relative flex justify-center"
                        >
                            {index > 0 ? (
                                <span
                                    className={
                                        "absolute -top-2.5 bottom-1/2 " +
                                        "w-px bg-[#dcebee]"
                                    }
                                />
                            ) : null}
                            {index < signals.length - 1 ? (
                                <span
                                    className={
                                        "absolute top-1/2 -bottom-2.5 " +
                                        "w-px bg-[#dcebee]"
                                    }
                                />
                            ) : null}
                            <span
                                className={
                                    "relative z-10 mt-1 size-2.5 " +
                                    "rounded-full ring-4 " +
                                    signal.markerClassName
                                }
                            />
                        </span>
                        <span className="min-w-0">
                            <span className="flex items-center gap-2">
                                <span
                                    className={
                                        "min-w-0 flex-1 text-sm font-medium"
                                    }
                                >
                                    {signal.label}
                                </span>
                                <span
                                    className={
                                        "font-semibold tabular-nums " +
                                        "text-[#203039]"
                                    }
                                >
                                    {signal.value}
                                </span>
                                <ArrowUpRight
                                    aria-hidden="true"
                                    className={
                                        "size-3.5 shrink-0 text-[#819198]"
                                    }
                                />
                            </span>
                            <span
                                aria-hidden="true"
                                className={
                                    "mt-2 block h-1.5 overflow-hidden " +
                                    "rounded-full bg-[#edf3f5]"
                                }
                            >
                                <span
                                    className={
                                        "block h-full rounded-full " +
                                        signal.barClassName
                                    }
                                    style={{
                                        width:
                                            (signal.value / largestSignal) *
                                                100 +
                                            "%",
                                    }}
                                />
                            </span>
                            <span
                                className={
                                    "mt-1.5 block text-xs text-[#5e6d75]"
                                }
                            >
                                {signal.action}
                            </span>
                        </span>
                    </li>
                ))}
            </ol>

            <p
                className={
                    "border-t border-[#e2edf0] bg-[#f8fbfc] px-5 py-4 " +
                    "text-xs leading-5 text-[#5e6d75] sm:px-6"
                }
            >
                Sample data using the compact dashboard view.
            </p>
        </aside>
    );
}
