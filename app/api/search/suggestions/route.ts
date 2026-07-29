import { NextRequest, NextResponse } from "next/server";
import { IntelligentSearchService } from "@/lib/services/search.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    const suggestions = await IntelligentSearchService.getSearchSuggestions(q);

    return NextResponse.json({
      success: true,
      data: suggestions,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
