"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
    Check,
    Clipboard,
    KeyRound,
    Loader2,
    MailPlus,
    MoreHorizontal,
    ShieldCheck,
    UserRound,
    UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api-client";
import { hasPermission } from "@/lib/menu-utils";
import { useSession } from "@/modules/auth/services/session";
import {
    useCreateCustomRole,
    useDeleteCustomRole,
    useInviteMember,
    useMembers,
    useRemoveMember,
    useRevokeInvitation,
    useRolePermissions,
    useUpdateCustomRole,
    useUpdateMember,
} from "@/modules/members/services/members";
import type { BusinessRole } from "@/modules/members/types";

export function TeamAccessSettings() {
    const session = useSession();
    const members = useMembers();
    const [inviteOpen, setInviteOpen] = useState(false);
    const [roleOpen, setRoleOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<BusinessRole | null>(null);
    const permissions = session.data?.active_business?.permissions ?? [];
    const canRead = hasPermission(permissions, "members.read");
    const canInvite = hasPermission(permissions, "members.invite");
    const canChangeRole = hasPermission(permissions, "members.update_role");
    const canRemove = hasPermission(permissions, "members.remove");

    if (!canRead) {
        return (
            <EmptyState
                description={
                    "Your role does not include access to the business team."
                }
                title="Team access is restricted"
            />
        );
    }

    if (members.isLoading) {
        return <div className="h-72 animate-pulse bg-muted/40" />;
    }

    if (members.error || !members.data) {
        return (
            <EmptyState
                action={
                    <Button
                        onClick={() => void members.refetch()}
                        size="sm"
                        variant="outline"
                    >
                        Try again
                    </Button>
                }
                description={errorMessage(members.error)}
                title="Unable to load the team"
            />
        );
    }

    const data = members.data;
    const reservedSeats = data.members.length + data.invitations.length;
    const seatLimit = data.subscription.limits.member_limit;
    const atCapacity = seatLimit !== null && reservedSeats >= seatLimit;
    const customRolesEnabled = data.subscription.features.custom_roles;

    return (
        <div className="min-w-0">
            <section className="border-b p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <UsersRound className="size-4 text-primary" />
                            <h2 className="font-semibold">Team & access</h2>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Decide who can access this business and what they
                            can do.
                        </p>
                    </div>
                    {canInvite ? (
                        <Button
                            disabled={atCapacity}
                            onClick={() => setInviteOpen(true)}
                            size="sm"
                        >
                            <MailPlus />
                            Invite member
                        </Button>
                    ) : null}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3 bg-muted/40 p-4">
                    <div className="flex size-9 items-center justify-center bg-background text-primary">
                        <UserRound className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                            {reservedSeats} of {seatLimit ?? "unlimited"} seats
                            reserved
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Pending invitations reserve a member seat.
                        </p>
                    </div>
                    <Badge variant="outline">
                        {data.subscription.plan.toUpperCase()}
                    </Badge>
                </div>
                {atCapacity ? (
                    <p className="mt-3 text-xs text-amber-700 dark:text-amber-400">
                        Your member limit is full. Remove a member, revoke an
                        invitation, or update the plan before inviting someone.
                    </p>
                ) : null}
            </section>

            <section className="border-b">
                <SectionTitle
                    description="Access is applied only to the active business."
                    title="Members"
                />
                <div className="divide-y">
                    {data.members.map((member) => (
                        <div
                            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
                            key={member.id}
                        >
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                <div className="flex size-9 shrink-0 items-center justify-center bg-muted font-medium">
                                    {initials(
                                        member.first_name,
                                        member.last_name,
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">
                                        {fullName(
                                            member.first_name,
                                            member.last_name,
                                        )}
                                        {member.is_current_user ? " (you)" : ""}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {member.email}
                                    </p>
                                </div>
                            </div>
                            <MemberControls
                                canChangeRole={canChangeRole}
                                canRemove={canRemove}
                                member={member}
                                roles={data.roles}
                            />
                        </div>
                    ))}
                </div>
            </section>

            {data.invitations.length ? (
                <section className="border-b">
                    <SectionTitle
                        description="Invitations expire after seven days."
                        title="Pending invitations"
                    />
                    <div className="divide-y">
                        {data.invitations.map((invitation) => (
                            <InvitationRow
                                canRevoke={canInvite}
                                invitation={invitation}
                                key={invitation.id}
                            />
                        ))}
                    </div>
                </section>
            ) : null}

            <section>
                <div className="flex items-start justify-between gap-4 p-4">
                    <SectionTitle
                        compact
                        description={
                            customRolesEnabled
                                ? "Create access levels for how your team works."
                                : "Custom roles are available on the Business plan."
                        }
                        title="Roles"
                    />
                    {canChangeRole && customRolesEnabled ? (
                        <Button
                            onClick={() => {
                                setEditingRole(null);
                                setRoleOpen(true);
                            }}
                            size="sm"
                            variant="outline"
                        >
                            <KeyRound />
                            New role
                        </Button>
                    ) : null}
                </div>
                <div className="grid gap-px bg-border sm:grid-cols-2">
                    {data.roles.map((role) => (
                        <button
                            className="bg-background p-4 text-left disabled:cursor-default"
                            disabled={
                                role.is_system_role ||
                                !canChangeRole ||
                                !customRolesEnabled
                            }
                            key={role.id}
                            onClick={() => {
                                setEditingRole(role);
                                setRoleOpen(true);
                            }}
                            type="button"
                        >
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="size-4 text-primary" />
                                <p className="text-sm font-medium capitalize">
                                    {role.name}
                                </p>
                                <Badge variant="outline">
                                    {role.is_system_role
                                        ? "Built in"
                                        : "Custom"}
                                </Badge>
                            </div>
                            <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                {role.description}
                            </p>
                        </button>
                    ))}
                </div>
            </section>

            <InviteMemberDrawer
                onOpenChange={setInviteOpen}
                open={inviteOpen}
                roles={data.roles.filter((role) => role.assignable)}
            />
            {roleOpen ? (
                <RoleEditorDrawer
                    onOpenChange={setRoleOpen}
                    open={roleOpen}
                    role={editingRole}
                />
            ) : null}
        </div>
    );
}

function MemberControls({
    canChangeRole,
    canRemove,
    member,
    roles,
}: {
    canChangeRole: boolean;
    canRemove: boolean;
    member: import("@/modules/members/types").BusinessMember;
    roles: BusinessRole[];
}) {
    const updateMember = useUpdateMember();
    const removeMember = useRemoveMember();
    const immutable = member.role.toLowerCase() === "owner";
    const busy = updateMember.isPending || removeMember.isPending;

    return (
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {canChangeRole && !immutable ? (
                <select
                    aria-label={`Role for ${member.email}`}
                    className="h-8 border bg-background px-2 text-xs outline-none focus:border-ring"
                    disabled={busy}
                    onChange={(event) =>
                        updateMember.mutate({
                            membershipId: member.id,
                            role_id: event.target.value,
                        })
                    }
                    value={member.role_id}
                >
                    {roles
                        .filter((role) => role.assignable)
                        .map((role) => (
                            <option key={role.id} value={role.id}>
                                {titleCase(role.name)}
                            </option>
                        ))}
                </select>
            ) : (
                <Badge variant="outline">{titleCase(member.role)}</Badge>
            )}
            <Badge
                variant={
                    member.status === "active" ? "secondary" : "destructive"
                }
            >
                {titleCase(member.status)}
            </Badge>
            {canRemove && !immutable && !member.is_current_user ? (
                <>
                    <Button
                        disabled={busy}
                        onClick={() =>
                            updateMember.mutate({
                                membershipId: member.id,
                                status:
                                    member.status === "active"
                                        ? "suspended"
                                        : "active",
                            })
                        }
                        size="xs"
                        variant="ghost"
                    >
                        {member.status === "active" ? "Suspend" : "Restore"}
                    </Button>
                    <Button
                        aria-label={`Remove ${member.email}`}
                        disabled={busy}
                        onClick={() => {
                            if (
                                window.confirm(
                                    `Remove ${member.email} from this business?`,
                                )
                            ) {
                                removeMember.mutate(member.id);
                            }
                        }}
                        size="icon-xs"
                        variant="ghost"
                    >
                        <MoreHorizontal />
                    </Button>
                </>
            ) : null}
        </div>
    );
}

function InvitationRow({
    canRevoke,
    invitation,
}: {
    canRevoke: boolean;
    invitation: import("@/modules/members/types").BusinessInvitation;
}) {
    const revoke = useRevokeInvitation();
    return (
        <div className="flex items-center gap-3 p-4">
            <div className="flex size-9 items-center justify-center bg-muted">
                <MailPlus className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                    {invitation.email}
                </p>
                <p className="text-xs text-muted-foreground">
                    {titleCase(invitation.role)} · expires{" "}
                    {new Date(invitation.expires_at).toLocaleDateString()}
                </p>
            </div>
            {canRevoke ? (
                <Button
                    disabled={revoke.isPending}
                    onClick={() => revoke.mutate(invitation.id)}
                    size="xs"
                    variant="ghost"
                >
                    Revoke
                </Button>
            ) : null}
        </div>
    );
}

function InviteMemberDrawer({
    onOpenChange,
    open,
    roles,
}: {
    onOpenChange: (open: boolean) => void;
    open: boolean;
    roles: BusinessRole[];
}) {
    const invite = useInviteMember();
    const [email, setEmail] = useState("");
    const [roleId, setRoleId] = useState("");
    const selectedRole = roleId || roles[0]?.id || "";

    const close = (nextOpen: boolean) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
            setEmail("");
            setRoleId("");
            invite.reset();
        }
    };

    return (
        <Drawer onOpenChange={close} open={open} swipeDirection="right">
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Invite a team member</DrawerTitle>
                    <DrawerDescription>
                        Their access applies only to this business. The link
                        expires after seven days.
                    </DrawerDescription>
                </DrawerHeader>
                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
                    {invite.data ? (
                        <div className="border bg-muted/30 p-4">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Check className="size-4 text-emerald-600" />
                                Invitation created
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                                {invite.data.email_delivery === "scheduled"
                                    ? "The invitation email is scheduled."
                                    : "Email is not configured. Copy and send this link manually."}
                            </p>
                            <div className="mt-3 flex gap-2">
                                <Input
                                    className="rounded-none text-xs"
                                    readOnly
                                    value={invite.data.accept_url}
                                />
                                <Button
                                    aria-label="Copy invitation link"
                                    onClick={() =>
                                        void navigator.clipboard.writeText(
                                            invite.data.accept_url,
                                        )
                                    }
                                    size="icon"
                                    variant="outline"
                                >
                                    <Clipboard />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <form
                            className="space-y-5"
                            id="invite-member-form"
                            onSubmit={(event) => {
                                event.preventDefault();
                                invite.mutate({
                                    email: email.trim().toLowerCase(),
                                    role_id: selectedRole,
                                });
                            }}
                        >
                            <label className="block space-y-2">
                                <span className="text-sm font-medium">
                                    Email address
                                </span>
                                <Input
                                    autoComplete="email"
                                    className="rounded-none"
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    placeholder="member@business.com"
                                    required
                                    type="email"
                                    value={email}
                                />
                            </label>
                            <label className="block space-y-2">
                                <span className="text-sm font-medium">
                                    Role
                                </span>
                                <select
                                    className="h-10 w-full border bg-background px-3 text-sm outline-none focus:border-ring"
                                    onChange={(event) =>
                                        setRoleId(event.target.value)
                                    }
                                    value={selectedRole}
                                >
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.id}>
                                            {titleCase(role.name)}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs leading-5 text-muted-foreground">
                                    {
                                        roles.find(
                                            (role) => role.id === selectedRole,
                                        )?.description
                                    }
                                </p>
                            </label>
                            {invite.error ? (
                                <p className="text-sm text-destructive">
                                    {errorMessage(invite.error)}
                                </p>
                            ) : null}
                        </form>
                    )}
                </div>
                <DrawerFooter>
                    {invite.data ? (
                        <DrawerClose render={<Button />}>Done</DrawerClose>
                    ) : (
                        <>
                            <Button
                                disabled={
                                    invite.isPending ||
                                    !email.trim() ||
                                    !selectedRole
                                }
                                form="invite-member-form"
                                type="submit"
                            >
                                {invite.isPending ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <MailPlus />
                                )}
                                Send invitation
                            </Button>
                            <DrawerClose render={<Button variant="outline" />}>
                                Cancel
                            </DrawerClose>
                        </>
                    )}
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

function RoleEditorDrawer({
    onOpenChange,
    open,
    role,
}: {
    onOpenChange: (open: boolean) => void;
    open: boolean;
    role: BusinessRole | null;
}) {
    const permissions = useRolePermissions(open);
    const createRole = useCreateCustomRole();
    const updateRole = useUpdateCustomRole();
    const deleteRole = useDeleteCustomRole();
    const [name, setName] = useState(role?.name ?? "");
    const [description, setDescription] = useState(role?.description ?? "");
    const [selected, setSelected] = useState<Set<string>>(
        new Set(role?.permissions ?? []),
    );

    const mutation = role ? updateRole : createRole;
    const grouped = useMemo(
        () => groupPermissions(permissions.data ?? []),
        [permissions.data],
    );
    const close = (nextOpen: boolean) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
            mutation.reset();
            deleteRole.reset();
        }
    };

    return (
        <Drawer onOpenChange={close} open={open} swipeDirection="right">
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>
                        {role ? `Edit ${role.name}` : "Create a custom role"}
                    </DrawerTitle>
                    <DrawerDescription>
                        Choose only the access this role needs. Billing and
                        business ownership remain owner-only.
                    </DrawerDescription>
                </DrawerHeader>
                <form
                    className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4"
                    id="role-editor-form"
                    onSubmit={(event) => {
                        event.preventDefault();
                        const payload = {
                            name: name.trim(),
                            description: description.trim() || undefined,
                            permission_keys: Array.from(selected),
                        };
                        if (role) {
                            updateRole.mutate(
                                { roleId: role.id, ...payload },
                                { onSuccess: () => close(false) },
                            );
                        } else {
                            createRole.mutate(payload, {
                                onSuccess: () => close(false),
                            });
                        }
                    }}
                >
                    <label className="block space-y-2">
                        <span className="text-sm font-medium">Role name</span>
                        <Input
                            className="rounded-none"
                            maxLength={50}
                            onChange={(event) => setName(event.target.value)}
                            required
                            value={name}
                        />
                    </label>
                    <label className="block space-y-2">
                        <span className="text-sm font-medium">Description</span>
                        <Input
                            className="rounded-none"
                            maxLength={500}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                            value={description}
                        />
                    </label>
                    <div className="space-y-5">
                        {Object.entries(grouped).map(([group, options]) => (
                            <fieldset key={group}>
                                <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    {titleCase(group)}
                                </legend>
                                <div className="space-y-px bg-border">
                                    {options.map((permission) => (
                                        <label
                                            className="flex cursor-pointer gap-3 bg-background p-3"
                                            key={permission.key}
                                        >
                                            <input
                                                checked={selected.has(
                                                    permission.key,
                                                )}
                                                className="mt-0.5 size-4 accent-primary"
                                                onChange={() => {
                                                    const next = new Set(
                                                        selected,
                                                    );
                                                    if (
                                                        next.has(permission.key)
                                                    ) {
                                                        next.delete(
                                                            permission.key,
                                                        );
                                                    } else {
                                                        next.add(
                                                            permission.key,
                                                        );
                                                    }
                                                    setSelected(next);
                                                }}
                                                type="checkbox"
                                            />
                                            <span>
                                                <span className="block text-sm font-medium">
                                                    {permission.description}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {permission.key}
                                                </span>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </fieldset>
                        ))}
                    </div>
                    {mutation.error || deleteRole.error ? (
                        <p className="text-sm text-destructive">
                            {errorMessage(mutation.error ?? deleteRole.error)}
                        </p>
                    ) : null}
                </form>
                <DrawerFooter>
                    <Button
                        disabled={
                            mutation.isPending ||
                            !name.trim() ||
                            selected.size === 0
                        }
                        form="role-editor-form"
                        type="submit"
                    >
                        {mutation.isPending ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <ShieldCheck />
                        )}
                        {role ? "Save role" : "Create role"}
                    </Button>
                    {role ? (
                        <Button
                            disabled={deleteRole.isPending}
                            onClick={() => {
                                if (
                                    window.confirm(
                                        `Delete the ${role.name} role?`,
                                    )
                                ) {
                                    deleteRole.mutate(role.id, {
                                        onSuccess: () => close(false),
                                    });
                                }
                            }}
                            variant="destructive"
                        >
                            Delete role
                        </Button>
                    ) : null}
                    <DrawerClose render={<Button variant="outline" />}>
                        Cancel
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

function SectionTitle({
    compact = false,
    description,
    title,
}: {
    compact?: boolean;
    description: string;
    title: string;
}) {
    return (
        <div className={compact ? "" : "p-4"}>
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
    );
}

function EmptyState({
    action,
    description,
    title,
}: {
    action?: ReactNode;
    description: string;
    title: string;
}) {
    return (
        <div className="flex min-h-72 items-center justify-center p-6 text-center">
            <div className="max-w-sm">
                <ShieldCheck className="mx-auto size-6 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">{title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                    {description}
                </p>
                {action ? <div className="mt-4">{action}</div> : null}
            </div>
        </div>
    );
}

function groupPermissions(
    permissions: import("@/modules/members/types").PermissionOption[],
) {
    return permissions.reduce<
        Record<string, import("@/modules/members/types").PermissionOption[]>
    >((groups, permission) => {
        const group = permission.key.split(".")[0];
        groups[group] = [...(groups[group] ?? []), permission];
        return groups;
    }, {});
}

function fullName(firstName: string, lastName?: string | null) {
    return [firstName, lastName].filter(Boolean).join(" ");
}

function initials(firstName: string, lastName?: string | null) {
    return `${firstName[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
}

function titleCase(value: string) {
    return value.replace(/\b\w/g, (character) => character.toUpperCase());
}

function errorMessage(error: unknown) {
    if (error instanceof ApiError || error instanceof Error) {
        return error.message;
    }
    return "Something went wrong. Please try again.";
}
