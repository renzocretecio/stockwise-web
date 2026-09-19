import {
    Check,
    ClipboardList,
    Database,
    PackagePlus,
    RefreshCw,
    ShoppingBag,
    SlidersHorizontal,
    WifiOff,
} from "lucide-react";

const queuedChanges = [
    {
        detail: "2 items · ₱782",
        icon: ShoppingBag,
        label: "Sale",
    },
    {
        detail: "12 products counted",
        icon: ClipboardList,
        label: "Physical count",
    },
    {
        detail: "3 items for one supplier",
        icon: PackagePlus,
        label: "Purchase draft",
    },
];

const timeline = [
    {
        icon: Database,
        label: "Saved locally",
    },
    {
        icon: RefreshCw,
        label: "Connection returns",
    },
    {
        icon: Check,
        label: "Changes synced",
    },
];

export function OfflinePreview() {
    return (
        <aside
            className={
                "min-w-0 overflow-hidden rounded-2xl border " +
                "border-border bg-card shadow-xl shadow-foreground/5"
            }
        >
            <header
                className={
                    "flex flex-wrap items-center justify-between gap-4 " +
                    "border-b border-border bg-muted px-5 py-5 " +
                    "sm:px-6"
                }
            >
                <div className="flex items-center gap-3">
                    <span
                        className={
                            "grid size-10 place-items-center rounded-2xl " +
                            "bg-accent text-accent-foreground"
                        }
                    >
                        <WifiOff aria-hidden="true" className="size-5" />
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-foreground">
                            Working offline
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Changes remain on this device
                        </p>
                    </div>
                </div>
                <span
                    className={
                        "inline-flex items-center gap-2 rounded-full " +
                        "bg-[#fff4df] px-3 py-1.5 text-xs font-semibold " +
                        "text-[#8a5a1e]"
                    }
                >
                    <span className="size-1.5 rounded-full bg-[#d99a35]" />
                    3 waiting to sync
                </span>
            </header>

            <div className="p-4 sm:p-6">
                <div className="space-y-3">
                    {queuedChanges.map((change) => {
                        const Icon = change.icon;

                        return (
                            <div
                                className={
                                    "flex items-center gap-3 rounded-2xl " +
                                    "border border-border bg-muted " +
                                    "p-4"
                                }
                                key={change.label}
                            >
                                <span
                                    className={
                                        "grid size-9 shrink-0 " +
                                        "place-items-center " +
                                        "rounded-xl bg-accent " +
                                        "text-accent-foreground"
                                    }
                                >
                                    <Icon
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span
                                        className={
                                            "block text-sm font-semibold " +
                                            "text-foreground"
                                        }
                                    >
                                        {change.label}
                                    </span>
                                    <span
                                        className={
                                            "mt-0.5 block truncate text-xs " +
                                            "text-muted-foreground"
                                        }
                                    >
                                        {change.detail}
                                    </span>
                                </span>
                                <span
                                    className={
                                        "shrink-0 text-xs font-medium " +
                                        "text-[#8a5a1e]"
                                    }
                                >
                                    Saved
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div
                    className={
                        "mt-5 flex items-start gap-3 rounded-2xl " +
                        "bg-accent px-4 py-3.5"
                    }
                >
                    <SlidersHorizontal
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-accent-foreground"
                    />
                    <p className="text-xs leading-5 text-muted-foreground">
                        Product, supplier, category, and stock references were
                        saved during the last online session.
                    </p>
                </div>
            </div>

            <ol
                aria-label="Offline synchronization flow"
                className={
                    "grid gap-px border-t border-border bg-border " +
                    "sm:grid-cols-3"
                }
            >
                {timeline.map((item, index) => {
                    const Icon = item.icon;

                    return (
                        <li
                            className={
                                "relative flex items-center gap-3 bg-card " +
                                "px-4 py-4 sm:block sm:min-h-28 sm:px-5"
                            }
                            key={item.label}
                        >
                            <span
                                className={
                                    "grid size-8 shrink-0 place-items-center " +
                                    "rounded-full " +
                                    (index === timeline.length - 1
                                        ? "bg-[#17483f] text-[#087966]"
                                        : "bg-accent text-accent-foreground")
                                }
                            >
                                <Icon
                                    aria-hidden="true"
                                    className={
                                        "size-3.5 " +
                                        (index === 1
                                            ? "motion-safe:animate-spin"
                                            : "")
                                    }
                                />
                            </span>
                            <div className="sm:mt-3">
                                <p
                                    className={
                                        "text-[0.65rem] font-semibold " +
                                        "uppercase tracking-wide " +
                                        "text-muted-foreground"
                                    }
                                >
                                    Step {index + 1}
                                </p>
                                <p
                                    className={
                                        "mt-0.5 text-xs font-semibold " +
                                        "text-foreground"
                                    }
                                >
                                    {item.label}
                                </p>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </aside>
    );
}
