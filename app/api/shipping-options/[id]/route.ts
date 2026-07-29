import { NextRequest, NextResponse } from "next/server";
import { ShippingRepository } from "@/lib/repositories/shipping.repository";
import { CreateShippingOptionSchema } from "@/lib/dto/shipping.dto";
import { auth } from "@/lib/auth";

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

    // Partial update validation
    const validatedData = CreateShippingOptionSchema.partial().parse(body);
    const updated = await ShippingRepository.update(id, validatedData);

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Shipping option updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await ShippingRepository.delete(id);

    return NextResponse.json({
      success: true,
      message: "Shipping option deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
