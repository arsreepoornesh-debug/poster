import {
  LayoutDashboard,
  FolderTree,
  GitFork,
  Layers,
  Image as ImageIcon,
  UploadCloud,
  ShoppingBag,
  Users,
  Ticket,
  Truck,
  Settings,
  ShieldCheck,
  BarChart3,
  Flame,
  Images,
} from "lucide-react";

export interface AdminNavItem {
  title: string;
  href: string;
  icon: any;
  badge?: string;
}

export const adminNavItems: AdminNavItem[] = [
  {
    title: "Trending Images",
    href: "/admin/trending-images",
    icon: Flame,
    badge: "Hot",
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: FolderTree,
  },
  {
    title: "Sub Categories",
    href: "/admin/subcategories",
    icon: GitFork,
  },
  {
    title: "Collections",
    href: "/admin/collections",
    icon: Layers,
  },
  {
    title: "Posters",
    href: "/admin/posters",
    icon: ImageIcon,
  },
  {
    title: "Custom Poster Requests",
    href: "/admin/custom-posters",
    icon: UploadCloud,
    badge: "New",
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    title: "Coupons",
    href: "/admin/coupons",
    icon: Ticket,
  },
  {
    title: "Delivery Charges",
    href: "/admin/delivery-zones",
    icon: Truck,
  },
  {
    title: "Shipping Options",
    href: "/admin/shipping-options",
    icon: Layers,
  },
  {
    title: "Website Settings",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: ShieldCheck,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
];
