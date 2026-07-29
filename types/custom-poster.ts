import { CustomPosterStatus } from "@prisma/client";

export const CUSTOM_POSTER_FILE_LIMITS = {
  MIN_BYTES: 5 * 1024 * 1024,  // 5 MB
  MAX_BYTES: 50 * 1024 * 1024, // 50 MB
  ALLOWED_MIME_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
  ],
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp", ".pdf"],
};

export interface CustomPosterUploadPayload {
  artworkTitle: string;
  selectedSize: string;
  quantity: number;
  notes?: string;
  guestEmail?: string;
  guestName?: string;
}

export interface CustomPosterFileMetadata {
  originalFileName: string;
  fileType: string;
  fileSize: number;
  width?: number;
  height?: number;
  fileUrl: string;
  previewUrl?: string;
}

export interface CustomPosterUpdateRequest {
  status: CustomPosterStatus;
  adminNotes?: string;
  rejectionReason?: string;
}
