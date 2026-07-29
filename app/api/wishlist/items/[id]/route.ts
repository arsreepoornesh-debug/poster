import { NextRequest, NextResponse } from "next/server";
import { WishlistRepository } from "@/lib/repositories/wishlist.repository";
import { auth } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id: posterId } = await params;
    await WishlistRepository.removeItem(session.user.id, posterId);

    return NextResponse.json({
      success: true,
      message: "Item removed from wishlist",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
