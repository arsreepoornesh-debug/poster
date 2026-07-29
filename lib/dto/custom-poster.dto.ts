import { z } from "zod";
import { CustomPosterStatus } from "@prisma/client";
import { CUSTOM_POSTER_FILE_LIMITS } from "@/types/custom-poster";

export const CreateCustomPosterRequestSchema = z.object({
  artworkTitle: z.string().min(2, "Artwork title must be at least 2 characters"),
  selectedSize: z.string().min(1, "Please select a poster size"),
  quantity: z.number().int().min(1).default(1),
  frameRequired: z.boolean().default(false),
  notes: z.string().optional().nullable(),
  customerNotes: z.string().optional().nullable(),
  referenceLink: z.string().url().optional().nullable().or(z.literal("")),
  guestEmail: z.string().email().optional().nullable(),
  guestName: z.string().optional().nullable(),
});

export const ReviewCustomPosterSchema = z.object({
  status: z.nativeEnum(CustomPosterStatus),
  adminNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export type CreateCustomPosterRequestDTO = z.infer<typeof CreateCustomPosterRequestSchema>;
export type ReviewCustomPosterDTO = z.infer<typeof ReviewCustomPosterSchema>;
