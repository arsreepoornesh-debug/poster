import { slugify } from "@/lib/utils";
import { PosterRepository } from "@/lib/repositories/poster.repository";
import { CreatePosterDTO, UpdatePosterDTO } from "@/lib/dto/poster.dto";

export class PosterService {
  public static generateSKU(title: string): string {
    const prefix = title.substring(0, 3).toUpperCase();
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    return `PSTR-${prefix}-${randomHex}`;
  }

  public static async createPoster(dto: CreatePosterDTO, userId?: string) {
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.title);
    const existing = await PosterRepository.findBySlug(slug);

    if (existing) {
      throw new Error(`Poster with slug '${slug}' already exists`);
    }

    const sku = dto.sku || this.generateSKU(dto.title);

    // Default sizes if none provided
    const variants = dto.variants && dto.variants.length > 0
      ? dto.variants
      : [
          { sizeName: "A4 (8.3 x 11.7 in)", priceAdjustment: 0, stock: 50, isDefault: true, frameAvailable: true },
          { sizeName: "A3 (11.7 x 16.5 in)", priceAdjustment: 200, stock: 50, isDefault: false, frameAvailable: true },
          { sizeName: "A2 (16.5 x 23.4 in)", priceAdjustment: 500, stock: 30, isDefault: false, frameAvailable: true },
          { sizeName: "12x18 inches", priceAdjustment: 250, stock: 40, isDefault: false, frameAvailable: true },
          { sizeName: "24x36 inches", priceAdjustment: 800, stock: 25, isDefault: false, frameAvailable: true },
        ];

    return PosterRepository.create({
      ...dto,
      slug,
      sku,
      variants,
      createdBy: userId,
    });
  }

  public static async updatePoster(id: string, dto: UpdatePosterDTO, userId?: string) {
    const poster = await PosterRepository.findById(id);
    if (!poster) {
      throw new Error("Poster not found");
    }

    let slug = dto.slug;
    if (dto.title && !dto.slug) {
      slug = slugify(dto.title);
    } else if (dto.slug) {
      slug = slugify(dto.slug);
    }

    if (slug && slug !== poster.slug) {
      const existing = await PosterRepository.findBySlug(slug);
      if (existing && existing.id !== id) {
        throw new Error(`Poster with slug '${slug}' already exists`);
      }
    }

    return PosterRepository.update(id, {
      ...dto,
      ...(slug ? { slug } : {}),
      updatedBy: userId,
    });
  }

  public static async duplicatePoster(id: string, userId?: string) {
    const poster = await PosterRepository.findById(id);
    if (!poster) {
      throw new Error("Poster to duplicate not found");
    }

    const newTitle = `${poster.title} (Copy)`;
    const newSlug = `${poster.slug}-copy-${Date.now()}`;
    const newSKU = this.generateSKU(newTitle);

    return PosterRepository.create({
      title: newTitle,
      slug: newSlug,
      shortDescription: poster.shortDescription,
      description: poster.description,
      basePrice: poster.basePrice,
      offerPrice: poster.offerPrice,
      sku: newSKU,
      barcode: poster.barcode,
      categoryId: poster.categoryId,
      subCategoryId: poster.subCategoryId,
      collectionId: poster.collectionId,
      tags: poster.tags,
      orientation: poster.orientation,
      colorTheme: poster.colorTheme,
      artist: poster.artist,
      brand: poster.brand,
      series: poster.series,
      releaseYear: poster.releaseYear,
      frameAvailable: poster.frameAvailable,
      stock: poster.stock,
      isFeatured: false,
      isTrending: false,
      isBestSeller: false,
      isNewArrival: true,
      status: "DRAFT",
      metaTitle: poster.metaTitle,
      metaDescription: poster.metaDescription,
      images: poster.images.map((img: any) => ({
        url: img.url,
        thumbnailUrl: img.thumbnailUrl,
        publicId: img.publicId,
        altText: img.altText,
        sortOrder: img.sortOrder,
      })),
      variants: poster.variants.map((v: any) => ({
        sizeName: v.sizeName,
        priceAdjustment: v.priceAdjustment,
        offerPrice: v.offerPrice,
        stock: v.stock,
        weight: v.weight,
        dimensions: v.dimensions,
        frameAvailable: v.frameAvailable,
        isDefault: v.isDefault,
      })),
      createdBy: userId,
    });
  }

  public static async deletePoster(id: string, userId?: string) {
    return PosterRepository.softDelete(id, userId);
  }
}
