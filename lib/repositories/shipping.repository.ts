import { prisma } from "@/lib/prisma";
import { CreateShippingOptionDTO } from "@/lib/dto/shipping.dto";
import { mockZones } from "./delivery.repository";

export let mockShippingOptions: any[] = [
  // Chennai options
  {
    id: "so-1",
    name: "Standard Delivery",
    price: 30,
    estimatedDays: "2-3 business days",
    deliveryZoneId: "zone-1",
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "so-2",
    name: "Express Delivery (Same-Day / Next-Day)",
    price: 70,
    estimatedDays: "1 business day",
    deliveryZoneId: "zone-1",
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // South India options
  {
    id: "so-3",
    name: "Standard Ground Shipping",
    price: 60,
    estimatedDays: "3-4 business days",
    deliveryZoneId: "zone-2",
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "so-4",
    name: "Air Express Shipping",
    price: 120,
    estimatedDays: "2 business days",
    deliveryZoneId: "zone-2",
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Rest of India options
  {
    id: "so-5",
    name: "Standard National Delivery",
    price: 90,
    estimatedDays: "4-6 business days",
    deliveryZoneId: "zone-3",
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "so-6",
    name: "Express National Air Delivery",
    price: 180,
    estimatedDays: "2-3 business days",
    deliveryZoneId: "zone-3",
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export class ShippingRepository {
  public static async findAll() {
    try {
      return await prisma.shippingOption.findMany({
        include: { deliveryZone: true },
        orderBy: { price: "asc" },
      });
    } catch (error) {
      console.warn("[SHIPPING_DB_FALLBACK] Database offline, returning mock shipping options.");
      // Map to include mock zone object
      return mockShippingOptions.map((so) => ({
        ...so,
        deliveryZone: mockZones.find((z) => z.id === so.deliveryZoneId) || null,
      }));
    }
  }

  public static async findByZoneId(zoneId: string) {
    try {
      return await prisma.shippingOption.findMany({
        where: { deliveryZoneId: zoneId, active: true },
        orderBy: { price: "asc" },
      });
    } catch (error) {
      console.warn("[SHIPPING_DB_FALLBACK] Database offline, returning mock shipping options by zone ID.");
      return mockShippingOptions.filter((so) => so.deliveryZoneId === zoneId && so.active);
    }
  }

  public static async findById(id: string) {
    try {
      return await prisma.shippingOption.findUnique({
        where: { id },
        include: { deliveryZone: true },
      });
    } catch (error) {
      console.warn("[SHIPPING_DB_FALLBACK] Database offline, finding mock shipping option by ID.");
      const so = mockShippingOptions.find((o) => o.id === id);
      if (!so) return null;
      return {
        ...so,
        deliveryZone: mockZones.find((z) => z.id === so.deliveryZoneId) || null,
      };
    }
  }

  public static async create(data: CreateShippingOptionDTO) {
    try {
      return await prisma.shippingOption.create({
        data,
      });
    } catch (error) {
      console.warn("[SHIPPING_DB_FALLBACK] Database offline, creating mock shipping option in memory.");
      const newOption = {
        id: `so-${Date.now()}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockShippingOptions.push(newOption);
      return newOption;
    }
  }

  public static async update(id: string, data: Partial<CreateShippingOptionDTO>) {
    try {
      return await prisma.shippingOption.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.warn("[SHIPPING_DB_FALLBACK] Database offline, updating mock shipping option in memory.");
      const idx = mockShippingOptions.findIndex((so) => so.id === id);
      if (idx !== -1) {
        mockShippingOptions[idx] = {
          ...mockShippingOptions[idx],
          ...data,
          updatedAt: new Date(),
        };
        return mockShippingOptions[idx];
      }
      throw new Error("Shipping option not found");
    }
  }

  public static async delete(id: string) {
    try {
      return await prisma.shippingOption.delete({
        where: { id },
      });
    } catch (error) {
      console.warn("[SHIPPING_DB_FALLBACK] Database offline, deleting mock shipping option in memory.");
      const idx = mockShippingOptions.findIndex((so) => so.id === id);
      if (idx !== -1) {
        mockShippingOptions.splice(idx, 1);
        return { id };
      }
      throw new Error("Shipping option not found");
    }
  }
}
