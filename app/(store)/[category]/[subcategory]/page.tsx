import React from "react";
import { notFound } from "next/navigation";
import { SubCategoryRepository } from "@/lib/repositories/subcategory.repository";
import { generateBreadcrumbJsonLd } from "@/lib/json-ld";
import Image from "next/image";
import Link from "next/link";
import { Layers, ArrowRight, GitFork } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; subcategory: string }>;
}): Promise<Metadata> {
  const { subcategory: subcategorySlug } = await params;
  const subCategory = await SubCategoryRepository.findBySlug(subcategorySlug);

  if (!subCategory) return { title: "SubCategory Not Found" };

  return {
    title: subCategory.seoTitle || `${subCategory.name} Posters`,
    description: subCategory.seoDescription || subCategory.description || `Browse ${subCategory.name} poster collections.`,
  };
}

export default async function DynamicSubCategoryPage({
  params,
}: {
  params: Promise<{ category: string; subcategory: string }>;
}) {
  const { category: categorySlug, subcategory: subcategorySlug } = await params;
  const subCategory = await SubCategoryRepository.findBySlug(subcategorySlug);

  if (!subCategory || subCategory.category.slug !== categorySlug) {
    notFound();
  }

  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: subCategory.category.name, url: `/${subCategory.category.slug}` },
    { name: subCategory.name, url: `/${subCategory.category.slug}/${subCategory.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <div className="space-y-12">
        {/* Banner Section */}
        <div className="relative w-full h-56 md:h-72 bg-muted rounded-2xl overflow-hidden border border-border flex items-center justify-center">
          {subCategory.bannerUrl ? (
            <Image
              src={subCategory.bannerUrl}
              alt={subCategory.name}
              fill
              priority
              className="object-cover brightness-75"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900" />
          )}

          <div className="relative z-10 text-center text-white p-6 max-w-2xl space-y-2">
            <p className="text-xs uppercase font-semibold tracking-wider text-brand-300">
              {subCategory.category.name}
            </p>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              {subCategory.name} Posters
            </h1>
            {subCategory.description && (
              <p className="text-xs md:text-sm text-slate-200">{subCategory.description}</p>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 space-y-10">
          {/* Collections Grid */}
          {subCategory.collections && subCategory.collections.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold tracking-tight">
                {subCategory.name} Poster Collections
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {subCategory.collections.map((col: any) => (
                  <Link
                    key={col.id}
                    href={`/${categorySlug}/${subcategorySlug}/${col.slug}`}
                    className="glass-card p-4 rounded-2xl border border-border bg-card hover:border-brand-500/50 hover:shadow-lg transition-all group flex flex-col justify-between"
                  >
                    <div className="relative w-full h-40 rounded-xl overflow-hidden bg-muted mb-3">
                      {col.coverImageUrl ? (
                        <Image
                          src={col.coverImageUrl}
                          alt={col.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Layers className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-foreground group-hover:text-brand-600 transition-colors">
                          {col.name}
                        </h3>
                        <p className="text-[11px] text-muted-foreground">/{col.slug}</p>
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
        </div>
      </div>
    </>
  );
}
