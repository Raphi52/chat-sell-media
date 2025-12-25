"use client";

import { motion } from "framer-motion";
import { Crown, Check, CheckCheck } from "lucide-react";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    image?: string;
    isOnline?: boolean;
  };
  lastMessage?: {
    text?: string;
    isPPV?: boolean;
    createdAt: Date;
    isRead: boolean;
    senderId: string;
  };
  unreadCount: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId?: string;
  currentUserId: string;
  onSelectConversation: (conversationId: string) => void;
}

export function ConversationList({
  conversations,
  activeConversationId,
  currentUserId,
  onSelectConversation,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--gold)]/10 flex items-center justify-center mb-4">
          <Crown className="w-8 h-8 text-[var(--gold)]" />
        </div>
        <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
          No messages yet
        </h3>
        <p className="text-sm text-[var(--muted)]">
          Subscribe to start chatting with the creator
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[var(--border)]">
      {conversations.map((conversation) => {
        const isActive = conversation.id === activeConversationId;
        const isSentByMe = conversation.lastMessage?.senderId === currentUserId;

        return (
          <motion.button
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={cn(
              "w-full p-4 flex items-center gap-3 transition-colors text-left",
              isActive
                ? "bg-[var(--gold)]/5"
                : "hover:bg-[var(--surface-hover)]"
            )}
            whileHover={{ x: 2 }}
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
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)]" />
              )}
              {conversation.user.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[var(--success)] border-2 border-[var(--background)]" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-[var(--foreground)] truncate">
                  {conversation.user.name}
                </h4>
                {conversation.lastMessage && (
                  <span className="text-xs text-[var(--muted)]">
                    {new Date(
                      conversation.lastMessage.createdAt
                    ).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isSentByMe && (
                  <span className="flex-shrink-0">
                    {conversation.lastMessage?.isRead ? (
                      <CheckCheck className="w-4 h-4 text-[var(--gold)]" />
                    ) : (
                      <Check className="w-4 h-4 text-[var(--muted)]" />
                    )}
                  </span>
                )}
                <p className="text-sm text-[var(--muted)] truncate flex-1">
                  {conversation.lastMessage?.isPPV
                    ? "Sent exclusive content"
                    : conversation.lastMessage?.text || "No messages"}
                </p>
                {conversation.unreadCount > 0 && (
                  <Badge variant="premium" className="flex-shrink-0 px-2 py-0.5">
                    {conversation.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
