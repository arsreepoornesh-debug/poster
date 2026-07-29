import { NextRequest, NextResponse } from "next/server";
import { ShippingRepository } from "@/lib/repositories/shipping.repository";
import { CreateShippingOptionSchema } from "@/lib/dto/shipping.dto";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const zoneId = searchParams.get("zoneId") || undefined;

    if (zoneId) {
      const options = await ShippingRepository.findByZoneId(zoneId);
      return NextResponse.json({ success: true, data: options });
    }

    const options = await ShippingRepository.findAll();
    return NextResponse.json({ success: true, data: options });
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
    const validatedData = CreateShippingOptionSchema.parse(body);

    const option = await ShippingRepository.create(validatedData);

    return NextResponse.json(
      { success: true, data: option, message: "Shipping option created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
