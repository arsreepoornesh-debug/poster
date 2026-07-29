import { z } from "zod";
import { OrderStatus } from "@prisma/client";

export const CreateOrderSchema = z.object({
  guestEmail: z.string().email().optional().nullable(),
  guestName: z.string().optional().nullable(),
  shippingAddress: z.object({
    street: z.string().min(3),
    city: z.string().min(2),
    state: z.string().min(2),
    postalCode: z.string().min(3),
    country: z.string().default("India"),
    phone: z.string().optional(),
  }),
  billingAddress: z.object({
    street: z.string().min(3),
    city: z.string().min(2),
    state: z.string().min(2),
    postalCode: z.string().min(3),
    country: z.string().default("India"),
  }).optional(),
  couponCode: z.string().optional().nullable(),
  orderNotes: z.string().optional().nullable(),
});

export const UpdateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  notes: z.string().optional(),
});

export const CreateDeliveryZoneSchema = z.object({
  name: z.string().min(2, "Zone name required"),
  countryCode: z.string().default("IN"),
  regionState: z.string().optional().nullable(),
  postalCodePattern: z.string().optional().nullable(),
  baseShippingFee: z.number().min(0),
  freeShippingMinAmount: z.number().optional().nullable(),
  estimatedDays: z.string().default("3-5 business days"),
  active: z.boolean().default(true),
});

export type CreateOrderDTO = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusDTO = z.infer<typeof UpdateOrderStatusSchema>;
export type CreateDeliveryZoneDTO = z.infer<typeof CreateDeliveryZoneSchema>;
