import { NextRequest, NextResponse } from "next/server";
import { uploadToSupabaseStorage } from "@/lib/supabase-storage";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "posters";

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const isConfigured = supabaseUrl && supabaseKey && 
                         !supabaseUrl.includes("placeholder") && 
                         supabaseKey !== "placeholder";

    if (isConfigured) {
      try {
        const result = await uploadToSupabaseStorage(
          buffer,
          file.name,
          folder,
          file.type || "image/jpeg"
        );

        return NextResponse.json({
          success: true,
          url: result.publicUrl,
          path: result.path,
        });
      } catch (uploadError: any) {
        console.warn("Supabase upload failed, falling back to Base64 data URL:", uploadError);
      }
    }

    // Fallback: Convert to Base64 data URL
    const base64 = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      path: `local-base64/${Date.now()}-${file.name}`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
