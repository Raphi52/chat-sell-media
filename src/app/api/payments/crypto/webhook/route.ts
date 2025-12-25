import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature, mapPaymentStatus } from "@/lib/nowpayments";

interface IPNPayload {
  payment_id: number;
  payment_status: string;
  pay_address: string;
  pay_amount: number;
  pay_currency: string;
  price_amount: number;
  price_currency: string;
  order_id: string;
  actually_paid: number;
  outcome_amount: number;
  outcome_currency: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: IPNPayload = await request.json();
    const headersList = await headers();
    const signature = headersList.get("x-nowpayments-sig");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature);
    if (!isValid) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const paymentStatus = mapPaymentStatus(body.payment_status);
    const paymentId = String(body.payment_id);

    // Find payment in database
    const payment = await prisma.payment.findFirst({
      where: { providerTxId: paymentId },
    });

    if (!payment) {
      console.error(`Payment not found: ${paymentId}`);
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: paymentStatus as any,
        metadata: {
          ...(payment.metadata as object || {}),
          actuallyPaid: body.actually_paid,
          outcomeAmount: body.outcome_amount,
          lastUpdated: new Date().toISOString(),
        },
      },
    });

    // If payment completed, process the order
    if (paymentStatus === "COMPLETED") {
      const metadata = payment.metadata as Record<string, any>;

      switch (payment.type) {
        case "SUBSCRIPTION":
          await handleSubscriptionPayment(payment.userId, metadata);
          break;
        case "MEDIA_PURCHASE":
          await handleMediaPurchase(payment.userId, metadata, payment.amount);
          break;
        case "PPV_UNLOCK":
          await handlePPVUnlock(payment.userId, metadata, payment.amount);
          break;
        case "TIP":
          await handleTip(payment.userId, metadata, payment.amount);
          break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Crypto webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleSubscriptionPayment(
  userId: string,
  metadata: Record<string, any>
) {
  const { planId, billingInterval } = metadata;

  // Find subscription plan
  const plan = await prisma.subscriptionPlan.findFirst({
    where: { name: planId },
  });

  if (!plan) {
    console.error(`Subscription plan not found: ${planId}`);
    return;
  }

  // Calculate period dates
  const now = new Date();
  const periodEnd = new Date(now);
  if (billingInterval === "ANNUAL") {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  // Create or update subscription
  const existingSubscription = await prisma.subscription.findFirst({
    where: {
      userId,
      planId: plan.id,
      paymentProvider: "NOWPAYMENTS",
    },
  });

  if (existingSubscription) {
    await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });
  } else {
    await prisma.subscription.create({
      data: {
        userId,
        planId: plan.id,
        status: "ACTIVE",
        paymentProvider: "NOWPAYMENTS",
        billingInterval: billingInterval as any,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });
  }
}

async function handleMediaPurchase(
  userId: string,
  metadata: Record<string, any>,
  amount: number | any
) {
  const { mediaId } = metadata;

  // Check if already purchased
  const existingPurchase = await prisma.mediaPurchase.findUnique({
    where: {
      userId_mediaId: {
        userId,
        mediaId,
      },
    },
  });

  if (existingPurchase) {
    return; // Already purchased
  }

  // Create purchase record
  await prisma.mediaPurchase.create({
    data: {
      userId,
      mediaId,
      amount: Number(amount),
      provider: "NOWPAYMENTS",
      providerTxId: `crypto_${Date.now()}`,
      status: "COMPLETED",
    },
  });
}

async function handlePPVUnlock(
  userId: string,
  metadata: Record<string, any>,
  amount: number | any
) {
  const { messageId } = metadata;

  // Add user to unlocked list
  await prisma.message.update({
    where: { id: messageId },
    data: {
      ppvUnlockedBy: {
        push: userId,
      },
    },
  });

  // Create message payment record
  await prisma.messagePayment.create({
    data: {
      messageId,
      userId,
      type: "PPV_UNLOCK",
      amount: Number(amount),
      status: "COMPLETED",
      provider: "NOWPAYMENTS",
    },
  });
}

async function handleTip(
  userId: string,
  metadata: Record<string, any>,
  amount: number | any
) {
  const { messageId } = metadata;

  if (messageId) {
    // Create message payment record
    await prisma.messagePayment.create({
      data: {
        messageId,
        userId,
        type: "TIP",
        amount: Number(amount),
        status: "COMPLETED",
        provider: "NOWPAYMENTS",
      },
    });

    // Update tip amount on message
    await prisma.message.update({
      where: { id: messageId },
      data: {
        totalTips: {
          increment: Number(amount),
        },
      },
    });
  }
}
