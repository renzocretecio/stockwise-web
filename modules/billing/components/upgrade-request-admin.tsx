"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  RefreshCw,
  Send,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  useAdminUpgradeRequests,
  useApproveUpgradeRequest,
  useMarkUpgradeRequestAwaitingPayment,
  useRejectUpgradeRequest,
} from "@/modules/billing/services/billing";
import type {
  BillingInterval,
  SubscriptionPlan,
  UpgradeRequest,
  UpgradeRequestListResponse,
  UpgradeRequestStatus,
} from "@/modules/billing/types";

const PAGE_SIZE = 10;

export function UpgradeRequestAdmin() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<
    UpgradeRequestStatus | "all"
  >("all");
  const [selectedRequest, setSelectedRequest] = useState<UpgradeRequest | null>(
    null,
  );
  const requests = useAdminUpgradeRequests(page, PAGE_SIZE, statusFilter);

  if (requests.isLoading) {
    return <div className="h-72 animate-pulse bg-muted/30" />;
  }

  if (requests.error) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">
          Unable to load upgrade requests.
        </p>
        <Button
          className="mt-3"
          onClick={() => void requests.refetch()}
          size="sm"
          type="button"
          variant="outline"
        >
          <RefreshCw className="mr-2 size-4" />
          Try again
        </Button>
      </div>
    );
  }

  const statusCounts = requests.data?.status_counts ?? {};

  return (
    <div>
      <header className="border-b p-5 sm:p-6">
        <div
          className={
            "flex flex-col gap-4 lg:flex-row " +
            "lg:items-end lg:justify-between"
          }
        >
          <div>
            <p className="text-xs font-medium text-primary">Platform billing</p>
            <h1 className="mt-1 text-2xl font-semibold">Upgrade requests</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review requests, guide payment, and activate plans.
            </p>
          </div>
          <Button
            disabled={requests.isFetching}
            onClick={() => void requests.refetch()}
            size="sm"
            type="button"
            variant="outline"
          >
            <RefreshCw
              className={
                "mr-2 size-4 " + (requests.isFetching ? "animate-spin" : "")
              }
            />
            Refresh
          </Button>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <QueueMetric
            icon={Clock3}
            label="Needs review"
            value={statusCounts.pending ?? 0}
          />
          <QueueMetric
            icon={CreditCard}
            label="Awaiting payment"
            value={statusCounts.awaiting_payment ?? 0}
          />
          <QueueMetric
            icon={CheckCircle2}
            label="Ready to activate"
            value={statusCounts.payment_submitted ?? 0}
          />
        </div>
      </header>

      <RequestTable
        data={requests.data}
        isFetching={requests.isFetching}
        onPageChange={setPage}
        onSelect={setSelectedRequest}
        onStatusChange={(status) => {
          setStatusFilter(status);
          setPage(1);
        }}
        page={page}
        statusFilter={statusFilter}
      />

      <Dialog
        open={Boolean(selectedRequest)}
        onOpenChange={(open) => {
          if (!open) setSelectedRequest(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Review upgrade request</DialogTitle>
            <DialogDescription>
              Verify the request and complete its next action.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest ? (
            <UpgradeRequestRow
              onComplete={() => setSelectedRequest(null)}
              request={selectedRequest}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function QueueMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-muted/50 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Icon className="size-4 text-primary" />
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function RequestTable({
  data,
  isFetching,
  onPageChange,
  onSelect,
  onStatusChange,
  page,
  statusFilter,
}: {
  data?: UpgradeRequestListResponse;
  isFetching: boolean;
  onPageChange: (page: number) => void;
  onSelect: (request: UpgradeRequest) => void;
  onStatusChange: (status: UpgradeRequestStatus | "all") => void;
  page: number;
  statusFilter: UpgradeRequestStatus | "all";
}) {
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;
  const firstItem = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastItem = Math.min(page * PAGE_SIZE, total);

  return (
    <section>
      <div
        className={
          "flex flex-col gap-3 border-b p-5 sm:flex-row " +
          "sm:items-center sm:justify-between"
        }
      >
        <div>
          <h2 className="font-semibold">All upgrade requests</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Select a request to review its payment workflow.
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs font-medium">
          Status
          <select
            className="h-9 rounded-2xl border bg-background px-3 text-sm"
            onChange={(event) =>
              onStatusChange(event.target.value as UpgradeRequestStatus | "all")
            }
            value={statusFilter}
          >
            <option value="all">All statuses</option>
            <option value="pending">Needs review</option>
            <option value="awaiting_payment">Awaiting payment</option>
            <option value="payment_submitted">Ready to activate</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
      </div>

      {items.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-sm font-medium">No requests found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try selecting a different status.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business</TableHead>
              <TableHead>Requested plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={isFetching ? "opacity-60" : undefined}>
            {items.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <p className="font-medium">
                    {request.business_name ?? request.business_id}
                  </p>
                  <p className="max-w-52 truncate text-xs text-muted-foreground">
                    {request.requested_by_email ?? "Unknown requester"}
                  </p>
                </TableCell>
                <TableCell className="capitalize">
                  {request.requested_plan} ·{" "}
                  {request.requested_billing_interval}
                  {request.requested_additional_member_seats > 0
                    ? ` · +${request.requested_additional_member_seats} seats`
                    : ""}
                </TableCell>
                <TableCell className="font-medium tabular-nums">
                  ₱{request.quoted_amount_php.toLocaleString("en-PH")}
                </TableCell>
                <TableCell>
                  <StatusBadge status={request.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(request.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    onClick={() => onSelect(request)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div
        className={
          "flex flex-col gap-3 border-t p-4 sm:flex-row " +
          "sm:items-center sm:justify-between"
        }
      >
        <p className="text-xs text-muted-foreground">
          Showing {firstItem}–{lastItem} of {total} requests
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Page {page} of {pages}
          </span>
          <Button
            aria-label="Previous page"
            disabled={page <= 1 || isFetching}
            onClick={() => onPageChange(page - 1)}
            size="icon-sm"
            type="button"
            variant="outline"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            aria-label="Next page"
            disabled={page >= pages || isFetching}
            onClick={() => onPageChange(page + 1)}
            size="icon-sm"
            type="button"
            variant="outline"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

function UpgradeRequestRow({
  onComplete,
  request,
}: {
  onComplete?: () => void;
  request: UpgradeRequest;
}) {
  const approve = useApproveUpgradeRequest();
  const markAwaitingPayment = useMarkUpgradeRequestAwaitingPayment();
  const reject = useRejectUpgradeRequest();
  const [plan, setPlan] = useState<Exclude<SubscriptionPlan, "free">>(
    request.requested_plan,
  );
  const [billingInterval, setBillingInterval] = useState<BillingInterval>(
    request.requested_billing_interval,
  );
  const [seats, setSeats] = useState(request.requested_additional_member_seats);
  const [paymentInstructions, setPaymentInstructions] = useState(() =>
    defaultPaymentInstructions(request),
  );
  const [adminNote, setAdminNote] = useState("");

  const quotedAmount =
    (plan === "pro" ? 299 + seats * 79 : 899) *
    (billingInterval === "yearly" ? 12 : 1);
  const isPending = request.status === "pending";
  const isAwaitingPayment = request.status === "awaiting_payment";
  const paymentSubmitted = request.status === "payment_submitted";
  const isInProgress = isPending || isAwaitingPayment || paymentSubmitted;
  const actionError =
    approve.error || markAwaitingPayment.error || reject.error;

  return (
    <article className="bg-background p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">
              {request.business_name ?? request.business_id}
            </h3>
            <StatusBadge status={request.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {request.requested_by_name ?? "Unknown user"}
            {request.requested_by_email
              ? ` · ${request.requested_by_email}`
              : ""}
          </p>
          <p className="mt-2 text-sm">
            Requested {request.requested_plan} ·{" "}
            {request.requested_billing_interval}
            {request.requested_additional_member_seats > 0
              ? ` · ${request.requested_additional_member_seats} extra seats`
              : ""}
          </p>
          <p className="mt-1 text-sm font-medium">
            ₱{request.quoted_amount_php.toLocaleString("en-PH")}
          </p>
          {request.payment_reference ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Payment: {request.payment_method} · Reference:{" "}
              {request.payment_reference}
            </p>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">
          Requested {formatDate(request.created_at)}
        </p>
      </div>

      {isInProgress ? <RequestProgress status={request.status} /> : null}

      {isInProgress ? (
        <div className="mt-5 grid gap-3 border-t pt-5 md:grid-cols-2 xl:grid-cols-5">
          <label className="text-xs font-medium">
            Activate plan
            <select
              className="mt-1 w-full rounded-2xl border bg-background px-3 py-2 text-sm"
              onChange={(event) =>
                setPlan(event.target.value as Exclude<SubscriptionPlan, "free">)
              }
              value={plan}
              disabled={!isPending}
            >
              <option value="pro">Pro</option>
              <option value="business">Business</option>
            </select>
          </label>
          <label className="text-xs font-medium">
            Billing period
            <select
              className="mt-1 w-full rounded-2xl border bg-background px-3 py-2 text-sm"
              onChange={(event) =>
                setBillingInterval(event.target.value as BillingInterval)
              }
              value={billingInterval}
              disabled={!isPending}
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </label>
          <label className="text-xs font-medium">
            Extra seats
            <input
              className="mt-1 w-full rounded-2xl border bg-background px-3 py-2 text-sm"
              disabled={!isPending || plan !== "pro"}
              min="0"
              onChange={(event) => setSeats(Number(event.target.value) || 0)}
              type="number"
              value={plan === "pro" ? seats : 0}
            />
          </label>
          <div className="flex flex-col justify-end gap-2">
            <p className="text-sm font-semibold">
              ₱{quotedAmount.toLocaleString("en-PH")}
            </p>
            <div className="flex gap-2">
              {isPending ? (
                <Button
                  disabled={
                    markAwaitingPayment.isPending || !paymentInstructions.trim()
                  }
                  onClick={() =>
                    markAwaitingPayment.mutate(
                      {
                        id: request.id,
                        admin_note: paymentInstructions,
                      },
                      { onSuccess: onComplete },
                    )
                  }
                  size="sm"
                  type="button"
                >
                  <Send className="mr-1 size-4" />
                  Send instructions
                </Button>
              ) : null}
              {paymentSubmitted ? (
                <Button
                  disabled={approve.isPending || reject.isPending}
                  onClick={() =>
                    approve.mutate(
                      {
                        id: request.id,
                        plan,
                        billing_interval: billingInterval,
                        additional_member_seats: plan === "pro" ? seats : 0,
                        admin_note: adminNote || undefined,
                      },
                      { onSuccess: onComplete },
                    )
                  }
                  size="sm"
                  type="button"
                >
                  <Check className="mr-1 size-4" />
                  Confirm payment
                </Button>
              ) : null}
              <Button
                disabled={
                  approve.isPending ||
                  reject.isPending ||
                  markAwaitingPayment.isPending
                }
                onClick={() =>
                  reject.mutate(
                    {
                      id: request.id,
                      admin_note: adminNote || "Payment was not confirmed.",
                    },
                    { onSuccess: onComplete },
                  )
                }
                size="sm"
                type="button"
                variant="outline"
              >
                <X className="mr-1 size-4" />
                Reject
              </Button>
            </div>
            {isAwaitingPayment ? (
              <p className="text-xs text-muted-foreground">
                Waiting for the customer to submit payment.
              </p>
            ) : null}
          </div>
          {isPending ? (
            <label
              className={"text-xs font-medium md:col-span-2 " + "xl:col-span-5"}
            >
              Payment instructions shown to the customer
              <Textarea
                className="mt-1 min-h-28 bg-background"
                onChange={(event) => setPaymentInstructions(event.target.value)}
                value={paymentInstructions}
              />
              <span
                className={"mt-1 block font-normal " + "text-muted-foreground"}
              >
                Review the amount and add your actual payment destination before
                sending.
              </span>
            </label>
          ) : null}
          {isAwaitingPayment ? (
            <div
              className={
                "rounded-2xl bg-muted/50 p-4 text-sm " +
                "md:col-span-2 xl:col-span-5"
              }
            >
              <p className="text-xs font-medium">
                Instructions sent to customer
              </p>
              <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
                {request.admin_note}
              </p>
            </div>
          ) : null}
          {paymentSubmitted ? (
            <label
              className={"text-xs font-medium md:col-span-2 " + "xl:col-span-5"}
            >
              Approval note
              <Textarea
                className="mt-1 min-h-20 bg-background"
                onChange={(event) => setAdminNote(event.target.value)}
                placeholder={
                  "Optional private note about payment " + "verification"
                }
                value={adminNote}
              />
            </label>
          ) : null}
          {actionError ? (
            <p
              className={
                "text-sm text-destructive md:col-span-2 " + "xl:col-span-5"
              }
            >
              {actionError.message}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          {request.admin_note ?? "No administrator note."}
        </p>
      )}
    </article>
  );
}

function RequestProgress({ status }: { status: UpgradeRequest["status"] }) {
  const steps = [
    { label: "Review request", value: "pending" },
    { label: "Await payment", value: "awaiting_payment" },
    { label: "Confirm and activate", value: "payment_submitted" },
  ] as const;
  const activeIndex = steps.findIndex((step) => step.value === status);

  return (
    <div className="mt-5 grid grid-cols-3 gap-2">
      {steps.map((step, index) => {
        const complete = index < activeIndex;
        const active = index === activeIndex;

        return (
          <div key={step.value}>
            <div
              className={
                "h-1 rounded-full " +
                (complete || active ? "bg-primary" : "bg-muted")
              }
            />
            <p
              className={
                "mt-2 text-[11px] " +
                (active
                  ? "font-medium text-foreground"
                  : "text-muted-foreground")
              }
            >
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }: { status: UpgradeRequest["status"] }) {
  const styles: Record<UpgradeRequest["status"], string> = {
    pending: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    awaiting_payment: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    payment_submitted: "bg-primary/10 text-primary",
    approved: "bg-primary/10 text-primary",
    rejected: "bg-destructive/10 text-destructive",
    cancelled: "bg-muted text-muted-foreground",
  };

  return (
    <span
      className={
        "rounded-full px-2 py-0.5 text-xs font-medium " + styles[status]
      }
    >
      {formatStatus(status)}
    </span>
  );
}

function defaultPaymentInstructions(request: UpgradeRequest) {
  const amount = request.quoted_amount_php.toLocaleString("en-PH");
  const plan = request.requested_plan === "pro" ? "Pro" : "Business";

  return (
    `Your StockWise ${plan} upgrade is ready for payment. ` +
    `Please send ₱${amount} using the payment details provided by ` +
    "StockWise. After payment, enter the payment method and transaction " +
    "reference number in the upgrade dialog. Your plan will be activated " +
    "after the payment is verified."
  );
}

function formatStatus(status: UpgradeRequest["status"]) {
  return status.replaceAll("_", " ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
