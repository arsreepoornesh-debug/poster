import { prisma } from "@/lib/prisma";
import { CreateDeliveryZoneDTO } from "@/lib/dto/order.dto";

export let mockZones: any[] = [
  {
    id: "zone-1",
    name: "Chennai Local (Metro & Suburbs)",
    countryCode: "IN",
    regionState: "Tamil Nadu",
    postalCodePattern: "600*",
    baseShippingFee: 49,
    freeShippingMinAmount: 999,
    estimatedDays: "1-2 business days",
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "zone-2",
    name: "South India (KA, KL, AP, TS)",
    countryCode: "IN",
    regionState: null,
    postalCodePattern: null,
    baseShippingFee: 79,
    freeShippingMinAmount: 1499,
    estimatedDays: "2-4 business days",
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "zone-3",
    name: "Rest of India",
    countryCode: "IN",
    regionState: null,
    postalCodePattern: null,
    baseShippingFee: 99,
    freeShippingMinAmount: 1999,
    estimatedDays: "3-5 business days",
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export class DeliveryRepository {
  public static async findAll() {
    try {
      return await prisma.deliveryZone.findMany({
        orderBy: { name: "asc" },
      });
    } catch (error) {
      console.warn("[DELIVERY_DB_FALLBACK] Database offline, returning mock delivery zones.");
      return mockZones;
    }
  }

  public static async findById(id: string) {
    try {
      return await prisma.deliveryZone.findUnique({
        where: { id },
      });
    } catch (error) {
      console.warn("[DELIVERY_DB_FALLBACK] Database offline, returning mock delivery zone by id.");
      return mockZones.find(z => z.id === id) || null;
    }
  }

  public static async create(data: CreateDeliveryZoneDTO) {
    try {
      return await prisma.deliveryZone.create({
        data,
      });
    } catch (error) {
      console.warn("[DELIVERY_DB_FALLBACK] Database offline, creating mock delivery zone in memory.");
      const newZone = {
        id: `zone-${Date.now()}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockZones.push(newZone);
      return newZone;
    }
  }

  public static async update(id: string, data: Partial<CreateDeliveryZoneDTO>) {
    try {
      return await prisma.deliveryZone.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.warn("[DELIVERY_DB_FALLBACK] Database offline, updating mock delivery zone in memory.");
      const idx = mockZones.findIndex(z => z.id === id);
      if (idx !== -1) {
        mockZones[idx] = {
          ...mockZones[idx],
          ...data,
          updatedAt: new Date()
        };
        return mockZones[idx];
      }
      throw new Error("Delivery zone not found");
    }
  }

  public static async delete(id: string) {
    try {
      return await prisma.deliveryZone.delete({
        where: { id },
      });
    } catch (error) {
      console.warn("[DELIVERY_DB_FALLBACK] Database offline, deleting mock delivery zone in memory.");
      const idx = mockZones.findIndex(z => z.id === id);
      if (idx !== -1) {
        mockZones.splice(idx, 1);
        return { id };
      }
      throw new Error("Delivery zone not found");
    }
  }

  public static async calculateShippingFee(city: string, totalAmount: number): Promise<number> {
    try {
      const isChennai = city.toLowerCase().trim() === "chennai";
      if (isChennai) {
        const chennaiZone = await prisma.deliveryZone.findFirst({
          where: { name: { contains: "Chennai", mode: "insensitive" }, active: true },
        });
        if (chennaiZone) {
          if (chennaiZone.freeShippingMinAmount && totalAmount >= chennaiZone.freeShippingMinAmount) {
            return 0;
          }
          return chennaiZone.baseShippingFee;
        }
        return 0; // Default Chennai launch free shipping
      }
      return totalAmount >= 999 ? 0 : 75;
    } catch (error) {
      console.warn("[DELIVERY_DB_FALLBACK] Database offline, calculating mock shipping fee.");
      const isChennai = city.toLowerCase().trim() === "chennai";
      if (isChennai) {
        const chennaiZone = mockZones.find(z => z.name.toLowerCase().includes("chennai") && z.active);
        if (chennaiZone) {
          if (chennaiZone.freeShippingMinAmount && totalAmount >= chennaiZone.freeShippingMinAmount) {
            return 0;
          }
          return chennaiZone.baseShippingFee;
        }
        return 0;
      }
      return totalAmount >= 999 ? 0 : 75;
    }
  }
}
