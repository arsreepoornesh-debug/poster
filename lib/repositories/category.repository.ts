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
      const cat = await prisma.category.findUnique({
        where: { slug, deletedAt: null },
        include: {
          subCategories: { where: { status: ContentStatus.PUBLISHED, deletedAt: null } },
          collections: { where: { status: ContentStatus.PUBLISHED, deletedAt: null } },
          banners: true,
        },
      });
      if (cat) return cat;
    } catch (error) {
      console.warn(`[CATEGORY_DB_FALLBACK] Could not fetch category slug "${slug}" from DB, checking mock data.`);
    }

    const normSlug = slug.toLowerCase();
    if (normSlug === "cars" || normSlug === "cars-and-automations" || normSlug === "cars-and-bikes" || normSlug === "cars-and-automotive" || normSlug === "automations") {
      return {
        id: "cat-cars",
        name: "Cars & Automations",
        slug: "cars-and-automations",
        description: "High-octane Supercars, JDM legends, Formula 1, hypercars & automotive engineering poster art.",
        imageUrl: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600",
        bannerUrl: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200",
        subCategories: [
          { id: "sub-supercars", name: "Supercars", slug: "supercars", imageUrl: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600" },
          { id: "sub-jdm", name: "JDM Culture", slug: "jdm", imageUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600" },
          { id: "sub-f1", name: "Formula 1 & Racing", slug: "f1-racing", imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600" },
          { id: "sub-classic", name: "Classic & Vintage", slug: "classic-cars", imageUrl: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=600" },
        ],
        collections: [],
        banners: [],
      } as any;
    }

    if (normSlug === "anime") {
      return {
        id: "cat-1",
        name: "Anime & Manga",
        slug: "anime",
        description: "Glowing Akatsuki, Naruto, Attack on Titan & Jujutsu Kaisen wall art",
        imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600",
        bannerUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200",
        subCategories: [
          { id: "sub-demon-slayer", name: "Demon Slayer", slug: "demon-slayer", imageUrl: "/assets/images/hero-1.png" },
          { id: "sub-naruto", name: "Naruto", slug: "naruto", imageUrl: "/assets/images/hero-2.png" },
          { id: "sub-one-piece", name: "One Piece", slug: "one-piece", imageUrl: "/assets/images/hero-3.png" },
        ],
        collections: [],
        banners: [],
      } as any;
    }

    if (normSlug === "movies") {
      return {
        id: "cat-3",
        name: "Cinema & Movies",
        slug: "movies",
        description: "Interstellar, Dark Knight, Marvel & Minimalist cult movie prints",
        imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600",
        bannerUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200",
        subCategories: [
          { id: "sub-marvel", name: "Marvel", slug: "marvel", imageUrl: null },
          { id: "sub-dc", name: "DC Comics", slug: "dc-comics", imageUrl: null },
        ],
        collections: [],
        banners: [],
      } as any;
    }

    if (normSlug === "sports") {
      return {
        id: "cat-5",
        name: "Sports",
        slug: "sports",
        description: "Messi, Cristiano Ronaldo, Kobe Bryant & NBA action wall art",
        imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600",
        bannerUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200",
        subCategories: [
          { id: "sub-football", name: "Football", slug: "football", imageUrl: "/assets/images/hero-7.png" }
        ],
        collections: [],
        banners: [],
      } as any;
    }

    if (normSlug === "gaming") {
      return {
        id: "cat-4",
        name: "Gaming & Esports",
        slug: "gaming",
        description: "Cyberpunk 2077, Valorant & Elden Ring gaming posters",
        imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600",
        bannerUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200",
        subCategories: [],
        collections: [],
        banners: [],
      } as any;
    }

    return null;
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
      console.warn("[CATEGORY_DB_FALLBACK] Database offline, returning default categories.");
      const mockItems = [
        { id: "cat-1", name: "Anime & Manga", slug: "anime", imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600", description: "Glowing Akatsuki, Naruto, Attack on Titan & Jujutsu Kaisen wall art", _count: { subCategories: 4, collections: 8, posters: 25 } },
        { id: "cat-2", name: "Supercars & Automotive", slug: "cars", imageUrl: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600", description: "Ferrari F40, Porsche 911 GT3 RS & Lamborghini posters", _count: { subCategories: 5, collections: 10, posters: 30 } },
        { id: "cat-3", name: "Cinema & Movies", slug: "movies", imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600", description: "Interstellar, Dark Knight, Marvel & Minimalist cult movie prints", _count: { subCategories: 6, collections: 12, posters: 40 } },
        { id: "cat-4", name: "Gaming & Esports", slug: "gaming", imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600", description: "Cyberpunk 2077, Valorant & Elden Ring gaming posters", _count: { subCategories: 3, collections: 6, posters: 20 } },
        { id: "cat-5", name: "Sports", slug: "sports", imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600", description: "Messi, Cristiano Ronaldo, Kobe Bryant & NBA action wall art", _count: { subCategories: 4, collections: 8, posters: 22 } },
      ];
      return { items: mockItems as any[], total: mockItems.length, page: 1, limit: 20, totalPages: 1 };
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
      return (await this.findAll()).items.slice(0, 3);
    }
  }
}
