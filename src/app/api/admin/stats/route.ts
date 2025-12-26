import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");
  return !!token?.value;
}

// GET /api/admin/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get creator filter from query params
    const { searchParams } = new URL(request.url);
    const creatorSlug = searchParams.get("creator");

    // Get counts filtered by creator
    const [
      totalUsers,
      activeSubscribers,
      totalMedia,
      totalMessages,
      totalPayments,
      recentPayments,
      topMedia,
    ] = await Promise.all([
      // Total users (subscribers for this creator)
      creatorSlug
        ? prisma.subscription.count({
            where: { creatorSlug, status: "ACTIVE" },
          })
        : prisma.user.count(),

      // Active subscribers for this creator
      prisma.subscription.count({
        where: {
          status: "ACTIVE",
          ...(creatorSlug && { creatorSlug }),
        },
      }),

      // Total media for this creator
      prisma.mediaContent.count({
        where: creatorSlug ? { creatorSlug } : undefined,
      }),

      // Total messages for this creator (via conversations)
      creatorSlug
        ? prisma.message.count({
            where: {
              conversation: { creatorSlug },
            },
          })
        : prisma.message.count(),

      // Sum of completed payments for this creator
      prisma.payment.aggregate({
        where: {
          status: "COMPLETED",
          ...(creatorSlug && { creatorSlug }),
        },
        _sum: { amount: true },
      }),

      // Recent payments for this creator
      prisma.payment.findMany({
        where: {
          status: "COMPLETED",
          ...(creatorSlug && { creatorSlug }),
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      // Top performing media for this creator
      prisma.mediaContent.findMany({
        where: creatorSlug ? { creatorSlug } : undefined,
        orderBy: { viewCount: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          viewCount: true,
          purchaseCount: true,
          price: true,
        },
      }),
    ]);

    // Calculate total revenue
    const totalRevenue = totalPayments._sum.amount
      ? Number(totalPayments._sum.amount)
      : 0;

    return NextResponse.json({
      stats: {
        totalRevenue,
        activeSubscribers,
        totalMedia,
        totalMessages,
        totalUsers,
      },
      recentPayments: recentPayments.map((p) => ({
        id: p.id,
        type: p.type,
        amount: Number(p.amount),
        provider: p.provider,
        createdAt: p.createdAt,
      })),
      topMedia: topMedia.map((m) => ({
        id: m.id,
        title: m.title,
        views: m.viewCount,
        earnings: m.purchaseCount * (m.price ? Number(m.price) : 0),
      })),
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
