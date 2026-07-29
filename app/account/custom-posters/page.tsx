import React from "react";
import { UploadCloud, Plus, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function CustomPostersTrackerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Custom Artwork Requests</h1>
          <p className="text-xs text-muted-foreground mt-1">Track approval status of your high-res artwork uploads (5MB - 50MB).</p>
        </div>
        <Link
          href="/custom-poster"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 shadow-md shadow-brand-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Artwork</span>
        </Link>
      </div>

      <div className="glass-card p-12 rounded-2xl border border-border bg-card text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-brand-500/10 text-brand-600 mx-auto flex items-center justify-center">
          <UploadCloud className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold">No Custom Artwork Uploaded</h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Upload your own high-resolution image or vector file (5 MB to 50 MB) for custom poster printing. You will be able to review admin comments and check status updates here.
        </p>
        <Link
          href="/custom-poster"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 mt-2"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Artwork Now</span>
        </Link>
      </div>
    </div>
  );
}
