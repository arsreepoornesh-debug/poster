"use client";

import React, { useState } from "react";
import { UploadCloud, Image as ImageIcon, X, Loader2 } from "lucide-react";
import Image from "next/image";

interface ImageUploaderProps {
  value?: string | null;
  onChange: (url: string) => void;
  onRemove?: () => void;
  folder?: string;
  label?: string;
}

export function ImageUploader({
  value,
  onChange,
  onRemove,
  folder = "categories",
  label = "Upload Image",
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }

      onChange(data.url);
    } catch (err: any) {
      alert(err.message || "Failed to upload image to Cloudinary");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-semibold text-foreground">{label}</label>}
      {value ? (
        <div className="relative w-full h-36 rounded-xl overflow-hidden border border-border bg-muted/30 group">
          <Image src={value} alt="Uploaded image" fill className="object-cover" />
          <button
            type="button"
            onClick={onRemove || (() => onChange(""))}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-white opacity-90 hover:opacity-100 transition-opacity shadow-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-brand-500 hover:bg-brand-500/5 transition-all text-xs text-muted-foreground p-4 text-center">
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
              <span>Uploading to Cloudinary...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <UploadCloud className="w-6 h-6 text-brand-600" />
              <span className="font-semibold text-foreground">Click to upload or drag & drop</span>
              <span className="text-[10px] text-muted-foreground">PNG, JPG, WEBP up to 10MB</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            disabled={isUploading}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
