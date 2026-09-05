"use client";

import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import type { MenuItem } from "@/lib/menu-config";
import { cn } from "@/lib/utils";

type MobileMenuProps = {
  items: MenuItem[];
  userRole: string;
};

export function MobileMenu({ items, userRole }: MobileMenuProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const toggleExpanded = (label: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const close = () => setOpen(false);

  return (
    <div className="xl:hidden">
      <button
        aria-controls="mobile-navigation"
        aria-expanded={open}
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        className={cn(
          "flex size-10 items-center justify-center rounded-full border",
          "bg-card text-muted-foreground shadow-sm transition-colors",
          "hover:bg-muted hover:text-foreground",
        )}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          onClick={close}
          role="presentation"
        >
          <nav
            aria-label="Mobile navigation"
            className="absolute right-3 top-20 w-[min(22rem,calc(100vw-1.5rem))]
              overflow-hidden rounded-2xl border border-border bg-card p-3
              text-card-foreground shadow-2xl animate-in slide-in-from-top-3
              duration-200 sm:right-4"
            id="mobile-navigation"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-border/70 px-3 pb-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em]
                text-muted-foreground">
                Navigation
              </p>
              <p className="mt-1 text-sm font-semibold">{userRole}</p>
            </div>

            <div className="mt-2 space-y-1">
              {items.map((item, index) => {
                const Icon = item.icon;
                const hasChildren = Boolean(item.children?.length);
                const active = isActive(item.href) ||
                  Boolean(item.children?.some((child) => isActive(child.href)));
                const isExpanded = expanded.has(item.label);

                if (hasChildren) {
                  return (
                    <div
                      className="animate-in fade-in-0 slide-in-from-right-2"
                      key={item.label}
                      style={{ animationDelay: `${index * 35}ms` }}
                    >
                      <button
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg",
                          "px-3 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted",
                        )}
                        onClick={() => toggleExpanded(item.label)}
                        type="button"
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon className="size-4" />
                          {item.label}
                        </span>
                        <ChevronDown
                          className={cn(
                            "size-4 transition-transform",
                            isExpanded && "rotate-180",
                          )}
                        />
                      </button>
                      {isExpanded ? (
                        <div className="ml-5 space-y-1 border-l border-border pl-3">
                          {item.children?.map((child) => {
                            const ChildIcon = child.icon;
                            return (
                              <Link
                                className={cn(
                                  "flex items-center gap-2 rounded-lg px-3 py-2",
                                  "text-sm transition-colors",
                                  isActive(child.href)
                                    ? "bg-primary/10 font-medium text-primary"
                                    : "text-muted-foreground hover:bg-muted",
                                )}
                                href={child.href || "#"}
                                key={child.label}
                                onClick={close}
                              >
                                <ChildIcon className="size-3.5" />
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                }

                return (
                  <Link
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2.5",
                      "text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                    href={item.href || "#"}
                    key={item.label}
                    onClick={close}
                    style={{ animationDelay: `${index * 35}ms` }}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
