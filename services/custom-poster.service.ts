import { CUSTOM_POSTER_FILE_LIMITS } from "@/types/custom-poster";
import { uploadToCloudinary, getPreviewUrl } from "@/lib/cloudinary";
import { CustomPosterRepository } from "@/lib/repositories/custom-poster.repository";
import { CreateCustomPosterRequestDTO, ReviewCustomPosterDTO } from "@/lib/dto/custom-poster.dto";
import { NotificationService } from "@/services/notification.service";
import { CustomPosterStatus } from "@prisma/client";

export class CustomPosterService {
  public static validateFile(fileSize: number, mimeType: string, fileName: string) {
    // 1. File Size Validation: Minimum 5MB, Maximum 50MB
    if (fileSize < CUSTOM_POSTER_FILE_LIMITS.MIN_BYTES) {
      const currentMb = (fileSize / (1024 * 1024)).toFixed(2);
      throw new Error(
        `File size (${currentMb} MB) is too small. Minimum required size for high-resolution printing is 5 MB.`
      );
    }

    if (fileSize > CUSTOM_POSTER_FILE_LIMITS.MAX_BYTES) {
      const currentMb = (fileSize / (1024 * 1024)).toFixed(2);
      throw new Error(
        `File size (${currentMb} MB) exceeds maximum allowed limit of 50 MB.`
      );
    }

    // 2. Mime Type / Extension Check
    const ext = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
    const isAllowedExt = CUSTOM_POSTER_FILE_LIMITS.ALLOWED_EXTENSIONS.includes(ext);
    const isAllowedMime = CUSTOM_POSTER_FILE_LIMITS.ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase());

    if (!isAllowedExt && !isAllowedMime) {
      throw new Error(
        `Unsupported file type '${ext}'. Accepted types are JPG, JPEG, PNG, WEBP, and PDF.`
      );
    }
  }

  public static async processAndUploadArtwork(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    fileSize: number,
    dto: CreateCustomPosterRequestDTO,
    customerId?: string
  ) {
    // 1. Validate 5MB - 50MB limits
    this.validateFile(fileSize, mimeType, fileName);

    // 2. Determine Cloudinary upload resource type (image or raw for PDF)
    const resourceType = mimeType === "application/pdf" ? "raw" : "image";

    // 3. Upload high-resolution file to Cloudinary without compression
    const uploadResult = await uploadToCloudinary(buffer, "custom_artwork_originals", resourceType);

    // 4. Generate web preview thumbnail
    const previewUrl = resourceType === "image"
      ? getPreviewUrl(uploadResult.publicId, 800, 1000)
      : uploadResult.secureUrl;

    const thumbnailUrl = resourceType === "image"
      ? getPreviewUrl(uploadResult.publicId, 300, 400)
      : uploadResult.secureUrl;

    // 5. Save metadata in database
    const requestItem = await CustomPosterRepository.create({
      ...dto,
      fileUrl: uploadResult.secureUrl,
      previewUrl,
      thumbnailUrl,
      originalFileName: fileName,
      fileType: mimeType,
      fileSize,
      width: uploadResult.width,
      height: uploadResult.height,
      customerId,
    });

    return requestItem;
  }

  public static async reviewArtwork(
    id: string,
    dto: ReviewCustomPosterDTO,
    reviewerId?: string
  ) {
    const updated = await CustomPosterRepository.updateReviewStatus(id, dto, reviewerId);

    // Send notification if email exists
    const email = updated.customer?.email || updated.guestEmail;
    if (email && (dto.status === CustomPosterStatus.APPROVED || dto.status === CustomPosterStatus.REJECTED)) {
      await NotificationService.notifyCustomArtworkReview(
        updated.artworkTitle,
        email,
        dto.status === CustomPosterStatus.APPROVED ? "APPROVED" : "REJECTED",
        dto.rejectionReason || dto.adminNotes
      );
    }

    return updated;
  }
}
