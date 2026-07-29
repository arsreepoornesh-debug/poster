import { prisma } from "@/lib/prisma";
import { DynamicRouteResolution } from "@/types";

export class DynamicRouteService {
  /**
   * Resolves any dynamic 1-level, 2-level, or 3-level slug path from the database.
   * NO hardcoded category lists exist in the codebase.
   */
  public static async resolvePathSegments(
    param1: string,
    param2?: string,
    param3?: string
  ): Promise<DynamicRouteResolution> {
    if (!param2 && !param3) {
      // 1-Level: Could be Category
      const category = await prisma.category.findUnique({
        where: { slug: param1, status: "PUBLISHED" },
      });

      if (category) {
        return {
          type: "category",
          categorySlug: category.slug,
          categoryName: category.name,
          entityId: category.id,
        };
      }

      return { type: "not_found", categorySlug: param1 };
    }

    if (param2 && !param3) {
      // 2-Level: /category/subcategory
      const category = await prisma.category.findUnique({
        where: { slug: param1, status: "PUBLISHED" },
      });

      if (!category) {
        return { type: "not_found", categorySlug: param1 };
      }

      const subcategory = await prisma.subCategory.findFirst({
        where: {
          slug: param2,
          categoryId: category.id,
          status: "PUBLISHED",
        },
      });

      if (subcategory) {
        return {
          type: "subcategory",
          categorySlug: category.slug,
          subcategorySlug: subcategory.slug,
          categoryName: category.name,
          subcategoryName: subcategory.name,
          entityId: subcategory.id,
        };
      }

      return { type: "not_found", categorySlug: param1, subcategorySlug: param2 };
    }

    if (param2 && param3) {
      // 3-Level: /category/subcategory/collection
      const category = await prisma.category.findUnique({
        where: { slug: param1, status: "PUBLISHED" },
      });

      if (!category) {
        return { type: "not_found", categorySlug: param1 };
      }

      const subcategory = await prisma.subCategory.findFirst({
        where: {
          slug: param2,
          categoryId: category.id,
          status: "PUBLISHED",
        },
      });

      if (!subcategory) {
        return { type: "not_found", categorySlug: param1, subcategorySlug: param2 };
      }

      const collection = await prisma.collection.findFirst({
        where: {
          slug: param3,
          categoryId: category.id,
          subCategoryId: subcategory.id,
          status: "PUBLISHED",
        },
      });

      if (collection) {
        return {
          type: "collection",
          categorySlug: category.slug,
          subcategorySlug: subcategory.slug,
          collectionSlug: collection.slug,
          categoryName: category.name,
          subcategoryName: subcategory.name,
          collectionName: collection.name,
          entityId: collection.id,
        };
      }

      return {
        type: "not_found",
        categorySlug: param1,
        subcategorySlug: param2,
        collectionSlug: param3,
      };
    }

    return { type: "not_found", categorySlug: param1 };
  }
}
