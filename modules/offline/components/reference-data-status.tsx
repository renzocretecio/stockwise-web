"use client";

import { WifiOff } from "lucide-react";

import { useOnlineStatus } from "@/hooks/use-online-status";
import { useOfflineEntitlement } from
    "@/modules/billing/services/billing";

export function ReferenceDataStatus({
    available,
    generatedAt,
    loading,
}: {
    available: boolean;
    generatedAt?: string;
    loading: boolean;
}) {
    const isOnline = useOnlineStatus();
    const offlineEntitlement = useOfflineEntitlement();

    if (loading || (available && isOnline)) return null;

    if (
        !isOnline &&
        offlineEntitlement.resolved &&
        !offlineEntitlement.enabled
    ) {
        return (
            <div
                role="alert"
                className={
                    "flex items-start gap-2 rounded-2xl border " +
                    "border-primary/25 bg-primary/5 p-4 text-sm"
                }
            >
                <WifiOff className="mt-0.5 size-4 shrink-0 text-primary" />
                <p>
                    Operational forms work online on the Free plan. Reconnect
                    to continue, or upgrade to Pro for offline changes and
                    automatic sync.
                </p>
            </div>
        );
    }

    if (available) {
        const savedAt = generatedAt
            ? new Date(generatedAt).toLocaleString()
            : "an earlier session";

        return (
            <div
                role="status"
                className={
                    "flex items-start gap-2 rounded-2xl border " +
                    "border-border bg-muted/40 p-4 text-sm " +
                    "text-muted-foreground"
                }
            >
                <WifiOff className="mt-0.5 size-4 shrink-0" />
                <p>
                    Using form data saved {savedAt}. Changes will be validated
                    when they synchronize.
                </p>
            </div>
        );
    }

    return (
        <div
            role="alert"
            className={
                "flex items-start gap-2 rounded-2xl border " +
                "border-amber-500/30 bg-amber-500/10 p-4 text-sm " +
                "text-amber-950 dark:text-amber-100"
            }
        >
            <WifiOff className="mt-0.5 size-4 shrink-0" />
            {isOnline ? (
                <p>
                    Form options could not be loaded. Refresh the page or try
                    again in a moment.
                </p>
            ) : (
                <p>
                    Product and supplier data is not saved on this device yet.
                    Reconnect once to download it before using this form
                    offline.
                </p>
            )}
        </div>
    );
}
