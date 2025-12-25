import Stripe from "stripe";
import { prisma } from "./prisma";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
    })
  : null;

export const SUBSCRIPTION_PLANS = {
  BASIC: {
    name: "Basic",
    monthlyPrice: 9.99,
    annualPrice: 95.88,
    features: [
      "Access to basic content library",
      "Standard resolution downloads",
      "10 downloads per month",
      "Email support",
    ],
  },
  PREMIUM: {
    name: "Premium",
    monthlyPrice: 19.99,
    annualPrice: 191.88,
    features: [
      "Full content access",
      "4K resolution downloads",
      "Unlimited downloads",
      "Direct messaging",
      "Early access to new content",
      "Priority support",
    ],
  },
  VIP: {
    name: "VIP",
    monthlyPrice: 49.99,
    annualPrice: 479.88,
    features: [
      "Everything in Premium",
      "Exclusive VIP-only content",
      "Custom content requests",
      "Private video calls",
      "Behind-the-scenes access",
      "Personalized messages",
      "VIP badge on profile",
    ],
  },
};

export async function getOrCreateStripeCustomer(
  userId: string,
  email: string
): Promise<string> {
  if (!stripe) throw new Error("Stripe not configured");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

export async function createSubscriptionCheckout(
  customerId: string,
  priceId: string,
  userId: string,
  planId: string,
  billingInterval: "MONTHLY" | "ANNUAL"
) {
  if (!stripe) throw new Error("Stripe not configured");

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/membership?canceled=true`,
    subscription_data: {
      trial_period_days: 7,
      metadata: {
        userId,
        planId,
        billingInterval,
      },
    },
    metadata: {
      userId,
      planId,
      type: "subscription",
    },
  });

  return session;
}

export async function createPaymentCheckout(
  customerId: string,
  amount: number,
  productName: string,
  metadata: Record<string, string>
) {
  if (!stripe) throw new Error("Stripe not configured");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: productName },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=canceled`,
    metadata,
  });

  return session;
}

export async function createCustomerPortalSession(customerId: string) {
  if (!stripe) throw new Error("Stripe not configured");

  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
  });
}

export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  if (!stripe) throw new Error("Stripe not configured");

  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
