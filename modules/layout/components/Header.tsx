"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  LogOut,
  Building2,
  Shield,
  Menu,
  X,
  Boxes,
  Plus,
  Settings,
} from "lucide-react";
import { SettingsHub } from "@/modules/settings/components/SettingsHub";
import { MenuItem, menuConfig } from "@/lib/menu-config";
import { getFilteredMenu } from "@/lib/menu-utils";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface UserData {
  id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

interface Business {
  id: string;
  name: string;
  role: string;
  slug?: string;
  permissions?: string[];
  currency_code?: string;
}

interface AuthMeResponse {
  user?: UserData | null;
  businesses?: Business[];
  active_business?: Business | null;
  business_id?: string;
  business_name?: string;
  permissions?: string[];
  role?: string;
  success?: boolean;
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Active state for desktop dropdowns and mobile menu
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSwitchingBusiness, setIsSwitchingBusiness] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<Set<string>>(new Set());

  const navRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Fetch current user and business context
  const { data: authData } = useQuery<AuthMeResponse>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch auth data");
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });

  // Extract user role and permissions
  const user = authData?.user;
  const activeBusiness = authData?.active_business;

  // Active user role (derived from active business, user object, or response root)
  const userRole =
    activeBusiness?.role || authData?.role || user?.role || "admin";
  // Filter menu items directly based on user's role and permissions
  const filteredMenuItems = useMemo(() => {
    const userPermissions =
      authData?.permissions || activeBusiness?.permissions || [];
    return getFilteredMenu(menuConfig, {
      role: userRole,
      permissions: userPermissions,
    });
  }, [activeBusiness?.permissions, authData?.permissions, userRole]);
  const desktopMenuItems = useMemo(
    () => filteredMenuItems,
    [filteredMenuItems],
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsMobileMenuOpen(false);
      setOpenDropdown(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout request failed", error);
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  const handleBusinessChange = async (businessId: string) => {
    if (!businessId || businessId === activeBusiness?.id) return;
    setIsSwitchingBusiness(true);
    try {
      const response = await fetch("/api/auth/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_id: businessId }),
      });
      if (!response.ok) throw new Error("Unable to switch business");
      await queryClient.invalidateQueries();
      setIsProfileOpen(false);
      setIsSwitchingBusiness(false);
      router.replace("/dashboard/overview");
      router.refresh();
    } catch (error) {
      console.error("Business switch failed", error);
      setIsSwitchingBusiness(false);
    }
  };

  const toggleMobileExpanded = (label: string) => {
    setMobileExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const isLinkActive = (href: string, siblings?: MenuItem[]): boolean => {
    const matchingLinks = (siblings ?? [{ href }])
      .map((item) => item.href)
      .filter(
        (candidate): candidate is string =>
          Boolean(candidate) &&
          (pathname === candidate || pathname.startsWith(`${candidate}/`)),
      );

    if (!matchingLinks.length) return false;

    const mostSpecificMatch = matchingLinks.reduce((longest, candidate) =>
      candidate.length > longest.length ? candidate : longest,
    );

    return href === mostSpecificMatch;
  };

  const isItemActive = (item: MenuItem): boolean => {
    if (item.href) return isLinkActive(item.href);
    if (item.children) {
      return item.children.some(
        (child) =>
          child.href && isLinkActive(child.href, item.children),
      );
    }
    return false;
  };

  const userInitials =
    user?.first_name && user?.last_name
      ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
      : user?.first_name
        ? user.first_name.slice(0, 2).toUpperCase()
        : user?.email
          ? user.email.slice(0, 2).toUpperCase()
          : "SW";
  const userDisplayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.email?.split("@")[0] ||
    "Account";

  return (
    <header
      className={
        "sticky top-0 z-40 w-full px-3 pt-3 sm:px-4"
      }
    >
      <div
        className={cn(
          "rounded-2xl border",
          "border-border/70 bg-card/90 px-3 shadow-lg",
          "shadow-black/5 backdrop-blur-xl sm:px-4",
          "supports-[backdrop-filter]:bg-card",
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2">
          {/* 1. LOGO */}
          <div className="shrink-0">
            <Link
              href="/dashboard/overview"
              className={cn(
                "group flex items-center gap-2.5 rounded-full",
                "focus:outline-none focus-visible:ring-2",
                "focus-visible:ring-primary",
              )}
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                <Boxes className="h-5 w-5" />
              </div>
              <span className="text-xl font-semibold tracking-tight">
                StockWise
              </span>
            </Link>
          </div>

          {/* 2. MENUS */}
          <nav
            ref={navRef}
            className={cn(
              "hidden min-w-0 items-center justify-center gap-0.5",
              "rounded-full border border-border/60 bg-background/70",
              "p-1 shadow-sm xl:flex",
            )}
            aria-label="Main Navigation"
          >
            {desktopMenuItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const active = isItemActive(item);
              const isOpen = openDropdown === item.label;

              if (hasChildren) {
                return (
                  <div key={item.label} className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenDropdown((prev) =>
                          prev === item.label ? null : item.label,
                        )
                      }
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-full",
                        "px-3 py-2",
                        "text-[13px] font-medium",
                        "transition-colors",
                        "duration-150 focus:outline-none",
                        "focus-visible:ring-2 focus-visible:ring-primary",
                        "2xl:px-4 2xl:text-sm",
                        isOpen || active
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                      )}
                      aria-expanded={isOpen}
                    >
                      {active && (
                        <span className="size-1.5 rounded-full bg-primary" />
                      )}
                      <span>{item.label}</span>
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                          isOpen && "rotate-180",
                        )}
                      />
                    </button>

                    {isOpen && (
                      <div
                        className={cn(
                          "absolute left-0 z-50 mt-2 w-56 rounded-xl",
                          "border border-border/80 bg-popover/98 p-1.5",
                          "text-popover-foreground shadow-lg shadow-black/5",
                          "animate-in fade-in-0 zoom-in-95 duration-150",
                        )}
                      >
                        <div className="space-y-0.5">
                          {item.children?.map((child) => {
                            const childActive =
                              child.href &&
                              isLinkActive(child.href, item.children);
                            const ChildIcon = child.icon;
                            return (
                              <Link
                                key={child.label}
                                href={child.href || "#"}
                                onClick={() => setOpenDropdown(null)}
                                className={cn(
                                  "flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors duration-150",
                                  childActive
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                                )}
                              >
                                <ChildIcon className="h-4 w-4 shrink-0" />
                                <span className="flex-1 text-left">
                                  {child.label}
                                </span>
                                {childActive && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href || "/dashboard/overview"}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3 py-2",
                    "text-[13px] font-medium transition-colors duration-150",
                    "focus:outline-none focus-visible:ring-2",
                    "focus-visible:ring-primary",
                    "2xl:px-4 2xl:text-sm",
                    active
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  {active && (
                    <span className="size-1.5 rounded-full bg-primary" />
                  )}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* 3. PROFILE */}
          <div className="flex shrink-0 items-center gap-2">
            <div ref={profileRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen((prev) => !prev);
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-full",
                  "lg:border lg:border-border",
                  "lg:bg-card p-1.5 lg:shadow-sm",
                  "transition-colors hover:bg-background/80",
                  "focus:outline-none focus-visible:ring-2",
                  "focus-visible:ring-primary xl:pr-3",
                )}
                aria-label="User profile menu"
                aria-expanded={isProfileOpen}
              >
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full",
                    "bg-gradient-to-tr from-blue-600 to-indigo-600",
                    "text-xs font-bold text-white shadow-sm ring-2",
                    "ring-background",
                  )}
                >
                  {userInitials}
                </div>
                <div className="hidden min-w-0 max-w-36 text-left xl:block">
                  <p className="truncate text-xs font-semibold">
                    {userDisplayName}
                  </p>
                  <p
                    className={cn(
                      "truncate text-[10px] capitalize",
                      "text-muted-foreground",
                    )}
                  >
                    {activeBusiness?.name
                      ? `${activeBusiness.name} · ${userRole}`
                      : userRole}
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    "hidden size-3.5 text-muted-foreground transition-transform",
                    "duration-200 xl:block",
                    isProfileOpen && "rotate-180",
                  )}
                />
              </button>

              {isProfileOpen && (
                <div
                  className={cn(
                    "absolute right-0 z-50 mt-2 w-[min(16rem,calc(100vw-2rem))]",
                    "animate-in rounded-xl border border-border/80",
                    "bg-popover/98 p-2 text-popover-foreground shadow-xl",
                    "shadow-black/10 fade-in-0 zoom-in-95 duration-150",
                  )}
                >
                  <div className="px-3 py-2.5 border-b border-border/60 mb-1">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {user?.first_name
                        ? `${user.first_name} ${user?.last_name || ""}`.trim()
                        : "User Account"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email || "Signed in"}
                    </p>

                    {(authData?.businesses?.length ?? 0) > 1 && (
                      <label className="mt-3 block text-xs font-medium">
                        <span className="mb-1 block text-muted-foreground">
                          Active business
                        </span>
                        <select
                          value={activeBusiness?.id ?? ""}
                          disabled={isSwitchingBusiness}
                          onChange={(event) =>
                            handleBusinessChange(event.target.value)
                          }
                          className="h-8 w-full rounded-md border bg-background px-2"
                        >
                          {authData?.businesses?.map((business) => (
                            <option key={business.id} value={business.id}>
                              {business.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}

                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-[11px] font-medium text-secondary-foreground capitalize">
                        <Shield className="h-3 w-3 text-primary" />
                        {userRole}
                      </span>
                      {activeBusiness?.name && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-muted-foreground truncate max-w-[120px]">
                          <Building2 className="h-3 w-3" />
                          {activeBusiness.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <Link
                      href="/settings/businesses"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add business</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        setIsSettingsOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors text-left cursor-pointer"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Drawer
              open={isMobileMenuOpen}
              onOpenChange={(open) => {
                setIsMobileMenuOpen(open);
                if (open) setIsProfileOpen(false);
              }}
              swipeDirection="right"
            >
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className={cn(
                  "flex size-10 cursor-pointer items-center justify-center",
                  "rounded-full border bg-card text-muted-foreground shadow-sm",
                  "hover:bg-muted hover:text-foreground focus:outline-none",
                  "focus-visible:ring-2 focus-visible:ring-primary xl:hidden",
                )}
                aria-label="Toggle navigation menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>

              <DrawerContent className="m-0! w-screen! max-w-none rounded-none">
                <DrawerHeader className="relative border-b px-5 pb-4 text-left">
                  <DrawerTitle>Navigation</DrawerTitle>
                  <DrawerDescription>
                    {userRole} workspace
                  </DrawerDescription>
                  <DrawerClose
                    render={
                      <button
                        aria-label="Close navigation menu"
                        className="absolute right-5 top-4 flex size-9
                          items-center justify-center rounded-full border
                          text-muted-foreground transition-colors
                          hover:bg-muted hover:text-foreground"
                        type="button"
                      />
                    }
                  >
                    <X className="size-4" />
                  </DrawerClose>
                </DrawerHeader>
                <nav
                  aria-label="Mobile navigation"
                  className="overflow-y-auto p-4"
                >
                  <div className="space-y-1">
                    {filteredMenuItems.map((item) => {
                      const hasChildren =
                        item.children && item.children.length > 0;
                      const active = isItemActive(item);
                      const isExpanded = mobileExpanded.has(item.label);
                      const Icon = item.icon;

                      if (hasChildren) {
                        return (
                          <div key={item.label}>
                            <button
                              type="button"
                              onClick={() => toggleMobileExpanded(item.label)}
                              className={cn(
                                "flex w-full items-center justify-between",
                                "rounded-lg px-3 py-2.5 text-sm font-medium",
                                active
                                  ? "bg-primary/10 text-primary"
                                  : "text-muted-foreground hover:bg-muted",
                              )}
                            >
                              <span className="flex items-center gap-2.5">
                                <Icon className="h-4 w-4" />
                                {item.label}
                              </span>
                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 transition-transform",
                                  isExpanded && "rotate-180",
                                )}
                              />
                            </button>
                            {isExpanded && (
                              <div className="ml-5 space-y-1 border-l pl-3">
                                {item.children?.map((child) => {
                                  const ChildIcon = child.icon;
                                  return (
                                    <Link
                                      key={child.label}
                                      href={child.href || "#"}
                                      onClick={() =>
                                        setIsMobileMenuOpen(false)
                                      }
                                      className={cn(
                                        "flex items-center gap-2 rounded-lg",
                                        "px-3 py-2 text-sm",
                                        isLinkActive(child.href || "")
                                          ? "bg-primary/10 font-medium text-primary"
                                          : "text-muted-foreground hover:bg-muted",
                                      )}
                                    >
                                      <ChildIcon className="h-3.5 w-3.5" />
                                      {child.label}
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      }

                      return (
                        <Link
                          key={item.label}
                          href={item.href || "#"}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-2.5 rounded-lg px-3 py-2.5",
                            "text-sm font-medium",
                            active
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </nav>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
      <SettingsHub
        onOpenChange={setIsSettingsOpen}
        open={isSettingsOpen}
      />
    </header>
  );
}
