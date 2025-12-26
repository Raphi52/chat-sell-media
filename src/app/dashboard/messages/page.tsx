"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Crown, Lock, Loader2 } from "lucide-react";
import { ChatWindow } from "@/components/chat";
import { Button, Card } from "@/components/ui";
import Link from "next/link";
import { usePusherChat, isPusherAvailable } from "@/hooks/usePusher";

interface Message {
  id: string;
  text: string | null;
  senderId: string;
  receiverId: string;
  isPPV: boolean;
  ppvPrice: number | null;
  isUnlocked: boolean;
  ppvUnlockedBy: string[];
  media: {
    id: string;
    type: "PHOTO" | "VIDEO" | "AUDIO";
    url: string;
    previewUrl: string | null;
  }[];
  createdAt: string;
}

interface CreatorProfile {
  name: string;
  image: string | null;
  bio: string | null;
}

const ADMIN_USER_ID = "admin";

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile>({
    name: "Mia Costa",
    image: null,
    bio: null,
  });

  const userId = session?.user?.id;

  // Fetch creator profile
  useEffect(() => {
    const fetchCreatorProfile = async () => {
      try {
        const res = await fetch("/api/creator");
        if (res.ok) {
          const data = await res.json();
          setCreatorProfile({
            name: data.name || "Mia Costa",
            image: data.image,
            bio: data.bio,
          });
        }
      } catch (error) {
        console.error("Error fetching creator profile:", error);
      }
    };

    fetchCreatorProfile();
  }, []);

  // Check subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      if (!userId) return;

      try {
        const res = await fetch("/api/user/subscription");
        if (res.ok) {
          const data = await res.json();
          // Premium and VIP can message
          setHasSubscription(
            data.subscription?.plan?.canMessage ||
            ["PREMIUM", "VIP"].includes(data.subscription?.plan?.accessTier)
          );
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
      }
    };

    checkSubscription();
  }, [userId]);

  // Initialize or get conversation with admin
  const initConversation = useCallback(async () => {
    if (!userId) return;

    try {
      // Create or get existing conversation with admin
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: ADMIN_USER_ID }),
      });

      if (res.ok) {
        const data = await res.json();
        setConversationId(data.id);
      }
    } catch (error) {
      console.error("Error initializing conversation:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Fetch messages - optimized to prevent flicker
  const fetchMessages = useCallback(async (isInitial = false) => {
    if (!conversationId) return;

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      if (res.ok) {
        const data = await res.json();
        // Only update if data actually changed
        setMessages((prev) => {
          const prevIds = prev.map((m) => m.id).join(",");
          const newIds = data.map((m: Message) => m.id).join(",");
          if (prevIds === newIds) return prev;
          return data;
        });
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [conversationId]);

  // Initialize on mount
  useEffect(() => {
    if (userId && hasSubscription) {
      initConversation();
    } else if (status !== "loading") {
      setIsLoading(false);
    }
  }, [userId, hasSubscription, initConversation, status]);

  // Fetch messages when conversation is ready
  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId, fetchMessages]);

  // Handle new message from Pusher
  const handleNewMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      // Prevent duplicates
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });
  }, []);

  // Pusher real-time connection
  const { isConnected } = usePusherChat({
    conversationId: conversationId || "",
    onNewMessage: handleNewMessage,
  });

  // Fallback polling (only when Pusher not connected)
  useEffect(() => {
    if (!conversationId || isConnected) return;

    // Slower polling as fallback
    const pollInterval = setInterval(() => fetchMessages(false), 30000);
    return () => clearInterval(pollInterval);
  }, [conversationId, fetchMessages, isConnected]);

  // Send message
  const handleSendMessage = async (
    text: string,
    mediaFiles?: File[],
    isPPV?: boolean,
    ppvPrice?: number
  ) => {
    if (!conversationId || !userId) return;
    if (!text && (!mediaFiles || mediaFiles.length === 0)) return;
    if (isSending) return; // Prevent double-sending

    setIsSending(true);

    try {
      let uploadedMedia: { type: string; url: string; previewUrl?: string }[] = [];

      // Upload media files if any
      if (mediaFiles && mediaFiles.length > 0) {
        for (const file of mediaFiles) {
          const formData = new FormData();
          formData.append("file", file);

          const uploadRes = await fetch("/api/messages/upload", {
            method: "POST",
            body: formData,
          });

          if (uploadRes.ok) {
            const mediaData = await uploadRes.json();
            uploadedMedia.push({
              type: file.type.startsWith("video") ? "VIDEO" :
                    file.type.startsWith("audio") ? "AUDIO" : "PHOTO",
              url: mediaData.url,
              previewUrl: mediaData.previewUrl || null,
            });
          }
        }
      }

      // Send message via API
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text || null,
          senderId: userId,
          media: uploadedMedia.length > 0 ? uploadedMedia : undefined,
        }),
      });

      if (res.ok) {
        const newMessage = await res.json();
        // Only add if not already received via Pusher
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Unlock PPV content
  const handleUnlockPPV = async (messageId: string) => {
    try {
      const res = await fetch(`/api/messages/${messageId}/unlock`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.unlocked) {
          // Update message in state to show as unlocked
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? { ...msg, isUnlocked: true, ppvUnlockedBy: [...msg.ppvUnlockedBy, userId!] }
                : msg
            )
          );
        }
      } else {
        const error = await res.json();
        alert(error.error || "Failed to unlock content");
      }
    } catch (error) {
      console.error("Error unlocking PPV:", error);
      alert("Failed to unlock content");
    }
  };

  // Send tip
  const handleSendTip = async (messageId: string, amount: number) => {
    try {
      const res = await fetch(`/api/messages/${messageId}/tip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      if (res.ok) {
        alert(`Tip of $${amount} sent successfully!`);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to send tip");
      }
    } catch (error) {
      console.error("Error sending tip:", error);
      alert("Failed to send tip");
    }
  };

  // React to message
  const handleReact = async (messageId: string, emoji: string) => {
    try {
      const res = await fetch(`/api/messages/${messageId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });

      if (res.ok) {
        // Refresh messages to show updated reactions
        fetchMessages(false);
      }
    } catch (error) {
      console.error("Error reacting to message:", error);
    }
  };

  // Mark message as read
  const handleMarkAsRead = async (messageId: string) => {
    try {
      await fetch(`/api/messages/${messageId}/read`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  // Loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--gold)] animate-spin" />
      </div>
    );
  }

  // Not logged in
  if (!session) {
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
              Sign In Required
            </h1>
            <p className="text-[var(--muted)] mb-8">
              Please sign in to access direct messaging.
            </p>
            <Link href="/auth/signin">
              <Button variant="premium" size="lg">
                Sign In
              </Button>
            </Link>
          </Card>
        </motion.div>
      </div>
    );
  }

  // No subscription
  if (!hasSubscription) {
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
              Upgrade to Premium or VIP to start chatting directly with {creatorProfile.name}.
              Get exclusive content, personalized messages, and more!
            </p>
            <Link href="/#membership">
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
    isUnlocked: msg.ppvUnlockedBy?.includes(userId!) || msg.senderId === userId,
    senderId: msg.senderId,
    createdAt: new Date(msg.createdAt),
  }));

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-screen flex flex-col">
      {/* Chat - ChatWindow has its own header */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatWindow
          conversationId={conversationId || ""}
          currentUserId={userId || ""}
          otherUser={{
            id: ADMIN_USER_ID,
            name: creatorProfile.name,
            image: creatorProfile.image || undefined,
            isOnline: true,
          }}
          messages={transformedMessages}
          onSendMessage={handleSendMessage}
          onUnlockPPV={handleUnlockPPV}
          onSendTip={handleSendTip}
          onReact={handleReact}
          onMarkAsRead={handleMarkAsRead}
          isSending={isSending}
        />
      </div>
    </div>
  );
}
