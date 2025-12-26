import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import crypto from "crypto";

// POST /api/messages/upload - Upload media for chat messages
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm", "audio/mpeg", "audio/wav"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 });
    }

    // Create upload directory
    const uploadDir = join(process.cwd(), "public", "uploads", "chat");
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const hash = crypto.randomBytes(16).toString("hex");
    const filename = `${hash}.${ext}`;

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const url = `/uploads/chat/${filename}`;
    const mediaType = file.type.startsWith("video") ? "VIDEO" :
                      file.type.startsWith("audio") ? "AUDIO" : "PHOTO";

    return NextResponse.json({
      url,
      previewUrl: mediaType === "VIDEO" ? null : url, // Videos need proper thumbnail generation
      thumbnailUrl: url,
      type: mediaType,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
