import { NextRequest, NextResponse } from "next/server";
import { LoginSchema } from "@/lib/dto/auth.dto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = LoginSchema.parse(body);

    return NextResponse.json({
      success: true,
      message: "Please submit credentials via NextAuth signIn helper",
      payload: validatedData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Invalid login payload" },
      { status: 400 }
    );
  }
}
