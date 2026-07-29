import { NextRequest, NextResponse } from "next/server";
import { RazorpayProvider } from "@/lib/payments/razorpay.provider";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-razorpay-signature");
    const rawBody = await req.text();

    if (!signature) {
      return NextResponse.json({ success: false, error: "Missing x-razorpay-signature header" }, { status: 400 });
    }

    const provider = new RazorpayProvider();
    const isValid = provider.verifyWebhookSignature(rawBody, signature, process.env.RAZORPAY_WEBHOOK_SECRET || "");

    if (!isValid) {
      return NextResponse.json({ success: false, error: "Invalid webhook signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    console.log(`[RAZORPAY_WEBHOOK_EVENT] Received event: ${event}`);

    return NextResponse.json({ success: true, message: "Webhook processed" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
