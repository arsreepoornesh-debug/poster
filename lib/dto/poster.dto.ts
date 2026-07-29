import { z } from "zod";
import { ContentStatus, PosterOrientation } from "@prisma/client";

export const PosterImageSchema = z.object({
  url: z.string().url("Invalid image URL"),
  thumbnailUrl: z.string().optional().nullable(),
  publicId: z.string().optional().nullable(),
  altText: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
});

export const PosterVariantSchema = z.object({
  sizeName: z.string().min(1, "Size name required"),
  priceAdjustment: z.number().default(0),
  offerPrice: z.number().optional().nullable(),
  stock: z.number().int().default(50),
  weight: z.number().optional().nullable(),
  dimensions: z.string().optional().nullable(),
  frameAvailable: z.boolean().default(true),
  isDefault: z.boolean().default(false),
});

export const CreatePosterSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  slug: z.string().optional(),
  shortDescription: z.string().optional().nullable(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  basePrice: z.number().positive("Base price must be positive"),
  offerPrice: z.number().optional().nullable(),
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  categoryId: z.string().min(1, "Category ID is required"),
  subCategoryId: z.string().min(1, "Subcategory ID is required"),
  collectionId: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  orientation: z.nativeEnum(PosterOrientation).default(PosterOrientation.PORTRAIT),
  colorTheme: z.string().optional().nullable(),
  artist: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  series: z.string().optional().nullable(),
  releaseYear: z.number().int().optional().nullable(),
  frameAvailable: z.boolean().default(true),
  stock: z.number().int().default(50),
  isFeatured: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isNewArrival: z.boolean().default(true),
  status: z.nativeEnum(ContentStatus).default(ContentStatus.PUBLISHED),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  images: z.array(PosterImageSchema).default([]),
  variants: z.array(PosterVariantSchema).default([]),
});

export const UpdatePosterSchema = CreatePosterSchema.partial();

export const BulkPosterActionSchema = z.object({
  ids: z.array(z.string().uuid()),
  action: z.enum(["delete", "publish", "archive", "draft", "feature", "unfeature"]),
  priceAdjustment: z.number().optional(),
  categoryId: z.string().uuid().optional(),
});

export type CreatePosterDTO = z.infer<typeof CreatePosterSchema>;
export type UpdatePosterDTO = z.infer<typeof UpdatePosterSchema>;
export type BulkPosterActionDTO = z.infer<typeof BulkPosterActionSchema>;
