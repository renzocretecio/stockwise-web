"use client";

import { useSyncExternalStore } from "react";
import { AlertTriangle, Check, RefreshCw, ShieldAlert } from "lucide-react";

import { offlineSyncStore } from "@/lib/offline-sync";
import { Button } from "@/components/ui/button";
import { requestPlanUpgrade } from
  "@/modules/billing/upgrade-events";

export function SyncStatus() {
  const snapshot = useSyncExternalStore(
    offlineSyncStore.subscribe,
    offlineSyncStore.getSnapshot,
    offlineSyncStore.getServerSnapshot,
  );

  const waiting = snapshot.pending + snapshot.failed;

  if (snapshot.status === "plan-required" && waiting > 0) {
    return (
      <StatusBar className="bg-primary/10 text-primary">
        <ShieldAlert className="size-3.5 shrink-0" />
        <span className="flex-1">
          {waiting} saved offline change{waiting === 1 ? "" : "s"} {" "}
          {waiting === 1 ? "requires" : "require"}
          Pro to sync.
        </span>
        <Button
          className="h-6 px-2 text-[11px]"
          onClick={() =>
            requestPlanUpgrade({
              feature: "offline_sync",
              title: "Offline sync is available on Pro",
            })
          }
          size="sm"
          type="button"
        >
          View Pro
        </Button>
      </StatusBar>
    );
  }

  if (snapshot.authRequired > 0) {
    return (
      <StatusBar className="bg-amber-500/10 text-amber-900 dark:text-amber-100">
        <ShieldAlert className="size-3.5 shrink-0" />
        <span>
          Sign in again to sync {snapshot.authRequired} offline change
          {snapshot.authRequired === 1 ? "" : "s"}.
        </span>
      </StatusBar>
    );
  }

  if (snapshot.conflicts > 0) {
    return (
      <StatusBar className="bg-destructive/10 text-destructive">
        <AlertTriangle className="size-3.5 shrink-0" />
        <span>
          {snapshot.conflicts} offline change
          {snapshot.conflicts === 1 ? " needs" : "s need"} review.
        </span>
      </StatusBar>
    );
  }

  if (snapshot.status === "syncing") {
    return (
      <StatusBar className="bg-primary/10 text-primary">
        <RefreshCw className="size-3.5 shrink-0 animate-spin" />
        <span>
          Syncing {Math.max(waiting, 1)} offline change
          {waiting === 1 ? "" : "s"}.
        </span>
      </StatusBar>
    );
  }

  if (waiting > 0) {
    return (
      <StatusBar className="bg-amber-500/10 text-amber-900 dark:text-amber-100">
        <RefreshCw className="size-3.5 shrink-0" />
        <span>
          {waiting} change{waiting === 1 ? "" : "s"} waiting to sync.
        </span>
      </StatusBar>
    );
  }

  if (snapshot.status === "synced") {
    return (
      <StatusBar className="bg-emerald-500/10 text-emerald-800 dark:text-emerald-100">
        <Check className="size-3.5 shrink-0" />
        <span>All offline changes synced.</span>
      </StatusBar>
    );
  }

  if (snapshot.status === "idle" && snapshot.pending === 0) return null;

  return null;
}

function StatusBar({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <div
      data-no-print="true"
      className={
        `flex items-center gap-2 border-b px-4 py-2 text-xs ${className}`
      }
    >
      {children}
    </div>
  );
}
