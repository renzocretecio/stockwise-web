"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, EyeIcon, EyeOffIcon, LogIn } from "lucide-react";
import * as z from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import {
    hydrateSessionCache,
    resetSessionCache,
} from "@/modules/auth/services/session";
import { GoogleOAuthButton } from "@/modules/auth/components/GoogleOAuthButton";

const formSchema = z.object({
    email: z
        .string("Email is required")
        .min(1, "Email is required")
        .email("Enter a valid email address"),
    password: z.string("Password is required").min(1, "Password is required"),
});

export function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [error, setError] = useState<string | null>(() =>
        googleOAuthError(searchParams.get("oauth_error")),
    );
    const callbackUrl = searchParams.get("callbackUrl");
    const form = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
        validators: {
            onSubmit: formSchema,
        },
        onSubmit: async ({ value }) => {
            setError(null);
            setLoading(true);

            try {
                const response = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: value.email,
                        password: value.password,
                    }),
                });
                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    if (response.status === 429) {
                        setError("Too many attempts. Please wait a moment.");
                    } else if (response.status === 401) {
                        setError("Invalid email or password.");
                    } else {
                        setError(
                            data.error ||
                                data.message ||
                                "An error occurred during login.",
                        );
                    }
                    return;
                }

                await resetSessionCache(queryClient, {
                    clearReferenceData: true,
                });
                await hydrateSessionCache(queryClient).catch(() => undefined);

                const callbackUrl = searchParams.get("callbackUrl");
                const destination =
                    callbackUrl?.startsWith("/") &&
                    !callbackUrl.startsWith("//")
                        ? callbackUrl
                        : "/dashboard";
                router.replace(destination);
                router.refresh();
            } catch {
                setError("Network error. Please try again.");
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <div>
            {error ? (
                <Alert
                    aria-live="polite"
                    className="mb-5"
                    variant="destructive"
                >
                    <AlertCircle className="size-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            ) : null}

            <GoogleOAuthButton
                callbackUrl={callbackUrl}
                label="Continue with Google"
            />

            <div className="my-6 flex items-center gap-3" role="separator">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">
                    or sign in with email
                </span>
                <span className="h-px flex-1 bg-border" />
            </div>

            <form
                className="space-y-6"
                onSubmit={(event) => {
                    event.preventDefault();
                    form.handleSubmit();
                }}
            >
                <FieldGroup className="gap-5">
                    <form.Field name="email">
                        {(field) => {
                            const invalid =
                                field.state.meta.isTouched &&
                                !field.state.meta.isValid;

                            return (
                                <Field data-invalid={invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Email address
                                    </FieldLabel>
                                    <Input
                                        aria-invalid={invalid}
                                        autoComplete="email"
                                        autoFocus
                                        className={
                                            "h-11 rounded-2xl border-border " +
                                            "bg-background px-4"
                                        }
                                        disabled={loading}
                                        id={field.name}
                                        name={field.name}
                                        onBlur={field.handleBlur}
                                        onChange={(event) =>
                                            field.handleChange(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="you@business.com"
                                        type="email"
                                        value={field.state.value}
                                    />
                                    {invalid ? (
                                        <FieldError
                                            errors={field.state.meta.errors}
                                        />
                                    ) : null}
                                </Field>
                            );
                        }}
                    </form.Field>

                    <form.Field name="password">
                        {(field) => {
                            const invalid =
                                field.state.meta.isTouched &&
                                !field.state.meta.isValid;

                            return (
                                <Field data-invalid={invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Password
                                    </FieldLabel>
                                    <InputGroup
                                        className={
                                            "h-11 rounded-2xl border-border " +
                                            "bg-background"
                                        }
                                    >
                                        <InputGroupInput
                                            aria-invalid={invalid}
                                            autoComplete="current-password"
                                            disabled={loading}
                                            id={field.name}
                                            name={field.name}
                                            onBlur={field.handleBlur}
                                            onChange={(event) =>
                                                field.handleChange(
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Enter your password"
                                            type={
                                                isVisible ? "text" : "password"
                                            }
                                            value={field.state.value}
                                        />
                                        <InputGroupAddon align="inline-end">
                                            <Button
                                                aria-label={
                                                    isVisible
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
                                                className="cursor-pointer"
                                                onClick={() =>
                                                    setIsVisible(
                                                        (current) => !current,
                                                    )
                                                }
                                                size="icon-sm"
                                                type="button"
                                                variant="ghost"
                                            >
                                                {isVisible ? (
                                                    <EyeOffIcon />
                                                ) : (
                                                    <EyeIcon />
                                                )}
                                            </Button>
                                        </InputGroupAddon>
                                    </InputGroup>
                                    {invalid ? (
                                        <FieldError
                                            errors={field.state.meta.errors}
                                        />
                                    ) : null}
                                </Field>
                            );
                        }}
                    </form.Field>
                </FieldGroup>

                <Button
                    className="h-11 w-full"
                    disabled={loading}
                    size="lg"
                    type="submit"
                >
                    <LogIn className="size-4" />
                    {loading ? "Signing in…" : "Sign in"}
                </Button>
            </form>

            <p className="mt-7 text-center text-sm text-muted-foreground">
                New to StockWise?{" "}
                <Link
                    className="font-semibold text-primary hover:underline"
                    href={
                        callbackUrl
                            ? `/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`
                            : "/signup"
                    }
                >
                    Create an account
                </Link>
            </p>
        </div>
    );
}

function googleOAuthError(code: string | null) {
    if (!code) return null;
    const messages: Record<string, string> = {
        not_configured: "Google sign-in has not been configured yet.",
        cancelled: "Google sign-in was cancelled.",
        invalid_state: "Google sign-in expired. Please try again.",
        exchange_failed: "Google could not verify this sign-in.",
        businesses_failed: "Unable to load your businesses after sign-in.",
        unavailable: "Google sign-in is temporarily unavailable.",
    };
    return messages[code] ?? "Google sign-in failed. Please try again.";
}
