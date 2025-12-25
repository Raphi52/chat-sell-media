"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Search, MessageSquare, Users } from "lucide-react";
import { ConversationList, ChatWindow } from "@/components/chat";
import { Card, Badge } from "@/components/ui";

// Demo data - in production, fetch from API
const demoConversations = [
  {
    id: "1",
    user: {
      id: "user1",
      name: "John D.",
      image: undefined,
      isOnline: true,
    },
    lastMessage: {
      text: "I'd love to see more content like this!",
      isPPV: false,
      createdAt: new Date(),
      isRead: false,
      senderId: "user1",
    },
    unreadCount: 2,
    subscription: "VIP",
  },
  {
    id: "2",
    user: {
      id: "user2",
      name: "Sarah M.",
      image: undefined,
      isOnline: false,
    },
    lastMessage: {
      text: "Thanks for the exclusive video!",
      isPPV: false,
      createdAt: new Date(Date.now() - 3600000),
      isRead: true,
      senderId: "user2",
    },
    unreadCount: 0,
    subscription: "Premium",
  },
  {
    id: "3",
    user: {
      id: "user3",
      name: "Mike R.",
      image: undefined,
      isOnline: true,
    },
    lastMessage: {
      text: "Can you send me something special?",
      isPPV: false,
      createdAt: new Date(Date.now() - 7200000),
      isRead: true,
      senderId: "user3",
    },
    unreadCount: 0,
    subscription: "Basic",
  },
  {
    id: "4",
    user: {
      id: "user4",
      name: "Emily K.",
      image: undefined,
      isOnline: false,
    },
    lastMessage: {
      text: "Just subscribed!",
      isPPV: false,
      createdAt: new Date(Date.now() - 86400000),
      isRead: true,
      senderId: "user4",
    },
    unreadCount: 0,
    subscription: "VIP",
  },
];

const demoMessagesMap: Record<string, any[]> = {
  "1": [
    {
      id: "1",
      text: "Hey! Thanks for your VIP subscription!",
      senderId: "admin",
      createdAt: new Date(Date.now() - 7200000),
    },
    {
      id: "2",
      text: "Here's an exclusive preview for you",
      media: [
        {
          id: "m1",
          type: "PHOTO" as const,
          url: "/media/preview/2885347102581834996_1.jpg",
          previewUrl: "/media/preview/2885347102581834996_1.jpg",
        },
      ],
      isPPV: true,
      ppvPrice: 14.99,
      isUnlocked: true,
      senderId: "admin",
      createdAt: new Date(Date.now() - 3600000),
    },
    {
      id: "3",
      text: "I'd love to see more content like this!",
      senderId: "user1",
      createdAt: new Date(),
    },
    {
      id: "4",
      text: "Can you send more exclusive pics?",
      senderId: "user1",
      createdAt: new Date(),
    },
  ],
  "2": [
    {
      id: "1",
      text: "Welcome to ExclusiveHub!",
      senderId: "admin",
      createdAt: new Date(Date.now() - 86400000),
    },
    {
      id: "2",
      text: "Thanks for the exclusive video!",
      senderId: "user2",
      createdAt: new Date(Date.now() - 3600000),
    },
  ],
  "3": [
    {
      id: "1",
      text: "Hey Mike! Thanks for subscribing!",
      senderId: "admin",
      createdAt: new Date(Date.now() - 86400000),
    },
    {
      id: "2",
      text: "Can you send me something special?",
      senderId: "user3",
      createdAt: new Date(Date.now() - 7200000),
    },
  ],
  "4": [
    {
      id: "1",
      text: "Just subscribed!",
      senderId: "user4",
      createdAt: new Date(Date.now() - 86400000),
    },
  ],
};

const subscriptionColors: Record<string, string> = {
  Basic: "bg-blue-500/20 text-blue-400",
  Premium: "bg-purple-500/20 text-purple-400",
  VIP: "bg-[var(--gold)]/20 text-[var(--gold)]",
};

