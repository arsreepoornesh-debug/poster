import React from "react";
import { notFound } from "next/navigation";
import { PosterRepository } from "@/lib/repositories/poster.repository";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { ProductCard } from "@/components/storefront/product-card";
import { formatCurrency } from "@/lib/utils";
import { generateBreadcrumbJsonLd } from "@/lib/json-ld";
import Link from "next/link";
import {
  ShieldCheck,
  Truck,
  Heart,
  ShoppingCart,
  Sparkles,
  Share2,
  CheckCircle2,
} from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const poster = await PosterRepository.findBySlug(slug);

  if (!poster) return { title: "Poster Not Found" };

  return {
    title: poster.metaTitle || `${poster.title} | Premium Poster`,
    description: poster.metaDescription || poster.shortDescription || poster.description,
    openGraph: {
      title: poster.title,
      description: poster.description,
      images: poster.images[0]?.url ? [{ url: poster.images[0].url }] : [],
    },
  };
}

export default async function PosterDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const poster = await PosterRepository.findBySlug(slug);

  if (!poster) {
    notFound();
  }

  const relatedPosters = await PosterRepository.getRelatedPosters(poster.id, poster.categoryId);

  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: poster.category.name, url: `/${poster.category.slug}` },
    { name: poster.subCategory.name, url: `/${poster.category.slug}/${poster.subCategory.slug}` },
    { name: poster.title, url: `/poster/${poster.slug}` },
  ]);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: poster.title,
    image: poster.images.map((i: any) => i.url),
    description: poster.description,
    sku: poster.sku || poster.id,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: poster.offerPrice || poster.basePrice,
      availability: poster.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href={`/${poster.category.slug}`} className="hover:text-foreground">{poster.category.name}</Link>
          <span>/</span>
          <Link href={`/${poster.category.slug}/${poster.subCategory.slug}`} className="hover:text-foreground">{poster.subCategory.name}</Link>
          <span>/</span>
          <span className="font-semibold text-foreground truncate max-w-[200px]">{poster.title}</span>
        </nav>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Gallery Column */}
          <ProductGallery images={poster.images} title={poster.title} />

          {/* Details Column */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-600">
                  {poster.category.name}
                </span>
                {poster.isBestSeller && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600">
                    Bestseller
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                {poster.title}
              </h1>
              <p className="text-xs text-muted-foreground font-mono mt-1">SKU: {poster.sku || "PSTR-DYNAMIC"}</p>
            </div>

            {/* Price Block */}
            <div className="flex items-baseline gap-3 p-4 rounded-xl bg-muted/30 border border-border">
              <span className="text-2xl font-extrabold text-foreground">
                {formatCurrency(poster.offerPrice || poster.basePrice)}
              </span>
              {poster.offerPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatCurrency(poster.basePrice)}
                </span>
              )}
              <span className="text-[11px] font-semibold text-emerald-600 ml-auto flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>In Stock ({poster.stock} available)</span>
              </span>
            </div>

            {/* Variant Selector */}
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Size</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                  {poster.variants && poster.variants.length > 0 ? (
                    poster.variants.map((v: any) => (
                      <button
                        className="p-3 rounded-xl border border-border bg-card hover:border-brand-600 text-left font-semibold"
                      >
                        <p>{v.sizeName}</p>
                        <p className="text-[10px] text-muted-foreground">+₹{v.priceAdjustment}</p>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 rounded-xl border border-brand-600 bg-brand-500/10 font-bold text-center">
                      Standard A4 (8.3 x 11.7 in)
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4">
                <Link
                  href="/checkout"
                  className="flex-1 py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-lg shadow-brand-600/20 text-center transition-all"
                >
                  Buy Now
                </Link>
                <Link
                  href="/account/cart"
                  className="py-3 px-4 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-semibold text-xs flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </Link>
                <button
                  className="p-3 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-rose-500 transition-colors"
                  title="Save to Wishlist"
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Shipping & Assurance Badges */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border text-xs text-muted-foreground">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/20">
                <Truck className="w-5 h-5 text-brand-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-foreground">Fast Dispatch</p>
                  <p className="text-[10px]">Chennai express delivery ready</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/20">
                <ShieldCheck className="w-5 h-5 text-brand-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-foreground">300 GSM Quality</p>
                  <p className="text-[10px]">Matte museum-grade print</p>
                </div>
              </div>
            </div>

            {/* Description Tab */}
            <div className="space-y-2 pt-4 border-t border-border">
              <h3 className="font-bold text-sm text-foreground">Poster Overview</h3>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                {poster.description}
              </p>
            </div>
          </div>
        </div>

        {/* Related Posters */}
        {relatedPosters.length > 0 && (
          <section className="space-y-6 pt-8 border-t border-border">
            <h2 className="text-xl font-bold tracking-tight">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedPosters.map((p) => (
                <ProductCard key={p.id} poster={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
