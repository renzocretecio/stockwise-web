"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscriptionLabel } from "@/lib/subscription-label";
import {
  authKeys,
  hydrateSessionCache,
  resetSessionCache,
  useSession,
} from "@/modules/auth/services/session";

export function CreateBusinessForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Unable to create business");
      }
      await resetSessionCache(queryClient);
      await hydrateSessionCache(queryClient).catch(() => undefined);
      router.replace("/onboarding/business");
      router.refresh();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to create business",
      );
    } finally {
      setSaving(false);
    }
  };

  const switchBusiness = async (businessId: string) => {
    const response = await fetch("/api/auth/business", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ business_id: businessId }),
    });
    const result = await response.json().catch(() => ({}));
    if (response.ok && result.active_business) {
      const business = result.active_business;
      await resetSessionCache(queryClient);
      queryClient.setQueryData(authKeys.me, {
        ...session,
        active_business: business,
        business_id: business.id,
        business_name: business.name,
        permissions: business.permissions ?? [],
      });
      router.replace("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-sm font-semibold">Your businesses</h2>
        {session?.businesses?.map((business) => {
          const active = business.id === session.active_business?.id;
          return (
            <div
              key={business.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="font-medium">{business.name}</p>
                <p className="text-xs capitalize text-muted-foreground">
                  {business.role} · {subscriptionLabel(
                    business.plan,
                    business.subscription_status,
                  )}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant={active ? "secondary" : "outline"}
                disabled={active}
                onClick={() => switchBusiness(business.id)}
              >
                {active ? "Active" : "Switch"}
              </Button>
            </div>
          );
        })}
      </div>

      <form onSubmit={submit} className="space-y-4 border-t pt-5">
      {error && (
        <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium">Business name *</span>
        <Input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Enter the new business name"
          autoComplete="organization"
          disabled={saving}
        />
      </label>
      <p className="text-sm text-muted-foreground">
        You will become the owner and configure its currency, timezone, and
        other details in the next step.
      </p>
        <Button type="submit" disabled={saving}>
          {saving ? "Creating…" : "Create business"}
        </Button>
      </form>
    </div>
  );
}
