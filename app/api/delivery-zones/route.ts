import { NextRequest, NextResponse } from "next/server";
import { DeliveryRepository } from "@/lib/repositories/delivery.repository";
import { ShippingRepository } from "@/lib/repositories/shipping.repository";
import { CreateDeliveryZoneSchema } from "@/lib/dto/order.dto";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const zones = await DeliveryRepository.findAll();
    const zonesWithOptions = await Promise.all(
      zones.map(async (zone: any) => {
        const options = await ShippingRepository.findByZoneId(zone.id);
        return {
          ...zone,
          shippingOptions: options
        };
      })
    );
    return NextResponse.json({ success: true, data: zonesWithOptions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = CreateDeliveryZoneSchema.parse(body);

    const zone = await DeliveryRepository.create(validatedData);

    return NextResponse.json(
      { success: true, data: zone, message: "Delivery zone created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
