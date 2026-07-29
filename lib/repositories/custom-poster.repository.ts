import { prisma } from "@/lib/prisma";
import { CreateCustomPosterRequestDTO, ReviewCustomPosterDTO } from "@/lib/dto/custom-poster.dto";
import { CustomPosterStatus, Prisma } from "@prisma/client";

export interface CustomPosterFilterOptions {
  search?: string;
  status?: CustomPosterStatus;
  customerId?: string;
  page?: number;
  limit?: number;
}

export class CustomPosterRepository {
  public static async findById(id: string) {
    return prisma.customPoster.findUnique({
      where: { id },
      include: {
        customer: true,
        reviewHistory: { orderBy: { createdAt: "desc" } },
      },
    });
  }

  public static async create(
    data: CreateCustomPosterRequestDTO & {
      fileUrl: string;
      previewUrl?: string;
      thumbnailUrl?: string;
      originalFileName: string;
      fileType: string;
      fileSize: number;
      width?: number;
      height?: number;
      customerId?: string;
    }
  ) {
    return prisma.customPoster.create({
      data: {
        artworkTitle: data.artworkTitle,
        fileUrl: data.fileUrl,
        previewUrl: data.previewUrl,
        thumbnailUrl: data.thumbnailUrl,
        originalFileName: data.originalFileName,
        fileType: data.fileType,
        fileSize: data.fileSize,
        width: data.width,
        height: data.height,
        selectedSize: data.selectedSize,
        quantity: data.quantity ?? 1,
        frameRequired: data.frameRequired ?? false,
        notes: data.notes,
        customerNotes: data.customerNotes,
        referenceLink: data.referenceLink,
        guestEmail: data.guestEmail,
        guestName: data.guestName,
        customerId: data.customerId,
        status: CustomPosterStatus.PENDING,
        reviewHistory: {
          create: {
            previousStatus: CustomPosterStatus.PENDING,
            newStatus: CustomPosterStatus.PENDING,
            notes: "Custom artwork request submitted",
          },
        },
      },
      include: {
        reviewHistory: true,
      },
    });
  }

  public static async updateReviewStatus(
    id: string,
    dto: ReviewCustomPosterDTO,
    changedBy?: string
  ) {
    const existing = await prisma.customPoster.findUnique({ where: { id } });
    if (!existing) throw new Error("Custom poster request not found");

    return prisma.customPoster.update({
      where: { id },
      data: {
        status: dto.status,
        adminNotes: dto.adminNotes,
        rejectionReason: dto.rejectionReason,
        updatedAt: new Date(),
        reviewHistory: {
          create: {
            previousStatus: existing.status,
            newStatus: dto.status,
            notes: dto.adminNotes || dto.rejectionReason,
            changedBy,
          },
        },
      },
      include: {
        customer: { select: { name: true, email: true } },
        reviewHistory: { orderBy: { createdAt: "desc" } },
      },
    });
  }

  public static async findAll(options: CustomPosterFilterOptions = {}) {
    const page = options.page || 1;
    const limit = options.limit || 15;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomPosterWhereInput = {
      ...(options.status ? { status: options.status } : {}),
      ...(options.customerId ? { customerId: options.customerId } : {}),
      ...(options.search
        ? {
            OR: [
              { artworkTitle: { contains: options.search, mode: "insensitive" } },
              { originalFileName: { contains: options.search, mode: "insensitive" } },
              { guestEmail: { contains: options.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.customPoster.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
        include: {
          customer: { select: { name: true, email: true } },
          reviewHistory: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      }),
      prisma.customPoster.count({ where }),
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
