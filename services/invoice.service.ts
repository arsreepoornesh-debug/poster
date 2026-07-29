import { prisma } from "@/lib/prisma";

export class InvoiceService {
  public static async generateInvoiceForOrder(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true, items: { include: { poster: true } } },
    });

    if (!order) throw new Error("Order not found");

    const existing = await prisma.invoice.findUnique({ where: { orderId } });
    if (existing) return existing;

    const subtotal = order.totalAmount;
    const taxRate = 0.18; // 18% GST
    const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
    const invoiceNum = `INV-${order.orderNumber.replace("ORD-PSTR-", "")}`;

    return prisma.invoice.create({
      data: {
        orderId: order.id,
        invoiceNumber: invoiceNum,
        subtotal,
        taxAmount,
        shippingFee: order.shippingCharge,
        totalAmount: order.finalAmount,
        issuedAt: new Date(),
      },
    });
  }

  public static async getInvoiceHTML(orderId: string): Promise<string> {
    const invoice = await this.generateInvoiceForOrder(orderId);
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true, items: { include: { poster: true } } },
    });

    if (!order) throw new Error("Order not found");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tax Invoice - ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: sans-serif; font-size: 12px; margin: 40px; color: #333; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #ddd; padding-bottom: 20px; }
          .title { font-size: 20px; font-weight: bold; color: #6366f1; }
          .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .table th { background: #f8fafc; }
          .total { text-align: right; margin-top: 20px; font-size: 14px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">POSTER STORE ENTERPRISE</div>
            <p>GSTIN: 33AAAAA0000A1Z5</p>
            <p>Chennai, Tamil Nadu, India</p>
          </div>
          <div style="text-align: right;">
            <h2>TAX INVOICE</h2>
            <p><strong>Invoice No:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Date:</strong> ${new Date(invoice.issuedAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div style="margin-top: 20px;">
          <h3>Billed To:</h3>
          <p><strong>${order.customer?.name || order.guestName || "Customer"}</strong></p>
          <p>${order.customer?.email || order.guestEmail || "N/A"}</p>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Item Description</th>
              <th>SKU</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item) => `
              <tr>
                <td>${item.poster.title}</td>
                <td>${item.poster.sku || "PSTR"}</td>
                <td>${item.quantity}</td>
                <td>₹${item.unitPrice}</td>
                <td>₹${item.totalPrice}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="total">
          <p>Subtotal: ₹${invoice.subtotal}</p>
          <p>GST (18%): ₹${invoice.taxAmount}</p>
          <p>Shipping: ₹${invoice.shippingFee}</p>
          <p style="font-size: 16px; color: #6366f1;">Grand Total: ₹${invoice.totalAmount}</p>
        </div>
      </body>
      </html>
    `;
  }
}
