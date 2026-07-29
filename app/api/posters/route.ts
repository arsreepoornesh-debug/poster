import { NextRequest, NextResponse } from "next/server";
import { PosterRepository } from "@/lib/repositories/poster.repository";
import { PosterService } from "@/services/poster.service";
import { CreatePosterSchema } from "@/lib/dto/poster.dto";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const subCategoryId = searchParams.get("subCategoryId") || undefined;
    const collectionId = searchParams.get("collectionId") || undefined;
    const tag = searchParams.get("tag") || undefined;
    const orientation = (searchParams.get("orientation") as any) || undefined;
    const status = (searchParams.get("status") as any) || undefined;
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;
    const isFeatured = searchParams.get("featured") === "true" ? true : undefined;
    const isTrending = searchParams.get("trending") === "true" ? true : undefined;
    const isBestSeller = searchParams.get("bestseller") === "true" ? true : undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const sortBy = (searchParams.get("sortBy") as any) || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") as any) || "desc";

    const result = await PosterRepository.findAll({
      search,
      categoryId,
      subCategoryId,
      collectionId,
      tag,
      orientation,
      status,
      minPrice,
      maxPrice,
      isFeatured,
      isTrending,
      isBestSeller,
      page,
      limit,
      sortBy,
      sortOrder,
    });

    return NextResponse.json({ success: true, ...result });
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
    const validatedData = CreatePosterSchema.parse(body);

    const poster = await PosterService.createPoster(validatedData, session.user.id);

    return NextResponse.json(
      { success: true, data: poster, message: "Poster created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
