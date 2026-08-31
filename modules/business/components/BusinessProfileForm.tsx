"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CURRENCIES = ["PHP", "USD", "EUR", "GBP", "JPY", "SGD", "AUD"];
const TIMEZONES = [
  "Asia/Manila",
  "Asia/Singapore",
  "Asia/Tokyo",
  "America/New_York",
  "Europe/London",
  "UTC",
];

const EMPTY_PROFILE = {
  name: "",
  industry: "",
  email: "",
  phone: "",
  address: "",
  currency_code: "PHP",
  timezone: "Asia/Manila",
};

type BusinessProfileFormProps = {
  mode?: "onboarding" | "settings";
};

export function BusinessProfileForm({
  mode = "onboarding",
}: BusinessProfileFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/onboarding", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || data.error || "Unable to load profile");
        }
        if (active) {
          setForm({ ...EMPTY_PROFILE, ...data.business });
        }
      })
      .catch((reason) => {
        if (active) setError(reason.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const response = await fetch("/api/auth/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Unable to save business profile");
      }
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      if (mode === "onboarding") {
        router.replace("/dashboard");
        router.refresh();
      } else {
        setSaved(true);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading business…</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && (
        <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {saved && (
        <p className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-700">
          Business settings saved.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm sm:col-span-2">
          <span className="font-medium">Business name *</span>
          <Input
            required
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
          />
        </label>
        <label className="space-y-1.5 text-sm sm:col-span-2">
          <span className="font-medium">Industry</span>
          <Input
            value={form.industry || ""}
            onChange={(event) => update("industry", event.target.value)}
            placeholder="Retail, restaurant, distribution…"
          />
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Currency *</span>
          <select
            required
            value={form.currency_code}
            onChange={(event) => update("currency_code", event.target.value)}
            className="h-9 w-full rounded-md border bg-background px-3"
          >
            {CURRENCIES.map((currency) => (
              <option key={currency}>{currency}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Timezone *</span>
          <select
            required
            value={form.timezone}
            onChange={(event) => update("timezone", event.target.value)}
            className="h-9 w-full rounded-md border bg-background px-3"
          >
            {TIMEZONES.map((timezone) => (
              <option key={timezone}>{timezone}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Business email</span>
          <Input
            type="email"
            value={form.email || ""}
            onChange={(event) => update("email", event.target.value)}
          />
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Phone</span>
          <Input
            value={form.phone || ""}
            onChange={(event) => update("phone", event.target.value)}
          />
        </label>
        <label className="space-y-1.5 text-sm sm:col-span-2">
          <span className="font-medium">Address</span>
          <textarea
            rows={3}
            value={form.address || ""}
            onChange={(event) => update("address", event.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2"
          />
        </label>
      </div>
      <Button type="submit" className="w-full" disabled={saving}>
        {saving
          ? "Saving…"
          : mode === "onboarding"
            ? "Finish setup"
            : "Save business settings"}
      </Button>
    </form>
  );
}
