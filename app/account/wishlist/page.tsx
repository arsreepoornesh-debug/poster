import React from "react";
import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function WishlistPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">My Saved Wishlist</h1>
        <p className="text-xs text-muted-foreground mt-1">Keep track of your favorite poster designs.</p>
      </div>

      <div className="glass-card p-12 rounded-2xl border border-border bg-card text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
          <Heart className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold">Your Wishlist is Empty</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Explore catalog categories or custom artwork options and tap the heart icon to save items.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 mt-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Explore Catalog</span>
        </Link>
      </div>
    </div>
  );
}
