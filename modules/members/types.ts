import type { SubscriptionSummary } from "@/modules/billing/types";

export type BusinessMember = {
    id: string;
    user_id: string;
    email: string;
    first_name: string;
    last_name?: string | null;
    role_id: string;
    role: string;
    status: "active" | "suspended";
    joined_at?: string | null;
    is_current_user: boolean;
};

export type BusinessRole = {
    id: string;
    name: string;
    description?: string | null;
    is_system_role: boolean;
    permissions: string[];
    assignable: boolean;
};

export type BusinessInvitation = {
    id: string;
    email: string;
    role_id: string;
    role: string;
    status: string;
    expires_at: string;
    created_at: string;
};

export type MembersResponse = {
    members: BusinessMember[];
    invitations: BusinessInvitation[];
    roles: BusinessRole[];
    subscription: SubscriptionSummary;
};

export type PermissionOption = {
    key: string;
    description: string;
};

export type InviteMemberResponse = {
    invitation: BusinessInvitation;
    accept_url: string;
    email_delivery: "scheduled" | "not_configured";
};
