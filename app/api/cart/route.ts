import { NextRequest, NextResponse } from "next/server";
import { CartRepository } from "@/lib/repositories/cart.repository";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const guestToken = req.cookies.get("guest_cart_token")?.value;

    const cart = await CartRepository.getOrCreateCart(
      session?.user?.id,
      session?.user?.id ? undefined : guestToken || "GUEST_DEFAULT"
    );

    return NextResponse.json({ success: true, data: cart });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    let guestToken = req.cookies.get("guest_cart_token")?.value;
    if (!session?.user?.id && !guestToken) {
      guestToken = `GUEST_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }

    const cart = await CartRepository.getOrCreateCart(session?.user?.id, guestToken);
    const body = await req.json();
    const { posterId, variantId, quantity } = body;

    if (!posterId) {
      return NextResponse.json({ success: false, error: "posterId is required" }, { status: 400 });
    }

    const item = await CartRepository.addItem(cart.id, posterId, variantId, quantity || 1);

    const response = NextResponse.json({
      success: true,
      data: item,
      message: "Item added to cart",
    });

    if (guestToken && !session?.user?.id) {
      response.cookies.set("guest_cart_token", guestToken, { maxAge: 30 * 24 * 60 * 60 });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
