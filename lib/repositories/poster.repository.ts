import { prisma } from "@/lib/prisma";
import { CreatePosterDTO, UpdatePosterDTO } from "@/lib/dto/poster.dto";
import { ContentStatus, PosterOrientation, Prisma } from "@prisma/client";

export interface PosterFilterOptions {
  search?: string;
  categoryId?: string;
  subCategoryId?: string;
  collectionId?: string;
  tag?: string;
  minPrice?: number;
  maxPrice?: number;
  orientation?: PosterOrientation;
  frameAvailable?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  status?: ContentStatus;
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "basePrice" | "title" | "stock";
  sortOrder?: "asc" | "desc";
}

export class PosterRepository {
  public static async findById(id: string) {
    try {
      return await prisma.poster.findUnique({
        where: { id },
        include: {
          category: true,
          subCategory: true,
          collection: true,
          images: { orderBy: { sortOrder: "asc" } },
          variants: { orderBy: { priceAdjustment: "asc" } },
          reviews: { where: { isApproved: true } },
        },
      });
    } catch (error) {
      console.warn(`[POSTER_DB_FALLBACK] findById("${id}") failed, returning mock.`);
      return PosterRepository.getMockPosterById(id);
    }
  }

  public static async findBySlug(slug: string) {
    try {
      return await prisma.poster.findUnique({
        where: { slug, deletedAt: null },
        include: {
          category: true,
          subCategory: true,
          collection: true,
          images: { orderBy: { sortOrder: "asc" } },
          variants: { orderBy: { priceAdjustment: "asc" } },
          reviews: { where: { isApproved: true } },
        },
      });
    } catch (error) {
      console.warn(`[POSTER_DB_FALLBACK] findBySlug("${slug}") failed, returning mock.`);
      return PosterRepository.getMockPosterBySlug(slug);
    }
  }

  public static async create(data: CreatePosterDTO & { slug: string; sku: string; createdBy?: string }) {
    return prisma.poster.create({
      data: {
        title: data.title,
        slug: data.slug,
        shortDescription: data.shortDescription,
        description: data.description,
        basePrice: data.basePrice,
        offerPrice: data.offerPrice,
        sku: data.sku,
        barcode: data.barcode,
        categoryId: data.categoryId,
        subCategoryId: data.subCategoryId,
        collectionId: data.collectionId,
        tags: data.tags || [],
        orientation: data.orientation || PosterOrientation.PORTRAIT,
        colorTheme: data.colorTheme,
        artist: data.artist,
        brand: data.brand,
        series: data.series,
        releaseYear: data.releaseYear,
        frameAvailable: data.frameAvailable ?? true,
        stock: data.stock ?? 50,
        isFeatured: data.isFeatured ?? false,
        isTrending: data.isTrending ?? false,
        isBestSeller: data.isBestSeller ?? false,
        isNewArrival: data.isNewArrival ?? true,
        status: data.status || ContentStatus.PUBLISHED,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        createdBy: data.createdBy,
        images: {
          create: data.images?.map((img, idx) => ({
            url: img.url,
            thumbnailUrl: img.thumbnailUrl || img.url,
            publicId: img.publicId,
            altText: img.altText || data.title,
            sortOrder: img.sortOrder ?? idx,
          })),
        },
        variants: {
          create: data.variants?.map((v) => ({
            sizeName: v.sizeName,
            priceAdjustment: v.priceAdjustment,
            offerPrice: v.offerPrice,
            stock: v.stock,
            weight: v.weight,
            dimensions: v.dimensions,
            frameAvailable: v.frameAvailable,
            isDefault: v.isDefault,
          })),
        },
      },
      include: {
        images: true,
        variants: true,
      },
    });
  }

