import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { triggerNewMessage } from "@/lib/pusher";

const ADMIN_USER_ID = process.env.ADMIN_USER_ID || "admin";

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");
  return !!token?.value;
}

// GET /api/conversations/[id]/messages - Get messages for a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const cursor = searchParams.get("cursor");

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        isDeleted: false,
      },
      include: {
        media: true,
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
      take: limit,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
    });

    // Mark messages as read if admin is viewing
    const admin = await isAdmin();
    if (admin) {
      await prisma.message.updateMany({
        where: {
          conversationId,
          receiverId: ADMIN_USER_ID,
          isRead: false,
        },
        data: { isRead: true },
      });
    }

    // Transform messages for frontend
    const transformedMessages = messages.map((msg) => ({
      id: msg.id,
      text: msg.text,
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      isPPV: msg.isPPV,
      ppvPrice: msg.ppvPrice ? Number(msg.ppvPrice) : null,
      isUnlocked: JSON.parse(msg.ppvUnlockedBy || "[]").includes(ADMIN_USER_ID) || msg.senderId === ADMIN_USER_ID,
      ppvUnlockedBy: JSON.parse(msg.ppvUnlockedBy || "[]"),
      totalTips: Number(msg.totalTips),
      isRead: msg.isRead,
      media: msg.media.map((m) => ({
        id: m.id,
        type: m.type,
        url: m.url,
        previewUrl: m.previewUrl,
      })),
      createdAt: msg.createdAt,
    }));

    return NextResponse.json(transformedMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST /api/conversations/[id]/messages - Send a new message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const admin = await isAdmin();

    const body = await request.json();
    const { text, media, isPPV, ppvPrice, senderId } = body;

    // Determine sender and receiver
    // If senderId is provided, use it (user sending from their dashboard)
    // Only use ADMIN_USER_ID if no senderId and admin is logged in
    const actualSenderId = senderId || (admin ? ADMIN_USER_ID : null);

    if (!actualSenderId) {
      return NextResponse.json(
        { error: "Sender ID is required" },
        { status: 400 }
      );
    }

    // Get the other participant
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: true,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const receiverId = conversation.participants.find(
      (p) => p.userId !== actualSenderId
    )?.userId;

    if (!receiverId) {
      return NextResponse.json(
        { error: "Receiver not found" },
        { status: 400 }
      );
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: actualSenderId,
        receiverId,
        text: text || null,
        isPPV: isPPV || false,
        ppvPrice: isPPV && ppvPrice ? ppvPrice : null,
        ppvUnlockedBy: "[]",
        media: media && media.length > 0
          ? {
              create: media.map((m: any) => ({
                type: m.type,
                url: m.url,
                previewUrl: m.previewUrl || null,
              })),
            }
          : undefined,
      },
      include: {
        media: true,
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Update conversation's updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    const transformedMessage = {
      id: message.id,
      text: message.text,
      senderId: message.senderId,
      receiverId: message.receiverId,
      isPPV: message.isPPV,
      ppvPrice: message.ppvPrice ? Number(message.ppvPrice) : null,
      isUnlocked: true, // Sender always sees their own content
      ppvUnlockedBy: JSON.parse(message.ppvUnlockedBy || "[]"),
      totalTips: Number(message.totalTips),
      isRead: message.isRead,
      media: message.media.map((m) => ({
        id: m.id,
        type: m.type,
        url: m.url,
        previewUrl: m.previewUrl,
      })),
      createdAt: message.createdAt,
    };

    // Trigger real-time notification via Pusher
    await triggerNewMessage(conversationId, transformedMessage);

    return NextResponse.json(transformedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
