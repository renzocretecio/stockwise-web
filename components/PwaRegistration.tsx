"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function canCacheOffline(pathname: string) {
    return pathname !== "/" &&
        pathname !== "/login" &&
        pathname !== "/signup" &&
        !pathname.startsWith("/invitations/");
}

export function PwaRegistration() {
    const pathname = usePathname();

    useEffect(() => {
        if (!("serviceWorker" in navigator)) return;

        if (process.env.NODE_ENV !== "production") {
            const cleanupDevelopmentWorker = async () => {
                const wasControlled = Boolean(
                    navigator.serviceWorker.controller,
                );
                const registrations =
                    await navigator.serviceWorker.getRegistrations();
                await Promise.all(
                    registrations.map((registration) =>
                        registration.unregister(),
                    ),
                );

                if ("caches" in window) {
                    const cacheNames = await caches.keys();
                    await Promise.all(
                        cacheNames
                            .filter((name) =>
                                name.startsWith("stockwise-shell-"),
                            )
                            .map((name) => caches.delete(name)),
                    );
                }

                const reloadKey = "stockwise-dev-sw-cleanup";
                if (wasControlled && !sessionStorage.getItem(reloadKey)) {
                    sessionStorage.setItem(reloadKey, "done");
                    window.location.reload();
                    return;
                }
                if (!wasControlled) {
                    sessionStorage.removeItem(reloadKey);
                }
            };

            void cleanupDevelopmentWorker();
            return;
        }

        let disposed = false;
        const warmPage = () => {
            if (
                disposed ||
                !navigator.onLine ||
                !canCacheOffline(pathname)
            ) return;
            const worker = navigator.serviceWorker.controller;
            if (!worker) return;
            worker.postMessage({
                type: "CACHE_PAGE",
                url: window.location.href,
                assets: performance.getEntriesByType("resource")
                    .map((entry) => entry.name)
                    .filter((url) => url.includes("/_next/static/")),
            });
        };

        navigator.serviceWorker.addEventListener("controllerchange", warmPage);
        window.addEventListener("online", warmPage);
        // Runs again for client-side routes, which do not request page HTML.
        navigator.serviceWorker.register("/sw.js", {
            scope: "/",
            updateViaCache: "none",
        }).then(() => navigator.serviceWorker.ready)
            .then(warmPage)
            .catch((error) => {
                console.error("[PWA] Registration failed", error);
            });

        return () => {
            disposed = true;
            navigator.serviceWorker.removeEventListener(
                "controllerchange", warmPage,
            );
            window.removeEventListener("online", warmPage);
        };
    }, [pathname]);

    return null;
}
