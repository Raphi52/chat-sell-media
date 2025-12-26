"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Image, DollarSign, Lock, X, Plus, Sparkles, Loader2 } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { Button, Badge } from "@/components/ui";

interface Message {
  id: string;
  text?: string;
  media?: {
    id: string;
    type: "PHOTO" | "VIDEO" | "AUDIO";
    url: string;
    previewUrl?: string;
  }[];
  isPPV?: boolean;
  ppvPrice?: number;
  isUnlocked?: boolean;
  senderId: string;
  createdAt: Date;
}

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  otherUser: {
    id: string;
    name: string;
    image?: string;
    isOnline?: boolean;
  };
  messages: Message[];
  isAdmin?: boolean;
  isSending?: boolean;
  onSendMessage: (text: string, media?: File[], isPPV?: boolean, ppvPrice?: number) => void;
  onUnlockPPV: (messageId: string) => void;
  onSendTip: (messageId: string, amount: number) => void;
  onAISuggest?: (lastUserMessage: string) => Promise<string>;
}

const tipAmounts = [5, 10, 20, 50, 100];

export function ChatWindow({
  conversationId,
  currentUserId,
  otherUser,
  messages,
  isAdmin,
  isSending,
  onSendMessage,
  onUnlockPPV,
  onSendTip,
  onAISuggest,
}: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isPPV, setIsPPV] = useState(false);
  const [ppvPrice, setPpvPrice] = useState(9.99);
  const [showTipModal, setShowTipModal] = useState<string | null>(null);
  const [customTip, setCustomTip] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get last message from user (for AI context)
  const getLastUserMessage = () => {
    const userMessages = messages.filter((m) => m.senderId === otherUser.id && m.text);
    return userMessages[userMessages.length - 1]?.text || "";
  };

  // Handle AI suggestion
  const handleAISuggest = async () => {
    if (!onAISuggest) return;

    const lastMsg = getLastUserMessage();
    if (!lastMsg) return;

    setIsLoadingAI(true);
    try {
      const suggestion = await onAISuggest(lastMsg);
      setNewMessage(suggestion);
    } catch (error) {
      console.error("AI suggestion error:", error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() && selectedFiles.length === 0) return;
    if (isSending) return; // Prevent double-sending

    onSendMessage(
      newMessage,
      selectedFiles.length > 0 ? selectedFiles : undefined,
      selectedFiles.length > 0 && isPPV ? isPPV : undefined,
      selectedFiles.length > 0 && isPPV ? ppvPrice : undefined
    );

    setNewMessage("");
    setSelectedFiles([]);
    setIsPPV(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleTip = (messageId: string, amount: number) => {
    onSendTip(messageId, amount);
    setShowTipModal(null);
    setCustomTip("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[var(--border)]">
        {otherUser.image ? (
          <img
            src={otherUser.image}
            alt={otherUser.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)]" />
        )}
        <div>
          <h3 className="font-medium text-[var(--foreground)]">
            {otherUser.name}
          </h3>
          <p
            className={`text-xs ${
              otherUser.isOnline ? "text-[var(--success)]" : "text-[var(--muted)]"
            }`}
          >
            {otherUser.isOnline ? "Online" : "Offline"}
          </p>
        </div>
        {isAdmin && (
          <Badge variant="vip" className="ml-auto">
            Creator
          </Badge>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            id={message.id}
            text={message.text}
            media={message.media}
            isPPV={message.isPPV}
            ppvPrice={message.ppvPrice}
            isUnlocked={message.isUnlocked}
            isSent={message.senderId === currentUserId}
            timestamp={message.createdAt}
            senderName={message.senderId !== currentUserId ? otherUser.name : undefined}
            senderAvatar={message.senderId !== currentUserId ? otherUser.image : undefined}
            onUnlock={onUnlockPPV}
            onTip={(id) => setShowTipModal(id)}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Selected files preview */}
      {selectedFiles.length > 0 && (
        <div className="px-4 py-2 border-t border-[var(--border)]">
          <div className="flex items-center gap-2 flex-wrap">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="relative group w-16 h-16 rounded-lg overflow-hidden bg-[var(--surface)]"
              >
                {file.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : file.type.startsWith("video/") ? (
                  <div className="w-full h-full flex items-center justify-center bg-black/50">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                ) : file.type.startsWith("audio/") ? (
                  <div className="w-full h-full flex items-center justify-center bg-purple-500/20">
                    <span className="text-xs text-purple-400">Audio</span>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-xs text-[var(--muted)]">File</span>
                  </div>
                )}
                <button
                  onClick={() =>
                    setSelectedFiles((prev) =>
                      prev.filter((_, i) => i !== index)
                    )
                  }
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[var(--error)] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* PPV toggle for admin */}
          {isAdmin && (
            <div className="flex items-center gap-4 mt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPPV}
                  onChange={(e) => setIsPPV(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--border)] bg-[var(--surface)] text-[var(--gold)]"
                />
                <Lock className="w-4 h-4 text-[var(--gold)]" />
                <span className="text-sm text-[var(--foreground-secondary)]">
                  Send as PPV
                </span>
              </label>
              {isPPV && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--muted)]">$</span>
                  <input
                    type="number"
                    value={ppvPrice}
                    onChange={(e) => setPpvPrice(parseFloat(e.target.value))}
                    min="0.99"
                    step="0.01"
                    className="w-20 px-2 py-1 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] text-sm"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex items-end gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-full bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <Plus className="w-5 h-5 text-[var(--gold)]" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* AI Suggest Button - Admin only */}
          {isAdmin && onAISuggest && (
            <button
              onClick={handleAISuggest}
              disabled={isLoadingAI || !getLastUserMessage()}
              className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Suggestion IA flirty"
            >
              {isLoadingAI ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 text-white" />
              )}
            </button>
          )}

          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted)] resize-none focus:outline-none focus:border-[var(--gold)]"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={isSending || (!newMessage.trim() && selectedFiles.length === 0)}
            className="p-3 rounded-full bg-[var(--gold)] hover:bg-[var(--gold-light)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 text-[var(--background)] animate-spin" />
            ) : (
              <Send className="w-5 h-5 text-[var(--background)]" />
            )}
          </button>
        </div>
      </div>

      {/* Tip Modal */}
      <AnimatePresence>
        {showTipModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowTipModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="luxury-card p-6 w-full max-w-sm mx-4"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-[var(--gold)]/10 flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-[var(--gold)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--foreground)]">
                  Send a Tip
                </h3>
                <p className="text-sm text-[var(--muted)]">
                  Show your appreciation!
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {tipAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleTip(showTipModal, amount)}
                    className="py-3 rounded-lg bg-[var(--surface)] hover:bg-[var(--gold)]/10 border border-[var(--border)] hover:border-[var(--gold)] text-[var(--foreground)] font-medium transition-colors"
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                    $
                  </span>
                  <input
                    type="number"
                    value={customTip}
                    onChange={(e) => setCustomTip(e.target.value)}
                    placeholder="Custom"
                    min="1"
                    className="w-full pl-7 pr-4 py-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>
                <Button
                  variant="premium"
                  disabled={!customTip || parseFloat(customTip) < 1}
                  onClick={() =>
                    handleTip(showTipModal, parseFloat(customTip))
                  }
                >
                  Send
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
