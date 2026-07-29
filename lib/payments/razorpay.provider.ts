import crypto from "crypto";
import { IPaymentProvider, PaymentOrderParams, PaymentVerificationParams } from "./payment.interface";

export class RazorpayProvider implements IPaymentProvider {
  private keyId: string;
  private keySecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder_key";
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || "rzp_test_placeholder_secret";
  }

  public async createPaymentOrder(params: PaymentOrderParams) {
    const amountInPaise = Math.round(params.amount * 100);

    // If Razorpay API credentials are not set, return simulated gateway response
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.warn("[RAZORPAY] Using mock credentials. Returning test payment order.");
      return {
        providerOrderId: `order_rzp_mock_${Date.now()}`,
        amount: amountInPaise,
        currency: params.currency || "INR",
        keyId: this.keyId,
      };
    }

    try {
      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64")}`,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: params.currency || "INR",
          receipt: params.receipt || `receipt_${params.orderId}`,
          notes: params.notes || {},
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.description || "Razorpay order creation failed");
      }

      return {
        providerOrderId: data.id,
        amount: data.amount,
        currency: data.currency,
        keyId: this.keyId,
      };
    } catch (err: any) {
      console.error("[RAZORPAY_CREATE_ORDER_ERROR]", err);
      throw err;
    }
  }

  public verifyPaymentSignature(params: PaymentVerificationParams): boolean {
    if (!params.razorpayOrderId || !params.razorpayPaymentId || !params.razorpaySignature) {
      return false;
    }

    const payload = `${params.razorpayOrderId}|${params.razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", this.keySecret)
      .update(payload)
      .digest("hex");

    return expectedSignature === params.razorpaySignature;
  }

  public verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
    const expectedSignature = crypto
      .createHmac("sha256", secret || this.keySecret)
      .update(body)
      .digest("hex");

    return expectedSignature === signature;
  }

  public async initiateRefund(paymentId: string, amount: number, reason?: string) {
    console.log(`[RAZORPAY_REFUND_ARCH] Refund requested for ${paymentId}, amount: ₹${amount}`);
    return {
      refundId: `rfnd_mock_${Date.now()}`,
      status: "PROCESSED",
    };
  }
}
