import {
  LayoutDashboard,
  Package,
  Boxes,
  Upload,
  Tags,
  Warehouse,
  Eye,
  ArrowLeftRight,
  SlidersHorizontal,
  ClipboardCheck,
  CircleDollarSign,
  Receipt,
  PlusCircle,
  RotateCcw,
  ShoppingCart,
  ClipboardList,
  FileText,
  PackageCheck,
  Truck,
  FileBarChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Bell,
  Settings,
  Building,
  Users,
  ShieldCheck,
  Sliders,
  BellRing,
  ScrollText,
  type LucideIcon,
} from "lucide-react";

export interface MenuItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  roles?: string | string[];
  permission?: string | string[];
  children?: MenuItem[];
  badge?: string | number;
}

export const menuConfig: MenuItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: "products.read", // Everyone with basic access
  },
  {
    label: "Products",
    icon: Package,
    permission: "products.read",
    children: [
      {
        label: "All Products",
        href: "/products",
        icon: Boxes,
        permission: "products.read",
      },
      {
        label: "Categories",
        href: "/products/categories",
        icon: Tags,
        permission: "products.read",
      },
    ],
  },
  {
    label: "Inventory",
    icon: Warehouse,
    permission: "inventory.read",
    children: [
      {
        label: "Stock Overview",
        href: "/inventory/overview",
        icon: Eye,
        permission: "inventory.read",
      },
      {
        label: "Stock Movements",
        href: "/inventory/movements",
        icon: ArrowLeftRight,
        permission: "inventory.read",
      },
      {
        label: "Stock Adjustments",
        href: "/inventory/adjustments",
        icon: SlidersHorizontal,
        permission: "inventory.adjust",
      },
      {
        label: "Physical Counts",
        href: "/inventory/counts",
        icon: ClipboardCheck,
        permission: "inventory.count",
      },
    ],
  },
  {
    label: "Sales",
    icon: CircleDollarSign,
    permission: "sales.read",
    children: [
      {
        label: "All Sales",
        href: "/sales",
        icon: Receipt,
        permission: "sales.read",
      },
      {
        label: "New Sale",
        href: "/sales/new",
        icon: PlusCircle,
        permission: "sales.create",
      },
      {
        label: "Returns",
        href: "/sales/returns",
        icon: RotateCcw,
        permission: "sales.read",
      },
    ],
  },
  {
    label: "Purchases",
    icon: ShoppingCart,
    permission: "purchases.read",
    children: [
      {
        label: "All Purchases",
        href: "/purchases",
        icon: ClipboardList,
        permission: "purchases.read",
      },
      {
        label: "New Purchase",
        href: "/purchases/new",
        icon: PlusCircle,
        permission: "purchases.create",
      },
      {
        label: "Purchase Orders",
        href: "/purchases/orders",
        icon: FileText,
        permission: "purchases.read",
      },
      {
        label: "Receiving",
        href: "/purchases/receiving",
        icon: PackageCheck,
        permission: "purchases.receive",
      },
    ],
  },
  {
    label: "Suppliers",
    href: "/suppliers",
    icon: Truck,
    permission: "suppliers.read",
  },
  {
    label: "Reports",
    icon: FileBarChart,
    roles: ["owner", "admin", "manager"],
    permission: "reports.read",
    children: [
      {
        label: "Sales Report",
        href: "/reports/sales",
        icon: TrendingUp,
        permission: "reports.read",
      },
      {
        label: "Purchase Report",
        href: "/reports/purchases",
        icon: TrendingDown,
        permission: "reports.read",
      },
      {
        label: "Inventory Report",
        href: "/reports/inventory",
        icon: Package,
        permission: "reports.read",
      },
      {
        label: "Profit Report",
        href: "/reports/profit",
        icon: DollarSign,
        permission: "reports.read",
      },
      {
        label: "Low Stock Report",
        href: "/reports/low-stock",
        icon: AlertTriangle,
        permission: "reports.read",
      },
      {
        label: "Stock Movement Report",
        href: "/reports/movements",
        icon: ArrowLeftRight,
        permission: "reports.read",
      },
    ],
  },
  {
    label: "Alerts",
    href: "/alerts",
    icon: Bell,
    permission: "products.read",
  },
  {
    label: "Settings",
    icon: Settings,
    roles: ["owner", "admin", "manager"],
    permission: "business.manage",
    children: [
      {
        label: "Business Profile",
        href: "/settings/profile",
        icon: Building,
        roles: ["owner", "admin"],
        permission: "business.manage",
      },
      {
        label: "Members",
        href: "/settings/members",
        icon: Users,
        roles: ["owner", "admin"],
        permission: "members.read",
      },
      {
        label: "Roles & Permissions",
        href: "/settings/roles",
        icon: ShieldCheck,
        roles: ["owner", "admin"],
        permission: "members.update_role",
      },
      {
        label: "Import Settings",
        href: "/settings/import",
        icon: Sliders,
        roles: ["owner", "admin"],
        permission: "business.manage",
      },
      {
        label: "Notifications",
        href: "/settings/notifications",
        icon: BellRing,
        roles: ["owner", "admin", "manager"],
        permission: "business.manage",
      },
      {
        label: "Audit Logs",
        href: "/settings/audit",
        icon: ScrollText,
        roles: ["owner", "admin"],
        permission: "business.manage",
      },
    ],
  },
];