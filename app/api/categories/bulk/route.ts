import { NextRequest, NextResponse } from "next/server";
import { BulkActionSchema } from "@/lib/dto/category.dto";
import { CategoryService } from "@/services/category.service";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = BulkActionSchema.parse(body);

    const result = await CategoryService.bulkCategoryAction(validatedData, session.user.id);

    return NextResponse.json({
      success: true,
      data: result,
      message: `Bulk action '${validatedData.action}' performed successfully`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
