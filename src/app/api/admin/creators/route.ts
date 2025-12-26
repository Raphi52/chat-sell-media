import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import crypto from "crypto";
import prisma from "@/lib/prisma";

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");
  return !!token?.value;
}

// GET /api/admin/creators - Get all creators
export async function GET(request: NextRequest) {
  try {
    const creators = await prisma.creator.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    // Transform for frontend compatibility
    const transformedCreators = creators.map((creator) => ({
      ...creator,
      socialLinks: JSON.parse(creator.socialLinks || "{}"),
      theme: JSON.parse(creator.theme || "{}"),
      stats: {
        photos: creator.photoCount,
        videos: creator.videoCount,
        subscribers: creator.subscriberCount,
      },
    }));

    return NextResponse.json({ creators: transformedCreators });
  } catch (error) {
    console.error("Error fetching creators:", error);
    return NextResponse.json(
      { error: "Failed to fetch creators" },
      { status: 500 }
    );
  }
}

// POST /api/admin/creators - Create new creator
export async function POST(request: NextRequest) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";

    let slug: string;
    let name: string;
    let displayName: string;
    let bio: string | null = null;
    let socialLinks: any = {};
    let avatarUrl: string | null = null;
    let coverImageUrl: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      name = formData.get("name") as string;
      displayName = formData.get("displayName") as string || name;
      slug = (formData.get("slug") as string) || name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
      bio = formData.get("bio") as string | null;

      const instagram = formData.get("instagram") as string;
      const twitter = formData.get("twitter") as string;
      const tiktok = formData.get("tiktok") as string;

      if (instagram || twitter || tiktok) {
        socialLinks = { instagram, twitter, tiktok };
      }

      // Handle avatar upload
      const avatarFile = formData.get("avatar") as File | null;
      if (avatarFile && avatarFile.size > 0) {
        const uploadDir = join(process.cwd(), "public", "uploads", "creators");
        await mkdir(uploadDir, { recursive: true });

        const ext = avatarFile.name.split(".").pop() || "jpg";
        const hash = crypto.randomBytes(8).toString("hex");
        const filename = `${slug}_avatar_${hash}.${ext}`;

        const bytes = await avatarFile.arrayBuffer();
        await writeFile(join(uploadDir, filename), Buffer.from(bytes));
        avatarUrl = `/uploads/creators/${filename}`;
      }

      // Handle cover image upload
      const coverFile = formData.get("coverImage") as File | null;
      if (coverFile && coverFile.size > 0) {
        const uploadDir = join(process.cwd(), "public", "uploads", "creators");
        await mkdir(uploadDir, { recursive: true });

        const ext = coverFile.name.split(".").pop() || "jpg";
        const hash = crypto.randomBytes(8).toString("hex");
        const filename = `${slug}_cover_${hash}.${ext}`;

        const bytes = await coverFile.arrayBuffer();
        await writeFile(join(uploadDir, filename), Buffer.from(bytes));
        coverImageUrl = `/uploads/creators/${filename}`;
      }
    } else {
      const body = await request.json();
      name = body.name;
      displayName = body.displayName || name;
      slug = body.slug || name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
      bio = body.bio;
      socialLinks = body.socialLinks || {};
      avatarUrl = body.avatar;
      coverImageUrl = body.coverImage;
    }

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Check if slug already exists
    const existing = await prisma.creator.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A creator with this slug already exists" },
        { status: 400 }
      );
    }

    const creator = await prisma.creator.create({
      data: {
        slug,
        name,
        displayName,
        bio,
        avatar: avatarUrl,
        coverImage: coverImageUrl,
        socialLinks: JSON.stringify(socialLinks),
        theme: JSON.stringify({}),
      },
    });

    return NextResponse.json({
      creator: {
        ...creator,
        socialLinks: JSON.parse(creator.socialLinks),
        theme: JSON.parse(creator.theme),
        stats: { photos: 0, videos: 0, subscribers: 0 },
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating creator:", error);
    return NextResponse.json(
      { error: "Failed to create creator" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/creators - Update creator
export async function PATCH(request: NextRequest) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";
    let id: string;
    let updateData: any = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      id = formData.get("id") as string;

      const name = formData.get("name") as string;
      const displayName = formData.get("displayName") as string;
      const bio = formData.get("bio") as string;
      const instagram = formData.get("instagram") as string;
      const twitter = formData.get("twitter") as string;
      const tiktok = formData.get("tiktok") as string;

      if (name) updateData.name = name;
      if (displayName) updateData.displayName = displayName;
      if (bio !== undefined) updateData.bio = bio || null;

      if (instagram !== undefined || twitter !== undefined || tiktok !== undefined) {
        updateData.socialLinks = JSON.stringify({ instagram, twitter, tiktok });
      }

      // Get existing creator for slug
      const existing = await prisma.creator.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ error: "Creator not found" }, { status: 404 });
      }

      // Handle avatar upload
      const avatarFile = formData.get("avatar") as File | null;
      if (avatarFile && avatarFile.size > 0) {
        const uploadDir = join(process.cwd(), "public", "uploads", "creators");
        await mkdir(uploadDir, { recursive: true });

        const ext = avatarFile.name.split(".").pop() || "jpg";
        const hash = crypto.randomBytes(8).toString("hex");
        const filename = `${existing.slug}_avatar_${hash}.${ext}`;

        const bytes = await avatarFile.arrayBuffer();
        await writeFile(join(uploadDir, filename), Buffer.from(bytes));
        updateData.avatar = `/uploads/creators/${filename}`;
      }

      // Handle cover image upload
      const coverFile = formData.get("coverImage") as File | null;
      if (coverFile && coverFile.size > 0) {
        const uploadDir = join(process.cwd(), "public", "uploads", "creators");
        await mkdir(uploadDir, { recursive: true });

        const ext = coverFile.name.split(".").pop() || "jpg";
        const hash = crypto.randomBytes(8).toString("hex");
        const filename = `${existing.slug}_cover_${hash}.${ext}`;

        const bytes = await coverFile.arrayBuffer();
        await writeFile(join(uploadDir, filename), Buffer.from(bytes));
        updateData.coverImage = `/uploads/creators/${filename}`;
      }
    } else {
      const body = await request.json();
      id = body.id;

      if (body.name) updateData.name = body.name;
      if (body.displayName) updateData.displayName = body.displayName;
      if (body.bio !== undefined) updateData.bio = body.bio;
      if (body.avatar) updateData.avatar = body.avatar;
      if (body.coverImage) updateData.coverImage = body.coverImage;
      if (body.socialLinks) updateData.socialLinks = JSON.stringify(body.socialLinks);
      if (body.isActive !== undefined) updateData.isActive = body.isActive;
      if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder;
    }

    if (!id) {
      return NextResponse.json({ error: "Creator ID is required" }, { status: 400 });
    }

    const creator = await prisma.creator.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      creator: {
        ...creator,
        socialLinks: JSON.parse(creator.socialLinks),
        theme: JSON.parse(creator.theme),
        stats: {
          photos: creator.photoCount,
          videos: creator.videoCount,
          subscribers: creator.subscriberCount,
        },
      },
    });
  } catch (error) {
    console.error("Error updating creator:", error);
    return NextResponse.json(
      { error: "Failed to update creator" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/creators - Delete creator
export async function DELETE(request: NextRequest) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");
    const deleteMedia = searchParams.get("deleteMedia") === "true";

    if (!id && !slug) {
      return NextResponse.json(
        { error: "Creator ID or slug is required" },
        { status: 400 }
      );
    }

    // Find the creator
    const creator = await prisma.creator.findFirst({
      where: id ? { id } : { slug: slug! },
    });

    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    // Count associated data
    const [mediaCount, conversationCount, paymentCount, subscriptionCount] = await Promise.all([
      prisma.mediaContent.count({ where: { creatorSlug: creator.slug } }),
      prisma.conversation.count({ where: { creatorSlug: creator.slug } }),
      prisma.payment.count({ where: { creatorSlug: creator.slug } }),
      prisma.subscription.count({ where: { creatorSlug: creator.slug } }),
    ]);

    if (deleteMedia) {
      // Delete all associated data
      await prisma.$transaction([
        // Delete media
        prisma.mediaContent.deleteMany({ where: { creatorSlug: creator.slug } }),
        // Delete conversations and messages
        prisma.conversation.deleteMany({ where: { creatorSlug: creator.slug } }),
        // Delete payments
        prisma.payment.deleteMany({ where: { creatorSlug: creator.slug } }),
        // Delete subscriptions
        prisma.subscription.deleteMany({ where: { creatorSlug: creator.slug } }),
        // Delete creator
        prisma.creator.delete({ where: { id: creator.id } }),
      ]);
    } else {
      // Just delete the creator, keep the data
      await prisma.creator.delete({ where: { id: creator.id } });
    }

    return NextResponse.json({
      success: true,
      deleted: {
        creator: creator.slug,
        mediaDeleted: deleteMedia ? mediaCount : 0,
        conversationsDeleted: deleteMedia ? conversationCount : 0,
        paymentsDeleted: deleteMedia ? paymentCount : 0,
        subscriptionsDeleted: deleteMedia ? subscriptionCount : 0,
      },
    });
  } catch (error) {
    console.error("Error deleting creator:", error);
    return NextResponse.json(
      { error: "Failed to delete creator" },
      { status: 500 }
    );
  }
}
