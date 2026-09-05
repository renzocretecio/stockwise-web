"use client";

import { FormEvent, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import {
  Clock3,
  FileText,
  Mail,
  Plus,
  Send,
  Sparkles,
  Trash2,
  BellRing
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

type Settings = {
  business_id: string;
  enabled: boolean;
  send_weekday: number;
  send_hour: number;
  send_minute: number;
  recipients: string[];
  included_sections: string[];
  action_required_only: boolean;
};

type Summary = {
  period_start: string;
  period_end: string;
  ai_executive_summary: string;
  kpis: Record<string, number | null>;
  needs_attention: Array<Record<string, unknown>>;
  recommended_actions: Array<Record<string, unknown>>;
  open_stockwise_url: string;
};

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const SECTION_OPTIONS = [
  {
    key: "sales_performance",
    label: "Sales performance",
    detail: "Revenue, profit, and the week-over-week shift",
  },
  {
    key: "inventory_health",
    label: "Inventory health",
    detail: "Stock value, low-stock count, and risk signals",
  },
  {
    key: "reorder_recommendations",
    label: "Reorder recommendations",
    detail: "Products where the rules suggest a purchase",
  },
  {
    key: "slow_moving_products",
    label: "Slow-moving products",
    detail: "Stock that is tying up cash",
  },
  {
    key: "inventory_anomalies",
    label: "Inventory anomalies",
    detail: "Unusual counts, adjustments, or negative stock",
  },
  {
    key: "supplier_issues",
    label: "Supplier issues",
    detail: "Delivery and purchasing exceptions",
  },
];

function hours() {
  return Array.from({ length: 24 }, (_, hour) =>
    [
      hour,
      hour === 0
        ? "12:00 AM"
        : hour < 12
          ? `${hour}:00 AM`
          : hour === 12
            ? "12:00 PM"
            : `${hour - 12}:00 PM`,
    ] as const,
  );
}

function SectionHeading({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: typeof Mail;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b py-4">
      <div
        className="mt-0.5 flex size-9 shrink-0 items-center justify-center
          bg-primary/10 text-primary rounded-md"
      >
        <Icon className="size-4" />
      </div>
      <div>
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.18em]
            text-muted-foreground"
        >
          {eyebrow}
        </p>
        <h2 className="mt-1 font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      aria-checked={checked}
      aria-label={label}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full p-1 transition-colors",
        checked ? "bg-primary" : "bg-muted-foreground/30",
      )}
      onClick={() => onChange(!checked)}
      role="switch"
      type="button"
    >
      <span
        className={cn(
          "block size-4 rounded-full bg-white shadow-sm transition-transform",
          checked && "translate-x-5",
        )}
      />
    </button>
  );
}

function itemText(item: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = item[key];
    if (value !== null && value !== undefined && String(value).trim()) {
      return String(value);
    }
  }
  return "Review this item in Stockwise.";
}

const numberFormatter = new Intl.NumberFormat("en-PH");

function formatPeriodDate(value: string) {
  return format(parseISO(value), "MMM d, yyyy");
}

function formatKpiValue(label: string, value: number | null) {
  if (value === null || value === undefined) return "—";

  if (["Sales", "Gross profit", "Inventory value"].includes(label)) {
    return formatCurrency(value);
  }

  return numberFormatter.format(value);
}

