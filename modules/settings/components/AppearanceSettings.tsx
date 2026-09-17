"use client";

import { useTheme } from "next-themes";
import { Check, Monitor, Moon, Sun, PaintbrushVertical } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import {
    defaultCustomColor,
    palettes,
    type AppearanceMode,
    type PresetPalette,
} from "@/lib/appearance";
import { cn } from "@/lib/utils";
import { useAppearance } from "@/providers/AppearanceProvider";

const modes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
] as const;

const previewProperties = [
    "--background",
    "--card",
    "--primary",
    "--chart-2",
    "--chart-3",
] as const;

export function AppearanceSettings() {
    const { theme, resolvedTheme } = useTheme();
    const {
        customColor,
        palette,
        ready,
        status,
        changeAppearance,
        retrySync,
    } = useAppearance();

    return (
        <div>
            <header className="flex items-start gap-3 border-b p-4">
                <PaintbrushVertical
                    aria-hidden="true"
                    className="mt-1 size-5 text-primary"
                />
                <div>
                    <h2 className="font-semibold">Appearance</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Personalize your workspace across all your businesses.
                    </p>
                </div>
            </header>
            <div className="space-y-7 p-5 sm:p-6">
                <fieldset disabled={!ready}>
                    <legend className="text-sm font-medium">
                        Display mode
                    </legend>
                    <p className="mt-1 text-xs text-muted-foreground">
                        System follows your device’s light or dark setting.
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                        {modes.map(({ value, label, icon: Icon }) => (
                            <label
                                key={value}
                                className="relative cursor-pointer"
                            >
                                <input
                                    checked={ready && theme === value}
                                    className="peer sr-only"
                                    name="appearance-mode"
                                    onChange={() =>
                                        changeAppearance({
                                            mode: value as AppearanceMode,
                                        })
                                    }
                                    type="radio"
                                    value={value}
                                />
                                <span
                                    className={cn(
                                        "flex flex-col items-center gap-2 rounded-2xl",
                                        "border p-3 text-sm transition-colors",
                                        "hover:bg-muted/50 peer-checked:border-primary",
                                        "peer-checked:bg-primary/5",
                                        "peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
                                        "peer-disabled:opacity-50",
                                    )}
                                >
                                    <Icon
                                        aria-hidden="true"
                                        className="size-5"
                                    />
                                    {label}
                                </span>
                            </label>
                        ))}
                    </div>
                </fieldset>

                <fieldset disabled={!ready}>
                    <legend className="text-sm font-medium">
                        Color palette
                    </legend>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Preview buttons, cards, and chart colors. Changes apply
                        immediately.
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {palettes.map((option) => {
                            const selected = ready && palette === option.id;
                            return (
                                <label
                                    key={option.id}
                                    className="relative cursor-pointer"
                                >
                                    <input
                                        checked={selected}
                                        className="peer sr-only"
                                        name="appearance-palette"
                                        onChange={() =>
                                            changeAppearance({
                                                palette: option.id,
                                            })
                                        }
                                        type="radio"
                                        value={option.id}
                                    />
                                    <span
                                        className={cn(
                                            "block overflow-hidden rounded-2xl border",
                                            "transition-colors hover:border-primary/50",
                                            "peer-checked:border-primary peer-checked:ring-1",
                                            "peer-checked:ring-primary peer-focus-visible:ring-2",
                                            "peer-focus-visible:ring-ring peer-disabled:opacity-50",
                                        )}
                                    >
                                        <PalettePreview
                                            mode={resolvedTheme}
                                            palette={option.id}
                                        />
                                        <span className="flex items-center justify-between gap-2 px-4 pt-3">
                                            <span className="text-sm font-medium">
                                                {option.name}
                                            </span>
                                            {selected ? (
                                                <Check
                                                    aria-hidden="true"
                                                    className="size-4 text-primary"
                                                />
                                            ) : null}
                                        </span>
                                        <span className="block px-4 pb-4 pt-1 text-xs text-muted-foreground">
                                            {option.description}
                                        </span>
                                    </span>
                                </label>
                            );
                        })}
                        <div
                            className={cn(
                                "overflow-hidden rounded-2xl border",
                                "transition-colors hover:border-primary/50",
                                palette === "custom" &&
                                    "border-primary ring-1 ring-primary",
                                !ready && "opacity-50",
                            )}
                        >
                            <label className="relative block cursor-pointer">
                                <input
                                    checked={ready && palette === "custom"}
                                    className="peer sr-only"
                                    name="appearance-palette"
                                    onChange={() =>
                                        changeAppearance({
                                            custom_color: customColor,
                                            palette: "custom",
                                        })
                                    }
                                    type="radio"
                                    value="custom"
                                />
                                <CustomPalettePreview color={customColor} />
                                <span
                                    className={
                                        "flex items-center justify-between " +
                                        "gap-2 px-4 pt-3"
                                    }
                                >
                                    <span className="text-sm font-medium">
                                        Custom
                                    </span>
                                    {ready && palette === "custom" ? (
                                        <Check
                                            aria-hidden="true"
                                            className="size-4 text-primary"
                                        />
                                    ) : null}
                                </span>
                                <span
                                    className={
                                        "block px-4 pt-1 text-xs " +
                                        "text-muted-foreground"
                                    }
                                >
                                    Choose your own primary accent color.
                                </span>
                            </label>
                            <div className="flex items-center gap-3 px-4 pb-4 pt-3">
                                <input
                                    aria-label="Custom accent color"
                                    className={
                                        "h-9 w-12 cursor-pointer rounded-xl " +
                                        "border bg-transparent p-1"
                                    }
                                    disabled={!ready}
                                    onChange={(event) =>
                                        changeAppearance({
                                            custom_color: event.target.value,
                                            palette: "custom",
                                        })
                                    }
                                    type="color"
                                    value={customColor || defaultCustomColor}
                                />
                                <span
                                    className={
                                        "font-mono text-xs uppercase " +
                                        "text-muted-foreground"
                                    }
                                >
                                    {customColor || defaultCustomColor}
                                </span>
                            </div>
                        </div>
                    </div>
                </fieldset>
                <div className="text-xs leading-5 text-muted-foreground">
                    <p>
                        Saved to your account. Offline changes sync when you
                        reconnect.
                    </p>
                    <p aria-live="polite" role="status">
                        {status}
                    </p>
                    {status.includes("pending") ? (
                        <button
                            className="mt-1 text-primary underline"
                            onClick={retrySync}
                            type="button"
                        >
                            Retry account sync
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function PalettePreview({
    mode,
    palette,
}: {
    mode?: string;
    palette: PresetPalette;
}) {
    const preview = useRef<HTMLSpanElement>(null);

    useLayoutEffect(() => {
        const root = document.documentElement;
        const previousPalette = root.dataset.palette;
        const previousInlineValues = previewProperties.map((property) =>
            root.style.getPropertyValue(property),
        );

        previewProperties.forEach((property) =>
            root.style.removeProperty(property),
        );
        root.dataset.palette = palette;
        const styles = getComputedStyle(root);

        previewProperties.forEach((property, index) => {
            preview.current?.style.setProperty(
                `--palette-preview-${index}`,
                styles.getPropertyValue(property).trim(),
            );
        });

        if (previousPalette) {
            root.dataset.palette = previousPalette;
        } else {
            delete root.dataset.palette;
        }
        previewProperties.forEach((property, index) => {
            const value = previousInlineValues[index];
            if (value) root.style.setProperty(property, value);
        });
    }, [mode, palette]);

    return (
        <span
            aria-hidden="true"
            className="block p-4"
            ref={preview}
            style={{
                backgroundColor:
                    "var(--palette-preview-0, var(--background))",
            }}
        >
            <span className="flex items-center justify-between">
                <span
                    className="h-2 w-16 rounded-full"
                    style={{
                        backgroundColor:
                            "var(--palette-preview-2, var(--primary))",
                    }}
                />
                <span
                    className="h-5 w-10 rounded-lg"
                    style={{
                        backgroundColor:
                            "var(--palette-preview-2, var(--primary))",
                    }}
                />
            </span>
            <span
                className="mt-3 flex h-14 items-end gap-2 rounded-xl px-3 pb-2"
                style={{
                    backgroundColor:
                        "var(--palette-preview-1, var(--card))",
                }}
            >
                {[3, 5, 4, 7, 6, 9].map((height, index) => (
                    <span
                        key={index}
                        className="flex-1 rounded-t-sm"
                        style={{
                            backgroundColor: `var(--palette-preview-${
                                2 + (index % 3)
                            })`,
                            height: height * 4,
                        }}
                    />
                ))}
            </span>
        </span>
    );
}

function CustomPalettePreview({ color }: { color: string }) {
    const accent = color || defaultCustomColor;

    return (
        <span aria-hidden="true" className="block bg-background p-4">
            <span className="flex items-center justify-between">
                <span
                    className="h-2 w-16 rounded-full"
                    style={{ backgroundColor: accent }}
                />
                <span
                    className="h-5 w-10 rounded-lg"
                    style={{ backgroundColor: accent }}
                />
            </span>
            <span
                className={
                    "mt-3 flex h-14 items-end gap-2 rounded-xl " +
                    "bg-card px-3 pb-2"
                }
            >
                {[3, 5, 4, 7, 6, 9].map((height, index) => (
                    <span
                        className="flex-1 rounded-t-sm"
                        key={index}
                        style={{
                            backgroundColor:
                                index % 3 === 0
                                    ? accent
                                    : `var(--chart-${2 + (index % 2)})`,
                            height: height * 4,
                        }}
                    />
                ))}
            </span>
        </span>
    );
}
