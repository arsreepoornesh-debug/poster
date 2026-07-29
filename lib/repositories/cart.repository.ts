import { prisma } from "@/lib/prisma";

export class CartRepository {
  public static async getOrCreateCart(customerId?: string, guestToken?: string) {
    if (customerId) {
      let cart = await prisma.cart.findUnique({
        where: { customerId },
        include: {
          items: {
            include: { poster: { include: { images: true } }, variant: true },
          },
        },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { customerId },
          include: {
            items: {
              include: { poster: { include: { images: true } }, variant: true },
            },
          },
        });
      }
      return cart;
    }

    if (guestToken) {
      let cart = await prisma.cart.findUnique({
        where: { guestToken },
        include: {
          items: {
            include: { poster: { include: { images: true } }, variant: true },
          },
        },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { guestToken },
          include: {
            items: {
              include: { poster: { include: { images: true } }, variant: true },
            },
          },
        });
      }
      return cart;
    }

    throw new Error("Either customerId or guestToken required for cart");
  }

  public static async addItem(cartId: string, posterId: string, variantId?: string, quantity = 1) {
    const existing = await prisma.cartItem.findFirst({
      where: { cartId, posterId, variantId: variantId || null },
    });

    if (existing) {
      return prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    }

    return prisma.cartItem.create({
      data: {
        cartId,
        posterId,
        variantId,
        quantity,
      },
    });
  }

  public static async updateQuantity(cartItemId: string, quantity: number) {
    if (quantity <= 0) {
      return prisma.cartItem.delete({ where: { id: cartItemId } });
    }
    return prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });
  }

  public static async removeItem(cartItemId: string) {
    return prisma.cartItem.delete({ where: { id: cartItemId } });
  }

  public static async clearCart(cartId: string) {
    return prisma.cartItem.deleteMany({ where: { cartId } });
  }

  public static async mergeGuestCart(guestToken: string, customerId: string) {
    const guestCart = await prisma.cart.findUnique({
      where: { guestToken },
      include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) return;

    const customerCart = await this.getOrCreateCart(customerId);

    for (const item of guestCart.items) {
      await this.addItem(customerCart.id, item.posterId, item.variantId || undefined, item.quantity);
    }

    await prisma.cart.delete({ where: { id: guestCart.id } });
  }
}