export function WeeklyOwnerSummarySettings() {
  const { data, isLoading, error, refetch } = useQuery<Settings>({
    queryKey: ["notifications", "weekly-owner-summary"],
    queryFn: () =>
      apiClient<Settings>("/api/notifications/weekly-owner-summary"),
    staleTime: 60_000,
  });
  const [draft, setDraft] = useState<Settings | null>(null);
  const [recipient, setRecipient] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const form = draft ?? data ?? null;

  const showKpis = form
    ? form.included_sections.some((section) =>
        ["sales_performance", "inventory_health"].includes(section),
      )
    : false;
  const showAttention = form
    ? form.included_sections.some((section) =>
        [
          "reorder_recommendations",
          "slow_moving_products",
          "inventory_anomalies",
        ].includes(section),
      )
    : false;
  const showRecommendations =
    form?.included_sections.includes("reorder_recommendations") ?? false;

  const timeOptions = useMemo(() => hours(), []);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setDraft((current) => {
      const source = current ?? data;
      return source ? { ...source, [key]: value } : current;
    });
  };

  const addRecipient = () => {
    const value = recipient.trim().toLowerCase();
    if (
      !value ||
      !value.includes("@") ||
      form?.recipients.includes(value)
    ) {
      return;
    }
    update("recipients", [...(form?.recipients ?? []), value]);
    setRecipient("");
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!form || form.recipients.length === 0) return;
    setSaving(true);
    setMessage(null);
    setFormError(null);
    try {
      const saved = await apiClient<Settings>(
        "/api/notifications/weekly-owner-summary",
        {
        method: "PUT",
        body: JSON.stringify({
          enabled: form.enabled,
          send_weekday: form.send_weekday,
          send_hour: form.send_hour,
          send_minute: form.send_minute,
          recipients: form.recipients,
          included_sections: form.included_sections,
          action_required_only: form.action_required_only,
        }),
        },
      );
      setDraft(saved);
      setMessage("Weekly summary preferences saved.");
    } catch (reason) {
      setFormError(
        reason instanceof Error
          ? reason.message
          : "Unable to save preferences.",
      );
    } finally {
      setSaving(false);
    }
  };

  const loadPreview = async () => {
    setPreviewing(true);
    setFormError(null);
    try {
      setSummary(
        await apiClient<Summary>(
          "/api/notifications/weekly-owner-summary/preview",
        ),
      );
    } catch (reason) {
      setFormError(
        reason instanceof Error ? reason.message : "Unable to load preview.",
      );
    } finally {
      setPreviewing(false);
    }
  };

  const sendNow = async () => {
    setSending(true);
    setMessage(null);
    setFormError(null);
    try {
      setSummary(
        await apiClient<Summary>(
          "/api/notifications/weekly-owner-summary/send",
          { method: "POST" },
        ),
      );
      setMessage("The weekly summary was sent.");
    } catch (reason) {
      setFormError(
        reason instanceof Error ? reason.message : "Unable to send summary.",
      );
    } finally {
      setSending(false);
    }
  };

  if (isLoading || !form) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Loading notification settings…
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">
          Unable to load notification settings.
        </p>
        <Button
          className="mt-3"
          onClick={() => void refetch()}
          size="sm"
          variant="outline"
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-px">
      <MainHeading
        description="Notify the owners and operators of your business with a weekly summary"
        icon={<BellRing className="size-4" />}
        title="Notifications"
      />
      <form className="space-y-px px-4" onSubmit={save}>
        <section>
          <div className="flex items-center justify-between py-5">
            <div>
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-primary" />
                <h2 className="font-semibold">Weekly Owner Summary</h2>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                A practical pulse check for the week that just ended.
              </p>
            </div>
            <Toggle
              checked={form.enabled}
              label="Enable Weekly Owner Summary"
              onChange={(value) => update("enabled", value)}
            />
          </div>
        </section>

        <section>
          <SectionHeading
            description="The email is sent in the business timezone."
            eyebrow="01 / Delivery"
            icon={Clock3}
            title="Choose your rhythm"
          />
          <div className="grid gap-4 py-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium">Send every</span>
              <select
                className="h-10 w-full rounded-lg border bg-background
                  px-3 text-sm"
                value={form.send_weekday}
                onChange={(event) =>
                  update("send_weekday", Number(event.target.value))
                }
              >
                {DAYS.map((day, index) => (
                  <option key={day} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">Send at</span>
              <select
                className="h-10 w-full rounded-lg border bg-background
                  px-3 text-sm"
                value={form.send_hour}
                onChange={(event) =>
                  update("send_hour", Number(event.target.value))
                }
              >
                {timeOptions.map(([hour, label]) => (
                  <option key={hour} value={hour}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section>
          <SectionHeading
            description="Add one or more owner or operator inboxes."
            eyebrow="02 / Recipients"
            icon={Mail}
            title="Send to"
          />
          <div className="py-5">
            <div className="flex gap-2">
              <Input
                aria-label="Email recipient"
                onChange={(event) => setRecipient(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addRecipient();
                  }
                }}
                placeholder="owner@business.com"
                type="email"
                value={recipient}
              />
              <Button
                aria-label="Add recipient"
                onClick={addRecipient}
                size="icon"
                type="button"
                variant="outline"
              >
                <Plus className="size-4" />
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {form.recipients.map((email) => (
                <span
                  className="inline-flex items-center gap-2 rounded-full border
                    bg-card px-3 py-1.5 text-xs"
                  key={email}
                >
                  {email}
                  <button
                    aria-label={`Remove ${email}`}
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      update(
                        "recipients",
                        form.recipients.filter((item) => item !== email),
                      )
                    }
                    type="button"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </section>

        <section>
          <SectionHeading
            description="The AI narrative uses these same Stockwise facts,
              without changing them."
            eyebrow="03 / Contents"
            icon={FileText}
            title="Include in the email"
          />
          <div className="divide-y">
            {SECTION_OPTIONS.map((option) => {
              const checked = form.included_sections.includes(option.key);
              return (
                <div
                  className="flex items-center justify-between gap-4 py-4"
                  key={option.key}
                >
                  <div>
                    <p className="text-sm font-medium">{option.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {option.detail}
                    </p>
                  </div>
                  <Toggle
                    checked={checked}
                    label={`Include ${option.label}`}
                    onChange={(value) =>
                      update(
                        "included_sections",
                        value
                          ? [...form.included_sections, option.key]
                          : form.included_sections.filter(
                              (item) => item !== option.key,
                            ),
                      )
                    }
                  />
                </div>
              );
            })}
          </div>
          <div className="mb-5 flex items-center justify-between gap-4
            border-t pt-4">
            <div>
              <p className="text-sm font-medium">
                Only email me when action is required
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Skip quiet weeks with no attention items.
              </p>
            </div>
            <Toggle
              checked={form.action_required_only}
              label="Only email when action is required"
              onChange={(value) => update("action_required_only", value)}
            />
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 py-5">
          <div className="text-xs text-muted-foreground">
            Changes apply to the next scheduled send.
          </div>
          <Button
            disabled={saving || form.recipients.length === 0}
            type="submit"
          >
            {saving ? "Saving…" : "Save preferences"}
          </Button>
        </div>
      </form>

      <section className="border-t bg-muted/20 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              The owner readout
            </h2>
          </div>
          <Sparkles className="size-5 text-primary" />
        </div>
        <p className="mt-3 text-sm leading-6">
          See the exact shape of the next email before it leaves Stockwise.
        </p>
        <div className="mt-6 max-w-2xl rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between gap-3 text-xs
            text-muted-foreground">
            <span className="font-medium">WEEKLY OWNER SUMMARY</span>
            <span className="text-right">
              {summary
                ? `${formatPeriodDate(summary.period_start)} →
                  ${formatPeriodDate(summary.period_end)}`
                : "Not loaded"}
            </span>
          </div>
          {summary ? (
            <>
              <p className="mt-4 text-sm leading-6 text-foreground">
                {summary.ai_executive_summary}
              </p>
              {showKpis ? (
                <div className="mt-5 divide-y border-y">
                  {[
                    ...(form.included_sections.includes("sales_performance")
                      ? [
                          ["Sales", summary.kpis.sales],
                          ["Gross profit", summary.kpis.gross_profit],
                        ]
                      : []),
                    ...(form.included_sections.includes("inventory_health")
                      ? [
                          ["Inventory value", summary.kpis.inventory_value],
                          ["Low stock items", summary.kpis.low_stock_count],
                        ]
                      : []),
                  ].map(([label, value]) => (
                    <div
                      className="flex items-center justify-between gap-4 py-3"
                      key={label as string}
                    >
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-semibold">
                        {formatKpiValue(
                          label as string,
                          value as number | null,
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <div className="flex min-h-44 items-center justify-center
              text-center text-sm text-muted-foreground">
              Load a preview to inspect the AI summary and deterministic KPI
              cards.
            </div>
          )}
        </div>
        {summary && showAttention ? (
          <div className="mt-5 max-w-2xl rounded-lg border bg-card p-4">
            <section>
              <h3 className="text-sm font-semibold">Needs Your Attention</h3>
              {summary.needs_attention.length ? (
                <div className="mt-3 divide-y">
                  {summary.needs_attention.map((item, index) => (
                    <div className="py-3 first:pt-0" key={index}>
                      <p className="text-sm font-medium">
                        {itemText(item, [
                          "title",
                          "product_name",
                          "anomaly_type",
                        ])}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {itemText(item, [
                          "description",
                          "reason",
                          "message",
                          "explanation",
                        ])}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  Nothing requires attention this period.
                </p>
              )}
            </section>
            {showRecommendations ? (
              <section className="mt-6 border-t pt-5">
              <h3 className="text-sm font-semibold">
                Recommended Priorities
              </h3>
              {summary.recommended_actions.length ? (
                <div className="mt-3 space-y-4">
                  {summary.recommended_actions.map((item, index) => (
                    <div key={index}>
                      <p className="text-sm font-medium">
                        {index + 1}. {itemText(item, ["title"])}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {itemText(item, ["action", "description", "reason"])}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  No actions recommended this week.
                </p>
              )}
              </section>
            ) : null}
          </div>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            disabled={previewing}
            onClick={() => void loadPreview()}
            type="button"
          >
            {previewing ? "Loading…" : "Load preview"}
          </Button>
          <Button
            disabled={sending || !summary}
            onClick={() => void sendNow()}
            type="button"
            variant="outline"
          >
            <Send className="mr-2 size-3.5" />
            {sending ? "Sending…" : "Send now"}
          </Button>
        </div>
      </section>
      {formError ? (
        <p className="bg-destructive/10 p-3 text-sm text-destructive">
          {formError}
        </p>
      ) : null}
      {message ? (
        <p className="bg-emerald-500/10 p-3 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}
    </div>
  );
}

function MainHeading({
  description,
  icon,
  title,
}: {
  description: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b p-4">
      <div
        className="mt-0.5 flex size-8 shrink-0 items-center justify-center
          rounded-md bg-muted text-primary"
      >
        {icon}
      </div>
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}