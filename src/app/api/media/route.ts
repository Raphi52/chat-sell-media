import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { spawn } from "child_process";

// Get ffmpeg/ffprobe paths
function getFfmpegPath(): string {
  // Check node_modules for ffmpeg-static
  const staticPath = join(process.cwd(), "node_modules", "ffmpeg-static", "ffmpeg.exe");
  if (existsSync(staticPath)) {
    return staticPath;
  }
  // Fallback to system ffmpeg
  return "ffmpeg";
}

function getFfprobePath(): string {
  // Check node_modules for ffprobe-static
  const staticPath = join(process.cwd(), "node_modules", "ffprobe-static", "bin", "win32", "x64", "ffprobe.exe");
  if (existsSync(staticPath)) {
    return staticPath;
  }
  // Fallback to system ffprobe
  return "ffprobe";
}

// Generate video thumbnail using ffmpeg
async function generateVideoThumbnail(
  videoPath: string,
  thumbnailPath: string
): Promise<boolean> {
  return new Promise((resolve) => {
    const ffmpegPath = getFfmpegPath();
    console.log("Using ffmpeg at:", ffmpegPath);

    const args = [
      "-i", videoPath,
      "-ss", "00:00:01",
      "-vframes", "1",
      "-vf", "scale=640:-1",
      "-y",
      thumbnailPath,
    ];

    const proc = spawn(ffmpegPath, args);

    proc.stderr.on("data", (data) => {
      console.log("ffmpeg:", data.toString());
    });

    proc.on("close", (code) => {
      console.log("ffmpeg exited with code:", code);
      resolve(code === 0);
    });

    proc.on("error", (err) => {
      console.error("Thumbnail generation error:", err);
      resolve(false);
    });
  });
}

// Get video duration in seconds using ffprobe
async function getVideoDuration(videoPath: string): Promise<number> {
  return new Promise((resolve) => {
    const ffprobePath = getFfprobePath();
    console.log("Using ffprobe at:", ffprobePath);

    const args = [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      videoPath,
    ];

    const proc = spawn(ffprobePath, args);
    let output = "";

    proc.stdout.on("data", (data) => {
      output += data.toString();
    });

    proc.on("close", () => {
      const duration = parseFloat(output.trim());
      console.log("Video duration:", duration);
      resolve(isNaN(duration) ? 0 : Math.round(duration));
    });

    proc.on("error", (err) => {
      console.error("ffprobe error:", err);
      resolve(0);
    });
  });
}

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");
  return !!token?.value;
}

