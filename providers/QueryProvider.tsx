"use client";

import { onlineManager, QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from
  "@tanstack/react-query-persist-client";
import React from "react";

import { dexieQueryPersister } from "@/lib/offline-db";
import {
  ApiError,
  ApiOfflineError,
} from "@/lib/api-client";

const ONE_MINUTE = 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;
const SEVEN_DAYS = 7 * ONE_DAY;

function browserIsOnline() {
  return typeof navigator === "undefined" || navigator.onLine;
}

// A reload while offline does not emit a new browser offline event.
if (typeof window !== "undefined") {
    onlineManager.setEventListener((setOnline) => {
        const update = () => setOnline(navigator.onLine);
        update();
        window.addEventListener("online", update);
        window.addEventListener("offline", update);
        return () => {
            window.removeEventListener("online", update);
            window.removeEventListener("offline", update);
        };
    });
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        /**
         * Important:
         *
         * "online" means TanStack will pause queries when the browser
         * is offline instead of executing apiClient().
         */
        networkMode: "online",

        /**
         * Default freshness.
         *
         * Individual queries can override this.
         *
         * Example:
         * dashboard = 10 minutes
         * products = 5 minutes
         * sales = 2 minutes
         */
        staleTime: 5 * ONE_MINUTE,

        /**
         * Keep persisted/cache data available for up to 7 days.
         */
        gcTime: SEVEN_DAYS,

        /**
         * Do not refetch just because the user switches back
         * to the Stockwise tab.
         */
        refetchOnWindowFocus: false,

        /**
         * A full page refresh remounts every query. Do not turn an offline
         * refresh into failed requests; saved query data remains visible.
         */
        refetchOnMount: (query) =>
          browserIsOnline() && query.isStale(),

        /**
         * A connection change alone must not refresh every visible API query.
         * Mutations and explicit Refresh controls still invalidate their data.
         */
        refetchOnReconnect: false,

        /**
         * Avoid useless retries while offline and avoid retrying
         * normal 4xx responses.
         */
        retry: (failureCount, error) => {
          if (error instanceof ApiOfflineError) {
            return false;
          }

          if (
            error instanceof ApiError &&
            error.status >= 400 &&
            error.status < 500
          ) {
            return false;
          }

          return failureCount < 2;
        },

        /**
         * Query errors should remain query state.
         * They should not crash the whole protected layout.
         */
        throwOnError: false,
      },

      mutations: {
        networkMode: "online",
        retry: false,
        throwOnError: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }

  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
}

export function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: dexieQueryPersister,
        maxAge: SEVEN_DAYS,
        buster: "2026-09-07-business-scoped-v3",
        dehydrateOptions: {
            shouldDehydrateQuery: (query) =>
                query.state.data !== undefined,
            shouldDehydrateMutation: () => false,
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
