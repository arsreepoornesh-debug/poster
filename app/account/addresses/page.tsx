"use client";

import React, { useState } from "react";
import { MapPin, Plus, Home } from "lucide-react";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Array<{ id: string; street: string; city: string; state: string; postalCode: string }>>([]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Shipping & Billing Addresses</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage delivery locations for checkout.</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700">
          <Plus className="w-4 h-4" />
          <span>Add Address</span>
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl border border-border bg-card text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-brand-500/10 text-brand-600 mx-auto flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold">No Saved Addresses</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            You have not added any delivery addresses yet. Add your default address for faster checkout.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="glass-card p-4 rounded-xl border border-border bg-card text-xs space-y-1">
              <p className="font-bold">{addr.street}</p>
              <p className="text-muted-foreground">{addr.city}, {addr.state} {addr.postalCode}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
