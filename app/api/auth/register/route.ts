import { NextRequest, NextResponse } from "next/server";
import { RegisterCustomerSchema } from "@/lib/dto/auth.dto";
import { AuthService } from "@/services/auth.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = RegisterCustomerSchema.parse(body);

    const user = await AuthService.registerCustomer(validatedData);

    return NextResponse.json(
      { success: true, data: user, message: "Registration successful" },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to register" },
      { status: 400 }
    );
  }
}
