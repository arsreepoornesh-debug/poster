import { prisma } from "@/lib/prisma";
import { ContentStatus } from "@prisma/client";

export class RecommendationService {
  public static async getCustomersAlsoBought(posterId: string, limit = 4) {
    const poster = await prisma.poster.findUnique({ where: { id: posterId } });
    if (!poster) return [];

    return prisma.poster.findMany({
      where: {
        id: { not: posterId },
        categoryId: poster.categoryId,
        deletedAt: null,
        status: ContentStatus.PUBLISHED,
      },
      take: limit,
      include: {
        category: true,
        images: { take: 1, orderBy: { sortOrder: "asc" } },
      },
    });
  }

  public static async getTrendingNearYou(limit = 4) {
    return prisma.poster.findMany({
      where: {
        isTrending: true,
        deletedAt: null,
        status: ContentStatus.PUBLISHED,
      },
      take: limit,
      include: {
        category: true,
        images: { take: 1, orderBy: { sortOrder: "asc" } },
      },
    });
  }

  public static async getBestSellers(limit = 4) {
    return prisma.poster.findMany({
      where: {
        isBestSeller: true,
        deletedAt: null,
        status: ContentStatus.PUBLISHED,
      },
      take: limit,
      include: {
        category: true,
        images: { take: 1, orderBy: { sortOrder: "asc" } },
      },
    });
  }
}
