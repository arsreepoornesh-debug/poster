import { z } from "zod";

export const CreateShippingOptionSchema = z.object({
  name: z.string().min(2, "Shipping option name required"),
  price: z.number().min(0, "Price must be positive"),
  estimatedDays: z.string().default("3-5 business days"),
  deliveryZoneId: z.string().uuid("Invalid delivery zone ID"),
  active: z.boolean().default(true),
});

export type CreateShippingOptionDTO = z.infer<typeof CreateShippingOptionSchema>;
