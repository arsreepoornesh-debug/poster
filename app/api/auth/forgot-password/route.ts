import { NextRequest, NextResponse } from "next/server";
import { ForgotPasswordSchema } from "@/lib/dto/auth.dto";
import { AuthService } from "@/services/auth.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = ForgotPasswordSchema.parse(body);

    const result = await AuthService.requestPasswordReset(validated.email);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process password reset" },
      { status: 400 }
    );
  }
}
