import { slugify } from "@/lib/utils";
import { CategoryRepository } from "@/lib/repositories/category.repository";
import { SubCategoryRepository } from "@/lib/repositories/subcategory.repository";
import { CollectionRepository } from "@/lib/repositories/collection.repository";
import {
  CreateCategoryDTO,
  UpdateCategoryDTO,
  CreateSubCategoryDTO,
  UpdateSubCategoryDTO,
  CreateCollectionDTO,
  UpdateCollectionDTO,
  BulkActionDTO,
} from "@/lib/dto/category.dto";
import { ContentStatus } from "@prisma/client";

export class CategoryService {
  // --- CATEGORY SERVICE METHODS ---

  public static async createCategory(dto: CreateCategoryDTO, userId?: string) {
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    const existing = await CategoryRepository.findBySlug(slug);

    if (existing) {
      throw new Error(`Category with slug '${slug}' already exists`);
    }

    return CategoryRepository.create({
      ...dto,
      slug,
      createdBy: userId,
    });
  }

  public static async updateCategory(id: string, dto: UpdateCategoryDTO, userId?: string) {
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw new Error("Category not found");
    }

    let slug = dto.slug;
    if (dto.name && !dto.slug) {
      slug = slugify(dto.name);
    } else if (dto.slug) {
      slug = slugify(dto.slug);
    }

    if (slug && slug !== category.slug) {
      const existing = await CategoryRepository.findBySlug(slug);
      if (existing && existing.id !== id) {
        throw new Error(`Category with slug '${slug}' already exists`);
      }
    }

    return CategoryRepository.update(id, {
      ...dto,
      ...(slug ? { slug } : {}),
      updatedBy: userId,
    });
  }

  public static async deleteCategory(id: string, userId?: string) {
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw new Error("Category not found");
    }
    return CategoryRepository.softDelete(id, userId);
  }

  public static async restoreCategory(id: string, userId?: string) {
    return CategoryRepository.restore(id, userId);
  }

  public static async bulkCategoryAction(dto: BulkActionDTO, userId?: string) {
    switch (dto.action) {
      case "delete":
        return CategoryRepository.bulkSoftDelete(dto.ids, userId);
      case "publish":
        return CategoryRepository.bulkUpdateStatus(dto.ids, ContentStatus.PUBLISHED, userId);
      case "archive":
        return CategoryRepository.bulkUpdateStatus(dto.ids, ContentStatus.ARCHIVED, userId);
      case "draft":
        return CategoryRepository.bulkUpdateStatus(dto.ids, ContentStatus.DRAFT, userId);
      default:
        throw new Error("Invalid bulk action");
    }
  }

  // --- SUBCATEGORY SERVICE METHODS ---

  public static async createSubCategory(dto: CreateSubCategoryDTO, userId?: string) {
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    const existing = await SubCategoryRepository.findBySlug(slug);

    if (existing) {
      throw new Error(`SubCategory with slug '${slug}' already exists`);
    }

    return SubCategoryRepository.create({
      ...dto,
      slug,
      createdBy: userId,
    });
  }

  public static async updateSubCategory(id: string, dto: UpdateSubCategoryDTO, userId?: string) {
    const subCategory = await SubCategoryRepository.findById(id);
    if (!subCategory) {
      throw new Error("SubCategory not found");
    }

    let slug = dto.slug;
    if (dto.name && !dto.slug) {
      slug = slugify(dto.name);
    } else if (dto.slug) {
      slug = slugify(dto.slug);
    }

    if (slug && slug !== subCategory.slug) {
      const existing = await SubCategoryRepository.findBySlug(slug);
      if (existing && existing.id !== id) {
        throw new Error(`SubCategory with slug '${slug}' already exists`);
      }
    }

    return SubCategoryRepository.update(id, {
      ...dto,
      ...(slug ? { slug } : {}),
      updatedBy: userId,
    });
  }

  // --- COLLECTION SERVICE METHODS ---

  public static async createCollection(dto: CreateCollectionDTO, userId?: string) {
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    const existing = await CollectionRepository.findBySlug(slug);

    if (existing) {
      throw new Error(`Collection with slug '${slug}' already exists`);
    }

    return CollectionRepository.create({
      ...dto,
      slug,
      createdBy: userId,
    });
  }

  public static async updateCollection(id: string, dto: UpdateCollectionDTO, userId?: string) {
    const collection = await CollectionRepository.findById(id);
    if (!collection) {
      throw new Error("Collection not found");
    }

    let slug = dto.slug;
    if (dto.name && !dto.slug) {
      slug = slugify(dto.name);
    } else if (dto.slug) {
      slug = slugify(dto.slug);
    }

    if (slug && slug !== collection.slug) {
      const existing = await CollectionRepository.findBySlug(slug);
      if (existing && existing.id !== id) {
        throw new Error(`Collection with slug '${slug}' already exists`);
      }
    }

    return CollectionRepository.update(id, {
      ...dto,
      ...(slug ? { slug } : {}),
      updatedBy: userId,
    });
  }
}
