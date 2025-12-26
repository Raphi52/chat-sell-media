import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/messages/search?conversationId=xxx&q=xxx
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");
    const query = searchParams.get("q");

    if (!conversationId || !query) {
      return NextResponse.json(
        { error: "conversationId and q are required" },
        { status: 400 }
      );
    }

    // Verify user is part of the conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: session.user.id,
      },
    });

    if (!participant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Search messages
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        text: {
          contains: query,
        },
        isDeleted: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    const results = messages.map((message) => ({
      id: message.id,
      text: message.text || "",
      senderName: message.sender.name || "Unknown",
      timestamp: message.createdAt,
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error searching messages:", error);
    return NextResponse.json(
      { error: "Failed to search messages" },
      { status: 500 }
    );
  }
}
