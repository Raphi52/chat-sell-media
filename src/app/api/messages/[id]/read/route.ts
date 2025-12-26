import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { triggerMessageRead } from "@/lib/pusher";

// POST /api/messages/[id]/read - Mark a message as read
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

    // Verify user is part of the conversation
    const isParticipant = message.conversation.participants.some(
      (p) => p.userId === session.user.id
    );

    if (!isParticipant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Don't mark own messages as read
    if (message.senderId === session.user.id) {
      return NextResponse.json({ success: true, alreadyRead: true });
    }

    // Mark as read
    await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });

    // Update participant's lastReadAt
    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId: message.conversationId,
        userId: session.user.id,
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    // Notify sender via Pusher
    await triggerMessageRead(message.conversationId, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking message as read:", error);
    return NextResponse.json(
      { error: "Failed to mark message as read" },
      { status: 500 }
    );
  }
}
