import { prisma } from "@/lib/prisma";
import { CreateAdminDTO } from "@/lib/dto/auth.dto";

export class AdminRepository {
  public static async findByEmail(email: string) {
    return prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  public static async findById(id: string) {
    return prisma.admin.findUnique({
      where: { id },
    });
  }

  public static async create(data: CreateAdminDTO & { password: string }) {
    return prisma.admin.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase().trim(),
        password: data.password,
        role: data.role,
      },
    });
  }

  public static async delete(id: string) {
    return prisma.admin.delete({
      where: { id },
    });
  }

  public static async findAll() {
    return prisma.admin.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });
  }
}
