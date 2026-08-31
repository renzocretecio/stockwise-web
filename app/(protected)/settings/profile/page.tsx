import { ProfileSettings } from "@/modules/auth/components/ProfileSettings";

export default function ProfileSettingsPage() {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal account and active business information.
        </p>
      </div>
      <ProfileSettings />
    </div>
  );
}
