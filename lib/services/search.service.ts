import { prisma } from "@/lib/prisma";
import { ContentStatus } from "@prisma/client";

export class IntelligentSearchService {
  public static async searchPosters(query: string, limit = 12) {
    const q = query.trim().toLowerCase();

    return prisma.poster.findMany({
      where: {
        deletedAt: null,
        status: ContentStatus.PUBLISHED,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { tags: { has: q } },
          { category: { name: { contains: q, mode: "insensitive" } } },
          { subCategory: { name: { contains: q, mode: "insensitive" } } },
          { collection: { name: { contains: q, mode: "insensitive" } } },
          { colorTheme: { contains: q, mode: "insensitive" } },
        ],
      },
      take: limit,
      include: {
        category: { select: { name: true, slug: true } },
        subCategory: { select: { name: true, slug: true } },
        images: { take: 1, orderBy: { sortOrder: "asc" } },
      },
    });
  }

  public static async getSearchSuggestions(query: string, limit = 5) {
    if (!query || query.length < 2) return [];

    const q = query.trim();
    const posters = await prisma.poster.findMany({
      where: {
        deletedAt: null,
        status: ContentStatus.PUBLISHED,
        title: { contains: q, mode: "insensitive" },
      },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        basePrice: true,
        images: { take: 1, select: { url: true } },
      },
    });

    return posters;
  }
}
