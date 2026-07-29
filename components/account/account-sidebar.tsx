"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  User,
  MapPin,
  Heart,
  ShoppingBag,
  UploadCloud,
  Settings,
  LogOut,
  LayoutDashboard,
  ShoppingCart,
} from "lucide-react";

export const accountNavItems = [
  { title: "Overview", href: "/account", icon: LayoutDashboard },
  { title: "Profile", href: "/account/profile", icon: User },
  { title: "Addresses", href: "/account/addresses", icon: MapPin },
  { title: "Wishlist", href: "/account/wishlist", icon: Heart },
  { title: "Cart", href: "/account/cart", icon: ShoppingCart },
  { title: "Orders", href: "/account/orders", icon: ShoppingBag },
  { title: "Custom Poster Uploads", href: "/account/custom-posters", icon: UploadCloud },
  { title: "Account Settings", href: "/account/settings", icon: Settings },
];

export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 glass-card p-4 rounded-2xl border border-border bg-card flex-shrink-0 h-fit space-y-1">
      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 border-b border-border pb-3">
        Customer Portal
      </div>

      {accountNavItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/account"
            ? pathname === "/account"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors",
              isActive
                ? "bg-brand-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{item.title}</span>
          </Link>
        );
      })}

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors text-left mt-4 border-t border-border pt-3"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out</span>
      </button>
    </aside>
  );
}
