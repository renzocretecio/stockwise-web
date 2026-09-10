import { Boxes, LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

interface PageLoadingProps {
    className?: string;
    description?: string;
    label?: string;
}

export function PageLoading({
    className,
    description = "Preparing your workspace",
    label = "Loading page",
}: PageLoadingProps) {
    return (
        <section
            aria-busy="true"
            aria-live="polite"
            className={cn(
                "grid min-h-[60vh] place-items-center px-6 py-16",
                className,
            )}
            data-no-print="true"
            role="status"
        >
            <div className="flex max-w-xs flex-col items-center text-center">
                <div
                    className={
                        "relative grid size-14 place-items-center " +
                        "rounded-2xl bg-primary/10 text-primary"
                    }
                >
                    <Boxes className="size-6" />
                    <LoaderCircle
                        aria-hidden="true"
                        className={
                            "absolute -inset-1 size-16 animate-spin " +
                            "text-primary/35 motion-reduce:animate-none"
                        }
                        strokeWidth={1.25}
                    />
                </div>
                <p className="mt-5 text-sm font-semibold">{label}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                    {description}
                </p>
            </div>
        </section>
    );
}
