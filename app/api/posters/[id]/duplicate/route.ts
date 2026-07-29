import { NextRequest, NextResponse } from "next/server";
import { PosterService } from "@/services/poster.service";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const duplicated = await PosterService.duplicatePoster(id, session.user.id);

    return NextResponse.json({
      success: true,
      data: duplicated,
      message: "Poster duplicated successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
