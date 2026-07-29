import { NextRequest, NextResponse } from "next/server";
import { WishlistRepository } from "@/lib/repositories/wishlist.repository";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const wishlist = await WishlistRepository.getOrCreateWishlist(session.user.id);
    return NextResponse.json({ success: true, data: wishlist });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { posterId } = body;

    if (!posterId) {
      return NextResponse.json({ success: false, error: "posterId required" }, { status: 400 });
    }

    const item = await WishlistRepository.addItem(session.user.id, posterId);
    return NextResponse.json({ success: true, data: item, message: "Added to wishlist" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
