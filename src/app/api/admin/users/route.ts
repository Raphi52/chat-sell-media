import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

// Check admin auth
async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");
  return !!token?.value;
}

// GET /api/admin/users - Get all users with their subscriptions
export async function GET(request: NextRequest) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const filter = searchParams.get("filter") || "all"; // all, subscribed, free

    const users = await prisma.user.findMany({
      where: {
        role: "USER",
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { email: { contains: search } },
              ],
            }
          : {}),
      },
      include: {
        subscriptions: {
          where: { status: "ACTIVE" },
          include: { plan: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: {
            mediaPurchases: true,
            messagePurchases: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform and filter users
    let transformedUsers = users.map((user) => {
      const activeSubscription = user.subscriptions[0];
      return {
        id: user.id,
        name: user.name || "Unknown",
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
        subscription: activeSubscription
          ? {
              plan: activeSubscription.plan.name,
              status: activeSubscription.status,
              expiresAt: activeSubscription.currentPeriodEnd,
            }
          : null,
        stats: {
          purchases: user._count.mediaPurchases,
          tips: user._count.messagePurchases,
        },
      };
    });

    // Apply filter
    if (filter === "subscribed") {
      transformedUsers = transformedUsers.filter((u) => u.subscription);
    } else if (filter === "free") {
      transformedUsers = transformedUsers.filter((u) => !u.subscription);
    }

    // Get summary stats
    const totalUsers = users.length;
    const subscribedUsers = transformedUsers.filter((u) => u.subscription).length;
    const freeUsers = totalUsers - subscribedUsers;

    return NextResponse.json({
      users: transformedUsers,
      stats: {
        total: totalUsers,
        subscribed: subscribedUsers,
        free: freeUsers,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
