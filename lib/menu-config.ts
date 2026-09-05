import {
  LayoutDashboard,
  Package,
  Boxes,
  Tags,
  Warehouse,
  Eye,
  ArrowLeftRight,
  SlidersHorizontal,
  ClipboardCheck,
  CircleDollarSign,
  Receipt,
  RotateCcw,
  ShoppingCart,
  Truck,
  FileBarChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Sparkles,
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
    label: "Dashboard",
    icon: LayoutDashboard,
    children: [
      {
        label: "Overview",
        href: "/dashboard/overview",
        icon: LayoutDashboard,
        permission: "products.read",
      },
      {
        label: "Intelligence",
        href: "/dashboard/intelligence",
        icon: Sparkles,
        permission: "reports.read",
      },
    ],
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
        label: "Returns",
        href: "/sales/returns",
        icon: RotateCcw,
        permission: "sales.read",
      },
    ],
  },
  {
    label: "Purchases",
    href: "/purchases",
    icon: ShoppingCart,
    permission: "purchases.read",
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
];
