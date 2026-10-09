import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, folder = "hotel/rooms" } = body;

    if (!image) {
      return NextResponse.json({ error: "No image payload provided." }, { status: 400 });
    }

    const result = await uploadToCloudinary(image, folder);

    return NextResponse.json({
      success: true,
      publicId: result.public_id,
      secureUrl: result.secure_url,
      width: result.width,
      height: result.height,
    });
  } catch (error: any) {
    console.error("Cloudinary upload route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image to Cloudinary." },
      { status: 500 }
    );
  }
}
