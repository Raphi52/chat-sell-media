import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/messages/[id]/tip - Send a tip on a message
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
    const body = await request.json();
    const { amount } = body;

    if (!amount || amount < 1) {
      return NextResponse.json(
        { error: "Invalid tip amount (minimum $1)" },
        { status: 400 }
      );
    }

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

    // Can't tip your own message
    if (message.senderId === userId) {
      return NextResponse.json(
        { error: "Cannot tip your own message" },
        { status: 400 }
      );
    }

    // Create payment and tip record
    const [payment, tipPayment] = await prisma.$transaction([
      prisma.payment.create({
        data: {
          userId,
          amount,
          currency: "USD",
          provider: "STRIPE",
          status: "COMPLETED",
          type: "TIP",
          description: `Tip for message`,
        },
      }),
      prisma.messagePayment.create({
        data: {
          messageId,
          userId,
          amount,
          type: "TIP",
          provider: "STRIPE",
          status: "COMPLETED",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      amount,
    });
  } catch (error) {
    console.error("Error sending tip:", error);
    return NextResponse.json({ error: "Failed to send tip" }, { status: 500 });
  }
}
