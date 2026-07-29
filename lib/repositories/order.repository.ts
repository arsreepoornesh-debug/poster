import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";

export interface OrderFilterOptions {
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  customerId?: string;
  page?: number;
  limit?: number;
}

export class OrderRepository {
  public static async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: { include: { poster: { include: { images: true } } } },
        statusHistory: { orderBy: { createdAt: "desc" } },
      },
    });
  }

  public static async findByOrderNumber(orderNumber: string) {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: {
        customer: true,
        items: { include: { poster: true } },
        statusHistory: { orderBy: { createdAt: "desc" } },
      },
    });
  }

  public static async createOrder(data: {
    orderNumber: string;
    customerId?: string;
    guestEmail?: string;
    guestName?: string;
    shippingAddressJson: any;
    billingAddressJson: any;
    totalAmount: number;
    discountAmount?: number;
    shippingCharge?: number;
    finalAmount: number;
    couponCode?: string;
    items: Array<{
      posterId: string;
      variantName?: string;
      unitPrice: number;
      quantity: number;
      totalPrice: number;
    }>;
  }) {
    return prisma.order.create({
      data: {
        orderNumber: data.orderNumber,
        customerId: data.customerId,
        guestEmail: data.guestEmail,
        guestName: data.guestName,
        shippingAddressJson: data.shippingAddressJson,
        billingAddressJson: data.billingAddressJson,
        totalAmount: data.totalAmount,
        discountAmount: data.discountAmount || 0,
        shippingCharge: data.shippingCharge || 0,
        finalAmount: data.finalAmount,
        couponCode: data.couponCode,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.UNPAID,
        items: {
          create: data.items,
        },
        statusHistory: {
          create: {
            status: OrderStatus.PENDING,
            notes: "Order created successfully",
          },
        },
      },
      include: {
        items: true,
        statusHistory: true,
      },
    });
  }

  public static async updateStatus(id: string, status: OrderStatus, notes?: string, changedBy?: string) {
    return prisma.order.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
        statusHistory: {
          create: {
            status,
            notes,
            changedBy,
          },
        },
      },
      include: {
        customer: true,
        statusHistory: { orderBy: { createdAt: "desc" } },
      },
    });
  }

  public static async findAll(options: OrderFilterOptions = {}) {
    const page = options.page || 1;
    const limit = options.limit || 15;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      ...(options.status ? { status: options.status } : {}),
      ...(options.paymentStatus ? { paymentStatus: options.paymentStatus } : {}),
      ...(options.customerId ? { customerId: options.customerId } : {}),
      ...(options.search
        ? {
            OR: [
              { orderNumber: { contains: options.search, mode: "insensitive" } },
              { guestName: { contains: options.search, mode: "insensitive" } },
              { guestEmail: { contains: options.search, mode: "insensitive" } },
              { customer: { name: { contains: options.search, mode: "insensitive" } } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
        include: {
          customer: { select: { name: true, email: true } },
          items: { select: { id: true, quantity: true, unitPrice: true } },
        },
      }),
      prisma.order.count({ where }),
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
