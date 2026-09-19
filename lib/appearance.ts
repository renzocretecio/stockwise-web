export const palettes = [
    {
        id: "petrol",
        name: "KitaStock",
        description: "Ink, warm gold, and balanced neutrals",
    },
    {
        id: "graphite",
        name: "Graphite",
        description: "Silver, charcoal, and slate blue",
    },
    {
        id: "ocean",
        name: "Ocean",
        description: "Cool blue with balanced accents",
    },
    {
        id: "amber",
        name: "Amber",
        description: "Warm amber with grounded neutrals",
    },
    {
        id: "rose",
        name: "Rose",
        description: "Soft rose with muted contrast",
    },
] as const;

export const defaultCustomColor = "#f3bc16";

export type PresetPalette = (typeof palettes)[number]["id"];
export type Palette = PresetPalette | "custom";
export type AppearanceMode = "light" | "dark" | "system";
export type Appearance = {
    palette: Palette;
    mode: AppearanceMode;
    custom_color?: string;
};
export type SavedAppearance = Appearance & {
    userId: string;
    pending: boolean;
    version: string;
};

export const appearanceKey = (id: string) => `stockwise-appearance:${id}`;
export const currentAppearanceKey = "stockwise-appearance-current";

const customProperties = [
    "--primary",
    "--primary-foreground",
    "--ring",
    "--chart-1",
    "--sidebar-primary",
    "--sidebar-primary-foreground",
] as const;

export function isHexColor(value: unknown): value is string {
    return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

export function isAppearance(value: unknown): value is Appearance {
    if (!value || typeof value !== "object") return false;
    const candidate = value as Appearance;
    const paletteIsValid =
        candidate.palette === "custom" ||
        palettes.some((palette) => palette.id === candidate.palette);
    return (
        paletteIsValid &&
        ["light", "dark", "system"].includes(candidate.mode) &&
        (candidate.palette !== "custom" ||
            isHexColor(candidate.custom_color))
    );
}

export function applyAppearance(value: Appearance) {
    const root = document.documentElement;
    root.dataset.palette = value.palette;

    if (value.palette !== "custom") {
        customProperties.forEach((property) =>
            root.style.removeProperty(property),
        );
        return;
    }

    const color = isHexColor(value.custom_color)
        ? value.custom_color
        : defaultCustomColor;
    const foreground = readableForeground(color);
    root.style.setProperty("--primary", color);
    root.style.setProperty("--primary-foreground", foreground);
    root.style.setProperty("--ring", color);
    root.style.setProperty("--chart-1", color);
    root.style.setProperty("--sidebar-primary", color);
    root.style.setProperty("--sidebar-primary-foreground", foreground);
}

function readableForeground(color: string) {
    const red = Number.parseInt(color.slice(1, 3), 16);
    const green = Number.parseInt(color.slice(3, 5), 16);
    const blue = Number.parseInt(color.slice(5, 7), 16);
    const brightness = (red * 299 + green * 587 + blue * 114) / 1000;
    return brightness > 150 ? "#1f1f1f" : "#ffffff";
}

export function readAppearance(id: string): SavedAppearance | null {
    try {
        const value = JSON.parse(
            localStorage.getItem(appearanceKey(id)) || "null",
        );
        if (
            !isAppearance(value) ||
            !("userId" in value) ||
            value.userId !== id ||
            !("pending" in value) ||
            typeof value.pending !== "boolean" ||
            !("version" in value) ||
            typeof value.version !== "string"
        )
            return null;
        return {
            palette: value.palette,
            mode: value.mode,
            custom_color: isHexColor(value.custom_color)
                ? value.custom_color
                : defaultCustomColor,
            userId: id,
            pending: value.pending,
            version: value.version,
        };
    } catch {
        return null;
    }
}

export function storeAppearance(value: SavedAppearance) {
    try {
        localStorage.setItem(
            appearanceKey(value.userId),
            JSON.stringify(value),
        );
        localStorage.setItem(currentAppearanceKey, JSON.stringify(value));
    } catch {
        // Preferences still apply for this session if storage is unavailable.
    }
}

export const appearanceScript = `
try {
    var saved = JSON.parse(
        localStorage.getItem("${currentAppearanceKey}") || "null"
    );
    var palettes = ${JSON.stringify([
        ...palettes.map((palette) => palette.id),
        "custom",
    ])};
    if (saved && palettes.includes(saved.palette)) {
        document.documentElement.dataset.palette = saved.palette;
        if (
            saved.palette === "custom" &&
            /^#[0-9a-f]{6}/i.test(saved.custom_color || "") &&
            (saved.custom_color || "").length === 7
        ) {
            var color = saved.custom_color;
            var red = parseInt(color.slice(1, 3), 16);
            var green = parseInt(color.slice(3, 5), 16);
            var blue = parseInt(color.slice(5, 7), 16);
            var foreground = (red * 299 + green * 587 + blue * 114) / 1000 > 150
                ? "#1f1f1f"
                : "#ffffff";
            var style = document.documentElement.style;
            style.setProperty("--primary", color);
            style.setProperty("--primary-foreground", foreground);
            style.setProperty("--ring", color);
            style.setProperty("--chart-1", color);
            style.setProperty("--sidebar-primary", color);
            style.setProperty("--sidebar-primary-foreground", foreground);
        }
    }
} catch (_) {}
`;
