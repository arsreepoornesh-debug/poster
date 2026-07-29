export interface PaymentOrderParams {
  orderId: string;
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface PaymentVerificationParams {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface IPaymentProvider {
  createPaymentOrder(params: PaymentOrderParams): Promise<{
    providerOrderId: string;
    amount: number;
    currency: string;
    keyId: string;
  }>;

  verifyPaymentSignature(params: PaymentVerificationParams): boolean;

  verifyWebhookSignature(body: string, signature: string, secret: string): boolean;

  initiateRefund(paymentId: string, amount: number, reason?: string): Promise<{
    refundId: string;
    status: string;
  }>;
}
