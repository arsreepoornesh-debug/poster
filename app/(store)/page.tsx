import React from "react";
import { CategoryRepository } from "@/lib/repositories/category.repository";
import { PosterRepository } from "@/lib/repositories/poster.repository";
import { UnifiedStorefront } from "@/components/storefront/unified-storefront";

export default async function StorefrontHomePage() {
  const [categoriesResult, postersResult] = await Promise.all([
    CategoryRepository.findAll({ limit: 100 }),
    PosterRepository.findAll({ limit: 24 }),
  ]);

  return (
    <UnifiedStorefront
      initialCategories={categoriesResult.items}
      initialPosters={postersResult.items}
    />
  );
}
