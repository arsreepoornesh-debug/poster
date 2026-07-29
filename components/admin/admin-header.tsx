"use client";

import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { LogOut, User, Bell, ExternalLink, Menu } from "lucide-react";
import Link from "next/link";

interface AdminHeaderProps {
  onToggleMobileMenu?: () => void;
}

export function AdminHeader({ onToggleMobileMenu }: AdminHeaderProps) {
  const { data: session } = useSession();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:inline-block">
          Role: <span className="text-brand-600 font-bold">{session?.user?.adminRole || session?.user?.role || "ADMIN"}</span>
        </span>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-md border border-border bg-background"
        >
          <span className="hidden sm:inline">View Storefront</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-lg p-4 space-y-2 text-xs z-50">
              <div className="font-bold border-b border-border pb-2 flex justify-between items-center">
                <span>System Notifications</span>
                <span className="text-[10px] bg-brand-500/10 text-brand-600 px-1.5 py-0.5 rounded font-semibold">Realtime</span>
              </div>
              <div className="p-2 rounded bg-muted/30">
                <p className="font-semibold">Custom Artwork Upload Queue</p>
                <p className="text-muted-foreground text-[10px]">No pending unreviewed uploads</p>
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-border"></div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-600/10 text-brand-600 flex items-center justify-center font-semibold text-xs border border-brand-600/20">
            <User className="w-4 h-4" />
          </div>

          <div className="hidden sm:flex flex-col text-left text-xs">
            <span className="font-semibold text-foreground truncate max-w-[120px]">
              {session?.user?.name || "Admin User"}
            </span>
            <span className="text-muted-foreground text-[10px] truncate max-w-[120px]">
              {session?.user?.email || "admin@majaposters.com"}
            </span>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
