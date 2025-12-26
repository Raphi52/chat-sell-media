import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/user/library - Get user's purchased and subscription content
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") || "all"; // all, purchased, subscription
    const search = searchParams.get("search") || "";

    // Get user's subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
      include: {
        plan: true,
      },
    });

    const userTier = subscription?.plan?.accessTier || "FREE";
    const tierOrder = ["FREE", "BASIC", "VIP"];
    const userTierIndex = tierOrder.indexOf(userTier);

    // Get purchased media IDs
    const purchases = await prisma.mediaPurchase.findMany({
      where: {
        userId,
        status: "COMPLETED",
      },
      select: {
        mediaId: true,
        createdAt: true,
      },
    });
    const purchasedIds = new Set(purchases.map((p) => p.mediaId));

    let purchasedContent: any[] = [];
    let subscriptionContent: any[] = [];

    // Build search filter
    const searchFilter = search
      ? {
          title: {
            contains: search,
            mode: "insensitive" as const,
          },
        }
      : {};

    // Get purchased content
    if (tab === "all" || tab === "purchased") {
      if (purchases.length > 0) {
        const purchasedMedia = await prisma.mediaContent.findMany({
          where: {
            id: {
              in: Array.from(purchasedIds),
            },
            isPublished: true,
            ...searchFilter,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        purchasedContent = purchasedMedia.map((media) => ({
          id: media.id,
          title: media.title,
          type: media.type.toLowerCase(),
          thumbnail: media.thumbnailUrl || "/placeholder.jpg",
          contentUrl: media.contentUrl,
          accessTier: media.accessTier,
          purchasedAt: purchases.find((p) => p.mediaId === media.id)?.createdAt,
          source: "purchased",
        }));
      }
    }

    // Get subscription-accessible content
    if (tab === "all" || tab === "subscription") {
      if (userTierIndex >= 0) {
        // Get content accessible by subscription tier (excluding already purchased)
        const accessibleTiers = tierOrder.slice(0, userTierIndex + 1);

        const subMedia = await prisma.mediaContent.findMany({
          where: {
            accessTier: {
              in: accessibleTiers as any,
            },
            isPublished: true,
            id: {
              notIn: Array.from(purchasedIds),
            },
            ...searchFilter,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 50,
        });

        subscriptionContent = subMedia.map((media) => ({
          id: media.id,
          title: media.title,
          type: media.type.toLowerCase(),
          thumbnail: media.thumbnailUrl || "/placeholder.jpg",
          contentUrl: media.contentUrl,
          accessTier: media.accessTier,
          source: "subscription",
        }));
      }
    }

    return NextResponse.json({
      purchasedContent,
      subscriptionContent,
      subscription: subscription
        ? {
            planName: subscription.plan.name,
            accessTier: subscription.plan.accessTier,
            canMessage: subscription.plan.canMessage,
          }
        : null,
      stats: {
        purchasedCount: purchasedContent.length,
        subscriptionCount: subscriptionContent.length,
        totalAccessible: purchasedContent.length + subscriptionContent.length,
      },
    });
  } catch (error) {
    console.error("Error fetching library:", error);
    return NextResponse.json(
      { error: "Failed to fetch library" },
      { status: 500 }
    );
  }
}
