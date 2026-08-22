"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Master-Detail Console
 * ---------------------------------------------------------------------------
 * Master list (left, searchable) synchronized with a structured detail
 * panel (right: breadcrumb → title → info grid → description → activity → actions).
 * Uses the app's default theme tokens — no hardcoded colors.
 *
 * Generic over the record type `T` via accessor props, so it works for
 * shipments, purchase orders, sales, physical counts, etc.
 */

export type StatusTone = "neutral" | "warning" | "success" | "danger";

export interface StatusInfo {
  label: string;
  tone: StatusTone;
}

export interface InfoField {
  label: string;
  value: ReactNode;
}

export interface ActivityEntry {
  title: string;
  time: string;
}

export interface MasterDetailAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
  icon?: ReactNode;
}

export interface MasterDetailConsoleProps<T> {
  /** Panel heading, e.g. "Live shipments" */
  title: string;
  /** Small counter shown top-right, e.g. "11 moving" */
  counterLabel?: string;
  items: T[];
  getId: (row: T) => string;
  getTitle: (row: T) => string;
  getSubtitle: (row: T) => string;
  getStatus: (row: T) => StatusInfo;
  searchPlaceholder?: string;
  searchPredicate?: (row: T, query: string) => boolean;

  /** ----- Detail panel content for the selected row ----- */
  getDetailId: (row: T) => string;
  getInfoFields: (row: T) => InfoField[];
  getDescription?: (row: T) => string | null | undefined;
  getActivity?: (row: T) => ActivityEntry[];
  getActions?: (row: T) => MasterDetailAction[];

  selectedId?: string | null;
  onSelectId?: (id: string | null) => void;
  emptyLabel?: string;
  className?: string;
}

const statusDotClass: Record<StatusTone, string> = {
  neutral: "bg-muted-foreground/50",
  warning: "bg-amber-500",
  success: "bg-emerald-500",
  danger: "bg-destructive",
};

const statusTextClass: Record<StatusTone, string> = {
  neutral: "text-muted-foreground",
  warning: "text-amber-600",
  success: "text-emerald-600",
  danger: "text-destructive",
};

