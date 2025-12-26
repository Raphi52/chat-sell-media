"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  Lock, Play, DollarSign, Check, CheckCheck,
  CornerUpLeft, Heart, ThumbsUp, ThumbsDown, Laugh, Frown, Zap,
  MoreHorizontal, X
} from "lucide-react";
import { Button } from "@/components/ui";
import { formatPrice, cn } from "@/lib/utils";

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

interface QuotedMessage {
  id: string;
  text?: string;
  senderName: string;
}

interface MessageBubbleProps {
  id: string;
  text?: string;
  media?: MessageMedia[];
  isPPV?: boolean;
  ppvPrice?: number;
  isUnlocked?: boolean;
  isSent?: boolean;
  timestamp: Date;
  senderName?: string;
  senderAvatar?: string;
  isRead?: boolean;
  isDelivered?: boolean;
  reactions?: Reaction[];
  replyTo?: QuotedMessage;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  onUnlock?: (messageId: string) => void;
  onTip?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onReply?: (messageId: string) => void;
  onMediaClick?: (media: MessageMedia) => void;
  onQuoteClick?: (messageId: string) => void;
  searchHighlight?: string;
}

const QUICK_REACTIONS = [
  { emoji: "❤️", icon: Heart },
  { emoji: "😂", icon: Laugh },
  { emoji: "👍", icon: ThumbsUp },
  { emoji: "👎", icon: ThumbsDown },
  { emoji: "😢", icon: Frown },
  { emoji: "⚡", icon: Zap },
];

