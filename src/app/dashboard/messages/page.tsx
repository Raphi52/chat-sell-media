"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Crown, Lock } from "lucide-react";
import { ConversationList, ChatWindow } from "@/components/chat";
import { Button, Card } from "@/components/ui";
import Link from "next/link";

// Demo data - in production, fetch from API
const demoConversations = [
  {
    id: "1",
    user: {
      id: "creator",
      name: "Creator",
      image: undefined,
      isOnline: true,
    },
    lastMessage: {
      text: "Thanks for subscribing! Here's something special for you",
      isPPV: false,
      createdAt: new Date(),
      isRead: true,
      senderId: "creator",
    },
    unreadCount: 0,
  },
];

const demoMessages = [
  {
    id: "1",
    text: "Welcome to ExclusiveHub! Thanks for joining!",
    senderId: "creator",
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: "2",
    text: "Here's an exclusive preview just for you",
    media: [
      {
        id: "m1",
        type: "PHOTO" as const,
        url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800",
        previewUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&blur=20",
      },
    ],
    isPPV: true,
    ppvPrice: 9.99,
    isUnlocked: false,
    senderId: "creator",
    createdAt: new Date(Date.now() - 1800000),
  },
  {
    id: "3",
    text: "Can't wait to see more!",
    senderId: "current-user",
    createdAt: new Date(),
  },
];

export default function MessagesPage() {
  const { data: session } = useSession();
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [hasSubscription, setHasSubscription] = useState(false); // Demo: false

  // Check if user can message (has premium subscription)
  const canMessage = hasSubscription;

  if (!canMessage) {
    return (
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto text-center py-16"
        >
          <Card variant="featured" className="p-8">
            <div className="w-20 h-20 rounded-full bg-[var(--gold)]/10 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-[var(--gold)]" />
            </div>
            <h1 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
              Unlock Direct Messaging
            </h1>
            <p className="text-[var(--muted)] mb-8">
              Upgrade to Premium or VIP to start chatting directly with the creator.
              Get exclusive content, personalized messages, and more!
            </p>
            <Link href="/membership">
              <Button variant="premium" size="lg" className="gap-2">
                <Crown className="w-5 h-5" />
                Upgrade Now
              </Button>
            </Link>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-screen flex">
      {/* Conversation List */}
      <div className={`w-full md:w-80 border-r border-[var(--border)] bg-[var(--background)] ${
        activeConversation ? "hidden md:block" : ""
      }`}>
        <div className="p-4 border-b border-[var(--border)]">
          <h1 className="text-xl font-semibold text-[var(--foreground)]">
            Messages
          </h1>
        </div>
        <ConversationList
          conversations={demoConversations}
          activeConversationId={activeConversation || undefined}
          currentUserId={session?.user?.id || "current-user"}
          onSelectConversation={setActiveConversation}
        />
      </div>

      {/* Chat Window */}
      <div className={`flex-1 ${!activeConversation ? "hidden md:flex" : "flex"}`}>
        {activeConversation ? (
          <div className="w-full">
            {/* Back button for mobile */}
            <button
              onClick={() => setActiveConversation(null)}
              className="md:hidden p-4 text-[var(--gold)]"
            >
              ← Back
            </button>
            <ChatWindow
              conversationId={activeConversation}
              currentUserId={session?.user?.id || "current-user"}
              otherUser={demoConversations[0].user}
              messages={demoMessages}
              onSendMessage={(text, media, isPPV, ppvPrice) => {
                console.log("Send message:", { text, media, isPPV, ppvPrice });
              }}
              onUnlockPPV={(messageId) => {
                console.log("Unlock PPV:", messageId);
              }}
              onSendTip={(messageId, amount) => {
                console.log("Send tip:", { messageId, amount });
              }}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-[var(--gold)]/10 flex items-center justify-center mx-auto mb-4">
                <Crown className="w-10 h-10 text-[var(--gold)]" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                Select a conversation
              </h2>
              <p className="text-[var(--muted)]">
                Choose a conversation from the list to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
