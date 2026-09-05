"use client";

import { type FormEvent, type ReactNode, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Eye, EyeOff, KeyRound, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BusinessProfileForm } from
    "@/modules/business/components/BusinessProfileForm";

import type { SettingsSection } from "@/modules/settings/components/SettingsSidebar";

type UserProfile = {
    id: string;
    email: string;
    first_name: string;
    last_name?: string | null;
};

type AuthProfile = {
    user: UserProfile;
    active_business?: { role?: string };
};

function PersonalProfile({ user }: { user: UserProfile }) {
    const queryClient = useQueryClient();
    const [firstName, setFirstName] = useState(user.first_name || "");
    const [lastName, setLastName] = useState(user.last_name || "");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    const savePersonalProfile = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSaving(true);
        setMessage(null);
        setFormError(null);

        try {
            const response = await fetch("/api/auth/me", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName || null,
                }),
            });
            const payload = await response.json();

            if (!response.ok) {
                throw new Error(payload.detail || "Unable to save profile");
            }

            await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
            setMessage("Personal profile saved.");
        } catch (reason) {
            setFormError(
                reason instanceof Error ? reason.message : "Unable to save profile",
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="border-b" id="personal">
            <SectionHeading
                description="Manage the name displayed throughout Stockwise."
                icon={<UserRound className="size-4" />}
                title="Personal profile"
            />
            <form className="space-y-5 p-4" onSubmit={savePersonalProfile}>
                {formError ? (
                    <p className="border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                        {formError}
                    </p>
                ) : null}
                {message ? (
                    <p className="bg-emerald-500/10 p-3 text-sm text-emerald-700">
                        {message}
                    </p>
                ) : null}
                <div className="grid gap-4">
                    <label className="space-y-1.5 text-sm">
                        <span className="font-medium">First name *</span>
                        <Input
                            onChange={(event) => setFirstName(event.target.value)}
                            required
                            value={firstName}
                        />
                    </label>
                    <label className="space-y-1.5 text-sm">
                        <span className="font-medium">Last name</span>
                        <Input
                            onChange={(event) => setLastName(event.target.value)}
                            value={lastName}
                        />
                    </label>
                </div>
                <label className="block space-y-1.5 text-sm">
                    <span className="font-medium">Email</span>
                    <Input disabled value={user.email} />
                    <span className="block text-xs text-muted-foreground">
                        Email changes will require verification in a future update.
                    </span>
                </label>
                <div className="flex justify-end">
                    <Button disabled={saving} type="submit">
                        {saving ? "Saving…" : "Save personal profile"}
                    </Button>
                </div>
            </form>
        </section>
    );
}

function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [visibleFields, setVisibleFields] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const toggleVisibility = (field: keyof typeof visibleFields) => {
        setVisibleFields((current) => ({
            ...current,
            [field]: !current[field],
        }));
    };

    const changePassword = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage(null);
        setFormError(null);

        if (newPassword !== confirmPassword) {
            setFormError("New passwords do not match.");
            return;
        }
        if (currentPassword === newPassword) {
            setFormError("New password must be different from your current password.");
            return;
        }

        setSaving(true);
        try {
            const response = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword,
                    confirm_password: confirmPassword,
                }),
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                const detail = Array.isArray(payload.detail)
                    ? payload.detail[0]?.msg
                    : payload.detail;
                throw new Error(detail || "Unable to change password");
            }
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setMessage("Password changed successfully.");
        } catch (reason) {
            setFormError(
                reason instanceof Error ? reason.message : "Unable to change password",
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="border-b" id="password">
            <SectionHeading
                description="Use a strong password you do not reuse elsewhere."
                icon={<KeyRound className="size-4" />}
                title="Change password"
            />
            <form className="space-y-5 p-4" onSubmit={changePassword}>
                {formError ? (
                    <p className="border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                        {formError}
                    </p>
                ) : null}
                {message ? (
                    <p className="bg-emerald-500/10 p-3 text-sm text-emerald-700">
                        {message}
                    </p>
                ) : null}
                <label className="block space-y-1.5 text-sm">
                    <span className="font-medium">Current password</span>
                    <div className="relative">
                        <Input
                            autoComplete="current-password"
                            className="pr-10"
                            minLength={1}
                            onChange={(event) => setCurrentPassword(event.target.value)}
                            required
                            type={visibleFields.current ? "text" : "password"}
                            value={currentPassword}
                        />
                        <PasswordVisibilityButton
                            onClick={() => toggleVisibility("current")}
                            visible={visibleFields.current}
                        />
                    </div>
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-1.5 text-sm">
                        <span className="font-medium">New password</span>
                        <div className="relative">
                            <Input
                                autoComplete="new-password"
                                className="pr-10"
                                minLength={8}
                                onChange={(event) => setNewPassword(event.target.value)}
                                required
                                type={visibleFields.new ? "text" : "password"}
                                value={newPassword}
                            />
                            <PasswordVisibilityButton
                                onClick={() => toggleVisibility("new")}
                                visible={visibleFields.new}
                            />
                        </div>
                    </label>
                    <label className="space-y-1.5 text-sm">
                        <span className="font-medium">Confirm new password</span>
                        <div className="relative">
                            <Input
                                autoComplete="new-password"
                                className="pr-10"
                                minLength={8}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                required
                                type={visibleFields.confirm ? "text" : "password"}
                                value={confirmPassword}
                            />
                            <PasswordVisibilityButton
                                onClick={() => toggleVisibility("confirm")}
                                visible={visibleFields.confirm}
                            />
                        </div>
                    </label>
                </div>
                <div className="flex justify-end">
                    <Button disabled={saving} type="submit">
                        {saving ? "Updating…" : "Change password"}
                    </Button>
                </div>
            </form>
        </section>
    );
}

