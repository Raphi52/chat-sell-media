"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Crown, Search, MessageSquare, Users, Loader2, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { ChatWindow } from "@/components/chat";
import { Card, Badge, Button } from "@/components/ui";
import { usePusherChat, usePusherNotifications, isPusherAvailable } from "@/hooks/usePusher";
import { useAdminCreator } from "@/components/providers/AdminCreatorContext";

interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    email?: string;
    image?: string;
    isOnline: boolean;
  };
  lastMessage: {
    text: string | null;
    isPPV: boolean;
    createdAt: string;
    isRead: boolean;
    senderId: string;
  } | null;
  unreadCount: number;
  subscription: string;
}

interface Message {
  id: string;
  text: string | null;
  senderId: string;
  receiverId: string;
  isPPV: boolean;
  ppvPrice: number | null;
  isUnlocked: boolean;
  media: {
    id: string;
    type: "PHOTO" | "VIDEO" | "AUDIO";
    url: string;
    previewUrl: string | null;
  }[];
  createdAt: string;
}

const subscriptionColors: Record<string, string> = {
  Free: "bg-gray-500/20 text-gray-400",
  Basic: "bg-blue-500/20 text-blue-400",
  BASIC: "bg-blue-500/20 text-blue-400",
  Premium: "bg-purple-500/20 text-purple-400",
  PREMIUM: "bg-purple-500/20 text-purple-400",
  VIP: "bg-[var(--gold)]/20 text-[var(--gold)]",
};

