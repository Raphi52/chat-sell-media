"use client";

import { motion } from "framer-motion";
import { X, CornerUpLeft, Image, Video, Music } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuotedMessageProps {
  message: {
    id: string;
    text?: string;
    senderName: string;
    hasMedia?: boolean;
    mediaType?: "PHOTO" | "VIDEO" | "AUDIO";
  };
  onClear?: () => void;
  isPreview?: boolean; // Used in input area
}

export function QuotedMessage({ message, onClear, isPreview }: QuotedMessageProps) {
  const MediaIcon = message.mediaType === "VIDEO" ? Video :
    message.mediaType === "AUDIO" ? Music : Image;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: 10, height: 0 }}
      className={cn(
        "flex items-center gap-3 p-3 border-l-2 border-[var(--gold)]",
        isPreview
          ? "bg-[var(--surface)] rounded-lg"
          : "bg-white/5 rounded-t-lg"
      )}
    >
      <CornerUpLeft className="w-4 h-4 text-[var(--gold)] flex-shrink-0" />

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[var(--gold)] truncate">
          Replying to {message.senderName}
        </p>
        <div className="flex items-center gap-2">
          {message.hasMedia && (
            <MediaIcon className="w-3 h-3 text-gray-400" />
          )}
          <p className="text-sm text-gray-400 truncate">
            {message.text || (message.hasMedia ? `${message.mediaType?.toLowerCase()}` : "message")}
          </p>
        </div>
      </div>

      {onClear && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClear}
          className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </motion.button>
      )}
    </motion.div>
  );
}
