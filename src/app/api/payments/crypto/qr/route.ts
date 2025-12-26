import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCryptoPayment, CRYPTO_CURRENCIES } from "@/lib/nowpayments";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, currency, mediaId, planId, billingInterval, messageId, amount } = body;

    // Validate currency
    const validCurrency = CRYPTO_CURRENCIES.find((c) => c.id === currency);
    if (!validCurrency) {
      return NextResponse.json(
        { error: "Invalid cryptocurrency" },
        { status: 400 }
      );
    }

    let priceAmount: number;
    let orderId: string;
    let orderDescription: string;
    let paymentType: "SUBSCRIPTION" | "MEDIA_PURCHASE" | "PPV_UNLOCK" | "TIP";
    let metadata: Record<string, any> = {
      userId: session.user.id,
      cryptoCurrency: currency,
    };

    if (type === "media") {
      // Media purchase
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
            userId: session.user.id,
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

      priceAmount = Number(media.price);
      orderId = `media_${session.user.id}_${mediaId}_${Date.now()}`;
      orderDescription = `Purchase: ${media.title}`;
      paymentType = "MEDIA_PURCHASE";
      metadata.type = "media_purchase";
      metadata.mediaId = mediaId;
    } else if (type === "subscription") {
      // Subscription payment
      const plans: Record<string, { monthlyPrice: number; annualPrice: number; name: string }> = {
        BASIC: { monthlyPrice: 9.99, annualPrice: 95.88, name: "Basic" },
        VIP: { monthlyPrice: 29.99, annualPrice: 287.88, name: "VIP" },
      };

      const plan = plans[planId as string];
      if (!plan) {
        return NextResponse.json(
          { error: "Invalid plan" },
          { status: 400 }
        );
      }

      priceAmount = billingInterval === "ANNUAL" ? plan.annualPrice : plan.monthlyPrice;
      orderId = `sub_${session.user.id}_${planId}_${Date.now()}`;
      orderDescription = `${plan.name} Subscription (${billingInterval})`;
      paymentType = "SUBSCRIPTION";
      metadata.type = "subscription";
      metadata.planId = planId;
      metadata.billingInterval = billingInterval;
    } else if (type === "ppv") {
      // PPV message unlock
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

      if (message.ppvUnlockedBy.includes(session.user.id)) {
        return NextResponse.json(
          { error: "Already unlocked" },
          { status: 400 }
        );
      }

      priceAmount = amount;
      orderId = `ppv_${session.user.id}_${messageId}_${Date.now()}`;
      orderDescription = "Unlock PPV Content";
      paymentType = "PPV_UNLOCK";
      metadata.type = "ppv_unlock";
      metadata.messageId = messageId;
    } else if (type === "tip") {
      // Tip payment
      if (!amount || amount < 1) {
        return NextResponse.json(
          { error: "Valid tip amount required" },
          { status: 400 }
        );
      }

      priceAmount = amount;
      orderId = `tip_${session.user.id}_${Date.now()}`;
      orderDescription = "Tip";
      paymentType = "TIP";
      metadata.type = "tip";
      metadata.messageId = messageId || null;
    } else {
      return NextResponse.json(
        { error: "Invalid payment type" },
        { status: 400 }
      );
    }

    // Create NOWPayments payment
    const cryptoPayment = await createCryptoPayment({
      priceAmount,
      priceCurrency: "usd",
      payCurrency: currency,
      orderId,
      orderDescription,
    });

    // Store pending payment in database
    await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: priceAmount,
        currency: "USD",
        status: "PENDING",
        provider: "NOWPAYMENTS",
        providerTxId: cryptoPayment.payment_id,
        type: paymentType,
        metadata: JSON.stringify({
          ...metadata,
          payAmount: cryptoPayment.pay_amount,
          payAddress: cryptoPayment.pay_address,
        }),
      },
    });

    // Generate QR code URL (using free QR code API)
    let qrData: string;
    if (currency === "btc") {
      qrData = `bitcoin:${cryptoPayment.pay_address}?amount=${cryptoPayment.pay_amount}`;
    } else if (currency === "eth") {
      qrData = `ethereum:${cryptoPayment.pay_address}?value=${cryptoPayment.pay_amount}`;
    } else {
      // For USDT and others, just use the address
      qrData = cryptoPayment.pay_address;
    }

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

    return NextResponse.json({
      paymentId: cryptoPayment.payment_id,
      payAddress: cryptoPayment.pay_address,
      payAmount: cryptoPayment.pay_amount,
      payCurrency: cryptoPayment.pay_currency,
      qrCodeUrl,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
    });
  } catch (error) {
    console.error("Crypto QR payment error:", error);
    return NextResponse.json(
      { error: "Failed to create crypto payment" },
      { status: 500 }
    );
  }
}
