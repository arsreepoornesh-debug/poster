"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { User, Mail, Phone, CheckCircle2 } from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Personal Profile</h1>
        <p className="text-xs text-muted-foreground mt-1">Manage your account credentials.</p>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile updated successfully</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl space-y-4 border border-border bg-card max-w-lg">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-background border border-border focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold">Email Address (Read-only)</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <input
              type="email"
              disabled
              value={session?.user?.email || ""}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-muted text-muted-foreground border border-border cursor-not-allowed"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold">Phone Number</label>
          <div className="relative">
            <Phone className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-background border border-border focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="py-2.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/20 transition-all"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
