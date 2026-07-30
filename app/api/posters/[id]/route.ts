import { NextRequest, NextResponse } from "next/server";
import { PosterRepository } from "@/lib/repositories/poster.repository";
import { PosterService } from "@/services/poster.service";
import { UpdatePosterSchema } from "@/lib/dto/poster.dto";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const poster = await PosterRepository.findById(id);
    if (!poster) {
      return NextResponse.json({ success: false, error: "Poster not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: poster });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { verifyAdmin } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isAdmin, userId } = await verifyAdmin(req);
    if (!isAdmin || !userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validatedData = UpdatePosterSchema.parse(body);

    const updated = await PosterService.updatePoster(id, validatedData, userId);

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Poster updated successfully",
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
    const { isAdmin, userId } = await verifyAdmin(req);
    if (!isAdmin || !userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await PosterService.deletePoster(id, userId);

    return NextResponse.json({
      success: true,
      message: "Poster deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
