import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe, verifyWebhookSignature } from "@/lib/stripe";
import { sendToAccounting } from "@/lib/crypto-accounting";

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 500 }
      );
    }

    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = verifyWebhookSignature(body, signature);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoiceFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;
  if (!metadata) return;

  const { userId, type } = metadata;

  if (type === "subscription") {
    // Subscription is handled by subscription.created event
    return;
  }

  if (type === "media_purchase") {
    const { mediaId } = metadata;

    // Create media purchase record
    await prisma.mediaPurchase.create({
      data: {
        userId,
        mediaId,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        provider: "STRIPE",
        providerTxId: session.payment_intent as string,
        status: "COMPLETED",
      },
    });

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency?.toUpperCase() || "USD",
        status: "COMPLETED",
        provider: "STRIPE",
        providerTxId: session.payment_intent as string,
        type: "MEDIA_PURCHASE",
        metadata: JSON.stringify({ mediaId }),
      },
    });

    // Send to accounting
    const user = await prisma.user.findUnique({ where: { id: userId } });
    await sendToAccounting({
      externalId: payment.id,
      amountUsd: payment.amount,
      amountCrypto: payment.amount,
      cryptoCurrency: payment.currency,
      productType: "MEDIA_PURCHASE",
      productName: mediaId,
      status: "COMPLETED",
      paymentDate: payment.createdAt.toISOString(),
      userEmail: user?.email,
      userId: userId,
      metadata: { mediaId, provider: "STRIPE" },
    });
  }

  if (type === "ppv_unlock") {
    const { messageId } = metadata;

    // Get current message to update unlocked list
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (message) {
      // Parse and update the unlocked list
      const unlockedBy = JSON.parse(message.ppvUnlockedBy || "[]");
      if (!unlockedBy.includes(userId)) {
        unlockedBy.push(userId);
      }

      // Add user to unlocked list
      await prisma.message.update({
        where: { id: messageId },
        data: {
          ppvUnlockedBy: JSON.stringify(unlockedBy),
        },
      });
    }

    // Create message payment record
    await prisma.messagePayment.create({
      data: {
        messageId,
        userId,
        type: "PPV_UNLOCK",
        amount: session.amount_total ? session.amount_total / 100 : 0,
        status: "COMPLETED",
        provider: "STRIPE",
      },
    });

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency?.toUpperCase() || "USD",
        status: "COMPLETED",
        provider: "STRIPE",
        providerTxId: session.payment_intent as string,
        type: "PPV_UNLOCK",
        metadata: JSON.stringify({ messageId }),
      },
    });

    // Send to accounting
    const user = await prisma.user.findUnique({ where: { id: userId } });
    await sendToAccounting({
      externalId: payment.id,
      amountUsd: payment.amount,
      amountCrypto: payment.amount,
      cryptoCurrency: payment.currency,
      productType: "PPV_UNLOCK",
      productName: messageId,
      status: "COMPLETED",
      paymentDate: payment.createdAt.toISOString(),
      userEmail: user?.email,
      userId: userId,
      metadata: { messageId, provider: "STRIPE" },
    });
  }

  if (type === "tip") {
    const { messageId, recipientId } = metadata;

    // Create message payment record if message-specific
    if (messageId) {
      await prisma.messagePayment.create({
        data: {
          messageId,
          userId,
          type: "TIP",
          amount: session.amount_total ? session.amount_total / 100 : 0,
          status: "COMPLETED",
          provider: "STRIPE",
        },
      });

      // Update tip amount on message
      await prisma.message.update({
        where: { id: messageId },
        data: {
          totalTips: {
            increment: session.amount_total ? session.amount_total / 100 : 0,
          },
        },
      });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency?.toUpperCase() || "USD",
        status: "COMPLETED",
        provider: "STRIPE",
        providerTxId: session.payment_intent as string,
        type: "TIP",
        metadata: JSON.stringify({ messageId, recipientId }),
      },
    });

    // Send to accounting
    const user = await prisma.user.findUnique({ where: { id: userId } });
    await sendToAccounting({
      externalId: payment.id,
      amountUsd: payment.amount,
      amountCrypto: payment.amount,
      cryptoCurrency: payment.currency,
      productType: "TIP",
      status: "COMPLETED",
      paymentDate: payment.createdAt.toISOString(),
      userEmail: user?.email,
      userId: userId,
      metadata: { messageId, recipientId, provider: "STRIPE" },
    });
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const metadata = subscription.metadata;
  if (!metadata?.userId) return;

  const { userId, planId, billingInterval } = metadata;

  // Map Stripe status to our status
  const statusMap: Record<string, string> = {
    active: "ACTIVE",
    past_due: "PAST_DUE",
    canceled: "CANCELED",
    unpaid: "PAST_DUE",
    trialing: "ACTIVE",
  };

  const status = statusMap[subscription.status] || "PENDING";

  // Find subscription plan
  const plan = await prisma.subscriptionPlan.findFirst({
    where: { name: planId },
  });

  if (!plan) {
    console.error(`Subscription plan not found: ${planId}`);
    return;
  }

  // Get subscription period dates (handle different Stripe API versions)
  const subData = subscription as any;
  const periodStart = subData.current_period_start || subData.currentPeriodStart;
  const periodEnd = subData.current_period_end || subData.currentPeriodEnd;

  // Upsert subscription
  await prisma.subscription.upsert({
    where: {
      stripeSubscriptionId: subscription.id,
    },
    create: {
      userId,
      planId: plan.id,
      status: status as any,
      stripeSubscriptionId: subscription.id,
      paymentProvider: "STRIPE",
      billingInterval: billingInterval as any,
      currentPeriodStart: new Date(periodStart * 1000),
      currentPeriodEnd: new Date(periodEnd * 1000),
    },
    update: {
      status: status as any,
      currentPeriodStart: new Date(periodStart * 1000),
      currentPeriodEnd: new Date(periodEnd * 1000),
    },
  });
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: "CANCELED",
      canceledAt: new Date(),
    },
  });
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const invoiceData = invoice as any;
  const subscriptionId = invoiceData.subscription;
  const customerId = invoiceData.customer;

  if (!subscriptionId || !customerId) return;

  const customerIdStr = typeof customerId === "string"
    ? customerId
    : customerId.id;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerIdStr },
  });

  if (!user) return;

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      amount: (invoiceData.amount_paid || 0) / 100,
      currency: (invoiceData.currency || "usd").toUpperCase(),
      status: "COMPLETED",
      provider: "STRIPE",
      providerTxId: invoiceData.payment_intent as string,
      type: "SUBSCRIPTION",
      metadata: JSON.stringify({
        invoiceId: invoice.id,
        subscriptionId: subscriptionId,
      }),
    },
  });

  // Send to accounting
  await sendToAccounting({
    externalId: payment.id,
    amountUsd: payment.amount,
    amountCrypto: payment.amount,
    cryptoCurrency: payment.currency,
    productType: "SUBSCRIPTION",
    status: "COMPLETED",
    paymentDate: payment.createdAt.toISOString(),
    userEmail: user.email,
    userId: user.id,
    metadata: { invoiceId: invoice.id, subscriptionId, provider: "STRIPE" },
  });
}

async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  const invoiceData = invoice as any;
  const subscriptionId = invoiceData.subscription;

  if (!subscriptionId) return;

  // Update subscription status
  await prisma.subscription.updateMany({
    where: {
      stripeSubscriptionId: subscriptionId as string,
    },
    data: {
      status: "PAST_DUE",
    },
  });
}
