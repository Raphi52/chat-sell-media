import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  stripe,
  getOrCreateStripeCustomer,
  createSubscriptionCheckout,
  createPaymentCheckout,
  SUBSCRIPTION_PLANS,
} from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { type, planId, billingInterval, mediaId } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, stripeCustomerId: true },
    });

    if (!user?.email) {
      return NextResponse.json(
        { error: "User email required" },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(user.id, user.email);

    if (type === "subscription") {
      // Subscription checkout
      const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];
      if (!plan) {
        return NextResponse.json(
          { error: "Invalid plan" },
          { status: 400 }
        );
      }

      // Get price ID from database or environment
      const priceId = billingInterval === "ANNUAL"
        ? process.env[`STRIPE_PRICE_${planId}_ANNUAL`]
        : process.env[`STRIPE_PRICE_${planId}_MONTHLY`];

      if (!priceId) {
        return NextResponse.json(
          { error: "Price not configured for this plan" },
          { status: 500 }
        );
      }

      const checkoutSession = await createSubscriptionCheckout(
        customerId,
        priceId,
        user.id,
        planId,
        billingInterval
      );

      return NextResponse.json({ url: checkoutSession.url });
    } else if (type === "media") {
      // One-time media purchase
      if (!mediaId) {
        return NextResponse.json(
          { error: "Media ID required" },
          { status: 400 }
        );
      }

      const media = await prisma.mediaContent.findUnique({
        where: { id: mediaId },
      });

      if (!media || !media.isPurchaseable || !media.price) {
        return NextResponse.json(
          { error: "Media not available for purchase" },
          { status: 400 }
        );
      }

      // Check if already purchased
      const existingPurchase = await prisma.mediaPurchase.findUnique({
        where: {
          userId_mediaId: {
            userId: user.id,
            mediaId: media.id,
          },
        },
      });

      if (existingPurchase) {
        return NextResponse.json(
          { error: "Already purchased" },
          { status: 400 }
        );
      }

      const checkoutSession = await createPaymentCheckout(
        customerId,
        Number(media.price),
        media.title,
        {
          userId: user.id,
          mediaId: media.id,
          type: "media_purchase",
        }
      );

      return NextResponse.json({ url: checkoutSession.url });
    } else if (type === "ppv") {
      // PPV message unlock
      const { messageId, amount } = body;

      if (!messageId || !amount) {
        return NextResponse.json(
          { error: "Message ID and amount required" },
          { status: 400 }
        );
      }

      const message = await prisma.message.findUnique({
        where: { id: messageId },
      });

      if (!message || !message.isPPV) {
        return NextResponse.json(
          { error: "Message not available for unlock" },
          { status: 400 }
        );
      }

      // Check if already unlocked
      if (message.ppvUnlockedBy.includes(user.id)) {
        return NextResponse.json(
          { error: "Already unlocked" },
          { status: 400 }
        );
      }

      const checkoutSession = await createPaymentCheckout(
        customerId,
        amount,
        "Unlock PPV Content",
        {
          userId: user.id,
          messageId: message.id,
          type: "ppv_unlock",
        }
      );

      return NextResponse.json({ url: checkoutSession.url });
    } else if (type === "tip") {
      // Tip/donation
      const { amount, recipientId, messageId } = body;

      if (!amount || amount < 1) {
        return NextResponse.json(
          { error: "Valid tip amount required" },
          { status: 400 }
        );
      }

      const checkoutSession = await createPaymentCheckout(
        customerId,
        amount,
        "Tip",
        {
          userId: user.id,
          recipientId: recipientId || "creator",
          messageId: messageId || "",
          type: "tip",
        }
      );

      return NextResponse.json({ url: checkoutSession.url });
    }

    return NextResponse.json(
      { error: "Invalid checkout type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
