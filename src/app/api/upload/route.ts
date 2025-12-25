import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";
import crypto from "crypto";

// In production, use S3, Cloudinary, or another cloud storage
// This is a simple local file upload for development

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // In production, check for admin role for media uploads
    // Regular users can only upload chat attachments

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null; // media, chat, avatar

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes: Record<string, string[]> = {
      media: ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm", "audio/mpeg", "audio/wav"],
      chat: ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4"],
      avatar: ["image/jpeg", "image/png", "image/webp"],
    };

    const uploadType = type || "media";
    const allowed = allowedTypes[uploadType] || allowedTypes.media;

    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      );
    }

    // Validate file size (50MB max for media, 10MB for chat, 5MB for avatar)
    const maxSizes: Record<string, number> = {
      media: 50 * 1024 * 1024,
      chat: 10 * 1024 * 1024,
      avatar: 5 * 1024 * 1024,
    };

    const maxSize = maxSizes[uploadType] || maxSizes.media;

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const ext = file.name.split(".").pop();
    const hash = crypto.randomBytes(16).toString("hex");
    const filename = `${hash}.${ext}`;

    // In production, upload to S3/Cloudinary
    // For development, save to public/uploads
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), "public", "uploads", uploadType);
    const filePath = join(uploadDir, filename);

    // Create directory if it doesn't exist
    const { mkdir } = await import("fs/promises");
    await mkdir(uploadDir, { recursive: true });

    await writeFile(filePath, buffer);

    const url = `/uploads/${uploadType}/${filename}`;

    // Generate thumbnail/preview for images and videos
    let thumbnailUrl = null;
    let previewUrl = null;

    if (file.type.startsWith("image/")) {
      // In production, use sharp to generate thumbnails
      thumbnailUrl = url;
      previewUrl = url;
    }

    return NextResponse.json({
      url,
      thumbnailUrl,
      previewUrl,
      filename,
      type: file.type,
      size: file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
