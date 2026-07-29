import React from "react";
import { notFound } from "next/navigation";
import { CollectionRepository } from "@/lib/repositories/collection.repository";
import { generateBreadcrumbJsonLd } from "@/lib/json-ld";
import Image from "next/image";
import { Layers, Sparkles } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; subcategory: string; collection: string }>;
}): Promise<Metadata> {
  const { collection: collectionSlug } = await params;
  const collection = await CollectionRepository.findBySlug(collectionSlug);

  if (!collection) return { title: "Collection Not Found" };

  return {
    title: collection.seoTitle || `${collection.name} Collection Posters`,
    description: collection.seoDescription || collection.description || `Explore ${collection.name} poster collection.`,
  };
}

export default async function DynamicCollectionPage({
  params,
}: {
  params: Promise<{ category: string; subcategory: string; collection: string }>;
}) {
  const { category: categorySlug, subcategory: subcategorySlug, collection: collectionSlug } = await params;
  const collection = await CollectionRepository.findBySlug(collectionSlug);

  if (
    !collection ||
    collection.category.slug !== categorySlug ||
    collection.subCategory.slug !== subcategorySlug
  ) {
    notFound();
  }

  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: collection.category.name, url: `/${collection.category.slug}` },
    { name: collection.subCategory.name, url: `/${collection.category.slug}/${collection.subCategory.slug}` },
    { name: collection.name, url: `/${collection.category.slug}/${collection.subCategory.slug}/${collection.slug}` },
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
          {collection.bannerUrl || collection.coverImageUrl ? (
            <Image
              src={collection.bannerUrl || collection.coverImageUrl!}
              alt={collection.name}
              fill
              priority
              className="object-cover brightness-75"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-pink-950 to-slate-900" />
          )}

          <div className="relative z-10 text-center text-white p-6 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] uppercase font-bold tracking-wider">
              <span>{collection.category.name}</span>
              <span>&bull;</span>
              <span>{collection.subCategory.name}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              {collection.name} Collection
            </h1>
            {collection.description && (
              <p className="text-xs md:text-sm text-slate-200">{collection.description}</p>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 space-y-6">
          <div className="p-12 text-center text-xs text-muted-foreground glass-card rounded-2xl">
            Posters in the <span className="font-semibold text-foreground">{collection.name}</span> collection will automatically render here when uploaded by the admin in Module 4.
          </div>
        </div>
      </div>
    </>
  );
}
