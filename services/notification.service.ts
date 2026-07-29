export interface NotificationPayload {
  recipientEmail: string;
  recipientPhone?: string;
  subject: string;
  message: string;
  metadata?: Record<string, any>;
}

export class NotificationService {
  public static async sendEmail(payload: NotificationPayload): Promise<boolean> {
    // Email Notification Placeholder Service Architecture
    console.log(`[EMAIL_SERVICE] To: ${payload.recipientEmail} | Subject: ${payload.subject}`);
    console.log(`[EMAIL_BODY]: ${payload.message}`);
    return true;
  }

  public static async sendSMS(phone: string, message: string): Promise<boolean> {
    // SMS Notification Placeholder Service Architecture
    console.log(`[SMS_SERVICE] To: ${phone} | Msg: ${message}`);
    return true;
  }

  public static async notifyOrderCreated(orderNumber: string, email: string, amount: number) {
    await this.sendEmail({
      recipientEmail: email,
      subject: `Order Confirmation - ${orderNumber}`,
      message: `Thank you for your order ${orderNumber}! Total amount: ₹${amount}. Your order is currently being prepared.`,
    });
  }

  public static async notifyOrderStatusChanged(orderNumber: string, email: string, newStatus: string) {
    await this.sendEmail({
      recipientEmail: email,
      subject: `Order Status Update - ${orderNumber}`,
      message: `Your order ${orderNumber} status has been updated to: ${newStatus}.`,
    });
  }

  public static async notifyCustomArtworkReview(
    title: string,
    email: string,
    status: "APPROVED" | "REJECTED",
    reason?: string
  ) {
    const subject = status === "APPROVED" ? `Artwork Approved: ${title}` : `Artwork Review Update: ${title}`;
    const message =
      status === "APPROVED"
        ? `Great news! Your custom artwork "${title}" has been approved for printing.`
        : `Your custom artwork "${title}" requires revision. Reason: ${reason || "Does not meet resolution specifications."}`;

    await this.sendEmail({
      recipientEmail: email,
      subject,
      message,
    });
  }
}
