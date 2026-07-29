import React from "react";
import { notFound } from "next/navigation";
import { CategoryRepository } from "@/lib/repositories/category.repository";
import { PosterRepository } from "@/lib/repositories/poster.repository";
import { ProductCard } from "@/components/storefront/product-card";
import { generateCategoryJsonLd, generateBreadcrumbJsonLd } from "@/lib/json-ld";
import Image from "next/image";
import Link from "next/link";
import { FolderTree, ArrowRight, Sparkles } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = await CategoryRepository.findBySlug(categorySlug);

  if (!category) return { title: "Category Not Found" };

  return {
    title: category.seoTitle || `${category.name} Posters | Maja Posters`,
    description: category.seoDescription || category.description || `Browse custom and high-quality ${category.name} posters.`,
    openGraph: {
      title: category.name,
      description: category.description || "",
      images: category.imageUrl ? [{ url: category.imageUrl }] : [],
    },
  };
}

export default async function DynamicCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categorySlug } = await params;
  const category = await CategoryRepository.findBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  // Fetch posters for this category
  const postersResult = await PosterRepository.findAll({ limit: 40 });
  const normSlug = categorySlug.toLowerCase();
  
  const categoryPosters = postersResult.items.filter((p: any) => {
    const pCatSlug = p.category?.slug?.toLowerCase() || "";
    if (normSlug.includes("car") || normSlug.includes("auto")) {
      return pCatSlug === "cars" || pCatSlug === "cars-and-automations" || pCatSlug === "cars-and-bikes" ||
        p.title.toLowerCase().includes("ferrari") || p.title.toLowerCase().includes("porsche") || p.title.toLowerCase().includes("nissan") || p.title.toLowerCase().includes("senna");
    }
    return pCatSlug === normSlug || p.category?.name?.toLowerCase().includes(normSlug);
  });

  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: category.name, url: `/${category.slug}` },
  ]);
  const categoryLd = generateCategoryJsonLd(category);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryLd) }}
      />

      <div className="space-y-12">
        {/* Banner Section */}
        <div className="relative w-full h-64 md:h-80 bg-muted rounded-2xl overflow-hidden border border-border flex items-center justify-center">
          {category.bannerUrl ? (
            <Image
              src={category.bannerUrl}
              alt={category.name}
              fill
              priority
              className="object-cover brightness-75"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900" />
          )}

          <div className="relative z-10 text-center text-white p-6 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Category Prints</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              {category.name} Posters
            </h1>
            {category.description && (
              <p className="text-sm md:text-base text-slate-200">{category.description}</p>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 space-y-10">
          {/* SubCategories Grid */}
          {category.subCategories && category.subCategories.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold tracking-tight">
                Explore {category.name} Collections &amp; SubCategories
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {category.subCategories.map((sub: any) => (
                  <Link
                    key={sub.id}
                    href={`/${category.slug}/${sub.slug}`}
                    className="glass-card p-4 rounded-2xl border border-border bg-card hover:border-brand-500/50 hover:shadow-lg transition-all group flex flex-col justify-between"
                  >
                    <div className="relative w-full h-40 rounded-xl overflow-hidden bg-muted mb-3">
                      {sub.imageUrl ? (
                        <Image
                          src={sub.imageUrl}
                          alt={sub.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <FolderTree className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-foreground group-hover:text-brand-600 transition-colors">
                          {sub.name}
                        </h3>
                        <p className="text-[11px] text-muted-foreground">/{sub.slug}</p>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Catalog Posters Section */}
          <div className="space-y-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Featured {category.name} Posters</h2>
                <p className="text-xs text-muted-foreground">Premium 300 GSM matte finish wall art prints</p>
              </div>
              <span className="text-xs font-bold text-brand-600 bg-brand-500/10 px-3 py-1 rounded-full">
                {categoryPosters.length > 0 ? `${categoryPosters.length} Prints Available` : "Collection Growing"}
              </span>
            </div>

            {categoryPosters.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categoryPosters.map((poster: any) => (
                  <ProductCard key={poster.id} poster={poster} />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-sm text-muted-foreground glass-card rounded-2xl border border-dashed border-border space-y-3">
                <Sparkles className="w-8 h-8 text-brand-600 mx-auto" />
                <p className="font-bold text-foreground">New {category.name} Prints Arriving Soon</p>
                <p className="text-xs max-w-md mx-auto">
                  Use our custom poster upload feature to turn your favorite {category.name} artwork into high-definition prints today!
                </p>
                <Link
                  href="/custom-poster"
                  className="inline-block mt-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-colors shadow-md"
                >
                  Upload Custom {category.name} Poster
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
