"use client";

import { FormEvent, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BusinessProfileForm } from "@/modules/business/components/BusinessProfileForm";

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

function PersonalProfileCard({ user }: { user: UserProfile }) {
  const queryClient = useQueryClient();
  const [firstName, setFirstName] = useState(user.first_name || "");
  const [lastName, setLastName] = useState(user.last_name || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const savePersonalProfile = async (event: FormEvent) => {
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
    <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <UserRound className="size-5" />
            </div>
            <div>
              <CardTitle>Personal profile</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage the name displayed throughout StockWise.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={savePersonalProfile} className="space-y-4">
            {formError && (
              <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {formError}
              </p>
            )}
            {message && (
              <p className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-700">
                {message}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm">
                <span className="font-medium">First name *</span>
                <Input
                  required
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                />
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="font-medium">Last name</span>
                <Input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                />
              </label>
            </div>
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">Email</span>
              <Input value={user.email} disabled />
              <span className="block text-xs text-muted-foreground">
                Email changes will require verification in a future update.
              </span>
            </label>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save personal profile"}
            </Button>
          </form>
        </CardContent>
    </Card>
  );
}

export function ProfileSettings() {
  const { data, isLoading, error } = useQuery<AuthProfile>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to load profile");
      }
      return payload;
    },
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading profile…</p>;
  }
  if (error || !data?.user) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Unable to load profile"}
      </p>
    );
  }

  const isOwner = data.active_business?.role?.toLowerCase() === "owner";

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <PersonalProfileCard user={data.user} />

      {isOwner && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Building2 className="size-5" />
              </div>
              <div>
                <CardTitle>Business profile</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Update details for the active business.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <BusinessProfileForm mode="settings" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
