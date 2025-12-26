"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Play, DollarSign, Heart, Image as ImageIcon } from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { formatPrice } from "@/lib/utils";

interface MessageMedia {
  id: string;
  type: "PHOTO" | "VIDEO" | "AUDIO";
  url: string;
  previewUrl?: string;
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
  onUnlock?: (messageId: string) => void;
  onTip?: (messageId: string) => void;
}

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
  onUnlock,
  onTip,
}: MessageBubbleProps) {
  const [isHovered, setIsHovered] = useState(false);
  const showLocked = isPPV && !isUnlocked && !isSent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isSent ? "flex-row-reverse" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      {!isSent && (
        <div className="flex-shrink-0">
          {senderAvatar ? (
            <img
              src={senderAvatar}
              alt={senderName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)]" />
          )}
        </div>
      )}

      <div className={`max-w-[70%] ${isSent ? "text-right" : ""}`}>
        {/* Media */}
        {media && media.length > 0 && (
          <div className="mb-2">
            {media.map((item) => (
              <div
                key={item.id}
                className="relative rounded-xl overflow-hidden"
              >
                {showLocked ? (
                  /* Locked PPV media */
                  <div className="relative aspect-[4/3] bg-[var(--surface)]">
                    {/* Blurred preview */}
                    {item.previewUrl && (
                      <img
                        src={item.previewUrl}
                        alt=""
                        className="w-full h-full object-cover ppv-blur"
                      />
                    )}
                    {/* Lock overlay */}
                    <div className="ppv-lock-overlay">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-[var(--gold)] flex items-center justify-center mx-auto mb-3 animate-gold-pulse">
                          <Lock className="w-6 h-6 text-[var(--background)]" />
                        </div>
                        <p className="text-white font-bold text-xl mb-1">
                          {formatPrice(ppvPrice || 0)}
                        </p>
                        <p className="text-white/70 text-sm mb-4">to unlock</p>
                        <Button
                          variant="premium"
                          size="sm"
                          onClick={() => onUnlock?.(id)}
                        >
                          Unlock Now
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Unlocked media */
                  <div className="relative aspect-[4/3]">
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
                        <div className="absolute inset-0 flex items-center justify-center">
                          <button
                            className="media-play-button"
                            onClick={() => window.open(item.url, '_blank')}
                          >
                            <Play className="w-6 h-6 text-[var(--background)] ml-1" fill="currentColor" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <img
                        src={item.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                    <Badge
                      variant={item.type === "VIDEO" ? "video" : "photo"}
                      className="absolute top-2 left-2"
                    >
                      {item.type === "VIDEO" ? (
                        <Play className="w-3 h-3 mr-1" />
                      ) : (
                        <ImageIcon className="w-3 h-3 mr-1" />
                      )}
                      {item.type}
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Text */}
        {text && (
          <div
            className={`inline-block px-4 py-2 ${
              isSent ? "chat-bubble-sent" : "chat-bubble-received"
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">{text}</p>
          </div>
        )}

        {/* Timestamp and actions */}
        <div
          className={`flex items-center gap-2 mt-1 ${
            isSent ? "justify-end" : "justify-start"
          }`}
        >
          <span className="text-xs text-[var(--muted)]">
            {new Date(timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          {/* Tip button (only show on hover for received messages) */}
          {!isSent && isHovered && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => onTip?.(id)}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--gold)]/10 text-[var(--gold)] text-xs hover:bg-[var(--gold)]/20 transition-colors"
            >
              <DollarSign className="w-3 h-3" />
              Tip
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
