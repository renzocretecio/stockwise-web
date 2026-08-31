"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  User,
  LogOut,
  Building2,
  Shield,
  Menu,
  X,
  Boxes,
} from "lucide-react";
import { MenuItem, menuConfig } from "@/lib/menu-config";
import { getFilteredMenu } from "@/lib/menu-utils";
import { cn } from "@/lib/utils";

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

  // Active state for desktop dropdowns and mobile menu
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
  const userPermissions =
    authData?.permissions || activeBusiness?.permissions || [];

  // Filter menu items directly based on user's role and permissions
  const filteredMenuItems = useMemo(() => {
    return getFilteredMenu(menuConfig, {
      role: userRole,
      permissions: userPermissions,
    });
  }, [userRole, userPermissions]);

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
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout request failed", error);
    } finally {
      window.location.href = "/login";
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

  const isItemActive = (item: MenuItem): boolean => {
    if (item.href) {
      if (item.href === "/dashboard") {
        return pathname === "/dashboard";
      }
      return pathname.startsWith(item.href);
    }
    if (item.children) {
      return item.children.some(
        (child) => child.href && pathname.startsWith(child.href),
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* 1. LOGO */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <Boxes className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-foreground leading-none">
                Stockwise
              </span>
              <span className="text-[10px] font-medium text-muted-foreground tracking-wider uppercase">
                Inventory
              </span>
            </div>
          </Link>
        </div>

        {/* 2. MENUS */}
        <nav
          ref={navRef}
          className="hidden md:flex items-center gap-1 flex-1 justify-center max-w-3xl"
          aria-label="Main Navigation"
        >
          {filteredMenuItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const active = isItemActive(item);
            const isOpen = openDropdown === item.label;
            const Icon = item.icon;

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
                      "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer",
                      isOpen || active
                        ? "bg-accent text-accent-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                    )}
                    aria-expanded={isOpen}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>

                  {isOpen && (
                    <div className="absolute left-0 mt-1.5 w-56 rounded-xl border border-border/80 bg-popover/98 p-1.5 text-popover-foreground shadow-lg shadow-black/5 animate-in fade-in-0 zoom-in-95 duration-150 z-50">
                      <div className="space-y-0.5">
                        {item.children?.map((child) => {
                          const childActive =
                            child.href && pathname.startsWith(child.href);
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
                href={item.href || "/dashboard"}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* 3. PROFILE */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary capitalize">
            <Shield className="h-3 w-3" />
            <span>{userRole}</span>
          </div>

          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1.5 rounded-full hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors cursor-pointer"
              aria-label="User profile menu"
              aria-expanded={isProfileOpen}
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-background">
                {userInitials}
              </div>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-muted-foreground hidden sm:block transition-transform duration-200",
                  isProfileOpen && "rotate-180",
                )}
              />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-border/80 bg-popover/98 p-2 text-popover-foreground shadow-xl shadow-black/10 animate-in fade-in-0 zoom-in-95 duration-150 z-50">
                <div className="px-3 py-2.5 border-b border-border/60 mb-1">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {user?.first_name
                      ? `${user.first_name} ${user?.last_name || ""}`.trim()
                      : "User Account"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || "Signed in"}
                  </p>

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
                    href="/settings/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile Settings</span>
                  </Link>

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

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE NAVIGATION DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 pt-2 pb-6 space-y-1 animate-in slide-in-from-top-2 duration-150">
          <div className="py-2 mb-2 border-b border-border flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Navigation ({userRole})
            </span>
          </div>

          {filteredMenuItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const active = isItemActive(item);
            const isExpanded = mobileExpanded.has(item.label);
            const Icon = item.icon;

            if (hasChildren) {
              return (
                <div key={item.label} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleMobileExpanded(item.label)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isExpanded && "rotate-180",
                      )}
                    />
                  </button>

                  {isExpanded && (
                    <div className="pl-6 space-y-1 border-l-2 border-border/60 ml-4 my-1">
                      {item.children?.map((child) => {
                        const childActive =
                          child.href && pathname.startsWith(child.href);
                        const ChildIcon = child.icon;
                        return (
                          <Link
                            key={child.label}
                            href={child.href || "#"}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                              childActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:bg-muted",
                            )}
                          >
                            <ChildIcon className="h-4 w-4 shrink-0" />
                            <span>{child.label}</span>
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
                href={item.href || "/dashboard"}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
