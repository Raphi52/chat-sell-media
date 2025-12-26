import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

// Get admin ID (the creator/model)
const ADMIN_USER_ID = process.env.ADMIN_USER_ID || "admin";

// Check if user is admin
async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");
  return !!token?.value;
}

// GET /api/conversations - Get all conversations
export async function GET(request: NextRequest) {
  try {
    const admin = await isAdmin();

    // Get creator filter from query params
    const { searchParams } = new URL(request.url);
    const creatorSlug = searchParams.get("creator");

    // Get all conversations with participants and last message
    const conversations = await prisma.conversation.findMany({
      where: creatorSlug ? { creatorSlug } : undefined,
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            media: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Transform data for frontend
    const transformedConversations = await Promise.all(
      conversations.map(async (conv) => {
        // Get the other user (not admin)
        const otherParticipant = conv.participants.find(
          (p) => p.userId !== ADMIN_USER_ID
        );
        const user = otherParticipant?.user;

        // Count unread messages
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            receiverId: ADMIN_USER_ID,
            isRead: false,
          },
        });

        // Get user's subscription
        const subscription = await prisma.subscription.findFirst({
          where: {
            userId: user?.id,
            status: "ACTIVE",
          },
          include: {
            plan: true,
          },
        });

        const lastMessage = conv.messages[0];

        return {
          id: conv.id,
          user: {
            id: user?.id || "",
            name: user?.name || user?.email?.split("@")[0] || "User",
            email: user?.email,
            image: user?.image,
            isOnline: false, // Would need WebSocket for real-time status
          },
          lastMessage: lastMessage
            ? {
                text: lastMessage.text,
                isPPV: lastMessage.isPPV,
                createdAt: lastMessage.createdAt,
                isRead: lastMessage.isRead,
                senderId: lastMessage.senderId,
              }
            : null,
          unreadCount,
          subscription: subscription?.plan?.name || "Free",
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
        };
      })
    );

    return NextResponse.json(transformedConversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Create new conversation or get existing
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if conversation already exists between admin and user
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: ADMIN_USER_ID } } },
          { participants: { some: { userId } } },
        ],
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (existingConversation) {
      return NextResponse.json(existingConversation);
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: ADMIN_USER_ID }, { userId }],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