// GET /api/media - Get all media
export async function GET(request: NextRequest) {
  try {
    const admin = await isAdmin();
    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type");
    const tier = searchParams.get("tier");
    const search = searchParams.get("search");
    const published = searchParams.get("published");
    const creatorSlug = searchParams.get("creator");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {};

    // Filter by creator
    if (creatorSlug) {
      where.creatorSlug = creatorSlug;
    }

    // Public users can only see published content
    if (!admin) {
      where.isPublished = true;
    } else if (published !== null) {
      where.isPublished = published === "true";
    }

    if (type && type !== "all") {
      where.type = type;
    }

    if (tier && tier !== "all") {
      where.accessTier = tier;
    }

    if (search) {
      where.title = {
        contains: search,
        mode: "insensitive",
      };
    }

    const [media, total] = await Promise.all([
      prisma.mediaContent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: true,
        },
      }),
      prisma.mediaContent.count({ where }),
    ]);

    return NextResponse.json({
      media,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

// POST /api/media - Create new media with file upload
export async function POST(request: NextRequest) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";

    // Handle FormData upload
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      const title = formData.get("title") as string;
      const description = formData.get("description") as string | null;
      const type = formData.get("type") as string || "PHOTO";
      const accessTier = formData.get("accessTier") as string || "FREE";
      const isPurchaseable = formData.get("isPurchaseable") === "true";
      const price = formData.get("price") as string | null;
      const isPublished = formData.get("isPublished") !== "false";
      const creatorSlug = formData.get("creatorSlug") as string || "miacosta";
      const files = formData.getAll("files") as File[];

      if (!title) {
        return NextResponse.json({ error: "Title is required" }, { status: 400 });
      }

      if (!files || files.length === 0) {
        return NextResponse.json({ error: "No files provided" }, { status: 400 });
      }

      // Create upload directory
      const uploadDir = join(process.cwd(), "public", "uploads", "media");
      await mkdir(uploadDir, { recursive: true });

      // Process first file (main content)
      const file = files[0];
      const ext = file.name.split(".").pop() || "jpg";
      const hash = crypto.randomBytes(16).toString("hex");
      const filename = `${hash}.${ext}`;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = join(uploadDir, filename);
      await writeFile(filePath, buffer);

      const contentUrl = `/uploads/media/${filename}`;
      let thumbnailUrl = contentUrl;
      let duration: number | null = null;

      // Generate thumbnail for videos
      if (type === "VIDEO") {
        const thumbFilename = `${hash}_thumb.jpg`;
        const thumbPath = join(uploadDir, thumbFilename);

        // Get video duration
        duration = await getVideoDuration(filePath);

        // Generate thumbnail at 1 second mark
        const success = await generateVideoThumbnail(filePath, thumbPath);
        if (success) {
          thumbnailUrl = `/uploads/media/${thumbFilename}`;
        }
      }

      // Generate slug from title
      const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const uniqueSlug = `${baseSlug}-${crypto.randomBytes(4).toString("hex")}`;

      // Create media entry
      const media = await prisma.mediaContent.create({
        data: {
          title,
          slug: uniqueSlug,
          description: description || null,
          type: type as any,
          accessTier: accessTier as any,
          isPurchaseable,
          price: isPurchaseable && price ? parseFloat(price) : null,
          isPublished,
          publishedAt: isPublished ? new Date() : null,
          thumbnailUrl,
          previewUrl: thumbnailUrl,
          contentUrl,
          fileSize: file.size,
          mimeType: file.type,
          duration,
          creatorSlug,
        },
      });

      return NextResponse.json({ media }, { status: 201 });
    }

    // Handle JSON body (for updates without file)
    const body = await request.json();
    const {
      title,
      description,
      type,
      accessTier,
      thumbnailUrl,
      previewUrl,
      contentUrl,
      isPurchaseable,
      price,
      isPublished,
    } = body;

    if (!title || !type || !accessTier || !contentUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const uniqueSlug = `${baseSlug}-${crypto.randomBytes(4).toString("hex")}`;

    const media = await prisma.mediaContent.create({
      data: {
        title,
        slug: uniqueSlug,
        description,
        type,
        accessTier,
        thumbnailUrl,
        previewUrl,
        contentUrl,
        isPurchaseable: isPurchaseable || false,
        price: isPurchaseable ? price : null,
        isPublished: isPublished || false,
        publishedAt: isPublished ? new Date() : null,
      },
    });

    return NextResponse.json({ media }, { status: 201 });
  } catch (error) {
    console.error("Create media error:", error);
    return NextResponse.json(
      { error: "Failed to create media" },
      { status: 500 }
    );
  }
}

// DELETE /api/media - Delete media
export async function DELETE(request: NextRequest) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Media ID required" }, { status: 400 });
    }

    await prisma.mediaContent.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete media error:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}

// PATCH /api/media - Update media
export async function PATCH(request: NextRequest) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Media ID required" }, { status: 400 });
    }

    // Handle publish/unpublish
    if (updateData.isPublished !== undefined) {
      updateData.publishedAt = updateData.isPublished ? new Date() : null;
    }

    const media = await prisma.mediaContent.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ media });
  } catch (error) {
    console.error("Update media error:", error);
    return NextResponse.json(
      { error: "Failed to update media" },
      { status: 500 }
    );
  }
}
