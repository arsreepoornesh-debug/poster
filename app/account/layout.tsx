import React from "react";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { Logo } from "@/components/common/logo";
import Link from "next/link";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border bg-card/70 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo href="/" />
          <nav className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/" className="hover:text-brand-600 transition-colors">
              Storefront
            </Link>
            <Link href="/custom-poster" className="hover:text-brand-600 transition-colors">
              Upload Custom Poster
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col md:flex-row gap-8">
        <AccountSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
