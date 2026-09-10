"use client";

import { useSyncExternalStore } from "react";
import { WifiOff } from "lucide-react";

import { useOfflineEntitlement } from
    "@/modules/billing/services/billing";

const subscribe = (onStoreChange: () => void) => {
    window.addEventListener("online", onStoreChange);
    window.addEventListener("offline", onStoreChange);

    return () => {
        window.removeEventListener("online", onStoreChange);
        window.removeEventListener("offline", onStoreChange);
    };
};

const getSnapshot = () => navigator.onLine;
const getServerSnapshot = () => true;

export function OfflineAccessBoundary({
    children,
}: {
    children: React.ReactNode;
}) {
    const isOnline = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot,
    );
    const entitlement = useOfflineEntitlement();

    if (isOnline || !entitlement.resolved || entitlement.enabled) {
        return children;
    }

    return (
        <section
            className={
                "flex min-h-[60vh] items-center justify-center p-6 " +
                "text-center"
            }
        >
            <div className="max-w-md">
                <span
                    className={
                        "mx-auto flex size-12 items-center justify-center " +
                        "rounded-2xl bg-muted text-muted-foreground"
                    }
                >
                    <WifiOff className="size-5" />
                </span>
                <h1 className="mt-5 text-2xl font-semibold">
                    Reconnect to continue
                </h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Offline pages and automatic synchronization are included
                    with Pro and Business. Your Free account data remains
                    available when you reconnect.
                </p>
            </div>
        </section>
    );
}
