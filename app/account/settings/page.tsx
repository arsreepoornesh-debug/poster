"use client";

import React, { useState } from "react";
import { Lock, Shield, CheckCircle2 } from "lucide-react";

export default function AccountSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [updated, setUpdated] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUpdated(true);
    setCurrentPassword("");
    setNewPassword("");
    setTimeout(() => setUpdated(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Account Security & Settings</h1>
        <p className="text-xs text-muted-foreground mt-1">Update your password and security options.</p>
      </div>

      {updated && (
        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Password updated successfully</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl space-y-4 border border-border bg-card max-w-lg">
        <h2 className="text-sm font-bold flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-600" />
          <span>Change Password</span>
        </h2>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold">Current Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-background border border-border focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold">New Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-background border border-border focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="py-2.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/20 transition-all"
        >
          Update Password
        </button>
      </form>
    </div>
  );
}