export default function AdminMessagesPage() {
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState(demoConversations);
  const [messages, setMessages] = useState<Record<string, any[]>>(demoMessagesMap);

  const filteredConversations = conversations.filter((conv) =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  const handleSendMessage = (text: string, media?: File[], isPPV?: boolean, ppvPrice?: number) => {
    if (!activeConversation) return;

    const newMessage: any = {
      id: Date.now().toString(),
      text,
      senderId: "admin",
      createdAt: new Date(),
    };

    if (media && media.length > 0) {
      newMessage.media = media.map((file, i) => ({
        id: `media-${Date.now()}-${i}`,
        type: file.type.startsWith("video/") ? "VIDEO" : "PHOTO",
        url: URL.createObjectURL(file),
        previewUrl: URL.createObjectURL(file),
      }));
      if (isPPV) {
        newMessage.isPPV = true;
        newMessage.ppvPrice = ppvPrice;
        newMessage.isUnlocked = false;
      }
    }

    setMessages((prev) => ({
      ...prev,
      [activeConversation]: [...(prev[activeConversation] || []), newMessage],
    }));

    // Update last message in conversation
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversation
          ? {
              ...conv,
              lastMessage: {
                text: isPPV ? "Sent exclusive content" : text,
                isPPV: isPPV || false,
                createdAt: new Date(),
                isRead: false,
                senderId: "admin",
              },
            }
          : conv
      )
    );
  };

  const activeConv = conversations.find((c) => c.id === activeConversation);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[var(--border)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">
              Messages
            </h1>
            <p className="text-[var(--muted)]">
              Chat with your subscribers and send exclusive content
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Card variant="luxury" className="px-4 py-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--gold)]" />
              <span className="text-[var(--foreground)] font-medium">
                {conversations.length}
              </span>
              <span className="text-[var(--muted)]">conversations</span>
            </Card>
            {totalUnread > 0 && (
              <Badge variant="premium" className="px-3 py-1">
                {totalUnread} unread
              </Badge>
            )}
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversation List */}
        <div
          className={`w-full md:w-96 border-r border-[var(--border)] bg-[var(--surface)] flex flex-col ${
            activeConversation ? "hidden md:flex" : ""
          }`}
        >
          {/* Search */}
          <div className="p-4 border-b border-[var(--border)]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--gold)]"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <MessageSquare className="w-12 h-12 text-[var(--muted)] mb-4" />
                <p className="text-[var(--muted)]">No conversations found</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setActiveConversation(conversation.id)}
                    className={`w-full p-4 flex items-center gap-3 transition-colors text-left hover:bg-[var(--surface-hover)] ${
                      activeConversation === conversation.id
                        ? "bg-[var(--gold)]/5"
                        : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex items-center justify-center">
                        <span className="text-[var(--background)] font-bold">
                          {conversation.user.name.charAt(0)}
                        </span>
                      </div>
                      {conversation.user.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[var(--surface)]" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-[var(--foreground)]">
                            {conversation.user.name}
                          </h4>
                          <Badge
                            className={`text-xs ${
                              subscriptionColors[conversation.subscription]
                            }`}
                          >
                            {conversation.subscription}
                          </Badge>
                        </div>
                        {conversation.lastMessage && (
                          <span className="text-xs text-[var(--muted)]">
                            {new Date(
                              conversation.lastMessage.createdAt
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-[var(--muted)] truncate flex-1">
                          {conversation.lastMessage?.senderId === "admin"
                            ? "You: "
                            : ""}
                          {conversation.lastMessage?.isPPV
                            ? "Sent exclusive content"
                            : conversation.lastMessage?.text || "No messages"}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="premium" className="px-2 py-0.5 text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div
          className={`flex-1 flex flex-col ${
            !activeConversation ? "hidden md:flex" : ""
          }`}
        >
          {activeConversation && activeConv ? (
            <>
              {/* Mobile back button */}
              <button
                onClick={() => setActiveConversation(null)}
                className="md:hidden p-4 text-[var(--gold)] border-b border-[var(--border)]"
              >
                &larr; Back to conversations
              </button>
              <ChatWindow
                conversationId={activeConversation}
                currentUserId="admin"
                otherUser={activeConv.user}
                messages={messages[activeConversation] || []}
                isAdmin={true}
                onSendMessage={handleSendMessage}
                onUnlockPPV={(messageId) => {
                  console.log("User unlock PPV:", messageId);
                }}
                onSendTip={(messageId, amount) => {
                  console.log("User tip:", messageId, amount);
                }}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-[var(--background)]">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-[var(--gold)]/10 flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-10 h-10 text-[var(--gold)]" />
                </div>
                <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                  Select a conversation
                </h2>
                <p className="text-[var(--muted)]">
                  Choose a subscriber to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
