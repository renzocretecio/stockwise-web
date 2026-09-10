"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
    AlertCircle,
    Check,
    EyeIcon,
    EyeOffIcon,
    UserPlus,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    hydrateSessionCache,
    resetSessionCache,
} from "@/modules/auth/services/session";
import { GoogleOAuthButton } from "@/modules/auth/components/GoogleOAuthButton";

export function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        business_name: "",
    });
    const requestedCallback = searchParams.get("callbackUrl");
    const invitationToken =
        searchParams.get("invitation") ??
        invitationFromCallback(requestedCallback);
    const callbackUrl = invitationToken
        ? `/invitations/accept?token=${encodeURIComponent(invitationToken)}`
        : null;

    const update = (field: keyof typeof form, value: string) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    invitationToken
                        ? {
                              first_name: form.first_name,
                              last_name: form.last_name,
                              password: form.password,
                              invitation_token: invitationToken,
                          }
                        : form,
                ),
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setError(
                    data.error || data.message || "Unable to create account.",
                );
                return;
            }

            await resetSessionCache(queryClient, {
                clearReferenceData: true,
            });
            await hydrateSessionCache(queryClient).catch(() => undefined);

            router.replace("/dashboard");
            router.refresh();
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <GoogleOAuthButton
                callbackUrl={callbackUrl}
                label="Sign up with Google"
            />

            <div className="my-6 flex items-center gap-3" role="separator">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">
                    or create an account with email
                </span>
                <span className="h-px flex-1 bg-border" />
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                {error ? (
                    <Alert aria-live="polite" variant="destructive">
                        <AlertCircle className="size-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : null}

                <fieldset
                    className="grid gap-5 sm:grid-cols-2"
                    disabled={loading}
                >
                    <legend className="sr-only">
                        Owner and business details
                    </legend>

                    <FormField label="First name" name="first_name">
                        <Input
                            autoComplete="given-name"
                            autoFocus
                            className={inputClassName}
                            id="first_name"
                            onChange={(event) =>
                                update("first_name", event.target.value)
                            }
                            placeholder="Juan"
                            required
                            value={form.first_name}
                        />
                    </FormField>

                    <FormField label="Last name" name="last_name">
                        <Input
                            autoComplete="family-name"
                            className={inputClassName}
                            id="last_name"
                            onChange={(event) =>
                                update("last_name", event.target.value)
                            }
                            placeholder="Dela Cruz"
                            value={form.last_name}
                        />
                    </FormField>

                    {!invitationToken ? (
                        <FormField
                            className="sm:col-span-2"
                            label="Email address"
                            name="email"
                        >
                            <Input
                                autoComplete="email"
                                className={inputClassName}
                                id="email"
                                onChange={(event) =>
                                    update("email", event.target.value)
                                }
                                placeholder="you@business.com"
                                required
                                type="email"
                                value={form.email}
                            />
                        </FormField>
                    ) : (
                        <p className="bg-muted/50 p-3 text-xs text-muted-foreground sm:col-span-2">
                            Your account will use the email address from the
                            invitation.
                        </p>
                    )}

                    <FormField
                        className="sm:col-span-2"
                        label="Password"
                        name="password"
                    >
                        <div className="relative">
                            <Input
                                autoComplete="new-password"
                                className={`${inputClassName} pr-11`}
                                id="password"
                                minLength={8}
                                onChange={(event) =>
                                    update("password", event.target.value)
                                }
                                placeholder="At least 8 characters"
                                required
                                type={passwordVisible ? "text" : "password"}
                                value={form.password}
                            />
                            <Button
                                aria-label={
                                    passwordVisible
                                        ? "Hide password"
                                        : "Show password"
                                }
                                className={
                                    "absolute right-1.5 top-1/2 -translate-y-1/2 " +
                                    "cursor-pointer"
                                }
                                onClick={() =>
                                    setPasswordVisible((current) => !current)
                                }
                                size="icon-sm"
                                type="button"
                                variant="ghost"
                            >
                                {passwordVisible ? <EyeOffIcon /> : <EyeIcon />}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Use at least eight characters.
                        </p>
                    </FormField>

                    {!invitationToken ? (
                        <>
                            <div className="border-t sm:col-span-2" />
                            <FormField
                                className="sm:col-span-2"
                                label="Business name"
                                name="business_name"
                            >
                                <Input
                                    autoComplete="organization"
                                    className={inputClassName}
                                    id="business_name"
                                    onChange={(event) =>
                                        update(
                                            "business_name",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Your store or company"
                                    required
                                    value={form.business_name}
                                />
                                <p className="text-xs text-muted-foreground">
                                    You can add more business details after
                                    signup.
                                </p>
                            </FormField>
                        </>
                    ) : null}
                </fieldset>

                {!invitationToken ? (
                    <div
                        className={
                            "flex gap-3 rounded-2xl bg-primary/5 p-4 " +
                            "text-sm"
                        }
                    >
                        <span
                            className={
                                "mt-0.5 flex size-5 shrink-0 items-center " +
                                "justify-center rounded-full bg-primary " +
                                "text-primary-foreground"
                            }
                        >
                            <Check className="size-3" />
                        </span>
                        <p className="leading-6 text-muted-foreground">
                            Your 14-day Pro trial starts when this business is
                            created. No card is required, and your data stays
                            safe if you return to Free.
                        </p>
                    </div>
                ) : null}

                <Button
                    className="h-11 w-full"
                    disabled={loading}
                    size="lg"
                    type="submit"
                >
                    <UserPlus className="size-4" />
                    {loading
                        ? "Creating your account…"
                        : invitationToken
                          ? "Create account and join"
                          : "Create account"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                        className="font-semibold text-primary hover:underline"
                        href={
                            callbackUrl
                                ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
                                : "/login"
                        }
                    >
                        Sign in
                    </Link>
                </p>
            </form>
        </div>
    );
}

function FormField({
    children,
    className = "",
    label,
    name,
}: {
    children: React.ReactNode;
    className?: string;
    label: string;
    name: string;
}) {
    return (
        <div className={`space-y-2 ${className}`}>
            <Label htmlFor={name}>{label}</Label>
            {children}
        </div>
    );
}

const inputClassName = "h-11 rounded-2xl border-border bg-background px-4";

function invitationFromCallback(callbackUrl: string | null) {
    if (!callbackUrl?.startsWith("/invitations/accept?")) {
        return null;
    }
    return new URL(callbackUrl, "http://stockwise.local").searchParams.get(
        "token",
    );
}
