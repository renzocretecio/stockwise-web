"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type StandaloneNavigator = Navigator & {
    standalone?: boolean;
};

export function PwaAppRedirect() {
    const router = useRouter();

    useEffect(() => {
        const launchedAsInstalledApp =
            window.matchMedia("(display-mode: standalone)").matches ||
            Boolean((navigator as StandaloneNavigator).standalone);

        if (launchedAsInstalledApp) {
            router.replace("/dashboard/overview");
        }
    }, [router]);

    return null;
}
