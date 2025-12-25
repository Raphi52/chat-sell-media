import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Get single media item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    const media = await prisma.mediaContent.findUnique({
      where: { id },
      include: {
        _count: {
          select: { purchases: true },
        },
      },
    });

    if (!media) {
      return NextResponse.json(
        { error: "Media not found" },
        { status: 404 }
      );
    }

    // Check access for non-admins
    const isAdmin = session?.user?.role === "ADMIN";

    if (!isAdmin && !media.isPublished) {
      return NextResponse.json(
        { error: "Media not found" },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.mediaContent.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    // Check if user has access to content
    let hasAccess = false;
    let hasPurchased = false;

    if (session?.user?.id) {
      // Check if purchased
      const purchase = await prisma.mediaPurchase.findUnique({
        where: {
          userId_mediaId: {
            userId: session.user.id,
            mediaId: id,
          },
        },
      });
      hasPurchased = !!purchase;

      // Check subscription tier
      if (!hasPurchased && media.accessTier !== "FREE") {
        const subscription = await prisma.subscription.findFirst({
          where: {
            userId: session.user.id,
            status: "ACTIVE",
          },
          include: {
            plan: true,
          },
        });

        if (subscription) {
          const tierOrder = ["FREE", "BASIC", "PREMIUM", "VIP"];
          const userTierIndex = tierOrder.indexOf(subscription.plan.accessTier);
          const mediaTierIndex = tierOrder.indexOf(media.accessTier);
          hasAccess = userTierIndex >= mediaTierIndex;
        }
      } else if (media.accessTier === "FREE") {
        hasAccess = true;
      }
    } else if (media.accessTier === "FREE") {
      hasAccess = true;
    }

    // Prepare response
    const response: any = {
      id: media.id,
      title: media.title,
      slug: media.slug,
      description: media.description,
      type: media.type,
      accessTier: media.accessTier,
      thumbnailUrl: media.thumbnailUrl,
      previewUrl: media.previewUrl,
      isPurchaseable: media.isPurchaseable,
      price: media.price,
      viewCount: media.viewCount,
      isPublished: media.isPublished,
      publishedAt: media.publishedAt,
      createdAt: media.createdAt,
      hasAccess: hasAccess || hasPurchased,
      hasPurchased,
    };

    // Include content URL only if user has access or is admin
    if (hasAccess || hasPurchased || isAdmin) {
      response.contentUrl = media.contentUrl;
    }

    // Include purchase count for admins
    if (isAdmin) {
      response.purchaseCount = media._count.purchases;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Get media error:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

// PATCH - Update media (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const media = await prisma.mediaContent.findUnique({
      where: { id },
    });

    if (!media) {
      return NextResponse.json(
        { error: "Media not found" },
        { status: 404 }
      );
    }

    // Update slug if title changed
    let slug = media.slug;
    if (title && title !== media.title) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const existing = await prisma.mediaContent.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      });

      if (existing) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const updatedMedia = await prisma.mediaContent.update({
      where: { id },
      data: {
        title: title ?? media.title,
        slug,
        description: description ?? media.description,
        type: type ?? media.type,
        accessTier: accessTier ?? media.accessTier,
        thumbnailUrl: thumbnailUrl ?? media.thumbnailUrl,
        previewUrl: previewUrl ?? media.previewUrl,
        contentUrl: contentUrl ?? media.contentUrl,
        isPurchaseable: isPurchaseable ?? media.isPurchaseable,
        price: isPurchaseable ? (price ?? media.price) : null,
        isPublished: isPublished ?? media.isPublished,
        publishedAt:
          isPublished && !media.isPublished
            ? new Date()
            : isPublished === false
            ? null
            : media.publishedAt,
      },
    });

    return NextResponse.json({ media: updatedMedia });
  } catch (error) {
    console.error("Update media error:", error);
    return NextResponse.json(
      { error: "Failed to update media" },
      { status: 500 }
    );
  }
}

// DELETE - Delete media (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const media = await prisma.mediaContent.findUnique({
      where: { id },
    });

    if (!media) {
      return NextResponse.json(
        { error: "Media not found" },
        { status: 404 }
      );
    }

    // Delete related records first
    await prisma.mediaPurchase.deleteMany({
      where: { mediaId: id },
    });

    await prisma.messageMedia.deleteMany({
      where: { mediaId: id },
    });

    // Delete media
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
