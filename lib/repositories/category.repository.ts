import { prisma } from "@/lib/prisma";
import { CreateCategoryDTO, UpdateCategoryDTO } from "@/lib/dto/category.dto";
import { ContentStatus, Prisma } from "@prisma/client";

export interface CategoryFilterOptions {
  search?: string;
  status?: ContentStatus;
  featured?: boolean;
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "name" | "createdAt" | "displayOrder";
  sortOrder?: "asc" | "desc";
}

export class CategoryRepository {
  public static async findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        subCategories: { where: { deletedAt: null } },
        collections: { where: { deletedAt: null } },
        banners: true,
        _count: { select: { posters: true, subCategories: true, collections: true } },
      },
    });
  }

  public static async findBySlugGlobal(slug: string) {
    try {
      return await prisma.category.findFirst({
        where: { slug },
      });
    } catch (error) {
      return null;
    }
  }

  public static async findBySlug(slug: string) {
    try {
      return await prisma.category.findUnique({
        where: { slug, deletedAt: null },
        include: {
          subCategories: { where: { status: ContentStatus.PUBLISHED, deletedAt: null } },
          collections: { where: { status: ContentStatus.PUBLISHED, deletedAt: null } },
          banners: true,
        },
      });
    } catch (error) {
      console.error(`[CATEGORY_DB_ERROR] Could not fetch category slug "${slug}" from DB:`, error);
      return null;
    }
  }

  public static async create(data: CreateCategoryDTO & { slug: string; createdBy?: string }) {
    return prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        imageUrl: data.imageUrl,
        bannerUrl: data.bannerUrl,
        iconUrl: data.iconUrl,
        displayOrder: data.displayOrder ?? 0,
        featured: data.featured ?? false,
        status: data.status ?? ContentStatus.PUBLISHED,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
        createdBy: data.createdBy,
      },
    });
  }

  public static async update(id: string, data: UpdateCategoryDTO & { updatedBy?: string }) {
    return prisma.category.update({
      where: { id },
      data: {
        ...data,
        updatedBy: data.updatedBy,
        updatedAt: new Date(),
      },
    });
  }

  public static async softDelete(id: string, updatedBy?: string) {
    return prisma.category.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy,
      },
    });
  }

  public static async restore(id: string, updatedBy?: string) {
    return prisma.category.update({
      where: { id },
      data: {
        deletedAt: null,
        updatedBy,
      },
    });
  }

  public static async hardDelete(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  }

  public static async bulkUpdateStatus(ids: string[], status: ContentStatus, updatedBy?: string) {
    return prisma.category.updateMany({
      where: { id: { in: ids } },
      data: { status, updatedBy, updatedAt: new Date() },
    });
  }

  public static async bulkSoftDelete(ids: string[], updatedBy?: string) {
    return prisma.category.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: new Date(), updatedBy },
    });
  }

  public static async findAll(options: CategoryFilterOptions = {}) {
    try {
      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;

      const where: Prisma.CategoryWhereInput = {
        ...(options.includeDeleted ? {} : { deletedAt: null }),
        ...(options.status ? { status: options.status } : {}),
        ...(options.featured !== undefined ? { featured: options.featured } : {}),
        ...(options.search
          ? {
              OR: [
                { name: { contains: options.search, mode: "insensitive" } },
                { slug: { contains: options.search, mode: "insensitive" } },
                { description: { contains: options.search, mode: "insensitive" } },
              ],
            }
          : {}),
      };

      const sortBy = options.sortBy || "displayOrder";
      const sortOrder = options.sortOrder || "asc";

      const [items, total] = await Promise.all([
        prisma.category.findMany({
          where,
          take: limit,
          skip,
          orderBy: { [sortBy]: sortOrder },
          include: {
            _count: {
              select: { subCategories: true, collections: true, posters: true },
            },
          },
        }),
        prisma.category.count({ where }),
      ]);

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error("[CATEGORY_DB_ERROR] Database query failed:", error);
      return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
    }
  }

  public static async getFeatured() {
    try {
      return await prisma.category.findMany({
        where: { featured: true, deletedAt: null },
        orderBy: { displayOrder: "asc" },
        include: {
          _count: { select: { subCategories: true, collections: true, posters: true } },
        },
      });
    } catch (error) {
      console.error("[CATEGORY_DB_ERROR] getFeatured failed:", error);
      return [];
    }
  }
}
