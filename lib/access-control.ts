type RoutePermission = {
    path: string;
    permission: string;
};

const ROUTE_PERMISSIONS: RoutePermission[] = [
    {
        path: "/dashboard/intelligence",
        permission: "reports.read",
    },
    {
        path: "/dashboard/overview",
        permission: "reports.read",
    },
    {
        path: "/inventory/adjustments",
        permission: "inventory.adjust",
    },
    {
        path: "/inventory/counts",
        permission: "inventory.count",
    },
    {
        path: "/inventory",
        permission: "inventory.read",
    },
    {
        path: "/products",
        permission: "products.read",
    },
    {
        path: "/sales",
        permission: "sales.read",
    },
    {
        path: "/purchases",
        permission: "purchases.read",
    },
    {
        path: "/suppliers",
        permission: "suppliers.read",
    },
    {
        path: "/reports",
        permission: "reports.read",
    },
    {
        path: "/intelligence",
        permission: "reports.read",
    },
    {
        path: "/onboarding/business",
        permission: "business.update",
    },
];

export function requiredPermissionForPath(pathname: string) {
    return ROUTE_PERMISSIONS.find(({ path }) =>
        matchesRoute(pathname, path),
    )?.permission;
}

export function defaultRouteForPermissions(permissions: string[] = []) {
    if (permissions.includes("reports.read")) {
        return "/dashboard/overview";
    }
    if (permissions.includes("sales.read")) {
        return "/sales";
    }
    if (permissions.includes("inventory.read")) {
        return "/inventory/overview";
    }
    if (permissions.includes("products.read")) {
        return "/products";
    }
    if (permissions.includes("purchases.read")) {
        return "/purchases";
    }
    if (permissions.includes("suppliers.read")) {
        return "/suppliers";
    }

    return "/businesses/new";
}

function matchesRoute(pathname: string, route: string) {
    return pathname === route || pathname.startsWith(`${route}/`);
}
