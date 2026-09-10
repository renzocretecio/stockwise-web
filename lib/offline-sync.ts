import type { QueryClient } from "@tanstack/react-query";

import { ApiError, ApiOfflineError, apiClient } from "@/lib/api-client";
import {
  offlineDb,
  type OfflineMutationType,
  type OfflineOperation,
} from "@/lib/offline-db";
import { requestPlanUpgrade } from
  "@/modules/billing/upgrade-events";

export type QueuedMutation = {
  queued: true;
  operationId: string;
  clientEventId: string;
};

type SyncStatus =
  | "idle"
  | "syncing"
  | "synced"
  | "offline"
  | "auth-required"
  | "plan-required"
  | "error";

export type OfflineSyncSnapshot = {
  status: SyncStatus;
  pending: number;
  failed: number;
  conflicts: number;
  authRequired: number;
};

const ONLINE_REQUEST_TIMEOUT_MS = 10_000;
const SYNC_REQUEST_TIMEOUT_MS = 20_000;
const MAX_SYNC_ATTEMPTS = 5;

const syncListeners = new Set<() => void>();
let syncSnapshot: OfflineSyncSnapshot = {
  status: "idle",
  pending: 0,
  failed: 0,
  conflicts: 0,
  authRequired: 0,
};
let offlineSyncEnabled = false;

export const setOfflineSyncEnabled = (enabled: boolean) => {
  offlineSyncEnabled = enabled;
};

export const offlineSyncStore = {
  getSnapshot: () => syncSnapshot,
  getServerSnapshot: () => syncSnapshot,
  subscribe: (listener: () => void) => {
    syncListeners.add(listener);
    return () => syncListeners.delete(listener);
  },
};

const notifySyncListeners = () => {
  for (const listener of syncListeners) listener();
};

const setSyncStatus = (status: SyncStatus) => {
  syncSnapshot = { ...syncSnapshot, status };
  notifySyncListeners();
};

export const markOfflineSync = () => {
  setSyncStatus("offline");
};

export async function markOfflineSyncPlanRequired() {
  await refreshSyncSnapshot("plan-required");
}

async function refreshSyncSnapshot(status = syncSnapshot.status) {
  const operations = await offlineDb.outbox.toArray();

  syncSnapshot = {
    status,
    pending: operations.filter(
      (item) => item.status === "pending" || item.status === "syncing",
    ).length,
    failed: operations.filter((item) => item.status === "failed").length,
    conflicts: operations.filter((item) => item.status === "conflict").length,
    authRequired: operations.filter((item) => item.status === "auth-required")
      .length,
  };

  notifySyncListeners();
}

async function resolveFinalSyncStatus(): Promise<SyncStatus> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return "offline";
  }

  const operations = await offlineDb.outbox.toArray();

  if (operations.some((item) => item.status === "auth-required")) {
    return "auth-required";
  }

  if (
    operations.some(
      (item) => item.status === "failed" || item.status === "conflict",
    )
  ) {
    return "error";
  }

  if (
    operations.some(
      (item) => item.status === "pending" || item.status === "syncing",
    )
  ) {
    return "syncing";
  }

  return "synced";
}

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const isNetworkFailure = (error: unknown) =>
  error instanceof ApiOfflineError ||
  error instanceof TypeError ||
  (typeof DOMException !== "undefined" &&
    error instanceof DOMException &&
    error.name === "AbortError") ||
  (error instanceof Error && error.name === "NetworkError");

const requestWithTimeout = async <T>(
  endpoint: string,
  options: RequestInit,
  timeoutMs: number,
) => {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await apiClient<T>(endpoint, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    globalThis.clearTimeout(timeout);
  }
};

const canUseOfflineQueue = () =>
  typeof window !== "undefined" &&
  typeof navigator !== "undefined" &&
  !navigator.onLine;

async function recoverInterruptedOperations() {
  const now = Date.now();
  const interrupted = await offlineDb.outbox
    .where("status")
    .equals("syncing")
    .toArray();

  await Promise.all(
    interrupted.map((operation) =>
      offlineDb.outbox.update(operation.id, {
        status: "pending",
        syncStartedAt: undefined,
        updatedAt: now,
        error: "Previous sync was interrupted and will be retried.",
      }),
    ),
  );
}

