"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  markOfflineSync,
  markOfflineSyncPlanRequired,
  setOfflineSyncEnabled,
  syncOutbox,
} from "@/lib/offline-sync";
import { useOfflineEntitlement } from
  "@/modules/billing/services/billing";
import { useSession } from "@/modules/auth/services/session";
import { clearReferenceData } from "@/lib/offline-db";
import { useReferenceCatalog } from
  "@/modules/offline/services/reference-data";

function updateWorkerAccess(enabled: boolean) {
  if (
    process.env.NODE_ENV !== "production" ||
    !("serviceWorker" in navigator)
  ) {
    return;
  }

  const notify = (worker: ServiceWorker | null) => {
    if (!worker) return;
    worker.postMessage({
      type: "SET_OFFLINE_ACCESS",
      enabled,
    });
    if (enabled) {
      worker.postMessage({
        type: "CACHE_PAGE",
        url: window.location.href,
        assets: performance.getEntriesByType("resource")
          .map((entry) => entry.name)
          .filter((url) => url.includes("/_next/static/")),
      });
    }
  };

  notify(navigator.serviceWorker.controller);
  void navigator.serviceWorker.ready.then((registration) => {
    notify(registration.active);
  });
}

export function OfflineSync() {
  const queryClient = useQueryClient();
  const session = useSession();
  const { enabled, resolved } = useOfflineEntitlement();
  const businessId = session.data?.active_business?.id;

  const { refetch: refetchReferenceCatalog } = useReferenceCatalog();

  useEffect(() => {
    if (!resolved) return;

    setOfflineSyncEnabled(enabled);
    updateWorkerAccess(enabled);
    if (!enabled) {
      if (businessId) {
        void clearReferenceData(businessId);
      }
      void markOfflineSyncPlanRequired();
      return;
    }

    const sync = () => {
      void syncOutbox(queryClient);
    };

    const handleOnline = () => {
      sync();
      void refetchReferenceCatalog();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", markOfflineSync);
    sync();
    const interval = window.setInterval(sync, 30_000);

    return () => {
      setOfflineSyncEnabled(false);
      updateWorkerAccess(false);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", markOfflineSync);
      window.clearInterval(interval);
    };
  }, [
    businessId,
    enabled,
    queryClient,
    refetchReferenceCatalog,
    resolved,
  ]);

  return null;
}
