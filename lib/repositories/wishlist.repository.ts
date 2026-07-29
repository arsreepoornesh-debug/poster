import { prisma } from "@/lib/prisma";

export class WishlistRepository {
  public static async getOrCreateWishlist(customerId: string) {
    let wishlist = await prisma.wishlist.findUnique({
      where: { customerId },
      include: {
        items: {
          include: { poster: { include: { images: true } } },
        },
      },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { customerId },
        include: {
          items: {
            include: { poster: { include: { images: true } } },
          },
        },
      });
    }

    return wishlist;
  }

  public static async addItem(customerId: string, posterId: string) {
    const wishlist = await this.getOrCreateWishlist(customerId);

    return prisma.wishlistItem.upsert({
      where: {
        wishlistId_posterId: {
          wishlistId: wishlist.id,
          posterId,
        },
      },
      create: {
        wishlistId: wishlist.id,
        posterId,
      },
      update: {},
    });
  }

  public static async removeItem(customerId: string, posterId: string) {
    const wishlist = await prisma.wishlist.findUnique({ where: { customerId } });
    if (!wishlist) return;

    return prisma.wishlistItem.deleteMany({
      where: {
        wishlistId: wishlist.id,
        posterId,
      },
    });
  }
}
