export interface CreateShipmentParams {
  orderId: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  items: Array<{
    name: string;
    sku: string;
    units: number;
    selling_price: number;
  }>;
}

export interface IShippingProvider {
  createShipment(params: CreateShipmentParams): Promise<{
    shipmentId: string;
    orderId: string;
    awbCode?: string;
    courierName?: string;
  }>;

  generateLabel(shipmentId: string): Promise<string>;

  trackShipment(awbCode: string): Promise<{
    status: string;
    currentLocation?: string;
    estimatedDelivery?: string;
  }>;
}
