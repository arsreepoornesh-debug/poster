import { NextRequest, NextResponse } from "next/server";
import { OrderRepository } from "@/lib/repositories/order.repository";
import { CreateOrderSchema } from "@/lib/dto/order.dto";
import { NotificationService } from "@/services/notification.service";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const status = (searchParams.get("status") as any) || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");

    // If customer, restrict to their own orders
    const customerId = session?.user?.role === "CUSTOMER" ? session.user.id : searchParams.get("customerId") || undefined;

    const result = await OrderRepository.findAll({
      search,
      status,
      customerId,
      page,
      limit,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const validatedData = CreateOrderSchema.parse(body);

    const generatedOrderNum = `ORD-PSTR-${Math.floor(100000 + Math.random() * 900000)}`;

    const order = await OrderRepository.createOrder({
      orderNumber: generatedOrderNum,
      customerId: session?.user?.id,
      guestEmail: validatedData.guestEmail || undefined,
      guestName: validatedData.guestName || undefined,
      shippingAddressJson: validatedData.shippingAddress,
      billingAddressJson: validatedData.billingAddress || validatedData.shippingAddress,
      totalAmount: 499,
      finalAmount: 499,
      couponCode: validatedData.couponCode || undefined,
      items: [],
    });

    const recipientEmail = session?.user?.email || validatedData.guestEmail;
    if (recipientEmail) {
      await NotificationService.notifyOrderCreated(order.orderNumber, recipientEmail, order.finalAmount);
    }

    return NextResponse.json(
      { success: true, data: order, message: "Order placed successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
