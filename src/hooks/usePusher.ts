"use client";

import { useEffect, useRef, useCallback } from "react";
import Pusher from "pusher-js";
import type { Channel } from "pusher-js";

// Singleton Pusher instance
let pusherClient: Pusher | null = null;

function getPusherClient(): Pusher | null {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!key || !cluster) {
    return null;
  }

  if (!pusherClient) {
    pusherClient = new Pusher(key, {
      cluster,
    });
  }

  return pusherClient;
}

interface Message {
  id: string;
  text: string | null;
  senderId: string;
  receiverId: string;
  isPPV: boolean;
  ppvPrice: number | null;
  isUnlocked: boolean;
  ppvUnlockedBy: string[];
  media: Array<{
    id: string;
    type: "PHOTO" | "VIDEO" | "AUDIO";
    url: string;
    previewUrl: string | null;
  }>;
  createdAt: string;
}

interface UsePusherOptions {
  conversationId: string;
  onNewMessage?: (message: Message) => void;
  onTyping?: (data: { userId: string; isTyping: boolean }) => void;
  onMessagesRead?: (data: { readerId: string }) => void;
}

export function usePusherChat({
  conversationId,
  onNewMessage,
  onTyping,
  onMessagesRead,
}: UsePusherOptions) {
  const channelRef = useRef<Channel | null>(null);

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher || !conversationId) return;

    // Subscribe to conversation channel
    const channel = pusher.subscribe(`conversation-${conversationId}`);
    channelRef.current = channel;

    // Bind events
    if (onNewMessage) {
      channel.bind("new-message", onNewMessage);
    }

    if (onTyping) {
      channel.bind("typing", onTyping);
    }

    if (onMessagesRead) {
      channel.bind("messages-read", onMessagesRead);
    }

    return () => {
      // Unbind and unsubscribe on cleanup
      if (onNewMessage) channel.unbind("new-message", onNewMessage);
      if (onTyping) channel.unbind("typing", onTyping);
      if (onMessagesRead) channel.unbind("messages-read", onMessagesRead);
      pusher.unsubscribe(`conversation-${conversationId}`);
      channelRef.current = null;
    };
  }, [conversationId, onNewMessage, onTyping, onMessagesRead]);

  return {
    isConnected: !!channelRef.current,
  };
}

interface UseUserNotificationsOptions {
  userId: string;
  onNewMessageNotification?: (data: {
    conversationId: string;
    senderId: string;
    preview: string;
  }) => void;
}

export function usePusherNotifications({
  userId,
  onNewMessageNotification,
}: UseUserNotificationsOptions) {
  const channelRef = useRef<Channel | null>(null);

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher || !userId) return;

    const channel = pusher.subscribe(`user-${userId}`);
    channelRef.current = channel;

    if (onNewMessageNotification) {
      channel.bind("new-message-notification", onNewMessageNotification);
    }

    return () => {
      if (onNewMessageNotification) {
        channel.unbind("new-message-notification", onNewMessageNotification);
      }
      pusher.unsubscribe(`user-${userId}`);
      channelRef.current = null;
    };
  }, [userId, onNewMessageNotification]);

  return {
    isConnected: !!channelRef.current,
  };
}

// Check if Pusher is available
export function isPusherAvailable(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_PUSHER_KEY &&
    process.env.NEXT_PUBLIC_PUSHER_CLUSTER
  );
}
