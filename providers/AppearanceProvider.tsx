"use client";

import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { apiClient } from "@/lib/api-client";
import {
    applyAppearance,
    defaultCustomColor,
    type Appearance,
    type SavedAppearance,
    isAppearance,
    readAppearance,
    storeAppearance,
} from "@/lib/appearance";
import {
    authKeys,
    fetchSession,
    type SessionResponse,
} from "@/modules/auth/services/session";

type AppearanceContextValue = {
    customColor: string;
    palette: Appearance["palette"];
    ready: boolean;
    status: string;
    changeAppearance: (patch: Partial<Appearance>) => void;
    retrySync: () => void;
};

const AppearanceContext = createContext<AppearanceContextValue | null>(null);
const APPEARANCE_SYNC_DELAY_MS = 1_000;
const APPEARANCE_RETRY_DELAY_MS = 60_000;

export function AppearanceProvider({ children }: { children: ReactNode }) {
    const { setTheme } = useTheme();
    const queryClient = useQueryClient();
    const { data: session } = useQuery<SessionResponse>({
        queryKey: authKeys.me,
        queryFn: fetchSession,
        enabled: false,
    });
    const userId = session?.user?.id;
    const remote = session?.user?.appearance;
    const [saved, setSaved] = useState<SavedAppearance | null>(null);
    const current = useRef<SavedAppearance | null>(null);
    const inFlight = useRef(false);
    const syncRetryTimer = useRef<number | null>(null);
    const [retry, setRetry] = useState(0);
    const [status, setStatus] = useState("");

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            if (!userId) {
                current.current = null;
                setSaved(null);
                return;
            }
            const local = readAppearance(userId);
            const preference =
                current.current?.userId === userId && current.current.pending
                    ? current.current
                    : local;
            const value: SavedAppearance = preference?.pending
                ? preference
                : {
                      ...(isAppearance(remote)
                          ? remote
                            : (preference ?? {
                                custom_color: defaultCustomColor,
                                palette: "petrol",
                                mode: "system",
                            })),
                      userId,
                      pending: false,
                      version: preference?.version ?? "initial",
                  };
            current.current = value;
            storeAppearance(value);
            applyAppearance(value);
            setTheme(value.mode);
            setSaved(value);
            setStatus(
                value.pending ? "Saved on this device. Waiting to sync." : "",
            );
        });
        return () => cancelAnimationFrame(frame);
    }, [userId, remote, setTheme]);

    useEffect(() => {
        const reconnect = () => setRetry((value) => value + 1);
        window.addEventListener("online", reconnect);
        return () => {
            window.removeEventListener("online", reconnect);
            if (syncRetryTimer.current !== null) {
                window.clearTimeout(syncRetryTimer.current);
            }
        };
    }, []);

    useEffect(() => {
        if (
            !saved?.pending ||
            saved.userId !== userId ||
            !navigator.onLine ||
            inFlight.current
        )
            return;

        const timer = window.setTimeout(async () => {
            if (inFlight.current || current.current !== saved) return;
            inFlight.current = true;
            setStatus("Saving appearance…");
            try {
                await apiClient("/api/auth/me/appearance", {
                    method: "PATCH",
                    body: JSON.stringify({
                        user_id: saved.userId,
                        palette: saved.palette,
                        mode: saved.mode,
                        custom_color:
                            saved.custom_color ?? defaultCustomColor,
                    }),
                });
                if (current.current === saved) {
                    const synced = { ...saved, pending: false };
                    current.current = synced;
                    storeAppearance(synced);
                    setSaved(synced);
                    queryClient.setQueryData<SessionResponse>(
                        authKeys.me,
                        (old) =>
                            old?.user?.id === saved.userId
                                ? {
                                      ...old,
                                      user: {
                                          ...old.user,
                                          appearance: {
                                              custom_color:
                                                  saved.custom_color ??
                                                  defaultCustomColor,
                                              palette: saved.palette,
                                              mode: saved.mode,
                                          },
                                      },
                                  }
                                : old,
                    );
                    setStatus("Appearance saved to your account.");
                    if (syncRetryTimer.current !== null) {
                        window.clearTimeout(syncRetryTimer.current);
                        syncRetryTimer.current = null;
                    }
                }
            } catch {
                if (current.current === saved) {
                    setStatus("Saved on this device. Account sync pending.");
                    if (syncRetryTimer.current !== null) {
                        window.clearTimeout(syncRetryTimer.current);
                    }
                    syncRetryTimer.current = window.setTimeout(() => {
                        setRetry((value) => value + 1);
                    }, APPEARANCE_RETRY_DELAY_MS);
                }
            } finally {
                inFlight.current = false;
                if (current.current !== saved && current.current?.pending) {
                    setRetry((value) => value + 1);
                }
            }
        }, APPEARANCE_SYNC_DELAY_MS);
        return () => window.clearTimeout(timer);
    }, [saved, userId, retry, queryClient]);

    const changeAppearance = (patch: Partial<Appearance>) => {
        if (!userId || current.current?.userId !== userId) return;
        const existing = current.current;
        const palette = patch.palette ?? existing.palette;
        const mode = patch.mode ?? existing.mode;
        const customColor =
            patch.custom_color ??
            existing.custom_color ??
            defaultCustomColor;

        if (
            palette === existing.palette &&
            mode === existing.mode &&
            customColor ===
                (existing.custom_color ?? defaultCustomColor)
        ) {
            return;
        }

        const next = {
            ...existing,
            custom_color: customColor,
            mode,
            palette,
            pending: true,
            version:
                globalThis.crypto?.randomUUID?.() ??
                `${Date.now()}-${Math.random()}`,
        };
        current.current = next;
        storeAppearance(next);
        applyAppearance(next);
        setTheme(next.mode);
        setSaved(next);
        setStatus("Saved on this device. Waiting to sync.");
    };

    return (
        <AppearanceContext.Provider
            value={{
                customColor:
                    saved?.custom_color ?? defaultCustomColor,
                palette: saved?.palette ?? "petrol",
                ready: Boolean(userId && saved?.userId === userId),
                status,
                changeAppearance,
                retrySync: () => setRetry((value) => value + 1),
            }}
        >
            {children}
        </AppearanceContext.Provider>
    );
}

export function useAppearance() {
    const context = useContext(AppearanceContext);
    if (!context) throw new Error("AppearanceProvider is missing");
    return context;
}
