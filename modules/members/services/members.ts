import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { authKeys, useSession } from "@/modules/auth/services/session";
import { subscriptionKeys } from "@/modules/billing/services/billing";
import type {
    InviteMemberResponse,
    MembersResponse,
    PermissionOption,
} from "@/modules/members/types";

export const memberKeys = {
    all: ["members"] as const,
    list: (businessId?: string) => ["members", businessId] as const,
    permissions: ["members", "permissions"] as const,
};

export function useMembers() {
    const session = useSession();
    const business = session.data?.active_business;
    const canRead = business?.permissions?.includes("members.read") ?? false;

    return useQuery({
        queryKey: memberKeys.list(business?.id),
        queryFn: () => apiClient<MembersResponse>("/api/members"),
        enabled: Boolean(business?.id && canRead),
        staleTime: 60 * 1000,
    });
}

export function useRolePermissions(enabled: boolean) {
    return useQuery({
        queryKey: memberKeys.permissions,
        queryFn: async () => {
            const response = await apiClient<{
                permissions: PermissionOption[];
            }>("/api/members/permissions");
            return response.permissions;
        },
        enabled,
        staleTime: 10 * 60 * 1000,
    });
}

export function useInviteMember() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { email: string; role_id: string }) =>
            apiClient<InviteMemberResponse>("/api/members/invitations", {
                method: "POST",
                body: JSON.stringify(payload),
            }),
        onSuccess: () => invalidateMemberData(queryClient),
    });
}

export function useRevokeInvitation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (invitationId: string) =>
            apiClient(`/api/members/invitations/${invitationId}`, {
                method: "DELETE",
            }),
        onSuccess: () => invalidateMemberData(queryClient),
    });
}

export function useUpdateMember() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            membershipId,
            ...payload
        }: {
            membershipId: string;
            role_id?: string;
            status?: "active" | "suspended";
        }) =>
            apiClient(`/api/members/${membershipId}`, {
                method: "PATCH",
                body: JSON.stringify(payload),
            }),
        onSuccess: () => invalidateMemberData(queryClient),
    });
}

export function useRemoveMember() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (membershipId: string) =>
            apiClient(`/api/members/${membershipId}`, {
                method: "DELETE",
            }),
        onSuccess: () => invalidateMemberData(queryClient),
    });
}

export function useCreateCustomRole() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: {
            name: string;
            description?: string;
            permission_keys: string[];
        }) =>
            apiClient("/api/members/roles", {
                method: "POST",
                body: JSON.stringify(payload),
            }),
        onSuccess: () => invalidateMemberData(queryClient),
    });
}

export function useUpdateCustomRole() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            roleId,
            ...payload
        }: {
            roleId: string;
            name: string;
            description?: string;
            permission_keys: string[];
        }) =>
            apiClient(`/api/members/roles/${roleId}`, {
                method: "PUT",
                body: JSON.stringify(payload),
            }),
        onSuccess: () => invalidateMemberData(queryClient),
    });
}

export function useDeleteCustomRole() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (roleId: string) =>
            apiClient(`/api/members/roles/${roleId}`, {
                method: "DELETE",
            }),
        onSuccess: () => invalidateMemberData(queryClient),
    });
}

function invalidateMemberData(queryClient: ReturnType<typeof useQueryClient>) {
    void queryClient.invalidateQueries({ queryKey: memberKeys.all });
    void queryClient.invalidateQueries({ queryKey: authKeys.me });
    void queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
}
