import { IPaymentProvider } from "@/lib/payments/payment.interface";
import { RazorpayProvider } from "@/lib/payments/razorpay.provider";
import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentStatus } from "@prisma/client";

export class PaymentService {
  private static providers: Record<string, IPaymentProvider> = {
    RAZORPAY: new RazorpayProvider(),
  };

  public static getProvider(providerName = "RAZORPAY"): IPaymentProvider {
    const provider = this.providers[providerName.toUpperCase()];
    if (!provider) {
      throw new Error(`Payment provider '${providerName}' is not registered.`);
    }
    return provider;
  }

  public static async createPayment(orderId: string, providerName = "RAZORPAY") {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("Order not found");

    const provider = this.getProvider(providerName);
    const paymentOrder = await provider.createPaymentOrder({
      orderId: order.id,
      amount: order.finalAmount,
      currency: "INR",
      receipt: order.orderNumber,
    });

    const paymentRecord = await prisma.payment.create({
      data: {
        orderId: order.id,
        paymentMethod: providerName.toUpperCase(),
        razorpayOrderId: paymentOrder.providerOrderId,
        amount: order.finalAmount,
        currency: paymentOrder.currency,
        status: PaymentStatus.UNPAID,
      },
    });

    return {
      payment: paymentRecord,
      razorpayOrder: paymentOrder,
    };
  }

  public static async verifyAndCompletePayment(
    orderId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    providerName = "RAZORPAY"
  ) {
    const provider = this.getProvider(providerName);
    const isValid = provider.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      throw new Error("Invalid Razorpay payment signature verification failed");
    }

    // Update Payment & Order Status to PAID & CONFIRMED
    const paymentRecord = await prisma.payment.findFirst({
      where: { orderId, razorpayOrderId },
    });

    if (paymentRecord) {
      await prisma.payment.update({
        where: { id: paymentRecord.id },
        data: {
          transactionId: razorpayPaymentId,
          status: PaymentStatus.PAID,
          updatedAt: new Date(),
          transactions: {
            create: {
              type: "CHARGE",
              amount: paymentRecord.amount,
              status: "SUCCESS",
              payload: { razorpayOrderId, razorpayPaymentId },
            },
          },
        },
      });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.PAID,
        status: OrderStatus.CONFIRMED,
        paymentGateway: providerName,
        paymentId: razorpayPaymentId,
        statusHistory: {
          create: {
            status: OrderStatus.CONFIRMED,
            notes: `Payment verified via ${providerName} (Payment ID: ${razorpayPaymentId})`,
          },
        },
      },
    });

    return true;
  }
}
