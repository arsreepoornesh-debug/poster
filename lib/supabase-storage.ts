import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Only create client if env vars are set
const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export interface StorageUploadResult {
  publicUrl: string;
  path: string;
}

export async function uploadToSupabaseStorage(
  buffer: Buffer,
  fileName: string,
  folder: string = "posters",
  mimeType: string = "image/jpeg"
): Promise<StorageUploadResult> {
  if (!supabaseAdmin) {
    throw new Error(
      "Supabase Storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables. " +
      "Also ensure a 'poster-images' bucket exists in your Supabase Storage dashboard."
    );
  }

  const BUCKET = "poster-images";
  const filePath = `${folder}/${Date.now()}-${fileName.replace(/\s+/g, "-")}`;

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(filePath, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    if (error.message?.includes("bucket") || error.message?.includes("not found")) {
      throw new Error(
        `Supabase Storage bucket '${BUCKET}' does not exist. ` +
        `Please create it in your Supabase dashboard: Storage → New Bucket → name it '${BUCKET}' (public bucket).`
      );
    }
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  const { data: urlData } = supabaseAdmin.storage
    .from(BUCKET)
    .getPublicUrl(filePath);

  return {
    publicUrl: urlData.publicUrl,
    path: filePath,
  };
}
