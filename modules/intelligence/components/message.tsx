import { Badge } from "@/components/ui/badge";
import type { IntelligenceResponse } from "@/modules/intelligence/types";

export function IntelligenceMessageView({
  response,
}: {
  response: IntelligenceResponse;
}) {
  const groups = [
    ["Recorded facts", response.message.facts],
    ["Estimates", response.message.estimates],
    ["Recommended actions", response.message.recommended_actions],
    ["Limitations", response.message.limitations],
  ] as const;

  return (
    <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">
          {response.provider === "gemini" ? "Gemini" : "Rules-based"}
        </Badge>
        <span className="text-xs text-muted-foreground">
          Calculations supplied by Stockwise
        </span>
      </div>
      <p className="text-sm leading-6">{response.message.answer}</p>
      {groups.map(([label, items]) =>
        items.length ? (
          <div key={label}>
            <p
              className={
                "text-xs font-semibold uppercase text-muted-foreground"
              }
            >
              {label}
            </p>
            <ul className="mt-1 space-y-1 text-sm">
              {items.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        ) : null,
      )}
    </div>
  );
}
