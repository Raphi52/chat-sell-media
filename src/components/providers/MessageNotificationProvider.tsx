"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Crown, X, Heart } from "lucide-react";
import { usePusherNotifications, isPusherAvailable } from "@/hooks/usePusher";
import { getDefaultCreator } from "@/lib/creators";

interface Notification {
  id: string;
  conversationId: string;
  senderName: string;
  senderAvatar: string;
  preview: string;
  timestamp: Date;
}

interface MessageNotificationProviderProps {
  children: React.ReactNode;
}

export function MessageNotificationProvider({ children }: MessageNotificationProviderProps) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const creator = getDefaultCreator();

  const handleNewMessageNotification = useCallback((data: {
    conversationId: string;
    senderId: string;
    preview: string;
  }) => {
    // Only show notification if the sender is the creator (admin)
    // In a real app, you'd check if senderId matches the creator's user ID
    const newNotification: Notification = {
      id: `${Date.now()}-${Math.random()}`,
      conversationId: data.conversationId,
      senderName: creator.displayName,
      senderAvatar: creator.avatar,
      preview: data.preview || "Sent you a new message",
      timestamp: new Date(),
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  }, [creator]);

  // Only connect to Pusher if user is logged in and Pusher is available
  usePusherNotifications({
    userId: session?.user?.id || "",
    onNewMessageNotification: session?.user?.id ? handleNewMessageNotification : undefined,
  });

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleNotificationClick = (notification: Notification) => {
    // Navigate to messages page
    window.location.href = `/dashboard/messages?conversation=${notification.conversationId}`;
  };

  return (
    <>
      {children}

      {/* Notification container - fixed bottom right */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm">
        <AnimatePresence mode="popLayout">
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative cursor-pointer group"
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-center gap-3 p-4 rounded-xl bg-black/90 backdrop-blur-xl border border-[var(--gold)]/30 shadow-lg shadow-[var(--gold)]/10">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--gold)] to-yellow-600 p-0.5">
                    <img
                      src={notification.senderAvatar}
                      alt={notification.senderName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--gold)] flex items-center justify-center">
                    <MessageCircle className="w-3 h-3 text-black" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-white text-sm">
                      {notification.senderName}
                    </span>
                    <Crown className="w-3.5 h-3.5 text-[var(--gold)]" />
                  </div>
                  <p className="text-gray-300 text-xs truncate">
                    {notification.preview}
                  </p>
                </div>

                {/* Close button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissNotification(notification.id);
                  }}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>

                {/* Glow effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--gold)]/5 to-transparent pointer-events-none" />
              </div>

              {/* Animated border */}
              <motion.div
                className="absolute inset-0 rounded-xl border-2 border-[var(--gold)]/50 pointer-events-none"
                initial={{ opacity: 1 }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