export function MessageBubble({
  id,
  text,
  media,
  isPPV,
  ppvPrice,
  isUnlocked,
  isSent,
  timestamp,
  senderName,
  senderAvatar,
  isRead,
  isDelivered,
  reactions,
  replyTo,
  isFirstInGroup = true,
  isLastInGroup = true,
  onUnlock,
  onTip,
  onReact,
  onReply,
  onMediaClick,
  onQuoteClick,
  searchHighlight,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const showLocked = isPPV && !isUnlocked && !isSent;

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  // Handle touch start - long press detection
  const handleTouchStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      setShowActions(true);
      // Haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
  }, []);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // Handle swipe
  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    setSwipeOffset(0);
    // Swipe right to reply (threshold 80px)
    if (info.offset.x > 80 && !isSent) {
      onReply?.(id);
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
    }
  }, [id, isSent, onReply]);

  // Close actions when clicking outside
  useEffect(() => {
    if (!showActions) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (bubbleRef.current && !bubbleRef.current.contains(e.target as Node)) {
        setShowActions(false);
        setShowReactions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showActions]);

  // Highlight search text
  const highlightText = (content: string) => {
    if (!searchHighlight || !content) return content;
    const regex = new RegExp(`(${searchHighlight})`, 'gi');
    const parts = content.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-[var(--gold)]/30 text-[var(--gold)] rounded px-0.5">
          {part}
        </mark>
      ) : part
    );
  };

  // Bubble style based on position
  const getBubbleStyle = () => {
    const base = isSent
      ? "bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] text-black"
      : "bg-[#1a1a1a] text-white border border-white/10";

    let rounded = "rounded-2xl";
    if (isSent) {
      if (isFirstInGroup && isLastInGroup) rounded = "rounded-2xl rounded-br-md";
      else if (isFirstInGroup) rounded = "rounded-2xl rounded-br-md";
      else if (isLastInGroup) rounded = "rounded-2xl rounded-tr-md rounded-br-md";
      else rounded = "rounded-2xl rounded-tr-md rounded-br-md";
    } else {
      if (isFirstInGroup && isLastInGroup) rounded = "rounded-2xl rounded-bl-md";
      else if (isFirstInGroup) rounded = "rounded-2xl rounded-bl-md";
      else if (isLastInGroup) rounded = "rounded-2xl rounded-tl-md rounded-bl-md";
      else rounded = "rounded-2xl rounded-tl-md rounded-bl-md";
    }

    return cn(base, rounded);
  };

  return (
    <motion.div
      ref={bubbleRef}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 0.8
      }}
      className={cn(
        "flex gap-2 group relative",
        isSent ? "flex-row-reverse" : "",
        !isLastInGroup && "mb-0.5",
        isLastInGroup && "mb-2"
      )}
    >
      {/* Avatar - only show on last message of group */}
      {!isSent && (
        <div className="flex-shrink-0 w-9 md:w-8">
          {isLastInGroup ? (
            senderAvatar ? (
              <motion.img
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                src={senderAvatar}
                alt={senderName}
                className="w-9 h-9 md:w-8 md:h-8 rounded-full object-cover ring-2 ring-[var(--gold)]/20"
              />
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-9 h-9 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex items-center justify-center text-black font-bold text-sm"
              >
                {senderName?.charAt(0) || "?"}
              </motion.div>
            )
          ) : (
            <div className="w-9 md:w-8" />
          )}
        </div>
      )}

      {/* Message container with swipe support */}
      <motion.div
        drag={!isSent ? "x" : false}
        dragConstraints={{ left: 0, right: 100 }}
        dragElastic={0.2}
        onDrag={(_, info) => setSwipeOffset(info.offset.x)}
        onDragEnd={handleDragEnd}
        className={cn(
          "max-w-[80%] md:max-w-[75%] relative touch-pan-y",
          isSent ? "text-right" : ""
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {/* Swipe reply indicator */}
        {swipeOffset > 20 && !isSent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: Math.min(swipeOffset / 80, 1),
              scale: swipeOffset > 60 ? 1 : 0.8
            }}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-2"
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
              swipeOffset > 80 ? "bg-[var(--gold)]" : "bg-white/10"
            )}>
              <CornerUpLeft className={cn(
                "w-5 h-5",
                swipeOffset > 80 ? "text-black" : "text-white"
              )} />
            </div>
          </motion.div>
        )}

        {/* Quoted message */}
        {replyTo && (
          <motion.button
            initial={{ opacity: 0, x: isSent ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => onQuoteClick?.(replyTo.id)}
            className={cn(
              "mb-1 px-3 py-2 rounded-lg text-left w-full max-w-full",
              "bg-white/5 border-l-2 border-[var(--gold)] active:bg-white/10 transition-colors",
              "flex items-center gap-2 cursor-pointer"
            )}
          >
            <CornerUpLeft className="w-3 h-3 text-[var(--gold)] flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-[var(--gold)] font-medium truncate">
                {replyTo.senderName}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {replyTo.text || "Media"}
              </p>
            </div>
          </motion.button>
        )}

        {/* Media */}
        {media && media.length > 0 && (
          <div className={cn(
            "mb-1 overflow-hidden",
            media.length === 1 ? "" : "grid gap-1",
            media.length === 2 && "grid-cols-2",
            media.length >= 3 && "grid-cols-2",
            getBubbleStyle()
          )}>
            {media.slice(0, 4).map((item, index) => (
              <motion.div
                key={item.id}
                className={cn(
                  "relative cursor-pointer overflow-hidden",
                  media.length === 1 ? "aspect-[4/3]" : "aspect-square",
                  index === 0 && media.length === 3 && "row-span-2"
                )}
                whileTap={{ scale: 0.98 }}
                onClick={() => !showLocked && onMediaClick?.(item)}
              >
                {showLocked ? (
                  /* Locked PPV media */
                  <div className="relative w-full h-full bg-black/50">
                    {item.previewUrl && (
                      <img
                        src={item.previewUrl}
                        alt=""
                        className="w-full h-full object-cover blur-xl scale-110"
                      />
                    )}
                    {/* Lock overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                      <div className="text-center p-4">
                        <motion.div
                          className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[var(--gold)]/30"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          <Lock className="w-6 h-6 text-black" />
                        </motion.div>
                        <p className="text-white font-bold text-lg">
                          {formatPrice(ppvPrice || 0)}
                        </p>
                        <p className="text-white/60 text-xs mb-3">to unlock</p>
                        <Button
                          variant="premium"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUnlock?.(id);
                          }}
                          className="shadow-lg"
                        >
                          Unlock Now
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Unlocked media */
                  <>
                    {item.type === "VIDEO" ? (
                      <>
                        {item.previewUrl ? (
                          <img
                            src={item.previewUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={item.url}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                            preload="metadata"
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <motion.div
                            className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center"
                            whileHover={{ scale: 1.1 }}
                          >
                            <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
                          </motion.div>
                        </div>
                      </>
                    ) : (
                      <img
                        src={item.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                    {/* More indicator */}
                    {index === 3 && media.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">
                          +{media.length - 4}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Text bubble */}
        {text && (
          <motion.div
            className={cn(
              "inline-block px-4 py-2.5 shadow-sm select-none",
              getBubbleStyle()
            )}
            whileTap={{ scale: 0.98 }}
          >
            <p className={cn(
              "text-[15px] leading-relaxed whitespace-pre-wrap break-words",
              isSent ? "text-black" : "text-white"
            )}>
              {highlightText(text)}
            </p>
          </motion.div>
        )}

        {/* Reactions display */}
        {reactions && reactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "flex flex-wrap gap-1 mt-1",
              isSent ? "justify-end" : "justify-start"
            )}
          >
            {reactions.map((reaction) => (
              <motion.button
                key={reaction.emoji}
                whileTap={{ scale: 0.9 }}
                onClick={() => onReact?.(id, reaction.emoji)}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs",
                  "min-h-[28px] min-w-[28px] touch-manipulation",
                  reaction.hasReacted
                    ? "bg-[var(--gold)]/20 border border-[var(--gold)]/50"
                    : "bg-white/10 border border-white/10 active:bg-white/20"
                )}
              >
                <span>{reaction.emoji}</span>
                {reaction.count > 1 && (
                  <span className="text-gray-400">{reaction.count}</span>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Timestamp and status */}
        <div
          className={cn(
            "flex items-center gap-1.5 mt-1 text-xs text-gray-500",
            isSent ? "justify-end" : "justify-start"
          )}
        >
          <AnimatePresence mode="wait">
            {isLastInGroup && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {new Date(timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Read/Delivered indicator */}
          {isSent && isLastInGroup && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {isRead ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <CheckCheck className="w-4 h-4 text-[var(--gold)]" />
                </motion.div>
              ) : isDelivered ? (
                <CheckCheck className="w-4 h-4 text-gray-400" />
              ) : (
                <Check className="w-4 h-4 text-gray-400" />
              )}
            </motion.div>
          )}
        </div>

        {/* Mobile action button (always visible) */}
        <button
          onClick={() => setShowActions(!showActions)}
          className={cn(
            "absolute top-0 p-2 rounded-full opacity-0 group-hover:opacity-100",
            "md:hidden active:opacity-100 transition-opacity",
            "bg-black/50 backdrop-blur-sm",
            isSent ? "left-0 -translate-x-full ml-[-8px]" : "right-0 translate-x-full mr-[-8px]"
          )}
        >
          <MoreHorizontal className="w-4 h-4 text-white" />
        </button>

        {/* Desktop hover actions */}
        <div
          className={cn(
            "absolute top-0 hidden md:flex items-center gap-1 z-10",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            isSent ? "left-0 -translate-x-full pr-2" : "right-0 translate-x-full pl-2"
          )}
        >
          {/* React button */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowReactions(!showReactions)}
              className="p-2 rounded-full bg-[#222] hover:bg-[#333] text-gray-400 hover:text-white transition-colors"
            >
              <Heart className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Reply button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onReply?.(id)}
            className="p-2 rounded-full bg-[#222] hover:bg-[#333] text-gray-400 hover:text-white transition-colors"
          >
            <CornerUpLeft className="w-4 h-4" />
          </motion.button>

          {/* Tip button (only for received messages) */}
          {!isSent && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onTip?.(id)}
              className="p-2 rounded-full bg-[var(--gold)]/20 hover:bg-[var(--gold)]/30 text-[var(--gold)] transition-colors"
            >
              <DollarSign className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {/* Reactions picker (desktop hover) */}
        <AnimatePresence>
          {showReactions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className={cn(
                "absolute bottom-full mb-2 hidden md:flex items-center gap-1 p-2",
                "rounded-full bg-[#222] border border-white/10 shadow-xl z-20",
                isSent ? "right-0" : "left-0"
              )}
            >
              {QUICK_REACTIONS.map((reaction, i) => (
                <motion.button
                  key={reaction.emoji}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => {
                    onReact?.(id, reaction.emoji);
                    setShowReactions(false);
                  }}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-white/10 rounded-full transition-colors"
                >
                  {reaction.emoji}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Mobile action sheet */}
      <AnimatePresence>
        {showActions && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
              onClick={() => setShowActions(false)}
            />

            {/* Action sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] rounded-t-3xl z-50 md:hidden pb-safe"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              {/* Quick reactions */}
              <div className="flex items-center justify-center gap-4 py-4 border-b border-white/10">
                {QUICK_REACTIONS.map((reaction) => (
                  <motion.button
                    key={reaction.emoji}
                    whileTap={{ scale: 0.8 }}
                    onClick={() => {
                      onReact?.(id, reaction.emoji);
                      setShowActions(false);
                    }}
                    className="w-12 h-12 flex items-center justify-center text-2xl bg-white/5 rounded-full active:bg-white/10 transition-colors"
                  >
                    {reaction.emoji}
                  </motion.button>
                ))}
              </div>

              {/* Actions */}
              <div className="p-2">
                <button
                  onClick={() => {
                    onReply?.(id);
                    setShowActions(false);
                  }}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-xl active:bg-white/5 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <CornerUpLeft className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white font-medium">Reply</span>
                </button>

                {!isSent && (
                  <button
                    onClick={() => {
                      onTip?.(id);
                      setShowActions(false);
                    }}
                    className="w-full flex items-center gap-4 px-4 py-4 rounded-xl active:bg-white/5 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-[var(--gold)]/20 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-[var(--gold)]" />
                    </div>
                    <span className="text-white font-medium">Send Tip</span>
                  </button>
                )}
              </div>

              {/* Cancel button */}
              <div className="p-2 pt-0">
                <button
                  onClick={() => setShowActions(false)}
                  className="w-full py-4 rounded-xl bg-white/5 active:bg-white/10 text-white font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
