import { prisma } from "@/lib/prisma";
import { CreateSubCategoryDTO, UpdateSubCategoryDTO } from "@/lib/dto/category.dto";
import { ContentStatus, Prisma } from "@prisma/client";

export interface SubCategoryFilterOptions {
  categoryId?: string;
  search?: string;
  status?: ContentStatus;
  featured?: boolean;
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "name" | "createdAt" | "displayOrder";
  sortOrder?: "asc" | "desc";
}

export class SubCategoryRepository {
  public static async findById(id: string) {
    return prisma.subCategory.findUnique({
      where: { id },
      include: {
        category: true,
        collections: { where: { deletedAt: null } },
        _count: { select: { collections: true, posters: true } },
      },
    });
  }

  public static async findBySlugGlobal(slug: string) {
    try {
      return await prisma.subCategory.findFirst({
        where: { slug },
      });
    } catch (error) {
      return null;
    }
  }

  public static async findBySlug(slug: string) {
    try {
      // Use findFirst when applying non-unique filters (like deletedAt)
      return await prisma.subCategory.findFirst({
        where: { slug, deletedAt: null },
        include: {
          category: true,
          collections: { where: { status: ContentStatus.PUBLISHED, deletedAt: null } },
        },
      });
    } catch (error) {
      console.error(`[SUBCATEGORY_DB_ERROR] Could not fetch subcategory slug "${slug}" from DB:`, error);
      return null;
    }
  }

  public static async create(data: CreateSubCategoryDTO & { slug: string; createdBy?: string }) {
    return prisma.subCategory.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        imageUrl: data.imageUrl,
        bannerUrl: data.bannerUrl,
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

  public static async update(id: string, data: UpdateSubCategoryDTO & { updatedBy?: string }) {
    return prisma.subCategory.update({
      where: { id },
      data: {
        ...data,
        updatedBy: data.updatedBy,
        updatedAt: new Date(),
      },
    });
  }

  public static async softDelete(id: string, updatedBy?: string) {
    return prisma.subCategory.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy },
    });
  }

  public static async restore(id: string, updatedBy?: string) {
    return prisma.subCategory.update({
      where: { id },
      data: { deletedAt: null, updatedBy },
    });
  }

  public static async findAll(options: SubCategoryFilterOptions = {}) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.SubCategoryWhereInput = {
      ...(options.includeDeleted ? {} : { deletedAt: null }),
      ...(options.categoryId ? { categoryId: options.categoryId } : {}),
      ...(options.status ? { status: options.status } : {}),
      ...(options.featured !== undefined ? { featured: options.featured } : {}),
      ...(options.search
        ? {
            OR: [
              { name: { contains: options.search, mode: "insensitive" } },
              { slug: { contains: options.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const sortBy = options.sortBy || "displayOrder";
    const sortOrder = options.sortOrder || "asc";

    const [items, total] = await Promise.all([
      prisma.subCategory.findMany({
        where,
        take: limit,
        skip,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { collections: true, posters: true } },
        },
      }),
      prisma.subCategory.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