export default function AdminMessagesPage() {
  const { selectedCreator } = useAdminCreator();
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [pusherConnected, setPusherConnected] = useState(false);

  // Handle new message from Pusher
  const handleNewMessage = useCallback((message: Message) => {
    // Add message to list if we're in the same conversation
    setMessages((prev) => {
      // Avoid duplicates
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });

    // Update conversation last message
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === message.senderId || conv.id === message.receiverId
          ? {
              ...conv,
              lastMessage: {
                text: message.isPPV ? "Sent exclusive content" : message.text,
                isPPV: message.isPPV,
                createdAt: typeof message.createdAt === 'string' ? message.createdAt : new Date().toISOString(),
                isRead: false,
                senderId: message.senderId,
              },
            }
          : conv
      )
    );
  }, []);

  // Pusher real-time subscription
  const { isConnected } = usePusherChat({
    conversationId: activeConversation || "",
    onNewMessage: handleNewMessage,
  });

  // Update connection status
  useEffect(() => {
    setPusherConnected(isConnected && isPusherAvailable());
  }, [isConnected]);

  // Fetch conversations
  const fetchConversations = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoadingConvs(true);
    try {
      const res = await fetch(`/api/conversations?creator=${selectedCreator.slug}`);
      if (res.ok) {
        const data = await res.json();
        // Only update if data actually changed (compare JSON)
        setConversations((prev) => {
          const prevJson = JSON.stringify(prev.map(c => ({ id: c.id, unread: c.unreadCount, lastMsg: c.lastMessage?.createdAt })));
          const newJson = JSON.stringify(data.map((c: Conversation) => ({ id: c.id, unread: c.unreadCount, lastMsg: c.lastMessage?.createdAt })));
          if (prevJson !== newJson) {
            return data;
          }
          return prev;
        });
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      if (isInitial) setIsLoadingConvs(false);
    }
  }, [selectedCreator.slug]);

  // Fetch messages for active conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    setIsLoadingMsgs(true);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoadingMsgs(false);
    }
  }, []);

  // Initial load and reload when creator changes
  useEffect(() => {
    setActiveConversation(null);
    setMessages([]);
    fetchConversations(true);
  }, [fetchConversations, selectedCreator.slug]);

  // Load messages when conversation changes
  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation);

      // Mark conversation as read locally
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversation ? { ...conv, unreadCount: 0 } : conv
        )
      );
    }
  }, [activeConversation, fetchMessages]);

  // Fallback polling only when Pusher is not connected
  useEffect(() => {
    // If Pusher is connected, no need to poll frequently
    if (pusherConnected) return;

    const pollInterval = setInterval(() => {
      fetchConversations();
      if (activeConversation) {
        fetch(`/api/conversations/${activeConversation}/messages`)
          .then((res) => res.json())
          .then((data) => {
            setMessages((prev) => {
              if (data.length !== prev.length ||
                  (data.length > 0 && prev.length > 0 && data[data.length - 1].id !== prev[prev.length - 1].id)) {
                return data;
              }
              return prev;
            });
          })
          .catch(console.error);
      }
    }, 30000); // Poll every 30 seconds as fallback only

    return () => clearInterval(pollInterval);
  }, [pusherConnected, activeConversation, fetchConversations]);

  const handleSendMessage = async (
    text: string,
    mediaFiles?: File[],
    isPPV?: boolean,
    ppvPrice?: number
  ) => {
    if (!activeConversation) return;
    if (isSending) return; // Prevent double-sending
    setIsSending(true);

    try {
      let uploadedMedia: any[] = [];

      // Upload media files first
      if (mediaFiles && mediaFiles.length > 0) {
        const formData = new FormData();
        mediaFiles.forEach((file) => formData.append("files", file));
        formData.append("type", "chat");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          uploadedMedia = uploadData.files || [uploadData];
        }
      }

      // Send message
      const res = await fetch(`/api/conversations/${activeConversation}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text || null,
          senderId: "admin", // Explicitly set admin as sender
          media: uploadedMedia.map((m) => ({
            type: m.type,
            url: m.url,
            previewUrl: m.previewUrl,
          })),
          isPPV: isPPV || false,
          ppvPrice: isPPV ? ppvPrice : null,
        }),
      });

      if (res.ok) {
        const newMessage = await res.json();
        // Only add if not already received via Pusher
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });

        // Update conversation's last message
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === activeConversation
              ? {
                  ...conv,
                  lastMessage: {
                    text: isPPV ? "Sent exclusive content" : text,
                    isPPV: isPPV || false,
                    createdAt: new Date().toISOString(),
                    isRead: false,
                    senderId: "admin",
                  },
                }
              : conv
          )
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const activeConv = conversations.find((c) => c.id === activeConversation);

  // Transform messages for ChatWindow
  const transformedMessages = messages.map((msg) => ({
    id: msg.id,
    text: msg.text || undefined,
    media: msg.media.map((m) => ({
      id: m.id,
      type: m.type,
      url: m.url,
      previewUrl: m.previewUrl || undefined,
    })),
    isPPV: msg.isPPV,
    ppvPrice: msg.ppvPrice || undefined,
    isUnlocked: msg.isUnlocked,
    senderId: msg.senderId,
    createdAt: new Date(msg.createdAt),
  }));

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
            {/* Real-time status indicator */}
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${
                pusherConnected
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-yellow-500/20 text-yellow-400"
              }`}
              title={pusherConnected ? "Real-time connected" : "Polling mode"}
            >
              {pusherConnected ? (
                <Wifi className="w-3 h-3" />
              ) : (
                <WifiOff className="w-3 h-3" />
              )}
              <span>{pusherConnected ? "Live" : "Polling"}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fetchConversations()}
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
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
            {isLoadingConvs ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-[var(--gold)] animate-spin" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <MessageSquare className="w-12 h-12 text-[var(--muted)] mb-4" />
                <p className="text-[var(--muted)]">
                  {conversations.length === 0
                    ? "No conversations yet"
                    : "No conversations found"}
                </p>
                <p className="text-sm text-[var(--muted)] mt-2">
                  Conversations will appear when users message you
                </p>
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
                      {conversation.user.image ? (
                        <img
                          src={conversation.user.image}
                          alt={conversation.user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex items-center justify-center">
                          <span className="text-[var(--background)] font-bold">
                            {conversation.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
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
                              subscriptionColors[conversation.subscription] ||
                              subscriptionColors.Free
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
              {isLoadingMsgs ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-[var(--gold)] animate-spin" />
                </div>
              ) : (
                <ChatWindow
                  conversationId={activeConversation}
                  currentUserId="admin"
                  otherUser={activeConv.user}
                  messages={transformedMessages}
                  isAdmin={true}
                  isSending={isSending}
                  onSendMessage={handleSendMessage}
                  onUnlockPPV={(messageId) => {
                    console.log("User unlock PPV:", messageId);
                  }}
                  onSendTip={(messageId, amount) => {
                    console.log("User tip:", messageId, amount);
                  }}
                  onAISuggest={async (userMessage) => {
                    const res = await fetch("/api/ai/suggest", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        conversationId: activeConversation,
                        userMessage,
                      }),
                    });
                    if (res.ok) {
                      const data = await res.json();
                      return data.suggestion;
                    }
                    throw new Error("AI suggestion failed");
                  }}
                />
              )}
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
