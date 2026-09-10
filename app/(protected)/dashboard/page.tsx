"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { defaultRouteForPermissions } from "@/lib/access-control";
import { useSession } from "@/modules/auth/services/session";

export default function DashboardPage() {
    const router = useRouter();
    const session = useSession();
    const permissions = session.data?.active_business?.permissions;

    useEffect(() => {
        if (!Array.isArray(permissions)) {
            return;
        }

        router.replace(defaultRouteForPermissions(permissions));
    }, [permissions, router]);

    return (
        <div
            aria-label="Loading workspace"
            className="h-72 animate-pulse bg-muted/30"
        />
    );
}
