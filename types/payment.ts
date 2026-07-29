export type PaymentGatewayType = "RAZORPAY" | "STRIPE" | "PAYPAL" | "UPI" | "OFFLINE_STUB";

export interface PaymentInitializationParams {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}

export interface PaymentInitializationResult {
  success: boolean;
  gateway: PaymentGatewayType;
  transactionId: string;
  checkoutPayload: Record<string, any>;
  message?: string;
}

export interface PaymentVerificationParams {
  orderId: string;
  transactionId: string;
  signature?: string;
  gatewayData: Record<string, any>;
}

export interface PaymentVerificationResult {
  success: boolean;
  paymentId: string;
  status: "PAID" | "FAILED" | "PENDING";
  message?: string;
}

export interface IPaymentProvider {
  readonly gatewayName: PaymentGatewayType;
  initializePayment(params: PaymentInitializationParams): Promise<PaymentInitializationResult>;
  verifyPayment(params: PaymentVerificationParams): Promise<PaymentVerificationResult>;
}