function PasswordVisibilityButton({
    onClick,
    visible,
}: {
    onClick: () => void;
    visible: boolean;
}) {
    const Icon = visible ? EyeOff : Eye;
    const label = visible ? "Hide password" : "Show password";

    return (
        <button
            aria-label={label}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            onClick={onClick}
            title={label}
            type="button"
        >
            <Icon className="size-4" />
        </button>
    );
}

export function ProfileSettings({
    section = "profile",
}: {
    section?: Extract<SettingsSection, "profile" | "business"> | "all";
}) {
    const { data, isLoading, error, refetch } = useQuery<AuthProfile>(
        {
            queryKey: ["auth", "me"],
            queryFn: async () => {
                const response = await fetch("/api/auth/me", {
                    cache: "no-store",
                });
                const payload = await response.json();

                if (!response.ok) {
                    throw new Error(payload.error || "Unable to load profile");
                }

                return payload;
            },
        },
    );

    if (isLoading) {
        return <ProfileLoading />;
    }

    if (error || !data?.user) {
        return (
            <section className="border-b bg-destructive/5 p-5 text-sm text-destructive">
                <p className="font-medium">Unable to load profile settings</p>
                <p className="mt-1 text-xs text-muted-foreground">
                    {error instanceof Error ? error.message : "Please try again."}
                </p>
                <Button
                    className="mt-3"
                    onClick={() => void refetch()}
                    size="sm"
                    type="button"
                    variant="outline"
                >
                    Try again
                </Button>
            </section>
        );
    }

    const isOwner = data.active_business?.role?.toLowerCase() === "owner";

    return (
        <div>
            <div>
                {section !== "business" ? (
                    <>
                        <PersonalProfile user={data.user} />
                        <ChangePassword />
                    </>
                ) : null}
                {isOwner && section !== "profile" ? (
                    <section className="border-b" id="business">
                        <SectionHeading
                            description="Update details for the active business."
                            icon={<Building2 className="size-4" />}
                            title="Business profile"
                        />
                        <div className="p-4">
                            <BusinessProfileForm mode="settings" />
                        </div>
                    </section>
                ) : null}
            </div>
        </div>
    );
}

function SectionHeading({
    description,
    icon,
    title,
}: {
    description: string;
    icon: ReactNode;
    title: string;
}) {
    return (
        <div className="flex items-start gap-3 border-b p-4">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center bg-muted text-primary rounded-md">
                {icon}
            </div>
            <div>
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                    {description}
                </p>
            </div>
        </div>
    );
}

function ProfileLoading() {
    return (
        <div className="space-y-px bg-border">
            <div className="h-16 animate-pulse bg-background" />
            <div className="h-64 animate-pulse bg-background" />
        </div>
    );
}
