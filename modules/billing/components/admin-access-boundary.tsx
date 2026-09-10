"use client";

import Link from "next/link";

import { useBillingAdminAccess } from "@/modules/billing/services/billing";

export function AdminAccessBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = useBillingAdminAccess();

  if (access.isPending) {
    return <div className="h-72 animate-pulse rounded-2xl bg-muted/40" />;
  }

  if (access.isError || !access.data?.authorized) {
    return (
      <section className="mx-auto max-w-xl rounded-2xl border bg-card p-8">
        <p className="text-sm font-medium text-destructive">
          Platform administrator access is required.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          This area is separate from your business workspace.
        </p>
        <Link
          className={
            "mt-5 inline-flex h-9 items-center rounded-2xl border " +
            "px-3 text-sm font-medium"
          }
          href="/dashboard/overview"
        >
          Go to dashboard
        </Link>
      </section>
    );
  }

  return children;
}
