import { NextRequest, NextResponse } from "next/server";
import { SubCategoryRepository } from "@/lib/repositories/subcategory.repository";
import { CategoryService } from "@/services/category.service";
import { CreateSubCategorySchema } from "@/lib/dto/category.dto";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const search = searchParams.get("search") || undefined;
    const status = (searchParams.get("status") as any) || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const result = await SubCategoryRepository.findAll({
      categoryId,
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

import { verifyAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { isAdmin, userId } = await verifyAdmin(req);
    if (!isAdmin || !userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = CreateSubCategorySchema.parse(body);

    const subCategory = await CategoryService.createSubCategory(validatedData, userId);

    return NextResponse.json(
      { success: true, data: subCategory, message: "SubCategory created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
