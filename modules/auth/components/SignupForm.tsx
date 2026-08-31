"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    business_name: "",
  });

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
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || "Unable to create account");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <fieldset className="grid gap-4 sm:grid-cols-2" disabled={loading}>
        <legend className="mb-3 text-sm font-semibold sm:col-span-2">
          Your account
        </legend>
        <Input
          required
          value={form.first_name}
          onChange={(event) => update("first_name", event.target.value)}
          placeholder="First name"
          autoComplete="given-name"
        />
        <Input
          value={form.last_name}
          onChange={(event) => update("last_name", event.target.value)}
          placeholder="Last name"
          autoComplete="family-name"
        />
        <Input
          required
          type="email"
          value={form.email}
          onChange={(event) => update("email", event.target.value)}
          placeholder="Email address"
          autoComplete="email"
          className="sm:col-span-2"
        />
        <Input
          required
          minLength={8}
          type="password"
          value={form.password}
          onChange={(event) => update("password", event.target.value)}
          placeholder="Password (at least 8 characters)"
          autoComplete="new-password"
          className="sm:col-span-2"
        />
      </fieldset>

      <fieldset className="border-t pt-5" disabled={loading}>
        <legend className="mb-3 text-sm font-semibold">
          Your business
        </legend>
        <Input
          required
          value={form.business_name}
          onChange={(event) => update("business_name", event.target.value)}
          placeholder="Business name"
          autoComplete="organization"
        />
      </fieldset>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating account…" : "Create account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary">
          Sign in
        </Link>
      </p>
    </form>
  );
}
