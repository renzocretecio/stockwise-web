"use client";

import { useIsRestoring } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";

import { PageLoading } from "@/components/PageLoading";
import { useSession } from "@/modules/auth/services/session";

const subscribeToConnection = (onStoreChange: () => void) => {
    window.addEventListener("online", onStoreChange);
    window.addEventListener("offline", onStoreChange);

    return () => {
        window.removeEventListener("online", onStoreChange);
        window.removeEventListener("offline", onStoreChange);
    };
};

const getConnectionSnapshot = () => navigator.onLine;
const getServerConnectionSnapshot = () => true;

export function ProtectedAppBootstrap({
    children,
}: {
    children: React.ReactNode;
}) {
    const isRestoring = useIsRestoring();
    const isOnline = useSyncExternalStore(
        subscribeToConnection,
        getConnectionSnapshot,
        getServerConnectionSnapshot,
    );
    const session = useSession();
    const isWaitingForSession =
        isOnline &&
        !session.data &&
        session.isPending &&
        session.fetchStatus !== "paused";

    if (isRestoring || isWaitingForSession) {
        return (
            <PageLoading
                className="min-h-dvh"
                description="Loading your business workspace"
                label="Opening StockWise"
            />
        );
    }

    return children;
}
