import { MenuItem } from "./menu-config";

export interface UserAccessContext {
  role?: string | null;
  permissions?: string[];
}

/**
 * Checks if the user's role satisfies the required role(s).
 * Performs a case-insensitive comparison.
 *
 * @param userRole Current role of the user (e.g. "admin", "owner", "manager", "staff")
 * @param requiredRole Required role or list of allowed roles
 * @returns true if user has an allowed role or if no role is required
 */
export function hasRole(
  userRole?: string | null,
  requiredRole?: string | string[]
): boolean {
  if (!requiredRole) return true;
  if (!userRole) return false;

  const normalizedUserRole = userRole.toLowerCase().trim();

  if (Array.isArray(requiredRole)) {
    return requiredRole.some(
      (r) => r.toLowerCase().trim() === normalizedUserRole
    );
  }

  return requiredRole.toLowerCase().trim() === normalizedUserRole;
}

/**
 * Checks if the user's permissions satisfy the required permission(s).
 * Supports exact permission strings and wildcard matching (e.g. "products.*").
 *
 * @param userPermissions List of permissions granted to the user
 * @param required Required permission or list of permissions
 * @returns true if user has the required permission(s) or if none are required
 */
export function hasPermission(
  userPermissions: string[] = [],
  required?: string | string[]
): boolean {
  if (!required) return true;

  const checkSingle = (perm: string) => {
    if (userPermissions.includes(perm)) return true;

    // Check wildcard required (e.g. required "products.*")
    if (perm.endsWith(".*")) {
      const prefix = perm.slice(0, -2);
      return userPermissions.some((p) => p.startsWith(prefix));
    }

    // Check if user has wildcard that satisfies specific required perm
    return userPermissions.some((userPerm) => {
      if (userPerm.endsWith(".*")) {
        const prefix = userPerm.slice(0, -2);
        return perm.startsWith(prefix);
      }
      return userPerm === perm;
    });
  };

  if (Array.isArray(required)) {
    return required.some(checkSingle);
  }
  return checkSingle(required);
}

/**
 * Checks if a specific MenuItem is accessible based on the user's role and permissions.
 *
 * @param item The menu item to check
 * @param userOrRole User access context object { role, permissions } or role string
 * @param userPermissions Optional permissions array if role string was passed
 * @returns true if the menu item is accessible
 */
export function canAccessMenuItem(
  item: MenuItem,
  userOrRole?: UserAccessContext | string | null,
  userPermissions: string[] = []
): boolean {
  let role: string | null = null;
  let permissions: string[] = userPermissions;

  if (userOrRole && typeof userOrRole === "object") {
    role = userOrRole.role ?? null;
    permissions = userOrRole.permissions ?? [];
  } else if (typeof userOrRole === "string" || userOrRole === null) {
    role = userOrRole ?? null;
  }

  // 1. Role Guard Check
  if (item.roles && !hasRole(role, item.roles)) {
    return false;
  }

  // 2. Permission Guard Check
  if (item.permission && !hasPermission(permissions, item.permission)) {
    return false;
  }

  return true;
}

/**
 * Recursively filters a menu structure based on user's role and permissions.
 * - Hides items that fail role or permission checks.
 * - Filters child submenu items recursively.
 * - Automatically prunes parent categories that have no accessible children and no direct href.
 *
 * @param menuItems The array of menu items to filter (e.g. menuConfig)
 * @param userOrRole User access context { role, permissions } or role string
 * @param permissions Optional permissions array if role string was passed
 * @returns Filtered menu items
 *
 * @example
 * // Usage with object:
 * const menu = getFilteredMenu(menuConfig, { role: "staff", permissions: ["products.read"] });
 *
 * // Usage with separate arguments:
 * const menu = getFilteredMenu(menuConfig, "admin", ["products.read", "sales.read"]);
 */
export function getFilteredMenu(
  menuItems: MenuItem[],
  userOrRole?: UserAccessContext | string | null,
  permissions: string[] = []
): MenuItem[] {
  let userContext: UserAccessContext = {};

  if (userOrRole && typeof userOrRole === "object") {
    userContext = userOrRole;
  } else {
    userContext = {
      role: userOrRole ?? null,
      permissions,
    };
  }

  return menuItems
    .filter((item) => canAccessMenuItem(item, userContext))
    .map((item) => {
      if (item.children && item.children.length > 0) {
        const filteredChildren = getFilteredMenu(item.children, userContext);
        return {
          ...item,
          children: filteredChildren,
        };
      }
      return item;
    })
    .filter((item) => {
      // Keep if item has a direct link (href)
      if (item.href) return true;
      // If it's a parent category with sub-items, keep only if it has accessible children
      if (item.children && item.children.length > 0) return true;
      // Drop empty category parents
      return false;
    });
}
