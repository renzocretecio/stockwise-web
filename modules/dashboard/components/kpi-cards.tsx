import { AlertTriangle, CircleDollarSign, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { currency } from "@/lib/currency";
import type { DashboardKpis } from "@/modules/dashboard/types";

export function KpiCards({ kpis }: { kpis: DashboardKpis }) {
  const change = kpis.sales_change_percent;
  const cards = [
    {
      label: "Sales today",
      value: currency.format(kpis.sales_today),
      note:
        change === null
          ? "No prior-day comparison"
          : `${change >= 0 ? "↑" : "↓"} ${Math.abs(change).toFixed(
              1,
            )}% vs yesterday`,
      icon: CircleDollarSign,
      tone:
        change !== null && change < 0 ? "text-destructive" : "text-emerald-600",
    },
    {
      label: "Inventory value",
      value: currency.format(kpis.inventory_value),
      note: "At average cost",
      icon: Package,
      tone: "text-muted-foreground",
    },
    {
      label: "Low stock",
      value: `${kpis.low_stock_count + kpis.out_of_stock_count} products`,
      note: `${kpis.out_of_stock_count} out of stock`,
      icon: AlertTriangle,
      tone:
        kpis.low_stock_count + kpis.out_of_stock_count
          ? "text-amber-600"
          : "text-emerald-600",
    },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map(({ label, value, note, icon: Icon, tone }) => (
        <Card key={label} className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">
                {value}
              </p>
              <p className={`mt-1 text-xs ${tone}`}>{note}</p>
            </div>
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
