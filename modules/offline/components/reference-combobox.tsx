"use client";

import { useMemo, useState } from "react";
import { ChevronsUpDown } from "lucide-react";

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type ReferenceOption = {
    id: string;
    label: string;
    description?: string;
    searchText?: string;
    group?: string;
};

export function ReferenceCombobox({
    id,
    value,
    options,
    onValueChange,
    placeholder,
    searchPlaceholder,
    emptyMessage,
    disabled = false,
}: {
    id?: string;
    value: string;
    options: ReferenceOption[];
    onValueChange: (value: string) => void;
    placeholder: string;
    searchPlaceholder: string;
    emptyMessage: string;
    disabled?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const selected = options.find((option) => option.id === value);
    const visibleOptions = useMemo(() => {
        const search = query.trim().toLowerCase();
        const matches = search
            ? options.filter((option) =>
                  [
                      option.label,
                      option.description,
                      option.searchText,
                  ]
                      .filter(Boolean)
                      .some((text) =>
                          String(text).toLowerCase().includes(search),
                      ),
              )
            : options;

        return matches.slice(0, 100);
    }, [options, query]);

    const visibleGroups = useMemo(() => {
        const groups = new Map<string, ReferenceOption[]>();

        visibleOptions.forEach((option) => {
            const group = option.group ?? "";
            const groupOptions = groups.get(group) ?? [];
            groupOptions.push(option);
            groups.set(group, groupOptions);
        });

        return Array.from(groups.entries());
    }, [visibleOptions]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                id={id}
                aria-expanded={open}
                aria-label={placeholder}
                disabled={disabled}
                className={
                    "flex h-10 w-full items-center justify-between " +
                    "rounded-2xl border border-input bg-background px-3 " +
                    "py-2 text-left text-sm outline-none " +
                    "focus-visible:ring-2 focus-visible:ring-ring " +
                    "disabled:pointer-events-none disabled:opacity-50"
                }
            >
                <span
                    className={cn(
                        "min-w-0 truncate",
                        !selected && "text-muted-foreground",
                    )}
                >
                    {selected?.label ?? placeholder}
                </span>
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
            </PopoverTrigger>

            <PopoverContent
                align="start"
                className="w-(--anchor-width) p-0"
            >
                <Command shouldFilter={false}>
                    <CommandInput
                        value={query}
                        onValueChange={setQuery}
                        placeholder={searchPlaceholder}
                    />
                    <CommandList>
                        {visibleOptions.length === 0 ? (
                            <CommandEmpty>{emptyMessage}</CommandEmpty>
                        ) : (
                            visibleGroups.map(([group, groupOptions]) => (
                                <CommandGroup
                                    key={group || "options"}
                                    heading={group || undefined}
                                >
                                    {groupOptions.map((option) => (
                                        <CommandItem
                                            key={option.id}
                                            value={option.id}
                                            data-checked={
                                                value === option.id
                                            }
                                            onSelect={() => {
                                                onValueChange(option.id);
                                                setOpen(false);
                                                setQuery("");
                                            }}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate">
                                                    {option.label}
                                                </p>
                                                {option.description && (
                                                    <p
                                                        className={
                                                            "truncate " +
                                                            "text-xs " +
                                                            "font-normal " +
                                                            "text-muted-" +
                                                            "foreground"
                                                        }
                                                    >
                                                        {option.description}
                                                    </p>
                                                )}
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            ))
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
