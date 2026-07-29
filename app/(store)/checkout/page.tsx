"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Truck, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "Chennai",
    state: "Tamil Nadu",
    postalCode: "600001",
    country: "India",
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = 499;
  const shippingFee = formData.city.toLowerCase() === "chennai" ? 0 : 50;
  const total = subtotal + shippingFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const generatedOrderNum = `ORD-PSTR-${Math.floor(100000 + Math.random() * 900000)}`;

    setTimeout(() => {
      setOrderNumber(generatedOrderNum);
      setOrderPlaced(true);
      setIsSubmitting(false);
    }, 1200);
  };

  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl border border-border bg-card max-w-md text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold">Order Received!</h1>
          <p className="text-xs text-muted-foreground">
            Thank you for your order. Your order number is{" "}
            <span className="font-bold text-foreground font-mono">{orderNumber}</span>.
          </p>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-700 text-xs font-semibold">
            Note: Payment integration is deferred. Order is recorded in development mode.
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 mt-2"
          >
            <span>Return to Storefront</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Checkout</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Complete your delivery details. (Chennai local & All India shipping ready)
        </p>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-xs">
        {/* Shipping Form */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-border bg-card space-y-4">
          <h2 className="font-bold text-sm border-b border-border pb-2 flex items-center gap-2">
            <Truck className="w-4 h-4 text-brand-600" />
            <span>Shipping Address</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="customer@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold">Street Address *</label>
            <input
              type="text"
              required
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              placeholder="Door No, Street Name, Landmark"
              className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold">State *</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold">Postal Code *</label>
              <input
                type="text"
                required
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border"
              />
            </div>
          </div>
        </div>

        {/* Order Summary Column */}
        <div className="glass-card p-6 rounded-2xl border border-border bg-card h-fit space-y-4">
          <h2 className="font-bold text-sm border-b border-border pb-2">Order Summary</h2>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Poster Subtotal</span>
              <span className="font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping Fee</span>
              <span className="font-semibold">
                {shippingFee === 0 ? "FREE (Chennai)" : formatCurrency(shippingFee)}
              </span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-sm font-bold">
              <span>Total</span>
              <span className="text-brand-600">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 text-[11px] text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
              <span>Pluggable Payment System</span>
            </p>
            <p>Razorpay / Stripe gateway placeholder ready. No active charge processed.</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Processing Order..." : "Place Order Now"}
          </button>
        </div>
      </form>
    </div>
  );
}
