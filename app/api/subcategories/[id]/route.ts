import { NextRequest, NextResponse } from "next/server";
import { SubCategoryRepository } from "@/lib/repositories/subcategory.repository";
import { CategoryService } from "@/services/category.service";
import { UpdateSubCategorySchema } from "@/lib/dto/category.dto";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await SubCategoryRepository.findById(id);
    if (!item) {
      return NextResponse.json({ success: false, error: "SubCategory not found" }, { status: 404 });
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
    const validatedData = UpdateSubCategorySchema.parse(body);

    const updated = await CategoryService.updateSubCategory(id, validatedData, session.user.id);

    return NextResponse.json({
      success: true,
      data: updated,
      message: "SubCategory updated successfully",
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
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await SubCategoryRepository.softDelete(id, session.user.id);

    return NextResponse.json({
      success: true,
      message: "SubCategory deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
