"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavItems } from "@/config/admin-nav";
import { Logo } from "@/components/common/logo";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { User, LogOut, X } from "lucide-react";

interface AdminSidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AdminSidebar({ isMobileOpen = false, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <aside className="w-64 bg-card border-r border-border h-full flex flex-col flex-shrink-0">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <Logo href="/admin" isAdmin />
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1 rounded-md text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                isActive
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-transform group-hover:scale-110",
                    isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span>{item.title}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-4 border-t border-border mt-4 space-y-1">
          <Link
            href="/admin/profile"
            onClick={onCloseMobile}
            className={cn(
              "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname === "/admin/profile"
                ? "bg-brand-600 text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
            )}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-border bg-muted/30">
        <div className="text-xs text-muted-foreground flex items-center justify-between">
          <span>Maja Posters Admin v1.0</span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="RBAC Active"></span>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-screen sticky top-0">{sidebarContent}</div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCloseMobile}
          ></div>
          <div className="relative z-10 w-64 max-w-[80vw] h-full bg-card shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
