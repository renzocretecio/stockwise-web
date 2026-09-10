"use client";

import { useSession } from "@/modules/auth/services/session";

export function useHasPermission(permission: string) {
    const session = useSession();
    const permissions = session.data?.active_business?.permissions ?? [];

    return permissions.includes(permission);
}
