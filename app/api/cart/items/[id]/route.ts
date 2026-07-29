import { NextRequest, NextResponse } from "next/server";
import { CartRepository } from "@/lib/repositories/cart.repository";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { quantity } = body;

    const item = await CartRepository.updateQuantity(id, quantity);

    return NextResponse.json({
      success: true,
      data: item,
      message: "Cart quantity updated",
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
    const { id } = await params;
    await CartRepository.removeItem(id);

    return NextResponse.json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
