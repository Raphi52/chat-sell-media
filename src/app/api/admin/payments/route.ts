import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

// Check admin auth
async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");
  return !!token?.value;
}

// GET /api/admin/payments - Get all payments
export async function GET(request: NextRequest) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";
    const type = searchParams.get("type") || "all";

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    switch (period) {
      case "7d":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(startDate.getDate() - 90);
        break;
      case "all":
        startDate = new Date(0);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Get payments from Payment model
    const payments = await prisma.payment.findMany({
      where: {
        createdAt: { gte: startDate },
        status: "COMPLETED",
        ...(type !== "all" ? { type } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    // Get subscriptions payments
    const subscriptions = await prisma.subscription.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { in: ["ACTIVE", "CANCELED"] },
      },
      include: {
        user: { select: { name: true, email: true } },
        plan: { select: { name: true, monthlyPrice: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get media purchases
    const mediaPurchases = await prisma.mediaPurchase.findMany({
      where: {
        createdAt: { gte: startDate },
        status: "COMPLETED",
      },
      include: {
        user: { select: { name: true, email: true } },
        media: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get message payments (PPV & tips)
    const messagePurchases = await prisma.messagePayment.findMany({
      where: {
        createdAt: { gte: startDate },
        status: "COMPLETED",
      },
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform all to unified format
    const allPayments = [
      ...subscriptions.map((s) => ({
        id: s.id,
        type: "SUBSCRIPTION" as const,
        amount: s.plan.monthlyPrice,
        currency: "USD",
        status: s.status,
        user: s.user.name || s.user.email,
        description: `${s.plan.name} subscription`,
        createdAt: s.createdAt,
      })),
      ...mediaPurchases.map((p) => ({
        id: p.id,
        type: "MEDIA_PURCHASE" as const,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        user: p.user.name || p.user.email,
        description: p.media.title,
        createdAt: p.createdAt,
      })),
      ...messagePurchases.map((p) => ({
        id: p.id,
        type: p.type as "PPV_UNLOCK" | "TIP",
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        user: p.user.name || p.user.email,
        description: p.type === "TIP" ? "Tip" : "PPV Unlock",
        createdAt: p.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Filter by type if specified
    const filteredPayments =
      type === "all"
        ? allPayments
        : allPayments.filter((p) => p.type === type);

    // Calculate stats
    const totalRevenue = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
    const subscriptionRevenue = allPayments
      .filter((p) => p.type === "SUBSCRIPTION")
      .reduce((sum, p) => sum + p.amount, 0);
    const mediaRevenue = allPayments
      .filter((p) => p.type === "MEDIA_PURCHASE")
      .reduce((sum, p) => sum + p.amount, 0);
    const tipsRevenue = allPayments
      .filter((p) => p.type === "TIP")
      .reduce((sum, p) => sum + p.amount, 0);
    const ppvRevenue = allPayments
      .filter((p) => p.type === "PPV_UNLOCK")
      .reduce((sum, p) => sum + p.amount, 0);

    // Revenue by day for chart
    const revenueByDay: Record<string, number> = {};
    filteredPayments.forEach((p) => {
      const day = new Date(p.createdAt).toISOString().split("T")[0];
      revenueByDay[day] = (revenueByDay[day] || 0) + p.amount;
    });

    const chartData = Object.entries(revenueByDay)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, amount]) => ({ date, amount }));

    return NextResponse.json({
      payments: filteredPayments,
      stats: {
        totalRevenue,
        subscriptionRevenue,
        mediaRevenue,
        tipsRevenue,
        ppvRevenue,
        totalTransactions: filteredPayments.length,
      },
      chartData,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
