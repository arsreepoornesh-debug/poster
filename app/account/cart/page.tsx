import React from "react";
import { ShoppingCart, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Shopping Cart</h1>
        <p className="text-xs text-muted-foreground mt-1">Review items before checkout.</p>
      </div>

      <div className="glass-card p-12 rounded-2xl border border-border bg-card text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-brand-500/10 text-brand-600 mx-auto flex items-center justify-center">
          <ShoppingCart className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold">Your Cart is Empty</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Add posters from catalog dynamic collections or create custom artwork uploads to start.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 mt-2"
        >
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
