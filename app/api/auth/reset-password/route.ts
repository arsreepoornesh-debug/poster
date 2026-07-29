import { NextRequest, NextResponse } from "next/server";
import { ResetPasswordSchema } from "@/lib/dto/auth.dto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = ResetPasswordSchema.parse(body);

    return NextResponse.json({
      success: true,
      message: "Password updated successfully. Please sign in with your new password.",
      token: validated.token,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to reset password" },
      { status: 400 }
    );
  }
}
