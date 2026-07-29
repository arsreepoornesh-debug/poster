"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Heart, Sparkles, ShoppingBag } from "lucide-react";

interface ProductCardProps {
  poster: {
    id: string;
    title: string;
    slug: string;
    basePrice: number;
    offerPrice?: number | null;
    images?: { url: string; thumbnailUrl?: string | null }[];
    category?: { name: string; slug: string };
    isFeatured?: boolean;
    isTrending?: boolean;
    isBestSeller?: boolean;
    isNewArrival?: boolean;
  };
}

export function ProductCard({ poster }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const primaryImage = poster.images?.[0]?.thumbnailUrl || poster.images?.[0]?.url || "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600";
  const hoverImage = poster.images?.[1]?.thumbnailUrl || poster.images?.[1]?.url || primaryImage;

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-border bg-card hover:shadow-xl transition-all duration-300 group flex flex-col justify-between h-full">
      <div className="relative w-full aspect-[3/4] bg-muted overflow-hidden min-h-0">
        <Image
          src={hoverImage}
          alt={poster.title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        />
        <Image
          src={primaryImage}
          alt={poster.title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover group-hover:opacity-0 transition-opacity duration-500"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {poster.offerPrice && (
            <span className="bg-rose-600 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow">
              Sale
            </span>
          )}
          {poster.isBestSeller && (
            <span className="bg-amber-500 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow">
              Bestseller
            </span>
          )}
          {poster.isTrending && (
            <span className="bg-purple-600 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow">
              Trending
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-background/80 backdrop-blur-md text-foreground hover:text-rose-500 transition-colors shadow-md z-10"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
        </button>
      </div>

      <div className="p-4 space-y-2">
        {poster.category && (
          <span className="text-[10px] uppercase font-bold text-brand-600 tracking-wider">
            {poster.category.name}
          </span>
        )}

        <Link href={`/poster/${poster.slug}`}>
          <h3 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-brand-600 transition-colors">
            {poster.title}
          </h3>
        </Link>

        <div className="flex items-baseline justify-between pt-1">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-sm text-foreground">
              {formatCurrency(poster.offerPrice || poster.basePrice)}
            </span>
            {poster.offerPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatCurrency(poster.basePrice)}
              </span>
            )}
          </div>

          <Link
            href={`/poster/${poster.slug}`}
            className="p-1.5 rounded-lg bg-brand-500/10 text-brand-600 hover:bg-brand-600 hover:text-white transition-colors"
            title="View Product Details"
          >
            <ShoppingBag className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
