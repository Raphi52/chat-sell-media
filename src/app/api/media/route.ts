import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - List media
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type");
    const tier = searchParams.get("tier");
    const published = searchParams.get("published");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};

    // Public users can only see published content
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      where.isPublished = true;
    } else if (published !== null) {
      where.isPublished = published === "true";
    }

    if (type) {
      where.type = type;
    }

    if (tier) {
      where.accessTier = tier;
    }

    const [media, total] = await Promise.all([
      prisma.mediaContent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          type: true,
          accessTier: true,
          thumbnailUrl: true,
          previewUrl: true,
          // Only include contentUrl for admins or users who have access
          contentUrl: session?.user?.role === "ADMIN",
          isPurchaseable: true,
          price: true,
          viewCount: true,
          isPublished: true,
          publishedAt: true,
          createdAt: true,
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
    console.error("Get media error:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

// POST - Create new media (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // In production, check for admin role
    // if (session.user.role !== "ADMIN") {
    //   return NextResponse.json(
    //     { error: "Admin access required" },
    //     { status: 403 }
    //   );
    // }

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

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check for duplicate slug
    const existing = await prisma.mediaContent.findUnique({
      where: { slug },
    });

    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const media = await prisma.mediaContent.create({
      data: {
        title,
        slug: finalSlug,
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
