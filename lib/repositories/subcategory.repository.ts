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

  public static async findBySlug(slug: string) {
    try {
      // Use findFirst when applying non-unique filters (like deletedAt)
      const sub = await prisma.subCategory.findFirst({
        where: { slug, deletedAt: null },
        include: {
          category: true,
          collections: { where: { status: ContentStatus.PUBLISHED, deletedAt: null } },
        },
      });
      if (sub) return sub;
    } catch (error) {
      console.warn(`[SUBCATEGORY_DB_FALLBACK] Could not fetch subcategory slug "${slug}" from DB, checking mock data.`, error);
    }

    const normSlug = slug.toLowerCase();
    if (normSlug === "supercars") {
      return {
        id: "sub-supercars",
        name: "Supercars",
        slug: "supercars",
        description: "Ferrari, Lamborghini, Porsche, McLaren & exotic hypercars wall art prints.",
        imageUrl: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600",
        bannerUrl: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200",
        category: { id: "cat-cars", name: "Cars & Automations", slug: "cars-and-automations" },
        collections: [],
      } as any;
    }

    if (normSlug === "jdm") {
      return {
        id: "sub-jdm",
        name: "JDM Culture",
        slug: "jdm",
        description: "Nissan Skyline GT-R R34, Toyota Supra MK4, Mazda RX-7 & Japanese tuner legends.",
        imageUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600",
        bannerUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=1200",
        category: { id: "cat-cars", name: "Cars & Automations", slug: "cars-and-automations" },
        collections: [],
      } as any;
    }

    if (normSlug === "f1-racing") {
      return {
        id: "sub-f1",
        name: "Formula 1 & Racing",
        slug: "f1-racing",
        description: "Ayrton Senna, Lewis Hamilton, Max Verstappen & Formula One racing tribute posters.",
        imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600",
        bannerUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200",
        category: { id: "cat-cars", name: "Cars & Automations", slug: "cars-and-automations" },
        collections: [],
      } as any;
    }

    if (normSlug === "classic-cars") {
      return {
        id: "sub-classic",
        name: "Classic & Vintage",
        slug: "classic-cars",
        description: "Vintage Porsche 911, Shelby Cobra, Ford Mustang GT & retro automotive classics.",
        imageUrl: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=600",
        bannerUrl: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=1200",
        category: { id: "cat-cars", name: "Cars & Automations", slug: "cars-and-automations" },
        collections: [],
      } as any;
    }

    return null;
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
