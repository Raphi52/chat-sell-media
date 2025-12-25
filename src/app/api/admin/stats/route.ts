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

    // Get counts
    const [
      totalUsers,
      activeSubscribers,
      totalMedia,
      totalMessages,
      totalPayments,
      recentPayments,
      topMedia,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Active subscribers
      prisma.subscription.count({
        where: { status: "ACTIVE" },
      }),

      // Total media
      prisma.mediaContent.count(),

      // Total messages
      prisma.message.count(),

      // Sum of completed payments
      prisma.payment.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),

      // Recent payments
      prisma.payment.findMany({
        where: { status: "COMPLETED" },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          // Note: Payment doesn't have user relation in current schema
          // We'd need to add it or use a different approach
        },
      }),

      // Top performing media
      prisma.mediaContent.findMany({
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
