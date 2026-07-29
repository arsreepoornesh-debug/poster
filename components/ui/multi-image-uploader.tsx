"use client";

import React, { useState } from "react";
import { UploadCloud, X, Loader2, Star } from "lucide-react";
import Image from "next/image";

export interface UploadedImageItem {
  url: string;
  thumbnailUrl?: string;
  publicId?: string;
  altText?: string;
  sortOrder?: number;
}

interface MultiImageUploaderProps {
  images: UploadedImageItem[];
  onChange: (images: UploadedImageItem[]) => void;
  folder?: string;
}

export function MultiImageUploader({
  images,
  onChange,
  folder = "posters/gallery",
}: MultiImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newUploaded: UploadedImageItem[] = [...images];

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        formData.append("folder", folder);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.success) {
          newUploaded.push({
            url: data.url,
            thumbnailUrl: data.url,
            publicId: data.publicId,
            sortOrder: newUploaded.length,
          });
        }
      }
      onChange(newUploaded);
    } catch (err: any) {
      alert("Failed to upload image gallery to Cloudinary");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold text-foreground">
        Poster Images Gallery (Drag & Drop or Multi-select)
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {images.map((img, idx) => (
          <div key={idx} className="relative h-32 rounded-xl overflow-hidden border border-border bg-muted group">
            <Image src={img.url} alt={`Gallery image ${idx + 1}`} fill className="object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-destructive text-white opacity-90 hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            {idx === 0 && (
              <span className="absolute bottom-1.5 left-1.5 bg-brand-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                <Star className="w-2.5 h-2.5 fill-white" />
                <span>Primary</span>
              </span>
            )}
          </div>
        ))}

        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-brand-500 hover:bg-brand-500/5 transition-all text-xs text-muted-foreground p-3 text-center">
          {isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
          ) : (
            <>
              <UploadCloud className="w-5 h-5 text-brand-600 mb-1" />
              <span className="font-semibold text-[11px]">Add Images</span>
            </>
          )}
          <input
            type="file"
            multiple
            accept="image/*"
            disabled={isUploading}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}
