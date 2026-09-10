"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { resetSessionCache } from "@/modules/auth/services/session";

type InvitationDetails = {
    business_name: string;
    email: string;
    role: string;
    expires_at: string;
};

export default function AcceptInvitationPage() {
    return (
        <Suspense fallback={<InvitationPageLoading />}>
            <AcceptInvitationContent />
        </Suspense>
    );
}

function AcceptInvitationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const token = searchParams.get("token") ?? "";
    const [details, setDetails] = useState<InvitationDetails | null>(null);
    const [loading, setLoading] = useState(Boolean(token));
    const [accepting, setAccepting] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [error, setError] = useState<string | null>(
        token ? null : "This invitation link is incomplete.",
    );
    const callbackUrl = `/invitations/accept?token=${encodeURIComponent(token)}`;

    useEffect(() => {
        if (!token) {
            return;
        }
        void fetch(`/api/invitations/${encodeURIComponent(token)}`, {
            cache: "no-store",
        })
            .then(async (response) => {
                const payload = await response.json().catch(() => ({}));
                if (!response.ok) {
                    throw new Error(
                        payload.detail ?? "This invitation is not available.",
                    );
                }
                setDetails(payload);
            })
            .catch((reason: Error) => setError(reason.message))
            .finally(() => setLoading(false));
    }, [token]);

    const accept = async () => {
        setAccepting(true);
        setError(null);
        try {
            const response = await fetch("/api/invitations/accept", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            });
            const payload = await response.json().catch(() => ({}));
            if (response.status === 401) {
                router.push(
                    `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`,
                );
                return;
            }
            if (!response.ok) {
                throw new Error(
                    payload.detail ??
                        payload.error ??
                        "Unable to accept this invitation.",
                );
            }
            setAccepted(true);
            window.setTimeout(async () => {
                await resetSessionCache(queryClient);
                router.replace("/dashboard");
                router.refresh();
            }, 800);
        } catch (reason) {
            setError(
                reason instanceof Error
                    ? reason.message
                    : "Unable to accept this invitation.",
            );
        } finally {
            setAccepting(false);
        }
    };

    return (
        <main className="flex min-h-dvh items-center justify-center bg-muted/30 p-4">
            <section
                className={
                    "w-full max-w-lg rounded-2xl border bg-background " +
                    "p-6 shadow-sm sm:p-8"
                }
            >
                <div
                    className={
                        "flex size-11 items-center justify-center " +
                        "rounded-2xl bg-primary/10 text-primary"
                    }
                >
                    <ShieldCheck className="size-5" />
                </div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    StockWise invitation
                </p>
                {loading ? (
                    <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        Checking invitation…
                    </div>
                ) : accepted ? (
                    <div className="py-6">
                        <CheckCircle2 className="size-6 text-emerald-600" />
                        <h1 className="mt-3 text-xl font-semibold">
                            You joined {details?.business_name}
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Opening the business dashboard…
                        </p>
                    </div>
                ) : details ? (
                    <div>
                        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
                            Join {details.business_name}
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            You were invited as {titleCase(details.role)} using{" "}
                            <span className="font-medium text-foreground">
                                {details.email}
                            </span>
                            .
                        </p>
                        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                            <Button
                                className="rounded-2xl"
                                disabled={accepting}
                                onClick={() => void accept()}
                            >
                                {accepting ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <CheckCircle2 />
                                )}
                                Accept invitation
                            </Button>
                            <Link
                                className={cn(
                                    buttonVariants({ variant: "outline" }),
                                    "rounded-2xl",
                                )}
                                href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                            >
                                Sign in with another account
                            </Link>
                            <Link
                                className={cn(
                                    buttonVariants({ variant: "ghost" }),
                                    "rounded-2xl",
                                )}
                                href={`/signup?invitation=${encodeURIComponent(token)}`}
                            >
                                Create an account
                            </Link>
                        </div>
                    </div>
                ) : null}
                {error ? (
                    <div className="mt-5 flex gap-2 border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                        <AlertCircle className="mt-0.5 size-4 shrink-0" />
                        <p>{error}</p>
                    </div>
                ) : null}
            </section>
        </main>
    );
}

function InvitationPageLoading() {
    return (
        <main className="flex min-h-dvh items-center justify-center bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Checking invitation…
            </div>
        </main>
    );
}

function titleCase(value: string) {
    return value.replace(/\b\w/g, (character) => character.toUpperCase());
}
