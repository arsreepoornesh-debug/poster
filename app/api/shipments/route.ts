import { NextRequest, NextResponse } from "next/server";
import { ShippingService } from "@/services/shipping.service";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: "orderId is required" }, { status: 400 });
    }

    const shipment = await ShippingService.createShipmentForOrder(orderId);

    return NextResponse.json({
      success: true,
      data: shipment,
      message: "Shipment created successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
