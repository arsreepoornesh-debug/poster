import React from "react";
import { CategoryRepository } from "@/lib/repositories/category.repository";
import { SubCategoryRepository } from "@/lib/repositories/subcategory.repository";
import { PosterRepository } from "@/lib/repositories/poster.repository";
import { UnifiedStorefront } from "@/components/storefront/unified-storefront";

export const dynamic = "force-dynamic";

export default async function StorefrontHomePage() {
  const [categoriesResult, subCategoriesResult, postersResult] = await Promise.all([
    CategoryRepository.findAll({ limit: 100 }),
    SubCategoryRepository.findAll({ limit: 1000 }),
    PosterRepository.findAll({ limit: 200 }),
  ]);

  return (
    <UnifiedStorefront
      initialCategories={categoriesResult.items}
      initialSubCategories={subCategoriesResult.items}
      initialPosters={postersResult.items}
    />
  );
}
