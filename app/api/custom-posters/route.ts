import { NextRequest, NextResponse } from "next/server";
import { CustomPosterRepository } from "@/lib/repositories/custom-poster.repository";
import { CustomPosterService } from "@/services/custom-poster.service";
import { CreateCustomPosterRequestSchema } from "@/lib/dto/custom-poster.dto";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const status = (searchParams.get("status") as any) || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");

    // Restrict customer users to their own custom poster requests
    const customerId = session?.user?.role === "CUSTOMER" ? session.user.id : searchParams.get("customerId") || undefined;

    const result = await CustomPosterRepository.findAll({
      search,
      status,
      customerId,
      page,
      limit,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const formData = await req.formData();

    const file = formData.get("file") as File;
    const artworkTitle = formData.get("artworkTitle") as string;
    const selectedSize = formData.get("selectedSize") as string;
    const quantity = parseInt((formData.get("quantity") as string) || "1");
    const frameRequired = formData.get("frameRequired") === "true";
    const notes = (formData.get("notes") as string) || undefined;
    const referenceLink = (formData.get("referenceLink") as string) || undefined;
    const guestEmail = (formData.get("guestEmail") as string) || undefined;
    const guestName = (formData.get("guestName") as string) || undefined;

    if (!file) {
      return NextResponse.json({ success: false, error: "Artwork file is required" }, { status: 400 });
    }

    const validatedDTO = CreateCustomPosterRequestSchema.parse({
      artworkTitle,
      selectedSize,
      quantity,
      frameRequired,
      notes,
      referenceLink,
      guestEmail,
      guestName,
    });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const item = await CustomPosterService.processAndUploadArtwork(
      buffer,
      file.name,
      file.type,
      file.size,
      validatedDTO,
      session?.user?.id
    );

    return NextResponse.json(
      { success: true, data: item, message: "Custom artwork request submitted successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
