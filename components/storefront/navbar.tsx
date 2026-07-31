"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/common/logo";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  UploadCloud,
  Truck,
  Sparkles,
  Menu,
  X,
  Lock,
} from "lucide-react";

interface StoreNavbarProps {
  cartItemCount?: number;
  categories?: any[];
  activeCategory?: string | null;
  onSelectCategory?: (slug: string | null) => void;
}

export function StoreNavbar({
  cartItemCount = 0,
  categories = [],
  activeCategory = null,
  onSelectCategory,
}: StoreNavbarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      setIsSearching(true);
      fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setSuggestions(data.data || []);
        })
        .finally(() => setIsSearching(false));
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSuggestions([]);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border shadow-sm">
      {/* Closable Announcement Bar */}
      {showAnnouncement && (
        <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white text-[11px] font-bold py-2 px-6 flex items-center justify-between transition-all duration-300">
          <div className="flex-1 text-center flex items-center justify-center gap-2">
            <Truck className="w-3.5 h-3.5" />
            <span>Chennai Express Shipping | Free Delivery on Orders Above ₹499 | Use Code: <span className="underline">CHENNAIFREE</span></span>
          </div>
          <button
            onClick={() => setShowAnnouncement(false)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Navbar */}
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 h-20 flex items-center justify-between gap-8">
        {/* Logo (Aligned Left) */}
        <div className="flex-shrink-0">
          <Logo />
        </div>

        {/* Large Centered Search Bar (Amazon/Apple Style) */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-xl relative hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posters, anime, sports, collections..."
              className="w-full pl-11 pr-4 py-3 rounded-full text-xs bg-muted/40 border border-border/80 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-background transition-all"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50 max-h-72 overflow-y-auto text-xs">
              {suggestions.map((item) => (
                <Link
                  key={item.id}
                  href={`/poster/${item.slug}`}
                  onClick={() => setSuggestions([])}
                  className="flex items-center gap-3 p-3 hover:bg-muted transition-colors border-b border-border/40 last:border-none"
                >
                  <div className="w-8 h-10 rounded bg-muted overflow-hidden relative flex-shrink-0">
                    {item.images?.[0]?.url && (
                      <img src={item.images[0].url} alt={item.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 truncate">
                    <p className="font-semibold text-foreground truncate">{item.title}</p>
                    <p className="text-[10px] text-brand-600 font-bold">₹{item.basePrice}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </form>

        {/* Action Controls (Aligned Right) */}
        <div className="flex items-center gap-4 text-xs font-bold">
          <Link
            href="/custom-poster"
            className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/10 transition-all hover:scale-105"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Poster</span>
          </Link>

          <Link href="/account/wishlist" className="p-2.5 rounded-full hover:bg-muted text-foreground relative">
            <Heart className="w-4 h-4" />
          </Link>

          <Link href="/checkout" className="p-2.5 rounded-full hover:bg-muted text-foreground relative flex items-center gap-1">
            <ShoppingBag className="w-4 h-4" />
            {cartItemCount > 0 && (
              <span className="bg-brand-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center absolute -top-0.5 -right-0.5">
                {cartItemCount}
              </span>
            )}
          </Link>

          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-1.5 p-2 rounded-full hover:bg-muted text-foreground border border-border"
            >
              <User className="w-4 h-4" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-2xl shadow-xl p-2 z-50 text-xs space-y-1">
                <Link href="/login" className="block px-3 py-2 rounded-xl hover:bg-muted font-bold text-brand-600">
                  Login / Sign Up
                </Link>
                <Link href="/account" className="block px-3 py-2 rounded-xl hover:bg-muted">
                  My Orders
                </Link>
                <div className="border-t border-border my-1" />
                <Link href="/admin/login" className="block px-3 py-2 rounded-xl hover:bg-muted text-muted-foreground flex items-center justify-between">
                  <span>Admin Panel</span>
                  <Lock className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Category Navigation */}
      {categories.length > 0 && (
        <div className="border-t border-border bg-card/60 backdrop-blur-md overflow-x-auto py-2.5">
          <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 flex items-center gap-4 text-xs font-semibold whitespace-nowrap">
            <button
              onClick={() => onSelectCategory?.(null)}
              className={`px-4 py-1.5 rounded-full transition-all ${
                activeCategory === null ? "bg-brand-600 text-white shadow-md font-bold" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              All Prints
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory?.(cat.slug)}
                className={`px-4 py-1.5 rounded-full transition-all ${
                  activeCategory === cat.slug ? "bg-brand-600 text-white shadow-md font-bold" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
