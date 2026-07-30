import { NextRequest, NextResponse } from "next/server";
import { CategoryRepository } from "@/lib/repositories/category.repository";
import { CategoryService } from "@/services/category.service";
import { CreateCategorySchema } from "@/lib/dto/category.dto";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const status = (searchParams.get("status") as any) || undefined;
    const featured = searchParams.get("featured") === "true" ? true : undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sortBy = (searchParams.get("sortBy") as any) || "displayOrder";
    const sortOrder = (searchParams.get("sortOrder") as any) || "asc";

    const result = await CategoryRepository.findAll({
      search,
      status,
      featured,
      page,
      limit,
      sortBy,
      sortOrder,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

import { verifyAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { isAdmin, userId } = await verifyAdmin(req);
    if (!isAdmin || !userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = CreateCategorySchema.parse(body);

    const category = await CategoryService.createCategory(validatedData, userId);

    return NextResponse.json(
      { success: true, data: category, message: "Category created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create category" },
      { status: 400 }
    );
  }
}
