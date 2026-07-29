import { NextRequest, NextResponse } from "next/server";
import { CustomPosterRepository } from "@/lib/repositories/custom-poster.repository";
import { CustomPosterService } from "@/services/custom-poster.service";
import { ReviewCustomPosterSchema } from "@/lib/dto/custom-poster.dto";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await CustomPosterRepository.findById(id);
    if (!item) {
      return NextResponse.json({ success: false, error: "Custom poster request not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item });
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
    const validatedData = ReviewCustomPosterSchema.parse(body);

    const updated = await CustomPosterService.reviewArtwork(id, validatedData, session.user.id);

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Custom poster review updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
