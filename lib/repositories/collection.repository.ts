import { prisma } from "@/lib/prisma";
import { CreateCollectionDTO, UpdateCollectionDTO } from "@/lib/dto/category.dto";
import { ContentStatus, Prisma } from "@prisma/client";

export interface CollectionFilterOptions {
  categoryId?: string;
  subCategoryId?: string;
  search?: string;
  status?: ContentStatus;
  featured?: boolean;
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "name" | "createdAt" | "displayOrder";
  sortOrder?: "asc" | "desc";
}

export class CollectionRepository {
  public static async findById(id: string) {
    return prisma.collection.findUnique({
      where: { id },
      include: {
        category: true,
        subCategory: true,
        _count: { select: { posters: true } },
      },
    });
  }

  public static async findBySlug(slug: string) {
    return prisma.collection.findUnique({
      where: { slug, deletedAt: null },
      include: {
        category: true,
        subCategory: true,
      },
    });
  }

  public static async create(data: CreateCollectionDTO & { slug: string; createdBy?: string }) {
    return prisma.collection.create({
      data: {
        categoryId: data.categoryId,
        subCategoryId: data.subCategoryId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        coverImageUrl: data.coverImageUrl,
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

  public static async update(id: string, data: UpdateCollectionDTO & { updatedBy?: string }) {
    return prisma.collection.update({
      where: { id },
      data: {
        ...data,
        updatedBy: data.updatedBy,
        updatedAt: new Date(),
      },
    });
  }

  public static async softDelete(id: string, updatedBy?: string) {
    return prisma.collection.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy },
    });
  }

  public static async restore(id: string, updatedBy?: string) {
    return prisma.collection.update({
      where: { id },
      data: { deletedAt: null, updatedBy },
    });
  }

  public static async findAll(options: CollectionFilterOptions = {}) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.CollectionWhereInput = {
      ...(options.includeDeleted ? {} : { deletedAt: null }),
      ...(options.categoryId ? { categoryId: options.categoryId } : {}),
      ...(options.subCategoryId ? { subCategoryId: options.subCategoryId } : {}),
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
      prisma.collection.findMany({
        where,
        take: limit,
        skip,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          subCategory: { select: { id: true, name: true, slug: true } },
          _count: { select: { posters: true } },
        },
      }),
      prisma.collection.count({ where }),
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
