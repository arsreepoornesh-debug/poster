import { z } from "zod";
import { ContentStatus } from "@prisma/client";

export const CreateCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().optional(),
  description: z.string().optional(),
  animation: z.string({ required_error: "Animation is compulsory" }).optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  bannerUrl: z.string().optional().nullable(),
  iconUrl: z.string().optional().nullable(),
  displayOrder: z.number().int().default(0),
  featured: z.boolean().default(false),
  status: z.nativeEnum(ContentStatus).default(ContentStatus.PUBLISHED),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  seoKeywords: z.string().optional().nullable(),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

export const CreateSubCategorySchema = z.object({
  categoryId: z.string().uuid("Invalid category ID"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  bannerUrl: z.string().optional().nullable(),
  displayOrder: z.number().int().default(0),
  featured: z.boolean().default(false),
  status: z.nativeEnum(ContentStatus).default(ContentStatus.PUBLISHED),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  seoKeywords: z.string().optional().nullable(),
});

export const UpdateSubCategorySchema = CreateSubCategorySchema.partial();

export const CreateCollectionSchema = z.object({
  categoryId: z.string().uuid("Invalid category ID"),
  subCategoryId: z.string().uuid("Invalid subcategory ID"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().optional(),
  description: z.string().optional(),
  coverImageUrl: z.string().optional().nullable(),
  bannerUrl: z.string().optional().nullable(),
  displayOrder: z.number().int().default(0),
  featured: z.boolean().default(false),
  status: z.nativeEnum(ContentStatus).default(ContentStatus.PUBLISHED),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  seoKeywords: z.string().optional().nullable(),
});

export const UpdateCollectionSchema = CreateCollectionSchema.partial();

export const BulkActionSchema = z.object({
  ids: z.array(z.string().uuid()),
  action: z.enum(["delete", "restore", "publish", "archive", "draft"]),
});

export type CreateCategoryDTO = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryDTO = z.infer<typeof UpdateCategorySchema>;
export type CreateSubCategoryDTO = z.infer<typeof CreateSubCategorySchema>;
export type UpdateSubCategoryDTO = z.infer<typeof UpdateSubCategorySchema>;
export type CreateCollectionDTO = z.infer<typeof CreateCollectionSchema>;
export type UpdateCollectionDTO = z.infer<typeof UpdateCollectionSchema>;
export type BulkActionDTO = z.infer<typeof BulkActionSchema>;
