"use client";

import { ShieldAlert } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
    defaultRouteForPermissions,
    requiredPermissionForPath,
} from "@/lib/access-control";
import { hasPermission } from "@/lib/menu-utils";
import { useSession } from "@/modules/auth/services/session";

export function ProtectedAccessBoundary({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const session = useSession();
    const business = session.data?.active_business;
    const permissions = business?.permissions;
    const requiredPermission = requiredPermissionForPath(pathname);
    const contextIsLoading =
        session.isPending ||
        (Boolean(business) &&
            !Array.isArray(permissions) &&
            session.isFetching);

    if (requiredPermission && contextIsLoading) {
        return <div className="h-72 animate-pulse bg-muted/30" />;
    }

    if (
        requiredPermission &&
        !hasPermission(permissions ?? [], requiredPermission)
    ) {
        const destination = defaultRouteForPermissions(permissions);

        return (
            <section
                className={
                    "flex min-h-[420px] flex-col items-center " +
                    "justify-center p-6 text-center"
                }
            >
                <div
                    className={
                        "flex size-12 items-center justify-center " +
                        "bg-muted text-muted-foreground"
                    }
                >
                    <ShieldAlert className="size-6" />
                </div>
                <h1 className="mt-4 text-lg font-semibold">
                    You don&apos;t have access to this page
                </h1>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    Your role does not include this area. Ask the business
                    owner if you need additional access.
                </p>
                <Button
                    className="mt-5"
                    onClick={() => router.replace(destination)}
                    type="button"
                >
                    Go to my workspace
                </Button>
            </section>
        );
    }

    return children;
}
