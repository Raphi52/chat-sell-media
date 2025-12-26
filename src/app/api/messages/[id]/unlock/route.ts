import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/messages/[id]/unlock - Unlock PPV message content
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: messageId } = await params;
    const userId = session.user.id;

    // Get the message
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        conversation: {
          include: {
            participants: true,
          },
        },
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check if user is part of the conversation
    const isParticipant = message.conversation.participants.some(
      (p) => p.userId === userId
    );
    if (!isParticipant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if message has PPV content
    if (!message.isPPV || !message.ppvPrice) {
      return NextResponse.json(
        { error: "This message is not pay-per-view" },
        { status: 400 }
      );
    }

    // Check if already unlocked
    const existingPayment = await prisma.messagePayment.findFirst({
      where: {
        messageId,
        userId,
        status: "COMPLETED",
      },
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: "Already unlocked", unlocked: true },
        { status: 200 }
      );
    }

    // Create payment record and unlock
    const [payment, messagePayment] = await prisma.$transaction([
      prisma.payment.create({
        data: {
          userId,
          amount: message.ppvPrice,
          currency: "USD",
          provider: "STRIPE", // Default, can be updated
          status: "COMPLETED",
          type: "PPV_UNLOCK",
          description: `PPV unlock for message`,
        },
      }),
      prisma.messagePayment.create({
        data: {
          messageId,
          userId,
          amount: message.ppvPrice,
          type: "PPV_UNLOCK",
          provider: "STRIPE",
          status: "COMPLETED",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      unlocked: true,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error("Error unlocking PPV:", error);
    return NextResponse.json(
      { error: "Failed to unlock content" },
      { status: 500 }
    );
  }
}
