"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Plus, Sparkles, Loader2, Play, X, Lock, DollarSign,
  Search, Smile, ArrowLeft, ChevronDown
} from "lucide-react";
import { useInView } from "react-intersection-observer";
import { MessageBubble } from "./MessageBubble";
import { DateSeparator } from "./DateSeparator";
import { TypingIndicator } from "./TypingIndicator";
import { EmojiPicker } from "./EmojiPicker";
import { QuotedMessage } from "./QuotedMessage";
import { MediaLightbox } from "./MediaLightbox";
import { MessageSearch } from "./MessageSearch";
import { Button, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

interface MessageMedia {
  id: string;
  type: "PHOTO" | "VIDEO" | "AUDIO";
  url: string;
  previewUrl?: string;
}

interface Reaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

interface Message {
  id: string;
  text?: string;
  media?: MessageMedia[];
  isPPV?: boolean;
  ppvPrice?: number;
  isUnlocked?: boolean;
  senderId: string;
  createdAt: Date;
  isRead?: boolean;
  reactions?: Reaction[];
  replyTo?: {
    id: string;
    text?: string;
    senderName: string;
  };
}

interface SearchResult {
  id: string;
  text: string;
  senderName: string;
  timestamp: Date;
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
  isTyping?: boolean;
  onSendMessage: (text: string, media?: File[], isPPV?: boolean, ppvPrice?: number, replyToId?: string) => void;
  onUnlockPPV: (messageId: string) => void;
  onSendTip: (messageId: string, amount: number) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onMarkAsRead?: (messageId: string) => void;
  onAISuggest?: (lastUserMessage: string) => Promise<string>;
  onSearch?: (query: string) => Promise<SearchResult[]>;
  onBack?: () => void;
}

const tipAmounts = [5, 10, 20, 50, 100];

// Group messages by date and sender
function groupMessages(messages: Message[], currentUserId: string) {
  const groups: {
    date: Date;
    messages: (Message & { isFirstInGroup: boolean; isLastInGroup: boolean })[];
  }[] = [];

  let currentDate: string | null = null;
  let currentGroup: typeof groups[0] | null = null;

  messages.forEach((message, index) => {
    const messageDate = new Date(message.createdAt);
    const dateKey = messageDate.toDateString();
    const prevMessage = messages[index - 1];
    const nextMessage = messages[index + 1];

    // Check if same sender and within 2 minutes
    const isSameSenderAsPrev =
      prevMessage &&
      prevMessage.senderId === message.senderId &&
      new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() < 2 * 60 * 1000;

    const isSameSenderAsNext =
      nextMessage &&
      nextMessage.senderId === message.senderId &&
      new Date(nextMessage.createdAt).getTime() - new Date(message.createdAt).getTime() < 2 * 60 * 1000 &&
      new Date(nextMessage.createdAt).toDateString() === dateKey;

    if (dateKey !== currentDate) {
      currentDate = dateKey;
      currentGroup = { date: messageDate, messages: [] };
      groups.push(currentGroup);
    }

    currentGroup!.messages.push({
      ...message,
      isFirstInGroup: !isSameSenderAsPrev || (prevMessage && new Date(prevMessage.createdAt).toDateString() !== dateKey),
      isLastInGroup: !isSameSenderAsNext,
    });
  });

  return groups;
}

export function ChatWindow({
  conversationId,
  currentUserId,
  otherUser,
  messages,
  isAdmin,
  isSending,
  isTyping,
  onSendMessage,
  onUnlockPPV,
  onSendTip,
  onReact,
  onMarkAsRead,
  onAISuggest,
  onSearch,
  onBack,
}: ChatWindowProps) {
  // State
  const [newMessage, setNewMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [videoThumbnails, setVideoThumbnails] = useState<{ [key: number]: string }>({});
  const [isPPV, setIsPPV] = useState(false);
  const [ppvPrice, setPpvPrice] = useState(9.99);
  const [showTipModal, setShowTipModal] = useState<string | null>(null);
  const [customTip, setCustomTip] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchHighlight, setSearchHighlight] = useState<string>("");
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [showNewMessages, setShowNewMessages] = useState(false);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [lightboxMedia, setLightboxMedia] = useState<MessageMedia[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Intersection observer for scroll-to-bottom button
  const { ref: bottomRef, inView: isAtBottom } = useInView({
    threshold: 0,
  });

  // Group messages
  const groupedMessages = useMemo(
    () => groupMessages(messages, currentUserId),
    [messages, currentUserId]
  );

  // Generate video thumbnails
  useEffect(() => {
    selectedFiles.forEach((file, index) => {
      if (file.type.startsWith("video/") && !videoThumbnails[index]) {
        const video = document.createElement("video");
        video.src = URL.createObjectURL(file);
        video.currentTime = 1;
        video.muted = true;
        video.onloadeddata = () => {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(video, 0, 0);
          setVideoThumbnails((prev) => ({ ...prev, [index]: canvas.toDataURL() }));
          URL.revokeObjectURL(video.src);
        };
      }
    });
  }, [selectedFiles, videoThumbnails]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [newMessage]);

  // Scroll to bottom on new messages (if already at bottom)
  useEffect(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.senderId !== currentUserId) {
        setShowNewMessages(true);
        setNewMessagesCount((prev) => prev + 1);
      }
    }
  }, [messages, isAtBottom, currentUserId]);

  // Mark messages as read when in view
  useEffect(() => {
    if (isAtBottom && onMarkAsRead) {
      const unreadMessages = messages.filter(
        (m) => m.senderId !== currentUserId && !m.isRead
      );
      unreadMessages.forEach((m) => onMarkAsRead(m.id));
    }
  }, [isAtBottom, messages, currentUserId, onMarkAsRead]);

  // Get last message from user (for AI context)
  const getLastUserMessage = useCallback(() => {
    const userMessages = messages.filter((m) => m.senderId === otherUser.id && m.text);
    return userMessages[userMessages.length - 1]?.text || "";
  }, [messages, otherUser.id]);

  // Handle AI suggestion
  const handleAISuggest = async () => {
    if (!onAISuggest) return;
    const lastMsg = getLastUserMessage();
    if (!lastMsg) return;

    setIsLoadingAI(true);
    try {
      const suggestion = await onAISuggest(lastMsg);
      setNewMessage(suggestion);
      textareaRef.current?.focus();
    } catch (error) {
      console.error("AI suggestion error:", error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Handle send
  const handleSend = () => {
    if (!newMessage.trim() && selectedFiles.length === 0) return;
    if (isSending) return;

    onSendMessage(
      newMessage,
      selectedFiles.length > 0 ? selectedFiles : undefined,
      selectedFiles.length > 0 && isPPV ? isPPV : undefined,
      selectedFiles.length > 0 && isPPV ? ppvPrice : undefined,
      replyTo?.id
    );

    setNewMessage("");
    setSelectedFiles([]);
    setVideoThumbnails({});
    setIsPPV(false);
    setReplyTo(null);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFiles(false);
    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
    );
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  // Handle tip
  const handleTip = (messageId: string, amount: number) => {
    onSendTip(messageId, amount);
    setShowTipModal(null);
    setCustomTip("");
  };

  // Handle reply
  const handleReply = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      setReplyTo(message);
      textareaRef.current?.focus();
    }
  };

  // Handle quote click
  const handleQuoteClick = (messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedMessageId(messageId);
      setTimeout(() => setHighlightedMessageId(null), 2000);
    }
  };

  // Handle search
  const handleSearch = async (query: string): Promise<SearchResult[]> => {
    if (!onSearch) {
      // Fallback local search
      return messages
        .filter((m) => m.text?.toLowerCase().includes(query.toLowerCase()))
        .map((m) => ({
          id: m.id,
          text: m.text || "",
          senderName: m.senderId === currentUserId ? "You" : otherUser.name,
          timestamp: m.createdAt,
        }));
    }
    return onSearch(query);
  };

  // Handle search result click
  const handleSearchResultClick = (messageId: string) => {
    handleQuoteClick(messageId);
    setSearchHighlight(
      messages.find((m) => m.id === messageId)?.text?.slice(0, 20) || ""
    );
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowNewMessages(false);
    setNewMessagesCount(0);
  };

  // Handle media click
  const handleMediaClick = (media: MessageMedia, allMedia: MessageMedia[]) => {
    setLightboxMedia(allMedia);
    setLightboxIndex(allMedia.findIndex((m) => m.id === media.id));
  };

  return (
    <div
      className="flex flex-col h-full bg-[#0a0a0a] relative"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingFiles(true);
      }}
      onDragLeave={(e) => {
        // Only set to false if leaving the container entirely
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsDraggingFiles(false);
        }
      }}
      onDrop={handleDrop}
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between px-3 md:px-4 py-3 border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur-lg safe-top z-10"
      >
        <div className="flex items-center gap-2 md:gap-3">
          {/* Back button (mobile) */}
          {onBack && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white md:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          )}

          <div className="relative">
            {otherUser.image ? (
              <img
                src={otherUser.image}
                alt={otherUser.name}
                className="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover ring-2 ring-[var(--gold)]/30"
              />
            ) : (
              <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex items-center justify-center text-black font-bold">
                {otherUser.name.charAt(0)}
              </div>
            )}
            {otherUser.isOnline && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0a0a0a]"
              />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-white flex items-center gap-2 truncate">
              <span className="truncate">{otherUser.name}</span>
              {isAdmin && (
                <Badge variant="vip" className="text-[10px] py-0 flex-shrink-0">
                  Creator
                </Badge>
              )}
            </h3>
            <p className="text-xs text-gray-400">
              {isTyping ? (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[var(--gold)]"
                >
                  typing...
                </motion.span>
              ) : otherUser.isOnline ? (
                "Online"
              ) : (
                "Offline"
              )}
            </p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowSearch(!showSearch)}
          className={cn(
            "p-2.5 rounded-full transition-colors touch-manipulation",
            showSearch
              ? "bg-[var(--gold)]/20 text-[var(--gold)]"
              : "hover:bg-white/10 active:bg-white/10 text-gray-400"
          )}
        >
          <Search className="w-5 h-5" />
        </motion.button>
      </motion.div>

      {/* Search bar */}
      <MessageSearch
        isOpen={showSearch}
        onClose={() => {
          setShowSearch(false);
          setSearchHighlight("");
        }}
        onSearch={handleSearch}
        onResultClick={handleSearchResultClick}
        currentHighlight={searchHighlight}
      />

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-3 md:px-4 py-4 space-y-1 overscroll-contain"
      >
        {groupedMessages.map((group) => (
          <div key={group.date.toISOString()}>
            <DateSeparator date={group.date} />
            {group.messages.map((message) => (
              <div
                key={message.id}
                id={`message-${message.id}`}
                className={cn(
                  "transition-all duration-500",
                  highlightedMessageId === message.id && "bg-[var(--gold)]/10 rounded-lg -mx-2 px-2"
                )}
              >
                <MessageBubble
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
                  isRead={message.isRead}
                  isDelivered={true}
                  reactions={message.reactions}
                  replyTo={
                    message.replyTo
                      ? {
                          id: message.replyTo.id,
                          text: message.replyTo.text,
                          senderName: message.replyTo.senderName,
                        }
                      : undefined
                  }
                  isFirstInGroup={message.isFirstInGroup}
                  isLastInGroup={message.isLastInGroup}
                  onUnlock={onUnlockPPV}
                  onTip={(id) => setShowTipModal(id)}
                  onReact={onReact}
                  onReply={handleReply}
                  onMediaClick={(media) => handleMediaClick(media, message.media || [])}
                  onQuoteClick={handleQuoteClick}
                  searchHighlight={searchHighlight}
                />
              </div>
            ))}
          </div>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <TypingIndicator userName={otherUser.name} userAvatar={otherUser.image} />
          )}
        </AnimatePresence>

        {/* Bottom anchor */}
        <div ref={messagesEndRef} />
        <div ref={bottomRef} />
      </div>

      {/* New messages button */}
      <AnimatePresence>
        {showNewMessages && !isAtBottom && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            onClick={scrollToBottom}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--gold)] text-black font-medium shadow-lg shadow-[var(--gold)]/30 z-20"
          >
            <ChevronDown className="w-4 h-4" />
            {newMessagesCount > 0 && (
              <span>{newMessagesCount} new message{newMessagesCount > 1 ? "s" : ""}</span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Drag & drop overlay */}
      <AnimatePresence>
        {isDraggingFiles && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-20 h-20 rounded-full bg-[var(--gold)]/20 flex items-center justify-center mx-auto mb-4"
              >
                <Plus className="w-10 h-10 text-[var(--gold)]" />
              </motion.div>
              <p className="text-white text-xl font-medium">Drop files here</p>
              <p className="text-gray-400 text-sm">Images and videos only</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reply preview */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10 bg-[#111] overflow-hidden"
          >
            <QuotedMessage
              message={{
                id: replyTo.id,
                text: replyTo.text,
                senderName: replyTo.senderId === currentUserId ? "You" : otherUser.name,
                hasMedia: !!replyTo.media?.length,
                mediaType: replyTo.media?.[0]?.type,
              }}
              onClear={() => setReplyTo(null)}
              isPreview
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected files preview */}
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-3 md:px-4 py-3 border-t border-white/10 bg-[#111] overflow-hidden"
          >
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {selectedFiles.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-white/5"
                >
                  {file.type.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : file.type.startsWith("video/") ? (
                    <div className="w-full h-full relative">
                      {videoThumbnails[index] ? (
                        <img
                          src={videoThumbnails[index]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-black/50" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="w-6 h-6 text-white" fill="white" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xs text-gray-400">File</span>
                    </div>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white"
                  >
                    <X className="w-3 h-3" />
                  </motion.button>
                </motion.div>
              ))}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center text-gray-400 active:text-white active:border-white/40 transition-colors"
              >
                <Plus className="w-6 h-6" />
              </motion.button>
            </div>

            {/* PPV toggle */}
            {isAdmin && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-4 mt-2"
              >
                <label className="flex items-center gap-2 cursor-pointer touch-manipulation">
                  <input
                    type="checkbox"
                    checked={isPPV}
                    onChange={(e) => setIsPPV(e.target.checked)}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-[var(--gold)] focus:ring-[var(--gold)]"
                  />
                  <Lock className="w-4 h-4 text-[var(--gold)]" />
                  <span className="text-sm text-gray-300">Send as PPV</span>
                </label>
                {isPPV && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-sm text-gray-400">$</span>
                    <input
                      type="number"
                      value={ppvPrice}
                      onChange={(e) => setPpvPrice(parseFloat(e.target.value))}
                      min="0.99"
                      step="0.01"
                      className="w-20 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--gold)]"
                    />
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-3 md:p-4 border-t border-white/10 bg-[#0a0a0a] safe-bottom"
      >
        <div className="flex items-end gap-2">
          {/* Attach button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-full bg-white/5 active:bg-white/10 text-[var(--gold)] transition-colors touch-manipulation"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* AI Suggest button (admin only) */}
          {isAdmin && onAISuggest && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleAISuggest}
              disabled={isLoadingAI || !getLastUserMessage()}
              className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 active:from-purple-600 active:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-manipulation"
              title="AI suggestion"
            >
              {isLoadingAI ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 text-white" />
              )}
            </motion.button>
          )}

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
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
              className="w-full px-4 py-3 pr-12 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 resize-none focus:outline-none focus:border-[var(--gold)] transition-colors text-base"
              style={{ maxHeight: "120px" }}
            />

            {/* Emoji button */}
            <div className="absolute right-3 bottom-3">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-gray-400 active:text-[var(--gold)] transition-colors touch-manipulation"
              >
                <Smile className="w-5 h-5" />
              </motion.button>
              <EmojiPicker
                isOpen={showEmojiPicker}
                onClose={() => setShowEmojiPicker(false)}
                onSelect={(emoji) => {
                  setNewMessage((prev) => prev + emoji);
                  textareaRef.current?.focus();
                }}
                align="right"
              />
            </div>
          </div>

          {/* Send button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={isSending || (!newMessage.trim() && selectedFiles.length === 0)}
            className={cn(
              "p-3 rounded-full transition-all touch-manipulation",
              newMessage.trim() || selectedFiles.length > 0
                ? "bg-[var(--gold)] active:bg-[var(--gold-light)] shadow-lg shadow-[var(--gold)]/30"
                : "bg-white/10 cursor-not-allowed"
            )}
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 text-black animate-spin" />
            ) : (
              <Send
                className={cn(
                  "w-5 h-5",
                  newMessage.trim() || selectedFiles.length > 0
                    ? "text-black"
                    : "text-gray-500"
                )}
              />
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Tip Modal */}
      <AnimatePresence>
        {showTipModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowTipModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-sm z-50"
            >
              <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[var(--gold)]/30"
                  >
                    <DollarSign className="w-8 h-8 text-black" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white">Send a Tip</h3>
                  <p className="text-sm text-gray-400">Show your appreciation!</p>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  {tipAmounts.map((amount, i) => (
                    <motion.button
                      key={amount}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleTip(showTipModal, amount)}
                      className="py-3 rounded-xl bg-white/5 active:bg-[var(--gold)]/10 border border-white/10 active:border-[var(--gold)] text-white font-medium transition-all touch-manipulation"
                    >
                      ${amount}
                    </motion.button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      $
                    </span>
                    <input
                      type="number"
                      value={customTip}
                      onChange={(e) => setCustomTip(e.target.value)}
                      placeholder="Custom"
                      min="1"
                      className="w-full pl-7 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[var(--gold)] transition-colors text-base"
                    />
                  </div>
                  <Button
                    variant="premium"
                    disabled={!customTip || parseFloat(customTip) < 1}
                    onClick={() => handleTip(showTipModal, parseFloat(customTip))}
                  >
                    Send
                  </Button>
                </div>

                <button
                  onClick={() => setShowTipModal(null)}
                  className="w-full mt-4 py-3 rounded-xl bg-white/5 active:bg-white/10 text-white font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Media Lightbox */}
      <MediaLightbox
        isOpen={!!lightboxMedia}
        media={lightboxMedia || []}
        initialIndex={lightboxIndex}
        onClose={() => setLightboxMedia(null)}
      />
    </div>
  );
}
