import { cn } from "@/lib/utils";

type DashboardDividerProps = {
    className?: string;
    label?: string;
};

export function DashboardDivider({
    className,
    label,
}: DashboardDividerProps) {
    const stripeStyle = {
        backgroundImage:
            "repeating-linear-gradient(135deg, transparent 0, " +
            "transparent 6px, color-mix(in srgb, var(--border) 70%, " +
            "transparent) 6px, color-mix(in srgb, var(--border) 70%, " +
            "transparent) 7px)",
    };

    return (
        <div
            aria-hidden={!label}
            className={cn(
                "flex min-h-8 items-center justify-center border-y " +
                    "border-border/80 bg-background",
                className,
            )}
            style={stripeStyle}
        >
            {label ? (
                <span
                    className={
                        "bg-background px-3 text-xs font-medium " +
                        "text-muted-foreground"
                    }
                >
                    {label}
                </span>
            ) : null}
        </div>
    );
}
