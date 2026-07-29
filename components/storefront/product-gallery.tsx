"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ZoomIn } from "lucide-react";

interface ProductGalleryProps {
  images: { url: string; altText?: string | null }[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const defaultImage = images[0]?.url || "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800";
  const [selectedImage, setSelectedImage] = useState(defaultImage);
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-[3/4] max-h-[600px] rounded-2xl overflow-hidden bg-muted border border-border group">
        <Image
          src={selectedImage}
          alt={title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
        <button
          onClick={() => setIsZoomed(true)}
          className="absolute bottom-3 right-3 p-2.5 rounded-full bg-background/80 backdrop-blur-md text-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
          title="Zoom Image"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>

      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(img.url)}
              className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                selectedImage === img.url ? "border-brand-600 ring-2 ring-brand-500/20" : "border-border opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={img.url} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isZoomed && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setIsZoomed(false)}>
          <div className="relative w-full max-w-4xl max-h-[90vh] aspect-[3/4]">
            <Image src={selectedImage} alt={title} fill className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
