import { NextRequest, NextResponse } from "next/server";
import { OrderRepository } from "@/lib/repositories/order.repository";
import { UpdateOrderStatusSchema } from "@/lib/dto/order.dto";
import { NotificationService } from "@/services/notification.service";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await OrderRepository.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validatedData = UpdateOrderStatusSchema.parse(body);

    const updatedOrder = await OrderRepository.updateStatus(
      id,
      validatedData.status,
      validatedData.notes,
      session.user.id
    );

    const recipientEmail = updatedOrder.customer?.email || updatedOrder.guestEmail;
    if (recipientEmail) {
      await NotificationService.notifyOrderStatusChanged(
        updatedOrder.orderNumber,
        recipientEmail,
        validatedData.status
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: "Order status updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
