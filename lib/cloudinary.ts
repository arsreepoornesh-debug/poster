import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo_cloud",
  api_key: process.env.CLOUDINARY_API_KEY || "1234567890",
  api_secret: process.env.CLOUDINARY_API_SECRET || "demo_secret",
  secure: true,
});

export interface CloudinaryUploadResult {
  publicId: string;
  secureUrl: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
}

export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string = "posters",
  resourceType: "image" | "raw" | "auto" = "auto"
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `poster_ecommerce/${folder}`,
        resource_type: resourceType,
        quality: "auto:best",
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary upload failed"));
        }
        resolve({
          publicId: result.public_id,
          secureUrl: result.secure_url,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

export function getPreviewUrl(publicId: string, width = 600, height = 800): string {
  if (!publicId) return "";
  return cloudinary.url(publicId, {
    width,
    height,
    crop: "fill",
    quality: "auto",
    format: "webp",
  });
}

export default cloudinary;