  public static async update(id: string, data: UpdatePosterDTO & { updatedBy?: string }) {
    const { images, variants, ...posterData } = data;

    return prisma.poster.update({
      where: { id },
      data: {
        ...posterData,
        updatedBy: data.updatedBy,
        updatedAt: new Date(),
        ...(images
          ? {
              images: {
                deleteMany: {},
                create: images.map((img, idx) => ({
                  url: img.url,
                  thumbnailUrl: img.thumbnailUrl || img.url,
                  publicId: img.publicId,
                  altText: img.altText,
                  sortOrder: img.sortOrder ?? idx,
                })),
              },
            }
          : {}),
        ...(variants
          ? {
              variants: {
                deleteMany: {},
                create: variants.map((v) => ({
                  sizeName: v.sizeName,
                  priceAdjustment: v.priceAdjustment,
                  offerPrice: v.offerPrice,
                  stock: v.stock,
                  weight: v.weight,
                  dimensions: v.dimensions,
                  frameAvailable: v.frameAvailable,
                  isDefault: v.isDefault,
                })),
              },
            }
          : {}),
      },
      include: {
        images: true,
        variants: true,
      },
    });
  }

  public static async softDelete(id: string, updatedBy?: string) {
    return prisma.poster.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy },
    });
  }

  public static async findAll(options: PosterFilterOptions = {}) {
    try {
      const page = options.page || 1;
      const limit = options.limit || 12;
      const skip = (page - 1) * limit;

      const where: Prisma.PosterWhereInput = {
        ...(options.includeDeleted ? {} : { deletedAt: null }),
        ...(options.status ? { status: options.status } : {}),
        ...(options.categoryId ? { categoryId: options.categoryId } : {}),
        ...(options.subCategoryId ? { subCategoryId: options.subCategoryId } : {}),
        ...(options.collectionId ? { collectionId: options.collectionId } : {}),
        ...(options.tag ? { tags: { has: options.tag } } : {}),
        ...(options.orientation ? { orientation: options.orientation } : {}),
        ...(options.frameAvailable !== undefined ? { frameAvailable: options.frameAvailable } : {}),
        ...(options.isFeatured !== undefined ? { isFeatured: options.isFeatured } : {}),
        ...(options.isTrending !== undefined ? { isTrending: options.isTrending } : {}),
        ...(options.isBestSeller !== undefined ? { isBestSeller: options.isBestSeller } : {}),
        ...(options.isNewArrival !== undefined ? { isNewArrival: options.isNewArrival } : {}),
        ...(options.minPrice !== undefined || options.maxPrice !== undefined
          ? {
              basePrice: {
                ...(options.minPrice !== undefined ? { gte: options.minPrice } : {}),
                ...(options.maxPrice !== undefined ? { lte: options.maxPrice } : {}),
              },
            }
          : {}),
        ...(options.search
          ? {
              OR: [
                { title: { contains: options.search, mode: "insensitive" } },
                { description: { contains: options.search, mode: "insensitive" } },
                { sku: { contains: options.search, mode: "insensitive" } },
                { tags: { has: options.search } },
              ],
            }
          : {}),
      };

      const sortBy = options.sortBy || "createdAt";
      const sortOrder = options.sortOrder || "asc";

      const [items, total] = await Promise.all([
        prisma.poster.findMany({
          where,
          take: limit,
          skip,
          orderBy: { [sortBy]: sortOrder },
          include: {
            category: { select: { id: true, name: true, slug: true } },
            subCategory: { select: { id: true, name: true, slug: true } },
            collection: { select: { id: true, name: true, slug: true } },
            images: { orderBy: { sortOrder: "asc" }, take: 2 },
            variants: { orderBy: { priceAdjustment: "asc" } },
          },
        }),
        prisma.poster.count({ where }),
      ]);

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.warn("[POSTER_DB_FALLBACK] Database offline, returning default catalog posters.");
      const mockPosters = [
        {
          id: "p1",
          title: "Itachi Akatsuki Glowing Eyes Poster",
          slug: "itachi-akatsuki-glowing-eyes",
          basePrice: 699,
          offerPrice: 399,
          description: "High quality 300 GSM matte finish paper featuring Itachi Uchiha Glowing Red Eyes.",
          category: { name: "Anime & Manga", slug: "anime" },
          images: [{ url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600" }],
          isFeatured: true,
          isTrending: true,
          isBestSeller: true,
          stock: 45,
        },
        {
          id: "p2",
          title: "Ferrari F40 Vintage Classic Supercar Art",
          slug: "ferrari-f40-vintage-supercar",
          basePrice: 899,
          offerPrice: 499,
          description: "Legendary Ferrari F40 matte black wall art print.",
          category: { name: "Supercars & Automotive", slug: "cars" },
          images: [{ url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600" }],
          isFeatured: true,
          isTrending: true,
          isBestSeller: false,
          stock: 30,
        },
        {
          id: "p3",
          title: "Interstellar Gargantua Black Hole Print",
          slug: "interstellar-gargantua-black-hole",
          basePrice: 749,
          offerPrice: 449,
          description: "Minimalist sci-fi movie print inspired by Christopher Nolan's Interstellar.",
          category: { name: "Cinema & Movies", slug: "movies" },
          images: [{ url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600" }],
          isFeatured: false,
          isTrending: true,
          isBestSeller: true,
          stock: 50,
        },
        {
          id: "p4",
          title: "Cyberpunk Neon Cityscape 2077 Art",
          slug: "cyberpunk-neon-cityscape-2077",
          basePrice: 799,
          offerPrice: 499,
          description: "Vibrant gaming room neon cityscape artwork on thick 300 GSM paper.",
          category: { name: "Gaming & Esports", slug: "gaming" },
          images: [{ url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600" }],
          isFeatured: true,
          isTrending: false,
          isBestSeller: false,
          stock: 25,
        },
        {
          id: "p5",
          title: "Retro Arcade Game Machine Neon",
          slug: "retro-arcade-game-machine",
          basePrice: 599,
          offerPrice: 349,
          description: "Nostalgic 80s arcade machine poster in neon violet glow.",
          category: { name: "Gaming & Esports", slug: "gaming" },
          images: [{ url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600" }],
          isFeatured: false,
          isTrending: true,
          isBestSeller: false,
          stock: 40,
        },
        {
          id: "p6",
          title: "Porsche 911 Turbo S Racing Edition",
          slug: "porsche-911-turbo-s-racing",
          basePrice: 999,
          offerPrice: 599,
          description: "Stunning shot of Porsche 911 Turbo S cruising on a rainy road.",
          category: { name: "Supercars & Automotive", slug: "cars" },
          images: [{ url: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=600" }],
          isFeatured: true,
          isTrending: true,
          isBestSeller: true,
          stock: 18,
        },
        {
          id: "p7",
          title: "Demon Slayer Tanjiro Hinokami Kagura",
          slug: "tanjiro-hinokami-kagura",
          basePrice: 699,
          offerPrice: 399,
          description: "Premium Kimetsu no Yaiba Tanjiro fire slash poster.",
          category: { name: "Anime & Manga", slug: "anime" },
          images: [{ url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600" }],
          isFeatured: true,
          isTrending: true,
          isBestSeller: true,
          stock: 35,
        },
        {
          id: "p8",
          title: "Pulp Fiction Vincent & Jules Classic",
          slug: "pulp-fiction-classic-art",
          basePrice: 749,
          offerPrice: 429,
          description: "Vintage Tarantino movie poster featuring John Travolta & Samuel L. Jackson.",
          category: { name: "Cinema & Movies", slug: "movies" },
          images: [{ url: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600" }],
          isFeatured: false,
          isTrending: false,
          isBestSeller: true,
          stock: 22,
        },
        {
          id: "p9",
          title: "Michael Jordan Chicago Bulls Dunk",
          slug: "michael-jordan-bulls-dunk",
          basePrice: 799,
          offerPrice: 449,
          description: "Legendary 1988 Slam Dunk contest photograph of Michael Jordan.",
          category: { name: "Sports & Football Legends", slug: "sports" },
          images: [{ url: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600" }],
          isFeatured: true,
          isTrending: true,
          isBestSeller: true,
          stock: 50,
        },
        {
          id: "p10",
          title: "Lionel Messi Barcelona Celebration",
          slug: "messi-camp-nou-celebration",
          basePrice: 799,
          offerPrice: 449,
          description: "Premium Lionel Messi football history tribute print.",
          category: { name: "Sports", slug: "sports" },
          images: [{ url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600" }],
          isFeatured: true,
          isTrending: true,
          isBestSeller: true,
          stock: 45,
        },
        {
          id: "p11",
          title: "Nissan GT-R R34 Midnight Wangan",
          slug: "nissan-gtr-r34-midnight",
          basePrice: 899,
          offerPrice: 499,
          description: "Legendary Skyline GT-R R34 cruising under neon Tokyo highway lights.",
          category: { name: "Supercars & Automotive", slug: "cars" },
          images: [{ url: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600" }],
          isFeatured: false,
          isTrending: true,
          isBestSeller: false,
          stock: 29,
        },
        {
          id: "p12",
          title: "Akira Neo Tokyo Motorcycle Art",
          slug: "akira-neo-tokyo-motorcycle",
          basePrice: 749,
          offerPrice: 429,
          description: "Classic cyberpunk anime artwork featuring Kaneda's iconic red motorcycle.",
          category: { name: "Anime & Manga", slug: "anime" },
          images: [{ url: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600" }],
          isFeatured: true,
          isTrending: true,
          isBestSeller: true,
          stock: 41,
        },
        {
          id: "p13",
          title: "Fight Club Soap Tyler Durden Print",
          slug: "fight-club-soap-durden",
          basePrice: 699,
          offerPrice: 399,
          description: "Fight Club movie poster featuring the pink soap aesthetic.",
          category: { name: "Cinema & Movies", slug: "movies" },
          images: [{ url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600" }],
          isFeatured: false,
          isTrending: true,
          isBestSeller: false,
          stock: 20,
        },
        {
          id: "p14",
          title: "Elden Ring Erdtree Golden Glow",
          slug: "elden-ring-erdtree-gold",
          basePrice: 799,
          offerPrice: 479,
          description: "Magnificent golden glowing Erdtree landscape from Elden Ring.",
          category: { name: "Gaming & Esports", slug: "gaming" },
          images: [{ url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600" }],
          isFeatured: true,
          isTrending: true,
          isBestSeller: true,
          stock: 33,
        },
        {
          id: "p15",
          title: "Senna McLaren Formula One Tribute",
          slug: "ayrton-senna-mclaren-f1",
          basePrice: 999,
          offerPrice: 549,
          description: "Ayrton Senna Formula 1 iconic racing poster print.",
          category: { name: "Supercars & Automotive", slug: "cars" },
          images: [{ url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600" }],
          isFeatured: true,
          isTrending: false,
          isBestSeller: false,
          stock: 12,
        },
        {
          id: "p16",
          title: "Blade Runner 2049 Officer K",
          slug: "blade-runner-2049-officer-k",
          basePrice: 749,
          offerPrice: 449,
          description: "Blade Runner 2049 cinematic landscape featuring Officer K in foggy orange ruins.",
          category: { name: "Cinema & Movies", slug: "movies" },
          images: [{ url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600" }],
          isFeatured: false,
          isTrending: true,
          isBestSeller: true,
          stock: 25,
        },
        {
          id: "p17",
          title: "Jujutsu Kaisen Gojo Satoru Void",
          slug: "gojo-satoru-infinite-void",
          basePrice: 699,
          offerPrice: 399,
          description: "Gojo Satoru deploying Unlimited Void domain expansion.",
          category: { name: "Anime & Manga", slug: "anime" },
          images: [{ url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600" }],
          isFeatured: true,
          isTrending: true,
          isBestSeller: true,
          stock: 48,
        },
        {
          id: "p18",
          title: "Virat Kohli King Celebration",
          slug: "virat-kohli-king-celebration",
          basePrice: 799,
          offerPrice: 449,
          description: "Virat Kohli aggressive century celebration tribute poster.",
          category: { name: "Sports & Football Legends", slug: "sports" },
          images: [{ url: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600" }],
          isFeatured: true,
          isTrending: true,
          isBestSeller: true,
          stock: 50,
        },
        {
          id: "p19",
          title: "Cyberpunk Samurai Oni Mask Art",
          slug: "cyberpunk-samurai-oni-mask",
          basePrice: 699,
          offerPrice: 399,
          description: "Glowing holographic cyberpunk samurai Oni mask artwork.",
          category: { name: "Gaming & Esports", slug: "gaming" },
          images: [{ url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600" }],
          isFeatured: false,
          isTrending: true,
          isBestSeller: false,
          stock: 31,
        },
        {
          id: "p20",
          title: "Tokyo Ghoul Kaneki Ken Half-Kakuja",
          slug: "kaneki-ken-half-kakuja",
          basePrice: 699,
          offerPrice: 399,
          description: "Gothic anime dark print featuring Kaneki Ken.",
          category: { name: "Anime & Manga", slug: "anime" },
          images: [{ url: "https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?w=600" }],
          isFeatured: true,
          isTrending: true,
          isBestSeller: true,
          stock: 40,
        },
      ];
      return { items: mockPosters as any[], total: mockPosters.length, page: 1, limit: 20, totalPages: 1 };
    }
  }

  public static async getRelatedPosters(posterId: string, categoryId: string, limit = 4) {
    try {
      return await prisma.poster.findMany({
        where: {
          categoryId,
          id: { not: posterId },
          status: ContentStatus.PUBLISHED,
          deletedAt: null,
        },
        take: limit,
        include: {
          category: true,
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
      });
    } catch (error) {
      console.warn(`[POSTER_DB_FALLBACK] getRelatedPosters failed, returning mock.`);
      return PosterRepository.getMockRelatedPosters(posterId, categoryId, limit);
    }
  }

  // ========== DB FALLBACK HELPERS ==========

  private static getMockPosters(): any[] {
    const now = new Date();
    return [
      {
        id: "p1", title: "Itachi Akatsuki Glowing Eyes Poster", slug: "itachi-akatsuki-glowing-eyes",
        categoryId: "cat-1", subCategoryId: "sub-demon-slayer", collectionId: null,
        category: { id: "cat-1", name: "Anime & Manga", slug: "anime" },
        subCategory: { id: "sub-demon-slayer", name: "Demon Slayer", slug: "demon-slayer" },
        collection: null,
        images: [{ url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600", altText: "Itachi Akatsuki" }],
        variants: [{ sizeName: "A4 (8.3 x 11.7 in)", priceAdjustment: 0, isDefault: true, stock: 50 }],
        reviews: [],
        basePrice: 699, offerPrice: 399, stock: 45, sku: "PSTR-ITA-001",
        description: "High quality 300 GSM matte finish paper featuring Itachi Uchiha Glowing Red Eyes.",
        shortDescription: null, isFeatured: true, isTrending: true, isBestSeller: true, isNewArrival: true,
        status: "PUBLISHED", metaTitle: null, metaDescription: null, createdBy: null, updatedBy: null, deletedAt: null,
        frameAvailable: true, colorTheme: null, artist: null, brand: null, series: null, releaseYear: null,
        createdAt: now, updatedAt: now,
      },
      {
        id: "p2", title: "Ferrari F40 Vintage Classic Supercar Art", slug: "ferrari-f40-vintage-supercar",
        categoryId: "cat-cars", subCategoryId: "sub-supercars", collectionId: null,
        category: { id: "cat-cars", name: "Cars & Automations", slug: "cars-and-automations" },
        subCategory: { id: "sub-supercars", name: "Supercars", slug: "supercars" },
        collection: null,
        images: [{ url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600", altText: "Ferrari F40" }],
        variants: [{ sizeName: "A4 (8.3 x 11.7 in)", priceAdjustment: 0, isDefault: true, stock: 30 }],
        reviews: [],
        basePrice: 899, offerPrice: 499, stock: 30, sku: "PSTR-FER-002",
        description: "Legendary Ferrari F40 matte black wall art print.",
        shortDescription: null, isFeatured: true, isTrending: true, isBestSeller: false, isNewArrival: true,
        status: "PUBLISHED", metaTitle: null, metaDescription: null, createdBy: null, updatedBy: null, deletedAt: null,
        frameAvailable: true, colorTheme: null, artist: null, brand: null, series: null, releaseYear: null,
        createdAt: now, updatedAt: now,
      },
      {
        id: "p3", title: "Interstellar Gargantua Black Hole Print", slug: "interstellar-gargantua-black-hole",
        categoryId: "cat-3", subCategoryId: "sub-marvel", collectionId: null,
        category: { id: "cat-3", name: "Cinema & Movies", slug: "movies" },
        subCategory: { id: "sub-marvel", name: "Marvel", slug: "marvel" },
        collection: null,
        images: [{ url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600", altText: "Interstellar" }],
        variants: [],
        reviews: [],
        basePrice: 749, offerPrice: 449, stock: 50, sku: "PSTR-INT-003",
        description: "Minimalist sci-fi movie print inspired by Christopher Nolan's Interstellar.",
        shortDescription: null, isFeatured: false, isTrending: true, isBestSeller: true, isNewArrival: true,
        status: "PUBLISHED", metaTitle: null, metaDescription: null, createdBy: null, updatedBy: null, deletedAt: null,
        frameAvailable: true, colorTheme: null, artist: null, brand: null, series: null, releaseYear: null,
        createdAt: now, updatedAt: now,
      },
      {
        id: "p4", title: "Cyberpunk Neon Cityscape 2077 Art", slug: "cyberpunk-neon-cityscape-2077",
        categoryId: "cat-4", subCategoryId: null, collectionId: null,
        category: { id: "cat-4", name: "Gaming & Esports", slug: "gaming" },
        subCategory: null, collection: null,
        images: [{ url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600", altText: "Cyberpunk" }],
        variants: [], reviews: [],
        basePrice: 799, offerPrice: 499, stock: 25, sku: "PSTR-CYB-004",
        description: "Vibrant gaming room neon cityscape artwork on thick 300 GSM paper.",
        shortDescription: null, isFeatured: true, isTrending: false, isBestSeller: false, isNewArrival: true,
        status: "PUBLISHED", metaTitle: null, metaDescription: null, createdBy: null, updatedBy: null, deletedAt: null,
        frameAvailable: true, colorTheme: null, artist: null, brand: null, series: null, releaseYear: null,
        createdAt: now, updatedAt: now,
      },
      {
        id: "p5", title: "Retro Arcade Game Machine Neon", slug: "retro-arcade-game-machine",
        categoryId: "cat-4", subCategoryId: null, collectionId: null,
        category: { id: "cat-4", name: "Gaming & Esports", slug: "gaming" },
        subCategory: null, collection: null,
        images: [{ url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600", altText: "Retro Arcade" }],
        variants: [], reviews: [],
        basePrice: 599, offerPrice: 349, stock: 40, sku: "PSTR-RET-005",
        description: "Nostalgic 80s arcade machine poster in neon violet glow.",
        shortDescription: null, isFeatured: false, isTrending: true, isBestSeller: false, isNewArrival: true,
        status: "PUBLISHED", metaTitle: null, metaDescription: null, createdBy: null, updatedBy: null, deletedAt: null,
        frameAvailable: true, colorTheme: null, artist: null, brand: null, series: null, releaseYear: null,
        createdAt: now, updatedAt: now,
      },
      {
        id: "p6", title: "Porsche 911 Turbo S Racing Edition", slug: "porsche-911-turbo-s-racing",
        categoryId: "cat-cars", subCategoryId: "sub-supercars", collectionId: null,
        category: { id: "cat-cars", name: "Cars & Automations", slug: "cars-and-automations" },
        subCategory: { id: "sub-supercars", name: "Supercars", slug: "supercars" },
        collection: null,
        images: [{ url: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=600", altText: "Porsche 911" }],
        variants: [], reviews: [],
        basePrice: 999, offerPrice: 599, stock: 18, sku: "PSTR-POR-006",
        description: "Stunning shot of Porsche 911 Turbo S cruising on a rainy road.",
        shortDescription: null, isFeatured: true, isTrending: true, isBestSeller: true, isNewArrival: true,
        status: "PUBLISHED", metaTitle: null, metaDescription: null, createdBy: null, updatedBy: null, deletedAt: null,
        frameAvailable: true, colorTheme: null, artist: null, brand: null, series: null, releaseYear: null,
        createdAt: now, updatedAt: now,
      },
    ];
  }

  public static getMockPosterBySlug(slug: string): any {
    return PosterRepository.getMockPosters().find((p: any) => p.slug === slug) || null;
  }

  public static getMockPosterById(id: string): any {
    return PosterRepository.getMockPosters().find((p: any) => p.id === id) || null;
  }

  public static getMockRelatedPosters(posterId: string, categoryId: string, limit = 4): any[] {
    return PosterRepository.getMockPosters()
      .filter((p: any) => p.category.slug === categoryId || p.id !== posterId)
      .slice(0, limit);
  }
}
