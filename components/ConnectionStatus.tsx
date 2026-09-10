"use client";

import { useSyncExternalStore } from "react";
import { WifiOff } from "lucide-react";

const subscribe = (onStoreChange: () => void) => {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);

  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
};

const getSnapshot = () => navigator.onLine;
const getServerSnapshot = () => true;

export function ConnectionStatus() {
  const isOnline = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  if (isOnline) return null;

  return (
    <div
      aria-live="polite"
      data-no-print="true"
      className="flex items-center gap-2 border-b bg-amber-500/10 px-4 py-2 text-xs text-amber-900 dark:text-amber-100"
    >
      <WifiOff className="size-3.5 shrink-0" />
      <span>
        You are offline. Showing saved data; changes will be available again
        when you reconnect.
      </span>
    </div>
  );
}
