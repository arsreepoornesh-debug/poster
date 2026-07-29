import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/services/payment.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ success: false, error: "Missing required Razorpay parameters" }, { status: 400 });
    }

    await PaymentService.verifyAndCompletePayment(
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      "RAZORPAY"
    );

    return NextResponse.json({
      success: true,
      message: "Payment signature verified and completed successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
