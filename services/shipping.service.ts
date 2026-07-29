import { IShippingProvider } from "@/lib/shipping/shipping.interface";
import { ShiprocketProvider } from "@/lib/shipping/shiprocket.provider";
import { prisma } from "@/lib/prisma";

export class ShippingService {
  private static provider: IShippingProvider = new ShiprocketProvider();

  public static async createShipmentForOrder(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true, items: { include: { poster: true } } },
    });

    if (!order) throw new Error("Order not found");

    const shippingAddr: any = order.shippingAddressJson || {};

    const shipmentData = await this.provider.createShipment({
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customer?.name || order.guestName || "Customer",
      email: order.customer?.email || order.guestEmail || "customer@example.com",
      phone: shippingAddr.phone || "9876543210",
      street: shippingAddr.street || "Main Street",
      city: shippingAddr.city || "Chennai",
      state: shippingAddr.state || "Tamil Nadu",
      postalCode: shippingAddr.postalCode || "600001",
      items: order.items.map((i) => ({
        name: i.poster.title,
        sku: i.poster.sku || i.poster.id,
        units: i.quantity,
        selling_price: i.unitPrice,
      })),
    });

    const labelUrl = await this.provider.generateLabel(shipmentData.shipmentId);

    const shipmentRecord = await prisma.shipment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        shiprocketOrderId: shipmentData.shipmentId,
        courierName: shipmentData.courierName,
        awbCode: shipmentData.awbCode,
        status: "DISPATCHED",
        labelUrl,
      },
      update: {
        shiprocketOrderId: shipmentData.shipmentId,
        courierName: shipmentData.courierName,
        awbCode: shipmentData.awbCode,
        status: "DISPATCHED",
        labelUrl,
      },
    });

    return shipmentRecord;
  }

  public static async getTracking(awbCode: string) {
    return this.provider.trackShipment(awbCode);
  }
}