export async function executeOrQueue<T>(
  type: OfflineMutationType,
  payload: unknown,
  endpoint: string,
  invalidateQueryKeys: readonly (readonly unknown[])[],
): Promise<T | QueuedMutation> {
  const idempotencyKey = createId();
  const occurredAt = new Date().toISOString();

  const normalizedPayload =
    type === "physical_count" &&
    typeof payload === "object" &&
    payload !== null &&
    "action" in payload &&
    payload.action === "start" &&
    !("client_count_id" in payload)
      ? { ...payload, client_count_id: idempotencyKey }
      : payload;

  const headers = new Headers({ "Content-Type": "application/json" });
  headers.set("Idempotency-Key", idempotencyKey);

  if (!canUseOfflineQueue()) {
    try {
      const requestPayload =
        endpoint === "/api/sync/mutations"
          ? {
              client_event_id: idempotencyKey,
              type,
              payload: normalizedPayload,
              occurred_at: occurredAt,
            }
          : normalizedPayload;

      return await requestWithTimeout<T>(
        endpoint,
        {
          method: "POST",
          headers,
          body: JSON.stringify(requestPayload),
        },
        ONLINE_REQUEST_TIMEOUT_MS,
      );
    } catch (error) {
      // API validation/server errors should surface normally. Only genuine
      // connectivity failures fall back to the durable outbox.
      if (!isNetworkFailure(error)) throw error;
    }
  }

  if (!offlineSyncEnabled) {
    const detail = {
      code: "plan_feature_required",
      feature: "offline_sync",
      message: "Offline changes and automatic sync require the Pro plan.",
      title: "Offline mode is available on Pro",
    };
    requestPlanUpgrade(detail);
    throw new ApiError(402, detail.message, { detail });
  }

  const now = Date.now();
  const operation: OfflineOperation = {
    id: createId(),
    idempotencyKey,
    type,
    payload: normalizedPayload,
    occurredAt,
    invalidateQueryKeys,
    status: "pending",
    createdAt: now,
    updatedAt: now,
    attempts: 0,
  };

  await offlineDb.outbox.add(operation);
  await refreshSyncSnapshot("offline");

  return {
    queued: true,
    operationId: operation.id,
    clientEventId: idempotencyKey,
  };
}

let syncPromise: Promise<void> | undefined;

export async function syncOutbox(queryClient: QueryClient) {
  if (!offlineSyncEnabled) {
    await markOfflineSyncPlanRequired();
    return;
  }

  if (typeof navigator === "undefined" || !navigator.onLine) {
    await refreshSyncSnapshot("offline");
    return;
  }

  if (syncPromise) {
    return syncPromise;
  }

  // A page refresh/browser close can leave an item stuck as "syncing".
  // No previous in-memory request can still be active at this point, so it is
  // safe to move those records back to pending before starting a new run.
  await recoverInterruptedOperations();

  syncPromise = (async () => {
    setSyncStatus("syncing");

    const retryableOperations = await offlineDb.outbox
      .where("status")
      .anyOf("pending", "failed")
      .sortBy("createdAt");

    const operations = retryableOperations.filter(
      (operation) => operation.attempts < MAX_SYNC_ATTEMPTS,
    );

    if (operations.length === 0) {
      const finalStatus = await resolveFinalSyncStatus();
      await refreshSyncSnapshot(finalStatus === "synced" ? "idle" : finalStatus);
      return;
    }

    for (const operation of operations) {
      if (!navigator.onLine) {
        break;
      }

      const now = Date.now();
      await offlineDb.outbox.update(operation.id, {
        status: "syncing",
        attempts: operation.attempts + 1,
        lastAttemptAt: now,
        syncStartedAt: now,
        updatedAt: now,
        error: undefined,
      });

      try {
        await requestWithTimeout(
          "/api/sync/mutations",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Idempotency-Key": operation.idempotencyKey,
            },
            body: JSON.stringify({
              client_event_id: operation.idempotencyKey,
              type: operation.type,
              payload: operation.payload,
              occurred_at: operation.occurredAt,
            }),
          },
          SYNC_REQUEST_TIMEOUT_MS,
        );

        await offlineDb.outbox.delete(operation.id);

        await Promise.all(
          operation.invalidateQueryKeys.map((queryKey) =>
            queryClient.invalidateQueries({ queryKey }),
          ),
        );

        await refreshSyncSnapshot("syncing");
      } catch (error) {
        const conflict = error instanceof ApiError && error.status === 409;
        const authRequired =
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403);
        const networkFailure = isNetworkFailure(error);

        await offlineDb.outbox.update(operation.id, {
          status: conflict
            ? "conflict"
            : authRequired
              ? "auth-required"
              : "failed",
          syncStartedAt: undefined,
          updatedAt: Date.now(),
          error: error instanceof Error ? error.message : "Sync failed",
        });

        await refreshSyncSnapshot(
          authRequired
            ? "auth-required"
            : networkFailure && !navigator.onLine
              ? "offline"
              : "error",
        );

        // Stop the batch when connectivity is unreliable. The same
        // idempotency key is retained, so the operation can be retried safely.
        if (networkFailure) {
          break;
        }
      }
    }

    const finalStatus = await resolveFinalSyncStatus();
    await refreshSyncSnapshot(finalStatus);

    if (finalStatus === "synced") {
      globalThis.setTimeout(() => {
        void refreshSyncSnapshot("idle");
      }, 2500);
    }
  })().finally(() => {
    syncPromise = undefined;
  });

  return syncPromise;
}

/**
 * Call this after a successful sign-in/session refresh. Auth-blocked outbox
 * entries are deliberately excluded from normal automatic retries.
 */
export async function retryAuthRequiredOperations(queryClient: QueryClient) {
  const now = Date.now();

  await offlineDb.outbox
    .where("status")
    .equals("auth-required")
    .modify({
      status: "pending",
      attempts: 0,
      syncStartedAt: undefined,
      updatedAt: now,
      error: undefined,
    });

  await refreshSyncSnapshot("idle");
  return syncOutbox(queryClient);
}
