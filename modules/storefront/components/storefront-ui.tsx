import { Badge } from "@/components/ui/badge";
import type {
    StoreOrderStatus,
    StorePaymentMethod,
} from "@/modules/storefront/types";

export function formatStoreCurrency(value: number, code = "PHP") {
    return new Intl.NumberFormat("en-PH", {
        currency: code,
        style: "currency",
    }).format(value);
}

export function formatStoreDate(value: string) {
    return new Intl.DateTimeFormat("en-PH", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

const statusLabels: Record<StoreOrderStatus, string> = {
    new: "New",
    confirmed: "Confirmed",
    processing: "Processing",
    ready: "Ready",
    shipped: "Shipped",
    completed: "Completed",
    cancelled: "Cancelled",
};

export function OrderStatusBadge({ status }: { status: StoreOrderStatus }) {
    return (
        <Badge
            variant={
                status === "cancelled"
                    ? "destructive"
                    : status === "completed"
                      ? "outline"
                      : status === "new"
                        ? "default"
                        : "secondary"
            }
        >
            {statusLabels[status]}
        </Badge>
    );
}

export const paymentLabels: Record<StorePaymentMethod, string> = {
    cod: "Cash on delivery",
    gcash: "GCash",
    bank_transfer: "Bank transfer",
    pay_on_pickup: "Pay on pickup",
};
