import React from "react";
import { ShoppingBag, Clock } from "lucide-react";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Order History</h1>
        <p className="text-xs text-muted-foreground mt-1">Track order fulfillment & download receipts.</p>
      </div>

      <div className="glass-card p-12 rounded-2xl border border-border bg-card text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-brand-500/10 text-brand-600 mx-auto flex items-center justify-center">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold">No Orders Placed Yet</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          When you place orders for catalog posters or custom artwork prints, their status will be displayed here.
        </p>
      </div>
    </div>
  );
}
