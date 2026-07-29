import { NextRequest, NextResponse } from "next/server";
import { CollectionRepository } from "@/lib/repositories/collection.repository";
import { CategoryService } from "@/services/category.service";
import { CreateCollectionSchema } from "@/lib/dto/category.dto";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const subCategoryId = searchParams.get("subCategoryId") || undefined;
    const search = searchParams.get("search") || undefined;
    const status = (searchParams.get("status") as any) || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const result = await CollectionRepository.findAll({
      categoryId,
      subCategoryId,
      search,
      status,
      page,
      limit,
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
    const validatedData = CreateCollectionSchema.parse(body);

    const collection = await CategoryService.createCollection(validatedData, session.user.id);

    return NextResponse.json(
      { success: true, data: collection, message: "Collection created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
