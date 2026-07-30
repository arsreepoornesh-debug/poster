"use client";

import React, { useState } from "react";
import { UploadCloud, FileCheck, AlertCircle, CheckCircle2, FileText, Info } from "lucide-react";
import Link from "next/link";

export default function CustomPosterUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [artworkTitle, setArtworkTitle] = useState("");
  const [selectedSize, setSelectedSize] = useState("A3 (11.7 x 16.5 in)");
  const [quantity, setQuantity] = useState(1);
  const [frameRequired, setFrameRequired] = useState(false);
  const [notes, setNotes] = useState("");
  const [referenceLink, setReferenceLink] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    setValidationError(null);
    setUploadSuccess(false);

    if (!selected) return;

    // Client-side 5MB - 50MB Size Validation
    const minBytes = 5 * 1024 * 1024; // 5 MB
    const maxBytes = 50 * 1024 * 1024; // 50 MB

    if (selected.size < minBytes) {
      const mb = (selected.size / (1024 * 1024)).toFixed(2);
      setValidationError(`File size (${mb} MB) is too small. Minimum required size for high-resolution print is 5 MB.`);
      setFile(null);
      return;
    }

    if (selected.size > maxBytes) {
      const mb = (selected.size / (1024 * 1024)).toFixed(2);
      setValidationError(`File size (${mb} MB) exceeds maximum limit of 50 MB.`);
      setFile(null);
      return;
    }

    setFile(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setValidationError("Please select an artwork file between 5MB and 50MB.");
      return;
    }

    setIsUploading(true);
    setValidationError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("artworkTitle", artworkTitle);
      formData.append("selectedSize", selectedSize);
      formData.append("quantity", quantity.toString());
      formData.append("frameRequired", frameRequired.toString());
      if (notes) formData.append("notes", notes);
      if (referenceLink) formData.append("referenceLink", referenceLink);
      if (guestEmail) formData.append("guestEmail", guestEmail);
      if (guestName) formData.append("guestName", guestName);

      const res = await fetch("/api/custom-posters", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload artwork");
      }

      setUploadSuccess(true);
      setFile(null);
      setArtworkTitle("");
      setNotes("");
    } catch (err: any) {
      setValidationError(err.message || "Failed to upload custom poster");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 text-xs font-semibold">
          <UploadCloud className="w-4 h-4" />
          <span>High-Resolution Artwork Upload Portal</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Create Your Own Custom Poster</h1>
        <p className="text-xs text-muted-foreground max-w-xl mx-auto">
          Upload your original design or vector artwork (5MB – 50MB). Our admins review every file for print sharpness before processing.
        </p>
      </div>

      {validationError && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {uploadSuccess ? (
        <div className="glass-card p-8 rounded-2xl border border-border bg-card text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold">Artwork Request Submitted!</h2>
          <p className="text-xs text-muted-foreground">
            Our printing admins are reviewing your resolution and file quality. You can track progress in your Customer Dashboard.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/account/custom-posters"
              className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-xs shadow-md shadow-brand-600/20"
            >
              Track Request Status
            </Link>
            <button
              onClick={() => setUploadSuccess(false)}
              className="px-5 py-2.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
            >
              Upload Another File
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 rounded-2xl space-y-6 border border-border bg-card text-xs">
          {/* File Drag Drop Zone */}
          <div className="space-y-2">
            <label className="font-bold text-foreground block">
              Artwork File Upload (Min 5 MB – Max 50 MB) *
            </label>

            <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:border-brand-500 hover:bg-brand-500/5 transition-all p-6 text-center">
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <FileCheck className="w-8 h-8 text-emerald-600" />
                  <span className="font-bold text-foreground text-sm">{file.name}</span>
                  <span className="text-[11px] text-muted-foreground">
                    Size: {(file.size / (1024 * 1024)).toFixed(2)} MB • Type: {file.type || "File"}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <UploadCloud className="w-8 h-8 text-brand-600" />
                  <span className="font-bold text-sm text-foreground">Click or Drag Artwork File Here</span>
                  <span className="text-[11px] text-muted-foreground">
                    Accepted: JPG, JPEG, PNG, WEBP, PDF (Strict 5MB – 50MB)
                  </span>
                </div>
              )}
              <input
                type="file"
                required
                accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>

            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 p-2.5 rounded-lg">
              <Info className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span>Original image resolution is preserved without compression in Cloudinary storage.</span>
            </div>
          </div>

          {/* Title & Size */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold">Artwork Title *</label>
              <input
                type="text"
                required
                value={artworkTitle}
                onChange={(e) => setArtworkTitle(e.target.value)}
                placeholder="e.g. Neo Tokyo Cyberpunk Sunset"
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold">Desired Print Size *</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border focus:ring-2 focus:ring-brand-500"
              >
                <option value="A5 (5.8 x 8.3 in)">A5 (5.8 x 8.3 inches)</option>
                <option value="A4 (8.3 x 11.7 in)">A4 (8.3 x 11.7 inches)</option>
                <option value="A3 (11.7 x 16.5 in)">A3 (11.7 x 16.5 inches)</option>
                <option value="A2 (16.5 x 23.4 in)">A2 (16.5 x 23.4 inches)</option>
                <option value="12x18 inches">12 x 18 inches</option>
                <option value="24x36 inches">24 x 36 inches</option>
                <option value="Custom Size">Custom Dimension</option>
              </select>
            </div>
          </div>

          {/* Quantity & Frame */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold">Quantity *</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border"
              />
            </div>

            <div className="space-y-1.5 flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="frameReq"
                checked={frameRequired}
                onChange={(e) => setFrameRequired(e.target.checked)}
                className="rounded border-border text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="frameReq" className="font-semibold cursor-pointer">
                Include Premium Wood Frame (+₹499)
              </label>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-1.5">
            <label className="font-semibold">Printing Notes / Instructions (Optional)</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Please leave a 1-inch white border margin..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border"
            />
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{isUploading ? "Uploading Artwork (5MB - 50MB)..." : "Submit Custom Poster Request"}</span>
          </button>
        </form>
      )}
    </div>
  );
}
