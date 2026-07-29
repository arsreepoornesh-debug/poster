import { prisma } from "@/lib/prisma";
import { RegisterCustomerDTO, UpdateProfileDTO } from "@/lib/dto/auth.dto";

export class UserRepository {
  public static async findByEmail(email: string) {
    return prisma.customer.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  public static async findById(id: string) {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        addresses: true,
        cart: { include: { items: true } },
        wishlist: { include: { items: true } },
      },
    });
  }

  public static async create(data: RegisterCustomerDTO & { password: string }) {
    return prisma.customer.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase().trim(),
        password: data.password,
        phone: data.phone,
      },
    });
  }

  public static async update(id: string, data: UpdateProfileDTO) {
    return prisma.customer.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
      },
    });
  }

  public static async updatePassword(id: string, hashedPassword: string) {
    return prisma.customer.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  public static async findAll(take = 20, skip = 0) {
    return prisma.customer.findMany({
      take,
      skip,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: {
          select: { orders: true, customPosters: true },
        },
      },
    });
  }
}
