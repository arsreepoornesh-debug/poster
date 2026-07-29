"use client";

import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { User, ShoppingBag, UploadCloud, Heart, MapPin, ArrowRight } from "lucide-react";

export default function AccountOverviewPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-2xl border border-border bg-card">
        <h1 className="text-xl font-bold">Welcome back, {session?.user?.name || "Valued Customer"}!</h1>
        <p className="text-xs text-muted-foreground mt-1">
          {session?.user?.email} • Account Overview & Shortcuts
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Link
          href="/account/orders"
          className="glass-card p-5 rounded-xl border border-border bg-card hover:border-brand-500/50 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Orders</span>
            <ShoppingBag className="w-5 h-5 text-brand-600" />
          </div>
          <p className="text-xs text-muted-foreground">View order tracking & receipts</p>
        </Link>

        <Link
          href="/account/custom-posters"
          className="glass-card p-5 rounded-xl border border-brand-500/30 bg-brand-500/5 hover:border-brand-500 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-brand-600 uppercase">Custom Uploads</span>
            <UploadCloud className="w-5 h-5 text-brand-600" />
          </div>
          <p className="text-xs text-muted-foreground">Track 5MB - 50MB artwork requests</p>
        </Link>

        <Link
          href="/account/wishlist"
          className="glass-card p-5 rounded-xl border border-border bg-card hover:border-brand-500/50 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Wishlist</span>
            <Heart className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-xs text-muted-foreground">Saved favorite posters</p>
        </Link>
      </div>
    </div>
  );
}