export function MasterDetailConsole<T>({
  title,
  counterLabel,
  items,
  getId,
  getTitle,
  getSubtitle,
  getStatus,
  searchPlaceholder = "Search...",
  searchPredicate,
  getDetailId,
  getInfoFields,
  getDescription,
  getActivity,
  getActions,
  selectedId: controlledSelectedId,
  onSelectId,
  emptyLabel = "record",
  className,
}: MasterDetailConsoleProps<T>) {
  const [query, setQuery] = useState("");
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    items.length > 0 ? getId(items[0]) : null
  );

  const isControlled = controlledSelectedId !== undefined;
  const selectedId = isControlled ? controlledSelectedId : internalSelectedId;

  const setSelectedId = useCallback(
    (id: string | null) => {
      if (!isControlled) setInternalSelectedId(id);
      onSelectId?.(id);
    },
    [isControlled, onSelectId]
  );

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase().trim();
    if (searchPredicate) return items.filter((row) => searchPredicate(row, q));
    return items.filter(
      (row) =>
        getTitle(row).toLowerCase().includes(q) ||
        getSubtitle(row).toLowerCase().includes(q)
    );
  }, [items, query, searchPredicate, getTitle, getSubtitle]);

  useEffect(() => {
    if (selectedId === null && filteredItems.length > 0) {
      setSelectedId(getId(filteredItems[0]));
      return;
    }
    if (selectedId !== null) {
      const stillExists = filteredItems.some((r) => getId(r) === selectedId);
      if (!stillExists) {
        setSelectedId(filteredItems.length > 0 ? getId(filteredItems[0]) : null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredItems]);

  const selectedRow = useMemo(
    () => items.find((row) => getId(row) === selectedId) ?? null,
    [items, selectedId, getId]
  );

  const handleRowKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = filteredItems[index + 1];
      if (next) setSelectedId(getId(next));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const prev = filteredItems[index - 1];
      if (prev) setSelectedId(getId(prev));
    }
  };

  return (
    <Card className={cn("overflow-hidden border-border/80 p-0", className)}>
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] h-[75vh] min-h-[560px] max-h-[860px]">
        {/* ================= MASTER LIST ================= */}
        <div className="border-b lg:border-b-0 lg:border-r border-border/80 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
            <h2 className="text-[15px] font-semibold text-foreground">
              {title}
            </h2>
            {counterLabel && (
              <span className="text-xs text-muted-foreground">
                {counterLabel}
              </span>
            )}
          </div>

          <div className="px-4 pb-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pb-2">
            {filteredItems.length === 0 ? (
              <p className="px-5 py-6 text-sm text-muted-foreground">
                No {emptyLabel}s match your search.
              </p>
            ) : (
              filteredItems.map((row, index) => {
                const id = getId(row);
                const isSelected = id === selectedId;
                const status = getStatus(row);

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedId(id)}
                    onKeyDown={(e) => handleRowKeyDown(e, index)}
                    className={cn(
                      "w-full text-left px-4 py-3 mx-2 rounded-lg transition-colors outline-none cursor-pointer",
                      "focus-visible:ring-2 focus-visible:ring-primary",
                      isSelected
                        ? "bg-primary/10"
                        : "hover:bg-muted/50"
                    )}
                    style={{ width: "calc(100% - 1rem)" }}
                  >
                    <div
                      className={cn(
                        "text-sm font-medium truncate",
                        isSelected ? "text-primary" : "text-foreground"
                      )}
                    >
                      {getTitle(row)}
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground truncate">
                        {getSubtitle(row)}
                      </span>
                      <span className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            statusDotClass[status.tone]
                          )}
                        />
                        <span className="text-xs text-muted-foreground">
                          {status.label}
                        </span>
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ================= DETAIL PANEL ================= */}
        <div className="flex flex-col min-h-0">
          {selectedRow ? (
            <DetailPanel
              detailId={getDetailId(selectedRow)}
              status={getStatus(selectedRow)}
              heading={getTitle(selectedRow)}
              subtitle={getSubtitle(selectedRow)}
              infoFields={getInfoFields(selectedRow)}
              description={getDescription?.(selectedRow)}
              activity={getActivity?.(selectedRow) ?? []}
              actions={getActions?.(selectedRow) ?? []}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-10">
              <p className="text-sm text-muted-foreground">
                Select a {emptyLabel} to see its details.
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function DetailPanel({
  detailId,
  status,
  heading,
  subtitle,
  infoFields,
  description,
  activity,
  actions,
}: {
  detailId: string;
  status: StatusInfo;
  heading: string;
  subtitle: string;
  infoFields: InfoField[];
  description?: string | null;
  activity: ActivityEntry[];
  actions: MasterDetailAction[];
}) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-6 pt-5 pb-4 shrink-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono">{detailId}</span>
          <span
            className={cn("h-1.5 w-1.5 rounded-full", statusDotClass[status.tone])}
          />
          <span className={statusTextClass[status.tone]}>{status.label}</span>
        </div>
        <h1 className="mt-1.5 text-xl font-semibold text-foreground">
          {heading}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6 pt-4 space-y-4 bg-muted/60">
        {infoFields.length > 0 && (
          <Card className="border-border/80 p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {infoFields.map((field, i) => (
                <div key={i}>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    {field.label}
                  </p>
                  <p className="text-sm text-foreground mt-1">{field.value}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {description && (
          <Card className="border-border/80 p-5">
            <p className="text-sm font-semibold text-foreground mb-2">Description</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </Card>
        )}

        {activity.length > 0 && (
          <Card className="border-border/80 p-5">
            <p className="text-sm font-semibold text-foreground mb-4">
              Activity
            </p>
            <ul className="space-y-4">
              {activity.map((entry, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                  <div>
                    <p className="text-sm text-foreground">{entry.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {entry.time}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {actions.length > 0 && (
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/80">
          {actions.map((action, i) => (
            <Button
              key={i}
              type="button"
              variant={action.variant === "primary" ? "default" : "outline"}
              onClick={action.onClick}
              className="cursor-pointer gap-2"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}